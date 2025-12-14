import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  Timestamp,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../../services/firebase/firebaseConfig";
import type { Reserva } from "../../../types/firebase";
import { useAuth } from "../../../hooks/useAuth";

/* =========================
   TIPOS
========================== */
type ModoModal = "ver" | "cambiarHora" | "confirmarCancelacion";

const EM0002_Reservas = () => {
  const { userData, loading, loadingUserData } = useAuth();

  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [reservas, setReservas] = useState<Reserva[]>([]);

  const [reservaSeleccionada, setReservaSeleccionada] =
    useState<Reserva | null>(null);

  const [modoModal, setModoModal] = useState<ModoModal>("ver");
  const [nuevaHora, setNuevaHora] = useState("");
  const [errorSolapamiento, setErrorSolapamiento] = useState("");

  /* =========================
     CARGAR RESERVAS
  ========================== */
  useEffect(() => {
    if (loading || loadingUserData) return;
    if (!userData?.negocioId) return;

    const cargarReservas = async () => {
      const q = query(
        collection(db, "reservas"),
        where("negocioId", "==", userData.negocioId)
      );

      const snapshot = await getDocs(q);

      const reservasDia = snapshot.docs
        .map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            } as Reserva)
        )
        .filter((reserva) => {
          if (reserva.estado === "cancelada") return false;

          const fechaReserva = new Date(reserva.inicio.seconds * 1000);

          return (
            fechaReserva.getFullYear() === fechaSeleccionada.getFullYear() &&
            fechaReserva.getMonth() === fechaSeleccionada.getMonth() &&
            fechaReserva.getDate() === fechaSeleccionada.getDate()
          );
        })
        .sort((a, b) => a.inicio.seconds - b.inicio.seconds);

      setReservas(reservasDia);
    };

    cargarReservas();
  }, [loading, loadingUserData, userData, fechaSeleccionada]);

  /* =========================
     ACCIONES
  ========================== */
  const cancelarReserva = async () => {
    if (!reservaSeleccionada) return;

    await updateDoc(doc(db, "reservas", reservaSeleccionada.id), {
      estado: "cancelada",
    });

    cerrarModal();
    setFechaSeleccionada(new Date(fechaSeleccionada));
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

      const ini = r.inicio.seconds * 1000;
      const fin = r.fin.seconds * 1000;

      return nuevoInicio.getTime() < fin && nuevoFin.getTime() > ini;
    });

    if (haySolape) {
      setErrorSolapamiento("Ese horario ya está ocupado.");
      return;
    }

    await updateDoc(doc(db, "reservas", reservaSeleccionada.id), {
      inicio: Timestamp.fromDate(nuevoInicio),
      fin: Timestamp.fromDate(nuevoFin),
    });

    cerrarModal();
    setFechaSeleccionada(new Date(fechaSeleccionada));
  };

  const cerrarModal = () => {
    setReservaSeleccionada(null);
    setModoModal("ver");
    setNuevaHora("");
    setErrorSolapamiento("");
  };

  /* =========================
     DEV
  ========================== */
  const crearReservaFake = async () => {
    if (!userData?.negocioId) return;

    const inicio = new Date(fechaSeleccionada);
    inicio.setHours(10, 0, 0, 0);

    const fin = new Date(inicio);
    fin.setMinutes(inicio.getMinutes() + 30);

    await addDoc(collection(db, "reservas"), {
      negocioId: userData.negocioId,
      inicio: Timestamp.fromDate(inicio),
      fin: Timestamp.fromDate(fin),
      nombreCliente: "Cliente prueba",
      nombreServicio: "Servicio prueba",
      estado: "confirmada",
    });

    setFechaSeleccionada(new Date(fechaSeleccionada));
  };

  const cambiarDia = (dias: number) => {
    const nuevaFecha = new Date(fechaSeleccionada);
    nuevaFecha.setDate(nuevaFecha.getDate() + dias);
    setFechaSeleccionada(nuevaFecha);
  };

  if (loading || loadingUserData) return <p>Cargando sesión...</p>;

  return (
    <div className="flex flex-col gap-4">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Reservas</h1>

        <div className="flex items-center gap-2">
          <button
            onClick={() => cambiarDia(-1)}
            className="px-3 py-1 border rounded bg-white"
          >
            ←
          </button>

          <span className="font-medium">
            {fechaSeleccionada.toLocaleDateString("es-ES", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </span>

          <button
            onClick={() => cambiarDia(1)}
            className="px-3 py-1 border rounded bg-white"
          >
            →
          </button>
        </div>
      </div>

      <button
        onClick={crearReservaFake}
        className="self-start px-3 py-1 rounded bg-blue-600 text-white text-sm"
      >
        + Crear reserva de prueba
      </button>

      {reservas.map((reserva) => (
        <div
          key={reserva.id}
          onClick={() => {
            setReservaSeleccionada(reserva);
            setModoModal("ver");
            setNuevaHora(
              new Date(reserva.inicio.seconds * 1000).toTimeString().slice(0, 5)
            );
          }}
          className="flex justify-between items-center p-3 border rounded bg-white cursor-pointer hover:bg-gray-50"
        >
          <div>
            <p className="font-medium">
              {reserva.nombreServicio} · {reserva.nombreCliente}
            </p>
            <p className="text-sm text-gray-500">
              {new Date(reserva.inicio.seconds * 1000).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              -{" "}
              {new Date(reserva.fin.seconds * 1000).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>

          <span className="text-sm px-2 py-1 rounded bg-green-100 text-green-700">
            {reserva.estado}
          </span>
        </div>
      ))}

      {/* MODAL */}
      {reservaSeleccionada && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6 flex flex-col gap-3">
            <h2 className="text-lg font-semibold">Detalle de la reserva</h2>

            <p>
              <strong>Cliente:</strong> {reservaSeleccionada.nombreCliente}
            </p>
            <p>
              <strong>Servicio:</strong> {reservaSeleccionada.nombreServicio}
            </p>
            <p>
              <strong>Horario:</strong>{" "}
              {new Date(
                reservaSeleccionada.inicio.seconds * 1000
              ).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              -{" "}
              {new Date(
                reservaSeleccionada.fin.seconds * 1000
              ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>

            {modoModal === "cambiarHora" && (
              <>
                <input
                  type="time"
                  value={nuevaHora}
                  onChange={(e) => setNuevaHora(e.target.value)}
                  className="border rounded px-2 py-1"
                />
                {errorSolapamiento && (
                  <p className="text-red-600 text-sm">{errorSolapamiento}</p>
                )}
              </>
            )}

            {modoModal === "confirmarCancelacion" && (
              <p className="text-red-600">
                ¿Seguro que quieres cancelar esta reserva?
              </p>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t">
              <button
                onClick={cerrarModal}
                className="px-3 py-1 border rounded"
              >
                Cerrar
              </button>

              {modoModal === "ver" && (
                <>
                  <button
                    onClick={() => setModoModal("confirmarCancelacion")}
                    className="px-3 py-1 border rounded text-red-600"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => setModoModal("cambiarHora")}
                    className="px-3 py-1 border rounded text-blue-600"
                  >
                    Cambiar hora
                  </button>
                </>
              )}

              {modoModal === "confirmarCancelacion" && (
                <>
                  <button
                    onClick={() => setModoModal("ver")}
                    className="px-3 py-1 border rounded"
                  >
                    No
                  </button>
                  <button
                    onClick={cancelarReserva}
                    className="px-3 py-1 border rounded text-red-600"
                  >
                    Sí, cancelar
                  </button>
                </>
              )}

              {modoModal === "cambiarHora" && (
                <button
                  onClick={guardarNuevaHora}
                  className="px-3 py-1 border rounded text-blue-600"
                >
                  Guardar
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EM0002_Reservas;
