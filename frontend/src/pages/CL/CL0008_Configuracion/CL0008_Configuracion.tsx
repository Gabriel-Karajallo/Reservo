import { useNavigate } from "react-router-dom";

const CL0008_Configuracion = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-6">
      {/* CABECERA */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-600 text-lg">
          ←
        </button>
        <h1 className="text-xl font-semibold text-gray-900">
          Cuenta y configuración
        </h1>
      </div>

      {/* MENÚ */}
      <div className="bg-white rounded-xl shadow-sm divide-y">
        <button
          onClick={() => navigate("/cliente/detalles-cuenta")}
          className="w-full flex justify-between items-center px-4 py-4 text-left active:bg-gray-50"
        >
          <span className="text-gray-800">Detalles de la cuenta</span>
          <span className="text-gray-400">›</span>
        </button>

        <button
          onClick={() => navigate("/cliente/configuracion-general")}
          className="w-full flex justify-between items-center px-4 py-4 text-left active:bg-gray-50"
        >
          <span className="text-gray-800">Configuración general</span>
          <span className="text-gray-400">›</span>
        </button>

        <button
          onClick={() => navigate("/cliente/privacidad-datos")}
          className="w-full flex justify-between items-center px-4 py-4 text-left active:bg-gray-50"
        >
          <span className="text-gray-800">Privacidad y datos</span>
          <span className="text-gray-400">›</span>
        </button>
      </div>
    </div>
  );
};

export default CL0008_Configuracion;
