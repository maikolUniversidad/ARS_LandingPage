/**
 * Planificador de video analítica: motor de reglas (sin IA, siempre disponible)
 * y saneado de la propuesta que devuelve la IA. Ambos producen un `PlanVision`
 * válido contra el catálogo real de analíticas.
 */
import { analiticas } from "@/data/analiticas";
import {
  PRIORIDADES,
  TAMANOS,
  TIPOS_SITIO,
  TIPOS_ZONA,
  type AnaliticaPlan,
  type CamaraPlan,
  type PeticionPlan,
  type PlanVision,
  type Prioridad,
  type Tamano,
  type TipoSitio,
  type TipoZona,
  type ZonaPlan,
} from "./plan";

export const LIMITES_PLAN = { zonas: 7, camaras: 16, analiticasPorCamara: 3, descripcion: 1200 } as const;

const CATALOGO = new Map(analiticas.map((a) => [a.id, a]));
export const IDS_ANALITICAS = analiticas.map((a) => a.id);

/* ------------------------------ Conocimiento ------------------------------ */

const NOMBRE_ZONA: Record<TipoZona, string> = {
  acceso: "Entrada principal",
  recepcion: "Recepción",
  cajas: "Línea de cajas",
  ventas: "Salón de ventas",
  comedor: "Zona común",
  oficina: "Oficinas",
  pasillo: "Pasillo central",
  produccion: "Planta de producción",
  bodega: "Bodega",
  parqueadero: "Parqueadero",
  perimetro: "Perímetro",
};

const PLANTILLA: Record<TipoSitio, [TipoZona, Tamano, string?][]> = {
  tienda: [["acceso", "pequena"], ["ventas", "mediana"], ["cajas", "pequena"], ["bodega", "pequena"]],
  supermercado: [["acceso", "mediana"], ["ventas", "grande"], ["cajas", "mediana"], ["bodega", "mediana"], ["parqueadero", "mediana"]],
  bodega: [["acceso", "pequena", "Portería"], ["bodega", "grande", "Zona de almacenamiento"], ["oficina", "pequena"], ["parqueadero", "mediana", "Patio de cargue"], ["perimetro", "mediana"]],
  oficina: [["recepcion", "pequena"], ["oficina", "mediana"], ["pasillo", "mediana"], ["comedor", "pequena", "Cafetería"]],
  parqueadero: [["acceso", "pequena", "Entrada vehicular"], ["parqueadero", "grande"], ["perimetro", "mediana"]],
  planta: [["acceso", "pequena", "Portería"], ["produccion", "grande"], ["bodega", "mediana"], ["comedor", "pequena", "Casino"], ["perimetro", "mediana"]],
  colegio: [["acceso", "mediana", "Portería"], ["pasillo", "mediana", "Corredor de salones"], ["comedor", "mediana", "Patio y comedor"], ["oficina", "pequena", "Rectoría"], ["perimetro", "mediana"]],
  restaurante: [["acceso", "pequena"], ["comedor", "mediana", "Salón de mesas"], ["cajas", "pequena", "Caja"], ["produccion", "pequena", "Cocina"], ["bodega", "pequena", "Despensa"]],
  conjunto: [["acceso", "mediana", "Portería"], ["parqueadero", "mediana"], ["comedor", "mediana", "Zonas comunes"], ["perimetro", "grande"]],
  otro: [["acceso", "pequena"], ["oficina", "mediana", "Área de trabajo"], ["bodega", "pequena"]],
};

