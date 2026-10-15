import { useEffect, useState } from "react";
import axios from "../../api/axios";
import api from "../../api/axios"; // Asegúrate que apunta a tu instancia configurada de axios


export default function NuevaDocumentacion({ solicitudId, estadoSolicitud }) {
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tipoDocumento, setTipoDocumento] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [archivo, setArchivo] = useState(null);
  const [enviando, setEnviando] = useState(false);

  // Cargar documentos vinculados a esta solicitud
  const cargarDocumentos = async () => {
    if (!solicitudId) return;
    try {
      setLoading(true);
      const res = await axios.get(`/solicitudes/${solicitudId}/documentacion`);
      setDocumentos(res.data);
    } catch (err) {
      console.error("Error al cargar la documentación", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDocumentos();
  }, [solicitudId]);

  // Manejar el envío del formulario con el archivo
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!archivo) {
      alert("Por favor selecciona un archivo PDF o imagen.");
      return;
    }

    const formData = new FormData();
    formData.append("solicitud_id", solicitudId);
    formData.append("tipo_documento", tipoDocumento);
    formData.append("estado_asociado", estadoSolicitud || "APROBADO");
    formData.append("observaciones", observaciones);
    formData.append("archivo", archivo);

    try {
      setEnviando(true);
      await axios.post("/documentacion", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Limpiar formulario y recargar lista
      setTipoDocumento("");
      setObservaciones("");
      setArchivo(null);
      // Opcional: limpiar el input de archivo si usas una referencia
      cargarDocumentos();
    } catch (err) {
      console.error("Error al subir el documento", err);
      alert("Hubo un error al guardar el documento.");
    } finally {
      setEnviando(false);
    }
  };

  const verDocumento = async (rutaArchivo) => {
    if (!rutaArchivo) return;
    
    // Le quitamos la barra inicial para que coincida con lo que espera FileStorage
    const rutaLimpia = rutaArchivo.startsWith('/') ? rutaArchivo.substring(1) : rutaArchivo;

    try {
        const response = await api.get("/adjuntos/ver", {
            params: { ruta: rutaLimpia },
            responseType: "blob",
        });
        const fileBlob = new Blob([response.data], { 
            type: response.headers['content-type'] || 'application/pdf' 
        });
        const fileUrl = URL.createObjectURL(fileBlob);
        window.open(fileUrl, "_blank");
        setTimeout(() => URL.revokeObjectURL(fileUrl), 60000);
    } catch (error) {
        console.error("Error al abrir el documento:", error);
        alert("No se pudo cargar el documento adjunto.");
    }
};

  return (
    <div className="bg-white rounded-xl shadow p-6 space-y-6">
      <div className="border-b pb-4">
        <h3 className="text-xl font-bold text-slate-800">Módulo de Documentación (Fase 2)</h3>
        <p className="text-sm text-slate-500 mt-1">
          Soportes y evidencias de resolución para la solicitud #{solicitudId} (Estado: <span className="font-semibold">{estadoSolicitud}</span>)
        </p>
      </div>

      {/* Formulario de Carga */}
      <form onSubmit={handleSubmit} className="space-y-4 bg-slate-50 p-4 rounded-lg border">
        <h4 className="font-semibold text-slate-700">Adjuntar Nuevo Documento de Soporte</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Documento</label>
            <input
              type="text"
              value={tipoDocumento}
              onChange={(e) => setTipoDocumento(e.target.value)}
              placeholder="Ej: Acta de Aprobación Firmada"
              className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Archivo (PDF / Imagen)</label>
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => setArchivo(e.target.files[0])}
              className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Observaciones (Opcional)</label>
          <textarea
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            rows="2"
            placeholder="Detalles adicionales sobre este documento..."
            className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={enviando}
          className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
        >
          {enviando ? "Guardando..." : "Subir y Vincular Documento"}
        </button>
      </form>

      {/* Listado de Documentos Existentes */}
      <div className="space-y-3">
        <h4 className="font-semibold text-slate-700">Documentos Registrados</h4>
        {loading ? (
          <p className="text-sm text-slate-400">Cargando documentos...</p>
        ) : documentos.length === 0 ? (
          <p className="text-sm text-slate-400 italic">No hay documentos de soporte adjuntos para esta solicitud todavía.</p>
        ) : (
          <div className="divide-y border rounded-lg overflow-hidden">
            {documentos.map((doc) => (
              <div key={doc.id} className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-2 bg-white hover:bg-slate-50">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-800">{doc.tipo_documento}</span>
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                      {doc.estado_asociado}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Archivo: {doc.nombre_archivo}</p>
                  {doc.observaciones && (
                    <p className="text-xs text-slate-600 mt-1 italic">"{doc.observaciones}"</p>
                  )}
                  <span className="text-[10px] text-slate-400 block mt-1">Registrado el: {doc.fecha_creacion}</span>
                </div>

                {/* Botón para abrir el archivo usando tu AdjuntosController */}
                <button
                    type="button"
                    onClick={async () => {
                      try {
                        const response = await api.get("/adjuntos/ver", {
                          params: { ruta: doc.ruta_archivo },
                          responseType: "blob",
                        });
                        const fileBlob = new Blob([response.data], { 
                          type: response.headers['content-type'] || 'application/pdf' 
                        });
                        const fileUrl = URL.createObjectURL(fileBlob);
                        window.open(fileUrl, "_blank");
                        setTimeout(() => URL.revokeObjectURL(fileUrl), 60000);
                      } catch (error) {
                        console.error("Error al abrir el documento:", error);
                        alert("No se pudo cargar el documento adjunto.");
                      }
                    }}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    Ver Documento ↗
                  </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}