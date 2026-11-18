/* =========================================================
   ÉCRAN HÔTE — à projeter devant la classe
   ========================================================= */
import { JAUGES, DEPART, POINTS, LETTRES, INTRO, SCENES, RECAP, verdict } from "./scenarios.js?v=6";
import { connecter, configPrete } from "./reseau.js?v=6";
import { DUREE_VOTE } from "./config.js?v=6";

const params = new URLSearchParams(location.search);
const DUREE = Number(params.get("duree")) || DUREE_VOTE;
const CLE_SAUVEGARDE = "gin761-partie";

const $ = (s) => document.querySelector(s);
const scene = $("#scene");
const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

let net = null;
let S = nouvellePartie();
let joueurs = {};
let votes = {};
let arretVotes = null;
let arretJoueurs = null;
let minuterie = null;
let finVote = 0;
let enRevelation = false;
let attenteMain = false; // aucun vote reçu : l'hôte choisit à main levée

function nouvellePartie(enLigne = false) {
  return { code: null, enLigne, phase: "accueil", idx: -1, jauges: { ...DEPART }, historique: [], dernier: null };
}

/* ---------- Sauvegarde locale (reprise si la page est rechargée) ---------- */
function sauver() {
  try { localStorage.setItem(CLE_SAUVEGARDE, JSON.stringify({ S, t: Date.now() })); } catch {}
}
function lireSauvegarde() {
  try {
    const d = JSON.parse(localStorage.getItem(CLE_SAUVEGARDE));
    if (d && Date.now() - d.t < 4 * 3600e3 && d.S.phase !== "accueil" && d.S.phase !== "fin") return d.S;
  } catch {}
  return null;
}
function effacerSauvegarde() {
  try { localStorage.removeItem(CLE_SAUVEGARDE); } catch {}
}

/* ---------- Jauges ---------- */
function construireJauges() {
  $("#jauges").innerHTML = JAUGES.map(
    (j) => `<div class="jauge" id="j-${j.id}">
      <span class="ico">${j.icone}</span><span class="nom">${j.nom}</span><span class="val">0</span>
      <div class="piste"><div class="rempli"></div></div></div>`
  ).join("");
  majJauges();
}
function couleur(v) { return v >= 60 ? "var(--bon)" : v >= 30 ? "var(--moyen)" : "var(--mal)"; }
function majJauges(avant = null) {
  JAUGES.forEach((j) => {
    const el = $(`#j-${j.id}`);
    const v = S.jauges[j.id];
    el.querySelector(".val").textContent = v;
    const r = el.querySelector(".rempli");
    r.style.width = v + "%";
    r.style.background = couleur(v);
    el.classList.toggle("alerte", v <= 15);
    if (avant && avant[j.id] !== v) {
      const d = v - avant[j.id];
      const b = document.createElement("span");
      b.className = "delta " + (d > 0 ? "plus" : "moins");
      b.textContent = (d > 0 ? "+" : "") + d;
      el.appendChild(b);
      setTimeout(() => b.remove(), 2700);
    }
  });
}

/* ---------- Réseau ---------- */
async function creerSalle() {
  let code;
  for (let essai = 0; essai < 10; essai++) {
    code = String(Math.floor(1000 + Math.random() * 9000));
    const s = await net.get(net.r(`salles/${code}/etat`));
    if (!s.exists()) break;
  }
  // Écriture multi-chemins : les règles n'autorisent que les sous-nœuds (creee, etat…)
  await net.update(net.r(`salles/${code}`), {
    creee: net.serverTimestamp(),
    etat: { phase: "accueil", scene: -1, fin: 0 },
  });
  return code;
}
function ecouterJoueurs() {
  if (arretJoueurs) arretJoueurs();
  arretJoueurs = net.onValue(net.r(`salles/${S.code}/joueurs`), (s) => {
    joueurs = s.val() || {};
    const n = Object.keys(joueurs).length;
    $("#nb-joueurs").textContent = n;
    if (S.phase === "accueil") majListeJoueurs();
    if (S.phase === "vote") majStatutVote();
  });
}
function publier(extra = {}) {
  if (!S.enLigne) return;
  net.set(net.r(`salles/${S.code}/etat`), { phase: S.phase, scene: S.idx, fin: finVote || 0, ...extra });
}
function urlJoueur() {
  return new URL(`jouer.html?salle=${S.code}&v=6`, location.href).href;
}

