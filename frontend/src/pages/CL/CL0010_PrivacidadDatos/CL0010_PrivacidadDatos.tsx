import { useNavigate } from "react-router-dom";
import { auth } from "../../../services/firebase/firebaseConfig";

const CL0010_PrivacidadDatos = () => {
  const navigate = useNavigate();
  const usuario = auth.currentUser;

  const solicitarEliminacionCuenta = () => {
    const confirmar = window.confirm(
      "¿Seguro que quieres solicitar la eliminación de tu cuenta?\n\nEsta acción no se puede deshacer."
    );

    if (!confirmar) return;

    // V1: solo informativo / placeholder
    alert("Solicitud enviada.\n\nNuestro equipo revisará tu petición.");
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-6">
      {/* CABECERA */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-600 text-lg">
          ←
        </button>
        <h1 className="text-xl font-semibold text-gray-900">
          Privacidad y datos
        </h1>
      </div>

      {/* TEXTO PRIVACIDAD */}
      <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
        <p>
          En Reservo tratamos tus datos personales con el único fin de ofrecerte
          una experiencia de reserva sencilla y segura.
        </p>

        <p>Los datos que almacenamos son:</p>

        <ul className="list-disc pl-5 space-y-1">
          <li>Nombre</li>
          <li>Email</li>
          <li>Reservas realizadas</li>
        </ul>

        <p>
          Tus datos no se comparten con terceros y solo son accesibles para el
          correcto funcionamiento de la aplicación.
        </p>
      </div>

      {/* INFO USUARIO */}
      {usuario?.email && (
        <div className="text-xs text-gray-500">
          Cuenta asociada: <span className="font-medium">{usuario.email}</span>
        </div>
      )}

      {/* ELIMINAR CUENTA */}
      <div className="pt-4 border-t">
        <button
          onClick={solicitarEliminacionCuenta}
          className="w-full text-red-600 font-medium py-3 rounded-lg active:bg-red-50"
        >
          Solicitar eliminación de cuenta
        </button>
      </div>
    </div>
  );
};

export default CL0010_PrivacidadDatos;
