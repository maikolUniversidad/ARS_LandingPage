import type { MetadataRoute } from "next";

const SITE_URL = "https://arsintelligence.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/plataforma", "/laboratorio", "/proyectos", "/vision-lab"];
  return routes.map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.8,
  }));
}
