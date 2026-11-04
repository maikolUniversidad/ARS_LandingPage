/**
 * Escena F · Gestión humana.
 *
 * En el centro, el ÁRBOL DOCUMENTAL: el tronco es la empresa, las ramas son los
 * tipos de documento y las hojas son documentos que van entrando (parpadean al
 * llegar). Alrededor, en un anillo, una viñeta por módulo:
 *  documental (papeles sueltos que la IA ordena en carpetas), selección (embudo de
 *  candidatos → contrato firmado), colaboradores (ficha que se llena sola), nómina
 *  (turnos del calendario → cinta de pago → monedas), costos (centros de costo de
 *  ARS y del ERP del cliente que se alinean), portal (el cliente mira la carpeta a través de
 *  un portal) y jurídica (expediente con línea de tiempo reporte → descargo → decisión).
 */
import * as THREE from "three";
import {
  PAL,
  anillo,
  crearEscena,
  fase,
  geoTarjeta,
  instanciado,
  montarVineta,
  mulberry32,
  op,
  persona,
  puntosArco,
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

// ───────────────────────── Árbol documental (centro) ─────────────────────────

const RAMAS: Array<{ nombre: string; color: number }> = [
  { nombre: "Contratación", color: PAL.cyan },
  { nombre: "Seguridad social", color: PAL.verde },
  { nombre: "Capacitación", color: PAL.ambar },
  { nombre: "Exámenes médicos", color: PAL.bright },
  { nombre: "Dotación", color: 0xb48cff },
];

function arbol(kit: Kit): Animar {
  const g = new THREE.Group();
  kit.vineta("arbol", g);
  kit.scene.add(g);
  const rand = mulberry32(5);

  // Empresa: la base del tronco
  const empresa = kit.caja(2.6, 1.1, 2.6, PAL.imperial, 0.55, PAL.bright, 0.9);
  empresa.position.y = 0.55;
  g.add(empresa);
  const placa = new THREE.Mesh(new THREE.RingGeometry(4.6, 4.75, 72), kit.mb(PAL.bright, 0.5, { aditivo: true, tint: true }));
  placa.rotation.x = -Math.PI / 2;
  placa.position.y = 0.03;
  g.add(placa);

  // Tronco: tubo luminoso + tres hebras en hélice
  const tronco = new THREE.CatmullRomCurve3([v3(0, 1.1, 0), v3(0.15, 3, 0.1), v3(-0.1, 5, -0.1), v3(0, 7.2, 0)]);
  g.add(new THREE.Mesh(new THREE.TubeGeometry(tronco, 32, 0.32, 10), kit.mb(PAL.indigo, 0.35, { aditivo: true, tint: true })));
  for (let h = 0; h < 3; h++) {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 60; i++) {
      const u = i / 60;
      const p = tronco.getPoint(u);
      const a = u * Math.PI * 5 + (h * Math.PI * 2) / 3;
      pts.push(p.add(v3(Math.cos(a) * 0.38, 0, Math.sin(a) * 0.38)));
    }
    g.add(kit.linea(pts, kit.ml(PAL.bright, 0.8)));
  }

  // Ramas, ramitas, hojas (documentos) y etiquetas
  const curvas: THREE.CatmullRomCurve3[] = [];
  const nHojas = kit.lowPower ? 14 : 26;
  const hojaPos: THREE.Vector3[] = [];
  const hojaRot: THREE.Euler[] = [];
  const hojaRama: number[] = [];
  const hojaFase: number[] = [];
  RAMAS.forEach((r, i) => {
    const a = (i / RAMAS.length) * Math.PI * 2 + 0.35;
    const y0 = 2.6 + i * 0.75;
    const dir = v3(Math.cos(a), 0, Math.sin(a));
    const curva = new THREE.CatmullRomCurve3([
      v3(0, y0, 0),
      dir.clone().multiplyScalar(1.6).setY(y0 + 1.1),
      dir.clone().multiplyScalar(3.2).setY(y0 + 2.4),
      dir.clone().multiplyScalar(4.4).setY(y0 + 3.0),
    ]);
    curvas.push(curva);
    g.add(new THREE.Mesh(new THREE.TubeGeometry(curva, 24, 0.09, 6), kit.mb(r.color, 0.55, { aditivo: true })));
    g.add(kit.linea(curva.getPoints(30), kit.ml(r.color, 0.9, { tint: false })));
    // ramitas
    for (let k = 0; k < 3; k++) {
      const base = curva.getPoint(0.45 + k * 0.18);
      const off = v3(rand() - 0.5, 0.6 + rand() * 0.6, rand() - 0.5).multiplyScalar(1.3);
      g.add(kit.linea([base, base.clone().add(off)], kit.ml(r.color, 0.55, { tint: false })));
    }
    // hojas
    for (let k = 0; k < nHojas; k++) {
      const base = curva.getPoint(0.4 + rand() * 0.6);
      const off = v3(rand() - 0.5, rand() - 0.3, rand() - 0.5).normalize().multiplyScalar(0.4 + rand() * 1.1);
      hojaPos.push(base.add(off));
      hojaRot.push(new THREE.Euler(rand() * 0.8 - 0.4, rand() * Math.PI * 2, rand() * 0.8 - 0.4));
      hojaRama.push(i);
      hojaFase.push(rand());
    }
    // etiqueta en la punta
    const et = kit.texto(r.nombre, 0.5);
    et.position.copy(curva.getPoint(1)).add(v3(0, 1.2, 0));
    g.add(et);
  });

  const hojas = instanciado(new THREE.PlaneGeometry(0.34, 0.44), kit.mb(0xffffff, 0.9), hojaPos.length);
  g.add(hojas);

  // Savia: datos subiendo del tronco a cada rama
  const flujos = curvas.map((c, i) => {
    const pts = [v3(0, 0.6, 0), ...c.points];
    const f = kit.flujo(new THREE.CatmullRomCurve3(pts), kit.lowPower ? 5 : 10, RAMAS[i].color, 0.32, 0.18);
    g.add(f.puntos);
    return f;
  });

  const corona = kit.sprite(PAL.indigo, 9, 0.35);
  corona.position.y = 7.5;
  g.add(corona);

  const colRama = RAMAS.map((r) => new THREE.Color(r.color));
  const blanco = new THREE.Color(PAL.ice);

  return (t) => {
    const foco = kit.peso("arbol");
    for (let i = 0; i < hojaPos.length; i++) {
      // Cada hoja "entra" (crece y destella), se queda y luego se renueva.
      const u = fase(t, 9, hojaFase[i] * 9);
      const entra = ramp(u, 0, 0.06);
      const sale = 1 - ramp(u, 0.93, 1);
      const destello = 1 - ramp(u, 0.04, 0.2);
      tmpO.position.copy(hojaPos[i]);
      tmpO.position.y += Math.sin(t * 1.3 + i) * 0.05;
      tmpO.rotation.copy(hojaRot[i]);
      tmpO.rotation.y += Math.sin(t * 0.6 + i * 0.7) * 0.3;
      tmpO.scale.setScalar(Math.max(0.0001, entra * sale * (1 + destello * 0.6)));
      tmpO.updateMatrix();
      hojas.setMatrixAt(i, tmpO.matrix);
      tmpC.copy(colRama[hojaRama[i]]).lerp(blanco, destello * 0.85);
      hojas.setColorAt(i, tmpC);
    }
    hojas.instanceMatrix.needsUpdate = true;
    if (hojas.instanceColor) hojas.instanceColor.needsUpdate = true;
    flujos.forEach((f) => f.update(t, 0.75 + 0.25 * foco));
    op(corona.material, 0.25 + 0.12 * Math.sin(t * 1.4) + 0.25 * foco);
  };
}

