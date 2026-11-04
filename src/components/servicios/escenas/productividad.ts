/**
 * Escena I · Productividad e IA.
 *
 * En el centro, una red neuronal (grafo de nodos con pulsos) y su núcleo de IA,
 * que responde con una tarjeta y CITA LA FUENTE (una tarjeta de documento
 * enlazada al nodo de donde salió). Alrededor: tareas (tablero kanban con anillos
 * de vencimiento), reuniones (onda de voz → transcripción con marcas de tiempo),
 * tickets (un ticket clavado en un elemento de la interfaz), formularios (piezas que
 * se arrastran y encajan) y automatizaciones (si pasa esto → haz esto → si nadie
 * contesta → escala).
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
const CENTRO_IA = v3(0, 5.2, 0);

// ───────────────────────── Red neuronal + núcleo de IA (centro) ─────────────────────────

function red(kit: Kit): Animar {
  const g = new THREE.Group();
  kit.vineta("ia", g);
  kit.scene.add(g);
  const rand = mulberry32(17);
  const N = kit.lowPower ? 60 : 110;
  const nodos: THREE.Vector3[] = [];
  for (let i = 0; i < N; i++) {
    const d = v3(rand() - 0.5, rand() - 0.5, rand() - 0.5).normalize();
    const r = 2.6 + rand() * 2.6;
    nodos.push(d.multiplyScalar(r).add(CENTRO_IA));
  }
  const aristas: Array<[number, number]> = [];
  for (let i = 0; i < N; i++) {
    const cerca = nodos
      .map((p, j) => ({ j, d: p.distanceTo(nodos[i]) }))
      .filter((x) => x.j !== i)
      .sort((a, b) => a.d - b.d)
      .slice(0, 3);
    for (const c of cerca) if (c.j > i) aristas.push([i, c.j]);
  }
  const segs: THREE.Vector3[] = [];
  aristas.forEach(([a, b]) => segs.push(nodos[a], nodos[b]));
  g.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(segs), kit.ml(PAL.bright, 0.28)));
  const geoN = new THREE.BufferGeometry().setFromPoints(nodos);
  const matN = new THREE.PointsMaterial({ color: PAL.ice, size: 0.32, map: kit.glow, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  matN.userData.base = 0.9;
  const puntos = new THREE.Points(geoN, matN);
  g.add(puntos);

  // Pulsos viajando por las aristas
  const P = kit.lowPower ? 18 : 36;
  const pulsoPos = new Float32Array(P * 3);
  const geoP = new THREE.BufferGeometry();
  geoP.setAttribute("position", new THREE.BufferAttribute(pulsoPos, 3));
  const matP = new THREE.PointsMaterial({ color: PAL.cyan, size: 0.5, map: kit.glow, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  matP.userData.base = 1;
  const pulsos = new THREE.Points(geoP, matP);
  pulsos.frustumCulled = false;
  g.add(pulsos);
  const rutas = Array.from({ length: P }, () => aristas[Math.floor(rand() * aristas.length)]);

  // Núcleo
  const nucleo = new THREE.Group();
  nucleo.position.copy(CENTRO_IA);
  nucleo.add(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.2, 1)), kit.ml(PAL.bright, 0.95)));
  const interior = new THREE.Mesh(new THREE.IcosahedronGeometry(0.75, 0), kit.mb(PAL.indigo, 0.6, { aditivo: true }));
  nucleo.add(interior);
  const halo = kit.sprite(PAL.indigo, 6.5, 0.6);
  nucleo.add(halo);
  g.add(nucleo);

  // Pregunta que llega, respuesta y fuente citada
  const pregunta = kit.flujo(new THREE.QuadraticBezierCurve3(v3(-7, 8.5, 3), v3(-4, 9, 2), CENTRO_IA.clone()), kit.lowPower ? 5 : 10, PAL.ice, 0.3, 0.7);
  g.add(pregunta.puntos);
  const respuesta = kit.panel(3.0, 1.7, { relleno: 0.6, radio: 0.16 });
  respuesta.grupo.position.set(-0.6, 5.0, 3.6);
  g.add(respuesta.grupo);
  const renglones = [0.5, 0.2, -0.1, -0.4].map((y, k) => {
    const r = new THREE.Mesh(new THREE.PlaneGeometry(k === 3 ? 1.4 : 2.4, 0.09).translate(k === 3 ? 0.7 : 1.2, 0, 0), kit.mb(PAL.ice, 0.75));
    r.position.set(-1.25, y, 0.01);
    respuesta.grupo.add(r);
    return r;
  });
  const fuente = kit.panel(1.0, 1.2, { relleno: 0.55, colorBorde: PAL.ambar, tint: false, radio: 0.08 });
  const esquina = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.06), kit.mb(PAL.ambar, 0.8));
  esquina.position.set(0, 0.3, 0.01);
  const r2 = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.04), kit.mb(PAL.steel, 0.6));
  r2.position.set(0, 0.1, 0.01);
  const r3 = r2.clone();
  r3.position.y = -0.05;
  fuente.grupo.add(esquina, r2, r3);
  fuente.grupo.position.set(1.9, 4.2, 3.9);
  g.add(fuente.grupo);
  // El nodo de la red de donde sale la cita
  let iFuente = 0;
  let mejor = -Infinity;
  nodos.forEach((p, i) => {
    const s = p.x - p.z * 0.3 - Math.abs(p.y - 6.5);
    if (s > mejor) {
      mejor = s;
      iFuente = i;
    }
  });
  const nodoFuente = nodos[iFuente];
  const cita = kit.linea([v3(1.9, 4.8, 3.9), nodoFuente], kit.mld(PAL.ambar, 0.9, 0.15, 0.1));
  g.add(cita);
  const marcaFuente = kit.sprite(PAL.ambar, 1.6, 0);
  marcaFuente.position.copy(nodoFuente);
  g.add(marcaFuente);
  const tmp = new THREE.Vector3();

  return (t) => {
    const foco = kit.peso("ia");
    for (let i = 0; i < P; i++) {
      const [a, b] = rutas[i];
      const u = fase(t, 1.6 + (i % 5) * 0.3, i * 0.37);
      tmp.copy(nodos[a]).lerp(nodos[b], u);
      pulsoPos[i * 3] = tmp.x;
      pulsoPos[i * 3 + 1] = tmp.y;
      pulsoPos[i * 3 + 2] = tmp.z;
      if (u > 0.97) rutas[i] = aristas[(a * 7 + b + i) % aristas.length];
    }
    (geoP.attributes.position as THREE.BufferAttribute).needsUpdate = true;

    const u = fase(t, 9);
    pregunta.update(t, ventana(u, 0.02, 0.06, 0.2, 0.25));
    const piensa = ventana(u, 0.15, 0.25, 0.35, 0.45);
    nucleo.rotation.set(t * (0.2 + piensa * 1.5), t * (0.3 + piensa * 2), 0);
    interior.scale.setScalar(1 + piensa * 0.25 * Math.sin(t * 12));
    op(halo.material, 0.45 + 0.35 * piensa + 0.2 * foco);
    const fin = 1 - ramp(u, 0.92, 1);
    respuesta.grupo.scale.setScalar(Math.max(0.0001, smooth(ramp(u, 0.35, 0.45)) * fin));
    renglones.forEach((r, k) => (r.scale.x = Math.max(0.0001, ramp(u, 0.42 + k * 0.05, 0.48 + k * 0.05))));
    const cite = smooth(ramp(u, 0.62, 0.72)) * fin;
    fuente.grupo.scale.setScalar(Math.max(0.0001, cite));
    cita.geometry.setDrawRange(0, cite > 0.5 ? 2 : 0);
    op(marcaFuente.material, cite * (0.7 + 0.3 * Math.sin(t * 6)));
  };
}

// ───────────────────────── Viñetas ─────────────────────────

/** Tablero de tareas con anillos de vencimiento. */
function tareas(kit: Kit, g: THREE.Group): Animar {
  const COLS = [
    { x: -1.65, color: PAL.steel },
    { x: 0, color: PAL.cyan },
    { x: 1.65, color: PAL.verde },
  ];
  COLS.forEach((c) => {
    const p = kit.panel(1.5, 3.4, { relleno: 0.25, radio: 0.1 });
    p.grupo.position.set(c.x, 2.1, -0.05);
    g.add(p.grupo);
    const cab = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.12), kit.mb(c.color, 0.85, { aditivo: true }));
    cab.position.set(c.x, 3.55, 0);
    g.add(cab);
  });
  const N = 5;
  const tarjetas = Array.from({ length: N }, () => {
    const p = kit.panel(1.25, 0.52, { relleno: 0.6, radio: 0.08, tint: false });
    const r = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.06), kit.mb(PAL.ice, 0.7));
    r.position.set(-0.18, 0.08, 0.01);
    const r2 = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.05), kit.mb(PAL.steel, 0.6));
    r2.position.set(-0.28, -0.08, 0.01);
    const aro = kit.linea(puntosArco(0.16, Math.PI / 2, Math.PI / 2 - Math.PI * 2, 32), kit.ml(PAL.verde, 0.95, { tint: false }));
    aro.position.set(0.4, 0, 0.02);
    p.grupo.add(r, r2, aro);
    g.add(p.grupo);
    return { grupo: p.grupo, aro };
  });
  const sem = [new THREE.Color(PAL.verde), new THREE.Color(PAL.ambar), new THREE.Color(PAL.rojo)];

  return (t) => {
    tarjetas.forEach((c, i) => {
      const u = fase(t, 15, i * 3);
      const pasos = u * 3;
      const col = Math.min(2, Math.floor(pasos));
      const l = pasos - col;
      const mueve = col < 2 ? smooth(ramp(l, 0.82, 1)) : 0;
      const x = COLS[col].x + (col < 2 ? (COLS[col + 1].x - COLS[col].x) * mueve : 0);
      const slot = (i + col) % 4;
      c.grupo.position.set(x, 3.0 - slot * 0.68 + Math.sin(mueve * Math.PI) * 0.35, 0.05 + Math.sin(mueve * Math.PI) * 0.3);
      c.grupo.scale.setScalar(Math.max(0.0001, col === 2 ? 1 - ramp(l, 0.85, 1) : col === 0 ? ramp(l, 0, 0.08) : 1));
      const resta = col === 2 ? 1 : 1 - l;
      c.aro.geometry.setDrawRange(0, Math.max(2, Math.floor(33 * resta)));
      c.aro.material.color.copy(col === 2 ? sem[0] : resta > 0.6 ? sem[0] : resta > 0.3 ? sem[1] : sem[2]);
    });
  };
}

