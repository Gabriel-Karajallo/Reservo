import { useState } from "react";
import { Navigate } from "react-router-dom";
import { loginUser, loginWithGoogle } from "../services/firebase/authService";
import { useAuth } from "../hooks/useAuth";
import { Icons } from "../assets/icons";
import type { FirebaseError } from "firebase/app";
import "../styles/login.css";

// region Definicion de variables
const Login = () => {
  const { user, userData, loading, loadingUserData } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localLoading, setLocalLoading] = useState(false);
  const [error, setError] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  // ============================================================
  // 🔥 VALIDACIONES LOCALES
  // ============================================================
  const validarEmail = () => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email)) return "Introduce un email válido.";
    return null;
  };

  const validarPassword = () => {
    if (password.length < 6)
      return "La contraseña debe tener al menos 6 caracteres.";
    return null;
  };

  // ============================================================
  // 🔥 REDIRECCIÓN AUTOMÁTICA SI YA ESTÁ LOGEADO
  // ============================================================
  if (!loading && !loadingUserData && user && userData) {
    const rol = userData.rol;
    if (rol === "cliente") return <Navigate to="/cliente/home" replace />;
    if (rol === "empresa") return <Navigate to="/empresa/panel" replace />;
    if (rol === "admin") return <Navigate to="/admin/panel" replace />;
  }

  // ============================================================
  // 🔓 LOGIN NORMAL
  // ============================================================
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validaciones antes de enviar
    const emailErr = validarEmail();
    const passErr = validarPassword();

    if (emailErr || passErr) {
      setError(emailErr || passErr || "");
      return;
    }

    setLocalLoading(true);

    try {
      await loginUser(email, password);
      // redirect lo hace AuthProvider automáticamente
    } catch (err) {
      const error = err as FirebaseError;

      switch (error.code) {
        case "auth/invalid-credential":
          setError("Email o contraseña incorrectos.");
          break;

        case "auth/user-not-found":
          setError("No existe una cuenta con este email.");
          break;

        case "auth/wrong-password":
          setError("La contraseña es incorrecta.");
          break;

        case "auth/invalid-email":
          setError("El email no es válido.");
          break;

        default:
          setError("No se pudo iniciar sesión. Intenta nuevamente.");
      }
    } finally {
      setLocalLoading(false);
    }
  };

  // ============================================================
  // 🔑 LOGIN CON GOOGLE
  // ============================================================
  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch {
      setError("No se pudo iniciar sesión con Google.");
    }
  };
  // end region

  // region Renderizado
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
        <div className="flex justify-center mb-6">
          <img src="../logo.png" alt="Reservo logo" className="h-50 w-auto" />
        </div>

        {/* FORM */}
        <form onSubmit={handleLogin} className="space-y-5">
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

          {/* LOGIN BUTTON */}
          <button
            type="submit"
            disabled={localLoading || loading}
            className="w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 login-btn"
          >
            {localLoading ? (
              <Icons.spinner size={20} className="animate-spin" />
            ) : (
              <>
                <Icons.login size={18} />
                Iniciar sesión
              </>
            )}
          </button>
        </form>

        {/* DIVIDER */}
        <div className="flex items-center my-5">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="px-3 text-xs text-gray-400">o</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* GOOGLE */}
        <button
          onClick={handleGoogleLogin}
          disabled={localLoading}
          className="w-full py-3 rounded-xl border border-gray-200 flex items-center justify-center gap-3 text-gray-600 hover:bg-gray-50 transition"
        >
          <img src="../google.png" alt="Google" className="h-5" />
          Continuar con Google
        </button>

        {/* REGISTER */}
        <p className="text-center text-sm text-gray-500 mt-5">
          ¿No tienes cuenta?{" "}
          <a href="/registro" className="font-semibold text-[#1f2a44]">
            Crear cuenta
          </a>
        </p>
      </div>
    </div>
  );
};
// end region

export default Login;
