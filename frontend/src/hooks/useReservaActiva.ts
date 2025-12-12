import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../services/firebase/firebaseConfig";
import { useAuth } from "./useAuth";
import type { Reserva, ReservaExtendida } from "../types/firebase";

// Función auxiliar: determina si una reserva está en el futuro
const esFuturo = (fecha: string, hora: string): boolean => {
  const ahora = new Date();
  const fechaReserva = new Date(`${fecha}T${hora}:00`);
  return fechaReserva > ahora;
};

export const useReservaActiva = () => {
  const { user } = useAuth();
  const [reservaActiva, setReservaActiva] = useState<ReservaExtendida | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!user) return;

    const ref = collection(db, "reservas");

    const q = query(
      ref,
      where("clienteId", "==", user.uid),
      where("estado", "==", "confirmada")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reservas: Reserva[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Reserva, "id">),
      }));

      // Filtrar las reservas futuras
      const futuras = reservas.filter((r) => esFuturo(r.fecha, r.hora));

      if (futuras.length === 0) {
        setReservaActiva(null);
        setLoading(false);
        return;
      }

      // Ordenar por fecha/hora para encontrar la más cercana
      futuras.sort((a, b) => {
        const dateA = new Date(`${a.fecha}T${a.hora}:00`);
        const dateB = new Date(`${b.fecha}T${b.hora}:00`);
        return dateA.getTime() - dateB.getTime();
      });

      setReservaActiva(futuras[0]);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return { reservaActiva, loading };
};
