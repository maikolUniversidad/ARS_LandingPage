/**
 * Imágenes del PDF de la propuesta: qué se necesita y de dónde sale.
 *
 * El documento no carga nada por su cuenta: recibe un mapa `clave → imagen` ya
 * resuelto y comprimido. Quién lo arma depende del entorno:
 *  - navegador (descargar.ts): fetch al propio sitio + canvas para reducir;
 *  - servidor (/api/propuesta/enviar): filesystem (o el propio sitio) + sharp.
 * Así el PDF se mantiene en pocos MB (límite de la función de Vercel: 4,5 MB).
 */
import type { AnaliticaPropuesta, AreaId, ModuloPropuesto, Propuesta } from "@/data/propuesta/tipos";
import { ANALITICAS_PROHIBIDAS } from "@/data/propuesta/tipos";
import { imagenPropuesta, type TipoImagen } from "@/data/propuesta/imagenes";
import { analiticas as CATALOGO_ANALITICAS, type Analitica } from "@/data/analiticas";
import { moduloPorId, type Captura } from "@/data/servicios";

/** Lo que acepta <Image src> de react-pdf: URL/dataURL o bytes con formato. */
export type FuenteImagen = string | { data: Buffer; format: "png" | "jpg" };
export type ImagenesPdf = Partial<Record<string, FuenteImagen>>;

export type Pedido = {
  clave: string;
  /** Rutas públicas candidatas, en orden: se usa la primera que exista. */
  rutas: string[];
  /** Ancho máximo en píxeles tras reducir. */
  ancho: number;
  /** png solo para logos con transparencia; lo demás va en jpg. */
  formato: "png" | "jpg";
};

export const CLAVE = {
  logoNegro: "logo-negro",
  logoBlanco: "logo-blanco",
  iconoBlanco: "icono-blanco",
  escena: (t: TipoImagen) => `escena-${t}`,
  captura: (src: string) => `cap:${src}`,
  analitica: (id: string) => `ana:${id}`,
} as const;

export const MAX_CAPTURAS_POR_MODULO = 2;
export const MAX_MODULOS_CON_CAPTURAS = 6;
export const MAX_ANALITICAS = 4;

/** Área con más módulos propuestos (desempata el orden de aparición). */
export function areaPrincipal(p: Propuesta): AreaId {
  const cuenta = new Map<AreaId, number>();
  for (const m of p.modulos) cuenta.set(m.area, (cuenta.get(m.area) ?? 0) + 1);
  let mejor: AreaId = p.modulos[0]?.area ?? "operacion-en-campo";
  for (const [a, n] of cuenta) if (n > (cuenta.get(mejor) ?? 0)) mejor = a;
  return mejor;
}

const arte = (area: string) => `/servicios/arte/${area}.jpg`;

/**
 * Módulos propuestos con sus capturas reales del catálogo (los que tienen).
 * Con 4 o más módulos con capturas se toma una por módulo para que quepan en una página.
 */
export function capturasDe(p: Propuesta): { m: ModuloPropuesto; nombre: string; capturas: Captura[] }[] {
  const candidatos: { m: ModuloPropuesto; nombre: string; capturas: Captura[] }[] = [];
  for (const m of p.modulos) {
    const info = moduloPorId(m.modulo);
    if (!info || !info.modulo.capturas.length || candidatos.some((c) => c.m.modulo === m.modulo)) continue;
    candidatos.push({ m, nombre: info.modulo.nombre, capturas: info.modulo.capturas });
  }
  const porModulo = candidatos.length >= 4 ? 1 : MAX_CAPTURAS_POR_MODULO;
  return candidatos.slice(0, MAX_MODULOS_CON_CAPTURAS).map((c) => ({ ...c, capturas: c.capturas.slice(0, porModulo) }));
}

/** Analíticas propuestas que existen en el catálogo, tienen evidencia y se pueden mostrar. */
export function analiticasDe(p: Propuesta): { a: AnaliticaPropuesta; info: Analitica; poster: string }[] {
  const out: { a: AnaliticaPropuesta; info: Analitica; poster: string }[] = [];
  for (const a of p.analiticas ?? []) {
    if (ANALITICAS_PROHIBIDAS.has(a.id) || out.some((x) => x.a.id === a.id)) continue;
    const info = CATALOGO_ANALITICAS.find((x) => x.id === a.id);
    const poster = info?.video?.poster ?? info?.video?.img;
    if (info && poster) out.push({ a, info, poster });
    if (out.length >= MAX_ANALITICAS) break;
  }
  return out;
}

/** Todo lo que el PDF de esta propuesta va a pedir. */
export function pedidosImagenes(p: Propuesta): Pedido[] {
  const escenario = p.escenario ?? "mixto";
  const principal = areaPrincipal(p);
  const pedidos: Pedido[] = [
    { clave: CLAVE.logoNegro, rutas: ["/images/logos/horizontal-negro.png"], ancho: 360, formato: "png" },
    { clave: CLAVE.logoBlanco, rutas: ["/images/logos/horizontal-blanco.png"], ancho: 600, formato: "png" },
    { clave: CLAVE.iconoBlanco, rutas: ["/images/logos/icono-blanco.png"], ancho: 160, formato: "png" },
    { clave: CLAVE.escena("portada"), rutas: [imagenPropuesta(escenario, "portada"), arte(principal)], ancho: 1500, formato: "jpg" },
    { clave: CLAVE.escena("campo"), rutas: [imagenPropuesta(escenario, "campo"), arte("operacion-en-campo")], ancho: 1100, formato: "jpg" },
    { clave: CLAVE.escena("central"), rutas: [imagenPropuesta(escenario, "central"), arte("centro-de-operaciones")], ancho: 1100, formato: "jpg" },
  ];
  for (const { capturas } of capturasDe(p)) {
    for (const c of capturas) pedidos.push({ clave: CLAVE.captura(c.src), rutas: [c.src], ancho: 1100, formato: "jpg" });
  }
  for (const { a, poster } of analiticasDe(p)) {
    pedidos.push({ clave: CLAVE.analitica(a.id), rutas: [poster], ancho: 760, formato: "jpg" });
  }
  return pedidos;
}

/** Valida una captura 3D recibida como dataURL (png/jpeg/webp en base64). */
export const DATAURL_IMAGEN = /^data:image\/(png|jpeg|jpg|webp);base64,[A-Za-z0-9+/]+={0,2}$/;
