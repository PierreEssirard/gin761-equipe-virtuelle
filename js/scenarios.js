/* =========================================================
   CONTENU DU JEU — « Chef d'équipe virtuelle : survivrez-vous ? »
   Basé sur : Line Dubé (2009), « Survivre aux paradoxes de
   l'équipe virtuelle », Gestion, vol. 34, n° 2.

   Chaque choix :
     - effets : variation des 4 jauges
     - qualite : "top" (stratégie de survie du texte, 1000 pts),
                 "moyen" (500 pts), "mauvais" (0 pt)
   Les options sont volontairement toutes plausibles : il faut
   avoir compris la nuance du texte pour trouver la bonne.
   ========================================================= */

export const JAUGES = [
  { id: "confiance", nom: "Confiance", icone: "🤝" },
  { id: "lien", nom: "Lien social", icone: "💬" },
  { id: "coordination", nom: "Coordination", icone: "🧭" },
  { id: "budget", nom: "Budget", icone: "💰" },
];

export const DEPART = { confiance: 50, lien: 50, coordination: 50, budget: 70 };

export const POINTS = { top: 1000, moyen: 500, mauvais: 0 };

export const LETTRES = ["A", "B", "C", "D"];

export const INTRO = {
  titre: "Votre mission",
  texte: "Vous êtes Jacques, chef de projet. Votre équipe est répartie entre Montréal, Lima et Paris, et personne ne s'est jamais rencontré.",
  villes: [
    { nom: "Montréal", detail: "Vous + 2 analystes" },
    { nom: "Lima", detail: "2 spécialistes" },
    { nom: "Paris", detail: "1 fournisseur · +6 h" },
  ],
  regle: "Votez sur votre téléphone. Attention : toutes les réponses semblent bonnes !",
};

