/**
 * Escena H · Finanzas y ERP.
 *
 * En el centro, un riel de datos: bloques que viajan Turnos → Órdenes → Nómina →
 * Contabilidad → ERP y se detienen a "procesarse" en cada estación. Delante y
 * detrás del riel, una viñeta por módulo: clientes (contrato con módulos del plan
 * que se encienden), órdenes (una orden del ERP que se vuelve un puesto agendado),
 * contabilidad (libro mayor que sube, enlazado al riel), asistente (pregunta en
 * español → gráfica), DIAN (facturas apiladas con sello; próximamente: tenue y
 * punteado) y ERP (ARS y Avancys se acoplan en una sola pantalla).
 */
import * as THREE from "three";
import {
  PAL,
  crearEscena,
  fase,
  frente,
  geoTarjeta,
  instanciado,
  montarVineta,
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

type Animar = (t: number) => void;
const tmpO = new THREE.Object3D();
const tmpC = new THREE.Color();

const ESTACIONES: Array<{ nombre: string; x: number; color: number }> = [
  { nombre: "Turnos", x: -10, color: PAL.cyan },
  { nombre: "Órdenes", x: -5, color: PAL.bright },
  { nombre: "Nómina", x: 0, color: PAL.ambar },
  { nombre: "Contabilidad", x: 5, color: PAL.verde },
  { nombre: "ERP", x: 10, color: 0xb48cff },
];

// ───────────────────────── Riel central ─────────────────────────

function riel(kit: Kit): Animar {
  const g = new THREE.Group();
  kit.scene.add(g);
  for (const z of [-0.4, 0.4]) g.add(kit.linea([v3(-11.5, 0.35, z), v3(11.5, 0.35, z)], kit.ml(PAL.bright, 0.7)));
  const traviesas: Array<[THREE.Vector3, THREE.Vector3]> = [];
  for (let x = -11.5; x <= 11.5; x += 0.8) traviesas.push([v3(x, 0.33, -0.55), v3(x, 0.33, 0.55)]);
  const pts: THREE.Vector3[] = [];
  traviesas.forEach(([a, b]) => pts.push(a, b));
  g.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts), kit.ml(PAL.french, 0.6)));

  const halos = ESTACIONES.map((e) => {
    const c = kit.caja(2.2, 1.2, 1.8, PAL.imperial, 0.55, e.color, 0.9, false);
    c.position.set(e.x, 0.95, 0);
    g.add(c);
    const et = kit.texto(e.nombre, 0.5);
    et.position.set(e.x, 2.15, 0);
    g.add(et);
    const halo = kit.sprite(e.color, 3.4, 0.3);
    halo.position.set(e.x, 1.0, 0);
    g.add(halo);
    return halo;
  });

  const n = kit.lowPower ? 10 : 20;
  const bloques = instanciado(new THREE.BoxGeometry(0.32, 0.32, 0.32), kit.mb(0xffffff, 0.95), n);
  g.add(bloques);
  const colores = ESTACIONES.map((e) => new THREE.Color(e.color));

  return (t) => {
    const calor = [0, 0, 0, 0, 0];
    for (let i = 0; i < n; i++) {
      const u = fase(t, 20, (i / n) * 20);
      const s = Math.min(3, Math.floor(u * 4));
      const l = u * 4 - s;
      const x = -10 + 5 * (s + smooth(ramp(l, 0.25, 1)));
      const enEstacion = 1 - ramp(l, 0.1, 0.3);
      calor[s] = Math.max(calor[s], enEstacion);
      tmpO.position.set(x, 0.75 + Math.sin(l * Math.PI) * 0.6 * (1 - enEstacion), Math.sin(i * 2.1) * 0.18);
      tmpO.rotation.set(t + i, t * 0.7, 0);
      tmpO.scale.setScalar(ramp(u, 0, 0.02) * (1 - ramp(u, 0.97, 1)) + 0.0001);
      tmpO.updateMatrix();
      bloques.setMatrixAt(i, tmpO.matrix);
      tmpC.copy(colores[s]).lerp(colores[s + 1], ramp(l, 0.6, 1));
      bloques.setColorAt(i, tmpC);
    }
    bloques.instanceMatrix.needsUpdate = true;
    if (bloques.instanceColor) bloques.instanceColor.needsUpdate = true;
    halos.forEach((h, k) => op(h.material, 0.22 + 0.4 * (calor[k] ?? 0) + 0.06 * Math.sin(t * 2 + k)));
  };
}

