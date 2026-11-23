/* =========================================================
   PAGE JOUEUR — ouverte sur les téléphones via le QR code
   ========================================================= */
import { SCENES, LETTRES, estDouble } from "./scenarios.js?v=11";
import { connecter, configPrete } from "./reseau.js?v=11";

const $ = (s) => document.querySelector(s);
const ecran = $("#ecran");
const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

let net, code, pid, moi = null, etat = null;
let rendu = ""; // clé du dernier écran affiché
let mesVotes = {};
let minuterie = null;
let suspenseJusqua = 0; // pendant le suspense, on ne révèle pas les points
let suspenseCle = "";

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
    if (/^\d{4}$/.test(c)) location.search = "?salle=" + c + "&v=11";
  };
  $("#ok").onclick = go;
  $("#code").onkeydown = (e) => { if (e.key === "Enter") go(); };
  $("#code").focus();
}

/* ---------- Saisie du prénom ---------- */
function ecranNom(erreur = "") {
  rendre(`<div class="j-grand-emoji">👋</div>
    <div class="j-titre j-centre">Salle ${code}</div>
    <input class="champ" id="nom" type="text" maxlength="20" autocapitalize="words" autocorrect="off" spellcheck="false" enterkeyhint="go" placeholder="Ton prénom" autocomplete="given-name" />
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
    // Pendant le vote et le suspense, le score reste caché (il trahirait la bonne réponse)
    if (Date.now() >= suspenseJusqua && !(etat && etat.phase === "vote")) majEntete();
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

function majEntete() {
  if (!moi) return;
  $("#info-joueur").innerHTML = `${(moi.serie || 0) >= 2 ? `<span class="j-feu">🔥 ${moi.serie}</span> ` : ""}${esc(moi.nom)} · <b>${moi.score || 0}</b> pts`;
}

function afficher(majScore) {
  if (!etat || !moi) return;
  const cle = `${etat.phase}-${etat.scene}`;
  if (cle === rendu && (!majScore || etat.phase === "vote" || etat.phase === "fin")) return;
  if (cle === suspenseCle && Date.now() < suspenseJusqua) return;
  clearInterval(minuterie);
  const p = etat.phase;
  if (p !== "resultat" && p !== "decryptage" && p !== "vote") majEntete();
  if (p === "accueil" || p === "intro") return attente();
  if (p === "vote") return vote(etat.scene);
  if (p === "resultat" || p === "decryptage") return resultat(etat.scene, etat.choix);
  if (p === "classement") return classement();
  if (p === "fin") return fin();
}

function attente() {
  rendre(`<svg class="j-check" viewBox="0 0 52 52"><circle cx="26" cy="26" r="24"/><path d="M15 27l7 7 15-16"/></svg>
    <div class="j-titre j-centre">C'est parti, ${esc(moi.nom)} !</div>
    <p class="j-texte j-centre">Tu es dans la partie. Regarde l'écran : le vote commence bientôt.</p>`, `${etat.phase}-${etat.scene}`);
}

function vote(idx) {
  const sc = SCENES[idx];
  const deja = mesVotes[idx];
  const double = estDouble(idx, SCENES.length);
  rendre(`<div class="j-scene-info">Question ${idx + 1} / ${SCENES.length} · ${sc.titre}</div>
    ${double ? `<div class="j-double">×2 · Points doublés !</div>` : ""}
    <div class="j-question">${sc.situation}</div>
    <div class="j-barre-temps"><div id="temps" style="width:100%"></div></div>
    <div class="j-choix ${deja !== undefined ? "a-vote" : ""}" id="choix">
      ${sc.choix.map((c, i) => `<button class="j-btn ${deja === i ? "choisi" : ""}" data-i="${i}"><span class="lettre">${LETTRES[i]}</span><span>${c.texte}</span></button>`).join("")}
    </div>
    <p class="j-note" id="note">${deja !== undefined ? "Vote enregistré ✓ Tu peux encore changer d'avis." : "Vite ! Plus tu réponds tôt, plus tu gagnes de points ⚡"}</p>`, `vote-${idx}`);
  document.querySelectorAll(".j-btn").forEach((b) => {
    b.onclick = () => {
      if (net.maintenant() > etat.fin) return;
      const i = +b.dataset.i;
      mesVotes[idx] = i;
      net.set(net.r(`salles/${code}/votes/s${idx}/${pid}`), i);
      document.querySelectorAll(".j-btn").forEach((x) => x.classList.toggle("choisi", +x.dataset.i === i));
      $("#choix").classList.add("a-vote");
      $("#note").textContent = "Vote enregistré ✓ (changer d'avis remet ton chrono à zéro)";
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
  const cle = `${etat.phase}-${idx}`;
  // Premier affichage : suspense le temps que les barres montent à l'écran
  if (rendu !== cle && suspenseCle !== cle) {
    suspenseCle = cle;
    suspenseJusqua = Date.now() + 3600;
    rendre(`<div class="j-grand-emoji j-tambour">🥁</div>
      <div class="j-titre j-centre">Suspense…</div>
      <p class="j-texte j-centre">Regarde l'écran : les votes s'affichent !</p>`, "suspense-" + idx);
    setTimeout(() => { if (etat && etat.phase === "resultat" && etat.scene === idx) resultat(idx, etat.choix); }, 3650);
    return;
  }
  majEntete();
  const sc = SCENES[idx];
  const d = moi.dernier && moi.dernier.scene === idx ? moi.dernier : null;
  const monChoix = d ? d.choix : mesVotes[idx] ?? -1;
  const q = monChoix >= 0 ? sc.choix[monChoix].qualite : "mauvais";
  const bonne = sc.choix.findIndex((c) => c.qualite === "top");
  const message = monChoix < 0 ? "Tu n'as pas voté cette fois-ci."
    : q === "top" ? "Bonne réponse ! C'était la stratégie du texte."
    : q === "moyen" ? "Pas mal… mais il y avait mieux."
    : "Aïe, le texte n'est pas d'accord !";
  const details = d && d.pts > 0 ? [
    `<span>✔️ Réponse : ${d.base} pts${d.base < (q === "top" ? 1000 : 500) ? " ⚡" : ""}</span>`,
    d.bonus ? `<span>🔥 Série de ${d.serie} : +${d.bonus}</span>` : "",
    d.double ? `<span>×2 Question finale</span>` : "",
  ].join("") : "";
  rendre(`<div class="j-scene-info">Question ${idx + 1} / ${SCENES.length}</div>
    ${d ? `<div class="j-points ${q}">+${d.pts}</div>` : `<div class="j-points mauvais">…</div>`}
    <p class="j-texte j-centre">${message}</p>
    ${details ? `<div class="j-details">${details}</div>` : ""}
    ${d && d.serie >= 2 ? `<div class="j-serie">🔥 ${d.serie} bonnes réponses d'affilée !</div>` : ""}
    <div class="j-carte">Bonne réponse : <b>${LETTRES[bonne]} · ${sc.choix[bonne].court}</b><br>
    Ton choix : <b>${monChoix >= 0 ? `${LETTRES[monChoix]} · ${sc.choix[monChoix].court}` : "aucun"}</b></div>
    <div class="j-score"><span>Ton score</span><b>${moi.score || 0} pts</b></div>
    <p class="j-note">Regarde l'écran pour la suite 👀</p>`, cle);
  const pe = document.querySelector(".j-points");
  if (pe && d) {
    const cible = d.pts;
    const t0 = performance.now();
    const pas = (t) => { const k = Math.min(1, (t - t0) / 900); pe.textContent = "+" + Math.round(cible * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(pas); };
    requestAnimationFrame(pas);
  }
}

async function classement() {
  const cle = `${etat.phase}-${etat.scene}`;
  const snap = await net.get(net.r(`salles/${code}/joueurs`));
  const tous = Object.entries(snap.val() || {}).sort((a, b) => (b[1].score || 0) - (a[1].score || 0));
  const rang = tous.findIndex(([k]) => k === pid) + 1;
  const devant = rang > 1 ? (tous[rang - 2][1].score || 0) - (moi.score || 0) : 0;
  rendre(`<div class="j-scene-info">Classement à mi-parcours</div>
    <div class="j-grand-emoji">${rang === 1 ? "👑" : rang <= 5 ? "🚀" : "💪"}</div>
    <div class="j-titre j-centre">${rang}<sup>${rang === 1 ? "er" : "e"}</sup> sur ${tous.length}</div>
    <p class="j-texte j-centre">${rang === 1 ? "Tu es en tête ! Ne lâche rien." : `Plus que <b>${devant} pts</b> pour dépasser la personne devant toi.`}</p>
    <div class="j-score"><span>Ton score</span><b>${moi.score || 0} pts</b></div>
    <p class="j-note">La dernière question vaut double : tout peut encore changer !</p>`, cle);
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