// ───────────────────────── Viñetas ─────────────────────────

/** Papeles sueltos → escáner de IA → carpetas correctas. */
function documental(kit: Kit, g: THREE.Group): Animar {
  const CARPETAS = [
    { nombre: "Contratos", color: PAL.cyan },
    { nombre: "EPS y ARL", color: PAL.verde },
    { nombre: "Exámenes", color: PAL.ambar },
    { nombre: "Cursos", color: 0xb48cff },
  ];
  const carpetaX = (k: number) => 0.2 + k * 1.15;
  CARPETAS.forEach((c, k) => {
    const caja = kit.caja(0.9, 0.85, 0.9, c.color, 0.12, c.color, 0.9, false);
    caja.position.set(carpetaX(k), 0.45, 0.2);
    const pestana = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.16), kit.mb(c.color, 0.7));
    pestana.position.set(-0.2, 0.5, 0.451);
    caja.add(pestana);
    g.add(caja);
    const et = kit.texto(c.nombre, 0.3);
    et.position.set(carpetaX(k), 1.25, 0.2);
    g.add(et);
  });

  // Escáner de IA: anillo vertical con barrido
  const escaner = new THREE.Group();
  escaner.position.set(-1.2, 2.9, 0.2);
  escaner.rotation.y = Math.PI / 2;
  escaner.add(new THREE.Mesh(new THREE.RingGeometry(0.85, 0.97, 48), kit.mb(PAL.bright, 0.85, { aditivo: true, tint: true })));
  const barrido = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 0.05), kit.mb(PAL.cyan, 0.8, { aditivo: true }));
  escaner.add(barrido);
  const brillo = kit.sprite(PAL.indigo, 3.2, 0.6);
  escaner.add(brillo);
  g.add(escaner);
  const ia = kit.texto("IA", 0.45, "#9fe8ff", 700);
  ia.position.set(-1.2, 4.15, 0.2);
  g.add(ia);

  const n = kit.lowPower ? 12 : 20;
  const rand = mulberry32(21);
  const papeles = instanciado(geoTarjeta(0.42, 0.55, false), Object.assign(kit.mb(0xffffff, 0.95), { vertexColors: true }), n);
  g.add(papeles);
  const caos = Array.from({ length: n }, () => v3(-3.6 + rand() * 1.4, 2.2 + rand() * 2.6, -0.6 + rand() * 1.4));
  const giro = Array.from({ length: n }, () => v3(rand() * 6, rand() * 6, rand() * 6));
  const ring = v3(-1.2, 2.9, 0.2);
  const colSuelto = new THREE.Color(PAL.steel);
  const colFlash = new THREE.Color(0xffffff);
  const colCarp = CARPETAS.map((c) => new THREE.Color(c.color));
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();

  return (t) => {
    barrido.position.y = Math.sin(t * 3.2) * 0.75;
    op(brillo.material, 0.45 + 0.2 * Math.sin(t * 5));
    for (let i = 0; i < n; i++) {
      const u = fase(t, 7, (i / n) * 7);
      const k = i % CARPETAS.length;
      const destino = b.set(carpetaX(k), 0.95, 0.2);
      let escala = 1;
      if (u < 0.32) {
        // revoloteo y vuelo al escáner
        const s = smooth(u / 0.32);
        a.copy(caos[i]).lerp(ring, s);
        a.y += Math.sin(t * 2 + i) * 0.15 * (1 - s);
        tmpO.rotation.set(giro[i].x * (1 - s) + t * (1 - s), giro[i].y * (1 - s) + Math.PI / 2 * s, giro[i].z * (1 - s));
        escala = ramp(u, 0, 0.05);
      } else if (u < 0.42) {
        a.copy(ring).add(v3((u - 0.37) * 4, 0, 0));
        tmpO.rotation.set(0, Math.PI / 2, 0);
      } else if (u < 0.78) {
        const s = smooth((u - 0.42) / 0.36);
        a.copy(ring).add(v3(0.4, 0, 0)).lerp(destino, s);
        a.y += Math.sin(s * Math.PI) * 1.1;
        tmpO.rotation.set(0, Math.PI / 2 * (1 - s), 0);
      } else {
        const s = smooth((u - 0.78) / 0.16);
        a.copy(destino);
        a.y -= s * 0.55;
        tmpO.rotation.set(0, 0, 0);
        escala = 1 - ramp(u, 0.9, 1);
      }
      tmpO.position.copy(a);
      tmpO.scale.setScalar(Math.max(0.0001, escala));
      tmpO.updateMatrix();
      papeles.setMatrixAt(i, tmpO.matrix);
      const clasif = ramp(u, 0.34, 0.42);
      const flash = ventana(u, 0.33, 0.36, 0.38, 0.46);
      tmpC.copy(colSuelto).lerp(colCarp[k], clasif).lerp(colFlash, flash * 0.8);
      papeles.setColorAt(i, tmpC);
    }
    papeles.instanceMatrix.needsUpdate = true;
    if (papeles.instanceColor) papeles.instanceColor.needsUpdate = true;
  };
}

