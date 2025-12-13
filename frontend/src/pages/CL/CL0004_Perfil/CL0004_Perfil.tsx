import { signOut } from "firebase/auth";
import { auth } from "../../../services/firebase/firebaseConfig";

const CL0004_Perfil = () => {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.href = "/login"; // Redirección manual
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <h1 className="text-xl font-semibold text-gray-800">Mi Perfil</h1>

      {/* BOTÓN TEMPORAL */}
      <button
        onClick={handleLogout}
        className="bg-red-600 text-white px-4 py-2 rounded-lg shadow active:scale-95"
      >
        Cerrar sesión
      </button>
    </div>
  );
};

export default CL0004_Perfil;
