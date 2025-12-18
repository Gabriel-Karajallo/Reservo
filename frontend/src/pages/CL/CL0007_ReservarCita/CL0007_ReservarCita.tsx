import { useNavigate, useParams } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import { useNegocio } from "../../../hooks/useNegocio";
import { useServiciosPorNegocio } from "../../../hooks/useServiciosPorNegocio";
import {
  addDoc,
  collection,
  Timestamp,
  serverTimestamp,
  doc,
  getDoc,
  updateDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../../../services/firebase/firebaseConfig";
import { auth } from "../../../services/firebase/firebaseConfig";
import type { Reserva } from "../../../types/firebase";
import { Icons } from "../../../assets/icons";

/* =====================
   HELPERS
===================== */
const construirFechaHora = (fecha: Date, hora: string): Date => {
  const [h, m] = hora.split(":").map(Number);
  const d = new Date(fecha);
  d.setHours(h, m, 0, 0);
  return d;
};

const formatearHora = (date: Date): string => {
  const h = date.getHours().toString().padStart(2, "0");
  const m = date.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
};

type DiaSemanaKey =
  | "lunes"
  | "martes"
  | "miercoles"
  | "jueves"
  | "viernes"
  | "sabado"
  | "domingo";

const normalizarDiaSemana = (dia: string): DiaSemanaKey =>
  dia
    .replace("á", "a")
    .replace("é", "e")
    .replace("í", "i")
    .replace("ó", "o")
    .replace("ú", "u") as DiaSemanaKey;

const sumarMinutos = (hora: string, minutos: number): string => {
  const [h, m] = hora.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m + minutos, 0, 0);
  return formatearHora(d);
};

const generarHorasDisponibles = (
  tramos: { inicio: string; fin: string }[],
  duracion: number
): string[] => {
  const horas: string[] = [];

  tramos.forEach(({ inicio, fin }) => {
    let actual = inicio;
    while (sumarMinutos(actual, duracion) <= fin) {
      horas.push(actual);
      actual = sumarMinutos(actual, duracion);
    }
  });

  return horas;
};

const haySolape = (
  inicioA: Date,
  finA: Date,
  inicioB: Date,
  finB: Date
): boolean => {
  return inicioA < finB && inicioB < finA;
};

const esHoy = (fecha: Date): boolean => {
  const ahora = new Date();
  return (
    fecha.getFullYear() === ahora.getFullYear() &&
    fecha.getMonth() === ahora.getMonth() &&
    fecha.getDate() === ahora.getDate()
  );
};

const obtenerHoraMinimaHoy = (duracion: number): Date => {
  const ahora = new Date();
  const minutos = ahora.getMinutes();
  const resto = minutos % duracion;

  if (resto !== 0) {
    ahora.setMinutes(minutos + (duracion - resto));
  }

  ahora.setSeconds(0, 0);
  return ahora;
};

