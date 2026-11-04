import type { Diagnostico } from "@/data/diagnostico/tipos";

/**
 * STUB de la sesión «entrevista»: la implementación real (reporte + PDF) vive en
 * la rama de la sesión «reporte» y reemplaza este archivo al fusionar.
 */
export function ReporteDiagnostico({ diagnostico }: { diagnostico: Diagnostico }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h2 className="font-serif text-3xl text-white">{diagnostico.titular}</h2>
      <p className="mt-4 text-[#9eb0c0]">{diagnostico.resumen}</p>
    </div>
  );
}
