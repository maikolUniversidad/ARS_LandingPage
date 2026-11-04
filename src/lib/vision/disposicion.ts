/**
 * Convierte un `PlanVision` (zonas, cámaras y analíticas) en una `EscenaPlan`
 * en metros: dónde va cada zona en el piso y dónde va cada cámara, a qué
 * altura y hacia dónde mira. Es determinista: el mismo plan da la misma
 * maqueta. La IA nunca da coordenadas; solo decide qué zonas y qué cámaras.
 */
import { analiticas } from "@/data/analiticas";
import type { CamaraEscena, EscenaPlan, PlanVision, Tamano, TipoZona, Vec3, ZonaEscena, ZonaPlan } from "./plan";

/** Ancho (x) × fondo (z) base de cada tipo de zona, en metros. */
const MEDIDA: Record<TipoZona, [number, number]> = {
  acceso: [7, 4.5],
  recepcion: [7, 5],
  cajas: [9, 5],
  ventas: [13, 9],
  comedor: [10, 7],
  oficina: [10, 7],
  pasillo: [11, 3.6],
  produccion: [13, 9],
  bodega: [13, 9],
  parqueadero: [17, 11],
  perimetro: [20, 5],
};
const ESCALA: Record<Tamano, number> = { pequena: 0.82, mediana: 1, grande: 1.28 };
const EXTERIOR: ReadonlySet<TipoZona> = new Set(["parqueadero", "perimetro"]);
/** Orden de adelante (calle) hacia atrás dentro del edificio. */
const ORDEN: TipoZona[] = ["acceso", "recepcion", "cajas", "ventas", "comedor", "oficina", "pasillo", "produccion", "bodega"];

export const COLOR_FAMILIA: Record<string, number> = {
  comercial: 0xd6ab4c,
  operativo: 0x3b82f6,
  prevencion: 0xe5484d,
  lite: 0x30a46c,
};

const r1 = (n: number) => Math.round(n * 100) / 100;

type Caja = { zona: ZonaPlan; w: number; d: number };

function medida(z: ZonaPlan): Caja {
  const [w, d] = MEDIDA[z.tipo];
  const k = ESCALA[z.tamano];
  return { zona: z, w: r1(w * k), d: r1(d * k) };
}

/** Empaca cajas en filas de ancho máximo `maxW`; todas las filas quedan del mismo ancho (edificio rectangular). */
function filas(cajas: Caja[], maxW: number): Caja[][] {
  const out: Caja[][] = [];
  let fila: Caja[] = [];
  let ancho = 0;
  for (const c of cajas) {
    if (fila.length && (ancho + c.w > maxW || fila.length >= 3)) {
      out.push(fila);
      fila = [];
      ancho = 0;
    }
    fila.push(c);
    ancho += c.w;
  }
  if (fila.length) out.push(fila);
  return out;
}

