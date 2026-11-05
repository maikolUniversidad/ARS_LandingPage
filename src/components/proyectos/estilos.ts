import type { EstadoProyecto } from "@/data/proyectos";

/**
 * Clases de color por área del catálogo y por estado. Son literales (no se
 * arman con plantillas) para que Tailwind las genere y no haga falta `style`.
 * Los hex coinciden con `Area.color` en `src/data/servicios/catalogo.ts`.
 */
export const AREA_CLASES: Record<string, { punto: string; borde: string; texto: string }> = {
  "operacion-en-campo": { punto: "bg-[#35e0a1]", borde: "border-[#35e0a1]/50", texto: "text-[#35e0a1]" },
  "centro-de-operaciones": { punto: "bg-[#5fd8ff]", borde: "border-[#5fd8ff]/50", texto: "text-[#5fd8ff]" },
  "comunicacion-y-emergencias": { punto: "bg-[#ffb347]", borde: "border-[#ffb347]/50", texto: "text-[#ffb347]" },
  "monitoreo-inteligente": { punto: "bg-[#6b8aff]", borde: "border-[#6b8aff]/50", texto: "text-[#6b8aff]" },
  "realidad-virtual": { punto: "bg-[#b78bff]", borde: "border-[#b78bff]/50", texto: "text-[#b78bff]" },
  "gestion-humana": { punto: "bg-[#ff8fb1]", borde: "border-[#ff8fb1]/50", texto: "text-[#ff8fb1]" },
  formacion: { punto: "bg-[#ffd166]", borde: "border-[#ffd166]/50", texto: "text-[#ffd166]" },
  "finanzas-y-erp": { punto: "bg-[#4fd1c5]", borde: "border-[#4fd1c5]/50", texto: "text-[#4fd1c5]" },
  "productividad-e-ia": { punto: "bg-[#a3e635]", borde: "border-[#a3e635]/50", texto: "text-[#a3e635]" },
  "gobierno-y-seguridad": { punto: "bg-[#cfd8e3]", borde: "border-[#cfd8e3]/50", texto: "text-[#cfd8e3]" },
};

const AREA_POR_DEFECTO = { punto: "bg-[#6b8aff]", borde: "border-[#6b8aff]/50", texto: "text-[#6b8aff]" };

export function claseArea(id: string) {
  return AREA_CLASES[id] ?? AREA_POR_DEFECTO;
}

/** Colores de estado, mismos tonos que el home (en operación / piloto / en desarrollo). */
export const ESTADO_CLASES: Record<EstadoProyecto, { punto: string; caja: string; trazo: string; relleno: string }> = {
  operacion: {
    punto: "bg-[#35e0a1]",
    caja: "border-[#35e0a1]/40 bg-[#35e0a1]/10",
    trazo: "stroke-[#35e0a1]",
    relleno: "fill-[#35e0a1]",
  },
  piloto: {
    punto: "bg-[#ffb547]",
    caja: "border-[#ffb547]/40 bg-[#ffb547]/10",
    trazo: "stroke-[#ffb547]",
    relleno: "fill-[#ffb547]",
  },
  desarrollo: {
    punto: "bg-[#a88bff]",
    caja: "border-[#a88bff]/40 bg-[#a88bff]/10",
    trazo: "stroke-[#a88bff]",
    relleno: "fill-[#a88bff]",
  },
};
