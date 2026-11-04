/**
 * Escena J · Gobierno, seguridad y canales.
 *
 * En el centro, la TORRE DE CONTROL: anillos concéntricos de permisos que giran,
 * un escudo en cúpula y, en la cima, un globo con las sesiones activas (puntos con
 * pings de IP/ubicación). Alrededor de la torre orbitan los canales — Android, la
 * app instalable (PWA), la app de escritorio y las gafas: un sistema, cuatro
 * canales. Al enfocar un canal, la órbita gira para presentarlo de frente.
 * En el suelo: auditoría (cinta de acciones con tarjetas antes/después),
 * configuración multiempresa (islas por empresa con su menú y sus roles) e
 * ingreso (carné + huella + anillo de código de doble factor).
 */
import * as THREE from "three";
import {
  PAL,
  crearEscena,
  fase,
  frente,
  instanciado,
  montarVineta,
  mulberry32,
  op,
  puntosArco,
  puntosRect,
  ramp,
  smooth,
  v3,
  ventana,
  type Encuadre,
  type Kit,
} from "./_motor-gestion";

type Animar = (t: number, dt: number) => void;
const tmpO = new THREE.Object3D();
const tmpC = new THREE.Color();
const GLOBO = v3(0, 12, 0);
const ORBITA_Y = 6.8;
const ORBITA_R = 8.8;

/** Líneas de latitud/longitud de una esfera (o cúpula). */
function geoGlobo(r: number, lats: number, longs: number, cupula = false) {
  const pts: THREE.Vector3[] = [];
  const latMax = cupula ? Math.PI / 2 : Math.PI;
  for (let i = 1; i < lats; i++) {
    const th = (i / lats) * latMax;
    const y = Math.cos(th) * r;
    const rr = Math.sin(th) * r;
    for (let k = 0; k < 64; k++) {
      const a0 = (k / 64) * Math.PI * 2;
      const a1 = ((k + 1) / 64) * Math.PI * 2;
      pts.push(v3(Math.cos(a0) * rr, y, Math.sin(a0) * rr), v3(Math.cos(a1) * rr, y, Math.sin(a1) * rr));
    }
  }
  for (let j = 0; j < longs; j++) {
    const a = (j / longs) * Math.PI * 2;
    for (let k = 0; k < 24; k++) {
      const t0 = (k / 24) * latMax;
      const t1 = ((k + 1) / 24) * latMax;
      pts.push(
        v3(Math.sin(t0) * Math.cos(a) * r, Math.cos(t0) * r, Math.sin(t0) * Math.sin(a) * r),
        v3(Math.sin(t1) * Math.cos(a) * r, Math.cos(t1) * r, Math.sin(t1) * Math.sin(a) * r),
      );
    }
  }
  return new THREE.BufferGeometry().setFromPoints(pts);
}

// ───────────────────────── Torre (centro) ─────────────────────────

