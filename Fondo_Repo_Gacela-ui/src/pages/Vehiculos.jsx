import { useState } from "react";
import axios from "../api/axios";
import Resumen from "../components/Resumen";
import DetalleAnual from "../components/DetalleAnual";
import VehiculoRetiros from "../components/Retiros/VehiculoRetiros";


// Formato moneda COP
const formatCOP = (value) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value);

export default function Vehiculos() {
  const [placa, setPlaca] = useState("");
  const [vehiculo, setVehiculo] = useState(null);
  const [vista, setVista] = useState("consulta"); // consulta | resumen | detalle
  const [anioSeleccionado, setAnioSeleccionado] = useState(null);
  const [loading, setLoading] = useState(false);

  const buscar = async () => {
    if (!placa) return;

    try {
      setLoading(true);
      const res = await axios.get(`/vehiculos/${placa}`);
      setVehiculo(res.data);
      setVista("consulta");
      setAnioSeleccionado(null);
    } catch (err) {
      console.error(err);
      alert("Vehículo no encontrado");
      setVehiculo(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Vehículos</h1>

      {/* Buscador */}
      <div className="flex gap-2 max-w-md">
        <input
          className="border rounded px-3 py-2 flex-1"
          placeholder="Placa (ej: AAA-123)"
          value={placa}
          onChange={(e) => setPlaca(e.target.value.toUpperCase())}
        />
        <button
          onClick={buscar}
          className="bg-green-600 hover:bg-green-700 text-white px-4 rounded"
        >
          Buscar
        </button>
      </div>

      {loading && <p>Cargando vehículo...</p>}

      {vehiculo && (
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white rounded-xl p-6 shadow">
            <h2 className="text-2xl font-bold">{vehiculo.placa}</h2>
            <p className="text-slate-500">
              Numero Interno: {vehiculo.numeroInternoActual} ·{" "}
              Vida Util Restante: {vehiculo.vidaUtilAnios} {"Años"}
            </p>
          </div>

          {/* Menú de vistas */}
          <div className="flex gap-4 border-b">
            <Tab
              label="Consulta"
              active={vista === "consulta"}
              onClick={() => setVista("consulta")}
            />
            <Tab
              label="Resumen"
              active={vista === "resumen"}
              onClick={() => setVista("resumen")}
            />
            <Tab
              label="Detalle"
              active={vista === "detalle"}
              onClick={() => setVista("detalle")}
            />
            <Tab
              label="Retiros"
              active={vista === "retiros"}
              onClick={() => setVista("retiros")}
            />


          </div>

          {/* ===== VISTA CONSULTA ===== */}
          {vista === "consulta" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Kpi
                  title="Total 2023"
                  value={formatCOP(vehiculo.total2023)}
                />
                <Kpi
                  title="Total 2024"
                  value={formatCOP(vehiculo.total2024)}
                />
                <Kpi
                  title="Total 2025"
                  value={formatCOP(vehiculo.total2025)}
                />
              </div>

              <div className="bg-white rounded-xl p-6 shadow">
                <h3 className="text-lg font-semibold mb-4">
                  Información general
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <Item label="Modelo" value={vehiculo.modelo} />
                  <Item label="Carrocería" value={vehiculo.carroceria} />
                  <Item
                    label="Propietario"
                    value={vehiculo.propietarioActual}
                  />
                  <Item
                    label="Empresa vinculada"
                    value={vehiculo.empresaVinculacionActual}
                  />
                </div>
              </div>
            </>
          )}

          {/* ===== VISTA RESUMEN ===== */}
          {vista === "resumen" && (
            <Resumen
              vehiculo={vehiculo}
              onSelectAnio={(anio) => {
                setAnioSeleccionado(anio);
                setVista("detalle");
              }}
            />
          )}

          {/* ===== VISTA DETALLE ===== */}
          {vista === "detalle" && (
            <DetalleAnual
              placa={vehiculo.placa}
              anio={anioSeleccionado}
              onSelectAnio={setAnioSeleccionado}
            />
          )}
          {/* ===== VISTA RETIRO ===== */}
          {vista === "retiros" && (
            <VehiculoRetiros placa={vehiculo.placa} />
          )}
        </div>
      )}
    </div>
  );
}

/* ---------- COMPONENTES AUX ---------- */

function Tab({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`pb-2 font-medium border-b-2 transition ${
        active
          ? "border-green-600 text-green-600"
          : "border-transparent text-slate-500 hover:text-slate-700"
      }`}
    >
      {label}
    </button>
  );
}

function Kpi({ title, value }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="text-2xl font-bold mt-2">{value}</p>
    </div>
  );
}

function Item({ label, value }) {
  return (
    <div className="flex flex-col">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
