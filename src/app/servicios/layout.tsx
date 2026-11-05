import type { ReactNode } from "react";

/**
 * Layout de /servicios. La música de ambiente por área (public/servicios/ambiente)
 * y la narración de Ars las maneja el motor global `NarracionArs` (layout raíz).
 */
export default function ServiciosLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
