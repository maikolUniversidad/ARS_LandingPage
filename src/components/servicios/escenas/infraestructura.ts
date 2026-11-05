/**
 * Escena K · Infraestructura y centro de datos.
 *
 * En el centro, la SALA del centro de datos ARS en Colombia: piso técnico, muros de
 * vidrio y, en el pasillo, el contorno de Colombia con una valla de luz (los datos no
 * salen) y el marcador «CO» sobre Bogotá. A la izquierda, la granja de tarjetas
 * gráficas (cada tarjeta brilla según su uso y su temperatura); a la derecha, el
 * clúster (plano de control y nodos que se recuperan solos).
 *
 * Alrededor, en el suelo: el monitor en vivo (solo lectura: luces de estado, curva,
 * medidores y una vista 3D en miniatura), las sondas de red (pulsos hacia sitios y
 * globos DNS, candado del certificado con su vigencia), los respaldos 3-2-1, las
 * alertas (baliza y cola de acciones con el bucle DevOps) y la sede del cliente con
 * su equipo on premise. Arriba flota la nube del cliente: un agente adentro abre un
 * hilo de datos SALIENTE hacia el monitor, sin abrir puertos de entrada.
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
  type Flujo,
  type Kit,
} from "./_motor-gestion";

type Animar = (t: number, dt: number) => void;
const tmpO = new THREE.Object3D();
const tmpC = new THREE.Color();

/** Radio del anillo de viñetas alrededor de la sala. */
const R = 17;
const ANG = {
  monitor: Math.PI * 0.27,
  red: Math.PI * 0.62,
  alertas: Math.PI,
  respaldos: -Math.PI * 0.62,
  onpremise: -Math.PI * 0.27,
} as const;
const enAnillo = (a: number, y = 0) => v3(Math.sin(a) * R, y, Math.cos(a) * R);
/** Punto del monitor donde llegan los hilos (en el mundo). */
const MONITOR = enAnillo(ANG.monitor, 1.0);
/** La nube del cliente flota arriba, detrás de la sala. */
const NUBE = v3(-1.5, 11.5, -10.5);

/** Contorno simplificado de Colombia (lon, lat). */
const COLOMBIA: Array<[number, number]> = [
  [-71.7, 12.4], [-72.3, 11.8], [-73.3, 11.3], [-74.2, 11.1], [-75.3, 10.6], [-75.6, 9.5], [-76.3, 8.9],
  [-77.0, 8.6], [-77.4, 8.7], [-77.9, 7.2], [-77.5, 6.5], [-77.3, 5.0], [-77.4, 4.0], [-77.0, 3.4],
  [-77.6, 2.6], [-78.6, 1.8], [-79.0, 1.4], [-78.1, 0.8], [-77.2, 0.4], [-76.0, 0.3], [-75.3, -0.1],
  [-74.8, -0.6], [-73.6, -1.3], [-72.9, -2.4], [-71.8, -2.2], [-70.3, -3.8], [-69.9, -4.2], [-69.4, -1.2],
  [-69.6, -0.6], [-70.0, 0.6], [-69.2, 1.0], [-67.8, 1.8], [-67.1, 1.1], [-66.9, 1.2], [-67.4, 2.3],
  [-67.8, 2.8], [-67.3, 3.4], [-67.8, 4.5], [-67.4, 6.2], [-69.4, 6.1], [-70.1, 7.0], [-71.9, 7.0],
  [-72.4, 7.4], [-72.4, 8.4], [-72.8, 9.1], [-73.3, 9.2], [-72.9, 10.4], [-72.2, 11.1], [-71.3, 11.8],
];
const ESC_MAPA = 0.36;
const mapa = (lon: number, lat: number) => new THREE.Vector2((lon + 73) * ESC_MAPA, (lat - 4) * ESC_MAPA);

/** Globo en alambre de pocos polígonos (sitios y DNS). */
const globo = (kit: Kit, r: number, color: number, opacidad: number) =>
  new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(r, 1)), kit.ml(color, opacidad));

// ───────────────────────── Sala del centro de datos ─────────────────────────

