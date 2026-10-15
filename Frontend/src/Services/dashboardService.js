import axios from "../api/axios";

export async function getDashboardResumen(anio) {
  const response = await axios.get('/dashboard', {
    params: { anio }
  });
  return response.data;
}

export async function getVehiculoResumen(placa) {
  const response = await axios.get(`/vehiculos/${placa}/resumen`);
  return response.data;
}

export async function getVehiculoFondosMensuales(placa, anio) {
  const response = await axios.get(`/vehiculos/${placa}/fondos`, {
    params: { anio }
  });
  return response.data;
}

export async function getRetirosPorPlaca(placa, anio) {
  const response = await axios.get(`/retiros/${placa}`, {
    params: { anio }
  });
  return response.data;
}