/* ---------- Écrans ---------- */
function rendre(html) {
  scene.innerHTML = html;
  scene.style.animation = "none";
  void scene.offsetWidth;
  scene.style.animation = "";
}
function btnSuivant(txt, visible = true) {
  const b = $("#btn-suivant");
  b.textContent = txt;
  b.classList.toggle("cache", !visible);
}

function ecranConfig() {
  btnSuivant("", false);
  rendre(`<div class="config-msg">
    <h2>⚙️ Le mode multijoueur n'est pas encore configuré</h2>
    <p>Pour que la classe puisse voter avec un QR code, il faut coller la configuration Firebase dans <code>js/config.js</code> (voir le README du dépôt, ça prend 3 minutes).</p>
    <p style="margin-top:1em">En attendant, vous pouvez jouer <b>sans téléphones</b> : la classe vote à main levée et vous cliquez sur l'option majoritaire.</p>
    <div class="actions"><button class="btn" id="b-local">Jouer sans téléphones</button></div>
  </div>`);
  $("#b-local").onclick = () => demarrerLocal();
}

function ecranReprise(sauv) {
  btnSuivant("", false);
  const etape = sauv.idx >= 0 ? `étape ${sauv.idx + 1}/${SCENES.length}` : "introduction";
  rendre(`<div class="config-msg">
    <h2>Une partie est en cours</h2>
    <p>${sauv.enLigne ? `Salle <b>${sauv.code}</b> · ` : "Mode sans téléphones · "}${etape}. Voulez-vous la reprendre ?</p>
    <div class="actions"><button class="btn" id="b-rep">Reprendre</button><button class="btn secondaire" id="b-new">Nouvelle partie</button></div>
  </div>`);
  $("#b-rep").onclick = () => reprendre(sauv);
  $("#b-new").onclick = () => { effacerSauvegarde(); demarrer(); };
}

function ecranAccueil() {
  S.phase = "accueil";
  btnSuivant("Commencer ▶");
  const enLigne = S.enLigne;
  rendre(`<div class="accueil">
    <div>
      <div class="surtitre">Jeu interactif · Line Dubé (2009)</div>
      <h1 class="gros-titre">Chef d'équipe virtuelle :<br><em>survivrez-vous ?</em></h1>
      <p class="sous">${enLigne
        ? "Scannez le QR code avec votre téléphone, entrez votre prénom et attendez le début de la partie."
        : "Mode sans téléphones : à chaque étape, la classe vote à main levée."}</p>
      ${enLigne ? `<div class="actions"><span class="compteur-gros"><span id="nb-acc">0</span> joueur(s) connecté(s)</span></div>
      <div class="joueurs-liste" id="liste-joueurs"></div>` : ""}
    </div>
    ${enLigne ? `<div class="qr-carte"><div class="qr" id="qr"></div>
      <div class="code">${S.code}</div><div class="lien">${esc(urlJoueur())}</div></div>` : `<div></div>`}
  </div>`);
  if (enLigne) {
    const q = qrcode(0, "M");
    q.addData(urlJoueur());
    q.make();
    $("#qr").innerHTML = q.createSvgTag({ cellSize: 4, margin: 0, scalable: true });
    majListeJoueurs();
  }
  publier();
  sauver();
}
function majListeJoueurs() {
  const l = $("#liste-joueurs");
  if (!l) return;
  const noms = Object.values(joueurs).map((j) => j.nom);
  $("#nb-acc").textContent = noms.length;
  const deja = new Set([...l.children].map((c) => c.textContent));
  if (deja.size > noms.length) l.innerHTML = "";
  noms.forEach((n) => {
    if (!deja.has(n)) {
      const s = document.createElement("span");
      s.textContent = n;
      l.appendChild(s);
    }
  });
}

