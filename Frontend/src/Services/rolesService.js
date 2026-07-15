import axios from "../api/axios";

export const getRoles = async () => {
  const res = await axios.get("/roles");
  return res.data;
};

export const getPermisos = async () => {
  const res = await axios.get("/roles/permisos");
  return res.data;
};

export const asignarPermiso = async (rolId, permisoId) => {
  await axios.post("/roles/asignar", { rolId, permisoId });
};

export const quitarPermiso = async (rolId, permisoId) => {
  await axios.post("/roles/quitar", { rolId, permisoId });
};
 