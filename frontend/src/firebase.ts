import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBWfCoW0QnMQ_PwapFXGJyA27-Nd4VTAOw",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "chrunai-prediction.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "chrunai-prediction",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "chrunai-prediction.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "316860404482",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:316860404482:web:dc3717c47bba205841a81b",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-LQLLWNXQ6B"
};

// Initialize Firebase only if it hasn't been initialized
let app;
try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
} catch (error) {
  console.error("Firebase initialization error", error);
  // Fallback to empty app to prevent crash
  app = {} as any; 
}

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
