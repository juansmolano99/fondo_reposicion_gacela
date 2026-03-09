import api from "./api";

export const obtenerSaldoDisponible = async (placa) => {
  const res = await api.get(`/retiros/saldo/${placa}`);
  return res.data;
};

export const obtenerRetirosPorPlaca = async (placa) => {
  const res = await api.get(`/retiros/${placa}`);
  return res.data;
};

export const crearRetiro = async (data) => {
  const res = await api.post("/retiros", data);
  return res.data;
};

/** Crea retiro con archivo adjunto (FormData: placa, monto, observacion, archivo). */
export const crearRetiroConAdjunto = async (formData) => {
  const res = await api.post("/retiros/with-file", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};