function sala(kit: Kit): Animar {
  const g = new THREE.Group();
  kit.vineta("datacenter", g);
  kit.scene.add(g);
  const W = 16;
  const D = 10;
  const H = 4.6;

  // Piso técnico con baldosas
  const piso = new THREE.Mesh(new THREE.PlaneGeometry(W, D), kit.mb(PAL.imperial, 0.2));
  piso.rotation.x = -Math.PI / 2;
  piso.position.y = 0.02;
  g.add(piso);
  const baldosas: THREE.Vector3[] = [];
  for (let x = -W / 2; x <= W / 2 + 0.01; x += 1) baldosas.push(v3(x, 0.03, -D / 2), v3(x, 0.03, D / 2));
  for (let z = -D / 2; z <= D / 2 + 0.01; z += 1) baldosas.push(v3(-W / 2, 0.03, z), v3(W / 2, 0.03, z));
  g.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(baldosas), kit.ml(PAL.french, 0.4)));

  // Muros de vidrio (solo aristas y un velo trasero)
  const muros = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(W, H, D)), kit.ml(PAL.bright, 0.4));
  muros.position.y = H / 2;
  g.add(muros);
  const postes: THREE.Vector3[] = [];
  for (let x = -W / 2 + 4; x < W / 2; x += 4) postes.push(v3(x, 0, -D / 2), v3(x, H, -D / 2), v3(x, H, -D / 2), v3(x, H, D / 2));
  g.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(postes), kit.ml(PAL.french, 0.55)));
  const velo = new THREE.Mesh(new THREE.PlaneGeometry(W, H), kit.mb(PAL.indigo, 0.06, { aditivo: true }));
  velo.position.set(0, H / 2, -D / 2);
  g.add(velo);
  const marquesina = kit.texto("Centro de datos ARS · Colombia", 0.42);
  marquesina.position.set(0, H + 0.45, -D / 2);
  g.add(marquesina);

  // Colombia en el piso: relleno, contorno y valla de luz (los datos no salen)
  const contorno = COLOMBIA.map(([lon, lat]) => mapa(lon, lat));
  const forma = new THREE.Shape(contorno);
  const relleno = new THREE.Mesh(new THREE.ShapeGeometry(forma), kit.mb(kit.acento, 0.14, { aditivo: true }));
  relleno.rotation.x = -Math.PI / 2;
  relleno.position.y = 0.05;
  g.add(relleno);
  const borde3d = contorno.map((p) => v3(p.x, 0.07, -p.y));
  borde3d.push(borde3d[0].clone());
  g.add(kit.linea(borde3d, kit.ml(kit.acento, 0.95, { tint: false })));
  const valla: THREE.Vector3[] = [];
  borde3d.forEach((p) => valla.push(p, p.clone().setY(1.0)));
  const vallaMat = kit.ml(kit.acento, 0.22, { tint: false });
  g.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(valla), vallaMat));
  const tapa = kit.linea(
    borde3d.map((p) => p.clone().setY(1.0)),
    kit.mld(kit.acento, 0.5, 0.18, 0.12, { tint: false }),
  );
  g.add(tapa);

  // Bogotá: pulso en el piso, haz de luz y el marcador «CO»
  const b2 = mapa(-74.07, 4.71);
  const bogota = v3(b2.x, 0.09, -b2.y);
  const onda = new THREE.Mesh(new THREE.RingGeometry(0.3, 0.42, 40), kit.mb(kit.acento, 0.8, { aditivo: true }));
  onda.rotation.x = -Math.PI / 2;
  onda.position.copy(bogota);
  g.add(onda);
  const punto = kit.sprite(kit.acento, 0.9, 0.95);
  punto.position.copy(bogota).setY(0.2);
  g.add(punto);
  g.add(kit.linea([bogota, bogota.clone().setY(2.9)], kit.ml(kit.acento, 0.7, { tint: false })));
  const co = kit.texto("CO", 0.85, "#c9fff4", 800);
  co.position.copy(bogota).setY(3.35);
  g.add(co);

  return (t) => {
    const u = fase(t, 2.4);
    onda.scale.setScalar(1 + u * 4);
    op(onda.material, (1 - u) * 0.8);
    op(vallaMat, 0.16 + 0.12 * (0.5 + 0.5 * Math.sin(t * 1.6)));
    op(punto.material, 0.7 + 0.3 * Math.sin(t * 3));
    op(velo.material, 0.05 + 0.02 * Math.sin(t * 0.7));
  };
}

// ───────────────────────── Granja de tarjetas gráficas ─────────────────────────

function gpus(kit: Kit, centro: THREE.Vector3): Animar {
  const g = new THREE.Group();
  g.position.copy(centro);
  kit.vineta("gpus", g);
  kit.scene.add(g);
  const XS = [-1.5, 0, 1.5];
  const SLOTS = 9;
  const ALTO = 3.4;
  XS.forEach((x) => {
    const rack = kit.caja(1.25, ALTO, 1.3, PAL.imperial, 0.55, PAL.bright, 0.85);
    rack.position.set(x, ALTO / 2, 0);
    g.add(rack);
    // fila de atrás, tenue (profundidad de la sala)
    const atras = kit.caja(1.25, ALTO, 1.3, PAL.imperial, 0.3, PAL.french, 0.6);
    atras.position.set(x, ALTO / 2, -2.1);
    g.add(atras);
  });
  const N = XS.length * SLOTS;
  const tarjetas = instanciado(new THREE.PlaneGeometry(1, 0.2), kit.mb(0xffffff, 0.9, { aditivo: true }), N);
  g.add(tarjetas);
  const marcos: THREE.Vector3[] = [];
  XS.forEach((x) => {
    for (let s = 0; s < SLOTS; s++) {
      const y = 0.4 + s * 0.33;
      marcos.push(v3(x - 0.5, y - 0.12, 0.66), v3(x + 0.5, y - 0.12, 0.66));
    }
  });
  g.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(marcos), kit.ml(PAL.french, 0.7)));
  const rand = mulberry32(7);
  const ritmo = Array.from({ length: N }, () => ({ w: 0.6 + rand() * 1.4, f: rand() * 10, carga: 0.4 + rand() * 0.6 }));
  const frio = new THREE.Color(PAL.cyan);
  const tibio = new THREE.Color(PAL.ambar);
  const caliente = new THREE.Color(PAL.rojo);

  // calor que sube de los racks
  const calor = Array.from({ length: kit.lowPower ? 3 : 6 }, (_, k) => {
    const s = kit.sprite(PAL.ambar, 0.8, 0);
    s.position.set(XS[k % 3] + (k > 2 ? 0.3 : -0.3), ALTO, 0);
    g.add(s);
    return s;
  });
  const etiqueta = kit.texto("GPU · IA en local", 0.36);
  etiqueta.position.set(0, ALTO + 0.55, 0.4);
  g.add(etiqueta);

  return (t) => {
    for (let i = 0; i < N; i++) {
      const r = ritmo[i];
      const rack = Math.floor(i / SLOTS);
      const s = i % SLOTS;
      const uso = Math.min(1, r.carga * (0.65 + 0.35 * Math.sin(t * r.w + r.f)));
      const temp = Math.min(1, uso * 0.85 + 0.15 * (0.5 + 0.5 * Math.sin(t * 0.4 + r.f)));
      const ancho = 0.25 + 0.7 * uso;
      tmpO.position.set(XS[rack] - 0.47 + ancho / 2, 0.4 + s * 0.33, 0.67);
      tmpO.rotation.set(0, 0, 0);
      tmpO.scale.set(ancho, 1, 1);
      tmpO.updateMatrix();
      tarjetas.setMatrixAt(i, tmpO.matrix);
      tmpC.copy(frio).lerp(tibio, smooth(temp));
      if (temp > 0.86) tmpC.lerp(caliente, ramp(temp, 0.86, 1));
      tarjetas.setColorAt(i, tmpC);
    }
    tarjetas.instanceMatrix.needsUpdate = true;
    if (tarjetas.instanceColor) tarjetas.instanceColor.needsUpdate = true;
    calor.forEach((s, k) => {
      const u = fase(t, 3.2, k * 0.55);
      s.position.y = ALTO + 0.2 + u * 1.8;
      s.scale.setScalar(0.5 + u * 0.9);
      op(s.material, ventana(u, 0, 0.2, 0.6, 1) * 0.45);
    });
  };
}

