/**
 * Siluetas procedurales de los 10 distritos del campus (una por escena de /servicios).
 *
 * Cada distrito comparte un puñado de materiales (líneas, acentos, rellenos,
 * planos aditivos y brillos) para que el campus pueda «encenderlo» o «apagarlo»
 * cambiando solo el color y la opacidad de esos materiales, sin recorrer la
 * geometría. El origen de cada silueta es el centro de su plataforma (7 × 7).
 */

import * as THREE from "three";
import type { EscenaId } from "@/data/servicios/tipos";
import { v3, type Flujo, type Kit } from "../../servicios/escenas/_edificio-motor";

export type MaterialesDistrito = {
  /** Aristas y estructura. */
  linea: THREE.LineBasicMaterial;
  /** Detalles que brillan más (ondas, rutas, nodos). */
  acento: THREE.LineBasicMaterial;
  /** Volúmenes oscuros con emisivo del color del área. */
  relleno: THREE.MeshStandardMaterial;
  /** Pantallas y conos de luz (aditivos). */
  plano: THREE.MeshBasicMaterial;
  /** Puntos de luz (sprites aditivos). */
  brillo: THREE.SpriteMaterial;
};

export type Silueta = {
  grupo: THREE.Group;
  /** Altura aproximada (para colocar la etiqueta y el foco de la cámara). */
  alto: number;
  /** Partículas propias del distrito (se apagan con él). */
  flujos: Flujo[];
  /** Animación propia. `on` = 0 apagado … 1 encendido; `dt` = 0 con reducedMotion. */
  animar(t: number, on: number, dt: number): void;
};

export function crearMateriales(kit: Kit): MaterialesDistrito {
  return {
    linea: new THREE.LineBasicMaterial({ color: 0x2a3b5c, transparent: true, opacity: 0.6 }),
    acento: new THREE.LineBasicMaterial({ color: 0x2a3b5c, transparent: true, opacity: 0.5 }),
    relleno: new THREE.MeshStandardMaterial({
      color: 0x0c1c40,
      roughness: 0.85,
      metalness: 0.15,
      emissive: 0x000000,
      transparent: true,
      opacity: 0.88,
    }),
    plano: new THREE.MeshBasicMaterial({
      color: 0x2a3b5c,
      transparent: true,
      opacity: 0.2,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    }),
    brillo: new THREE.SpriteMaterial({
      map: kit.glow,
      color: 0x2a3b5c,
      transparent: true,
      opacity: 0.4,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  };
}

/* ───────────── utilidades de construcción ───────────── */

type Ctx = { kit: Kit; m: MaterialesDistrito; g: THREE.Group; origen: THREE.Vector3; color: THREE.Color };

function volumen(c: Ctx, geo: THREE.BufferGeometry, x = 0, y = 0, z = 0) {
  const mesh = new THREE.Mesh(geo, c.m.relleno);
  const bordes = new THREE.LineSegments(new THREE.EdgesGeometry(geo, 25), c.m.linea);
  const grupo = new THREE.Group();
  grupo.add(mesh, bordes);
  grupo.position.set(x, y, z);
  c.g.add(grupo);
  return grupo;
}

function caja(c: Ctx, w: number, h: number, d: number, x = 0, y = 0, z = 0) {
  const geo = new THREE.BoxGeometry(w, h, d);
  geo.translate(0, h / 2, 0);
  return volumen(c, geo, x, y, z);
}

function linea(c: Ctx, pts: THREE.Vector3[], mat: THREE.LineBasicMaterial, cerrada = false) {
  const geo = new THREE.BufferGeometry().setFromPoints(pts);
  const l = cerrada ? new THREE.LineLoop(geo, mat) : new THREE.Line(geo, mat);
  c.g.add(l);
  return l;
}

function segmentos(c: Ctx, pares: THREE.Vector3[], mat: THREE.LineBasicMaterial) {
  const l = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pares), mat);
  c.g.add(l);
  return l;
}

function circulo(r: number, y: number, n = 40) {
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return v3(Math.cos(a) * r, y, Math.sin(a) * r);
  });
}

