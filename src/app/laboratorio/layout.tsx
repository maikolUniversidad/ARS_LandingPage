import type { Metadata } from "next";

const TITLE = "Laboratorio: prueba la IA con tu cámara o tu video";
const DESCRIPTION =
  "Capacidades de IA de ARS funcionando en el navegador: personas, placas, EPP, caídas, intrusión, fuego y aglomeración. Usa tu cámara o sube un video; no sale de tu equipo.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/laboratorio" },
  openGraph: { title: `${TITLE} — ARS Intelligence`, description: DESCRIPTION, url: "/laboratorio", type: "website" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

export default function LaboratorioLayout({ children }: { children: React.ReactNode }) {
  return children;
}
