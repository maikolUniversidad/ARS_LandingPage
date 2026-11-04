"use client";

import type { Diagnostico } from "@/data/diagnostico/tipos";

/**
 * STUB de la sesión «entrevista»: la implementación real (historia 3D) vive en
 * la rama de la sesión «historia» y reemplaza este archivo al fusionar.
 */
export function HistoriaDiagnostico({ diagnostico, onTerminar }: { diagnostico: Diagnostico; onTerminar: () => void }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center">
      <h2 className="font-serif text-3xl text-white">{diagnostico.titular}</h2>
      <p className="mt-3 text-[#9eb0c0]">Historia 3D en construcción · {diagnostico.capitulos.length} capítulos</p>
      <button type="button" onClick={onTerminar} className="bevel-btn mt-6 bg-white px-5 py-3 font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#020a18]">
        Ver el reporte
      </button>
    </div>
  );
}
