/**
 * Campus 3D de la historia del diagnóstico.
 *
 * Una «ciudad de la empresa» isométrica: 10 distritos en anillo (uno por área
 * de ARS, con su color y una silueta que evoca su escena de /servicios) unidos
 * por líneas de datos a un núcleo central que hace de indicador de madurez.
 *
 * API imperativa: `setCapitulo(capitulo)` vuela la cámara al `foco` (~1.2 s,
 * easing) o a la vista general, y cambia el ánimo del campus:
 *  - «antes»: todo apagado/rojizo, alertas que parpadean y papeles en remolino;
 *  - «transicion»: las `activas` se encienden con su color y aparecen flujos de
 *    datos entre ellas y hacia el núcleo;
 *  - «despues»: todo brilla en orden (ola por distrito) y la madurez sube.
 * Las áreas recomendadas llevan un halo pulsante. Hover/clic avisan por callback.
 *
 * Reutiliza el Kit y los helpers del motor de /servicios (solo importa, no lo cambia).
 */

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { AreaId, Capitulo } from "@/data/diagnostico/tipos";
import type { EscenaId } from "@/data/servicios/tipos";
import { COLOR, Kit, arco, easeInOut, mulberry32, v3, type Flujo } from "../../servicios/escenas/_edificio-motor";
import { createSafeRenderer, type SafeRenderer } from "@/lib/three/safe-renderer";
import { avance, madurezCapitulo } from "./calculos";
import { construirSilueta, crearMateriales, type MaterialesDistrito, type Silueta } from "./siluetas";

export type DistritoCampus = { id: AreaId; nombre: string; corto: string; color: string; escena: EscenaId };

export type OpcionesCampus = {
  canvas: HTMLCanvasElement;
  distritos: DistritoCampus[];
  recomendadas: AreaId[];
  madurez: { hoy: number; conArs: number };
  lowPower: boolean;
  reducedMotion: boolean;
  /** Distrito bajo el puntero (coordenadas de cliente) o null. */
  onHover?: (id: AreaId | null, x: number, y: number) => void;
  onSeleccion?: (id: AreaId, x: number, y: number) => void;
  /** El contexto WebGL se perdió y no volvió: el componente muestra el respaldo. */
  onFallo?: () => void;
};

export type InstanciaCampus = {
  setCapitulo(capitulo: Capitulo): void;
  resize(ancho: number, alto: number): void;
  setActiva(activa: boolean): void;
  dispose(): void;
};

const RADIO = 17;
const DUR_VUELO = 1.2;
const ALTO_MADUREZ = 9;
const GENERAL = { pos: v3(37, 41, 37), target: v3(-2, 0.5, 2) };

const COL_APAGADO = new THREE.Color(0x2a3b5c);
const COL_ROJO = new THREE.Color(0xff3b5c);
const COL_ROJO_TENUE = new THREE.Color(0x5c2338);
const COL_RELLENO = new THREE.Color(0x0c1c40);
const COL_INDIGO = new THREE.Color(COLOR.indigo);
const COL_VERDE = new THREE.Color(COLOR.green);

type Distrito = {
  d: DistritoCampus;
  i: number;
  pos: THREE.Vector3;
  color: THREE.Color;
  m: MaterialesDistrito;
  silueta: Silueta;
  halo: THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial> | null;
  alerta: THREE.Sprite;
  alertaSuelo: THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>;
  etiqueta: THREE.Sprite;
  hit: THREE.Mesh;
  red: THREE.LineBasicMaterial;
  haciaNucleo: Flujo;
  /** Encendido actual (suavizado) y objetivo. */
  on: number;
  objetivo: number;
  hover: number;
};

export function crearCampus(op: OpcionesCampus): InstanciaCampus {
  const sr = createSafeRenderer({ canvas: op.canvas, lowPower: op.lowPower, onFatal: () => op.onFallo?.() });
  if (!sr) throw new Error("WebGL no disponible");
  try {
    return montarCampus(op, sr);
  } catch (e) {
    // Si la construcción falla no se deja un contexto WebGL huérfano.
    sr.dispose(true);
    throw e;
  }
}

function montarCampus(op: OpcionesCampus, sr: SafeRenderer): InstanciaCampus {
  const { canvas, lowPower, reducedMotion } = op;

  const renderer = sr.renderer;
  let dpr = sr.maxDpr;
  renderer.setClearColor(COLOR.deep, 1);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(COLOR.deep, 0.0085);
  const fovBase = 34;
  const camera = new THREE.PerspectiveCamera(fovBase, 1, 0.1, 500);
  scene.add(new THREE.HemisphereLight(0x8aa2ff, 0x0a1736, 2.1));
  const luz = new THREE.DirectionalLight(0xd5e0ff, 1.7);
  luz.position.set(30, 50, 20);
  scene.add(luz);

  const kit = new Kit(scene, camera, { canvas, acento: "#2348d4", lowPower, reducedMotion });

  // ── Suelo ──
  const suelo = kit.suelo(420, { reach: 0.018, celda: 2, mayor: 10, placa: 30 });
  scene.add(suelo.mesh);
  kit.polvo(360, 110, 26, 31);
  const anilloCalle = kit.linea(
    Array.from({ length: 96 }, (_, i) => v3(Math.cos((i / 96) * Math.PI * 2) * RADIO, 0.04, Math.sin((i / 96) * Math.PI * 2) * RADIO)),
    COLOR.french,
    0.7,
    true,
  );
  scene.add(anilloCalle);

  // ── Núcleo: indicador de madurez ──
  const nucleo = new THREE.Group();
  scene.add(nucleo);
  const base = kit.caja(5, 0.35, 5, { relleno: 0x0c1c40, borde: COLOR.indigo, opBorde: 0.9 });
  nucleo.add(base.grupo);
  const vidrio: THREE.Vector3[] = [];
  const RV = 1.25;
  for (let k = 0; k < 4; k++) {
    const a = (k / 4) * Math.PI * 2 + Math.PI / 4;
    vidrio.push(v3(Math.cos(a) * RV, 0.35, Math.sin(a) * RV), v3(Math.cos(a) * RV, 0.35 + ALTO_MADUREZ, Math.sin(a) * RV));
  }
  for (const f of [0, 0.25, 0.5, 0.75, 1]) {
    const y = 0.35 + f * ALTO_MADUREZ;
    for (let k = 0; k < 24; k++) {
      const a0 = (k / 24) * Math.PI * 2;
      const a1 = ((k + 1) / 24) * Math.PI * 2;
      vidrio.push(v3(Math.cos(a0) * RV, y, Math.sin(a0) * RV), v3(Math.cos(a1) * RV, y, Math.sin(a1) * RV));
    }
  }
  const matVidrio = kit.matLinea(COLOR.steel, 0.35);
  nucleo.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(vidrio), matVidrio));
  const geoColumna = new THREE.CylinderGeometry(1, 1, 1, 24, 1, true);
  geoColumna.translate(0, 0.5, 0);
  const matColumna = new THREE.MeshBasicMaterial({
    color: COLOR.indigo,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });
  const columna = new THREE.Mesh(geoColumna, matColumna);
  columna.position.y = 0.35;
  columna.scale.set(1.05, 0.01, 1.05);
  nucleo.add(columna);
  const tapa = kit.sprite(COLOR.indigo, 3.4, 0.9);
  nucleo.add(tapa);

  // Número de madurez (textura de canvas redibujada solo al cambiar).
  const texNumero = kit.textura(256, 128, () => {});
  const lienzoNumero = texNumero.image as HTMLCanvasElement;
  const numero = new THREE.Sprite(new THREE.SpriteMaterial({ map: texNumero, transparent: true, depthWrite: false, depthTest: false }));
  numero.scale.set(5, 2.5, 1);
  numero.renderOrder = 20;
  nucleo.add(numero);
  let numeroPintado = -1;
  const pintarNumero = (valor: number, color: THREE.Color) => {
    const v = Math.round(valor);
    if (v === numeroPintado) return;
    numeroPintado = v;
    const c = lienzoNumero.getContext("2d");
    if (!c) return;
    c.clearRect(0, 0, 256, 128);
    c.textAlign = "center";
    c.fillStyle = `#${color.getHexString()}`;
    c.shadowColor = c.fillStyle;
    c.shadowBlur = 16;
    c.font = "700 64px ui-sans-serif, system-ui, sans-serif";
    c.fillText(`${v}`, 128, 70);
    c.shadowBlur = 0;
    c.fillStyle = "rgba(213,224,255,0.85)";
    c.font = "600 22px ui-sans-serif, system-ui, sans-serif";
    c.fillText("MADUREZ DIGITAL", 128, 104);
    texNumero.needsUpdate = true;
  };

  // ── Distritos ──
  const recomendadas = new Set(op.recomendadas);
  const n = op.distritos.length;
  const distritos: Distrito[] = op.distritos.map((d, i) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    const pos = v3(Math.cos(a) * RADIO, 0, Math.sin(a) * RADIO);
    const color = new THREE.Color(d.color);
    const m = crearMateriales(kit);

    // plataforma
    const geoPlaca = new THREE.BoxGeometry(7, 0.25, 7);
    geoPlaca.translate(0, 0.125, 0);
    const placa = new THREE.Mesh(geoPlaca, m.relleno);
    placa.position.copy(pos);
    const bordePlaca = new THREE.LineSegments(new THREE.EdgesGeometry(geoPlaca), m.linea);
    bordePlaca.position.copy(pos);
    scene.add(placa, bordePlaca);

    const silueta = construirSilueta(kit, d.escena, m, pos.clone().setY(0.25), color);
    scene.add(silueta.grupo);

    const halo = recomendadas.has(d.id) ? kit.anillo(4.6, 5, color, 64) : null;
    if (halo) {
      halo.position.copy(pos).setY(0.08);
      scene.add(halo);
    }

    const alerta = kit.sprite(COL_ROJO, 2.6, 0);
    alerta.position.copy(pos).setY(silueta.alto + 1.6);
    const alertaSuelo = kit.anillo(3.6, 3.9, COL_ROJO, 48);
    alertaSuelo.position.copy(pos).setY(0.3);
    scene.add(alerta, alertaSuelo);

    const texEtiqueta = kit.textura(512, 128, (c, w, h) => {
      c.textAlign = "center";
      c.textBaseline = "middle";
      c.fillStyle = "rgba(2,10,24,0.55)";
      const r = 28;
      c.beginPath();
      c.roundRect(16, 22, w - 32, h - 44, r);
      c.fill();
      c.strokeStyle = d.color;
      c.lineWidth = 3;
      c.stroke();
      c.fillStyle = "#e6eeff";
      c.font = "600 44px ui-sans-serif, system-ui, sans-serif";
      c.fillText(d.corto, w / 2, h / 2 + 2);
    });
    const etiqueta = new THREE.Sprite(new THREE.SpriteMaterial({ map: texEtiqueta, transparent: true, depthWrite: false, depthTest: false }));
    etiqueta.scale.set(5.6, 1.4, 1);
    etiqueta.position.copy(pos).setY(silueta.alto + 1.6);
    etiqueta.renderOrder = 10;
    scene.add(etiqueta);

    const hit = new THREE.Mesh(new THREE.BoxGeometry(7.5, silueta.alto + 3, 7.5).translate(0, (silueta.alto + 3) / 2, 0), new THREE.MeshBasicMaterial());
    hit.position.copy(pos);
    hit.visible = false;
    hit.userData.indice = i;
    scene.add(hit);

    // línea de datos hacia el núcleo
    const dir = pos.clone().normalize();
    const red = kit.matLinea(COL_APAGADO, 0.35);
    scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([dir.clone().multiplyScalar(3), dir.clone().multiplyScalar(RADIO - 3.8)]).translate(0, 0.08, 0), red));
    const haciaNucleo = kit.flujo(arco(pos.clone().setY(1.2), v3(0, 2.4, 0), 4.5), color, 16, 0.75);

    return { d, i, pos, color, m, silueta, halo, alerta, alertaSuelo, etiqueta, hit, red, haciaNucleo, on: 0, objetivo: 0, hover: 0 };
  });

  // Flujos entre vecinos del anillo (se ven cuando ambos están encendidos).
  const vecinos = distritos.map((a, i) => {
    const b = distritos[(i + 1) % n];
    const curva = arco(a.pos.clone().setY(1.4), b.pos.clone().setY(1.4), 3.2);
    const mat = kit.matLinea(a.color, 0);
    scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(curva.getPoints(32)), mat));
    return { a, b, mat, flujo: kit.flujo(curva, a.color.clone().lerp(b.color, 0.5), 12, 0.6), k: 0 };
  });

  // ── Papeles en remolino (el caos) ──
  const nPapeles = lowPower ? 36 : 80;
  const rand = mulberry32(11);
  const papeles = Array.from({ length: nPapeles }, () => ({
    r: 5 + rand() * 22,
    a: rand() * Math.PI * 2,
    y: 1.5 + rand() * 9,
    vel: 0.08 + rand() * 0.18,
    giro: v3(rand() * 2, rand() * 2, rand() * 2),
    fase: rand() * 10,
  }));
  const geoPapel = new THREE.PlaneGeometry(0.55, 0.72);
  const matPapel = new THREE.MeshBasicMaterial({ color: 0xdfe6f2, transparent: true, opacity: 0.75, side: THREE.DoubleSide, depthWrite: false });
  const instPapeles = new THREE.InstancedMesh(geoPapel, matPapel, nPapeles);
  instPapeles.frustumCulled = false;
  scene.add(instPapeles);
  const obj = new THREE.Object3D();

  // ── Controles ──
  const bloquearRueda = (e: WheelEvent) => e.stopImmediatePropagation();
  canvas.addEventListener("wheel", bloquearRueda, { capture: true });
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = false;
  controls.enableZoom = true; // solo pinza: la rueda está bloqueada
  controls.rotateSpeed = 0.5;
  controls.maxPolarAngle = 1.32;
  controls.minDistance = 8;
  controls.maxDistance = 130;
  canvas.style.touchAction = "pan-y";

  let portrait = false;
  let ancho = 1;
  let alto = 1;
  let foco: AreaId | null = null;

  const encuadre = (id: AreaId | null) => {
    const dist = id ? distritos.find((x) => x.d.id === id) : undefined;
    if (!dist) {
      const k = portrait ? 1.45 : 1;
      return { pos: GENERAL.target.clone().add(GENERAL.pos.clone().sub(GENERAL.target).multiplyScalar(k)), target: GENERAL.target.clone() };
    }
    const fuera = dist.pos.clone().normalize();
    const lado = v3(-fuera.z, 0, fuera.x);
    const target = dist.pos.clone().setY(dist.silueta.alto * 0.45);
    const k = portrait ? 1.2 : 1;
    const pos = target
      .clone()
      .add(fuera.multiplyScalar(23 * k))
      .add(lado.multiplyScalar(10 * k))
      .add(v3(0, 18 * k, 0));
    return { pos, target };
  };

  {
    const e = encuadre(null);
    camera.position.copy(e.target).add(e.pos.clone().sub(e.target).multiplyScalar(1.3));
    controls.target.copy(e.target);
    controls.update();
  }

  type Vuelo = { p0: THREE.Vector3; t0: THREE.Vector3; p1: THREE.Vector3; t1: THREE.Vector3; k: number; dur: number };
  let vuelo: Vuelo | null = null;
  let arrastrando = false;
  const volar = () => {
    const e = encuadre(foco);
    vuelo = { p0: camera.position.clone(), t0: controls.target.clone(), p1: e.pos, t1: e.target, k: 0, dur: reducedMotion ? 0.4 : DUR_VUELO };
  };
  const onStart = () => {
    arrastrando = true;
    vuelo = null;
  };
  const onEnd = () => {
    arrastrando = false;
  };
  controls.addEventListener("start", onStart);
  controls.addEventListener("end", onEnd);

  // ── Selección ──
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const hits = distritos.map((x) => x.hit);
  const elegir = (cx: number, cy: number): Distrito | null => {
    const r = canvas.getBoundingClientRect();
    ndc.set(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const h = ray.intersectObjects(hits, false)[0];
    return h ? distritos[h.object.userData.indice as number] : null;
  };
  let hoverId: AreaId | null = null;
  let abajo: { x: number; y: number } | null = null;
  const onDown = (e: PointerEvent) => {
    abajo = { x: e.clientX, y: e.clientY };
  };
  const onUp = (e: PointerEvent) => {
    if (abajo && Math.hypot(e.clientX - abajo.x, e.clientY - abajo.y) < 7) {
      const d = elegir(e.clientX, e.clientY);
      if (d) op.onSeleccion?.(d.d.id, e.clientX, e.clientY);
    }
    abajo = null;
  };
  const onMove = (e: PointerEvent) => {
    if (e.buttons || e.pointerType === "touch") return;
    const d = elegir(e.clientX, e.clientY);
    const id = d?.d.id ?? null;
    canvas.style.cursor = id ? "pointer" : "grab";
    if (id !== hoverId || id) op.onHover?.(id, e.clientX, e.clientY);
    hoverId = id;
  };
  const onLeave = () => {
    if (hoverId) op.onHover?.(null, 0, 0);
    hoverId = null;
    canvas.style.cursor = "";
  };
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerleave", onLeave);

  // ── Estado del capítulo ──
  let momento: Capitulo["momento"] = "antes";
  let caos = 1;
  let caosObjetivo = 1;
  let madurez = op.madurez.hoy;
  let madurezObjetivo = op.madurez.hoy;
  let desdeCapitulo = 0;
  let reloj = 0;

  const aplicarCapitulo = (c: Capitulo) => {
    momento = c.momento;
    desdeCapitulo = reloj;
    const activas = new Set(c.activas);
    const fraccion = avance(op.recomendadas, c);
    for (const d of distritos) {
      if (momento === "antes") d.objetivo = activas.has(d.d.id) ? 0.6 : 0;
      else if (momento === "transicion") d.objetivo = activas.has(d.d.id) ? 1 : 0.04;
      else d.objetivo = activas.has(d.d.id) || activas.size === 0 ? 1 : 0.55;
    }
    caosObjetivo = momento === "antes" ? 1 : momento === "transicion" ? 0.6 * (1 - fraccion) : 0;
    madurezObjetivo = madurezCapitulo(op.madurez, op.recomendadas, c);
    foco = c.foco;
    volar();
  };

  // ── Bucle ──
  const tmpCol = new THREE.Color();
  const tmpCol2 = new THREE.Color();
  const colMadurez = new THREE.Color();
  let raf = 0;
  let activa = false;
  let perdido = false;
  let last = 0;
  let t = 3;
  let acc = 0;
  let frames = 0;

  const actualizar = (dt: number) => {
    const dtAnim = reducedMotion ? 0 : dt;
    reloj += dt;
    t += dtAnim;
    const k = 1 - Math.exp(-dt * (reducedMotion ? 8 : 2.6));
    caos += (caosObjetivo - caos) * k;
    madurez += (madurezObjetivo - madurez) * (1 - Math.exp(-dt * (reducedMotion ? 8 : 1.4)));

    suelo.u.uTime.value = t;
    suelo.u.uPulso.value = caos * 0.8;
    suelo.u.uPulsoColor.value.copy(COL_ROJO);
    (anilloCalle.material as THREE.LineBasicMaterial).color.copy(tmpCol.set(COLOR.french).lerp(COL_ROJO_TENUE, caos));

    const enDespues = reloj - desdeCapitulo;
    for (const d of distritos) {
      // En «despues» los distritos se encienden en orden (ola).
      const retraso = momento === "despues" && !reducedMotion ? d.i * 0.16 : 0;
      const meta = enDespues >= retraso ? d.objetivo : Math.min(d.on, d.objetivo);
      d.on += (meta - d.on) * k;
      d.hover += ((hoverId === d.d.id ? 1 : 0) - d.hover) * (1 - Math.exp(-dt * 10));
      const apagado = tmpCol2.copy(COL_APAGADO).lerp(COL_ROJO_TENUE, caos);
      const parpadeo = !reducedMotion && caos > 0.05 && Math.sin(t * 17 + d.i * 7.3) * Math.sin(t * 2.3 + d.i * 1.7) > 0.55 ? 0.35 * caos * (1 - d.on) : 0;
      const brillo = Math.min(1, d.on + d.hover * 0.35);
      const col = tmpCol.copy(apagado).lerp(d.color, d.on);
      if (parpadeo) col.lerp(COL_ROJO, parpadeo);
      d.m.linea.color.copy(col);
      d.m.linea.opacity = 0.45 + brillo * 0.5;
      d.m.acento.color.copy(col);
      d.m.acento.opacity = 0.2 + brillo * 0.8;
      d.m.plano.color.copy(col);
      d.m.plano.opacity = 0.06 + brillo * 0.32;
      d.m.brillo.color.copy(col);
      d.m.brillo.opacity = 0.15 + brillo * 0.85;
      d.m.relleno.color.copy(COL_RELLENO);
      d.m.relleno.emissive.copy(d.color).multiplyScalar(0.1 * brillo);
      d.silueta.animar(t, d.on, dtAnim);
      for (const f of d.silueta.flujos) f.update(t, d.on * 0.9, 0.35);

      const alarma = caos * (1 - d.on);
      const ciclo = (t * 0.9 + d.i * 0.37) % 1;
      d.alerta.material.opacity = alarma * (reducedMotion ? 0.6 : ciclo < 0.5 ? 0.9 : 0.15);
      d.alertaSuelo.material.opacity = alarma * (reducedMotion ? 0.3 : 0.45 * (1 - ciclo));
      d.alertaSuelo.scale.setScalar(reducedMotion ? 1 : 0.85 + ciclo * 0.3);
      d.etiqueta.material.opacity = 0.65 + brillo * 0.35;
      d.etiqueta.scale.set(5.6 * (1 + d.hover * 0.12), 1.4 * (1 + d.hover * 0.12), 1);
      d.etiqueta.position.y = d.silueta.alto + 1.6 + (foco === d.d.id ? 0.4 : 0);

      if (d.halo) {
        const pulso = reducedMotion ? 0.5 : 0.5 + 0.5 * Math.sin(t * 2.2 + d.i);
        d.halo.material.opacity = (0.25 + d.on * 0.55) * (0.55 + pulso * 0.45);
        d.halo.scale.setScalar(1 + pulso * 0.05);
      }
      d.red.color.copy(col);
      d.red.opacity = 0.2 + d.on * 0.6;
      d.haciaNucleo.update(t + d.i * 0.13, d.on > 0.5 ? (d.on - 0.5) * 2 * 0.9 : 0, 0.32);
    }
    for (const v of vecinos) {
      const ambos = Math.min(v.a.on, v.b.on);
      v.k = ambos > 0.6 ? (ambos - 0.6) / 0.4 : 0;
      v.mat.opacity = v.k * 0.5;
      v.flujo.update(t, v.k * 0.85, 0.28);
    }

    // núcleo
    const f = madurez / 100;
    colMadurez.copy(COL_ROJO).lerp(COL_INDIGO, Math.min(1, f / 0.55));
    if (f > 0.55) colMadurez.lerp(COL_VERDE, (f - 0.55) / 0.45);
    columna.scale.y = Math.max(0.01, f * ALTO_MADUREZ);
    matColumna.color.copy(colMadurez);
    tapa.position.y = 0.35 + f * ALTO_MADUREZ;
    tapa.material.color.copy(colMadurez);
    tapa.scale.setScalar(3 + (reducedMotion ? 0 : Math.sin(t * 2) * 0.3));
    numero.position.y = 0.35 + ALTO_MADUREZ + 2.2;
    pintarNumero(madurez, colMadurez);
    base.borde.color.copy(tmpCol.set(COLOR.indigo).lerp(COL_ROJO, caos * 0.6));

    // papeles
    instPapeles.visible = caos > 0.02;
    if (instPapeles.visible) {
      matPapel.opacity = 0.75 * Math.min(1, caos * 1.4);
      for (let i = 0; i < nPapeles; i++) {
        const p = papeles[i];
        const a = p.a + t * p.vel;
        const r = p.r * (0.7 + 0.3 * caos);
        obj.position.set(Math.cos(a) * r, p.y + Math.sin(t * 0.9 + p.fase) * 0.8, Math.sin(a) * r);
        obj.rotation.set(t * p.giro.x + p.fase, t * p.giro.y, t * p.giro.z);
        obj.scale.setScalar(Math.min(1, caos * 1.3));
        obj.updateMatrix();
        instPapeles.setMatrixAt(i, obj.matrix);
      }
      instPapeles.instanceMatrix.needsUpdate = true;
    }
  };

  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(Math.max((now - last) / 1000, 0), 0.1);
    last = now;
    if (vuelo) {
      vuelo.k += dt / vuelo.dur;
      const e = easeInOut(Math.min(1, vuelo.k));
      camera.position.lerpVectors(vuelo.p0, vuelo.p1, e);
      controls.target.lerpVectors(vuelo.t0, vuelo.t1, e);
      if (vuelo.k >= 1) vuelo = null;
    }
    controls.autoRotate = !reducedMotion && !vuelo && !arrastrando;
    controls.autoRotateSpeed = Math.sin(reloj * 0.11) * (foco ? 0.35 : 0.2);
    controls.update(dt);
    actualizar(dt);
    renderer.render(scene, camera);

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
    if (activa) arrancar();
    else {
      actualizar(0);
      renderer.render(scene, camera);
    }
  };

  return {
    setCapitulo(c) {
      aplicarCapitulo(c);
      if (!raf) {
        actualizar(0);
        renderer.render(scene, camera);
      }
    },
    resize(w, h) {
      ancho = Math.max(1, Math.round(w));
      alto = Math.max(1, Math.round(h));
      const eraPortrait = portrait;
      portrait = ancho / alto < 0.85;
      renderer.setSize(ancho, alto, false);
      camera.aspect = ancho / alto;
      camera.fov = portrait ? fovBase + 12 : fovBase;
      camera.updateProjectionMatrix();
      if (eraPortrait !== portrait) volar();
      if (!raf && !perdido) {
        actualizar(0);
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
      controls.dispose();
      canvas.removeEventListener("wheel", bloquearRueda, { capture: true });
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.style.cursor = "";
      const mats = new Set<THREE.Material>();
      scene.traverse((o) => {
        const mesh = o as THREE.Mesh;
        mesh.geometry?.dispose();
        const m = mesh.material;
        if (Array.isArray(m)) m.forEach((x) => mats.add(x));
        else if (m) mats.add(m);
      });
      for (const m of mats) m.dispose();
      kit.disposeTexturas();
      instPapeles.dispose();
      sr.dispose();
    },
  };
}
