// Importamos lo que necesitamos de Firebase
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Esta config la copias de Firebase Console (la parte de “SDK setup and config”)
const firebaseConfig = {
  apiKey: "AIzaSyB8k0HMzpCR917qiaDQ2qI1J0Ys53RZKDs",
  authDomain: "reservo-26dda.firebaseapp.com",
  projectId: "reservo-26dda",
  storageBucket: "reservo-26dda.firebasestorage.app",
  messagingSenderId: "T669161307494",
  appId: "1:669161307494:web:4453b0a2bbb7788da45ca7"
};

// Inicializamos Firebase
const app = initializeApp(firebaseConfig);

// Exportamos los servicios para usarlos donde queramos
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