// ───────────────────────── Clúster ─────────────────────────

function cluster(kit: Kit, centro: THREE.Vector3): Animar {
  const g = new THREE.Group();
  g.position.copy(centro);
  kit.vineta("cluster", g);
  kit.scene.add(g);
  const CP = v3(0, 2.9, 0);
  const plano = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.OctahedronGeometry(0.5)), kit.ml(PAL.ice, 0.95));
  plano.position.copy(CP);
  g.add(plano);
  const halo = kit.sprite(PAL.indigo, 2.2, 0.6);
  halo.position.copy(CP);
  g.add(halo);
  const NODOS = 6;
  const RN = 2.1;
  const nodos = Array.from({ length: NODOS }, (_, k) => {
    const a = (k / NODOS) * Math.PI * 2 + Math.PI / 6;
    const pos = v3(Math.sin(a) * RN, 0.45, Math.cos(a) * RN);
    const geo = new THREE.BoxGeometry(0.85, 0.9, 0.85);
    const relleno = kit.mb(PAL.french, 0.5, { doble: false });
    const aristas = kit.ml(PAL.bright, 0.9, { tint: false });
    const cuerpo = new THREE.Group();
    cuerpo.add(new THREE.Mesh(geo, relleno), new THREE.LineSegments(new THREE.EdgesGeometry(geo), aristas));
    cuerpo.position.copy(pos);
    g.add(cuerpo);
    g.add(kit.linea([CP, pos.clone().setY(0.9)], kit.ml(PAL.bright, 0.35)));
    const f = kit.flujo(new THREE.LineCurve3(CP, pos.clone().setY(0.9)), kit.lowPower ? 2 : 4, PAL.cyan, 0.22, 0.5);
    g.add(f.puntos);
    return { pos, aristas, f };
  });
  // anillo entre nodos
  const anilloPts = nodos.map((n) => n.pos.clone().setY(0.05));
  anilloPts.push(anilloPts[0].clone());
  g.add(kit.linea(anilloPts, kit.mld(PAL.bright, 0.5, 0.2, 0.14)));
  // pods: tres por nodo sobre su techo
  const PODS = 3;
  const pods = instanciado(new THREE.BoxGeometry(0.18, 0.18, 0.18), kit.mb(0xffffff, 0.95), NODOS * PODS);
  g.add(pods);
  const etiqueta = kit.texto("Clúster", 0.36);
  etiqueta.position.set(0, 3.85, 0);
  g.add(etiqueta);
  const colPod = new THREE.Color(PAL.verde);
  const colNodo = new THREE.Color(PAL.bright);
  const colFalla = new THREE.Color(PAL.ambar);

  return (t) => {
    plano.rotation.y = t * 0.6;
    const ciclo = Math.floor(t / 6);
    const u = fase(t, 6);
    const enFalla = (ciclo * 4 + 1) % NODOS;
    const falla = ventana(u, 0.2, 0.3, 0.55, 0.7);
    nodos.forEach((n, k) => {
      const f = k === enFalla ? falla : 0;
      n.aristas.color.copy(colNodo).lerp(colFalla, f);
      n.f.update(t, 1 - f * 0.8);
      for (let p = 0; p < PODS; p++) {
        const i = k * PODS + p;
        // los pods del nodo en falla se apagan y vuelven a nacer (auto-recuperación)
        const vivo = k === enFalla ? 1 - ventana(u, 0.25, 0.32, 0.62, 0.75) : 1;
        tmpO.position.set(n.pos.x - 0.24 + p * 0.24, 1.02 + Math.sin(t * 2 + i) * 0.03, n.pos.z);
        tmpO.rotation.set(0, t * 0.5 + i, 0);
        tmpO.scale.setScalar(Math.max(0.0001, vivo));
        tmpO.updateMatrix();
        pods.setMatrixAt(i, tmpO.matrix);
        pods.setColorAt(i, colPod);
      }
    });
    pods.instanceMatrix.needsUpdate = true;
    if (pods.instanceColor) pods.instanceColor.needsUpdate = true;
  };
}

// ───────────────────────── Monitor en vivo ─────────────────────────

