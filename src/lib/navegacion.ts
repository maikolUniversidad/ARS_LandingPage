/**
 * Navegación principal del sitio: una sola lista para el header de escritorio
 * y el menú móvil de todas las páginas públicas.
 *
 * Orden: lo que ARS hace (servicios) → dónde se opera (plataforma y su arquitectura) → la IA
 * (visión y laboratorio) → dónde ya opera (proyectos). El CTA principal es el
 * diagnóstico; el contacto apunta a la sección de cierre de cada página.
 */

export type ClaveNav = "services" | "platform" | "architecture" | "vision" | "lab" | "projects";

export type EnlaceNav = { clave: ClaveNav; href: string; marca: string };

export const NAV_PRINCIPAL: readonly EnlaceNav[] = [
  { clave: "services", href: "/servicios", marca: "✦" },
  { clave: "platform", href: "/plataforma", marca: "◇" },
  { clave: "architecture", href: "/arquitectura", marca: "▤" },
  { clave: "vision", href: "/vision", marca: "◉" },
  { clave: "lab", href: "/laboratorio", marca: "◎" },
  { clave: "projects", href: "/proyectos", marca: "▣" },
];

/** CTA principal del sitio. */
export const RUTA_DIAGNOSTICO = "/diagnostico";

/** Contacto por defecto (formulario de la portada) para páginas sin sección de cierre propia. */
export const CONTACTO_PORTADA = "/#contacto";

/** ¿El enlace corresponde a la página actual (o a una subpágina)? */
export function esRutaActual(href: string, ruta: string | null | undefined): boolean {
  if (!ruta) return false;
  return ruta === href || ruta.startsWith(`${href}/`);
}