// ───────────────────────── Viñetas ─────────────────────────

/** Contrato con los módulos del plan que se encienden y apagan. */
function clientes(kit: Kit, g: THREE.Group): Animar {
  const tarjeta = kit.panel(2.5, 3.1, { relleno: 0.5, radio: 0.16 });
  tarjeta.grupo.position.set(-0.9, 2.3, 0);
  g.add(tarjeta.grupo);
  const titulo = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.13), kit.mb(PAL.ice, 0.85));
  titulo.position.set(-0.35, 1.2, 0.01);
  tarjeta.grupo.add(titulo);
  const COL = [PAL.cyan, PAL.verde, PAL.ambar, PAL.bright, 0xb48cff];
  const filas = COL.map((c, k) => {
    const y = 0.65 - k * 0.42;
    const et = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.08).translate(0.5, 0, 0), kit.mb(PAL.steel, 0.55));
    et.position.set(-1.0, y, 0.01);
    const pista = kit.linea(puntosRect(0.52, 0.24, 0.12), kit.ml(PAL.steel, 0.8, { tint: false }));
    pista.position.set(0.75, y, 0.01);
    const relleno = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.22), kit.mb(c, 0.6, { aditivo: true }));
    relleno.position.set(0.75, y, 0.012);
    const perilla = new THREE.Mesh(new THREE.CircleGeometry(0.09, 20), kit.mb(PAL.ice, 0.95));
    perilla.position.set(0.63, y, 0.02);
    tarjeta.grupo.add(et, pista, relleno, perilla);
    const modulo = kit.caja(0.9, 0.3, 0.7, c, 0.35, c, 0.95, false);
    modulo.position.set(1.6, 0.25 + k * 0.36, 0);
    g.add(modulo);
    return { relleno, perilla, modulo, y };
  });
  const precio = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 0.12).translate(1.0, 0, 0), kit.mb(PAL.cyan, 0.9, { aditivo: true }));
  precio.position.set(-1.0, -1.25, 0.01);
  tarjeta.grupo.add(precio);

  return (t) => {
    let activos = 0;
    filas.forEach((f, k) => {
      const u = fase(t, 8, k * 1.7);
      const v = k === 0 ? 1 : ramp(u, 0, 0.05) * (1 - ramp(u, 0.6, 0.65));
      activos += v;
      f.perilla.position.x = 0.63 + 0.24 * v;
      op(f.relleno.material, 0.6 * v);
      f.modulo.scale.setScalar(Math.max(0.0001, v));
    });
    precio.scale.x = Math.max(0.0001, activos / filas.length);
  };
}

