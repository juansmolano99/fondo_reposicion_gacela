import { useEffect, useState } from "react";
import axios from "../api/axios";

// Formato COP
const formatCOP = (value) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value || 0);

const MESES = [
  { key: "ene", label: "Enero" },
  { key: "feb", label: "Febrero" },
  { key: "mar", label: "Marzo" },
  { key: "abr", label: "Abril" },
  { key: "may", label: "Mayo" },
  { key: "jun", label: "Junio" },
  { key: "jul", label: "Julio" },
  { key: "ago", label: "Agosto" },
  { key: "sep", label: "Septiembre" },
  { key: "oct", label: "Octubre" },
  { key: "nov", label: "Noviembre" },
  { key: "dic", label: "Diciembre" },
];

export default function DetalleAnual({ placa, anio, onSelectAnio }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!placa || !anio) return;

    const cargar = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `/vehiculos/${placa}/fondos/${anio}`
        );
        setData(res.data);
      } catch (err) {
        console.error("Error cargando detalle anual", err);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, [placa, anio]);

  if (!anio) {
    return (
      <p className="text-slate-500">
        Seleccione un año para ver el detalle.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {/* Selector de año */}
      <div className="flex gap-2">
        {[2023, 2024, 2025].map((a) => (
          <button
            key={a}
            onClick={() => onSelectAnio(a)}
            className={`px-4 py-2 rounded font-medium ${
              anio === a
                ? "bg-green-600 text-white"
                : "bg-slate-200 hover:bg-slate-300"
            }`}
          >
            {a}
          </button>
        ))}
      </div>

      {loading && <p>Cargando detalle anual...</p>}

      {data && (
        <>
          {/* Header */}
          <div className="bg-white rounded-xl p-6 shadow">
            <h3 className="text-xl font-bold">
              Detalle mensual · {placa}
            </h3>
            <p className="text-slate-500">
              Año {anio}
            </p>
          </div>

          {/* Total anual */}
          <div className="bg-white rounded-xl p-6 shadow">
            <p className="text-sm text-slate-500">Total año {anio}</p>
            <p className="text-3xl font-bold mt-2">
              {formatCOP(
                Object.values(data.valores || {}).reduce(
                  (acc, v) => acc + v,
                  0
                )
              )}
            </p>
          </div>

          {/* Tabla mensual */}
          <div className="bg-white rounded-xl p-6 shadow">
            <h4 className="text-lg font-semibold mb-4">
              Valores mensuales
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {MESES.map((m) => (
                <div
                  key={m.key}
                  className="flex justify-between border-b pb-2"
                >
                  <span className="text-slate-600">
                    {m.label}
                  </span>
                  <span className="font-medium">
                    {formatCOP(data.valores?.[m.key])}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
