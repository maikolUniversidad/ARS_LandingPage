import { feature } from "topojson-client";
import { geoMercator, geoPath } from "d3-geo";
import type { GeometryCollection, Topology } from "topojson-specification";
import countries50m from "world-atlas/countries-50m.json";
import type { Ciudad, PaisId } from "@/data/proyectos";
import { MAPA_H, MAPA_W, type GeometriaMapa, type PaisMapa } from "./geometria-tipos";

/**
 * Geometría del mapa de /proyectos, calculada en el servidor: al cliente solo
 * le llegan las cadenas `d` de los países y las coordenadas ya proyectadas.
 */

const VECINOS = new Set(["Venezuela", "Ecuador", "Brazil", "Bolivia", "Panama", "Chile", "Costa Rica", "Guyana", "Suriname", "Paraguay", "Argentina", "Nicaragua"]);
const PRESENCIA: Record<string, PaisId> = { Colombia: "CO", Peru: "PE" };

type Props = { name: string };
type Pais = GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon, Props>;


export function geometriaMapa(ciudades: Ciudad[]): GeometriaMapa {
  const topo = countries50m as unknown as Topology<{ countries: GeometryCollection<Props> }>;
  const todos = (feature(topo, topo.objects.countries) as GeoJSON.FeatureCollection<Pais["geometry"], Props>).features as Pais[];
  const visibles = todos.filter((f) => VECINOS.has(f.properties.name) || f.properties.name in PRESENCIA);
  const foco = todos.filter((f) => f.properties.name in PRESENCIA);

  const proyeccion = geoMercator().fitExtent(
    [
      [24, 24],
      [MAPA_W - 24, MAPA_H - 24],
    ],
    { type: "FeatureCollection", features: foco }
  );
  const path = geoPath(proyeccion).digits(1);

  const paises: PaisMapa[] = visibles
    .map((f) => ({ nombre: f.properties.name, pais: PRESENCIA[f.properties.name] ?? null, d: path(f) ?? "" }))
    .filter((p) => p.d)
    // Los países con presencia se pintan encima.
    .sort((a, b) => Number(a.pais !== null) - Number(b.pais !== null));

  const punto = (lng: number, lat: number) => {
    const p = proyeccion([lng, lat]) ?? [0, 0];
    return { x: Math.round(p[0] * 10) / 10, y: Math.round(p[1] * 10) / 10 };
  };

  return {
    paises,
    ciudades: ciudades.map((c) => ({ id: c.id, ...punto(c.lng, c.lat) })),
    etiquetas: [
      { pais: "CO", ...punto(-72.2, 1.2) },
      { pais: "PE", ...punto(-74.6, -8.6) },
    ],
  };
}
