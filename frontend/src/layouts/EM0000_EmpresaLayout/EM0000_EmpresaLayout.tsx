import { Outlet, NavLink } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../services/firebase/firebaseConfig";
import { LayoutDashboard, CalendarDays, Store, LogOut } from "lucide-react";

const EM0000_EmpresaLayout = () => {
  const cerrarSesion = async () => {
    await signOut(auth);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100 font-sans">
      {/* HEADER */}
      <header className="h-16 flex items-center px-6 bg-[#0f6f63] border-b border-[#0c5c52]">
        <img src="../titulo.png" alt="Reservo" className="h-8 object-contain" />
      </header>

      {/* CUERPO */}
      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR */}
        <aside className="w-64 bg-[#0f6f63] flex flex-col justify-between text-white">
          <nav className="p-4 flex flex-col gap-1 text-md">
            <NavLink
              to="/empresa/panel"
              className="flex items-center gap-3 px-3 py-2 rounded hover:bg-[#0c5c52]"
            >
              <LayoutDashboard size={18} />
              Panel
            </NavLink>

            <NavLink
              to="/empresa/reservas"
              className="flex items-center gap-3 px-3 py-2 rounded hover:bg-[#0c5c52]"
            >
              <CalendarDays size={18} />
              Reservas
            </NavLink>

            <NavLink
              to="/empresa/perfil"
              className="flex items-center gap-3 px-3 py-2 rounded hover:bg-[#0c5c52]"
            >
              <Store size={18} />
              Perfil
            </NavLink>
          </nav>

          <div className="p-4 border-t border-[#0c5c52]">
            <button
              onClick={cerrarSesion}
              className="flex items-center gap-3 px-3 py-2 w-full rounded hover:bg-[#0c5c52] text-sm"
            >
              <LogOut size={18} />
              Cerrar sesión
            </button>
          </div>
        </aside>

        {/* CONTENIDO */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default EM0000_EmpresaLayout;
