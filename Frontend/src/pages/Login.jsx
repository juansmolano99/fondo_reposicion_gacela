// src/components/Login.jsx
import { useState } from "react";
import { login } from "../Services/authService";

export default function Login({ onLogin }) {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(usuario, password);
      onLogin(); // o usa useNavigate si tienes React Router
    } catch (err) {
      console.error("ERROR LOGIN:", err);
      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Usuario o contraseña incorrectos. Intenta de nuevo."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row overflow-hidden font-manrope">
      {/* Lado izquierdo - Fondo (solo desktop) */}
      <div className="hidden lg:flex lg:w-3/5 relative bus-collage-bg overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 border-8 border-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 border-8 border-white/5 rounded-full blur-2xl" />
        </div>

        <div className="relative z-10 flex flex-col justify-between h-full p-8 md:p-16 text-white">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-md">
              <span className="material-symbols-outlined text-4xl">directions_bus</span>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Fondo de Reposición</h1>
              <p className="text-sm font-bold uppercase tracking-widest text-accent">Gacela</p>
            </div>
          </div>

          <div className="max-w-xl">
            <div className="mb-6 flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-white/10 rounded text-[10px] font-bold uppercase tracking-widest border border-white/20">
                Flota Magdalena
              </span>
              <span className="px-3 py-1 bg-white/10 rounded text-[10px] font-bold uppercase tracking-widest border border-white/20">
                Rápido Duitama
              </span>
              <span className="px-3 py-1 bg-white/10 rounded text-[10px] font-bold uppercase tracking-widest border border-white/20">
                Expreso Paz de Río
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
              Eficiencia en la renovación del transporte intermunicipal.
            </h2>
            <p className="text-base md:text-lg text-slate-200 font-light leading-relaxed">
              Plataforma restringida para la gestión estratégica y reposición de equipo automotor.
            </p>
          </div>

          <div className="text-white/50 text-xs font-medium uppercase tracking-wider">
            © 2026 Fondo de Reposición Gacela - Gestión Profesional
          </div>
        </div>
      </div>

      {/* Lado derecho - Formulario */}
      <div className="w-full lg:w-2/5 flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-slate-50 dark:bg-slate-950">
        <div className="w-full max-w-md flex flex-col items-center">
          {/* Badge acceso restringido */}
          <div className="mb-6 md:mb-8 flex items-center gap-2 px-4 py-1.5 bg-slate-200 dark:bg-slate-800 rounded-full text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">
            <span className="material-symbols-outlined text-sm">lock</span>
            Acceso Restringido
          </div>

          {/* Card principal */}
          <div className="w-full bg-white dark:bg-slate-900 rounded-2xl p-8 md:p-10 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200/70 dark:border-slate-700/70">
            <div className="mb-8 text-center">
              <h2 className="text-slate-900 dark:text-white text-2xl md:text-3xl font-extrabold tracking-tight">
                Iniciar Sesión
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
                Ingrese sus credenciales autorizadas.
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Usuario */}
              <div className="space-y-2">
                <label className="block text-slate-700 dark:text-slate-300 text-xs font-bold uppercase tracking-wider">
                  Usuario / Email
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl pointer-events-none">
                    person
                  </span>
                  <input
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/20 transition-all disabled:opacity-60"
                    placeholder="usuario@dominio.com"
                    type="text"
                    value={usuario}
                    onChange={(e) => setUsuario(e.target.value.trim())}
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              {/* Contraseña */}
              <div className="space-y-2">
                <label className="block text-slate-700 dark:text-slate-300 text-xs font-bold uppercase tracking-wider">
                  Contraseña
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl pointer-events-none">
                    lock
                  </span>
                  <input
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 pl-12 pr-12 py-3 text-sm focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/20 transition-all disabled:opacity-60"
                    placeholder="••••••••"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
                  >
                    <span className="material-symbols-outlined text-xl">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Botón */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 bg-[#0c4a6e] hover:bg-[#0b3d5c] active:bg-[#0a3450] text-white font-bold text-base tracking-wide rounded-xl shadow-lg shadow-sky-900/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin material-symbols-outlined">refresh</span>
                      Autenticando...
                    </span>
                  ) : (
                    "Autenticar Acceso"
                  )}
                </button>
              </div>
            </form>

            {error && (
              <p className="mt-5 text-center text-red-600 dark:text-red-400 text-sm font-medium">
                {error}
              </p>
            )}
          </div>

          {/* Footer seguridad */}
          <div className="mt-8 text-center space-y-3">
            <div className="flex items-center justify-center gap-2 text-slate-500 dark:text-slate-600 text-xs italic">
              <span className="material-symbols-outlined text-sm">shield</span>
              Conexión cifrada de punto a punto (SSL)
            </div>
            <p className="text-slate-500 dark:text-slate-600 text-xs max-w-xs mx-auto leading-relaxed">
              Este sistema contiene información confidencial. El acceso no autorizado está estrictamente prohibido.
            </p>
          </div>
        </div>
      </div>

      {/* Toggle dark mode */}
      <button
        className="fixed bottom-6 right-6 z-50 size-11 flex items-center justify-center bg-white dark:bg-slate-800 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:scale-110 transition-transform"
        onClick={() => {
          const nuevo = !document.documentElement.classList.contains("dark");
          document.documentElement.classList.toggle("dark", nuevo);
          localStorage.setItem("darkMode", String(nuevo));
        }}
        title="Cambiar modo claro/oscuro"
      >
        <span className="material-symbols-outlined text-2xl">contrast</span>
      </button>
    </div>
  );
}