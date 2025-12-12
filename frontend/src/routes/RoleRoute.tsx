import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface RoleRouteProps {
  role: "cliente" | "empresa" | "admin";
}

const RoleRoute = ({ role }: RoleRouteProps) => {
  const { userData, loadingUserData } = useAuth();

  if (loadingUserData) return <div>Cargando...</div>;

  if (!userData) return <Navigate to="/login" replace />;

  return userData.rol === role ? <Outlet /> : <Navigate to="/login" replace />;
};

export default RoleRoute;
