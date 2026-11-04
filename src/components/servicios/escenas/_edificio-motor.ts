/**
 * Motor común de las escenas «edificio», «inmersiva», «centro», «campo» y
 * «comunicacion» de /servicios.
 *
 * Resuelve lo que el contrato (./contrato.ts) pide a todas por igual:
 *  - un WebGLRenderer sin sombras ni post-proceso (el brillo sale de sprites
 *    aditivos y del suelo con grilla procedural, como el home 3D);
 *  - OrbitControls con damping: arrastrar gira, la rueda NO hace zoom (la página
 *    sigue desplazándose), la pinza sí;
 *  - vuelos de cámara de ~1.2 s con easing, interrumpibles al arrastrar;
 *  - pesos suavizados por clave de foco (0 → 1) para que cada escena resalte
 *    lo suyo sin saltos;
 *  - hotspots clicables (selección en espacio de pantalla, cursor «pointer»);
 *  - lowPower / reducedMotion, calidad adaptativa y limpieza total en dispose.
 *
 * Cada escena solo construye su geometría y anima en `update(t, dt)`.
 */

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { EscenaId } from "@/data/servicios/tipos";
import { createSafeRenderer, type SafeRenderer } from "@/lib/three/safe-renderer";
import { FOCOS_ESCENA, type InstanciaEscena, type OpcionesEscena } from "./contrato";

export const COLOR = {
  deep: 0x020a18,
  imperial: 0x142664,
  french: 0x1d3885,
  indigo: 0x2348d4,
  steel: 0x9eb0c0,
  building: 0x12285a,
  bright: 0x6b8aff,
  ice: 0xd5e0ff,
  cyan: 0x5fd8ff,
  red: 0xff3b5c,
  amber: 0xffb547,
  green: 0x35e0a1,
} as const;

export const v3 = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const ramp = (x: number, a: number, b: number) => clamp01((x - a) / (b - a));
export const suave = (x: number) => {
  const k = clamp01(x);
  return k * k * (3 - 2 * k);
};
export const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
/** Fase 0..1 de un ciclo de `periodo` segundos. */
export const fase = (t: number, periodo: number, desfase = 0) => ((((t / periodo + desfase) % 1) + 1) % 1);

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

export type Encuadre = { pos: THREE.Vector3; target: THREE.Vector3 };
export const enc = (px: number, py: number, pz: number, tx: number, ty: number, tz: number): Encuadre => ({
  pos: v3(px, py, pz),
  target: v3(tx, ty, tz),
});

export type Escena = {
  /** Vista general (foco = null). */
  general: Encuadre;
  /** Un encuadre por clave de FOCOS_ESCENA[id]. */
  encuadres: Record<string, Encuadre>;
  /** Posición (viva: se puede mover) del hotspot de cada clave. */
  hotspots: Record<string, THREE.Vector3>;
  /** t = reloj de animación (congelado con reducedMotion), dt = paso (0 con reducedMotion). */
  update(t: number, dt: number): void;
  /** Multiplicador del balanceo idle de la cámara según el foco (1 por defecto). */
  orbita?(foco: string | null): number;
  dispose?(): void;
};

export type ConfigEscena = {
  fov?: number;
  niebla?: number;
  lejos?: number;
  /** Límite de inclinación (rad) para no meter la cámara bajo el suelo. */
  polarMax?: number;
};

// ───────────────────────── Shaders de suelo ─────────────────────────

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
  uniform vec3 uPulsoColor;
  uniform vec3 uPulsoPos;
  uniform float uPulso;
  uniform float uTime;
  uniform float uReach;
  uniform float uCelda;
  uniform float uMayor;
  uniform float uPlaca;
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
    col += uLine * gridLine(p, uCelda) * 0.28 * fade;
    col += uMajor * gridLine(p, uMayor) * 0.7 * fade;
    col += uLine * smoothstep(uPlaca, uPlaca * 0.2, d) * 0.12;
    float ad = length(p - uPulsoPos.xz);
    float wave = pow(0.5 + 0.5 * sin(ad * 0.9 - uTime * 4.0), 10.0);
    col += uPulsoColor * wave * exp(-ad * 0.07) * uPulso * 0.6;
    gl_FragColor = vec4(col, 1.0);
  }
