import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useNegocio } from "../../../hooks/useNegocio";
import { useServiciosPorNegocio } from "../../../hooks/useServiciosPorNegocio";
import { useUltimaReservaNegocio } from "./useUltimaReservaNegocio";
import type { Servicio } from "../../../types/firebase";
import { Icons } from "../../../assets/icons";

/* =========================
   TIPOS
========================== */
type TabNegocio = "servicios" | "resenas" | "detalles";

interface TabConfig {
  id: TabNegocio;
  label: string;
}

const tabs: TabConfig[] = [
  { id: "servicios", label: "Servicios" },
  { id: "resenas", label: "Reseñas" },
  { id: "detalles", label: "Detalles" },
];

/* =========================
   COMPONENTE
========================== */
const CL0006_NegocioDetalle = () => {
  const { negocioId } = useParams<{ negocioId: string }>();
  const navigate = useNavigate();

  const negocioIdSeguro = negocioId ?? "";

  /* =========================
     HOOKS (SIEMPRE ARRIBA)
  ========================== */
  const { negocio, loading: loadingNegocio } = useNegocio(negocioIdSeguro);

  const { servicios, loading: loadingServicios } =
    useServiciosPorNegocio(negocioIdSeguro);

  const {
    ultimaReserva,
    tipo: tipoReserva,
    loading: loadingUltimaReserva,
  } = useUltimaReservaNegocio(negocioIdSeguro);

  const [tabActiva, setTabActiva] = useState<TabNegocio>("servicios");

  /* =========================
     ESTADOS BASE
  ========================== */
  if (!negocioId) {
    return <span className="text-gray-500">Negocio no válido</span>;
  }

  if (loadingNegocio) {
    return <span className="text-gray-400">Cargando negocio…</span>;
  }

  if (!negocio) {
    return <span className="text-gray-500">Negocio no encontrado</span>;
  }

  /* =========================
     RENDER
  ========================== */
  return (
    <div className="flex flex-col gap-6">
      {/* ================= PORTADA + GALERÍA ================= */}
      <div className="-mx-4">
        <div className="relative h-60 overflow-hidden bg-gray-200">
          {negocio.portadaUrl ? (
            <>
              <img
                src={negocio.portadaUrl}
                alt={`Portada de ${negocio.nombre}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/15 pointer-events-none" />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
              Sin imagen de portada
            </div>
          )}

          {/* Volver */}
          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 z-50 bg-white/90 backdrop-blur rounded-full p-2 shadow"
          >
            <Icons.squareArrowLeft size={20} className="text-gray-800" />
          </button>

          {/* Favorito */}
          <button className="absolute top-4 right-4 z-50 bg-white/90 backdrop-blur rounded-full p-2 shadow">
            <Icons.heart size={20} className="text-red-500" />
          </button>

          {/* Mostrar todas */}
          {negocio.galeriaUrls?.length > 0 && (
            <button className="absolute bottom-3 right-3 bg-white/90 backdrop-blur text-xs px-3 py-1 rounded-full shadow">
              Mostrar todas las fotos
            </button>
          )}
        </div>

        {/* Miniaturas */}
        {negocio.galeriaUrls?.length > 0 && (
          <div className="flex">
            {negocio.galeriaUrls.slice(0, 5).map((url, index) => (
              <div key={index} className="flex-1 h-20 overflow-hidden">
                <img
                  src={url}
                  alt={`Galería ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ================= ÚLTIMA / PRÓXIMA RESERVA ================= */}
      {!loadingUltimaReserva && ultimaReserva && tipoReserva && (
        <div className="mx-4 bg-white border border-gray-200 rounded-xl shadow-sm px-4 py-3 flex items-center justify-between">
          {/* Izquierda */}
          <div className="flex flex-col gap-1">
            <span className="w-fit text-[11px] font-semibold tracking-wide uppercase text-[#1F2A44]">
              {tipoReserva === "futura" ? "Próxima reserva" : "Última reserva"}
            </span>

            <p className="font-medium text-gray-900">
              {ultimaReserva.nombreServicio}
            </p>

            <p className="text-sm text-gray-500">Profesional asignado</p>
          </div>

          {/* Derecha */}
          <div className="text-right leading-tight">
            <p className="text-xs uppercase tracking-wide text-gray-400">
              {ultimaReserva.inicio
                .toDate()
                .toLocaleDateString("es-ES", { month: "long" })}
            </p>

            <p className="text-2xl font-semibold text-[#1F2A44]">
              {ultimaReserva.inicio.toDate().getDate()}
            </p>

            <p className="text-sm text-gray-500">
              {ultimaReserva.inicio.toDate().toLocaleTimeString("es-ES", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      )}

      {/* ================= INFO NEGOCIO ================= */}
      <div className="px-4 space-y-1">
        <h1 className="text-2xl font-semibold text-gray-900">
          {negocio.nombre}
        </h1>
        <p className="text-sm text-gray-500">{negocio.direccion}</p>
      </div>

      {/* ================= TABS ================= */}
      <div className="flex border-b border-gray-200 px-4 ">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setTabActiva(tab.id)}
            className={`flex-1 py-3 text-sm font-medium ${
              tabActiva === tab.id
                ? "border-b-2 border-gray-900 text-gray-900"
                : "text-gray-400"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ================= CONTENIDO ================= */}
      <div className="px-4 pb-6">
        {tabActiva === "servicios" && (
          <>
            {loadingServicios && (
              <span className="text-gray-400">Cargando servicios…</span>
            )}

            {!loadingServicios && servicios.length === 0 && (
              <span className="text-gray-500">
                Este negocio no tiene servicios
              </span>
            )}

            <div className="flex flex-col divide-y divide-gray-300">
              {servicios.map((servicio: Servicio) => (
                <div
                  key={servicio.id}
                  className="py-4 flex items-center justify-between gap-4"
                >
                  {/* Info servicio */}
                  <div className="flex flex-col gap-1">
                    <p className="font-medium text-gray-900">
                      {servicio.nombre}
                    </p>

                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>{servicio.duracion} min</span>
                      <span className="text-gray-300">•</span>
                      <span>Profesional asignado</span>
                    </div>
                  </div>

                  {/* Acción */}
                  <div className="flex flex-col items-end gap-2">
                    <p className="font-semibold text-gray-900">
                      {servicio.precio} €
                    </p>

                    <button
                      onClick={() =>
                        navigate(
                          `/cliente/reservar/${negocio.id}/${servicio.id}`
                        )
                      }
                      className="bg-[#1F2A44]/80 text-white px-4 py-1.5 rounded-full text-sm
             hover:bg-[#1F2A44] active:scale-95 transition"
                    >
                      Reservar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {tabActiva === "resenas" && (
          <p className="text-sm text-gray-500">
            Aquí irán las reseñas del negocio.
          </p>
        )}

        {tabActiva === "detalles" && (
          <p className="text-sm text-gray-500">
            {negocio.descripcion || "Este negocio no tiene descripción."}
          </p>
        )}
      </div>
    </div>
  );
};

export default CL0006_NegocioDetalle;
