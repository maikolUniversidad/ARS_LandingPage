import type { Metadata } from "next";

/** Herramienta interna (editor de datos del mapa de proyectos): nunca se indexa. */
export const metadata: Metadata = {
  title: "Admin · Editor de proyectos",
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
