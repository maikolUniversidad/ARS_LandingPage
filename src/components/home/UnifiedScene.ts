import * as THREE from "three";
import {
  createDashboard,
  createErpFoundation,
  createHumanoid,
  createQuadruped,
  type BoardStrings,
  type Dashboard,
  type ErpFoundation,
  type ErpStrings,
  type Humanoid,
  type Quadruped,
} from "./models";
import { CHAPTERS, ERP_HEX, LAYER_COUNT, LAYER_HEX, clamp01, erpFocus, erpProgress, ramp, smooth, storyTime } from "./story";

/**
 * Escena 3D del home: una sede donde las cinco capas de la seguridad
 * (vigilancia física, visión con IA, IoT, robótica y central/gerencia) se
 * encienden una tras otra y un mismo evento las recorre dejando UNA traza de
 * luz que termina en el tablero de gerencia.
 *
 * Apertura: las capas flotan apiladas sobre la sede como planos y caen hasta
 * fundirse con ella (todas las capas → una plataforma).
 *
 * Debajo de la sede está el cimiento: el ERP de gestión de ARS. En el capítulo
 * `erp` el suelo se vuelve una retícula transparente, los edificios se
 * vuelven fantasma y se ve cómo cada capa alimenta los módulos de gestión.
 *
 * El estado es una función pura del capítulo continuo `chapter` (scroll) + un
 * reloj ambiental. Un solo WebGLRenderer, sin sombras ni post-procesado.
 */

export type Anchor = { x: number; y: number; visible: boolean };
export const ANCHOR_IDS = ["p0", "p1", "p2", "p3", "p4", "guard", "camera", "sensor", "robot", "central", "board", "erp"] as const;
export type AnchorId = (typeof ANCHOR_IDS)[number];
export type Anchors = Record<AnchorId, Anchor>;

export type SceneOptions = {
  lowPower: boolean;
  reducedMotion: boolean;
  board: BoardStrings;
  erp: ErpStrings;
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
  red: 0xff3b5c,
  amber: 0xffb547,
  green: 0x35e0a1,
};
const [C_FISICA, C_VISION, C_IOT, C_ROBOT, C_CENTRAL] = LAYER_HEX;

const v3 = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

/** Encuadre de cámara por capítulo (mismo orden que CHAPTERS). */
const KEYFRAMES: Array<{ pos: THREE.Vector3; target: THREE.Vector3 }> = [
  { pos: v3(66, 44, 66), target: v3(0, 12, 0) }, // hero · capas apiladas
  { pos: v3(31, 9.5, -27), target: v3(15, 1.2, -11) }, // física · ronda en la cerca norte
  { pos: v3(33, 11, 8), target: v3(17, 2.2, -7) }, // visión · cámara 04
  { pos: v3(31, 9, 3), target: v3(15.5, 2, -6.5) }, // iot · puerta de la bodega
  { pos: v3(25, 7.5, 7), target: v3(15.5, 1, -3.5) }, // robótica · verificación
  { pos: v3(12, 19, 34), target: v3(-8, 5.5, 5) }, // central · tablero
  { pos: v3(23, 30, 44), target: v3(-3, -7.5, 0) }, // erp · el cimiento bajo la sede
  { pos: v3(36, 54, 52), target: v3(2, 3, -1) }, // traza completa
  { pos: v3(0, 132, 126), target: v3(0, 0, 0) }, // escala · todas las sedes
];
if (KEYFRAMES.length !== CHAPTERS.length) throw new Error("KEYFRAMES y CHAPTERS deben tener la misma longitud");

// ── Puntos de la historia ──
const SITE_W = 22;
const SITE_D = 15;
const GUARD_LOOP = [v3(3.5, 0, -1.6), v3(18, 0, -1.6), v3(18, 0, -13.2), v3(3.5, 0, -13.2)];
const CHECKPOINT = v3(15.5, 0, -13.2);
const INTRUDER_PATH = new THREE.CatmullRomCurve3([v3(20, 0, -18), v3(19.3, 0, -14), v3(17.6, 0, -10), v3(16.1, 0, -7.6)]);
const TRIGGER_CAM = 1;
const DOOR = v3(15.06, 0, -7);
const ROBOT_PATH = new THREE.CatmullRomCurve3([v3(3, 0, 3.5), v3(9, 0, 2.2), v3(14.6, 0, -0.6), v3(16.6, 0, -4.6)]);
const SUPERVISOR_PATH = new THREE.CatmullRomCurve3([v3(-5, 0, 5.5), v3(4, 0, 2.6), v3(12, 0, 0.6), v3(15.4, 0, -4.4)]);
const CONTROL = v3(-12, 0, 9);
const BOARD_POS = v3(-12, 8.6, 9);
const BOARD_YAW = 0.68;
const PLATE_Y = [5, 10, 15, 20, 25];

// ── Cimiento ERP ──
const HOLE = new THREE.Vector2(SITE_W + 2, SITE_D + 2);
const SLAB_Y = -7.5;
const SLAB_W = 46;
const SLAB_D = 32;
/** Recorrido de las conversiones sobre las baldosas (turnos → nómina → clientes → finanzas → gobierno). */
const ERP_CHAIN = [0, 1, 4, 5, 6];
/** Baldosa que alimenta cada capa (física, visión, IoT, robótica, central). */
const ERP_FEED = [0, 4, 2, 6, 5];

/** Tramos de la traza: [inicio, fin] en capítulos (uno por segmento). */
const TRACE_WINDOWS: Array<[number, number]> = [
  [1.5, 2.05],
  [2.5, 3.05],
  [3.5, 4.1],
  [4.5, 4.95],
  [4.95, 5.35],
];

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
  uniform float uPlate;
  uniform float uCut;
  uniform vec2 uHole;
  uniform vec3 uErp;
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
    float minor = gridLine(p, 2.0);
    float major = gridLine(p, 10.0);
    col += uLine * minor * 0.26 * fade;
    col += uMajor * major * 0.7 * fade;
    // Corte hacia el cimiento ERP: dentro del rectángulo solo queda la retícula.
    vec2 q = abs(p) - uHole * uCut;
    float edge = max(q.x, q.y);
    if (uCut > 0.001 && edge < 0.0) {
      if (max(minor * 0.7, major) < 0.35) discard;
      col = mix(col, uErp, 0.45);
    }
    col += uErp * exp(-abs(edge) * 1.4) * uCut * 0.55;
    float plate = smoothstep(34.0, 6.0, d);
    col += uLine * plate * (0.08 + 0.1 * uPlate);
    float ad = length(p - uAlertPos.xz);
    float wave = pow(0.5 + 0.5 * sin(ad * 0.8 - uTime * 3.5), 10.0);
    col += uAlertColor * wave * exp(-ad * 0.07) * uAlert * 0.45;
    gl_FragColor = vec4(col, 1.0);
  }
