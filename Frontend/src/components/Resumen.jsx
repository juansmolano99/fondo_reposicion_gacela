import { useEffect, useState } from "react";
import axios from "../api/axios";

// Formato moneda COP
const formatCOP = (value) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 2,
  }).format(value);

export default function Resumen({ vehiculo, onSelectAnio }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const cargarResumen = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `/vehiculos/${vehiculo.placa}/resumen`
        );
        setData(res.data);
      } catch (err) {
        console.error(err);
        alert("Error cargando resumen");
      } finally {
        setLoading(false);
      }
    };

    cargarResumen();
  }, [vehiculo.placa]);

  if (loading) return <p>Cargando resumen...</p>;
  if (!data) return null;

  return (
    <div className="space-y-6">

      <h3 className="text-lg font-semibold">
        Resumen financiero
      </h3>

      {/* Totales por año */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ResumenCard
          label="Año 2023"
          value={formatCOP(data.total2023)}
          onClick={() => onSelectAnio(2023)}
        />
        <ResumenCard
          label="Año 2024"
          value={formatCOP(data.total2024)}
          onClick={() => onSelectAnio(2024)}
        />
        <ResumenCard
          label="Año 2025"
          value={formatCOP(data.total2025)}
          onClick={() => onSelectAnio(2025)}
        />
      </div>

      {/* Totales generales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Kpi
          title="Total general"
          value={formatCOP(data.totalGeneral)}
        />
        <Kpi
          title="Promedio mensual"
          value={formatCOP(data.promedioMensual)}
        />
      </div>
    </div>
  );
}

/* ---------- Auxiliares ---------- */

function ResumenCard({ label, value, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-slate-900 rounded-xl p-5 shadow cursor-pointer hover:ring-2 hover:ring-green-500 transition"
    >
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-2xl font-bold mt-2">{value}</p>
      <p className="text-xs text-green-600 mt-1">
        Ver detalle →
      </p>
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
