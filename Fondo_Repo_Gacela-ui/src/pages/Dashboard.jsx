import { useEffect, useState } from "react";
import { getDashboardResumen } from "../services/dashboardService";
import { formatCurrencyCOP } from "../Utils/format";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const formatMillions = (value) => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(0)} MM`;  // Formatea como $100 MM
  }
  return `$${value.toLocaleString()}`;  // En caso de que no sea millón, muestra el número con separadores
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardResumen()
      .then((res) => {
        setData(res);
      })
      .catch((err) => {
        console.error("Error cargando dashboard", err);
      })
      .finally(() => setLoading(false));
  }, []);
  

  if (loading) return <div>Cargando dashboard...</div>;
  if (!data) return <div>No hay información disponible</div>;

  return (
    <div className="text-container space-y-8">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="text-container">
        <Kpi title="Total Disponible Reposición" value={formatCurrencyCOP(data.totalReposicion)} />
        </div>
        <div className="text-container">
        <Kpi title="Total Retiros" value={formatCurrencyCOP(data.totalRetiros)} />
        </div>
        <Kpi title="Usuarios Activos" value={data.usuariosActivos} />
        <div className="text-container">
        <Kpi title="Presupuesto (%)" value={`${data.presupuestoUtilizado}%`} />
        </div>
      </div>

      {/* Gráfico */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow">
        <h2 className="text-lg font-semibold mb-4">
          Flujo mensual de reposición
        </h2>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.flujoMensual} margin={{ top: 20, right: 20, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" angle={-45} textAnchor="end"/>
            <YAxis tickFormatter={(value) => formatMillions(value)} /> {/* Funcion Millones abreviados */}
            <Tooltip formatter={(value) => formatMillions(value)} /> {/* Funcion Millones abreviados */}
            <Line type="monotone" dataKey="valor" stroke="#2563eb" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function Kpi({ title, value }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-5 shadow">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="text-2xl font-bold mt-2">{value}</p>
    </div>
  );
}
