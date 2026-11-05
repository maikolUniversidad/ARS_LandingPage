/**
 * Utilidades del diagnóstico que sirven en servidor y en cliente:
 * detección de áreas/módulos por palabras clave, catálogo compacto para los
 * prompts y saneamiento del perfil. Sin dependencias de servidor.
 */
import {
  AREA_IDS,
  CAMPOS_PERFIL,
  type AreaId,
  type CampoPerfil,
  type ContactoDiagnostico,
  type PerfilEmpresa,
  type TamanoEmpresa,
} from "@/data/diagnostico/tipos";
import { AREAS, areaPorId, buscarModulos, moduloPorId } from "@/data/servicios";

export const TAMANOS: TamanoEmpresa[] = ["1-50", "51-200", "201-1000", "1000+"];

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

/** Raíces de palabras (sin tildes) que delatan la necesidad de cada área. */
const CLAVES: Record<AreaId, string[]> = {
  "operacion-en-campo": ["ronda", "turno", "vigilante", "guarda", "puesto", "asistencia", "marcac", "relevo", "supervis", "porteria", "minuta", "programacion", "visitante", "escolta"],
  "centro-de-operaciones": ["central", "mapa", "gps", "ubicacion", "sedes", "cumplimiento", "tablero", "coordinador", "ver todo", "en vivo", "control"],
  "comunicacion-y-emergencias": ["radio", "whatsapp", "panico", "emergencia", "comunicacion", "llamada", "chat", "avantel", "telegram", "incidente"],
  "monitoreo-inteligente": ["camara", "cctv", "video", "sensor", "acceso", "facial", "placa", "intrus", "domotica", "iot", "puerta", "conjunto"],
  "realidad-virtual": ["realidad virtual", "vr", "gafas", "inmersiv", "3d", "junta", "directiva"],
  "gestion-humana": ["nomina", "personal", "contratacion", "seleccion", "rotacion", "hoja de vida", "hojas de vida", "documento", "empleado", "talento", "ausent", "incapacidad", "vacaciones", "liquidac", "sancion", "descargo"],
  formacion: ["capacitacion", "curso", "formacion", "certific", "entrenamiento", "induccion", "reentrenamiento", "evaluacion"],
  "finanzas-y-erp": ["factura", "contab", "costo", "erp", "cartera", "dian", "pago", "finanz", "siigo", "sap", "world office", "cotiza", "venta", "crm", "plata", "dinero"],
  "productividad-e-ia": ["informe", "reporte", "automatiz", "excel", "tarea", "inteligencia artificial", " ia", "papeleo", "reunion", "ticket", "formulario", "tiempo", "manual"],
  "gobierno-y-seguridad": ["permiso", "auditoria", "trazabil", "rol", "normativ", "habeas", "datos personales", "multiempresa", "doble factor", "app", "celular"],
};

/** Puntaje por área según el texto libre (dolores, herramientas, sector...). */
export function puntajeAreas(texto: string): Map<AreaId, number> {
  const t = ` ${norm(texto)} `;
  const out = new Map<AreaId, number>();
  for (const id of AREA_IDS) {
    let p = 0;
    for (const c of CLAVES[id]) if (t.includes(c)) p += 2;
    if (p) out.set(id, p);
  }
  for (const { area } of buscarModulos(texto, 6)) {
    const id = area.id as AreaId;
    out.set(id, (out.get(id) ?? 0) + 1);
  }
  return out;
}

export function textoDePerfil(p: Partial<PerfilEmpresa>): string {
  return [
    p.sector,
    ...(p.servicios ?? []),
    ...(p.dolores ?? []),
    ...(p.incidentes ?? []),
    ...(p.herramientasActuales ?? []),
    ...(p.prioridades ?? []),
    p.notas,
  ]
    .filter(Boolean)
    .join(". ");
}

/** Áreas candidatas ordenadas por relevancia (mínimo `min`, máximo `max`). */
export function areasCandidatas(p: Partial<PerfilEmpresa>, min = 3, max = 6): AreaId[] {
  const puntos = puntajeAreas(textoDePerfil(p));
  // Base razonable para cualquier empresa de seguridad/operación.
  const base: AreaId[] = ["operacion-en-campo", "centro-de-operaciones", "gestion-humana", "productividad-e-ia"];
  base.forEach((id, i) => puntos.set(id, (puntos.get(id) ?? 0) + 0.5 - i * 0.1));
  return [...puntos.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => id)
    .slice(0, Math.max(min, Math.min(max, [...puntos.values()].filter((v) => v >= 1).length)));
}