/** Onda de voz → transcripción con marcas de tiempo. */
function reuniones(kit: Kit, g: THREE.Group): Animar {
  const B = kit.lowPower ? 24 : 40;
  const onda = instanciado(new THREE.BoxGeometry(0.07, 1, 0.07), kit.mb(PAL.cyan, 0.9, { aditivo: true }), B);
  g.add(onda);
  const panel = kit.panel(2.6, 3.0, { relleno: 0.45, radio: 0.12 });
  panel.grupo.position.set(1.5, 2.3, 0);
  g.add(panel.grupo);
  const L = 6;
  const lineas = Array.from({ length: L }, (_, k) => {
    const y = 1.15 - k * 0.42;
    const marca = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 0.12), kit.mb(PAL.ambar, 0.9, { aditivo: true }));
    marca.position.set(-0.95, y, 0.01);
    const w = 1.4 + ((k * 37) % 5) * 0.06;
    const texto = new THREE.Mesh(new THREE.PlaneGeometry(w, 0.08).translate(w / 2, 0, 0), kit.mb(PAL.ice, 0.75));
    texto.position.set(-0.7, y, 0.01);
    panel.grupo.add(marca, texto);
    return { marca, texto };
  });
  const micro = new THREE.Group();
  micro.position.set(-2.9, 2.4, 0);
  micro.add(new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 0.3, 4, 12), kit.mb(PAL.steel, 0.6)));
  micro.add(kit.linea(puntosArco(0.3, Math.PI, Math.PI * 2, 20).map((p) => v3(p.x, p.y - 0.05, 0)), kit.ml(PAL.steel, 0.8)));
  g.add(micro);
  const f = kit.flujo(new THREE.QuadraticBezierCurve3(v3(-0.2, 2.4, 0), v3(0.0, 3.2, 0.3), v3(0.3, 3.1, 0)), kit.lowPower ? 4 : 8, PAL.cyan, 0.2, 0.7);
  g.add(f.puntos);

  return (t) => {
    const u = fase(t, 9);
    const habla = ventana(u, 0.0, 0.05, 0.8, 0.9);
    for (let i = 0; i < B; i++) {
      const x = -2.5 + (i / (B - 1)) * 2.3;
      const amp = 0.1 + habla * (0.35 + 0.65 * Math.abs(Math.sin(t * 6 + i * 0.55) * Math.sin(t * 2.3 + i * 0.21)));
      tmpO.position.set(x, 2.4, 0);
      tmpO.rotation.set(0, 0, 0);
      tmpO.scale.set(1, amp * 1.6, 1);
      tmpO.updateMatrix();
      onda.setMatrixAt(i, tmpO.matrix);
    }
    onda.instanceMatrix.needsUpdate = true;
    f.update(t, habla);
    lineas.forEach((l, k) => {
      const a = 0.08 + k * 0.12;
      const p = ramp(u, a, a + 0.1) * (1 - ramp(u, 0.92, 1));
      l.texto.scale.x = Math.max(0.0001, p);
      l.marca.scale.setScalar(Math.max(0.0001, ramp(u, a - 0.02, a) * (1 - ramp(u, 0.92, 1))));
    });
  };
}