`;

export type Suelo = {
  mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  u: {
    uBase: THREE.IUniform<THREE.Color>;
    uLine: THREE.IUniform<THREE.Color>;
    uMajor: THREE.IUniform<THREE.Color>;
    uPulsoColor: THREE.IUniform<THREE.Color>;
    uPulsoPos: THREE.IUniform<THREE.Vector3>;
    uPulso: THREE.IUniform<number>;
    uTime: THREE.IUniform<number>;
    uReach: THREE.IUniform<number>;
    uCelda: THREE.IUniform<number>;
    uMayor: THREE.IUniform<number>;
    uPlaca: THREE.IUniform<number>;
  };
};

// ───────────────────────── Flujo de partículas ─────────────────────────

/** Partículas que recorren una curva (datos, alertas, voz…). */
export class Flujo {
  readonly points: THREE.Points<THREE.BufferGeometry, THREE.PointsMaterial>;
  curva: THREE.Curve<THREE.Vector3>;
  private readonly pos: Float32Array;
  private readonly n: number;
  private readonly tmp = new THREE.Vector3();

  constructor(curva: THREE.Curve<THREE.Vector3>, color: THREE.ColorRepresentation, n: number, size: number, map: THREE.Texture) {
    this.curva = curva;
    this.n = n;
    this.pos = new Float32Array(n * 3);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(this.pos, 3));
    this.points = new THREE.Points(
      geo,
      new THREE.PointsMaterial({
        color,
        size,
        map,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
      }),
    );
    this.points.frustumCulled = false;
    this.points.visible = false;
  }

  /** `vel` = vueltas por segundo; `tramo` < 1 concentra las partículas en un paquete. */
  update(t: number, intensidad: number, vel = 0.45, tramo = 1) {
    this.points.visible = intensidad > 0.01;
    if (!this.points.visible) return;
    this.points.material.opacity = intensidad;
    for (let i = 0; i < this.n; i++) {
      const u = (t * vel + (i / this.n) * tramo) % 1;
      this.curva.getPoint(u, this.tmp);
      this.pos[i * 3] = this.tmp.x;
      this.pos[i * 3 + 1] = this.tmp.y + Math.sin(i * 12.9 + t * 3) * 0.05;
      this.pos[i * 3 + 2] = this.tmp.z;
    }
    (this.points.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
  }
}

export const arco = (a: THREE.Vector3, b: THREE.Vector3, lift: number) => {
  const mid = a.clone().lerp(b, 0.5);
  mid.y += lift;
  return new THREE.QuadraticBezierCurve3(a.clone(), mid, b.clone());
};

// ───────────────────────── Kit de construcción ─────────────────────────

export type Figura = { grupo: THREE.Group; mat: THREE.MeshBasicMaterial; halo: THREE.Sprite };

export class Kit {
  readonly scene: THREE.Scene;
  readonly camera: THREE.PerspectiveCamera;
  readonly glow: THREE.Texture;
  readonly acento: THREE.Color;
  readonly lowPower: boolean;
  readonly reducedMotion: boolean;
  /** Foco actual (null = vista general). */
  foco: string | null = null;
  /** Reloj real (s), avanza siempre (también con reducedMotion). */
  reloj = 0;
  private focoDesde = 0;
  private readonly pesos = new Map<string, number>();
  private readonly texturas = new Set<THREE.Texture>();

  constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera, op: OpcionesEscena) {
    this.scene = scene;
    this.camera = camera;
    this.acento = new THREE.Color(op.acento);
    this.lowPower = op.lowPower;
    this.reducedMotion = op.reducedMotion;
    this.glow = this.textura(64, 64, (c, w, h) => {
      const g = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
      g.addColorStop(0, "rgba(255,255,255,1)");
      g.addColorStop(0.25, "rgba(255,255,255,0.55)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      c.fillStyle = g;
      c.fillRect(0, 0, w, h);
    });
    this.glow.flipY = false;
  }

  /** Peso suavizado 0..1 de una clave (null = vista general). */
  peso(clave: string | null) {
    return this.pesos.get(clave ?? "") ?? 0;
  }

  /** Segundos (reales) desde que `clave` es el foco; 0 si no lo es. */
  enFoco(clave: string) {
    return this.foco === clave ? this.reloj - this.focoDesde : 0;
  }

  setFoco(clave: string | null) {
    if (clave === this.foco) return;
    this.foco = clave;
    this.focoDesde = this.reloj;
  }

  /** Avanza los pesos; devuelve true si alguno sigue cambiando. */
  avanzar(dt: number, claves: readonly string[]) {
    this.reloj += dt;
    const k = 1 - Math.exp(-dt * (this.reducedMotion ? 7 : 3.2));
    let cambia = false;
    for (const c of [...claves, ""]) {
      const objetivo = (this.foco ?? "") === c ? 1 : 0;
      const actual = this.pesos.get(c) ?? (c === "" ? 1 : 0);
      let next = actual + (objetivo - actual) * k;
      if (Math.abs(next - objetivo) < 0.002) next = objetivo;
      else cambia = true;
      this.pesos.set(c, next);
    }
    return cambia;
  }

  add<T extends THREE.Object3D>(obj: T, padre: THREE.Object3D = this.scene): T {
    padre.add(obj);
    return obj;
  }

  textura(w: number, h: number, dibujar: (c: CanvasRenderingContext2D, w: number, h: number) => void) {
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const c = canvas.getContext("2d");
    if (c) dibujar(c, w, h);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    this.texturas.add(tex);
    return tex;
  }

  sprite(color: THREE.ColorRepresentation, escala: number, opacidad = 1, map: THREE.Texture = this.glow) {
    const s = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map,
        color,
        transparent: true,
        opacity: opacidad,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    s.scale.setScalar(escala);
    return s;
  }

  basico(color: THREE.ColorRepresentation, opacidad = 1, aditivo = false) {
    return new THREE.MeshBasicMaterial({
      color,
      transparent: opacidad < 1 || aditivo,
      opacity: opacidad,
      depthWrite: !aditivo,
      blending: aditivo ? THREE.AdditiveBlending : THREE.NormalBlending,
      side: aditivo ? THREE.DoubleSide : THREE.FrontSide,
    });
  }

  matLinea(color: THREE.ColorRepresentation, opacidad = 1) {
    return new THREE.LineBasicMaterial({ color, transparent: true, opacity: opacidad });
  }

  linea(puntos: THREE.Vector3[], color: THREE.ColorRepresentation, opacidad = 1, cerrada = false) {
    const geo = new THREE.BufferGeometry().setFromPoints(puntos);
    const mat = this.matLinea(color, opacidad);
    return cerrada ? new THREE.LineLoop(geo, mat) : new THREE.Line(geo, mat);
  }

  /** LineSegments a partir de pares de puntos [a0,b0,a1,b1,…]. */
  segmentos(pares: THREE.Vector3[], color: THREE.ColorRepresentation, opacidad = 1) {
    return new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pares), this.matLinea(color, opacidad));
  }

  bordes(geo: THREE.BufferGeometry, color: THREE.ColorRepresentation, opacidad = 1) {
    return new THREE.LineSegments(new THREE.EdgesGeometry(geo), this.matLinea(color, opacidad));
  }

  /** Caja holográfica: relleno estándar oscuro + aristas emisivas. Origen en la base. */
  caja(
    w: number,
    h: number,
    d: number,
    o: { relleno?: THREE.ColorRepresentation; borde?: THREE.ColorRepresentation; opRelleno?: number; opBorde?: number } = {},
  ) {
    const geo = new THREE.BoxGeometry(w, h, d);
    geo.translate(0, h / 2, 0);
    const relleno = new THREE.MeshStandardMaterial({
      color: o.relleno ?? COLOR.building,
      roughness: 0.85,
      metalness: 0.15,
      transparent: (o.opRelleno ?? 1) < 1,
      opacity: o.opRelleno ?? 1,
    });
    const mesh = new THREE.Mesh(geo, relleno);
    const borde = this.bordes(geo, o.borde ?? 0x4a6dff, o.opBorde ?? 0.9);
    const grupo = new THREE.Group();
    grupo.add(mesh, borde);
    return { grupo, mesh, relleno, borde: borde.material };
  }

  /** Anillo plano sobre el suelo (aditivo). */
  anillo(rIn: number, rOut: number, color: THREE.ColorRepresentation, seg = 48) {
    const m = new THREE.Mesh(new THREE.RingGeometry(rIn, rOut, seg), this.basico(color, 1, true));
    m.rotation.x = -Math.PI / 2;
    return m;
  }

  /** Silueta humana abstracta (cápsula + cabeza + halo). Origen en los pies. */
  figura(color: THREE.ColorRepresentation, alto = 1.75): Figura {
    const grupo = new THREE.Group();
    const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.95 });
    const r = alto * 0.16;
    const cuerpo = new THREE.Mesh(new THREE.CapsuleGeometry(r, alto * 0.42, 4, 10), mat);
    cuerpo.position.y = r + alto * 0.21;
    const cabeza = new THREE.Mesh(new THREE.SphereGeometry(r * 0.78, 12, 10), mat);
    cabeza.position.y = alto - r * 0.78;
    const halo = this.sprite(color, alto * 1.6, 0.55);
    halo.position.y = alto * 0.35;
    grupo.add(cuerpo, cabeza, halo);
    return { grupo, mat, halo };
  }

  suelo(
    tam: number,
    o: { reach?: number; celda?: number; mayor?: number; placa?: number; base?: THREE.ColorRepresentation } = {},
  ): Suelo {
    const u: Suelo["u"] = {
      uBase: { value: new THREE.Color(o.base ?? 0x030c1e) },
      uLine: { value: new THREE.Color(COLOR.french) },
      uMajor: { value: new THREE.Color(COLOR.indigo) },
      uPulsoColor: { value: new THREE.Color(COLOR.red) },
      uPulsoPos: { value: new THREE.Vector3() },
      uPulso: { value: 0 },
      uTime: { value: 0 },
      uReach: { value: o.reach ?? 0.035 },
      uCelda: { value: o.celda ?? 2 },
      uMayor: { value: o.mayor ?? 10 },
      uPlaca: { value: o.placa ?? 24 },
    };
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(tam, tam),
      new THREE.ShaderMaterial({ vertexShader: SUELO_VERT, fragmentShader: SUELO_FRAG, uniforms: u, fog: false }),
    );
    mesh.rotation.x = -Math.PI / 2;
    return { mesh, u };
  }

  flujo(curva: THREE.Curve<THREE.Vector3>, color: THREE.ColorRepresentation, n: number, size = 0.6) {
    const f = new Flujo(curva, color, this.lowPower ? Math.max(6, Math.round(n * 0.55)) : n, size, this.glow);
    this.scene.add(f.points);
    return f;
  }

  /** Polvo ambiental (puntos aditivos). */
  polvo(n: number, ancho: number, alto: number, seed = 7) {
    const rand = mulberry32(seed);
    const cuenta = this.lowPower ? Math.round(n * 0.35) : n;
    const pos = new Float32Array(cuenta * 3);
    for (let i = 0; i < cuenta; i++) {
      pos[i * 3] = (rand() - 0.5) * ancho;
      pos[i * 3 + 1] = rand() * alto + 0.5;
      pos[i * 3 + 2] = (rand() - 0.5) * ancho;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const p = new THREE.Points(
      geo,
      new THREE.PointsMaterial({
        color: COLOR.ice,
        size: 0.22,
        map: this.glow,
        transparent: true,
        opacity: 0.35,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    this.scene.add(p);
    return p;
  }

  disposeTexturas() {
    for (const t of this.texturas) t.dispose();
    this.texturas.clear();
  }
}

// ───────────────────────── Montaje ─────────────────────────

const DUR_VUELO = 1.2;
const RADIO_HIT = 26;

export function montarEscena(
  id: EscenaId,
  op: OpcionesEscena,
  construir: (kit: Kit) => Escena,
  cfg: ConfigEscena = {},
): InstanciaEscena {
  const sr = createSafeRenderer({
    canvas: op.canvas,
    lowPower: op.lowPower,
    params: { alpha: true },
    onFatal: () => op.onFallo?.(),
  });
  if (!sr) throw new Error("WebGL no disponible");
  try {
    return montar(id, op, construir, cfg, sr);
  } catch (e) {
    // Si la construcción falla no se deja un contexto WebGL huérfano.
    sr.dispose(true);
    throw e;
  }
}

function montar(
  id: EscenaId,
  op: OpcionesEscena,
  construir: (kit: Kit) => Escena,
  cfg: ConfigEscena,
  sr: SafeRenderer,
): InstanciaEscena {
  const { canvas, reducedMotion } = op;
  const claves = Object.keys(FOCOS_ESCENA[id]);

  const renderer = sr.renderer;
  let dpr = sr.maxDpr;
  renderer.setClearColor(COLOR.deep, 1);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(COLOR.deep, cfg.niebla ?? 0.016);
  const fovBase = cfg.fov ?? 40;
  const camera = new THREE.PerspectiveCamera(fovBase, 1, 0.1, cfg.lejos ?? 600);

  scene.add(new THREE.HemisphereLight(0x8aa2ff, 0x0a1736, 2.1));
  const key = new THREE.DirectionalLight(0xd5e0ff, 1.9);
  key.position.set(30, 50, 20);
  scene.add(key);

  const kit = new Kit(scene, camera, op);
  const esc = construir(kit);

  if (process.env.NODE_ENV !== "production") {
    for (const c of claves) {
      if (!esc.encuadres[c] || !esc.hotspots[c]) console.warn(`[escena ${id}] falta encuadre u hotspot para «${c}»`);
    }
  }

  // ── Hotspots: sprites de tamaño constante en pantalla ──
  const texMarca = kit.textura(128, 128, (c, w) => {
    const m = w / 2;
    c.strokeStyle = "rgba(255,255,255,0.95)";
    c.lineWidth = 7;
    c.beginPath();
    c.arc(m, m, m * 0.62, 0, Math.PI * 2);
    c.stroke();
    c.fillStyle = "rgba(255,255,255,1)";
    c.beginPath();
    c.arc(m, m, m * 0.24, 0, Math.PI * 2);
    c.fill();
    const g = c.createRadialGradient(m, m, m * 0.6, m, m, m);
    g.addColorStop(0, "rgba(255,255,255,0.35)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    c.fillStyle = g;
    c.fillRect(0, 0, w, w);
  });
  const marcas = claves
    .filter((c) => esc.hotspots[c])
    .map((clave) => {
      const s = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: texMarca,
          color: kit.acento,
          transparent: true,
          depthTest: false,
          depthWrite: false,
          sizeAttenuation: false,
        }),
      );
      s.renderOrder = 30;
      s.position.copy(esc.hotspots[clave]);
      scene.add(s);
      return { clave, s, hover: 0 };
    });

  // ── Controles ──
  const bloquearRueda = (e: WheelEvent) => e.stopImmediatePropagation();
  canvas.addEventListener("wheel", bloquearRueda, { capture: true });
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = false;
  controls.enableZoom = true; // solo pinza: la rueda queda bloqueada arriba
  controls.zoomSpeed = 0.8;
  controls.rotateSpeed = 0.55;
  controls.maxPolarAngle = cfg.polarMax ?? 1.48;
  canvas.style.touchAction = "pan-y";

  let portrait = false;
  let ancho = 1;
  let alto = 1;
  const factor = () => (portrait ? 1.5 : 1);
  const encuadreDe = (clave: string | null) => (clave && esc.encuadres[clave]) || esc.general;
  const destino = (e: Encuadre) => ({
    pos: e.target.clone().add(e.pos.clone().sub(e.target).multiplyScalar(factor())),
    target: e.target.clone(),
  });
  const distGeneral = esc.general.pos.distanceTo(esc.general.target);
  controls.minDistance = Math.min(3, distGeneral * 0.15);
  controls.maxDistance = distGeneral * 2.4;

  // Arranque: un poco más lejos, el primer setFoco hace el acercamiento.
  {
    const d = destino(esc.general);
    camera.position.copy(d.target).add(d.pos.clone().sub(d.target).multiplyScalar(1.25));
    controls.target.copy(d.target);
    controls.update();
  }

  type Vuelo = { p0: THREE.Vector3; t0: THREE.Vector3; p1: THREE.Vector3; t1: THREE.Vector3; k: number; dur: number };
  let vuelo: Vuelo | null = null;
  let arrastrando = false;
  let usuarioMovio = false;
  let sucio = 3;

  const volarA = (clave: string | null) => {
    const d = destino(encuadreDe(clave));
    vuelo = {
      p0: camera.position.clone(),
      t0: controls.target.clone(),
      p1: d.pos,
      t1: d.target,
      k: 0,
      dur: reducedMotion ? 0.45 : DUR_VUELO,
    };
    usuarioMovio = false;
    sucio = 3;
  };

  const onStart = () => {
    arrastrando = true;
    vuelo = null;
    usuarioMovio = true;
  };
  const onEnd = () => {
    arrastrando = false;
  };
  const onChange = () => {
    sucio = Math.max(sucio, 2);
  };
  controls.addEventListener("start", onStart);
  controls.addEventListener("end", onEnd);
  controls.addEventListener("change", onChange);

  // ── Selección de hotspots ──
  const tmp = new THREE.Vector3();
  let hoverClave: string | null = null;
  const elegir = (cx: number, cy: number, radio: number) => {
    const r = canvas.getBoundingClientRect();
    const x = cx - r.left;
    const y = cy - r.top;
    let mejor: string | null = null;
    let dmin = radio;
    for (const m of marcas) {
      tmp.copy(m.s.position).project(camera);
      if (tmp.z > 1) continue;
      const sx = (tmp.x * 0.5 + 0.5) * r.width;
      const sy = (-tmp.y * 0.5 + 0.5) * r.height;
      const d = Math.hypot(sx - x, sy - y);
      if (d < dmin) {
        dmin = d;
        mejor = m.clave;
      }
    }
    return mejor;
  };
  let abajo: { x: number; y: number } | null = null;
  const onDown = (e: PointerEvent) => {
    abajo = { x: e.clientX, y: e.clientY };
  };
  const onUp = (e: PointerEvent) => {
    if (abajo && Math.hypot(e.clientX - abajo.x, e.clientY - abajo.y) < 7) {
      const c = elegir(e.clientX, e.clientY, e.pointerType === "touch" ? RADIO_HIT * 1.4 : RADIO_HIT);
      if (c) {
        if (op.onSeleccion) op.onSeleccion(c);
        else instancia.setFoco(c);
      }
    }
    abajo = null;
  };
  const onMove = (e: PointerEvent) => {
    if (e.buttons || e.pointerType === "touch") return;
    const c = elegir(e.clientX, e.clientY, RADIO_HIT);
    if (c !== hoverClave) {
      hoverClave = c;
      canvas.style.cursor = c ? "pointer" : "grab";
      sucio = 3;
    }
  };
  const onLeave = () => {
    hoverClave = null;
    canvas.style.cursor = "";
  };
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerleave", onLeave);

  // ── Bucle ──
  let raf = 0;
  let activa = false;
  let perdido = false;
  let last = 0;
  let t = 4; // con reducedMotion la escena queda congelada en un instante legible
  let acc = 0;
  let frames = 0;

  const actualizarMarcas = (dt: number) => {
    const baseEsc = portrait ? 0.07 : 0.05;
    for (let i = 0; i < marcas.length; i++) {
      const m = marcas[i];
      m.s.position.copy(esc.hotspots[m.clave]);
      const activo = kit.foco === m.clave;
      m.hover += ((hoverClave === m.clave ? 1 : 0) - m.hover) * (1 - Math.exp(-dt * 12));
      const pulso = reducedMotion ? 0 : Math.sin(kit.reloj * 2.4 + i * 1.3) * 0.08;
      m.s.scale.setScalar(baseEsc * (1 + pulso + m.hover * 0.35 + (activo ? 0.25 : 0)));
      m.s.material.opacity = activo ? 1 : 0.5 + m.hover * 0.5;
    }
  };

  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(Math.max((now - last) / 1000, 0), 0.1);
    last = now;
    const pesosCambian = kit.avanzar(dt, claves);
    if (!reducedMotion) t += dt;

    if (vuelo) {
      vuelo.k += dt / vuelo.dur;
      const e = easeInOut(Math.min(1, vuelo.k));
      camera.position.lerpVectors(vuelo.p0, vuelo.p1, e);
      controls.target.lerpVectors(vuelo.t0, vuelo.t1, e);
      if (vuelo.k >= 1) vuelo = null;
      sucio = 2;
    }
    const amp = esc.orbita ? esc.orbita(kit.foco) : 1;
    controls.autoRotate = !reducedMotion && !vuelo && !arrastrando;
    controls.autoRotateSpeed = Math.sin(kit.reloj * 0.13) * 0.22 * amp;
    const movio = controls.update(dt);

    if (reducedMotion && !movio && !pesosCambian && !vuelo && sucio <= 0) return;
    sucio--;

    esc.update(t, reducedMotion ? 0 : dt);
    actualizarMarcas(dt);
    renderer.render(scene, camera);

    // Calidad adaptativa: baja la resolución si no se sostienen ~45 fps.
    acc += dt;
    frames++;
    if (acc >= 1.5) {
      const fps = frames / acc;
      acc = 0;
      frames = 0;
      if (fps < 45 && dpr > 1) {
        dpr = Math.max(1, dpr - 0.25);
        renderer.setPixelRatio(dpr);
        renderer.setSize(ancho, alto, false);
      }
    }
  };

  const arrancar = () => {
    if (raf || perdido) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  };
  const parar = () => {
    cancelAnimationFrame(raf);
    raf = 0;
  };

  // Contexto perdido: se detiene el bucle; si vuelve se reanuda y si no, el helper
  // avisa `onFallo` para pasar al respaldo estático.
  sr.onLost = () => {
    perdido = true;
    parar();
  };
  sr.onRestored = () => {
    perdido = false;
    sucio = 3;
    if (activa) arrancar();
    else {
      esc.update(t, 0);
      actualizarMarcas(0);
      renderer.render(scene, camera);
    }
  };

  const instancia: InstanciaEscena = {
    setFoco(clave) {
      const c = clave && esc.encuadres[clave] ? clave : null;
      kit.setFoco(c);
      volarA(c);
    },
    resize(w, h) {
      ancho = Math.max(1, Math.round(w));
      alto = Math.max(1, Math.round(h));
      const eraPortrait = portrait;
      portrait = ancho / alto < 0.85;
      renderer.setSize(ancho, alto, false);
      camera.aspect = ancho / alto;
      camera.fov = portrait ? fovBase + 14 : fovBase;
      camera.updateProjectionMatrix();
      if (eraPortrait !== portrait && !usuarioMovio && !vuelo) {
        const d = destino(encuadreDe(kit.foco));
        camera.position.copy(d.pos);
        controls.target.copy(d.target);
        controls.update();
      }
      sucio = 3;
      if (!raf && !perdido) {
        esc.update(t, 0);
        actualizarMarcas(0);
        renderer.render(scene, camera);
      }
    },
    setActiva(a) {
      activa = a;
      if (a) arrancar();
      else parar();
    },
    dispose() {
      parar();
      activa = false;
      controls.removeEventListener("start", onStart);
      controls.removeEventListener("end", onEnd);
      controls.removeEventListener("change", onChange);
      controls.dispose();
      canvas.removeEventListener("wheel", bloquearRueda, { capture: true });
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.style.cursor = "";
      esc.dispose?.();
      const mats = new Set<THREE.Material>();
      scene.traverse((obj) => {
        const o = obj as THREE.Mesh;
        o.geometry?.dispose();
        const m = o.material;
        if (Array.isArray(m)) m.forEach((x) => mats.add(x));
        else if (m) mats.add(m);
      });
      for (const m of mats) {
        const conMapa = m as THREE.Material & { map?: THREE.Texture | null };
        conMapa.map?.dispose();
        m.dispose();
      }
      kit.disposeTexturas();
      sr.dispose();
    },
  };

  return instancia;
}
