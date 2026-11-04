/**
 * Escena G · Formación.
 *
 * En el centro, un AULA holográfica (gradas en arco y pantalla) con el teléfono
 * del alumno flotando y los módulos del curso orbitándolo. Alrededor:
 *  diseñador (burbujas de chat que se vuelven bloques de curso), video (una cinta
 *  larga cortada en capítulos), reglas (mapa cargos → cursos obligatorios con
 *  semáforo de cumplimiento), evaluaciones (tarjetas que giran con un reloj) y
 *  certificado (diploma con QR que un teléfono escanea y verifica).
 */
import * as THREE from "three";
import {
  PAL,
  anillo,
  crearEscena,
  fase,
  instanciado,
  montarVineta,
  mulberry32,
  op,
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

/** Teléfono esquemático (marco + pantalla), centrado. */
function telefono(kit: Kit, w: number, h: number) {
  const p = kit.panel(w, h, { radio: w * 0.16, relleno: 0.7, colorRelleno: 0x050f26 });
  const pantalla = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.86, h * 0.84), kit.mb(PAL.indigo, 0.28, { aditivo: true }));
  pantalla.position.z = 0.01;
  const notch = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.3, h * 0.025), kit.mb(PAL.steel, 0.7));
  notch.position.set(0, h * 0.455, 0.02);
  p.grupo.add(pantalla, notch);
  return { ...p, pantalla };
}

// ───────────────────────── Aula (centro) ─────────────────────────

