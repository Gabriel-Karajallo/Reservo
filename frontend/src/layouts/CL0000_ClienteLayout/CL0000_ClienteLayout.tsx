import { Outlet, NavLink } from "react-router-dom";
import { Home, CalendarDays, Star, User } from "lucide-react";

const CL0000_ClienteLayout = () => {
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Barra superior */}
      <header className="w-full py-3 bg-[#0f6f63] shadow-sm flex justify-center items-center">
        <img src="/titulo.png" alt="Reservo" className="w-40 opacity-90 p-2" />
      </header>

      {/* Contenido dinámico */}
      <main className="flex-1 overflow-y-auto p-4">
        <Outlet />
      </main>

      {/* Barra inferior de navegación */}
      <nav className="w-full border-t bg-white shadow-lg">
        <div className="flex justify-around py-2">
          {/* Inicio */}
          <NavLink
            to="/cliente/home"
            className={({ isActive }) =>
              `flex flex-col items-center text-sm gap-1 ${
                isActive ? "text-[#0f6f63] font-medium" : "text-gray-500"
              }`
            }
          >
            <Home size={22} />
            <span>Inicio</span>
          </NavLink>

          {/* Reservas */}
          <NavLink
            to="/cliente/reservas"
            className={({ isActive }) =>
              `flex flex-col items-center text-sm gap-1 ${
                isActive ? "text-[#0f6f63] font-medium" : "text-gray-500"
              }`
            }
          >
            <CalendarDays size={22} />
            <span>Reservas</span>
          </NavLink>

          {/* Favoritos */}
          <NavLink
            to="/cliente/favoritos"
            className={({ isActive }) =>
              `flex flex-col items-center text-sm gap-1 ${
                isActive ? "text-[#0f6f63] font-medium" : "text-gray-500"
              }`
            }
          >
            <Star size={22} />
            <span>Favoritos</span>
          </NavLink>

          {/* Perfil */}
          <NavLink
            to="/cliente/perfil"
            className={({ isActive }) =>
              `flex flex-col items-center text-sm gap-1 ${
                isActive ? "text-[#0f6f63] font-medium" : "text-gray-500"
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