/** Un ticket que se clava en el elemento exacto de la interfaz. */
function tickets(kit: Kit, g: THREE.Group): Animar {
  const ui = kit.panel(3.8, 2.6, { relleno: 0.4, radio: 0.1 });
  ui.grupo.position.set(-0.3, 2.3, 0);
  g.add(ui.grupo);
  const barra = new THREE.Mesh(new THREE.PlaneGeometry(3.8, 0.28), kit.mb(PAL.french, 0.7));
  barra.position.set(0, 1.16, 0.005);
  ui.grupo.add(barra);
  [0, 1, 2].forEach((k) => {
    const p = new THREE.Mesh(new THREE.CircleGeometry(0.06, 12), kit.mb([PAL.rojo, PAL.ambar, PAL.verde][k], 0.8));
    p.position.set(-1.7 + k * 0.2, 1.16, 0.01);
    ui.grupo.add(p);
  });
  const lateral = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 2.1), kit.mb(PAL.imperial, 0.7));
  lateral.position.set(-1.45, -0.13, 0.005);
  ui.grupo.add(lateral);
  const bloques = [
    v3(-0.35, 0.55, 0),
    v3(0.95, 0.55, 0),
    v3(-0.35, -0.55, 0),
    v3(0.95, -0.55, 0),
  ].map((p) => {
    const b = kit.linea(puntosRect(1.1, 0.85, 0.06), kit.ml(PAL.bright, 0.7));
    b.position.copy(p).setZ(0.01);
    ui.grupo.add(b);
    const f = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.85), kit.mb(PAL.indigo, 0.18));
    f.position.copy(p).setZ(0.008);
    ui.grupo.add(f);
    return { pos: p, fondo: f };
  });
  const ticket = new THREE.Group();
  const forma = new THREE.Shape();
  forma.moveTo(-0.5, -0.28);
  forma.lineTo(0.35, -0.28);
  forma.lineTo(0.55, 0);
  forma.lineTo(0.35, 0.28);
  forma.lineTo(-0.5, 0.28);
  forma.lineTo(-0.5, -0.28);
  const matTicket = kit.mb(PAL.ambar, 0.75);
  ticket.add(new THREE.Mesh(new THREE.ShapeGeometry(forma), matTicket));
  const r = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.06), kit.mb(0x1a1206, 0.7));
  r.position.set(-0.1, 0.06, 0.01);
  const rr = r.clone();
  rr.position.y = -0.08;
  ticket.add(r, rr);
  const alfiler = new THREE.Group();
  alfiler.add(new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 8), kit.mb(PAL.rojo, 0.95)));
  const aguja = kit.linea([v3(0, 0, 0), v3(0, 0, -0.35)], kit.ml(PAL.ice, 0.9));
  alfiler.add(aguja);
  alfiler.position.set(0.38, 0, 0.2);
  ticket.add(alfiler);
  g.add(ticket);
  const onda = new THREE.Mesh(new THREE.RingGeometry(0.3, 0.38, 32), kit.mb(PAL.ambar, 0, { aditivo: true }));
  g.add(onda);
  const estados = [new THREE.Color(PAL.ambar), new THREE.Color(PAL.cyan), new THREE.Color(PAL.verde)];
  const desde = v3(3.5, 4.2, 1.2);
  const a = new THREE.Vector3();

  return (t) => {
    const ciclo = Math.floor(t / 8);
    const u = fase(t, 8);
    const b = bloques[ciclo % bloques.length];
    const destino = a.copy(b.pos).add(ui.grupo.position).add(v3(-0.38, 0.1, 0.25));
    const llega = smooth(ramp(u, 0.05, 0.3));
    ticket.position.copy(desde).lerp(destino, llega);
    ticket.position.y += Math.sin(llega * Math.PI) * 0.6;
    ticket.rotation.z = (1 - llega) * 0.8 + Math.sin(t * 2) * 0.03 * llega;
    ticket.scale.setScalar(Math.max(0.0001, ramp(u, 0.03, 0.08) * (1 - ramp(u, 0.93, 1))));
    const clava = ramp(u, 0.28, 0.32);
    alfiler.position.z = 0.2 + (1 - clava) * 0.5;
    const ph = fase(t, 1.2);
    onda.position.copy(b.pos).add(ui.grupo.position).setZ(0.03);
    onda.scale.setScalar(1 + ph * 2.2);
    op(onda.material, clava * (1 - ph) * 0.9 * (1 - ramp(u, 0.85, 0.95)));
    const estado = u < 0.5 ? 0 : u < 0.72 ? 1 : 2;
    matTicket.color.copy(estados[estado]);
    bloques.forEach((bl) => op(bl.fondo.material, bl === b ? 0.18 + 0.35 * clava : 0.15));
  };
}

