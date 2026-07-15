import { useEffect, useState } from "react";
import api from "../api/axios";

export default function NuevaSolicitud({ placaVehiculo = "", onCreated }) {
    const [placa, setPlaca] = useState(placaVehiculo);
    const [form, setForm] = useState({
        valorEstimado: "",
        nombreCompleto: "",
        naturaleza: "propietario",
        descripcion: "",
    });
    const [archivo, setArchivo] = useState(null);
    const [enviado, setEnviado] = useState(false);
    const [cargando, setCargando] = useState(false);
    const [validandoPlaca, setValidandoPlaca] = useState(false);
    const [placaValida, setPlacaValida] = useState(false);
    const [error, setError] = useState("");

    const formatCOP = (value) =>
        new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 0,
        }).format(Number(value || 0));

    const parseCurrencyToNumber = (raw) => {
        if (raw == null) return 0;
        const digits = String(raw).replace(/[^0-9]/g, "");
        return digits ? Number(digits) : 0;
    };

    useEffect(() => {
        setPlaca(placaVehiculo || "");
    }, [placaVehiculo]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handlePlacaChange = (e) => {
        let input = e.target.value.toUpperCase();
        let cleanInput = input.replace(/[^A-Z0-9]/g, "");
        let letters = cleanInput.substring(0, 3).replace(/[^A-Z]/g, "");
        let numbers = cleanInput.substring(3, 6).replace(/[^0-9]/g, "");
        let formatted = letters;
        if (letters.length === 3 && cleanInput.length > 3) {
            formatted += "-" + numbers;
        } else if (letters.length === 3 && input.endsWith("-")) {
            formatted += "-";
        }
        setPlaca(formatted);
    };

    const handleArchivo = (e) => {
        const file = e.target.files?.[0];
        if (file) setArchivo(file);
    };

    const handleDragOver = (e) => e.preventDefault();
    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) setArchivo(file);
    };

    const validarPlacaExiste = async (placaToValidate) => {
        const value = (placaToValidate || "").trim();
        if (!value) {
            setError("Placa es requerida");
            setPlacaValida(false);
            return false;
        }
        setValidandoPlaca(true);
        try {
            await api.get(`/vehiculos/${value}`);
            setPlacaValida(true);
            return true;
        } catch {
            setError("La placa no existe");
            setPlacaValida(false);
            return false;
        } finally {
            setValidandoPlaca(false);
        }
    };

    const handleSubmit = async () => {
        setError("");
        const placaEnviar = (placaVehiculo || placa).trim();

        if (!placaEnviar) {
            setError("Placa es requerida");
            return;
        }
        const valorNumerico = parseCurrencyToNumber(form.valorEstimado);
        if (!form.valorEstimado || valorNumerico <= 0) {
            setError("Valor estimado es requerido");
            return;
        }

        if (!form.nombreCompleto) {
            setError("Nombre de quien solicita es requerido");
            return;
        }
        if (!form.naturaleza) {
            setError("Naturaleza es requerida");
            return;
        }
        if (!form.descripcion) {
            setError("Descripción es requerida");
            return;
        }

        const okPlaca = await validarPlacaExiste(placaEnviar);
        if (!okPlaca) return;

        setCargando(true);
        try {
            const formData = new FormData();
            formData.append("placa", placaEnviar);
            formData.append("valorEstimado", String(valorNumerico));
            formData.append("nombreCompleto", form.nombreCompleto);
            formData.append("naturaleza", form.naturaleza);
            formData.append("descripcion", form.descripcion);
            if (archivo) formData.append("archivo", archivo);

            await api.post("/solicitudes", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setEnviado(true);
            setForm({ valorEstimado: "", nombreCompleto: "", naturaleza: "propietario", descripcion: "" });
            setArchivo(null);
            setPlacaValida(false);
            if (typeof onCreated === "function") onCreated();

            setTimeout(() => setEnviado(false), 3000);
        } catch (err) {
            console.error("Error al enviar solicitud:", err);
            setError(err?.response?.data || "Ocurrió un error al enviar la solicitud.");
        } finally {
            setCargando(false);
        }
    };

    const placaReadOnly = Boolean(placaVehiculo);

    return (
        <div className="card card-section m-4 space-y-4">
            <div className="card-header">
                <div>
                    <h2 className="card-title">Radicar solicitud</h2>
                    <p className="card-subtitle">Completa la información y adjunta soportes si aplica.</p>
                </div>
                {enviado && (
                    <span className="text-sm font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded">
                        Solicitud radicada
                    </span>
                )}
            </div>

            {error && (
                <div className="text-sm text-red-700 bg-red-50 border border-red-200 px-4 py-2 rounded">
                    {String(error)}
                </div>
            )}

            {!error && placaValida && (
                <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded">
                    Placa válida
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-sm text-slate-600 dark:text-slate-300">Placa</label>
                    <input
                        className="border rounded px-3 py-2 w-full bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                        placeholder="AAA-123"
                        value={placaVehiculo || placa}
                        onChange={handlePlacaChange}
                        maxLength={7}
                        readOnly={placaReadOnly}

                        onBlur={() => {
                            const v = (placaVehiculo || placa).trim();
                            if (!v) return;
                            validarPlacaExiste(v);
                        }}
                    />
                    {validandoPlaca && <p className="text-xs text-slate-500">Validando placa…</p>}
                </div>

                <div className="space-y-1">
                    <label className="text-sm text-slate-600 dark:text-slate-300">Valor estimado del retiro</label>
                    <input
                        type="text"
                        className="border rounded px-3 py-2 w-full bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                        name="valorEstimado"
                        value={form.valorEstimado}
                        inputMode="numeric"
                        onChange={(e) => {
                            const n = parseCurrencyToNumber(e.target.value);

                            setForm((prev) => ({ ...prev, valorEstimado: n ? formatCOP(n) : "" }));
                        }}
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-sm text-slate-600 dark:text-slate-300">Nombre de quien solicita</label>
                    <input
                        className="border rounded px-3 py-2 w-full bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                        name="nombreCompleto"
                        value={form.nombreCompleto}
                        onChange={handleChange}
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-sm text-slate-600 dark:text-slate-300">Naturaleza</label>
                    <select
                        className="border rounded px-3 py-2 w-full bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                        name="naturaleza"
                        value={form.naturaleza}
                        onChange={handleChange}
                    >
                        <option value="propietario">propietario</option>

                        <option value="apoderado">apoderado</option>
                        <option value="administrador">administrador</option>
                    </select>
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-sm text-slate-600 dark:text-slate-300">Descripción</label>
                <textarea
                    className="border rounded px-3 py-2 w-full bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    rows={4}
                    name="descripcion"
                    value={form.descripcion}
                    onChange={handleChange}
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm text-slate-600 dark:text-slate-300">Adjunto</label>
                <div
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className="border-2 border-dashed rounded p-4 text-sm text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                >
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div>
                            <p className="font-medium">Arrastra un archivo aquí o selecciónalo</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Máximo 10MB.</p>
                        </div>

                        <input
                            id="input-adjunto-solicitud"
                            type="file"
                            onChange={handleArchivo}
                            className="hidden"
                        />
                        <button
                            type="button"
                            onClick={() => document.getElementById("input-adjunto-solicitud")?.click()}
                            className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 px-4 py-2 rounded font-semibold"
                        >
                            Seleccionar archivo
                        </button>
                    </div>
                    {archivo && (
                        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Seleccionado: {archivo.name}</p>
                    )}
                </div>
            </div>

            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={cargando}
                    className="bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white px-4 py-2 rounded"
                >
                    {cargando ? "Enviando..." : "Enviar solicitud"}
                </button>
            </div>
        </div>
    );
}