/** Analíticas candidatas por zona y por prioridad, en orden de valor. */
const POR_ZONA: Record<TipoZona, Partial<Record<Prioridad, string[]>>> = {
  acceso: { seguridad: ["negras", "rostro", "armas"], ventas: ["conteo", "demografia"], operacion: ["aforo", "apertura", "cierre"], personal: ["blancas"] },
  recepcion: { seguridad: ["negras", "rostro"], personal: ["blancas", "guardian"], operacion: ["aforo"] },
  ventas: { seguridad: ["hurto", "ocultaProd"], ventas: ["calor", "comprador", "permanencia", "seguimiento"], operacion: ["staff", "derrames"], inventario: ["huecos", "fleje", "exhibicion", "vencido"] },
  cajas: { operacion: ["filas"], ventas: ["filas"], inventario: ["autopago", "trazabilidad"], seguridad: ["armas"], personal: ["guardian"] },
  bodega: { seguridad: ["acceso", "intrusion"], operacion: ["pasillos", "epp"], inventario: ["bodega", "racks", "canastillas", "destruccion"], personal: ["guardian"] },
  parqueadero: { seguridad: ["merodeo", "intrusion", "abandono"], operacion: ["placas"], ventas: ["placas"] },
  oficina: { seguridad: ["acceso", "activos"], personal: ["guardian", "staff"], operacion: ["puertas"] },
  produccion: { seguridad: ["epp", "caidas", "fuego"], operacion: ["derrames", "pasillos"], personal: ["guardian"], inventario: ["canastillas"] },
  pasillo: { seguridad: ["aglomeracion", "caidas", "peleas"], operacion: ["cruce", "pasillos"], ventas: ["cruce"] },
  comedor: { seguridad: ["peleas", "aglomeracion", "abandono"], ventas: ["calor", "permanencia"], operacion: ["aforo"] },
  perimetro: { seguridad: ["intrusion", "merodeo", "fuego", "abandono"], operacion: ["zonaCiega"] },
};

/** Palabras del cliente → analíticas que suben al primer lugar. */
const PALABRAS: [RegExp, string[]][] = [
  [/rob|hurt|ladr|perdida|pérdida|merma/i, ["hurto", "ocultaProd", "trazabilidad"]],
  [/fila|cola|caja|espera/i, ["filas", "autopago"]],
  [/incend|fuego|humo/i, ["fuego"]],
  [/casco|chaleco|epp|seguridad industrial|accidente/i, ["epp", "caidas"]],
  [/placa|carro|veh[ií]cul|moto|parque|cami[oó]n|furg[oó]n|tract|muelle|cargue/i, ["placas"]],
  [/arma|pistola|atraco|asalto/i, ["armas", "blancas2"]],
  [/pele|ri[ñn]a|violen/i, ["peleas", "aglomeracion"]],
  [/aforo|capacidad|cu[aá]nt[ao]s? (personas|gente)/i, ["aforo", "conteo"]],
  [/tr[aá]fico|visitant|client|conteo|contar/i, ["conteo", "calor", "permanencia"]],
  [/derram|piso moj|resbal/i, ["derrames", "caidas"]],
  [/vencid|fecha/i, ["vencido", "destruccion"]],
  [/inventar|agotad|surtid|g[oó]ndola/i, ["huecos", "exhibicion", "fleje"]],
  [/rack|estanter|montacarga|almac/i, ["racks", "bodega", "pasillos"]],
  [/empleado|personal|turno|puesto/i, ["guardian", "staff"]],
  [/intrus|cerca|muro|noche|perímetro|perimetro/i, ["intrusion", "merodeo"]],
  [/rostro|cara|capucha|casco de moto/i, ["rostro", "negras"]],
  [/acceso|ingreso|portería|porteria|visitas/i, ["blancas", "negras", "acceso"]],
  [/ca[ií]da|adulto mayor|anciano/i, ["caidas"]],
  [/objeto|paquete|maleta|abandon/i, ["abandono"]],
  [/equipo|computador|activo|port[aá]til/i, ["activos"]],
  [/abr[ei]|cierre|cerr|horario/i, ["apertura", "cierre", "puertas"]],
];

/** Lo que casi siempre necesita cada tipo de sitio (después de lo que pidió el cliente). */
const POR_SITIO: Record<TipoSitio, string[]> = {
  tienda: ["conteo", "hurto", "filas", "huecos"],
  supermercado: ["conteo", "hurto", "filas", "huecos", "placas"],
  bodega: ["blancas", "placas", "epp", "racks", "pasillos"],
  oficina: ["blancas", "acceso", "activos"],
  parqueadero: ["placas", "merodeo", "intrusion"],
  planta: ["blancas", "epp", "caidas", "fuego"],
  colegio: ["blancas", "negras", "peleas", "merodeo", "intrusion"],
  restaurante: ["conteo", "aforo", "filas", "fuego"],
  conjunto: ["blancas", "placas", "intrusion", "merodeo"],
  otro: ["conteo", "acceso"],
};

