// src/config/firebase.ts
import { initializeApp, getApp, getApps } from 'firebase/app';
// import { getStorage } from 'firebase/storage';
// import { getMessaging } from 'firebase/messaging';

// IMPORTANT: Remplacez ces valeurs par votre configuration Firebase réelle !
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  // measurementId: "YOUR_MEASUREMENT_ID" // Optionnel pour Analytics
};

// Initialiser Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// const storage = getStorage(app);
// const messaging = getMessaging(app);

// Exportez ce dont vous avez besoin, par exemple :
export { app /*, storage, messaging */ };
