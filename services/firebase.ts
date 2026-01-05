
// Use standard modular imports for Firebase v9+
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { GoogleGenAI } from "@google/genai";

// Firebase configuration using the provided environment variable
// The API_KEY is injected automatically and must be used directly.
const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: "buntee-web.firebaseapp.com",
  projectId: "buntee-web",
  storageBucket: "buntee-web.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Initialize Gemini AI client
// Note: While we export it here for convenience, 
// guidelines recommend fresh instances for specific use cases.
export const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
