import { useParams, useNavigate } from "react-router-dom";
import { useNegociosPorCategoria } from "../../../hooks/useNegociosPorCategoria";

const CL0005_NegociosCategoria = () => {
  const { categoriaId } = useParams();
  const navigate = useNavigate();

  const { negocios, loading } = useNegociosPorCategoria(categoriaId!);

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-gray-800">
        Negocios disponibles
      </h2>

      {loading && <span className="text-gray-400">Cargando negocios…</span>}

      {!loading && negocios.length === 0 && (
        <span className="text-gray-500">No hay negocios en esta categoría</span>
      )}

      {!loading &&
        negocios.map((negocio) => (
          <div
            key={negocio.id}
            onClick={() => navigate(`/cliente/negocio/${negocio.id}`)}
            className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm cursor-pointer active:scale-95 transition"
          >
            <p className="font-medium text-gray-800">{negocio.nombre}</p>
            <p className="text-sm text-gray-500">{negocio.direccion}</p>
          </div>
        ))}
    </div>
  );
};

export default CL0005_NegociosCategoria;