/** Raíces (sin tildes) → módulo que mejor responde a ese dolor o herramienta. */
const MODULOS_CLAVE: [string, string][] = [
  ["ronda", "rondas-qr"],
  ["asistencia", "control-de-asistencia-y-relevos"],
  ["marcac", "control-de-asistencia-y-relevos"],
  ["relevo", "control-de-asistencia-y-relevos"],
  ["turno", "turnos-y-programacion"],
  ["programac", "turnos-y-programacion"],
  ["supervis", "reportes-operativos-y-supervision"],
  ["nomina", "nomina"],
  ["informe", "centro-de-ia"],
  ["reporte", "reporte-por-sede"],
  ["whatsapp", "chat-corporativo"],
  ["radio", "radio-ptt"],
  ["panico", "boton-de-panico"],
  ["emergencia", "boton-de-panico"],
  ["excel", "agente-interoperador-de-datos"],
  ["papel", "formularios-dinamicos"],
  ["minuta", "reportes-operativos-y-supervision"],
  ["erp", "su-erp-dentro-de-ars"],
  ["costo", "costos-y-comparacion-con-el-erp"],
  ["factur", "facturas-dian-y-radian"],
  ["contab", "contabilidad-conectada"],
  ["control", "sala-de-control"],
  ["mapa", "sala-de-control"],
  ["cliente", "portal-documental-para-el-cliente"],
  ["rotacion", "seleccion-y-contratacion"],
  ["contrat", "seleccion-y-contratacion"],
  ["personal", "colaboradores-y-mis-datos"],
  ["document", "cargue-inteligente-de-documentos"],
  ["capacita", "capacitacion-virtual"],
  ["curso", "capacitacion-virtual"],
  ["camara", "vision-artificial"],
  ["acceso", "acceso-inteligente"],
  ["visitante", "visitantes-y-bicicletas"],
  ["tarea", "seguimiento-de-tareas"],
  ["reunion", "reuniones-con-transcripcion-ia"],
  ["crecer", "torre-de-control"],
  ["auditor", "auditoria-y-trazabilidad"],
];

/** Módulos que mejor responden a un texto (ids válidos del catálogo). */
export function modulosPara(texto: string, max = 4): string[] {
  const t = norm(texto);
  const out: string[] = [];
  for (const [clave, id] of MODULOS_CLAVE) if (t.includes(clave) && !out.includes(id) && moduloPorId(id)) out.push(id);
  if (!out.length) out.push(...buscarModulos(texto, max).map((x) => x.modulo.id));
  return out.slice(0, max);
}

export function esAreaId(v: unknown): v is AreaId {
  return typeof v === "string" && (AREA_IDS as string[]).includes(v);
}

/** Filtra ids de módulos válidos; si se pasa `area`, solo los de esa área. */
export function modulosValidos(ids: unknown, area?: AreaId): string[] {
  if (!Array.isArray(ids)) return [];
  const out: string[] = [];
  for (const id of ids) {
    if (typeof id !== "string") continue;
    const m = moduloPorId(id);
    if (!m || (area && m.area.id !== area) || out.includes(id)) continue;
    out.push(id);
  }
  return out;
}

/** Catálogo compacto para los prompts: área → módulos (id: nombre). */
export function catalogoCompacto(areas: readonly string[] = AREA_IDS): string {
  return areas
    .map((id) => areaPorId(id))
    .filter((a) => a !== undefined)
    .map(
      (a) =>
        `## ${a.id} — ${a.nombre}\n${a.frase}\n` +
        a.modulos.map((m) => `- ${m.id}: ${m.nombre} — ${m.frase}${m.estado === "vivo" ? "" : ` [${m.estado}]`}`).join("\n"),
    )
    .join("\n\n");
}

export function areaInfo(id: AreaId) {
  const a = AREAS.find((x) => x.id === id);
  return a ? { nombre: a.nombre, corto: a.corto, color: a.color, icono: a.icono } : { nombre: id, corto: id, color: "#6b8aff", icono: "Sparkles" };
}

/* ───────────── Perfil ───────────── */

const s = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/[\u0000-\u001f\u007f]+/g, " ").trim().slice(0, max) : "");
const lista = (v: unknown, maxItems: number, maxLargo: number) =>
  Array.isArray(v)
    ? [...new Set(v.map((x) => s(x, maxLargo)).filter(Boolean))].slice(0, maxItems)
    : [];
const entero = (v: unknown, max: number) =>
  typeof v === "number" && Number.isFinite(v) && v > 0 ? Math.min(max, Math.round(v)) : undefined;

const EMAIL = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]{2,}$/;

/** Sanea el contacto: solo campos con forma válida. */
export function contactoParcial(v: unknown): ContactoDiagnostico | undefined {
  if (!v || typeof v !== "object") return undefined;
  const o = v as Record<string, unknown>;
  const out: ContactoDiagnostico = {};
  const nombre = s(o.nombre, 80);
  if (nombre) out.nombre = nombre;
  const cargo = s(o.cargo, 80);
  if (cargo) out.cargo = cargo;
  const email = s(o.email, 120).toLowerCase();
  if (EMAIL.test(email)) out.email = email;
  const telefono = s(o.telefono, 30);
  if (telefono.replace(/\D/g, "").length >= 7 && /^[+\d\s().-]+$/.test(telefono)) out.telefono = telefono;
  return Object.keys(out).length ? out : undefined;
}

