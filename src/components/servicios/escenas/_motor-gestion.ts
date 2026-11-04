/**
 * Motor compartido de las escenas de gestión (humana, formacion, finanzas,
 * productividad, gobierno). Implementa el contrato (`contrato.ts`) una sola vez:
 *
 *  - renderer + niebla + suelo con grilla + polvo ambiental (lenguaje del home 3D)
 *  - OrbitControls con damping, sin zoom con rueda (la página sigue haciendo scroll),
 *    pinza sí; balanceo idle suave alrededor del encuadre
 *  - setFoco: vuelo de cámara de 1.2 s (easing, interrumpible arrastrando) y resaltado
 *    automático: los materiales de la viñeta con foco brillan (tinte de acento) y el
 *    resto se atenúa
 *  - hotspots clicables por clave (raycast en pointerup sin arrastre), cursor al pasar
 *  - lowPower / reducedMotion, pausa fuera de pantalla, dispose completo
 *
 * Cada escena solo construye su geometría y anima con `update(t)`.
 * Convención: las opacidades animadas se escriben con `op(mat, v)` (no `mat.opacity`)
 * para que el motor pueda multiplicarlas por la presencia de la viñeta.
 */
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type { FabricaEscena, InstanciaEscena, OpcionesEscena } from "./contrato";

// ───────────────────────── Paleta y utilidades ─────────────────────────

export const PAL = {
  fondo: 0x020a18,
  imperial: 0x142664,
  french: 0x1d3885,
  indigo: 0x2348d4,
  steel: 0x9eb0c0,
  bright: 0x6b8aff,
  ice: 0xd5e0ff,
  cyan: 0x5fd8ff,
  verde: 0x35e0a1,
  ambar: 0xffb547,
  rojo: 0xff3b5c,
} as const;

export const v3 = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
export const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
export const smooth = (x: number) => {
  const c = clamp01(x);
  return c * c * (3 - 2 * c);
};
/** 0 antes de a, 1 después de b, suave en medio. */
export const ramp = (x: number, a: number, b: number) => smooth((x - a) / (b - a));
/** Fase 0..1 de un ciclo de `periodo` segundos. */
export const fase = (t: number, periodo: number, desfase = 0) => ((((t + desfase) / periodo) % 1) + 1) % 1;
/** Sube en [a,b], se mantiene, baja en [c,d]. */
export const ventana = (x: number, a: number, b: number, c: number, d: number) => ramp(x, a, b) * (1 - ramp(x, c, d));
export const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

export function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Escribe una opacidad animada (el motor la multiplica por la presencia de la viñeta). */
export function op(mat: THREE.Material | THREE.Material[], valor: number) {
  if (Array.isArray(mat)) mat.forEach((m) => (m.userData.op = valor));
  else mat.userData.op = valor;
}

export type Encuadre = { pos: THREE.Vector3; target: THREE.Vector3 };

/**
 * Encuadre frontal de una viñeta colocada en `centro` y girada `angulo` (su +z local
 * apunta hacia afuera): la cámara se aleja `dist` por esa dirección y sube `alto`.
 */
export function frente(centro: THREE.Vector3, angulo: number, dist: number, alto: number, mirarY = 1.5): Encuadre {
  const dir = v3(Math.sin(angulo), 0, Math.cos(angulo));
  const target = centro.clone().add(v3(0, mirarY, 0));
  const pos = centro.clone().addScaledVector(dir, dist).add(v3(0, alto, 0));
  return { pos, target };
}

/** Posición y ángulo del i-ésimo punto de un anillo (ángulo 0 = +z, hacia la cámara general). */
export function anillo(i: number, n: number, radio: number, desfase = 0, arco = Math.PI * 2) {
  const angulo = desfase + (arco === Math.PI * 2 ? (i / n) * arco : n === 1 ? 0 : -arco / 2 + (i / (n - 1)) * arco);
  return { pos: v3(Math.sin(angulo) * radio, 0, Math.cos(angulo) * radio), angulo };
}

// ───────────────────────── Texturas utilitarias ─────────────────────────

function texturaCanvas(size: number, dibujar: (ctx: CanvasRenderingContext2D, s: number) => void) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx) dibujar(ctx, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.flipY = false;
  return tex;
}

const glowTexture = () =>
  texturaCanvas(64, (ctx, s) => {
    const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.25, "rgba(255,255,255,0.55)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, s, s);
  });

