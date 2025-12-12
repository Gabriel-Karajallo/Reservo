import { Search } from "lucide-react";
import { useCategorias } from "../../../hooks/useCategorias";
import { useReservaActiva } from "../../../hooks/useReservaActiva";
import { useUltimaReserva } from "../../../hooks/useUltimaReserva";
import type { Categoria } from "../../../types/firebase";

const CL0001_Home = () => {
  const { categorias, loading: loadingCategorias } = useCategorias();
  const { reservaActiva, loading: loadingActiva } = useReservaActiva();
  const { ultimaReserva, loading: loadingUltima } = useUltimaReserva();

  return (
    <div className="flex flex-col gap-6">
      {/* Buscador */}
      <div>
        <div className="flex items-center bg-gray-100 shadow-sm rounded-xl px-4 py-3 border border-gray-200">
          <Search className="text-gray-500" size={20} />
          <input
            type="text"
            placeholder="Buscar negocios o servicios..."
            className="ml-3 w-full outline-none text-gray-700 bg-transparent"
          />
        </div>
      </div>

      {/* Categorías */}
      <div>
        <h2 className="text-lg font-semibold mb-3 text-gray-800">Categorías</h2>

        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          {loadingCategorias && (
            <span className="text-gray-400">Cargando categorías…</span>
          )}

          {!loadingCategorias &&
            categorias.map((c: Categoria) => (
              <div
                key={c.id}
                className="flex flex-col items-center bg-white border border-gray-200 shadow-sm px-4 py-5 rounded-xl min-w-[95px] h-[120px] justify-center transition-all duration-150 active:scale-95"
              >
                {/* IMAGEN PERSONALIZADA */}
                <img
                  src={`/categorias/${c.icono}`}
                  alt={c.nombre}
                  className="h-10 w-10 object-contain mb-2"
                />

                <span className="text-sm font-medium text-gray-700 mt-1 text-center">
                  {c.nombre}
                </span>
              </div>
            ))}
        </div>
      </div>

      {/* Reserva activa */}
      {!loadingActiva && reservaActiva && (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
          <h3 className="text-md font-semibold text-green-700 mb-2">
            Tu reserva activa
          </h3>

          <div className="text-gray-700 mb-2">
            <p className="font-medium">{reservaActiva.servicioNombre}</p>
            <p className="text-sm">{reservaActiva.negocioNombre}</p>
            <p className="text-sm">
              {reservaActiva.fecha} - {reservaActiva.hora}
            </p>
          </div>

          <div className="flex justify-between mt-3">
            <button className="bg-green-700 text-white px-4 py-2 rounded-lg shadow-sm active:scale-95 transition">
              Ver detalles
            </button>

            <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg shadow-sm active:scale-95 transition">
              Cambiar hora
            </button>
          </div>
        </div>
      )}

      {/* Última reserva */}
      {!loadingUltima && !reservaActiva && ultimaReserva && (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
          <h3 className="text-md font-semibold text-gray-800 mb-2">
            Tu última reserva
          </h3>

          <div className="text-gray-700 mb-2">
            <p className="font-medium">{ultimaReserva.servicioNombre}</p>
            <p className="text-sm">{ultimaReserva.negocioNombre}</p>
            <p className="text-sm">
              {ultimaReserva.fecha} - {ultimaReserva.hora}
            </p>
          </div>

          <button className="bg-green-700 text-white px-4 py-2 rounded-lg w-full mt-3 shadow-sm active:scale-95 transition">
            Reservar de nuevo
          </button>
        </div>
      )}

      {/* Sin reservas */}
      {!loadingActiva && !loadingUltima && !reservaActiva && !ultimaReserva && (
        <div className="text-center text-gray-500 mt-8">
          <p className="text-sm">Aún no has reservado nada</p>
          <p className="text-sm font-medium mt-1">
            ¡Encuentra tu estilo con Reservo!
          </p>
        </div>
      )}
    </div>
  );
};

export default CL0001_Home;
