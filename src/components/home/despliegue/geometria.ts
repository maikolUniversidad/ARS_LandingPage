import type { FlujoId, SitioId } from "./datos";

export interface Caja {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Lineas {
  titulo: number;
  sub: number;
  pieza: number;
  nota: number;
}

export interface Disposicion {
  compacta: boolean;
  ancho: number;
  alto: number;
  cajas: Record<SitioId, Caja>;
  piezas: {
    consola: Caja[];
    dc: Caja[];
    nube: Caja[];
    sede: Caja[];
  };
  /** Línea base (y) del título, subtítulo y nota de cada lugar. */
  textos: Record<SitioId, { titulo: number; sub: number; nota?: number }>;
  /** Trazos en el sentido en que viaja la información. */
  flujos: Record<FlujoId, string>;
  fuente: Lineas;
  icono: number;
  insignia: { w: number; h: number };
}

/** Escritorio y tableta: sede a la izquierda, consola arriba, nubes a la derecha. */
export const ANCHA: Disposicion = {
  compacta: false,
  ancho: 960,
  alto: 560,
  cajas: {
    consola: { x: 330, y: 16, w: 300, h: 118 },
    sede: { x: 28, y: 180, w: 292, h: 364 },
    onprem: { x: 44, y: 400, w: 260, h: 128 },
    dc: { x: 640, y: 180, w: 300, h: 170 },
    nube: { x: 640, y: 380, w: 300, h: 164 },
  },
  piezas: {
    consola: [0, 1, 2, 3].map((i) => ({ x: 339 + i * 72, y: 76, w: 66, h: 46 })),
    dc: [
      { x: 656, y: 234, w: 268, h: 34 },
      { x: 656, y: 274, w: 268, h: 34 },
    ],
    nube: [{ x: 656, y: 440, w: 268, h: 34 }],
    sede: [
      { x: 44, y: 230, w: 126, h: 58 },
      { x: 178, y: 230, w: 126, h: 58 },
      { x: 44, y: 298, w: 126, h: 58 },
      { x: 178, y: 298, w: 126, h: 58 },
    ],
  },
  textos: {
    consola: { titulo: 42, sub: 60 },
    sede: { titulo: 206, sub: 221 },
    onprem: { titulo: 428, sub: 445, nota: 468 },
    dc: { titulo: 206, sub: 221 },
    nube: { titulo: 406, sub: 421, nota: 494 },
  },
  flujos: {
    "f-sede-dc": "M320 280 C 470 280 500 262 640 262",
    "f-sede-nube": "M320 330 C 470 330 500 500 640 500",
    "f-sede-onprem": "M174 356 L174 400",
    "f-dc-nube": "M770 350 L770 380",
    "f-nube-dc": "M810 380 L810 350",
    "c-dc": "M790 180 C 790 110 720 75 630 75",
    "c-nube": "M640 420 C 596 420 600 250 600 134",
    "c-onprem": "M44 470 L14 470 L14 160 C 14 92 200 75 330 75",
  },
  fuente: { titulo: 13, sub: 9.5, pieza: 10, nota: 9 },
  icono: 15,
  insignia: { w: 46, h: 16 },
};

/** Móvil (≥ 360 px): consola arriba, nubes en dos columnas y la sede abajo. */
export const COMPACTA: Disposicion = {
  compacta: true,
  ancho: 360,
  alto: 716,
  cajas: {
    consola: { x: 12, y: 10, w: 336, h: 116 },
    dc: { x: 12, y: 170, w: 150, h: 156 },
    nube: { x: 198, y: 170, w: 150, h: 156 },
    sede: { x: 12, y: 380, w: 336, h: 326 },
    onprem: { x: 24, y: 584, w: 312, h: 110 },
  },
  piezas: {
    consola: [0, 1, 2, 3].map((i) => ({ x: 19 + i * 82, y: 62, w: 76, h: 52 })),
    dc: [
      { x: 22, y: 218, w: 130, h: 30 },
      { x: 22, y: 254, w: 130, h: 30 },
    ],
    nube: [{ x: 208, y: 238, w: 130, h: 30 }],
    sede: [
      { x: 24, y: 432, w: 150, h: 52 },
      { x: 186, y: 432, w: 150, h: 52 },
      { x: 24, y: 492, w: 150, h: 52 },
      { x: 186, y: 492, w: 150, h: 52 },
    ],
  },
  textos: {
    consola: { titulo: 32, sub: 47 },
    dc: { titulo: 192, sub: 206 },
    nube: { titulo: 192, sub: 206, nota: 284 },
    sede: { titulo: 404, sub: 419 },
    onprem: { titulo: 608, sub: 623, nota: 642 },
  },
  flujos: {
    "f-sede-dc": "M87 380 L87 326",
    "f-sede-nube": "M273 380 L273 326",
    "f-sede-onprem": "M180 544 L180 584",
    "f-dc-nube": "M162 232 L198 232",
    "f-nube-dc": "M198 262 L162 262",
    "c-dc": "M87 170 L87 126",
    "c-nube": "M273 170 L273 126",
    "c-onprem": "M24 650 L6 650 L6 68 L12 68",
  },
  fuente: { titulo: 10.5, sub: 8.5, pieza: 9.5, nota: 8.5 },
  icono: 14,
  insignia: { w: 40, h: 15 },
};