function ecranIntro() {
  S.phase = "intro";
  btnSuivant("Première étape ▶");
  rendre(`<div class="intro">
    <div class="surtitre">${INTRO.titre}</div>
    <p class="texte-intro">${INTRO.texte}</p>
    <div class="villes">${INTRO.villes.map((v) => `<div class="ville"><b>📍 ${v.nom}</b><span>${v.detail}</span></div>`).join("")}</div>
    <div class="regle">🎯 ${INTRO.regle}${S.enLigne ? " <b>Points individuels :</b> chaque choix rapporte 0, 500 ou 1000 points selon ce que recommande le texte." : ""}</div>
  </div>`);
  publier();
  sauver();
}

function enteteScene(idx, avecMinuteur) {
  const sc = SCENES[idx];
  return `<div class="entete-scene"><div>
      <div class="etape">Étape ${idx + 1} / ${SCENES.length}</div>
      <h2 class="titre-scene">${sc.titre}</h2>
      <p class="situation">${sc.situation}</p></div>
    ${avecMinuteur ? `<div class="minuteur" id="minuteur"><svg viewBox="0 0 100 100"><circle class="fond-c" cx="50" cy="50" r="44"/>
      <circle class="avance" id="arc" cx="50" cy="50" r="44" stroke-dasharray="276.5" stroke-dashoffset="0"/></svg><div class="nb" id="sec">${DUREE}</div></div>` : ""}
  </div>`;
}

