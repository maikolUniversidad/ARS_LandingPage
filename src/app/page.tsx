import type { Metadata } from "next";
import { HomeExperience } from "@/components/home/HomeExperience";

const TITLE = "ARS Intelligence — Seguridad con IA en tres capas";
const DESCRIPTION =
  "ARS convierte tus cámaras actuales en seguridad inteligente: prevención en campo, detección con IA sobre tu CCTV y respuesta coordinada con evidencia. Despliegue en menos de 48 horas en LATAM.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_CO",
    url: "https://arsintelligence.com",
    siteName: "ARS Intelligence",
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

export default function Home() {
  return <HomeExperience />;
}
