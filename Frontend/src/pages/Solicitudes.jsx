import { useState } from "react";
import NuevaSolicitud from "./NuevaSolicitud";
import ListaSolicitudes from "../components/Solicitudes/ListaSolicitudes";

export default function Solicitudes() {
  const [refresh, setRefresh] = useState(0);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Solicitudes</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Radica y gestiona solicitudes</p>
      </div>

      <NuevaSolicitud onCreated={() => setRefresh((v) => v + 1)} />

      <ListaSolicitudes key={refresh} />
    </div>
  );
}