const ringTexture = () =>
  texturaCanvas(128, (ctx, s) => {
    ctx.strokeStyle = "rgba(255,255,255,1)";
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(s / 2, s / 2, s / 2 - 10, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.arc(s / 2, s / 2, s / 2 - 26, 0, Math.PI * 2);
    ctx.stroke();
  });

// ───────────────────────── Geometrías utilitarias ─────────────────────────

/** Contorno de rectángulo redondeado (centrado), cerrado. */
export function puntosRect(w: number, h: number, r: number, seg = 4): THREE.Vector3[] {
  const pts: THREE.Vector3[] = [];
  const rr = Math.min(r, w / 2, h / 2);
  const esquinas: Array<[number, number, number]> = [
    [w / 2 - rr, h / 2 - rr, 0],
    [-w / 2 + rr, h / 2 - rr, Math.PI / 2],
    [-w / 2 + rr, -h / 2 + rr, Math.PI],
    [w / 2 - rr, -h / 2 + rr, (Math.PI * 3) / 2],
  ];
  for (const [cx, cy, a0] of esquinas) {
    for (let i = 0; i <= seg; i++) {
      const a = a0 + (i / seg) * (Math.PI / 2);
      pts.push(v3(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, 0));
    }
  }
  pts.push(pts[0].clone());
  return pts;
}

export function formaRect(w: number, h: number, r: number) {
  const s = new THREE.Shape();
  const rr = Math.min(r, w / 2, h / 2);
  s.moveTo(-w / 2 + rr, -h / 2);
  s.lineTo(w / 2 - rr, -h / 2);
  s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + rr);
  s.lineTo(w / 2, h / 2 - rr);
  s.quadraticCurveTo(w / 2, h / 2, w / 2 - rr, h / 2);
  s.lineTo(-w / 2 + rr, h / 2);
  s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - rr);
  s.lineTo(-w / 2, -h / 2 + rr);
  s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + rr, -h / 2);
  return s;
}

/** Varios rectángulos (x, y, w, h — esquina inferior izquierda) en una sola geometría plana. */
export function geoBarras(rects: Array<[number, number, number, number]>, z = 0) {
  const pos = new Float32Array(rects.length * 12);
  const idx: number[] = [];
  rects.forEach(([x, y, w, h], i) => {
    pos.set([x, y, z, x + w, y, z, x + w, y + h, z, x, y + h, z], i * 12);
    const b = i * 4;
    idx.push(b, b + 1, b + 2, b, b + 2, b + 3);
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setIndex(idx);
  return g;
}

/** Segmentos sueltos [a,b] en una sola geometría de líneas. */
export function geoSegmentos(pares: Array<[THREE.Vector3, THREE.Vector3]>) {
  const pts: THREE.Vector3[] = [];
  for (const [a, b] of pares) pts.push(a, b);
  return new THREE.BufferGeometry().setFromPoints(pts);
}

/** Arco (en el plano XY) como puntos. */
export function puntosArco(r: number, a0: number, a1: number, seg = 48, z = 0) {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= seg; i++) {
    const a = a0 + ((a1 - a0) * i) / seg;
    pts.push(v3(Math.cos(a) * r, Math.sin(a) * r, z));
  }
  return pts;
}

function pintar(g: THREE.BufferGeometry, c: [number, number, number]) {
  const n = g.attributes.position.count;
  const arr = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) arr.set(c, i * 3);
  g.setAttribute("color", new THREE.BufferAttribute(arr, 3));
  return g;
}

/**
 * Tarjeta/documento en una sola geometría con colores por vértice (fondo, avatar
 * opcional y renglones). Pensada para InstancedMesh con `vertexColors`.
 */
export function geoTarjeta(w: number, h: number, avatar = true): THREE.BufferGeometry {
  const partes: THREE.BufferGeometry[] = [pintar(new THREE.PlaneGeometry(w, h), [0.1, 0.17, 0.42])];
  const capa = (g: THREE.BufferGeometry, x: number, y: number, c: [number, number, number]) => {
    g.translate(x, y, 0.004);
    partes.push(pintar(g, c));
  };
  if (avatar) {
    capa(new THREE.CircleGeometry(h * 0.17, 16), -w * 0.27, h * 0.16, [0.85, 0.9, 1]);
    capa(new THREE.PlaneGeometry(w * 0.4, h * 0.08), w * 0.14, h * 0.24, [0.75, 0.82, 1]);
    capa(new THREE.PlaneGeometry(w * 0.3, h * 0.06), w * 0.09, h * 0.08, [0.45, 0.55, 0.9]);
  } else {
    capa(new THREE.PlaneGeometry(w * 0.6, h * 0.07), -w * 0.1, h * 0.32, [0.85, 0.9, 1]);
    capa(new THREE.PlaneGeometry(w * 0.7, h * 0.04), 0, h * 0.14, [0.45, 0.55, 0.9]);
    capa(new THREE.PlaneGeometry(w * 0.7, h * 0.04), 0, h * 0.02, [0.45, 0.55, 0.9]);
  }
  capa(new THREE.PlaneGeometry(w * 0.7, h * 0.04), 0, -h * 0.12, [0.45, 0.55, 0.9]);
  capa(new THREE.PlaneGeometry(w * 0.5, h * 0.04), -w * 0.1, -h * 0.26, [0.45, 0.55, 0.9]);
  const g = mergeGeometries(partes) ?? new THREE.PlaneGeometry(w, h);
  partes.forEach((p) => p.dispose());
  return g;
}

/** Persona esquemática (cabeza + torso) con un material. */
export function persona(mat: THREE.Material, escala = 1) {
  const g = new THREE.Group();
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.32 * escala, 0.7 * escala, 4, 12), mat);
  torso.position.y = 0.75 * escala;
  const cabeza = new THREE.Mesh(new THREE.SphereGeometry(0.22 * escala, 16, 12), mat);
  cabeza.position.y = 1.62 * escala;
  g.add(torso, cabeza);
  return g;
}

