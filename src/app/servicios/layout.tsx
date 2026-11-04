import type { ReactNode } from "react";
import { AREAS } from "@/data/servicios";
import { Ambiente } from "@/components/servicios/Ambiente";

/** Pistas de ambiente por área (solo las que existen en el catálogo). */
const PISTAS: Record<string, string> = Object.fromEntries(
  AREAS.flatMap((a) => (a.ambiente ? [[a.id, a.ambiente] as const] : []))
);

/** Layout de /servicios: persiste entre áreas para fundir el sonido de ambiente. */
export default function ServiciosLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Ambiente pistas={PISTAS} />
    </>
  );
}
