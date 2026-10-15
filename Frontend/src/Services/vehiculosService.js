import api from "./api";

export const obtenerEmpresas = async () => {
  const res = await api.get("/vehiculos/empresas");
  return res.data;
};