// ───────────────────────── Kit para construir escenas ─────────────────────────

type OpcMat = { aditivo?: boolean; tint?: boolean; doble?: boolean; depthTest?: boolean };

export type Panel = {
  grupo: THREE.Group;
  relleno: THREE.MeshBasicMaterial;
  borde: THREE.LineBasicMaterial;
};

export type Flujo = {
  puntos: THREE.Points;
  mat: THREE.PointsMaterial;
  update(t: number, intensidad: number): void;
};

export type Kit = {
  readonly scene: THREE.Scene;
  readonly acento: THREE.Color;
  readonly lowPower: boolean;
  readonly reducedMotion: boolean;
  readonly glow: THREE.Texture;
  /** Peso de resaltado 0..1 de una clave (sube cuando tiene foco). */
  peso(clave: string): number;
  /** Peso de "hay algún foco" 0..1. */
  hayFoco(): number;
  /** Malla básica transparente; `tint` = se tiñe con el acento al resaltar. */
  mb(color: THREE.ColorRepresentation, opacidad: number, o?: OpcMat): THREE.MeshBasicMaterial;
  ml(color: THREE.ColorRepresentation, opacidad: number, o?: OpcMat): THREE.LineBasicMaterial;
  mld(color: THREE.ColorRepresentation, opacidad: number, dash: number, gap: number, o?: OpcMat): THREE.LineDashedMaterial;
  sprite(color: THREE.ColorRepresentation, escala: number, opacidad?: number): THREE.Sprite;
  /** Etiqueta de texto (usar con moderación: una textura por etiqueta). */
  texto(txt: string, alto: number, color?: string, peso?: number): THREE.Sprite;
  /** Marca un grupo como viñeta de una clave (resaltado/atenuado automático). */
  vineta(clave: string, grupo: THREE.Object3D): void;
  /** Hotspot clicable de una clave, en coordenadas locales de `padre` (o del mundo). */
  hotspot(clave: string, pos: THREE.Vector3, padre?: THREE.Object3D, radio?: number): void;
  /** Hace clicable un objeto existente para una clave. */
  pick(clave: string, obj: THREE.Object3D): void;
  linea<M extends THREE.LineBasicMaterial | THREE.LineDashedMaterial>(pts: THREE.Vector3[], mat: M): THREE.Line<THREE.BufferGeometry, M>;
  panel(w: number, h: number, o?: { radio?: number; relleno?: number; colorRelleno?: THREE.ColorRepresentation; colorBorde?: THREE.ColorRepresentation; opBorde?: number; tint?: boolean }): Panel;
  caja(w: number, h: number, d: number, colorRelleno: THREE.ColorRepresentation, opRelleno: number, colorBorde: THREE.ColorRepresentation, opBorde: number, tint?: boolean): THREE.Group;
  flujo(curva: THREE.Curve<THREE.Vector3>, n: number, color: THREE.ColorRepresentation, tam: number, vel?: number): Flujo;
};

export type Construida = {
  encuadres: Record<string, Encuadre>;
  general: Encuadre;
  /** t = segundos desde el inicio (congelado con reducedMotion), dt = delta. */
  update(t: number, dt: number): void;
};

export type ConfigEscena = {
  niebla?: number;
  suelo?: { radio: number; y?: number; alcance?: number };
  polvo?: { radio: number; alto: number };
  /** Instante representativo para el modo sin movimiento. */
  tiempoQuieto?: number;
  /** Rango de distancias permitido a OrbitControls. */
  distancia?: [number, number];
};

const SUELO_VERT = /* glsl */ `
  varying vec3 vWorld;
  void main() {
    vec4 w = modelMatrix * vec4(position, 1.0);
    vWorld = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;
const SUELO_FRAG = /* glsl */ `
  uniform vec3 uBase;
  uniform vec3 uLine;
  uniform vec3 uMajor;
  uniform vec3 uAcento;
  uniform float uReach;
  uniform float uTime;
  uniform vec3 uFondo;
  uniform float uRadio;
  varying vec3 vWorld;
  float gridLine(vec2 p, float s) {
    vec2 q = p / s;
    vec2 g = abs(fract(q - 0.5) - 0.5) / fwidth(q);
    return 1.0 - min(min(g.x, g.y), 1.0);
  }
  void main() {
    vec2 p = vWorld.xz;
    float d = length(p);
    float fade = exp(-d * uReach);
    vec3 col = uBase;
    col += uLine * gridLine(p, 1.0) * 0.22 * fade;
    col += uMajor * gridLine(p, 5.0) * 0.6 * fade;
    float onda = pow(0.5 + 0.5 * sin(d * 0.6 - uTime * 1.2), 14.0);
    col += uAcento * onda * fade * 0.12;
    col = mix(col, uFondo, smoothstep(uRadio * 0.25, uRadio * 0.9, d));
    gl_FragColor = vec4(col, 1.0);
  }
