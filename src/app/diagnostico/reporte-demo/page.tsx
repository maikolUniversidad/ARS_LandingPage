import type { Metadata } from "next";
import { DIAGNOSTICO_EJEMPLO } from "@/data/diagnostico/ejemplo";
import { ReporteDiagnostico } from "@/components/diagnostico/reporte/ReporteDiagnostico";

/** Ruta de prueba TEMPORAL: monta el reporte con el diagnóstico de ejemplo. */
export const metadata: Metadata = {
  title: "Reporte de diagnóstico (demo)",
  robots: { index: false, follow: false },
};

export default function ReporteDemoPage() {
  return (
    <main className="min-h-screen bg-[#020a18]">
      <ReporteDiagnostico diagnostico={DIAGNOSTICO_EJEMPLO} />
    </main>
  );
}
