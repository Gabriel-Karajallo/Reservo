import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../../services/firebase/firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";

const CL0011_ConfiguracionGeneral = () => {
  const navigate = useNavigate();
  const usuario = auth.currentUser;

  const [notificaciones, setNotificaciones] = useState(true);
  const [formatoHora, setFormatoHora] = useState("24h");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    const cargarPreferencias = async () => {
      if (!usuario) return;

      const ref = doc(db, "usuarios", usuario.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const prefs = snap.data().preferencias;
        if (prefs) {
          setNotificaciones(prefs.notificaciones ?? true);
          setFormatoHora(prefs.formatoHora ?? "24h");
        }
      }
    };

    cargarPreferencias();
  }, [usuario]);

  const guardarPreferencias = async () => {
    if (!usuario) return;

    try {
      setGuardando(true);
      const ref = doc(db, "usuarios", usuario.uid);

      await updateDoc(ref, {
        preferencias: {
          notificaciones,
          formatoHora,
        },
      });

      navigate(-1);
    } catch (error) {
      console.error("Error al guardar preferencias:", error);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-6">
      {/* CABECERA */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-lg">
          ←
        </button>
        <h1 className="text-xl font-semibold">Configuración general</h1>
      </div>

      {/* NOTIFICACIONES */}
      <div className="flex items-center justify-between">
        <span className="text-gray-700">Notificaciones</span>
        <input
          type="checkbox"
          checked={notificaciones}
          onChange={(e) => setNotificaciones(e.target.checked)}
          className="w-5 h-5"
        />
      </div>

      {/* FORMATO HORA */}
      <div>
        <label className="block text-sm text-gray-600 mb-1">
          Formato de hora
        </label>
        <select
          value={formatoHora}
          onChange={(e) => setFormatoHora(e.target.value)}
          className="w-full border rounded-lg px-3 py-2"
        >
          <option value="24h">24 horas</option>
          <option value="12h">12 horas</option>
        </select>
      </div>

      {/* GUARDAR */}
      <button
        onClick={guardarPreferencias}
        disabled={guardando}
        className="w-full bg-black text-white py-3 rounded-lg disabled:opacity-50"
      >
        {guardando ? "Guardando…" : "Guardar"}
      </button>
    </div>
  );
};

export default CL0011_ConfiguracionGeneral;