`;

type EntradaMat = {
  mat: THREE.Material & { opacity: number; color?: THREE.Color };
  base: number;
  clave: string | null;
  tint: boolean;
  colorBase: THREE.Color | null;
};

type Hotspot = {
  clave: string;
  grupo: THREE.Group;
  anillo: THREE.Sprite;
  nucleo: THREE.Sprite;
  escala: number;
  hover: number;
};

/**
 * Crea una fábrica de escena a partir de una función de construcción.
 */
export function crearEscena(construir: (kit: Kit) => Construida, config: ConfigEscena = {}): FabricaEscena {
  return (opciones: OpcionesEscena): InstanciaEscena => motor(opciones, construir, config);
}

function motor(opciones: OpcionesEscena, construir: (kit: Kit) => Construida, config: ConfigEscena): InstanciaEscena {
  const { canvas, lowPower, reducedMotion } = opciones;
  const acento = new THREE.Color(opciones.acento);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !lowPower, alpha: false, powerPreference: "high-performance" });
  const maxDpr = Math.min(window.devicePixelRatio || 1, lowPower ? 1.5 : 2);
  let dpr = maxDpr;
  renderer.setPixelRatio(dpr);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(PAL.fondo, 1);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(PAL.fondo);
  scene.fog = new THREE.FogExp2(PAL.fondo, config.niebla ?? 0.018);
  const camera = new THREE.PerspectiveCamera(42, 1, 0.2, 400);

  const glow = glowTexture();
  const ringTex = ringTexture();
  const texturas: THREE.Texture[] = [];

  // ── Pesos de foco ──
  const pesos = new Map<string, number>();
  let foco: string | null = null;
  let pesoFoco = 0;

  const materiales: EntradaMat[] = [];
  const hotspots: Hotspot[] = [];
  const pickables: THREE.Object3D[] = [];

  const registrar = <M extends THREE.Material & { opacity: number }>(mat: M, base: number, tint: boolean): M => {
    mat.userData.base = base;
    mat.userData.tint = tint;
    return mat;
  };

  const kit: Kit = {
    scene,
    acento,
    lowPower,
    reducedMotion,
    glow,
    peso: (clave) => pesos.get(clave) ?? 0,
    hayFoco: () => pesoFoco,
    mb(color, opacidad, o = {}) {
      return registrar(
        new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity: opacidad,
          depthWrite: false,
          depthTest: o.depthTest ?? true,
          side: o.doble === false ? THREE.FrontSide : THREE.DoubleSide,
          blending: o.aditivo ? THREE.AdditiveBlending : THREE.NormalBlending,
        }),
        opacidad,
        o.tint ?? false,
      );
    },
    ml(color, opacidad, o = {}) {
      return registrar(
        new THREE.LineBasicMaterial({
          color,
          transparent: true,
          opacity: opacidad,
          depthWrite: false,
          depthTest: o.depthTest ?? true,
          blending: o.aditivo ? THREE.AdditiveBlending : THREE.NormalBlending,
        }),
        opacidad,
        o.tint ?? true,
      );
    },
    mld(color, opacidad, dash, gap, o = {}) {
      return registrar(
        new THREE.LineDashedMaterial({ color, transparent: true, opacity: opacidad, dashSize: dash, gapSize: gap, depthWrite: false }),
        opacidad,
        o.tint ?? true,
      );
    },
    sprite(color, escala, opacidad = 1) {
      const s = new THREE.Sprite(
        registrar(
          new THREE.SpriteMaterial({ map: glow, color, transparent: true, opacity: opacidad, depthWrite: false, blending: THREE.AdditiveBlending }),
          opacidad,
          false,
        ),
      );
      s.scale.setScalar(escala);
      return s;
    },
    texto(txt, alto, color = "#d5e0ff", pesoFuente = 600) {
      const px = 44;
      const medir = document.createElement("canvas").getContext("2d");
      const fuente = `${pesoFuente} ${px}px Inter, "Segoe UI", system-ui, sans-serif`;
      let ancho = txt.length * px * 0.6;
      if (medir) {
        medir.font = fuente;
        ancho = medir.measureText(txt).width;
      }
      const c = document.createElement("canvas");
      c.width = Math.ceil(ancho + px * 0.8);
      c.height = Math.ceil(px * 1.5);
      const ctx = c.getContext("2d");
      if (ctx) {
        ctx.font = fuente;
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        ctx.shadowColor = "rgba(35,72,212,0.9)";
        ctx.shadowBlur = 10;
        ctx.fillStyle = color;
        ctx.fillText(txt, c.width / 2, c.height / 2);
      }
      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearFilter;
      tex.generateMipmaps = false;
      texturas.push(tex);
      const s = new THREE.Sprite(registrar(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }), 1, false));
      s.scale.set((alto * c.width) / c.height, alto, 1);
      return s;
    },
    vineta(clave, grupo) {
      grupo.userData.clave = clave;
    },
    hotspot(clave, pos, padre, radio = 0.9) {
      const grupo = new THREE.Group();
      grupo.position.copy(pos);
      grupo.userData.clave = clave;
      grupo.userData.hotspot = true;
      const anilloMat = new THREE.SpriteMaterial({ map: ringTex, color: acento, transparent: true, opacity: 0.7, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending });
      const anilloS = new THREE.Sprite(anilloMat);
      anilloS.scale.setScalar(radio * 1.6);
      anilloS.renderOrder = 10;
      const nucleoMat = new THREE.SpriteMaterial({ map: glow, color: acento, transparent: true, opacity: 0.9, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending });
      const nucleo = new THREE.Sprite(nucleoMat);
      nucleo.scale.setScalar(radio * 0.9);
      nucleo.renderOrder = 10;
      const esfera = new THREE.Mesh(new THREE.SphereGeometry(radio, 10, 8), new THREE.MeshBasicMaterial());
      esfera.visible = false;
      esfera.userData.clave = clave;
      grupo.add(anilloS, nucleo, esfera);
      (padre ?? scene).add(grupo);
      pickables.push(esfera);
      hotspots.push({ clave, grupo, anillo: anilloS, nucleo, escala: radio * 1.6, hover: 0 });
    },
    pick(clave, obj) {
      obj.userData.clave = clave;
      pickables.push(obj);
    },
    linea<M extends THREE.LineBasicMaterial | THREE.LineDashedMaterial>(pts: THREE.Vector3[], mat: M) {
      const l = new THREE.Line<THREE.BufferGeometry, M>(new THREE.BufferGeometry().setFromPoints(pts), mat);
      if (mat instanceof THREE.LineDashedMaterial) l.computeLineDistances();
      return l;
    },
    panel(w, h, o = {}) {
      const grupo = new THREE.Group();
      const relleno = kit.mb(o.colorRelleno ?? PAL.imperial, o.relleno ?? 0.45);
      const borde = kit.ml(o.colorBorde ?? PAL.bright, o.opBorde ?? 0.9, { tint: o.tint ?? true });
      const r = o.radio ?? Math.min(w, h) * 0.08;
      const fill = new THREE.Mesh(new THREE.ShapeGeometry(formaRect(w, h, r), 3), relleno);
      const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(puntosRect(w, h, r)), borde);
      grupo.add(fill, line);
      return { grupo, relleno, borde };
    },
    caja(w, h, d, colorRelleno, opRelleno, colorBorde, opBorde, tint = true) {
      const g = new THREE.Group();
      const geo = new THREE.BoxGeometry(w, h, d);
      g.add(new THREE.Mesh(geo, kit.mb(colorRelleno, opRelleno, { doble: false })));
      g.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo), kit.ml(colorBorde, opBorde, { tint })));
      return g;
    },
    flujo(curva, n, color, tam, vel = 0.25) {
      const pos = new Float32Array(n * 3);
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      const mat = registrar(
        new THREE.PointsMaterial({ color, size: tam, map: glow, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true }),
        1,
        false,
      );
      const puntos = new THREE.Points(geo, mat);
      puntos.frustumCulled = false;
      const tmp = new THREE.Vector3();
      return {
        puntos,
        mat,
        update(t, intensidad) {
          puntos.visible = intensidad > 0.01;
          op(mat, intensidad);
          if (!puntos.visible) return;
          for (let i = 0; i < n; i++) {
            const u = (((t * vel + i / n) % 1) + 1) % 1;
            curva.getPoint(u, tmp);
            pos[i * 3] = tmp.x;
            pos[i * 3 + 1] = tmp.y;
            pos[i * 3 + 2] = tmp.z;
          }
          (geo.attributes.position as THREE.BufferAttribute).needsUpdate = true;
        },
      };
    },
  };

  // ── Suelo y polvo ──
  let sueloUniforms: Record<string, THREE.IUniform> | null = null;
  if (config.suelo) {
    sueloUniforms = {
      uBase: { value: new THREE.Color(0x030c1e) },
      uLine: { value: new THREE.Color(PAL.french) },
      uMajor: { value: new THREE.Color(PAL.indigo) },
      uAcento: { value: acento.clone() },
      uReach: { value: config.suelo.alcance ?? 0.045 },
      uTime: { value: 0 },
      // El shader escribe sin conversión de espacio de color: el fondo va en componentes sRGB crudas.
      uFondo: { value: new THREE.Color().setHex(PAL.fondo, THREE.LinearSRGBColorSpace) },
      uRadio: { value: config.suelo.radio },
    };
    const suelo = new THREE.Mesh(
      new THREE.CircleGeometry(config.suelo.radio, 64),
      new THREE.ShaderMaterial({ vertexShader: SUELO_VERT, fragmentShader: SUELO_FRAG, uniforms: sueloUniforms }),
    );
    suelo.rotation.x = -Math.PI / 2;
    suelo.position.y = config.suelo.y ?? 0;
    scene.add(suelo);
  }
  let polvo: THREE.Points | null = null;
  if (config.polvo) {
    const rand = mulberry32(11);
    const n = lowPower ? 140 : 420;
    const p = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const a = rand() * Math.PI * 2;
      const r = Math.sqrt(rand()) * config.polvo.radio;
      p[i * 3] = Math.cos(a) * r;
      p[i * 3 + 1] = rand() * config.polvo.alto + 0.3;
      p[i * 3 + 2] = Math.sin(a) * r;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(p, 3));
    polvo = new THREE.Points(
      g,
      registrar(new THREE.PointsMaterial({ color: PAL.ice, size: 0.18, map: glow, transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending }), 0.35, false),
    );
    scene.add(polvo);
  }

  // ── Construcción de la escena concreta ──
  const escena = construir(kit);
  const claves = Object.keys(escena.encuadres);
  for (const k of claves) pesos.set(k, 0);

  // Catálogo de materiales con su clave (viñeta más cercana hacia arriba).
  const vistos = new Set<THREE.Material>();
  scene.traverse((obj) => {
    if (obj.userData.hotspot) return;
    let clave: string | null = null;
    for (let o: THREE.Object3D | null = obj; o; o = o.parent) {
      if (typeof o.userData.clave === "string" && !o.userData.hotspot) {
        clave = o.userData.clave;
        break;
      }
    }
    const m = (obj as THREE.Mesh).material;
    const lista = Array.isArray(m) ? m : m ? [m] : [];
    for (const mat of lista) {
      if (vistos.has(mat) || typeof mat.userData.base !== "number") continue;
      vistos.add(mat);
      const conColor = mat as THREE.Material & { opacity: number; color?: THREE.Color };
      const tint = mat.userData.tint === true && conColor.color instanceof THREE.Color;
      materiales.push({
        mat: conColor,
        base: mat.userData.base as number,
        clave,
        tint,
        colorBase: tint && conColor.color ? conColor.color.clone() : null,
      });
    }
  });

  // ── Cámara y controles ──
  let portrait = false;
  let ancho = 1;
  let alto = 1;
  // En vertical el ancho visible manda: se aleja la cámara según el aspecto
  // (1 en horizontal; ~1.9 en un teléfono) para que la viñeta quepa a lo ancho.
  let factor = 1;
  const calcularFactor = () => {
    if (!portrait) return 1;
    const tanH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * (ancho / alto);
    return Math.min(2.4, Math.max(1, (0.614 / tanH) * 0.9));
  };
  const factorDist = () => factor;

  // La rueda no hace zoom: se registra ANTES que OrbitControls y corta su listener.
  const cortarRueda = (e: WheelEvent) => e.stopImmediatePropagation();
  canvas.addEventListener("wheel", cortarRueda);

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.07;
  controls.enablePan = false;
  controls.enableZoom = true; // pinza en táctil
  controls.rotateSpeed = 0.6;
  controls.minDistance = config.distancia?.[0] ?? 4;
  controls.maxDistance = config.distancia?.[1] ?? 90;
  controls.maxPolarAngle = Math.PI * 0.49;
  // Un dedo en vertical sigue haciendo scroll de la página.
  canvas.style.touchAction = "pan-y";

  // La vista general puede recortar los lados; los encuadres de módulo no.
  const aplicarDist = (e: Encuadre): Encuadre => ({
    target: e.target.clone(),
    pos: e.target.clone().add(e.pos.clone().sub(e.target).multiplyScalar(e === escena.general ? Math.max(1, factorDist() * 0.72) : factorDist())),
  });

  const inicial = aplicarDist(escena.general);
  camera.position.copy(inicial.pos);
  controls.target.copy(inicial.target);
  controls.update();

  type Vuelo = { desdePos: THREE.Vector3; desdeTarget: THREE.Vector3; a: Encuadre; t0: number; dur: number };
  let vuelo: Vuelo | null = null;
  let arrastrado = false;

  const volar = (e: Encuadre, inmediato: boolean) => {
    const destino = aplicarDist(e);
    arrastrado = false;
    if (inmediato) {
      vuelo = null;
      camera.position.copy(destino.pos);
      controls.target.copy(destino.target);
      controls.update();
      return;
    }
    vuelo = { desdePos: camera.position.clone(), desdeTarget: controls.target.clone(), a: destino, t0: performance.now(), dur: 1200 };
  };

  let arrastrando = false;
  const onStart = () => {
    vuelo = null;
    arrastrado = true;
    arrastrando = true;
    canvas.style.cursor = "grabbing";
  };
  const onEnd = () => {
    arrastrando = false;
    canvas.style.cursor = hoverClave ? "pointer" : "grab";
  };
  controls.addEventListener("start", onStart);
  controls.addEventListener("end", onEnd);

  // ── Selección y hover ──
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  let downX = 0;
  let downY = 0;
  let downT = 0;
  let hoverClave: string | null = null;
  let hoverPendiente = false;

  const aNdc = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  };
  const intersectar = (): string | null => {
    raycaster.setFromCamera(ndc, camera);
    const hits = raycaster.intersectObjects(pickables, true);
    for (const h of hits) {
      for (let o: THREE.Object3D | null = h.object; o; o = o.parent) {
        if (typeof o.userData.clave === "string") return o.userData.clave as string;
      }
    }
    return null;
  };
  const onDown = (e: PointerEvent) => {
    downX = e.clientX;
    downY = e.clientY;
    downT = performance.now();
  };
  const onUp = (e: PointerEvent) => {
    if (Math.hypot(e.clientX - downX, e.clientY - downY) > 6 || performance.now() - downT > 600) return;
    aNdc(e);
    const clave = intersectar();
    if (clave) opciones.onSeleccion?.(clave);
  };
  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    aNdc(e);
    hoverPendiente = true;
    if (!activa) actualizarHover();
  };
  const onLeave = () => {
    hoverClave = null;
    canvas.style.cursor = "";
  };
  const actualizarHover = () => {
    hoverPendiente = false;
    hoverClave = intersectar();
    if (!arrastrando) canvas.style.cursor = hoverClave ? "pointer" : "grab";
  };
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerleave", onLeave);

  // ── Bucle ──
  let activa = true;
  let raf = 0;
  let last = performance.now();
  let t = reducedMotion ? (config.tiempoQuieto ?? 3) : 0;
  let frameAcc = 0;
  let frameCount = 0;
  let sucio = true;
  controls.addEventListener("change", () => {
    sucio = true;
  });

  const colResalte = acento.clone().lerp(new THREE.Color(PAL.ice), 0.25);
  const aplicarMateriales = () => {
    for (const e of materiales) {
      const animada = typeof e.mat.userData.op === "number" ? (e.mat.userData.op as number) : e.base;
      let presencia = 1;
      let p = 0;
      if (e.clave) {
        p = pesos.get(e.clave) ?? 0;
        presencia = 1 - 0.72 * pesoFoco * (1 - p);
      } else {
        presencia = 1 - 0.55 * pesoFoco;
      }
      e.mat.opacity = Math.min(1, animada * presencia * (1 + 0.35 * p));
      if (e.tint && e.colorBase && e.mat.color) {
        e.mat.color.copy(e.colorBase).lerp(colResalte, p * 0.75);
      }
    }
  };

  const actualizarHotspots = (tt: number) => {
    hotspots.forEach((h, i) => {
      const objetivo = h.clave === hoverClave ? 1 : 0;
      h.hover += (objetivo - h.hover) * 0.2;
      const p = pesos.get(h.clave) ?? 0;
      const pulso = reducedMotion ? 0.5 : 0.5 + 0.5 * Math.sin(tt * 2.4 + i * 1.3);
      const s = 1 + 0.12 * pulso + 0.35 * h.hover + 0.15 * p;
      h.anillo.scale.setScalar(h.escala * s);
      // El hotspot del foco actual se apaga (ya está elegido); el resto se atenúa un poco.
      const apagado = (1 - 0.8 * p) * (1 - 0.35 * pesoFoco * (1 - p));
      (h.anillo.material as THREE.SpriteMaterial).opacity = Math.max(h.hover, (0.45 + 0.25 * pulso) * apagado);
      (h.nucleo.material as THREE.SpriteMaterial).opacity = Math.max(h.hover, 0.6 * apagado);
    });
  };

  const actualizar = (dt: number, ahora: number) => {
    // Pesos de foco
    const k = reducedMotion ? 1 : 1 - Math.exp(-dt * 4);
    for (const c of claves) {
      const actual = pesos.get(c) ?? 0;
      pesos.set(c, actual + ((c === foco ? 1 : 0) - actual) * k);
    }
    pesoFoco += ((foco ? 1 : 0) - pesoFoco) * k;

    // Vuelo de cámara
    if (vuelo) {
      const u = clamp01((ahora - vuelo.t0) / vuelo.dur);
      const e = easeInOut(u);
      camera.position.lerpVectors(vuelo.desdePos, vuelo.a.pos, e);
      controls.target.lerpVectors(vuelo.desdeTarget, vuelo.a.target, e);
      if (u >= 1) vuelo = null;
    }
    controls.autoRotate = !reducedMotion && !vuelo;
    controls.autoRotateSpeed = Math.sin(t * 0.13) * 0.22;
    controls.update(dt);

    escena.update(t, dt);
    aplicarMateriales();
    actualizarHotspots(t);
    if (sueloUniforms) sueloUniforms.uTime.value = t;
    if (polvo && !reducedMotion) polvo.rotation.y = t * 0.012;
    if (hoverPendiente) actualizarHover();
  };

  const loop = (ahora: number) => {
    if (!activa) return;
    raf = requestAnimationFrame(loop);
    const dt = Math.min(Math.max((ahora - last) / 1000, 0), 0.1);
    last = ahora;
    if (!reducedMotion) t += dt;
    // Sin movimiento: solo se dibuja cuando algo cambia.
    const transicion = vuelo !== null || Math.abs(pesoFoco - (foco ? 1 : 0)) > 0.001;
    if (reducedMotion && !sucio && !transicion && !hoverPendiente) return;
    sucio = false;
    actualizar(dt, ahora);
    renderer.render(scene, camera);
    if (!reducedMotion) adaptar(dt);
  };

  const adaptar = (dt: number) => {
    frameAcc += dt;
    frameCount++;
    if (frameAcc < 1.5) return;
    const fps = frameCount / frameAcc;
    frameAcc = 0;
    frameCount = 0;
    if (fps < 45 && dpr > 1) {
      dpr = Math.max(1, dpr - 0.25);
      renderer.setPixelRatio(dpr);
      renderer.setSize(ancho, alto, false);
    }
  };

  const iniciar = () => {
    cancelAnimationFrame(raf);
    last = performance.now();
    raf = requestAnimationFrame(loop);
  };

  const onContextLost = (e: Event) => {
    e.preventDefault();
    activa = false;
    cancelAnimationFrame(raf);
  };
  canvas.addEventListener("webglcontextlost", onContextLost, false);

  canvas.style.cursor = "grab";
  iniciar();

  return {
    setFoco(clave) {
      const nueva = clave && escena.encuadres[clave] ? clave : null;
      foco = nueva;
      const e = nueva ? escena.encuadres[nueva] : escena.general;
      volar(e, reducedMotion);
      sucio = true;
    },
    resize(w, h) {
      ancho = Math.max(1, w);
      alto = Math.max(1, h);
      const antes = factor;
      portrait = ancho / alto < 0.85;
      renderer.setSize(ancho, alto, false);
      camera.aspect = ancho / alto;
      camera.fov = portrait ? 55 : 42;
      camera.updateProjectionMatrix();
      factor = calcularFactor();
      if (Math.abs(antes - factor) > 0.05 && !arrastrado) {
        volar(foco ? escena.encuadres[foco] : escena.general, true);
      }
      sucio = true;
      if (!activa) renderer.render(scene, camera);
    },
    setActiva(a) {
      if (a === activa) return;
      activa = a;
      if (a) {
        sucio = true;
        iniciar();
      } else cancelAnimationFrame(raf);
    },
    dispose() {
      activa = false;
      cancelAnimationFrame(raf);
      canvas.removeEventListener("wheel", cortarRueda);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("webglcontextlost", onContextLost, false);
      controls.removeEventListener("start", onStart);
      controls.removeEventListener("end", onEnd);
      controls.dispose();
      canvas.style.cursor = "";
      canvas.style.touchAction = "";
      const geos = new Set<THREE.BufferGeometry>();
      const mats = new Set<THREE.Material>();
      scene.traverse((obj) => {
        const o = obj as THREE.Mesh;
        if (o.geometry) geos.add(o.geometry);
        const m = o.material;
        if (Array.isArray(m)) m.forEach((x) => mats.add(x));
        else if (m) mats.add(m);
      });
      geos.forEach((g) => g.dispose());
      mats.forEach((m) => m.dispose());
      texturas.forEach((tx) => tx.dispose());
      glow.dispose();
      ringTex.dispose();
      const gl = renderer.getContext();
      renderer.dispose();
      // Si el canvas salió del DOM (desmontaje real) se libera el contexto ya, en vez de
      // esperar al recolector (evita "Too many active WebGL contexts" al navegar entre
      // áreas). Si el mismo canvas se reutiliza (cambio de escena), se deja vivo.
      setTimeout(() => {
        if (!canvas.isConnected) gl.getExtension("WEBGL_lose_context")?.loseContext();
      }, 0);
    },
  };
}

/**
 * Coloca una viñeta (grupo con plataforma, hotspot y encuadre) en `centro`,
 * girada `angulo` (su +z local mira hacia afuera).
 */
export function montarVineta(
  kit: Kit,
  clave: string,
  centro: THREE.Vector3,
  angulo: number,
  o: { radio?: number; hotspotY?: number; dist?: number; alto?: number; mirarY?: number; padre?: THREE.Object3D; plataforma?: boolean } = {},
): { grupo: THREE.Group; encuadre: Encuadre } {
  const grupo = new THREE.Group();
  grupo.position.copy(centro);
  grupo.rotation.y = angulo;
  if (o.plataforma !== false) {
    const radio = o.radio ?? 3.6;
    const base = new THREE.Mesh(new THREE.CircleGeometry(radio, 48), kit.mb(PAL.french, 0.13));
    base.rotation.x = -Math.PI / 2;
    base.position.y = 0.02;
    const borde = new THREE.Mesh(new THREE.RingGeometry(radio - 0.06, radio, 64), kit.mb(PAL.bright, 0.45, { tint: true, aditivo: true }));
    borde.rotation.x = -Math.PI / 2;
    borde.position.y = 0.03;
    grupo.add(base, borde);
  }
  kit.vineta(clave, grupo);
  kit.hotspot(clave, v3(0, o.hotspotY ?? 5.4, 0), grupo);
  (o.padre ?? kit.scene).add(grupo);
  return { grupo, encuadre: frente(centro, angulo, o.dist ?? 10, o.alto ?? 4.5, o.mirarY ?? 2.2) };
}

/** InstancedMesh con colores por instancia listos (todas en blanco). */
export function instanciado(geo: THREE.BufferGeometry, mat: THREE.Material, n: number) {
  const m = new THREE.InstancedMesh(geo, mat, n);
  m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  const blanco = new THREE.Color(1, 1, 1);
  for (let i = 0; i < n; i++) m.setColorAt(i, blanco);
  m.frustumCulled = false;
  return m;
}
