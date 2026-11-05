/**
 * Utilidades compartidas por las estaciones de la escena de la Academia.
 *
 * Todo es geometría procedural (sin modelos externos). Los materiales se crean
 * por estación a través de un `Kit`, que registra cada recurso para liberarlo en
 * `dispose()`: geometrías, materiales y texturas de canvas.
 */

import * as THREE from "three";

export const PALETA = {
  fondo: 0x020a18,
  imperial: 0x142664,
  french: 0x1d3885,
  indigo: 0x2348d4,
  azul: 0x6b8aff,
  hielo: 0xd5e0ff,
  violeta: 0xb78bff,
  verde: 0x3dffa0,
  verdeHondo: 0x0fb874,
  ambar: 0xffb547,
  rojo: 0xff3b5c,
  piel: 0x8a6f5c,
  acero: 0x3a4456,
  madera: 0x5a3a26,
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

export type Encuadre = { pos: THREE.Vector3; target: THREE.Vector3; fov?: number };
export const enc = (px: number, py: number, pz: number, tx: number, ty: number, tz: number, fov?: number): Encuadre => ({
  pos: v3(px, py, pz),
  target: v3(tx, ty, tz),
  fov,
});

/** Luz y atmósfera de una estación; el motor interpola entre la saliente y la entrante. */
export type Ambiente = {
  fondo: number;
  niebla: number;
  cielo: number;
  suelo: number;
  hemi: number;
  sol: number;
  colorSol: number;
};

export type Tono = "azul" | "verde" | "violeta" | "ambar";

export type Etiqueta = {
  id: string;
  texto: string;
  /** Objeto al que se ancla (se usa su posición de mundo + `desfase`). */
  ancla: THREE.Object3D;
  desfase?: THREE.Vector3;
  tono?: Tono;
  /** Lado hacia el que se abre la etiqueta respecto del ancla. */
  lado?: "izq" | "der";
  /** Opacidad 0..1 según el reloj de la estación (1 por defecto). */
  opacidad?: (t: number) => number;
};

export type Estacion = {
  grupo: THREE.Group;
  encuadre: Encuadre;
  ambiente: Ambiente;
  etiquetas: Etiqueta[];
  /** Reloj con el que se dibuja la estación quieta (prefers-reduced-motion). */
  tQuieto: number;
  /** Amplitud del balanceo idle de la cámara (1 = normal). */
  balanceo?: number;
  update(t: number, dt: number): void;
};

export type OpcionesEstacion = { lowPower: boolean };
export type FabricaEstacion = (kit: Kit, op: OpcionesEstacion) => Estacion;

type Dibujo = (c: CanvasRenderingContext2D, w: number, h: number) => void;

export class Kit {
  private recursos: Array<{ dispose(): void }> = [];
  private cacheMat = new Map<string, THREE.Material>();

  /** Registra un recurso para liberarlo con la estación. */
  track<T extends { dispose(): void }>(r: T): T {
    this.recursos.push(r);
    return r;
  }

  geo<T extends THREE.BufferGeometry>(g: T): T {
    return this.track(g);
  }

  /** Material mate low-poly (Lambert, sombreado plano), cacheado por color/emisivo. */
  mate(color: number, o: { emisivo?: number; intensidad?: number; plano?: boolean; doble?: boolean; mapa?: THREE.Texture } = {}) {
    const k = `m${color}-${o.emisivo ?? 0}-${o.intensidad ?? 0}-${o.plano ?? true}-${o.doble ?? false}-${o.mapa?.uuid ?? ""}`;
    let m = this.cacheMat.get(k) as THREE.MeshLambertMaterial | undefined;
    if (!m) {
      m = new THREE.MeshLambertMaterial({
        color,
        emissive: o.emisivo ?? 0x000000,
        emissiveIntensity: o.intensidad ?? 1,
        flatShading: o.plano ?? true,
        side: o.doble ? THREE.DoubleSide : THREE.FrontSide,
        map: o.mapa ?? null,
      });
      this.cacheMat.set(k, this.track(m));
    }
    return m;
  }

  /** Material de metal pulido (Phong con brillo, para el revólver y la gafa). */
  metal(color: number, brillo = 60, especular = 0x8899bb) {
    const k = `p${color}-${brillo}-${especular}`;
    let m = this.cacheMat.get(k) as THREE.MeshPhongMaterial | undefined;
    if (!m) {
      m = new THREE.MeshPhongMaterial({ color, shininess: brillo, specular: especular, flatShading: false });
      this.cacheMat.set(k, this.track(m));
    }
    return m;
  }

  /** Material sin luz (pantallas, luces, brillos). */
  basico(color: number, o: { opacidad?: number; aditivo?: boolean; mapa?: THREE.Texture; doble?: boolean } = {}) {
    return this.track(
      new THREE.MeshBasicMaterial({
        color,
        map: o.mapa ?? null,
        transparent: o.opacidad !== undefined || o.aditivo === true || Boolean(o.mapa),
        opacity: o.opacidad ?? 1,
        blending: o.aditivo ? THREE.AdditiveBlending : THREE.NormalBlending,
        depthWrite: !(o.aditivo || (o.opacidad !== undefined && o.opacidad < 1)),
        side: o.doble ? THREE.DoubleSide : THREE.FrontSide,
        toneMapped: false,
      })
    );
  }

  linea(color: number, opacidad = 1) {
    return this.track(new THREE.LineBasicMaterial({ color, transparent: opacidad < 1, opacity: opacidad, depthWrite: opacidad >= 1 }));
  }

  /** Textura dibujada en un canvas 2D (pantallas, blancos, carteles). */
  textura(w: number, h: number, dibujo: Dibujo) {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d");
    if (ctx) dibujo(ctx, w, h);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return this.track(tex);
  }

  private texHalo?: THREE.Texture;
  /** Sprite aditivo de brillo radial (luces, pulsos). */
  halo(color: number, escala: number, opacidad = 1) {
    this.texHalo ??= this.textura(64, 64, (c, w, h) => {
      const g = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
      g.addColorStop(0, "rgba(255,255,255,1)");
      g.addColorStop(0.25, "rgba(255,255,255,0.55)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      c.fillStyle = g;
      c.fillRect(0, 0, w, h);
    });
    const mat = this.track(
      new THREE.SpriteMaterial({ map: this.texHalo, color, transparent: true, opacity: opacidad, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })
    );
    const s = new THREE.Sprite(mat);
    s.scale.setScalar(escala);
    return s;
  }

  caja(w: number, h: number, d: number, mat: THREE.Material, x = 0, y = 0, z = 0) {
    const m = new THREE.Mesh(this.geo(new THREE.BoxGeometry(w, h, d)), mat);
    m.position.set(x, y, z);
    return m;
  }

  /** Cilindro; por defecto vertical (eje Y). */
  cilindro(rArriba: number, rAbajo: number, alto: number, mat: THREE.Material, seg = 12) {
    return new THREE.Mesh(this.geo(new THREE.CylinderGeometry(rArriba, rAbajo, alto, seg)), mat);
  }

  /** Suelo con retícula tenue, como el resto de escenas del sitio. */
  suelo(tam: number, color: number, linea: number, celda = 1, opLinea = 0.18) {
    const g = new THREE.Group();
    const piso = new THREE.Mesh(this.geo(new THREE.PlaneGeometry(tam, tam)), this.mate(color, { plano: true }));
    piso.rotation.x = -Math.PI / 2;
    g.add(piso);
    const pts: number[] = [];
    const n = Math.floor(tam / celda / 2);
    for (let i = -n; i <= n; i++) {
      pts.push(i * celda, 0.005, -n * celda, i * celda, 0.005, n * celda);
      pts.push(-n * celda, 0.005, i * celda, n * celda, 0.005, i * celda);
    }
    const geo = this.geo(new THREE.BufferGeometry());
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    g.add(new THREE.LineSegments(geo, this.linea(linea, opLinea)));
    return g;
  }

  dispose() {
    for (const r of this.recursos) r.dispose();
    this.recursos = [];
    this.cacheMat.clear();
  }
}

/** Silueta humana low-poly con articulaciones para animar (cadetes, visitantes…). */
export type Silueta = {
  grupo: THREE.Group;
  cabeza: THREE.Object3D;
  torso: THREE.Object3D;
  brazoI: THREE.Object3D;
  brazoD: THREE.Object3D;
  piernaI: THREE.Object3D;
  piernaD: THREE.Object3D;
};

export type OpcionesSilueta = {
  alto?: number;
  ropa?: number;
  pantalon?: number;
  piel?: number;
  /** Ancho de hombros relativo (1 = normal). */
  ancho?: number;
  gorra?: number;
  encorvado?: number;
};

export function silueta(kit: Kit, o: OpcionesSilueta = {}): Silueta {
  const alto = o.alto ?? 1.75;
  const s = alto / 1.75;
  const ancho = o.ancho ?? 1;
  const mRopa = kit.mate(o.ropa ?? PALETA.french);
  const mPant = kit.mate(o.pantalon ?? PALETA.imperial);
  const mPiel = kit.mate(o.piel ?? PALETA.piel);
  const grupo = new THREE.Group();
  grupo.scale.setScalar(s);

  // Cadera a 0.92 m (en alto 1.75).
  const cadera = new THREE.Group();
  cadera.position.y = 0.92;
  grupo.add(cadera);

  const torso = new THREE.Group();
  cadera.add(torso);
  const pecho = new THREE.Mesh(kit.geo(new THREE.CylinderGeometry(0.19 * ancho, 0.15 * ancho, 0.56, 7)), mRopa);
  pecho.position.y = 0.3;
  torso.add(pecho);
  const cuello = new THREE.Mesh(kit.geo(new THREE.CylinderGeometry(0.05, 0.06, 0.08, 6)), mPiel);
  cuello.position.y = 0.62;
  torso.add(cuello);
  const cabeza = new THREE.Group();
  cabeza.position.y = 0.76;
  torso.add(cabeza);
  const craneo = new THREE.Mesh(kit.geo(new THREE.IcosahedronGeometry(0.11, 1)), mPiel);
  craneo.scale.set(0.92, 1.08, 1);
  cabeza.add(craneo);
  if (o.gorra !== undefined) {
    const mG = kit.mate(o.gorra);
    const copa = new THREE.Mesh(kit.geo(new THREE.SphereGeometry(0.115, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2)), mG);
    copa.position.y = 0.03;
    cabeza.add(copa);
    const visera = kit.caja(0.16, 0.012, 0.1, mG, 0, 0.035, 0.1);
    cabeza.add(visera);
  }

  const brazo = (lado: 1 | -1) => {
    const hombro = new THREE.Group();
    hombro.position.set(0.215 * ancho * lado, 0.54, 0);
    torso.add(hombro);
    const sup = new THREE.Mesh(kit.geo(new THREE.CylinderGeometry(0.05, 0.045, 0.32, 6)), mRopa);
    sup.position.y = -0.16;
    hombro.add(sup);
    const ante = new THREE.Mesh(kit.geo(new THREE.CylinderGeometry(0.042, 0.036, 0.28, 6)), mRopa);
    ante.position.y = -0.45;
    hombro.add(ante);
    const mano = new THREE.Mesh(kit.geo(new THREE.IcosahedronGeometry(0.045, 0)), mPiel);
    mano.position.y = -0.62;
    hombro.add(mano);
    return hombro;
  };
  const pierna = (lado: 1 | -1) => {
    const g = new THREE.Group();
    g.position.set(0.09 * lado, 0, 0);
    cadera.add(g);
    const p = new THREE.Mesh(kit.geo(new THREE.CylinderGeometry(0.075, 0.055, 0.86, 6)), mPant);
    p.position.y = -0.43;
    g.add(p);
    const pie = kit.caja(0.1, 0.06, 0.22, kit.mate(0x0b1222), 0, -0.88, 0.04);
    g.add(pie);
    return g;
  };
  const brazoI = brazo(-1);
  const brazoD = brazo(1);
  const piernaI = pierna(-1);
  const piernaD = pierna(1);
  if (o.encorvado) torso.rotation.x = o.encorvado;
  return { grupo, cabeza, torso, brazoI, brazoD, piernaI, piernaD };
}

/** Pose de trote: `f` es la fase 0..1 del paso. */
export function poseTrote(sil: Silueta, f: number, amp = 1) {
  const a = Math.sin(f * Math.PI * 2);
  sil.piernaI.rotation.x = a * 0.6 * amp;
  sil.piernaD.rotation.x = -a * 0.6 * amp;
  sil.brazoI.rotation.x = -a * 0.7 * amp - 0.2;
  sil.brazoD.rotation.x = a * 0.7 * amp - 0.2;
  sil.brazoI.rotation.z = -0.08;
  sil.brazoD.rotation.z = 0.08;
  sil.torso.rotation.x = 0.08 * amp;
  sil.grupo.position.y = Math.abs(Math.cos(f * Math.PI * 2)) * 0.05 * amp;
}

/** Respiración / balanceo en reposo. */
export function poseReposo(sil: Silueta, t: number, desfase = 0) {
  const r = Math.sin(t * 1.3 + desfase);
  sil.torso.rotation.z = r * 0.015;
  sil.cabeza.rotation.y = Math.sin(t * 0.4 + desfase * 2) * 0.25;
  sil.brazoI.rotation.z = -0.06 - r * 0.01;
  sil.brazoD.rotation.z = 0.06 + r * 0.01;
}

/** Fondo de pantalla «ARS» para tabletas y paneles. */
export function fondoPantalla(c: CanvasRenderingContext2D, w: number, h: number, titulo: string, acento = "#6b8aff") {
  const g = c.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, "#0b1a44");
  g.addColorStop(1, "#06102a");
  c.fillStyle = g;
  c.fillRect(0, 0, w, h);
  c.fillStyle = acento;
  c.fillRect(0, 0, w, Math.max(4, h * 0.012));
  c.fillStyle = "rgba(213,224,255,0.95)";
  c.font = `700 ${Math.round(h * 0.07)}px system-ui, sans-serif`;
  c.fillText("ARS", w * 0.05, h * 0.12);
  c.fillStyle = "rgba(213,224,255,0.7)";
  c.font = `500 ${Math.round(h * 0.045)}px system-ui, sans-serif`;
  c.fillText(titulo, w * 0.05 + h * 0.2, h * 0.115);
}

/** Barra de texto simulado (renglón gris redondeado). */
export function renglon(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color = "rgba(213,224,255,0.28)") {
  c.fillStyle = color;
  const r = h / 2;
  c.beginPath();
  c.moveTo(x + r, y);
  c.lineTo(x + w - r, y);
  c.arc(x + w - r, y + r, r, -Math.PI / 2, Math.PI / 2);
  c.lineTo(x + r, y + h);
  c.arc(x + r, y + r, r, Math.PI / 2, (Math.PI * 3) / 2);
  c.fill();
}

/** Código QR estilizado (patrón pseudoaleatorio con los tres marcadores). */
export function dibujarQR(c: CanvasRenderingContext2D, x: number, y: number, tam: number, semilla = 7) {
  const n = 21;
  const p = tam / n;
  const rnd = mulberry32(semilla);
  c.fillStyle = "#ffffff";
  c.fillRect(x - p, y - p, tam + p * 2, tam + p * 2);
  c.fillStyle = "#06102a";
  const marcador = (i: number, j: number) => i < 7 && j < 7;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const enMarca = marcador(i, j) || marcador(n - 1 - i, j) || marcador(i, n - 1 - j);
      if (enMarca) continue;
      if (rnd() > 0.52) c.fillRect(x + i * p, y + j * p, p, p);
    }
  }
  const marca = (mx: number, my: number) => {
    c.fillRect(mx, my, p * 7, p * 7);
    c.fillStyle = "#ffffff";
    c.fillRect(mx + p, my + p, p * 5, p * 5);
    c.fillStyle = "#06102a";
    c.fillRect(mx + p * 2, my + p * 2, p * 3, p * 3);
  };
  marca(x, y);
  marca(x + (n - 7) * p, y);
  marca(x, y + (n - 7) * p);
}