function torre(kit: Kit): Animar {
  const g = new THREE.Group();
  kit.vineta("torre", g);
  kit.scene.add(g);

  // Cuerpo de la torre
  const cuerpoGeo = new THREE.CylinderGeometry(0.75, 1.5, 8, 6, 1, true);
  const cuerpo = new THREE.Mesh(cuerpoGeo, kit.mb(PAL.imperial, 0.5));
  cuerpo.position.y = 4;
  g.add(cuerpo);
  const aristas = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.CylinderGeometry(0.75, 1.5, 8, 6)), kit.ml(PAL.bright, 0.9));
  aristas.position.y = 4;
  g.add(aristas);
  for (let k = 1; k < 7; k++) {
    const y = k * 1.1;
    const r = 1.5 - (0.75 * y) / 8;
    const banda = kit.linea(puntosArco(r + 0.02, 0, Math.PI * 2, 6).map((p) => v3(p.x, y, p.y)), kit.ml(PAL.french, 0.9));
    g.add(banda);
  }
  const cabina = kit.caja(2.4, 1.0, 2.4, PAL.indigo, 0.4, PAL.cyan, 0.95);
  cabina.position.y = 8.5;
  g.add(cabina);
  const ventanas = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.25, 0.35, 16, 1, true), kit.mb(PAL.cyan, 0.5, { aditivo: true }));
  ventanas.position.y = 8.55;
  g.add(ventanas);
  const antena = kit.linea([v3(0, 9, 0), v3(0, GLOBO.y - 1.8, 0)], kit.ml(PAL.steel, 0.8));
  g.add(antena);

  // Anillos de permisos (segmentados, giran en sentidos opuestos)
  const anillos = [
    { r: 3.0, y: 1.2, color: PAL.indigo, seg: 3 },
    { r: 4.2, y: 2.6, color: PAL.bright, seg: 4 },
    { r: 5.4, y: 4.0, color: PAL.cyan, seg: 5 },
  ].map((a, k) => {
    const grupo = new THREE.Group();
    grupo.position.y = a.y;
    const paso = (Math.PI * 2) / a.seg;
    for (let s = 0; s < a.seg; s++) {
      const arco = puntosArco(a.r, s * paso + 0.12, (s + 1) * paso - 0.12, 40).map((p) => v3(p.x, 0, p.y));
      grupo.add(kit.linea(arco, kit.ml(a.color, 0.9)));
      const borde = new THREE.Mesh(new THREE.RingGeometry(a.r - 0.12, a.r + 0.12, 40, 1, s * paso + 0.12, paso - 0.24), kit.mb(a.color, 0.18, { aditivo: true }));
      borde.rotation.x = -Math.PI / 2;
      grupo.add(borde);
    }
    // candados: un nodo por segmento
    for (let s = 0; s < a.seg; s++) {
      const n = kit.sprite(a.color, 0.7, 0.8);
      const ang = s * paso + paso / 2;
      n.position.set(Math.cos(ang) * a.r, 0, Math.sin(ang) * a.r);
      grupo.add(n);
    }
    g.add(grupo);
    return { grupo, dir: k % 2 ? -1 : 1, vel: 0.18 - k * 0.04 };
  });

  // Escudo (cúpula)
  const escudo = new THREE.LineSegments(geoGlobo(6.6, 6, 12, true), kit.ml(PAL.bright, 0.14));
  g.add(escudo);
  const escudoBrillo = new THREE.Mesh(new THREE.SphereGeometry(6.6, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2), kit.mb(PAL.indigo, 0.05, { aditivo: true }));
  g.add(escudoBrillo);

  // Globo de sesiones
  const globo = new THREE.Group();
  globo.position.copy(GLOBO);
  globo.add(new THREE.LineSegments(geoGlobo(1.8, 7, 10), kit.ml(PAL.bright, 0.45)));
  globo.add(new THREE.Mesh(new THREE.SphereGeometry(1.75, 24, 16), kit.mb(PAL.indigo, 0.12, { aditivo: true })));
  const rand = mulberry32(3);
  const S = kit.lowPower ? 18 : 34;
  const sesiones: THREE.Vector3[] = [];
  for (let i = 0; i < S; i++) {
    // Sesgo hacia una franja (las Américas)
    const lat = (rand() - 0.5) * 2.0;
    const lon = -1.2 + rand() * 1.6 + (rand() < 0.2 ? rand() * 3 : 0);
    sesiones.push(v3(Math.cos(lat) * Math.cos(lon), Math.sin(lat), Math.cos(lat) * Math.sin(lon)).multiplyScalar(1.82));
  }
  const puntos = instanciado(new THREE.SphereGeometry(0.06, 8, 6), kit.mb(PAL.cyan, 0.95), S);
  sesiones.forEach((p, i) => {
    tmpO.position.copy(p);
    tmpO.rotation.set(0, 0, 0);
    tmpO.scale.setScalar(1);
    tmpO.updateMatrix();
    puntos.setMatrixAt(i, tmpO.matrix);
  });
  globo.add(puntos);
  const pings = [0, 1, 2, 3].map(() => {
    const s = kit.sprite(PAL.ambar, 0.6, 0);
    globo.add(s);
    return s;
  });
  g.add(globo);
  const enlace = kit.flujo(new THREE.LineCurve3(GLOBO.clone().setY(GLOBO.y - 1.8), v3(0, 9.1, 0)), kit.lowPower ? 4 : 8, PAL.cyan, 0.25, 0.6);
  g.add(enlace.puntos);

  return (t) => {
    anillos.forEach((a) => (a.grupo.rotation.y = t * a.vel * a.dir));
    globo.rotation.y = t * 0.15;
    pings.forEach((p, k) => {
      const ph = fase(t, 2.2, k * 0.55);
      const idx = (Math.floor((t + k * 0.55) / 2.2) * 7 + k * 5) % S;
      p.position.copy(sesiones[idx]).multiplyScalar(1.02);
      p.scale.setScalar(0.3 + ph * 1.2);
      op(p.material, (1 - ph) * 0.95);
    });
    enlace.update(t, 0.8);
    op(escudoBrillo.material, 0.04 + 0.025 * Math.sin(t * 1.3));
    op(ventanas.material, 0.4 + 0.15 * Math.sin(t * 2.2));
  };
}

