import axios from "../api/axios";

export async function getDashboardResumen() {
  const response = await axios.get("/dashboard/resumen");
  return response.data;
}
