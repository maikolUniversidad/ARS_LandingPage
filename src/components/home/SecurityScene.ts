import * as THREE from "three";
import { CHAPTERS, clamp01, ramp, smooth } from "./story";

/**
 * Escena 3D del home: un "gemelo digital" de una sede protegida por ARS.
 *
 * Todo es geometría procedural (sin descargas): edificios, cerca perimetral,
 * cámaras con su cono de visión, guardas patrullando, el núcleo de IA flotando
 * sobre la sede y, al hacer zoom out, la red de sedes conectadas.
 *
 * El estado de la escena es una función pura del capítulo continuo `chapter`
 * (lo da el scroll) + un reloj para las animaciones ambientales. Un solo
 * WebGLRenderer, sin sombras ni post-procesado: el brillo sale de sprites
 * aditivos y de un shader de suelo, así un móvil medio llega fluido.
 */

export type Anchor = { x: number; y: number; visible: boolean };
export type Anchors = {
  intruder: Anchor;
  core: Anchor;
  control: Anchor;
  guard: Anchor;
};

export type SceneOptions = {
  lowPower: boolean;
  reducedMotion: boolean;
  onAnchors?: (anchors: Anchors) => void;
  onContextLost?: () => void;
};

const COLOR = {
  deep: 0x020a18,
  building: 0x12285a,
  french: 0x1d3885,
  indigo: 0x2348d4,
  bright: 0x6b8aff,
  ice: 0xd5e0ff,
  cyan: 0x5fd8ff,
  red: 0xff3b5c,
  amber: 0xffb547,
  green: 0x35e0a1,
};

const v3 = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

/** Encuadre de cámara por capítulo (mismo orden que CHAPTERS). */
const KEYFRAMES: Array<{ pos: THREE.Vector3; target: THREE.Vector3 }> = [
  { pos: v3(58, 40, 62), target: v3(0, 2, 0) }, // hero
  { pos: v3(34, 21, 40), target: v3(0, 0, 1) }, // capa 1 · prevención
  { pos: v3(42, 9, 25), target: v3(21, 1.5, 4) }, // evento · cruce de cerca
  { pos: v3(31, 7.5, 15), target: v3(18.5, 3, 4) }, // capa 2 · detección IA
  { pos: v3(20, 27, 38), target: v3(2, 7, 2) }, // alerta con evidencia
  { pos: v3(13, 44, 33), target: v3(11, 0, 6) }, // capa 3 · respuesta
  { pos: v3(0, 125, 118), target: v3(0, 0, 0) }, // escala · multi-sede
];

if (KEYFRAMES.length !== CHAPTERS.length) {
  throw new Error("KEYFRAMES y CHAPTERS deben tener la misma longitud");
}

// Puntos clave de la historia
const INTRUDER_PATH = new THREE.CatmullRomCurve3([
  v3(31, 0, 8.5),
  v3(26, 0, 6.5),
  v3(22, 0, 5),
  v3(19.5, 0, 4),
  v3(17, 0, 3.2),
]);
const TRIGGER_CAM_INDEX = 1;
const CORE_POS = v3(0, 16, 0);
const CONTROL_POS = v3(-12, 0, 9);
const DISPATCH_PATH = new THREE.CatmullRomCurve3([
  v3(6, 0, 11),
  v3(12, 0, 10.5),
  v3(15.5, 0, 7),
  v3(16.4, 0, 4.4),
]);

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function glowTexture() {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.25, "rgba(255,255,255,0.55)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  // Simétrica: sin flipY evitamos dejar UNPACK_FLIP_Y activo (warning en texturas 3D internas).
  tex.flipY = false;
  return tex;
}

const GROUND_VERT = /* glsl */ `
  varying vec3 vWorld;
  void main() {
    vec4 w = modelMatrix * vec4(position, 1.0);
    vWorld = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;

const GROUND_FRAG = /* glsl */ `
  uniform vec3 uBase;
  uniform vec3 uLine;
  uniform vec3 uMajor;
  uniform vec3 uAlertColor;
  uniform vec3 uAlertPos;
  uniform float uAlert;
  uniform float uTime;
  uniform float uReach;
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
    float minor = gridLine(p, 2.0) * 0.28;
    float major = gridLine(p, 10.0) * 0.75;
    vec3 col = uBase;
    col += uLine * minor * fade;
    col += uMajor * major * fade;
    // placa iluminada bajo la sede
    float plate = smoothstep(34.0, 6.0, d);
    col += uLine * plate * 0.12;
    // onda de alerta desde el punto de intrusión
    float ad = length(p - uAlertPos.xz);
    float wave = pow(0.5 + 0.5 * sin(ad * 0.85 - uTime * 4.0), 10.0);
    col += uAlertColor * wave * exp(-ad * 0.06) * uAlert * 0.55;
    gl_FragColor = vec4(col, 1.0);
  }
