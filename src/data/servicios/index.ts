/** API del catálogo de servicios. Los datos viven en ./catalogo.ts. */
import { AREAS, PILARES } from "./catalogo";
import type { Area, Modulo } from "./tipos";

export { AREAS, PILARES };
export type * from "./tipos";

const porArea = new Map(AREAS.map((a) => [a.id, a]));
const porModulo = new Map<string, { area: Area; modulo: Modulo }>();
for (const area of AREAS) for (const modulo of area.modulos) porModulo.set(modulo.id, { area, modulo });

export function areaPorId(id: string): Area | undefined {
  return porArea.get(id);
}

export function moduloPorId(id: string): { area: Area; modulo: Modulo } | undefined {
  return porModulo.get(id);
}

export function todosLosModulos(): { area: Area; modulo: Modulo }[] {
  return [...porModulo.values()];
}

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

/** Búsqueda simple por nombre, frase y palabras clave (para el asistente y el buscador). */
export function buscarModulos(consulta: string, max = 6): { area: Area; modulo: Modulo }[] {
  const terms = norm(consulta).split(/\s+/).filter((t) => t.length > 1);
  if (!terms.length) return [];
  const puntaje = ({ area, modulo }: { area: Area; modulo: Modulo }) => {
    const nombre = norm(modulo.nombre);
    const resto = norm([modulo.frase, modulo.resumen, area.nombre, ...modulo.palabrasClave].join(" "));
    return terms.reduce((p, t) => p + (nombre.includes(t) ? 3 : 0) + (resto.includes(t) ? 1 : 0), 0);
  };
  return todosLosModulos()
    .map((x) => ({ x, p: puntaje(x) }))
    .filter((r) => r.p > 0)
    .sort((a, b) => b.p - a.p)
    .slice(0, max)
    .map((r) => r.x);
}
