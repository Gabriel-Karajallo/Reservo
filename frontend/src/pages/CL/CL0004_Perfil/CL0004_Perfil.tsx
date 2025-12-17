import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../../services/firebase/firebaseConfig";

const CL0004_Perfil = () => {
  const [nombre, setNombre] = useState<string>("");

  useEffect(() => {
    const cargarUsuario = async () => {
      const usuario = auth.currentUser;
      if (!usuario) return;

      const ref = doc(db, "usuarios", usuario.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setNombre(snap.data().nombre || "");
      }
    };

    cargarUsuario();
  }, []);

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const usuario = auth.currentUser;

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-8">
      {/* CABECERA USUARIO */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-xl font-semibold text-gray-600">
          {usuario?.email?.charAt(0).toUpperCase()}
        </div>

        <div>
          <p className="font-semibold text-gray-900">{nombre || "Usuario"}</p>
          <p className="text-sm text-gray-500">{usuario?.email}</p>
        </div>
      </div>

      {/* MENÚ */}
      <div className="bg-white rounded-xl shadow-sm divide-y">
        <button
          onClick={() => navigate("/cliente/configuracion")}
          className="w-full flex justify-between items-center px-4 py-4 text-left active:bg-gray-50"
        >
          <span className="text-gray-800">Cuenta y configuración</span>
          <span className="text-gray-400">›</span>
        </button>

        <button
          onClick={() => navigate("/cliente/soporte")}
          className="w-full flex justify-between items-center px-4 py-4 text-left active:bg-gray-50"
        >
          <span className="text-gray-800">Soporte</span>
          <span className="text-gray-400">›</span>
        </button>
      </div>

      {/* CERRAR SESIÓN */}
      <button
        onClick={handleLogout}
        className="w-full text-center text-red-600 font-medium py-3 rounded-lg active:bg-red-50"
      >
        Cerrar sesión
      </button>
    </div>
  );
};

export default CL0004_Perfil;