function brillo(c: Ctx, x: number, y: number, z: number, escala: number) {
  const s = new THREE.Sprite(c.m.brillo);
  s.position.set(x, y, z);
  s.scale.setScalar(escala);
  c.g.add(s);
  return s;
}

function plano(c: Ctx, w: number, h: number, x: number, y: number, z: number, rotY = 0) {
  const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), c.m.plano);
  p.position.set(x, y, z);
  p.rotation.y = rotY;
  c.g.add(p);
  return p;
}

/** Flujo en coordenadas de mundo (el Kit lo añade a la escena). */
function flujoLocal(c: Ctx, curva: THREE.Curve<THREE.Vector3>, n: number, size: number) {
  const pts = curva.getPoints(48).map((p) => p.clone().add(c.origen));
  return c.kit.flujo(new THREE.CatmullRomCurve3(pts), c.color, n, size);
}

/* ───────────── siluetas ───────────── */

/** A · Campo: garita con talanquera y ruta de ronda con puntos QR. */
function campo(c: Ctx): Silueta {
  caja(c, 1.8, 2.4, 1.8, -1.4, 0, -1.2);
  caja(c, 2.2, 0.18, 2.2, -1.4, 2.4, -1.2);
  plano(c, 1.2, 0.7, -1.4, 1.5, -0.29);
  const barrera = segmentos(c, [v3(0, 0, 0), v3(3, 0, 0)], c.m.acento);
  barrera.position.set(-0.5, 1, -0.2);
  const ruta = [v3(-2.8, 0.08, 2.6), v3(2.7, 0.08, 2.6), v3(2.7, 0.08, -2.7), v3(0.6, 0.08, -2.7), v3(0.6, 0.08, 1)];
  linea(c, ruta, c.m.acento);
  const qr = ruta.map((p) => brillo(c, p.x, 0.45, p.z, 0.9));
  // vigilante (cápsula) que recorre la ruta
  const vig = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.6, 4, 8), c.m.plano);
  c.g.add(vig);
  const curva = new THREE.CatmullRomCurve3(ruta.map((p) => p.clone().setY(0.55)), false, "catmullrom", 0);
  const tmp = new THREE.Vector3();
  return {
    grupo: c.g,
    alto: 3,
    flujos: [],
    animar(t, on, dt) {
      barrera.rotation.z = on > 0.5 && dt > 0 ? Math.max(0, Math.sin(t * 0.7)) * 0.9 : 0;
      curva.getPoint((t * 0.06) % 1, tmp);
      vig.position.copy(tmp);
      vig.visible = on > 0.15;
      qr.forEach((s, i) => s.scale.setScalar(0.6 + on * 0.5 * (0.6 + 0.4 * Math.sin(t * 3 + i))));
    },
  };
}

/** B · Centro de operaciones: edificio bajo con muro de pantallas y mapa vivo. */
function centro(c: Ctx): Silueta {
  caja(c, 5, 1.7, 3.2, 0, 0, 0.4);
  const muro = new THREE.Group();
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 2; j++) {
      const p = new THREE.Mesh(new THREE.PlaneGeometry(1.45, 0.85), c.m.plano);
      p.position.set(-1.55 + i * 1.55, 2.35 + j * 0.95, -1.1);
      muro.add(p);
    }
  c.g.add(muro);
  segmentos(c, [v3(-2.4, 1.7, -1.15), v3(-2.4, 4.4, -1.15), v3(2.4, 1.7, -1.15), v3(2.4, 4.4, -1.15), v3(-2.4, 4.4, -1.15), v3(2.4, 4.4, -1.15)], c.m.linea);
  // mapa del techo: grilla y pines
  const pares: THREE.Vector3[] = [];
  for (let k = -2; k <= 2; k++) pares.push(v3(k, 1.75, -1), v3(k, 1.75, 1.8), v3(-2.2, 1.75, k * 0.6 + 0.4), v3(2.2, 1.75, k * 0.6 + 0.4));
  segmentos(c, pares, c.m.acento);
  const pines = [v3(-1.5, 2.2, 0.2), v3(0.6, 2.2, 1.2), v3(1.6, 2.2, -0.4), v3(-0.4, 2.2, -0.6)].map((p) => brillo(c, p.x, p.y, p.z, 0.8));
  return {
    grupo: c.g,
    alto: 4.6,
    flujos: [],
    animar(t, on) {
      pines.forEach((s, i) => s.position.setY(2.1 + Math.abs(Math.sin(t * 1.6 + i)) * 0.35 * on));
    },
  };
}