/** Formulario que se arma arrastrando piezas. */
function formularios(kit: Kit, g: THREE.Group): Animar {
  const form = kit.panel(2.5, 3.4, { relleno: 0.4, radio: 0.12 });
  form.grupo.position.set(1.0, 2.3, 0);
  g.add(form.grupo);
  const anchos = [2.0, 0.4, 2.0, 1.2, 2.0];
  const altos = [0.35, 0.35, 0.35, 0.35, 0.6];
  const colores = [PAL.cyan, PAL.verde, PAL.bright, PAL.ambar, 0xb48cff];
  const slotY = (k: number) => 1.15 - k * 0.6 - (k === 4 ? 0.12 : 0);
  anchos.forEach((w, k) => {
    const s = kit.linea(puntosRect(w + 0.08, altos[k] + 0.08, 0.05), kit.mld(PAL.steel, 0.55, 0.08, 0.06));
    s.position.set(-1.0 + w / 2 + 0.05, slotY(k), 0.01);
    form.grupo.add(s);
  });
  const paleta = kit.panel(1.0, 3.0, { relleno: 0.3, radio: 0.1 });
  paleta.grupo.position.set(-2.2, 2.2, 0);
  g.add(paleta.grupo);
  const piezas = anchos.map((w, k) => {
    const p = kit.caja(w, altos[k], 0.12, colores[k], 0.35, colores[k], 0.95, false);
    g.add(p);
    return p;
  });
  const cursor = kit.sprite(PAL.ice, 0.6, 0.9);
  g.add(cursor);
  const destello = kit.sprite(PAL.cyan, 2.0, 0);
  g.add(destello);
  const origen = (k: number) => v3(-2.2, 3.3 - k * 0.55, 0.15);
  const destino = (k: number) => v3(1.0 - 1.0 + anchos[k] / 2 + 0.05, 2.3 + slotY(k), 0.08);
  const a = new THREE.Vector3();

  return (t) => {
    const u = fase(t, 9);
    const fin = 1 - ramp(u, 0.92, 1);
    let flash = 0;
    piezas.forEach((p, k) => {
      const t0 = 0.05 + k * 0.15;
      const m = smooth(ramp(u, t0, t0 + 0.11));
      a.copy(origen(k)).lerp(destino(k), m);
      a.z += Math.sin(m * Math.PI) * 0.6;
      p.position.copy(a);
      const enPaleta = 0.32 + 0.68 * m;
      p.scale.set(enPaleta * (m > 0 ? 1 : 0.4), enPaleta, 1);
      p.visible = fin > 0.02;
      if (m > 0 && m < 1) {
        cursor.position.copy(a).add(v3(anchos[k] * 0.3 * enPaleta, -0.1, 0.15));
      }
      const encaja = ventana(u, t0 + 0.105, t0 + 0.115, t0 + 0.12, t0 + 0.17);
      if (encaja > flash) {
        flash = encaja;
        destello.position.copy(destino(k));
      }
    });
    op(destello.material, flash);
    op(cursor.material, ventana(u, 0.03, 0.06, 0.8, 0.85));
    piezas.forEach((p) => p.scale.multiplyScalar(Math.max(0.0001, fin)));
  };
}

