import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../../services/firebase/firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";

const CL0009_DetallesCuenta = () => {
  const navigate = useNavigate();
  const usuario = auth.currentUser;

  const [nombre, setNombre] = useState("");
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    const cargarDatosUsuario = async () => {
      if (!usuario) return;

      try {
        const refUsuario = doc(db, "usuarios", usuario.uid);
        const snap = await getDoc(refUsuario);

        if (snap.exists()) {
          setNombre(snap.data().nombre || "");
        }
      } catch (error) {
        console.error("Error al cargar datos del usuario:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatosUsuario();
  }, [usuario]);

  const guardarCambios = async () => {
    if (!usuario || !nombre.trim()) return;

    try {
      setGuardando(true);

      const refUsuario = doc(db, "usuarios", usuario.uid);
      await updateDoc(refUsuario, {
        nombre: nombre.trim(),
      });

      navigate(-1);
    } catch (error) {
      console.error("Error al guardar cambios:", error);
    } finally {
      setGuardando(false);
    }
  };

  if (loading) {
    return <div className="p-4 text-gray-500">Cargando datos…</div>;
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-6">
      {/* CABECERA */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-600 text-lg">
          ←
        </button>
        <h1 className="text-xl font-semibold text-gray-900">
          Detalles de la cuenta
        </h1>
      </div>

      {/* FORM */}
      <div className="space-y-4">
        {/* NOMBRE */}
        <div>
          <label className="block text-sm text-gray-600 mb-1">Nombre</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        {/* EMAIL */}
        <div>
          <label className="block text-sm text-gray-600 mb-1">Email</label>
          <input
            type="email"
            value={usuario?.email || ""}
            disabled
            className="w-full border rounded-lg px-3 py-2 bg-gray-100 text-gray-500"
          />
        </div>
      </div>

      {/* GUARDAR */}
      <button
        onClick={guardarCambios}
        disabled={guardando}
        className="w-full bg-black text-white py-3 rounded-lg font-medium active:scale-95 disabled:opacity-50"
      >
        {guardando ? "Guardando…" : "Guardar cambios"}
      </button>
    </div>
  );
};

export default CL0009_DetallesCuenta;
