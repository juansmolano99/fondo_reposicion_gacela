import jwtDecode from "jwt-decode";

export default function ProtectedButton({ permiso, children }) {
  const token = localStorage.getItem("token");
  if (!token) return null;

  const decoded = jwtDecode(token);
  const permisos = decoded.permiso || [];

  if (!permisos.includes(permiso)) return null;

  return children;
}

<ProtectedButton permiso="USUARIO_CREAR">
  <button className="bg-blue-600 text-white px-4 py-2">
    Crear Usuario
  </button>
</ProtectedButton>
