import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";

/* =====================
   MOCK SERVICIO (luego Firebase)
====================== */
const servicioMock = {
  nombre: "Corte de Cabello",
  duracion: 30,
  precio: 14,
};

const CL0007_ReservarCita = () => {
  const navigate = useNavigate();
  const { negocioId, servicioId } = useParams();

  /* =====================
     CALENDARIO
  ====================== */
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const [mesActual, setMesActual] = useState<Date>(
    new Date(hoy.getFullYear(), hoy.getMonth(), 1)
  );

  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date | null>(hoy);

  const obtenerDiasMes = () => {
    const dias: (Date | null)[] = [];
    const primerDia = new Date(
      mesActual.getFullYear(),
      mesActual.getMonth(),
      1
    );
    const ultimoDia = new Date(
      mesActual.getFullYear(),
      mesActual.getMonth() + 1,
      0
    );

    // Ajuste europeo: lunes = 0, domingo = 6
    const diaSemana = primerDia.getDay() === 0 ? 6 : primerDia.getDay() - 1;

    for (let i = 0; i < diaSemana; i++) {
      dias.push(null);
    }

    for (let d = 1; d <= ultimoDia.getDate(); d++) {
      dias.push(new Date(mesActual.getFullYear(), mesActual.getMonth(), d));
    }

    return dias;
  };

  const esDiaPasado = (dia: Date) => {
    const d = new Date(dia);
    d.setHours(0, 0, 0, 0);
    return d < hoy;
  };
  const esDomingo = (dia: Date) => dia.getDay() === 0;

  const diasMes = obtenerDiasMes();

  /* =====================
     HORAS (mock)
  ====================== */
  const horasMock = ["17:00", "17:30", "18:00", "18:30"];
  const [horaSeleccionada, setHoraSeleccionada] = useState<string | null>(null);

  const formatearFecha = (fecha: Date) =>
    fecha.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full bg-gray-100 active:scale-95 transition"
        >
          <ArrowLeft size={20} />
        </button>

        <h1 className="text-lg font-semibold text-gray-800">
          Reserva una cita
        </h1>
      </div>

      {/* Info selección */}
      <div className="bg-white border rounded-xl p-4 text-sm text-gray-600">
        <p>
          <strong>Negocio:</strong> {negocioId}
        </p>
        <p>
          <strong>Servicio:</strong> {servicioId}
        </p>
      </div>

      {/* Calendario Booksy-like */}
      <div className="bg-white border rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() =>
              setMesActual(
                new Date(mesActual.getFullYear(), mesActual.getMonth() - 1, 1)
              )
            }
            className="px-2 text-lg"
          >
            ‹
          </button>

          <p className="font-medium text-gray-800 capitalize">
            {mesActual.toLocaleDateString("es-ES", {
              month: "long",
              year: "numeric",
            })}
          </p>

          <button
            onClick={() =>
              setMesActual(
                new Date(mesActual.getFullYear(), mesActual.getMonth() + 1, 1)
              )
            }
            className="px-2 text-lg"
          >
            ›
          </button>
        </div>

        <div className="grid grid-cols-7 text-center text-xs text-gray-400 mb-2">
          {["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"].map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-y-2 text-center">
          {diasMes.map((dia, idx) =>
            dia ? (
              <button
                key={idx}
                disabled={esDiaPasado(dia) || esDomingo(dia)}
                onClick={() => {
                  setFechaSeleccionada(dia);
                  setHoraSeleccionada(null);
                }}
                className={`h-9 rounded-full text-sm transition
    ${
      esDiaPasado(dia) || esDomingo(dia)
        ? "text-gray-300 cursor-not-allowed"
        : fechaSeleccionada?.toDateString() === dia.toDateString()
        ? "bg-[#0f6f63] text-white"
        : "text-gray-800 hover:bg-gray-100"
    }`}
              >
                {dia.getDate()}
              </button>
            ) : (
              <div key={idx} />
            )
          )}
        </div>
      </div>

      {/* Horas */}
      {fechaSeleccionada && (
        <div className="bg-white border rounded-xl p-4">
          <p className="text-sm font-medium text-gray-700 mb-3">
            Horas disponibles
          </p>

          <div className="flex gap-3 overflow-x-auto no-scrollbar">
            {horasMock.map((hora) => {
              const activa = horaSeleccionada === hora;

              return (
                <button
                  key={hora}
                  onClick={() => setHoraSeleccionada(hora)}
                  className={`min-w-[90px] py-3 rounded-full border text-sm font-medium transition
                    ${
                      activa
                        ? "bg-[#0f6f63] text-white border-[#0f6f63]"
                        : "bg-white text-gray-700 border-gray-200"
                    }`}
                >
                  {hora}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Resumen Booksy */}
      {fechaSeleccionada && horaSeleccionada && (
        <div className="bg-white border rounded-xl p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium text-gray-800">{servicioMock.nombre}</p>
              <p className="text-sm text-gray-500">
                {horaSeleccionada} · {servicioMock.duracion} min
              </p>
              <p className="text-sm text-gray-500">
                {formatearFecha(fechaSeleccionada)}
              </p>
            </div>

            <p className="font-semibold text-gray-800">
              {servicioMock.precio.toFixed(2)} €
            </p>
          </div>

          <div className="mt-3 border-t pt-3 text-sm text-gray-500">
            Extras disponibles
          </div>
        </div>
      )}

      {/* Confirmar */}
      <button
        disabled={!fechaSeleccionada || !horaSeleccionada}
        className={`mt-2 py-3 rounded-xl text-white font-medium transition
          ${
            fechaSeleccionada && horaSeleccionada
              ? "bg-green-700 active:scale-95"
              : "bg-green-700 opacity-40"
          }`}
      >
        Confirmar reserva
      </button>
    </div>
  );
};

export default CL0007_ReservarCita;