export function escenaDesdePlan(plan: PlanVision): EscenaPlan {
  const interiores = plan.zonas
    .filter((z) => !EXTERIOR.has(z.tipo))
    .map(medida)
    .sort((a, b) => ORDEN.indexOf(a.zona.tipo) - ORDEN.indexOf(b.zona.tipo));
  const exteriores = plan.zonas.filter((z) => EXTERIOR.has(z.tipo)).map(medida);

  const area = interiores.reduce((s, c) => s + c.w * c.d, 0);
  const maxW = Math.max(18, Math.min(32, Math.sqrt(area) * 1.35), ...interiores.map((c) => c.w));
  const filasEd = filas(interiores, maxW);
  const anchoEd = Math.max(0, ...filasEd.map((f) => f.reduce((s, c) => s + c.w, 0)));

  const zonas: ZonaEscena[] = [];
  // Edificio: la fila 0 (acceso) va al frente (+z); las siguientes hacia atrás (−z).
  const fondoEd = filasEd.reduce((s, f) => s + Math.max(...f.map((c) => c.d)), 0);
  let zFrente = fondoEd / 2;
  filasEd.forEach((f) => {
    const dFila = Math.max(...f.map((c) => c.d));
    const sumW = f.reduce((s, c) => s + c.w, 0);
    const k = anchoEd / sumW; // estira la fila para que el edificio sea un rectángulo
    let x = -anchoEd / 2;
    f.forEach((c) => {
      const w = r1(c.w * k);
      zonas.push({ ...c.zona, x: r1(x + w / 2), z: r1(zFrente - dFila / 2), w, d: r1(dFila), puerta: "s", exterior: false });
      x += w;
    });
    zFrente -= dFila;
  });

  // Exterior: delante del edificio (calle), en una fila centrada.
  if (exteriores.length) {
    const sumW = exteriores.reduce((s, c) => s + c.w + 1, -1);
    let x = -sumW / 2;
    const z0 = fondoEd / 2 + 1.5;
    exteriores.forEach((c) => {
      zonas.push({ ...c.zona, x: r1(x + c.w / 2), z: r1(z0 + c.d / 2), w: c.w, d: c.d, puerta: "n", exterior: true });
      x += c.w + 1;
    });
  }

  // Centra todo en el origen.
  const minX = Math.min(...zonas.map((z) => z.x - z.w / 2));
  const maxX = Math.max(...zonas.map((z) => z.x + z.w / 2));
  const minZ = Math.min(...zonas.map((z) => z.z - z.d / 2));
  const maxZ = Math.max(...zonas.map((z) => z.z + z.d / 2));
  const cx = (minX + maxX) / 2;
  const cz = (minZ + maxZ) / 2;
  zonas.forEach((z) => {
    z.x = r1(z.x - cx);
    z.z = r1(z.z - cz);
  });

  const porZona = new Map(zonas.map((z) => [z.id, z]));
  const familiaDe = new Map(analiticas.map((a) => [a.id, a.familia]));
  const nombres: Record<string, string> = {};
  for (const a of analiticas) nombres[a.id] = a.nombre;

  // Cámaras: se reparten por zona en esquinas opuestas; el acceso mira la puerta de frente.
  const usadas = new Map<string, number>();
  const camaras: CamaraEscena[] = [];
  plan.camaras.forEach((c, i) => {
    const z = porZona.get(c.zona);
    if (!z) return;
    const n = usadas.get(z.id) ?? 0;
    usadas.set(z.id, n + 1);
    const { pos, mira, fov } = ubicar(z, n, c.analiticas[0] ?? "");
    const diag = Math.hypot(z.w, z.d);
    camaras.push({
      ...c,
      etiqueta: `CAM ${String(i + 1).padStart(2, "0")}`,
      pos,
      mira,
      fov,
      alcance: r1(Math.min(z.exterior ? 22 : 16, Math.max(6, diag * 0.95))),
      color: COLOR_FAMILIA[familiaDe.get(c.analiticas[0] ?? "") ?? "operativo"] ?? 0x3b82f6,
    });
  });

  return {
    version: 1,
    piso: { w: r1(maxX - minX + 10), d: r1(maxZ - minZ + 10) },
    zonas,
    camaras,
    nombres,
  };
}

/** Posición, punto de mira y apertura de la n-ésima cámara de una zona. */
function ubicar(z: ZonaEscena, n: number, principal: string): { pos: Vec3; mira: Vec3; fov: number } {
  const alto = z.exterior ? 4.6 : 2.75;
  const m = z.exterior ? 0.3 : 0.45; // separación de los muros
  const x0 = z.x - z.w / 2 + m;
  const x1 = z.x + z.w / 2 - m;
  const zN = z.z - z.d / 2 + m; // fondo (−z)
  const zS = z.z + z.d / 2 - m; // frente (+z), donde está la puerta

  // Acceso / recepción y analíticas de puerta: la primera cámara mira la puerta de frente (rostros, conteo, listas).
  const dePuerta = ["conteo", "aforo", "blancas", "negras", "rostro", "apertura", "cierre", "armas", "cruce", "demografia"].includes(principal);
  if (n === 0 && (z.tipo === "acceso" || z.tipo === "recepcion" || (dePuerta && !z.exterior))) {
    return { pos: [r1(z.x), alto, r1(zN)], mira: [r1(z.x), 0.9, r1(z.z + z.d / 2)], fov: 68 };
  }
  if (z.tipo === "pasillo") {
    const izq = n % 2 === 0;
    return {
      pos: [r1(izq ? x0 : x1), alto, r1(z.z)],
      mira: [r1(izq ? x1 : x0), 0.4, r1(z.z)],
      fov: 58,
    };
  }
  // Esquinas en orden: fondo-izq, frente-der, fondo-der, frente-izq; miran al centro corrido hacia la esquina opuesta.
  const esquinas: [number, number][] = [
    [x0, zN],
    [x1, zS],
    [x1, zN],
    [x0, zS],
  ];
  const [px, pz] = esquinas[n % 4];
  const mx = z.x + (z.x - px) * 0.25;
  const mz = z.z + (z.z - pz) * 0.25;
  return { pos: [r1(px), alto, r1(pz)], mira: [r1(mx), 0.5, r1(mz)], fov: z.exterior ? 62 : 74 };
}
