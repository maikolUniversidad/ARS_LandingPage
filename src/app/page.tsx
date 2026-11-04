import type { Metadata } from "next";
import { HomeExperience, type HomeCounts } from "@/components/home/HomeExperience";
import { buildErpGroups } from "@/components/home/erp-groups";
import { AREAS } from "@/data/servicios/catalogo";

const TITLE = "ARS Intelligence · Operación y ERP de seguridad, una traza";
const DESCRIPTION =
  "Laboratorio de tecnología para la seguridad privada: vigilancia, cámaras con IA, IoT y central sobre un ERP propio de gestión, en una sola plataforma.";

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

/** Cifras calculadas del catálogo en build, para que nunca queden desactualizadas. */
const modules = AREAS.flatMap((a) => a.modulos);
const COUNTS: HomeCounts = {
  areas: AREAS.length,
  modules: modules.length,
  live: modules.filter((m) => m.estado === "vivo").length,
  // Lista cerrada de analíticas de video del catálogo (ver 25-servicios-ars.md).
  analytics: 8,
};

/** Módulos del ERP de gestión con su estado real del catálogo. */
const ERP_GROUPS = buildErpGroups();

export default function Home() {
  return <HomeExperience counts={COUNTS} erpGroups={ERP_GROUPS} />;
}