/** Candidatos que bajan por un embudo; los elegidos terminan en un contrato firmado. */
function seleccion(kit: Kit, g: THREE.Group): Animar {
  const embudo = new THREE.Group();
  embudo.position.set(-1.1, 0, 0);
  g.add(embudo);
  const niveles: Array<[number, number]> = [
    [4.4, 2.0],
    [3.6, 1.45],
    [2.9, 0.9],
    [2.3, 0.45],
  ];
  for (const [y, r] of niveles) {
    const pts = puntosArco(r, 0, Math.PI * 2, 48).map((p) => v3(p.x, y, p.y));
    embudo.add(kit.linea(pts, kit.ml(PAL.bright, 0.75)));
  }
  const paredes: Array<[THREE.Vector3, THREE.Vector3]> = [];
  for (let k = 0; k < 10; k++) {
    const a = (k / 10) * Math.PI * 2;
    paredes.push([v3(Math.cos(a) * 2.0, 4.4, Math.sin(a) * 2.0), v3(Math.cos(a) * 0.45, 2.3, Math.sin(a) * 0.45)]);
  }
  const segs: THREE.Vector3[] = [];
  paredes.forEach(([a, b]) => segs.push(a, b));
  embudo.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(segs), kit.ml(PAL.bright, 0.35)));
  const cono = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 0.45, 2.1, 32, 1, true), kit.mb(PAL.indigo, 0.12, { aditivo: true }));
  cono.position.y = 3.35;
  embudo.add(cono);

  // Contrato
  const contrato = kit.panel(1.9, 2.3, { relleno: 0.5 });
  contrato.grupo.position.set(2.1, 1.55, 0.3);
  contrato.grupo.rotation.y = -0.25;
  g.add(contrato.grupo);
  const geoRenglon = new THREE.PlaneGeometry(1.3, 0.06);
  const matRenglon = kit.mb(PAL.steel, 0.55);
  for (let k = 0; k < 5; k++) {
    const r = new THREE.Mesh(geoRenglon, matRenglon);
    r.position.set(0, 0.8 - k * 0.22, 0.01);
    r.scale.x = k === 4 ? 0.6 : 1;
    contrato.grupo.add(r);
  }
  const firmaPts: THREE.Vector3[] = [];
  for (let i = 0; i <= 60; i++) {
    const u = i / 60;
    firmaPts.push(v3(-0.6 + u * 1.2, -0.62 + Math.sin(u * 16) * 0.09 * (1 - u * 0.5) + Math.sin(u * 5) * 0.05, 0.02));
  }
  const firma = kit.linea(firmaPts, kit.ml(PAL.cyan, 1, { tint: false }));
  contrato.grupo.add(firma);
  const sello = new THREE.Group();
  sello.position.set(0.55, -0.75, 0.03);
  sello.add(new THREE.Mesh(new THREE.RingGeometry(0.22, 0.27, 32), kit.mb(PAL.verde, 0.95, { aditivo: true })));
  sello.add(kit.linea([v3(-0.1, 0, 0), v3(-0.02, -0.08, 0), v3(0.12, 0.09, 0)], kit.ml(PAL.verde, 1, { tint: false })));
  contrato.grupo.add(sello);
  const selloMats = sello.children.map((c) => (c as THREE.Mesh).material as THREE.Material);

  const n = 10;
  const tarjetas = instanciado(geoTarjeta(0.6, 0.42), Object.assign(kit.mb(0xffffff, 0.95), { vertexColors: true }), n);
  g.add(tarjetas);
  const destinoContrato = v3(2.1, 1.7, 0.45);
  const colNormal = new THREE.Color(PAL.ice);
  const colNo = new THREE.Color(PAL.rojo);
  const colSi = new THREE.Color(PAL.verde);
  const PERIODO = 10;

  return (t) => {
    for (let i = 0; i < n; i++) {
      const u = fase(t, PERIODO, i * (PERIODO / n));
      const elegido = i % 5 === 0;
      const a0 = i * 2.4;
      let escala = ramp(u, 0, 0.06);
      tmpO.rotation.set(0, 0, 0);
      if (u < 0.12) {
        const s = smooth(u / 0.12);
        tmpO.position.set(-1.1 + Math.cos(a0) * 2.0 - 2 * (1 - s), 4.4 + 1.6 * (1 - s), Math.sin(a0) * 2.0);
      } else if (u < 0.55) {
        const s = (u - 0.12) / 0.43;
        const ang = a0 + s * Math.PI * 3;
        const r = 2.0 - 1.55 * s;
        tmpO.position.set(-1.1 + Math.cos(ang) * r, 4.4 - 2.1 * s, Math.sin(ang) * r);
        tmpO.rotation.y = -ang + Math.PI / 2;
        if (!elegido && s > 0.55) {
          // descartado: sale disparado y se desvanece
          const d = (s - 0.55) / 0.45;
          tmpO.position.x += Math.cos(ang) * d * 2.5;
          tmpO.position.z += Math.sin(ang) * d * 2.5;
          tmpO.position.y += d * 0.8;
          escala *= 1 - d;
        }
      } else if (elegido && u < 0.75) {
        const s = smooth((u - 0.55) / 0.2);
        tmpO.position.set(-1.1, 2.3, 0).lerp(destinoContrato, s);
        tmpO.position.y -= Math.sin(s * Math.PI) * 0.4;
        escala *= 1 - ramp(u, 0.68, 0.75);
      } else {
        escala = 0;
      }
      tmpO.scale.setScalar(Math.max(0.0001, escala));
      tmpO.updateMatrix();
      tarjetas.setMatrixAt(i, tmpO.matrix);
      const juicio = ramp(u, 0.3, 0.42);
      tmpC.copy(colNormal).lerp(elegido ? colSi : colNo, juicio * (elegido ? 0.6 : 0.8));
      tarjetas.setColorAt(i, tmpC);
    }
    tarjetas.instanceMatrix.needsUpdate = true;
    if (tarjetas.instanceColor) tarjetas.instanceColor.needsUpdate = true;
    // firma sincronizada con la llegada de cada elegido (cada 5 s)
    const s = fase(t - PERIODO * 0.72, PERIODO / 2);
    firma.geometry.setDrawRange(0, Math.floor(61 * ramp(s, 0.02, 0.35)));
    op(firma.material, 1 - ramp(s, 0.9, 0.98));
    const vis = ventana(s, 0.35, 0.45, 0.9, 0.98);
    sello.scale.setScalar(0.6 + 0.4 * vis + 0.2 * ventana(s, 0.35, 0.42, 0.45, 0.55));
    selloMats.forEach((m) => op(m, vis));
  };
}

