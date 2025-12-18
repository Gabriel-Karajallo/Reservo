import { useEffect, useState } from "react";
import type { HorariosSemana, HorarioDia } from "../../../types/firebase";
import { Icons } from "../../../assets/icons";

interface Props {
  horariosIniciales: HorariosSemana;
  onGuardar: (horarios: HorariosSemana) => void;
}

/* =========================
   CONSTANTES
========================== */
const diasSemana: {
  key: keyof HorariosSemana;
  label: string;
}[] = [
  { key: "lunes", label: "Lunes" },
  { key: "martes", label: "Martes" },
  { key: "miercoles", label: "Miércoles" },
  { key: "jueves", label: "Jueves" },
  { key: "viernes", label: "Viernes" },
  { key: "sabado", label: "Sábado" },
  { key: "domingo", label: "Domingo" },
];

const diaCerrado: HorarioDia = {
  activo: false,
  tramos: [],
};

/* =========================
   NORMALIZADOR
========================== */
const normalizarHorarios = (
  horarios?: Partial<HorariosSemana>
): HorariosSemana => ({
  lunes: horarios?.lunes ?? { ...diaCerrado },
  martes: horarios?.martes ?? { ...diaCerrado },
  miercoles: horarios?.miercoles ?? { ...diaCerrado },
  jueves: horarios?.jueves ?? { ...diaCerrado },
  viernes: horarios?.viernes ?? { ...diaCerrado },
  sabado: horarios?.sabado ?? { ...diaCerrado },
  domingo: horarios?.domingo ?? { ...diaCerrado },
});

