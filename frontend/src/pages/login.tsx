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
    <div className="min-h-screen flex items-center justify-center login-wrapper px-10">
      <div className="login-card bg-white shadow-xl rounded-2xl p-8 md:p-10">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img src="../logo.png" alt="Reservo logo" className="h-50 w-auto" />
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {/* Email */}
          <div>
            <label className="block text-gray-600 mb-1">Email</label>
            <div className="flex items-center gap-2 rounded-lg px-3 py-2 input-box">
              <Icons.mail size={20} className="text-gray-500" />
              <input
                type="email"
                className="flex-1 bg-transparent outline-none"
                placeholder="ejemplo@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                className="flex-1 bg-transparent outline-none"
                placeholder="•••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              {/* Botón mostrar/ocultar */}
              <button
                type="button"
                onClick={() => setMostrarPassword(!mostrarPassword)}
                className="text-gray-500 hover:text-gray-700 transition"
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

          {/* Botón LOGIN */}
          <button
            type="submit"
            disabled={localLoading || loading}
            className="
              w-full text-white py-3 rounded-lg 
              flex items-center justify-center gap-2 
              font-semibold login-btn
            "
          >
            {localLoading ? (
              <Icons.spinner size={20} className="animate-spin" />
            ) : (
              <>
                <Icons.login size={20} />
                Iniciar Sesión
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="px-3 text-gray-500 text-sm">o continuar con</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>

        {/* Google */}
        <button
          onClick={handleGoogleLogin}
          disabled={localLoading}
          className="
            w-full py-3 rounded-lg 
            flex items-center justify-center gap-3 
            google-btn
          "
        >
          <img src="../google.png" alt="Google" className="h-8" />
        </button>

        {/* Link Registro */}
        <p className="text-center text-gray-600 mt-6">
          ¿No tienes una cuenta?{" "}
          <a
            href="/registro"
            className="font-semibold"
            style={{ color: "#0f6f63" }}
          >
            Crear cuenta
          </a>
        </p>
      </div>
    </div>
  );
};
// end region

export default Login;
