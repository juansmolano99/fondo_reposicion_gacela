import { useState, useEffect } from "react";
import api from "../../api/axios";

export default function ListaSolicitudes({ placaVehiculo = null }) {
    const [solicitudes, setSolicitudes] = useState([]);
    const [cargando, setCargando] = useState(true);

    const estados = ["Radicado", "En Revision", "Aprobado", "Rechazado"];

    const API_BASE = import.meta.env.VITE_API_URL || "http://192.168.10.142:5092";

    const verAdjunto = async (ruta) => {
        if (!ruta) return;
        try {
            const res = await api.get("/adjuntos/ver", {
                params: { ruta },
                responseType: "blob",
            });
            const url = URL.createObjectURL(res.data);
            window.open(url, "_blank");
            setTimeout(() => URL.revokeObjectURL(url), 60000);
        } catch {
            window.open(`${API_BASE}${ruta}`, "_blank");
        }
    };

    useEffect(() => {
        cargarSolicitudes();
    }, [placaVehiculo]);

    const cargarSolicitudes = async () => {
        setCargando(true);
        try {
            // Si hay placa, trae las de ese vehículo. Si no, trae TODAS.
            const url = placaVehiculo 
                ? `/solicitudes/vehiculo/${placaVehiculo}` 
                : `/solicitudes`;
            
            const response = await api.get(url);
            setSolicitudes(response.data);
        } catch (error) {
            console.error("Error al cargar solicitudes:", error);
        } finally {
            setCargando(false);
        }
    };

    const cambiarEstado = async (id, nuevoEstado) => {
        try {
            await api.put(`/solicitudes/${id}/estado`, { estado: nuevoEstado });
            // Actualizar la tabla localmente
            setSolicitudes(prev => 
                prev.map(sol => sol.id === id ? { ...sol, estado: nuevoEstado } : sol)
            );
        } catch (error) {
            alert("Error al actualizar el estado");
        }
    };

    if (cargando) return <p className="p-4 text-slate-500">Cargando solicitudes...</p>;

    return (
        <div className="card overflow-hidden m-4">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
                    <tr>
                        <th className="p-4">Fecha</th>
                        {!placaVehiculo && <th className="p-4">Placa</th>}
                        <th className="p-4">Solicitante</th>
                        <th className="p-4">Naturaleza</th>
                        <th className="p-4">Descripción</th>
                        <th className="p-4">Valor Est.</th>
                        <th className="p-4">Estado</th>
                        <th className="p-4">Adjunto</th>
                    </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {solicitudes.map((sol) => (
                        <tr key={sol.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60">
                            <td className="p-4">{new Date(sol.fechaCreacion).toLocaleDateString()}</td>
                            {!placaVehiculo && <td className="p-4 font-bold">{sol.placa}</td>}
                            <td className="p-4">
                                <p className="font-semibold text-slate-900 dark:text-white">{sol.nombreCompleto}</p>
                            </td>
                            <td className="p-4">{sol.naturaleza}</td>
                            <td className="p-4">
                                <span className="line-clamp-2" title={sol.descripcion}>
                                    {sol.descripcion}
                                </span>
                            </td>
                            <td className="p-4">${sol.valorEstimado}</td>
                            <td className="p-4">
                                {/* Dropdown para cambiar el estado */}
                                <select 
                                    value={sol.estado}
                                    onChange={(e) => cambiarEstado(sol.id, e.target.value)}
                                    className={`border rounded px-2 py-1 text-xs font-bold outline-none
                                        ${sol.estado === 'Aprobado' ? 'bg-green-100 text-green-800 border-green-200' : 
                                          sol.estado === 'Rechazado' ? 'bg-red-100 text-red-800 border-red-200' : 
                                          sol.estado === 'En Revision' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 
                                          'bg-blue-100 text-blue-800 border-blue-200'}`}
                                >
                                    {estados.map(est => (
                                        <option key={est} value={est}>{est}</option>
                                    ))}
                                </select>
                            </td>
                            <td className="p-4">
                                {sol.archivoRuta ? (
                                    <button
                                        type="button"
                                        onClick={() => verAdjunto(sol.archivoRuta)}
                                        className="text-[#136c65] hover:underline flex items-center gap-1"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">visibility</span>
                                        Ver
                                    </button>
                                ) : (
                                    <span className="text-slate-400">Sin adjunto</span>
                                )}
                            </td>
                        </tr>
                    ))}
                    {solicitudes.length === 0 && (
                        <tr>
                            <td colSpan={placaVehiculo ? 7 : 8} className="p-8 text-center text-slate-500 dark:text-slate-300">No hay solicitudes registradas.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}