/** C · Comunicación: torre de radio en celosía con ondas. */
function comunicacion(c: Ctx): Silueta {
  const H = 7;
  const base = [v3(-1, 0, -1), v3(1, 0, -1), v3(1, 0, 1), v3(-1, 0, 1)];
  const top = base.map((p) => v3(p.x * 0.18, H, p.z * 0.18));
  const pares: THREE.Vector3[] = [];
  for (let i = 0; i < 4; i++) pares.push(base[i], top[i]);
  for (let k = 1; k <= 5; k++) {
    const f = k / 6;
    const a = base.map((p, i) => p.clone().lerp(top[i], f));
    const b = base.map((p, i) => p.clone().lerp(top[i], f + 1 / 6));
    for (let i = 0; i < 4; i++) pares.push(a[i], a[(i + 1) % 4], a[i], b[(i + 1) % 4]);
  }
  segmentos(c, pares, c.m.linea);
  segmentos(c, [v3(0, H, 0), v3(0, H + 1.4, 0)], c.m.acento);
  const punta = brillo(c, 0, H + 1.4, 0, 1.2);
  caja(c, 1.6, 1, 1.2, 2, 0, 1.6);
  const ondas = [0, 1, 2].map(() => linea(c, circulo(1, H + 0.6, 48), c.m.acento, true));
  return {
    grupo: c.g,
    alto: H + 1.5,
    flujos: [],
    animar(t, on) {
      ondas.forEach((o, i) => {
        const f = (t * 0.45 + i / 3) % 1;
        o.scale.setScalar(0.3 + f * 3.4);
        o.position.y = -f * 0.6;
        o.visible = on > 0.1;
      });
      punta.scale.setScalar(0.8 + on * (0.6 + 0.4 * Math.sin(t * 5)));
    },
  };
}

/** D · Monitoreo: edificio inteligente con cámaras y cono de visión. */
function edificio(c: Ctx): Silueta {
  const H = 6.4;
  caja(c, 2.8, H, 2.8);
  const pisos: THREE.Vector3[] = [];
  for (let y = 0.9; y < H; y += 0.9) {
    const r = 1.42;
    pisos.push(v3(-r, y, -r), v3(r, y, -r), v3(r, y, -r), v3(r, y, r), v3(r, y, r), v3(-r, y, r), v3(-r, y, r), v3(-r, y, -r));
  }
  segmentos(c, pisos, c.m.acento);
  const camaras = [v3(1.5, H - 0.3, 1.5), v3(-1.5, H - 0.3, 1.5), v3(1.5, H - 0.3, -1.5), v3(-1.5, H - 0.3, -1.5)];
  for (const p of camaras) {
    const cam = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.5, 8), c.m.relleno);
    cam.position.copy(p);
    cam.rotation.z = Math.PI / 2;
    c.g.add(cam);
    brillo(c, p.x, p.y, p.z, 0.6);
  }
  const conoGeo = new THREE.ConeGeometry(1.6, 3.6, 24, 1, true);
  conoGeo.translate(0, -1.8, 0);
  const cono = new THREE.Mesh(conoGeo, c.m.plano);
  const pivote = new THREE.Group();
  pivote.position.set(1.5, H - 0.3, 1.5);
  cono.rotation.x = -0.9;
  pivote.add(cono);
  c.g.add(pivote);
  return {
    grupo: c.g,
    alto: H + 0.5,
    flujos: [],
    animar(t, on) {
      pivote.rotation.y = Math.sin(t * 0.6) * 0.9 + 0.8;
      cono.visible = on > 0.2;
    },
  };
}

