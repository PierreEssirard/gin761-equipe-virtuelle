/* =========================================================
   CONTENU DU JEU — « Chef d'équipe virtuelle : survivrez-vous ? »
   Basé sur : Line Dubé (2009), « Survivre aux paradoxes de
   l'équipe virtuelle », Gestion, vol. 34, n° 2.

   Chaque choix :
     - effets : variation des 4 jauges
     - qualite : "top" (stratégie de survie du texte, 1000 pts),
                 "moyen" (500 pts), "mauvais" (0 pt)
   ========================================================= */

export const JAUGES = [
  { id: "confiance", nom: "Confiance", icone: "🤝" },
  { id: "lien", nom: "Lien social", icone: "💬" },
  { id: "coordination", nom: "Coordination", icone: "🧭" },
  { id: "budget", nom: "Budget", icone: "💰" },
];

export const DEPART = { confiance: 50, lien: 50, coordination: 50, budget: 70 };

export const POINTS = { top: 1000, moyen: 500, mauvais: 0 };

export const LETTRES = ["A", "B", "C"];

export const INTRO = {
  titre: "Votre mission",
  texte:
    "Vous êtes Jacques, promu chef de projet il y a un an. Votre mandat : livrer en 6 mois un nouveau système pour un client, avec une équipe de 6 personnes réparties entre Montréal, Lima et Paris. Personne ne s'est jamais rencontré.",
  villes: [
    { nom: "Montréal", detail: "Vous + 2 analystes" },
    { nom: "Lima", detail: "2 spécialistes terrain" },
    { nom: "Paris", detail: "1 fournisseur clé · +6 h" },
  ],
  regle:
    "À chaque étape, votez sur votre téléphone. Le choix majoritaire s'applique à toute l'équipe et fait bouger les 4 jauges. Si une jauge tombe à zéro, le projet est en crise !",
};

