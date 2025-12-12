import { useEffect, useState, type ReactNode } from "react";
import { auth, db } from "../services/firebase/firebaseConfig";
import {
  onAuthStateChanged,
  getRedirectResult,
  type User,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { AuthContext, type UserData } from "./AuthContext";
import { logoutUser } from "../services/firebase/authService";

interface Props {
  children: ReactNode;
}

export const AuthProvider = ({ children }: Props) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [userData, setUserData] = useState<UserData | null>(null);
  const [loadingUserData, setLoadingUserData] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log(
          "📥 Buscando resultado de redirect...",
          window.location.href
        );
        // Firebase necesita procesar primero el redirect internamente
        const result = await getRedirectResult(auth);

        if (result && result.user) {
          console.log("🔁 Redirect OK:", result.user);

          const user = result.user;
          setUser(user);

          const ref = doc(db, "usuarios", user.uid);
          const snap = await getDoc(ref);

          if (!snap.exists()) {
            await setDoc(ref, {
              nombre: user.displayName || "",
              email: user.email || "",
              rol: "cliente",
            });
          }

          setUserData(
            snap.exists()
              ? (snap.data() as UserData)
              : {
                  nombre: user.displayName || "",
                  email: user.email || "",
                  rol: "cliente",
                }
          );

          setLoading(false);
          setLoadingUserData(false);

          return; // ⛔ IMPORTANTE
        }
      } catch (err) {
        console.error("❌ Error en redirect:", err);
      }

      // Listener normal
      onAuthStateChanged(auth, async (firebaseUser) => {
        setUser(firebaseUser);

        if (firebaseUser) {
          const ref = doc(db, "usuarios", firebaseUser.uid);
          const snap = await getDoc(ref);

          if (snap.exists()) {
            setUserData(snap.data() as UserData);
          } else {
            setUserData({
              nombre: firebaseUser.displayName || "",
              email: firebaseUser.email || "",
              rol: "cliente",
            });
          }
        } else {
          setUserData(null);
        }

        setLoading(false);
        setLoadingUserData(false);
      });
    };

    initAuth();
  }, []);
  const logout = async () => logoutUser();

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        logout,
        userData,
        loadingUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
