// ========================
//  AUTH SERVICE (FINAL)
// ========================

// Firebase Auth
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithRedirect,
  type User,
  type UserCredential,
} from "firebase/auth";

import { auth } from "./firebaseConfig";

// -------------------------
//  GOOGLE PROVIDER
// -------------------------
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope("email");
googleProvider.addScope("profile");

// -------------------------
//  REGISTER (email/pass)
// -------------------------
export const registerUser = (
  email: string,
  password: string
): Promise<UserCredential> => {
  return createUserWithEmailAndPassword(auth, email, password);
};

// -------------------------
//  LOGIN (email/pass)
// -------------------------
export const loginUser = (
  email: string,
  password: string
): Promise<UserCredential> => {
  return signInWithEmailAndPassword(auth, email, password);
};

// -------------------------
//  LOGIN WITH GOOGLE
// -------------------------
export const loginWithGoogle = async (): Promise<void> => {
  console.log("🔵 Iniciando login con Google...");
  try {
    await signInWithRedirect(auth, googleProvider);
    console.log("🔵 Redirigiendo a Google...");
  } catch (err) {
    console.error("❌ Error en signInWithRedirect:", err);
    throw err;
  }
};

// -------------------------
//  LOGOUT
// -------------------------
export const logoutUser = (): Promise<void> => {
  return signOut(auth);
};

// -------------------------
//  AUTH LISTENER
// -------------------------
export const onAuthStateChangedListener = (
  callback: (user: User | null) => void
) => {
  return onAuthStateChanged(auth, callback);
};