// ───────────────────────── Canales (orbitan la torre) ─────────────────────────

type Canal = { clave: string | null; nombre: string; angulo: number; crear: (kit: Kit, g: THREE.Group) => (t: number) => void };

function android(kit: Kit, g: THREE.Group) {
  const p = kit.panel(1.2, 2.2, { radio: 0.18, relleno: 0.7, colorRelleno: 0x050f26 });
  g.add(p.grupo);
  const pantalla = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.8), kit.mb(PAL.indigo, 0.25, { aditivo: true }));
  pantalla.position.z = 0.01;
  p.grupo.add(pantalla);
  const tiles: THREE.Mesh[] = [];
  for (let k = 0; k < 6; k++) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(0.36, 0.36), kit.mb(PAL.verde, 0.5, { aditivo: true }));
    m.position.set(-0.22 + (k % 2) * 0.44, 0.5 - Math.floor(k / 2) * 0.48, 0.02);
    p.grupo.add(m);
    tiles.push(m);
  }
  return (t: number) => tiles.forEach((m, k) => op(m.material, 0.25 + 0.45 * ventana(fase(t, 4, k * 0.5), 0, 0.1, 0.3, 0.5)));
}

function pwa(kit: Kit, g: THREE.Group) {
  const ventanaG = new THREE.Group();
  const marco = kit.panel(2.2, 1.5, { radio: 0.1, relleno: 0.55 });
  const barra = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.22), kit.mb(PAL.french, 0.8));
  barra.position.set(0, 0.64, 0.01);
  const url = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.1), kit.mb(PAL.steel, 0.6));
  url.position.set(0.2, 0.64, 0.02);
  const cont = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 0.8), kit.mb(PAL.indigo, 0.25, { aditivo: true }));
  cont.position.set(0, -0.1, 0.01);
  marco.grupo.add(barra, url, cont);
  ventanaG.add(marco.grupo);
  g.add(ventanaG);
  const icono = kit.panel(0.8, 0.8, { radio: 0.2, relleno: 0.8, colorRelleno: PAL.indigo, colorBorde: PAL.cyan, tint: false });
  const logo = new THREE.Mesh(new THREE.CircleGeometry(0.2, 6), kit.mb(PAL.ice, 0.9));
  logo.position.z = 0.01;
  icono.grupo.add(logo);
  g.add(icono.grupo);
  const flecha = kit.linea([v3(0, 0.35, 0), v3(0, -0.25, 0), v3(-0.18, -0.07, 0), v3(0, -0.25, 0), v3(0.18, -0.07, 0)], kit.ml(PAL.verde, 0.95, { tint: false }));
  flecha.position.set(1.4, 0.2, 0.1);
  g.add(flecha);
  return (t: number) => {
    const u = fase(t, 6);
    const instala = smooth(ventana(u, 0.25, 0.5, 0.85, 0.98));
    ventanaG.scale.setScalar(Math.max(0.0001, 1 - instala));
    icono.grupo.scale.setScalar(Math.max(0.0001, instala));
    flecha.position.y = 0.2 - 0.3 * fase(t, 1);
    op(flecha.material, ventana(u, 0.1, 0.2, 0.4, 0.5));
  };
}

