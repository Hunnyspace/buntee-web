import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { GoogleGenAI } from '@google/genai';

// Firebase configuration using the provided environment variable.
// The API_KEY is obtained exclusively from the environment variable process.env.API_KEY.
const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: "buntee-web.firebaseapp.com",
  projectId: "buntee-web",
  storageBucket: "buntee-web.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Initialize Firebase using standard named export for modular SDK v9+.
// Ensure initializeApp is imported from the correct entry point 'firebase/app'.
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Use a factory function for Gemini AI client to ensure fresh instances are created
// as recommended by the guidelines to use the most up-to-date API key.
// Always use new GoogleGenAI({ apiKey: process.env.API_KEY })
export const createAi = () => new GoogleGenAI({ apiKey: process.env.API_KEY });