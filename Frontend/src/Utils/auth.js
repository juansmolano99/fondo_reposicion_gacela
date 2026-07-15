import { jwtDecode } from "jwt-decode";

/* =========================
   AUTH BASICS
========================= */

export function isAuthenticated() {
  const token = localStorage.getItem("token");
  if (!token) return false;

  try {
    const decoded = jwtDecode(token);
    const now = Date.now() / 1000;
    return decoded.exp > now;
  } catch {
    return false;
  }
}


/* =========================
   USER INFO
========================= */

export function getUser() {
  const fromStorage = localStorage.getItem("nombreCompleto") || localStorage.getItem("usuario");
  if (fromStorage) return fromStorage;
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const decoded = jwtDecode(token);
    return decoded?.name || decoded?.unique_name || decoded?.sub || null;
  } catch {
    return null;
  }
}

export function getUserRole() {
  const fromStorage = localStorage.getItem("rol");
  if (fromStorage) return fromStorage;
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const decoded = jwtDecode(token);
    return decoded?.role || null;
  } catch {
    return null;
  }
}

/* =========================
   PERMISSIONS
========================= */

export function getUserPermissions() {
  const token = localStorage.getItem("token");
  if (!token) return [];

  try {
    const decoded = jwtDecode(token);

    // ASP.NET Core guarda los claims personalizados así
    const permisos = decoded?.permiso;

    if (!permisos) return [];

    // Puede venir como string o array
    return Array.isArray(permisos) ? permisos : [permisos];
  } catch {
    return [];
  }
}

/* Logout */

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("nombreCompleto");
  localStorage.removeItem("usuario");
  localStorage.removeItem("rol");
  window.location.href = "/login";
};

