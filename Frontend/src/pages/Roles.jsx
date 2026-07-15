import { useEffect, useState } from "react";
import { getRoles, getPermisos, asignarPermiso, quitarPermiso } from "../Services/rolesService";

export default function Roles() {
  const [roles, setRoles] = useState([]);
  const [permisos, setPermisos] = useState([]);
  const [rolSeleccionado, setRolSeleccionado] = useState(null);
  const [permisosRol, setPermisosRol] = useState([]);
  const [mensaje, setMensaje] = useState("");  // Estado para el mensaje de confirmación

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setRoles(await getRoles());
    setPermisos(await getPermisos());
  };

  const togglePermiso = async (permisoId) => {
    if (!rolSeleccionado) return;

    const tiene = permisosRol.includes(permisoId);

    if (tiene) {
      await quitarPermiso(rolSeleccionado.id, permisoId);
      setPermisosRol(permisosRol.filter(p => p !== permisoId));
    } else {
      await asignarPermiso(rolSeleccionado.id, permisoId);
      setPermisosRol([...permisosRol, permisoId]);
    }
  };

  const guardarCambios = async () => {
    try {
      // Aquí puedes realizar la lógica de guardar los cambios, como una llamada al backend.
      setMensaje("¡Cambios guardados exitosamente!");
      setTimeout(() => setMensaje(""), 3000); // Limpiar el mensaje después de 3 segundos
    } catch (error) {
      setMensaje("Hubo un error al guardar los cambios.");
    }
  };

  const seleccionarRol = (rol) => {
    setRolSeleccionado(rol);
    // Aquí sincronizamos los permisos del rol seleccionado
    setPermisosRol(rol.permisos || []);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-wrap justify-between items-end gap-6 mb-8">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Gestión Granular de Permisos
          </h2>
          <p className="text-slate-500 dark:text-slate-400">
            Define los accesos y capacidades específicas para cada rol del sistema basado en los identificadores técnicos.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={guardarCambios}
            className="flex items-center gap-2 px-5 py-2 bg-primary text-white rounded-lg text-sm font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <span className="material-symbols-outlined text-sm">save</span>
            <span>Guardar Cambios</span>
          </button>
        </div>
      </div>

      {/* Mensaje de confirmación */}
      {mensaje && (
        <div className="bg-green-200 text-green-800 p-3 rounded-md mb-4">
          {mensaje}
        </div>
      )}

      {/* Roles como botones interactivos */}
      <div className="mb-8 border-b border-slate-200 dark:border-slate-800">
        <div className="flex gap-8">
          {roles.map((role) => (
            <button
              key={role.id}
              className={`pb-4 px-2 text-sm font-bold transition-colors ${rolSeleccionado?.id === role.id ? "text-primary border-b-2 border-primary" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
              onClick={() => seleccionarRol(role)}
            >
              {role.nombre}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de permisos de cada rol */}
      <div className="grid grid-cols-1 gap-6">
        {permisos.length > 0 && rolSeleccionado ? (
          <div className="bg-white dark:bg-[#1a1c1e] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">manage_accounts</span>
                <h3 className="font-bold text-slate-900 dark:text-white">Gestión de Permisos: {rolSeleccionado.nombre}</h3>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{permisosRol.length} Permisos Definidos</span>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {permisos.map((permiso) => (
                <div key={permiso.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{permiso.codigo}</p>
                    <p className="text-xs text-slate-500">{permiso.descripcion}</p>
                  </div>
                  <div className="relative inline-block w-10 mr-2 align-middle select-none">
                    <input
                      checked={permisosRol.includes(permiso.id)}
                      onChange={() => togglePermiso(permiso.id)}
                      className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer transition-all duration-300 ease-in-out"
                      id={permiso.codigo}
                      type="checkbox"
                    />
                    <label
                      className="toggle-label block overflow-hidden h-6 rounded-full bg-slate-300 cursor-pointer"
                      htmlFor={permiso.codigo}
                    ></label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-slate-500 dark:text-slate-400">Seleccione un rol para gestionar los permisos</p>
        )}
      </div>

      {/* Información de validación */}
      <div className="mt-8 p-4 bg-primary/5 border border-primary/20 rounded-xl">
        <div className="flex items-center gap-3 mb-2">
          <span className="material-symbols-outlined text-primary">info</span>
          <h5 className="font-bold text-primary text-sm">Validación de Backend</h5>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          Estos identificadores técnicos corresponden directamente a las constantes definidas en el servicio de autorización.
          Cualquier cambio aquí afectará la visibilidad de los componentes y la ejecución de peticiones API para los usuarios asignados al rol.
        </p>
      </div>
    </div>
  );
}
