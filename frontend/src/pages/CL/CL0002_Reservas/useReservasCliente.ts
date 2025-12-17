import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "../../../services/firebase/firebaseConfig";
import { useAuth } from "../../../hooks/useAuth";
import type { Reserva } from "../../../types/firebase";

export const useReservasCliente = () => {
  const { user } = useAuth();
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const ref = collection(db, "reservas");

    const q = query(
      ref,
      where("clienteId", "==", user.uid),
      orderBy("inicio", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Reserva, "id">),
      }));

      setReservas(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return { reservas, loading };
};