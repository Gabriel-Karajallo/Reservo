import { useEffect, useMemo, useState } from "react";
import {
  collection,
  query,
  where,
  doc,
  updateDoc,
  Timestamp,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../../services/firebase/firebaseConfig";
import type { Reserva } from "../../../types/firebase";
import { useAuth } from "../../../hooks/useAuth";
import { Icons } from "../../../assets/icons";

/* =========================
   TIPOS
========================== */
type ModoModal = "ver" | "cambiarHora" | "confirmarCancelacion";

type ReservaConEstado = Reserva & {
  estadoEfectivo: "confirmada" | "finalizada" | "cancelada";
};

type TramoHorario = {
  inicio: string;
  fin: string;
};

type HorarioDia = {
  activo: boolean;
  tramos: TramoHorario[];
};

type DiaSemana =
  | "lunes"
  | "martes"
  | "miercoles"
  | "jueves"
  | "viernes"
  | "sabado"
  | "domingo";

type HorariosSemana = Record<DiaSemana, HorarioDia | undefined>;

type NegocioConHorarios = {
  horarios: HorariosSemana;
};

/* =========================
   HELPERS
========================== */
const normalizarDiaSemana = (dia: string): DiaSemana =>
  dia
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase() as DiaSemana;

const PIXELES_POR_MINUTO = 2;

/* =========================
   COMPONENTE
========================== */
const EM0002_Reservas = () => {
  const { userData, loading, loadingUserData } = useAuth();

  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [reservas, setReservas] = useState<ReservaConEstado[]>([]);
  const [negocio, setNegocio] = useState<NegocioConHorarios | null>(null);

  const [reservaSeleccionada, setReservaSeleccionada] =
    useState<ReservaConEstado | null>(null);

  const [modoModal, setModoModal] = useState<ModoModal>("ver");
  const [nuevaHora, setNuevaHora] = useState("");
  const [errorSolapamiento, setErrorSolapamiento] = useState("");

  /* =========================
     NEGOCIO (REALTIME)
  ========================== */
  useEffect(() => {
    if (!userData?.negocioId) return;

    const ref = doc(db, "negocios", userData.negocioId);

    const unsubscribe = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setNegocio(snap.data() as NegocioConHorarios);
      }
    });

    return () => unsubscribe();
  }, [userData?.negocioId]);

  /* =========================
     RESERVAS (REALTIME)
  ========================== */
  useEffect(() => {
    if (!userData?.negocioId) return;

    const q = query(
      collection(db, "reservas"),
      where("negocioId", "==", userData.negocioId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ahora = new Date();

      const reservasDia: ReservaConEstado[] = snapshot.docs
        .map((docu) => {
          const reserva = {
            id: docu.id,
            ...docu.data(),
          } as Reserva;

          const fin = new Date(reserva.fin.seconds * 1000);

          let estadoEfectivo = reserva.estado;
          if (reserva.estado === "confirmada" && fin < ahora) {
            estadoEfectivo = "finalizada";
          }

          return { ...reserva, estadoEfectivo };
        })
        .filter((reserva) => {
          const fecha = new Date(reserva.inicio.seconds * 1000);
          return (
            fecha.getFullYear() === fechaSeleccionada.getFullYear() &&
            fecha.getMonth() === fechaSeleccionada.getMonth() &&
            fecha.getDate() === fechaSeleccionada.getDate()
          );
        })
        .sort((a, b) => a.inicio.seconds - b.inicio.seconds);

      setReservas(reservasDia);
    });

    return () => unsubscribe();
  }, [userData?.negocioId, fechaSeleccionada]);

  /* =========================
     HORARIO DEL DÍA
  ========================== */
  const {
    horasDelDia,
    horaInicioMinutos,
    mostrarHoraActual,
    topHoraActual,
    negocioCerrado,
  } = useMemo(() => {
    if (!negocio?.horarios) {
      return {
        horasDelDia: [],
        horaInicioMinutos: 0,
        mostrarHoraActual: false,
        topHoraActual: 0,
        negocioCerrado: true,
      };
    }

    const diaSemana = normalizarDiaSemana(
      fechaSeleccionada.toLocaleDateString("es-ES", { weekday: "long" })
    );

    const horarioDia = negocio.horarios[diaSemana];

    if (!horarioDia || !horarioDia.activo || horarioDia.tramos.length === 0) {
      return {
        horasDelDia: [],
        horaInicioMinutos: 0,
        mostrarHoraActual: false,
        topHoraActual: 0,
        negocioCerrado: true,
      };
    }

    const primerTramo = horarioDia.tramos[0];
    const ultimoTramo = horarioDia.tramos[horarioDia.tramos.length - 1];

    const [hIni, mIni] = primerTramo.inicio.split(":").map(Number);
    const [hFin, mFin] = ultimoTramo.fin.split(":").map(Number);

    const inicioMinutos = hIni * 60 + mIni;
    let finMinutos = hFin * 60 + mFin;

    reservas.forEach((r) => {
      const fin = new Date(r.fin.seconds * 1000);
      const minutosFin = fin.getHours() * 60 + fin.getMinutes();
      if (minutosFin > finMinutos) finMinutos = minutosFin;
    });

    const horas: string[] = [];
    for (let m = inicioMinutos; m <= finMinutos; m += 30) {
      const h = Math.floor(m / 60)
        .toString()
        .padStart(2, "0");
      const min = (m % 60).toString().padStart(2, "0");
      horas.push(`${h}:${min}`);
    }

    const hoy = new Date();
    const esHoy = fechaSeleccionada.toDateString() === hoy.toDateString();

    const topActual = esHoy
      ? (hoy.getHours() * 60 + hoy.getMinutes() - inicioMinutos) *
        PIXELES_POR_MINUTO
      : 0;

    return {
      horasDelDia: horas,
      horaInicioMinutos: inicioMinutos,
      mostrarHoraActual: esHoy,
      topHoraActual: topActual,
      negocioCerrado: false,
    };
  }, [negocio, fechaSeleccionada, reservas]);

  /* =========================
     HELPERS UI
  ========================== */
  const esEditable = (reserva: ReservaConEstado) =>
    reserva.estadoEfectivo === "confirmada";

  const cerrarModal = () => {
    setReservaSeleccionada(null);
    setModoModal("ver");
    setNuevaHora("");
    setErrorSolapamiento("");
  };

  const cambiarDia = (dias: number) => {
    const nuevaFecha = new Date(fechaSeleccionada);
    nuevaFecha.setDate(nuevaFecha.getDate() + dias);
    setFechaSeleccionada(nuevaFecha);
  };

  const calcularTop = (fecha: Date): number =>
    (fecha.getHours() * 60 + fecha.getMinutes() - horaInicioMinutos) *
    PIXELES_POR_MINUTO;

  const calcularAltura = (inicio: Date, fin: Date): number =>
    ((fin.getTime() - inicio.getTime()) / 1000 / 60) * PIXELES_POR_MINUTO;

  /* =========================
     ACCIONES
  ========================== */
  const cancelarReserva = async () => {
    if (!reservaSeleccionada) return;

    await updateDoc(doc(db, "reservas", reservaSeleccionada.id), {
      estado: "cancelada",
      actualizadaEn: Timestamp.now(),
    });

    cerrarModal();
  };

  const guardarNuevaHora = async () => {
    if (!reservaSeleccionada || !nuevaHora) return;

    const inicioActual = new Date(reservaSeleccionada.inicio.seconds * 1000);
    const finActual = new Date(reservaSeleccionada.fin.seconds * 1000);
    const duracionMs = finActual.getTime() - inicioActual.getTime();

    const [h, m] = nuevaHora.split(":").map(Number);

    const nuevoInicio = new Date(fechaSeleccionada);
    nuevoInicio.setHours(h, m, 0, 0);

    const nuevoFin = new Date(nuevoInicio.getTime() + duracionMs);

    const haySolape = reservas.some((r) => {
      if (r.id === reservaSeleccionada.id) return false;
      return (
        nuevoInicio.getTime() < r.fin.seconds * 1000 &&
        nuevoFin.getTime() > r.inicio.seconds * 1000
      );
    });

    if (haySolape) {
      setErrorSolapamiento("Ese horario ya está ocupado.");
      return;
    }

    await updateDoc(doc(db, "reservas", reservaSeleccionada.id), {
      inicio: Timestamp.fromDate(nuevoInicio),
      fin: Timestamp.fromDate(nuevoFin),
      actualizadaEn: Timestamp.now(),
    });

    cerrarModal();
  };

  if (loading || loadingUserData) {
    return <p>Cargando sesión...</p>;
  }

  // region Renderizado
  return (
    <div className="flex flex-col gap-4">
      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-start gap-3 text-sm text-gray-600">
        {/* HOY */}
        <button
          onClick={() => setFechaSeleccionada(new Date())}
          className="flex items-center gap-1 px-2 py-1 rounded-md border border-gray-200 bg-white hover:bg-gray-50 transition"
        >
          <Icons.calendar size={14} />
          <span>Hoy</span>
        </button>

        {/* FLECHAS */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => cambiarDia(-1)}
            className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-200 bg-white hover:bg-gray-50 transition"
            aria-label="Día anterior"
          >
            <Icons.left size={14} />
          </button>

          <button
            onClick={() => cambiarDia(1)}
            className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-200 bg-white hover:bg-gray-50 transition"
            aria-label="Día siguiente"
          >
            <Icons.right size={14} />
          </button>
        </div>

        {/* FECHA (posición fija) */}
        <span className="text-gray-700 capitalize whitespace-nowrap">
          {fechaSeleccionada.toLocaleDateString("es-ES", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </span>
      </div>
      {/* ================= CALENDARIO ================= */}
      <div className="rounded-2xl bg-white h-[calc(100vh-220px)] overflow-hidden">
        {negocioCerrado ? (
          <div className="h-full flex items-center justify-center text-sm text-gray-400">
            El negocio no abre este día
          </div>
        ) : (
          <div className="grid grid-cols-[104px_1fr] h-full">
            {/* ===== COLUMNA HORAS ===== */}
            <div className="bg-gray-50 px-4 pt-4">
              {horasDelDia.map((h, index) => (
                <div
                  key={h}
                  className={`
              h-[60px] flex items-start pt-1 text-[11px]
              ${index % 2 === 0 ? "text-gray-500" : "text-gray-400"}
            `}
                >
                  {h}
                </div>
              ))}
            </div>

            {/* ===== AGENDA ===== */}
            <div className="relative bg-white px-6 pt-4">
              {/* Fondo alterno */}
              {horasDelDia.map((h, index) => (
                <div
                  key={h}
                  className={`
              h-[60px]
              ${index % 2 === 0 ? "bg-gray-50/60" : "bg-white"}
              `}
                />
              ))}

              {/* Línea hora actual */}
              {mostrarHoraActual && (
                <div
                  className="absolute left-0 right-0 h-[2px] bg-[#1F2A44]/70 z-10"
                  style={{ top: topHoraActual + 16 }}
                />
              )}

              {/* ===== RESERVAS ===== */}
              {reservas.map((reserva) => {
                const inicio = new Date(reserva.inicio.seconds * 1000);
                const fin = new Date(reserva.fin.seconds * 1000);

                return (
                  <div
                    key={reserva.id}
                    onClick={() => {
                      setReservaSeleccionada(reserva);
                      setModoModal("ver");
                      setNuevaHora(inicio.toTimeString().slice(0, 5));
                    }}
                    className="
                      absolute left-0 right-0 mx-6
                      
                      p-3 text-sm cursor-pointer
                      bg-[#E8EDFF] hover:bg-[#DDE4FF]
                      transition
                    "
                    style={{
                      top: calcularTop(inicio) + 16,
                      height: calcularAltura(inicio, fin),
                    }}
                  >
                    {/* Barra lateral recta */}
                    <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#1F2A44]" />

                    <p className="font-medium text-[#1F2A44] truncate">
                      {reserva.nombreServicio}
                    </p>
                    <p className="text-xs text-[#1F2A44]/80 truncate">
                      {reserva.nombreCliente}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ================= MODAL ================= */}
      {reservaSeleccionada && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-[1px] flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
            {/* ===== HEADER ===== */}
            <div className="flex items-center justify-between px-6 py-4 bg-[#F4F7FF]">
              <h2 className="text-sm font-semibold text-[#1F2A44]">
                Detalle de la reserva
              </h2>

              <button
                onClick={cerrarModal}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#E6EBFF] transition"
                aria-label="Cerrar"
              >
                <Icons.close size={16} className="text-[#1F2A44]/70" />
              </button>
            </div>

            {/* ===== CONTENIDO ===== */}
            <div className="px-6 py-5 flex flex-col gap-5 text-sm">
              {/* Cliente */}
              <div className="flex items-start gap-3">
                <Icons.user size={16} className="text-[#1F2A44]" />
                <div>
                  <p className="text-xs text-gray-500">Cliente</p>
                  <p className="font-medium text-[#1F2A44]">
                    {reservaSeleccionada.nombreCliente}
                  </p>
                </div>
              </div>

              {/* Servicio */}
              <div className="flex items-start gap-3">
                <Icons.scissors size={16} className="text-[#1F2A44]" />
                <div>
                  <p className="text-xs text-gray-500">Servicio</p>
                  <p className="font-medium text-[#1F2A44]">
                    {reservaSeleccionada.nombreServicio}
                  </p>
                </div>
              </div>

              {/* Horario */}
              <div className="flex items-start gap-3">
                <Icons.clock size={16} className="text-[#1F2A44]" />
                <div>
                  <p className="text-xs text-gray-500">Horario</p>
                  <p className="font-medium text-[#1F2A44]">
                    {new Date(
                      reservaSeleccionada.inicio.seconds * 1000
                    ).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    –{" "}
                    {new Date(
                      reservaSeleccionada.fin.seconds * 1000
                    ).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>

              {/* ===== CAMBIAR HORA ===== */}
              {modoModal === "cambiarHora" && (
                <div className="flex flex-col gap-2 pt-2">
                  <label className="text-xs text-gray-500">
                    Nueva hora de inicio
                  </label>
                  <input
                    type="time"
                    value={nuevaHora}
                    onChange={(e) => setNuevaHora(e.target.value)}
                    className="
                border border-gray-200 rounded-lg px-3 py-2 text-sm
                focus:outline-none focus:ring-2 focus:ring-[#1F2A44]/30
              "
                  />
                  {errorSolapamiento && (
                    <p className="text-red-600 text-xs">{errorSolapamiento}</p>
                  )}
                </div>
              )}

              {/* ===== CONFIRMAR CANCELACIÓN ===== */}
              {modoModal === "confirmarCancelacion" && (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <Icons.trash size={16} />
                  <p>¿Seguro que quieres cancelar esta reserva?</p>
                </div>
              )}

              {/* ===== INFO NO EDITABLE ===== */}
              {modoModal === "ver" && !esEditable(reservaSeleccionada) && (
                <div className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
                  Esta reserva ya no se puede modificar porque ha finalizado.
                </div>
              )}
            </div>

            {/* ===== FOOTER ===== */}
            <div className="flex justify-end gap-2 px-6 py-4 bg-[#F4F7FF]">
              {/* ---- MODO VER ---- */}
              {modoModal === "ver" && (
                <>
                  <button
                    onClick={() => setModoModal("confirmarCancelacion")}
                    disabled={!esEditable(reservaSeleccionada)}
                    className={`px-3 py-1.5 text-sm rounded-md transition ${
                      esEditable(reservaSeleccionada)
                        ? "text-red-600 hover:bg-red-50"
                        : "text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    Cancelar
                  </button>

                  <button
                    onClick={() => setModoModal("cambiarHora")}
                    disabled={!esEditable(reservaSeleccionada)}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${
                      esEditable(reservaSeleccionada)
                        ? "bg-[#1F2A44] text-white hover:bg-[#162036]"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    Cambiar hora
                  </button>
                </>
              )}

              {/* ---- CONFIRMAR CANCELACIÓN ---- */}
              {modoModal === "confirmarCancelacion" && (
                <>
                  <button
                    onClick={() => setModoModal("ver")}
                    className="px-3 py-1.5 rounded-md text-sm hover:bg-gray-200 transition"
                  >
                    No
                  </button>
                  <button
                    onClick={cancelarReserva}
                    className="px-4 py-1.5 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition"
                  >
                    Sí, cancelar
                  </button>
                </>
              )}

              {/* ---- GUARDAR NUEVA HORA ---- */}
              {modoModal === "cambiarHora" && (
                <button
                  onClick={guardarNuevaHora}
                  className="px-4 py-1.5 rounded-md text-sm font-medium bg-[#1F2A44] text-white hover:bg-[#162036] transition"
                >
                  Guardar cambios
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
  // endregion
};

export default EM0002_Reservas;
