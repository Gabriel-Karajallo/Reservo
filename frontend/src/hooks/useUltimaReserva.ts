import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../services/firebase/firebaseConfig";
import { useAuth } from "./useAuth";
import type { Reserva, ReservaExtendida } from "../types/firebase";

// Función auxiliar: determina si la reserva ya pasó
const esPasado = (fecha: string, hora: string): boolean => {
  const ahora = new Date();
  const fechaReserva = new Date(`${fecha}T${hora}:00`);
  return fechaReserva < ahora;
};

export const useUltimaReserva = () => {
  const { user } = useAuth();
  const [ultimaReserva, setUltimaReserva] = useState<ReservaExtendida | null>(null);
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

      // Filtrar todas las reservas pasadas
      const pasadas = reservas.filter((r) => esPasado(r.fecha, r.hora));

      if (pasadas.length === 0) {
        setUltimaReserva(null);
        setLoading(false);
        return;
      }

      // Ordenar de más reciente a más antigua
      pasadas.sort((a, b) => {
        const dateA = new Date(`${a.fecha}T${a.hora}:00`);
        const dateB = new Date(`${b.fecha}T${b.hora}:00`);
        return dateB.getTime() - dateA.getTime();
      });

      setUltimaReserva(pasadas[0]);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return { ultimaReserva, loading };
};