export const SCENES = [
  {
    titre: "Le lancement",
    situation: "Comment lancez-vous l'équipe ?",
    choix: [
      { texte: "Une visio soignée, caméras allumées et brise-glace", court: "Visio soignée",
        effets: { budget: +5, lien: -5, confiance: -5, coordination: -5 }, qualite: "moyen",
        consequence: "Sympa à l'écran, mais les règles restent floues." },
      { texte: "Deux jours en personne, puis on passe en virtuel", court: "Lancement en personne",
        effets: { budget: -15, lien: +15, confiance: +10, coordination: +15 }, qualite: "top",
        consequence: "L'équipe se connaît et fixe ses règles." },
      { texte: "À distance, et on se voit seulement en cas de crise", court: "Face-à-face si crise",
        effets: { budget: +5, lien: -15, confiance: -10, coordination: -10 }, qualite: "mauvais",
        consequence: "On se rencontre pour la première fois… en pleine crise." },
      { texte: "Une rencontre en personne chaque mois", court: "En personne chaque mois",
        effets: { budget: -35, lien: +15, confiance: +10, coordination: +5 }, qualite: "moyen",
        consequence: "Super ambiance, mais le budget fond." },
    ],
    decryptage: { paradoxe: "Paradoxe 1", titre: "Virtuel vs présence physique",
      retenir: "Se voir au lancement, puis choisir le bon média." },
  },
  {
    titre: "L'organisation",
    situation: "6 h de décalage avec Paris. Comment organisez-vous le travail ?",
    choix: [
      { texte: "Un plan détaillé, fixé une fois pour toutes", court: "Plan figé",
        effets: { coordination: -5, lien: -10, confiance: -5 }, qualite: "mauvais",
        consequence: "Le client change d'avis : le plan ne tient plus." },
      { texte: "Des objectifs clairs, puis chacun s'organise librement", court: "Liberté totale",
        effets: { coordination: -20, confiance: -5 }, qualite: "mauvais",
        consequence: "Deux personnes font la même tâche sans le savoir." },
      { texte: "Un plan, un agenda partagé et des points de contrôle fréquents", court: "Plan révisé + agenda",
        effets: { coordination: +20, budget: -5, confiance: +5 }, qualite: "top",
        consequence: "Chacun sait qui fait quoi, et on ajuste en route." },
      { texte: "Un plan, et toutes les décisions passent par vous", court: "Tout passe par vous",
        effets: { coordination: +5, confiance: -10, lien: -5 }, qualite: "moyen",
        consequence: "Avec le décalage, tout le monde vous attend." },
    ],
    decryptage: { paradoxe: "Paradoxe 2", titre: "Flexibilité vs structure",
      retenir: "Pour rester flexible, il faut de la structure." },
  },
  {
    titre: "Le partage du travail",
    situation: "Comment répartissez-vous le travail ?",
    choix: [
      { texte: "Chacun sa partie, mais on partage les brouillons tôt", court: "Brouillons partagés",
        effets: { coordination: +15, lien: +10, confiance: +5, budget: -5 }, qualite: "top",
        consequence: "On corrige le tir tôt, ensemble." },
      { texte: "Chacun sa partie, et on ne partage que du travail fini", court: "Travail fini seulement",
        effets: { coordination: +5, lien: -15, confiance: -5 }, qualite: "mauvais",
        consequence: "Trop tard pour changer quoi que ce soit." },
      { texte: "Tout le monde sur tout, en visio plusieurs heures par jour", court: "Tous en visio",
        effets: { coordination: -10, lien: +5, budget: -5 }, qualite: "moyen",
        consequence: "Ça collabore, mais c'est épuisant." },
      { texte: "Chacun sa partie, et chacun est jugé sur sa partie", court: "Jugé sur sa partie",
        effets: { coordination: +5, lien: -10, confiance: -5 }, qualite: "mauvais",
        consequence: "Personne ne se sent responsable du résultat final." },
    ],
    decryptage: { paradoxe: "Paradoxe 3", titre: "Équipe vs travail individuel",
      retenir: "Travailler seul, mais partager tôt." },
  },
  {
    titre: "Les réunions",
    situation: "Vos réunions sont efficaces, mais l'équipe est froide. Que faites-vous ?",
    choix: [
      { texte: "Des réunions plus longues, avec un ordre du jour plus précis", court: "Ordre du jour plus précis",
        effets: { lien: -10, coordination: +5, confiance: -5 }, qualite: "mauvais",
        consequence: "On parle plus… mais toujours de travail." },
      { texte: "On ne change rien : l'efficacité avant tout", court: "On ne change rien",
        effets: { lien: -20, confiance: -5 }, qualite: "mauvais",
        consequence: "Au premier stress, chacun se replie." },
      { texte: "Une semaine de team building à Lima", court: "Team building à Lima",
        effets: { budget: -25, lien: +15, confiance: +5, coordination: -5 }, qualite: "moyen",
        consequence: "Beau souvenir, mais ça coûte cher." },
      { texte: "5 minutes de nouvelles perso au début de chaque réunion", court: "5 min perso",
        effets: { lien: +20, confiance: +10 }, qualite: "top",
        consequence: "Un vrai lien se crée, même à distance." },
    ],
    decryptage: { paradoxe: "Paradoxe 4", titre: "Tâche vs social",
      retenir: "Prendre du temps pour le social, même en ligne." },
  },
  {
    titre: "La nouvelle recrue",
    situation: "Valeria rejoint l'équipe. Personne ne la connaît. Que faites-vous ?",
    choix: [
      { texte: "Vous lui confiez tout de suite une grosse partie", court: "Confiance d'emblée",
        effets: { confiance: -15, coordination: -15 }, qualite: "mauvais",
        consequence: "Elle avait mal compris : tout est à refaire." },
      { texte: "Seulement des petites tâches, jusqu'à la fin", court: "Petites tâches seulement",
        effets: { confiance: -10, lien: -10, coordination: -5 }, qualite: "mauvais",
        consequence: "Son expertise est gaspillée." },
      { texte: "Une tâche test, un suivi serré, puis vous la laissez faire", court: "Tester, puis lâcher",
        effets: { confiance: +20, coordination: +10, lien: +5 }, qualite: "top",
        consequence: "La confiance se construit sur des faits." },
      { texte: "Un rapport chaque jour, jusqu'à la fin du projet", court: "Rapport quotidien",
        effets: { confiance: -5, lien: -15, coordination: +5 }, qualite: "moyen",
        consequence: "Elle se sent surveillée et se démotive." },
    ],
    decryptage: { paradoxe: "Paradoxe 5", titre: "Méfiance vs confiance",
      retenir: "Un peu de méfiance au début construit la confiance." },
  },
];

export function verdict(jauges, nbTop, total) {
  const zero = JAUGES.find((j) => jauges[j.id] <= 0);
  if (zero)
    return {
      emoji: "💥",
      titre: "Le projet a déraillé",
      texte: `La jauge « ${zero.nom} » est tombée à zéro.`,
    };
  if (nbTop >= total - 1)
    return {
      emoji: "🏆",
      titre: "Maîtres des paradoxes",
      texte: "Presque toutes les stratégies du texte. Bravo !",
    };
  if (nbTop >= Math.ceil(total / 2))
    return {
      emoji: "✅",
      titre: "Mission accomplie",
      texte: "Le projet est livré, malgré quelques erreurs.",
    };
  if (nbTop >= 2)
    return {
      emoji: "😅",
      titre: "Survivants de justesse",
      texte: "Le projet est livré… de justesse.",
    };
  return {
    emoji: "🌀",
    titre: "Naufrage virtuel",
    texte: "Une équipe virtuelle ne se gère pas comme les autres.",
  };
}
