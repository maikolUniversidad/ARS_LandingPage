import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AREAS, areaPorId, type Area } from "@/data/servicios";
import { AreaExperiencia, type AreaBreve } from "@/components/servicios/AreaExperiencia";

type Params = { area: string };

/** Solo existen las áreas del catálogo; cualquier otra ruta es 404. */
export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return AREAS.map((a) => ({ area: a.id }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { area: id } = await params;
  const area = areaPorId(id);
  if (!area) return {};
  const descripcion = `${area.frase}. ${area.descripcion}`;
  return {
    title: `${area.nombre} · Servicios`,
    description: descripcion,
    alternates: { canonical: `/servicios/${area.id}` },
    openGraph: {
      title: `${area.nombre} — ARS Intelligence`,
      description: descripcion,
      url: `/servicios/${area.id}`,
      ...(area.arte ? { images: [{ url: area.arte }] } : {}),
    },
  };
}

function breve(a: Area): AreaBreve {
  return {
    id: a.id,
    letra: a.letra,
    nombre: a.nombre,
    frase: a.frase,
    color: a.color,
    icono: a.icono,
    arte: a.arte,
    modulos: a.modulos.length,
  };
}

export default async function AreaPage({ params }: { params: Promise<Params> }) {
  const { area: id } = await params;
  const area = areaPorId(id);
  if (!area) notFound();

  const i = AREAS.findIndex((a) => a.id === area.id);
  const n = AREAS.length;
  const anterior = AREAS[(i - 1 + n) % n];
  const siguiente = AREAS[(i + 1) % n];
  // Relacionadas: las que siguen en el recorrido, sin repetir la actual ni anterior/siguiente.
  const relacionadas = [2, 3, 4, -2]
    .map((d) => AREAS[(((i + d) % n) + n) % n])
    .filter((a, k, arr) => a.id !== area.id && a.id !== anterior.id && a.id !== siguiente.id && arr.indexOf(a) === k)
    .slice(0, 3)
    .map(breve);

  const indiceModulos: Record<string, string> = {};
  for (const a of AREAS) for (const m of a.modulos) indiceModulos[m.id] = a.id;

  return (
    <AreaExperiencia
      area={area}
      anterior={n > 1 ? breve(anterior) : null}
      siguiente={n > 2 ? breve(siguiente) : null}
      relacionadas={relacionadas}
      indiceModulos={indiceModulos}
    />
  );
}
