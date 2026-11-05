/**
 * Traduce una `Propuesta` a lo que la escena 3D necesita: qué distritos del campus
 * se encienden y en qué fase, qué satélites (sistemas del cliente) orbitan el
 * núcleo y con qué modo, si hay ERP destacado y cuántas cámaras de analítica.
 * Puro (sin three ni DOM) para que el componente lo use también en el respaldo.
 */
import { AREA_IDS, type AreaId } from "@/data/diagnostico/tipos";
import type { Integracion, Propuesta } from "@/data/propuesta/tipos";
import { areaPorId, moduloPorId } from "@/data/servicios";
import type { DistritoCampus } from "@/components/diagnostico/historia/campus";

export type ModoIntegracion = Integracion["modo"];

export const MODOS: Record<ModoIntegracion, { color: string; etiqueta: string; descripcion: string }> = {
  integra: { color: "#5fd8ff", etiqueta: "Se integra", descripcion: "La información va y vuelve" },
  migra: { color: "#ffb547", etiqueta: "Se migra", descripcion: "Se carga una vez en ARS" },
  convive: { color: "#9eb0c0", etiqueta: "Convive", descripcion: "Sigue igual, conectado a ARS" },
  reemplaza: { color: "#ff6b81", etiqueta: "Se reemplaza", descripcion: "ARS asume esa función" },
  centraliza: { color: "#6b8aff", etiqueta: "Se centraliza", descripcion: "Fluye hacia ARS y queda en ARS" },
};

export type DistritoPlan = DistritoCampus & { /** Índice de fase (0…) o null si no está en la propuesta. */ fase: number | null };

export type FasePlan = {
  /** «Fase 1» */
  rotulo: string;
  /** «El campo en el teléfono» */
  titulo: string;
  duracion: string;
  color: string;
  areas: AreaId[];
};

export type SatelitePlan = { sistema: string; modo: ModoIntegracion; detalle: string; erp: boolean };

export type PlanEscena = {
  distritos: DistritoPlan[];
  fases: FasePlan[];
  satelites: SatelitePlan[];
  /** Cámaras con cono de visión en las áreas de monitoreo (0 si no hay analíticas). */
  camaras: number;
  /** Área de la fase 1 (para el encuadre cercano y la imagen de respaldo). */
  areaPrincipal: AreaId;
};

const MAX_SATELITES = 8;
const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();

function separarNombre(nombre: string, i: number): { rotulo: string; titulo: string } {
  const partes = nombre.split("·").map((x) => x.trim());
  if (partes.length >= 2 && partes[0]) return { rotulo: partes[0], titulo: partes.slice(1).join(" · ") };
  return { rotulo: `Fase ${i + 1}`, titulo: nombre.trim() };
}

export function planDesdePropuesta(p: Propuesta): PlanEscena {
  const areaDeModulo = new Map<string, AreaId>();
  for (const m of p.modulos) areaDeModulo.set(m.modulo, m.area);
  const areaDe = (modulo: string): AreaId | undefined => {
    const a = areaDeModulo.get(modulo) ?? moduloPorId(modulo)?.area.id;
    return a && (AREA_IDS as string[]).includes(a) ? (a as AreaId) : undefined;
  };

  // Fase de cada área = primera fase que trae uno de sus módulos.
  const faseDe = new Map<AreaId, number>();
  const lineas = p.lineaDeTrabajo.length ? p.lineaDeTrabajo : [{ nombre: "Fase 1 · Implementación", duracion: "", modulos: p.modulos.map((m) => m.modulo) }];
  const areasPorFase: AreaId[][] = lineas.map(() => []);
  lineas.forEach((f, k) => {
    for (const mod of f.modulos) {
      const a = areaDe(mod);
      if (a && !faseDe.has(a)) {
        faseDe.set(a, k);
        areasPorFase[k].push(a);
      }
    }
  });
  // Áreas propuestas que ninguna fase nombra: van a la última.
  const ultima = lineas.length - 1;
  for (const m of p.modulos) {
    if (!faseDe.has(m.area) && (AREA_IDS as string[]).includes(m.area)) {
      faseDe.set(m.area, ultima);
      areasPorFase[ultima].push(m.area);
    }
  }

  const distritos: DistritoPlan[] = AREA_IDS.flatMap((id) => {
    const a = areaPorId(id);
    return a ? [{ id, nombre: a.nombre, corto: a.corto, color: a.color, escena: a.escena, fase: faseDe.get(id) ?? null }] : [];
  });
  const colorDe = (id: AreaId | undefined) => (id ? areaPorId(id)?.color : undefined) ?? "#6b8aff";

  const fases: FasePlan[] = lineas.map((f, k) => ({
    ...separarNombre(f.nombre, k),
    duracion: f.duracion,
    color: colorDe(areasPorFase[k][0]),
    areas: areasPorFase[k],
  }));

  // Satélites: integraciones; el ERP se destaca (o se agrega si no estaba).
  const erpNombres = (p.estrategiaErp?.sistemas ?? []).map(norm).filter(Boolean);
  const esErp = (s: string) => {
    const n = norm(s);
    return erpNombres.some((e) => n.includes(e) || e.includes(n));
  };
  const satelites: SatelitePlan[] = p.integraciones.slice(0, MAX_SATELITES).map((i) => ({
    sistema: i.sistema,
    modo: i.modo,
    detalle: i.detalle,
    erp: Boolean(p.estrategiaErp) && esErp(i.sistema),
  }));
  if (p.estrategiaErp && !satelites.some((s) => s.erp) && p.estrategiaErp.sistemas[0]) {
    const s: SatelitePlan = {
      sistema: p.estrategiaErp.sistemas[0],
      modo: p.estrategiaErp.modo === "ars-centraliza" ? "centraliza" : "integra",
      detalle: p.estrategiaErp.explicacion,
      erp: true,
    };
    if (satelites.length >= MAX_SATELITES) satelites[MAX_SATELITES - 1] = s;
    else satelites.push(s);
  }
  // Solo un ERP destacado.
  let visto = false;
  for (const s of satelites) {
    if (s.erp && visto) s.erp = false;
    if (s.erp) visto = true;
  }

  const n = p.analiticas?.length ?? 0;
  const camaras = n ? Math.min(4, Math.max(2, n)) : 0;
  const areaPrincipal = fases.find((f) => f.areas.length)?.areas[0] ?? p.modulos[0]?.area ?? "operacion-en-campo";

  return { distritos, fases, satelites, camaras, areaPrincipal };
}