export const SCENES = [
  {
    titre: "Le coup d'envoi",
    situation: "Le projet démarre. Comment lancez-vous l'équipe ?",
    choix: [
      {
        texte: "Tout en visio : on est une équipe virtuelle, on économise les billets d'avion.",
        court: "Lancement 100 % visio",
        effets: { budget: +5, lien: -15, confiance: -10, coordination: -10 },
        qualite: "mauvais",
        consequence:
          "Vous économisez sur les billets d'avion… mais personne ne sait vraiment qui est qui. Les premiers appels sont polis et froids, et chacun comprend le mandat à sa façon.",
      },
      {
        texte: "Un lancement de 2 jours en personne à Montréal, puis on passe en virtuel.",
        court: "Kick-off en personne",
        effets: { budget: -15, lien: +15, confiance: +10, coordination: +15 },
        qualite: "top",
        consequence:
          "L'équipe se découvre, fixe ses normes et ses façons de travailler. De retour chez eux, tout le monde sait à qui il parle.",
      },
      {
        texte: "On se réunit en personne chaque mois pendant tout le projet, pour être sûrs.",
        court: "Face-à-face tous les mois",
        effets: { budget: -35, lien: +15, confiance: +10, coordination: +5 },
        qualite: "moyen",
        consequence:
          "L'ambiance est excellente, mais les voyages coûtent une fortune et désorganisent le travail. Vous avez rendu l'équipe virtuelle… beaucoup moins virtuelle.",
      },
    ],
    decryptage: {
      paradoxe: "Paradoxe 1",
      titre: "L'équipe virtuelle requiert une présence physique",
      explication:
        "Le face-à-face offre une communication plus riche (le non-verbal), permet de tisser des liens et de fixer les normes de l'équipe avant de passer en virtuel. Mais en abuser coûte cher et annule les avantages de l'équipe virtuelle.",
      strategies: [
        "Tenir une réunion physique de lancement obligatoire",
        "Ensuite, choisir le bon média selon la tâche, plutôt que de réunir tout le monde par automatisme",
      ],
    },
  },
  {
    titre: "Le plan de match",
    situation:
      "6 heures de décalage avec Paris, des horaires et des congés différents à Lima… Comment organisez-vous le travail ?",
    choix: [
      {
        texte: "Un plan ultra-détaillé, validé une fois pour toutes. Interdit d'y toucher.",
        court: "Plan figé",
        effets: { coordination: -5, lien: -10, confiance: -5 },
        qualite: "moyen",
        consequence:
          "Trois semaines plus tard, le client change une exigence. Le plan figé ne correspond plus à la réalité et personne n'ose le modifier.",
      },
      {
        texte: "Pas de plan rigide : chacun s'organise comme il veut, c'est ça la flexibilité.",
        court: "Chacun s'organise",
        effets: { coordination: -20, confiance: -5 },
        qualite: "mauvais",
        consequence:
          "Deux personnes travaillent sur la même tâche sans le savoir, et une décision urgente attend 3 jours parce que personne n'arrive à joindre la bonne personne.",
      },
      {
        texte:
          "Des objectifs clairs, un agenda d'équipe partagé et des points de contrôle réguliers pour réajuster le plan.",
        court: "Structure + points de contrôle",
        effets: { coordination: +20, budget: -5, confiance: +5 },
        qualite: "top",
        consequence:
          "Tout le monde sait qui fait quoi et qui est joignable. Quand le client change d'avis, on ajuste le plan au point de contrôle suivant.",
      },
    ],
    decryptage: {
      paradoxe: "Paradoxe 2",
      titre: "La flexibilité est facilitée par des mécanismes structurants",
      explication:
        "Pour rester flexible malgré les fuseaux horaires et les horaires variés, il faut, paradoxalement, beaucoup de structure dans les communications et les processus. Mais une structure trop rigide nuit à la créativité et à l'adaptation.",
      strategies: [
        "Des objectifs clairs et une planification détaillée, mise à jour régulièrement",
        "Un agenda de groupe pour savoir qui est joignable",
        "Standardiser les processus de communication tout en les adaptant à l'équipe",
      ],
    },
  },
  {
    titre: "Qui fait quoi ?",
    situation: "Coordonner à distance est épuisant. Comment répartissez-vous le travail ?",
    choix: [
      {
        texte: "On découpe en morceaux 100 % indépendants : chacun sa partie, on assemble à la fin.",
        court: "Lots indépendants",
        effets: { coordination: +5, lien: -15, confiance: -5 },
        qualite: "mauvais",
        consequence:
          "Chacun travaille bien dans son coin… et se désintéresse du reste. Dès que sa partie est finie, son engagement dans le projet l'est aussi.",
      },
      {
        texte: "Tout le monde travaille sur tout, ensemble en visio plusieurs heures par jour.",
        court: "Tout ensemble, tout le temps",
        effets: { coordination: -10, lien: +5, budget: -5 },
        qualite: "moyen",
        consequence:
          "La collaboration est réelle, mais les journées sont épuisantes et les autres projets de chacun prennent du retard.",
      },
      {
        texte:
          "Du travail autonome entre les jalons, un forum où chacun commente les brouillons des autres, et une rencontre pour les tâches critiques.",
        court: "Autonomie + brouillons partagés",
        effets: { coordination: +15, lien: +10, confiance: +5, budget: -5 },
        qualite: "top",
        consequence:
          "Chacun avance de son côté, mais les idées circulent tôt : on corrige le tir sur des brouillons plutôt que sur des documents finis.",
      },
    ],
    decryptage: {
      paradoxe: "Paradoxe 3",
      titre: "Des tâches interdépendantes réalisées par des contributions indépendantes",
      explication:
        "Une équipe existe pour créer de la synergie. Mais la distance pousse à découper le travail comme de la sous-traitance : les membres performent individuellement sans se sentir engagés dans le projet global.",
      strategies: [
        "Organiser une rencontre pour les tâches critiques",
        "Utiliser les TIC de façon créative pour obtenir la rétroaction de tous",
        "Une culture qui accepte l'erreur et le partage de brouillons",
      ],
    },
  },
  {
    titre: "La nouvelle recrue",
    situation:
      "Valeria, une experte de Lima que personne ne connaît, rejoint l'équipe pour prendre en charge une partie importante. Que faites-vous ?",
    choix: [
      {
        texte: "On lui fait confiance : son CV est excellent, on lui confie directement le gros morceau.",
        court: "Confiance aveugle",
        effets: { confiance: -15, coordination: -15 },
        qualite: "mauvais",
        consequence:
          "Trois semaines plus tard, vous découvrez qu'elle a mal compris le mandat. Tout est à refaire, et la confiance en prend un coup des deux côtés.",
      },
      {
        texte:
          "D'abord une petite tâche test (un mémo d'une page sur sa partie), puis des livrables courts avec un suivi fréquent au début.",
        court: "Tâche test + suivi court",
        effets: { confiance: +20, coordination: +10, lien: +5 },
        qualite: "top",
        consequence:
          "Le mémo vous montre vite sa façon de travailler. Après quelques livrables réussis, vous allégez le suivi : la confiance repose maintenant sur des faits.",
      },
      {
        texte: "On la surveille de près : un rapport quotidien obligatoire jusqu'à la fin du projet.",
        court: "Surveillance permanente",
        effets: { confiance: -5, lien: -15, coordination: +5 },
        qualite: "moyen",
        consequence:
          "Le contrôle rassure au début… mais il ne s'allège jamais. Valeria se sent infantilisée et se démotive.",
      },
    ],
    decryptage: {
      paradoxe: "Paradoxe 5",
      titre: "La méfiance est nécessaire pour établir la confiance",
      explication:
        "Sans première rencontre, la confiance de départ (CV, réputation) reste fragile. Des gestes de « méfiance » (évaluer tôt, suivre de près à court terme) permettent de bâtir une vraie confiance. On allège ensuite le contrôle.",
      strategies: [
        "Appuyer la confiance sur des informations : travail antérieur, réputation, parcours",
        "Créer de petites activités qui permettent d'évaluer et d'établir la confiance",
        "Découper les tâches avec un suivi à court terme, puis alléger ce suivi",
      ],
    },
  },
  {
    titre: "Efficaces… et glaciales",
    situation:
      "Vos appels d'équipe sont ultra-efficaces : 30 minutes, 100 % travail. Mais l'équipe semble distante et personne ne s'entraide. Que changez-vous ?",
    choix: [
      {
        texte: "Rien : on n'est pas là pour se faire des amis, le temps c'est de l'argent.",
        court: "On ne change rien",
        effets: { lien: -20, confiance: -5 },
        qualite: "mauvais",
        consequence:
          "À la première grosse période de stress, chacun se replie sur ses tâches. Personne ne se sent responsable des autres.",
      },
      {
        texte:
          "5 minutes au début de chaque appel pour prendre des nouvelles hors travail, et un canal de clavardage informel.",
        court: "Du temps « social » en ligne",
        effets: { lien: +20, confiance: +10 },
        qualite: "top",
        consequence:
          "« Tu as déménagé ? Tu as changé d'auto ? » Ces quelques minutes « perdues » créent un vrai lien : on se rappelle qu'il y a des humains derrière les écrans.",
      },
      {
        texte: "On organise une semaine de team building en personne à Lima.",
        court: "Team building à Lima",
        effets: { budget: -25, lien: +15, confiance: +5, coordination: -5 },
        qualite: "moyen",
        consequence:
          "Tout le monde en garde un excellent souvenir… mais l'effet s'estompe vite une fois rentré, et la facture est salée.",
      },
    ],
    decryptage: {
      paradoxe: "Paradoxe 4",
      titre: "Le travail virtuel, orienté vers la tâche, réussit grâce aux interactions sociales",
      explication:
        "Les TIC poussent à aller droit au but, et prendre du temps pour « jaser » semble être une perte de temps. Pourtant, ce sont les liens sociaux qui aident l'équipe à traverser les moments difficiles.",
      strategies: [
        "Utiliser les TIC aussi pour le social : parler de tout et de rien, garder un « sourire dans la voix »",
        "Maintenir des interactions régulières, comme des battements de cœur",
        "Organiser périodiquement des rencontres face-à-face",
      ],
    },
  },
  {
    titre: "Le courriel qui met le feu",
    situation:
      "Le fournisseur à Paris a mal interprété un courriel. Le ton monte, chaque réponse envenime la situation et le projet est bloqué.",
    choix: [
      {
        texte: "Vous répondez par un long courriel très détaillé pour tout clarifier par écrit.",
        court: "Long courriel",
        effets: { lien: -10, confiance: -10, coordination: -10 },
        qualite: "mauvais",
        consequence:
          "Le courriel est relu, décortiqué… et de nouveau mal interprété. Une semaine de plus de perdue.",
      },
      {
        texte:
          "Un appel vidéo dès aujourd'hui pour clarifier de vive voix et, si ça ne suffit pas, on planifie une rencontre.",
        court: "Appel vidéo immédiat",
        effets: { lien: +10, confiance: +10, coordination: +10 },
        qualite: "top",
        consequence:
          "En 20 minutes de visio, le malentendu est réglé : on voit les réactions, on entend le ton. Pas besoin de prendre l'avion.",
      },
      {
        texte: "Toute l'équipe saute dans un avion pour Paris dès demain.",
        court: "Tout le monde à Paris",
        effets: { budget: -25, lien: +10, confiance: +5, coordination: -5 },
        qualite: "moyen",
        consequence:
          "Le conflit se règle… autour d'un souper. Mais c'est un investissement énorme pour un malentendu, et le reste du projet s'arrête pendant le voyage.",
      },
    ],
    decryptage: {
      paradoxe: "Paradoxes 1 et 4",
      titre: "Choisir le bon média",
      explication:
        "Le courriel se prête mal aux situations ambiguës ou chargées d'émotion. Le face-à-face reste très efficace, mais le texte invite à perdre le « réflexe de sauter dans un avion » et à choisir le média adapté à chaque situation.",
      strategies: [
        "Choisir le bon média selon la tâche",
        "Reconnaître les moments stratégiques où il faut réunir tout le monde",
      ],
    },
  },
  {
    titre: "Le livrable critique",
    situation:
      "Dernière ligne droite : il faut assembler le travail de chacun en un livrable final pour le client. C'est LA tâche critique du projet.",
    choix: [
      {
        texte: "Chacun envoie sa partie par courriel et vous assemblez tout seul la veille.",
        court: "Assemblage solo la veille",
        effets: { coordination: -20, lien: -10, confiance: -5 },
        qualite: "mauvais",
        consequence:
          "Les morceaux ne s'emboîtent pas : formats différents, hypothèses contradictoires. Nuit blanche garantie.",
      },
      {
        texte: "Une rencontre de 2 jours en personne, toute l'équipe concentrée sur l'intégration.",
        court: "2 jours ensemble",
        effets: { budget: -15, coordination: +20, lien: +10, confiance: +5 },
        qualite: "top",
        consequence:
          "Avec toute l'équipe concentrée au même endroit, les incohérences se règlent sur place. Les frais de déplacement deviennent un investissement, pas une dépense.",
      },
      {
        texte: "Un document partagé en ligne où chacun dépose sa partie avant une date limite.",
        court: "Document partagé + date limite",
        effets: { coordination: +5 },
        qualite: "moyen",
        consequence:
          "C'est mieux que les courriels, mais personne ne lit les parties des autres. Le client découvre lui-même les incohérences.",
      },
    ],
    decryptage: {
      paradoxe: "Paradoxes 3 et 1",
      titre: "Une rencontre pour les tâches critiques",
      explication:
        "Pour une tâche critique, la rencontre en personne permet d'obtenir l'attention complète et la collaboration de tous. Entre les rencontres, le travail reste surtout individuel.",
      strategies: [
        "Réserver le face-à-face aux moments stratégiques",
        "« Les frais de déplacement deviennent dorénavant des investissements et non plus des dépenses. » (Michel, chef de projet)",
      ],
    },
  },
];

