/* =========================================================
   PAGE JOUEUR — ouverte sur les téléphones via le QR code
   ========================================================= */
import { SCENES, LETTRES, POINTS } from "./scenarios.js";
import { connecter, configPrete } from "./reseau.js";

const $ = (s) => document.querySelector(s);
const ecran = $("#ecran");
const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

let net, code, pid, moi = null, etat = null;
let rendu = ""; // clé du dernier écran affiché
let mesVotes = {};
let minuterie = null;

function rendre(html, cle) {
  rendu = cle;
  ecran.innerHTML = html;
  ecran.style.animation = "none";
  void ecran.offsetWidth;
  ecran.style.animation = "";
}
function stocker(k, v) { try { localStorage.setItem(k, v); } catch {} }
function lire(k) { try { return localStorage.getItem(k); } catch { return null; } }

/* ---------- Saisie du code de salle ---------- */
function ecranCode(erreur = "") {
  rendre(`<div class="j-titre">Rejoindre la partie</div>
    <p class="j-texte">Entre le code affiché à l'écran.</p>
    <input class="champ" id="code" inputmode="numeric" maxlength="4" placeholder="Code à 4 chiffres" autocomplete="off" />
    ${erreur ? `<p class="erreur">${erreur}</p>` : ""}
    <button class="btn" id="ok">Continuer</button>`, "code");
  const go = () => {
    const c = $("#code").value.trim();
    if (/^\d{4}$/.test(c)) location.search = "?salle=" + c;
  };
  $("#ok").onclick = go;
  $("#code").onkeydown = (e) => { if (e.key === "Enter") go(); };
  $("#code").focus();
}

/* ---------- Saisie du prénom ---------- */
function ecranNom(erreur = "") {
  rendre(`<div class="j-grand-emoji">👋</div>
    <div class="j-titre j-centre">Salle ${code}</div>
    <input class="champ" id="nom" maxlength="20" placeholder="Ton prénom" autocomplete="given-name" />
    ${erreur ? `<p class="erreur">${erreur}</p>` : ""}
    <button class="btn" id="ok">Entrer dans la partie</button>`, "nom");
  const go = async () => {
    let nom = $("#nom").value.trim().replace(/\s+/g, " ").slice(0, 20);
    if (!nom) return;
    $("#ok").disabled = true;
    try {
      const snap = await net.get(net.r(`salles/${code}/joueurs`));
      const pris = new Set(Object.values(snap.val() || {}).map((j) => j.nom.toLowerCase()));
      let final = nom, n = 2;
      while (pris.has(final.toLowerCase())) final = `${nom.slice(0, 16)} (${n++})`;
      pid = "p" + Math.random().toString(36).slice(2, 10);
      await net.set(net.r(`salles/${code}/joueurs/${pid}`), { nom: final, score: 0 });
      stocker(`gin761-${code}`, pid);
      ecouter();
    } catch (e) {
      console.error(e);
      ecranNom("Connexion impossible, réessaie.");
    }
  };
  $("#ok").onclick = go;
  $("#nom").onkeydown = (e) => { if (e.key === "Enter") go(); };
  $("#nom").focus();
}

/* ---------- Écoute de la partie ---------- */
function ecouter() {
  net.onValue(net.r(`salles/${code}/joueurs/${pid}`), (s) => {
    moi = s.val();
    if (!moi) return;
    $("#info-joueur").innerHTML = `${esc(moi.nom)} · <b>${moi.score || 0}</b> pts`;
    afficher(true);
  });
  net.onValue(net.r(`salles/${code}/etat`), (s) => {
    etat = s.val();
    afficher(false);
  });
  for (let i = 0; i < SCENES.length; i++) {
    net.onValue(net.r(`salles/${code}/votes/s${i}/${pid}`), (s) => {
      if (s.exists()) mesVotes[i] = s.val();
    });
  }
}

function afficher(majScore) {
  if (!etat || !moi) return;
  const cle = `${etat.phase}-${etat.scene}`;
  if (cle === rendu && (!majScore || etat.phase === "vote" || etat.phase === "fin")) return;
  clearInterval(minuterie);
  const p = etat.phase;
  if (p === "accueil" || p === "intro") return attente();
  if (p === "vote") return vote(etat.scene);
  if (p === "resultat" || p === "decryptage") return resultat(etat.scene, etat.choix);
  if (p === "fin") return fin();
}

function attente() {
  rendre(`<div class="j-grand-emoji">✅</div>
    <div class="j-titre j-centre">C'est parti, ${esc(moi.nom)} !</div>
    <p class="j-texte j-centre">Tu es dans la partie. Regarde l'écran : le vote commence bientôt.</p>`, `${etat.phase}-${etat.scene}`);
}

