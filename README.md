# Chef d'équipe virtuelle : survivrez-vous ?

Jeu interactif style Kahoot pour le cours GIN761 (gestion d'équipe), basé sur l'article de Line Dubé (2009), *Survivre aux paradoxes de l'équipe virtuelle*.

- `index.html` : **écran hôte** à projeter (QR code, dilemmes, jauges, décryptage, classement)
- `jouer.html` : **page joueur** ouverte par les étudiants en scannant le QR code

## Firebase

Le projet Firebase `gin761-jeu` est déjà configuré (Realtime Database en us-central1, règles de `database.rules.json` publiées, config dans `js/config.js`). Pour refaire la configuration dans un autre projet :

### Mise en route (environ 3 minutes)

1. Sur [console.firebase.google.com](https://console.firebase.google.com), créez un projet, par exemple `gin761-jeu` (Google Analytics n'est pas nécessaire).
2. Allez dans **Créer → Realtime Database → Créer une base de données**, choisissez la région `us-central1`, puis le **mode test**.
3. Dans l'onglet **Règles**, collez le contenu de `database.rules.json`, puis cliquez sur **Publier**.
4. Allez dans **Paramètres du projet** (⚙️) **→ Vos applications → `</>` (Web)**, donnez un nom à l'application et copiez l'objet `firebaseConfig`.
5. Collez-le dans `js/config.js`. Vérifiez que la ligne `databaseURL` est bien présente.

## En classe

1. Ouvrez `https://pierreessirard.github.io/<dépôt>/` sur l'ordinateur relié au projecteur, puis appuyez sur **F** pour passer en plein écran.
2. Les étudiants scannent le QR code et entrent leur prénom.
3. Utilisez **Espace** ou **→** (ou une télécommande de présentation) pour avancer.
   - Vote : 30 secondes, avec révélation automatique quand tout le monde a voté. Pour changer la durée, utilisez `index.html?duree=45`.
   - Si personne ne vote (réseau en panne), la classe vote à main levée et vous cliquez sur l'option majoritaire ou appuyez sur 1, 2 ou 3.
4. Si la page se recharge par erreur, elle vous propose de reprendre la partie en cours.

Le mode **Jouer sans téléphones** fonctionne même sans Firebase.

## Déroulement (environ 6 à 8 minutes)

Introduction, puis 6 questions directes sur la présentation (une par paradoxe, plus une sur la conclusion). Chaque question a un écran de vote et un écran de résultat (conséquence, jauges et phrase à retenir). Le jeu se termine par un verdict et un podium.

### Ce qui garde la classe accrochée

- **Rapidité** : une bonne réponse donnée tout de suite vaut 1000 points, à la dernière seconde 500 (moitié moins pour une réponse « moyenne »). Changer d'avis remet le chrono à zéro.
- **Séries** 🔥 : +100, +200 puis +300 points pour 2, 3, 4+ bonnes réponses d'affilée ; la flamme s'affiche sur le téléphone.
- **Suspense** : après le vote, les barres montent une par une avant que la bonne réponse s'allume (les téléphones attendent aussi).
- **Classement à mi-parcours** : top 5 après la question 3 ; chaque joueur voit son rang et l'écart avec la personne devant.
- **Finale ×2** : la dernière question vaut double.
- **Crise surprise** 🚨 : la question 4 n'est pas annoncée. Après le classement, l'écran passe au rouge (« ALERTE »), les téléphones vibrent, puis la classe n'a que 15 s pour réagir. Pour la configurer, ajoutez un champ `crise` à une scène dans `js/scenarios.js`.

Tout se règle dans `js/scenarios.js` (`REGLES`, `calculerPoints`).

Le contenu est modifiable dans `js/scenarios.js`.
