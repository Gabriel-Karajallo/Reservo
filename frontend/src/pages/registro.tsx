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
    <div className="h-screen flex items-center justify-center bg-linear-to-b from-white to-[#1f2a44]/4 px-4">
      <div
        className="
        w-full max-w-sm bg-white rounded-3xl px-6 py-7
        shadow-[0_20px_60px_-20px_rgba(31,42,68,0.25)]
        ring-1 ring-[#1f2a44]/5
      "
      >
        {/* LOGO */}
        <div className="flex justify-center mb-4">
          <img src="../logo.png" alt="Reservo logo" className="h-50 w-auto" />
        </div>

        {/* TITLE */}
        <h2 className="text-center text-sm font-medium text-gray-500 mb-5">
          Crear cuenta
        </h2>

        {/* FORM */}
        <form onSubmit={handleRegistro} className="space-y-4">
          {/* NOMBRE */}
          <div className="flex items-center gap-3 rounded-xl px-4 py-3 bg-gray-50 border border-gray-200 focus-within:border-[#1f2a44] transition">
            <Icons.user size={20} className="text-gray-400" />
            <input
              type="text"
              placeholder="Nombre completo"
              className="flex-1 bg-transparent outline-none text-sm"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>

          {/* EMAIL */}
          <div className="flex items-center gap-3 rounded-xl px-4 py-3 bg-gray-50 border border-gray-200 focus-within:border-[#1f2a44] transition">
            <Icons.mail size={20} className="text-gray-400" />
            <input
              type="email"
              placeholder="Email"
              className="flex-1 bg-transparent outline-none text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* PASSWORD */}
          <div className="flex items-center gap-3 rounded-xl px-4 py-3 bg-gray-50 border border-gray-200 focus-within:border-[#1f2a44] transition">
            <Icons.lock size={20} className="text-gray-400" />
            <input
              type={mostrarPassword ? "text" : "password"}
              placeholder="Contraseña"
              className="flex-1 bg-transparent outline-none text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setMostrarPassword(!mostrarPassword)}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              {mostrarPassword ? (
                <Icons.eyeClosed size={18} />
              ) : (
                <Icons.eye size={18} />
              )}
            </button>
          </div>

          {/* ERROR */}
          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          {/* SUCCESS */}
          {success && (
            <p className="text-sm text-green-600 text-center font-medium">
              {success}
            </p>
          )}

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 login-btn"
          >
            {loading ? (
              <Icons.spinner size={20} className="animate-spin" />
            ) : (
              <>
                <Icons.check size={18} />
                Crear cuenta
              </>
            )}
          </button>
        </form>

        {/* LOGIN LINK */}
        <p className="text-center text-sm text-gray-500 mt-5">
          ¿Ya tienes cuenta?{" "}
          <a href="/login" className="font-semibold text-[#1f2a44]">
            Iniciar sesión
          </a>
        </p>
      </div>
    </div>
  );
};

export default Registro;