export const RECAP = [
  { n: 1, titre: "Virtualité vs présence physique", strat: "Lancement en personne, puis le bon média selon la tâche" },
  { n: 2, titre: "Flexibilité vs structure", strat: "Objectifs clairs, agenda partagé, plan révisé régulièrement" },
  { n: 3, titre: "Interdépendance vs indépendance", strat: "Rencontres pour les tâches critiques, brouillons partagés" },
  { n: 4, titre: "Tâche vs social", strat: "Prendre du temps « social », même à travers les TIC" },
  { n: 5, titre: "Méfiance vs confiance", strat: "Évaluer tôt, suivre à court terme, puis relâcher" },
];

export function verdict(jauges, nbTop, total) {
  const zero = JAUGES.find((j) => jauges[j.id] <= 0);
  if (zero)
    return {
      emoji: "💥",
      titre: "Le projet a déraillé",
      texte: `La jauge « ${zero.nom} » est tombée à zéro. Le bon chef d'équipe virtuelle ne mise pas tout sur un seul côté du paradoxe : il cherche l'équilibre entre les deux.`,
    };
  if (nbTop >= total - 1)
    return {
      emoji: "🏆",
      titre: "Maîtres des paradoxes",
      texte: "Vous avez appliqué presque toutes les stratégies de survie du texte. Line Dubé serait fière de vous !",
    };
  if (nbTop >= Math.ceil(total / 2))
    return {
      emoji: "✅",
      titre: "Mission accomplie",
      texte: "Le projet est livré. Quelques choix ont coûté cher, mais l'équipe a trouvé un équilibre entre les paradoxes.",
    };
  if (nbTop >= 2)
    return {
      emoji: "😅",
      titre: "Survivants de justesse",
      texte: "Le projet est livré… sur les rotules. L'équipe a souvent choisi un seul côté du paradoxe au lieu de les réconcilier.",
    };
  return {
    emoji: "🌀",
    titre: "Naufrage virtuel",
    texte: "Gérer une équipe virtuelle comme une équipe ordinaire, ça ne marche pas. C'est exactement ce que dit le texte !",
  };
}
