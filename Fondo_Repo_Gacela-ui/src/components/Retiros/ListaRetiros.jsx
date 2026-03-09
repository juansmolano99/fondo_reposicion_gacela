import { useEffect } from "react";
import { useRetiros } from "../../hooks/useRetiros";

export default function ListaRetiros({ placa }) {
  const { retiros, cargarRetiros, loading } = useRetiros();

  useEffect(() => {
    if (placa) cargarRetiros(placa);
  }, [placa]);

  if (loading) return <p>Cargando...</p>;

  return (
    <table>
      <thead>
        <tr>
          <th>Fecha</th>
          <th>Monto</th>
          <th>Usuario</th>
          <th>Observación</th>
        </tr>
      </thead>
      <tbody>
        {retiros.map((r) => (
          <tr key={r.id}>
            <td>{new Date(r.fecha).toLocaleDateString()}</td>
            <td>{r.monto.toLocaleString()}</td>
            <td>{r.usuario}</td>
            <td>{r.observacion || "-"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
