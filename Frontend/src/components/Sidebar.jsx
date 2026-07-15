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
        <div className="size-9 flex items-center justify-center rounded-lg overflow-hidden">
            <img
            src="/favicon.png"
            alt="FondoRep logo"
            className="w-full h-full object-contain"
            />
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

            {[
                  { key: "principal",    label: "Menú Principal" },
                  { key: "operaciones",  label: "Operaciones"    },
                  { key: "soporte",      label: "Soporte"        },
              ].map(({ key, label }) => {
      const items = filteredMenu.filter(item => item.categoria === key);
      if (items.length === 0) return null;

      return (
        <div key={key}>
          <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
            {label}
          </p>
          {items.map(item => (
            <Link
                          key={item.path}
                          to={item.path}
                          className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all group mb-1 ${
                          location.pathname === item.path
                          ? "sidebar-item-active"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"}`}>
                        <span className="material-symbols-outlined shrink-0">
                              {item.icon || "grid_view"}
                            </span>
                        <span className="text-sm font-semibold">{item.label}</span>
            </Link>
            ))}
              </div>
            );
          })}

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