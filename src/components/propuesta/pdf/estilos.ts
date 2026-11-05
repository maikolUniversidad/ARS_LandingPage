/**
 * Estilos, fuentes y utilidades del PDF de la Propuesta ARS (@react-pdf/renderer).
 * Mismo lenguaje visual que el PDF del Diagnóstico: Lato (black para títulos),
 * Radley itálica para acentos, etiquetas en mayúsculas espaciadas, tinta oscura
 * sobre blanco para que también se lea bien impreso.
 */
import { Font, StyleSheet } from "@react-pdf/renderer";
import type { AreaId, Integracion } from "@/data/propuesta/tipos";
import { areaPorId, moduloPorId } from "@/data/servicios";
import type { ImagenesPdf } from "./imagenes";

export const MARCA = {
  fondo: "#020a18",
  imperial: "#142664",
  french: "#1d3885",
  indigo: "#2348d4",
  indigoClaro: "#6b8aff",
  acero: "#9eb0c0",
  texto: "#d5e0ff",
} as const;

export const TINTA = "#0b1530";
export const TINTA_2 = "#3b4863";
export const TINTA_3 = "#5f6b84";
export const LINEA = "#dfe5f0";
export const SUAVE = "#f3f6fb";

/** Carta: 612 × 792 pt. */
export const ANCHO = 612;
export const ALTO = 792;
export const MARGEN = 44;
export const UTIL = ANCHO - MARGEN * 2;

/**
 * Fuentes e imágenes del documento. Las fuentes van por URL (navegador) o ruta de
 * archivo (servidor); las imágenes llegan ya resueltas y comprimidas (ver imagenes.ts).
 */
export type Recursos = {
  fuente: (archivo: string) => string;
  imagenes: ImagenesPdf;
};

export const fuentesDesdeOrigen = (origen: string) => (archivo: string) => `${origen}/fonts/reporte/${archivo}`;

let fuentesListas = "";
export function registrarFuentes(r: Recursos) {
  const clave = r.fuente("");
  if (fuentesListas === clave) return;
  Font.register({
    family: "Lato",
    fonts: [
      { src: r.fuente("Lato-Regular.ttf") },
      { src: r.fuente("Lato-Italic.ttf"), fontStyle: "italic" },
      { src: r.fuente("Lato-Bold.ttf"), fontWeight: 700 },
      { src: r.fuente("Lato-Black.ttf"), fontWeight: 900 },
    ],
  });
  Font.register({
    family: "Radley",
    fonts: [{ src: r.fuente("Radley-Regular.ttf") }, { src: r.fuente("Radley-Italic.ttf"), fontStyle: "italic" }],
  });
  // Sin guiones de silabeo: las palabras pasan completas a la línea siguiente.
  Font.registerHyphenationCallback((palabra) => [palabra]);
  fuentesListas = clave;
}

/* ───────────── Datos ───────────── */

const ZONA = "America/Bogota";

export function fechaLarga(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric", timeZone: ZONA });
}

const humanizar = (id: string) => {
  const t = id.replace(/[-_]+/g, " ").trim();
  return t.charAt(0).toUpperCase() + t.slice(1);
};

export function nombreModulo(id: string): string {
  return moduloPorId(id)?.modulo.nombre ?? humanizar(id);
}

/** Color del área a la que pertenece el módulo (o índigo si no está en el catálogo). */
export function colorModulo(id: string): string {
  return moduloPorId(id)?.area.color ?? MARCA.indigo;
}

export function nombreArea(id: AreaId | string): string {
  return areaPorId(id)?.nombre ?? humanizar(id);
}

export function colorArea(id: AreaId | string): string {
  return areaPorId(id)?.color ?? MARCA.indigo;
}

/** Colores de los modos de integración (legibles sobre blanco y en impresión). */
export const MODO: Record<Integracion["modo"], { texto: string; color: string; punteado?: boolean }> = {
  integra: { texto: "Se integra", color: "#2348d4" },
  migra: { texto: "Se migra", color: "#0e7490" },
  convive: { texto: "Convive", color: "#6b7891", punteado: true },
  reemplaza: { texto: "Se reemplaza", color: "#b8693c" },
  centraliza: { texto: "Se centraliza en ARS", color: "#6d3fc4" },
};

export function slug(texto: string): string {
  return (
    texto
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^A-Za-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "empresa"
  );
}

export function nombreArchivo(empresa: string): string {
  return `Propuesta-ARS-${slug(empresa)}.pdf`;
}

/* ───────────── Estilos ───────────── */

export const s = StyleSheet.create({
  pagina: { fontFamily: "Lato", fontSize: 10, color: TINTA, paddingTop: 66, paddingBottom: 60, paddingHorizontal: MARGEN, lineHeight: 1.45 },
  encabezado: {
    position: "absolute",
    top: 22,
    left: MARGEN,
    right: MARGEN,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 0.6,
    borderBottomColor: LINEA,
    paddingBottom: 8,
  },
  pie: {
    position: "absolute",
    top: ALTO - 36,
    left: MARGEN,
    right: MARGEN,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 7.5,
    color: TINTA_3,
    borderTopWidth: 0.6,
    borderTopColor: LINEA,
    paddingTop: 7,
  },
  eyebrow: { fontSize: 7.5, letterSpacing: 1.6, textTransform: "uppercase", color: TINTA_3 },
  num: { fontSize: 7.5, letterSpacing: 1.6, color: MARCA.indigo, fontWeight: 700 },
  h2: { fontSize: 20, fontWeight: 900, marginTop: 4, marginBottom: 10, lineHeight: 1.15 },
  h3: { fontSize: 12, fontWeight: 900, lineHeight: 1.2 },
  p: { fontSize: 10, color: TINTA_2 },
  etiqueta: { fontSize: 6.8, letterSpacing: 1.3, textTransform: "uppercase", color: TINTA_3, marginBottom: 3 },
  tarjeta: { borderWidth: 0.7, borderColor: LINEA, borderRadius: 8, padding: 12, backgroundColor: "#ffffff" },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 4,
    paddingVertical: 2,
    paddingHorizontal: 6,
    marginRight: 4,
    marginBottom: 4,
    backgroundColor: SUAVE,
  },
  estimado: {
    fontSize: 6.5,
    lineHeight: 1,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: TINTA_3,
    borderWidth: 0.6,
    borderColor: LINEA,
    borderRadius: 8,
    paddingTop: 3.5,
    paddingBottom: 2.5,
    paddingHorizontal: 6,
  },
});
