"use client";

import { useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
  onAuthStateChanged,
  GoogleAuthProvider,
  FacebookAuthProvider,
  User,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

export type Address = {
  id: string;
  label: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
};

export type CustomerProfile = {
  name: string;
  email: string;
  addresses: Address[];
  createdAt: string;
};

export function makeAddressId(): string {
  return Math.random().toString(36).slice(2, 10);
}

async function ensureCustomerDoc(user: User) {
  const ref = doc(db, "customers", user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    const profile: CustomerProfile = {
      name: user.displayName ?? "",
      email: user.email ?? "",
      addresses: [],
      createdAt: new Date().toISOString(),
    };
    await setDoc(ref, profile);
  }
}

export async function signUpWithEmail(
  name: string,
  email: string,
  password: string
): Promise<User> {
  const cred = await createUserWithEmailAndPassword(
    auth,
    email.trim(),
    password
  );
  if (name.trim()) await updateProfile(cred.user, { displayName: name.trim() });
  await ensureCustomerDoc(cred.user);
  return cred.user;
}

export async function signInWithEmail(
  email: string,
  password: string
): Promise<User> {
  const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
  return cred.user;
}

export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email.trim());
}

export async function signInWithGoogle(): Promise<User> {
  const cred = await signInWithPopup(auth, new GoogleAuthProvider());
  await ensureCustomerDoc(cred.user);
  return cred.user;
}

export async function signInWithFacebook(): Promise<User> {
  const cred = await signInWithPopup(auth, new FacebookAuthProvider());
  await ensureCustomerDoc(cred.user);
  return cred.user;
}

export async function signOutCustomer(): Promise<void> {
  await signOut(auth);
}

export async function fetchProfile(uid: string): Promise<CustomerProfile | null> {
  const snap = await getDoc(doc(db, "customers", uid));
  return snap.exists() ? (snap.data() as CustomerProfile) : null;
}

export async function saveAddresses(
  uid: string,
  addresses: Address[]
): Promise<void> {
  await setDoc(doc(db, "customers", uid), { addresses }, { merge: true });
}

export function useAuthUser() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setReady(true);
    });
  }, []);

  return { user, ready };
}
