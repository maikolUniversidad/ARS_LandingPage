/**
 * Utilidades del perfil para la UI de la entrevista: etiquetas de cada campo,
 * fusión (incluye los campos ampliados), % de avance y qué campos cambiaron.
 */
import { CAMPOS_PERFIL, type CampoPerfil, type ContactoDiagnostico, type PerfilEmpresa, type TamanoEmpresa } from "@/data/diagnostico/tipos";
import { fusionarPerfil } from "@/lib/diagnostico/catalogo";

export type Perfil = Partial<PerfilEmpresa>;

/** De dónde salió el valor de un campo (se muestra en el panel). */
export type FuenteCampo = { fuente: "chat" | "voz" | "adjunto" | "manual"; detalle?: string; en: number };
export type Origenes = Partial<Record<CampoPerfil, FuenteCampo>>;

export type TipoCampo = "texto" | "numero" | "lista" | "tamano" | "contacto";

export const INFO_CAMPO: Record<CampoPerfil, { etiqueta: string; tipo: TipoCampo; pista: string; pregunta: string }> = {
  nombre: { etiqueta: "Empresa", tipo: "texto", pista: "Seguridad Andina S.A.S.", pregunta: "el nombre de la empresa" },
  sector: { etiqueta: "Sector", tipo: "texto", pista: "Vigilancia privada", pregunta: "el sector de la empresa" },
  tamano: { etiqueta: "Tamaño", tipo: "tamano", pista: "", pregunta: "el tamaño de la empresa" },
  sedes: { etiqueta: "Sedes / puestos", tipo: "numero", pista: "12", pregunta: "cuántas sedes o puestos tenemos" },
  ciudad: { etiqueta: "Ciudad", tipo: "texto", pista: "Medellín", pregunta: "la ciudad donde operamos" },
  personal: { etiqueta: "Personal", tipo: "numero", pista: "180", pregunta: "cuántas personas trabajan en la operación" },
  servicios: { etiqueta: "Servicios", tipo: "lista", pista: "Vigilancia fija, Escoltas", pregunta: "los servicios que prestamos" },
  dolores: { etiqueta: "Lo que duele", tipo: "lista", pista: "Rondas sin control, reportes a mano", pregunta: "lo que más nos duele hoy" },
  herramientasActuales: { etiqueta: "Herramientas hoy", tipo: "lista", pista: "Excel, WhatsApp, radio", pregunta: "las herramientas que usamos hoy" },
  prioridades: { etiqueta: "Prioridades", tipo: "lista", pista: "Control, costos", pregunta: "nuestras prioridades" },
  incidentes: { etiqueta: "Incidentes recientes", tipo: "lista", pista: "Hurto en portería, ronda no hecha", pregunta: "incidentes recientes que hemos tenido" },
  plazo: { etiqueta: "Plazo", tipo: "texto", pista: "1-3 meses", pregunta: "en qué plazo queremos arrancar" },
  contacto: { etiqueta: "Contacto", tipo: "contacto", pista: "", pregunta: "mis datos de contacto para recibir el diagnóstico" },
};

export const TAMANOS: { v: TamanoEmpresa; t: string }[] = [
  { v: "1-50", t: "Hasta 50 personas" },
  { v: "51-200", t: "51 a 200 personas" },
  { v: "201-1000", t: "201 a 1.000 personas" },
  { v: "1000+", t: "Más de 1.000 personas" },
];

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim();

function unir(x?: string[], y?: string[], max = 10) {
  const out = [...(x ?? [])];
  for (const v of y ?? []) if (v && !out.some((o) => norm(o) === norm(v))) out.push(v);
  return out.length ? out.slice(0, max) : undefined;
}

/** Fusión completa: la del catálogo + listas ampliadas + contacto por partes. */
export function fusionar(a: Perfil, b: Perfil): Perfil {
  const r = fusionarPerfil(a, b);
  const servicios = unir(a.servicios, b.servicios);
  const incidentes = unir(a.incidentes, b.incidentes, 8);
  if (servicios) r.servicios = servicios;
  if (incidentes) r.incidentes = incidentes;
  if (a.contacto || b.contacto) r.contacto = limpiarContacto({ ...a.contacto, ...b.contacto });
  return r;
}

export function limpiarContacto(c: ContactoDiagnostico): ContactoDiagnostico | undefined {
  const out: ContactoDiagnostico = {};
  for (const k of ["nombre", "cargo", "email", "telefono"] as const) {
    const v = c[k]?.trim();
    if (v) out[k] = v;
  }
  return Object.keys(out).length ? out : undefined;
}

/** ¿Tiene valor este campo? (contacto cuenta con nombre + email o teléfono). */
export function lleno(p: Perfil, c: CampoPerfil): boolean {
  const v = p[c];
  if (c === "contacto") {
    const k = p.contacto;
    return Boolean(k && (k.email || k.telefono) && k.nombre);
  }
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === "number") return v > 0;
  return Boolean(v);
}

export function porcentaje(p: Perfil): number {
  return Math.round((CAMPOS_PERFIL.filter((c) => lleno(p, c)).length / CAMPOS_PERFIL.length) * 100);
}

export function faltantes(p: Perfil): CampoPerfil[] {
  return CAMPOS_PERFIL.filter((c) => !lleno(p, c));
}

/** Firma comparable de un campo (para saber qué cambió). */
function firma(p: Perfil, c: CampoPerfil): string {
  const v = p[c];
  return v === undefined ? "" : JSON.stringify(v);
}

export function camposCambiados(antes: Perfil, despues: Perfil): CampoPerfil[] {
  return CAMPOS_PERFIL.filter((c) => firma(antes, c) !== firma(despues, c) && Boolean(firma(despues, c)));
}

/** Texto legible del valor de un campo (para el panel y las tarjetas). */
export function valorTexto(p: Perfil, c: CampoPerfil): string {
  switch (c) {
    case "tamano":
      return TAMANOS.find((t) => t.v === p.tamano)?.t ?? "";
    case "sedes":
      return p.sedes ? `${p.sedes} ${p.sedes === 1 ? "sede" : "sedes"}` : "";
    case "personal":
      return p.personal ? `${p.personal.toLocaleString("es-CO")} personas` : "";
    case "contacto": {
      const k = p.contacto;
      if (!k) return "";
      return [k.nombre, k.cargo, k.email, k.telefono].filter(Boolean).join(" · ");
    }
    default: {
      const v = p[c];
      if (Array.isArray(v)) return v.join(", ");
      return typeof v === "string" ? v : "";
    }
  }
}

export const etiquetaFuente = (f: FuenteCampo): string =>
  f.fuente === "adjunto" ? `de ${f.detalle ?? "un archivo"}` : f.fuente === "voz" ? "por voz" : f.fuente === "manual" ? "editado por ti" : "del chat";