/** Una orden del ERP que se convierte en un puesto agendado. */
function ordenes(kit: Kit, g: THREE.Group): Animar {
  const orden = kit.panel(1.3, 1.7, { relleno: 0.55, colorBorde: 0xb48cff, tint: false });
  const renglones = new THREE.Mesh(geoTarjeta(1.0, 1.3, false), Object.assign(kit.mb(0xffffff, 0.8), { vertexColors: true }));
  renglones.position.z = 0.01;
  orden.grupo.add(renglones);
  g.add(orden.grupo);

  const tablero = kit.panel(3.4, 2.2, { relleno: 0.35 });
  tablero.grupo.position.set(1.0, 2.3, -0.3);
  g.add(tablero.grupo);
  const COLS = 7;
  const FILAS = 3;
  const celdaPos = (j: number) => v3(-1.35 + (j % COLS) * 0.45, 0.55 - Math.floor(j / COLS) * 0.55, 0.01);
  const celdas = instanciado(new THREE.PlaneGeometry(0.36, 0.42), kit.mb(0xffffff, 0.8), COLS * FILAS);
  for (let j = 0; j < COLS * FILAS; j++) {
    tmpO.position.copy(celdaPos(j));
    tmpO.rotation.set(0, 0, 0);
    tmpO.scale.setScalar(1);
    tmpO.updateMatrix();
    celdas.setMatrixAt(j, tmpO.matrix);
  }
  tablero.grupo.add(celdas);

  const puesto = new THREE.Group();
  const poste = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.CylinderGeometry(0.12, 0.18, 0.9, 6)), kit.ml(PAL.cyan, 0.95, { tint: false }));
  poste.position.y = 0.45;
  const techo = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.ConeGeometry(0.3, 0.3, 6)), kit.ml(PAL.cyan, 0.95, { tint: false }));
  techo.position.y = 1.05;
  const faro = kit.sprite(PAL.cyan, 1.1, 0.9);
  faro.position.y = 1.3;
  puesto.add(poste, techo, faro);
  g.add(puesto);
  const colBase = new THREE.Color(PAL.french);
  const colOk = new THREE.Color(PAL.cyan);
  const a = new THREE.Vector3();

  return (t) => {
    const ciclo = Math.floor(t / 7);
    const u = fase(t, 7);
    const j = (ciclo * 5 + 3) % (COLS * FILAS);
    const destino = celdaPos(j).add(tablero.grupo.position);
    const vuela = smooth(ramp(u, 0.15, 0.5));
    a.set(-2.3, 2.3, 0.4).lerp(destino, vuela);
    a.y += Math.sin(vuela * Math.PI) * 0.6;
    orden.grupo.position.copy(a);
    orden.grupo.scale.setScalar(Math.max(0.0001, (1 - vuela * 0.75) * ramp(u, 0, 0.08) * (1 - ramp(u, 0.48, 0.52))));
    orden.grupo.rotation.y = 0.4 * (1 - vuela);
    const agenda = ventana(u, 0.5, 0.56, 0.93, 1);
    for (let k = 0; k < COLS * FILAS; k++) {
      tmpC.copy(colBase);
      if (k === j) tmpC.lerp(colOk, agenda);
      else if ((k * 7 + ciclo) % 5 === 0) tmpC.lerp(colOk, 0.35);
      celdas.setColorAt(k, tmpC);
    }
    if (celdas.instanceColor) celdas.instanceColor.needsUpdate = true;
    puesto.position.set(destino.x, destino.y + 0.25, destino.z + 0.25);
    puesto.scale.setScalar(Math.max(0.0001, smooth(ramp(u, 0.55, 0.68)) * (1 - ramp(u, 0.92, 0.99))));
    op(faro.material, 0.6 + 0.4 * Math.sin(t * 5));
  };
}

