import { Outlet, NavLink } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../services/firebase/firebaseConfig";
import {
  LayoutDashboard,
  CalendarDays,
  Store,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

const EM0000_EmpresaLayout = () => {
  const textoSidebar = `
  whitespace-nowrap
  transition-all
  duration-300
  ease-in-out
  overflow-hidden
`;
  const [sidebarAbierta, setSidebarAbierta] = useState(true);

  const cerrarSesion = async () => {
    await signOut(auth);
  };

  const anchoSidebar = sidebarAbierta ? "w-64" : "w-20";

  const linkBase =
    "flex items-center gap-3 px-3 py-2 rounded transition-colors duration-200 hover:bg-[#2A3658]";
  const linkActivo = "bg-[#2A3658]";

  return (
    <div className="h-screen flex flex-col bg-gray-100 font-sans">
      {/* HEADER */}
      <header className="h-16 flex items-center px-6 bg-[#1F2A44] border-b border-[#2A3658]">
        <img src="../titulo.png" alt="Reservo" className="h-8 object-contain" />
      </header>

      {/* CUERPO */}
      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR */}
        <aside
          className={`${anchoSidebar} bg-[#1F2A44] text-white transition-all duration-300`}
        >
          <div className="flex flex-col h-full">
            {/* NAV ARRIBA */}
            <nav className="px-3 pt-4 flex flex-col gap-1 text-sm">
              <NavLink
                to="/empresa/reservas"
                className={({ isActive }) =>
                  `${linkBase} ${isActive ? linkActivo : ""}`
                }
              >
                <CalendarDays size={18} />
                {sidebarAbierta && (
                  <span
                    className={`
    ${textoSidebar}
    ${
      sidebarAbierta
        ? "opacity-100 max-w-[200px] translate-x-0 ml-1"
        : "opacity-0 max-w-0 -translate-x-2 ml-0 pointer-events-none"
    }
  `}
                  >
                    Reservas
                  </span>
                )}
              </NavLink>

              <NavLink
                to="/empresa/perfil"
                className={({ isActive }) =>
                  `${linkBase} ${isActive ? linkActivo : ""}`
                }
              >
                <Store size={18} />
                {sidebarAbierta && (
                  <span
                    className={`
    ${textoSidebar}
    ${
      sidebarAbierta
        ? "opacity-100 max-w-[200px] translate-x-0 ml-1"
        : "opacity-0 max-w-0 -translate-x-2 ml-0 pointer-events-none"
    }
  `}
                  >
                    Perfil
                  </span>
                )}
              </NavLink>

              <NavLink
                to="/empresa/panel"
                className={({ isActive }) =>
                  `${linkBase} ${isActive ? linkActivo : ""}`
                }
              >
                <LayoutDashboard size={18} />
                {sidebarAbierta && (
                  <span
                    className={`
    ${textoSidebar}
    ${
      sidebarAbierta
        ? "opacity-100 max-w-[200px] translate-x-0 ml-1"
        : "opacity-0 max-w-0 -translate-x-2 ml-0 pointer-events-none"
    }
  `}
                  >
                    Estadísticas
                  </span>
                )}
              </NavLink>
            </nav>

            {/* FOOTER ABAJO */}
            <div className="mt-auto px-3 pb-4 flex flex-col gap-2">
              {/* TOGGLE SIDEBAR */}
              <button
                onClick={() => setSidebarAbierta(!sidebarAbierta)}
                className="flex items-center gap-3 px-3 py-2 rounded"
              >
                {sidebarAbierta ? <ChevronLeft /> : <ChevronRight />}
              </button>

              {/* LOGOUT */}
              <button
                onClick={cerrarSesion}
                className="flex items-center gap-3 px-3 py-2 rounded hover:bg-[#2A3658]"
              >
                <LogOut size={18} />
                {sidebarAbierta && (
                  <span
                    className={`
    ${textoSidebar}
    ${
      sidebarAbierta
        ? "opacity-100 max-w-[200px] translate-x-0 ml-1"
        : "opacity-0 max-w-0 -translate-x-2 ml-0 pointer-events-none"
    }
  `}
                  >
                    Salir
                  </span>
                )}
              </button>
            </div>
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
