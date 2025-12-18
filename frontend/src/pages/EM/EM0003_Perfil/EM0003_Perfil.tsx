import { useEffect, useState } from "react";
import { auth, db } from "../../../services/firebase/firebaseConfig";
import EM0003_Horarios from "./EM0003_Horarios";
import { redimensionarImagen } from "./EM0003_Imagenes";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import ImagenGaleria from "./imagenesGaleria";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";

import { Icons } from "../../../assets/icons";
import type {
  Negocio,
  Servicio,
  HorariosSemana,
} from "../../../types/firebase";

/* =========================
   HORARIOS POR DEFECTO
========================== */
const horariosPorDefecto: HorariosSemana = {
  lunes: { activo: true, tramos: [{ inicio: "09:00", fin: "14:00" }] },
  martes: { activo: true, tramos: [{ inicio: "09:00", fin: "14:00" }] },
  miercoles: { activo: true, tramos: [{ inicio: "09:00", fin: "14:00" }] },
  jueves: { activo: true, tramos: [{ inicio: "09:00", fin: "14:00" }] },
  viernes: { activo: true, tramos: [{ inicio: "09:00", fin: "14:00" }] },
  sabado: { activo: false, tramos: [] },
  domingo: { activo: false, tramos: [] },
};

const EM0003_Perfil = () => {
  /* =========================
     ESTADO
  ========================== */
  const [negocio, setNegocio] = useState<Negocio | null>(null);
  const [subiendoImagen, setSubiendoImagen] = useState(false);

  /* =========================
     FIREBASE STORAGE
  ========================== */
  const storage = getStorage();

  const subirImagen = async (archivo: File, ruta: string): Promise<string> => {
    const referencia = ref(storage, ruta);
    await uploadBytes(referencia, archivo);
    return await getDownloadURL(referencia);
  };

  /* =========================
   SUBIR LOGO
========================== */
  const subirLogo = async (file: File) => {
    if (!negocio) return;

    setSubiendoImagen(true);

    // 🔧 OPTIMIZACIÓN
    const imagenOptimizada = await redimensionarImagen(file, 300, 300);

    const url = await subirImagen(
      imagenOptimizada,
      `negocios/${negocio.id}/logo.jpg`
    );

    await updateDoc(doc(db, "negocios", negocio.id), {
      logoUrl: url,
    });

    setNegocio({
      ...negocio,
      logoUrl: url,
    });

    setSubiendoImagen(false);
  };

  /* =========================
   SUBIR PORTADA
========================== */
  const subirPortada = async (file: File) => {
    if (!negocio) return;

    setSubiendoImagen(true);

    // 🔧 OPTIMIZACIÓN
    const imagenOptimizada = await redimensionarImagen(file, 1600, 900);

    const url = await subirImagen(
      imagenOptimizada,
      `negocios/${negocio.id}/portada.jpg`
    );

    await updateDoc(doc(db, "negocios", negocio.id), {
      portadaUrl: url,
    });

    setNegocio({
      ...negocio,
      portadaUrl: url,
    });

    setSubiendoImagen(false);
  };

  /* =========================
     SUBIR IMAGEN GALERÍA
  ========================== */
  const subirImagenGaleria = async (file: File) => {
    if (!negocio) return;

    const imagenOptimizada = await redimensionarImagen(file, 1200, 1200);

    const nombre = crypto.randomUUID();
    const url = await subirImagen(
      imagenOptimizada,
      `negocios/${negocio.id}/galeria/${nombre}.jpg`
    );

    const nuevasUrls = [...(negocio.galeriaUrls ?? []), url];

    await updateDoc(doc(db, "negocios", negocio.id), {
      galeriaUrls: nuevasUrls,
    });

    setNegocio({ ...negocio, galeriaUrls: nuevasUrls });
  };

  /* =========================
     ESTADO
  ========================== */
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [cargando, setCargando] = useState(true);

  const [mostrandoFormulario, setMostrandoFormulario] = useState(false);
  const [nuevoServicio, setNuevoServicio] = useState({
    nombre: "",
    duracion: "",
    precio: "",
  });

  const [servicioEditando, setServicioEditando] = useState<Servicio | null>(
    null
  );

  const [servicioEditado, setServicioEditado] = useState({
    nombre: "",
    duracion: "",
    precio: "",
  });

  /* =========================
     FIREBASE · SERVICIOS
  ========================== */
  const cargarServicios = async (negocioId: string) => {
    const consulta = query(
      collection(db, "servicios"),
      where("negocioId", "==", negocioId)
    );

    const resultado = await getDocs(consulta);

    const lista: Servicio[] = resultado.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Servicio, "id">),
    }));

    setServicios(lista);
  };

  const crearServicio = async () => {
    if (!negocio) return;

    await addDoc(collection(db, "servicios"), {
      nombre: nuevoServicio.nombre,
      duracion: Number(nuevoServicio.duracion),
      precio: Number(nuevoServicio.precio),
      negocioId: negocio.id,
    });

    setNuevoServicio({ nombre: "", duracion: "", precio: "" });
    setMostrandoFormulario(false);
    cargarServicios(negocio.id);
  };

  const eliminarServicio = async (servicioId: string) => {
    await deleteDoc(doc(db, "servicios", servicioId));
    if (negocio) cargarServicios(negocio.id);
  };

  const guardarEdicionServicio = async () => {
    if (!servicioEditando || !negocio) return;

    await updateDoc(doc(db, "servicios", servicioEditando.id), {
      nombre: servicioEditado.nombre,
      duracion: Number(servicioEditado.duracion),
      precio: Number(servicioEditado.precio),
    });

    setServicioEditando(null);
    cargarServicios(negocio.id);
  };

  /* =========================
     FIREBASE · HORARIOS
  ========================== */
  const guardarHorarios = async (horarios: HorariosSemana) => {
    if (!negocio) return;

    await updateDoc(doc(db, "negocios", negocio.id), {
      horarios,
    });

    setNegocio({ ...negocio, horarios });
  };

  /* =========================
     FIREBASE · NEGOCIO
  ========================== */
  useEffect(() => {
    const cargarNegocio = async () => {
      const usuario = auth.currentUser;
      if (!usuario) return;

      const consulta = query(
        collection(db, "negocios"),
        where("usuarioPropietarioId", "==", usuario.uid)
      );

      const resultado = await getDocs(consulta);

      if (!resultado.empty) {
        const docu = resultado.docs[0];

        const negocioEncontrado: Negocio = {
          id: docu.id,
          ...(docu.data() as Omit<Negocio, "id">),
        };

        setNegocio(negocioEncontrado);
        cargarServicios(docu.id);
      }

      setCargando(false);
    };

    cargarNegocio();
  }, []);

  /* =========================
     RENDER
  ========================== */
  if (cargando) return <p>Cargando perfil…</p>;
  if (!negocio) return <p>No se encontró negocio</p>;

  //region renderizado
  //region renderizado
  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 space-y-16 pb-24">
      {subiendoImagen && (
        <div className="text-sm text-gray-500">Subiendo imagen…</div>
      )}

      {/* ================= INTRO ================= */}
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
          Perfil de empresa
        </h1>
        <p className="text-sm text-gray-500 max-w-2xl">
          Configura los detalles de tu empresa. Esta información será visible
          para los clientes en Reservo.
        </p>
      </header>

      {/* ================= FILA 1 · IDENTIDAD + DETALLES ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* PORTADA + LOGO */}
        <section className="col-span-2 bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="relative h-56 bg-gray-200">
            {negocio.portadaUrl ? (
              <img
                src={negocio.portadaUrl}
                alt="Portada"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                Portada no configurada
              </div>
            )}

            <label className="absolute top-4 right-4 bg-white/80 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-medium cursor-pointer shadow-sm hover:bg-white transition">
              Cambiar portada
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    subirPortada(e.target.files[0]);
                  }
                }}
              />
            </label>

            <div className="absolute -bottom-12 left-8">
              <div className="w-28 h-28 rounded-full bg-white shadow-lg ring-4 ring-white overflow-hidden flex items-center justify-center">
                {negocio.logoUrl ? (
                  <img
                    src={negocio.logoUrl}
                    alt="Logo"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xs text-gray-400">Sin logo</span>
                )}
              </div>

              <label className="block text-xs text-center mt-3 text-[#0f6f63] font-medium cursor-pointer hover:opacity-80 transition">
                Cambiar logo
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      subirLogo(e.target.files[0]);
                    }
                  }}
                />
              </label>
            </div>
          </div>

          <div className="h-20" />
        </section>

        {/* DETALLES EMPRESA */}
        <section className="bg-white rounded-2xl shadow-sm p-8 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Detalles de la empresa
          </h2>

          <div className="space-y-3 text-sm text-gray-700">
            <p>
              <span className="font-medium">Nombre:</span> {negocio.nombre}
            </p>
            <p>
              <span className="font-medium">Dirección:</span> —
            </p>
            <p>
              <span className="font-medium">Teléfono:</span> —
            </p>
            <p className="text-gray-500">
              Descripción del negocio, qué servicios ofrece, ambiente, etc.
            </p>
          </div>
        </section>
      </div>

      {/* ================= FILA 2 · GALERÍA + EMPLEADOS ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* GALERÍA */}
        <section className="col-span-2 bg-white rounded-2xl shadow-sm p-8 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Galería</h2>

            <label className="text-sm font-medium text-[#0f6f63] cursor-pointer hover:opacity-80 transition">
              Añadir imágenes
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (!e.target.files) return;
                  Array.from(e.target.files).forEach(subirImagenGaleria);
                }}
              />
            </label>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {negocio.galeriaUrls?.map((url) => (
              <ImagenGaleria key={url} url={url} />
            ))}
          </div>
        </section>

        {/* EMPLEADOS */}
        <section className="bg-white rounded-2xl shadow-sm p-8 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Empleados</h2>

            <button className="text-sm font-medium text-[#0f6f63]">
              Añadir
            </button>
          </div>

          <div className="space-y-4 overflow-y-auto pr-2 max-h-[360px]">
            {/* CARD EMPLEADO */}
            <div className="flex items-center gap-4 rounded-xl border border-gray-100 p-3">
              <div className="w-12 h-12 rounded-full bg-gray-200" />
              <div>
                <p className="text-sm font-medium">Nombre empleado</p>
                <p className="text-xs text-gray-500">Puesto</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ================= FILA 3 · SERVICIOS + HORARIOS ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ================= SERVICIOS ================= */}
        <section className="bg-white rounded-2xl shadow-sm p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Servicios</h2>

            <button
              onClick={() => setMostrandoFormulario(true)}
              className="bg-[#0f6f63] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition"
            >
              Añadir servicio
            </button>
          </div>

          {mostrandoFormulario && (
            <div className="rounded-xl bg-gray-50 border border-gray-200 p-6 space-y-4 mb-6">
              <input
                placeholder="Nombre"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0f6f63]/30"
                value={nuevoServicio.nombre}
                onChange={(e) =>
                  setNuevoServicio({
                    ...nuevoServicio,
                    nombre: e.target.value,
                  })
                }
              />

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder="Duración (min)"
                  className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0f6f63]/30"
                  value={nuevoServicio.duracion}
                  onChange={(e) =>
                    setNuevoServicio({
                      ...nuevoServicio,
                      duracion: e.target.value,
                    })
                  }
                />

                <input
                  type="number"
                  placeholder="Precio (€)"
                  className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0f6f63]/30"
                  value={nuevoServicio.precio}
                  onChange={(e) =>
                    setNuevoServicio({
                      ...nuevoServicio,
                      precio: e.target.value,
                    })
                  }
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={crearServicio}
                  className="bg-[#0f6f63] text-white px-5 py-2 rounded-lg text-sm font-medium"
                >
                  Guardar
                </button>
                <button
                  onClick={() => setMostrandoFormulario(false)}
                  className="px-5 py-2 rounded-lg text-sm border border-gray-300"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* LISTA CON SCROLL */}
          <ul className="space-y-4 overflow-y-auto pr-2 max-h-[520px]">
            {servicios.map((s) => (
              <li
                key={s.id}
                className="rounded-xl border border-gray-100 bg-white p-4 hover:shadow-md transition"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">{s.nombre}</p>
                    <p className="text-sm text-gray-500">
                      {s.duracion} min · {s.precio} €
                    </p>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => {
                        setServicioEditando(s);
                        setServicioEditado({
                          nombre: s.nombre,
                          duracion: String(s.duracion),
                          precio: String(s.precio),
                        });
                      }}
                      className="text-gray-400 hover:text-[#0f6f63] transition"
                    >
                      <Icons.edit size={18} />
                    </button>

                    <button
                      onClick={() => eliminarServicio(s.id)}
                      className="text-gray-400 hover:text-red-600 transition"
                    >
                      <Icons.trash size={18} />
                    </button>
                  </div>
                </div>

                {servicioEditando?.id === s.id && (
                  <div className="mt-4 rounded-xl bg-gray-50 border border-gray-200 p-6 space-y-4">
                    <input
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0f6f63]/30"
                      value={servicioEditado.nombre}
                      onChange={(e) =>
                        setServicioEditado({
                          ...servicioEditado,
                          nombre: e.target.value,
                        })
                      }
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="number"
                        className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0f6f63]/30"
                        value={servicioEditado.duracion}
                        onChange={(e) =>
                          setServicioEditado({
                            ...servicioEditado,
                            duracion: e.target.value,
                          })
                        }
                      />

                      <input
                        type="number"
                        className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0f6f63]/30"
                        value={servicioEditado.precio}
                        onChange={(e) =>
                          setServicioEditado({
                            ...servicioEditado,
                            precio: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={guardarEdicionServicio}
                        className="bg-[#0f6f63] text-white px-5 py-2 rounded-lg text-sm font-medium"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={() => setServicioEditando(null)}
                        className="px-5 py-2 rounded-lg text-sm border border-gray-300"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>

        {/* ================= HORARIOS ================= */}
        <section className="bg-white rounded-2xl shadow-sm p-8">
          <EM0003_Horarios
            horariosIniciales={negocio.horarios ?? horariosPorDefecto}
            onGuardar={guardarHorarios}
          />
        </section>
      </div>
    </div>
  );
  //endregion
};

export default EM0003_Perfil;