function aula(kit: Kit): Animar {
  const g = new THREE.Group();
  kit.vineta("aula", g);
  kit.scene.add(g);

  // Gradas en arco, abiertas hacia la cámara general (+z)
  const asientos: THREE.Vector3[] = [];
  [3.6, 4.7, 5.8].forEach((r, k) => {
    const y = 0.35 + k * 0.45;
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 48; i++) {
      const a = -1.85 + (i / 48) * 3.7;
      pts.push(v3(Math.sin(a) * r, y, -Math.cos(a) * r));
    }
    g.add(kit.linea(pts, kit.ml(PAL.bright, 0.65)));
    g.add(kit.linea(pts.map((p) => p.clone().setY(y - 0.35)), kit.ml(PAL.french, 0.6)));
    for (let i = 0; i < 9 + k * 2; i++) {
      const a = -1.6 + (i / (8 + k * 2)) * 3.2;
      asientos.push(v3(Math.sin(a) * (r - 0.35), y - 0.15, -Math.cos(a) * (r - 0.35)));
    }
  });
  const sillas = instanciado(new THREE.BoxGeometry(0.34, 0.3, 0.34), kit.mb(PAL.bright, 0.32, { aditivo: true }), asientos.length);
  asientos.forEach((p, i) => {
    tmpO.position.copy(p);
    tmpO.lookAt(0, p.y, 0);
    tmpO.scale.setScalar(1);
    tmpO.updateMatrix();
    sillas.setMatrixAt(i, tmpO.matrix);
  });
  g.add(sillas);

  // Pantalla del aula
  const pantalla = kit.panel(5.4, 3, { relleno: 0.25, radio: 0.2 });
  pantalla.grupo.position.set(0, 4.6, -6.6);
  g.add(pantalla.grupo);
  const play = new THREE.Mesh(new THREE.CircleGeometry(0.45, 3), kit.mb(PAL.ice, 0.75));
  play.position.z = 0.02;
  pantalla.grupo.add(play);
  const progreso = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 0.07).translate(2.3, 0, 0), kit.mb(PAL.cyan, 0.9, { aditivo: true }));
  progreso.position.set(-2.3, -1.2, 0.02);
  pantalla.grupo.add(progreso);

  // Teléfono del alumno con los módulos orbitando
  const tel = telefono(kit, 1.15, 2.2);
  tel.grupo.position.set(0, 3.2, 0);
  g.add(tel.grupo);
  const barras: THREE.Mesh[] = [];
  for (let k = 0; k < 4; k++) {
    const b = new THREE.Mesh(new THREE.PlaneGeometry(0.75, 0.1).translate(0.375, 0, 0), kit.mb(k === 0 ? PAL.verde : PAL.cyan, 0.85, { aditivo: true }));
    b.position.set(-0.375, 0.55 - k * 0.32, 0.03);
    tel.grupo.add(b);
    barras.push(b);
  }
  const orbita = new THREE.Group();
  orbita.position.set(0, 3.2, 0);
  orbita.rotation.x = 0.35;
  g.add(orbita);
  const modulos: THREE.Group[] = [];
  const colores = [PAL.cyan, PAL.verde, PAL.ambar, PAL.bright, 0xb48cff, PAL.cyan];
  for (let k = 0; k < 6; k++) {
    const m = new THREE.Group();
    m.add(kit.caja(0.55, 0.55, 0.55, colores[k], 0.25, colores[k], 0.95, false));
    const aro = kit.linea(puntosArco(0.55, 0, Math.PI * 2 * ((k + 1) / 6), 30), kit.ml(colores[k], 0.9, { tint: false }));
    m.add(aro);
    orbita.add(m);
    modulos.push(m);
  }
  orbita.add(kit.linea(puntosArco(2.4, 0, Math.PI * 2, 72).map((p) => v3(p.x, 0, p.y)), kit.mld(PAL.bright, 0.4, 0.2, 0.15)));
  const halo = kit.sprite(PAL.indigo, 6, 0.4);
  halo.position.set(0, 3.2, -0.2);
  g.add(halo);

  return (t) => {
    modulos.forEach((m, k) => {
      const a = t * 0.35 + (k / 6) * Math.PI * 2;
      m.position.set(Math.cos(a) * 2.4, Math.sin(t * 1.1 + k) * 0.15, Math.sin(a) * 2.4);
      m.rotation.set(t * 0.4 + k, t * 0.6, 0);
      m.children[1].lookAt(kit.scene.position);
    });
    tel.grupo.rotation.y = Math.sin(t * 0.5) * 0.25;
    tel.grupo.position.y = 3.2 + Math.sin(t * 0.9) * 0.12;
    barras.forEach((b, k) => (b.scale.x = Math.max(0.0001, k === 0 ? 1 : ramp(fase(t, 6, k * 1.3), 0, 0.8))));
    progreso.scale.x = Math.max(0.0001, fase(t, 12));
    op(tel.pantalla.material, 0.22 + 0.08 * Math.sin(t * 2));
  };
}

// ───────────────────────── Viñetas ─────────────────────────