/* =====================
   COMPONENTE
===================== */
const CL0007_ReservarCita = () => {
  const navigate = useNavigate();
  const { negocioId, servicioId, reservaId } = useParams();
  const esCambioHora = Boolean(reservaId);

  /* =====================
     FECHA BASE
  ===================== */
  const hoy = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  /* =====================
     ESTADOS
  ===================== */
  const [reservaOriginal, setReservaOriginal] = useState<Reserva | null>(null);
  const [mesActual, setMesActual] = useState(
    new Date(hoy.getFullYear(), hoy.getMonth(), 1)
  );
  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date>(hoy);
  const [horaSeleccionada, setHoraSeleccionada] = useState<string | null>(null);
  const [reservasDia, setReservasDia] = useState<Reserva[]>([]);

  /* =====================
     CARGAR RESERVA ORIGINAL
  ===================== */
  useEffect(() => {
    const cargarReserva = async () => {
      if (!reservaId) return;

      const snap = await getDoc(doc(db, "reservas", reservaId));
      if (snap.exists()) {
        setReservaOriginal({
          id: snap.id,
          ...(snap.data() as Omit<Reserva, "id">),
        });
      }
    };

    cargarReserva();
  }, [reservaId]);

  /* =====================
     IDS FINALES
  ===================== */
  const negocioFinalId = reservaOriginal?.negocioId ?? negocioId ?? "";
  const servicioFinalId = reservaOriginal?.servicioId ?? servicioId ?? "";

  /* =====================
     DATA
  ===================== */
  const { negocio } = useNegocio(negocioFinalId);
  const { servicios } = useServiciosPorNegocio(negocioFinalId);

  const servicioSeleccionado = useMemo(
    () => servicios.find((s) => s.id === servicioFinalId),
    [servicios, servicioFinalId]
  );

  /* =====================
     RESERVAS DEL DÍA
  ===================== */
  useEffect(() => {
    const cargarReservasDia = async () => {
      if (!negocioFinalId) return;

      const q = query(
        collection(db, "reservas"),
        where("negocioId", "==", negocioFinalId),
        where("estado", "==", "confirmada")
      );

      const snap = await getDocs(q);
      const reservas: Reserva[] = [];

      snap.forEach((d) => {
        const data = d.data() as Omit<Reserva, "id">;
        const inicio = data.inicio.toDate();

        if (inicio.toDateString() === fechaSeleccionada.toDateString()) {
          reservas.push({
            id: d.id,
            ...data,
          });
        }
      });

      setReservasDia(reservas);
    };

    cargarReservasDia();
  }, [fechaSeleccionada, negocioFinalId]);

  /* =====================
     CALENDARIO
  ===================== */
  const diasMes = useMemo(() => {
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

    const offset = primerDia.getDay() === 0 ? 6 : primerDia.getDay() - 1;
    for (let i = 0; i < offset; i++) dias.push(null);

    for (let d = 1; d <= ultimoDia.getDate(); d++) {
      dias.push(new Date(mesActual.getFullYear(), mesActual.getMonth(), d));
    }

    return dias;
  }, [mesActual]);

  const esDiaPasado = (d: Date) => d < hoy;
  const esDomingo = (d: Date) => d.getDay() === 0;

  const diaSemana = useMemo<DiaSemanaKey>(() => {
    return normalizarDiaSemana(
      fechaSeleccionada
        .toLocaleDateString("es-ES", { weekday: "long" })
        .toLowerCase()
    );
  }, [fechaSeleccionada]);

  /* =====================
     HORAS DISPONIBLES (CON SOLAPES)
  ===================== */
  const horasDisponibles = useMemo(() => {
    if (!negocio?.horarios || !servicioSeleccionado) return [];

    const horarioDia = negocio.horarios[diaSemana];
    if (!horarioDia || !horarioDia.activo) return [];

    const todas = generarHorasDisponibles(
      horarioDia.tramos,
      servicioSeleccionado.duracion
    );

    const horaMinimaHoy = esHoy(fechaSeleccionada)
      ? obtenerHoraMinimaHoy(servicioSeleccionado.duracion)
      : null;

    return todas.filter((hora) => {
      const inicioNueva = construirFechaHora(fechaSeleccionada, hora);
      const finNueva = new Date(inicioNueva);
      finNueva.setMinutes(
        finNueva.getMinutes() + servicioSeleccionado.duracion
      );

      // BLOQUEO HORAS PASADAS
      if (horaMinimaHoy && inicioNueva < horaMinimaHoy) {
        return false;
      }

      return !reservasDia.some((r) => {
        const inicioExistente = r.inicio.toDate();
        const finExistente = r.fin.toDate();

        return haySolape(inicioNueva, finNueva, inicioExistente, finExistente);
      });
    });
  }, [
    negocio,
    servicioSeleccionado,
    diaSemana,
    fechaSeleccionada, // 👈 ESTA ES LA CLAVE
    reservasDia,
  ]);

  /* =====================
     CONFIRMAR
  ===================== */
  const confirmarReserva = async () => {
    if (
      !negocio ||
      !servicioSeleccionado ||
      !horaSeleccionada ||
      !auth.currentUser
    ) {
      return;
    }

    const inicioDate = construirFechaHora(fechaSeleccionada, horaSeleccionada);

    if (esCambioHora && reservaOriginal) {
      await updateDoc(doc(db, "reservas", reservaOriginal.id), {
        estado: "cancelada",
        actualizadaEn: Timestamp.now(),
      });
    }

    const usuarioSnap = await getDoc(doc(db, "usuarios", auth.currentUser.uid));
    const nombreCliente = usuarioSnap.exists()
      ? usuarioSnap.data().nombre
      : "Cliente";

    const finDate = new Date(inicioDate);
    finDate.setMinutes(finDate.getMinutes() + servicioSeleccionado.duracion);

    await addDoc(collection(db, "reservas"), {
      clienteId: auth.currentUser.uid,
      negocioId: negocio.id,
      servicioId: servicioSeleccionado.id,

      nombreCliente,
      nombreNegocio: negocio.nombre,
      nombreServicio: servicioSeleccionado.nombre,

      inicio: Timestamp.fromDate(inicioDate),
      fin: Timestamp.fromDate(finDate),

      duracion: servicioSeleccionado.duracion,
      precio: servicioSeleccionado.precio,

      estado: "confirmada",
      creadaEn: serverTimestamp(),
      actualizadaEn: serverTimestamp(),
    });

    navigate("/cliente");
  };

  // region renderizado
  return (
    <div className="flex flex-col gap-6 pb-24">
      {/* ================= HEADER ================= */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full bg-[#1F2A44]/10 text-[#1F2A44] active:scale-95 transition"
        >
          <Icons.arrowLeft size={20} strokeWidth={2.2} />
        </button>

        <h1 className="text-lg font-semibold">
          {esCambioHora ? "Cambiar tu cita" : "Reserva una cita"}
        </h1>
      </div>

      {/* ================= EMPLEADOS ================= */}
      <section>
        <p className="text-sm font-medium mb-3">Profesional</p>

        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-1">
          {/* Cualquiera */}
          <button className="flex flex-col items-center min-w-[72px] gap-2">
            <div className="w-14 h-14 rounded-full border-2 border-[#0f6f63] flex items-center justify-center text-[#0f6f63] bg-[#0f6f63]/10">
              👥
            </div>
            <span className="text-xs font-medium">Cualquiera</span>
          </button>

          {/* Empleados futuros */}
          <button className="flex flex-col items-center min-w-[72px] gap-2 opacity-40">
            <div className="w-14 h-14 rounded-full bg-gray-200" />
            <span className="text-xs">Héctor</span>
          </button>

          <button className="flex flex-col items-center min-w-[72px] gap-2 opacity-40">
            <div className="w-14 h-14 rounded-full bg-gray-200" />
            <span className="text-xs">Cristian</span>
          </button>
        </div>
      </section>

      {/* ================= CALENDARIO ================= */}
      <section className="bg-white rounded-2xl p-4">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() =>
              setMesActual(
                new Date(mesActual.getFullYear(), mesActual.getMonth() - 1, 1)
              )
            }
            className="text-lg px-2"
          >
            ‹
          </button>

          <p className="capitalize font-medium">
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
            className="text-lg px-2"
          >
            ›
          </button>
        </div>

        <div className="grid grid-cols-7 text-[11px] text-gray-400 text-center mb-2">
          {["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"].map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-y-2 text-center">
          {diasMes.map((dia, i) =>
            dia ? (
              <button
                key={i}
                disabled={esDiaPasado(dia) || esDomingo(dia)}
                onClick={() => {
                  setFechaSeleccionada(dia);
                  setHoraSeleccionada(null);
                }}
                className={`h-9 rounded-full text-sm transition
                ${
                  esDiaPasado(dia) || esDomingo(dia)
                    ? "text-gray-300"
                    : fechaSeleccionada.toDateString() === dia.toDateString()
                    ? "bg-[#1F2A44]/20"
                    : "hover:bg-gray-100"
                }`}
              >
                {dia.getDate()}
              </button>
            ) : (
              <div key={i} />
            )
          )}
        </div>
      </section>

      {/* ================= HORAS ================= */}
      <section>
        <p className="text-sm font-medium mb-3">Hora</p>

        {horasDisponibles.length === 0 ? (
          <p className="text-sm text-gray-400">
            No hay horas disponibles este día
          </p>
        ) : (
          <div className="flex gap-3 overflow-x-auto no-scrollbar px-1">
            {horasDisponibles.map((hora) => (
              <button
                key={hora}
                onClick={() => setHoraSeleccionada(hora)}
                className={`min-w-[96px] py-3 rounded-full text-sm font-medium transition
                ${
                  horaSeleccionada === hora
                    ? "bg-[#1F2A44]/10"
                    : "bg-white border border-gray-200"
                }`}
              >
                {hora}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* ================= RESUMEN ================= */}
      <section className="bg-gray-50 rounded-2xl p-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className="font-medium">
              {servicioSeleccionado?.nombre ?? "Servicio"}
            </p>
            <p className="text-sm text-gray-500">
              {fechaSeleccionada.toLocaleDateString("es-ES")} ·{" "}
              {horaSeleccionada ?? "--:--"}
            </p>
            <p className="text-sm text-gray-500">
              {servicioSeleccionado?.duracion ?? "--"} min
            </p>
          </div>

          <p className="text-lg font-semibold">
            {servicioSeleccionado
              ? `${servicioSeleccionado.precio.toFixed(2)} €`
              : "-- €"}
          </p>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <button
        disabled={!horaSeleccionada}
        onClick={confirmarReserva}
        className={`w-full py-4 rounded-2xl text-white font-semibold shadow-md transition
      ${horaSeleccionada ? "bg-[#1F2A44]" : "bg-[#1F2A44] opacity-40"}`}
      >
        {esCambioHora ? "Confirmar cambio" : "Confirmar reserva"}
      </button>
    </div>
  );
};

export default CL0007_ReservarCita;
