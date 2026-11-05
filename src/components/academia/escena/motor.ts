/**
 * Motor de la escena de la Academia: un WebGLRenderer por instancia, una cámara
 * que vuela entre estaciones y una capa HTML para las etiquetas.
 *
 *  - Las estaciones se construyen bajo demanda (solo la del foco actual), cada
 *    una en su propio punto del mundo; al cambiar de foco la cámara vuela ~1,6 s
 *    con easing y la luz/niebla se interpolan.
 *  - Sin sombras ni post-proceso: Lambert/Phong con sombreado plano, una luz
 *    hemisférica y una direccional (número de luces fijo: nunca recompila).
 *  - `setActiva(false)` (fuera de pantalla) o pestaña oculta detienen el bucle.
 *  - prefers-reduced-motion: sin vuelo ni animación; se dibuja un cuadro quieto
 *    (en `tQuieto` de cada estación) solo cuando cambia algo.
 *  - DPR acotado (1,5 normal, 1 en equipos modestos) y bajada automática si los
 *    cuadros van lentos.
 */

import * as THREE from "three";
import { createSafeRenderer } from "@/lib/three/safe-renderer";
import { FOCOS_ACADEMIA, type FocoAcademia } from "./focos";
import { Kit, clamp01, easeInOut, type Ambiente, type Encuadre, type Estacion, type FabricaEstacion, type Tono } from "./kit";
import { crearPortal } from "./estaciones/portal";
import { crearDotacion } from "./estaciones/dotacion";
import { crearPoligono } from "./estaciones/poligono";
import { crearGarita } from "./estaciones/garita";
import { crearPorteria } from "./estaciones/porteria";
import { crearPlataforma } from "./estaciones/plataforma";

const FABRICAS: Record<FocoAcademia, FabricaEstacion> = {
  portal: crearPortal,
  dotacion: crearDotacion,
  poligono: crearPoligono,
  garita: crearGarita,
  porteria: crearPorteria,
  plataforma: crearPlataforma,
};

/** Separación entre estaciones en el mundo (metros). */
const SEP = 70;
const DUR_VUELO = 1.6;
const ASPECTO_BASE = 1.6;

export type OpcionesMotor = {
  canvas: HTMLCanvasElement;
  capaEtiquetas: HTMLElement | null;
  lowPower: boolean;
  modesto: boolean;
  reducedMotion: boolean;
  onFallo: () => void;
};

export type MotorAcademia = {
  setFoco(f: FocoAcademia): void;
  resize(w: number, h: number): void;
  setActiva(v: boolean): void;
  dispose(): void;
};

type Construida = { est: Estacion; kit: Kit; base: THREE.Vector3 };

const CLASE_TONO: Record<Tono, string> = {
  azul: "border-[#6b8aff]/50 bg-[#0b1a44]/80 text-[#d5e0ff]",
  verde: "border-[#3dffa0]/60 bg-[#04251c]/80 text-[#bfffe0]",
  violeta: "border-[#b78bff]/60 bg-[#1c1240]/80 text-[#eadcff]",
  ambar: "border-[#ffb547]/60 bg-[#2a1c06]/80 text-[#ffe2b0]",
};
const PUNTO_TONO: Record<Tono, string> = {
  azul: "bg-[#6b8aff]",
  verde: "bg-[#3dffa0]",
  violeta: "bg-[#b78bff]",
  ambar: "bg-[#ffb547]",
};

