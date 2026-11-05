import type { Metadata } from "next";

/**
 * Playground técnico para integradores: queda accesible (lo enlaza el
 * asistente para perfiles técnicos) pero fuera del sitemap y sin indexar,
 * porque para visitantes la demo pública es /laboratorio.
 */
export const metadata: Metadata = {
  title: "Vision Lab · Playground técnico",
  description: "Herramienta técnica para probar modelos de visión, fuentes, reglas ROI/línea y la respuesta JSON.",
  alternates: { canonical: "/vision-lab" },
  robots: { index: false, follow: true },
};

export default function VisionLabLayout({ children }: { children: React.ReactNode }) {
  return children;
}
