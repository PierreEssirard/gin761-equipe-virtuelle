/* Connexion à Firebase Realtime Database (chargée depuis le CDN de Google). */
import { firebaseConfig } from "./config.js?v=5";

const V = "10.14.1";

export function configPrete() {
  return (
    firebaseConfig.apiKey &&
    !firebaseConfig.apiKey.startsWith("COLLE") &&
    firebaseConfig.databaseURL
  );
}

export async function connecter() {
  if (!configPrete()) return null;
  const appMod = await import(`https://www.gstatic.com/firebasejs/${V}/firebase-app.js`);
  const dbMod = await import(`https://www.gstatic.com/firebasejs/${V}/firebase-database.js`);
  const app = appMod.initializeApp(firebaseConfig);
  const db = dbMod.getDatabase(app);
  let decalage = 0;
  dbMod.onValue(dbMod.ref(db, ".info/serverTimeOffset"), (s) => (decalage = s.val() || 0));
  return {
    db,
    ...dbMod,
    r: (chemin) => dbMod.ref(db, chemin),
    maintenant: () => Date.now() + decalage,
  };
}
