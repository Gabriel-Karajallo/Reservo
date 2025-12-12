import { useState } from "react";
import { loginUser, loginWithGoogle } from "../services/firebase/authService";
import { useAuth } from "../hooks/useAuth";
import { Icons } from "../assets/icons";
import "../styles/login.css";

const Login = () => {
  const { loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localLoading, setLocalLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalLoading(true);
    setError("");

    try {
      await loginUser(email, password);
    } catch {
      setError("Credenciales incorrectas o usuario inexistente.");
    } finally {
      setLocalLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLocalLoading(true);
    setError("");

    try {
      await loginWithGoogle();
    } catch {
      setError("No se pudo iniciar sesión con Google.");
    } finally {
      setLocalLoading(false);
    }
  };

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
                className="flex-1 bg-transparent outline-none"
                placeholder="•••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Error */}
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          {/* Login */}
          <button
            type="submit"
            disabled={localLoading || authLoading}
            className="
              w-full 
              text-white 
              py-3 
              rounded-lg 
              flex items-center justify-center 
              gap-2 
              font-semibold 
              login-btn
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
            w-full 
            py-3 
            rounded-lg 
            flex items-center justify-center 
            gap-3 
            google-btn
          "
        >
          <img src="../google.png" alt="Google" className="h-8" />
        </button>

        {/* Registro */}
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

export default Login;
