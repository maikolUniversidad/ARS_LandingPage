import type { Metadata } from "next";
import { ArquitecturaPagina } from "@/components/arquitectura/ArquitecturaPagina";
import { ServiciosHeader } from "@/components/servicios/ServiciosHeader";
import { PieServicios } from "@/components/servicios/ui";

const descripcion =
  "Arquitectura de soluciones ARS: la operación que se ve —campo, central, cámaras con IA, radio, IoT y realidad virtual— sobre un ERP base propio para contratos, turnos, gestión humana, nómina, documentos, formación y finanzas. Todo integrado.";

export const metadata: Metadata = {
  title: "Arquitectura de soluciones",
  description: descripcion,
  alternates: { canonical: "/arquitectura" },
  openGraph: {
    title: "Arquitectura de soluciones — ARS Intelligence",
    description: "La operación que se ve y el ERP que la sostiene: canales, operación, datos e IA y gestión, en un solo sistema.",
    url: "/arquitectura",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Arquitectura de soluciones — ARS Intelligence",
    description: "La operación que se ve y el ERP que la sostiene, en un solo sistema.",
  },
};

export default function ArquitecturaPage() {
  return (
    <div className="relative bg-[#020a18] text-foreground">
      <ServiciosHeader />
      <ArquitecturaPagina />
      <PieServicios />
    </div>
  );
}