function escritorio(kit: Kit, g: THREE.Group) {
  const monitor = kit.panel(2.6, 1.6, { radio: 0.08, relleno: 0.6, colorRelleno: 0x050f26 });
  g.add(monitor.grupo);
  const pantalla = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.4), kit.mb(PAL.indigo, 0.22, { aditivo: true }));
  pantalla.position.z = 0.01;
  monitor.grupo.add(pantalla);
  g.add(kit.linea([v3(0, -0.8, 0), v3(0, -1.3, 0)], kit.ml(PAL.steel, 0.8)));
  g.add(kit.linea([v3(-0.5, -1.3, 0), v3(0.5, -1.3, 0)], kit.ml(PAL.steel, 0.8)));
  const alerta = kit.panel(1.0, 0.4, { radio: 0.06, relleno: 0.8, colorRelleno: 0x3a0a14, colorBorde: PAL.rojo, tint: false });
  alerta.grupo.position.set(0.7, 0.45, 0.03);
  const icono = new THREE.Mesh(new THREE.CircleGeometry(0.09, 3), kit.mb(PAL.ambar, 0.95));
  icono.position.set(-0.35, 0, 0.01);
  const r = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.06), kit.mb(PAL.ice, 0.8));
  r.position.set(0.1, 0, 0.01);
  alerta.grupo.add(icono, r);
  monitor.grupo.add(alerta.grupo);
  return (t: number) => {
    const u = fase(t, 5);
    const entra = smooth(ventana(u, 0.1, 0.2, 0.8, 0.9));
    alerta.grupo.position.x = 0.7 + (1 - entra) * 0.8;
    alerta.grupo.scale.setScalar(Math.max(0.0001, entra));
    op(alerta.relleno, 0.8 * (0.6 + 0.4 * Math.sin(t * 8)));
  };
}

function gafas(kit: Kit, g: THREE.Group) {
  const cuerpo = kit.caja(1.6, 0.7, 0.6, PAL.imperial, 0.5, PAL.steel, 0.9);
  g.add(cuerpo);
  const lentes = [-0.38, 0.38].map((x) => {
    const l = new THREE.Mesh(new THREE.RingGeometry(0.16, 0.24, 24), kit.mb(PAL.cyan, 0.8, { aditivo: true }));
    l.position.set(x, 0, 0.31);
    g.add(l);
    return l;
  });
  const correa = kit.linea(puntosArco(0.85, 0, Math.PI, 24).map((p) => v3(p.x, 0.05, -p.y * 0.8 - 0.1)), kit.ml(PAL.steel, 0.6));
  g.add(correa);
  return (t: number) => lentes.forEach((l, k) => op(l.material, 0.5 + 0.4 * Math.sin(t * 2 + k)));
}

const CANALES: Canal[] = [
  { clave: "android", nombre: "Android", angulo: 0, crear: android },
  { clave: "pwa", nombre: "App instalable", angulo: Math.PI / 2, crear: pwa },
  { clave: "escritorio", nombre: "Escritorio", angulo: Math.PI, crear: escritorio },
  { clave: null, nombre: "Gafas", angulo: (Math.PI * 3) / 2, crear: gafas },
];

// ───────────────────────── Viñetas del suelo ─────────────────────────