function ecranVote(idx) {
  S.idx = idx;
  S.phase = "vote";
  votes = {};
  enRevelation = false;
  attenteMain = false;
  const sc = SCENES[idx];
  const enLigne = S.enLigne;
  btnSuivant(enLigne ? "Révéler maintenant ▶" : "Choisissez une option", enLigne);
  rendre(`${enteteScene(idx, enLigne)}
    <div class="options" id="options">${sc.choix.map((c, i) => `
      <div class="option ${enLigne ? "" : "clic"}" data-i="${i}">
        <div class="lettre">${LETTRES[i]}</div><div class="txt">${c.texte}</div>
      </div>`).join("")}</div>
    <div class="statut-vote" id="statut">${enLigne
      ? `<span>📱 Votez sur votre téléphone !</span><span><b id="nb-votes">0</b> / <b id="nb-tot">${Object.keys(joueurs).length}</b> ont voté</span>`
      : `<span>✋ Votez à main levée, puis cliquez sur l'option majoritaire (ou touches <b>1</b> à <b>4</b>).</span>`}</div>`);

  if (!enLigne) {
    document.querySelectorAll(".option").forEach((o) => (o.onclick = () => reveler(+o.dataset.i)));
    sauver();
    return;
  }
  finVote = net.maintenant() + DUREE * 1000;
  publier();
  sauver();
  if (arretVotes) arretVotes();
  arretVotes = net.onValue(net.r(`salles/${S.code}/votes/s${idx}`), (s) => {
    votes = s.val() || {};
    majStatutVote();
  });
  clearInterval(minuterie);
  minuterie = setInterval(tic, 200);
  tic();
}
function tic() {
  const reste = Math.max(0, finVote - net.maintenant());
  const sec = Math.ceil(reste / 1000);
  const el = $("#sec");
  if (el) {
    el.textContent = sec;
    $("#arc").style.strokeDashoffset = 276.5 * (1 - reste / (DUREE * 1000));
    $("#minuteur").classList.toggle("urgent", sec <= 5);
  }
  if (reste <= 0) reveler();
}
function majStatutVote() {
  const nv = $("#nb-votes");
  if (!nv) return;
  const n = Object.keys(votes).length;
  const tot = Object.keys(joueurs).length;
  nv.textContent = n;
  $("#nb-tot").textContent = tot;
  if (n > 0 && n >= tot && !enRevelation && !attenteMain) {
    enRevelation = true;
    setTimeout(() => { enRevelation = false; reveler(); }, 900);
  }
}

function reveler(force) {
  if (S.phase !== "vote" || (enRevelation && force === undefined)) return;
  const sc = SCENES[S.idx];
  const comptes = [0, 0, 0, 0];
  Object.values(votes).forEach((v) => { if (v >= 0 && v <= 3) comptes[v]++; });
  const total = comptes.reduce((a, b) => a + b, 0);
  let choix = force;
  let tirage = false;

  if (choix === undefined) {
    if (total === 0) {
      // Personne n'a voté en ligne : on bascule à main levée
      clearInterval(minuterie);
      if (arretVotes) { arretVotes(); arretVotes = null; }
      attenteMain = true;
      btnSuivant("", false);
      $("#statut").innerHTML = `<span class="egalite">Aucun vote reçu ✋ Votez à main levée, puis cliquez sur l'option majoritaire.</span>`;
      document.querySelectorAll(".option").forEach((o) => { o.classList.add("clic"); o.onclick = () => reveler(+o.dataset.i); });
      return;
    }
    const max = Math.max(...comptes);
    const ex = [0, 1, 2, 3].filter((i) => comptes[i] === max);
    choix = ex[Math.floor(Math.random() * ex.length)];
    tirage = ex.length > 1;
  }

  clearInterval(minuterie);
  if (arretVotes) { arretVotes(); arretVotes = null; }
  finVote = 0;

  const opt = sc.choix[choix];
  const avant = { ...S.jauges };
  JAUGES.forEach((j) => {
    S.jauges[j.id] = Math.max(0, Math.min(100, S.jauges[j.id] + (opt.effets[j.id] || 0)));
  });
  S.historique[S.idx] = { choix, qualite: opt.qualite };
  S.dernier = { choix, comptes, total, tirage, avant };

  if (S.enLigne) {
    const maj = {};
    Object.entries(joueurs).forEach(([pid, j]) => {
      const v = votes[pid];
      const pts = v === undefined ? 0 : POINTS[sc.choix[v].qualite];
      j.score = (j.score || 0) + pts;
      maj[`joueurs/${pid}/score`] = j.score;
      maj[`joueurs/${pid}/dernier`] = { scene: S.idx, pts, choix: v === undefined ? -1 : v };
    });
    net.update(net.r(`salles/${S.code}`), maj);
  }
  S.phase = "resultat";
  publier({ choix });
  sauver();
  ecranResultat(true);
}

function miniOptions(sc, d, montrerQualite) {
  return `<div class="mini-options">${sc.choix.map((c, i) => {
    const pct = d.total ? Math.round((100 * d.comptes[i]) / d.total) : null;
    return `<div class="option ${i === d.choix ? "gagnant" : "perdant"}" data-i="${i}">
      ${montrerQualite ? `<span class="badge-q ${c.qualite}">${POINTS[c.qualite]} pts</span>` : ""}
      <div class="lettre">${LETTRES[i]}</div><div class="txt">${c.court}</div>
      ${pct !== null ? `<div class="pct">${pct} %</div><div class="barre-vote" style="width:0" data-w="${pct}"></div>` : ""}
    </div>`;
  }).join("")}</div>`;
}

function ecranResultat(anime) {
  const sc = SCENES[S.idx];
  const d = S.dernier;
  const opt = sc.choix[d.choix];
  btnSuivant("Ce que dit le texte ▶");
  const effets = JAUGES.filter((j) => opt.effets[j.id])
    .map((j) => { const v = opt.effets[j.id]; return `<span class="effet ${v > 0 ? "plus" : "moins"}">${j.icone} ${j.nom} ${v > 0 ? "+" : ""}${v}</span>`; })
    .join("");
  const crises = JAUGES.filter((j) => S.jauges[j.id] <= 0 && d.avant[j.id] > 0);
  rendre(`${enteteScene(S.idx, false)}
    <div class="resultat">
      ${miniOptions(sc, d, false)}
      <div class="consequence" style="--col: var(--${"abcd"[d.choix]})">
        <div class="lettre">${LETTRES[d.choix]}</div>
        <div><h3>La classe a choisi « ${opt.court} »${d.tirage ? ` <span class="egalite">· égalité, tirage au sort !</span>` : ""}</h3>
        <p>${opt.consequence}</p><div class="effets">${effets}</div></div>
      </div>
      ${crises.map((j) => `<div class="alerte-crise">🚨 Crise ! La jauge ${j.icone} ${j.nom} est tombée à zéro.</div>`).join("")}
    </div>`);
  setTimeout(() => document.querySelectorAll(".barre-vote").forEach((b) => (b.style.width = b.dataset.w + "%")), 60);
  if (anime) majJauges(d.avant); else majJauges();
}

function top(n) {
  return Object.values(joueurs).sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, n);
}

