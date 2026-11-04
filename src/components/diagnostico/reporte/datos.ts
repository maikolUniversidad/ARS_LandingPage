/**
 * Utilidades compartidas por la vista previa (ReporteDiagnostico) y el PDF (DocumentoPdf):
 * formatos, cálculos de mejora, resolución de áreas/módulos y geometría de los gráficos.
 * Sin dependencias de React para poder usarse en ambos renderizadores.
 */
import { AREAS, areaPorId, moduloPorId, type Area } from "@/data/servicios";
import type { AreaId, Diagnostico, Fase, Metrica, Prioridad, Recomendacion, TamanoEmpresa } from "@/data/diagnostico/tipos";

/** Paleta de marca. */
export const MARCA = {
  fondo: "#020a18",
  imperial: "#142664",
  french: "#1d3885",
  indigo: "#2348d4",
  indigoClaro: "#6b8aff",
  acero: "#9eb0c0",
} as const;

/**
 * Colores «antes / con ARS» de los gráficos. Validados con el validador del skill dataviz
 * (banda de luminosidad, croma, separación CVD y contraste) para cada superficie.
 */
export const SERIE = {
  oscuro: { antes: "#c07a52", despues: "#5b84ff" },
  claro: { antes: "#b8693c", despues: "#2348d4" },
} as const;

/** Colores de estado (reservados: solo para tendencias buenas/malas, siempre con icono + texto). */
export const ESTADO = { bueno: "#35e0a1", malo: "#ff7a6b", neutro: "#9eb0c0" } as const;

const ZONA = "America/Bogota";

export function fechaLarga(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric", timeZone: ZONA });
}

export const TAMANO_TEXTO: Record<TamanoEmpresa, string> = {
  "1-50": "1 a 50 personas",
  "51-200": "51 a 200 personas",
  "201-1000": "201 a 1.000 personas",
  "1000+": "Más de 1.000 personas",
};

export const PRIORIDAD_TEXTO: Record<Prioridad, string> = { alta: "Prioridad alta", media: "Prioridad media", baja: "Prioridad baja" };
const ORDEN_PRIORIDAD: Record<Prioridad, number> = { alta: 0, media: 1, baja: 2 };

export function numero(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) {
    return new Intl.NumberFormat("es-CO", { notation: "compact", maximumFractionDigits: 1 }).format(n);
  }
  return new Intl.NumberFormat("es-CO", { maximumFractionDigits: abs < 10 ? 1 : 0 }).format(n);
}

/** «40 %», «18 min», «72 h/quincena». */
export function valorConUnidad(n: number, unidad: string): string {
  return `${numero(n)} ${unidad}`.trim();
}

/** Texto corto de la mejora: «−67 %», «+56 pts», «×2,4». */
export function mejora(m: Metrica): string {
  const delta = m.despues - m.antes;
  if (m.unidad.trim() === "%") return `${delta >= 0 ? "+" : "−"}${numero(Math.abs(delta))} pts`;
  if (m.antes === 0) return delta >= 0 ? `+${numero(delta)}` : `−${numero(Math.abs(delta))}`;
  const ratio = m.despues / m.antes;
  if (!m.menosEsMejor && ratio >= 2) return `×${numero(ratio)}`;
  const pct = Math.round((delta / m.antes) * 100);
  return `${pct >= 0 ? "+" : "−"}${Math.abs(pct)} %`;
}

/** true si la métrica mejora en la dirección correcta. */
export function esMejora(m: Metrica): boolean {
  return m.menosEsMejor ? m.despues < m.antes : m.despues > m.antes;
}

export type AreaRecomendada = { area: Area; rec: Recomendacion; modulos: { id: string; nombre: string; frase: string }[] };

