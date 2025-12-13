import { useEffect, useState } from "react";
import { auth, db } from "../../../services/firebase/firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

import { Pencil, Trash2 } from "lucide-react";
import type { Negocio, Servicio } from "../../../types/firebase";

const EM0003_Perfil = () => {
  /* =========================
     ESTADO
  ========================== */
  const [negocio, setNegocio] = useState<Negocio | null>(null);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [cargando, setCargando] = useState(true);

  // Formulario crear
  const [mostrandoFormulario, setMostrandoFormulario] = useState(false);
  const [nuevoServicio, setNuevoServicio] = useState({
    nombre: "",
    duracion: "",
    precio: "",
  });

  // Formulario editar
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

    const listaServicios: Servicio[] = resultado.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Servicio, "id">),
    }));

    setServicios(listaServicios);
  };

  /* Crear servicio */
  const guardarServicio = async () => {
    if (!negocio) return;

    if (
      nuevoServicio.nombre.trim() === "" ||
      nuevoServicio.duracion === "" ||
      nuevoServicio.precio === ""
    ) {
      alert("Completa todos los campos");
      return;
    }

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

  /* Editar servicio */
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

  /* Eliminar servicio */
  const eliminarServicio = async (servicioId: string) => {
    await deleteDoc(doc(db, "servicios", servicioId));
    if (negocio) cargarServicios(negocio.id);
  };

  /* =========================
     FIREBASE · NEGOCIO
  ========================== */
  useEffect(() => {
    const cargarNegocio = async () => {
      const usuario = auth.currentUser;
      if (!usuario) {
        setCargando(false);
        return;
      }

      const consulta = query(
        collection(db, "negocios"),
        where("usuarioPropietarioId", "==", usuario.uid)
      );

      const resultado = await getDocs(consulta);

      if (!resultado.empty) {
        const documento = resultado.docs[0];

        const negocioEncontrado: Negocio = {
          id: documento.id,
          ...(documento.data() as Omit<Negocio, "id">),
        };

        setNegocio(negocioEncontrado);
        cargarServicios(documento.id);
      }

      setCargando(false);
    };

    cargarNegocio();
  }, []);

  /* =========================
     RENDER · ESTADOS
  ========================== */
  if (cargando) return <p className="text-gray-600">Cargando perfil...</p>;

  if (!negocio)
    return <p className="text-red-600">No se encontró un negocio asociado.</p>;

  /* =========================
     RENDER · UI
  ========================== */
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* CABECERA */}
      <header>
        <h1 className="text-2xl font-semibold">Perfil de la empresa</h1>
        <p className="text-gray-600">
          Gestiona la información pública de tu negocio
        </p>
      </header>

      {/* INFORMACIÓN DEL NEGOCIO */}
      <section className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-medium mb-4">Información del negocio</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600">Nombre</label>
            <input
              type="text"
              value={negocio.nombre}
              disabled
              className="mt-1 w-full border rounded px-3 py-2 bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600">Dirección</label>
            <input
              type="text"
              value={negocio.direccion}
              disabled
              className="mt-1 w-full border rounded px-3 py-2 bg-gray-100"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm text-gray-600">Descripción</label>
            <textarea
              value={negocio.descripcion}
              disabled
              rows={3}
              className="mt-1 w-full border rounded px-3 py-2 bg-gray-100"
            />
          </div>
        </div>
      </section>

      {/* SERVICIOS */}
      <section className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">Servicios</h2>

          <button
            onClick={() => setMostrandoFormulario(true)}
            className="px-4 py-2 rounded bg-[#0f6f63] text-white text-sm"
          >
            Añadir servicio
          </button>
        </div>

        {/* FORMULARIO NUEVO SERVICIO */}
        {mostrandoFormulario && (
          <div className="border rounded p-4 mb-4 space-y-3 bg-gray-50">
            <div>
              <label className="block text-sm text-gray-600">
                Nombre del servicio
              </label>
              <input
                type="text"
                value={nuevoServicio.nombre}
                onChange={(e) =>
                  setNuevoServicio({
                    ...nuevoServicio,
                    nombre: e.target.value,
                  })
                }
                className="mt-1 w-full border rounded px-3 py-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600">
                  Duración (min)
                </label>
                <input
                  type="number"
                  value={nuevoServicio.duracion}
                  onChange={(e) =>
                    setNuevoServicio({
                      ...nuevoServicio,
                      duracion: e.target.value,
                    })
                  }
                  className="mt-1 w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600">
                  Precio (€)
                </label>
                <input
                  type="number"
                  value={nuevoServicio.precio}
                  onChange={(e) =>
                    setNuevoServicio({
                      ...nuevoServicio,
                      precio: e.target.value,
                    })
                  }
                  className="mt-1 w-full border rounded px-3 py-2"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={guardarServicio}
                className="px-4 py-2 rounded bg-[#0f6f63] text-white text-sm"
              >
                Guardar
              </button>

              <button
                onClick={() => setMostrandoFormulario(false)}
                className="px-4 py-2 rounded border text-sm"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* LISTADO DE SERVICIOS */}
        <ul className="space-y-3">
          {servicios.map((servicio) => (
            <li
              key={servicio.id}
              className="border rounded p-3 bg-white shadow-sm"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{servicio.nombre}</p>
                  <p className="text-sm text-gray-500">
                    {servicio.duracion} min · {servicio.precio} €
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setServicioEditando(servicio);
                      setServicioEditado({
                        nombre: servicio.nombre,
                        duracion: String(servicio.duracion),
                        precio: String(servicio.precio),
                      });
                    }}
                    className="text-[#0f6f63]"
                  >
                    <Pencil size={18} />
                  </button>

                  <button
                    onClick={() => eliminarServicio(servicio.id)}
                    className="text-red-600"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* FORMULARIO EDICIÓN */}
              {servicioEditando?.id === servicio.id && (
                <div className="mt-4 border rounded p-4 bg-gray-50 space-y-3">
                  <div>
                    <label className="block text-sm text-gray-600">
                      Nombre del servicio
                    </label>
                    <input
                      type="text"
                      value={servicioEditado.nombre}
                      onChange={(e) =>
                        setServicioEditado({
                          ...servicioEditado,
                          nombre: e.target.value,
                        })
                      }
                      className="mt-1 w-full border rounded px-3 py-2"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600">
                        Duración (min)
                      </label>
                      <input
                        type="number"
                        value={servicioEditado.duracion}
                        onChange={(e) =>
                          setServicioEditado({
                            ...servicioEditado,
                            duracion: e.target.value,
                          })
                        }
                        className="mt-1 w-full border rounded px-3 py-2"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-600">
                        Precio (€)
                      </label>
                      <input
                        type="number"
                        value={servicioEditado.precio}
                        onChange={(e) =>
                          setServicioEditado({
                            ...servicioEditado,
                            precio: e.target.value,
                          })
                        }
                        className="mt-1 w-full border rounded px-3 py-2"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={guardarEdicionServicio}
                      className="px-4 py-2 rounded bg-[#0f6f63] text-white text-sm"
                    >
                      Guardar cambios
                    </button>

                    <button
                      onClick={() => setServicioEditando(null)}
                      className="px-4 py-2 rounded border text-sm"
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
      <section className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-medium mb-2">Horarios</h2>
        <p className="text-gray-500 text-sm">
          Configura los horarios de atención de tu negocio.
        </p>
      </section>
    </div>
  );
};

export default EM0003_Perfil;
