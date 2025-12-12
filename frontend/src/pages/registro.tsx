import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../services/firebase/firebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import { Icons } from "../assets/icons";
import type { FirebaseError } from "firebase/app";
import "../styles/login.css";

const Registro = () => {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [mostrarPassword, setMostrarPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ------------------------------
  //  VALIDACIONES
  // ------------------------------
  const validarNombre = (): string | null => {
    if (nombre.trim().length < 3)
      return "El nombre debe tener al menos 3 caracteres.";
    return null;
  };

  const validarEmail = (): string | null => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email)) return "Introduce un email válido.";
    return null;
  };

  const validarPassword = (): string | null => {
    if (password.length < 6)
      return "La contraseña debe tener al menos 6 caracteres.";

    if (!/\d/.test(password))
      return "La contraseña debe incluir al menos un número.";

    return null;
  };

  // ------------------------------
  //  SUBMIT
  // ------------------------------
  const handleRegistro = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const nombreErr = validarNombre();
    const emailErr = validarEmail();
    const passErr = validarPassword();

    if (nombreErr || emailErr || passErr) {
      setError(nombreErr || emailErr || passErr || "");
      return;
    }

    try {
      setLoading(true);

      const resp = await createUserWithEmailAndPassword(auth, email, password);
      const uid = resp.user.uid;

      await setDoc(doc(db, "usuarios", uid), {
        nombre,
        email,
        rol: "cliente",
      });

      setSuccess("Cuenta creada correctamente 🎉");

      setTimeout(() => {
        window.location.href = "/login";
      }, 1200);
    } catch (err) {
      const errorFirebase = err as FirebaseError;

      switch (errorFirebase.code) {
        case "auth/email-already-in-use":
          setError("Este email ya está registrado.");
          break;

        case "auth/invalid-email":
          setError("El email no es válido.");
          break;

        case "auth/weak-password":
          setError("La contraseña es demasiado débil.");
          break;

        default:
          setError("No se pudo crear la cuenta. Intenta nuevamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------
  //  UI
  // ------------------------------
  return (
    <div className="min-h-screen flex items-center justify-center login-wrapper px-4">
      <div className="login-card bg-white shadow-xl rounded-2xl p-8 md:p-10">
        {/* Logo */}
        <div className="flex justify-center mb-3">
          <img src="../logo.png" alt="Reservo logo" className="h-50 w-auto" />
        </div>

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
                type={mostrarPassword ? "text" : "password"}
                placeholder="•••••••••"
                className="flex-1 bg-transparent outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <button
                type="button"
                onClick={() => setMostrarPassword((prev) => !prev)}
                className="text-gray-500 hover:text-gray-700"
              >
                {mostrarPassword ? (
                  <Icons.eyeClosed size={20} />
                ) : (
                  <Icons.eye size={20} />
                )}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          {/* Éxito */}
          {success && (
            <p className="text-green-600 text-sm text-center font-semibold">
              {success}
            </p>
          )}

          {/* Botón */}
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
