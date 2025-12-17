import { Search } from "lucide-react";
import { useCategorias } from "../../../hooks/useCategorias";
import { useReservaActiva } from "../../../hooks/useReservaActiva";
import { useUltimaReserva } from "../../../hooks/useUltimaReserva";
import type { Categoria, Reserva } from "../../../types/firebase";
import { useNavigate } from "react-router-dom";
import { doc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "../../../services/firebase/firebaseConfig";

/* =====================
   HELPERS
===================== */
const formatearFechaHora = (reserva: Reserva) => {
  const fecha = reserva.inicio.toDate().toLocaleDateString();
  const hora = reserva.inicio.toDate().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${fecha} · ${hora}`;
};

/* =====================
   COMPONENTE
===================== */
const CL0001_Home = () => {
  const { categorias, loading: loadingCategorias } = useCategorias();
  const { reservaActiva, loading: loadingActiva } = useReservaActiva();
  const { ultimaReserva, loading: loadingUltima } = useUltimaReserva();
  const navigate = useNavigate();

  /* =====================
     CANCELAR RESERVA
  ====================== */
  const cancelarReserva = async (reserva: Reserva) => {
    const confirmar = window.confirm(
      "¿Seguro que quieres cancelar la reserva?"
    );
    if (!confirmar) return;

    const ref = doc(db, "reservas", reserva.id);

    await updateDoc(ref, {
      estado: "cancelada",
      actualizadaEn: Timestamp.now(),
    });
  };

  //region renderizado
  return (
    <div className="flex flex-col gap-6">
      {/* Buscador */}
      <div className="bg-white rounded-2xl px-4 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Search className="text-gray-400" size={22} />
          <input
            type="text"
            placeholder="Buscar servicios o negocios"
            className="w-full text-base outline-none placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Categorías */}
      <div>
        <h2 className="text-base font-semibold mb-3 text-gray-800">
          Categorías
        </h2>

        <div className="flex gap-4 overflow-x-auto no-scrollbar">
          {loadingCategorias && (
            <span className="text-gray-400">Cargando categorías…</span>
          )}

          {!loadingCategorias &&
            categorias.map((c: Categoria) => (
              <button
                key={c.id}
                onClick={() => navigate(`/cliente/categoria/${c.id}`)}
                className="flex flex-col items-center min-w-[72px] active:scale-95 transition"
              >
                {/* CÍRCULO */}
                <div
                  className="
            w-16 h-16
            rounded-full
            bg-white
            shadow-sm
            flex items-center justify-center
            mb-2
          "
                >
                  <img
                    src={`/categorias/${c.icono}`}
                    alt={c.nombre}
                    className="w-8 h-8 object-contain"
                  />
                </div>

                {/* TEXTO */}
                <span className="text-xs font-medium text-gray-700 text-center leading-tight">
                  {c.nombre}
                </span>
              </button>
            ))}
        </div>
      </div>

      {/* Reserva activa */}
      {!loadingActiva && reservaActiva && (
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          {/* Imagen */}
          <div className="h-36 bg-gray-200" />

          {/* Contenido */}
          <div className="p-4">
            <p className="text-sm text-gray-500 mb-1">Tu próxima cita</p>

            <h3 className="text-lg font-semibold">
              {reservaActiva.nombreServicio}
            </h3>

            <p className="text-sm text-gray-600">
              {reservaActiva.nombreNegocio}
            </p>

            <p className="text-sm text-gray-500 mt-1">
              {formatearFechaHora(reservaActiva)}
            </p>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() =>
                  navigate(`/cliente/cambiar-hora/${reservaActiva.id}`)
                }
                className="flex-1 bg-gray-100 py-2 rounded-lg text-sm font-medium"
              >
                Cambiar
              </button>

              <button
                onClick={() => cancelarReserva(reservaActiva)}
                className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg text-sm font-medium"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Última reserva */}
      {!loadingUltima && !reservaActiva && ultimaReserva && (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
          <h3 className="text-md font-semibold text-gray-800 mb-3">
            Tu última reserva
          </h3>

          <div className="flex gap-4">
            <div className="w-20 h-20 bg-gray-200 rounded-lg" />

            <div className="flex-1 text-gray-700">
              <p className="font-semibold">{ultimaReserva.nombreNegocio}</p>
              <p className="text-sm">{ultimaReserva.nombreServicio}</p>
              <p className="text-sm text-gray-500">
                {formatearFechaHora(ultimaReserva)}
              </p>
            </div>
          </div>

          <button
            onClick={() =>
              navigate(`/cliente/negocio/${ultimaReserva.negocioId}`)
            }
            className="
              bg-[#0f6f63]
              text-white
              py-2.5
              rounded-xl
              text-sm
              font-medium
              mt-4
              transition
              active:scale-95
            "
          >
            Reservar de nuevo
          </button>
        </div>
      )}

      <div className="text-center text-gray-400 text-sm py-8">
        Pronto verás sugerencias según tus reservas
      </div>

      {/* Sin reservas */}
      {!loadingActiva && !loadingUltima && !reservaActiva && !ultimaReserva && (
        <div className="text-center text-gray-500 mt-8">
          <p className="text-sm text-gray-400">Aún no tienes reservas</p>
          <p className="text-sm font-medium mt-1 text-gray-700">
            Encuentra tu próximo servicio en Reservo
          </p>
        </div>
      )}
    </div>
  );
  //endregion
};

export default CL0001_Home;
