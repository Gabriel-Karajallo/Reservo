import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../services/firebase/firebaseConfig";
import type { Negocio } from "../types/firebase";

export const useNegocio = (negocioId: string) => {
  const [negocio, setNegocio] = useState<Negocio | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!negocioId) return;

    const ref = doc(db, "negocios", negocioId);

    const unsubscribe = onSnapshot(ref, (snapshot) => {
      if (!snapshot.exists()) {
        setNegocio(null);
        setLoading(false);
        return;
      }

      setNegocio({
        id: snapshot.id,
        ...(snapshot.data() as Omit<Negocio, "id">),
      });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [negocioId]);

  return { negocio, loading };
};