function monitor(kit: Kit, g: THREE.Group): Animar {
  const panel = kit.panel(5.4, 3.1, { relleno: 0.55, colorRelleno: 0x050f26, radio: 0.12 });
  panel.grupo.position.set(0, 3.0, 0);
  g.add(panel.grupo);
  g.add(kit.linea([v3(0, 1.45, 0), v3(0, 0.05, 0)], kit.ml(PAL.steel, 0.6)));
  const barra = new THREE.Mesh(new THREE.PlaneGeometry(5.4, 0.3), kit.mb(PAL.french, 0.7));
  barra.position.set(0, 1.4, 0.01);
  panel.grupo.add(barra);
  // ojo: solo lectura
  const ojo = new THREE.Group();
  ojo.position.set(-2.3, 1.4, 0.02);
  ojo.add(kit.linea(puntosArco(0.2, 0.35, Math.PI - 0.35, 16).map((p) => v3(p.x, p.y - 0.1, 0)), kit.ml(PAL.ice, 0.9)));
  ojo.add(kit.linea(puntosArco(0.2, Math.PI + 0.35, Math.PI * 2 - 0.35, 16).map((p) => v3(p.x, p.y + 0.1, 0)), kit.ml(PAL.ice, 0.9)));
  const pupila = new THREE.Mesh(new THREE.CircleGeometry(0.06, 12), kit.mb(PAL.ice, 0.9));
  ojo.add(pupila);
  panel.grupo.add(ojo);
  const titulo = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.08), kit.mb(PAL.steel, 0.6));
  titulo.position.set(-1.0, 1.4, 0.02);
  panel.grupo.add(titulo);
  const vivo = kit.sprite(PAL.rojo, 0.35, 0.9);
  vivo.position.set(2.4, 1.4, 0.03);
  panel.grupo.add(vivo);

  // Luces de estado (servicios)
  const COLS = 6;
  const FILAS = 4;
  const L = COLS * FILAS;
  const luces = instanciado(new THREE.CircleGeometry(0.11, 14), kit.mb(0xffffff, 0.95, { aditivo: true }), L);
  luces.position.set(-2.25, 0.75, 0.02);
  panel.grupo.add(luces);
  for (let i = 0; i < L; i++) {
    tmpO.position.set((i % COLS) * 0.36, -Math.floor(i / COLS) * 0.42, 0);
    tmpO.rotation.set(0, 0, 0);
    tmpO.scale.setScalar(1);
    tmpO.updateMatrix();
    luces.setMatrixAt(i, tmpO.matrix);
  }
  const verde = new THREE.Color(PAL.verde);
  const ambar = new THREE.Color(PAL.ambar);
  const rojo = new THREE.Color(PAL.rojo);

  // Curva en vivo
  const NP = 44;
  const curvaPos = new Float32Array(NP * 3);
  const curvaGeo = new THREE.BufferGeometry();
  curvaGeo.setAttribute("position", new THREE.BufferAttribute(curvaPos, 3));
  const curva = new THREE.Line(curvaGeo, kit.ml(PAL.cyan, 0.95));
  curva.position.set(0.1, 0.25, 0.02);
  panel.grupo.add(curva);
  panel.grupo.add(kit.linea([v3(0.1, 0.2, 0.02), v3(2.5, 0.2, 0.02)], kit.ml(PAL.french, 0.8)));

  // Medidores (CPU, GPU, memoria)
  const medidores = [0, 1, 2].map((k) => {
    const x = 0.5 + k * 0.85;
    panel.grupo.add(kit.linea(puntosArco(0.3, Math.PI * 1.25, -Math.PI * 0.25, 32).map((p) => v3(p.x + x, p.y - 0.95, 0.02)), kit.ml(PAL.french, 0.8)));
    const arco = kit.linea(
      puntosArco(0.3, Math.PI * 1.25, -Math.PI * 0.25, 32).map((p) => v3(p.x + x, p.y - 0.95, 0.03)),
      kit.ml([PAL.cyan, PAL.verde, PAL.ambar][k], 0.95, { tint: false }),
    );
    panel.grupo.add(arco);
    return arco;
  });

  // Vista 3D en miniatura: un rack que gira delante del panel
  const mini = new THREE.Group();
  mini.position.set(-1.6, 0.55, 1.4);
  const miniRack = kit.caja(0.55, 1.0, 0.5, PAL.indigo, 0.35, PAL.cyan, 0.95);
  mini.add(miniRack);
  for (let k = 0; k < 4; k++) {
    const led = new THREE.Mesh(new THREE.PlaneGeometry(0.36, 0.05), kit.mb(PAL.verde, 0.9, { aditivo: true }));
    led.position.set(0, -0.32 + k * 0.2, 0.26);
    mini.add(led);
  }
  const miniHalo = new THREE.Mesh(new THREE.RingGeometry(0.5, 0.56, 40), kit.mb(PAL.cyan, 0.5, { aditivo: true }));
  miniHalo.rotation.x = -Math.PI / 2;
  miniHalo.position.y = -0.55;
  mini.add(miniHalo);
  g.add(mini);

  return (t) => {
    // luces: casi todo verde; de vez en cuando una se pone ámbar o roja y vuelve
    const ciclo = Math.floor(t / 3);
    const u = fase(t, 3);
    const aviso = (ciclo * 7 + 3) % L;
    const caida = (ciclo * 11 + 5) % L;
    for (let i = 0; i < L; i++) {
      tmpC.copy(verde);
      if (i === aviso) tmpC.lerp(ambar, ventana(u, 0.1, 0.2, 0.7, 0.9));
      if (i === caida && ciclo % 3 === 0) tmpC.lerp(rojo, ventana(u, 0.2, 0.3, 0.6, 0.85));
      tmpC.multiplyScalar(0.75 + 0.25 * Math.sin(t * 2 + i));
      luces.setColorAt(i, tmpC);
    }
    if (luces.instanceColor) luces.instanceColor.needsUpdate = true;
    for (let i = 0; i < NP; i++) {
      const x = i / (NP - 1);
      const s = x * 9 - t * 1.4;
      const y = 0.55 + 0.22 * Math.sin(s) + 0.12 * Math.sin(s * 2.3 + 1) + 0.06 * Math.sin(s * 5.1);
      curvaPos[i * 3] = x * 2.4;
      curvaPos[i * 3 + 1] = Math.max(0, y);
      curvaPos[i * 3 + 2] = 0;
    }
    curvaGeo.attributes.position.needsUpdate = true;
    medidores.forEach((m, k) => {
      const v = 0.45 + 0.35 * Math.sin(t * (0.5 + k * 0.3) + k * 2);
      m.geometry.setDrawRange(0, Math.max(2, Math.floor(33 * v)));
    });
    op(vivo.material, 0.5 + 0.5 * Math.sin(t * 4));
    mini.rotation.y = t * 0.5;
    mini.position.y = 0.6 + Math.sin(t * 1.2) * 0.06;
  };
}

// ───────────────────────── Red: sitios, DNS y certificados ─────────────────────────

