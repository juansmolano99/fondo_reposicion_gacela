import api from "../api/axios";

export async function login(usuario, password) {
  const response = await api.post(`/auth/login`, {
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
