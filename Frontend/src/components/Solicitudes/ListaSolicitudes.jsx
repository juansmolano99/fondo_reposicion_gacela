import { useState, useEffect } from "react";
import api from "../../api/axios";
import NuevaDocumentacion from "./NuevaDocumentacion"; // Asegúrate de ajustar la ruta de importación

export default function ListaSolicitudes({ placaVehiculo = null }) {
    const [solicitudes, setSolicitudes] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [solicitudActivaDocs, setSolicitudActivaDocs] = useState(null); // Controla el modal de documentación

    const estados = ["Radicado", "En Revision", "Pdte Documentación", "Aprobado", "Rechazado"];
    const API_BASE = import.meta.env.VITE_API_URL || "http://192.168.10.142:8000";

    const verAdjunto = async (ruta) => {
    if (!ruta) return;
    
    // Asegurar que la ruta comience con '/' si es necesario
    const rutaLimpiada = ruta.startsWith('/') ? ruta : `/${ruta}`;

    try {
        const res = await api.get("/adjuntos/ver", {
            params: { ruta: rutaLimpiada },
            responseType: "blob",
        });
        const url = URL.createObjectURL(res.data);
        window.open(url, "_blank");
        setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (error) {
        // Fallback directo apuntando al endpoint estático o base correcta
        window.open(`${API_BASE}${rutaLimpiada}`, "_blank");
    }
    };

    useEffect(() => {
        cargarSolicitudes();
    }, [placaVehiculo]);

    const cargarSolicitudes = async () => {
        setCargando(true);
        try {
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
                        <th className="p-4">ID</th>
                        <th className="p-4">Solicitante</th>
                        <th className="p-4">Naturaleza</th>
                        <th className="p-4">Descripción</th>
                        <th className="p-4">Valor Est.</th>
                        <th className="p-4">Estado</th>
                        <th className="p-4">Adjunto</th>
                        <th className="p-4 text-center">Documentación</th>
                    </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {solicitudes.map((sol) => (
                        <tr key={sol.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60">
                            <td className="p-4">{new Date(sol.fechaCreacion).toLocaleDateString()}</td>
                            {!placaVehiculo && <td className="p-4 font-bold">{sol.placa}</td>}
                            <td className="p-4">{sol.id}</td>
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
                                <select 
                                    value={sol.estado}
                                    onChange={(e) => cambiarEstado(sol.id, e.target.value)}
                                    className={`border rounded px-2 py-1 text-xs font-bold outline-none
                                        ${sol.estado === 'Aprobado' ? 'bg-green-100 text-green-800 border-green-200' : 
                                          sol.estado === 'Rechazado' ? 'bg-red-100 text-red-800 border-red-200' : 
                                          sol.estado === 'Pdte Documentación' ? 'bg-orange-100 text-orange-800 border-orange-200' : 
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
                            <td className="p-4 text-center">
                                <button
                                    type="button"
                                    onClick={() => setSolicitudActivaDocs(sol)}
                                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1"
                                    title="Gestionar soportes y documentación"
                                >
                                    <span className="material-symbols-outlined text-[16px]">folder_open</span>
                                    Soportes
                                </button>
                            </td>
                        </tr>
                    ))}
                    {solicitudes.length === 0 && (
                        <tr>
                            <td colSpan={placaVehiculo ? 8 : 9} className="p-8 text-center text-slate-500 dark:text-slate-300">
                                No hay solicitudes registradas.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* Modal para gestionar la documentación de la solicitud seleccionada */}
            {solicitudActivaDocs && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative animate-in fade-in zoom-in-95 duration-200">
                        {/* Botón flotante para cerrar el modal */}
                        <button
                            onClick={() => setSolicitudActivaDocs(null)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-white bg-slate-100 dark:bg-slate-800 p-2 rounded-full transition-colors z-10"
                        >
                            <span className="material-symbols-outlined text-sm block">close</span>
                        </button>

                        <div className="p-2">
                            <NuevaDocumentacion 
                                solicitudId={solicitudActivaDocs.id} 
                                estadoSolicitud={solicitudActivaDocs.estado} 
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}