/** Ficha del colaborador que se llena sola. */
function colaboradores(kit: Kit, g: THREE.Group): Animar {
  const ficha = kit.panel(3.2, 4.2, { relleno: 0.5, radio: 0.22 });
  ficha.grupo.position.set(0.5, 2.6, 0);
  g.add(ficha.grupo);
  // avatar
  const avatar = new THREE.Group();
  avatar.position.set(-0.85, 1.45, 0.02);
  avatar.add(kit.linea(puntosArco(0.5, 0, Math.PI * 2, 40), kit.ml(PAL.bright, 0.9)));
  avatar.add(new THREE.Mesh(new THREE.CircleGeometry(0.17, 20).translate(0, 0.1, 0), kit.mb(PAL.ice, 0.8)));
  avatar.add(new THREE.Mesh(new THREE.CircleGeometry(0.3, 20, 0, Math.PI).translate(0, -0.32, 0), kit.mb(PAL.ice, 0.6)));
  ficha.grupo.add(avatar);
  const nombre = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.14).translate(0.6, 0, 0), kit.mb(PAL.ice, 0.85));
  nombre.position.set(-0.15, 1.6, 0.02);
  const cargo = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.09).translate(0.4, 0, 0), kit.mb(PAL.steel, 0.6));
  cargo.position.set(-0.15, 1.33, 0.02);
  ficha.grupo.add(nombre, cargo);

  const anchos = [1.7, 1.2, 1.9, 1.4, 1.0, 1.6];
  const valores: THREE.Mesh[] = [];
  const geoEt = new THREE.PlaneGeometry(0.6, 0.07).translate(0.3, 0, 0);
  const matEt = kit.mb(PAL.steel, 0.45);
  const matVal = kit.mb(PAL.cyan, 0.9, { aditivo: true });
  anchos.forEach((w, k) => {
    const y = 0.55 - k * 0.42;
    const et = new THREE.Mesh(geoEt, matEt);
    et.position.set(-1.4, y + 0.1, 0.02);
    const val = new THREE.Mesh(new THREE.PlaneGeometry(w, 0.12).translate(w / 2, 0, 0), matVal);
    val.position.set(-1.4, y - 0.06, 0.02);
    const linea = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 0.012).translate(1.4, 0, 0), matEt);
    linea.position.set(-1.4, y - 0.17, 0.02);
    ficha.grupo.add(et, val, linea);
    valores.push(val);
  });
  const cursor = kit.sprite(PAL.cyan, 0.5, 0.9);
  ficha.grupo.add(cursor);
  const ok = kit.sprite(PAL.verde, 1.4, 0);
  ok.position.set(1.25, 1.55, 0.05);
  ficha.grupo.add(ok);

  // Documentos de origen alimentando la ficha
  const pila = kit.caja(0.8, 0.5, 1.0, PAL.french, 0.4, PAL.steel, 0.7);
  pila.position.set(-2.4, 0.25, 0.6);
  g.add(pila);
  const f = kit.flujo(new THREE.QuadraticBezierCurve3(v3(-2.4, 0.6, 0.6), v3(-2.2, 2.8, 0.6), v3(-0.9, 2.6, 0.1)), kit.lowPower ? 6 : 12, PAL.cyan, 0.25, 0.4);
  g.add(f.puntos);

  return (t) => {
    const u = fase(t, 8);
    let activo = -1;
    valores.forEach((v, k) => {
      const a = 0.06 + k * 0.11;
      const p = ramp(u, a, a + 0.09) * (1 - ramp(u, 0.95, 1));
      v.scale.x = Math.max(0.0001, p);
      if (u > a && u < a + 0.09) activo = k;
    });
    if (activo >= 0) {
      const v = valores[activo];
      cursor.position.set(v.position.x + anchos[activo] * v.scale.x, v.position.y, 0.05);
      op(cursor.material, 0.9);
    } else op(cursor.material, 0);
    const listo = ventana(u, 0.74, 0.8, 0.94, 0.99);
    op(ok.material, listo);
    ok.scale.setScalar(1 + 0.3 * Math.sin(t * 6) * listo);
    f.update(t, ventana(u, 0.02, 0.06, 0.7, 0.76));
  };
}