/** Libro mayor que crece, enlazado con la operación (el riel). */
function contabilidad(kit: Kit, g: THREE.Group, estacionLocal: THREE.Vector3): Animar {
  const base = kit.panel(4, 0.9, { relleno: 0.3 });
  base.grupo.rotation.x = -Math.PI / 2;
  base.grupo.position.set(0, 0.06, 0.3);
  g.add(base.grupo);
  const N = 6;
  const barras = Array.from({ length: N }, (_, k) => {
    const b = kit.caja(0.42, 1, 0.42, k % 2 ? PAL.verde : PAL.cyan, 0.4, k % 2 ? PAL.verde : PAL.cyan, 0.95, false);
    b.position.set(-1.6 + k * 0.64, 0, 0.3);
    g.add(b);
    return b;
  });
  const curva = kit.linea(Array.from({ length: N }, () => v3(0, 0, 0)), kit.ml(PAL.ambar, 0.95, { tint: false }));
  g.add(curva);
  const puntos = instanciado(new THREE.SphereGeometry(0.08, 8, 6), kit.mb(PAL.ambar, 0.95), N);
  g.add(puntos);
  const desde = v3(0, 3.6, 0.3);
  const enlace = new THREE.QuadraticBezierCurve3(estacionLocal.clone().setY(1.6), estacionLocal.clone().lerp(desde, 0.5).setY(5.5), desde);
  g.add(kit.linea(enlace.getPoints(40), kit.mld(PAL.verde, 0.55, 0.25, 0.2)));
  const f = kit.flujo(enlace, kit.lowPower ? 5 : 10, PAL.verde, 0.3, 0.22);
  g.add(f.puntos);
  const pos = curva.geometry.attributes.position as THREE.BufferAttribute;

  return (t) => {
    barras.forEach((b, k) => {
      const h = 0.6 + 1.6 * (0.5 + 0.5 * Math.sin(t * 0.7 + k * 0.9)) + k * 0.2;
      b.scale.y = h;
      b.position.y = h / 2;
      const y = h + 0.6;
      pos.setXYZ(k, b.position.x, y, 0.3);
      tmpO.position.set(b.position.x, y, 0.3);
      tmpO.rotation.set(0, 0, 0);
      tmpO.scale.setScalar(1);
      tmpO.updateMatrix();
      puntos.setMatrixAt(k, tmpO.matrix);
    });
    pos.needsUpdate = true;
    puntos.instanceMatrix.needsUpdate = true;
    f.update(t, 0.9);
  };
}

/** Pregunta en español → IA → gráfica. */
function asistente(kit: Kit, g: THREE.Group): Animar {
  const burbuja = kit.panel(4.2, 0.75, { radio: 0.3, relleno: 0.5, colorRelleno: PAL.french, colorBorde: PAL.steel, tint: false });
  burbuja.grupo.position.set(-0.3, 4.2, 0);
  const pregunta = kit.texto("¿Cuánto costó la nómina de octubre?", 0.36);
  pregunta.position.z = 0.02;
  burbuja.grupo.add(pregunta);
  g.add(burbuja.grupo);

  const nucleo = new THREE.Group();
  nucleo.position.set(-1.6, 2.2, 0);
  nucleo.add(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(0.55, 1)), kit.ml(PAL.bright, 0.95)));
  const brillo = kit.sprite(PAL.indigo, 2.6, 0.7);
  nucleo.add(brillo);
  g.add(nucleo);
  const f1 = kit.flujo(new THREE.QuadraticBezierCurve3(v3(-1.2, 3.8, 0), v3(-2.2, 3.4, 0.3), v3(-1.6, 2.6, 0)), kit.lowPower ? 4 : 8, PAL.ice, 0.22, 0.6);
  const f2 = kit.flujo(new THREE.QuadraticBezierCurve3(v3(-1.1, 2.2, 0), v3(-0.2, 2.8, 0.3), v3(0.6, 2.2, 0)), kit.lowPower ? 4 : 8, PAL.cyan, 0.22, 0.6);
  g.add(f1.puntos, f2.puntos);

  const panel = kit.panel(2.8, 2.2, { relleno: 0.4 });
  panel.grupo.position.set(1.9, 1.9, -0.1);
  g.add(panel.grupo);
  const barras = [0.6, 0.9, 0.75, 1.2, 1.0].map((h, k) => {
    const b = new THREE.Mesh(new THREE.PlaneGeometry(0.26, h).translate(0, h / 2, 0), kit.mb(k === 3 ? PAL.ambar : PAL.cyan, 0.85, { aditivo: true }));
    b.position.set(-1.05 + k * 0.38, -0.8, 0.01);
    panel.grupo.add(b);
    return b;
  });
  const torta = kit.linea(puntosArco(0.42, Math.PI / 2, Math.PI / 2 - Math.PI * 2, 48), kit.ml(PAL.verde, 0.95, { tint: false }));
  torta.position.set(0.85, 0.35, 0.01);
  panel.grupo.add(torta);

  return (t) => {
    const u = fase(t, 9);
    const fin = 1 - ramp(u, 0.92, 1);
    burbuja.grupo.scale.setScalar(Math.max(0.0001, smooth(ramp(u, 0, 0.08)) * fin));
    f1.update(t, ventana(u, 0.08, 0.12, 0.3, 0.35));
    const piensa = ventana(u, 0.15, 0.25, 0.4, 0.5);
    nucleo.rotation.set(t * (0.3 + piensa * 2), t * (0.4 + piensa * 2.5), 0);
    op(brillo.material, 0.4 + 0.5 * piensa);
    f2.update(t, ventana(u, 0.35, 0.4, 0.55, 0.6));
    barras.forEach((b, k) => (b.scale.y = Math.max(0.0001, smooth(ramp(u, 0.45 + k * 0.04, 0.55 + k * 0.04)) * fin)));
    torta.geometry.setDrawRange(0, Math.floor(49 * ramp(u, 0.55, 0.72) * fin));
  };
}

