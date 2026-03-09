import React, { useState, useEffect, useMemo } from "react";
import {
  obtenerUsuarios,
  obtenerRoles,
  crearUsuario,
  editarUsuario,
  cambiarEstadoUsuario,
  eliminarUsuario,
} from "../Services/usuariosService";

const PAGE_SIZE = 5;

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(1);

  const [modalCrear, setModalCrear] = useState(false);
  const [modalEditar, setModalEditar] = useState(null);
  const [modalEliminar, setModalEliminar] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const cargarDatos = async () => {
    setLoading(true);
    setError(null);
    try {
      const [usuariosData, rolesData] = await Promise.all([
        obtenerUsuarios(),
        obtenerRoles(),
      ]);
      setUsuarios(usuariosData);
      setRoles(rolesData);
    } catch {
      setError("Error al obtener usuarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter(
      (u) =>
        u.nombreCompleto?.toLowerCase().includes(busqueda.toLowerCase()) ||
        u.nombreUsuario?.toLowerCase().includes(busqueda.toLowerCase()) ||
        u.rol?.toLowerCase().includes(busqueda.toLowerCase())
    );
  }, [usuarios, busqueda]);

  const totalPaginas = Math.ceil(usuariosFiltrados.length / PAGE_SIZE);
  const inicio = (pagina - 1) * PAGE_SIZE;
  const usuariosPagina = usuariosFiltrados.slice(inicio, inicio + PAGE_SIZE);

  const totalUsuarios = usuarios.length;
  const activos = usuarios.filter((u) => u.activo).length;
  const rolesUnicos = [...new Set(usuarios.map((u) => u.rol))].length;

  const toggleActivo = async (id) => {
    try {
      await cambiarEstadoUsuario(id);
      setUsuarios((prev) =>
        prev.map((u) => (u.id === id ? { ...u, activo: !u.activo } : u))
      );
    } catch {
      setError("Error al cambiar estado del usuario");
    }
  };

  const handleCrear = async (e) => {
    e.preventDefault();
    const form = e.target;
    const data = {
      nombreUsuario: form.nombreUsuario.value.trim(),
      nombreCompleto: form.nombreCompleto.value.trim(),
      password: form.password.value,
      rol: form.rol.value,
    };
    if (!data.nombreUsuario || !data.nombreCompleto || !data.password || !data.rol) {
      setError("Complete todos los campos");
      return;
    }
    setGuardando(true);
    setError(null);
    try {
      await crearUsuario(data);
      setModalCrear(false);
      cargarDatos();
    } catch (err) {
      setError(err.response?.data || "Error al crear usuario");
    } finally {
      setGuardando(false);
    }
  };

  const handleEditar = async (e) => {
    e.preventDefault();
    const form = e.target;
    const data = {
      nombreUsuario: form.nombreUsuario.value.trim(),
      nombreCompleto: form.nombreCompleto.value.trim(),
      rol: form.rol.value,
      activo: form.activo.checked,
    };
    setGuardando(true);
    setError(null);
    try {
      await editarUsuario(modalEditar.id, data);
      setModalEditar(null);
      cargarDatos();
    } catch (err) {
      setError(err.response?.data || "Error al editar usuario");
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async () => {
    if (!modalEliminar) return;
    setGuardando(true);
    setError(null);
    try {
      await eliminarUsuario(modalEliminar.id);
      setModalEliminar(null);
      cargarDatos();
    } catch (err) {
      setError(err.response?.data || "Error al eliminar usuario");
    } finally {
      setGuardando(false);
    }
  };

  const rolesOpciones = roles.map((r) => ({ value: r.value || r.label, label: r.label || r.value }));

  if (loading) return <p className="p-8">Cargando usuarios...</p>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Directorio de Usuarios</h1>
        <button
          onClick={() => setModalCrear(true)}
          className="bg-primary text-white px-5 py-2 rounded-xl font-bold shadow-md hover:opacity-90"
        >
          Nuevo Usuario
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <KpiCard title="Total Usuarios" value={totalUsuarios} icon="groups" />
        <KpiCard title="Usuarios Activos" value={activos} icon="verified_user" />
        <KpiCard title="Roles Definidos" value={rolesUnicos} icon="shield_person" />
      </div>

      <div className="mb-6">
        <input
          type="text"
          value={busqueda}
          onChange={(e) => {
            setBusqueda(e.target.value);
            setPagina(1);
          }}
          placeholder="Buscar por nombre, usuario o rol..."
          className="w-full md:w-1/3 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-separate border-spacing-y-3">
          <thead>
            <tr className="text-slate-400 text-xs uppercase">
              <th className="px-6">ID</th>
              <th className="px-6">Nombre</th>
              <th className="px-6">Usuario</th>
              <th className="px-6">Rol</th>
              <th className="px-6">Estado</th>
              <th className="px-6 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuariosPagina.map((u) => (
              <tr key={u.id} className="bg-white dark:bg-slate-900 rounded-2xl shadow">
                <td className="px-6 py-4 font-mono text-xs text-slate-600 dark:text-slate-400">USR-{u.id}</td>
                <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{u.nombreCompleto}</td>
                <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{u.nombreUsuario}</td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 uppercase">
                    {u.rol}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      u.activo ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                    }`}
                  >
                    {u.activo ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button
                    onClick={() => toggleActivo(u.id)}
                    className="px-3 py-1 rounded-xl text-xs font-bold bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600"
                  >
                    {u.activo ? "Inactivar" : "Activar"}
                  </button>
                  <button
                    onClick={() => setModalEditar(u)}
                    className="px-3 py-1 rounded-xl text-xs font-bold bg-primary text-white hover:opacity-90"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => setModalEliminar(u)}
                    className="px-3 py-1 rounded-xl text-xs font-bold bg-red-500 text-white hover:bg-red-600"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-6">
        <p className="text-sm text-slate-500">
          Mostrando {usuariosPagina.length} de {usuariosFiltrados.length} usuarios
        </p>
        <div className="flex gap-2">
          <button
            disabled={pagina === 1}
            onClick={() => setPagina((p) => p - 1)}
            className="px-3 py-1 bg-slate-200 dark:bg-slate-700 rounded disabled:opacity-40"
          >
            ◀
          </button>
          <span className="px-3 py-1 text-slate-600 dark:text-slate-400">
            {pagina} / {totalPaginas || 1}
          </span>
          <button
            disabled={pagina === totalPaginas}
            onClick={() => setPagina((p) => p + 1)}
            className="px-3 py-1 bg-slate-200 dark:bg-slate-700 rounded disabled:opacity-40"
          >
            ▶
          </button>
        </div>
      </div>

      {/* Modal Crear */}
      {modalCrear && (
        <Modal titulo="Nuevo usuario" onCerrar={() => setModalCrear(false)}>
          <form onSubmit={handleCrear} className="space-y-4">
            <input name="nombreUsuario" placeholder="Usuario (login)" required className="w-full px-4 py-2 rounded-lg border dark:bg-slate-800 dark:border-slate-700" />
            <input name="nombreCompleto" placeholder="Nombre completo" required className="w-full px-4 py-2 rounded-lg border dark:bg-slate-800 dark:border-slate-700" />
            <input name="password" type="password" placeholder="Contraseña" required className="w-full px-4 py-2 rounded-lg border dark:bg-slate-800 dark:border-slate-700" />
            <select name="rol" required className="w-full px-4 py-2 rounded-lg border dark:bg-slate-800 dark:border-slate-700">
              <option value="">Seleccione rol</option>
              {rolesOpciones.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
            <div className="flex gap-2 justify-end pt-4">
              <button type="button" onClick={() => setModalCrear(false)} className="px-4 py-2 rounded-lg border">Cancelar</button>
              <button type="submit" disabled={guardando} className="px-4 py-2 rounded-lg bg-primary text-white">{guardando ? "Guardando…" : "Crear"}</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Editar */}
      {modalEditar && (
        <Modal titulo="Editar usuario" onCerrar={() => setModalEditar(null)}>
          <form onSubmit={handleEditar} className="space-y-4">
            <input name="nombreUsuario" defaultValue={modalEditar.nombreUsuario} placeholder="Usuario" required className="w-full px-4 py-2 rounded-lg border dark:bg-slate-800 dark:border-slate-700" />
            <input name="nombreCompleto" defaultValue={modalEditar.nombreCompleto} placeholder="Nombre completo" required className="w-full px-4 py-2 rounded-lg border dark:bg-slate-800 dark:border-slate-700" />
            <select name="rol" defaultValue={modalEditar.rol} required className="w-full px-4 py-2 rounded-lg border dark:bg-slate-800 dark:border-slate-700">
              {rolesOpciones.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
            <label className="flex items-center gap-2">
              <input name="activo" type="checkbox" defaultChecked={modalEditar.activo} />
              <span>Activo</span>
            </label>
            <div className="flex gap-2 justify-end pt-4">
              <button type="button" onClick={() => setModalEditar(null)} className="px-4 py-2 rounded-lg border">Cancelar</button>
              <button type="submit" disabled={guardando} className="px-4 py-2 rounded-lg bg-primary text-white">{guardando ? "Guardando…" : "Guardar"}</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Eliminar */}
      {modalEliminar && (
        <Modal titulo="Eliminar usuario" onCerrar={() => setModalEliminar(null)}>
          <p className="mb-4">¿Inactivar al usuario <strong>{modalEliminar.nombreCompleto}</strong>?</p>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setModalEliminar(null)} className="px-4 py-2 rounded-lg border">Cancelar</button>
            <button onClick={handleEliminar} disabled={guardando} className="px-4 py-2 rounded-lg bg-red-500 text-white">{guardando ? "…" : "Eliminar"}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({ titulo, onCerrar, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onCerrar}>
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">{titulo}</h2>
        {children}
      </div>
    </div>
  );
}

function KpiCard({ title, value, icon }) {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow">
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-primary">{icon}</span>
        <div>
          <p className="text-xs uppercase text-slate-400 font-bold">{title}</p>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}