/** Chat con la IA que se convierte en bloques de curso. */
function disenador(kit: Kit, g: THREE.Group): Animar {
  const N = 6;
  const burbujas = Array.from({ length: N }, (_, k) => {
    const ia = k % 2 === 1;
    const p = kit.panel(1.6, 0.42, { radio: 0.2, relleno: ia ? 0.5 : 0.35, colorRelleno: ia ? PAL.indigo : PAL.french, colorBorde: ia ? PAL.cyan : PAL.steel, tint: false });
    const r = new THREE.Mesh(new THREE.PlaneGeometry(1.05, 0.06), kit.mb(PAL.ice, 0.7));
    r.position.z = 0.01;
    p.grupo.add(r);
    g.add(p.grupo);
    return { ...p, ia, base: v3(-1.6 + (ia ? 0.45 : -0.3), 0.8 + k * 0.6, 0) };
  });
  const COLORES = [PAL.cyan, PAL.verde, PAL.ambar];
  const ladrillos = COLORES.map((c, j) => {
    const b = kit.caja(1.7, 0.42, 0.9, c, 0.3, c, 0.95, false);
    b.position.set(2.0, 0.26 + j * 0.48, 0);
    g.add(b);
    return b;
  });
  const chispa = kit.sprite(PAL.cyan, 1.2, 0);
  g.add(chispa);
  const p = new THREE.Vector3();

  return (t) => {
    const u = fase(t, 10);
    const reinicio = 1 - ramp(u, 0.93, 1);
    let iaIdx = 0;
    let chispaOp = 0;
    burbujas.forEach((b, k) => {
      const aparece = ramp(u, k * 0.07, k * 0.07 + 0.05) * reinicio;
      if (b.ia) {
        const j = iaIdx++;
        const sale = 0.5 + j * 0.12;
        const vuela = ramp(u, sale, sale + 0.1);
        p.copy(b.base).lerp(ladrillos[j].position, smooth(vuela));
        p.y += Math.sin(vuela * Math.PI) * 0.8;
        b.grupo.position.copy(p);
        b.grupo.scale.setScalar(Math.max(0.0001, aparece * (1 - vuela)));
        const llega = ramp(u, sale + 0.08, sale + 0.11) * reinicio;
        ladrillos[j].scale.set(Math.max(0.0001, llega), Math.max(0.0001, llega), Math.max(0.0001, llega));
        if (vuela > 0 && vuela < 1) {
          chispa.position.copy(p);
          chispaOp = 1;
        }
      } else {
        b.grupo.position.copy(b.base);
        b.grupo.scale.setScalar(Math.max(0.0001, aparece * (1 - ramp(u, 0.85, 0.93))));
      }
    });
    op(chispa.material, chispaOp);
  };
}

/** Un video largo cortado por temas. */
function video(kit: Kit, g: THREE.Group): Animar {
  const N = 5;
  const W = 1.3;
  const colores = [PAL.cyan, PAL.verde, PAL.ambar, PAL.bright, 0xb48cff];
  const segmentos = colores.map((c, k) => {
    const s = new THREE.Group();
    const cuerpo = new THREE.Mesh(new THREE.PlaneGeometry(W, 0.9), kit.mb(PAL.french, 0.55));
    const borde = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(W, 0.9)), kit.ml(PAL.bright, 0.8));
    const perf: Array<[number, number, number, number]> = [];
    for (let i = 0; i < 5; i++) {
      perf.push([-W / 2 + 0.08 + i * 0.26, 0.33, 0.1, 0.07], [-W / 2 + 0.08 + i * 0.26, -0.4, 0.1, 0.07]);
    }
    const perfGeo = new THREE.BufferGeometry();
    const pos: number[] = [];
    for (const [x, y, w, h] of perf) pos.push(x, y, 0.01, x + w, y, 0.01, x + w, y + h, 0.01, x, y, 0.01, x + w, y + h, 0.01, x, y + h, 0.01);
    perfGeo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    const perfM = new THREE.Mesh(perfGeo, kit.mb(PAL.ice, 0.35));
    const pestana = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.2), kit.mb(c, 0.9, { aditivo: true }));
    pestana.position.set(-W / 2 + 0.35, 0.62, 0.01);
    s.add(cuerpo, borde, perfM, pestana);
    g.add(s);
    return { s, pestana, x: -((N - 1) * W) / 2 + k * W };
  });
  const cabezal = new THREE.Mesh(new THREE.PlaneGeometry(0.04, 1.4), kit.mb(PAL.ice, 0.9, { aditivo: true }));
  const cabezalGlow = kit.sprite(PAL.cyan, 1.0, 0.8);
  g.add(cabezal, cabezalGlow);
  const tijera = kit.sprite(PAL.ambar, 1.2, 0);
  g.add(tijera);

  return (t) => {
    const u = fase(t, 9);
    const barrido = ramp(u, 0.02, 0.4);
    const x0 = -(N * W) / 2;
    const cx = x0 + barrido * N * W;
    cabezal.position.set(cx, 2.2, 0.03);
    cabezalGlow.position.set(cx, 2.95, 0.03);
    op(cabezal.material, ventana(u, 0.01, 0.04, 0.4, 0.44));
    op(cabezalGlow.material, ventana(u, 0.01, 0.04, 0.4, 0.44));
    // destello de tijera en cada corte cuando el cabezal lo cruza
    let corte = 0;
    for (let k = 1; k < N; k++) {
      const xc = x0 + k * W;
      corte = Math.max(corte, 1 - Math.min(1, Math.abs(cx - xc) / 0.25));
      if (Math.abs(cx - xc) < 0.25) tijera.position.set(xc, 2.2, 0.06);
    }
    op(tijera.material, corte * (barrido < 1 ? 1 : 0));
    const separa = ventana(u, 0.45, 0.6, 0.86, 0.97);
    segmentos.forEach((sg, k) => {
      sg.s.position.set(sg.x + (k - (N - 1) / 2) * 0.35 * separa, 2.2 + k * 0.32 * separa, 0.4 * separa * Math.sin(k));
      sg.s.rotation.y = -0.15 * separa;
      sg.pestana.scale.setScalar(Math.max(0.0001, separa));
    });
  };
}

