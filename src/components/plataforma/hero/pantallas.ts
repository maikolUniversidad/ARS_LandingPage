/**
 * Pantallas del «muro de mando» del hero de /plataforma.
 *
 * Cada pantalla es una captura REAL del catálogo (`@/data/servicios`). El área, el
 * módulo, el color y el pie en español se resuelven desde el catálogo; aquí solo
 * se elige qué capturas van al muro (en orden: las primeras son las que quedan
 * en móvil) y se da el texto en inglés, porque el catálogo es solo en español.
 */
import { AREAS } from "@/data/servicios";
import type { Locale } from "@/lib/i18n/dictionaries";

export type Pantalla = {
  src: string;
  ancho: number;
  alto: number;
  alt: string;
  color: string;
  area: Record<Locale, string>;
  modulo: Record<Locale, string>;
  pie: Record<Locale, string>;
};

type Eleccion = { archivo: string; areaEn: string; moduloEn: string; pieEn: string };

/** Orden = prioridad. En móvil se usan las primeras `PANTALLAS_MOVIL`. */
const ELEGIDAS: Eleccion[] = [
  {
    archivo: "40-sala-de-control",
    areaEn: "Operations center",
    moduloEn: "Control room",
    pieEn: "Control Room: sites and people on the map, with groups and radio channels on the side.",
  },
  {
    archivo: "55-vision-dashboard-ia",
    areaEn: "Smart monitoring",
    moduloEn: "AI video analytics",
    pieEn: "AI Operations Center: cameras, alerts and severity for the period.",
  },
  {
    archivo: "49-recorridos-gps",
    areaEn: "Operations center",
    moduloEn: "GPS patrol tracking",
    pieEn: "Weekly patrols: inspections done, compliance, kilometers and hours in the field.",
  },
  {
    archivo: "83-docs-tipos-arbol-3d",
    areaEn: "People management",
    moduloEn: "3D document tree",
    pieEn: "3D document tree and the result of simulating the new AI classification.",
  },
  {
    archivo: "137-rv-sede-inteligente-3d",
    areaEn: "Virtual reality",
    moduloEn: "Smart site in VR",
    pieEn: "Smart Site in 3D (demo with simulated data).",
  },
  {
    archivo: "30-turnos-realizados",
    areaEn: "Field operations",
    moduloEn: "Shifts worked",
    pieEn: "Shifts worked: hours, shifts and sites with check-ins this month, compared with the previous period.",
  },
  {
    archivo: "75-nomina-parametrizador",
    areaEn: "People management",
    moduloEn: "Payroll",
    pieEn: "Payroll setup: every concept with its nature, contribution base and salary character.",
  },
  {
    archivo: "56-vision-centro-monitoreo",
    areaEn: "Smart monitoring",
    moduloEn: "Live video wall",
    pieEn: "Live video wall with the AI alert queue ready to handle.",
  },
  {
    archivo: "47-consola-radio",
    areaEn: "Communication & emergencies",
    moduloEn: "Radio console",
    pieEn: "Radio console: transmissions, recording and activity by hour.",
  },
  {
    archivo: "44-zonas",
    areaEn: "Operations center",
    moduloEn: "Zones & supervisors",
    pieEn: "A territory with its colored zones, sites and supervisors per zone.",
  },
  {
    archivo: "100-capacitacion-mapa-reglas",
    areaEn: "Training",
    moduloEn: "Training rules map",
    pieEn: "Rules map: how each course reaches each person.",
  },
  {
    archivo: "111-contabilidad-reportes",
    areaEn: "Finance & ERP",
    moduloEn: "Accounting reports",
    pieEn: "The 15 accounting reports, all downloadable to Excel.",
  },
  {
    archivo: "162-automatizaciones-biblioteca",
    areaEn: "Productivity & AI",
    moduloEn: "Automations",
    pieEn: "Library of ready-to-install procedures by site type.",
  },
  {
    archivo: "59-vision-eventos",
    areaEn: "Smart monitoring",
    moduloEn: "Alarm center",
    pieEn: "Alarm center: each event with its evidence, confidence and actions.",
  },
];

export const PANTALLAS_MOVIL = 7;

function resolver(): Pantalla[] {
  const out: Pantalla[] = [];
  for (const e of ELEGIDAS) {
    const src = `/servicios/capturas/${e.archivo}.jpg`;
    let hallada: Pantalla | undefined;
    for (const area of AREAS) {
      for (const modulo of area.modulos) {
        const cap = modulo.capturas.find((c) => c.src === src);
        if (!cap) continue;
        hallada = {
          src,
          ancho: cap.ancho,
          alto: cap.alto,
          alt: cap.alt,
          color: area.color,
          area: { es: area.nombre, en: e.areaEn },
          modulo: { es: modulo.nombre, en: e.moduloEn },
          pie: { es: cap.pie, en: e.pieEn },
        };
        break;
      }
      if (hallada) break;
    }
    // Si una captura sale del catálogo, el muro simplemente tiene una pantalla menos.
    if (hallada) out.push(hallada);
  }
  return out;
}

export const PANTALLAS: Pantalla[] = resolver();

/** Cifras reales del catálogo para la fila de datos del hero. */
export const CIFRAS = (() => {
  let modulos = 0;
  let capturas = 0;
  for (const a of AREAS) {
    modulos += a.modulos.length;
    for (const m of a.modulos) capturas += m.capturas.length;
  }
  return { areas: AREAS.length, modulos, capturas };
})();
