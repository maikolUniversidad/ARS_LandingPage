import type { AreaId, Capitulo, Diagnostico, Metrica } from "@/data/diagnostico/tipos";

/** Fracción (0..1) de las áreas recomendadas que ya están encendidas en el capítulo. */
export function avance(recomendadas: AreaId[], capitulo: Capitulo): number {
  const activas = new Set(capitulo.activas);
  if (!recomendadas.length) return Math.min(1, activas.size / 10);
  return recomendadas.filter((id) => activas.has(id)).length / recomendadas.length;
}

/** Madurez digital que muestra el capítulo (la misma en el campus 3D y en el panel). */
export function madurezCapitulo(madurez: Diagnostico["madurez"], recomendadas: AreaId[], capitulo: Capitulo): number {
  if (capitulo.momento === "antes") return madurez.hoy;
  if (capitulo.momento === "despues") return madurez.conArs;
  return madurez.hoy + (madurez.conArs - madurez.hoy) * avance(recomendadas, capitulo) * 0.8;
}

/** Métricas que cuenta el capítulo: las del área en foco o, en vista general, las de las áreas activas. */
export function metricasCapitulo(metricas: Metrica[], capitulo: Capitulo): Metrica[] {
  if (capitulo.foco) return metricas.filter((m) => m.areaId === capitulo.foco);
  if (capitulo.momento === "antes" || capitulo.activas.length === 0) return metricas;
  const activas = new Set(capitulo.activas);
  return metricas.filter((m) => activas.has(m.areaId));
}

/** Mejora relativa (positiva = mejor), en %. */
export function mejora(m: Metrica): number | null {
  if (m.antes === 0) return null;
  const d = m.menosEsMejor ? m.antes - m.despues : m.despues - m.antes;
  return Math.round((d / Math.abs(m.antes)) * 100);
}

const fmt = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 });
const fmt1 = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 1 });

export function formatear(valor: number, unidad: string): string {
  const n = Math.abs(valor) < 10 && !Number.isInteger(valor) ? fmt1.format(valor) : fmt.format(Math.round(valor));
  if (unidad === "%") return `${n} %`;
  if (/^COP/i.test(unidad)) return `$${n} ${unidad.replace(/^COP\s*/i, "COP ").trim()}`;
  return `${n} ${unidad}`;
}
