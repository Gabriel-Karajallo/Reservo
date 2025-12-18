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
  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* ================= CABECERA ================= */}
      <header>
        <h1 className="text-2xl font-semibold text-gray-900">
          Perfil de la empresa
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Gestiona la imagen pública de tu negocio
        </p>
      </header>

      {subiendoImagen && (
        <div className="text-sm text-gray-500">Subiendo imagen…</div>
      )}

      {/* ================= PORTADA + LOGO ================= */}
      <section className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Portada */}
        <div className="relative h-48 bg-gray-200">
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

          {/* Input portada */}
          <label className="absolute top-3 right-3 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer shadow">
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

          {/* Logo */}
          <div className="absolute -bottom-10 left-6">
            <div className="w-24 h-24 rounded-full bg-white shadow-md overflow-hidden flex items-center justify-center">
              {negocio.logoUrl ? (
                <img
                  src={negocio.logoUrl}
                  loading="lazy"
                  alt="Logo"
                  className="w-full h-full object-cover bg-gray-200"
                />
              ) : (
                <span className="text-xs text-gray-400">Sin logo</span>
              )}
            </div>

            {/* Input logo */}
            <label className="block text-xs text-center mt-2 text-[#0f6f63] font-medium cursor-pointer">
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

        {/* Espacio para que no pise el logo */}
        <div className="h-14" />
      </section>

      {/* ================= GALERÍA ================= */}
      <section className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">
            Galería del negocio
          </h2>

          <label className="text-sm font-medium text-[#0f6f63] cursor-pointer">
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

        {(!negocio.galeriaUrls || negocio.galeriaUrls.length === 0) && (
          <p className="text-sm text-gray-500">
            Aún no has subido imágenes a la galería
          </p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {negocio.galeriaUrls?.map((url) => (
            <ImagenGaleria key={url} url={url} />
          ))}
        </div>
      </section>

      {/* SERVICIOS */}
      <section className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between mb-4">
          <h2 className="text-lg font-medium">Servicios</h2>
          <button
            onClick={() => setMostrandoFormulario(true)}
            className="bg-[#0f6f63] text-white px-4 py-2 rounded text-sm"
          >
            Añadir servicio
          </button>
        </div>

        {mostrandoFormulario && (
          <div className="border p-4 rounded mb-4 space-y-3 bg-gray-50">
            <input
              placeholder="Nombre"
              className="w-full border rounded px-3 py-2"
              value={nuevoServicio.nombre}
              onChange={(e) =>
                setNuevoServicio({ ...nuevoServicio, nombre: e.target.value })
              }
            />
            <input
              type="number"
              placeholder="Duración (min)"
              className="w-full border rounded px-3 py-2"
              value={nuevoServicio.duracion}
              onChange={(e) =>
                setNuevoServicio({ ...nuevoServicio, duracion: e.target.value })
              }
            />
            <input
              type="number"
              placeholder="Precio (€)"
              className="w-full border rounded px-3 py-2"
              value={nuevoServicio.precio}
              onChange={(e) =>
                setNuevoServicio({ ...nuevoServicio, precio: e.target.value })
              }
            />

            <div className="flex gap-2">
              <button
                onClick={crearServicio}
                className="bg-[#0f6f63] text-white px-4 py-2 rounded text-sm"
              >
                Guardar
              </button>
              <button
                onClick={() => setMostrandoFormulario(false)}
                className="border px-4 py-2 rounded text-sm"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        <ul className="space-y-3">
          {servicios.map((s) => (
            <li
              key={s.id}
              className="border p-3 rounded bg-white shadow-sm space-y-3"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{s.nombre}</p>
                  <p className="text-sm text-gray-500">
                    {s.duracion} min · {s.precio} €
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setServicioEditando(s);
                      setServicioEditado({
                        nombre: s.nombre,
                        duracion: String(s.duracion),
                        precio: String(s.precio),
                      });
                    }}
                    className="text-[#0f6f63]"
                  >
                    <Icons.edit size={18} />
                  </button>

                  <button
                    onClick={() => eliminarServicio(s.id)}
                    className="text-red-600"
                  >
                    <Icons.trash size={18} />
                  </button>
                </div>
              </div>

              {/* FORMULARIO EDICIÓN */}
              {servicioEditando?.id === s.id && (
                <div className="border rounded p-4 bg-gray-50 space-y-3">
                  <input
                    className="w-full border rounded px-3 py-2"
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
                      className="border rounded px-3 py-2"
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
                      className="border rounded px-3 py-2"
                      value={servicioEditado.precio}
                      onChange={(e) =>
                        setServicioEditado({
                          ...servicioEditado,
                          precio: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={guardarEdicionServicio}
                      className="bg-[#0f6f63] text-white px-4 py-2 rounded text-sm"
                    >
                      Guardar
                    </button>

                    <button
                      onClick={() => setServicioEditando(null)}
                      className="border px-4 py-2 rounded text-sm"
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

      {/* HORARIOS */}
      <EM0003_Horarios
        horariosIniciales={negocio.horarios ?? horariosPorDefecto}
        onGuardar={guardarHorarios}
      />
    </div>
  );
  //endregion
};

export default EM0003_Perfil;