/** Turnos del calendario que se vuelven nómina. */
function nomina(kit: Kit, g: THREE.Group): Animar {
  const COLS = 7;
  const FILAS = 4;
  const n = COLS * FILAS;
  const marco = kit.panel(3.6, 2.4, { relleno: 0.3 });
  marco.grupo.position.set(-1.6, 2.4, -0.1);
  g.add(marco.grupo);
  const bloques = instanciado(new THREE.BoxGeometry(0.38, 0.38, 0.1), kit.mb(0xffffff, 0.9), n);
  g.add(bloques);
  const rand = mulberry32(8);
  const tipo = Array.from({ length: n }, () => (rand() < 0.15 ? 2 : rand() < 0.4 ? 1 : 0)); // 0 día, 1 noche, 2 descanso
  const colTipo = [new THREE.Color(PAL.cyan), new THREE.Color(0x8a6bff), new THREE.Color(PAL.french)];
  const celda = (j: number) => v3(-1.6 - 1.35 + (j % COLS) * 0.45, 2.4 + 0.68 - Math.floor(j / COLS) * 0.45, 0);

  const cinta = new THREE.CatmullRomCurve3([v3(0.4, 2.6, 0), v3(1.3, 3.8, 0.4), v3(2.4, 3.2, 0.3), v3(2.7, 1.6, 0)]);
  g.add(new THREE.Mesh(new THREE.TubeGeometry(cinta, 40, 0.06, 6), kit.mb(PAL.ambar, 0.45, { aditivo: true })));
  const f = kit.flujo(cinta, kit.lowPower ? 6 : 14, PAL.ambar, 0.28, 0.35);
  g.add(f.puntos);

  const nM = 12;
  const monedas = instanciado(new THREE.CylinderGeometry(0.42, 0.42, 0.1, 24), kit.mb(PAL.ambar, 0.85), nM);
  monedas.position.set(2.7, 0.08, 0);
  g.add(monedas);
  const brilloM = kit.sprite(PAL.ambar, 2.6, 0.4);
  brilloM.position.set(2.7, 1.0, 0);
  g.add(brilloM);
  const blanco = new THREE.Color(1, 1, 1);
  const tenue = new THREE.Color(PAL.french);
  const p = new THREE.Vector3();

  return (t) => {
    const u = fase(t, 9);
    let llegados = 0;
    for (let j = 0; j < n; j++) {
      const enciende = ramp(u, (j / n) * 0.32, (j / n) * 0.32 + 0.03);
      const sale = 0.4 + (j / n) * 0.3;
      const viaje = ramp(u, sale, sale + 0.12);
      if (viaje >= 1) llegados++;
      if (tipo[j] === 2) {
        p.copy(celda(j));
        tmpO.scale.setScalar(0.8);
      } else if (viaje <= 0) {
        p.copy(celda(j));
        tmpO.scale.setScalar(1 + 0.25 * ventana(u, (j / n) * 0.32, (j / n) * 0.32 + 0.02, (j / n) * 0.32 + 0.03, (j / n) * 0.32 + 0.06));
      } else {
        cinta.getPoint(viaje, p);
        p.lerp(celda(j), (1 - ramp(viaje, 0, 0.25)) * 1);
        tmpO.scale.setScalar(Math.max(0.0001, 1 - viaje * 0.85) * (viaje >= 1 ? 0 : 1));
      }
      tmpO.position.copy(p);
      tmpO.rotation.set(0, viaje * Math.PI * 2, 0);
      tmpO.updateMatrix();
      bloques.setMatrixAt(j, tmpO.matrix);
      tmpC.copy(tenue).lerp(colTipo[tipo[j]], tipo[j] === 2 ? 0.3 : enciende).lerp(blanco, viaje > 0 ? 0.3 : 0);
      bloques.setColorAt(j, tmpC);
    }
    bloques.instanceMatrix.needsUpdate = true;
    if (bloques.instanceColor) bloques.instanceColor.needsUpdate = true;
    const trabajados = tipo.filter((x) => x !== 2).length;
    const pila = Math.round((llegados / Math.max(1, trabajados)) * nM) * (u > 0.95 ? 0 : 1);
    for (let k = 0; k < nM; k++) {
      tmpO.position.set(Math.sin(k * 1.7) * 0.04, k * 0.12, Math.cos(k * 1.3) * 0.04);
      tmpO.rotation.set(0, 0, 0);
      tmpO.scale.setScalar(k < pila ? 1 : 0.0001);
      tmpO.updateMatrix();
      monedas.setMatrixAt(k, tmpO.matrix);
    }
    monedas.instanceMatrix.needsUpdate = true;
    f.update(t, ventana(u, 0.38, 0.42, 0.78, 0.84));
    op(brilloM.material, 0.2 + 0.4 * (pila / nM));
  };
}

