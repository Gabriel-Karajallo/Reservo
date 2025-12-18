import { Search } from "lucide-react";
import { useCategorias } from "../../../hooks/useCategorias";
import { useReservaActiva } from "../../../hooks/useReservaActiva";
import { useUltimaReserva } from "../../../hooks/useUltimaReserva";
import type { Categoria, Negocio, Reserva } from "../../../types/firebase";
import { useNavigate } from "react-router-dom";
import { doc, updateDoc, Timestamp, getDoc } from "firebase/firestore";
import { db } from "../../../services/firebase/firebaseConfig";
import { useEffect, useRef, useState } from "react";

/* =====================
   HELPERS
===================== */
const formatearFechaHora = (reserva: Reserva) => {
  const fecha = reserva.inicio.toDate().toLocaleDateString();
  const hora = reserva.inicio.toDate().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${fecha} · ${hora}`;
};

/* =====================
   COMPONENTE
===================== */
const CL0001_Home = () => {
  const { categorias, loading: loadingCategorias } = useCategorias();
  const { reservaActiva, loading: loadingActiva } = useReservaActiva();
  const { ultimaReserva, loading: loadingUltima } = useUltimaReserva();
  const navigate = useNavigate();

  /* =====================
     CANCELAR RESERVA
  ====================== */
  const cancelarReserva = async (reserva: Reserva) => {
    const confirmar = window.confirm(
      "¿Seguro que quieres cancelar la reserva?"
    );
    if (!confirmar) return;

    const ref = doc(db, "reservas", reserva.id);

    await updateDoc(ref, {
      estado: "cancelada",
      actualizadaEn: Timestamp.now(),
    });
  };

  const [negocioReserva, setNegocioReserva] = useState<Negocio | null>(null);

  useEffect(() => {
    const cargarNegocio = async () => {
      if (!reservaActiva?.negocioId) return;

      const snap = await getDoc(doc(db, "negocios", reservaActiva.negocioId));

      if (snap.exists()) {
        setNegocioReserva(snap.data() as Negocio);
      }
    };

    cargarNegocio();
  }, [reservaActiva]);

  //Scroll infinito de categorias
  const categoriasLoop: Categoria[] =
    categorias.length > 0 ? [...categorias, ...categorias] : [];
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onScroll = () => {
      if (el.scrollLeft >= el.scrollWidth / 2) {
        el.scrollLeft = 0;
      }
    };

    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  //region renderizado
  return (
    <div className="flex flex-col gap-6">
      {/* ================= BUSCADOR ================= */}
      <div className="bg-white rounded-2xl px-5 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Search className="text-gray-400" size={22} />
          <input
            type="text"
            placeholder="Buscar servicios o negocios"
            className="w-full text-base outline-none placeholder:text-gray-400"
          />
        </div>
      </div>
      {/* ================= CATEGORÍAS ================= */}
      <section className="space-y-4">
        <h2 className="text-sm font-bold tracking-tight text-gray-900">
          Categorías
        </h2>

        <div
          ref={scrollRef}
          className="
    flex gap-5 overflow-x-auto no-scrollbar
    px-4 pb-1
    -mx-4
  "
        >
          {loadingCategorias && (
            <span className="text-gray-400 text-sm">Cargando categorías…</span>
          )}

          {!loadingCategorias &&
            categoriasLoop.map((c: Categoria, index: number) => (
              <button
                key={`${c.id}-${index}`}
                onClick={() =>
                  navigate(`/cliente/categoria/${c.id}`, {
                    state: { nombreCategoria: c.nombre },
                  })
                }
                className="flex flex-col items-center min-w-[72px] transition active:scale-95"
              >
                {/* Imagen circular */}
                <div
                  className="
              w-20 h-20
              rounded-full
              overflow-hidden
              shadow-sm
              bg-white
              mb-2
            "
                >
                  <img
                    src={`/categorias/${c.icono}`}
                    alt={c.nombre}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Nombre */}
                <span className="text-xs font-semibold text-gray-800 text-center leading-tight">
                  {c.nombre}
                </span>
              </button>
            ))}
        </div>
      </section>
      {/* ================= SEPARADOR ================= */}
      <div className="px-2">
        <div className="h-px bg-linear-to-r from-transparent via-gray-300/70 to-transparent" />
      </div>
      {/* ================= RESERVA ACTIVA ================= */}
      {!loadingActiva && reservaActiva && negocioReserva && (
        <section className="space-y-3">
          <p className="text-sm font-semibold text-gray-700">Tu próxima cita</p>

          <div className="relative rounded-2xl overflow-hidden shadow-sm">
            {/* Imagen */}
            <img
              src={negocioReserva.portadaUrl ?? "/placeholder-negocio.jpg"}
              alt={negocioReserva.nombre}
              className="w-full h-56 sm:h-64 object-cover"
            />

            {/* Overlay de seguridad */}
            <div
              className="
                absolute inset-0
                bg-black/35
                backdrop-blur-[1px]
              "
            />

            {/* Contenido */}
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white space-y-1">
              <p className="text-base font-semibold drop-shadow-sm">
                {reservaActiva.nombreServicio}
              </p>

              <p className="text-xs text-white/90 drop-shadow-sm">
                con Profesional asignado
              </p>

              <p className="text-xs text-white/90 drop-shadow-sm">
                {formatearFechaHora(reservaActiva)}
              </p>

              {/* Acciones */}
              <div className="flex gap-2 pt-3">
                <button
                  onClick={() =>
                    navigate(`/cliente/cambiar-hora/${reservaActiva.id}`)
                  }
                  className="
                flex-1 h-9 rounded-xl
                bg-white text-[#1f2f4d]
                text-sm font-medium
                active:scale-95 transition
              "
                >
                  Cambiar
                </button>

                <button
                  onClick={() => cancelarReserva(reservaActiva)}
                  className="
                flex-1 h-9 rounded-xl
                bg-white/20 text-white
                text-sm font-medium
                border border-white/30
                active:scale-95 transition
              "
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>

          {/* Negocio */}
          <div className="px-1">
            <p className="text-sm font-semibold text-gray-800">
              {negocioReserva.nombre}
            </p>
            <p className="text-xs text-gray-500">{negocioReserva.direccion}</p>
          </div>
        </section>
      )}
      {/* ================= ÚLTIMA RESERVA ================= */}
      {!loadingUltima && !reservaActiva && ultimaReserva && (
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
          <h3 className="text-sm font-semibold text-gray-800">
            Tu última reserva
          </h3>

          <div className="flex gap-4">
            <div className="w-20 h-20 bg-gray-200 rounded-xl" />

            <div className="flex-1">
              <p className="text-sm font-semibold">
                {ultimaReserva.nombreNegocio}
              </p>
              <p className="text-sm text-gray-600">
                {ultimaReserva.nombreServicio}
              </p>
              <p className="text-xs text-gray-600">
                {formatearFechaHora(ultimaReserva)}
              </p>
            </div>
          </div>

          <button
            onClick={() =>
              navigate(`/cliente/negocio/${ultimaReserva.negocioId}`)
            }
            className="
            w-full py-2.5 rounded-xl
            bg-[#1f2f4d] text-white
            text-sm font-medium
            transition active:scale-95
          "
          >
            Reservar de nuevo
          </button>
        </section>
      )}
      {/* ================= TEXTO INFORMATIVO ================= */}
      <div className="text-center text-gray-400 text-sm py-6">
        Pronto verás sugerencias según tus reservas
      </div>
      {/* ================= SIN RESERVAS ================= */}
      {!loadingActiva && !loadingUltima && !reservaActiva && !ultimaReserva && (
        <div className="text-center text-gray-400 text-sm py-6">
          <p>Aún no tienes reservas</p>
          <p className="font-medium text-gray-700 mt-1">
            Encuentra tu próximo servicio en Reservo
          </p>
        </div>
      )}
    </div>
  );
};
//endregion

export default CL0001_Home;