export function recomendacionesOrdenadas(d: Diagnostico): AreaRecomendada[] {
  return [...d.recomendaciones]
    .sort((a, b) => ORDEN_PRIORIDAD[a.prioridad] - ORDEN_PRIORIDAD[b.prioridad])
    .flatMap((rec) => {
      const area = areaPorId(rec.areaId);
      if (!area) return [];
      const modulos = rec.modulos.flatMap((id) => {
        const m = moduloPorId(id);
        return m ? [{ id, nombre: m.modulo.nombre, frase: m.modulo.frase }] : [];
      });
      return [{ area, rec, modulos }];
    });
}

/** Las 10 áreas en orden de catálogo, con su recomendación (si la hay). */
export function mapaAreas(d: Diagnostico): { area: Area; rec?: AreaRecomendada }[] {
  const porId = new Map(recomendacionesOrdenadas(d).map((r) => [r.area.id, r]));
  return AREAS.map((area) => ({ area, rec: porId.get(area.id) }));
}

export function nombreArea(id: AreaId): string {
  return areaPorId(id)?.nombre ?? id;
}

export function colorArea(id: AreaId): string {
  return areaPorId(id)?.color ?? MARCA.indigoClaro;
}

/** Fases con su rango de semanas parseado («Semanas 1–4» → 1..4) para dibujar el cronograma. */
export function cronograma(fases: Fase[]): { fase: Fase; inicio: number; fin: number }[] {
  let cursor = 1;
  const filas = fases.map((fase) => {
    const nums = fase.semanas.match(/\d+/g)?.map(Number) ?? [];
    const inicio = nums[0] ?? cursor;
    const fin = Math.max(inicio, nums[1] ?? nums[0] ?? inicio + 3);
    cursor = fin + 1;
    return { fase, inicio, fin };
  });
  return filas;
}

export function totalSemanas(filas: { fin: number }[]): number {
  return Math.max(1, ...filas.map((f) => f.fin));
}

/** Path de arco para el medidor semicircular (0–100 → izquierda a derecha por arriba). */
export function arco(cx: number, cy: number, r: number, desde: number, hasta: number): string {
  const p = (v: number) => {
    const ang = Math.PI + (Math.min(100, Math.max(0, v)) / 100) * Math.PI;
    return [cx + r * Math.cos(ang), cy + r * Math.sin(ang)] as const;
  };
  const [x1, y1] = p(desde);
  const [x2, y2] = p(hasta);
  const grande = hasta - desde > 100 ? 1 : 0;
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${grande} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
}

/** Barra horizontal anclada a la izquierda con solo el extremo de dato redondeado. */
export function barra(x: number, y: number, w: number, h: number, r = 4): string {
  if (w <= 0) return "";
  const rr = Math.min(r, w, h / 2);
  return `M ${x} ${y} H ${x + w - rr} Q ${x + w} ${y} ${x + w} ${y + rr} V ${y + h - rr} Q ${x + w} ${y + h} ${x + w - rr} ${y + h} H ${x} Z`;
}

/** «Señal Ñandú S.A.S.» → «Diagnostico-ARS-Senal-Nandu-S-A-S.pdf». */
export function nombreArchivo(empresa: string): string {
  const limpio = empresa
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `Diagnostico-ARS-${limpio || "empresa"}.pdf`;
}

/** Resumen en texto plano para compartir o copiar. */
export function resumenTexto(d: Diagnostico): string {
  const recs = recomendacionesOrdenadas(d)
    .map((r) => `• ${r.area.nombre} (${r.rec.prioridad}): ${r.rec.cambio}`)
    .join("\n");
  const cifras = d.metricas
    .map((m) => `• ${m.nombre}: ${valorConUnidad(m.antes, m.unidad)} → ${valorConUnidad(m.despues, m.unidad)} (estimado)`)
    .join("\n");
  return [
    `Diagnóstico ARS · ${d.perfil.nombre}`,
    d.titular,
    "",
    d.resumen,
    "",
    `Madurez digital estimada: ${d.madurez.hoy}/100 hoy → ${d.madurez.conArs}/100 con ARS.`,
    "",
    "Recomendaciones:",
    recs,
    "",
    "Cifras estimadas:",
    cifras,
    "",
    "Preparado por ARS Intelligence · arsintelligence.com",
  ].join("\n");
}