export function crearMotor(op: OpcionesMotor): MotorAcademia | null {
  const sr = createSafeRenderer({ canvas: op.canvas, lowPower: op.lowPower || op.modesto, onFatal: op.onFallo });
  if (!sr) return null;
  const { renderer } = sr;
  const maxDpr = Math.min(window.devicePixelRatio || 1, op.modesto ? 1 : op.lowPower ? 1.25 : 1.5);
  let dpr = maxDpr;
  renderer.setPixelRatio(dpr);

  const scene = new THREE.Scene();
  const fondo = new THREE.Color(0x020a18);
  scene.background = fondo;
  const niebla = new THREE.FogExp2(0x020a18, 0.03);
  scene.fog = niebla;
  const camara = new THREE.PerspectiveCamera(40, 1, 0.02, 180);
  const hemi = new THREE.HemisphereLight(0x6b8aff, 0x0a1630, 1);
  scene.add(hemi);
  const sol = new THREE.DirectionalLight(0xd5e0ff, 1);
  sol.position.set(4, 8, 6);
  scene.add(sol);
  scene.add(sol.target);
  // Contraluz suave (da el brillo de borde al metal y a las siluetas)
  const contra = new THREE.DirectionalLight(0x6b8aff, 0.45);
  contra.position.set(-5, 3, -6);
  scene.add(contra);
  scene.add(contra.target);

  const construidas = new Map<FocoAcademia, Construida>();
  const asegurar = (f: FocoAcademia): Construida => {
    let c = construidas.get(f);
    if (!c) {
      const kit = new Kit();
      const est = FABRICAS[f](kit, { lowPower: op.lowPower || op.modesto });
      const base = new THREE.Vector3(FOCOS_ACADEMIA.indexOf(f) * SEP, 0, 0);
      est.grupo.position.copy(base);
      est.grupo.visible = false;
      scene.add(est.grupo);
      c = { est, kit, base };
      construidas.set(f, c);
    }
    return c;
  };

  // ── Estado de cámara ──
  let actual: FocoAcademia | null = null;
  let previo: FocoAcademia | null = null;
  const camPos = new THREE.Vector3();
  const camTgt = new THREE.Vector3();
  const desdePos = new THREE.Vector3();
  const desdeTgt = new THREE.Vector3();
  let desdeFov = 40;
  let desdeAmb: Ambiente | null = null;
  let vuelo = 1; // 0..1 (1 = llegó)
  let ancho = 1;
  let alto = 1;

  /** Encuadre de mundo de una estación, corregido por el aspecto del lienzo. */
  const encuadreMundo = (c: Construida, pos: THREE.Vector3, tgt: THREE.Vector3): number => {
    const e: Encuadre = c.est.encuadre;
    tgt.copy(e.target).add(c.base);
    pos.copy(e.pos).add(c.base);
    const aspecto = ancho / Math.max(1, alto);
    if (aspecto < ASPECTO_BASE) {
      const k = Math.min(2.1, Math.pow(ASPECTO_BASE / aspecto, 0.72));
      pos.sub(tgt).multiplyScalar(k).add(tgt);
    }
    return e.fov ?? 40;
  };

  const ambAplicado: Ambiente = { fondo: 0x020a18, niebla: 0.03, cielo: 0x6b8aff, suelo: 0x0a1630, hemi: 1, sol: 1, colorSol: 0xd5e0ff };
  const cA = new THREE.Color();
  const cB = new THREE.Color();
  const mezclaColor = (a: number, b: number, k: number, destino: THREE.Color) => destino.copy(cA.setHex(a)).lerp(cB.setHex(b), k);
  const aplicarAmbiente = (a: Ambiente, b: Ambiente, k: number) => {
    mezclaColor(a.fondo, b.fondo, k, fondo);
    niebla.color.copy(fondo);
    niebla.density = a.niebla + (b.niebla - a.niebla) * k;
    mezclaColor(a.cielo, b.cielo, k, hemi.color);
    mezclaColor(a.suelo, b.suelo, k, hemi.groundColor);
    hemi.intensity = a.hemi + (b.hemi - a.hemi) * k;
    sol.intensity = a.sol + (b.sol - a.sol) * k;
    mezclaColor(a.colorSol, b.colorSol, k, sol.color);
    ambAplicado.fondo = fondo.getHex();
    ambAplicado.niebla = niebla.density;
    ambAplicado.cielo = hemi.color.getHex();
    ambAplicado.suelo = hemi.groundColor.getHex();
    ambAplicado.hemi = hemi.intensity;
    ambAplicado.sol = sol.intensity;
    ambAplicado.colorSol = sol.color.getHex();
  };

  // ── Etiquetas HTML ──
  type Nodo = { el: HTMLDivElement; def: Estacion["etiquetas"][number]; ancho?: number };
  let nodos: Nodo[] = [];
  const montarEtiquetas = (est: Estacion | null) => {
    for (const n of nodos) n.el.remove();
    nodos = [];
    if (!op.capaEtiquetas || !est) return;
    for (const def of est.etiquetas) {
      const el = document.createElement("div");
      const tono = def.tono ?? "azul";
      el.className = `pointer-events-none absolute left-0 top-0 flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-medium leading-none tracking-wide opacity-0 shadow-[0_4px_18px_rgba(2,10,24,0.55)] backdrop-blur-sm will-change-transform sm:text-xs ${CLASE_TONO[tono]}`;
      const punto = document.createElement("span");
      punto.className = `inline-block h-1.5 w-1.5 shrink-0 rounded-full ${PUNTO_TONO[tono]}`;
      const texto = document.createElement("span");
      texto.textContent = def.texto;
      if (def.lado === "izq") el.append(texto, punto);
      else el.append(punto, texto);
      op.capaEtiquetas.append(el);
      nodos.push({ el, def });
    }
  };
  const vTmp = new THREE.Vector3();
  const actualizarEtiquetas = (tEst: number, visibilidad: number) => {
    for (const n of nodos) {
      n.def.ancla.getWorldPosition(vTmp);
      if (n.def.desfase) vTmp.add(n.def.desfase);
      vTmp.project(camara);
      const op0 = (n.def.opacidad ? n.def.opacidad(tEst) : 1) * visibilidad;
      if (vTmp.z > 1 || op0 < 0.02 || Math.abs(vTmp.x) > 1.05 || Math.abs(vTmp.y) > 1.05) {
        n.el.style.opacity = "0";
        continue;
      }
      const x = (vTmp.x * 0.5 + 0.5) * ancho;
      const y = (-vTmp.y * 0.5 + 0.5) * alto;
      // Ancho medido una vez; la etiqueta se mantiene dentro del lienzo.
      n.ancho ??= n.el.offsetWidth || undefined;
      const w = n.ancho ?? 0;
      let izq = n.def.lado === "izq" ? x - 10 - w : x + 10;
      izq = Math.max(6, Math.min(ancho - w - 6, izq));
      n.el.style.transform = `translate3d(${izq.toFixed(1)}px, ${y.toFixed(1)}px, 0) translateY(-50%)`;
      n.el.style.opacity = op0.toFixed(3);
    }
  };

  // ── Bucle ──
  let activa = false;
  let raf = 0;
  let reloj = 0;
  let ultimo = 0;
  let lento = 0;
  let rapido = 0;
  let muerto = false;

  const dibujar = (dt: number) => {
    if (sr.isLost() || muerto || !actual) return;
    const cAct = construidas.get(actual);
    if (!cAct) return;
    const quieto = op.reducedMotion;
    const tEst = quieto ? cAct.est.tQuieto : reloj;

    // Transición: la cámara se aleja de la estación saliente mientras el lienzo se
    // funde al fondo; a mitad se cambia de estación y la cámara se acerca a la
    // entrante mientras reaparece. (Volar entre estaciones mostraría el vacío.)
    let fov = encuadreMundo(cAct, vA, vB);
    let velo = 1;
    if (vuelo < 1) {
      vuelo = clamp01(vuelo + dt / DUR_VUELO);
      const p = previo ? construidas.get(previo) : undefined;
      if (vuelo < 0.5 && p) {
        const k = easeInOut(vuelo / 0.5);
        alejar(desdePos, desdeTgt, vC);
        camPos.lerpVectors(desdePos, vC, k);
        camTgt.copy(desdeTgt);
        fov = desdeFov;
        velo = 1 - suave01((vuelo - 0.2) / 0.3);
        if (desdeAmb) aplicarAmbiente(desdeAmb, desdeAmb, 1);
      } else {
        if (p) {
          p.est.grupo.visible = false;
          previo = null;
        }
        const k = easeInOut((vuelo - 0.5) / 0.5);
        alejar(vA, vB, vC);
        camPos.lerpVectors(vC, vA, k);
        camTgt.copy(vB);
        velo = suave01((vuelo - 0.5) / 0.3);
        aplicarAmbiente(cAct.est.ambiente, cAct.est.ambiente, 1);
      }
      op.canvas.style.opacity = velo >= 1 ? "" : velo.toFixed(3);
    } else {
      camPos.copy(vA);
      camTgt.copy(vB);
      aplicarAmbiente(cAct.est.ambiente, cAct.est.ambiente, 1);
    }
    // Balanceo idle de la cámara
    if (!quieto) {
      const b = (cAct.est.balanceo ?? 1) * 0.06 * Math.min(1, camPos.distanceTo(camTgt) / 4);
      camPos.x += Math.sin(reloj * 0.23) * b;
      camPos.y += Math.sin(reloj * 0.31 + 1) * b * 0.5;
    }
    camara.position.copy(camPos);
    camara.lookAt(camTgt);
    if (camara.fov !== fov) {
      camara.fov = fov;
      camara.updateProjectionMatrix();
    }
    sol.position.copy(camTgt).add(vC.set(4, 8, 6));
    sol.target.position.copy(camTgt);
    contra.position.copy(camTgt).add(vC.set(-5, 3, -6));
    contra.target.position.copy(camTgt);

    cAct.est.update(tEst, quieto ? 0 : dt);
    if (previo) {
      const p = construidas.get(previo);
      if (p) p.est.update(quieto ? p.est.tQuieto : reloj, quieto ? 0 : dt);
    }
    renderer.render(scene, camara);
    actualizarEtiquetas(tEst, vuelo < 1 ? Math.pow(clamp01((vuelo - 0.75) / 0.25), 2) : 1);
  };
  const vA = new THREE.Vector3();
  const vB = new THREE.Vector3();
  const vC = new THREE.Vector3();
  const suave01 = (x: number) => {
    const k = clamp01(x);
    return k * k * (3 - 2 * k);
  };
  /** Punto «alejado» de un encuadre: más atrás y un poco más alto. */
  const alejar = (pos: THREE.Vector3, tgt: THREE.Vector3, out: THREE.Vector3) => {
    const d = pos.distanceTo(tgt);
    out.copy(pos).sub(tgt).multiplyScalar(1.45).add(tgt);
    out.y += d * 0.18;
    return out;
  };

  const paso = (ahora: number) => {
    raf = 0;
    const dt = ultimo ? Math.min(0.05, (ahora - ultimo) / 1000) : 1 / 60;
    ultimo = ahora;
    if (!op.reducedMotion) reloj += dt;
    dibujar(dt);
    // Calidad adaptativa: si los cuadros van lentos, baja el DPR; si sobran, súbelo.
    if (dt > 0.034) lento++;
    else if (dt < 0.02) rapido++;
    if (lento > 45 && dpr > 1) {
      dpr = Math.max(1, dpr - 0.25);
      renderer.setPixelRatio(dpr);
      renderer.setSize(ancho, alto, false);
      lento = rapido = 0;
    } else if (rapido > 240 && dpr < maxDpr) {
      dpr = Math.min(maxDpr, dpr + 0.25);
      renderer.setPixelRatio(dpr);
      renderer.setSize(ancho, alto, false);
      lento = rapido = 0;
    }
    if (rapido + lento > 300) lento = rapido = 0;
    programar();
  };
  const debeCorrer = () => activa && !document.hidden && !sr.isLost() && !muerto && (!op.reducedMotion || vuelo < 1);
  const programar = () => {
    if (raf || !debeCorrer()) {
      if (!debeCorrer()) ultimo = 0;
      return;
    }
    raf = requestAnimationFrame(paso);
  };
  const detener = () => {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    ultimo = 0;
  };
  /** Un cuadro suelto (modo quieto o al cambiar de tamaño estando en pausa). */
  const cuadro = () => {
    if (!raf) dibujar(0);
  };

  const alCambiarVisibilidad = () => {
    if (document.hidden) detener();
    else programar();
  };
  document.addEventListener("visibilitychange", alCambiarVisibilidad);
  sr.onLost = detener;
  sr.onRestored = () => {
    cuadro();
    programar();
  };

  return {
    setFoco(f) {
      if (f === actual || muerto) return;
      const nueva = asegurar(f);
      const anterior = actual ? construidas.get(actual) : null;
      if (!anterior || op.reducedMotion) {
        if (anterior) anterior.est.grupo.visible = false;
        if (previo) {
          const p = construidas.get(previo);
          if (p) p.est.grupo.visible = false;
          previo = null;
        }
        vuelo = 1;
      } else {
        // Si había un vuelo a medias, la estación saliente es la que estaba en pantalla.
        if (previo && previo !== actual) {
          const p = construidas.get(previo);
          if (p) p.est.grupo.visible = false;
        }
        previo = actual;
        desdePos.copy(camara.position);
        desdeTgt.copy(camTgt);
        desdeFov = camara.fov;
        desdeAmb = { ...ambAplicado };
        vuelo = 0;
      }
      actual = f;
      nueva.est.grupo.visible = true;
      montarEtiquetas(nueva.est);
      cuadro();
      programar();
    },
    resize(w, h) {
      ancho = Math.max(1, Math.round(w));
      alto = Math.max(1, Math.round(h));
      renderer.setSize(ancho, alto, false);
      camara.aspect = ancho / alto;
      camara.updateProjectionMatrix();
      for (const n of nodos) n.ancho = undefined;
      cuadro();
    },
    setActiva(v) {
      activa = v;
      if (v) programar();
      else detener();
    },
    dispose() {
      muerto = true;
      detener();
      document.removeEventListener("visibilitychange", alCambiarVisibilidad);
      montarEtiquetas(null);
      for (const c of construidas.values()) {
        scene.remove(c.est.grupo);
        c.kit.dispose();
      }
      construidas.clear();
      sr.dispose();
    },
  };
}