/** Cinta de acciones con tarjetas antes/después. */
function auditoria(kit: Kit, g: THREE.Group): (t: number) => void {
  const curva = new THREE.CatmullRomCurve3([v3(-3.2, 1.0, 0.6), v3(-1.5, 1.2, -0.2), v3(0.3, 1.0, 0.4), v3(1.8, 1.2, -0.2), v3(3.2, 1.0, 0.4)]);
  const borde1 = curva.getPoints(60).map((p) => p.clone().add(v3(0, 0.22, 0)));
  const borde2 = curva.getPoints(60).map((p) => p.clone().add(v3(0, -0.22, 0)));
  g.add(kit.linea(borde1, kit.ml(PAL.bright, 0.8)), kit.linea(borde2, kit.ml(PAL.bright, 0.8)));
  const cinta = new THREE.Mesh(new THREE.TubeGeometry(curva, 60, 0.2, 4), kit.mb(PAL.indigo, 0.2, { aditivo: true }));
  cinta.scale.set(1, 1, 0.25);
  g.add(cinta);
  const M = 8;
  const marcas = instanciado(new THREE.BoxGeometry(0.22, 0.32, 0.08), kit.mb(0xffffff, 0.95), M);
  g.add(marcas);
  const tiposCol = [PAL.cyan, PAL.ambar, PAL.verde, PAL.rojo].map((c) => new THREE.Color(c));

  const tarjeta = (x: number, color: number) => {
    const p = kit.panel(1.5, 1.1, { relleno: 0.55, colorBorde: color, tint: false, radio: 0.08 });
    p.grupo.position.set(x, 3.0, 0);
    for (let k = 0; k < 3; k++) {
      const r = new THREE.Mesh(new THREE.PlaneGeometry(k === 1 ? 1.1 : 0.9, 0.09), kit.mb(k === 1 ? color : PAL.steel, k === 1 ? 0.85 : 0.5));
      r.position.set(k === 1 ? 0 : -0.1, 0.28 - k * 0.28, 0.01);
      p.grupo.add(r);
    }
    g.add(p.grupo);
    return p.grupo;
  };
  const antes = tarjeta(-1.05, PAL.rojo);
  const despues = tarjeta(1.05, PAL.verde);
  const flecha = kit.linea([v3(-0.2, 3.0, 0), v3(0.2, 3.0, 0), v3(0.08, 3.12, 0), v3(0.2, 3.0, 0), v3(0.08, 2.88, 0)], kit.ml(PAL.ice, 0.9));
  g.add(flecha);
  const guia = kit.linea([v3(0.3, 1.3, 0.4), v3(0.3, 2.45, 0)], kit.mld(PAL.ice, 0.5, 0.08, 0.06));
  g.add(guia);
  const p = new THREE.Vector3();

  return (t) => {
    for (let i = 0; i < M; i++) {
      const u = fase(t, 10, (i / M) * 10);
      curva.getPoint(u, p);
      tmpO.position.copy(p);
      tmpO.rotation.set(0, 0, 0);
      tmpO.scale.setScalar(Math.max(0.0001, ramp(u, 0, 0.04) * (1 - ramp(u, 0.96, 1))));
      tmpO.updateMatrix();
      marcas.setMatrixAt(i, tmpO.matrix);
      tmpC.copy(tiposCol[i % tiposCol.length]);
      marcas.setColorAt(i, tmpC);
    }
    marcas.instanceMatrix.needsUpdate = true;
    if (marcas.instanceColor) marcas.instanceColor.needsUpdate = true;
    const u = fase(t, 10 / M);
    const abre = smooth(ventana(u, 0.3, 0.45, 0.85, 1));
    antes.scale.setScalar(Math.max(0.0001, 0.85 + 0.15 * abre));
    despues.scale.setScalar(Math.max(0.0001, abre));
    op(flecha.material, abre * 0.9);
  };
}

