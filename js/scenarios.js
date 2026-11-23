/* =========================================================
   CONTENU DU JEU — « Chef d'équipe virtuelle : survivrez-vous ? »
   Basé sur : Line Dubé (2009), « Survivre aux paradoxes de
   l'équipe virtuelle », Gestion, vol. 34, n° 2.

   Chaque choix :
     - effets : variation des 4 jauges
     - qualite : "top" (stratégie de survie du texte, 1000 pts),
                 "moyen" (500 pts), "mauvais" (0 pt)
   Questions directes sur la présentation : une seule réponse
   correspond au texte (6 questions : 5 paradoxes + conclusion).
   ========================================================= */

export const JAUGES = [
  { id: "confiance", nom: "Confiance", icone: "🤝" },
  { id: "lien", nom: "Lien social", icone: "💬" },
  { id: "coordination", nom: "Coordination", icone: "🧭" },
  { id: "budget", nom: "Budget", icone: "💰" },
];

export const DEPART = { confiance: 50, lien: 50, coordination: 50, budget: 70 };

export const POINTS = { top: 1000, moyen: 500, mauvais: 0 };

/* Règles de score (style Kahoot)
   - Rapidité : une bonne réponse donnée tout de suite vaut 1000 pts,
     donnée à la dernière seconde 500 pts (moitié moins pour « moyen »).
   - Série : bonus pour les bonnes réponses consécutives.
   - Classement intermédiaire après les questions listées (index à partir de 0).
   - Dernière question : points doublés. */
export const REGLES = {
  classementApres: [2],
  dernierDouble: true,
};

export function bonusSerie(serie) {
  return serie >= 2 ? Math.min(300, (serie - 1) * 100) : 0;
}

export function estDouble(idx, total) {
  return REGLES.dernierDouble && idx === total - 1;
}

/* ecoule et duree en ms ; serieAvant = bonnes réponses consécutives avant cette question */
export function calculerPoints(qualite, ecoule, duree, serieAvant, double) {
  const k = 1 - 0.5 * Math.max(0, Math.min(1, ecoule / duree));
  const base = Math.round(POINTS[qualite] * k);
  const serie = qualite === "top" ? serieAvant + 1 : 0;
  const bonus = qualite === "top" ? bonusSerie(serie) : 0;
  const total = (base + bonus) * (double ? 2 : 1);
  return { base, bonus, serie, total };
}

export const LETTRES = ["A", "B", "C", "D"];

export const INTRO = {
  titre: "Votre mission",
  texte: "Vous êtes Jacques, chef d'une équipe répartie entre Montréal, Lima et Paris. Chaque bonne réponse sur la présentation sauve votre projet.",
  villes: [
    { nom: "Montréal", detail: "Vous + 2 analystes" },
    { nom: "Lima", detail: "2 spécialistes" },
    { nom: "Paris", detail: "1 fournisseur · +6 h" },
  ],
  regle: "Votez sur votre téléphone : une seule réponse correspond au texte de Line Dubé.",
  bonus: [
    { ico: "⚡", titre: "Rapidité", texte: "Plus vous répondez vite, plus vous gagnez de points." },
    { ico: "🔥", titre: "Séries", texte: "Enchaînez les bonnes réponses : jusqu'à +300 pts de bonus." },
    { ico: "×2", titre: "Finale", texte: "La dernière question vaut double. Rien n'est joué !" },
  ],
};

