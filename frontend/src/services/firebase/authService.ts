// Importamos Firebase Auth con sus tipos
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,

} from "firebase/auth";
import type { User } from "firebase/auth";
import type { UserCredential } from "firebase/auth";
// Importamos la instancia de auth desde firebaseConfig
import { auth } from "./firebaseConfig";

// Creamos el proveedor de Google
const googleProvider = new GoogleAuthProvider();

// Registro de usuario
export const registerUser = (email: string, password: string): Promise<UserCredential> => {
  return createUserWithEmailAndPassword(auth, email, password);
};

// Login con email y password
export const loginUser = (email: string, password: string): Promise<UserCredential> => {
  return signInWithEmailAndPassword(auth, email, password);
};

// Login con Google
export const loginWithGoogle = (): Promise<UserCredential> => {
  return signInWithPopup(auth, googleProvider);
};

// Logout
export const logoutUser = (): Promise<void> => {
  return signOut(auth);
};

// Listener de cambios en el usuario
// (para AuthContext)
export const onAuthStateChangedListener = (
  callback: (user: User | null) => void
) => {
  return onAuthStateChanged(auth, callback);
};