/** Islas por empresa, cada una con su menú y sus roles, sobre un núcleo común. */
function config(kit: Kit, g: THREE.Group): (t: number) => void {
  const nucleo = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.OctahedronGeometry(0.45)), kit.ml(PAL.ice, 0.95));
  nucleo.position.set(0, 0.8, 0);
  g.add(nucleo);
  const brillo = kit.sprite(PAL.indigo, 2.4, 0.6);
  brillo.position.copy(nucleo.position);
  g.add(brillo);
  const COL = [PAL.cyan, PAL.verde, PAL.ambar];
  const islas = COL.map((c, k) => {
    const a = -0.9 + k * 0.9;
    const isla = new THREE.Group();
    isla.position.set(Math.sin(a) * 2.4, 2.4 + (k === 1 ? 0.6 : 0), Math.cos(a) * 0.8 - 0.2);
    const geo = new THREE.CylinderGeometry(1.0, 0.85, 0.25, 6);
    isla.add(new THREE.Mesh(geo, kit.mb(c, 0.2)));
    isla.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo), kit.ml(c, 0.95, { tint: false })));
    const menu = new THREE.Group();
    menu.position.set(-0.3, 0.75, 0);
    for (let m = 0; m < 4; m++) {
      const b = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.12), kit.mb(m === 0 ? c : PAL.steel, m === 0 ? 0.9 : 0.55));
      b.position.y = 0.3 - m * 0.2;
      menu.add(b);
    }
    menu.add(kit.linea(puntosRect(0.8, 0.95, 0.06), kit.ml(PAL.bright, 0.6)));
    isla.add(menu);
    for (let r = 0; r < 3; r++) {
      const rol = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 8), kit.mb([PAL.rojo, PAL.ambar, PAL.verde][r], 0.9));
      rol.position.set(0.45, 0.25 + r * 0.25, 0.1);
      isla.add(rol);
    }
    g.add(isla);
    g.add(kit.linea([nucleo.position, isla.position], kit.mld(c, 0.5, 0.12, 0.1)));
    return isla;
  });
  const bloque = kit.caja(0.28, 0.28, 0.28, PAL.ice, 0.4, PAL.ice, 0.95);
  g.add(bloque);
  const a = new THREE.Vector3();

  return (t) => {
    islas.forEach((isla, k) => {
      isla.position.y = 2.4 + (k === 1 ? 0.6 : 0) + Math.sin(t * 0.8 + k * 2) * 0.12;
      isla.rotation.y = Math.sin(t * 0.3 + k) * 0.2;
    });
    nucleo.rotation.y = t * 0.6;
    const ciclo = Math.floor(t / 3);
    const u = fase(t, 3);
    const destino = islas[ciclo % islas.length].position;
    a.copy(nucleo.position).lerp(destino, smooth(ramp(u, 0.1, 0.7)));
    a.y += Math.sin(ramp(u, 0.1, 0.7) * Math.PI) * 0.8;
    bloque.position.copy(a);
    bloque.rotation.set(t, t * 1.3, 0);
    bloque.scale.setScalar(Math.max(0.0001, ramp(u, 0, 0.1) * (1 - ramp(u, 0.75, 0.85))));
  };
}

