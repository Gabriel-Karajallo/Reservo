import { useNavigate } from "react-router-dom";

const CL0012_Soporte = () => {
  const navigate = useNavigate();

  const contactarSoporte = () => {
    window.location.href = "mailto:soporte@reservo.app";
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-6">
      {/* CABECERA */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-lg">
          ←
        </button>
        <h1 className="text-xl font-semibold">Soporte</h1>
      </div>

      {/* TEXTO */}
      <div className="text-sm text-gray-600 space-y-3">
        <p>
          ¿Tienes algún problema con una reserva o una sugerencia para mejorar
          Reservo?
        </p>
        <p>Nuestro equipo de soporte te atenderá lo antes posible.</p>
      </div>

      {/* BOTÓN */}
      <button
        onClick={contactarSoporte}
        className="w-full bg-black text-white py-3 rounded-lg"
      >
        Contactar con soporte
      </button>
    </div>
  );
};

export default CL0012_Soporte;
