import { useState, useEffect } from "react";
import api from "../../api/axios";

export default function ListaDocumentacion({ solicitudId = null }) {
    const [documentos, setDocumentos] = useState([]);
    const [cargando, setCargando] = useState(true);

    const API_BASE = import.meta.env.VITE_API_URL || "http://192.168.10.142:8000";

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
        cargarDocumentos();
    }, [solicitudId]);

    const cargarDocumentos = async () => {
        setCargando(true);
        try {
            const url = solicitudId 
                ? `/solicitudes/${solicitudId}/documentacion` 
                : `/documentacion`;
            
            const response = await api.get(url);
            setDocumentos(response.data);
        } catch (error) {
            console.error("Error al cargar la documentación:", error);
        } finally {
            setCargando(false);
        }
    };

    if (cargando) return <p className="p-4 text-slate-500">Cargando documentación...</p>;

    return (
        <div className="card overflow-hidden m-4">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
                    <tr>
                        <th className="p-4">Fecha</th>
                        {!solicitudId && <th className="p-4">ID Solicitud</th>}
                        <th className="p-4">ID Doc</th>
                        <th className="p-4">Tipo de Documento</th>
                        <th className="p-4">Estado Asociado</th>
                        <th className="p-4">Observaciones</th>
                        <th className="p-4">Archivo</th>
                    </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {documentos.map((doc) => (
                        <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60">
                            <td className="p-4">{new Date(doc.fecha_creacion).toLocaleDateString()}</td>
                            {!solicitudId && <td className="p-4 font-bold">{doc.solicitud_id}</td>}
                            <td className="p-4">{doc.id}</td>
                            <td className="p-4">
                                <p className="font-semibold text-slate-900 dark:text-white">{doc.tipo_documento}</p>
                            </td>
                            <td className="p-4">
                                <span className={`border rounded px-2 py-1 text-xs font-bold inline-block
                                    ${doc.estado_asociado === 'Aprobado' ? 'bg-green-100 text-green-800 border-green-200' : 
                                      doc.estado_asociado === 'Rechazado' ? 'bg-red-100 text-red-800 border-red-200' : 
                                      'bg-blue-100 text-blue-800 border-blue-200'}`}
                                >
                                    {doc.estado_asociado}
                                </span>
                            </td>
                            <td className="p-4">
                                <span className="line-clamp-2" title={doc.observaciones}>
                                    {doc.observaciones || "Sin observaciones"}
                                </span>
                            </td>
                            <td className="p-4">
                                {doc.ruta_archivo ? (
                                    <button
                                        type="button"
                                        onClick={() => verAdjunto(doc.ruta_archivo)}
                                        className="text-[#136c65] hover:underline flex items-center gap-1"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">visibility</span>
                                        Ver
                                    </button>
                                ) : (
                                    <span className="text-slate-400">Sin archivo</span>
                                )}
                            </td>
                        </tr>
                    ))}
                    {documentos.length === 0 && (
                        <tr>
                            <td colSpan={solicitudId ? 6 : 7} className="p-8 text-center text-slate-500 dark:text-slate-300">
                                No hay documentos de soporte registrados.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}