function vote(idx) {
  const sc = SCENES[idx];
  const deja = mesVotes[idx];
  rendre(`<div class="j-scene-info">Étape ${idx + 1} / ${SCENES.length} · ${sc.titre}</div>
    <div class="j-question">${sc.situation}</div>
    <div class="j-barre-temps"><div id="temps" style="width:100%"></div></div>
    <div class="j-choix ${deja !== undefined ? "a-vote" : ""}" id="choix">
      ${sc.choix.map((c, i) => `<button class="j-btn ${deja === i ? "choisi" : ""}" data-i="${i}"><span class="lettre">${LETTRES[i]}</span><span>${c.texte}</span></button>`).join("")}
    </div>
    <p class="j-note" id="note">${deja !== undefined ? "Vote enregistré ✓ Tu peux encore changer d'avis." : "Choisis une option !"}</p>`, `vote-${idx}`);
  document.querySelectorAll(".j-btn").forEach((b) => {
    b.onclick = () => {
      if (net.maintenant() > etat.fin) return;
      const i = +b.dataset.i;
      mesVotes[idx] = i;
      net.set(net.r(`salles/${code}/votes/s${idx}/${pid}`), i);
      document.querySelectorAll(".j-btn").forEach((x) => x.classList.toggle("choisi", +x.dataset.i === i));
      $("#choix").classList.add("a-vote");
      $("#note").textContent = "Vote enregistré ✓ Tu peux encore changer d'avis.";
      navigator.vibrate?.(30);
    };
  });
  const duree = Math.max(1, etat.fin - net.maintenant());
  minuterie = setInterval(() => {
    const reste = etat.fin - net.maintenant();
    const t = $("#temps");
    if (!t) return clearInterval(minuterie);
    t.style.width = Math.max(0, (100 * reste) / duree) + "%";
    if (reste <= 0) {
      clearInterval(minuterie);
      $("#note").textContent = "⏱️ Temps écoulé ! Regarde l'écran.";
      document.querySelectorAll(".j-btn").forEach((x) => (x.disabled = true));
    }
  }, 200);
}

function resultat(idx, choixClasse) {
  const sc = SCENES[idx];
  const d = moi.dernier && moi.dernier.scene === idx ? moi.dernier : null;
  const monChoix = d ? d.choix : mesVotes[idx] ?? -1;
  const pts = d ? d.pts : null;
  const q = monChoix >= 0 ? sc.choix[monChoix].qualite : "mauvais";
  const message = monChoix < 0 ? "Tu n'as pas voté cette fois-ci."
    : q === "top" ? "C'était la stratégie de survie du texte !"
    : q === "moyen" ? "Pas mal… mais il y avait mieux."
    : "Aïe, le texte n'est pas d'accord !";
  const montrer = etat.phase === "decryptage" || pts !== null;
  rendre(`<div class="j-scene-info">Étape ${idx + 1} / ${SCENES.length}</div>
    <div class="j-carte">La classe a choisi <b>${LETTRES[choixClasse]} · ${sc.choix[choixClasse].court}</b><br>
    Ton choix : <b>${monChoix >= 0 ? `${LETTRES[monChoix]} · ${sc.choix[monChoix].court}` : "aucun"}</b></div>
    ${montrer ? `<div class="j-points ${q}">+${pts ?? POINTS[q]}</div><p class="j-texte j-centre">${message}</p>` : ""}
    <div class="j-score"><span>Ton score</span><b>${moi.score || 0} pts</b></div>
    <p class="j-note">Regarde l'écran pour la suite 👀</p>`, `${etat.phase}-${idx}`);
}

async function fin() {
  const snap = await net.get(net.r(`salles/${code}/joueurs`));
  const tous = Object.entries(snap.val() || {}).sort((a, b) => (b[1].score || 0) - (a[1].score || 0));
  const rang = tous.findIndex(([k]) => k === pid) + 1;
  const med = rang === 1 ? "🥇" : rang === 2 ? "🥈" : rang === 3 ? "🥉" : "🎉";
  rendre(`<div class="j-grand-emoji">${med}</div>
    <div class="j-titre j-centre">${rang}<sup>${rang === 1 ? "er" : "e"}</sup> sur ${tous.length}</div>
    <div class="j-score"><span>Score final</span><b>${moi.score || 0} pts</b></div>
    <p class="j-texte j-centre">Merci d'avoir joué ! Retiens bien : les paradoxes de l'équipe virtuelle ne se résolvent pas, ils se gèrent.</p>`, "fin-" + etat.scene);
}

/* ---------- Démarrage ---------- */
(async function () {
  code = new URLSearchParams(location.search).get("salle");
  if (!configPrete()) {
    rendre(`<p class="erreur">Le jeu n'est pas encore configuré (Firebase).</p>`, "x");
    return;
  }
  if (!code || !/^\d{4}$/.test(code)) return ecranCode();
  try {
    net = await connecter();
    const s = await net.get(net.r(`salles/${code}/etat`));
    if (!s.exists()) return ecranCode(`La salle ${code} n'existe pas. Vérifie le code.`);
    const ancien = lire(`gin761-${code}`);
    if (ancien) {
      const j = await net.get(net.r(`salles/${code}/joueurs/${ancien}`));
      if (j.exists()) { pid = ancien; return ecouter(); }
    }
    ecranNom();
  } catch (e) {
    console.error(e);
    rendre(`<p class="erreur">Connexion impossible. Vérifie ta connexion internet et recharge la page.</p>`, "x");
  }
})();
