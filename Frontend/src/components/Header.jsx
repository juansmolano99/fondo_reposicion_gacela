// src/components/Header.jsx
import { useState, useEffect } from "react";
import { getUser } from "../Utils/auth";
import { Link, useLocation } from "react-router-dom";
import { menuItems } from "../config/menu";

export default function Header() {
  const nombreCompleto = localStorage.getItem("nombreCompleto");
  const usuario = localStorage.getItem("usuario");
  const displayName = nombreCompleto || usuario || getUser() || "Usuario";

  const location = useLocation();
  const currentItem = menuItems.find((m) => m.path === location.pathname);
  const currentLabel = currentItem?.label || "Dashboard";
  const currentCategory = currentItem?.categoria || "principal";

  const categoryLabel =
    currentCategory === "principal"
      ? "Menú Principal"
      : currentCategory === "operaciones"
        ? "Operaciones"
        : currentCategory === "soporte"
          ? "Soporte"
          : "Módulo";

  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  const toggleDarkMode = () => {
    const nuevo = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", nuevo);
    localStorage.setItem("darkMode", String(nuevo));
    setIsDark(nuevo);
  };

  return (
    <header className="h-16 flex-shrink-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-6 md:px-8 flex items-center justify-between sticky top-0 z-10">
      {/* Izquierda: Breadcrumb */}
      <div className="flex items-center gap-4">
        <Link
          to="/"
          title="Ir al Dashboard"
          className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">home</span>
        </Link>

        <nav className="flex items-center text-slate-400 min-w-0">
          <span className="text-[10px] uppercase tracking-widest font-black text-slate-400">
            {categoryLabel}
          </span>
          <span className="material-symbols-outlined text-sm mx-2">chevron_right</span>
          <span className="text-[10px] uppercase tracking-widest font-black text-slate-900 dark:text-white truncate">
            {currentLabel}
          </span>
        </nav>
      </div>

      {/* Derecha: Acciones */}
      <div className="flex items-center gap-4">
        {/* Toggle dark/light */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          <button
            onClick={toggleDarkMode}
            className={`flex items-center justify-center size-8 rounded transition-all ${
              !isDark
                ? "bg-white dark:bg-slate-600 shadow-sm text-primary"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {isDark ? "light_mode" : "dark_mode"}
            </span>
          </button>
        </div>

        <div className="w-px h-6 bg-slate-200 dark:bg-slate-800" />

        {/* Menú móvil (si lo necesitas) */}
        <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors lg:hidden">
          <span className="material-symbols-outlined">menu</span>
        </button>

        {/* Nombre de usuario */}
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 hidden md:block">
          {displayName}
        </span>
      </div>
    </header>
  );
}