/** Centros de costo de ARS y su reflejo en el ERP del cliente alineándose. */
function costos(kit: Kit, g: THREE.Group): Animar {
  const alturas = [1.6, 2.6, 1.2, 3.1, 2.0];
  const ars = new THREE.Group();
  const erp = new THREE.Group();
  const marcas: THREE.Mesh[] = [];
  alturas.forEach((h, i) => {
    const x = -1.8 + i * 0.9;
    const c = kit.caja(0.55, h, 0.55, PAL.indigo, 0.45, PAL.bright, 0.9);
    c.position.set(x, h / 2, 0);
    ars.add(c);
    const e = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(0.68, h, 0.68)), kit.ml(PAL.cyan, 0.95, { tint: false }));
    e.position.set(x, h / 2, 0);
    erp.add(e);
    const m = new THREE.Mesh(new THREE.RingGeometry(0.32, 0.42, 32), kit.mb(PAL.verde, 0, { aditivo: true }));
    m.rotation.x = -Math.PI / 2;
    m.position.set(x, h + 0.02, 0);
    marcas.push(m);
    g.add(m);
  });
  g.add(ars, erp);
  const etA = kit.texto("ARS", 0.4);
  etA.position.set(-2.9, 0.5, 0.4);
  const etE = kit.texto("ERP", 0.4, "#9fe8ff");
  etE.position.set(2.9, 3.6, 0.4);
  g.add(etA, etE);
  const cuadre = kit.linea(
    alturas.map((h, i) => v3(-1.8 + i * 0.9, h + 0.05, 0)),
    kit.ml(PAL.verde, 0, { tint: false }),
  );
  g.add(cuadre);

  return (t) => {
    const u = fase(t, 7);
    const alinear = ventana(u, 0.1, 0.42, 0.82, 0.98);
    erp.position.set(0.9 * (1 - alinear), 2.8 * (1 - alinear), -0.4 * (1 - alinear));
    erp.rotation.y = 0.3 * (1 - alinear);
    const cuadra = ventana(u, 0.42, 0.48, 0.78, 0.84);
    op(cuadre.material, cuadra);
    marcas.forEach((m, i) => {
      op(m.material, cuadra * (0.7 + 0.3 * Math.sin(t * 6 + i)));
      m.scale.setScalar(1 + 0.25 * cuadra * Math.sin(t * 4 + i));
    });
    op(etE.material, 0.5 + 0.5 * alinear);
  };
}

