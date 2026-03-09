import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5092";
const API_URL = `${API_BASE}/api/auth`;

export async function login(usuario, password) {
  const response = await axios.post(`${API_URL}/login`, {
    usuario,
    password
  });

  const { token, nombreCompleto, usuario: usuarioResp, rol } = response.data;

  if (!token) {
    throw new Error("Token no recibido");
  }

  localStorage.setItem("token", token);
  if (nombreCompleto) localStorage.setItem("nombreCompleto", nombreCompleto);
  if (usuarioResp) localStorage.setItem("usuario", usuarioResp);
  if (rol) localStorage.setItem("rol", rol);
  return token;
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("nombreCompleto");
  localStorage.removeItem("usuario");
  localStorage.removeItem("rol");
}
