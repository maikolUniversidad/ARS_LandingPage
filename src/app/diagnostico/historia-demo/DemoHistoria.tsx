"use client";

import { useState } from "react";
import { DIAGNOSTICO_EJEMPLO } from "@/data/diagnostico/ejemplo";
import { HistoriaDiagnostico } from "@/components/diagnostico/historia/HistoriaDiagnostico";

export function DemoHistoria() {
  const [terminado, setTerminado] = useState(false);
  if (terminado) {
    return (
      <div className="grid min-h-svh place-items-center p-8 text-center text-white">
        <div>
          <p className="text-lg">Aquí se mostraría el reporte (onTerminar llamado).</p>
          <button type="button" onClick={() => setTerminado(false)} className="mt-4 rounded-full border border-white/20 px-4 py-2 text-sm hover:bg-white/10">
            Volver a la historia
          </button>
        </div>
      </div>
    );
  }
  return <HistoriaDiagnostico diagnostico={DIAGNOSTICO_EJEMPLO} onTerminar={() => setTerminado(true)} />;
}