/** Si pasa esto → haz esto → si nadie contesta → escala. */
function automatizaciones(kit: Kit, g: THREE.Group): Animar {
  const P = {
    disparo: v3(-3.0, 1.6, 0),
    accion: v3(-1.0, 1.6, 0),
    espera: v3(1.0, 1.6, 0),
    escala: v3(2.8, 3.6, 0),
    listo: v3(2.8, 0.7, 0),
  };
  const nodo = (pos: THREE.Vector3, geo: THREE.BufferGeometry, color: number, texto: string | null, tY = 0.8) => {
    const n = new THREE.Group();
    n.position.copy(pos);
    n.add(new THREE.Mesh(geo, kit.mb(color, 0.3)));
    n.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo), kit.ml(color, 0.95, { tint: false })));
    if (texto) {
      const et = kit.texto(texto, 0.32);
      et.position.set(0, tY, 0);
      n.add(et);
    }
    g.add(n);
    return n;
  };
  nodo(P.disparo, new THREE.BoxGeometry(0.9, 0.6, 0.6), PAL.cyan, "Si pasa esto");
  nodo(P.accion, new THREE.BoxGeometry(0.9, 0.6, 0.6), PAL.bright, "Haz esto");
  const rombo = nodo(P.espera, new THREE.OctahedronGeometry(0.5), PAL.ambar, "¿Nadie contesta?");
  const esc = nodo(P.escala, new THREE.BoxGeometry(0.9, 0.6, 0.6), PAL.rojo, "Escala", 0.75);
  const lis = nodo(P.listo, new THREE.SphereGeometry(0.32, 16, 12), PAL.verde, null);
  const rutaA = new THREE.CatmullRomCurve3([P.disparo, P.accion, P.espera], false, "catmullrom", 0);
  const rutaEsc = new THREE.QuadraticBezierCurve3(P.espera, v3(2.0, 3.5, 0), P.escala);
  const rutaOk = new THREE.QuadraticBezierCurve3(P.espera, v3(2.0, 0.6, 0), P.listo);
  g.add(kit.linea([P.disparo, P.espera], kit.ml(PAL.bright, 0.6)));
  g.add(kit.linea(rutaEsc.getPoints(24), kit.mld(PAL.rojo, 0.7, 0.15, 0.1)));
  g.add(kit.linea(rutaOk.getPoints(24), kit.ml(PAL.verde, 0.6, { tint: false })));
  const pulso = kit.sprite(PAL.ice, 1.0, 1);
  g.add(pulso);
  const espera = kit.linea(puntosArco(0.75, Math.PI / 2, Math.PI / 2 - Math.PI * 2, 48), kit.ml(PAL.ambar, 0.9, { tint: false }));
  espera.position.copy(P.espera);
  g.add(espera);
  const alarma = new THREE.Mesh(new THREE.RingGeometry(0.55, 0.65, 32), kit.mb(PAL.rojo, 0, { aditivo: true }));
  alarma.position.copy(P.escala);
  g.add(alarma);
  const colPulso = [new THREE.Color(PAL.ice), new THREE.Color(PAL.rojo), new THREE.Color(PAL.verde)];

  return (t) => {
    const ciclo = Math.floor(t / 6);
    const escala = ciclo % 2 === 0;
    const u = fase(t, 6);
    const p = pulso.position;
    let col = colPulso[0];
    if (u < 0.35) rutaA.getPoint(smooth(u / 0.35), p);
    else if (u < 0.6) p.copy(P.espera);
    else if (u < 0.85) {
      (escala ? rutaEsc : rutaOk).getPoint(smooth((u - 0.6) / 0.25), p);
      col = escala ? colPulso[1] : colPulso[2];
    } else p.copy(escala ? P.escala : P.listo);
    (pulso.material as THREE.SpriteMaterial).color.copy(col);
    op(pulso.material, 1 - ramp(u, 0.93, 1));
    const cuenta = ramp(u, 0.35, 0.6);
    espera.geometry.setDrawRange(0, u > 0.35 && u < 0.62 ? Math.max(2, Math.floor(49 * (1 - cuenta))) : 0);
    rombo.rotation.y = t * 0.8;
    const sonando = escala ? ventana(u, 0.82, 0.86, 0.95, 1) : 0;
    const ph = fase(t, 0.6);
    alarma.scale.setScalar(1 + ph * 1.2);
    op(alarma.material, sonando * (1 - ph));
    esc.scale.setScalar(1 + 0.15 * sonando * Math.sin(t * 14));
    lis.scale.setScalar(1 + 0.3 * (escala ? 0 : ventana(u, 0.82, 0.86, 0.95, 1)));
  };
}

