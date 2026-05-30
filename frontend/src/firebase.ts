import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBWfCoW0QnMQ_PwapFXGJyA27-Nd4VTAOw",
  authDomain: "chrunai-prediction.firebaseapp.com",
  projectId: "chrunai-prediction",
  storageBucket: "chrunai-prediction.firebasestorage.app",
  messagingSenderId: "316860404482",
  appId: "1:316860404482:web:dc3717c47bba205841a81b",
  measurementId: "G-LQLLWNXQ6B"
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