/** Carné + huella + anillo de código de doble factor. */
function ingreso(kit: Kit, g: THREE.Group): (t: number) => void {
  const carne = kit.panel(2.0, 1.3, { relleno: 0.6, radio: 0.1 });
  carne.grupo.position.set(-2.1, 2.3, 0);
  carne.grupo.rotation.y = 0.25;
  const foto = kit.linea(puntosRect(0.5, 0.62, 0.05), kit.ml(PAL.ice, 0.9));
  foto.position.set(-0.6, 0.05, 0.01);
  const cara = new THREE.Mesh(new THREE.CircleGeometry(0.14, 16), kit.mb(PAL.ice, 0.6));
  cara.position.set(-0.6, 0.12, 0.01);
  carne.grupo.add(foto, cara);
  for (let k = 0; k < 3; k++) {
    const r = new THREE.Mesh(new THREE.PlaneGeometry(k === 0 ? 0.9 : 0.7, 0.07), kit.mb(k === 0 ? PAL.ice : PAL.steel, 0.65));
    r.position.set(0.3 - (k === 0 ? 0 : 0.1), 0.22 - k * 0.2, 0.01);
    carne.grupo.add(r);
  }
  g.add(carne.grupo);

  // Huella: arcos concéntricos incompletos
  const huella = new THREE.Group();
  huella.position.set(0.2, 2.3, 0);
  const rand = mulberry32(12);
  for (let k = 0; k < 7; k++) {
    const r = 0.12 + k * 0.1;
    const a0 = -0.4 + rand() * 0.5;
    huella.add(kit.linea(puntosArco(r, Math.PI * 0.1 + a0, Math.PI * 1.85 + a0 * 0.5, 30).map((p) => v3(p.x, p.y * 1.25, 0)), kit.ml(PAL.cyan, 0.85)));
  }
  const escaneo = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 0.04), kit.mb(PAL.cyan, 0.9, { aditivo: true }));
  escaneo.position.z = 0.02;
  huella.add(escaneo);
  g.add(huella);

  // Anillo de código 2FA
  const codigo = new THREE.Group();
  codigo.position.set(2.4, 2.3, 0);
  const digitos = Array.from({ length: 6 }, (_, k) => {
    const a = (k / 6) * Math.PI * 2;
    const d = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 0.42), kit.mb(PAL.french, 0.8));
    d.position.set(Math.cos(a) * 0.9, Math.sin(a) * 0.9, 0);
    codigo.add(d);
    codigo.add(kit.linea(puntosRect(0.32, 0.42, 0.04), kit.ml(PAL.bright, 0.8)).translateX(Math.cos(a) * 0.9).translateY(Math.sin(a) * 0.9));
    return d;
  });
  const cuenta = kit.linea(puntosArco(1.35, Math.PI / 2, Math.PI / 2 - Math.PI * 2, 64), kit.ml(PAL.ambar, 0.95, { tint: false }));
  codigo.add(cuenta);
  const candado = new THREE.Group();
  candado.add(kit.caja(0.4, 0.32, 0.12, PAL.verde, 0.3, PAL.verde, 0.95, false));
  candado.add(kit.linea(puntosArco(0.14, 0, Math.PI, 16).map((p) => v3(p.x, p.y + 0.16, 0)), kit.ml(PAL.verde, 0.95, { tint: false })));
  codigo.add(candado);
  g.add(codigo);
  const colApagado = new THREE.Color(PAL.french);
  const colOk = new THREE.Color(PAL.verde);
  const colDig = new THREE.Color(PAL.cyan);

  return (t) => {
    const u = fase(t, 8);
    op(carne.borde, 0.6 + 0.4 * ventana(u, 0.0, 0.05, 0.15, 0.2));
    const scan = ventana(u, 0.15, 0.2, 0.4, 0.45);
    escaneo.position.y = Math.sin(t * 4) * 0.75;
    op(escaneo.material, scan);
    const listo = ramp(u, 0.85, 0.9) * (1 - ramp(u, 0.96, 1));
    digitos.forEach((d, k) => {
      const on = ramp(u, 0.45 + k * 0.05, 0.48 + k * 0.05) * (1 - ramp(u, 0.96, 1));
      tmpC.copy(colApagado).lerp(colDig, on).lerp(colOk, listo);
      d.material.color.copy(tmpC);
    });
    codigo.rotation.z = -t * 0.15;
    cuenta.geometry.setDrawRange(0, Math.max(2, Math.floor(65 * (1 - fase(t, 8, 0)))));
    candado.rotation.z = t * 0.15;
    candado.scale.setScalar(1 + 0.3 * listo);
  };
}

// ───────────────────────── Escena ─────────────────────────

