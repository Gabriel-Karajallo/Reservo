import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { db } from "../services/firebase/firebaseConfig";
import type { Reserva } from "../types/firebase";

export const useReservasDia = (
  negocioId: string,
  fecha: Date
) => {
  const [reservasDia, setReservasDia] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const cargarReservas = async () => {
      if (!negocioId) {
        setReservasDia([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      const inicioDia = new Date(fecha);
      inicioDia.setHours(0, 0, 0, 0);

      const finDia = new Date(fecha);
      finDia.setHours(23, 59, 59, 999);

      const q = query(
        collection(db, "reservas"),
        where("negocioId", "==", negocioId),
        where("estado", "==", "confirmada"),
        where("inicio", ">=", Timestamp.fromDate(inicioDia)),
        where("inicio", "<=", Timestamp.fromDate(finDia))
      );

      const snap = await getDocs(q);
      const reservas: Reserva[] = [];

      snap.forEach((doc) => {
        reservas.push({
          id: doc.id,
          ...(doc.data() as Omit<Reserva, "id">),
        });
      });

      setReservasDia(reservas);
      setLoading(false);
    };

    cargarReservas();
  }, [negocioId, fecha]);

  return {
    reservasDia,
    loadingReservasDia: loading,
  };
};
