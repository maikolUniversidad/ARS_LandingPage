import type { Metadata } from "next";
import { AcademiaPagina } from "@/components/academia/AcademiaPagina";
import { ServiciosHeader } from "@/components/servicios/ServiciosHeader";
import { PieServicios } from "@/components/servicios/ui";

const TITULO = "Academia ARS · Capacitación de vigilantes en realidad virtual";
const DESCRIPCION =
  "Con ARS, el vigilante se capacita en realidad virtual: dotación y revista, manejo seguro del arma en el polígono, uso de la fuerza desde la garita y un turno completo en la portería. Basada en el Decreto 356 de 1994 y la Resolución 4973 de 2011; complementa las horas presenciales.";

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRIPCION,
  alternates: { canonical: "/academia" },
  openGraph: {
    title: `${TITULO} — ARS Intelligence`,
    description: "Aquí se forma a la gente que cuida. Y cada certificado se puede comprobar.",
    url: "/academia",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${TITULO} — ARS Intelligence`,
    description: "Lo que no se puede practicar en la calle, se practica aquí.",
  },
};

export default function AcademiaPage() {
  return (
    <div className="relative bg-[#020a18] text-foreground">
      <ServiciosHeader />
      <AcademiaPagina />
      <PieServicios />
    </div>
  );
}
