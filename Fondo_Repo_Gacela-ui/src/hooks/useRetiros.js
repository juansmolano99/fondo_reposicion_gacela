import { useState } from "react";
import {
  obtenerRetirosPorPlaca,
  crearRetiro
} from "../services/retirosService";

export function useRetiros() {
  const [retiros, setRetiros] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const cargarRetiros = async (placa) => {
    try {
      setLoading(true);
      const data = await obtenerRetirosPorPlaca(placa);
      setRetiros(data);
    } catch (e) {
      setError(e.response?.data || "Error al cargar retiros");
    } finally {
      setLoading(false);
    }
  };

  const registrarRetiro = async (retiro) => {
    return await crearRetiro(retiro);
  };

  return {
    retiros,
    loading,
    error,
    cargarRetiros,
    registrarRetiro
  };
}
