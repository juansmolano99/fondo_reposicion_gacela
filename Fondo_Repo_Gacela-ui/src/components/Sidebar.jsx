// src/components/Sidebar.jsx
import { Link, useLocation } from "react-router-dom";
import { menuItems } from "../config/menu";
import { getUserPermissions, getUser, getUserRole, logout } from "../Utils/auth";

export default function Sidebar({ onLogout }) {
  const permisos = getUserPermissions();
  const location = useLocation();
  const nombreUsuario = getUser();
  const rolUsuario = getUserRole();


  // Filtramos ítems según permisos
  const filteredMenu = menuItems.filter(item => !item.permiso || permisos.includes(item.permiso));

  return (
    <aside className="w-64 flex-shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col z-20 h-screen overflow-y-auto">
      {/* Logo / Marca */}
      <div className="p-6 flex items-center gap-3 border-b border-slate-200 dark:border-slate-800">
        <div className="size-9 bg-primary flex items-center justify-center rounded-lg">
          <svg
            className="text-white w-5 h-5"
            fill="none"
            viewBox="0 0 48 48"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              clipRule="evenodd"
              d="M39.475 21.6262C40.358 21.4363 40.6863 21.5589 40.7581 21.5934C40.7876 21.655 40.8547 21.857 40.8082 22.3336C40.7408 23.0255 40.4502 24.0046 39.8572 25.2301C38.6799 27.6631 36.5085 30.6631 33.5858 33.5858C30.6631 36.5085 27.6632 38.6799 25.2301 39.8572C24.0046 40.4502 23.0255 40.7407 22.3336 40.8082C21.8571 40.8547 21.6551 40.7875 21.5934 40.7581C21.5589 40.6863 21.4363 40.358 21.6262 39.475C21.8562 38.4054 22.4689 36.9657 23.5038 35.2817C24.7575 33.2417 26.5497 30.9744 28.7621 28.762C30.9744 26.5497 33.2417 24.7574 35.2817 23.5037C36.9657 22.4689 38.4054 21.8562 39.475 21.6262ZM4.41189 29.2403L18.7597 43.5881C19.8813 44.7097 21.4027 44.9179 22.7217 44.7893C24.0585 44.659 25.5148 44.1631 26.9723 43.4579C29.9052 42.0387 33.2618 39.5667 36.4142 36.4142C39.5667 33.2618 42.0387 29.9052 43.4579 26.9723C44.1631 25.5148 44.659 24.0585 44.7893 22.7217C44.9179 21.4027 44.7097 19.8813 43.5881 18.7597L29.2403 4.41187C27.8527 3.02428 25.8765 3.02573 24.2861 3.36776C22.6081 3.72863 20.7334 4.58419 18.8396 5.74801C16.4978 7.18716 13.9881 9.18353 11.5858 11.5858C9.18354 13.988 7.18717 16.4978 5.74802 18.8396C4.58421 20.7334 3.72865 22.6081 3.36778 24.2861C3.02574 25.8765 3.02429 27.8527 4.41189 29.2403Z"
              fill="currentColor"
              fillRule="evenodd"
            />
          </svg>
        </div>
        <div className="leading-none">
          <span className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight">
            FondoRep
          </span>
          <p className="text-[9px] uppercase tracking-[0.1em] text-primary font-bold">
            V. Consolidada
          </p>
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
        {/* Menú Principal */}
        <div>
          <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
            Menú Principal
          </p>
          {filteredMenu.map(item => (
                <Link key={item.path} // asumo que agregas categoria en menuItems
                to={item.path}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all group mb-1 ${
                  location.pathname === item.path
                    ? "sidebar-item-active"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <span className="material-symbols-outlined shrink-0">
                  {item.icon || "grid_view"}
                </span>
                <span className="text-sm font-semibold">{item.label}</span>
              </Link>
            ))}
        </div>

        {/* Operaciones */}
        <div>
          <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
            Operaciones
          </p>
          {/* Aquí puedes agregar más secciones filtrando por categoria */}
        </div>

        {/* Soporte */}
        <div>
          <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
            Soporte
          </p>
          {/* Ítems de soporte */}
        </div>
      </nav>

      {/* Perfil + Logout */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800">
        {/* Avatar y nombre del usuario logueado */}
        <div className="mb-4 px-2 py-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <img
              alt="Avatar"
              className="size-8 rounded-full border border-primary/20"
              src="https://github.com/juansmolano99/Pictures/blob/main/logo%20Flota.jpg?raw=true"
            />
            <div className="absolute -bottom-0.5 -right-0.5 size-2.5 bg-green-500 rounded-full border-2 border-white dark:border-slate-800" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-900 dark:text-white truncate leading-tight">
              {localStorage.getItem("nombreCompleto") || localStorage.getItem("usuario") || getUser() || "Usuario"}
            </p>
            <p className="text-[10px] text-primary font-bold tracking-tight">
              {localStorage.getItem("rol") || getUserRole() || "—"}
            </p>
          </div>
        </div>

        <button
        onClick={onLogout}
        className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-red-500 hover:bg-red-50">

          <span className="material-symbols-outlined shrink-0 transition-transform group-hover:-translate-x-1">
            logout
          </span>
          <span className="text-sm font-bold">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}