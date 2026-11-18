/* =========================================================
   CONFIGURATION FIREBASE (voir README.md, étape 1)
   Colle ici l'objet firebaseConfig de ta console Firebase.
   Ces valeurs ne sont pas secrètes : la sécurité vient des
   règles de la Realtime Database (database.rules.json).
   ========================================================= */

export const firebaseConfig = {
  apiKey: "AIzaSyC-QuYAp71_j0g5mWNRL7qMLRo7kkeHZ24",
  authDomain: "gin761-jeu.firebaseapp.com",
  databaseURL: "https://gin761-jeu-default-rtdb.firebaseio.com",
  projectId: "gin761-jeu",
  storageBucket: "gin761-jeu.firebasestorage.app",
  messagingSenderId: "945359943688",
  appId: "1:945359943688:web:74eb17f23a1b332297b9bd",
};

/* Durée du vote en secondes (modifiable aussi dans l'URL : index.html?duree=45) */
export const DUREE_VOTE = 30;