/** El cliente ve su carpeta a través de un portal. */
function portal(kit: Kit, g: THREE.Group): Animar {
  const marco = kit.panel(2.6, 3.4, { relleno: 0.06, colorRelleno: PAL.cyan, radio: 0.4 });
  marco.grupo.position.set(0, 2.1, 0);
  g.add(marco.grupo);
  const aro = kit.linea(puntosArco(2.15, 0, Math.PI * 2, 64), kit.mld(PAL.cyan, 0.7, 0.25, 0.15));
  aro.position.set(0, 2.1, 0);
  g.add(aro);
  const cliente = persona(kit.mb(PAL.steel, 0.55), 1.05);
  cliente.position.set(0, 0, -2.0);
  g.add(cliente);

  const carpeta = new THREE.Group();
  carpeta.position.set(0, 1.1, 1.9);
  carpeta.rotation.x = -0.5;
  const tapa = kit.caja(1.6, 0.12, 1.2, PAL.ambar, 0.3, PAL.ambar, 0.9, false);
  carpeta.add(tapa);
  const docs: THREE.Mesh[] = [];
  const geoDoc = geoTarjeta(0.7, 0.9, false);
  const matDoc = Object.assign(kit.mb(0xffffff, 0.9), { vertexColors: true });
  for (let k = 0; k < 3; k++) {
    const d = new THREE.Mesh(geoDoc, matDoc);
    d.rotation.x = -Math.PI / 2;
    d.position.y = 0.1 + k * 0.03;
    carpeta.add(d);
    docs.push(d);
  }
  g.add(carpeta);

  const ojo = v3(0, 1.75, -2.0);
  const haz = kit.flujo(new THREE.LineCurve3(ojo, v3(0, 1.3, 1.8)), kit.lowPower ? 5 : 10, PAL.cyan, 0.22, 0.5);
  g.add(haz.puntos);
  const conoGeo = new THREE.ConeGeometry(0.75, 3.9, 24, 1, true);
  conoGeo.translate(0, -1.95, 0);
  const cono = new THREE.Mesh(conoGeo, kit.mb(PAL.cyan, 0.08, { aditivo: true }));
  cono.position.copy(ojo);
  cono.quaternion.setFromUnitVectors(v3(0, -1, 0), v3(0, 1.3, 1.8).sub(ojo).normalize());
  g.add(cono);

  return (t) => {
    aro.rotation.z = t * 0.3;
    docs.forEach((d, k) => {
      const abre = 0.5 + 0.5 * Math.sin(t * 0.9);
      d.rotation.z = (k - 1) * 0.35 * abre;
      d.position.x = (k - 1) * 0.25 * abre;
    });
    haz.update(t, 0.9);
    op(marco.relleno, 0.05 + 0.04 * Math.sin(t * 2));
    cliente.rotation.y = Math.sin(t * 0.5) * 0.15;
  };
}