/** E · Realidad virtual: domo en malla con anillo flotante (Central Viva). */
function inmersiva(c: Ctx): Silueta {
  const domo = new THREE.SphereGeometry(2.7, 18, 8, 0, Math.PI * 2, 0, Math.PI / 2);
  const malla = new THREE.LineSegments(new THREE.WireframeGeometry(domo), c.m.linea);
  c.g.add(malla);
  const interior = new THREE.Mesh(domo, c.m.plano);
  interior.scale.setScalar(0.98);
  c.g.add(interior);
  const anillo = linea(c, circulo(1.6, 0, 48), c.m.acento, true);
  anillo.position.y = 3.9;
  const centroLuz = brillo(c, 0, 1.4, 0, 2.2);
  return {
    grupo: c.g,
    alto: 4.4,
    flujos: [],
    animar(t, on) {
      anillo.rotation.x = Math.sin(t * 0.8) * 0.35;
      anillo.rotation.z = Math.cos(t * 0.6) * 0.35;
      anillo.position.y = 3.9 + Math.sin(t * 1.2) * 0.2;
      centroLuz.scale.setScalar(1 + on * 1.6);
    },
  };
}

/** F · Gestión humana: árbol documental con expedientes. */
function humana(c: Ctx): Silueta {
  caja(c, 2.6, 0.5, 2.6);
  const ramas: THREE.Vector3[] = [v3(0, 0.5, 0), v3(0, 4.8, 0)];
  const hojas: THREE.Group[] = [];
  const puntas = [v3(-1.9, 2.4, 0.4), v3(1.8, 2.9, -0.5), v3(-1.4, 3.8, -1.2), v3(1.5, 4.2, 1.1), v3(0, 5.4, 0.3), v3(-2, 4.6, 1)];
  puntas.forEach((p, i) => {
    const desde = v3(0, Math.min(p.y - 0.8, 4.4), 0);
    ramas.push(desde, p);
    const f = caja(c, 0.9, 0.6, 0.12, p.x, p.y - 0.3, p.z);
    f.rotation.y = i * 0.7;
    hojas.push(f);
  });
  segmentos(c, ramas, c.m.acento);
  return {
    grupo: c.g,
    alto: 5.8,
    flujos: [],
    animar(t, on) {
      hojas.forEach((h, i) => {
        h.rotation.y = i * 0.7 + Math.sin(t * 0.8 + i) * 0.4 * on;
      });
    },
  };
}

/** G · Formación: aula con techo a dos aguas, tablero y certificado. */
function formacion(c: Ctx): Silueta {
  caja(c, 4.4, 1.9, 2.8);
  const tri = new THREE.Shape([new THREE.Vector2(-2.4, 0), new THREE.Vector2(2.4, 0), new THREE.Vector2(0, 1.4)]);
  const techo = new THREE.ExtrudeGeometry(tri, { depth: 3.1, bevelEnabled: false });
  techo.translate(0, 0, -1.55);
  volumen(c, techo, 0, 1.9, 0);
  plano(c, 2.6, 1.1, 0, 1.05, 1.42);
  const cert = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.8), c.m.plano);
  cert.position.set(0, 4.3, 0);
  c.g.add(cert);
  const marco = segmentos(c, [v3(-0.55, -0.4, 0), v3(0.55, -0.4, 0), v3(0.55, -0.4, 0), v3(0.55, 0.4, 0), v3(0.55, 0.4, 0), v3(-0.55, 0.4, 0), v3(-0.55, 0.4, 0), v3(-0.55, -0.4, 0)], c.m.acento);
  marco.position.copy(cert.position);
  return {
    grupo: c.g,
    alto: 4.8,
    flujos: [],
    animar(t, on) {
      const y = 4.3 + Math.sin(t * 1.3) * 0.2;
      cert.position.y = y;
      marco.position.y = y;
      cert.rotation.y = t * 0.6;
      marco.rotation.y = t * 0.6;
      cert.visible = on > 0.3;
      marco.visible = on > 0.3;
    },
  };
}

/** H · Finanzas y ERP: bloques encadenados (turnos → nómina → contabilidad → ERP). */
function finanzas(c: Ctx): Silueta {
  const bloques = [v3(-2.2, 0, 1.6), v3(-0.7, 0, 0.5), v3(0.8, 0, -0.6), v3(2.2, 0, -1.8)];
  const altos = [1, 1.6, 2.3, 3.1];
  bloques.forEach((p, i) => caja(c, 1.1, altos[i], 1.1, p.x, 0, p.z));
  const camino = new THREE.CatmullRomCurve3(bloques.map((p, i) => p.clone().setY(altos[i] + 0.45)));
  linea(c, camino.getPoints(40), c.m.acento);
  const f = flujoLocal(c, camino, 14, 0.7);
  return {
    grupo: c.g,
    alto: 3.8,
    flujos: [f],
    animar() {},
  };
}

