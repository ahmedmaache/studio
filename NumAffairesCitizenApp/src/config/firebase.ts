// src/config/firebase.ts
import { initializeApp, getApp, getApps } from 'firebase/app';
// import { getStorage } from 'firebase/storage';
// import { getMessaging } from 'firebase/messaging';

// IMPORTANT: Remplacez ces valeurs par votre configuration Firebase réelle !
const firebaseConfig = {
  apiKey: "AIzaSyDZbsKXxbFj8V4waZ3H1ewRQl70w9Dl_OU",
  authDomain: "numaffaires.firebaseapp.com",
  projectId: "numaffaires",
  storageBucket: "numaffaires.firebasestorage.app",
  messagingSenderId: "570366956356",
  appId: "1:570366956356:web:b54a2e81bcdaadca2dbd11",
  measurementId: "G-FME4LW0TN3" // Optionnel pour Analytics
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
