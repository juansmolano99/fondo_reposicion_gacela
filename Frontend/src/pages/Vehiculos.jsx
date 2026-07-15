import { useState } from "react";
import axios from "../api/axios";
import Resumen from "../components/Resumen";
import DetalleAnual from "../components/DetalleAnual";
import VehiculoRetiros from "../components/Retiros/VehiculoRetiros";
import ListaSolicitudes from "../components/Solicitudes/ListaSolicitudes";


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
  const [refreshSolicitudes, setRefreshSolicitudes] = useState(0);

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

  const handlePlacaChange = (e) => {
    let input = e.target.value.toUpperCase();
    let cleanInput = input.replace(/[^A-Z0-9]/g, '');
    let letters = cleanInput.substring(0, 3).replace(/[^A-Z]/g, '');
    let numbers = cleanInput.substring(3, 6).replace(/[^0-9]/g, '');
    let formatted = letters;
    if (letters.length === 3 && cleanInput.length > 3) {formatted += '-' + numbers;} 
    else if (letters.length === 3 && input.endsWith('-')) {formatted += '-';}
    setPlaca(formatted);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Vehículos</h1>

      {/* Buscador */}
      <div className="flex gap-2 max-w-md">
        <input
          className="border rounded px-3 py-2 flex-1 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
          placeholder="Placa (ej: AAA-123)"
          value={placa}
          onChange={handlePlacaChange}
          maxLength={7}
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
          <div className="card card-section rounded-xl shadow">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{vehiculo.placa}</h2>
            <p className="card-subtitle">
              Numero Interno: {vehiculo.numeroInternoActual} ·{" "}
              Vida Util Restante: {vehiculo.vidaUtilAnios} {"Años"}
            </p>
          </div>

          {/* Menú de vistas */}
          <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800">
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
            <Tab
              label="Solicitudes"
              active={vista === "solicitudes"}
              onClick={() => setVista ("solicitudes")}
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

              <div className="card card-section rounded-xl shadow">
                <h3 className="card-title mb-4">
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

          {/* ===== VISTA SOLICITUDES ===== */}
          {vista === "solicitudes" && (
            <div className="space-y-4">
              <ListaSolicitudes
                key={refreshSolicitudes}
                placaVehiculo={vehiculo.placa}
              />
            </div>
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
          : "border-transparent text-slate-500 dark:text-slate-300 hover:text-slate-700 dark:hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}

function Kpi({ title, value }) {
  return (
    <div className="card p-5 rounded-xl shadow">
      <p className="text-sm text-slate-500 dark:text-slate-300">{title}</p>
      <p className="text-2xl font-bold mt-2 text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}

function Item({ label, value }) {
  return (
    <div className="flex flex-col">
      <span className="text-slate-500 dark:text-slate-300">{label}</span>
      <span className="font-medium text-slate-900 dark:text-white">{value}</span>
    </div>
  );
}