const SITIO_PALABRAS: [RegExp, TipoSitio][] = [
  [/supermerc|hipermerc|autoservicio grande/i, "supermercado"],
  [/tienda|minimarket|droguer|farmacia|almac[eé]n de|local comercial|franquicia/i, "tienda"],
  [/bodega|centro de distrib|log[ií]stic|cedi/i, "bodega"],
  [/oficina|corporativ|edificio empresarial/i, "oficina"],
  [/parqueadero|estacionamiento|parking/i, "parqueadero"],
  [/planta|f[aá]brica|producci|manufactur|industria/i, "planta"],
  [/colegio|escuela|universidad|instituci[oó]n educativa|campus/i, "colegio"],
  [/restaurante|cafeter[ií]a|comidas|bar\b|panader/i, "restaurante"],
  [/conjunto|residencial|condominio|edificio de apartamentos|propiedad horizontal/i, "conjunto"],
];

const PRIORIDAD_PALABRAS: [RegExp, Prioridad][] = [
  [/rob|hurt|segur|arma|intrus|pele|incend|fuego|atraco/i, "seguridad"],
  [/venta|client|conversi|tr[aá]fico|visitant|marketing/i, "ventas"],
  [/operaci|fila|proceso|eficien|aforo|apertura/i, "operacion"],
  [/inventar|agotad|vencid|rack|mercanc|stock/i, "inventario"],
  [/personal|emplead|turno|puesto/i, "personal"],
];

/* ---------------------------------- Reglas --------------------------------- */