function ecranDecryptage() {
  S.phase = "decryptage";
  const sc = SCENES[S.idx];
  const d = S.dernier;
  const dc = sc.decryptage;
  const iTop = sc.choix.findIndex((c) => c.qualite === "top");
  const derniere = S.idx === SCENES.length - 1;
  btnSuivant(derniere ? "Verdict final 🏁" : "Étape suivante ▶");
  const bon = d.choix === iTop;
  rendre(`<div class="etape">Étape ${S.idx + 1} / ${SCENES.length} · ${sc.titre}</div>
    <div class="decryptage">
      <div class="livre">
        <span class="tag-paradoxe">📖 ${dc.paradoxe}</span>
        <h2>${dc.titre}</h2>
        <p class="retenir">💡 ${dc.retenir}</p>
      </div>
      <div class="cote">
        <div class="encart"><h4>Selon le texte</h4>
          ${sc.choix.map((c, i) => `<div class="meilleur" style="margin-bottom:.55em;${i === iTop ? "" : "opacity:.6"}">
            <span class="lettre" style="background:var(--${"abcd"[i]})">${LETTRES[i]}</span>
            <span>${c.court}</span><span class="badge-q ${c.qualite}" style="margin-left:auto;padding:.2em .6em;border-radius:99px;font-weight:700;font-size:.8em;white-space:nowrap">${POINTS[c.qualite]} pts</span></div>`).join("")}
          <p style="margin-top:.7em;font-weight:700;color:${bon ? "var(--bon)" : "var(--moyen)"}">${bon ? "✅ La classe a fait le meilleur choix !" : `La classe avait choisi ${LETTRES[d.choix]}.`}</p>
        </div>
        ${S.enLigne && Object.keys(joueurs).length ? `<div class="encart"><h4>🏅 Classement</h4><ol class="classement">
          ${top(5).map((j) => `<li><span>${esc(j.nom)}</span><b>${j.score || 0}</b></li>`).join("")}</ol></div>` : ""}
      </div>
    </div>`);
  publier({ choix: d.choix });
  sauver();
}

function ecranFin() {
  S.phase = "fin";
  const nbTop = S.historique.filter((h) => h && h.qualite === "top").length;
  const v = verdict(S.jauges, nbTop, SCENES.length);
  btnSuivant("Nouvelle partie ↺");
  const podium = S.enLigne ? top(5) : [];
  const medailles = ["🥇", "🥈", "🥉", "4", "5"];
  rendre(`<div class="fin">
    <div class="verdict">
      <div class="emoji">${v.emoji}</div>
      <h1>${v.titre}</h1>
      <p>${v.texte}</p>
      <div class="stats-fin"><span class="pastille">✅ <b>${nbTop} / ${SCENES.length}</b> stratégies de survie appliquées</span></div>
      <div class="historique">${S.historique.map((h, i) => `<span title="${esc(SCENES[i].titre)}" style="background:var(--${h.qualite === "top" ? "bon" : h.qualite === "moyen" ? "moyen" : "mal"})">${LETTRES[h.choix]}</span>`).join("")}</div>
    </div>
    <div class="podium">
      ${podium.length ? `<div class="surtitre">🏆 Meilleurs chefs d'équipe virtuelle</div>
        ${podium.map((j, i) => `<div class="ligne" style="animation-delay:${0.3 + (podium.length - i) * 0.35}s"><span class="rang">${medailles[i]}</span><span>${esc(j.nom)}</span><span class="pts">${j.score || 0}</span></div>`).join("")}`
      : `<div class="surtitre">À retenir</div><div class="encart" style="font-size:1.2em;line-height:1.5">Les paradoxes ne se « résolvent » pas : on les gère. Le bon chef d'équipe virtuelle combine les deux côtés au lieu d'en choisir un.</div>`}
    </div>
    <div class="recap">${RECAP.map((r) => `<div><i>P${r.n}</i><b>${r.titre}</b><span>${r.strat}</span></div>`).join("")}</div>
  </div>`);
  publier();
  effacerSauvegarde();
}