function red(kit: Kit, g: THREE.Group): Animar {
  const SONDA = v3(0, 1.1, 0.6);
  const sonda = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.OctahedronGeometry(0.4)), kit.ml(PAL.ice, 0.95));
  sonda.position.copy(SONDA);
  g.add(sonda);
  g.add(kit.linea([v3(0, 0.05, 0.6), SONDA], kit.ml(PAL.steel, 0.6)));
  const brillo = kit.sprite(PAL.cyan, 1.6, 0.6);
  brillo.position.copy(SONDA);
  g.add(brillo);

  const SITIOS = [v3(-2.4, 3.0, -0.6), v3(0, 3.9, -1.0), v3(2.4, 3.0, -0.6)];
  const sitios = SITIOS.map((p, k) => {
    const s = globo(kit, k === 1 ? 0.65 : 0.5, PAL.bright, 0.75);
    s.position.copy(p);
    g.add(s);
    const ok = new THREE.Mesh(new THREE.RingGeometry(0.72, 0.8, 40), kit.mb(PAL.verde, 0, { aditivo: true }));
    ok.position.copy(p);
    g.add(ok);
    const curva = new THREE.QuadraticBezierCurve3(SONDA, v3(p.x * 0.4, p.y + 0.8, (p.z + SONDA.z) / 2), p);
    g.add(kit.linea(curva.getPoints(30), kit.mld(PAL.bright, 0.4, 0.12, 0.1)));
    const pulso = kit.sprite(PAL.cyan, 0.5, 0);
    g.add(pulso);
    return { s, ok, curva, pulso };
  });
  const dns = kit.texto("DNS", 0.3);
  dns.position.copy(SITIOS[1]).add(v3(0, 1.0, 0));
  g.add(dns);

  // Candado del certificado con su anillo de vigencia
  const candado = new THREE.Group();
  candado.position.set(2.0, 1.2, 1.4);
  candado.add(kit.caja(0.5, 0.4, 0.14, PAL.verde, 0.3, PAL.verde, 0.95, false));
  candado.add(kit.linea(puntosArco(0.17, 0, Math.PI, 16).map((p) => v3(p.x, p.y + 0.2, 0)), kit.ml(PAL.verde, 0.95, { tint: false })));
  const vigencia = kit.linea(puntosArco(0.55, Math.PI / 2, Math.PI / 2 - Math.PI * 2, 64), kit.ml(PAL.verde, 0.9, { tint: false }));
  candado.add(vigencia);
  g.add(candado);
  const colOk = new THREE.Color(PAL.verde);
  const colVence = new THREE.Color(PAL.ambar);
  const p = new THREE.Vector3();

  return (t) => {
    sonda.rotation.y = t * 0.8;
    sitios.forEach((s, k) => {
      const u = fase(t, 2.7, k * 0.9);
      const viaje = ramp(u, 0, 0.55);
      s.curva.getPoint(viaje, p);
      s.pulso.position.copy(p);
      s.pulso.scale.setScalar(0.35 + 0.25 * Math.sin(u * Math.PI));
      op(s.pulso.material, ventana(u, 0, 0.05, 0.5, 0.58) * 0.95);
      const llega = ventana(u, 0.55, 0.6, 0.8, 1);
      op(s.ok.material, llega * 0.85);
      s.ok.scale.setScalar(1 + ramp(u, 0.55, 1) * 0.5);
      s.s.rotation.y = t * 0.3 + k;
    });
    // la vigencia se consume; al acercarse al vencimiento se pone ámbar y se renueva
    const v = fase(t, 9);
    const restante = 1 - v;
    vigencia.geometry.setDrawRange(0, Math.max(2, Math.floor(65 * restante)));
    vigencia.material.color.copy(colOk).lerp(colVence, ramp(v, 0.6, 0.8));
    candado.rotation.y = Math.sin(t * 0.6) * 0.35;
  };
}

// ───────────────────────── Nube del cliente y agente ─────────────────────────

function nube(kit: Kit): { anima: Animar; agente: THREE.Vector3 } {
  const g = new THREE.Group();
  g.position.copy(NUBE);
  kit.vineta("nube", g);
  kit.scene.add(g);
  const lobulos: Array<[number, number, number, number]> = [
    [-1.6, -0.2, 0, 1.2],
    [0, 0.35, -0.2, 1.65],
    [1.55, -0.15, 0.1, 1.15],
    [0.6, -0.6, 0.6, 0.9],
  ];
  const cuerpo = new THREE.Group();
  lobulos.forEach(([x, y, z, r]) => {
    const l = globo(kit, r, PAL.bright, 0.5);
    l.position.set(x, y, z);
    cuerpo.add(l);
    const f = new THREE.Mesh(new THREE.SphereGeometry(r * 0.97, 20, 14), kit.mb(PAL.indigo, 0.07, { aditivo: true }));
    f.position.set(x, y, z);
    cuerpo.add(f);
  });
  g.add(cuerpo);
  // barrera de entrada cerrada bajo la nube: sin puertos abiertos
  const barrera = kit.linea(puntosArco(2.9, 0, Math.PI * 2, 72).map((p) => v3(p.x, -1.55, p.y * 0.55)), kit.mld(PAL.rojo, 0.55, 0.25, 0.15, { tint: false }));
  g.add(barrera);
  // agente adentro
  const AG = v3(0.2, -0.45, 0.4);
  const agente = kit.caja(0.55, 0.55, 0.55, PAL.verde, 0.35, PAL.verde, 0.95, false);
  agente.position.copy(AG);
  g.add(agente);
  const luz = kit.sprite(PAL.verde, 1.5, 0.8);
  luz.position.copy(AG);
  g.add(luz);
  const et = kit.texto("Nube del cliente · agente", 0.36);
  et.position.set(0, 2.45, 0);
  g.add(et);

  return {
    agente: AG.clone().add(NUBE),
    anima: (t) => {
      cuerpo.position.y = Math.sin(t * 0.6) * 0.15;
      cuerpo.rotation.y = Math.sin(t * 0.2) * 0.12;
      agente.rotation.set(t * 0.7, t, 0);
      op(luz.material, 0.6 + 0.3 * Math.sin(t * 3));
    },
  };
}