/** Facturas electrónicas que se apilan y se validan. Próximamente: tenue y punteado. */
function dian(kit: Kit, g: THREE.Group): Animar {
  const N = 5;
  const docs = Array.from({ length: N }, () => {
    const d = new THREE.Group();
    const borde = kit.linea(puntosRect(1.5, 1.9, 0.08), kit.mld(PAL.steel, 0.55, 0.12, 0.08));
    const fondo = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.9), kit.mb(PAL.imperial, 0.3));
    const r = new THREE.Mesh(geoTarjeta(1.2, 1.5, false), Object.assign(kit.mb(0xffffff, 0.35), { vertexColors: true }));
    r.position.z = 0.01;
    d.add(fondo, borde, r);
    d.rotation.x = -Math.PI / 2 + 0.25;
    g.add(d);
    return d;
  });
  const sello = new THREE.Group();
  sello.add(new THREE.Mesh(new THREE.RingGeometry(0.45, 0.55, 40), kit.mb(PAL.verde, 0.6, { aditivo: true })));
  sello.add(kit.linea([v3(-0.2, 0, 0.01), v3(-0.05, -0.16, 0.01), v3(0.24, 0.18, 0.01)], kit.ml(PAL.verde, 0.7, { tint: false })));
  sello.rotation.x = -Math.PI / 2;
  g.add(sello);
  const selloMats = sello.children.map((c) => (c as THREE.Mesh).material as THREE.Material);
  const prox = kit.texto("Próximamente", 0.42, "#ffcf85");
  prox.position.set(0, 3.9, 0);
  g.add(prox);
  const radian = kit.linea(puntosArco(1.6, 0, Math.PI * 2, 64).map((p) => v3(p.x, 0.05, p.y)), kit.mld(PAL.ambar, 0.4, 0.2, 0.2));
  g.add(radian);

  return (t) => {
    const u = fase(t, 8);
    docs.forEach((d, k) => {
      const cae = smooth(ramp(u, k * 0.1, k * 0.1 + 0.12));
      d.position.set(Math.sin(k * 1.7) * 0.08, 0.15 + k * 0.1 + (1 - cae) * 3.2, Math.cos(k) * 0.08);
      d.rotation.z = (1 - cae) * (k % 2 ? 0.6 : -0.6);
      d.scale.setScalar(Math.max(0.0001, ramp(u, k * 0.1, k * 0.1 + 0.03) * (1 - ramp(u, 0.93, 1))));
    });
    const golpe = ramp(u, 0.62, 0.7);
    sello.position.set(0, 0.75 + (1 - golpe) * 1.4, 0.15);
    sello.scale.setScalar(1 + 0.25 * ventana(u, 0.68, 0.7, 0.72, 0.78));
    selloMats.forEach((m) => op(m, 0.6 * ventana(u, 0.55, 0.62, 0.9, 0.97)));
    radian.rotation.y = t * 0.2;
    op(prox.material, 0.7 + 0.15 * Math.sin(t * 1.5));
  };
}

