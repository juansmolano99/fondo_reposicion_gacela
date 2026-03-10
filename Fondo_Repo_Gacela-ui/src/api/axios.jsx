import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://192.168.10.118:5092";
const api = axios.create({
  baseURL: `${API_BASE}/api`,
});

// Agregar token automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