// ───────────────────────── Sede del cliente con equipo on premise ─────────────────────────

function onpremise(kit: Kit, g: THREE.Group): Animar {
  const W = 3.0;
  const H = 3.8;
  const D = 2.2;
  const edificio = kit.caja(W, H, D, PAL.imperial, 0.28, PAL.bright, 0.8);
  edificio.position.set(0, H / 2, -0.3);
  g.add(edificio);
  const pisos: THREE.Vector3[] = [];
  for (let y = 0.95; y < H; y += 0.95) {
    pisos.push(v3(-W / 2, y, D / 2 - 0.3), v3(W / 2, y, D / 2 - 0.3));
    pisos.push(v3(W / 2, y, D / 2 - 0.3), v3(W / 2, y, -D / 2 - 0.3));
  }
  g.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pisos), kit.ml(PAL.french, 0.7)));
  const ventanas: THREE.Mesh[] = [];
  for (let piso = 1; piso < 4; piso++) {
    for (let c = 0; c < 3; c++) {
      const v = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.45), kit.mb(PAL.cyan, 0.14, { aditivo: true }));
      v.position.set(-0.9 + c * 0.9, piso * 0.95 + 0.48, D / 2 - 0.29);
      g.add(v);
      ventanas.push(v);
    }
  }
  // el equipo, visible en la planta baja
  const equipo = kit.caja(1.1, 0.6, 0.7, PAL.verde, 0.3, PAL.verde, 0.95, false);
  equipo.position.set(0.3, 0.32, 0.1);
  g.add(equipo);
  const leds = [0, 1, 2].map((k) => {
    const l = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 0.05), kit.mb(PAL.verde, 0.9, { aditivo: true }));
    l.position.set(0.0 + k * 0.25, 0.4, 0.46);
    g.add(l);
    return l;
  });
  const luz = kit.sprite(PAL.verde, 1.8, 0.5);
  luz.position.set(0.3, 0.5, 0.2);
  g.add(luz);
  const puerta = kit.linea(puntosRect(0.6, 0.85, 0.04).map((p) => v3(p.x - 0.95, p.y + 0.43, D / 2 - 0.28)), kit.ml(PAL.ice, 0.7));
  g.add(puerta);
  const et = kit.texto("Sede del cliente", 0.34);
  et.position.set(0, H + 0.5, -0.3);
  g.add(et);

  return (t) => {
    ventanas.forEach((v, k) => op(v.material, 0.08 + 0.12 * (0.5 + 0.5 * Math.sin(t * 0.7 + k * 1.9))));
    leds.forEach((l, k) => op(l.material, 0.4 + 0.6 * (fase(t, 0.9, k * 0.3) < 0.5 ? 1 : 0.2)));
    op(luz.material, 0.4 + 0.2 * Math.sin(t * 2));
  };
}

// ───────────────────────── Respaldos 3-2-1 ─────────────────────────

function respaldos(kit: Kit, g: THREE.Group): Animar {
  const ORIGEN = v3(-0.6, 4.0, 0);
  const datos = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(0.42, 0)), kit.ml(PAL.ice, 0.95));
  datos.position.copy(ORIGEN);
  g.add(datos);
  const halo = kit.sprite(PAL.indigo, 1.8, 0.6);
  halo.position.copy(ORIGEN);
  g.add(halo);

  // copia 1: discos en el sitio
  const discos = (x: number, color: number, padre: THREE.Object3D) => {
    const grupo = new THREE.Group();
    grupo.position.set(x, 0, 0);
    for (let k = 0; k < 3; k++) {
      const geo = new THREE.CylinderGeometry(0.55, 0.55, 0.22, 28);
      const d = new THREE.Mesh(geo, kit.mb(PAL.french, 0.45, { doble: false }));
      d.position.y = 0.25 + k * 0.32;
      grupo.add(d);
      const b = new THREE.LineSegments(new THREE.EdgesGeometry(geo, 30), kit.ml(color, 0.9, { tint: false }));
      b.position.copy(d.position);
      grupo.add(b);
    }
    padre.add(grupo);
    return grupo;
  };
  const c1 = discos(-2.3, PAL.cyan, g);
  // copia 2: otro medio (cinta)
  const cinta = new THREE.Group();
  cinta.position.set(-0.6, 0, 0.3);
  const cartucho = kit.caja(1.3, 0.9, 0.3, PAL.french, 0.45, PAL.ambar, 0.9, false);
  cartucho.position.y = 0.6;
  cinta.add(cartucho);
  const carretes = [-0.3, 0.3].map((x) => {
    const c = kit.linea(puntosArco(0.2, 0, Math.PI * 2, 24).map((p) => v3(p.x + x, p.y + 0.6, 0.16)), kit.ml(PAL.ambar, 0.95, { tint: false }));
    cinta.add(c);
    return c;
  });
  g.add(cinta);
  // límite del sitio y copia 3 fuera del sitio, en bóveda
  const limite = kit.linea([v3(0.65, 0.05, -1.6), v3(0.65, 0.05, 1.6), v3(0.65, 2.6, 1.6), v3(0.65, 2.6, -1.6), v3(0.65, 0.05, -1.6)], kit.mld(PAL.steel, 0.5, 0.18, 0.12));
  g.add(limite);
  const fuera = new THREE.Group();
  fuera.position.set(2.1, 0.5, -0.4);
  const boveda = kit.caja(1.6, 1.9, 1.5, PAL.imperial, 0.3, PAL.verde, 0.85, false);
  boveda.position.y = 0.95;
  fuera.add(boveda);
  discos(0, PAL.verde, fuera).position.y = 0.2;
  g.add(fuera);

  const destinos = [v3(-2.3, 1.3, 0), v3(-0.6, 1.2, 0.3), v3(2.1, 2.7, -0.4)];
  const COL = [PAL.cyan, PAL.ambar, PAL.verde];
  const rutas = destinos.map((d, k) => {
    const curva = new THREE.QuadraticBezierCurve3(ORIGEN, v3((ORIGEN.x + d.x) / 2, ORIGEN.y + 0.6, (ORIGEN.z + d.z) / 2), d);
    g.add(kit.linea(curva.getPoints(30), kit.ml(COL[k], 0.35, { tint: false })));
    const bloque = kit.caja(0.2, 0.2, 0.2, COL[k], 0.6, COL[k], 0.95, false);
    g.add(bloque);
    const ok = new THREE.Mesh(new THREE.RingGeometry(0.62, 0.7, 36), kit.mb(PAL.verde, 0, { aditivo: true }));
    ok.rotation.x = -Math.PI / 2;
    ok.position.copy(d).setY(k === 2 ? 0.6 : 0.06);
    g.add(ok);
    return { curva, bloque, ok };
  });
  const et = kit.texto("3 copias · 2 medios · 1 fuera", 0.34);
  et.position.set(0, 5.0, 0);
  g.add(et);
  const p = new THREE.Vector3();

  return (t) => {
    datos.rotation.set(t * 0.4, t * 0.6, 0);
    const u = fase(t, 5);
    rutas.forEach((r, k) => {
      const a = 0.08 + k * 0.12;
      const viaje = ramp(u, a, a + 0.38);
      r.curva.getPoint(viaje, p);
      r.bloque.position.copy(p);
      r.bloque.rotation.set(t, t * 1.3, 0);
      r.bloque.scale.setScalar(Math.max(0.0001, ventana(u, a - 0.03, a, a + 0.36, a + 0.4)));
      const listo = ventana(u, a + 0.38, a + 0.42, 0.9, 1);
      op(r.ok.material, listo * 0.9);
      r.ok.scale.setScalar(1 + ramp(u, a + 0.38, 1) * 0.3);
    });
    carretes.forEach((c, k) => (c.rotation.z = t * (k ? 1.6 : 1.2)));
    c1.rotation.y = t * 0.4;
  };
}

