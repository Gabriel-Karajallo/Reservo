import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/login";
import Registro from "../pages/registro";

import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";

// Layouts
import ClienteLayout from "../layouts/CL0000_ClienteLayout/CL0000_ClienteLayout";
import EmpresaLayout from "../layouts/EM0000_EmpresaLayout/EM0000_EmpresaLayout";
import AdminLayout from "../layouts/AD0000_AdminLayout/AD0000_AdminLayout";

// Cliente pages
import CL0001_Home from "../pages/CL/CL0001_Home/CL0001_Home";
import CL0002_Reservas from "../pages/CL/CL0002_Reservas/CL0002_Reservas";
import CL0003_Favoritos from "../pages/CL/CL0003_Favoritos/CL0003_Favoritos";
import CL0004_Perfil from "../pages/CL/CL0004_Perfil/CL0004_Perfil";
import CL0007_ReservarCita from "../pages/CL/CL0007_ReservarCita/CL0007_ReservarCita";

// Empresa pages
import EM0001_Panel from "../pages/EM/EM0001_Panel/EM0001_Panel";
import EM0002_Reservas from "../pages/EM/EM0002_Reservas/EM0002_Reservas";
import EM0003_Perfil from "../pages/EM/EM0003_Perfil/EM0003_Perfil";

// Admin
import AD0001_Panel from "../pages/AD/AD0001_Panel/AD0001_Panel";
import CL0005_NegociosCategoria from "../pages/CL/CL0005_NegociosCategoria/CL0005_NegociosCategoria";
import CL0006_NegocioDetalle from "../pages/CL/CL0006_NegocioDetalle/CL0006_NegocioDetalle";

const AppRouter = () => {
  return (
    <Routes>
      {/* PUBLIC */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Registro />} />

      {/* PROTECTED */}
      <Route element={<ProtectedRoute />}>
        {/* CLIENTE */}
        <Route element={<RoleRoute role="cliente" />}>
          <Route path="/cliente" element={<ClienteLayout />}>
            <Route index element={<CL0001_Home />} />
            <Route path="home" element={<CL0001_Home />} />
            <Route path="reservas" element={<CL0002_Reservas />} />
            <Route path="favoritos" element={<CL0003_Favoritos />} />
            <Route path="perfil" element={<CL0004_Perfil />} />
            <Route
              path="categoria/:categoriaId"
              element={<CL0005_NegociosCategoria />}
            />
            <Route
              path="negocio/:negocioId"
              element={<CL0006_NegocioDetalle />}
            />
            <Route
              path="reservar/:negocioId/:servicioId"
              element={<CL0007_ReservarCita />}
            />
            <Route
              path="cambiar-hora/:reservaId"
              element={<CL0007_ReservarCita />}
            />
          </Route>
        </Route>

        {/* EMPRESA */}
        <Route element={<RoleRoute role="empresa" />}>
          <Route path="/empresa" element={<EmpresaLayout />}>
            <Route index element={<EM0001_Panel />} />
            <Route path="panel" element={<EM0001_Panel />} />
            <Route path="reservas" element={<EM0002_Reservas />} />
            <Route path="perfil" element={<EM0003_Perfil />} />
          </Route>
        </Route>

        {/* ADMIN */}
        <Route element={<RoleRoute role="admin" />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AD0001_Panel />} />
            <Route path="panel" element={<AD0001_Panel />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRouter;
