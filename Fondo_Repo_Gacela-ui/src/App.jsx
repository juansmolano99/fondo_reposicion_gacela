import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";


import MainLayout from "./Layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
import Usuarios from "./pages/Usuarios";
import Roles from "./pages/Roles";
import Vehiculos from "./pages/Vehiculos";
import CargueFondo from "./pages/CargueFondo";
import Unauthorized from "./pages/Unauthorized";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import { isAuthenticated } from "./Utils/auth";

export default function App() {const [isAuth, setIsAuth] = useState(isAuthenticated());

  const handleLogin = () => {
    setIsAuth(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuth(false);
  };

  return (
    <BrowserRouter>
      <Routes>

        {/* LOGIN */}
        <Route
          path="/login"
          element={
            isAuth ? <Navigate to="/" /> : <Login onLogin={handleLogin} />
          }
        />

        {/* APP PROTEGIDA */}
        {isAuth && (
          <Route element={<MainLayout onLogout={handleLogout} />}>
            <Route path="/" element={<Dashboard />} />

            <Route
              path="/vehiculos"
              element={
                <ProtectedRoute permiso="VEHICULO_CONSULTAR">
                  <Vehiculos />
                </ProtectedRoute>
              }
            />

            <Route
              path="/vehiculos/resumen"
              element={
                <ProtectedRoute permiso="VEHICULO_RESUMEN">
                  <Vehiculos />
                </ProtectedRoute>
              }
            />

            <Route
              path="/usuarios"
              element={
                <ProtectedRoute permiso="USUARIO_CREAR">
                  <Usuarios />
                </ProtectedRoute>
              }
            />

            <Route
              path="/roles"
              element={
                <ProtectedRoute permiso="USUARIO_EDITAR">
                  <Roles />
                </ProtectedRoute>
              }
            />

            <Route
              path="/fondo/cargue"
              element={
                <ProtectedRoute permiso="VEHICULO_CONSULTAR">
                  <CargueFondo />
                </ProtectedRoute>
              }
            />
          </Route>
        )}

        {/* NO AUTORIZADO */}
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* CUALQUIER OTRA RUTA */}
        <Route
          path="*"
          element={<Navigate to={isAuth ? "/" : "/login"} />}
        />

      </Routes>
    </BrowserRouter>
  );
}
