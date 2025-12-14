import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../services/firebase/firebaseConfig";
import type { Servicio } from "../types/firebase";

export const useServiciosPorNegocio = (negocioId: string) => {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!negocioId) return;

    const ref = collection(db, "servicios");
    const q = query(ref, where("negocioId", "==", negocioId));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Servicio, "id">),
      }));

      setServicios(lista);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [negocioId]);

  return { servicios, loading };
};