/** ARS y Avancys se acoplan en una sola pantalla. */
function erp(kit: Kit, g: THREE.Group): Animar {
  const pantalla = (color: number, nombre: string, css: string) => {
    const p = kit.panel(2.1, 1.5, { relleno: 0.45, colorBorde: color, colorRelleno: PAL.imperial, tint: false });
    const filas = new THREE.Mesh(geoTarjeta(1.7, 1.1, false), Object.assign(kit.mb(0xffffff, 0.7), { vertexColors: true }));
    filas.position.z = 0.01;
    p.grupo.add(filas);
    const et = kit.texto(nombre, 0.4, css);
    et.position.set(0, 1.05, 0);
    p.grupo.add(et);
    g.add(p.grupo);
    return p.grupo;
  };
  const ars = pantalla(PAL.bright, "ARS", "#d5e0ff");
  const avancys = pantalla(PAL.cyan, "Avancys", "#9fe8ff");
  const marco = kit.linea(puntosRect(4.5, 1.9, 0.14), kit.ml(PAL.verde, 0, { tint: false }));
  marco.position.set(0, 2.3, 0.02);
  g.add(marco);
  const costura = kit.sprite(PAL.verde, 1.6, 0);
  costura.position.set(0, 2.3, 0.05);
  g.add(costura);
  const soporte = kit.linea([v3(0, 0.05, 0), v3(0, 1.35, 0)], kit.ml(PAL.steel, 0.6));
  g.add(soporte);

  return (t) => {
    const u = fase(t, 8);
    const une = smooth(ventana(u, 0.08, 0.38, 0.82, 0.96));
    const sep = 2.4 * (1 - une) + 1.06;
    ars.position.set(-sep, 2.3 + 0.4 * (1 - une), 0);
    avancys.position.set(sep, 2.3 - 0.3 * (1 - une), 0);
    ars.rotation.y = 0.35 * (1 - une);
    avancys.rotation.y = -0.35 * (1 - une);
    const listo = ramp(une, 0.92, 1);
    op(marco.material, listo);
    op(costura.material, listo * (0.6 + 0.4 * Math.sin(t * 6)));
  };
}

// ───────────────────────── Escena ─────────────────────────

export default crearEscena(
  (kit) => {
    const animaciones: Animar[] = [riel(kit)];
    const encuadres: Record<string, Encuadre> = {};
    const lugares: Array<{ clave: string; x: number; z: number }> = [
      { clave: "clientes", x: -9.5, z: 10.5 },
      { clave: "ordenes", x: 0, z: 10.5 },
      { clave: "contabilidad", x: 9.5, z: 10.5 },
      { clave: "asistente", x: -9.5, z: -9.5 },
      { clave: "dian", x: 0, z: -9.5 },
      { clave: "erp", x: 9.5, z: -9.5 },
    ];
    for (const l of lugares) {
      const centro = v3(l.x, 0, l.z);
      const atras = l.z < 0;
      const { grupo } = montarVineta(kit, l.clave, centro, 0, { radio: 3.7, hotspotY: atras ? 5.6 : 5.0 });
      encuadres[l.clave] = atras ? frente(centro, 0, 8.6, 4.4, 2.3) : frente(centro, 0, 9.2, 5.0, 2.2);
      switch (l.clave) {
        case "clientes":
          animaciones.push(clientes(kit, grupo));
          break;
        case "ordenes":
          animaciones.push(ordenes(kit, grupo));
          break;
        case "contabilidad":
          animaciones.push(contabilidad(kit, grupo, v3(5 - l.x, 0, -l.z)));
          break;
        case "asistente":
          animaciones.push(asistente(kit, grupo));
          break;
        case "dian":
          animaciones.push(dian(kit, grupo));
          break;
        default:
          animaciones.push(erp(kit, grupo));
      }
    }
    return {
      general: { pos: v3(0, 21, 31), target: v3(0, 1.5, 0) },
      encuadres,
      update: (t) => animaciones.forEach((a) => a(t)),
    };
  },
  { niebla: 0.013, suelo: { radio: 70, alcance: 0.045 }, polvo: { radio: 24, alto: 10 }, tiempoQuieto: 4.6 },
);
