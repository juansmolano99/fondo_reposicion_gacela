import { useEffect, useState } from "react";
import { obtenerSaldoDisponible, obtenerRetirosPorPlaca, crearRetiro, crearRetiroConAdjunto } from "../../Services/retiroService";
import api from "../../api/axios";

const formatCOP = (value) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(Number(value || 0));

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5092";

function VerAdjuntoLink({ ruta }) {
  const [loading, setLoading] = useState(false);
  const handleVer = async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };
  return (
    <button
      type="button"
      onClick={handleVer}
      disabled={loading}
      className="text-primary hover:underline font-medium"
    >
      {loading ? "…" : "Ver"}
    </button>
  );
}

export default function VehiculoRetiros({ placa }) {
  const [saldo, setSaldo] = useState(0);
  const [retiros, setRetiros] = useState([]);
  const [monto, setMonto] = useState("");
  const [observacion, setObservacion] = useState("");
  const [archivo, setArchivo] = useState(null);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const cargarDatos = async () => {
    setLoading(true);
    setError(null);
    try {
      const [saldoVal, retirosList] = await Promise.all([
        obtenerSaldoDisponible(placa),
        obtenerRetirosPorPlaca(placa),
      ]);
      setSaldo(saldoVal);
      setRetiros(retirosList);
    } catch (err) {
      setError(err.response?.data || "Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (placa) cargarDatos();
  }, [placa]);

  const registrarRetiro = async () => {
    if (!monto || Number(monto) <= 0) {
      setError("Monto inválido");
      return;
    }
    setSubiendo(true);
    setError(null);
    try {
      if (archivo && archivo.size > 0) {
        const formData = new FormData();
        formData.append("placa", placa);
        formData.append("monto", String(Number(monto)));
        formData.append("observacion", observacion || "");
        formData.append("archivo", archivo);
        await crearRetiroConAdjunto(formData);
      } else {
        await crearRetiro({
          placa,
          monto: Number(monto),
          observacion: observacion || undefined,
        });
      }
      setMonto("");
      setObservacion("");
      setArchivo(null);
      document.getElementById("input-adjunto-retiro")?.setAttribute("value", "");
      await cargarDatos();
    } catch (err) {
      setError(err.response?.data || "Error al registrar retiro");
    } finally {
      setSubiendo(false);
    }
  };

  if (loading) return <p className="p-6">Cargando retiros...</p>;

  return (
    <div className="space-y-6">

      {/* SALDO */}
      <div className="bg-gradient-to-r from-emerald-50 to-white dark:from-slate-800 dark:to-slate-800/50 p-8 rounded-2xl shadow-sm border border-emerald-100 dark:border-slate-700">
        <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
          Saldo disponible
        </p>
        <div className="flex items-baseline space-x-2">
          <span className="text-4xl font-black">
            {formatCOP(saldo)}
          </span>
          <span className="text-slate-400 font-medium">COP</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* FORMULARIO */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 h-full">
            <h2 className="text-lg font-bold mb-6">
              Registrar retiro
            </h2>

            <div className="space-y-5">

              <div>
                <label className="block text-sm font-semibold mb-1.5">
                  Monto del retiro
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-medium">
                    $
                  </span>
                  <input
                    type="number"
                    value={monto}
                    onChange={(e) => setMonto(e.target.value)}
                    placeholder="0"
                    className="block w-full pl-8 pr-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1.5">
                  Observación (opcional)
                </label>
                <textarea
                  value={observacion}
                  onChange={(e) => setObservacion(e.target.value)}
                  rows="4"
                  placeholder="Detalles del retiro..."
                  className="block w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1.5">
                  Archivo adjunto (opcional)
                </label>
                <input
                  id="input-adjunto-retiro"
                  type="file"
                  onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
                  className="block w-full text-sm text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-slate-200 file:text-slate-700"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              )}

              <button
                type="button"
                onClick={registrarRetiro}
                disabled={subiendo}
                className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
              >
                {subiendo ? "Registrando…" : "Registrar retiro"}
              </button>

            </div>
          </div>
        </div>

        {/* HISTORIAL */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 h-full overflow-hidden flex flex-col">

            <div className="p-6 border-b">
              <h2 className="text-lg font-bold">
                Historial de retiros
              </h2>
            </div>

            <div className="flex-1 overflow-x-auto">
              {retiros.length === 0 ? (
                <p className="p-6 text-slate-500">
                  No hay retiros registrados
                </p>
              ) : (
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-900/50">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold uppercase">Fecha</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase">Monto</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase">Usuario</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase">Observación</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase">Adjunto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {retiros.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition">
                        <td className="px-6 py-5 text-sm">
                          {new Date(r.fecha).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-5 text-sm font-bold">
                          {formatCOP(r.monto)}
                        </td>
                        <td className="px-6 py-5 text-sm">
                          {r.usuario}
                        </td>
                        <td className="px-6 py-5 text-sm italic text-slate-500">
                          {r.observacion || "-"}
                        </td>
                        <td className="px-6 py-5 text-sm">
                          {r.rutaAdjunto ? (
                            <VerAdjuntoLink ruta={r.rutaAdjunto} />
                          ) : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}