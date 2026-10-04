import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase web config is public by design — security comes from Firestore rules.
export const firebaseConfig = {
  apiKey: "AIzaSyDZdEAgOzhXkUizwml-Qr1bNFvKRY2IXvI",
  authDomain: "thenicelamps-store.firebaseapp.com",
  projectId: "thenicelamps-store",
  storageBucket: "thenicelamps-store.firebasestorage.app",
  messagingSenderId: "255612299551",
  appId: "1:255612299551:web:99c3bc19a391861478e82a",
};

export const app =
  getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
