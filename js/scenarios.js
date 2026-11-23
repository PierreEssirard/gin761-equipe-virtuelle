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
  // Manche Undercover
  undercover: { reussite: 1500, incognito: 1000, demasque: 500 },
};

/* Nombre d'undercovers selon la taille de la classe */
export function nbUndercovers(nbJoueurs) {
  return nbJoueurs < 8 ? 1 : nbJoueurs < 20 ? 2 : 3;
}

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
    titre: "Se revoir, mais quand ?",
    situation: "L'équipe s'est rencontrée au lancement. Selon Dubé, comment fixer les rencontres face-à-face suivantes ?",
    choix: [
      { texte: "Selon un calendrier fixe, par exemple une fois par trimestre", court: "Calendrier fixe",
        effets: { budget: -10, coordination: +5 }, qualite: "moyen",
        consequence: "Presque : Dubé conseille justement de ne pas suivre un calendrier préétabli." },
      { texte: "Selon les besoins de l'équipe, en se demandant chaque fois si la rencontre est pertinente", court: "Selon les besoins",
        effets: { lien: +10, confiance: +10, coordination: +15, budget: -5 }, qualite: "top",
        consequence: "Exact : on se voit quand c'est utile, en gardant en tête le coût de chaque rencontre." },
      { texte: "Plus du tout : après le lancement, les TIC suffisent", court: "Plus jamais",
        effets: { lien: -15, coordination: -10 }, qualite: "mauvais",
        consequence: "Non : les participants disent que des rencontres périodiques restent nécessaires." },
      { texte: "Le plus souvent possible, puisque c'est en face-à-face que le travail avance vraiment", court: "Le plus souvent possible",
        effets: { budget: -25, lien: +10 }, qualite: "mauvais",
        consequence: "Piège : les participants le ressentent, mais Dubé rappelle que c'est lent, coûteux et que ça annule les avantages du virtuel." },
    ],
    decryptage: { paradoxe: "Paradoxe 1", titre: "Virtualité ↔ Présence physique",
      retenir: "Se voir au lancement, puis seulement quand c'est la meilleure option." },
  },
  {
    titre: "Le revers de la structure",
    situation: "Selon Dubé, quel risque comporte un degré élevé de structuration dans une équipe virtuelle ?",
    choix: [
      { texte: "Il peut nuire à la créativité et à l'innovation", court: "Moins de créativité",
        effets: { coordination: +15, confiance: +5 }, qualite: "top",
        consequence: "Exact : la structure coordonne les efforts… mais peut brider l'innovation. D'où l'équilibre." },
      { texte: "Il ralentit la prise de décision à cause des validations", court: "Décisions plus lentes",
        effets: { coordination: -10 }, qualite: "mauvais",
        consequence: "Plausible, mais ce n'est pas le risque nommé par Dubé." },
      { texte: "Il pousse les membres qui aiment la flexibilité à résister", court: "Les « flexibles » résistent",
        effets: { coordination: -5, confiance: +5 }, qualite: "moyen",
        consequence: "À moitié : c'est vrai, mais Dubé en parle pour le choix des membres, pas comme risque de la structure." },
      { texte: "Il augmente les coûts de gestion du projet", court: "Coûts plus élevés",
        effets: { budget: -10 }, qualite: "mauvais",
        consequence: "Non : le texte ne parle pas de coûts ici." },
    ],
    decryptage: { paradoxe: "Paradoxe 2", titre: "Flexibilité ↔ Structure",
      retenir: "Partir de standards, puis les adapter aux besoins réels de l'équipe." },
  },
  {
    titre: "Le bon moment",
    situation: "Selon Dubé, à quel moment du projet les rencontres collaboratives sont-elles les plus importantes ?",
    choix: [
      { texte: "En fin de projet, pour assembler les livrables de chacun", court: "En fin de projet",
        effets: { coordination: -15, lien: -5 }, qualite: "mauvais",
        consequence: "Non : à la fin, il est souvent trop tard pour changer de direction." },
      { texte: "À chaque jalon, de façon régulière tout au long du projet", court: "À chaque jalon",
        effets: { coordination: +5, budget: -10 }, qualite: "moyen",
        consequence: "Pas faux, mais Dubé insiste sur un moment précis." },
      { texte: "Seulement quand un conflit éclate entre les membres", court: "En cas de conflit",
        effets: { lien: -10, confiance: -10 }, qualite: "mauvais",
        consequence: "Non : on se rencontre pour les tâches critiques, pas pour éteindre des feux." },
      { texte: "En début de projet, quand l'équipe nage dans l'incertitude", court: "En début de projet",
        effets: { coordination: +15, lien: +10, confiance: +5 }, qualite: "top",
        consequence: "Exact : une fois les objectifs clairs et les rôles établis, travailler seul devient plus facile." },
    ],
    decryptage: { paradoxe: "Paradoxe 3", titre: "Interdépendance ↔ Indépendance",
      retenir: "Collaborer fort au début, puis partager tôt ses brouillons." },
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
      { texte: "Prendre l'avion pour Paris dès demain", court: "Sauter dans un avion",
        effets: { budget: -30, lien: +15, confiance: +5 }, qualite: "moyen",
        consequence: "Ça marche… mais c'est le « réflexe de l'avion » que Dubé invite à perdre." },
      { texte: "L'appeler et prendre de ses nouvelles avant de parler du projet", court: "L'appeler, prendre des nouvelles",
        effets: { lien: +20, confiance: +15, coordination: +5 }, qualite: "top",
        consequence: "Il traversait une période difficile. Le lien est recréé et il livre à temps." },
      { texte: "Lui écrire un courriel chaleureux pour demander si tout va bien", court: "Courriel chaleureux",
        effets: { lien: +5, coordination: -5 }, qualite: "moyen",
        consequence: "Bonne intention, mais par écrit le ton se perd : Dubé recommande d'appeler, avec un « sourire dans la voix »." },
      { texte: "Organiser une visio d'urgence avec toute l'équipe pour faire le point sur le retard", court: "Visio d'urgence en équipe",
        effets: { confiance: -15, lien: -10, coordination: +5 }, qualite: "mauvais",
        consequence: "Il se sent mis en accusation devant tout le monde : on reste centré sur la tâche." },
    ],
    decryptage: { paradoxe: "Paradoxe 4", titre: "Tâche ↔ Relations sociales",
      retenir: "Derrière l'écran, il y a un humain : le lien se travaille, même à distance." },
  },
  {
    titre: "Relâcher le contrôle",
    // Manche « Undercover » : des joueurs secrets poussent la classe vers la réponse « cible »
    undercover: { cible: 3, debat: 180, demasquage: 45 },
    situation: "Selon Dubé, à quel moment le chef d'équipe peut-il relâcher les mécanismes de contrôle ?",
    choix: [
      { texte: "Dès que le membre a une bonne réputation dans l'organisation", court: "Bonne réputation",
        effets: { confiance: -15, coordination: -10 }, qualite: "mauvais",
        consequence: "Non : la confiance a priori (réputation, poste) est fragile et temporaire." },
      { texte: "Après une première rencontre en personne avec le membre", court: "Après s'être vus",
        effets: { confiance: -10, budget: -10 }, qualite: "mauvais",
        consequence: "Non : à distance, la méfiance remplace justement cette première impression." },
      { texte: "Quand une performance répétée a atténué la méfiance", court: "Performance répétée",
        effets: { confiance: +20, coordination: +10, lien: +5 }, qualite: "top",
        consequence: "Exact : il faut un niveau élevé de performance répétée, ce qui prend plus de temps qu'en présentiel." },
      { texte: "Dès que le membre a réussi la tâche-test du début de projet", court: "Après la tâche-test",
        effets: { confiance: -5, coordination: -5 }, qualite: "moyen",
        consequence: "Trop tôt : une seule tâche réussie ne suffit pas, la confiance se construit sur la répétition." },
    ],
    decryptage: { paradoxe: "Paradoxe 5", titre: "Méfiance ↔ Confiance",
      retenir: "Contrôler au départ, et ne relâcher qu'après des preuves répétées." },
  },
  {
    titre: "Quoi retenir ?",
    situation: "Selon Dubé, pourquoi « rendre l'équipe virtuelle moins virtuelle » ne pourra pas rester la solution à long terme ?",
    choix: [
      { texte: "Parce que les TIC finiront par remplacer complètement le face-à-face", court: "Les TIC remplaceront tout",
        effets: { lien: -10, coordination: -5 }, qualite: "mauvais",
        consequence: "Non : Dubé dit l'inverse, le face-à-face garde sa place quand il est optimal." },
      { texte: "Parce que les employés de la nouvelle génération refusent de voyager", court: "Les jeunes refusent de voyager",
        effets: { coordination: -5 }, qualite: "mauvais",
        consequence: "Non : Dubé évoque la nouvelle génération, mais pour son aisance avec le clavier." },
      { texte: "Parce que les rencontres en personne nuisent à la créativité", court: "Le face-à-face bride",
        effets: { lien: -10 }, qualite: "mauvais",
        consequence: "Non : c'est même en face-à-face qu'il y a le plus de remue-méninges." },
      { texte: "Parce qu'avec la mondialisation et la course aux meilleurs experts, ce ne sera pas possible partout", court: "Pas possible partout",
        effets: { coordination: +15, confiance: +10, lien: +5 }, qualite: "top",
        consequence: "Exact : il faudra apprendre à composer avec la virtualité, grâce à la formation et aux bons outils." },
    ],
    decryptage: { paradoxe: "Conclusion", titre: "Survivre aux paradoxes",
      retenir: "Former et équiper : on ne supprime pas les paradoxes, on apprend à les gérer." },
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
