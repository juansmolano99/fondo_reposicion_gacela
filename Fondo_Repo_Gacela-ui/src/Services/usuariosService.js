import api from "./api";

export const obtenerUsuarios = async () => {
  const res = await api.get("/usuarios");
  return res.data;
};

export const obtenerRoles = async () => {
  const res = await api.get("/usuarios/roles");
  return res.data;
};

export const crearUsuario = async (data) => {
  await api.post("/usuarios", data);
};

export const editarUsuario = async (id, data) => {
  await api.put(`/usuarios/${id}`, data);
};

export const cambiarEstadoUsuario = async (id) => {
  await api.put(`/usuarios/${id}/estado`, {});
};

export const eliminarUsuario = async (id) => {
  await api.delete(`/usuarios/${id}`);
};