export default crearEscena(
  (kit) => {
    const animaciones: Animar[] = [torre(kit)];
    kit.hotspot("torre", GLOBO.clone().add(v3(0, 2.6, 0)), undefined, 1.0);
    const encuadres: Record<string, Encuadre> = {
      torre: { pos: v3(6, 14.5, 14), target: v3(0, 10.4, 0) },
    };

    // Órbita de canales
    const orbita = new THREE.Group();
    orbita.position.y = ORBITA_Y;
    kit.scene.add(orbita);
    kit.scene.add(
      kit.linea(
        puntosArco(ORBITA_R, 0, Math.PI * 2, 96).map((p) => v3(p.x, ORBITA_Y - 1.4, p.y)),
        kit.mld(PAL.bright, 0.35, 0.3, 0.25),
      ),
    );
    const canales = CANALES.map((c) => {
      const pos = v3(Math.sin(c.angulo) * ORBITA_R, 0, Math.cos(c.angulo) * ORBITA_R);
      const grupo = new THREE.Group();
      grupo.position.copy(pos);
      grupo.rotation.y = c.angulo;
      if (c.clave) {
        kit.vineta(c.clave, grupo);
        kit.hotspot(c.clave, v3(0, 2.0, 0), grupo, 0.75);
      }
      const et = kit.texto(c.nombre, 0.38);
      et.position.set(0, -1.55, 0);
      grupo.add(et);
      orbita.add(grupo);
      const curva = new THREE.QuadraticBezierCurve3(v3(0, 1.8, 0), v3(pos.x * 0.5, 2.6, pos.z * 0.5), pos.clone().setY(0));
      const f = kit.flujo(curva, kit.lowPower ? 4 : 8, PAL.cyan, 0.22, 0.3);
      orbita.add(f.puntos);
      orbita.add(kit.linea(curva.getPoints(30), kit.ml(PAL.bright, 0.18)));
      return { c, anima: c.crear(kit, grupo), f };
    });
    // Encuadre de canal: la órbita gira y lo presenta de frente (+z).
    const frenteCanal = frente(v3(0, ORBITA_Y - 1.8, ORBITA_R), 0, 7.5, 2.6, 1.8);
    for (const c of CANALES) if (c.clave) encuadres[c.clave] = frenteCanal;

    let giro = 0.6;
    const canalFocado = () => {
      let mejor: Canal | null = null;
      let peso = 0.5;
      for (const c of CANALES) {
        if (!c.clave) continue;
        const p = kit.peso(c.clave);
        if (p > peso) {
          peso = p;
          mejor = c;
        }
      }
      return mejor;
    };

    // Viñetas del suelo (atrás y a los lados; el frente queda para los canales)
    const SUELO: Array<{ clave: string; angulo: number; crear: (kit: Kit, g: THREE.Group) => (t: number) => void }> = [
      { clave: "auditoria", angulo: Math.PI * 0.62, crear: auditoria },
      { clave: "config", angulo: Math.PI, crear: config },
      { clave: "ingreso", angulo: -Math.PI * 0.62, crear: ingreso },
    ];
    const suelo = SUELO.map((s) => {
      const centro = v3(Math.sin(s.angulo) * 16.5, 0, Math.cos(s.angulo) * 16.5);
      const { grupo, encuadre } = montarVineta(kit, s.clave, centro, s.angulo, { radio: 3.9, hotspotY: 5.0, dist: 9.6, alto: 3.4, mirarY: 2.3 });
      encuadres[s.clave] = encuadre;
      return s.crear(kit, grupo);
    });

    animaciones.push((t, dt) => {
      const objetivo = canalFocado();
      if (objetivo) {
        // giro tal que angulo + giro ≡ 0 (al frente), por el camino corto
        let destino = -objetivo.angulo;
        destino += Math.round((giro - destino) / (Math.PI * 2)) * Math.PI * 2;
        giro += (destino - giro) * (kit.reducedMotion ? 1 : 1 - Math.exp(-dt * 3.5));
      } else if (!kit.reducedMotion) {
        giro += dt * 0.12;
      }
      orbita.rotation.y = giro;
      canales.forEach((c) => {
        c.anima(t);
        c.f.update(t, 0.7);
      });
      suelo.forEach((s) => s(t));
    });

    return {
      general: { pos: v3(0, 20, 34), target: v3(0, 5.5, 0) },
      encuadres,
      update: (t, dt) => animaciones.forEach((a) => a(t, dt)),
    };
  },
  { niebla: 0.012, suelo: { radio: 70, alcance: 0.04 }, polvo: { radio: 26, alto: 16 }, tiempoQuieto: 3.6 },
);
