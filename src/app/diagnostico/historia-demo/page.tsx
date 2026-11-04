import type { Metadata } from "next";
import { DemoHistoria } from "./DemoHistoria";

/** Ruta de prueba TEMPORAL de la historia 3D (el orquestador puede retirarla). */
export const metadata: Metadata = {
  title: "Historia del diagnóstico (demo)",
  robots: { index: false, follow: false },
};

export default function HistoriaDemoPage() {
  return (
    <main className="min-h-svh bg-[#020a18]">
      <DemoHistoria />
    </main>
  );
}
