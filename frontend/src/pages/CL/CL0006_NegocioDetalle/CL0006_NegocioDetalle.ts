import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../../services/firebase/firebaseConfig";
import { useAuth } from "../../../hooks/useAuth";
import type { Reserva } from "../../../types/firebase";

/* =========================
   TIPOS
========================== */
export type TipoReserva = "futura" | "pasada";

export const useUltimaReservaNegocio = (negocioId: string) => {
  const { user } = useAuth();

  const [ultimaReserva, setUltimaReserva] = useState<Reserva | null>(null);
  const [tipo, setTipo] = useState<TipoReserva | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !negocioId) return;

    const q = query(
      collection(db, "reservas"),
      where("clienteId", "==", user.uid),
      where("negocioId", "==", negocioId),
      where("estado", "==", "confirmada")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ahora = Timestamp.now();

      const reservas: Reserva[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Reserva, "id">),
      }));

      const futuras = reservas
        .filter((r) => r.inicio.toMillis() > ahora.toMillis())
        .sort((a, b) => a.inicio.toMillis() - b.inicio.toMillis());

      const pasadas = reservas
        .filter((r) => r.fin.toMillis() < ahora.toMillis())
        .sort((a, b) => b.inicio.toMillis() - a.inicio.toMillis());

      if (futuras.length > 0) {
        setUltimaReserva(futuras[0]);
        setTipo("futura");
      } else if (pasadas.length > 0) {
        setUltimaReserva(pasadas[0]);
        setTipo("pasada");
      } else {
        setUltimaReserva(null);
        setTipo(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, negocioId]);

  return { ultimaReserva, tipo, loading };
};