/** Mapa de reglas: cargos → cursos obligatorios, con semáforo de cumplimiento. */
function reglas(kit: Kit, g: THREE.Group): Animar {
  const roles = [0, 1, 2, 3].map((k) => v3(-2.2, 1.0 + k * 1.05, 0));
  const cursos = [0, 1, 2, 3, 4].map((k) => v3(2.2, 0.8 + k * 0.85, 0));
  const reglas: Array<[number, number]> = [
    [0, 0], [0, 1], [1, 1], [1, 2], [2, 0], [2, 3], [3, 3], [3, 4], [1, 4],
  ];
  const arcos = roles.map((r) => {
    const nodo = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.OctahedronGeometry(0.3)), kit.ml(PAL.ice, 0.95));
    nodo.position.copy(r);
    g.add(nodo);
    const arco = kit.linea(puntosArco(0.5, Math.PI / 2, Math.PI / 2 - Math.PI * 2, 64), kit.ml(PAL.verde, 0.95, { tint: false }));
    arco.position.copy(r);
    g.add(arco);
    g.add(kit.linea(puntosArco(0.5, 0, Math.PI * 2, 64), kit.ml(PAL.french, 0.6)).translateX(r.x).translateY(r.y));
    return { nodo, arco };
  });
  const nodosCurso = cursos.map((c) => {
    const n = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), kit.mb(PAL.verde, 0.55));
    n.position.copy(c);
    g.add(n);
    const e = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(0.5, 0.5, 0.5)), kit.ml(PAL.ice, 0.8));
    e.position.copy(c);
    g.add(e);
    return n;
  });
  const flujos = reglas.map(([r, c], i) => {
    const a = roles[r];
    const b = cursos[c];
    const mid = a.clone().lerp(b, 0.5).add(v3(0, 0, 0.8));
    const curva = new THREE.QuadraticBezierCurve3(a, mid, b);
    g.add(kit.linea(curva.getPoints(24), kit.ml(PAL.bright, 0.35)));
    const f = kit.flujo(curva, kit.lowPower ? 2 : 4, PAL.cyan, 0.2, 0.3 + (i % 3) * 0.05);
    g.add(f.puntos);
    return f;
  });
  const semaforo = [new THREE.Color(PAL.rojo), new THREE.Color(PAL.ambar), new THREE.Color(PAL.verde)];

  return (t) => {
    nodosCurso.forEach((n, k) => {
      // cada curso pasa de vencido → por vencer → al día, desfasado
      const u = fase(t, 9, k * 1.9);
      const nivel = u < 0.25 ? 0 : u < 0.5 ? 1 : 2;
      tmpC.copy(semaforo[nivel]);
      n.material.color.copy(tmpC);
      n.rotation.y = t * 0.4 + k;
    });
    arcos.forEach((a, k) => {
      const pct = 0.45 + 0.5 * (0.5 + 0.5 * Math.sin(t * 0.5 + k * 1.4));
      a.arco.geometry.setDrawRange(0, Math.floor(65 * pct));
      a.arco.material.color.copy(pct > 0.8 ? semaforo[2] : pct > 0.6 ? semaforo[1] : semaforo[0]);
      a.nodo.rotation.y = t * 0.6 + k;
    });
    flujos.forEach((f) => f.update(t, 0.85));
  };
}

