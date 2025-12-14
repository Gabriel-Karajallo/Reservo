import { createContext } from "react";
import type { User } from "firebase/auth";

export interface UserData {
  nombre: string;
  email: string;
  rol: "cliente" | "empresa" | "admin";
  negocioId?: string; // 👈 IMPORTANTE
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  userData: UserData | null;
  loadingUserData: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
  userData: null,
  loadingUserData: true,
});
