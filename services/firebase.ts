import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { GoogleGenAI } from "@google/genai";

// Firebase configuration using the provided environment variable
// In Netlify, you must set the key "API_KEY" in Environment Variables
const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: "buntee-web.firebaseapp.com",
  projectId: "buntee-web",
  storageBucket: "buntee-web.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Initialize Gemini AI
export const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });