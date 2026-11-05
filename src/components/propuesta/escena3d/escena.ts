/**
 * Escena 3D de la propuesta: «su operación con ARS».
 *
 * Toma el campus del diagnóstico (mismo anillo de 10 distritos, mismas siluetas
 * y Kit del motor de /servicios) y lo cuenta como línea de trabajo:
 *  - los distritos de la propuesta se encienden fase a fase (destello + insignia
 *    «FASE n») y un trazo une las fases en orden;
 *  - alrededor orbitan satélites con los sistemas del cliente, unidos al núcleo
 *    ARS por haces cuyo color y sentido dependen del modo (integra va y vuelve,
 *    centraliza fluye hacia dentro y el satélite queda absorbido…); el ERP se destaca;
 *  - si hay analíticas, cámaras con cono de visión en monitoreo / centro.
 *
 * Todo el estado visual se deriva de dos relojes (línea de tiempo `tl` y reloj de
 * animación `t`), así `capturar()` puede posar la escena en su estado final, sacar
 * 3 vistas a 1600×900 y devolverla a donde estaba dentro del mismo tick (la persona
 * no ve el cambio).
 */

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { COLOR, Kit, arco, easeInOut, ramp, suave, v3, type Flujo } from "@/components/servicios/escenas/_edificio-motor";
import { construirSilueta, crearMateriales, type MaterialesDistrito, type Silueta } from "@/components/diagnostico/historia/siluetas";
import { createSafeRenderer, type SafeRenderer } from "@/lib/three/safe-renderer";
import { MODOS, type DistritoPlan, type PlanEscena, type SatelitePlan } from "./plan";

export type OpcionesEscena3D = {
  canvas: HTMLCanvasElement;
  plan: PlanEscena;
  /** Celular / pantalla angosta / equipo modesto: DPR ≤ 1.5, sin antialias, menos partículas. */
  lowPower: boolean;
  /** Equipo modesto: además DPR 1. */
  calidadBaja: boolean;
  reducedMotion: boolean;
  /** -1 antes de empezar, 0…n-1 fase encendiéndose, n = integración con sus sistemas. */
  onFase?: (fase: number) => void;
  onFallo?: () => void;
};

export type InstanciaEscena3D = {
  resize(ancho: number, alto: number): void;
  setActiva(activa: boolean): void;
  /** Repite la animación de fases desde el principio. */
  reiniciar(): void;
  /** 2–3 vistas JPEG (dataURL) en el estado final, sin tocar la vista actual. */
  capturar(): string[];
  dispose(): void;
};

const RADIO = 17;
const RADIO_SAT = 31;
const ALTO_SAT = 4.5;
const CENTRO_NUCLEO = v3(0, 3.4, 0);

const INICIO = 0.6;
const PASO = 2.3;
const ENCENDIDO = 0.9;
const PASO_SAT = 0.35;
const APARECE_SAT = 0.9;
const ABSORCION = 3;

const CAPTURA = { ancho: 1600, alto: 900, calidad: 0.82, maxBytes: 500 * 1024 };

const COL_APAGADO = new THREE.Color(0x2a3b5c);
const COL_RELLENO = new THREE.Color(0x0c1c40);
const COL_GRIS = new THREE.Color(0x56627a);

type Distrito = {
  d: DistritoPlan;
  i: number;
  pos: THREE.Vector3;
  color: THREE.Color;
  m: MaterialesDistrito;
  silueta: Silueta;
  etiqueta: THREE.Sprite;
  insignia: THREE.Sprite | null;
  halo: THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial> | null;
  destello: THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial> | null;
  red: THREE.LineBasicMaterial;
  haciaNucleo: Flujo;
};

type Satelite = {
  s: SatelitePlan;
  i: number;
  base: THREE.Vector3;
  grupo: THREE.Group;
  borde: THREE.LineBasicMaterial;
  relleno: THREE.MeshBasicMaterial;
  luz: THREE.Sprite;
  etiqueta: THREE.Sprite;
  poste: THREE.LineDashedMaterial;
  anilloErp: THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial> | null;
  haz: THREE.Line;
  matHaz: THREE.LineBasicMaterial | THREE.LineDashedMaterial;
  puntosHaz: number;
  entrada: Flujo | null;
  salida: Flujo | null;
  color: THREE.Color;
};

/**
 * La silueta de Comunicación escala sus ondas de radio desde el origen del grupo,
 * así que también multiplica su altura y salen volando por encima de la torre.
 * Aquí se corrige la altura después de `animar` (sin tocar siluetas.ts).
 */
function ondasEnSuSitio(s: Silueta) {
  const yOnda = s.alto - 0.9;
  for (const o of s.grupo.children) {
    if (!(o instanceof THREE.LineLoop)) continue;
    const e = o.scale.x;
    const f = (e - 0.3) / 3.4;
    o.position.y = yOnda * (1 - e) - f * 0.6;
  }
}

type Camara = { grupo: THREE.Group; cono: THREE.Mesh<THREE.ConeGeometry, THREE.MeshBasicMaterial>; cuerpo: THREE.MeshBasicMaterial; luz: THREE.Sprite; yaw: number; desfase: number; aparece: number };

export function crearEscena3D(op: OpcionesEscena3D): InstanciaEscena3D {
  const sr = createSafeRenderer({ canvas: op.canvas, lowPower: op.lowPower, onFatal: () => op.onFallo?.() });
  if (!sr) throw new Error("WebGL no disponible");
  try {
    return montar(op, sr);
  } catch (e) {
    sr.dispose(true);
    throw e;
  }
}

function montar(op: OpcionesEscena3D, sr: SafeRenderer): InstanciaEscena3D {
  const { canvas, plan, lowPower, reducedMotion } = op;
  const renderer = sr.renderer;
  let dpr = op.calidadBaja ? 1 : sr.maxDpr;
  renderer.setPixelRatio(dpr);
  renderer.setClearColor(COLOR.deep, 1);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(COLOR.deep, 0.0062);
  const fovBase = 34;
  const camera = new THREE.PerspectiveCamera(fovBase, 1, 0.1, 600);
  scene.add(new THREE.HemisphereLight(0x8aa2ff, 0x0a1736, 2.1));
  const sol = new THREE.DirectionalLight(0xd5e0ff, 1.7);
  sol.position.set(30, 50, 20);
  scene.add(sol);

  const kit = new Kit(scene, camera, { canvas, acento: "#2348d4", lowPower, reducedMotion });

  // ── Suelo y anillos ──
  const suelo = kit.suelo(520, { reach: 0.014, celda: 2, mayor: 10, placa: 30 });
  scene.add(suelo.mesh);
  kit.polvo(op.calidadBaja ? 160 : 320, 130, 26, 23);
  const circulo = (r: number, y: number, color: THREE.ColorRepresentation, opacidad: number) =>
    kit.linea(
      Array.from({ length: 128 }, (_, i) => v3(Math.cos((i / 128) * Math.PI * 2) * r, y, Math.sin((i / 128) * Math.PI * 2) * r)),
      color,
      opacidad,
      true,
    );
  scene.add(circulo(RADIO, 0.04, COLOR.french, 0.7));
  const orbita = circulo(RADIO_SAT, ALTO_SAT - 0.25, COLOR.french, 0);
  scene.add(orbita);

  const nFases = Math.max(1, plan.fases.length);
  const inicioFase = (k: number) => INICIO + k * PASO;
  const tIntegracion = inicioFase(nFases);
  const apareceSat = (i: number) => tIntegracion + i * PASO_SAT;
  const T_FINAL = apareceSat(Math.max(0, plan.satelites.length - 1)) + APARECE_SAT + 1.5 + ABSORCION + 0.5;

  // ── Etiquetas (texturas de canvas) ──
  const pastilla = (texto: string, borde: string, o: { relleno?: string; tinta?: string; px?: number; ancho?: number } = {}) => {
    const w = o.ancho ?? 512;
    return kit.textura(w, 128, (c, ww, h) => {
      c.textAlign = "center";
      c.textBaseline = "middle";
      c.fillStyle = o.relleno ?? "rgba(2,10,24,0.62)";
      c.beginPath();
      c.roundRect(14, 22, ww - 28, h - 44, 30);
      c.fill();
      c.strokeStyle = borde;
      c.lineWidth = 3;
      c.stroke();
      c.fillStyle = o.tinta ?? "#e6eeff";
      let px = o.px ?? 44;
      c.font = `600 ${px}px ui-sans-serif, system-ui, sans-serif`;
      while (c.measureText(texto).width > ww - 70 && px > 22) {
        px -= 2;
        c.font = `600 ${px}px ui-sans-serif, system-ui, sans-serif`;
      }
      c.fillText(texto, ww / 2, h / 2 + 2);
    });
  };
  const spriteTexto = (tex: THREE.Texture, ancho: number, alto: number, orden = 10) => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, depthTest: false }));
    s.scale.set(ancho, alto, 1);
    s.renderOrder = orden;
    return s;
  };

  // ── Núcleo ARS ──
  const nucleo = new THREE.Group();
  scene.add(nucleo);
  const base = kit.caja(5, 0.35, 5, { relleno: 0x0c1c40, borde: COLOR.indigo, opBorde: 0.9 });
  nucleo.add(base.grupo);
  const geoCristal = new THREE.OctahedronGeometry(1.9, 0);
  const matCristal = new THREE.MeshBasicMaterial({ color: COLOR.indigo, transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending });
  const cristal = new THREE.Mesh(geoCristal, matCristal);
  const aristasCristal = new THREE.LineSegments(new THREE.EdgesGeometry(geoCristal), kit.matLinea(COLOR.bright, 0.95));
  cristal.add(aristasCristal);
  cristal.position.copy(CENTRO_NUCLEO);
  cristal.scale.set(1, 1.35, 1);
  nucleo.add(cristal);
  const brilloNucleo = kit.sprite(COLOR.indigo, 7, 0.6);
  brilloNucleo.position.copy(CENTRO_NUCLEO);
  nucleo.add(brilloNucleo);
  const anillosNucleo = [kit.anillo(2.9, 3.05, COLOR.bright, 64), kit.anillo(3.7, 3.8, COLOR.indigo, 64)];
  anillosNucleo.forEach((a, k) => {
    a.position.y = 0.4 + k * 0.02;
    nucleo.add(a);
  });
  const etiquetaNucleo = spriteTexto(pastilla("ARS", "#6b8aff", { relleno: "rgba(20,38,100,0.85)", px: 54, ancho: 256 }), 3.4, 1.7, 12);
  etiquetaNucleo.position.set(0, CENTRO_NUCLEO.y + 4, 0);
  nucleo.add(etiquetaNucleo);

  // ── Distritos ──
  const n = plan.distritos.length;
  const distritos: Distrito[] = plan.distritos.map((d, i) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    const pos = v3(Math.cos(a) * RADIO, 0, Math.sin(a) * RADIO);
    const color = new THREE.Color(d.color);
    const m = crearMateriales(kit);

    const geoPlaca = new THREE.BoxGeometry(7, 0.25, 7);
    geoPlaca.translate(0, 0.125, 0);
    const placa = new THREE.Mesh(geoPlaca, m.relleno);
    placa.position.copy(pos);
    const bordePlaca = new THREE.LineSegments(new THREE.EdgesGeometry(geoPlaca), m.linea);
    bordePlaca.position.copy(pos);
    scene.add(placa, bordePlaca);

    const silueta = construirSilueta(kit, d.escena, m, pos.clone().setY(0.25), color);
    scene.add(silueta.grupo);

    const etiqueta = spriteTexto(pastilla(d.corto, d.color), 5.6, 1.4);
    etiqueta.position.copy(pos).setY(silueta.alto + 1.6);
    scene.add(etiqueta);

    let insignia: THREE.Sprite | null = null;
    let halo: Distrito["halo"] = null;
    let destello: Distrito["destello"] = null;
    if (d.fase !== null) {
      const f = plan.fases[d.fase];
      insignia = spriteTexto(
        pastilla((f?.rotulo ?? `Fase ${d.fase + 1}`).toUpperCase(), d.color, { relleno: d.color, tinta: "#020a18", px: 50, ancho: 320 }),
        2.9,
        1.15,
        11,
      );
      insignia.position.copy(pos).setY(silueta.alto + 2.85);
      scene.add(insignia);
      halo = kit.anillo(4.6, 5, color, 64);
      halo.position.copy(pos).setY(0.08);
      destello = kit.anillo(3.2, 3.6, color, 64);
      destello.position.copy(pos).setY(0.3);
      scene.add(halo, destello);
    }

    const dir = pos.clone().normalize();
    const red = kit.matLinea(COL_APAGADO, 0.3);
    scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([dir.clone().multiplyScalar(3.9), dir.clone().multiplyScalar(RADIO - 3.8)]).translate(0, 0.08, 0), red));
    const haciaNucleo = kit.flujo(arco(pos.clone().setY(1.2), CENTRO_NUCLEO.clone().setY(2), 4.5), color, 16, 0.75);

    return { d, i, pos, color, m, silueta, etiqueta, insignia, halo, destello, red, haciaNucleo };
  });
  const porArea = new Map(distritos.map((d) => [d.d.id, d]));

  // Trazo de la línea de trabajo: une la primera área de cada fase con la siguiente.
  const tramos = plan.fases.slice(1).flatMap((f, k) => {
    const a = porArea.get(plan.fases[k].areas[0]);
    const b = porArea.get(f.areas[0]);
    if (!a || !b || a === b) return [];
    const curva = arco(a.pos.clone().setY(0.6), b.pos.clone().setY(0.6), 5);
    const puntos = curva.getPoints(48);
    const geo = new THREE.BufferGeometry().setFromPoints(puntos);
    const mat = new THREE.LineDashedMaterial({ color: b.color, transparent: true, opacity: 0.85, dashSize: 0.7, gapSize: 0.45 });
    const linea = new THREE.Line(geo, mat);
    linea.computeLineDistances();
    scene.add(linea);
    const flujo = kit.flujo(curva, b.color, 10, 0.55);
    return [{ geo, mat, flujo, puntos: puntos.length, desde: inicioFase(k + 1) - 0.7, hasta: inicioFase(k + 1) + 0.1 }];
  });

  // ── Satélites ──
  const nSat = plan.satelites.length;
  const satelites: Satelite[] = plan.satelites.map((s, i) => {
    const a = (i / Math.max(1, nSat)) * Math.PI * 2 - Math.PI / 2 + Math.PI / Math.max(4, nSat) + 0.31;
    const base = v3(Math.cos(a) * RADIO_SAT, ALTO_SAT, Math.sin(a) * RADIO_SAT);
    const info = MODOS[s.modo];
    const color = new THREE.Color(info.color);
    const grupo = new THREE.Group();
    grupo.position.copy(base);
    scene.add(grupo);

    const geoHex = new THREE.CylinderGeometry(1.7, 1.7, 0.6, 6);
    const relleno = new THREE.MeshBasicMaterial({ color: 0x0c1c40, transparent: true, opacity: 0.9 });
    const hex = new THREE.Mesh(geoHex, relleno);
    const borde = kit.matLinea(color, 0.95);
    hex.add(new THREE.LineSegments(new THREE.EdgesGeometry(geoHex), borde));
    const geoNodo = new THREE.OctahedronGeometry(0.6, 0);
    const nodo = new THREE.LineSegments(new THREE.EdgesGeometry(geoNodo), borde);
    nodo.position.y = 1.1;
    geoNodo.dispose();
    const luz = kit.sprite(color, 3.6, 0.7);
    luz.position.y = 0.9;
    grupo.add(hex, nodo, luz);

    const texto = s.erp ? `ERP · ${s.sistema}` : s.sistema;
    const etiqueta = spriteTexto(pastilla(texto, info.color, { relleno: s.erp ? "rgba(20,38,100,0.9)" : undefined }), 6, 1.5);
    etiqueta.position.y = 2.8;
    grupo.add(etiqueta);

    const poste = new THREE.LineDashedMaterial({ color: info.color, transparent: true, opacity: 0, dashSize: 0.3, gapSize: 0.3 });
    const lineaPoste = new THREE.Line(new THREE.BufferGeometry().setFromPoints([v3(0, -0.3, 0), v3(0, -ALTO_SAT, 0)]), poste);
    lineaPoste.computeLineDistances();
    grupo.add(lineaPoste);

    let anilloErp: Satelite["anilloErp"] = null;
    if (s.erp) {
      grupo.scale.setScalar(1.3);
      anilloErp = kit.anillo(2.3, 2.55, COLOR.amber, 64);
      anilloErp.position.y = -0.35;
      grupo.add(anilloErp);
    }

    // Haz satélite → núcleo.
    const curva = arco(base.clone(), CENTRO_NUCLEO.clone(), 7);
    const puntos = curva.getPoints(64);
    const geoHaz = new THREE.BufferGeometry().setFromPoints(puntos);
    const discontinuo = s.modo === "migra" || s.modo === "convive" || s.modo === "reemplaza";
    const matHaz = discontinuo
      ? new THREE.LineDashedMaterial({ color, transparent: true, opacity: 0, dashSize: 0.8, gapSize: 0.5 })
      : new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0 });
    const haz = new THREE.Line(geoHaz, matHaz);
    if (discontinuo) haz.computeLineDistances();
    scene.add(haz);

    const inversa = arco(CENTRO_NUCLEO.clone(), base.clone(), 7);
    let entrada: Flujo | null = null;
    let salida: Flujo | null = null;
    if (s.modo === "integra") {
      entrada = kit.flujo(curva, color, 14, 0.7);
      salida = kit.flujo(inversa, COLOR.ice, 10, 0.55);
    } else if (s.modo === "migra") entrada = kit.flujo(curva, color, 14, 0.75);
    else if (s.modo === "convive") entrada = kit.flujo(curva, color, 6, 0.5);
    else if (s.modo === "reemplaza") salida = kit.flujo(inversa, COLOR.bright, 12, 0.65);
    else entrada = kit.flujo(curva, color, 18, 0.75);

    return { s, i, base, grupo, borde, relleno, luz, etiqueta, poste, anilloErp, haz, matHaz, puntosHaz: puntos.length, entrada, salida, color };
  });

  // ── Cámaras de analítica ──
  const camaras: Camara[] = [];
  if (plan.camaras > 0) {
    const monitoreo = porArea.get("monitoreo-inteligente");
    const centro = porArea.get("centro-de-operaciones");
    const sitios = [monitoreo, monitoreo, centro, centro].filter((x): x is Distrito => Boolean(x)).slice(0, plan.camaras);
    const esquinas = [v3(3, 0, 3), v3(-3, 0, -3), v3(3, 0, -3), v3(-3, 0, 3)];
    sitios.forEach((d, k) => {
      const esquina = esquinas[k % 2 === 0 ? 0 : 1].clone();
      const grupo = new THREE.Group();
      grupo.position.copy(d.pos).add(esquina).setY(0.25);
      scene.add(grupo);
      const poste = kit.linea([v3(0, 0, 0), v3(0, 3.2, 0)], COLOR.steel, 0.7);
      const cuerpo = kit.basico(COLOR.ice, 0.9);
      const caja = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.35, 0.8), cuerpo);
      caja.position.y = 3.3;
      const geoCono = new THREE.ConeGeometry(1.25, 3.8, 24, 1, true);
      geoCono.translate(0, -1.9, 0); // vértice en el origen
      geoCono.rotateX(-Math.PI / 2 - 0.55); // apunta hacia delante y abajo
      const cono = new THREE.Mesh(
        geoCono,
        new THREE.MeshBasicMaterial({ color: COLOR.cyan, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }),
      );
      const cabeza = new THREE.Group();
      cabeza.position.y = 3.3;
      cabeza.add(cono);
      const luz = kit.sprite(COLOR.red, 0.7, 0);
      luz.position.set(0, 3.45, 0.42);
      grupo.add(poste, caja, cabeza, luz);
      // mira hacia el centro de su plataforma
      const yaw = Math.atan2(-esquina.x, -esquina.z);
      grupo.userData.cabeza = cabeza;
      const aparece = d.d.fase !== null ? inicioFase(d.d.fase) + 0.6 : tIntegracion;
      camaras.push({ grupo, cono, cuerpo, luz, yaw, desfase: k * 1.7, aparece });
    });
  }

  // ── Controles ──
  const bloquearRueda = (e: WheelEvent) => e.stopImmediatePropagation();
  canvas.addEventListener("wheel", bloquearRueda, { capture: true });
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = false;
  controls.enableZoom = true; // solo pinza: la rueda queda para la página
  controls.rotateSpeed = 0.5;
  controls.maxPolarAngle = 1.3;
  controls.minDistance = 14;
  controls.maxDistance = 170;
  canvas.style.touchAction = "pan-y";
  canvas.style.cursor = "grab";

  let portrait = false;
  let ancho = 1;
  let alto = 1;

  const GENERAL = { pos: v3(52, 54, 56), target: v3(0, 1, 0) };
  const general = () => {
    const dir = GENERAL.pos.clone().sub(GENERAL.target);
    let dist = dir.length();
    if (portrait) {
      // En vertical manda el ancho: que quepa el anillo de distritos (los satélites entran al girar).
      const mediaH = Math.atan(Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect);
      dist = Math.max(dist * 0.8, 27 / Math.tan(mediaH));
      dir.setY(dir.y * 0.8);
    }
    return { pos: GENERAL.target.clone().add(dir.setLength(dist)), target: GENERAL.target.clone() };
  };
  {
    const e = general();
    camera.position.copy(e.pos);
    controls.target.copy(e.target);
    controls.update();
  }
  let arrastrando = false;
  const onStart = () => {
    arrastrando = true;
    canvas.style.cursor = "grabbing";
  };
  const onEnd = () => {
    arrastrando = false;
    canvas.style.cursor = "grab";
  };
  controls.addEventListener("start", onStart);
  controls.addEventListener("end", onEnd);

  // ── Pose (todo deriva de tl y t) ──
  const tmp = new THREE.Color();
  let faseAvisada = -2;

  const pose = (tl: number, t: number) => {
    suelo.u.uTime.value = t;
    suelo.u.uPulso.value = 0;

    // fases encendidas
    let encendidas = 0;
    for (const d of distritos) {
      let on = 0;
      if (d.d.fase !== null) {
        const ini = inicioFase(d.d.fase);
        on = suave(ramp(tl, ini, ini + ENCENDIDO));
        encendidas += on;
        if (d.destello) {
          const k = ramp(tl, ini, ini + 1.5);
          d.destello.visible = k > 0 && k < 1;
          d.destello.scale.setScalar(1 + easeInOut(k) * 1.8);
          d.destello.material.opacity = (1 - k) * 0.9;
        }
        if (d.halo) {
          const pulso = reducedMotion ? 0.5 : 0.5 + 0.5 * Math.sin(t * 2.2 + d.i);
          d.halo.material.opacity = on * (0.35 + pulso * 0.35);
          d.halo.scale.setScalar(1 + pulso * 0.04);
        }
        if (d.insignia) {
          const k = ramp(tl, ini + 0.2, ini + 0.8);
          d.insignia.material.opacity = k;
          d.insignia.position.y = d.silueta.alto + 2.85 + (1 - suave(k)) * 1.2;
        }
      }
      const parte = d.d.fase !== null;
      const brillo = parte ? on : 0;
      const col = tmp.copy(COL_APAGADO).lerp(d.color, on);
      d.m.linea.color.copy(col);
      d.m.linea.opacity = parte ? 0.4 + brillo * 0.55 : 0.32;
      d.m.acento.color.copy(col);
      d.m.acento.opacity = 0.15 + brillo * 0.85;
      d.m.plano.color.copy(col);
      d.m.plano.opacity = 0.04 + brillo * 0.32;
      d.m.brillo.color.copy(col);
      d.m.brillo.opacity = 0.1 + brillo * 0.9;
      d.m.relleno.color.copy(COL_RELLENO);
      d.m.relleno.emissive.copy(d.color).multiplyScalar(0.1 * brillo);
      d.silueta.animar(t, on, 0);
      if (d.d.escena === "comunicacion") ondasEnSuSitio(d.silueta);
      for (const f of d.silueta.flujos) f.update(t, on * 0.9, 0.35);
      d.etiqueta.material.opacity = parte ? 0.55 + on * 0.45 : 0.4;
      d.red.color.copy(col);
      d.red.opacity = 0.18 + on * 0.6;
      d.haciaNucleo.update(t + d.i * 0.13, on > 0.5 ? (on - 0.5) * 1.8 : 0, 0.32);
    }

    for (const tr of tramos) {
      const k = ramp(tl, tr.desde, tr.hasta);
      tr.geo.setDrawRange(0, Math.max(0, Math.round(tr.puntos * k)));
      tr.mat.opacity = 0.75 * k;
      tr.flujo.update(t, k * 0.6, 0.22);
    }

    // núcleo
    const fNucleo = Math.min(1, encendidas / Math.max(1, distritos.filter((d) => d.d.fase !== null).length));
    const vivo = 0.35 + fNucleo * 0.65;
    cristal.rotation.y = t * 0.35;
    matCristal.opacity = 0.18 + vivo * 0.3;
    brilloNucleo.material.opacity = 0.25 + vivo * 0.55;
    brilloNucleo.scale.setScalar(5.5 + vivo * 2.5 + (reducedMotion ? 0 : Math.sin(t * 1.8) * 0.4));
    anillosNucleo[0].rotation.z = t * 0.25;
    anillosNucleo[0].material.opacity = 0.3 + vivo * 0.5;
    anillosNucleo[1].material.opacity = 0.2 + vivo * 0.3;

    // satélites
    const kOrbita = ramp(tl, tIntegracion - 0.3, tIntegracion + 0.6);
    (orbita.material as THREE.LineBasicMaterial).opacity = kOrbita * 0.35;
    for (const s of satelites) {
      const t0 = apareceSat(s.i);
      const ap = suave(ramp(tl, t0, t0 + APARECE_SAT));
      const traza = ramp(tl, t0 + 0.3, t0 + APARECE_SAT + 0.4);
      const flujo = ramp(tl, t0 + APARECE_SAT, t0 + APARECE_SAT + 0.6);
      const tarde = ramp(tl, t0 + APARECE_SAT + 1.5, t0 + APARECE_SAT + 1.5 + ABSORCION);

      let escala = (s.s.erp ? 1.3 : 1) * (0.4 + 0.6 * ap);
      const posicion = s.base.clone();
      posicion.y += reducedMotion ? 0 : Math.sin(t * 0.8 + s.i * 1.3) * 0.25;
      let atenuar = 1;
      s.borde.color.copy(s.color);
      if (s.s.modo === "centraliza") {
        const k = suave(tarde);
        posicion.lerp(v3(posicion.x * 0.58, ALTO_SAT + 0.8, posicion.z * 0.58), k);
        escala *= 1 - 0.45 * k;
        atenuar = 1 - 0.45 * k;
      } else if (s.s.modo === "reemplaza") {
        const k = suave(tarde);
        atenuar = 1 - 0.55 * k;
        s.borde.color.lerp(COL_GRIS, k);
      } else if (s.s.modo === "migra") {
        atenuar = 1 - 0.3 * suave(tarde);
      }
      s.grupo.position.copy(posicion);
      s.grupo.scale.setScalar(Math.max(0.001, escala));
      s.grupo.visible = ap > 0.001;
      s.borde.opacity = 0.95 * ap * atenuar;
      s.relleno.opacity = 0.9 * ap;
      s.luz.material.opacity = 0.7 * ap * atenuar * (reducedMotion ? 1 : 0.8 + 0.2 * Math.sin(t * 2 + s.i));
      s.etiqueta.material.opacity = ap * (0.55 + 0.45 * atenuar);
      s.poste.opacity = 0.35 * ap;
      if (s.anilloErp) {
        const pulso = reducedMotion ? 0.5 : 0.5 + 0.5 * Math.sin(t * 2.4);
        s.anilloErp.material.opacity = ap * (0.45 + pulso * 0.45);
        s.anilloErp.scale.setScalar(1 + pulso * 0.12);
      }
      s.haz.geometry.setDrawRange(0, Math.round(s.puntosHaz * traza));
      s.matHaz.opacity = traza * (s.s.modo === "convive" ? 0.45 : 0.75) * (s.s.modo === "reemplaza" ? 1 - 0.5 * tarde : 1);
      const vel = s.s.modo === "convive" ? 0.12 : s.s.modo === "migra" ? 0.3 : 0.38;
      const tramo = s.s.modo === "migra" ? 0.35 : 1;
      s.entrada?.update(t + s.i * 0.21, flujo * (s.s.modo === "convive" ? 0.5 : 0.9), vel, tramo);
      s.salida?.update(t + s.i * 0.37 + 0.5, flujo * 0.75, vel * 0.9);
    }

    // cámaras
    for (const c of camaras) {
      const k = suave(ramp(tl, c.aparece, c.aparece + 0.8));
      c.grupo.visible = k > 0.001;
      const cabeza = c.grupo.userData.cabeza as THREE.Group;
      cabeza.rotation.y = c.yaw + (reducedMotion ? 0 : Math.sin(t * 0.55 + c.desfase) * 0.6);
      c.cono.material.opacity = 0.12 * k;
      c.cuerpo.opacity = 0.9 * k;
      c.luz.material.opacity = k * (reducedMotion ? 0.8 : (t + c.desfase) % 1.6 < 0.8 ? 0.9 : 0.2);
    }
  };

  const faseEn = (tl: number) => {
    if (tl < INICIO) return -1;
    if (tl >= tIntegracion && nSat > 0) return plan.fases.length;
    return Math.min(plan.fases.length - 1, Math.floor((tl - INICIO) / PASO));
  };

  // ── Bucle ──
  let tl = reducedMotion ? T_FINAL : 0;
  let t = 4;
  let raf = 0;
  let activa = false;
  let perdido = false;
  let last = 0;
  let acc = 0;
  let frames = 0;

  const dibujar = () => {
    pose(tl, t);
    const f = faseEn(tl);
    if (f !== faseAvisada) {
      faseAvisada = f;
      op.onFase?.(f);
    }
    renderer.render(scene, camera);
  };

  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(Math.max((now - last) / 1000, 0), 0.1);
    last = now;
    if (!reducedMotion) {
      tl = Math.min(tl + dt, T_FINAL + 1000);
      t += dt;
    }
    controls.autoRotate = !reducedMotion && !arrastrando;
    controls.autoRotateSpeed = 0.35;
    controls.update(dt);
    dibujar();

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
  sr.onLost = () => {
    perdido = true;
    parar();
  };
  sr.onRestored = () => {
    perdido = false;
    if (activa) arrancar();
    else dibujar();
  };

  // ── Capturas ──
  const camCaptura = new THREE.PerspectiveCamera(fovBase, CAPTURA.ancho / CAPTURA.alto, 0.1, 600);
  const vistasCaptura = () => {
    const vistas: { pos: THREE.Vector3; target: THREE.Vector3 }[] = [{ pos: v3(46, 44, 56), target: v3(0, 1.5, 0) }];
    const central = porArea.get("centro-de-operaciones");
    if (central) {
      const fuera = central.pos.clone().normalize();
      const lado = v3(-fuera.z, 0, fuera.x);
      // Detrás y por encima de la central, mirando el campus a través del núcleo.
      vistas.push({ pos: central.pos.clone().add(fuera.multiplyScalar(30)).add(lado.multiplyScalar(-8)).setY(24), target: v3(0, 2, 0).sub(central.pos.clone().normalize().multiplyScalar(4)) });
    }
    const primera = porArea.get(plan.areaPrincipal);
    if (primera) {
      const fuera = primera.pos.clone().normalize();
      const lado = v3(-fuera.z, 0, fuera.x);
      const target = primera.pos.clone().setY(primera.silueta.alto * 0.5);
      vistas.push({ pos: target.clone().add(fuera.multiplyScalar(23)).add(lado.multiplyScalar(10)).add(v3(0, 17, 0)), target });
    }
    return vistas.slice(0, 3);
  };

  const aJpeg = () => {
    let url = canvas.toDataURL("image/jpeg", CAPTURA.calidad);
    for (const q of [0.72, 0.62]) {
      if (((url.length - 23) * 3) / 4 <= CAPTURA.maxBytes) break;
      url = canvas.toDataURL("image/jpeg", q);
    }
    return url;
  };

  return {
    resize(w, h) {
      ancho = Math.max(1, Math.round(w));
      alto = Math.max(1, Math.round(h));
      const eraPortrait = portrait;
      portrait = ancho / alto < 0.85;
      renderer.setSize(ancho, alto, false);
      camera.aspect = ancho / alto;
      camera.fov = portrait ? fovBase + 14 : fovBase;
      camera.updateProjectionMatrix();
      if (eraPortrait !== portrait) {
        const e = general();
        camera.position.copy(e.pos);
        controls.target.copy(e.target);
        controls.update();
      }
      if (!raf && !perdido) dibujar();
    },
    setActiva(a) {
      activa = a;
      if (a) arrancar();
      else parar();
    },
    reiniciar() {
      if (reducedMotion) return;
      tl = 0;
      if (!raf && !perdido) dibujar();
    },
    capturar() {
      if (perdido || sr.isLost()) return [];
      // Todo ocurre en un solo tick: el navegador nunca compone los cuadros intermedios.
      const urls: string[] = [];
      try {
        pose(T_FINAL, t);
        renderer.setPixelRatio(1);
        renderer.setSize(CAPTURA.ancho, CAPTURA.alto, false);
        for (const v of vistasCaptura()) {
          camCaptura.position.copy(v.pos);
          camCaptura.lookAt(v.target);
          renderer.render(scene, camCaptura);
          const url = aJpeg();
          if (url.startsWith("data:image/jpeg")) urls.push(url);
        }
      } catch {
        /* contexto perdido o canvas contaminado: se devuelve lo que haya */
      } finally {
        renderer.setPixelRatio(dpr);
        renderer.setSize(ancho, alto, false);
        if (!perdido) dibujar();
      }
      return urls;
    },
    dispose() {
      parar();
      activa = false;
      controls.removeEventListener("start", onStart);
      controls.removeEventListener("end", onEnd);
      controls.dispose();
      canvas.removeEventListener("wheel", bloquearRueda, { capture: true });
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
      sr.dispose();
    },
  };
}
