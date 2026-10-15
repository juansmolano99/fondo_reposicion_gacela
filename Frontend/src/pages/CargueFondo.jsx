import { useState } from "react";
import api from "../api/axios";
import { obtenerEmpresas } from "../Services/vehiculosService";

const descargarPlantilla = () => {
  const contenidoCSV = "placa,anio,mes,valor\nABC123,2026,8,1500000\nXYZ789,2026,8,2000000";
  const blob = new Blob([contenidoCSV], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "plantilla_cargue_fondo.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export default function CargueFondo() {
  const [archivo, setArchivo] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);
  
  // Estado para manejar vehículos faltantes
  const [mostrarFormularioVehiculos, setMostrarFormularioVehiculos] = useState(false);
  const [placasFaltantes, setPlacasFaltantes] = useState([]);
  const [datosCsv, setDatosCsv] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [formulariosVehiculos, setFormulariosVehiculos] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMensaje(null);
    setMostrarFormularioVehiculos(false);
    
    if (!archivo) {
      setError("Seleccione un archivo CSV.");
      return;
    }
    
    setCargando(true);
    try {
      const formData = new FormData();
      formData.append("archivo", archivo);
      const res = await api.post("/fondo/cargue", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      if (res.data.status === 'requires_vehicles') {
        // Hay placas faltantes, mostrar formulario
        setPlacasFaltantes(res.data.placas_faltantes);
        setDatosCsv(res.data.datos_csv);
        setMostrarFormularioVehiculos(true);
        
        // Cargar empresas para el formulario
        try {
          const empresasData = await obtenerEmpresas();
          setEmpresas(empresasData);
          
          // Inicializar formularios para cada placa faltante
          const formulariosIniciales = {};
          res.data.placas_faltantes.forEach(placa => {
            formulariosIniciales[placa] = {
              interno_actual: '',
              propietario_actual: '',
              modelo: '',
              carroceria: '',
              empresa_vinculacion_actual: '',
              observaciones: ''
            };
          });
          setFormulariosVehiculos(formulariosIniciales);
        } catch (err) {
          setError("Error al cargar empresas: " + (err.response?.data?.message || err.message));
        }
      } else if (res.data.status === 'success') {
        setMensaje(res.data.mensaje || "Cargue realizado correctamente.");
        setArchivo(null);
        document.getElementById("file-cargue-fondo")?.setAttribute("value", "");
      }
    } catch (err) {
      const responseData = err.response?.data;
      if (responseData?.status === 'requires_vehicles') {
        setPlacasFaltantes(responseData.placas_faltantes);
        setDatosCsv(responseData.datos_csv);
        setMostrarFormularioVehiculos(true);
        
        try {
          const empresasData = await obtenerEmpresas();
          setEmpresas(empresasData);
          
          const formulariosIniciales = {};
          responseData.placas_faltantes.forEach(placa => {
            formulariosIniciales[placa] = {
              interno_actual: '',
              propietario_actual: '',
              modelo: '',
              carroceria: '',
              empresa_vinculacion_actual: '',
              observaciones: ''
            };
          });
          setFormulariosVehiculos(formulariosIniciales);
        } catch (empErr) {
          setError("Error al cargar empresas: " + (empErr.response?.data?.message || empErr.message));
        }
      } else {
        setError(responseData?.message || err.response?.data || "Error al cargar el archivo.");
      }
    } finally {
      setCargando(false);
    }
  };

  const handleVehiculoChange = (placa, campo, valor) => {
    setFormulariosVehiculos(prev => ({
      ...prev,
      [placa]: {
        ...prev[placa],
        [campo]: valor
      }
    }));
  };

  const handleCargueCompleto = async () => {
    setError(null);
    setCargando(true);
    
    try {
      // Validar que todos los campos obligatorios estén completos
      const nuevosVehiculos = [];
      for (const placa of placasFaltantes) {
        const form = formulariosVehiculos[placa];
        if (!form.interno_actual || !form.propietario_actual || !form.modelo || 
            !form.carroceria || !form.empresa_vinculacion_actual) {
          setError(`Complete todos los campos obligatorios para la placa ${placa}`);
          setCargando(false);
          return;
        }
        
        nuevosVehiculos.push({
          placa: placa,
          numero_interno: parseInt(form.interno_actual),
          propietario: form.propietario_actual,
          modelo: parseInt(form.modelo),
          carroceria: form.carroceria,
          empresa_vinculacion: form.empresa_vinculacion_actual,
          observaciones: form.observaciones || null
        });
      }
      
      const res = await api.post("/fondo/cargue-completo", {
        nuevos_vehiculos: nuevosVehiculos,
        datos_csv: datosCsv
      });
      
      setMensaje(res.data.mensaje || "Proceso completado correctamente.");
      setMostrarFormularioVehiculos(false);
      setArchivo(null);
      setPlacasFaltantes([]);
      setDatosCsv([]);
      setFormulariosVehiculos({});
      document.getElementById("file-cargue-fondo")?.setAttribute("value", "");
    } catch (err) {
      setError(err.response?.data?.message || "Error al procesar el cargue completo.");
    } finally {
      setCargando(false);
    }
  };

  const cancelarRegistroVehiculos = () => {
    setMostrarFormularioVehiculos(false);
    setPlacasFaltantes([]);
    setDatosCsv([]);
    setFormulariosVehiculos({});
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8">
      <h1 className="text-2xl font-bold mb-2">Cargue de información · Fondo reposición</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-8">
        Suba un CSV con el formato especificado para registrar movimientos en el fondo de reposición.
      </p>

      {!mostrarFormularioVehiculos ? (
        <form onSubmit={handleSubmit} className="max-w-xl space-y-6">
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
            {cargando ? "Procesando…" : "Subir y procesar"}
          </button>
        </form>
      ) : (
        <div className="max-w-4xl space-y-6">
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 rounded-xl">
            <h3 className="font-bold text-amber-800 dark:text-amber-200 mb-2">
              ⚠️ Se detectaron placas no registradas
            </h3>
            <p className="text-sm text-amber-700 dark:text-amber-300 mb-4">
              Complete la información de los siguientes vehículos para continuar con el cargue:
            </p>
            <div className="flex flex-wrap gap-2">
              {placasFaltantes.map(placa => (
                <span key={placa} className="px-3 py-1 bg-amber-100 dark:bg-amber-800 text-amber-800 dark:text-amber-200 rounded-full text-sm font-bold">
                  {placa}
                </span>
              ))}
            </div>
          </div>

          {placasFaltantes.map(placa => (
            <div key={placa} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-xl">
              <h4 className="font-bold text-lg mb-4 text-slate-900 dark:text-white">
                Vehículo: {placa}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-slate-700 dark:text-slate-300">
                    Placa *
                  </label>
                  <input
                    type="text"
                    value={placa}
                    disabled
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 text-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-slate-700 dark:text-slate-300">
                    Número Interno *
                  </label>
                  <input
                    type="number"
                    value={formulariosVehiculos[placa]?.interno_actual || ''}
                    onChange={(e) => handleVehiculoChange(placa, 'interno_actual', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-slate-700 dark:text-slate-300">
                    Propietario *
                  </label>
                  <input
                    type="text"
                    value={formulariosVehiculos[placa]?.propietario_actual || ''}
                    onChange={(e) => handleVehiculoChange(placa, 'propietario_actual', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-slate-700 dark:text-slate-300">
                    Modelo *
                  </label>
                  <input
                    type="number"
                    value={formulariosVehiculos[placa]?.modelo || ''}
                    onChange={(e) => handleVehiculoChange(placa, 'modelo', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-slate-700 dark:text-slate-300">
                    Carrocería *
                  </label>
                  <input
                    type="text"
                    value={formulariosVehiculos[placa]?.carroceria || ''}
                    onChange={(e) => handleVehiculoChange(placa, 'carroceria', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-slate-700 dark:text-slate-300">
                    Empresa Vinculación *
                  </label>
                  <select
                    value={formulariosVehiculos[placa]?.empresa_vinculacion_actual || ''}
                    onChange={(e) => handleVehiculoChange(placa, 'empresa_vinculacion_actual', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    required
                  >
                    <option value="">Seleccione una empresa</option>
                    {empresas.map(empresa => (
                      <option key={empresa} value={empresa}>{empresa}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-1.5 text-slate-700 dark:text-slate-300">
                    Observaciones
                  </label>
                  <textarea
                    value={formulariosVehiculos[placa]?.observaciones || ''}
                    onChange={(e) => handleVehiculoChange(placa, 'observaciones', e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          ))}

          <div className="flex gap-4">
            <button
              type="button"
              onClick={cancelarRegistroVehiculos}
              disabled={cargando}
              className="px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleCargueCompleto}
              disabled={cargando}
              className="px-6 py-3 bg-primary text-white font-bold rounded-xl shadow disabled:opacity-50"
            >
              {cargando ? "Procesando…" : "Registrar vehículos y procesar carga"}
            </button>
          </div>
        </div>
      )}

      <div className="mt-10 p-4 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm text-slate-600 dark:text-slate-300">
        <div className="flex items-center justify-between mb-2">
          <p className="font-semibold">Formato del CSV:</p>
          <button
            type="button"
            onClick={descargarPlantilla}
            className="flex items-center gap-2 px-3 py-1.5 bg-primary text-white text-sm font-bold rounded-lg hover:opacity-90"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            Descargar plantilla CSV
          </button>
        </div>
        <pre className="overflow-x-auto">
{`placa,anio,mes,valor
ABC123,2026,1,1500000
XYZ789,2026,1,2000000`}
        </pre>
        <p className="mt-2 text-xs">
          <strong>Columnas:</strong><br/>
          • placa: Placa del vehículo<br/>
          • anio: Año (4 dígitos)<br/>
          • mes: Mes (1-12)<br/>
          • valor: Monto del movimiento
        </p>
      </div>
    </div>
  );
}
