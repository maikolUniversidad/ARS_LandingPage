/**
 * Escena «edificio»: el EDIFICIO INTELIGENTE (monitoreo).
 *
 * Un edificio de 7 pisos en corte (la fachada frontal está abierta para ver
 * cada planta), vidrio y estructura en líneas emisivas, cámaras con cono de
 * visión en fachada y pasillos, puertas que reconocen, sensores IoT con
 * bandejas de cable y una «central» en la cubierta.
 *
 * Focos: fachada · camaras · acceso · puertas · iot · planos · escaneo.
 */

import * as THREE from "three";
import { COLOR, Kit, arco, enc, fase, montarEscena, mulberry32, ramp, suave, v3, type Escena } from "./_edificio-motor";
import type { FabricaEscena } from "./contrato";

const N = 7; // pisos
const H = 3; // altura de piso
const W = 16; // frente (x)
const D = 12; // fondo (z)
const TECHO = N * H;
const PISO_ALERTA = 4;
const CENTRAL = v3(4, TECHO + 1.6, -3);
const CARRIL_X = 0.8; // carril del torniquete por donde entra el visitante

const pingpong = (x: number) => 1 - Math.abs((((x % 2) + 2) % 2) - 1);

const NUBE_VERT = /* glsl */ `
  uniform float uSweep;
  uniform float uOp;
  uniform float uSize;
  attribute float aRand;
  varying float vA;
  varying float vHot;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    float below = step(position.y, uSweep);
    float hot = exp(-abs(position.y - uSweep) * 1.4) * below;
    vA = below * uOp * (0.45 + 0.55 * aRand);
    vHot = hot;
    gl_PointSize = uSize * (1.0 + hot * 1.6) * (700.0 / -mv.z);
  }
`;
const NUBE_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uHot;
  varying float vA;
  varying float vHot;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.05, d) * vA;
    gl_FragColor = vec4(mix(uColor, uHot, vHot), a);
  }
