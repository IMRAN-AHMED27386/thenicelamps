import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase web config is public by design — security comes from Firestore rules.
export const firebaseConfig = {
  apiKey: "AIzaSyBjn9IrPqzauFNmrX8PYoCSkruhqy2fQ3I",
  authDomain: "thenicelamps-store.firebaseapp.com",
  projectId: "thenicelamps-store",
  storageBucket: "thenicelamps-store.firebasestorage.app",
  messagingSenderId: "301401457131",
  appId: "1:301401457131:web:32f5495803a777ba9d99ae",
};

export const app =
  getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