/** Sanea un perfil parcial que viene del cliente, de la IA o del análisis de un adjunto. */
export function perfilParcial(v: unknown): Partial<PerfilEmpresa> {
  if (!v || typeof v !== "object") return {};
  const o = v as Record<string, unknown>;
  const out: Partial<PerfilEmpresa> = {};
  const nombre = s(o.nombre, 80);
  if (nombre) out.nombre = nombre;
  const sector = s(o.sector, 80);
  if (sector) out.sector = sector;
  const ciudad = s(o.ciudad, 60);
  if (ciudad) out.ciudad = ciudad;
  if (typeof o.tamano === "string" && (TAMANOS as string[]).includes(o.tamano)) out.tamano = o.tamano as TamanoEmpresa;
  const sedes = entero(o.sedes, 100_000);
  if (sedes) out.sedes = sedes;
  const personal = entero(o.personal, 1_000_000);
  if (personal) out.personal = personal;
  const servicios = lista(o.servicios, 8, 80);
  if (servicios.length) out.servicios = servicios;
  const dolores = lista(o.dolores, 8, 160);
  if (dolores.length) out.dolores = dolores;
  const incidentes = lista(o.incidentes, 6, 160);
  if (incidentes.length) out.incidentes = incidentes;
  const herramientas = lista(o.herramientasActuales, 10, 60);
  if (herramientas.length) out.herramientasActuales = herramientas;
  const prioridades = lista(o.prioridades, 6, 60);
  if (prioridades.length) out.prioridades = prioridades;
  const plazo = s(o.plazo, 60);
  if (plazo) out.plazo = plazo;
  const presupuesto = s(o.presupuesto, 80);
  if (presupuesto) out.presupuesto = presupuesto;
  const contacto = contactoParcial(o.contacto);
  if (contacto) out.contacto = contacto;
  const notas = s(o.notas, 600);
  if (notas) out.notas = notas;
  return out;
}

/** Une dos perfiles parciales: los escalares nuevos ganan, las listas se acumulan. */
export function fusionarPerfil(a: Partial<PerfilEmpresa>, b: Partial<PerfilEmpresa>): Partial<PerfilEmpresa> {
  const unir = (x?: string[], y?: string[]) => {
    const out = [...(x ?? [])];
    for (const v of y ?? []) if (!out.some((o) => norm(o) === norm(v))) out.push(v);
    return out.length ? out : undefined;
  };
  const r: Partial<PerfilEmpresa> = { ...a, ...b };
  const listas = [
    ["dolores", 8],
    ["herramientasActuales", 10],
    ["prioridades", 6],
    ["servicios", 8],
    ["incidentes", 6],
  ] as const;
  for (const [k, max] of listas) {
    const u = unir(a[k], b[k]);
    if (u) r[k] = u.slice(0, max);
  }
  if (a.contacto || b.contacto) r.contacto = { ...a.contacto, ...b.contacto };
  if (a.notas && b.notas && a.notas !== b.notas) r.notas = `${a.notas} ${b.notas}`.slice(0, 600);
  return r;
}

/** Completa un perfil parcial con valores por defecto para pedir el diagnóstico. */
export function perfilCompleto(p: Partial<PerfilEmpresa>): PerfilEmpresa {
  return {
    ...p,
    nombre: p.nombre || "Tu empresa",
    sector: p.sector || "Seguridad privada",
    tamano: p.tamano ?? "51-200",
    dolores: p.dolores ?? [],
    herramientasActuales: p.herramientasActuales ?? [],
    prioridades: p.prioridades ?? [],
  };
}

/** true si el campo del perfil ya tiene un valor útil. */
export function campoLleno(p: Partial<PerfilEmpresa>, campo: CampoPerfil): boolean {
  const v = p[campo];
  if (campo === "contacto") return Boolean(p.contacto?.email || p.contacto?.telefono);
  if (Array.isArray(v)) return v.length > 0;
  return v !== undefined && v !== null && v !== "";
}

/** Campos de CAMPOS_PERFIL que aún faltan, en el orden de la entrevista. */
export function camposFaltantes(p: Partial<PerfilEmpresa>): CampoPerfil[] {
  return CAMPOS_PERFIL.filter((c) => !campoLleno(p, c));
}

/** 0–1: cuánto del perfil está lleno (para la barra del perfil en construcción). */
export function completitud(p: Partial<PerfilEmpresa>): number {
  return (CAMPOS_PERFIL.length - camposFaltantes(p).length) / CAMPOS_PERFIL.length;
}

/** Lo mínimo para armar un diagnóstico serio: nombre, sector, tamaño, 2 dolores y prioridades. */
export function perfilSuficiente(p: Partial<PerfilEmpresa>): boolean {
  return Boolean(p.nombre && p.sector && p.tamano && (p.dolores?.length ?? 0) >= 2 && p.prioridades?.length);
}