/** Expediente jurídico con línea de tiempo: reporte → descargo → decisión. */
function juridica(kit: Kit, g: THREE.Group): Animar {
  const exp = kit.caja(1.5, 2.0, 0.3, PAL.french, 0.5, PAL.steel, 0.9);
  exp.position.set(-2.4, 1.3, 0);
  exp.rotation.y = 0.3;
  g.add(exp);
  const pestana = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.22), kit.mb(PAL.ambar, 0.8));
  pestana.position.set(-0.35, 1.1, 0.16);
  exp.add(pestana);

  const linea = kit.linea([v3(-1.6, 2.6, 0), v3(3.1, 2.6, 0)], kit.ml(PAL.bright, 0.7));
  g.add(linea);
  g.add(kit.linea([v3(-2.4, 2.3, 0), v3(-1.6, 2.6, 0)], kit.mld(PAL.bright, 0.6, 0.12, 0.08)));
  const ETAPAS: Array<{ nombre: string; x: number; color: number }> = [
    { nombre: "Reporte", x: -0.8, color: PAL.ambar },
    { nombre: "Descargo", x: 0.85, color: PAL.cyan },
    { nombre: "Decisión", x: 2.5, color: PAL.verde },
  ];
  const nodos = ETAPAS.map((e) => {
    const nodo = new THREE.Group();
    nodo.position.set(e.x, 2.6, 0);
    const aro = new THREE.Mesh(new THREE.RingGeometry(0.22, 0.3, 32), kit.mb(e.color, 0.9, { aditivo: true }));
    const nucleo = kit.sprite(e.color, 0.9, 0.4);
    nodo.add(aro, nucleo);
    const et = kit.texto(e.nombre, 0.34);
    et.position.set(0, 0.6, 0);
    nodo.add(et);
    const tarjeta = kit.panel(1.05, 0.75, { relleno: 0.45, colorBorde: e.color, tint: false });
    tarjeta.grupo.position.set(0, -0.85, 0);
    const r = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.05), kit.mb(PAL.steel, 0.6));
    r.position.set(0, 0.1, 0.01);
    const r2 = r.clone();
    r2.position.y = -0.08;
    r2.scale.x = 0.7;
    tarjeta.grupo.add(r, r2);
    nodo.add(tarjeta.grupo);
    g.add(nodo);
    return { nodo, nucleo, tarjeta: tarjeta.grupo };
  });
  const pulso = kit.sprite(PAL.ice, 0.9, 1);
  g.add(pulso);

  return (t) => {
    const u = fase(t, 7);
    const x = -1.6 + 4.7 * ramp(u, 0.05, 0.8);
    pulso.position.set(x, 2.6, 0.02);
    op(pulso.material, ventana(u, 0.02, 0.06, 0.82, 0.9));
    nodos.forEach((n, k) => {
      const llega = ramp(x, ETAPAS[k].x - 0.15, ETAPAS[k].x + 0.05) * (1 - ramp(u, 0.92, 1));
      op(n.nucleo.material, 0.3 + 0.7 * llega);
      n.nucleo.scale.setScalar(0.8 + 0.6 * llega + 0.1 * Math.sin(t * 5 + k));
      n.tarjeta.scale.setScalar(Math.max(0.0001, smooth(llega)));
    });
  };
}

// ───────────────────────── Escena ─────────────────────────

const VINETAS: Array<{ clave: string; crear: (kit: Kit, g: THREE.Group) => Animar }> = [
  { clave: "documental", crear: documental },
  { clave: "seleccion", crear: seleccion },
  { clave: "colaboradores", crear: colaboradores },
  { clave: "nomina", crear: nomina },
  { clave: "costos", crear: costos },
  { clave: "portal", crear: portal },
  { clave: "juridica", crear: juridica },
];

export default crearEscena(
  (kit) => {
    const animaciones: Animar[] = [arbol(kit)];
    kit.hotspot("arbol", v3(0, 11.6, 0));
    const encuadres: Record<string, Encuadre> = {
      arbol: { pos: v3(9, 10, 17), target: v3(0, 6.4, 0) },
    };
    VINETAS.forEach((v, i) => {
      const { pos, angulo } = anillo(i, VINETAS.length, 15.5, Math.PI / VINETAS.length);
      const { grupo, encuadre } = montarVineta(kit, v.clave, pos, angulo, { radio: 3.9, hotspotY: 5.6, dist: 9.6, alto: 3.4, mirarY: 2.5 });
      animaciones.push(v.crear(kit, grupo));
      encuadres[v.clave] = encuadre;
    });
    return {
      general: { pos: v3(0, 22, 33), target: v3(0, 3, 0) },
      encuadres,
      update: (t) => animaciones.forEach((a) => a(t)),
    };
  },
  { niebla: 0.012, suelo: { radio: 70, alcance: 0.04 }, polvo: { radio: 26, alto: 14 }, tiempoQuieto: 5.2 },
);