`;

type Guard = {
  mesh: THREE.Group;
  patrol: THREE.CatmullRomCurve3;
  period: number;
  offset: number;
};

class Stream {
  readonly points: THREE.Points;
  private readonly curve: THREE.QuadraticBezierCurve3;
  private readonly positions: Float32Array;
  private readonly count: number;
  private readonly tmp = new THREE.Vector3();
  private readonly material: THREE.PointsMaterial;

  constructor(from: THREE.Vector3, to: THREE.Vector3, lift: number, color: number, count: number, map: THREE.Texture, size: number) {
    const mid = from.clone().lerp(to, 0.5);
    mid.y += lift;
    this.curve = new THREE.QuadraticBezierCurve3(from, mid, to);
    this.count = count;
    this.positions = new Float32Array(count * 3);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(this.positions, 3));
    this.material = new THREE.PointsMaterial({
      color,
      size,
      map,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    this.points = new THREE.Points(geo, this.material);
    this.points.frustumCulled = false;
  }

  update(time: number, intensity: number) {
    this.points.visible = intensity > 0.01;
    if (!this.points.visible) return;
    this.material.opacity = intensity;
    for (let i = 0; i < this.count; i++) {
      const t = (time * 0.45 + i / this.count) % 1;
      this.curve.getPoint(t, this.tmp);
      this.positions[i * 3] = this.tmp.x;
      this.positions[i * 3 + 1] = this.tmp.y + Math.sin(i * 12.9 + time * 3) * 0.12;
      this.positions[i * 3 + 2] = this.tmp.z;
    }
    (this.points.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
  }
}

export class SecurityScene {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(45, 1, 0.5, 900);
  private readonly opts: SceneOptions;
  private readonly glow: THREE.Texture;

  private width = 1;
  private height = 1;
  private portrait = false;
  private maxDpr: number;
  private dpr: number;

  private targetChapter = 0;
  private chapter = 0;
  private time = 0;
  private raf = 0;
  private running = false;
  private last = 0;
  private frameAcc = 0;
  private frameCount = 0;

  // Objetos animados
  private readonly groundUniforms: Record<string, THREE.IUniform>;
  private readonly cones: THREE.Mesh<THREE.ConeGeometry, THREE.MeshBasicMaterial>[] = [];
  private readonly camLeds: THREE.Sprite[] = [];
  private readonly guards: Guard[] = [];
  private readonly checkpoints: THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>[] = [];
  private readonly intruder = new THREE.Group();
  private readonly intruderMat: THREE.MeshBasicMaterial;
  private readonly intruderGlow: THREE.Sprite;
  private readonly detectBox: THREE.LineSegments<THREE.EdgesGeometry, THREE.LineBasicMaterial>;
  private readonly scanRing: THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>;
  private readonly breach: THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial>;
  private readonly core = new THREE.Group();
  private readonly coreShell: THREE.LineSegments<THREE.EdgesGeometry, THREE.LineBasicMaterial>;
  private readonly coreInner: THREE.Mesh<THREE.IcosahedronGeometry, THREE.MeshBasicMaterial>;
  private readonly coreGlow: THREE.Sprite;
  private readonly streamUp: Stream;
  private readonly streamAlert: Stream;
  private readonly pulses: THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>[] = [];
  private readonly controlWindow: THREE.MeshBasicMaterial;
  private readonly beacon: THREE.Mesh<THREE.CylinderGeometry, THREE.MeshBasicMaterial>;
  private readonly dispatchLine: THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial>;
  private readonly dispatchCount: number;
  private readonly resolvedRing: THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>;
  private readonly network = new THREE.Group();
  private readonly networkMats: Array<THREE.MeshBasicMaterial | THREE.LineBasicMaterial | THREE.SpriteMaterial> = [];
  private readonly arcs: Array<{ line: THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial>; count: number; delay: number }> = [];
  private readonly dust: THREE.Points;

  private readonly tmpA = new THREE.Vector3();
  private readonly tmpB = new THREE.Vector3();
  private readonly tmpC = new THREE.Vector3();
  private readonly colRed = new THREE.Color(COLOR.red);
  private readonly colAmber = new THREE.Color(COLOR.amber);
  private readonly colGreen = new THREE.Color(COLOR.green);
  private readonly colIndigo = new THREE.Color(COLOR.indigo);
  private readonly colCyan = new THREE.Color(COLOR.cyan);

  constructor(canvas: HTMLCanvasElement, opts: SceneOptions) {
    this.opts = opts;
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: !opts.lowPower,
      alpha: false,
      powerPreference: "high-performance",
    });
    this.maxDpr = Math.min(window.devicePixelRatio || 1, opts.lowPower ? 1.5 : 2);
    this.dpr = this.maxDpr;
    this.renderer.setPixelRatio(this.dpr);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.setClearColor(COLOR.deep, 1);

    canvas.addEventListener("webglcontextlost", this.handleContextLost, false);

    this.scene.background = new THREE.Color(COLOR.deep);
    this.scene.fog = new THREE.FogExp2(COLOR.deep, 0.011);
    this.glow = glowTexture();

    // Luces (sin sombras)
    this.scene.add(new THREE.HemisphereLight(0x8aa2ff, 0x0a1736, 2.2));
    const key = new THREE.DirectionalLight(0xd5e0ff, 2.2);
    key.position.set(30, 50, 20);
    this.scene.add(key);

    // Suelo con grilla procedural
    this.groundUniforms = {
      uBase: { value: new THREE.Color(0x030c1e) },
      uLine: { value: new THREE.Color(COLOR.french) },
      uMajor: { value: new THREE.Color(COLOR.indigo) },
      uAlertColor: { value: new THREE.Color(COLOR.red) },
      uAlertPos: { value: INTRUDER_PATH.getPoint(1) },
      uAlert: { value: 0 },
      uTime: { value: 0 },
      uReach: { value: 0.022 },
    };
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(700, 700),
      new THREE.ShaderMaterial({
        vertexShader: GROUND_VERT,
        fragmentShader: GROUND_FRAG,
        uniforms: this.groundUniforms,
      })
    );
    ground.rotation.x = -Math.PI / 2;
    this.scene.add(ground);

    this.buildSite();
    this.buildCameras();
    this.buildGuards();

    // Intruso
    this.intruderMat = new THREE.MeshBasicMaterial({ color: COLOR.red, transparent: true });
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.42, 0.95, 4, 10), this.intruderMat);
    body.position.y = 0.9;
    this.intruder.add(body);
    this.intruderGlow = this.sprite(COLOR.red, 4.5);
    this.intruderGlow.position.y = 0.4;
    this.intruder.add(this.intruderGlow);
    this.scene.add(this.intruder);

    this.detectBox = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(1.7, 2.5, 1.7)),
      new THREE.LineBasicMaterial({ color: COLOR.amber, transparent: true, depthTest: false })
    );
    this.detectBox.renderOrder = 5;
    this.scene.add(this.detectBox);

    this.scanRing = new THREE.Mesh(
      new THREE.RingGeometry(1.6, 1.75, 48),
      new THREE.MeshBasicMaterial({ color: COLOR.amber, transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending })
    );
    this.scanRing.rotation.x = -Math.PI / 2;
    this.scene.add(this.scanRing);

    // Tramo de cerca vulnerado
    const breachGeo = new THREE.BufferGeometry().setFromPoints([v3(22, 0.05, 1.5), v3(22, 1.7, 1.5), v3(22, 1.7, 8.5), v3(22, 0.05, 8.5), v3(22, 0.05, 1.5)]);
    this.breach = new THREE.Line(breachGeo, new THREE.LineBasicMaterial({ color: COLOR.red, transparent: true, opacity: 0 }));
    this.scene.add(this.breach);

    // Núcleo de IA
    this.coreShell = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(2.4, 1)),
      new THREE.LineBasicMaterial({ color: COLOR.bright, transparent: true })
    );
    this.coreInner = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.5, 0),
      new THREE.MeshBasicMaterial({ color: COLOR.indigo, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false })
    );
    this.coreGlow = this.sprite(COLOR.indigo, 14);
    this.core.add(this.coreShell, this.coreInner, this.coreGlow);
    this.core.position.copy(CORE_POS);
    this.scene.add(this.core);

    const camHead = this.cones[TRIGGER_CAM_INDEX].position.clone();
    const particleCount = opts.lowPower ? 26 : 48;
    this.streamUp = new Stream(camHead, CORE_POS, 6, COLOR.amber, particleCount, this.glow, 0.9);
    this.streamAlert = new Stream(CORE_POS, CONTROL_POS.clone().setY(3.8), 5, COLOR.red, particleCount, this.glow, 0.9);
    this.scene.add(this.streamUp.points, this.streamAlert.points);

    // Ondas de alerta en el punto de intrusión
    for (let i = 0; i < 3; i++) {
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.9, 1.05, 48),
        new THREE.MeshBasicMaterial({ color: COLOR.red, transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending })
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.copy(INTRUDER_PATH.getPoint(1)).setY(0.06);
      this.pulses.push(ring);
      this.scene.add(ring);
    }

    // Central de monitoreo: ventana + faro de alerta
    this.controlWindow = new THREE.MeshBasicMaterial({ color: COLOR.bright });
    const win = new THREE.Mesh(new THREE.BoxGeometry(5.2, 1.1, 0.1), this.controlWindow);
    win.position.set(CONTROL_POS.x, 2.1, CONTROL_POS.z + 2.56);
    this.scene.add(win);
    this.beacon = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.9, 34, 16, 1, true),
      new THREE.MeshBasicMaterial({ color: COLOR.red, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide })
    );
    this.beacon.position.set(CONTROL_POS.x, 17 + 3.6, CONTROL_POS.z);
    this.scene.add(this.beacon);

    // Ruta de despacho
    const dispatchPts = DISPATCH_PATH.getPoints(80).map((p) => p.setY(0.12));
    this.dispatchCount = dispatchPts.length;
    this.dispatchLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(dispatchPts),
      new THREE.LineBasicMaterial({ color: COLOR.cyan, transparent: true })
    );
    this.scene.add(this.dispatchLine);

    this.resolvedRing = new THREE.Mesh(
      new THREE.RingGeometry(2.1, 2.35, 64),
      new THREE.MeshBasicMaterial({ color: COLOR.green, transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending })
    );
    this.resolvedRing.rotation.x = -Math.PI / 2;
    this.resolvedRing.position.copy(INTRUDER_PATH.getPoint(1)).setY(0.08);
    this.scene.add(this.resolvedRing);

    this.buildNetwork();

    // Polvo ambiental
    const rand = mulberry32(7);
    const dustCount = opts.lowPower ? 260 : 900;
    const dustPos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      dustPos[i * 3] = (rand() - 0.5) * 170;
      dustPos[i * 3 + 1] = rand() * 45 + 1;
      dustPos[i * 3 + 2] = (rand() - 0.5) * 170;
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
    this.dust = new THREE.Points(
      dustGeo,
      new THREE.PointsMaterial({ color: COLOR.ice, size: 0.32, map: this.glow, transparent: true, opacity: 0.4, depthWrite: false, blending: THREE.AdditiveBlending })
    );
    this.scene.add(this.dust);
  }

  // ───────────────────────── Construcción ─────────────────────────

  private sprite(color: number, scale: number) {
    const s = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: this.glow, color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })
    );
    s.scale.setScalar(scale);
    return s;
  }

  private addBuilding(x: number, z: number, w: number, h: number, d: number, floors = 0) {
    const group = new THREE.Group();
    const box = new THREE.BoxGeometry(w, h, d);
    const mesh = new THREE.Mesh(box, new THREE.MeshStandardMaterial({ color: COLOR.building, roughness: 0.85, metalness: 0.15 }));
    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(box),
      new THREE.LineBasicMaterial({ color: 0x4a6dff, transparent: true, opacity: 0.95 })
    );
    group.add(mesh, edges);
    if (floors > 0) {
      const bandMat = new THREE.MeshBasicMaterial({ color: COLOR.french, transparent: true, opacity: 0.7 });
      for (let i = 1; i <= floors; i++) {
        const band = new THREE.Mesh(new THREE.BoxGeometry(w + 0.04, 0.12, d + 0.04), bandMat);
        band.position.y = -h / 2 + (h / (floors + 1)) * i;
        group.add(band);
      }
    }
    group.position.set(x, h / 2, z);
    this.scene.add(group);
  }

  private buildSite() {
    this.addBuilding(-5, -4, 14, 8, 9, 3); // edificio principal
    this.addBuilding(10, -7, 10, 5, 7, 1); // bodega
    this.addBuilding(-16, -9, 4.5, 11, 4.5, 4); // torre
    this.addBuilding(CONTROL_POS.x, CONTROL_POS.z, 6, 3.6, 5); // central de monitoreo
    this.addBuilding(1, 13.4, 3, 2.4, 2.4); // portería

    // Cerca perimetral: postes instanciados + dos rieles
    const W = 22;
    const D = 15;
    const corners = [v3(-W, 0, -D), v3(W, 0, -D), v3(W, 0, D), v3(-W, 0, D)];
    const postGeo = new THREE.BoxGeometry(0.14, 1.8, 0.14);
    const postPositions: THREE.Vector3[] = [];
    for (let i = 0; i < 4; i++) {
      const a = corners[i];
      const b = corners[(i + 1) % 4];
      const len = a.distanceTo(b);
      const steps = Math.round(len / 2.4);
      for (let s = 0; s < steps; s++) postPositions.push(a.clone().lerp(b, s / steps));
    }
    const posts = new THREE.InstancedMesh(postGeo, new THREE.MeshBasicMaterial({ color: COLOR.french }), postPositions.length);
    const m = new THREE.Matrix4();
    postPositions.forEach((p, i) => {
      m.makeTranslation(p.x, 0.9, p.z);
      posts.setMatrixAt(i, m);
    });
    this.scene.add(posts);
    for (const y of [0.7, 1.75]) {
      const rail = new THREE.LineLoop(
        new THREE.BufferGeometry().setFromPoints(corners.map((c) => c.clone().setY(y))),
        new THREE.LineBasicMaterial({ color: COLOR.bright, transparent: true, opacity: 0.55 })
      );
      this.scene.add(rail);
    }
  }

  private buildCameras() {
    const cams: Array<[THREE.Vector3, THREE.Vector3]> = [
      [v3(21, 5.2, -14), v3(13, 0, -4)],
      [v3(21, 5.2, 13.5), v3(19.5, 0, 3.6)], // cámara que detecta la intrusión
      [v3(-21, 5.2, -14), v3(-12, 0, -3)],
      [v3(-21, 5.2, 14), v3(-11, 0, 4)],
      [v3(0, 5.2, -14.2), v3(3, 0, -11)],
      [v3(8, 5.2, 14.2), v3(6, 0, 6)],
    ];
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x2a3b66, roughness: 0.6, metalness: 0.4 });
    const headMat = new THREE.MeshStandardMaterial({ color: 0x9eb0c0, roughness: 0.4, metalness: 0.6 });
    const down = v3(0, -1, 0);
    for (const [head, target] of cams) {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, head.y, 8), poleMat);
      pole.position.set(head.x, head.y / 2, head.z);
      this.scene.add(pole);

      const dir = target.clone().sub(head);
      const len = dir.length();
      dir.normalize();

      const camBody = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.45, 1), headMat);
      camBody.position.copy(head);
      camBody.lookAt(target);
      this.scene.add(camBody);

      const led = this.sprite(COLOR.bright, 1.4);
      led.position.copy(head).addScaledVector(dir, 0.6);
      this.camLeds.push(led);
      this.scene.add(led);

      const coneGeo = new THREE.ConeGeometry(len * 0.42, len, 28, 1, true);
      coneGeo.translate(0, -len / 2, 0); // vértice en el origen
      const cone = new THREE.Mesh(
        coneGeo,
        new THREE.MeshBasicMaterial({ color: COLOR.indigo, transparent: true, opacity: 0.07, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending })
      );
      cone.position.copy(head);
      cone.quaternion.setFromUnitVectors(down, dir);
      this.cones.push(cone);
      this.scene.add(cone);
    }
  }

  private buildGuards() {
    const loops: THREE.Vector3[][] = [
      [v3(-2, 0, 11), v3(6, 0, 11), v3(6, 0, 4.5), v3(-2, 0, 4.5)],
      [v3(-19.5, 0, -12.5), v3(-19.5, 0, 4), v3(-15.5, 0, 4), v3(-15.5, 0, -12.5)],
      [v3(0, 0, -12.5), v3(17.5, 0, -12.5), v3(17.5, 0, -1.5), v3(4, 0, -1.5)],
    ];
    const pathMat = new THREE.LineDashedMaterial({ color: COLOR.bright, dashSize: 0.6, gapSize: 0.5, transparent: true, opacity: 0.45 });
    const bodyMat = new THREE.MeshBasicMaterial({ color: COLOR.cyan });
    loops.forEach((pts, i) => {
      const patrol = new THREE.CatmullRomCurve3(pts, true, "catmullrom", 0.15);
      const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(patrol.getPoints(120).map((p) => p.setY(0.08))), pathMat);
      line.computeLineDistances();
      this.scene.add(line);

      const g = new THREE.Group();
      const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.38, 0.85, 4, 10), bodyMat);
      body.position.y = 0.82;
      const halo = this.sprite(COLOR.cyan, 3);
      halo.position.y = 0.3;
      g.add(body, halo);
      this.scene.add(g);
      this.guards.push({ mesh: g, patrol, period: 34 + i * 6, offset: i * 0.33 });

      // Puntos de control de ronda
      for (const p of pts.slice(0, 2)) {
        const ring = new THREE.Mesh(
          new THREE.RingGeometry(0.55, 0.7, 32),
          new THREE.MeshBasicMaterial({ color: COLOR.cyan, transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending })
        );
        ring.rotation.x = -Math.PI / 2;
        ring.position.copy(p).setY(0.07);
        this.checkpoints.push(ring);
        this.scene.add(ring);
      }
    });
  }

  private buildNetwork() {
    const rand = mulberry32(42);
    const sites = 9;
    for (let i = 0; i < sites; i++) {
      const angle = (i / sites) * Math.PI * 2 + 0.45;
      const r = 72 + (i % 3) * 20;
      const cx = Math.cos(angle) * r;
      const cz = Math.sin(angle) * r * 0.8;
      const fill = new THREE.MeshBasicMaterial({ color: COLOR.building, transparent: true });
      const edge = new THREE.LineBasicMaterial({ color: COLOR.bright, transparent: true });
      this.networkMats.push(fill, edge);
      const n = 2 + Math.floor(rand() * 3);
      for (let k = 0; k < n; k++) {
        const w = 3 + rand() * 6;
        const h = 2 + rand() * 9;
        const d = 3 + rand() * 6;
        const geo = new THREE.BoxGeometry(w, h, d);
        const mesh = new THREE.Mesh(geo, fill);
        const lines = new THREE.LineSegments(new THREE.EdgesGeometry(geo), edge);
        const px = cx + (rand() - 0.5) * 14;
        const pz = cz + (rand() - 0.5) * 14;
        mesh.position.set(px, h / 2, pz);
        lines.position.copy(mesh.position);
        this.network.add(mesh, lines);
      }
      const beacon = this.sprite(COLOR.bright, 9);
      beacon.position.set(cx, 3, cz);
      this.networkMats.push(beacon.material);
      this.network.add(beacon);

      const from = CORE_POS.clone();
      const to = v3(cx, 3, cz);
      const mid = from.clone().lerp(to, 0.5);
      mid.y += 26;
      const pts = new THREE.QuadraticBezierCurve3(from, mid, to).getPoints(60);
      const arc = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineBasicMaterial({ color: COLOR.bright, transparent: true })
      );
      this.arcs.push({ line: arc, count: pts.length, delay: (i / sites) * 0.35 });
      this.network.add(arc);
    }
    this.scene.add(this.network);
  }

  // ───────────────────────── API pública ─────────────────────────

  setChapter(chapter: number) {
    this.targetChapter = chapter;
    if (this.opts.reducedMotion) {
      this.chapter = chapter;
      this.renderOnce();
    }
  }

  setSize(width: number, height: number) {
    this.width = Math.max(1, width);
    this.height = Math.max(1, height);
    this.portrait = this.width / this.height < 0.85;
    this.renderer.setSize(this.width, this.height, false);
    this.camera.aspect = this.width / this.height;
    this.camera.fov = this.portrait ? 58 : 42;
    // Desplaza el encuadre: a la derecha en escritorio (texto a la izquierda),
    // hacia arriba en móvil (texto abajo).
    if (this.portrait) {
      this.camera.setViewOffset(this.width, this.height, 0, this.height * 0.16, this.width, this.height);
    } else if (this.width >= 900) {
      this.camera.setViewOffset(this.width, this.height, -this.width * 0.15, 0, this.width, this.height);
    } else {
      this.camera.clearViewOffset();
    }
    this.camera.updateProjectionMatrix();
    if (!this.running) this.renderOnce();
  }

  start() {
    if (this.running || this.opts.reducedMotion) {
      if (this.opts.reducedMotion) this.renderOnce();
      return;
    }
    this.running = true;
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.loop);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  dispose() {
    this.stop();
    this.renderer.domElement.removeEventListener("webglcontextlost", this.handleContextLost, false);
    this.scene.traverse((obj) => {
      const o = obj as THREE.Mesh;
      o.geometry?.dispose();
      const mat = o.material;
      if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
      else mat?.dispose();
    });
    this.glow.dispose();
    this.renderer.dispose();
  }

  // ───────────────────────── Loop ─────────────────────────

  private handleContextLost = (e: Event) => {
    e.preventDefault();
    this.stop();
    this.opts.onContextLost?.();
  };

  private loop = (now: number) => {
    if (!this.running) return;
    this.raf = requestAnimationFrame(this.loop);
    // El timestamp del rAF puede ser anterior a performance.now() → nunca negativo.
    const dt = Math.min(Math.max((now - this.last) / 1000, 0), 0.1);
    this.last = now;
    this.time += dt;
    // Amortiguado: la escena "persigue" al scroll, nunca salta.
    this.chapter += (this.targetChapter - this.chapter) * (1 - Math.exp(-dt * 4.5));
    this.update();
    this.renderer.render(this.scene, this.camera);
    this.adaptQuality(dt);
  };

  private renderOnce() {
    this.update();
    this.renderer.render(this.scene, this.camera);
  }

  /** Baja la resolución si el equipo no sostiene ~45 fps. */
  private adaptQuality(dt: number) {
    this.frameAcc += dt;
    this.frameCount++;
    if (this.frameAcc < 1.5) return;
    const fps = this.frameCount / this.frameAcc;
    this.frameAcc = 0;
    this.frameCount = 0;
    if (fps < 45 && this.dpr > 1) {
      this.dpr = Math.max(1, this.dpr - 0.25);
      this.renderer.setPixelRatio(this.dpr);
      this.renderer.setSize(this.width, this.height, false);
    }
  }

  private update() {
    const c = this.chapter;
    const t = this.time;

    // Cámara
    const last = KEYFRAMES.length - 1;
    const i0 = Math.max(0, Math.min(last, Math.floor(c)));
    const i1 = Math.min(last, i0 + 1);
    const f = smooth(c - i0);
    const pos = this.tmpA.lerpVectors(KEYFRAMES[i0].pos, KEYFRAMES[i1].pos, f);
    const target = this.tmpB.lerpVectors(KEYFRAMES[i0].target, KEYFRAMES[i1].target, f);
    const offset = this.tmpC.subVectors(pos, target);
    if (this.portrait) offset.multiplyScalar(1.45);
    const orbit = Math.sin(t * 0.09) * 0.32 * (1 - ramp(c, 0, 1)) + Math.sin(t * 0.21) * 0.025;
    offset.applyAxisAngle(THREE.Object3D.DEFAULT_UP, orbit);
    this.camera.position.copy(target).add(offset);
    this.camera.position.y += Math.sin(t * 0.5) * 0.25;
    this.camera.lookAt(target);

    const fog = this.scene.fog as THREE.FogExp2;
    fog.density = 0.011 - 0.0078 * ramp(c, 4.8, 6);
    this.groundUniforms.uReach.value = 0.022 - 0.014 * ramp(c, 4.8, 6);
    this.groundUniforms.uTime.value = t;

    // Capa 1 — guardas y puntos de control
    const dispatchArm = ramp(c, 4.15, 4.5);
    const dispatchWalk = ramp(c, 4.6, 5.3);
    this.guards.forEach((g, i) => {
      const u = clamp01((((t / g.period + g.offset) % 1) + 1) % 1);
      g.patrol.getPointAt(u, this.tmpA);
      if (i === 0 && dispatchArm > 0) {
        const start = DISPATCH_PATH.getPointAt(0, this.tmpB);
        this.tmpA.lerp(start, dispatchArm);
        if (dispatchWalk > 0) DISPATCH_PATH.getPointAt(dispatchWalk, this.tmpA);
      }
      g.mesh.position.copy(this.tmpA);
    });
    this.checkpoints.forEach((r, i) => {
      const ph = (t * 0.6 + i * 0.37) % 1;
      r.scale.setScalar(1 + ph * 0.9);
      r.material.opacity = (1 - ph) * 0.8 * (0.35 + 0.65 * ramp(c, 0.5, 1));
    });

    // Evento — el intruso cruza la cerca
    const intruderIn = ramp(c, 1.4, 1.75);
    const walk = ramp(c, 1.6, 2.6);
    const resolved = ramp(c, 5.2, 5.5);
    INTRUDER_PATH.getPointAt(walk, this.intruder.position);
    this.intruder.children[0].position.y = 0.9 + Math.abs(Math.sin(t * 7)) * 0.08 * (walk > 0 && walk < 1 ? 1 : 0);
    this.intruder.visible = intruderIn > 0.01;
    this.intruderMat.opacity = intruderIn * (1 - ramp(c, 5.7, 6.1));
    this.intruderMat.color.copy(this.colRed).lerp(this.colAmber, resolved);
    this.intruderGlow.material.opacity = this.intruderMat.opacity * (0.6 + 0.4 * Math.sin(t * 6));
    this.intruderGlow.material.color.copy(this.intruderMat.color);
    this.breach.material.opacity = ramp(c, 2.0, 2.3) * (1 - ramp(c, 5.2, 5.6)) * (0.55 + 0.45 * Math.sin(t * 8));

    // Capa 2 — la cámara detecta, la IA analiza
    const detect = ramp(c, 2.4, 2.85) * (1 - ramp(c, 5.3, 5.7));
    this.cones.forEach((cone, i) => {
      const base = 0.05 + 0.05 * ramp(c, 0.6, 1);
      if (i === TRIGGER_CAM_INDEX) {
        cone.material.opacity = base + detect * 0.07;
        cone.material.color.copy(this.colIndigo).lerp(this.colAmber, detect);
      } else {
        cone.material.opacity = base * (1 - 0.5 * detect);
      }
    });
    this.camLeds.forEach((led, i) => {
      const hot = i === TRIGGER_CAM_INDEX ? detect : 0;
      led.material.color.set(hot > 0.5 ? COLOR.amber : COLOR.bright);
      led.material.opacity = 0.55 + 0.45 * Math.sin(t * (hot > 0.5 ? 10 : 2) + i);
    });

    this.detectBox.visible = detect > 0.01;
    this.detectBox.position.copy(this.intruder.position).setY(1.25);
    this.detectBox.material.opacity = detect;
    this.detectBox.material.color.copy(this.colAmber).lerp(this.colGreen, resolved);
    const scanPh = (t * 0.9) % 1;
    this.scanRing.position.copy(this.intruder.position).setY(0.08);
    this.scanRing.scale.setScalar(0.6 + scanPh * 1.4);
    this.scanRing.material.opacity = detect * (1 - scanPh) * (1 - resolved);

    const analyzing = ramp(c, 2.6, 2.95) * (1 - ramp(c, 4.3, 4.8));
    this.streamUp.update(t, analyzing);
    const coreAwake = 0.45 + 0.55 * ramp(c, 2.5, 3);
    this.core.rotation.y = t * (0.25 + analyzing * 0.9);
    this.core.rotation.x = Math.sin(t * 0.3) * 0.2;
    this.core.position.y = CORE_POS.y + Math.sin(t * 0.8) * 0.4;
    const coreScale = 1 + analyzing * 0.12 * (0.5 + 0.5 * Math.sin(t * 9));
    this.coreShell.scale.setScalar(coreScale);
    this.coreShell.material.opacity = coreAwake;
    this.coreInner.material.opacity = 0.35 + 0.45 * analyzing;
    this.coreGlow.material.opacity = 0.35 + 0.5 * coreAwake;

    // Alerta — la IA dispara la alerta a la central
    const alert = ramp(c, 3.55, 3.9) * (1 - 0.6 * ramp(c, 4.5, 5) - 0.4 * ramp(c, 5.2, 5.5));
    this.streamAlert.update(t + 0.3, alert);
    this.groundUniforms.uAlert.value = alert;
    this.pulses.forEach((ring, i) => {
      const ph = (t * 0.55 + i / 3) % 1;
      ring.scale.setScalar(1 + ph * 9);
      ring.material.opacity = (1 - ph) * alert * 0.9;
    });
    this.controlWindow.color.copy(this.colIndigo).lerp(this.colRed, alert * (0.6 + 0.4 * Math.sin(t * 8)));
    this.beacon.material.opacity = alert * 0.22;

    // Capa 3 — despacho y cierre
    const route = ramp(c, 4.45, 4.95);
    this.dispatchLine.geometry.setDrawRange(0, Math.floor(this.dispatchCount * route));
    this.dispatchLine.material.opacity = route * (1 - ramp(c, 5.8, 6.2));
    this.dispatchLine.material.color.copy(this.colCyan).lerp(this.colGreen, resolved);
    const rPh = (t * 0.5) % 1;
    this.resolvedRing.scale.setScalar(1 + rPh * 0.6);
    this.resolvedRing.material.opacity = resolved * (1 - ramp(c, 5.8, 6.2)) * (1 - rPh * 0.7);

    // Escala — red de sedes
    const net = ramp(c, 5.3, 5.9);
    this.network.visible = net > 0.01;
    for (const mat of this.networkMats) mat.opacity = net;
    for (const arc of this.arcs) {
      const k = clamp01((ramp(c, 5.45, 6) - arc.delay) / (1 - 0.35));
      arc.line.geometry.setDrawRange(0, Math.floor(arc.count * k));
      arc.line.material.opacity = 0.75 * net;
    }

    this.dust.rotation.y = t * 0.01;

    this.emitAnchors(resolved);
  }

  private project(p: THREE.Vector3, visible: boolean): Anchor {
    const v = this.tmpC.copy(p).project(this.camera);
    const onScreen = v.z < 1 && v.x > -1.1 && v.x < 1.1 && v.y > -1.1 && v.y < 1.1;
    return {
      x: (v.x * 0.5 + 0.5) * this.width,
      y: (-v.y * 0.5 + 0.5) * this.height,
      visible: visible && onScreen,
    };
  }

  private emitAnchors(resolved: number) {
    if (!this.opts.onAnchors) return;
    const c = this.chapter;
    const a = this.tmpA.copy(this.intruder.position).setY(2.9);
    const intruder = this.project(a, c > 2.5 && c < 5.6);
    const core = this.project(this.tmpA.copy(this.core.position).setY(this.core.position.y + 3.4), c > 2.7 && c < 4.6);
    const control = this.project(this.tmpA.set(CONTROL_POS.x, 4.6, CONTROL_POS.z), c > 3.6 && c < 5.1);
    const guard = this.project(this.tmpA.copy(this.guards[0].mesh.position).setY(2.4), c > 4.6 && c < 5.7 && resolved < 1);
    this.opts.onAnchors({ intruder, core, control, guard });
  }
}
