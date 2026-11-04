import type { MetadataRoute } from "next";
import { AREAS } from "@/data/servicios";

const SITE_URL = "https://arsintelligence.com";

/**
 * Rutas públicas e indexables. Fuera: /vision-lab (playground técnico, noindex),
 * /admin (interna, noindex + robots) y /api. Las áreas salen del catálogo.
 */
const RUTAS: { path: string; priority: number }[] = [
  { path: "", priority: 1 },
  { path: "/servicios", priority: 0.9 },
  { path: "/diagnostico", priority: 0.9 },
  { path: "/plataforma", priority: 0.8 },
  { path: "/vision", priority: 0.8 },
  { path: "/laboratorio", priority: 0.6 },
  { path: "/proyectos", priority: 0.7 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...RUTAS,
    ...AREAS.map((a) => ({ path: `/servicios/${a.id}`, priority: 0.8 })),
  ].map(({ path, priority }) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: "weekly" as const,
    priority,
  }));
}