// ───────────────────────── Alertas, DevOps e informes ─────────────────────────

function alertas(kit: Kit, g: THREE.Group): Animar {
  // Baliza
  const BX = -2.0;
  g.add(kit.caja(0.9, 0.5, 0.9, PAL.imperial, 0.5, PAL.steel, 0.8).translateX(BX).translateY(0.25));
  const cupula = new THREE.Mesh(new THREE.SphereGeometry(0.5, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), kit.mb(PAL.ambar, 0.5, { aditivo: true }));
  cupula.position.set(BX, 0.5, 0);
  g.add(cupula);
  const haz = new THREE.Group();
  haz.position.set(BX, 0.78, 0);
  [0, Math.PI].forEach((a) => {
    const geo = new THREE.BufferGeometry().setFromPoints([v3(0, 0, 0), v3(3.2, 0.5, -0.5), v3(3.2, 0.5, 0.5)]);
    const m = new THREE.Mesh(geo, kit.mb(PAL.ambar, 0.16, { aditivo: true }));
    m.rotation.y = a;
    haz.add(m);
  });
  g.add(haz);
  const destello = kit.sprite(PAL.ambar, 2.0, 0.6);
  destello.position.set(BX, 0.85, 0);
  g.add(destello);

  // Cola de acciones: llegan en ámbar, bajan y se resuelven en verde
  const N = 4;
  const colAlerta = new THREE.Color(PAL.ambar);
  const colOk = new THREE.Color(PAL.verde);
  const tarjetas = Array.from({ length: N }, () => {
    const p = kit.panel(2.2, 0.5, { relleno: 0.55, radio: 0.08, colorBorde: PAL.ambar, tint: false });
    const dot = new THREE.Mesh(new THREE.CircleGeometry(0.1, 14), kit.mb(PAL.ambar, 0.95));
    dot.position.set(-0.85, 0, 0.01);
    const r1 = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.07), kit.mb(PAL.ice, 0.7));
    r1.position.set(0.05, 0.08, 0.01);
    const r2 = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.06), kit.mb(PAL.steel, 0.55));
    r2.position.set(-0.1, -0.09, 0.01);
    p.grupo.add(dot, r1, r2);
    g.add(p.grupo);
    return { p, dot, r1, r2 };
  });
  g.add(kit.linea([v3(0.9, 0.3, -0.1), v3(0.9, 4.0, -0.1)], kit.mld(PAL.bright, 0.4, 0.12, 0.08)));

  // Bucle DevOps (∞) detrás
  const inf = new THREE.Group();
  inf.position.set(0.2, 4.7, -0.8);
  const ptsInf: THREE.Vector3[] = [];
  for (let i = 0; i <= 96; i++) {
    const a = (i / 96) * Math.PI * 2;
    const d = 1 + Math.sin(a) ** 2;
    ptsInf.push(v3((1.3 * Math.cos(a)) / d, (1.3 * Math.sin(a) * Math.cos(a)) / d, 0));
  }
  const curvaInf = new THREE.CatmullRomCurve3(ptsInf, true);
  inf.add(kit.linea(ptsInf, kit.ml(PAL.bright, 0.75)));
  const corredor = kit.sprite(PAL.cyan, 0.5, 0.95);
  inf.add(corredor);
  g.add(inf);
  const p = new THREE.Vector3();

  return (t) => {
    haz.rotation.y = t * 2.2;
    const P = 6;
    let llegada = 0;
    tarjetas.forEach((c, k) => {
      const u = fase(t, P, (k * P) / N);
      c.p.grupo.position.set(2.0, 3.7 - u * 3.0, 0);
      const vis = ventana(u, 0, 0.08, 0.9, 1);
      c.p.grupo.scale.setScalar(Math.max(0.0001, vis));
      const resuelta = ramp(u, 0.62, 0.72);
      tmpC.copy(colAlerta).lerp(colOk, resuelta);
      c.dot.material.color.copy(tmpC);
      c.p.borde.color.copy(tmpC);
      llegada = Math.max(llegada, 1 - ramp(u, 0, 0.12));
    });
    op(cupula.material, 0.35 + 0.45 * llegada);
    op(destello.material, 0.25 + 0.6 * llegada * (0.5 + 0.5 * Math.sin(t * 14)));
    curvaInf.getPointAt(fase(t, 4), p);
    corredor.position.copy(p);
  };
}

