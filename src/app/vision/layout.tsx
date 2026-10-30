import type { Metadata } from "next";

const TITLE = "Analíticas de video: 45 analíticas sobre las cámaras ya instaladas";
const DESCRIPTION =
  "Cada analítica de Visión vista funcionando: una simulación 3D por analítica y, cuando ya existe, el video real procesado por los modelos de Vigías. Conteo, mapa de calor, intrusión, EPP, armas, fuego y más.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/vision" },
  openGraph: {
    title: `${TITLE} — ARS Intelligence`,
    description: DESCRIPTION,
    url: "/vision",
    type: "website",
    images: [{ url: "/analiticas-3d/evidencia-publica/calor-poster.jpg", width: 1280, height: 720, alt: "Mapa de calor sobre una cámara real" }],
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

export default function VisionLayout({ children }: { children: React.ReactNode }) {
  return children;
}