/** Tarjetas de preguntas que giran contra un reloj. */
function evaluaciones(kit: Kit, g: THREE.Group): Animar {
  const resultados = [true, true, false];
  const tarjetas = resultados.map((bien, k) => {
    const piv = new THREE.Group();
    piv.position.set(-1.6 + k * 1.6, 1.6, 0);
    const p = kit.panel(1.3, 1.75, { relleno: 0.55, radio: 0.12 });
    piv.add(p.grupo);
    const preg = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.08), kit.mb(PAL.ice, 0.8));
    preg.position.set(0, 0.55, 0.01);
    p.grupo.add(preg);
    for (let o = 0; o < 3; o++) {
      const opc = new THREE.Mesh(new THREE.PlaneGeometry(0.85, 0.2), kit.mb(o === 1 ? PAL.cyan : PAL.french, 0.6));
      opc.position.set(0, 0.15 - o * 0.3, 0.01);
      p.grupo.add(opc);
    }
    // reverso: resultado
    const reverso = new THREE.Group();
    reverso.position.z = -0.02;
    reverso.rotation.y = Math.PI;
    const col = bien ? PAL.verde : PAL.rojo;
    reverso.add(new THREE.Mesh(new THREE.CircleGeometry(0.42, 32), kit.mb(col, 0.25, { aditivo: true })));
    reverso.add(
      bien
        ? kit.linea([v3(-0.2, 0, 0.01), v3(-0.05, -0.16, 0.01), v3(0.24, 0.2, 0.01)], kit.ml(col, 1, { tint: false }))
        : new THREE.LineSegments(geoX(0.18), kit.ml(col, 1, { tint: false })),
    );
    piv.add(reverso);
    g.add(piv);
    return piv;
  });
  const reloj = new THREE.Group();
  reloj.position.set(0, 3.7, 0);
  reloj.add(kit.linea(puntosArco(0.55, 0, Math.PI * 2, 64), kit.ml(PAL.french, 0.7)));
  const aguja = kit.linea(puntosArco(0.55, Math.PI / 2, Math.PI / 2 - Math.PI * 2, 64), kit.ml(PAL.cyan, 1, { tint: false }));
  reloj.add(aguja);
  const centro = kit.sprite(PAL.cyan, 0.7, 0.8);
  reloj.add(centro);
  g.add(reloj);
  const puntaje = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 0.12).translate(1.8, 0, 0), kit.mb(PAL.verde, 0.9, { aditivo: true }));
  puntaje.position.set(-1.8, 0.35, 0);
  g.add(puntaje);
  const colReloj = [new THREE.Color(PAL.cyan), new THREE.Color(PAL.ambar), new THREE.Color(PAL.rojo)];

  return (t) => {
    const u = fase(t, 9);
    tarjetas.forEach((piv, k) => {
      const a = 0.15 + k * 0.2;
      const giro = smooth(ramp(u, a, a + 0.08)) * (1 - ramp(u, 0.9, 0.98));
      piv.rotation.y = giro * Math.PI;
      piv.position.y = 1.6 + Math.sin(giro * Math.PI) * 0.25;
    });
    const resto = 1 - ramp(u, 0.02, 0.85);
    aguja.geometry.setDrawRange(0, Math.max(2, Math.floor(65 * resto)));
    aguja.material.color.copy(resto > 0.5 ? colReloj[0] : resto > 0.2 ? colReloj[1] : colReloj[2]);
    centro.scale.setScalar(0.6 + 0.15 * Math.sin(t * 6));
    const correctas = resultados.filter((b, k) => b && u > 0.23 + k * 0.2).length;
    puntaje.scale.x = Math.max(0.0001, (correctas / 3) * (1 - ramp(u, 0.92, 0.98)));
  };
}

