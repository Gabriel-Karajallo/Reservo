import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, Timestamp } from "firebase/firestore";
import { db } from "../services/firebase/firebaseConfig";
import { useAuth } from "./useAuth";
import type { Reserva } from "../types/firebase";

export const useReservaActiva = () => {
  const { user } = useAuth();
  const [reservaActiva, setReservaActiva] = useState<Reserva | null>(null);
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

      const futuras = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Reserva, "id">),
        }))
        .filter((r) => r.fin.toMillis() > ahora.toMillis())
        .sort((a, b) => a.inicio.toMillis() - b.inicio.toMillis());

      setReservaActiva(futuras.length > 0 ? futuras[0] : null);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return { reservaActiva, loading };
};
