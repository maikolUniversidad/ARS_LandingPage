import type { MetadataRoute } from "next";
import { AREAS } from "@/data/servicios";

const SITE_URL = "https://arsintelligence.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/servicios", "/plataforma", "/vision", "/laboratorio", "/proyectos", "/vision-lab"];
  const servicios = AREAS.map((a) => `/servicios/${a.id}`);
  return [
    ...routes.map((path) => ({
      url: `${SITE_URL}${path}`,
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : path === "/servicios" ? 0.9 : 0.8,
    })),
    ...servicios.map((path) => ({
      url: `${SITE_URL}${path}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