/** I · Productividad e IA: red neuronal (icosaedro) sobre un pedestal. */
function productividad(c: Ctx): Silueta {
  caja(c, 1.6, 1.2, 1.6);
  const ico = new THREE.IcosahedronGeometry(1.7, 1);
  const red = new THREE.LineSegments(new THREE.WireframeGeometry(ico), c.m.acento);
  const nucleo = new THREE.Group();
  nucleo.add(red);
  const pos = ico.attributes.position as THREE.BufferAttribute;
  const vistos = new Set<string>();
  for (let i = 0; i < pos.count; i += 3) {
    const k = `${pos.getX(i).toFixed(2)},${pos.getY(i).toFixed(2)},${pos.getZ(i).toFixed(2)}`;
    if (vistos.has(k) || vistos.size > 14) continue;
    vistos.add(k);
    const s = new THREE.Sprite(c.m.brillo);
    s.position.set(pos.getX(i), pos.getY(i), pos.getZ(i));
    s.scale.setScalar(0.55);
    nucleo.add(s);
  }
  nucleo.position.y = 3.4;
  c.g.add(nucleo);
  segmentos(c, [v3(0, 1.2, 0), v3(0, 1.7, 0)], c.m.linea);
  return {
    grupo: c.g,
    alto: 5.2,
    flujos: [],
    animar(t, on) {
      nucleo.rotation.y = t * (0.15 + on * 0.35);
      nucleo.rotation.x = Math.sin(t * 0.4) * 0.25;
      nucleo.scale.setScalar(0.85 + on * 0.15);
    },
  };
}

/** J · Gobierno: torre de control con escudo giratorio. */
function gobierno(c: Ctx): Silueta {
  volumen(c, new THREE.CylinderGeometry(0.6, 0.9, 5.2, 12).translate(0, 2.6, 0));
  volumen(c, new THREE.CylinderGeometry(1.6, 1.1, 1.1, 12).translate(0, 5.75, 0));
  plano(c, 2.6, 0.45, 0, 5.85, 1.42);
  const escudo = new THREE.Shape();
  escudo.moveTo(0, 0.9);
  escudo.lineTo(0.75, 0.6);
  escudo.quadraticCurveTo(0.75, -0.5, 0, -1);
  escudo.quadraticCurveTo(-0.75, -0.5, -0.75, 0.6);
  escudo.lineTo(0, 0.9);
  const pts = escudo.getPoints(24).map((p) => v3(p.x, p.y, 0));
  const borde = linea(c, pts, c.m.acento, true);
  const relleno = new THREE.Mesh(new THREE.ShapeGeometry(escudo), c.m.plano);
  const piv = new THREE.Group();
  piv.add(borde, relleno);
  piv.position.y = 7.6;
  c.g.add(piv);
  // capas de permisos: anillos en el suelo
  [1.8, 2.4, 3].forEach((r) => linea(c, circulo(r, 0.06, 40), c.m.acento, true));
  return {
    grupo: c.g,
    alto: 8.6,
    flujos: [],
    animar(t, on) {
      piv.rotation.y = t * 0.5;
      piv.scale.setScalar(0.8 + on * 0.25);
    },
  };
}

const FABRICAS: Record<EscenaId, (c: Ctx) => Silueta> = {
  campo,
  centro,
  comunicacion,
  edificio,
  inmersiva,
  humana,
  formacion,
  finanzas,
  productividad,
  gobierno,
  // TODO(infra): silueta propia de racks; mientras tanto, la de gobierno.
  infraestructura: gobierno,
};

export function construirSilueta(kit: Kit, escena: EscenaId, m: MaterialesDistrito, origen: THREE.Vector3, color: THREE.Color): Silueta {
  const g = new THREE.Group();
  g.position.copy(origen);
  return FABRICAS[escena]({ kit, m, g, origen, color });
}

