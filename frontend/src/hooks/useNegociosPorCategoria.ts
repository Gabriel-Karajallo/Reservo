import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../services/firebase/firebaseConfig";
import type { Negocio } from "../types/firebase";

export const useNegociosPorCategoria = (categoriaId: string) => {
  const [negocios, setNegocios] = useState<Negocio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!categoriaId) return;

    const ref = collection(db, "negocios");
    const q = query(ref, where("categoriaId", "==", categoriaId));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Negocio, "id">),
      }));

      setNegocios(lista);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [categoriaId]);

  return { negocios, loading };
};