// ───────────────────────── Escena ─────────────────────────

export default crearEscena(
  (kit) => {
    const animaciones: Animar[] = [sala(kit)];
    const encuadres: Record<string, Encuadre> = {
      datacenter: { pos: v3(0, 12.5, 13.5), target: v3(0, 0.6, -0.4) },
    };
    kit.hotspot("datacenter", v3(-0.4, 4.4, 0.8), undefined, 0.9);

    const GPU = v3(-5.3, 0, -0.9);
    animaciones.push(gpus(kit, GPU));
    kit.hotspot("gpus", GPU.clone().add(v3(0, 4.9, 0.6)), undefined, 0.8);
    encuadres.gpus = frente(GPU, 0, 7.2, 3.2, 1.9);

    const CL = v3(5.3, 0, -0.9);
    animaciones.push(cluster(kit, CL));
    kit.hotspot("cluster", CL.clone().add(v3(0, 4.6, 0)), undefined, 0.8);
    encuadres.cluster = frente(CL, 0, 7.4, 4.2, 1.4);

    // Viñetas del anillo
    const anillo: Array<{ clave: keyof typeof ANG; crear: (kit: Kit, g: THREE.Group) => Animar; o: Parameters<typeof montarVineta>[4] }> = [
      { clave: "monitor", crear: monitor, o: { radio: 3.9, hotspotY: 5.4, dist: 9.6, alto: 3.0, mirarY: 2.6 } },
      { clave: "red", crear: red, o: { radio: 3.7, hotspotY: 5.6, dist: 9.4, alto: 3.4, mirarY: 2.4 } },
      { clave: "alertas", crear: alertas, o: { radio: 3.8, hotspotY: 6.4, dist: 9.6, alto: 3.4, mirarY: 2.6 } },
      { clave: "respaldos", crear: respaldos, o: { radio: 3.9, hotspotY: 5.8, dist: 9.6, alto: 3.6, mirarY: 2.2 } },
      { clave: "onpremise", crear: onpremise, o: { radio: 3.6, hotspotY: 5.4, dist: 9.2, alto: 3.4, mirarY: 2.2 } },
    ];
    for (const v of anillo) {
      const { grupo, encuadre } = montarVineta(kit, v.clave, enAnillo(ANG[v.clave]), ANG[v.clave], v.o);
      encuadres[v.clave] = encuadre;
      animaciones.push(v.crear(kit, grupo));
    }

    // Nube del cliente, arriba
    const n = nube(kit);
    animaciones.push(n.anima);
    kit.hotspot("nube", NUBE.clone().add(v3(2.6, 1.6, 0)), undefined, 0.85);
    encuadres.nube = { pos: v3(7.5, 14.2, 4.5), target: v3(0.2, 9.5, -8) };

    // Hilos de datos entre la sala, la nube, la sede y el monitor
    const flujos: Array<{ f: Flujo; vel: number }> = [];
    const hilo = (clave: string | null, pts: THREE.Vector3[], color: number, n: number, punteado = true) => {
      const grupo = new THREE.Group();
      if (clave) kit.vineta(clave, grupo);
      kit.scene.add(grupo);
      const curva = new THREE.CatmullRomCurve3(pts);
      grupo.add(kit.linea(curva.getPoints(60), punteado ? kit.mld(PAL.bright, 0.4, 0.3, 0.2) : kit.ml(color, 0.45)));
      const f = kit.flujo(curva, kit.lowPower ? Math.ceil(n / 2) : n, color, 0.32, 0.22);
      grupo.add(f.puntos);
      flujos.push({ f, vel: 1 });
    };
    const borde = (a: number, y = 0.12) => v3(Math.sin(a) * 6.5, y, Math.cos(a) * 5.2);
    const llegada = (a: number, y = 0.12) => enAnillo(a, y).sub(v3(Math.sin(a) * 3.9, 0, Math.cos(a) * 3.9));
    // la nube: el agente abre la conexión hacia afuera (saliente) y baja al monitor
    hilo(
      "nube",
      [n.agente, n.agente.clone().add(v3(1.5, -3.2, 3.5)), v3(9.5, 6.5, 3.5), MONITOR.clone().add(v3(-0.4, 3.6, 0))],
      PAL.verde,
      12,
      false,
    );
    // la sede del cliente: su equipo reporta al mismo monitor
    hilo("onpremise", [enAnillo(ANG.onpremise, 0.4), v3(-6, 1.6, 13.5), v3(5, 1.6, 14), MONITOR.clone().setY(0.6)], PAL.verde, 10, false);
    // la sala alimenta al monitor, a las sondas, a los respaldos y a las alertas
    hilo(null, [borde(ANG.monitor), llegada(ANG.monitor)], PAL.cyan, 6);
    hilo(null, [borde(ANG.red), llegada(ANG.red)], PAL.cyan, 6);
    hilo(null, [borde(ANG.respaldos), llegada(ANG.respaldos)], PAL.cyan, 6);
    hilo(null, [v3(0, 0.12, -5.2), llegada(ANG.alertas)], PAL.ambar, 6);

    animaciones.push((t) => flujos.forEach((x) => x.f.update(t, x.vel)));

    return {
      general: { pos: v3(0, 23, 37), target: v3(0, 3.2, 0) },
      encuadres,
      update: (t, dt) => animaciones.forEach((a) => a(t, dt)),
    };
  },
  { niebla: 0.011, suelo: { radio: 75, alcance: 0.04 }, polvo: { radio: 26, alto: 14 }, tiempoQuieto: 3.4 },
);
