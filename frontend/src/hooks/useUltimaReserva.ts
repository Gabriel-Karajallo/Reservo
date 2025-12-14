import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, Timestamp } from "firebase/firestore";
import { db } from "../services/firebase/firebaseConfig";
import { useAuth } from "./useAuth";
import type { Reserva } from "../types/firebase";

export const useUltimaReserva = () => {
  const { user } = useAuth();
  const [ultimaReserva, setUltimaReserva] = useState<Reserva | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const ref = collection(db, "reservas");

    const q = query(
      ref,
      where("clienteId", "==", user.uid),
      where("estado", "==", "confirmada")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ahora = Timestamp.now();

      const pasadas = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Reserva, "id">),
        }))
        .filter((r) => r.fin.toMillis() < ahora.toMillis())
        .sort((a, b) => b.inicio.toMillis() - a.inicio.toMillis());

      setUltimaReserva(pasadas.length > 0 ? pasadas[0] : null);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return { ultimaReserva, loading };
};