`;

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
    this.material = new THREE.PointsMaterial({ color, size, map, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    this.points = new THREE.Points(geo, this.material);
    this.points.frustumCulled = false;
  }

  update(time: number, intensity: number) {
    this.points.visible = intensity > 0.01;
    if (!this.points.visible) return;
    this.material.opacity = intensity;
    for (let i = 0; i < this.count; i++) {
      const t = (time * 0.4 + i / this.count) % 1;
      this.curve.getPoint(t, this.tmp);
      this.positions[i * 3] = this.tmp.x;
      this.positions[i * 3 + 1] = this.tmp.y + Math.sin(i * 12.9 + time * 3) * 0.1;
      this.positions[i * 3 + 2] = this.tmp.z;
    }
    (this.points.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
  }
}

type Pulse = THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>;
type Plate = { group: THREE.Group; mats: Array<THREE.LineBasicMaterial | THREE.MeshBasicMaterial | THREE.SpriteMaterial>; base: number[] };

export class UnifiedScene {
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

  private readonly groundUniforms: Record<string, THREE.IUniform>;
  private readonly plates: Plate[] = [];
  private readonly stackBeam: THREE.Mesh<THREE.CylinderGeometry, THREE.MeshBasicMaterial>;
  /** Materiales que se encienden con cada capa: [material, opacidad apagada, opacidad encendida]. */
  private readonly layerMats: Array<Array<[{ opacity: number }, number, number]>> = [[], [], [], [], []];

  private readonly guard: Humanoid;
  private readonly guardLoop: THREE.CatmullRomCurve3;
  private readonly guardPhone: THREE.Sprite;
  private readonly supervisor: Humanoid;
  private readonly intruder: Humanoid;
  private readonly intruderGlow: THREE.Sprite;
  private readonly checkpoints: Pulse[] = [];

  private readonly cones: THREE.Mesh<THREE.ConeGeometry, THREE.MeshBasicMaterial>[] = [];
  private readonly camHeads: THREE.Vector3[] = [];
  private readonly detectBox: THREE.LineSegments<THREE.EdgesGeometry, THREE.LineBasicMaterial>;
  private readonly operatorCheck: THREE.Sprite;

  private readonly door: THREE.Group;
  private readonly sensorLeds: THREE.Sprite[] = [];
  private readonly sensorPulses: Pulse[] = [];
  private readonly siren: THREE.MeshBasicMaterial;

  private readonly robot: Quadruped;
  private readonly robotCone: THREE.Mesh<THREE.ConeGeometry, THREE.MeshBasicMaterial>;
  private readonly robotDock: Pulse;
  private readonly robotScan: Pulse;

  private readonly controlWindow: THREE.MeshBasicMaterial;
  private readonly board: Dashboard;
  private readonly boardGlow: THREE.Sprite;
  private readonly streams: Stream[] = [];
  private readonly dispatchLine: THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial>;
  private readonly dispatchCount: number;

  private readonly trace: THREE.Mesh<THREE.TubeGeometry, THREE.MeshBasicMaterial>;
  private readonly traceCurve: THREE.CurvePath<THREE.Vector3>;
  private readonly traceSeg: number[];
  private readonly traceIndexPerSeg: number;
  private readonly traceSegments: number;
  private readonly traceHead: THREE.Sprite;
  private readonly traceRunner: THREE.Sprite;
  private readonly traceNodes: THREE.Sprite[] = [];
  private readonly nodePos: THREE.Vector3[];
  private readonly resolvedRing: Pulse;

  private readonly buildingMats: THREE.MeshStandardMaterial[] = [];
  private readonly erp: ErpFoundation;
  private readonly erpWalls: THREE.MeshBasicMaterial;
  private readonly erpRim: THREE.LineBasicMaterial;
  private readonly erpStreams: Stream[] = [];
  private readonly erpTiles: THREE.Vector3[];
  private readonly erpChain: THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial>;
  private readonly erpChainCurve: THREE.CatmullRomCurve3;
  private readonly erpChainCount: number;
  private readonly erpPulse: THREE.Sprite;

  private readonly network = new THREE.Group();
  private readonly networkMats: Array<THREE.MeshBasicMaterial | THREE.LineBasicMaterial | THREE.SpriteMaterial> = [];
  private readonly arcs: Array<{ line: THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial>; count: number; delay: number; curve: THREE.QuadraticBezierCurve3; spark: THREE.Sprite }> = [];
  private readonly dust: THREE.Points;

  private readonly tmpA = new THREE.Vector3();
  private readonly tmpB = new THREE.Vector3();
  private readonly tmpC = new THREE.Vector3();
  private readonly colAmber = new THREE.Color(COLOR.amber);
  private readonly colGreen = new THREE.Color(COLOR.green);
  private readonly colIndigo = new THREE.Color(COLOR.indigo);
  private readonly colRed = new THREE.Color(COLOR.red);
  private readonly colTrace = new THREE.Color(COLOR.ice);

  constructor(canvas: HTMLCanvasElement, opts: SceneOptions) {
    this.opts = opts;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: !opts.lowPower, alpha: false, powerPreference: "high-performance" });
    this.maxDpr = Math.min(window.devicePixelRatio || 1, opts.lowPower ? 1.5 : 2);
    this.dpr = this.maxDpr;
    this.renderer.setPixelRatio(this.dpr);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.setClearColor(COLOR.deep, 1);
    canvas.addEventListener("webglcontextlost", this.handleContextLost, false);

    this.scene.background = new THREE.Color(COLOR.deep);
    this.scene.fog = new THREE.FogExp2(COLOR.deep, 0.0095);
    this.glow = glowTexture();

    this.scene.add(new THREE.HemisphereLight(0x8aa2ff, 0x0a1736, 2.3));
    const key = new THREE.DirectionalLight(0xd5e0ff, 2.3);
    key.position.set(30, 50, 20);
    this.scene.add(key);

    this.groundUniforms = {
      uBase: { value: new THREE.Color(0x030c1e) },
      uLine: { value: new THREE.Color(COLOR.french) },
      uMajor: { value: new THREE.Color(COLOR.indigo) },
      uAlertColor: { value: new THREE.Color(COLOR.amber) },
      uAlertPos: { value: DOOR.clone() },
      uAlert: { value: 0 },
      uTime: { value: 0 },
      uReach: { value: 0.022 },
      uPlate: { value: 0 },
      uCut: { value: 0 },
      uHole: { value: HOLE.clone() },
      uErp: { value: new THREE.Color(ERP_HEX) },
    };
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(700, 700),
      new THREE.ShaderMaterial({ vertexShader: GROUND_VERT, fragmentShader: GROUND_FRAG, uniforms: this.groundUniforms })
    );
    ground.rotation.x = -Math.PI / 2;
    this.scene.add(ground);

    this.buildSite();

    // ── Capa 01 · Vigilancia física ──
    this.guardLoop = new THREE.CatmullRomCurve3(GUARD_LOOP, true, "catmullrom", 0.1);
    const loopLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(this.guardLoop.getPoints(140).map((p) => p.setY(0.08))),
      new THREE.LineDashedMaterial({ color: C_FISICA, dashSize: 0.6, gapSize: 0.5, transparent: true })
    );
    loopLine.computeLineDistances();
    this.scene.add(loopLine);
    this.onLayer(0, loopLine.material, 0.12, 0.6);
    for (const p of [...GUARD_LOOP, CHECKPOINT]) {
      const ring = this.ring(C_FISICA, 0.5, 0.66);
      ring.position.copy(p).setY(0.07);
      this.checkpoints.push(ring);
    }
    this.guard = createHumanoid(C_FISICA);
    this.scene.add(this.guard.group);
    this.guardPhone = this.sprite(C_FISICA, 2.4);
    this.scene.add(this.guardPhone);
    this.supervisor = createHumanoid(COLOR.bright);
    this.scene.add(this.supervisor.group);
    this.intruder = createHumanoid(COLOR.red, { cap: false, bodyColor: 0x3a0f1e });
    this.scene.add(this.intruder.group);
    this.intruderGlow = this.sprite(COLOR.red, 4);
    this.scene.add(this.intruderGlow);

    // ── Capa 02 · Visión con IA ──
    this.buildCameras();
    this.detectBox = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(1.5, 2.3, 1.5)),
      new THREE.LineBasicMaterial({ color: COLOR.amber, transparent: true, depthTest: false })
    );
    this.detectBox.renderOrder = 5;
    this.scene.add(this.detectBox);
    this.operatorCheck = this.sprite(COLOR.green, 1.6);
    this.scene.add(this.operatorCheck);

    // ── Capa 03 · IoT ──
    this.door = new THREE.Group();
    const doorSlab = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.6, 2.2), new THREE.MeshStandardMaterial({ color: 0x2a3e78, roughness: 0.5, metalness: 0.4 }));
    doorSlab.position.set(0, 1.3, -1.1);
    this.door.add(doorSlab);
    this.door.position.set(DOOR.x + 0.02, 0, DOOR.z + 1.1);
    this.scene.add(this.door);
    this.siren = new THREE.MeshBasicMaterial({ color: COLOR.red, transparent: true, opacity: 0.2 });
    const siren = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.3, 12), this.siren);
    siren.position.set(DOOR.x + 0.15, 3.6, DOOR.z - 1.8);
    this.scene.add(siren);
    this.buildSensors();

    // ── Capa 04 · Robótica (laboratorio) ──
    this.robot = createQuadruped(C_ROBOT);
    this.scene.add(this.robot.group);
    const rcGeo = new THREE.ConeGeometry(2.2, 6, 24, 1, true);
    rcGeo.translate(0, -3, 0);
    this.robotCone = new THREE.Mesh(
      rcGeo,
      new THREE.MeshBasicMaterial({ color: C_ROBOT, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending })
    );
    this.scene.add(this.robotCone);
    this.robotDock = this.ring(C_ROBOT, 1.3, 1.45);
    this.robotDock.position.copy(ROBOT_PATH.getPoint(0)).setY(0.06);
    this.robotScan = this.ring(C_ROBOT, 1.5, 1.62);

    // ── Capa 05 · Central y gerencia ──
    this.controlWindow = new THREE.MeshBasicMaterial({ color: COLOR.bright });
    const win = new THREE.Mesh(new THREE.BoxGeometry(5.2, 1.1, 0.1), this.controlWindow);
    win.position.set(CONTROL.x, 2.1, CONTROL.z + 2.56);
    this.scene.add(win);
    this.board = createDashboard(10, opts.board);
    this.board.group.position.copy(BOARD_POS);
    this.board.group.rotation.y = BOARD_YAW;
    this.scene.add(this.board.group);
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, BOARD_POS.y - 3.6 - 2.8, 6), new THREE.MeshBasicMaterial({ color: COLOR.french }));
    mast.position.set(CONTROL.x, 3.6 + (BOARD_POS.y - 3.6 - 2.8) / 2, CONTROL.z);
    this.scene.add(mast);
    this.boardGlow = this.sprite(COLOR.bright, 18);
    this.boardGlow.position.copy(BOARD_POS);
    this.scene.add(this.boardGlow);

    // Nodos de la traza: ronda → cámara → sensor → robot → central → gerencia
    const robotEnd = ROBOT_PATH.getPoint(1);
    this.nodePos = [
      CHECKPOINT.clone().setY(1.7),
      this.camHeads[TRIGGER_CAM].clone(),
      v3(DOOR.x + 0.1, 2.75, DOOR.z - 1.3),
      robotEnd.clone().setY(1.2),
      v3(CONTROL.x, 4.1, CONTROL.z),
      BOARD_POS.clone().setY(BOARD_POS.y - 2.4),
    ];
    const lifts = [5, 3.5, 3, 9, 1.2];
    this.traceCurve = new THREE.CurvePath<THREE.Vector3>();
    for (let i = 0; i < this.nodePos.length - 1; i++) {
      const a = this.nodePos[i];
      const b = this.nodePos[i + 1];
      const mid = a.clone().lerp(b, 0.5);
      mid.y += lifts[i];
      this.traceCurve.add(new THREE.QuadraticBezierCurve3(a, mid, b));
    }
    const lengths = this.traceCurve.getCurveLengths();
    const total = lengths[lengths.length - 1];
    this.traceSeg = lengths.map((l, i) => (l - (i ? lengths[i - 1] : 0)) / total);
    this.traceSegments = opts.lowPower ? 260 : 420;
    const radial = 6;
    this.traceIndexPerSeg = radial * 6;
    this.trace = new THREE.Mesh(
      new THREE.TubeGeometry(this.traceCurve, this.traceSegments, 0.11, radial, false),
      new THREE.MeshBasicMaterial({ color: COLOR.ice, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })
    );
    this.trace.frustumCulled = false;
    this.scene.add(this.trace);
    this.traceHead = this.sprite(COLOR.ice, 3.2);
    this.traceRunner = this.sprite(COLOR.ice, 2.2);
    this.scene.add(this.traceHead, this.traceRunner);
    const nodeColors = [C_FISICA, C_VISION, C_IOT, C_ROBOT, C_CENTRAL, COLOR.green];
    this.nodePos.forEach((p, i) => {
      const s = this.sprite(nodeColors[i], 2.6);
      s.position.copy(p);
      this.traceNodes.push(s);
      this.scene.add(s);
    });

    // Todo fluye a la central
    const pc = opts.lowPower ? 18 : 34;
    const sink = v3(CONTROL.x, 4.1, CONTROL.z);
    this.streams.push(
      new Stream(this.nodePos[0], sink, 9, C_FISICA, pc, this.glow, 0.7),
      new Stream(this.nodePos[1], sink, 8, C_VISION, pc, this.glow, 0.7),
      new Stream(this.nodePos[2], sink, 10, C_IOT, pc, this.glow, 0.7),
      new Stream(this.nodePos[3], sink, 7, C_ROBOT, pc, this.glow, 0.7)
    );
    this.streams.forEach((s) => this.scene.add(s.points));

    const dispatchPts = SUPERVISOR_PATH.getPoints(80).map((p) => p.setY(0.12));
    this.dispatchCount = dispatchPts.length;
    this.dispatchLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints(dispatchPts), new THREE.LineBasicMaterial({ color: COLOR.bright, transparent: true }));
    this.scene.add(this.dispatchLine);

    this.resolvedRing = this.ring(COLOR.green, 2.1, 2.35);
    this.resolvedRing.position.copy(INTRUDER_PATH.getPoint(1)).setY(0.08);

    this.buildPlates();
    this.stackBeam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, 30, 8, 1, true),
      new THREE.MeshBasicMaterial({ color: COLOR.ice, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })
    );
    this.stackBeam.position.set(0, 15, 0);
    this.scene.add(this.stackBeam);

    this.buildNetwork();

    // ── La base · ERP de gestión ──
    this.erp = createErpFoundation(SLAB_W, SLAB_D, 1.4, opts.erp);
    this.erp.group.position.y = SLAB_Y;
    this.scene.add(this.erp.group);
    this.erpTiles = this.erp.tiles.map((p) => p.clone().setY(SLAB_Y + 0.1));
    this.erpWalls = new THREE.MeshBasicMaterial({ color: ERP_HEX, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending });
    const wallH = -SLAB_Y;
    const walls: Array<[number, number, number, number]> = [
      [0, -HOLE.y, HOLE.x * 2, 0],
      [0, HOLE.y, HOLE.x * 2, 0],
      [-HOLE.x, 0, HOLE.y * 2, Math.PI / 2],
      [HOLE.x, 0, HOLE.y * 2, Math.PI / 2],
    ];
    for (const [x, z, w, rot] of walls) {
      const wall = new THREE.Mesh(new THREE.PlaneGeometry(w, wallH), this.erpWalls);
      wall.position.set(x, -wallH / 2, z);
      wall.rotation.y = rot;
      this.scene.add(wall);
    }
    const rimPts: THREE.Vector3[] = [];
    const cornersXZ: Array<[number, number]> = [
      [-HOLE.x, -HOLE.y],
      [HOLE.x, -HOLE.y],
      [HOLE.x, HOLE.y],
      [-HOLE.x, HOLE.y],
    ];
    for (const [x, z] of cornersXZ) rimPts.push(v3(x, 0, z), v3(x, SLAB_Y, z));
    this.erpRim = new THREE.LineBasicMaterial({ color: ERP_HEX, transparent: true, opacity: 0 });
    this.scene.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(rimPts), this.erpRim));

    // Cada capa operativa alimenta un módulo de gestión.
    const epc = opts.lowPower ? 14 : 26;
    const feedColors = [C_FISICA, C_VISION, C_IOT, C_ROBOT, C_CENTRAL];
    ERP_FEED.forEach((tile, i) => {
      const s = new Stream(this.nodePos[i], this.erpTiles[tile], 3, feedColors[i], epc, this.glow, 0.8);
      this.erpStreams.push(s);
      this.scene.add(s.points);
    });
    this.erpChainCurve = new THREE.CatmullRomCurve3(ERP_CHAIN.map((k) => this.erpTiles[k].clone().setY(SLAB_Y + 0.35)), false, "catmullrom", 0.2);
    const chainPts = this.erpChainCurve.getPoints(120);
    this.erpChainCount = chainPts.length;
    this.erpChain = new THREE.Line(new THREE.BufferGeometry().setFromPoints(chainPts), new THREE.LineBasicMaterial({ color: COLOR.ice, transparent: true, opacity: 0 }));
    this.scene.add(this.erpChain);
    this.erpPulse = this.sprite(COLOR.ice, 3.4);
    this.scene.add(this.erpPulse);

    const rand = mulberry32(7);
    const dustCount = opts.lowPower ? 240 : 800;
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
      new THREE.PointsMaterial({ color: COLOR.ice, size: 0.3, map: this.glow, transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending })
    );
    this.scene.add(this.dust);
  }

  // ───────────────────────── Construcción ─────────────────────────

  private sprite(color: number, scale: number) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.glow, color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    s.scale.setScalar(scale);
    return s;
  }

  private ring(color: number, inner: number, outer: number): Pulse {
    const r = new THREE.Mesh(
      new THREE.RingGeometry(inner, outer, 48),
      new THREE.MeshBasicMaterial({ color, transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending })
    );
    r.rotation.x = -Math.PI / 2;
    this.scene.add(r);
    return r;
  }

  private onLayer(layer: number, mat: { opacity: number }, off: number, on: number) {
    this.layerMats[layer].push([mat, off, on]);
  }

  private addBuilding(x: number, z: number, w: number, h: number, d: number, floors = 0) {
    const group = new THREE.Group();
    const box = new THREE.BoxGeometry(w, h, d);
    // Transparente (opacidad 1) para poder volverlo fantasma al mirar el cimiento.
    const mat = new THREE.MeshStandardMaterial({ color: COLOR.building, roughness: 0.85, metalness: 0.15, transparent: true });
    this.buildingMats.push(mat);
    const mesh = new THREE.Mesh(box, mat);
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(box), new THREE.LineBasicMaterial({ color: 0x4a6dff, transparent: true, opacity: 0.9 }));
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
    this.addBuilding(10, -7, 10, 5, 7, 1); // bodega 2
    this.addBuilding(-16, -9, 4.5, 11, 4.5, 4); // torre
    this.addBuilding(CONTROL.x, CONTROL.z, 6, 3.6, 5); // central
    this.addBuilding(1, 13.4, 3, 2.4, 2.4); // portería

    const corners = [v3(-SITE_W, 0, -SITE_D), v3(SITE_W, 0, -SITE_D), v3(SITE_W, 0, SITE_D), v3(-SITE_W, 0, SITE_D)];
    const postPositions: THREE.Vector3[] = [];
    for (let i = 0; i < 4; i++) {
      const a = corners[i];
      const b = corners[(i + 1) % 4];
      const steps = Math.round(a.distanceTo(b) / 2.4);
      for (let s = 0; s < steps; s++) postPositions.push(a.clone().lerp(b, s / steps));
    }
    const posts = new THREE.InstancedMesh(new THREE.BoxGeometry(0.14, 1.8, 0.14), new THREE.MeshBasicMaterial({ color: COLOR.french }), postPositions.length);
    const m = new THREE.Matrix4();
    postPositions.forEach((p, i) => {
      m.makeTranslation(p.x, 0.9, p.z);
      posts.setMatrixAt(i, m);
    });
    this.scene.add(posts);
    for (const y of [0.7, 1.75]) {
      const rail = new THREE.LineLoop(
        new THREE.BufferGeometry().setFromPoints(corners.map((c) => c.clone().setY(y))),
        new THREE.LineBasicMaterial({ color: COLOR.bright, transparent: true, opacity: 0.5 })
      );
      this.scene.add(rail);
    }
  }

  private buildCameras() {
    const cams: Array<[THREE.Vector3, THREE.Vector3]> = [
      [v3(21, 5.2, -14), v3(13, 0, -4)],
      [v3(21, 5.4, -1.5), v3(16.8, 0, -9.5)], // cámara 04: la que confirma
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
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.45, 1), headMat);
      body.position.copy(head);
      body.lookAt(target);
      this.scene.add(body);
      const led = this.sprite(C_VISION, 1.3);
      led.position.copy(head).addScaledVector(dir, 0.6);
      this.scene.add(led);
      this.onLayer(1, led.material, 0.15, 0.9);
      const coneGeo = new THREE.ConeGeometry(len * 0.42, len, 28, 1, true);
      coneGeo.translate(0, -len / 2, 0);
      const cone = new THREE.Mesh(
        coneGeo,
        new THREE.MeshBasicMaterial({ color: COLOR.indigo, transparent: true, opacity: 0.04, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending })
      );
      cone.position.copy(head);
      cone.quaternion.setFromUnitVectors(down, dir);
      this.cones.push(cone);
      this.camHeads.push(head.clone());
      this.scene.add(cone);
    }
  }

  private buildSensors() {
    const nodes = [
      v3(DOOR.x + 0.1, 2.75, DOOR.z - 1.3), // contacto de puerta (bodega 2)
      v3(2.06, 6.2, -4), // PIR edificio principal
      v3(-12, 3.75, 6.45), // acceso central
      v3(1, 2.55, 12.15), // reloj biométrico portería
      v3(-16, 9.5, -6.7), // torre
      v3(10, 5.15, -3.45), // bodega frente
      v3(-SITE_W, 1.9, 0), // cerca oeste
      v3(SITE_W, 1.9, 8), // cerca este
    ];
    const boxMat = new THREE.MeshBasicMaterial({ color: C_IOT, transparent: true });
    this.onLayer(2, boxMat, 0.2, 1);
    nodes.forEach((p, i) => {
      const b = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.28, 0.28), boxMat);
      b.position.copy(p);
      this.scene.add(b);
      const led = this.sprite(C_IOT, i === 0 ? 2.2 : 1.6);
      led.position.copy(p);
      this.sensorLeds.push(led);
      this.scene.add(led);
      const ring = this.ring(C_IOT, 0.6, 0.72);
      ring.position.set(p.x, 0.07, p.z);
      this.sensorPulses.push(ring);
    });
    // Reloj biométrico en la portería
    const clock = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.7, 0.08), new THREE.MeshBasicMaterial({ color: C_IOT, transparent: true }));
    clock.position.set(1, 1.5, 12.16);
    this.scene.add(clock);
    this.onLayer(2, clock.material, 0.25, 0.9);
  }

  /** Planos de la apertura: una capa flotando por cada nivel de la seguridad. */
  private buildPlates() {
    const layerPoints: THREE.Vector3[][] = [
      [...GUARD_LOOP, CHECKPOINT, v3(-5, 0, 5.5)],
      this.camHeads.map((h) => h.clone().setY(0)),
      this.sensorLeds.map((s) => s.position.clone().setY(0)),
      ROBOT_PATH.getPoints(5),
      [CONTROL.clone(), v3(-12, 0, 13), v3(-6, 0, 9)],
    ];
    const outline = new THREE.Shape();
    const w = SITE_W + 2;
    const d = SITE_D + 2;
    const r = 3;
    outline.moveTo(-w + r, -d);
    outline.lineTo(w - r, -d);
    outline.quadraticCurveTo(w, -d, w, -d + r);
    outline.lineTo(w, d - r);
    outline.quadraticCurveTo(w, d, w - r, d);
    outline.lineTo(-w + r, d);
    outline.quadraticCurveTo(-w, d, -w, d - r);
    outline.lineTo(-w, -d + r);
    outline.quadraticCurveTo(-w, -d, -w + r, -d);
    const pts = outline.getPoints(6).map((p) => v3(p.x, 0, p.y));
    for (let k = 0; k < LAYER_COUNT; k++) {
      const color = LAYER_HEX[k];
      const group = new THREE.Group();
      const lineMat = new THREE.LineBasicMaterial({ color, transparent: true });
      group.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), lineMat));
      const fillMat = new THREE.MeshBasicMaterial({ color, transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending });
      const fill = new THREE.Mesh(new THREE.ShapeGeometry(outline, 6), fillMat);
      fill.rotation.x = Math.PI / 2;
      group.add(fill);
      const mats: Plate["mats"] = [lineMat, fillMat];
      const base = [0.85, 0.06];
      for (const p of layerPoints[k]) {
        const s = this.sprite(color, 2.4);
        s.position.set(p.x, 0.2, p.z);
        group.add(s);
        mats.push(s.material);
        base.push(0.95);
      }
      // Hilo que une los puntos de la capa con el eje central (la traza).
      const links = new THREE.LineSegments(
        new THREE.BufferGeometry().setFromPoints(layerPoints[k].flatMap((p) => [v3(p.x, 0.2, p.z), v3(0, 0.2, 0)])),
        new THREE.LineBasicMaterial({ color, transparent: true })
      );
      group.add(links);
      mats.push(links.material);
      base.push(0.28);
      group.position.y = PLATE_Y[k];
      this.scene.add(group);
      this.plates.push({ group, mats, base });
    }
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
        mesh.position.set(cx + (rand() - 0.5) * 14, h / 2, cz + (rand() - 0.5) * 14);
        lines.position.copy(mesh.position);
        this.network.add(mesh, lines);
      }
      const beacon = this.sprite(LAYER_HEX[i % LAYER_COUNT], 9);
      beacon.position.set(cx, 3, cz);
      this.networkMats.push(beacon.material);
      this.network.add(beacon);

      const from = v3(cx, 3, cz);
      const to = BOARD_POS.clone();
      const mid = from.clone().lerp(to, 0.5);
      mid.y += 28;
      const curve = new THREE.QuadraticBezierCurve3(from, mid, to);
      const pts = curve.getPoints(60);
      const arc = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: COLOR.ice, transparent: true }));
      const spark = this.sprite(COLOR.ice, 4);
      this.network.add(arc, spark);
      this.networkMats.push(spark.material);
      this.arcs.push({ line: arc, count: pts.length, delay: (i / sites) * 0.35, curve, spark });
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
    if (this.portrait) this.camera.setViewOffset(this.width, this.height, 0, this.height * 0.17, this.width, this.height);
    else if (this.width >= 900) this.camera.setViewOffset(this.width, this.height, -this.width * 0.16, 0, this.width, this.height);
    else this.camera.clearViewOffset();
    this.camera.updateProjectionMatrix();
    if (!this.running) this.renderOnce();
  }

  start() {
    if (this.opts.reducedMotion) {
      this.renderOnce();
      return;
    }
    if (this.running) return;
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
    this.board.dispose();
    this.erp.dispose();
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
    const dt = Math.min(Math.max((now - this.last) / 1000, 0), 0.1);
    this.last = now;
    this.time += dt;
    this.chapter += (this.targetChapter - this.chapter) * (1 - Math.exp(-dt * 4.5));
    this.update();
    this.renderer.render(this.scene, this.camera);
    this.adaptQuality(dt);
  };

  private renderOnce() {
    // Sin animación: un instante "representativo" fijo del reloj.
    if (this.opts.reducedMotion) this.time = 12;
    this.update();
    this.renderer.render(this.scene, this.camera);
  }

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

  private face(obj: THREE.Object3D, curve: THREE.Curve<THREE.Vector3>, u: number, forwardX = false) {
    const tan = curve.getTangentAt(Math.min(0.999, Math.max(0.001, u)), this.tmpB);
    obj.rotation.y = forwardX ? Math.atan2(-tan.z, tan.x) : Math.atan2(tan.x, tan.z);
  }

  private update() {
    // `cr`: capítulo real (cámara y cimiento). `c`: tiempo de la coreografía operativa.
    const cr = this.chapter;
    const c = storyTime(cr);
    const t = this.time;

    // ── Cámara ──
    const last = KEYFRAMES.length - 1;
    const i0 = Math.max(0, Math.min(last, Math.floor(cr)));
    const i1 = Math.min(last, i0 + 1);
    const f = smooth(cr - i0);
    const pos = this.tmpA.lerpVectors(KEYFRAMES[i0].pos, KEYFRAMES[i1].pos, f);
    const target = this.tmpB.lerpVectors(KEYFRAMES[i0].target, KEYFRAMES[i1].target, f);
    const offset = this.tmpC.subVectors(pos, target);
    // En vertical se aleja la cámara (más campo); en la apertura menos, para que las capas se lean.
    if (this.portrait) offset.multiplyScalar(1.1 + 0.35 * ramp(c, 0.3, 1));
    const orbit = Math.sin(t * 0.09) * 0.3 * (1 - ramp(c, 0, 1)) + Math.sin(t * 0.21) * 0.025;
    offset.applyAxisAngle(THREE.Object3D.DEFAULT_UP, orbit);
    this.camera.position.copy(target).add(offset);
    this.camera.position.y += Math.sin(t * 0.5) * 0.2;
    this.camera.lookAt(target);

    const fog = this.scene.fog as THREE.FogExp2;
    fog.density = 0.0095 - 0.0068 * ramp(c, 6.2, 7);
    this.groundUniforms.uReach.value = 0.022 - 0.014 * ramp(c, 6.2, 7);
    this.groundUniforms.uTime.value = t;

    // ── Apertura: capas apiladas que caen sobre la sede ──
    const collapse = ramp(c, 0.08, 0.85);
    const plateFade = 1 - ramp(c, 0.5, 0.9);
    this.plates.forEach((p, k) => {
      const drop = ramp(c, 0.05 + k * 0.05, 0.7 + k * 0.03);
      p.group.position.y = PLATE_Y[k] * (1 - drop) + 0.15 * drop + Math.sin(t * 0.7 + k) * 0.25 * (1 - collapse);
      p.group.visible = plateFade > 0.01;
      const pulse = 0.85 + 0.15 * Math.sin(t * 2 + k * 1.3);
      p.mats.forEach((m, i) => (m.opacity = p.base[i] * plateFade * pulse));
    });
    this.stackBeam.visible = plateFade > 0.01;
    this.stackBeam.scale.y = 1 - collapse * 0.97;
    this.stackBeam.position.y = 15 * (1 - collapse) + 0.5;
    this.stackBeam.material.opacity = 0.75 * plateFade;
    this.groundUniforms.uPlate.value = collapse;

    // Capas que se encienden una tras otra y quedan encendidas.
    const layerOn = [0, 1, 2, 3, 4].map((k) => ramp(c, k + 0.55, k + 1));
    this.layerMats.forEach((list, k) => {
      for (const [m, off, on] of list) m.opacity = off + (on - off) * layerOn[k];
    });

    // ── Capa 01 · guardia en ronda → marca el punto 7 y reporta ──
    const toCheckpoint = ramp(c, 0.75, 1.15);
    const loopU = (((t / 40) % 1) + 1) % 1;
    this.guardLoop.getPointAt(loopU, this.tmpA);
    const walking = 1 - toCheckpoint;
    if (toCheckpoint > 0) this.tmpA.lerp(CHECKPOINT, toCheckpoint);
    this.guard.group.position.copy(this.tmpA);
    if (toCheckpoint < 0.98) this.face(this.guard.group, this.guardLoop, loopU);
    else this.guard.group.rotation.y = Math.PI * 0.85;
    this.guard.pose(t * 7, walking);
    const report = ramp(c, 1.0, 1.3);
    this.guard.hand.getWorldPosition(this.guardPhone.position);
    this.guardPhone.material.opacity = 0.25 + report * (0.6 + 0.4 * Math.sin(t * 8));
    this.checkpoints.forEach((r, i) => {
      const ph = (t * 0.6 + i * 0.37) % 1;
      const isCp = i === this.checkpoints.length - 1;
      r.scale.setScalar(1 + ph * (isCp ? 2.5 * report + 0.9 : 0.9));
      r.material.opacity = (1 - ph) * (0.15 + 0.6 * layerOn[0]) * (isCp ? 0.4 + report : 0.8);
    });

    // Intruso: cruza la cerca norte hacia la puerta de la bodega
    const inMove = ramp(c, 0.95, 1.9);
    const resolved = ramp(c, 5.4, 5.75);
    INTRUDER_PATH.getPointAt(inMove, this.intruder.group.position);
    this.face(this.intruder.group, INTRUDER_PATH, inMove);
    this.intruder.pose(inMove * 60, inMove > 0.01 && inMove < 0.99 ? 1 : 0);
    const inVis = ramp(c, 0.9, 1.2) * (1 - ramp(c, 6.4, 6.8));
    this.intruder.group.visible = inVis > 0.01;
    this.intruder.accent.opacity = inVis;
    this.intruder.accent.color.copy(this.colRed).lerp(this.colAmber, resolved);
    this.intruderGlow.position.copy(this.intruder.group.position).setY(0.5);
    this.intruderGlow.material.opacity = inVis * 0.55 * (1 - resolved * 0.6);

    // ── Capa 02 · cámara 04 confirma; el operador valida ──
    const detect = ramp(c, 1.55, 2.0) * (1 - ramp(c, 6.3, 6.7));
    this.cones.forEach((cone, i) => {
      const base = 0.03 + 0.05 * layerOn[1];
      if (i === TRIGGER_CAM) {
        cone.material.opacity = base + detect * 0.08;
        cone.material.color.copy(this.colIndigo).lerp(this.colAmber, detect * (1 - resolved)).lerp(this.colGreen, resolved * detect);
      } else cone.material.opacity = base;
    });
    this.detectBox.visible = detect > 0.01;
    this.detectBox.position.copy(this.intruder.group.position).setY(1.15);
    this.detectBox.material.opacity = detect;
    this.detectBox.material.color.copy(this.colAmber).lerp(this.colGreen, resolved);
    const validated = ramp(c, 2.05, 2.3) * (1 - ramp(c, 6.3, 6.7));
    this.operatorCheck.position.copy(this.intruder.group.position).setY(2.9);
    this.operatorCheck.material.opacity = validated * (0.7 + 0.3 * Math.sin(t * 4));

    // ── Capa 03 · la puerta se abre fuera de horario ──
    const doorOpen = ramp(c, 2.5, 2.85) * (1 - ramp(c, 5.5, 5.9));
    this.door.rotation.y = doorOpen * 1.25;
    const alarm = ramp(c, 2.6, 2.9) * (1 - ramp(c, 5.4, 5.7));
    this.siren.opacity = 0.2 + alarm * (0.5 + 0.5 * Math.sin(t * 12));
    this.groundUniforms.uAlert.value = alarm * 0.9;
    this.sensorLeds.forEach((led, i) => {
      const hot = i === 0 ? alarm : 0;
      led.material.color.set(hot > 0.4 ? COLOR.red : C_IOT);
      led.material.opacity = (0.2 + 0.7 * layerOn[2]) * (0.6 + 0.4 * Math.sin(t * (hot > 0.4 ? 10 : 2) + i));
    });
    this.sensorPulses.forEach((r, i) => {
      const ph = (t * 0.5 + i * 0.29) % 1;
      r.scale.setScalar(1 + ph * (i === 0 ? 4 : 1.6));
      r.material.opacity = (1 - ph) * layerOn[2] * (i === 0 ? 0.3 + alarm * 0.7 : 0.45);
      r.material.color.set(i === 0 && alarm > 0.4 ? COLOR.red : C_IOT);
    });

    // ── Capa 04 · el robot sale de su base y verifica ──
    const rMove = ramp(c, 3.4, 4.05);
    ROBOT_PATH.getPointAt(rMove, this.robot.group.position);
    this.face(this.robot.group, ROBOT_PATH, Math.max(rMove, 0.02), true);
    this.robot.pose(rMove * 70, rMove > 0.01 && rMove < 0.99 ? 1 : 0.05);
    const robotAwake = 0.35 + 0.65 * layerOn[3];
    this.robot.accent.opacity = robotAwake * (0.75 + 0.25 * Math.sin(t * 3));
    const verify = ramp(c, 3.95, 4.3) * (1 - ramp(c, 5.6, 6));
    this.robot.eye.getWorldPosition(this.tmpA);
    this.robotCone.position.copy(this.tmpA);
    this.tmpC.copy(this.intruder.group.position).setY(0.6).sub(this.tmpA).normalize();
    this.robotCone.quaternion.setFromUnitVectors(THREE.Object3D.DEFAULT_UP.clone().negate(), this.tmpC);
    this.robotCone.material.opacity = verify * 0.16;
    const dPh = (t * 0.5) % 1;
    this.robotDock.scale.setScalar(1 + dPh * 0.4);
    this.robotDock.material.opacity = (1 - dPh) * 0.6 * robotAwake;
    const sPh = (t * 0.8) % 1;
    this.robotScan.position.copy(this.intruder.group.position).setY(0.09);
    this.robotScan.scale.setScalar(0.7 + sPh * 1.2);
    this.robotScan.material.opacity = verify * (1 - sPh);

    // ── Capa 05 · todo fluye a la central; despacho y gerencia ──
    const flow = ramp(c, 4.55, 4.95) * (1 - 0.65 * ramp(c, 6.2, 6.8));
    this.streams.forEach((s, i) => s.update(t + i * 0.27, flow * 0.9));
    this.controlWindow.color.copy(this.colIndigo).lerp(this.colTrace, flow * (0.6 + 0.4 * Math.sin(t * 3)));
    const dispatch = ramp(c, 4.85, 5.2);
    const supWalk = ramp(c, 5.0, 5.6);
    SUPERVISOR_PATH.getPointAt(supWalk, this.supervisor.group.position);
    this.face(this.supervisor.group, SUPERVISOR_PATH, Math.max(supWalk, 0.02));
    this.supervisor.pose(supWalk * 55, supWalk > 0.01 && supWalk < 0.99 ? 1 : 0);
    this.dispatchLine.geometry.setDrawRange(0, Math.floor(this.dispatchCount * dispatch));
    this.dispatchLine.material.opacity = dispatch * (1 - ramp(c, 6.3, 6.7));
    this.dispatchLine.material.color.set(resolved > 0.5 ? COLOR.green : COLOR.bright);

    // ── La traza ──
    let drawn = 0;
    let reached = 0;
    TRACE_WINDOWS.forEach(([a, b], i) => {
      const k = ramp(c, a, b);
      drawn += this.traceSeg[i] * k;
      if (k >= 0.999) reached = i + 1;
    });
    const traceOn = ramp(c, 0.7, 1.05);
    const cut = Math.floor(clamp01(drawn) * this.traceSegments);
    this.trace.geometry.setDrawRange(0, cut * this.traceIndexPerSeg);
    this.trace.visible = cut > 0;
    const traceGlow = 1 + ramp(c, 5.5, 5.9) * 0.6 * (0.5 + 0.5 * Math.sin(t * 2.4));
    this.trace.material.opacity = Math.min(1, 0.75 * traceGlow);
    this.trace.material.color.copy(this.colTrace).lerp(this.colGreen, resolved * 0.55);
    const headOn = drawn > 0.002 && drawn < 0.998;
    this.traceHead.visible = headOn;
    if (headOn) {
      this.traceCurve.getPointAt(clamp01(drawn), this.traceHead.position);
      this.traceHead.material.opacity = 0.9;
    }
    // Pulso que recorre la traza completa (capítulo traza)
    const runnerOn = ramp(c, 5.45, 5.8) * (1 - ramp(c, 7.2, 7.5));
    this.traceRunner.visible = runnerOn > 0.01;
    if (this.traceRunner.visible) {
      this.traceCurve.getPointAt((t * 0.16) % 1, this.traceRunner.position);
      this.traceRunner.material.opacity = runnerOn;
    }
    this.traceNodes.forEach((s, i) => {
      const lit = i === 0 ? ramp(c, 1.0, 1.3) : i <= reached ? 1 : 0;
      const close = i === 5 ? resolved : lit;
      s.material.opacity = traceOn * close * (0.65 + 0.35 * Math.sin(t * 3 + i));
      s.scale.setScalar(2.2 + close * 0.8 + (i === reached ? Math.sin(t * 6) * 0.4 : 0));
    });
    const rPh = (t * 0.5) % 1;
    this.resolvedRing.scale.setScalar(1 + rPh * 0.6);
    this.resolvedRing.material.opacity = resolved * (1 - ramp(c, 6.4, 6.8)) * (1 - rPh * 0.7);

    // Tablero de gerencia
    const boardOn = 0.35 + 0.65 * layerOn[4];
    const steps = c < 1.0 ? 0 : 1 + reached + (resolved > 0.95 ? 0 : 0);
    this.board.draw(t, resolved > 0.95 ? 6 : Math.min(5, steps), boardOn);
    this.board.frame.opacity = boardOn;
    this.boardGlow.material.opacity = 0.18 + 0.3 * layerOn[4] + 0.25 * ramp(c, 6.3, 7);

    // ── Escala: todas las sedes llegan al mismo tablero ──
    const net = ramp(c, 6.35, 6.95);
    this.network.visible = net > 0.01;
    for (const mat of this.networkMats) mat.opacity = net;
    for (const arc of this.arcs) {
      const k = clamp01((ramp(c, 6.5, 7) - arc.delay) / 0.65);
      arc.line.geometry.setDrawRange(0, Math.floor(arc.count * k));
      arc.line.material.opacity = 0.6 * net;
      arc.curve.getPoint((t * 0.25 + arc.delay * 2) % 1, arc.spark.position);
      arc.spark.visible = k > 0.99;
    }

    // ── La base: ERP de gestión bajo la sede ──
    const focus = erpFocus(cr);
    const erpCut = ramp(cr, 5.3, 5.8);
    this.groundUniforms.uCut.value = erpCut;
    this.erp.group.visible = erpCut > 0.01;
    const ghost = 1 - 0.72 * focus;
    for (const m of this.buildingMats) m.opacity = ghost;
    const erpOn = erpCut * (0.55 + 0.45 * focus);
    this.erp.top.opacity = erpOn;
    this.erp.body.opacity = erpOn * 0.9;
    this.erp.edges.opacity = erpOn * (0.7 + 0.3 * Math.sin(t * 2));
    this.erpWalls.opacity = ramp(erpCut, 0.6, 1) * (0.05 + 0.07 * focus);
    this.erpRim.opacity = ramp(erpCut, 0.6, 1) * (0.25 + 0.5 * focus);
    const feed = ramp(cr, 5.35, 5.75) * (1 - 0.55 * ramp(cr, 6.4, 6.9)) * (1 - ramp(cr, 7.4, 7.9));
    this.erpStreams.forEach((s, i) => s.update(t * 0.9 + i * 0.31, feed * 0.85));
    const prog = erpProgress(cr);
    const chainK = prog * (1 - ramp(cr, 6.5, 6.9));
    this.erpChain.geometry.setDrawRange(0, Math.floor(this.erpChainCount * chainK));
    this.erpChain.material.opacity = 0.9 * focus;
    const pulseOn = focus > 0.05 && prog > 0.01;
    this.erpPulse.visible = pulseOn;
    if (pulseOn) {
      this.erpChainCurve.getPointAt(prog < 0.999 ? prog : (t * 0.12) % 1, this.erpPulse.position);
      this.erpPulse.material.opacity = focus;
    }
    const reachedTile = prog * (ERP_CHAIN.length - 1);
    this.erp.tileMats.forEach((m, i) => {
      const chainIdx = ERP_CHAIN.indexOf(i);
      const lit = chainIdx >= 0 && chainIdx <= reachedTile + 0.001 ? 1 : 0;
      const fed = ERP_FEED.includes(i) ? feed : 0;
      m.opacity = erpCut * (0.04 + 0.1 * fed * (0.6 + 0.4 * Math.sin(t * 3 + i)) + 0.22 * lit * focus);
    });

    this.dust.rotation.y = t * 0.01;
    // Matrices al día antes de proyectar (en render único no hay frame previo).
    this.camera.updateMatrixWorld();
    this.emitAnchors(resolved);
  }

  private project(p: THREE.Vector3, visible: boolean): Anchor {
    const v = this.tmpC.copy(p).project(this.camera);
    const onScreen = v.z < 1 && v.x > -1.1 && v.x < 1.1 && v.y > -1.1 && v.y < 1.1;
    return { x: (v.x * 0.5 + 0.5) * this.width, y: (-v.y * 0.5 + 0.5) * this.height, visible: visible && onScreen };
  }

  private emitAnchors(resolved: number) {
    if (!this.opts.onAnchors) return;
    const cr = this.chapter;
    const c = storyTime(cr);
    const hero = c < 0.3;
    const inErp = erpFocus(cr) > 0.3;
    const all = c > 5.6 && c < 6.4 && !this.portrait && !inErp;
    const a = {} as Anchors;
    this.plates.forEach((p, k) => {
      a[`p${k}` as AnchorId] = this.project(this.tmpA.set(SITE_W + 2, p.group.position.y, -SITE_D - 2), hero);
    });
    a.guard = this.project(this.tmpA.copy(this.guard.group.position).setY(2.6), (c > 0.8 && c < 1.6) || all);
    a.camera = this.project(this.tmpA.copy(this.camHeads[TRIGGER_CAM]).setY(6.6), (c > 1.6 && c < 2.55) || all);
    a.sensor = this.project(this.tmpA.copy(this.nodePos[2]).setY(3.6), (c > 2.6 && c < 3.55) || all);
    a.robot = this.project(this.tmpA.copy(this.robot.group.position).setY(2), (c > 3.55 && c < 4.55) || all);
    a.central = this.project(this.tmpA.set(CONTROL.x, 4.8, CONTROL.z + 2.6), (c > 4.6 && c < 5.5) || all);
    a.board = this.project(this.tmpA.copy(BOARD_POS).setY(BOARD_POS.y + 3.5), ((c > 5.0 && c < 5.6) || (all && resolved > 0.5)) && !inErp);
    a.erp = this.project(this.tmpA.set(SLAB_W / 2 - 7, SLAB_Y + 0.4, SLAB_D / 2), erpFocus(cr) > 0.6);
    this.opts.onAnchors(a);
  }
}
