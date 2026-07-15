import { useState } from "react";
import api from "../api/axios";

export default function CargueFondo() {
  const [archivo, setArchivo] = useState(null);
  const [nombreColumna, setNombreColumna] = useState("");
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMensaje(null);
    if (!archivo && !nombreColumna.trim()) {
      setError("Indique el nombre de la columna (ej. ene_26) o suba un CSV con cabecera placa, nombre_columna.");
      return;
    }
    if (!archivo) {
      setError("Seleccione un archivo CSV.");
      return;
    }
    setCargando(true);
    try {
      const formData = new FormData();
      formData.append("archivo", archivo);
      if (nombreColumna.trim()) formData.append("nombreColumna", nombreColumna.trim());
      const res = await api.post("/fondo/cargue", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMensaje(res.data?.mensaje || "Cargue realizado correctamente.");
      setArchivo(null);
      setNombreColumna("");
      document.getElementById("file-cargue-fondo")?.setAttribute("value", "");
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || "Error al cargar el archivo.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8">
      <h1 className="text-2xl font-bold mb-2">Cargue de información · Fondo reposición</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-8">
        Suba un CSV con columnas <strong>placa</strong> y <strong>valor</strong> (o el nombre de la columna, ej. ene_26).
        Si la columna no existe en la tabla, se creará automáticamente.
      </p>

      <form onSubmit={handleSubmit} className="max-w-xl space-y-6">
        <div>
          <label className="block text-sm font-semibold mb-1.5">Nombre de columna (ej. ene_26, total_2026)</label>
          <input
            type="text"
            value={nombreColumna}
            onChange={(e) => setNombreColumna(e.target.value)}
            placeholder="ene_26"
            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1.5">Archivo CSV</label>
          <input
            id="file-cargue-fondo"
            type="file"
            accept=".csv,.txt"
            onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-slate-200 file:text-slate-700"
          />
        </div>
        {error && <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>}
        {mensaje && <p className="text-green-600 dark:text-green-400 text-sm">{mensaje}</p>}
        <button
          type="submit"
          disabled={cargando}
          className="px-6 py-3 bg-primary text-white font-bold rounded-xl shadow disabled:opacity-50"
        >
          {cargando ? "Cargando…" : "Subir y cargar"}
        </button>
      </form>

      <div className="mt-10 p-4 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm text-slate-600 dark:text-slate-300">
        <p className="font-semibold mb-2">Formato del CSV:</p>
        <pre className="overflow-x-auto">
{`placa,ene_26
ABC123,1500000
XYZ789,2000000`}
        </pre>
        <p className="mt-2">O con cabecera genérica: <code>placa, valor</code> y enviar el nombre de columna en el campo de arriba.</p>
      </div>
    </div>
  );
}