// ───────────────────────── Escena ─────────────────────────

const VINETAS: Array<{ clave: string; crear: (kit: Kit, g: THREE.Group) => Animar }> = [
  { clave: "tareas", crear: tareas },
  { clave: "reuniones", crear: reuniones },
  { clave: "tickets", crear: tickets },
  { clave: "formularios", crear: formularios },
  { clave: "automatizaciones", crear: automatizaciones },
];

export default crearEscena(
  (kit) => {
    const animaciones: Animar[] = [red(kit)];
    kit.hotspot("ia", v3(0, 11.2, 0));
    const encuadres: Record<string, Encuadre> = {
      ia: { pos: v3(3.5, 7.2, 13.5), target: v3(0.2, 5.0, 1.2) },
    };
    VINETAS.forEach((v, i) => {
      const { pos, angulo } = anillo(i, VINETAS.length, 15, Math.PI / VINETAS.length);
      const { grupo, encuadre } = montarVineta(kit, v.clave, pos, angulo, { radio: 3.8, hotspotY: 5.0, dist: 9.6, alto: 3.4, mirarY: 2.3 });
      animaciones.push(v.crear(kit, grupo));
      encuadres[v.clave] = encuadre;
    });
    return {
      general: { pos: v3(0, 21, 33), target: v3(0, 3.2, 0) },
      encuadres,
      update: (t) => animaciones.forEach((a) => a(t)),
    };
  },
  { niebla: 0.013, suelo: { radio: 70, alcance: 0.045 }, polvo: { radio: 24, alto: 12 }, tiempoQuieto: 5.0 },
);
