import axios from "../api/axios";

export async function getDashboardResumen() {
  const response = await axios.get("/dashboard/resumen");
  return response.data;
}

export async function getVehiculoResumen(placa) {
  const response = await axios.get(`/vehiculos/${placa}/resumen`);
  return response.data;
}

export async function getVehiculoFondosMensuales(placa, anio) {
  const response = await axios.get(`/vehiculos/${placa}/fondos/${anio}`);
  return response.data;
}

export async function getRetirosPorPlaca(placa) {
  const response = await axios.get(`/retiros/${placa}`);
  return response.data;
}
