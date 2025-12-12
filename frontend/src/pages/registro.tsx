import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../services/firebase/firebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import { Icons } from "../assets/icons";
import "../styles/login.css"; // reutilizamos estilos del login

const Registro = () => {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegistro = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Crear usuario en Auth
      const resp = await createUserWithEmailAndPassword(auth, email, password);
      const uid = resp.user.uid;

      // 2. Crear documento en Firestore
      await setDoc(doc(db, "usuarios", uid), {
        nombre,
        email,
        rol: "cliente",
      });

      // Listo: login automático → redirige el AuthContext
    } catch {
      setError("No se pudo crear la cuenta. Intenta con otro correo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center login-wrapper px-4">
      <div className="login-card bg-white shadow-xl rounded-2xl p-8 md:p-10">
        {/* Logo */}
        <div className="flex justify-center">
          <img src="../logo.png" alt="Reservo logo" className="h-50 w-auto" />
        </div>

        {/* Título */}
        <h2 className="text-xl font-semibold text-center text-gray-700 mb-4">
          Crear cuenta de cliente
        </h2>

        <form onSubmit={handleRegistro} className="space-y-6">
          {/* Nombre */}
          <div>
            <label className="block text-gray-600 mb-1">Nombre completo</label>
            <div className="flex items-center gap-2 rounded-lg px-3 py-2 input-box">
              <Icons.user size={20} className="text-gray-500" />
              <input
                type="text"
                placeholder="Juan Pérez"
                className="flex-1 bg-transparent outline-none"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-gray-600 mb-1">Email</label>
            <div className="flex items-center gap-2 rounded-lg px-3 py-2 input-box">
              <Icons.mail size={20} className="text-gray-500" />
              <input
                type="email"
                placeholder="ejemplo@correo.com"
                className="flex-1 bg-transparent outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Contraseña */}
          <div>
            <label className="block text-gray-600 mb-1">Contraseña</label>
            <div className="flex items-center gap-2 rounded-lg px-3 py-2 input-box">
              <Icons.lock size={20} className="text-gray-500" />
              <input
                type="password"
                placeholder="•••••••••"
                className="flex-1 bg-transparent outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Error */}
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          {/* Botón Crear cuenta */}
          <button
            type="submit"
            disabled={loading}
            className="
              w-full text-white py-3 rounded-lg 
              flex items-center justify-center gap-2 
              font-semibold login-btn
            "
          >
            {loading ? (
              <Icons.spinner size={20} className="animate-spin" />
            ) : (
              <>
                <Icons.check size={20} />
                Crear cuenta
              </>
            )}
          </button>
        </form>

        {/* Link Login */}
        <p className="text-center text-gray-600 mt-6">
          ¿Ya tienes una cuenta?{" "}
          <a
            href="/login"
            className="font-semibold"
            style={{ color: "#0f6f63" }}
          >
            Iniciar sesión
          </a>
        </p>
      </div>
    </div>
  );
};

export default Registro;
