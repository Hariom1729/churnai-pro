import { initializeApp } from "firebase/app";
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

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
