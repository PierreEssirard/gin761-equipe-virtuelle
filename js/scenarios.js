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
  texte:
    "Vous êtes Jacques, promu chef de projet il y a un an. Votre mandat : livrer en 6 mois un nouveau système pour un client, avec une équipe de 6 personnes réparties entre Montréal, Lima et Paris. Personne ne s'est jamais rencontré.",
  villes: [
    { nom: "Montréal", detail: "Vous + 2 analystes" },
    { nom: "Lima", detail: "2 spécialistes terrain" },
    { nom: "Paris", detail: "1 fournisseur clé · +6 h" },
  ],
  regle:
    "À chaque étape, votez sur votre téléphone. Attention : toutes les réponses semblent bonnes ! Le choix majoritaire s'applique à toute l'équipe et fait bouger les 4 jauges. Si une jauge tombe à zéro, le projet est en crise.",
};

export const SCENES = [
  {
    titre: "Le coup d'envoi",
    situation: "Le projet démarre. Comment lancez-vous cette équipe qui ne s'est jamais vue ?",
    choix: [
      {
        texte: "Un lancement en visio très soigné : caméras allumées, brise-glace, présentation de chacun.",
        court: "Lancement visio soigné",
        effets: { budget: +5, lien: -5, confiance: -5, coordination: -5 },
        qualite: "moyen",
        consequence:
          "Bonne ambiance à l'écran… mais les normes restent floues et chacun repart avec sa propre lecture du mandat. Le non-verbal passe mal en visio.",
      },
      {
        texte: "Deux jours en personne à Montréal pour se connaître et fixer les règles, puis on passe en virtuel.",
        court: "Lancement en personne",
        effets: { budget: -15, lien: +15, confiance: +10, coordination: +15 },
        qualite: "top",
        consequence:
          "L'équipe se découvre et fixe ses normes et ses façons de faire. De retour chez eux, tout le monde sait à qui il parle.",
      },
      {
        texte: "On démarre à distance et on se voit en personne seulement si un vrai problème apparaît.",
        court: "Face-à-face en cas de crise",
        effets: { budget: +5, lien: -15, confiance: -10, coordination: -10 },
        qualite: "mauvais",
        consequence:
          "Le premier face-à-face arrive… en pleine crise. Ce n'est pas le moment idéal pour faire connaissance.",
      },
      {
        texte: "Une rencontre en personne chaque mois, pour garder la cohésion pendant tout le projet.",
        court: "En personne chaque mois",
        effets: { budget: -35, lien: +15, confiance: +10, coordination: +5 },
        qualite: "moyen",
        consequence:
          "L'ambiance est excellente, mais les voyages coûtent une fortune. Vous avez rendu l'équipe virtuelle… beaucoup moins virtuelle.",
      },
    ],
    decryptage: {
      paradoxe: "Paradoxe 1",
      titre: "Virtualité vs présence physique",
      retenir: "Lancement obligatoire en personne, puis on choisit le média selon la tâche.",
    },
  },
  {
    titre: "Le plan de match",
    situation:
      "6 heures de décalage avec Paris, des horaires et des congés différents à Lima. Comment organisez-vous le travail ?",
    choix: [
      {
        texte: "Un plan très détaillé, validé en début de projet, auquel tout le monde doit se tenir.",
        court: "Plan détaillé et stable",
        effets: { coordination: -5, lien: -10, confiance: -5 },
        qualite: "mauvais",
        consequence:
          "Trois semaines plus tard, le client change une exigence. Le plan ne colle plus à la réalité et personne n'ose le modifier.",
      },
      {
        texte: "Des objectifs clairs et chacun s'organise librement : c'est justement l'avantage du virtuel.",
        court: "Objectifs + liberté totale",
        effets: { coordination: -20, confiance: -5 },
        qualite: "mauvais",
        consequence:
          "Deux personnes font la même tâche sans le savoir, et une décision urgente attend 3 jours faute de pouvoir joindre quelqu'un.",
      },
      {
        texte: "Un plan détaillé, un agenda d'équipe partagé et des points de contrôle fréquents pour le réviser.",
        court: "Plan révisé + agenda partagé",
        effets: { coordination: +20, budget: -5, confiance: +5 },
        qualite: "top",
        consequence:
          "Chacun sait qui fait quoi et qui est joignable. Quand le client change d'avis, on ajuste le plan au point de contrôle suivant.",
      },
      {
        texte: "Un plan détaillé et vous centralisez toutes les décisions : on vous consulte avant d'agir.",
        court: "Plan + tout passe par vous",
        effets: { coordination: +5, confiance: -10, lien: -5 },
        qualite: "moyen",
        consequence:
          "C'est bien structuré, mais avec 6 heures de décalage, tout le monde attend votre réponse. Vous êtes devenu le goulot d'étranglement.",
      },
    ],
    decryptage: {
      paradoxe: "Paradoxe 2",
      titre: "Flexibilité vs structure",
      retenir: "Pour rester flexible à distance, il faut de la structure… qu'on révise souvent.",
    },
  },
  {
    titre: "Qui fait quoi ?",
    situation: "Coordonner à distance est épuisant. Comment répartissez-vous le travail ?",
    choix: [
      {
        texte: "Des lots indépendants, mais chacun partage ses brouillons tôt et on se réunit pour les tâches critiques.",
        court: "Lots + brouillons partagés",
        effets: { coordination: +15, lien: +10, confiance: +5, budget: -5 },
        qualite: "top",
        consequence:
          "Chacun avance de son côté, mais les idées circulent tôt : on corrige le tir sur des brouillons plutôt que sur des documents finis.",
      },
      {
        texte: "Des lots indépendants, et chacun ne partage que des versions finales soignées pour ne pas faire perdre de temps.",
        court: "Lots + versions finales",
        effets: { coordination: +5, lien: -15, confiance: -5 },
        qualite: "mauvais",
        consequence:
          "Les documents arrivent parfaits… et personne n'ose plus les remettre en question. Quand sa partie est finie, chacun décroche.",
      },
      {
        texte: "Tout le monde travaille sur tout, en visio ensemble plusieurs heures par jour.",
        court: "Tous ensemble en visio",
        effets: { coordination: -10, lien: +5, budget: -5 },
        qualite: "moyen",
        consequence:
          "La collaboration est réelle, mais les journées sont épuisantes et les autres projets de chacun prennent du retard.",
      },
      {
        texte: "Des lots indépendants avec des responsables clairs : chacun est jugé sur sa partie.",
        court: "Lots + responsabilité individuelle",
        effets: { coordination: +5, lien: -10, confiance: -5 },
        qualite: "mauvais",
        consequence:
          "Tout le monde réussit sa partie… mais personne ne se sent responsable du résultat global. C'est de la sous-traitance, pas une équipe.",
      },
    ],
    decryptage: {
      paradoxe: "Paradoxe 3",
      titre: "Interdépendance vs indépendance",
      retenir: "Découper le travail, oui, mais en partageant les brouillons et en se réunissant pour les tâches critiques.",
    },
  },
  {
    titre: "La nouvelle recrue",
    situation:
      "Valeria, une experte de Lima que personne ne connaît, arrive avec un excellent CV. Que faites-vous ?",
    choix: [
      {
        texte: "Vous lui confiez directement une partie importante : montrer votre confiance la motivera.",
        court: "Confiance d'emblée",
        effets: { confiance: -15, coordination: -15 },
        qualite: "mauvais",
        consequence:
          "Trois semaines plus tard, vous découvrez qu'elle a mal compris le mandat. Tout est à refaire, et la confiance en souffre des deux côtés.",
      },
      {
        texte: "Vous lui confiez seulement des tâches secondaires jusqu'à la fin, pour limiter le risque.",
        court: "Tâches secondaires seulement",
        effets: { confiance: -10, lien: -10, coordination: -5 },
        qualite: "mauvais",
        consequence:
          "Le risque est limité… mais son expertise est gaspillée, et Valeria comprend vite qu'on ne lui fait pas confiance.",
      },
      {
        texte: "Une petite tâche test d'abord, puis des livrables courts avec un suivi serré, qu'on allège ensuite.",
        court: "Tester, suivre, puis alléger",
        effets: { confiance: +20, coordination: +10, lien: +5 },
        qualite: "top",
        consequence:
          "La tâche test vous montre vite sa façon de travailler. Après quelques réussites, vous allégez le suivi : la confiance repose sur des faits.",
      },
      {
        texte: "Un rapport quotidien obligatoire pendant tout le projet, comme pour tout le monde.",
        court: "Suivi serré permanent",
        effets: { confiance: -5, lien: -15, coordination: +5 },
        qualite: "moyen",
        consequence:
          "Le contrôle rassure au début… mais il ne s'allège jamais. Valeria se sent infantilisée et se démotive.",
      },
    ],
    decryptage: {
      paradoxe: "Paradoxe 5",
      titre: "Méfiance vs confiance",
      retenir: "Un peu de méfiance au départ (tester, suivre de près) sert à bâtir une vraie confiance.",
    },
  },
  {
    titre: "Efficaces… et glaciales",
    situation:
      "Vos appels d'équipe sont ultra-efficaces : 30 minutes, 100 % travail. Mais l'équipe est distante et personne ne s'entraide.",
    choix: [
      {
        texte: "Allonger les appels, avec un ordre du jour plus détaillé pour que chacun prenne la parole.",
        court: "Appels plus longs et structurés",
        effets: { lien: -10, coordination: +5, confiance: -5 },
        qualite: "mauvais",
        consequence:
          "Tout le monde parle… de travail. Les appels sont plus longs, mais l'équipe n'est pas plus soudée.",
      },
      {
        texte: "Garder des appels courts : le temps de chacun est précieux, l'efficacité avant tout.",
        court: "Garder l'efficacité",
        effets: { lien: -20, confiance: -5 },
        qualite: "mauvais",
        consequence:
          "À la première grosse période de stress, chacun se replie sur ses tâches. Personne ne se sent responsable des autres.",
      },
      {
        texte: "Une semaine de team building en personne à Lima pour souder l'équipe.",
        court: "Team building à Lima",
        effets: { budget: -25, lien: +15, confiance: +5, coordination: -5 },
        qualite: "moyen",
        consequence:
          "Tout le monde en garde un excellent souvenir… mais l'effet s'estompe vite une fois rentré, et la facture est salée.",
      },
      {
        texte: "5 minutes au début de chaque appel pour prendre des nouvelles hors travail, et un canal informel.",
        court: "Du temps social en ligne",
        effets: { lien: +20, confiance: +10 },
        qualite: "top",
        consequence:
          "« Tu as déménagé ? Tu as changé d'auto ? » Ces minutes « perdues » créent un vrai lien : il y a des humains derrière les écrans.",
      },
    ],
    decryptage: {
      paradoxe: "Paradoxe 4",
      titre: "Tâche vs social",
      retenir: "Le lien social se construit aussi à travers les TIC : il faut accepter de « perdre du temps ».",
    },
  },
  {
    titre: "Le courriel qui met le feu",
    situation:
      "Le fournisseur à Paris a mal interprété un courriel. Le ton monte, chaque réponse envenime la situation et le projet est bloqué.",
    choix: [
      {
        texte: "Un courriel très détaillé et posé qui clarifie tout point par point, avec preuves à l'appui.",
        court: "Courriel détaillé",
        effets: { lien: -10, confiance: -10, coordination: -10 },
        qualite: "mauvais",
        consequence:
          "Le courriel est relu, décortiqué… et de nouveau mal interprété. Une semaine de plus de perdue.",
      },
      {
        texte: "Toute l'équipe saute dans un avion pour Paris dès demain pour régler ça autour d'une table.",
        court: "Tout le monde à Paris",
        effets: { budget: -25, lien: +10, confiance: +5, coordination: -5 },
        qualite: "moyen",
        consequence:
          "Le conflit se règle autour d'un souper. Mais c'est un investissement énorme pour un malentendu, et le projet s'arrête pendant le voyage.",
      },
      {
        texte: "Un appel vidéo dès aujourd'hui pour clarifier de vive voix ; une rencontre seulement si ça ne suffit pas.",
        court: "Appel vidéo d'abord",
        effets: { lien: +10, confiance: +10, coordination: +10 },
        qualite: "top",
        consequence:
          "En 20 minutes de visio, le malentendu est réglé : on voit les réactions, on entend le ton. Pas besoin de prendre l'avion.",
      },
      {
        texte: "Vous mettez toute l'équipe en copie et demandez à chacun sa version des faits par écrit.",
        court: "Tout le monde en copie",
        effets: { lien: -15, confiance: -10, coordination: -5 },
        qualite: "mauvais",
        consequence:
          "Le fil de courriels devient un tribunal. Chacun défend sa position par écrit et le conflit s'étend à toute l'équipe.",
      },
    ],
    decryptage: {
      paradoxe: "Paradoxes 1 et 4",
      titre: "Choisir le bon média",
      retenir: "Le courriel envenime ce qui est ambigu, et l'avion est un réflexe à perdre : visio d'abord.",
    },
  },
  {
    titre: "Le livrable critique",
    situation:
      "Dernière ligne droite : il faut assembler le travail de chacun en un livrable final pour le client. C'est LA tâche critique.",
    choix: [
      {
        texte: "Une visio de 30 minutes où chacun présente sa partie, puis vous assemblez.",
        court: "Visio de présentation",
        effets: { coordination: -5, lien: 0, confiance: 0 },
        qualite: "moyen",
        consequence:
          "Chacun présente sa partie, mais on n'a pas le temps de régler les incohérences. Vous les découvrez seul en assemblant.",
      },
      {
        texte: "Un document partagé en ligne où chacun dépose sa partie avant une date limite.",
        court: "Document partagé",
        effets: { coordination: +5 },
        qualite: "moyen",
        consequence:
          "C'est mieux que les courriels, mais personne ne lit les parties des autres. Le client découvre lui-même les incohérences.",
      },
      {
        texte: "Chacun envoie sa partie finale par courriel et vous faites l'assemblage pour gagner du temps.",
        court: "Assemblage par vous seul",
        effets: { coordination: -20, lien: -10, confiance: -5 },
        qualite: "mauvais",
        consequence:
          "Les morceaux ne s'emboîtent pas : formats différents, hypothèses contradictoires. Nuit blanche garantie.",
      },
      {
        texte: "Deux jours en personne, toute l'équipe concentrée uniquement sur l'intégration.",
        court: "2 jours ensemble",
        effets: { budget: -15, coordination: +20, lien: +10, confiance: +5 },
        qualite: "top",
        consequence:
          "Avec toute l'équipe concentrée au même endroit, les incohérences se règlent sur place. Le déplacement devient un investissement, pas une dépense.",
      },
    ],
    decryptage: {
      paradoxe: "Paradoxes 3 et 1",
      titre: "Rencontre pour les tâches critiques",
      retenir: "Le face-à-face se réserve aux moments stratégiques : c'est alors un investissement.",
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
