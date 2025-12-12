import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../services/firebase/firebaseConfig";
import type { Categoria } from "../types/firebase";

export const useCategorias = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const ref = collection(db, "categorias");

    const unsubscribe = onSnapshot(ref, (snapshot) => {
      const lista: Categoria[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Categoria, "id">),
      }));

      setCategorias(lista);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { categorias, loading };
};
