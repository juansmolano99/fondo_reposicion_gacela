import { useState } from "react";
import { useRetiros } from "../../hooks/useRetiros";

export default function FormRetiro({ placa, saldoDisponible, onSuccess }) {
  const { registrarRetiro } = useRetiros();

  const [monto, setMonto] = useState(0);
  const [montoDisplay, setMontoDisplay] = useState("");
  const [observacion, setObservacion] = useState("");
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const formatter = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0
  });

  const handleChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "");
    const numeric = raw ? parseInt(raw, 10) : 0;

    setMonto(numeric);
    setMontoDisplay(raw ? formatter.format(numeric) : "");
  };

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (monto <= 0) {
      setError("El monto debe ser mayor a 0");
      return;
    }

    if (monto > saldoDisponible) {
      setError(
        `Saldo insuficiente. Disponible: ${formatter.format(saldoDisponible)}`
      );
      return;
    }

    try {
      await registrarRetiro({
        placa,
        monto,
        observacion
      });

      setMonto(0);
      setMontoDisplay("");
      setObservacion("");
      setSuccessMessage("Retiro registrado correctamente");
      onSuccess?.();

    } catch (e) {
      setError(e.response?.data || "Error al registrar retiro");
    }
  };

  return (
    <form onSubmit={submit}>
      <h3>Registrar retiro</h3>

      <p>
        <strong>Saldo disponible:</strong>{" "}
        {formatter.format(saldoDisponible)}
      </p>

      <input
        type="text"
        inputMode="numeric"
        placeholder="$ 0"
        value={montoDisplay}
        onChange={handleChange}
      />

      <textarea
        placeholder="Observación (opcional)"
        value={observacion}
        onChange={(e) => setObservacion(e.target.value)}
      />

      {error && <p className="error">{error}</p>}
      {successMessage && <p className="success">{successMessage}</p>}

      <button type="submit">Registrar</button>
    </form>
  );
}
