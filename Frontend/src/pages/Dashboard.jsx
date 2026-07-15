import { useEffect, useMemo, useState } from "react";
import {
  getDashboardResumen,
  getRetirosPorPlaca,
  getVehiculoFondosMensuales,
  getVehiculoResumen,
} from "../Services/dashboardService";
import { formatCurrencyCOP } from "../Utils/format";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const formatMillions = (value) => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(0)} MM`;  // Formatea como $100 MM
  }
  return `$${value.toLocaleString()}`;  // En caso de que no sea millón, muestra el número con separadores
};

const formatPlaca = (value) => {
  const input = String(value || "").toUpperCase();
  const clean = input.replace(/[^A-Z0-9]/g, "");
  const letters = clean.substring(0, 3).replace(/[^A-Z]/g, "");
  const numbers = clean.substring(3, 6).replace(/[^0-9]/g, "");
  if (letters.length === 3 && numbers.length > 0) return `${letters}-${numbers}`;
  return letters;
};

const sumValues = (obj) => {
  if (!obj || typeof obj !== "object") return 0;
  return Object.values(obj).reduce((acc, v) => acc + Number(v || 0), 0);
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [placaInput, setPlacaInput] = useState("");
  const [placaQuery, setPlacaQuery] = useState("");
  const [modo, setModo] = useState("general");
  const [error, setError] = useState("");
  const [anio, setAnio] = useState(() => new Date().getFullYear());

  const anioActual = useMemo(() => new Date().getFullYear(), []);

  useEffect(() => {
    if (modo === "general") {
      setError("");
      setPlacaQuery("");
    }
  }, [modo]);

  const isPlacaCompleta = (p) => /^[A-Z]{3}-\d{3}$/.test(String(p || "").trim());

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        if (modo === "placa") {
          const placaTrim = placaQuery.trim();
          if (!placaTrim) {
            setData(null);
            setError("Ingresa una placa y presiona Buscar");
            return;
          }

          if (!isPlacaCompleta(placaTrim)) {
            setData(null);
            setError("La placa debe tener el formato AAA-123");
            return;
          }

          const [resumenVeh, fondos, retiros] = await Promise.all([
            getVehiculoResumen(placaTrim),
            getVehiculoFondosMensuales(placaTrim, anio),
            getRetirosPorPlaca(placaTrim),
          ]);

          const totalRetiros = Array.isArray(retiros)
            ? retiros.reduce((acc, r) => acc + Number(r?.monto || 0), 0)
            : 0;

          const valoresMensuales = fondos?.valores || {};
          const flujoMensual = Object.entries(valoresMensuales).map(([mes, valor]) => ({
            mes,
            valor: Number(valor || 0),
          }));

          const totalReposicion = sumValues(valoresMensuales);

          if (!cancelled) {
            setData({
              modo: "placa",
              placa: placaTrim,
              totalReposicion,
              totalRetiros,
              usuariosActivos: null,
              presupuestoUtilizado: null,
              flujoMensual,
              fondosMensuales: valoresMensuales,
              anio,
              detallePlaca: resumenVeh,
            });
          }
        } else {
          const res = await getDashboardResumen();
          if (!cancelled) setData({ ...res, modo: "general" });
        }
      } catch (err) {
        console.error("Error cargando dashboard", err);
        if (!cancelled) {
          setData(null);
          setError(err?.response?.data || "Error cargando dashboard");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [modo, placaQuery, anio, anioActual]);
  

  if (loading) return <div className="text-slate-600 dark:text-slate-300">Cargando dashboard...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Resumen general y por placa</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="card p-1 rounded-xl border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setModo("general")}
              className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${
                modo === "general"
                  ? "bg-slate-900 text-white dark:bg-slate-700"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              General
            </button>
            <button
              type="button"
              onClick={() => setModo("placa")}
              className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${
                modo === "placa"
                  ? "bg-slate-900 text-white dark:bg-slate-700"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              Por placa
            </button>
          </div>

          {modo === "placa" && (
            <div className="flex items-center gap-2">
              <input
                value={placaInput}
                onChange={(e) => setPlacaInput(formatPlaca(e.target.value))}
                placeholder="AAA-123"
                maxLength={7}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm font-semibold text-slate-900 dark:text-white"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setPlacaQuery(placaInput.trim());
                  }
                }}
              />
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setPlacaQuery(placaInput.trim());
                }}
                className="px-3 py-2 text-sm font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Buscar
              </button>
              <button
                type="button"
                onClick={() => {
                  setPlacaInput("");
                  setPlacaQuery("");
                  setError("");
                  setData(null);
                }}
                className="px-3 py-2 text-sm font-bold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
              >
                Limpiar
              </button>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 px-4 py-2 rounded-xl">
          {String(error)}
        </div>
      )}

      {!data && !error && (
        <div className="text-slate-600 dark:text-slate-300">No hay información disponible</div>
      )}

      {/* KPIs */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <Kpi
            title="Total Reposición"
            value={formatCurrencyCOP(data.totalReposicion)}
            subtitle={data?.modo === "placa" ? `Placa: ${data.placa}` : "General"}
          />
          <Kpi
            title="Total Retiros"
            value={formatCurrencyCOP(data.totalRetiros)}
            subtitle={data?.modo === "placa" ? "Histórico de retiros" : "General"}
          />
          <Kpi
            title="Usuarios Activos"
            value={data.usuariosActivos ?? "—"}
            subtitle={data?.modo === "placa" ? "No aplica" : "Sistema"}
          />
          <Kpi
            title="Presupuesto (%)"
            value={data.presupuestoUtilizado != null ? `${data.presupuestoUtilizado}%` : "—"}
            subtitle={data?.modo === "placa" ? "No aplica" : "Indicador"}
          />
        </div>
      )}

      {modo === "placa" && (
        <div className="card card-section">
          <div className="card-header">
            <div>
              <h2 className="card-title">Detalle por año</h2>
              <p className="card-subtitle">Selecciona un año para ver el detalle mensual</p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {[anioActual - 2, anioActual - 1, anioActual].map((y) => (
                <button
                  key={y}
                  type="button"
                  onClick={() => setAnio(y)}
                  className={`px-3 py-2 rounded-xl text-sm font-black border transition-colors ${
                    anio === y
                      ? "bg-slate-900 text-white border-slate-900 dark:bg-slate-700 dark:border-slate-700"
                      : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  {y}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 dark:text-slate-400">
                  <th className="py-2 pr-4 font-black uppercase tracking-widest text-[10px]">Mes</th>
                  <th className="py-2 pr-4 font-black uppercase tracking-widest text-[10px]">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {!data?.fondosMensuales || Object.keys(data.fondosMensuales).length === 0 ? (
                  <tr>
                    <td colSpan={2} className="py-3 text-slate-600 dark:text-slate-300">
                      {placaQuery && isPlacaCompleta(placaQuery)
                        ? "Sin valores para este año."
                        : "Ingresa una placa completa y presiona Buscar."}
                    </td>
                  </tr>
                ) : (
                  Object.entries(data.fondosMensuales).map(([mes, valor]) => (
                    <tr key={mes} className="text-slate-800 dark:text-slate-200">
                      <td className="py-3 pr-4 font-semibold">{mes}</td>
                      <td className="py-3 pr-4 font-black">{formatCurrencyCOP(Number(valor || 0))}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Gráfico */}
      {data && (
        <div className="card card-section">
          <div className="card-header mb-4">
            <div>
              <h2 className="card-title">Flujo mensual de reposición</h2>
              <p className="card-subtitle">
                {data?.modo === "placa" ? `Año ${anio} (por placa)` : "General"}
              </p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={data.flujoMensual} margin={{ top: 16, right: 16, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" angle={-35} textAnchor="end" />
              <YAxis tickFormatter={(value) => formatMillions(value)} />
              <Tooltip formatter={(value) => formatMillions(value)} />
              <Line type="monotone" dataKey="valor" stroke="#0ea5e9" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

function Kpi({ title, value, subtitle }) {
  return (
    <div className="card p-5">
      <p className="text-xs uppercase tracking-widest font-black text-slate-400">{title}</p>
      <p className="text-2xl font-black mt-2 text-slate-900 dark:text-white">{value}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>
    </div>
  );
}
