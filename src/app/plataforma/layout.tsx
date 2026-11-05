import type { Metadata } from "next";

const TITLE = "Plataforma: toda la operación de seguridad en un solo lugar";
const DESCRIPTION =
  "La plataforma ARS en movimiento: clips reales, recorrido por los módulos de cada área, un arquitecto con IA que arma tu plataforma y el ciclo operativo de punta a punta.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/plataforma" },
  openGraph: { title: `${TITLE} — ARS Intelligence`, description: DESCRIPTION, url: "/plataforma", type: "website" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

export default function PlataformaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
