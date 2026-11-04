import type { Metadata } from "next";
import { Experiencia } from "./Experiencia";

export const metadata: Metadata = {
  title: "Diagnóstico de tu empresa",
  description:
    "Conversa cinco minutos con la IA de ARS y descubre cómo se vería tu empresa con la operación conectada: hallazgos, plan por fases, cifras antes y después y tu propia historia en 3D.",
  alternates: { canonical: "/diagnostico" },
  openGraph: {
    title: "Diagnóstico ARS — ¿Cómo se vería tu empresa con ARS?",
    description: "Una entrevista con IA, una historia 3D de tu operación y un reporte descargable.",
    url: "/diagnostico",
  },
};

export default async function DiagnosticoPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { ejemplo } = await searchParams;
  const conEjemplo = ejemplo !== undefined;
  // La key reinicia la experiencia al entrar o salir del ejemplo.
  return <Experiencia key={conEjemplo ? "ejemplo" : "entrevista"} ejemplo={conEjemplo} />;
}
