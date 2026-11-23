/* =========================================================
   ÉCRAN HÔTE — à projeter devant la classe
   ========================================================= */
import { JAUGES, DEPART, LETTRES, INTRO, SCENES, REGLES, verdict, calculerPoints, estDouble, nbUndercovers } from "./scenarios.js?v=14";
import { connecter, configPrete } from "./reseau.js?v=14";
import { DUREE_VOTE } from "./config.js?v=14";

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
let animJeton = 0;
let votesUC = {}; // annule les animations d'un écran quitté

function nouvellePartie(enLigne = false) {
  return { code: null, enLigne, phase: "accueil", idx: -1, jauges: { ...DEPART }, historique: [], dernier: null, tVotes: {} };
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
function compter(el, de, a, ms = 1200) {
  if (de === a) { el.textContent = a; return; }
  const t0 = performance.now();
  const pas = (t) => {
    const k = Math.min(1, (t - t0) / ms);
    const e = 1 - Math.pow(1 - k, 3);
    el.textContent = Math.round(de + (a - de) * e);
    if (k < 1) requestAnimationFrame(pas);
  };
  requestAnimationFrame(pas);
}
function couleur(v) { return v >= 60 ? "var(--bon)" : v >= 30 ? "var(--moyen)" : "var(--mal)"; }
function majJauges(avant = null) {
  JAUGES.forEach((j) => {
    const el = $(`#j-${j.id}`);
    const v = S.jauges[j.id];
    compter(el.querySelector(".val"), avant ? avant[j.id] : Number(el.querySelector(".val").textContent) || v, v);
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
  return new URL(`jouer.html?salle=${S.code}&v=14`, location.href).href;
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
      <h1 class="gros-titre">Chef d'équipe virtuelle&nbsp;:<br><em>survivrez-vous&nbsp;?</em></h1>
      <p class="sous">${enLigne
        ? "Scannez le QR code et entrez votre prénom."
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
  btnSuivant("Première question ▶");
  rendre(`<div class="intro">
    <div class="surtitre">${INTRO.titre}</div>
    <p class="texte-intro">${INTRO.texte}</p>
    <div class="villes">${INTRO.villes.map((v) => `<div class="ville"><b>${v.nom}</b><span>${v.detail}</span></div>`).join("")}</div>
    <div class="regle">${INTRO.regle}</div>
    <div class="bonus-regles">${INTRO.bonus.map((b) => `<div class="bonus-r"><span class="ico">${b.ico}</span><div><b>${b.titre}</b><span>${b.texte}</span></div></div>`).join("")}</div>
  </div>`);
  publier();
  sauver();
}

const dureeDe = (idx) => { const sc = SCENES[idx] || {}; return (sc.crise && sc.crise.duree) || (sc.undercover && S.enLigne && S.uc && S.uc.idx === idx && sc.undercover.debat) || DUREE; };
const chrono = (sec) => (sec >= 60 ? `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}` : String(sec));
const ucActif = (idx) => !!(SCENES[idx] && SCENES[idx].undercover && S.enLigne && S.uc && S.uc.idx === idx);

function enteteScene(idx, avecMinuteur) {
  const sc = SCENES[idx];
  return `<div class="entete-scene ${sc.crise ? "entete-crise" : ""}"><div>
      <div class="etape">Question ${idx + 1} / ${SCENES.length}</div>
      <h2 class="titre-scene">${sc.titre}${estDouble(idx, SCENES.length) ? ` <span class="badge-double">×2 points doublés</span>` : ""}</h2>
      <p class="situation">${sc.situation}</p></div>
    ${avecMinuteur ? `<div class="minuteur" id="minuteur"><svg viewBox="0 0 100 100"><circle class="fond-c" cx="50" cy="50" r="44"/>
      <circle class="avance" id="arc" cx="50" cy="50" r="44" stroke-dasharray="276.5" stroke-dashoffset="0"/></svg><div class="nb" id="sec">${chrono(dureeDe(idx))}</div></div>` : ""}
  </div>`;
}

function ecranCrise(idx) {
  ++animJeton;
  S.idx = idx;
  S.phase = "crise";
  const c = SCENES[idx].crise;
  document.body.classList.add("mode-crise");
  btnSuivant("Réagir ! ▶");
  rendre(`<div class="crise-alerte">
    <div class="sirene">🚨</div>
    <div class="crise-titre">ALERTE</div>
    <p class="crise-texte">${c.alerte}</p>
    <p class="crise-detail">${c.detail}</p>
    <div class="crise-chrono">Vous aurez <b>${c.duree} secondes</b> pour réagir.</div>
  </div>`);
  publier();
  sauver();
}

/* ---------- Manche Undercover ---------- */
function melanger(t) { const a = [...t]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

function ecranMission(idx) {
  ++animJeton;
  const sc = SCENES[idx];
  if (!S.uc || S.uc.idx !== idx) {
    const ids = melanger(Object.keys(joueurs)).slice(0, nbUndercovers(Object.keys(joueurs).length));
    S.uc = { idx, ids, reussi: false };
    const maj = {};
    ids.forEach((pid) => (maj[`joueurs/${pid}/mission`] = { scene: idx, cible: sc.undercover.cible }));
    net.update(net.r(`salles/${S.code}`), maj);
  }
  S.idx = idx;
  S.phase = "mission";
  document.body.classList.add("mode-uc");
  btnSuivant("Lancer le débat ▶");
  const n = S.uc.ids.length;
  rendre(`<div class="uc-mission">
    <div class="uc-ico">🕵️</div>
    <div class="uc-titre">MISSION SECRÈTE</div>
    <p class="uc-texte">Regardez votre téléphone… <b>sans le montrer à personne.</b></p>
    <p class="uc-detail">${n} undercover${n > 1 ? "s se cachent" : " se cache"} parmi vous. ${n > 1 ? "Leur" : "Sa"} mission : vous faire voter la mauvaise réponse à la prochaine question.<br>Tous les autres : démasquez-${n > 1 ? "les" : "le"} !</p>
    <div class="uc-regles"><span>🗣️ 3 min de débat à voix haute</span><span>🔎 Puis vote pour démasquer</span></div>
  </div>`);
  publier();
  sauver();
}

function ecranDemasquage() {
  ++animJeton;
  const idx = S.idx;
  if (!S.uc.suspects) {
    // Suspects : les undercovers + des joueurs qui ont voté comme eux, complétés au hasard
    const sc = SCENES[idx];
    const complices = Object.keys(votes).filter((p) => votes[p] === sc.undercover.cible && !S.uc.ids.includes(p));
    const autres = Object.keys(joueurs).filter((p) => !S.uc.ids.includes(p) && !complices.includes(p));
    S.uc.suspects = melanger([...S.uc.ids, ...melanger(complices), ...melanger(autres)].slice(0, 4));
    S.uc.suspects = melanger([...new Set([...S.uc.ids, ...S.uc.suspects])].slice(0, 4));
  }
  S.phase = "demasquage";
  document.body.classList.add("mode-uc");
  const noms = S.uc.suspects.map((p) => (joueurs[p] ? joueurs[p].nom : "?"));
  const duree = SCENES[idx].undercover.demasquage;
  if (!(S.uc.finDem && S.uc.finDem > net.maintenant())) S.uc.finDem = net.maintenant() + duree * 1000;
  finVote = S.uc.finDem;
  votesUC = {};
  btnSuivant("Révéler ▶");
  const n = S.uc.ids.length;
  rendre(`<div class="entete-scene"><div>
      <div class="etape">Démasquage</div>
      <h2 class="titre-scene">🔎 Qui ${n > 1 ? `sont les ${n} undercovers` : "est l'undercover"} ?</h2>
      <p class="situation">Votez sur votre téléphone pour le suspect le plus louche. +${REGLES.undercover.demasque} pts si vous visez juste.</p></div>
    <div class="minuteur" id="minuteur"><svg viewBox="0 0 100 100"><circle class="fond-c" cx="50" cy="50" r="44"/>
      <circle class="avance" id="arc" cx="50" cy="50" r="44" stroke-dasharray="276.5" stroke-dashoffset="0"/></svg><div class="nb" id="sec">${chrono(duree)}</div></div>
    </div>
    <div class="suspects">${noms.map((nom, i) => `<div class="suspect" data-i="${i}"><div class="lettre">${LETTRES[i]}</div><div class="avatar">👤</div><div class="nom">${esc(nom)}</div></div>`).join("")}</div>
    <div class="statut-vote"><span>🕵️ Qui a poussé la classe vers « ${esc(SCENES[idx].choix[SCENES[idx].undercover.cible].court)} » ?</span><span><b id="nb-votes">0</b> / <b id="nb-tot">${Object.keys(joueurs).length}</b> ont voté</span></div>`);
  publier({ suspects: noms });
  sauver();
  if (arretVotes) arretVotes();
  arretVotes = net.onValue(net.r(`salles/${S.code}/votes/u${idx}`), (s) => {
    votesUC = s.val() || {};
    const nv = $("#nb-votes");
    if (nv) nv.textContent = Object.keys(votesUC).length;
    if (Object.keys(votesUC).length >= Object.keys(joueurs).length && S.phase === "demasquage") setTimeout(finDemasquage, 900);
  });
  clearInterval(minuterie);
  minuterie = setInterval(() => {
    const reste = Math.max(0, finVote - net.maintenant());
    const el = $("#sec");
    if (el) {
      el.textContent = chrono(Math.ceil(reste / 1000));
      $("#arc").style.strokeDashoffset = 276.5 * (1 - reste / (duree * 1000));
      $("#minuteur").classList.toggle("urgent", reste <= 5000);
    }
    if (reste <= 0) finDemasquage();
  }, 200);
}

function finDemasquage() {
  if (S.phase !== "demasquage") return;
  clearInterval(minuterie);
  if (arretVotes) { arretVotes(); arretVotes = null; }
  const U = REGLES.undercover;
  const comptes = S.uc.suspects.map(() => 0);
  Object.values(votesUC).forEach((v) => { if (v >= 0 && v < comptes.length) comptes[v]++; });
  const max = Math.max(...comptes);
  const accuse = max > 0 ? comptes.indexOf(max) : -1;
  const accusePid = accuse >= 0 ? S.uc.suspects[accuse] : null;
  const maj = {};
  const gains = {};
  Object.keys(joueurs).forEach((pid) => (gains[pid] = 0));
  // Les joueurs loyaux qui ont visé un undercover
  Object.entries(votesUC).forEach(([pid, v]) => {
    const cible = S.uc.suspects[v];
    if (!S.uc.ids.includes(pid) && S.uc.ids.includes(cible)) gains[pid] = (gains[pid] || 0) + U.demasque;
  });
  // Les undercovers non désignés par la classe
  S.uc.ids.forEach((pid) => { if (pid !== accusePid) gains[pid] = (gains[pid] || 0) + U.incognito; });
  Object.entries(gains).forEach(([pid, g]) => {
    const j = joueurs[pid];
    if (!j) return;
    j.score = (j.score || 0) + g;
    maj[`joueurs/${pid}/score`] = j.score;
    const role = S.uc.ids.includes(pid) ? "undercover" : "loyal";
    maj[`joueurs/${pid}/dernierUC`] = { scene: S.idx, gain: g, role, demasque: pid === accusePid, reussi: S.uc.reussi, vise: votesUC[pid] !== undefined ? S.uc.suspects[votesUC[pid]] === undefined ? false : S.uc.ids.includes(S.uc.suspects[votesUC[pid]]) : null };
  });
  S.uc.resultat = { comptes, accuse, accusePid, noms: S.uc.suspects.map((p) => (joueurs[p] ? joueurs[p].nom : "?")), tous: S.uc.ids.map((p) => (joueurs[p] ? joueurs[p].nom : "?")) };
  S.phase = "verdict-uc";
  publier();
  net.update(net.r(`salles/${S.code}`), maj);
  ecranVerdictUC();
}

function ecranVerdictUC() {
  ++animJeton;
  S.phase = "verdict-uc";
  document.body.classList.add("mode-uc");
  const r = S.uc.resultat;
  const total = r.comptes.reduce((a, b) => a + b, 0);
  const accuseUC = r.accusePid && S.uc.ids.includes(r.accusePid);
  const titre = r.accuse < 0 ? "Personne n'a été accusé…"
    : accuseUC ? `Démasqué ! ${esc(r.noms[r.accuse])} était bien undercover 🕵️`
    : `Raté ! ${esc(r.noms[r.accuse])} était innocent 😇`;
  const derniere = S.idx + 1 >= SCENES.length;
  btnSuivant(derniere ? "Verdict final ▶" : "Question suivante ▶");
  rendre(`<div class="etape">Verdict de la manche Undercover</div>
    <h2 class="titre-scene">${titre}</h2>
    <div class="suspects revele-uc">${S.uc.suspects.map((p, i) => {
      const uc = S.uc.ids.includes(p);
      const pct = total ? Math.round((100 * r.comptes[i]) / total) : 0;
      return `<div class="suspect ${uc ? "est-uc" : "est-loyal"} ${i === r.accuse ? "accuse" : ""}" data-i="${i}" style="animation-delay:${0.2 + i * 0.5}s">
        <div class="lettre">${LETTRES[i]}</div><div class="avatar">${uc ? "🕵️" : "😇"}</div><div class="nom">${esc(r.noms[i])}</div>
        <div class="role">${uc ? "UNDERCOVER" : "Innocent"}</div><div class="pct">${pct} % des votes</div></div>`;
    }).join("")}</div>
    <div class="duo uc-bilan">
      <div class="livre"><span class="tag-paradoxe">Mission des undercovers</span>
        <p class="retenir">${S.uc.reussi ? `Réussie 😈 La classe a voté leur réponse piège : +${REGLES.undercover.reussite} pts chacun.` : "Échouée 💪 La classe n'est pas tombée dans le piège."}</p></div>
      <div class="livre"><span class="tag-paradoxe">Paradoxe 5 · Méfiance ↔ Confiance</span>
        <p class="retenir">${r.tous.length > 1 ? `Les undercovers étaient : <b>${r.tous.map(esc).join(", ")}</b>. ` : ""}À distance aussi, on vérifie avant de faire confiance.</p></div>
    </div>`);
  majJauges();
  sauver();
}

function ecranVote(idx) {
  ++animJeton;
  const reprise = S.phase === "vote" && S.idx === idx;
  if (SCENES[idx].crise && S.phase !== "crise" && !reprise) return ecranCrise(idx);
  if (SCENES[idx].undercover && S.enLigne && Object.keys(joueurs).length >= 2 && S.phase !== "mission" && !reprise) return ecranMission(idx);
  document.body.classList.toggle("mode-crise", !!SCENES[idx].crise);
  document.body.classList.toggle("mode-uc", ucActif(idx));
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
        ${ucActif(idx) ? `<div class="barre-live"></div><div class="live-pct">0 %</div>` : ""}
        <div class="lettre">${LETTRES[i]}</div><div class="txt">${c.texte}</div>
      </div>`).join("")}</div>
    ${ucActif(idx) ? `<div class="debat">🗣️ <b>Débat ouvert : 3 minutes !</b> Défendez votre réponse à voix haute, vous pouvez changer de vote à tout moment… mais attention : ${S.uc.ids.length} undercover${S.uc.ids.length > 1 ? "s se cachent" : " se cache"} parmi vous 🕵️ <span class="live-tag">● Votes en direct</span></div>` : ""}
    <div class="statut-vote" id="statut">${enLigne
      ? `<span>📱 Votez sur votre téléphone !</span><span><b id="nb-votes">0</b> / <b id="nb-tot">${Object.keys(joueurs).length}</b> ont voté</span>`
      : `<span>✋ Votez à main levée, puis cliquez sur l'option majoritaire (ou touches <b>1</b> à <b>4</b>).</span>`}</div>`);

  if (!enLigne) {
    document.querySelectorAll(".option").forEach((o) => (o.onclick = () => reveler(+o.dataset.i)));
    sauver();
    return;
  }
  if (!(S.finVote && S.tVotes && S.tVotes.idx === idx && S.finVote > net.maintenant())) {
    finVote = net.maintenant() + dureeDe(idx) * 1000;
    S.finVote = finVote;
  } else finVote = S.finVote;
  publier();
  sauver();
  if (arretVotes) arretVotes();
  S.tVotes = S.tVotes && S.tVotes.idx === idx ? S.tVotes : { idx, t: {} };
  arretVotes = net.onValue(net.r(`salles/${S.code}/votes/s${idx}`), (s) => {
    const nouveaux = s.val() || {};
    const t = net.maintenant();
    // Heure d'arrivée de chaque vote (un changement d'avis remet le chrono)
    Object.entries(nouveaux).forEach(([pid, v]) => { if (votes[pid] !== v || !(pid in S.tVotes.t)) S.tVotes.t[pid] = t; });
    votes = nouveaux;
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
    el.textContent = chrono(sec);
    $("#arc").style.strokeDashoffset = 276.5 * (1 - reste / (dureeDe(S.idx) * 1000));
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
  if (ucActif(S.idx)) {
    // Votes en direct (anonymes) pour relancer le débat
    const comptes = [0, 0, 0, 0];
    Object.values(votes).forEach((v) => { if (v >= 0 && v <= 3) comptes[v]++; });
    document.querySelectorAll("#options .option").forEach((o, i) => {
      const pct = n ? Math.round((100 * comptes[i]) / n) : 0;
      const b = o.querySelector(".barre-live");
      if (b) b.style.width = pct + "%";
      const p = o.querySelector(".live-pct");
      if (p) p.textContent = pct + " %";
    });
  }
  if (n > 0 && n >= tot && !enRevelation && !attenteMain && !ucActif(S.idx)) {
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
    const duree = dureeDe(S.idx) * 1000;
    const debut = (S.finVote || finVote || net.maintenant()) - duree;
    const double = estDouble(S.idx, SCENES.length);
    Object.entries(joueurs).forEach(([pid, j]) => {
      const v = votes[pid];
      const serieAvant = j.serie || 0;
      let r = { base: 0, bonus: 0, serie: 0, total: 0 };
      if (v !== undefined) {
        const tv = S.tVotes && S.tVotes.t[pid];
        // Pas de bonus de rapidité pendant le débat Undercover : on veut que la classe écoute
        const ecoule = ucActif(S.idx) ? 0 : tv ? tv - debut : duree / 2;
        r = calculerPoints(sc.choix[v].qualite, ecoule, duree, serieAvant, double);
      }
      j.score = (j.score || 0) + r.total;
      j.serie = r.serie;
      maj[`joueurs/${pid}/score`] = j.score;
      maj[`joueurs/${pid}/serie`] = r.serie;
      maj[`joueurs/${pid}/dernier`] = { scene: S.idx, pts: r.total, base: r.base, bonus: r.bonus, serie: r.serie, double, choix: v === undefined ? -1 : v };
    });
    if (ucActif(S.idx)) {
      S.uc.reussi = choix === sc.undercover.cible;
      if (S.uc.reussi) S.uc.ids.forEach((pid) => {
        if (!joueurs[pid]) return;
        joueurs[pid].score = (joueurs[pid].score || 0) + REGLES.undercover.reussite;
        maj[`joueurs/${pid}/score`] = joueurs[pid].score;
      });
    }
    S.majScores = maj;
  }
  S.finVote = 0;
  S.phase = "resultat";
  publier({ choix });
  // Les scores partent après l'annonce du résultat : les téléphones sont déjà en mode suspense
  if (S.majScores) { net.update(net.r(`salles/${S.code}`), S.majScores); S.majScores = null; }
  sauver();
  ecranResultat(true);
}

const ETIQUETTE = { top: "✓ Bonne réponse", moyen: "À moitié", mauvais: "Faux" };

function miniOptions(sc, d, revele) {
  return `<div class="mini-options">${sc.choix.map((c, i) => {
    const pct = d.total ? Math.round((100 * d.comptes[i]) / d.total) : null;
    const h = pct === null ? 0 : Math.max(4, pct);
    return `<div class="option ${c.qualite === "top" ? "bonne" : ""} ${i === d.choix ? "choix-classe" : ""}" data-i="${i}">
      <div class="barre-monte" style="height:${revele ? h : 0}%" data-h="${h}"></div>
      <span class="badge-q ${c.qualite}">${ETIQUETTE[c.qualite]}</span>
      <div class="lettre">${LETTRES[i]}</div><div class="txt">${c.court}</div>
      ${pct !== null ? `<div class="pct" data-pct="${pct}" data-n="${d.comptes[i]}">${revele ? `${pct} %` : "0 %"}</div>` : ""}
    </div>`;
  }).join("")}</div>`;
}

function ecranResultat(anime) {
  const jeton = ++animJeton;
  document.body.classList.remove("mode-crise");
  document.body.classList.remove("mode-uc");
  const sc = SCENES[S.idx];
  const d = S.dernier;
  const opt = sc.choix[d.choix];
  const dc = sc.decryptage;
  const derniere = S.idx === SCENES.length - 1;
  const classement = S.enLigne && REGLES.classementApres.includes(S.idx) && Object.keys(joueurs).length > 0;
  btnSuivant(ucActif(S.idx) ? "Démasquer ▶" : derniere ? "Verdict final ▶" : classement ? "Classement ▶" : "Question suivante ▶");
  const effets = JAUGES.filter((j) => opt.effets[j.id])
    .map((j) => { const v = opt.effets[j.id]; return `<span class="effet ${v > 0 ? "plus" : "moins"}">${j.icone} ${v > 0 ? "+" : ""}${v}</span>`; })
    .join("");
  const crises = JAUGES.filter((j) => S.jauges[j.id] <= 0 && d.avant[j.id] > 0);
  const avecBarres = d.total > 0;
  const suspense = anime && avecBarres;
  rendre(`<div class="etape">Question ${S.idx + 1} / ${SCENES.length}</div>
    <h2 class="titre-scene">${sc.titre}</h2>
    <div class="resultat ${suspense ? "suspense" : "revele"}" id="res">
      ${miniOptions(sc, d, !suspense)}
      <div class="zone-bas">
        <div class="annonce">🥁 Et la bonne réponse est…</div>
        <div class="duo">
          <div class="consequence" style="--col: var(--${"abcd"[d.choix]})">
            <div class="lettre">${LETTRES[d.choix]}</div>
            <div><h3>La classe a choisi ${LETTRES[d.choix]}${d.tirage ? " (égalité, tirage au sort)" : ""}</h3><p>${opt.consequence}</p><div class="effets">${effets}</div></div>
          </div>
          <div class="livre">
            <span class="tag-paradoxe">${dc.paradoxe} · ${dc.titre}</span>
            <p class="retenir">${dc.retenir}</p>
          </div>
        </div>
      </div>
      ${crises.map((j) => `<div class="alerte-crise">Crise : la jauge ${j.nom} est tombée à zéro.</div>`).join("")}
    </div>`);
  if (!suspense) { if (anime) majJauges(d.avant); else majJauges(); return; }

  // Suspense : les barres montent une par une, puis la bonne réponse est révélée
  const opts = [...document.querySelectorAll("#res .mini-options .option")];
  const PAS = 650;
  opts.forEach((o, i) => setTimeout(() => {
    if (jeton !== animJeton) return;
    const barre = o.querySelector(".barre-monte");
    barre.style.height = barre.dataset.h + "%";
    o.classList.add("monte");
    const p = o.querySelector(".pct");
    if (p) compterPct(p, +p.dataset.pct);
  }, 400 + i * PAS));
  setTimeout(() => {
    if (jeton !== animJeton) return;
    $("#res").classList.replace("suspense", "revele");
    majJauges(d.avant);
  }, 400 + opts.length * PAS + 900);
}

function compterPct(el, cible) {
  const t0 = performance.now();
  const pas = (t) => {
    const k = Math.min(1, (t - t0) / 700);
    el.textContent = Math.round(cible * (1 - Math.pow(1 - k, 3))) + " %";
    if (k < 1) requestAnimationFrame(pas);
  };
  requestAnimationFrame(pas);
}

function ecranClassement() {
  ++animJeton;
  S.phase = "classement";
  btnSuivant("Question suivante ▶");
  const tous = Object.values(joueurs).sort((a, b) => (b.score || 0) - (a.score || 0));
  const t5 = tous.slice(0, 5);
  const reste = SCENES.length - S.idx - 1;
  const medailles = ["🥇", "🥈", "🥉", "4", "5"];
  rendre(`<div class="cl">
    <div class="surtitre">Classement à mi-parcours · ${S.idx + 1} question${S.idx ? "s" : ""} sur ${SCENES.length}</div>
    <h2 class="titre-scene">Top ${t5.length}</h2>
    <div class="cl-liste">${t5.map((j, i) => `<div class="cl-ligne" style="animation-delay:${0.25 + (t5.length - 1 - i) * 0.3}s">
        <span class="rang">${medailles[i]}</span><span class="nom">${esc(j.nom)}</span>
        <span class="feu">${(j.serie || 0) >= 2 ? `🔥 ${j.serie}` : ""}</span>
        <span class="pts">${j.score || 0}</span></div>`).join("")}</div>
    <p class="cl-note">Encore ${reste} question${reste > 1 ? "s" : ""}… et la dernière vaut <b>double</b>. Tout peut encore changer !</p>
  </div>`);
  publier();
  sauver();
}

function top(n) {
  return Object.values(joueurs).sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, n);
}

function ecranFin() {
  ++animJeton;
  document.body.classList.remove("mode-uc", "mode-crise");
  S.phase = "fin";
  const nbTop = S.historique.filter((h) => h && h.qualite === "top").length;
  const v = verdict(S.jauges, nbTop, SCENES.length);
  btnSuivant("Nouvelle partie ↺");
  const podium = S.enLigne ? top(3) : [];
  const medailles = ["🥇", "🥈", "🥉", "4", "5"];
  rendre(`<div class="fin">
    <div class="verdict">
      <div class="emoji">${v.emoji}</div>
      <h1>${v.titre}</h1>
      <p>${v.texte} <b>${nbTop} / ${SCENES.length}</b> bonnes réponses.</p>
      <div class="historique">${S.historique.map((h, i) => `<span title="${esc(SCENES[i].titre)}" style="background:var(--${h.qualite === "top" ? "bon" : h.qualite === "moyen" ? "moyen" : "mal"})">${LETTRES[h.choix]}</span>`).join("")}</div>
    </div>
    <div class="podium">
      ${podium.length ? `<div class="surtitre">Meilleurs chefs d'équipe virtuelle</div>
        ${podium.map((j, i) => `<div class="ligne" style="animation-delay:${0.3 + (podium.length - i) * 0.35}s"><span class="rang">${medailles[i]}</span><span>${esc(j.nom)}</span><span class="pts">${j.score || 0}</span></div>`).join("")}`
      : `<div class="encart" style="font-size:1.4em;line-height:1.4">Les paradoxes ne se résolvent pas : ils se gèrent.</div>`}
    </div>
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
    case "resultat":
    case "decryptage":
      if (ucActif(S.idx)) return ecranDemasquage();
      if (S.idx + 1 >= SCENES.length) return ecranFin();
      if (S.enLigne && REGLES.classementApres.includes(S.idx) && Object.keys(joueurs).length > 0) return ecranClassement();
      return ecranVote(S.idx + 1);
    case "classement": return ecranVote(S.idx + 1);
    case "crise": return ecranVote(S.idx);
    case "mission": return ecranVote(S.idx);
    case "demasquage": return finDemasquage();
    case "verdict-uc":
      if (S.idx + 1 >= SCENES.length) return ecranFin();
      return ecranVote(S.idx + 1);
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
  else if (S.phase === "decryptage") { S.phase = "resultat"; ecranResultat(false); }
  else if (S.phase === "classement") ecranClassement();
  else if (S.phase === "crise") ecranCrise(S.idx);
  else if (S.phase === "mission") ecranMission(S.idx);
  else if (S.phase === "demasquage") ecranDemasquage();
  else if (S.phase === "verdict-uc") ecranVerdictUC();
  else ecranAccueil();
}

construireJauges();
const sauv = lireSauvegarde();
if (sauv) ecranReprise(sauv);
else demarrer();
