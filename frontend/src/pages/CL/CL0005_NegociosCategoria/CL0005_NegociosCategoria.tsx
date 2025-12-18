import { useParams, useNavigate } from "react-router-dom";
import { useNegociosPorCategoria } from "../../../hooks/useNegociosPorCategoria";
import { useLocation } from "react-router-dom";

const CL0005_NegociosCategoria = () => {
  const { categoriaId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { negocios, loading } = useNegociosPorCategoria(categoriaId!);

  const nombreCategoria = location.state?.nombreCategoria || "Categoría";

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-gray-800">
        {nombreCategoria} {!loading && `(${negocios.length})`}
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
            className="flex gap-4 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer active:scale-[0.98] transition"
          >
            {/* IMAGEN */}
            <div className="w-28 h-28 bg-gray-100 shrink-0">
              <img
                src={negocio.portadaUrl || "/placeholder-negocio.jpg"}
                alt={negocio.nombre}
                className="w-full h-full object-cover"
              />
            </div>

            {/* INFO */}
            <div className="flex flex-col justify-between py-3 pr-3">
              <div>
                <p className="font-semibold text-gray-800 leading-tight">
                  {negocio.nombre}
                </p>

                <p className="text-sm text-gray-500 line-clamp-2">
                  {negocio.direccion}
                </p>
              </div>

              {/* RATING (placeholder) */}
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <span className="font-medium">⭐ 4,8</span>
                <span className="text-gray-400">(233)</span>
              </div>
            </div>
          </div>
        ))}
    </div>
  );
};

export default CL0005_NegociosCategoria;
