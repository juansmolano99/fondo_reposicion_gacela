import { Navigate } from "react-router-dom";
import { getUserPermissions } from "../Utils/auth";

export default function ProtectedRoute({ permiso, children }) {
  const permisos = getUserPermissions();

  if (!permisos.includes(permiso)) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (!localStorage.getItem("token")) {
  return <Navigate to="/login" replace />;
  }


  return children;
}