const ETIQUETA_PRIORIDAD: Record<Prioridad, string> = { seguridad: "seguridad", ventas: "ventas", operacion: "operación", inventario: "inventario", personal: "personal" };
const unir = (xs: string[]) => (xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} y ${xs[xs.length - 1]}`);

export function detectarSitio(p: PeticionPlan): TipoSitio {
  if (p.tipoSitio && TIPOS_SITIO.includes(p.tipoSitio)) return p.tipoSitio;
  for (const [re, s] of SITIO_PALABRAS) if (re.test(p.descripcion)) return s;
  return "otro";
}

function detectarPrioridades(p: PeticionPlan): Prioridad[] {
  const out = new Set<Prioridad>((p.prioridades ?? []).filter((x) => PRIORIDADES.includes(x)));
  for (const [re, pr] of PRIORIDAD_PALABRAS) if (re.test(p.descripcion)) out.add(pr);
  if (!out.size) ["seguridad", "operacion", "ventas"].forEach((x) => out.add(x as Prioridad));
  return [...out];
}

function camarasPorZona(tipo: TipoZona, tam: Tamano): number {
  if (tipo === "pasillo" || tipo === "recepcion") return 1;
  if (tipo === "acceso") return tam === "grande" ? 2 : 1;
  const base = tam === "pequena" ? 1 : tam === "mediana" ? 2 : 3;
  return tipo === "cajas" ? Math.min(base, 2) : base;
}

const escalar = (t: Tamano, d: number): Tamano => TAMANOS[Math.max(0, Math.min(2, TAMANOS.indexOf(t) + d))];

export function planPorReglas(p: PeticionPlan): PlanVision {
  const sitio = detectarSitio(p);
  const prioridades = detectarPrioridades(p);
  const pedidas = PALABRAS.filter(([re]) => re.test(p.descripcion)).flatMap(([, ids]) => ids);
  const impulsadas = [...new Set([...pedidas, ...POR_SITIO[sitio]])];
  const delta = p.tamano === "pequena" ? -1 : p.tamano === "grande" ? 1 : 0;
  const texto = p.descripcion;

  let base = PLANTILLA[sitio];
  // Si menciona parqueadero o perímetro y la plantilla no lo trae, se agrega.
  if (/parque|veh[ií]cul|placa/i.test(texto) && !base.some((b) => b[0] === "parqueadero")) base = [...base, ["parqueadero", "mediana"]];
  if (/cerca|perímetro|perimetro|muro|lote/i.test(texto) && !base.some((b) => b[0] === "perimetro")) base = [...base, ["perimetro", "mediana"]];

  const zonas: ZonaPlan[] = base.slice(0, LIMITES_PLAN.zonas).map(([tipo, tam, nombre], i) => ({
    id: `z${i + 1}`,
    nombre: nombre ?? NOMBRE_ZONA[tipo],
    tipo,
    tamano: escalar(tam, delta),
    motivo: "",
  }));

  const elegidas = new Map<string, { prioridad: "alta" | "media"; zonas: string[] }>();
  const camaras: CamaraPlan[] = [];
  for (const z of zonas) {
    const cand = POR_ZONA[z.tipo];
    const todas = [...new Set(Object.values(cand).flat())];
    const enPrioridad = [...new Set(prioridades.flatMap((pr) => cand[pr] ?? []))];
    const orden = [...new Set([...impulsadas.filter((id) => todas.includes(id)), ...enPrioridad, ...todas])].filter((id) => CATALOGO.has(id));
    const nCam = camarasPorZona(z.tipo, z.tamano);
    const lista = orden.slice(0, Math.min(5, nCam + 2));
    lista.forEach((id, k) => {
      const prev = elegidas.get(id);
      const alta = pedidas.includes(id) || k === 0;
      elegidas.set(id, { prioridad: prev?.prioridad === "alta" || alta ? "alta" : "media", zonas: [...(prev?.zonas ?? []), z.nombre] });
    });
    z.motivo = motivoZona(z, lista);
    for (let c = 0; c < nCam; c++) {
      // Rota la lista para que entre todas las cámaras de la zona cubran todas sus analíticas.
      const rot = [...lista.slice(c), ...lista.slice(0, c)].slice(0, Math.min(LIMITES_PLAN.analiticasPorCamara, lista.length));
      camaras.push({ id: `c${camaras.length + 1}`, zona: z.id, analiticas: rot, proposito: propositoCamara(z, rot, c, nCam) });
    }
  }

  const listaA: AnaliticaPlan[] = [...elegidas.entries()]
    .map(([id, e]) => ({ id, prioridad: e.prioridad, motivo: `${CATALOGO.get(id)?.corta ?? ""} En: ${[...new Set(e.zonas)].join(", ")}.` }))
    .sort((a, b) => (a.prioridad === b.prioridad ? 0 : a.prioridad === "alta" ? -1 : 1));

  const nombreSitio = { tienda: "la tienda", supermercado: "el supermercado", bodega: "la bodega", oficina: "la oficina", parqueadero: "el parqueadero", planta: "la planta", colegio: "el colegio", restaurante: "el restaurante", conjunto: "el conjunto", otro: "el sitio" }[sitio];
  const cams = camaras.slice(0, LIMITES_PLAN.camaras);
  return {
    titulo: `Propuesta para ${nombreSitio}`,
    resumen: `${cams.length} cámaras en ${zonas.length} zonas, con ${listaA.length} analíticas enfocadas en ${unir(prioridades.slice(0, 3).map((x) => ETIQUETA_PRIORIDAD[x]))}. Cada cámara corre varias analíticas a la vez sobre el mismo video.`,
    tipoSitio: sitio,
    zonas,
    camaras: cams,
    analiticas: listaA,
    notas: [
      "La distribución es ilustrativa: en la visita técnica se ajusta a los planos reales.",
      p.camarasExistentes ? `Se reutilizan hasta ${Math.min(p.camarasExistentes, cams.length)} cámaras que ya tiene instaladas, si su resolución lo permite.` : "Si ya tiene cámaras instaladas, la mayoría se reutiliza: no hace falta equipo nuevo.",
      "Todo corre en un servidor del propio sitio; el video no sale de las instalaciones.",
    ],
    reutilizadas: Math.min(p.camarasExistentes ?? 0, cams.length),
    fuente: "reglas",
  };
}

function motivoZona(z: ZonaPlan, ids: string[]): string {
  const n = ids.slice(0, 2).map((id) => CATALOGO.get(id)?.nombre.toLowerCase()).filter(Boolean);
  return n.length ? `Aquí se juega ${n.join(" y ")}.` : "";
}

function propositoCamara(z: ZonaPlan, ids: string[], k: number, n: number): string {
  const a = CATALOGO.get(ids[0] ?? "");
  const donde = n > 1 ? ` (${k + 1} de ${n})` : "";
  return `${z.nombre}${donde}: ${a ? a.corta.charAt(0).toLowerCase() + a.corta.slice(1) : "vigilancia general."}`;
}

/* --------------------------- Saneado de la salida IA --------------------------- */

const txt = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const de = <T extends string>(v: unknown, lista: readonly T[], porDefecto: T): T => (lista.includes(v as T) ? (v as T) : porDefecto);

/** Valida y repara lo que devuelve la IA. Devuelve null si no se puede usar. */
export function sanearPlan(raw: unknown, p: PeticionPlan): PlanVision | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const zonasIn = Array.isArray(r.zonas) ? r.zonas : [];
  const zonas: ZonaPlan[] = [];
  const mapaId = new Map<string, string>();
  for (const zi of zonasIn.slice(0, LIMITES_PLAN.zonas)) {
    if (!zi || typeof zi !== "object") continue;
    const z = zi as Record<string, unknown>;
    const tipo = de(z.tipo, TIPOS_ZONA, "oficina");
    const id = `z${zonas.length + 1}`;
    const original = txt(z.id, 40) || id;
    mapaId.set(original, id);
    zonas.push({ id, nombre: txt(z.nombre, 60) || NOMBRE_ZONA[tipo], tipo, tamano: de(z.tamano, TAMANOS, "mediana"), motivo: txt(z.motivo, 220) });
  }
  if (!zonas.length) return null;

  const camaras: CamaraPlan[] = [];
  for (const ci of Array.isArray(r.camaras) ? r.camaras : []) {
    if (camaras.length >= LIMITES_PLAN.camaras || !ci || typeof ci !== "object") continue;
    const c = ci as Record<string, unknown>;
    const zona = mapaId.get(txt(c.zona, 40));
    if (!zona) continue;
    const ids = (Array.isArray(c.analiticas) ? c.analiticas : []).filter((x): x is string => typeof x === "string" && CATALOGO.has(x));
    const unicos = [...new Set(ids)].slice(0, LIMITES_PLAN.analiticasPorCamara);
    if (!unicos.length) continue;
    camaras.push({ id: `c${camaras.length + 1}`, zona, analiticas: unicos, proposito: txt(c.proposito, 200) });
  }
  // Toda zona necesita al menos una cámara; si la IA dejó alguna sin cámara, se completa con reglas.
  for (const z of zonas) {
    if (camaras.some((c) => c.zona === z.id) || camaras.length >= LIMITES_PLAN.camaras) continue;
    const ids = Object.values(POR_ZONA[z.tipo]).flat().filter((id, i, a) => a.indexOf(id) === i && CATALOGO.has(id)).slice(0, 2);
    camaras.push({ id: `c${camaras.length + 1}`, zona: z.id, analiticas: ids, proposito: propositoCamara(z, ids, 0, 1) });
  }

  const usadas = new Set(camaras.flatMap((c) => c.analiticas));
  const analiticasIn = Array.isArray(r.analiticas) ? r.analiticas : [];
  const lista: AnaliticaPlan[] = [];
  for (const ai of analiticasIn) {
    if (!ai || typeof ai !== "object") continue;
    const a = ai as Record<string, unknown>;
    const id = txt(a.id, 40);
    if (!usadas.has(id) || lista.some((x) => x.id === id)) continue;
    lista.push({ id, motivo: txt(a.motivo, 260) || (CATALOGO.get(id)?.corta ?? ""), prioridad: a.prioridad === "alta" ? "alta" : "media" });
  }
  for (const id of usadas) if (!lista.some((x) => x.id === id)) lista.push({ id, motivo: CATALOGO.get(id)?.corta ?? "", prioridad: "media" });

  const notas = (Array.isArray(r.notas) ? r.notas : []).map((n) => txt(n, 200)).filter(Boolean).slice(0, 5);
  return {
    titulo: txt(r.titulo, 90) || "Propuesta de video analítica",
    resumen: txt(r.resumen, 600),
    tipoSitio: de(r.tipoSitio, TIPOS_SITIO, detectarSitio(p)),
    zonas,
    camaras,
    analiticas: lista,
    notas: notas.length ? notas : ["La distribución es ilustrativa: en la visita técnica se ajusta a los planos reales."],
    reutilizadas: Math.min(p.camarasExistentes ?? 0, camaras.length),
    fuente: "ia",
  };
}

/** Valida el cuerpo de la petición del navegador. */
export function leerPeticion(body: unknown): PeticionPlan | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  const descripcion = txt(b.descripcion, LIMITES_PLAN.descripcion);
  if (descripcion.length < 8) return null;
  const pr = Array.isArray(b.prioridades) ? b.prioridades.filter((x): x is Prioridad => PRIORIDADES.includes(x as Prioridad)) : [];
  const cam = typeof b.camarasExistentes === "number" && Number.isFinite(b.camarasExistentes) ? Math.max(0, Math.min(500, Math.round(b.camarasExistentes))) : undefined;
  return {
    descripcion,
    tipoSitio: TIPOS_SITIO.includes(b.tipoSitio as TipoSitio) ? (b.tipoSitio as TipoSitio) : undefined,
    tamano: TAMANOS.includes(b.tamano as Tamano) ? (b.tamano as Tamano) : undefined,
    prioridades: pr,
    camarasExistentes: cam,
  };
}