`;

type Cono = {
  mesh: THREE.Mesh<THREE.ConeGeometry, THREE.MeshBasicMaterial>;
  q0: THREE.Quaternion;
  led: THREE.Sprite;
  alerta: boolean;
};

function construir(kit: Kit): Escena {
  const { scene } = kit;
  const acento = kit.acento;
  const rand = mulberry32(11);
  const up = v3(0, 1, 0);
  const down = v3(0, -1, 0);
  const m4 = new THREE.Matrix4();
  const colIndigo = new THREE.Color(COLOR.indigo);
  const colAmber = new THREE.Color(COLOR.amber);
  const colGreen = new THREE.Color(COLOR.green);
  const colRed = new THREE.Color(COLOR.red);
  const colCyan = new THREE.Color(COLOR.cyan);
  const colBorde = new THREE.Color(0x4a6dff);
  const colSteel = new THREE.Color(COLOR.steel);
  const colPlano = new THREE.Color(COLOR.bright);
  const tmpC = new THREE.Color();
  const tmpQ = new THREE.Quaternion();

  // ── Suelo, plaza y contexto urbano ──
  const suelo = kit.suelo(320, { reach: 0.028, placa: 22 });
  scene.add(suelo.mesh);
  const plaza = kit.anillo(13, 13.15, COLOR.bright, 96);
  plaza.position.y = 0.03;
  (plaza.material as THREE.MeshBasicMaterial).opacity = 0.35;
  scene.add(plaza);
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + 0.3;
    const r = 40 + rand() * 22;
    const h = 4 + rand() * 12;
    const b = kit.caja(5 + rand() * 6, h, 5 + rand() * 6, { opRelleno: 0.55, opBorde: 0.3 });
    b.grupo.position.set(Math.cos(a) * r, 0, Math.sin(a) * r * 0.9);
    scene.add(b.grupo);
  }
  kit.polvo(600, 120, 40);

  // ── Materiales compartidos del edificio ──
  const matLosa = new THREE.MeshStandardMaterial({ color: 0x0c1d48, roughness: 0.9, metalness: 0.1, transparent: true, opacity: 0.62, depthWrite: false });
  const matLosaBorde = kit.matLinea(colBorde, 0.9);
  const matVidrio = new THREE.MeshBasicMaterial({ color: COLOR.french, transparent: true, opacity: 0.12, depthWrite: false, side: THREE.DoubleSide });
  const matMontante = kit.matLinea(COLOR.bright, 0.35);
  const matColumna = new THREE.MeshStandardMaterial({ color: 0x2a3b66, roughness: 0.6, metalness: 0.4, transparent: true });
  const matPlano = kit.matLinea(colPlano, 0.42);
  const matCota = kit.matLinea(COLOR.cyan, 0);
  const matBandeja = kit.matLinea(COLOR.steel, 0.25);
  const matSensor = {
    temp: kit.basico(COLOR.amber, 0.9),
    mov: kit.basico(COLOR.cyan, 0.9),
    luz: kit.basico(COLOR.ice, 0.9),
  };

  // Geometrías compartidas (en coordenadas locales de piso: y=0 es el piso terminado)
  const geoLosa = new THREE.BoxGeometry(W, 0.24, D);
  geoLosa.translate(0, -0.12, 0);
  const geoLosaBorde = new THREE.EdgesGeometry(geoLosa);
  const geoVidrioFondo = new THREE.PlaneGeometry(W, H - 0.24);
  const geoVidrioLado = new THREE.PlaneGeometry(D, H - 0.24);
  const geoColumna = new THREE.BoxGeometry(0.2, H - 0.24, 0.2);
  geoColumna.translate(0, (H - 0.24) / 2, 0);

  const montantes: THREE.Vector3[] = [];
  for (let x = -W / 2; x <= W / 2 + 0.01; x += 2) montantes.push(v3(x, 0, -D / 2), v3(x, H - 0.24, -D / 2));
  for (let z = -D / 2; z <= D / 2 + 0.01; z += 2) {
    montantes.push(v3(-W / 2, 0, z), v3(-W / 2, H - 0.24, z));
    montantes.push(v3(W / 2, 0, z), v3(W / 2, H - 0.24, z));
  }
  for (const y of [1.0, H - 0.24]) {
    montantes.push(v3(-W / 2, y, -D / 2), v3(W / 2, y, -D / 2));
    montantes.push(v3(-W / 2, y, -D / 2), v3(-W / 2, y, D / 2));
    montantes.push(v3(W / 2, y, -D / 2), v3(W / 2, y, D / 2));
  }
  const geoMontantes = new THREE.BufferGeometry().setFromPoints(montantes);

  // Tabiques: pasillo central (z ∈ [-1, 1]), oficinas a cada lado y núcleo.
  const tab: THREE.Vector3[] = [];
  const muro = (a: THREE.Vector3, b: THREE.Vector3, h = H * 0.72) => {
    tab.push(a.clone().setY(0.03), b.clone().setY(0.03), a.clone().setY(h), b.clone().setY(h));
    tab.push(a.clone().setY(0.03), a.clone().setY(h), b.clone().setY(0.03), b.clone().setY(h));
  };
  for (const z of [1, -1]) {
    // muro del pasillo con huecos de puerta
    const huecos = [-6, -2, 2, 6];
    let x0 = -W / 2;
    for (const hx of huecos) {
      muro(v3(x0, 0, z), v3(hx - 0.5, 0, z));
      x0 = hx + 0.5;
    }
    muro(v3(x0, 0, z), v3(W / 2, 0, z));
  }
  for (const x of [-4, 0, 4]) {
    muro(v3(x, 0, 1), v3(x, 0, D / 2));
    if (x !== 0) muro(v3(x, 0, -1), v3(x, 0, -D / 2));
  }
  muro(v3(-1.6, 0, -D / 2), v3(-1.6, 0, -2.6), H - 0.24); // núcleo / ascensores
  muro(v3(1.6, 0, -D / 2), v3(1.6, 0, -2.6), H - 0.24);
  muro(v3(-1.6, 0, -2.6), v3(1.6, 0, -2.6), H - 0.24);
  const geoTabiques = new THREE.BufferGeometry().setFromPoints(tab);

  // Marco de cotas (aparece en «planos»)
  const cota: THREE.Vector3[] = [];
  const cw = W / 2 + 1.2;
  const cd = D / 2 + 1.2;
  const esq = [v3(-cw, 0.02, -cd), v3(cw, 0.02, -cd), v3(cw, 0.02, cd), v3(-cw, 0.02, cd)];
  for (let i = 0; i < 4; i++) cota.push(esq[i], esq[(i + 1) % 4]);
  for (let x = -W / 2; x <= W / 2 + 0.01; x += 4) cota.push(v3(x, 0.02, cd - 0.35), v3(x, 0.02, cd + 0.35));
  for (let z = -D / 2; z <= D / 2 + 0.01; z += 4) cota.push(v3(cw - 0.35, 0.02, z), v3(cw + 0.35, 0.02, z));
  const geoCota = new THREE.BufferGeometry().setFromPoints(cota);

  const geoPuerta = new THREE.BufferGeometry().setFromPoints([v3(-0.45, 0.03, 0), v3(0.45, 0.03, 0), v3(0.45, 2.1, 0), v3(-0.45, 2.1, 0)]);
  const geoLuz = new THREE.PlaneGeometry(W - 1.2, D - 1.2);
  geoLuz.rotateX(Math.PI / 2);
  const geoSensor = new THREE.OctahedronGeometry(0.2);
  const geoBandeja = new THREE.BufferGeometry().setFromPoints([v3(-W / 2 + 0.4, H - 0.18, -D / 2 + 0.6), v3(W / 2 - 0.4, H - 0.18, -D / 2 + 0.6)]);

  // ── Pisos ──
  const pisos: THREE.Group[] = [];
  const puertas: Array<{ mat: THREE.LineBasicMaterial; glow: THREE.Sprite; hoja: THREE.MeshBasicMaterial }> = [];
  const geoHoja = new THREE.PlaneGeometry(0.86, 2.04);
  const luces: THREE.MeshBasicMaterial[] = [];
  const sensores: Array<{ mesh: THREE.Mesh; glow: THREE.Sprite; tipo: keyof typeof matSensor }> = [];
  const conos: Cono[] = [];
  const geoCuerpoCam = new THREE.BoxGeometry(0.34, 0.3, 0.62);
  const matCuerpoCam = new THREE.MeshStandardMaterial({ color: COLOR.steel, roughness: 0.4, metalness: 0.6 });

  const crearCamara = (padre: THREE.Object3D, head: THREE.Vector3, target: THREE.Vector3, ancho: number, alerta = false) => {
    const cuerpo = new THREE.Mesh(geoCuerpoCam, matCuerpoCam);
    cuerpo.position.copy(head);
    cuerpo.quaternion.setFromRotationMatrix(m4.lookAt(target, head, up));
    padre.add(cuerpo);
    const dir = target.clone().sub(head);
    const len = dir.length();
    dir.normalize();
    const g = new THREE.ConeGeometry(len * ancho, len, 28, 1, true);
    g.translate(0, -len / 2, 0);
    const mesh = new THREE.Mesh(
      g,
      new THREE.MeshBasicMaterial({ color: COLOR.indigo, transparent: true, opacity: 0.07, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }),
    );
    mesh.position.copy(head);
    mesh.quaternion.setFromUnitVectors(down, dir);
    padre.add(mesh);
    const led = kit.sprite(COLOR.bright, 0.9);
    led.position.copy(head).addScaledVector(dir, 0.4);
    padre.add(led);
    conos.push({ mesh, q0: mesh.quaternion.clone(), led, alerta });
  };

  for (let i = 0; i < N; i++) {
    const g = new THREE.Group();
    g.position.y = i * H + 0.02;
    scene.add(g);
    pisos.push(g);

    g.add(new THREE.Mesh(geoLosa, matLosa), new THREE.LineSegments(geoLosaBorde, matLosaBorde));
    const vf = new THREE.Mesh(geoVidrioFondo, matVidrio);
    vf.position.set(0, (H - 0.24) / 2, -D / 2);
    const vi = new THREE.Mesh(geoVidrioLado, matVidrio);
    vi.rotation.y = Math.PI / 2;
    vi.position.set(-W / 2, (H - 0.24) / 2, 0);
    const vd = vi.clone();
    vd.position.x = W / 2;
    g.add(vf, vi, vd, new THREE.LineSegments(geoMontantes, matMontante), new THREE.LineSegments(geoTabiques, matPlano));
    for (const x of [-W / 2, -W / 4, 0, W / 4, W / 2]) {
      const c = new THREE.Mesh(geoColumna, matColumna);
      c.position.set(x, 0, D / 2);
      g.add(c);
    }
    g.add(new THREE.LineSegments(geoCota, matCota));
    g.add(new THREE.LineSegments(geoBandeja, matBandeja));

    // Puertas del pasillo (lado norte)
    for (const x of [-6, -2, 2, 6]) {
      const mat = kit.matLinea(COLOR.bright, 0.25);
      const p = new THREE.LineLoop(geoPuerta, mat);
      p.position.set(x, 0, 1);
      const glow = kit.sprite(COLOR.green, 1.6, 0);
      glow.position.set(x, 1.1, 1.05);
      const hoja = new THREE.Mesh(geoHoja, kit.basico(COLOR.green, 0, true));
      hoja.position.set(x, 1.07, 1.02);
      g.add(p, glow, hoja);
      puertas.push({ mat, glow, hoja: hoja.material });
    }

    // Plafón de luz (domótica)
    const luz = new THREE.MeshBasicMaterial({ color: 0xfff1c9, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
    const plafon = new THREE.Mesh(geoLuz, luz);
    plafon.position.y = H - 0.3;
    g.add(plafon);
    luces.push(luz);

    // Sensores IoT
    const defs: Array<[keyof typeof matSensor, THREE.Vector3]> = [
      ["temp", v3(-5, H - 0.6, -D / 2 + 0.35)],
      ["mov", v3(3 - (i % 2) * 6, H - 0.35, 0)],
      ["luz", v3(-2 + (i % 3) * 3, H - 0.35, 3.6)],
    ];
    for (const [tipo, p] of defs) {
      const mesh = new THREE.Mesh(geoSensor, matSensor[tipo]);
      mesh.position.copy(p);
      const glow = kit.sprite(tipo === "temp" ? COLOR.amber : tipo === "mov" ? COLOR.cyan : COLOR.ice, 1.3, 0);
      glow.position.copy(p);
      g.add(mesh, glow);
      sensores.push({ mesh, glow, tipo });
    }

    // Cámara de pasillo
    if (i === 1 || i === 3 || i === PISO_ALERTA || i === 6) {
      crearCamara(g, v3(-W / 2 + 0.5, H - 0.5, 0), v3(3, 0, 0), 0.24, i === PISO_ALERTA);
    }
  }

  // ── Cubierta y central ──
  const techo = new THREE.Group();
  techo.position.y = TECHO + 0.02;
  scene.add(techo);
  pisos.push(techo);
  techo.add(new THREE.Mesh(geoLosa, matLosa), new THREE.LineSegments(geoLosaBorde, matLosaBorde));
  const central = kit.caja(4, 1.8, 3, { borde: COLOR.bright });
  central.grupo.position.set(CENTRAL.x, 0, CENTRAL.z);
  techo.add(central.grupo);
  const antena = kit.linea([v3(CENTRAL.x + 1.4, 1.8, CENTRAL.z), v3(CENTRAL.x + 1.4, 5.2, CENTRAL.z)], COLOR.bright, 0.8);
  techo.add(antena);
  const centralGlow = kit.sprite(COLOR.bright, 4.5, 0.6);
  centralGlow.position.set(CENTRAL.x, 2.4, CENTRAL.z);
  techo.add(centralGlow);
  const antenaLed = kit.sprite(COLOR.red, 1.1, 0.8);
  antenaLed.position.set(CENTRAL.x + 1.4, 5.3, CENTRAL.z);
  techo.add(antenaLed);
  const anillosCentral = [0, 1].map(() => {
    const r = kit.anillo(1.6, 1.75, COLOR.amber, 48);
    r.position.set(CENTRAL.x, 1.9, CENTRAL.z);
    techo.add(r);
    return r;
  });
  const letrero = kit.basico(COLOR.bright, 0.8, true);
  const barra = new THREE.Mesh(new THREE.BoxGeometry(5, 0.18, 0.05), letrero);
  barra.position.set(-5, 0.7, D / 2 + 0.05);
  techo.add(barra);

  // ── Cámaras de fachada ──
  const camsFachada: Array<[THREE.Vector3, THREE.Vector3]> = [
    [v3(W / 2 + 0.3, 4.2, D / 2 + 0.3), v3(12, 0, 13)],
    [v3(-W / 2 - 0.3, 4.2, D / 2 + 0.3), v3(-12, 0, 13)],
    [v3(W / 2 + 0.3, 4.2, -D / 2 - 0.3), v3(14, 0, -12)],
    [v3(-W / 2 - 0.3, 4.2, -D / 2 - 0.3), v3(-14, 0, -12)],
  ];
  for (const [h, tg] of camsFachada) crearCamara(scene, h, tg, 0.4);

  // ── Persona en el pasillo del piso de alerta ──
  const pisoAlerta = pisos[PISO_ALERTA];
  const persona = kit.figura(COLOR.ice, 1.7);
  pisoAlerta.add(persona.grupo);
  const caja = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(1.0, 2.0, 1.0)),
    new THREE.LineBasicMaterial({ color: COLOR.amber, transparent: true, depthTest: false }),
  );
  caja.renderOrder = 6;
  pisoAlerta.add(caja);
  const ondas = [0, 1, 2].map(() => {
    const r = kit.anillo(0.7, 0.82, COLOR.amber, 40);
    pisoAlerta.add(r);
    return r;
  });
  const camAlerta = v3(-W / 2 + 0.5, PISO_ALERTA * H + H - 0.5, 0);
  const flujoAlerta = kit.flujo(arco(camAlerta, v3(CENTRAL.x, TECHO + 2.2, CENTRAL.z), 6), COLOR.amber, 34, 0.55);

  // ── Acceso facial en el vestíbulo (piso 0) ──
  const lobby = pisos[0];
  const matPoste = new THREE.MeshStandardMaterial({ color: COLOR.steel, roughness: 0.4, metalness: 0.6 });
  const geoPoste = new THREE.BoxGeometry(0.26, 1.0, 0.9);
  geoPoste.translate(0, 0.5, 0);
  const brazos: THREE.Mesh[] = [];
  const matBrazo = kit.basico(COLOR.bright, 0.9);
  for (const x of [-1.6, 0, 1.6]) {
    const p = new THREE.Mesh(geoPoste, matPoste);
    p.position.set(x, 0, 4.4);
    lobby.add(p);
  }
  for (const x of [-1.47, 0.13]) {
    const pivote = new THREE.Group();
    pivote.position.set(x, 0.85, 4.4);
    const b = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.06, 0.06), matBrazo);
    b.position.x = 0.67;
    pivote.add(b);
    lobby.add(pivote);
    brazos.push(b);
  }
  const visitante = kit.figura(COLOR.ice, 1.7);
  visitante.grupo.position.set(CARRIL_X, 0, 10);
  lobby.add(visitante.grupo);
  const cara = new THREE.Group();
  cara.position.set(CARRIL_X, 2.3, 4.55);
  lobby.add(cara);
  const matCara = kit.matLinea(COLOR.cyan, 0);
  const geoCara = new THREE.WireframeGeometry(new THREE.SphereGeometry(0.34, 14, 10));
  const malla = new THREE.LineSegments(geoCara, matCara);
  malla.scale.set(0.82, 1.08, 0.9);
  cara.add(malla);
  const rejilla: THREE.Vector3[] = [];
  for (let k = 0; k <= 6; k++) {
    const y = -0.55 + (k / 6) * 1.1;
    rejilla.push(v3(-0.48, y, 0.3), v3(0.48, y, 0.3));
  }
  for (let k = 0; k <= 4; k++) {
    const x = -0.48 + (k / 4) * 0.96;
    rejilla.push(v3(x, -0.55, 0.3), v3(x, 0.55, 0.3));
  }
  const matRejilla = kit.matLinea(COLOR.bright, 0);
  cara.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(rejilla), matRejilla));
  const matScan = kit.basico(acento, 0, true);
  const lineaScan = new THREE.Mesh(new THREE.PlaneGeometry(1.05, 0.035), matScan);
  lineaScan.position.z = 0.32;
  cara.add(lineaScan);
  const matResultado = kit.basico(COLOR.green, 0, true);
  const resultado = new THREE.Mesh(new THREE.RingGeometry(0.72, 0.78, 48), matResultado);
  resultado.position.z = 0.3;
  cara.add(resultado);
  const caraGlow = kit.sprite(COLOR.green, 2.4, 0);
  caraGlow.position.z = 0.2;
  cara.add(caraGlow);
  const conexion = kit.linea([v3(CARRIL_X, 1.72, 4.55), v3(CARRIL_X, 1.0, 4.4)], COLOR.cyan, 0);
  lobby.add(conexion);

  // ── Datos IoT: recorren las bandejas piso por piso hasta la central ──
  const rutaIot = new THREE.CurvePath<THREE.Vector3>();
  {
    const zc = -D / 2 + 0.6;
    let prev = v3(-W / 2 + 0.6, H - 0.18, zc);
    for (let i = 0; i < N; i++) {
      const y = i * H + H - 0.18;
      const a = v3(i % 2 === 0 ? -W / 2 + 0.6 : W / 2 - 0.6, y, zc);
      const b = v3(i % 2 === 0 ? W / 2 - 0.6 : -W / 2 + 0.6, y, zc);
      if (i > 0) rutaIot.add(new THREE.LineCurve3(prev, a));
      rutaIot.add(new THREE.LineCurve3(a, b));
      prev = b;
    }
    rutaIot.add(new THREE.LineCurve3(prev, v3(prev.x, TECHO + 1, zc)));
    rutaIot.add(new THREE.LineCurve3(v3(prev.x, TECHO + 1, zc), v3(CENTRAL.x, TECHO + 1, CENTRAL.z)));
  }
  const flujoIot = kit.flujo(rutaIot, COLOR.cyan, 110, 0.85);
  const montante = kit.linea([v3(W / 2 - 0.6, 0, -D / 2 + 0.6), v3(W / 2 - 0.6, TECHO + 1, -D / 2 + 0.6)], COLOR.steel, 0.3);
  scene.add(montante);

  // ── Escaneo 3D: dron + nube de puntos que «construye» el edificio ──
  const nPts = kit.lowPower ? 1100 : 2800;
  const pts = new Float32Array(nPts * 3);
  const rnd = new Float32Array(nPts);
  for (let k = 0; k < nPts; k++) {
    const s = rand();
    let x = 0;
    let y = 0;
    let z = 0;
    if (s < 0.3) {
      // bordes de losa
      y = Math.floor(rand() * (N + 1)) * H;
      const per = rand() * 2 * (W + D);
      if (per < W) [x, z] = [per - W / 2, D / 2];
      else if (per < W + D) [x, z] = [W / 2, per - W - D / 2];
      else if (per < 2 * W + D) [x, z] = [per - W - D - W / 2, -D / 2];
      else [x, z] = [-W / 2, per - 2 * W - D - D / 2];
    } else if (s < 0.85) {
      // muros
      y = rand() * TECHO;
      const lado = Math.floor(rand() * 4);
      if (lado === 0) [x, z] = [(rand() - 0.5) * W, D / 2];
      else if (lado === 1) [x, z] = [(rand() - 0.5) * W, -D / 2];
      else if (lado === 2) [x, z] = [W / 2, (rand() - 0.5) * D];
      else [x, z] = [-W / 2, (rand() - 0.5) * D];
    } else {
      // cubierta y central
      y = TECHO + (rand() < 0.3 ? rand() * 1.8 : 0);
      x = (rand() - 0.5) * W;
      z = (rand() - 0.5) * D;
    }
    pts[k * 3] = x;
    pts[k * 3 + 1] = y + 0.02;
    pts[k * 3 + 2] = z;
    rnd[k] = rand();
  }
  const geoNube = new THREE.BufferGeometry();
  geoNube.setAttribute("position", new THREE.BufferAttribute(pts, 3));
  geoNube.setAttribute("aRand", new THREE.BufferAttribute(rnd, 1));
  const uNube = {
    uSweep: { value: -1 },
    uOp: { value: 0 },
    uSize: { value: 0.22 },
    uColor: { value: new THREE.Color(COLOR.cyan) },
    uHot: { value: new THREE.Color(0xffffff) },
  };
  const nube = new THREE.Points(
    geoNube,
    new THREE.ShaderMaterial({
      vertexShader: NUBE_VERT,
      fragmentShader: NUBE_FRAG,
      uniforms: uNube,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  nube.frustumCulled = false;
  scene.add(nube);

  const dron = new THREE.Group();
  const matDron = new THREE.MeshStandardMaterial({ color: COLOR.steel, roughness: 0.4, metalness: 0.6 });
  dron.add(new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.2, 0.8), matDron));
  const brazosDron = kit.segmentos([v3(-0.75, 0, -0.75), v3(0.75, 0, 0.75), v3(-0.75, 0, 0.75), v3(0.75, 0, -0.75)], COLOR.steel, 0.9);
  dron.add(brazosDron);
  for (const [x, z] of [[-0.75, -0.75], [0.75, 0.75], [-0.75, 0.75], [0.75, -0.75]]) {
    const r = kit.anillo(0.22, 0.36, COLOR.bright, 24);
    r.position.set(x, 0.08, z);
    dron.add(r);
  }
  const dronLed = kit.sprite(acento, 1.2, 0.9);
  dronLed.position.y = -0.2;
  dron.add(dronLed);
  scene.add(dron);
  const posDron = v3(-W / 2 - 2, TECHO + 3, -D / 2 - 2);
  const matHaz = new THREE.LineBasicMaterial({ color: acento, transparent: true, opacity: 0 });
  const geoHaz = new THREE.BufferGeometry().setFromPoints([v3(0, 0, 0), v3(0, 0, 0), v3(0, 0, 0), v3(0, 0, 0)]);
  const haz = new THREE.LineSegments(geoHaz, matHaz);
  haz.frustumCulled = false;
  scene.add(haz);
  const planoScan = kit.linea(
    [v3(-W / 2 - 0.4, 0, -D / 2 - 0.4), v3(W / 2 + 0.4, 0, -D / 2 - 0.4), v3(W / 2 + 0.4, 0, D / 2 + 0.4), v3(-W / 2 - 0.4, 0, D / 2 + 0.4)],
    acento,
    0,
    true,
  );
  scene.add(planoScan);

  // ── Estado ──
  let cicloPlanos = 0;
  let barrido = -1;
  const hotspots: Record<string, THREE.Vector3> = {
    fachada: v3(-5, TECHO + 2.2, D / 2),
    camaras: camAlerta.clone().add(v3(0.4, 0.6, 0)),
    acceso: v3(CARRIL_X - 1.4, 2.4, 4.6),
    puertas: v3(2, 2 * H + 2.5, 1),
    iot: v3(5, 5 * H + 2.4, -2),
    planos: v3(W / 2 + 1.4, 3 * H, D / 2 + 1.4),
    escaneo: posDron.clone(),
  };
  const hazA = new THREE.Vector3();
  const hazB = new THREE.Vector3();

  return {
    general: enc(30, 22, 40, 0, 9, 0),
    encuadres: {
      fachada: enc(-28, 15, 38, 0, 10.5, 0),
      camaras: enc(13, 20, 27, -1, 15, -0.5),
      acceso: enc(7.5, 3.6, 12.5, 0.4, 1.6, 4.6),
      puertas: enc(-11, 12, 22, 0, 9, 1),
      iot: enc(24, 19, 22, 0, 11.5, -1),
      planos: enc(36, 30, 36, 0, 17, 0),
      escaneo: enc(-30, 25, 30, 0, 10, 0),
    },
    hotspots,
    orbita: (f) => (f === "fachada" || f === null ? 3 : f === "escaneo" ? 1.6 : 1),
    update(t) {
      const w = {
        fachada: kit.peso("fachada"),
        camaras: kit.peso("camaras"),
        acceso: kit.peso("acceso"),
        puertas: kit.peso("puertas"),
        iot: kit.peso("iot"),
        planos: kit.peso("planos"),
        escaneo: kit.peso("escaneo"),
      };
      suelo.u.uTime.value = t;

      // Planos: explota en plantas 2D apiladas y luego se rearma (en bucle mientras hay foco).
      if (kit.foco === "planos") {
        if (kit.reducedMotion) cicloPlanos = 1;
        else {
          const p = kit.enFoco("planos") % 12;
          cicloPlanos = p < 8 ? suave(ramp(p, 0.2, 2)) : 1 - suave(ramp(p, 8, 10));
        }
      }
      const e = w.planos * cicloPlanos;

      // Escaneo: el barrido sube y la nube de puntos «construye» el edificio.
      if (kit.foco === "escaneo") {
        if (kit.reducedMotion) barrido = TECHO + 3;
        else {
          const p = kit.enFoco("escaneo") % 9;
          barrido = -0.5 + suave(ramp(p, 0.3, 6.5)) * (TECHO + 3.5);
        }
      }
      const s = w.escaneo;

      pisos.forEach((g, i) => {
        g.position.y = i * H + 0.02 + e * i * 2.6;
      });
      const presencia = 1 - 0.85 * s;
      matLosa.opacity = 0.62 * (1 - 0.6 * e) * presencia * (1 - 0.35 * Math.max(w.iot, w.puertas));
      matVidrio.opacity = (0.1 + 0.1 * w.fachada) * (1 - e) * presencia;
      matMontante.opacity = (0.32 + 0.25 * w.fachada) * (1 - e) * presencia;
      matColumna.opacity = (1 - 0.8 * e) * presencia;
      matColumna.visible = matColumna.opacity > 0.02;
      matVidrio.visible = matVidrio.opacity > 0.01;
      tmpC.copy(colPlano).lerp(colCyan, e);
      matPlano.color.copy(tmpC);
      matPlano.opacity = (0.4 + 0.55 * e) * (1 - 0.7 * s);
      matCota.opacity = 0.75 * e;
      tmpC.copy(colBorde).lerp(acento, 0.75 * w.fachada).lerp(colCyan, e);
      matLosaBorde.color.copy(tmpC);
      matLosaBorde.opacity = (0.9 * (1 - 0.6 * s)) * (1 + 0.1 * w.fachada);
      letrero.opacity = (0.35 + 0.55 * w.fachada) * (0.8 + 0.2 * Math.sin(t * 2.2)) * presencia;
      letrero.color.copy(acento);

      // Cámaras: barrido (más amplio con foco «camaras») y cono de alerta.
      const vida = 1 - Math.max(e, s) * 0.85;
      conos.forEach((c, i) => {
        const amp = 0.1 + 0.32 * w.camaras;
        tmpQ.setFromAxisAngle(up, Math.sin(t * (0.55 + 0.15 * (i % 3)) + i * 1.7) * amp);
        c.mesh.quaternion.copy(tmpQ).multiply(c.q0);
        const det = c.alerta ? w.camaras : 0;
        c.mesh.material.opacity = (0.05 + 0.06 * w.camaras + 0.05 * det) * vida;
        c.mesh.material.color.copy(colIndigo).lerp(acento, w.camaras * 0.6).lerp(colAmber, det);
        c.led.material.color.copy(det > 0.5 ? colAmber : acento);
        c.led.material.opacity = (0.5 + 0.5 * Math.sin(t * (det > 0.5 ? 9 : 2) + i)) * vida;
      });

      // Persona caminando por el pasillo del piso de alerta.
      const px = -5 + 11 * suave(pingpong(t / 9));
      persona.grupo.position.set(px, 0, 0.1);
      persona.grupo.rotation.y = Math.sin((t / 9) * Math.PI) > 0 ? Math.PI / 2 : -Math.PI / 2;
      persona.mat.opacity = 0.9 * vida;
      persona.halo.material.opacity = 0.45 * vida;
      const det = w.camaras;
      caja.visible = det > 0.01;
      caja.position.set(px, 1.0, 0.1);
      caja.material.opacity = det * (0.75 + 0.25 * Math.sin(t * 10));
      caja.scale.setScalar(1 + 0.04 * Math.sin(t * 6));
      ondas.forEach((r, i) => {
        const ph = fase(t, 1.8, i / 3);
        r.position.set(px, 0.05, 0.1);
        r.scale.setScalar(1 + ph * 2.2);
        (r.material as THREE.MeshBasicMaterial).opacity = (1 - ph) * det * 0.9;
      });
      flujoAlerta.update(t, det, 0.5, 0.35);
      anillosCentral.forEach((r, i) => {
        const ph = fase(t, 1.4, i / 2);
        r.scale.setScalar(1 + ph * 1.8);
        (r.material as THREE.MeshBasicMaterial).opacity = (1 - ph) * det;
      });
      centralGlow.material.color.copy(colIndigo).lerp(colAmber, det * (0.5 + 0.5 * Math.sin(t * 7)));
      centralGlow.material.opacity = 0.55 + 0.35 * det;
      antenaLed.material.opacity = 0.4 + 0.6 * Math.max(0, Math.sin(t * 3));

      // Acceso con reconocimiento facial.
      {
        const a = w.acceso;
        const ciclo = Math.floor(t / 7);
        const ph = fase(t, 7);
        const rechazo = ciclo % 3 === 2;
        let z = 9;
        let op = 1;
        let abrir = 0;
        let escaneo = 0;
        let res = 0;
        if (ph < 0.3) {
          z = 9 - 3.4 * suave(ph / 0.3);
          op = ramp(ph, 0, 0.06);
        } else if (ph < 0.55) {
          z = 5.6;
          escaneo = ramp(ph, 0.3, 0.33) * (1 - ramp(ph, 0.52, 0.55));
        } else {
          res = ramp(ph, 0.55, 0.6) * (1 - ramp(ph, 0.92, 1));
          if (rechazo) {
            z = 5.6 + 3 * suave(ramp(ph, 0.75, 1));
            op = 1 - ramp(ph, 0.85, 1);
          } else {
            abrir = ramp(ph, 0.56, 0.64) * (1 - ramp(ph, 0.86, 0.94));
            z = 5.6 - 4.2 * suave(ramp(ph, 0.6, 0.95));
            op = 1 - ramp(ph, 0.9, 1);
          }
        }
        visitante.grupo.position.z = z;
        visitante.grupo.rotation.y = rechazo && ph > 0.75 ? 0 : Math.PI;
        visitante.mat.opacity = op * (0.35 + 0.6 * Math.max(a, 0.3)) * vida;
        visitante.halo.material.opacity = op * 0.4 * vida;
        brazos.forEach((b) => {
          b.parent?.rotation.set(0, -abrir * Math.PI * 0.5, 0);
        });
        matBrazo.color.copy(res > 0 ? (rechazo ? colRed : colGreen) : colPlano);
        const vis = a * vida;
        matCara.opacity = vis * (0.55 + 0.4 * escaneo + 0.3 * res);
        matCara.color.copy(colCyan).lerp(rechazo ? colRed : colGreen, res);
        matRejilla.opacity = vis * 0.35 * (0.3 + escaneo);
        lineaScan.position.y = -0.55 + 1.1 * pingpong(t * 1.6);
        matScan.opacity = vis * escaneo;
        matScan.color.copy(acento);
        matResultado.opacity = vis * res;
        matResultado.color.copy(rechazo ? colRed : colGreen);
        caraGlow.material.opacity = vis * res * 0.6;
        caraGlow.material.color.copy(rechazo ? colRed : colGreen);
        conexion.material.opacity = vis * 0.6;
        malla.rotation.y = Math.sin(t * 0.8) * 0.5;
      }

      // Puertas que reconocen: onda verde piso por piso.
      {
        const p = w.puertas;
        const total = puertas.length;
        const cabeza = (t * 2.2) % (total + 6);
        puertas.forEach((pu, j) => {
          const dd = cabeza - j;
          const flash = dd >= 0 ? Math.exp(-dd * 0.9) : 0;
          const encendida = dd >= 0 ? 1 : 0;
          pu.mat.color.copy(colPlano).lerp(colGreen, Math.min(1, flash * 1.4 + encendida * 0.35) * p);
          pu.mat.opacity = (0.25 + p * (0.35 + 0.4 * flash)) * vida;
          pu.glow.material.opacity = flash * p * 0.85 * vida;
          pu.hoja.opacity = (flash * 0.55 + encendida * 0.12) * p * vida;
        });
      }

      // IoT y domótica: luces que se encienden piso por piso, pulsos de datos.
      {
        const q = w.iot;
        const ola = (t * 0.9) % (N + 3);
        luces.forEach((m, i) => {
          const on = q * ramp(ola - i, 0, 0.4);
          const base = 0.035 * (((i * 7) % 3) === 0 ? 1 : 0.3);
          m.opacity = (base + on * 0.5) * vida;
        });
        sensores.forEach((sn, k) => {
          const ph = fase(t, sn.tipo === "mov" ? 1.1 : 2.2, k * 0.137);
          sn.mesh.rotation.y = t * 1.2 + k;
          sn.mesh.scale.setScalar(1 + q * 0.6);
          sn.glow.material.opacity = q * (0.25 + 0.6 * (1 - ph)) * vida;
          sn.glow.scale.setScalar(1.3 + ph * 2.2 * q);
        });
        matSensor.temp.opacity = matSensor.mov.opacity = matSensor.luz.opacity = (0.35 + 0.6 * q) * vida;
        matBandeja.opacity = (0.18 + 0.5 * q) * vida;
        matBandeja.color.copy(colSteel).lerp(colCyan, q);
        montante.material.opacity = (0.25 + 0.5 * q) * vida;
        flujoIot.update(t, q * vida, 0.06);
      }

      // Escaneo 3D.
      {
        uNube.uSweep.value = barrido;
        uNube.uOp.value = s;
        nube.visible = s > 0.01;
        const ang = kit.reloj * 0.45;
        const orbita = v3(Math.cos(ang) * 15, Math.max(1.5, barrido + 1.8), Math.sin(ang) * 13);
        const flot = v3(posDron.x, posDron.y + Math.sin(t * 1.6) * 0.25, posDron.z);
        dron.position.copy(flot).lerp(orbita, s);
        dron.rotation.y = t * 0.6;
        hotspots.escaneo.copy(dron.position).add(v3(0, 0.9, 0));
        const yb = Math.max(0, barrido);
        hazA.set(dron.position.x > 0 ? W / 2 : -W / 2, yb, -D / 2);
        hazB.set(dron.position.x > 0 ? W / 2 : -W / 2, yb, D / 2);
        if (Math.abs(dron.position.z) > Math.abs(dron.position.x) * 0.75) {
          hazA.set(-W / 2, yb, dron.position.z > 0 ? D / 2 : -D / 2);
          hazB.set(W / 2, yb, dron.position.z > 0 ? D / 2 : -D / 2);
        }
        const pa = geoHaz.attributes.position as THREE.BufferAttribute;
        pa.setXYZ(0, dron.position.x, dron.position.y - 0.2, dron.position.z);
        pa.setXYZ(1, hazA.x, hazA.y, hazA.z);
        pa.setXYZ(2, dron.position.x, dron.position.y - 0.2, dron.position.z);
        pa.setXYZ(3, hazB.x, hazB.y, hazB.z);
        pa.needsUpdate = true;
        matHaz.opacity = s * 0.7;
        planoScan.position.y = yb;
        planoScan.material.opacity = s * (barrido > TECHO + 1 ? 0.2 : 0.9);
      }
    },
  };
}

const crear: FabricaEscena = (op) => montarEscena("edificio", op, construir, { fov: 40, niebla: 0.011 });

export default crear;
