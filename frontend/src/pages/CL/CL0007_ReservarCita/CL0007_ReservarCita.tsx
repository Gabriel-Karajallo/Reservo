import { ArrowLeft } from "lucide-react";
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

/* =====================
   COMPONENTE
===================== */
const CL0007_ReservarCita = () => {
  const navigate = useNavigate();
  const { negocioId, servicioId, reservaId } = useParams();
  const esCambioHora = Boolean(reservaId);

  /* =====================
     FECHA BASE
  ====================== */
  const hoy = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  /* =====================
     ESTADOS
  ====================== */
  const [reservaOriginal, setReservaOriginal] = useState<Reserva | null>(null);
  const [mesActual, setMesActual] = useState(
    new Date(hoy.getFullYear(), hoy.getMonth(), 1)
  );
  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date>(hoy);
  const [horaSeleccionada, setHoraSeleccionada] = useState<string | null>(null);
  const [horasOcupadas, setHorasOcupadas] = useState<string[]>([]);

  /* =====================
     CARGAR RESERVA ORIGINAL
  ====================== */
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
  ====================== */
  const negocioFinalId = reservaOriginal?.negocioId ?? negocioId ?? "";
  const servicioFinalId = reservaOriginal?.servicioId ?? servicioId ?? "";

  /* =====================
     DATA
  ====================== */
  const { negocio } = useNegocio(negocioFinalId);
  const { servicios } = useServiciosPorNegocio(negocioFinalId);

  const servicioSeleccionado = useMemo(
    () => servicios.find((s) => s.id === servicioFinalId),
    [servicios, servicioFinalId]
  );

  /* =====================
     HORAS OCUPADAS (solo hora inicio)
  ====================== */
  useEffect(() => {
    const cargarHorasOcupadas = async () => {
      if (!negocioFinalId) return;

      const q = query(
        collection(db, "reservas"),
        where("negocioId", "==", negocioFinalId),
        where("estado", "==", "confirmada")
      );

      const snap = await getDocs(q);
      const ocupadas: string[] = [];

      snap.forEach((d) => {
        const inicio = d.data().inicio.toDate();

        // mismo día en hora local
        if (inicio.toDateString() === fechaSeleccionada.toDateString()) {
          ocupadas.push(formatearHora(inicio));
        }
      });

      setHorasOcupadas(ocupadas);
    };

    cargarHorasOcupadas();
  }, [fechaSeleccionada, negocioFinalId]);

  /* =====================
     CALENDARIO
  ====================== */
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
     HORAS DISPONIBLES
  ====================== */
  const horasDisponibles = useMemo(() => {
    if (!negocio?.horarios || !servicioSeleccionado) return [];

    const horarioDia = negocio.horarios[diaSemana];
    if (!horarioDia || !horarioDia.activo) return [];

    const todas = generarHorasDisponibles(
      horarioDia.tramos,
      servicioSeleccionado.duracion
    );

    return todas.filter((h) => !horasOcupadas.includes(h));
  }, [negocio, servicioSeleccionado, diaSemana, horasOcupadas]);

  /* =====================
     CONFIRMAR
  ====================== */
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

    const q = query(
      collection(db, "reservas"),
      where("negocioId", "==", negocio.id),
      where("estado", "==", "confirmada"),
      where("inicio", "==", Timestamp.fromDate(inicioDate))
    );

    const snap = await getDocs(q);
    if (!snap.empty) return;

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

  /* =====================
     RENDER
  ====================== */
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full bg-gray-100"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-semibold">
          {esCambioHora ? "Cambiar hora de tu cita" : "Reserva una cita"}
        </h1>
      </div>

      <div className="bg-white border rounded-xl p-4 text-sm">
        <p>
          <strong>Negocio:</strong> {negocio?.nombre ?? "Cargando..."}
        </p>
        <p>
          <strong>Servicio:</strong>{" "}
          {servicioSeleccionado?.nombre ?? "Cargando..."}
        </p>
      </div>

      {/* Calendario */}
      <div className="bg-white border rounded-xl p-4">
        <div className="flex justify-between mb-4">
          <button
            onClick={() =>
              setMesActual(
                new Date(mesActual.getFullYear(), mesActual.getMonth() - 1, 1)
              )
            }
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
          >
            ›
          </button>
        </div>

        <div className="grid grid-cols-7 text-xs text-gray-400 text-center mb-2">
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
                className={`h-9 rounded-full text-sm
                  ${
                    esDiaPasado(dia) || esDomingo(dia)
                      ? "text-gray-300"
                      : fechaSeleccionada.toDateString() === dia.toDateString()
                      ? "bg-[#0f6f63] text-white"
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
      </div>

      {/* Horas */}
      <div className="bg-white border rounded-xl p-4">
        <p className="text-sm font-medium mb-3">Horas disponibles</p>

        {horasDisponibles.length === 0 ? (
          <p className="text-sm text-gray-400">
            No hay horas disponibles este día
          </p>
        ) : (
          <div className="flex gap-3 overflow-x-auto no-scrollbar">
            {horasDisponibles.map((hora) => (
              <button
                key={hora}
                onClick={() => setHoraSeleccionada(hora)}
                className={`min-w-[90px] py-3 rounded-full border text-sm
                  ${
                    horaSeleccionada === hora
                      ? "bg-[#0f6f63] text-white border-[#0f6f63]"
                      : "border-gray-200"
                  }`}
              >
                {hora}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Resumen */}
      <div className="bg-white border rounded-xl p-4">
        <div className="flex justify-between">
          <div>
            <p className="font-medium">
              {servicioSeleccionado?.nombre ?? "Servicio"}
            </p>
            <p className="text-sm text-gray-500">
              {horaSeleccionada ?? "--:--"} ·{" "}
              {servicioSeleccionado?.duracion ?? "--"} min
            </p>
            <p className="text-sm text-gray-500">
              {fechaSeleccionada.toLocaleDateString("es-ES")}
            </p>
          </div>

          <p className="font-semibold">
            {servicioSeleccionado
              ? `${servicioSeleccionado.precio.toFixed(2)} €`
              : "-- €"}
          </p>
        </div>
      </div>

      <button
        disabled={!horaSeleccionada}
        onClick={confirmarReserva}
        className={`py-3 rounded-xl text-white font-medium
        ${horaSeleccionada ? "bg-green-700" : "bg-green-700 opacity-40"}`}
      >
        {esCambioHora ? "Confirmar cambio" : "Confirmar reserva"}
      </button>
    </div>
  );
};

export default CL0007_ReservarCita;