/* ---------- Navigation ---------- */
function suivant() {
  switch (S.phase) {
    case "accueil": return ecranIntro();
    case "intro": return ecranVote(0);
    case "vote": return S.enLigne && !attenteMain ? reveler() : null;
    case "resultat": return ecranDecryptage();
    case "decryptage": return S.idx + 1 < SCENES.length ? ecranVote(S.idx + 1) : ecranFin();
    case "fin": effacerSauvegarde(); return location.reload();
  }
}
$("#btn-suivant").onclick = suivant;
document.addEventListener("keydown", (e) => {
  if (e.target.tagName === "INPUT") return;
  if ([" ", "Enter", "ArrowRight", "PageDown"].includes(e.key)) { e.preventDefault(); suivant(); }
  else if (e.key === "f" || e.key === "F") {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.(); else document.exitFullscreen?.();
  } else if (["1", "2", "3", "4"].includes(e.key) && S.phase === "vote" && (!S.enLigne || attenteMain)) reveler(+e.key - 1);
});

/* ---------- Démarrage ---------- */
function demarrerLocal() {
  S = nouvellePartie(false);
  majJauges();
  ecranAccueil();
}
async function demarrer() {
  S = nouvellePartie(false);
  majJauges();
  if (!configPrete()) return ecranConfig();
  rendre(`<div class="config-msg"><h2>Connexion…</h2><p>Création de la salle de jeu.</p></div>`);
  try {
    net = await connecter();
    S = nouvellePartie(true);
    S.code = await creerSalle();
    $("#code-salle").textContent = S.code;
    $("#pastille-salle").classList.remove("cache");
    $("#pastille-joueurs").classList.remove("cache");
    ecouterJoueurs();
    ecranAccueil();
  } catch (err) {
    console.error(err);
    rendre(`<div class="config-msg"><h2>⚠️ Connexion impossible</h2>
      <p>Firebase n'a pas répondu (${esc(err.message || err)}). Vérifiez la configuration, les règles de la base, ou le réseau.</p>
      <div class="actions"><button class="btn" id="b-retry">Réessayer</button><button class="btn secondaire" id="b-local">Jouer sans téléphones</button></div></div>`);
    $("#b-retry").onclick = demarrer;
    $("#b-local").onclick = demarrerLocal;
  }
}
async function reprendre(sauv) {
  S = sauv;
  if (S.enLigne) {
    try {
      net = await connecter();
      $("#code-salle").textContent = S.code;
      $("#pastille-salle").classList.remove("cache");
      $("#pastille-joueurs").classList.remove("cache");
      ecouterJoueurs();
      const snap = await net.get(net.r(`salles/${S.code}/joueurs`));
      joueurs = snap.val() || {};
    } catch (e) {
      S.enLigne = false;
    }
  }
  majJauges();
  if (S.phase === "intro") ecranIntro();
  else if (S.phase === "vote") ecranVote(S.idx);
  else if (S.phase === "resultat") { ecranResultat(false); publier({ choix: S.dernier.choix }); }
  else if (S.phase === "decryptage") ecranDecryptage();
  else ecranAccueil();
}

construireJauges();
const sauv = lireSauvegarde();
if (sauv) ecranReprise(sauv);
else demarrer();