function geoX(s: number) {
  return new THREE.BufferGeometry().setFromPoints([v3(-s, -s, 0.01), v3(s, s, 0.01), v3(-s, s, 0.01), v3(s, -s, 0.01)]);
}

/** Diploma con QR: un teléfono lo escanea y lo verifica. */
function certificado(kit: Kit, g: THREE.Group): Animar {
  const diploma = kit.panel(3.6, 2.5, { relleno: 0.45, radio: 0.06, colorBorde: PAL.ambar });
  diploma.grupo.position.set(-0.5, 2.1, 0);
  g.add(diploma.grupo);
  const interior = kit.panel(3.3, 2.2, { relleno: 0, radio: 0.04, colorBorde: PAL.ambar, opBorde: 0.5 });
  interior.grupo.position.z = 0.01;
  diploma.grupo.add(interior.grupo);
  const titulo = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 0.14), kit.mb(PAL.ice, 0.85));
  titulo.position.set(-0.45, 0.7, 0.02);
  const nombre = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.09), kit.mb(PAL.ambar, 0.8));
  nombre.position.set(-0.6, 0.35, 0.02);
  diploma.grupo.add(titulo, nombre);
  const sello = new THREE.Group();
  sello.position.set(-1.1, -0.55, 0.02);
  sello.add(new THREE.Mesh(new THREE.RingGeometry(0.28, 0.36, 12), kit.mb(PAL.ambar, 0.9, { aditivo: true })));
  sello.add(new THREE.Mesh(new THREE.CircleGeometry(0.2, 6), kit.mb(PAL.ambar, 0.5)));
  diploma.grupo.add(sello);

  // QR 17×17
  const Q = 17;
  const rand = mulberry32(99);
  const celdas: Array<[number, number]> = [];
  for (let y = 0; y < Q; y++) {
    for (let x = 0; x < Q; x++) {
      const esq = (x < 5 && y < 5) || (x > Q - 6 && y < 5) || (x < 5 && y > Q - 6);
      const borde = esq && (x === 0 || y === 0 || x === 4 || y === 4 || x === Q - 1 || x === Q - 5 || y === Q - 1 || y === Q - 5);
      const centroEsq = esq && ((x >= 1 && x <= 3 && y >= 1 && y <= 3) || (x >= Q - 4 && x <= Q - 2 && y >= 1 && y <= 3) || (x >= 1 && x <= 3 && y >= Q - 4 && y <= Q - 2));
      const nucleo = esq && !borde && !centroEsq;
      if (borde || (centroEsq && !(x === 1 || x === 3 || y === 1 || y === 3 || x === Q - 4 || x === Q - 2 || y === Q - 4 || y === Q - 2)) || (!esq && rand() < 0.48)) celdas.push([x, y]);
      else if (nucleo) continue;
    }
  }
  const tam = 1.3 / Q;
  const qr = instanciado(new THREE.PlaneGeometry(tam * 0.92, tam * 0.92), kit.mb(0xffffff, 0.95), celdas.length);
  qr.position.set(0.9, -0.15, 0.03);
  celdas.forEach(([x, y], i) => {
    tmpO.position.set((x - Q / 2) * tam, (Q / 2 - y) * tam, 0);
    tmpO.rotation.set(0, 0, 0);
    tmpO.scale.setScalar(1);
    tmpO.updateMatrix();
    qr.setMatrixAt(i, tmpO.matrix);
  });
  qr.instanceMatrix.needsUpdate = true;
  diploma.grupo.add(qr);
  const laser = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.04), kit.mb(PAL.rojo, 0.9, { aditivo: true }));
  laser.position.set(0.9, 0, 0.05);
  diploma.grupo.add(laser);
  const okQR = new THREE.Mesh(new THREE.RingGeometry(0.8, 0.88, 48), kit.mb(PAL.verde, 0, { aditivo: true }));
  okQR.position.set(0.9, -0.15, 0.06);
  diploma.grupo.add(okQR);

  const tel = telefono(kit, 0.85, 1.6);
  tel.grupo.position.set(2.2, 1.3, 1.6);
  tel.grupo.rotation.set(-0.15, -0.75, 0);
  g.add(tel.grupo);
  const check = kit.linea([v3(-0.18, 0, 0.03), v3(-0.04, -0.15, 0.03), v3(0.22, 0.18, 0.03)], kit.ml(PAL.verde, 0, { tint: false }));
  tel.grupo.add(check);
  const conoGeo = new THREE.ConeGeometry(0.75, 2.4, 4, 1, true);
  conoGeo.translate(0, -1.2, 0);
  const cono = new THREE.Mesh(conoGeo, kit.mb(PAL.rojo, 0.08, { aditivo: true }));
  const desde = v3(2.2, 1.3, 1.6);
  cono.position.copy(desde);
  cono.quaternion.setFromUnitVectors(v3(0, -1, 0), v3(0.4, 1.95, 0).sub(desde).normalize());
  g.add(cono);
  const colQR = new THREE.Color(PAL.ice);
  const colOk = new THREE.Color(PAL.verde);

  return (t) => {
    const u = fase(t, 6);
    const escanea = ventana(u, 0.08, 0.12, 0.5, 0.55);
    laser.position.y = -0.15 + Math.sin(t * 5) * 0.62;
    op(laser.material, escanea * 0.9);
    op(cono.material, escanea * 0.09);
    const verificado = ventana(u, 0.55, 0.6, 0.92, 0.98);
    op(okQR.material, verificado * (1 - ramp(u, 0.55, 0.85) * 0.5));
    okQR.scale.setScalar(1 + ramp(u, 0.55, 0.8) * 0.35);
    op(check.material, verificado);
    tmpC.copy(colQR).lerp(colOk, verificado * 0.6);
    (qr.material as THREE.MeshBasicMaterial).color.copy(tmpC);
    tel.grupo.position.y = 1.3 + Math.sin(t * 1.2) * 0.06;
  };
}

