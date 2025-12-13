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

  /* =========================
     RENDER
  ========================== */
  return (
    <section className="bg-white p-6 rounded-lg shadow-sm">
      {/* CABECERA */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Horarios</h2>

        {!enEdicion && (
          <button
            onClick={() =>
              setHorariosEditando(structuredClone(horariosActuales))
            }
            className="text-[#0f6f63]"
          >
            <Icons.edit size={18} />
          </button>
        )}
      </div>

      {/* LISTADO */}
      <div className="space-y-4">
        {diasSemana.map(({ key, label }) => {
          const dia = horarios[key];
          const tramo = dia.tramos[0];

          return (
            <div
              key={key}
              className="flex items-center gap-4 border rounded p-3"
            >
              <div className="w-32 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={dia.activo}
                  disabled={!enEdicion}
                  onChange={() => toggleDiaActivo(key)}
                />
                <span>{label}</span>
              </div>

              {dia.activo && tramo ? (
                <>
                  <input
                    type="time"
                    value={tramo.inicio}
                    disabled={!enEdicion}
                    onChange={(e) => cambiarHora(key, "inicio", e.target.value)}
                    className="border rounded px-2 py-1"
                  />

                  <span>—</span>

                  <input
                    type="time"
                    value={tramo.fin}
                    disabled={!enEdicion}
                    onChange={(e) => cambiarHora(key, "fin", e.target.value)}
                    className="border rounded px-2 py-1"
                  />
                </>
              ) : (
                <span className="text-gray-400 text-sm">Cerrado</span>
              )}
            </div>
          );
        })}
      </div>

      {/* ACCIONES */}
      {enEdicion && (
        <div className="flex gap-2 mt-6">
          <button
            onClick={() => {
              if (!horariosEditando) return;

              onGuardar(horariosEditando);
              setHorariosActuales(horariosEditando);
              setHorariosEditando(null);
            }}
            className="px-4 py-2 rounded bg-[#0f6f63] text-white text-sm"
          >
            Guardar horarios
          </button>

          <button
            onClick={() => setHorariosEditando(null)}
            className="px-4 py-2 rounded border text-sm"
          >
            Cancelar
          </button>
        </div>
      )}
    </section>
  );
};

export default EM0003_Horarios;
