import { useState } from "react";
import NuevaDocumentacion from "../components/Solicitudes/NuevaDocumentacion";
import ListaDocumentacion from "../components/Documentacion/ListaDocumentacion";

export default function Documentacion() {
  const [refresh, setRefresh] = useState(0);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Documentación</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Gestiona la documentación</p>
      </div>

      <NuevaDocumentacion onCreated={() => setRefresh((v) => v + 1)} />

      <ListaDocumentacion key={refresh} />
    </div>
  );
}
