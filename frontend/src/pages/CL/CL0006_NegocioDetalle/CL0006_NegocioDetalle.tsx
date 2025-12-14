import { useParams, useNavigate } from "react-router-dom";
import { useNegocio } from "../../../hooks/useNegocio";
import { useServiciosPorNegocio } from "../../../hooks/useServiciosPorNegocio";

const CL0006_NegocioDetalle = () => {
  const { negocioId } = useParams();
  const navigate = useNavigate();

  const { negocio, loading: loadingNegocio } = useNegocio(negocioId!);
  const { servicios, loading: loadingServicios } = useServiciosPorNegocio(
    negocioId!
  );

  if (loadingNegocio) {
    return <span className="text-gray-400">Cargando negocio…</span>;
  }

  if (!negocio) {
    return <span className="text-gray-500">Negocio no encontrado</span>;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Info negocio */}
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <h2 className="text-xl font-semibold text-gray-800">
          {negocio.nombre}
        </h2>
        <p className="text-sm text-gray-600 mt-1">{negocio.descripcion}</p>
        <p className="text-sm text-gray-500 mt-1">{negocio.direccion}</p>
      </div>

      {/* Servicios */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Servicios</h3>

        {loadingServicios && (
          <span className="text-gray-400">Cargando servicios…</span>
        )}

        {!loadingServicios && servicios.length === 0 && (
          <span className="text-gray-500">Este negocio no tiene servicios</span>
        )}

        <div className="flex flex-col gap-3">
          {servicios.map((servicio) => (
            <div
              key={servicio.id}
              className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex justify-between items-center"
            >
              <div>
                <p className="font-medium text-gray-800">{servicio.nombre}</p>
                <p className="text-sm text-gray-500">
                  {servicio.duracion} min · {servicio.precio} €
                </p>
              </div>

              <button
                onClick={() =>
                  navigate(`/cliente/reservar/${negocio.id}/${servicio.id}`)
                }
                className="bg-green-700 text-white px-4 py-2 rounded-lg shadow-sm active:scale-95 transition"
              >
                Reservar
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CL0006_NegocioDetalle;