// ───────────────────────── Escena ─────────────────────────

const VINETAS: Array<{ clave: string; crear: (kit: Kit, g: THREE.Group) => Animar }> = [
  { clave: "disenador", crear: disenador },
  { clave: "video", crear: video },
  { clave: "reglas", crear: reglas },
  { clave: "evaluaciones", crear: evaluaciones },
  { clave: "certificado", crear: certificado },
];

export default crearEscena(
  (kit) => {
    const animaciones: Animar[] = [aula(kit)];
    kit.hotspot("aula", v3(0, 5.9, 0));
    const encuadres: Record<string, Encuadre> = {
      aula: { pos: v3(2.5, 5.5, 10), target: v3(0, 3.1, 0) },
    };
    VINETAS.forEach((v, i) => {
      const { pos, angulo } = anillo(i, VINETAS.length, 14.5, Math.PI / VINETAS.length);
      const { grupo, encuadre } = montarVineta(kit, v.clave, pos, angulo, { radio: 3.6, hotspotY: 5.0, dist: 9.5, alto: 3.6, mirarY: 2.1 });
      animaciones.push(v.crear(kit, grupo));
      encuadres[v.clave] = encuadre;
    });
    return {
      general: { pos: v3(0, 22, 33), target: v3(0, 2.5, 0) },
      encuadres,
      update: (t) => animaciones.forEach((a) => a(t)),
    };
  },
  { niebla: 0.013, suelo: { radio: 70, alcance: 0.045 }, polvo: { radio: 24, alto: 12 }, tiempoQuieto: 4.3 },
);
