import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../services/firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { AuthContext } from "./AuthContext";
import type { User } from "firebase/auth";
import type { UserData } from "./AuthContext";

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);

  const [loading, setLoading] = useState(true);
  const [loadingUserData, setLoadingUserData] = useState(true);

  const logout = async () => {
    await auth.signOut();
    setUser(null);
    setUserData(null);
    navigate("/login");
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (!currentUser) {
        setUserData(null);
        setLoadingUserData(false);
        return;
      }

      setLoadingUserData(true);
      const ref = doc(db, "usuarios", currentUser.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data() as UserData;
        setUserData(data);

        // Redirige solo si ya hay un rol válido
        if (data.rol) {
          if (data.rol === "cliente") navigate("/cliente/home");
          if (data.rol === "empresa") navigate("/empresa/panel");
          if (data.rol === "admin") navigate("/admin/panel");
        }
      }

      setLoadingUserData(false);
    });

    return () => unsubscribe();
  }, [navigate]);

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
