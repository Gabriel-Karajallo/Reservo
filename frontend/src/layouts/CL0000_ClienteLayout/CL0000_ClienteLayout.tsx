import { Outlet, NavLink } from "react-router-dom";
import { Home, CalendarDays, Star, User } from "lucide-react";

const CL0000_ClienteLayout = () => {
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Barra superior */}
      <header className="w-full h-14 bg-[#1F2A44] flex items-center justify-center">
        <img src="/titulo.png" alt="Reservo" className="h-6 opacity-90" />
      </header>

      {/* Contenido dinámico */}
      <main className="flex-1 overflow-y-auto px-4 pt-4 pb-20">
        <Outlet />
      </main>

      {/* Barra inferior de navegación */}
      <nav className="w-full bg-white border-t border-gray-200">
        <div className="flex justify-around py-2">
          <NavLink
            to="/cliente/home"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 text-xs ${
                isActive ? "text-[#1F2A44] font-medium" : "text-gray-400"
              }`
            }
          >
            <Home size={22} />
            <span>Inicio</span>
          </NavLink>

          <NavLink
            to="/cliente/reservas"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 text-xs ${
                isActive ? "text-[#0B3C3D] font-medium" : "text-gray-400"
              }`
            }
          >
            <CalendarDays size={22} />
            <span>Reservas</span>
          </NavLink>

          <NavLink
            to="/cliente/favoritos"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 text-xs ${
                isActive ? "text-[#0B3C3D] font-medium" : "text-gray-400"
              }`
            }
          >
            <Star size={22} />
            <span>Favoritos</span>
          </NavLink>

          <NavLink
            to="/cliente/perfil"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 text-xs ${
                isActive ? "text-[#0B3C3D] font-medium" : "text-gray-400"
              }`
            }
          >
            <User size={22} />
            <span>Perfil</span>
          </NavLink>
        </div>
      </nav>
    </div>
  );
};

export default CL0000_ClienteLayout;