export const SCENES = [
  {
    titre: "Le premier conseil",
    situation: "Selon Dubé, quel est le premier conseil pour réussir une équipe virtuelle ?",
    choix: [
      { texte: "Choisir le meilleur logiciel de visioconférence", court: "Le meilleur logiciel",
        effets: { lien: -10, confiance: -5 }, qualite: "mauvais",
        consequence: "Non : la technologie ne transmet ni le non-verbal ni les liens." },
      { texte: "Organiser une rencontre en personne, surtout au lancement", court: "Se voir au lancement",
        effets: { budget: -10, lien: +15, confiance: +10, coordination: +10 }, qualite: "top",
        consequence: "Exact : rendre l'équipe virtuelle… moins virtuelle. C'est le plus grand paradoxe." },
      { texte: "Tout faire par courriel pour garder une trace écrite", court: "Tout par courriel",
        effets: { lien: -10, coordination: -10 }, qualite: "mauvais",
        consequence: "Non : le courriel mène souvent à de mauvaises interprétations." },
      { texte: "Se voir en personne à chaque réunion, toute l'année", court: "Se voir toujours",
        effets: { budget: -30, lien: +10, coordination: +5 }, qualite: "moyen",
        consequence: "À moitié : c'est lent, coûteux, et ça annule les avantages du virtuel." },
    ],
    decryptage: { paradoxe: "Paradoxe 1", titre: "Virtualité ↔ Présence physique",
      retenir: "Se voir pour lancer l'équipe, puis choisir le bon média." },
  },
  {
    titre: "La vraie flexibilité",
    situation: "Qu'est-ce qui permet à une équipe virtuelle de rester flexible ?",
    choix: [
      { texte: "Laisser chacun s'organiser librement, sans cadre", court: "Aucun cadre",
        effets: { coordination: -20, confiance: -5 }, qualite: "mauvais",
        consequence: "Non : sans cadre, deux personnes finissent par faire la même tâche." },
      { texte: "Un plan détaillé que l'on ne modifie jamais", court: "Plan figé",
        effets: { coordination: -10, lien: -5 }, qualite: "mauvais",
        consequence: "Non : le projet change tous les jours, le plan doit rester révisable." },
      { texte: "Des mécanismes structurants : objectifs clairs, agenda partagé, processus", court: "Des mécanismes structurants",
        effets: { coordination: +20, confiance: +5, budget: -5 }, qualite: "top",
        consequence: "Oui : c'est la « flexibilité structurée »." },
      { texte: "Faire valider toutes les décisions par le chef", court: "Tout passe par le chef",
        effets: { coordination: +5, confiance: -10, lien: -5 }, qualite: "moyen",
        consequence: "Ça structure, mais avec le décalage horaire, tout le monde attend le chef." },
    ],
    decryptage: { paradoxe: "Paradoxe 2", titre: "Flexibilité ↔ Structure",
      retenir: "Structurer pour rester flexible : un cadre clair, mais révisable." },
  },
  {
    titre: "Le brouillon",
    situation: "Pourquoi Dubé recommande-t-elle de partager ses brouillons tôt ?",
    choix: [
      { texte: "Pour que le chef surveille l'avancement de chacun", court: "Surveiller chacun",
        effets: { confiance: -10, coordination: +5 }, qualite: "moyen",
        consequence: "Pas vraiment : le but est de collaborer, pas de contrôler." },
      { texte: "Pour réduire le nombre de réunions", court: "Moins de réunions",
        effets: { lien: -10, coordination: -5 }, qualite: "mauvais",
        consequence: "Non : les réunions restent utiles pour les tâches critiques." },
      { texte: "Pour que chacun puisse travailler de façon totalement indépendante", court: "Travail indépendant",
        effets: { coordination: -15, lien: -10 }, qualite: "mauvais",
        consequence: "Non : c'est justement le piège du découpage en morceaux." },
      { texte: "Parce qu'un document « fini » est plus difficile à remettre en question", court: "Un « fini » se critique mal",
        effets: { coordination: +15, lien: +10, confiance: +5 }, qualite: "top",
        consequence: "Oui : plus le document est avancé, moins on ose dire qu'il fait fausse route." },
    ],
    decryptage: { paradoxe: "Paradoxe 3", titre: "Interdépendance ↔ Indépendance",
      retenir: "Travailler chacun de son côté, mais partager tôt." },
  },
  {
    titre: "Crise à Paris",
    // Mini-jeu « crise surprise » : alerte plein écran, puis 15 s pour réagir
    crise: {
      alerte: "Le fournisseur de Paris ne répond plus depuis 3 jours.",
      detail: "Ses derniers courriels étaient secs. La livraison est dans une semaine.",
      duree: 15,
    },
    situation: "🚨 Le fournisseur de Paris ne répond plus depuis 3 jours et ses courriels sont secs. Livraison dans une semaine. Vous avez 15 s pour réagir !",
    choix: [
      { texte: "L'appeler et prendre de ses nouvelles avant de parler du projet", court: "L'appeler, prendre des nouvelles",
        effets: { lien: +20, confiance: +15, coordination: +5 }, qualite: "top",
        consequence: "Il traversait une période difficile. Le lien est recréé et il livre à temps." },
      { texte: "Lui envoyer un courriel ferme, avec la direction en copie", court: "Courriel + direction en copie",
        effets: { confiance: -20, lien: -20 }, qualite: "mauvais",
        consequence: "Il se braque : par écrit, le ton est mal interprété et le lien se casse." },
      { texte: "Prendre l'avion pour Paris dès demain", court: "Sauter dans un avion",
        effets: { budget: -30, lien: +15, confiance: +5 }, qualite: "moyen",
        consequence: "Ça marche… mais c'est le réflexe de l'avion, et le budget fond." },
      { texte: "Refaire son travail vous-même pour tenir la date", court: "Tout refaire soi-même",
        effets: { coordination: -15, lien: -15, budget: -10 }, qualite: "mauvais",
        consequence: "Vous tenez la date, mais vous perdez votre fournisseur et vous êtes épuisé." },
    ],
    decryptage: { paradoxe: "Paradoxe 4", titre: "Tâche ↔ Relations sociales",
      retenir: "Derrière l'écran, il y a un humain : le lien se travaille, même à distance." },
  },
  {
    titre: "La nouvelle recrue",
    situation: "Selon Dubé, comment bâtir la confiance avec un nouveau membre que personne ne connaît ?",
    choix: [
      { texte: "Lui faire confiance d'emblée pour le motiver", court: "Confiance d'emblée",
        effets: { confiance: -15, coordination: -10 }, qualite: "mauvais",
        consequence: "Non : la confiance a priori est fragile et temporaire." },
      { texte: "Le contrôler de près jusqu'à la fin du projet", court: "Contrôle permanent",
        effets: { confiance: -5, lien: -15, coordination: +5 }, qualite: "moyen",
        consequence: "À moitié : le contrôle doit se relâcher quand la confiance s'installe." },
      { texte: "Vérifier d'abord : réputation, tâche-test, suivis rapprochés", court: "Vérifier, puis lâcher",
        effets: { confiance: +20, coordination: +10, lien: +5 }, qualite: "top",
        consequence: "Oui : la méfiance est le point de départ de la confiance." },
      { texte: "Attendre de le rencontrer en personne avant de lui confier du travail", court: "Attendre de le voir",
        effets: { coordination: -15, budget: -10 }, qualite: "mauvais",
        consequence: "Non : à distance, on s'appuie sur des éléments vérifiables." },
    ],
    decryptage: { paradoxe: "Paradoxe 5", titre: "Méfiance ↔ Confiance",
      retenir: "Contrôler pour rassurer au départ, puis faire confiance." },
  },
  {
    titre: "Quoi retenir ?",
    situation: "Selon la conclusion de Dubé, quel est le rôle clé de l'entreprise ?",
    choix: [
      { texte: "Multiplier les voyages pour se voir le plus souvent possible", court: "Plus de voyages",
        effets: { budget: -25, lien: +5 }, qualite: "mauvais",
        consequence: "Non : ce n'est pas une option universelle à long terme." },
      { texte: "Former les employés et les équiper des bons outils TIC", court: "Former et équiper",
        effets: { coordination: +15, confiance: +10, lien: +5 }, qualite: "top",
        consequence: "Oui : passer du physique au virtuel ne s'improvise pas." },
      { texte: "Se fier au courriel, l'outil que tout le monde maîtrise", court: "Le courriel suffit",
        effets: { coordination: -10, lien: -5 }, qualite: "mauvais",
        consequence: "Non : le courriel est trop peu sophistiqué pour le travail virtuel." },
      { texte: "Revenir à des équipes réunies au même endroit", court: "Revenir au bureau",
        effets: { coordination: -10, budget: -10 }, qualite: "mauvais",
        consequence: "Non : on perdrait l'accès à l'expertise, où qu'elle soit." },
    ],
    decryptage: { paradoxe: "Conclusion", titre: "Survivre aux paradoxes",
      retenir: "On ne supprime pas les paradoxes : on apprend à les gérer." },
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
