import { useReservasCliente } from "./useReservasCliente";
import type { Reserva } from "../../../types/firebase";

/* =====================
   TIPOS
===================== */
type EstadoVisual = "proxima" | "finalizada" | "cancelada";

/* =====================
   HELPERS
===================== */
const obtenerEstadoVisual = (reserva: Reserva): EstadoVisual => {
  if (reserva.estado === "cancelada") return "cancelada";

  const ahora = Date.now();
  const fin = reserva.fin.toMillis();

  if (fin < ahora) return "finalizada";

  return "proxima";
};

const formatearFechaReserva = (inicio: Date) => {
  return {
    mes: inicio.toLocaleDateString("es-ES", { month: "long" }),
    dia: inicio.getDate(),
    hora: inicio.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
};

/* =====================
   COMPONENTE
===================== */
const CL0002_Reservas = () => {
  const { reservas, loading } = useReservasCliente();

  if (loading) {
    return <p className="text-center text-gray-400 py-6">Cargando reservas…</p>;
  }

  return (
    <div className="flex flex-col gap-6 px-4 pb-6">
      <h1 className="text-2xl font-semibold text-gray-900">Citas</h1>

      {reservas.length === 0 && (
        <p className="text-sm text-gray-500">Aún no tienes reservas</p>
      )}

      {reservas.map((reserva: Reserva) => {
        const fecha = formatearFechaReserva(reserva.inicio.toDate());
        const estadoVisual = obtenerEstadoVisual(reserva);

        return (
          <div
            key={reserva.id}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex gap-4"
          >
            {/* ================= IZQUIERDA ================= */}
            <div className="flex-1 space-y-2">
              {/* Estado visual */}
              <span
                className={`
    inline-block text-[11px] px-2.5 py-1 rounded-full
    font-medium tracking-wide
    ${
      estadoVisual === "proxima"
        ? "bg-gray-100 text-gray-600"
        : estadoVisual === "finalizada"
        ? "bg-gray-50 text-gray-400"
        : "bg-red-50 text-red-500"
    }
  `}
              >
                {estadoVisual === "proxima" && "Confirmada"}
                {estadoVisual === "finalizada" && "Finalizada"}
                {estadoVisual === "cancelada" && "Cancelada"}
              </span>

              <p className="text-base font-semibold text-gray-900">
                {reserva.nombreServicio}
              </p>

              <p className="text-sm text-gray-500">con Profesional asignado</p>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-6 h-6 bg-gray-200 rounded-full" />
                {reserva.nombreNegocio}
              </div>

              <button
                className="
                  mt-2 bg-[#1f2f4d] text-white
                  text-sm font-medium px-4 py-2
                  rounded-lg transition active:scale-95
                "
              >
                Reservar de nuevo
              </button>
            </div>

            {/* ================= DERECHA ================= */}
            <div className="flex flex-col items-center justify-center border-l pl-4 text-gray-700 min-w-[72px]">
              <span className="text-xs capitalize text-gray-500">
                {fecha.mes}
              </span>
              <span className="text-3xl font-semibold">{fecha.dia}</span>
              <span className="text-sm text-gray-500">{fecha.hora}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CL0002_Reservas;
