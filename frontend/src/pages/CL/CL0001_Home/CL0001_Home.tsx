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

  return (
    <div className="flex flex-col gap-6">
      {/* Buscador */}
      <div className="flex items-center bg-gray-100 shadow-sm rounded-xl px-4 py-3 border border-gray-200">
        <Search className="text-gray-500" size={20} />
        <input
          type="text"
          placeholder="Buscar negocios o servicios..."
          className="ml-3 w-full outline-none text-gray-700 bg-transparent"
        />
      </div>

      {/* Categorías */}
      <div>
        <h2 className="text-lg font-semibold mb-3 text-gray-800">Categorías</h2>

        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          {loadingCategorias && (
            <span className="text-gray-400">Cargando categorías…</span>
          )}

          {!loadingCategorias &&
            categorias.map((c: Categoria) => (
              <div
                key={c.id}
                onClick={() => navigate(`/cliente/categoria/${c.id}`)}
                className="flex flex-col items-center bg-white border border-gray-200 shadow-sm px-4 py-5 rounded-xl min-w-[95px] h-[120px] justify-center transition active:scale-95"
              >
                <img
                  src={`/categorias/${c.icono}`}
                  alt={c.nombre}
                  className="h-10 w-10 object-contain mb-2"
                />
                <span className="text-sm font-medium text-gray-700 text-center">
                  {c.nombre}
                </span>
              </div>
            ))}
        </div>
      </div>

      {/* Reserva activa */}
      {!loadingActiva && reservaActiva && (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
          <h3 className="text-md font-semibold text-green-700 mb-3">
            Tu reserva activa
          </h3>

          <div className="flex gap-4">
            {/* Foto futura */}
            <div className="w-20 h-20 bg-gray-200 rounded-lg" />

            <div className="flex-1 text-gray-700">
              <p className="font-semibold">{reservaActiva.nombreNegocio}</p>
              <p className="text-sm">{reservaActiva.nombreServicio}</p>
              <p className="text-sm text-gray-500">
                {formatearFechaHora(reservaActiva)}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-4">
            <button
              className="bg-gray-200 text-gray-800 py-2 rounded-lg shadow-sm active:scale-95 transition"
              onClick={() =>
                navigate(`/cliente/cambiar-hora/${reservaActiva.id}`)
              }
            >
              Cambiar hora
            </button>

            <button
              onClick={() => cancelarReserva(reservaActiva)}
              className="bg-red-100 text-red-700 py-2 rounded-lg shadow-sm active:scale-95 transition"
            >
              Cancelar reserva
            </button>
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
            className="bg-green-700 text-white py-2 rounded-lg w-full mt-4 shadow-sm active:scale-95 transition"
          >
            Reservar de nuevo
          </button>
        </div>
      )}

      {/* Sin reservas */}
      {!loadingActiva && !loadingUltima && !reservaActiva && !ultimaReserva && (
        <div className="text-center text-gray-500 mt-8">
          <p className="text-sm">Aún no has reservado nada</p>
          <p className="text-sm font-medium mt-1">
            ¡Encuentra tu estilo con Reservo!
          </p>
        </div>
      )}
    </div>
  );
};

export default CL0001_Home;