const EM0003_Horarios = ({ horariosIniciales, onGuardar }: Props) => {
  /* =========================
     ESTADO
  ========================== */
  const [horariosActuales, setHorariosActuales] = useState<HorariosSemana>(() =>
    normalizarHorarios(horariosIniciales)
  );

  const [horariosEditando, setHorariosEditando] =
    useState<HorariosSemana | null>(null);

  const enEdicion = horariosEditando !== null;
  const horarios = horariosEditando ?? horariosActuales;

  /* =========================
     SINCRONIZAR PROPS
  ========================== */
  useEffect(() => {
    setHorariosActuales(normalizarHorarios(horariosIniciales));
  }, [horariosIniciales]);

  /* =========================
     HANDLERS
  ========================== */
  const toggleDiaActivo = (dia: keyof HorariosSemana) => {
    if (!horariosEditando) return;

    setHorariosEditando((prev) => {
      if (!prev) return prev;

      const activo = !prev[dia].activo;

      return {
        ...prev,
        [dia]: {
          activo,
          tramos: activo ? [{ inicio: "09:00", fin: "14:00" }] : [],
        },
      };
    });
  };

  const cambiarHora = (
    dia: keyof HorariosSemana,
    campo: "inicio" | "fin",
    valor: string
  ) => {
    if (!horariosEditando) return;

    setHorariosEditando((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        [dia]: {
          ...prev[dia],
          tramos: [
            {
              ...(prev[dia].tramos[0] ?? { inicio: "09:00", fin: "14:00" }),
              [campo]: valor,
            },
          ],
        },
      };
    });
  };

  // horas
  const generarHoras = () => {
    const horas: string[] = [];
    for (let h = 6; h <= 22; h++) {
      for (const m of [0, 15, 30, 45]) {
        horas.push(
          `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
        );
      }
    }
    return horas;
  };

  const horasDisponibles = generarHoras();
  const [selectorAbierto, setSelectorAbierto] = useState<{
    dia: string;
    tipo: "inicio" | "fin";
  } | null>(null);

  /* =========================
     RENDER
  ========================== */
  return (
    <section className="bg-white rounded-2xl shadow-sm p-8 flex flex-col">
      {/* ================= CABECERA ================= */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Horarios</h2>

        {!enEdicion && (
          <button
            onClick={() =>
              setHorariosEditando(structuredClone(horariosActuales))
            }
            className="text-gray-400 hover:text-[#1F2A44] transition"
          >
            <Icons.edit size={18} />
          </button>
        )}
      </div>

      {/* ================= LISTADO ================= */}
      <div className="space-y-3">
        {diasSemana.map(({ key, label }) => {
          const dia = horarios[key];
          const tramo = dia.tramos[0];

          return (
            <div
              key={key}
              className="relative flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3"
            >
              {/* DÍA */}
              <div className="flex items-center gap-3 min-w-[140px]">
                <button
                  disabled={!enEdicion}
                  onClick={() => toggleDiaActivo(key)}
                  className={`w-5 h-5 rounded-md flex items-center justify-center border transition
                  ${
                    dia.activo
                      ? "bg-[#1F2A44]/80 border-[#1F2A44]"
                      : "bg-white border-gray-300"
                  }
                `}
                >
                  {dia.activo && (
                    <Icons.check size={14} className="text-white" />
                  )}
                </button>

                <span className="text-sm font-medium text-gray-900">
                  {label}
                </span>
              </div>

              {/* HORAS */}
              {dia.activo && tramo ? (
                <div className="flex items-center gap-3">
                  {/* INICIO */}
                  <div className="relative">
                    <button
                      disabled={!enEdicion}
                      onClick={() =>
                        setSelectorAbierto(
                          selectorAbierto?.dia === key &&
                            selectorAbierto.tipo === "inicio"
                            ? null
                            : { dia: key, tipo: "inicio" }
                        )
                      }
                      className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50"
                    >
                      {tramo.inicio}
                      <Icons.clock size={14} className="text-gray-400" />
                    </button>

                    {selectorAbierto?.dia === key &&
                      selectorAbierto.tipo === "inicio" && (
                        <div className="absolute z-50 mt-2 w-28 rounded-xl border border-gray-200 bg-white shadow-lg max-h-48 overflow-y-auto">
                          {horasDisponibles.map((hora) => (
                            <button
                              key={hora}
                              onClick={() => {
                                cambiarHora(key, "inicio", hora);
                                setSelectorAbierto(null);
                              }}
                              className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100"
                            >
                              {hora}
                            </button>
                          ))}
                        </div>
                      )}
                  </div>

                  <span className="text-gray-400">—</span>

                  {/* FIN */}
                  <div className="relative">
                    <button
                      disabled={!enEdicion}
                      onClick={() =>
                        setSelectorAbierto(
                          selectorAbierto?.dia === key &&
                            selectorAbierto.tipo === "fin"
                            ? null
                            : { dia: key, tipo: "fin" }
                        )
                      }
                      className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50"
                    >
                      {tramo.fin}
                      <Icons.clock size={14} className="text-gray-400" />
                    </button>

                    {selectorAbierto?.dia === key &&
                      selectorAbierto.tipo === "fin" && (
                        <div className="absolute z-50 mt-2 w-28 rounded-xl border border-gray-200 bg-white shadow-lg max-h-48 overflow-y-auto">
                          {horasDisponibles.map((hora) => (
                            <button
                              key={hora}
                              onClick={() => {
                                cambiarHora(key, "fin", hora);
                                setSelectorAbierto(null);
                              }}
                              className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100"
                            >
                              {hora}
                            </button>
                          ))}
                        </div>
                      )}
                  </div>
                </div>
              ) : (
                <span className="text-xs font-medium text-gray-400 bg-white border border-gray-200 rounded-lg px-3 py-1.5">
                  Cerrado
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* ================= ACCIONES ================= */}
      {enEdicion && (
        <div className="flex gap-3 mt-8">
          <button
            onClick={() => {
              if (!horariosEditando) return;

              onGuardar(horariosEditando);
              setHorariosActuales(horariosEditando);
              setHorariosEditando(null);
              setSelectorAbierto(null);
            }}
            className="bg-[#1F2A44]/90 text-white px-5 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition"
          >
            Guardar horarios
          </button>

          <button
            onClick={() => {
              setHorariosEditando(null);
              setSelectorAbierto(null);
            }}
            className="px-5 py-2 rounded-lg text-sm border border-gray-300 hover:bg-gray-50 transition"
          >
            Cancelar
          </button>
        </div>
      )}
    </section>
  );
};

export default EM0003_Horarios;
