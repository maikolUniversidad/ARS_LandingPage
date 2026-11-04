/**
 * Escena «inmersiva»: CENTRAL VIVA, la sala de control en realidad virtual.
 *
 * Sala circular con tableros curvos flotando (eventos, radio, dron, mapa,
 * indicadores y cámaras), un holograma central, y cuatro estaciones: la
 * maqueta de la Sede Inteligente, la Mesa Directiva con IA, Vigía (orbe de voz)
 * y las gafas de realidad virtual. Se entra por un vestíbulo con pasarela de luz.
 *
 * Focos: vestibulo · central · sede · mesa · vigia · gafas.
 */

import * as THREE from "three";
import { COLOR, Kit, enc, fase, montarEscena, mulberry32, v3, type Escena } from "./_edificio-motor";
import type { FabricaEscena } from "./contrato";

const R = 11; // radio de la sala
const RP = 9.6; // radio de los tableros
const YP = 3.4; // altura de los tableros
const ALTO_P = 2.6;
const ARCO_P = 0.6;

const polar = (theta: number, r: number, y = 0) => v3(Math.sin(theta) * r, y, Math.cos(theta) * r);
const grados = (g: number) => (g * Math.PI) / 180;

const SEDE = polar(grados(-50), 5.5);
const MESA = polar(grados(50), 5.5);
const VIGIA = polar(grados(-130), 5.5, 2.4);
const GAFAS = polar(grados(130), 5.5, 2.5);
const VESTIBULO_Z = R + 3.2;

type Dibujo = (c: CanvasRenderingContext2D, w: number, h: number) => void;

const fondoPanel = (titulo: string, extra: Dibujo): Dibujo => (c, w, h) => {
  const g = c.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, "rgba(35,72,212,0.55)");
  g.addColorStop(1, "rgba(20,38,100,0.25)");
  c.fillStyle = g;
  c.fillRect(0, 0, w, h);
  c.strokeStyle = "rgba(107,138,255,0.9)";
  c.lineWidth = 4;
  c.strokeRect(2, 2, w - 4, h - 4);
  c.fillStyle = "rgba(213,224,255,0.95)";
  c.font = "600 22px system-ui, sans-serif";
  c.fillText(titulo, 18, 34);
  c.fillStyle = "rgba(107,138,255,0.5)";
  c.fillRect(18, 44, w - 36, 2);
  extra(c, w, h);
};

function construir(kit: Kit): Escena {
  const { scene } = kit;
  const acento = kit.acento;
  const rand = mulberry32(5);
  const colBright = new THREE.Color(COLOR.bright);

  // ── Sala ──
  const suelo = kit.suelo(160, { reach: 0.05, celda: 1, mayor: 4, placa: R });
  scene.add(suelo.mesh);
  const estructura: THREE.Vector3[] = [];
  const circ = (r: number, y: number, n = 96) => {
    for (let i = 0; i < n; i++) {
      estructura.push(polar((i / n) * Math.PI * 2, r, y), polar(((i + 1) / n) * Math.PI * 2, r, y));
    }
  };
  circ(R, 0.03);
  circ(4.2, 0.03);
  circ(R, 7.2);
  for (let i = 0; i < 16; i++) {
    const th = (i / 16) * Math.PI * 2;
    if (Math.abs(Math.atan2(Math.sin(th), Math.cos(th))) < grados(25)) continue; // hueco de entrada
    estructura.push(polar(th, R, 0), polar(th, R, 7.2));
    estructura.push(polar(th, 4.2, 0.03), polar(th, R, 0.03));
  }
  const matEstructura = kit.matLinea(COLOR.bright, 0.35);
  scene.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(estructura), matEstructura));
  kit.polvo(380, 40, 9, 3);

  // ── Tableros curvos ──
  const filas = ["Ronda completada · Sede Norte", "Ingreso visitante · Torre 80", "Alerta de aforo · CC Norte", "Pánico atendido · Bodega Sur", "Cambio de turno · Planta 3", "Puerta forzada · Clínica N", "Reporte OK · Sede Centro"];
  const colores = ["#35e0a1", "#6b8aff", "#ffb547", "#ff3b5c", "#6b8aff", "#ff3b5c", "#35e0a1"];
  const dibujos: Array<{ th: number; dibujo: Dibujo; anim?: "scrollY" | "scrollX" }> = [
    {
      th: grados(70),
      dibujo: fondoPanel("RADIO · CANAL 1", (c, w, h) => {
        c.strokeStyle = "rgba(95,216,255,0.35)";
        c.lineWidth = 2;
        c.beginPath();
        c.moveTo(18, h * 0.6);
        c.lineTo(w - 18, h * 0.6);
        c.stroke();
        c.fillStyle = "rgba(255,59,92,0.95)";
        c.beginPath();
        c.arc(w - 40, 28, 8, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = "rgba(213,224,255,0.8)";
        c.font = "500 16px system-ui, sans-serif";
        c.fillText("REC · Supervisor 04 → Central", 18, h - 22);
      }),
    },
    {
      th: grados(120),
      anim: "scrollY",
      dibujo: fondoPanel("EVENTOS EN VIVO", (c) => {
        c.font = "500 17px system-ui, sans-serif";
        for (let i = 0; i < 9; i++) {
          const y = 66 + i * 24;
          c.fillStyle = colores[i % colores.length];
          c.beginPath();
          c.arc(26, y - 6, 6, 0, Math.PI * 2);
          c.fill();
          c.fillStyle = "rgba(213,224,255,0.85)";
          c.fillText(filas[i % filas.length], 42, y);
        }
      }),
    },
    {
      th: grados(160),
      dibujo: fondoPanel("MAPA DE SEDES", (c, w, h) => {
        c.strokeStyle = "rgba(107,138,255,0.45)";
        c.lineWidth = 2;
        for (let x = 30; x < w; x += 38) {
          c.beginPath();
          c.moveTo(x, 56);
          c.lineTo(x + 18, h - 12);
          c.stroke();
        }
        for (let y = 70; y < h; y += 30) {
          c.beginPath();
          c.moveTo(14, y);
          c.lineTo(w - 14, y + 6);
          c.stroke();
        }
        for (let i = 0; i < 9; i++) {
          c.fillStyle = i === 4 ? "#ff3b5c" : "#5fd8ff";
          c.beginPath();
          c.arc(40 + rand() * (w - 80), 70 + rand() * (h - 100), 7, 0, Math.PI * 2);
          c.fill();
        }
      }),
    },
    {
      th: grados(200),
      anim: "scrollX",
      dibujo: fondoPanel("DRON 02 · EN VIVO", (c, w, h) => {
        c.strokeStyle = "rgba(95,216,255,0.35)";
        c.lineWidth = 1.5;
        for (let i = 0; i < 14; i++) {
          c.beginPath();
          const y0 = 60 + i * 14;
          c.moveTo(0, y0);
          for (let x = 0; x <= w; x += 16) c.lineTo(x, y0 + Math.sin(x * 0.03 + i) * 6);
          c.stroke();
        }
        c.strokeStyle = "rgba(255,181,71,0.95)";
        c.lineWidth = 3;
        c.strokeRect(w * 0.55, h * 0.42, 70, 60);
        c.strokeStyle = "rgba(213,224,255,0.7)";
        c.beginPath();
        c.moveTo(w / 2 - 20, h * 0.6);
        c.lineTo(w / 2 + 20, h * 0.6);
        c.moveTo(w / 2, h * 0.6 - 20);
        c.lineTo(w / 2, h * 0.6 + 20);
        c.stroke();
      }),
    },
    {
      th: grados(240),
      dibujo: fondoPanel("INDICADORES", (c, w, h) => {
        const vals = [0.92, 0.78, 0.64, 0.88, 0.71, 0.97];
        vals.forEach((v, i) => {
          const x = 30 + i * ((w - 60) / vals.length);
          const bh = (h - 90) * v;
          c.fillStyle = v > 0.8 ? "rgba(53,224,161,0.85)" : "rgba(255,181,71,0.85)";
          c.fillRect(x, h - 24 - bh, 40, bh);
        });
      }),
    },
    {
      th: grados(290),
      dibujo: fondoPanel("CÁMARAS · 6 DE 48", (c, w, h) => {
        const cw = (w - 48) / 3;
        const ch = (h - 74) / 2;
        for (let i = 0; i < 6; i++) {
          const x = 16 + (i % 3) * (cw + 8);
          const y = 56 + Math.floor(i / 3) * (ch + 8);
          c.fillStyle = "rgba(2,10,24,0.65)";
          c.fillRect(x, y, cw, ch);
          c.strokeStyle = i === 2 ? "rgba(255,181,71,0.95)" : "rgba(107,138,255,0.6)";
          c.lineWidth = 2;
          c.strokeRect(x, y, cw, ch);
          c.fillStyle = "rgba(107,138,255,0.35)";
          c.fillRect(x + 8, y + ch * 0.55, cw * 0.5, ch * 0.3);
        }
      }),
    },
  ];
  const paneles: Array<{ mat: THREE.MeshBasicMaterial; tex: THREE.Texture; anim?: "scrollY" | "scrollX"; marco: THREE.LineBasicMaterial; base: number }> = [];
  for (const d of dibujos) {
    const tex = kit.textura(512, 256, d.dibujo);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.x = -1; // se mira desde dentro del cilindro
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.85, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending });
    const geo = new THREE.CylinderGeometry(RP, RP, ALTO_P, 24, 1, true, d.th - ARCO_P / 2, ARCO_P);
    const m = new THREE.Mesh(geo, mat);
    m.position.y = YP;
    scene.add(m);
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 24; i++) pts.push(polar(d.th - ARCO_P / 2 + (i / 24) * ARCO_P, RP - 0.02, YP + ALTO_P / 2 + 0.06));
    for (let i = 24; i >= 0; i--) pts.push(polar(d.th - ARCO_P / 2 + (i / 24) * ARCO_P, RP - 0.02, YP - ALTO_P / 2 - 0.06));
    const marco = kit.linea(pts, COLOR.bright, 0.8, true);
    scene.add(marco);
    paneles.push({ mat, tex, anim: d.anim, marco: marco.material, base: 0.8 });
  }
  // Onda de radio viva delante del tablero de radio
  const nOnda = 96;
  const geoOnda = new THREE.BufferGeometry().setFromPoints(Array.from({ length: nOnda }, () => v3(0, 0, 0)));
  const onda = new THREE.Line(geoOnda, kit.matLinea(COLOR.cyan, 0.95));
  onda.frustumCulled = false;
  scene.add(onda);

  // ── Holograma central ──
  const base = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.9, 0.5, 40), new THREE.MeshStandardMaterial({ color: COLOR.building, roughness: 0.6, metalness: 0.3 }));
  base.position.y = 0.25;
  scene.add(base);
  const baseAnillo = kit.anillo(1.75, 1.9, COLOR.bright, 64);
  baseAnillo.position.y = 0.52;
  scene.add(baseAnillo);
  const columna = new THREE.Mesh(
    new THREE.CylinderGeometry(1.2, 1.6, 4.4, 40, 1, true),
    new THREE.MeshBasicMaterial({ color: acento, transparent: true, opacity: 0.08, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }),
  );
  columna.position.y = 2.7;
  scene.add(columna);
  const holo = new THREE.Group();
  holo.position.y = 3.1;
  scene.add(holo);
  const holoCasco = kit.bordes(new THREE.IcosahedronGeometry(1.25, 1), COLOR.bright, 0.9);
  const holoNucleo = new THREE.Mesh(new THREE.IcosahedronGeometry(0.62, 0), kit.basico(COLOR.indigo, 0.6, true));
  const holoGlow = kit.sprite(COLOR.indigo, 6, 0.6);
  holo.add(holoCasco, holoNucleo, holoGlow);
  const orbitas = [0, 1, 2].map((i) => {
    const pts: THREE.Vector3[] = [];
    for (let k = 0; k < 72; k++) pts.push(v3(Math.cos((k / 72) * Math.PI * 2) * (1.7 + i * 0.25), 0, Math.sin((k / 72) * Math.PI * 2) * (1.7 + i * 0.25)));
    const o = kit.linea(pts, i === 1 ? acento : COLOR.bright, 0.6, true);
    o.rotation.set(0.4 + i * 0.5, 0, i * 0.7);
    holo.add(o);
    return o;
  });
  // datos subiendo por la columna
  const nDatos = kit.lowPower ? 40 : 90;
  const datosPos = new Float32Array(nDatos * 3);
  const datosSeed = Array.from({ length: nDatos }, () => [rand() * Math.PI * 2, 0.6 + rand() * 0.9, rand()]);
  const geoDatos = new THREE.BufferGeometry();
  geoDatos.setAttribute("position", new THREE.BufferAttribute(datosPos, 3));
  const datos = new THREE.Points(geoDatos, new THREE.PointsMaterial({ color: acento, size: 0.12, map: kit.glow, transparent: true, opacity: 0.8, depthWrite: false, blending: THREE.AdditiveBlending }));
  datos.frustumCulled = false;
  scene.add(datos);

  // ── Vestíbulo: arco de entrada y pasarela de luz ──
  const vest = new THREE.Group();
  vest.position.z = VESTIBULO_Z;
  scene.add(vest);
  const arcoPts = [v3(-2.2, 0, 0), v3(-2.2, 4.2, 0), v3(2.2, 4.2, 0), v3(2.2, 0, 0)];
  const matArco = kit.matLinea(acento, 0.85);
  for (const dz of [0, -0.6]) {
    const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints(arcoPts.map((p) => p.clone().setZ(dz))), matArco);
    vest.add(l);
  }
  const marcoArco = kit.caja(0.3, 4.2, 0.6, { borde: COLOR.bright, opBorde: 0.6 });
  marcoArco.grupo.position.set(-2.35, 0, -0.3);
  vest.add(marcoArco.grupo);
  const marcoArco2 = kit.caja(0.3, 4.2, 0.6, { borde: COLOR.bright, opBorde: 0.6 });
  marcoArco2.grupo.position.set(2.35, 0, -0.3);
  vest.add(marcoArco2.grupo);
  const texBienvenida = kit.textura(512, 96, (c, w, h) => {
    c.fillStyle = "rgba(35,72,212,0.35)";
    c.fillRect(0, 0, w, h);
    c.fillStyle = "rgba(213,224,255,0.95)";
    c.font = "700 46px system-ui, sans-serif";
    c.textAlign = "center";
    c.fillText("CENTRAL VIVA", w / 2, h / 2 + 16);
  });
  const matBienvenida = new THREE.MeshBasicMaterial({ map: texBienvenida, transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
  const bienvenida = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 0.68), matBienvenida);
  bienvenida.position.set(0, 4.8, 0);
  vest.add(bienvenida);
  const pasarela: THREE.Sprite[] = [];
  for (let i = 0; i < 12; i++) {
    for (const x of [-1.4, 1.4]) {
      const s = kit.sprite(acento, 0.6, 0.4);
      s.position.set(x, 0.08, 7 - i * 1.1);
      vest.add(s);
      pasarela.push(s);
    }
  }
  const visitanteVR = kit.figura(COLOR.ice, 1.7);
  vest.add(visitanteVR.grupo);

  // ── Sede Inteligente: maqueta sobre mesa ──
  const sede = new THREE.Group();
  sede.position.copy(SEDE);
  scene.add(sede);
  const mesaSede = new THREE.Mesh(new THREE.CylinderGeometry(1.35, 1.1, 0.95, 32), new THREE.MeshStandardMaterial({ color: COLOR.building, roughness: 0.6, metalness: 0.3 }));
  mesaSede.position.y = 0.475;
  sede.add(mesaSede);
  const discoSede = kit.anillo(0.2, 1.3, COLOR.indigo, 48);
  (discoSede.material as THREE.MeshBasicMaterial).opacity = 0.25;
  discoSede.position.y = 0.97;
  sede.add(discoSede);
  const maqueta = new THREE.Group();
  maqueta.position.y = 0.97;
  sede.add(maqueta);
  const matMaqueta = kit.matLinea(COLOR.bright, 0.8);
  const edificios: Array<[number, number, number, number, number]> = [
    [0, 0, 0.5, 0.75, 0.4],
    [-0.5, 0.3, 0.3, 0.35, 0.3],
    [0.5, -0.3, 0.35, 0.5, 0.25],
    [0.45, 0.45, 0.25, 0.25, 0.25],
    [-0.4, -0.5, 0.35, 0.2, 0.3],
  ];
  for (const [x, z, w, h, d] of edificios) {
    const g = new THREE.BoxGeometry(w, h, d);
    g.translate(x, h / 2, z);
    maqueta.add(new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: COLOR.building, transparent: true, opacity: 0.7 })));
    maqueta.add(new THREE.LineSegments(new THREE.EdgesGeometry(g), matMaqueta));
  }
  const cerca = kit.linea([v3(-0.95, 0.04, -0.85), v3(0.95, 0.04, -0.85), v3(0.95, 0.04, 0.85), v3(-0.95, 0.04, 0.85)], COLOR.cyan, 0.7, true);
  maqueta.add(cerca);
  const conosSede: THREE.Mesh[] = [];
  for (const [x, z, ry] of [[-0.95, -0.85, 0.8], [0.95, 0.85, -2.4], [0.95, -0.85, -0.8]]) {
    const cg = new THREE.ConeGeometry(0.22, 0.6, 16, 1, true);
    cg.translate(0, -0.3, 0);
    const cono = new THREE.Mesh(cg, kit.basico(COLOR.indigo, 0.18, true));
    cono.position.set(x, 0.35, z);
    cono.rotation.set(0, ry, 1.0);
    maqueta.add(cono);
    conosSede.push(cono);
  }
  const escanerSede = kit.anillo(1.2, 1.26, acento, 64);
  escanerSede.position.y = 1.0;
  sede.add(escanerSede);

  // ── Mesa Directiva con IA ──
  const mesa = new THREE.Group();
  mesa.position.copy(MESA);
  mesa.lookAt(0, 0, 0);
  scene.add(mesa);
  const tablero = kit.caja(1.5, 0.08, 3.2, { relleno: COLOR.french, borde: COLOR.bright, opRelleno: 0.85 });
  tablero.grupo.position.y = 0.78;
  mesa.add(tablero.grupo);
  const pata = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.3, 0.78, 12), new THREE.MeshStandardMaterial({ color: COLOR.building }));
  pata.position.y = 0.39;
  mesa.add(pata);
  const matSilla = kit.matLinea(COLOR.cyan, 0.55);
  const directores: Array<{ grupo: THREE.Group; mat: THREE.MeshBasicMaterial; halo: THREE.Sprite }> = [];
  for (let i = 0; i < 6; i++) {
    const lado = i < 3 ? -1 : 1;
    const z = -1.0 + (i % 3) * 1.0;
    const silla = new THREE.Group();
    silla.position.set(lado * 1.2, 0, z);
    const asiento = new THREE.BoxGeometry(0.5, 0.06, 0.5);
    asiento.translate(0, 0.48, 0);
    const respaldo = new THREE.BoxGeometry(0.06, 0.6, 0.5);
    respaldo.translate(lado * 0.25, 0.8, 0);
    silla.add(new THREE.LineSegments(new THREE.EdgesGeometry(asiento), matSilla), new THREE.LineSegments(new THREE.EdgesGeometry(respaldo), matSilla));
    mesa.add(silla);
    const dir = kit.figura(COLOR.cyan, 1.25);
    dir.grupo.position.set(lado * 1.15, 0.28, z);
    dir.mat.opacity = 0.35;
    mesa.add(dir.grupo);
    directores.push(dir);
  }
  const datosMesa = new THREE.Group();
  datosMesa.position.y = 1.6;
  mesa.add(datosMesa);
  const barras: THREE.Mesh[] = [];
  const matBarra = kit.basico(acento, 0.75, true);
  for (let i = 0; i < 6; i++) {
    const g = new THREE.BoxGeometry(0.16, 1, 0.16);
    g.translate(0, 0.5, 0);
    const b = new THREE.Mesh(g, matBarra);
    b.position.set(-0.2, -0.75, -1.05 + i * 0.42);
    datosMesa.add(b);
    barras.push(b);
  }
  const dona = new THREE.Group();
  dona.position.set(0.25, 0.25, 0);
  datosMesa.add(dona);
  const segs: Array<[number, number, number]> = [
    [0, 2.6, COLOR.green],
    [2.7, 1.9, COLOR.cyan],
    [4.7, 1.5, COLOR.amber],
  ];
  for (const [a0, len, col] of segs) {
    const r = new THREE.Mesh(new THREE.RingGeometry(0.32, 0.46, 40, 1, a0, len), kit.basico(col, 0.8, true));
    r.rotation.y = Math.PI / 2;
    dona.add(r);
  }

  // ── Vigía: orbe de voz ──
  const vigia = new THREE.Group();
  vigia.position.copy(VIGIA);
  scene.add(vigia);
  const orbe = new THREE.Mesh(new THREE.IcosahedronGeometry(0.5, 3), kit.basico(acento, 0.16, true));
  const orbeMalla = kit.bordes(new THREE.IcosahedronGeometry(0.62, 1), COLOR.bright, 0.6);
  const orbeGlow = kit.sprite(acento, 3.2, 0.6);
  vigia.add(orbe, orbeMalla, orbeGlow);
  const nVoz = 128;
  const anillosVoz = [0, 1, 2].map((i) => {
    const g = new THREE.BufferGeometry().setFromPoints(Array.from({ length: nVoz }, () => v3(0, 0, 0)));
    const l = new THREE.LineLoop(g, kit.matLinea(i === 0 ? acento : COLOR.bright, 0.8 - i * 0.2));
    l.rotation.x = i === 0 ? 0 : i === 1 ? 1.1 : -1.1;
    l.frustumCulled = false;
    vigia.add(l);
    return l;
  });
  const pieVigia = kit.anillo(0.5, 0.62, COLOR.bright, 48);
  pieVigia.position.y = -VIGIA.y + 0.03;
  vigia.add(pieVigia);

  // ── Gafas de realidad virtual ──
  const gafas = new THREE.Group();
  gafas.position.copy(GAFAS);
  scene.add(gafas);
  const gafasCuerpo = new THREE.Group();
  gafas.add(gafasCuerpo);
  const visor = new THREE.BoxGeometry(1.3, 0.62, 0.55, 2, 2, 2);
  const matVisor = new THREE.MeshStandardMaterial({ color: 0x1a2a55, roughness: 0.35, metalness: 0.5 });
  gafasCuerpo.add(new THREE.Mesh(visor, matVisor), kit.bordes(visor, COLOR.bright, 0.7));
  const frente = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.52), kit.basico(acento, 0.25, true));
  frente.position.z = 0.28;
  gafasCuerpo.add(frente);
  const correa = new THREE.Mesh(new THREE.TorusGeometry(0.66, 0.05, 8, 40, Math.PI), new THREE.MeshStandardMaterial({ color: 0x2a3b66 }));
  correa.rotation.set(Math.PI / 2, Math.PI, 0);
  correa.position.z = -0.27;
  gafasCuerpo.add(correa);
  const lentes = [-0.3, 0.3].map((x) => {
    const r = new THREE.Mesh(new THREE.RingGeometry(0.1, 0.17, 32), kit.basico(acento, 0.9, true));
    r.position.set(x, 0, -0.285);
    r.rotation.y = Math.PI;
    const s = kit.sprite(acento, 0.9, 0.6);
    s.position.set(x, 0, -0.32);
    gafasCuerpo.add(r, s);
    return s;
  });
  const rayos = [-0.3, 0.3].map((x) => {
    const g = new THREE.ConeGeometry(0.4, 1.6, 20, 1, true);
    g.translate(0, -0.8, 0);
    const m = new THREE.Mesh(g, kit.basico(acento, 0, true));
    m.position.set(x, 0, -0.3);
    m.rotation.x = -Math.PI / 2;
    gafasCuerpo.add(m);
    return m.material as THREE.MeshBasicMaterial;
  });
  const pieGafas = kit.anillo(0.6, 0.72, COLOR.bright, 48);
  pieGafas.position.y = -GAFAS.y + 0.03;
  gafas.add(pieGafas);

  const hotspots: Record<string, THREE.Vector3> = {
    vestibulo: v3(0, 5.6, VESTIBULO_Z),
    central: v3(0, 5.1, 0),
    sede: SEDE.clone().setY(2.1),
    mesa: MESA.clone().setY(2.6),
    vigia: VIGIA.clone().setY(VIGIA.y + 1.2),
    gafas: GAFAS.clone().setY(GAFAS.y + 1.0),
  };

  return {
    general: enc(9, 14, 19, 0, 1.8, 0),
    encuadres: {
      vestibulo: enc(0, 2.6, VESTIBULO_Z + 10, 0, 2.6, VESTIBULO_Z - 5),
      central: enc(0, 3.3, 6.5, 0, 3.4, -6),
      sede: enc(SEDE.x - 3.6, 4.0, SEDE.z + 4.6, SEDE.x, 1.0, SEDE.z),
      mesa: enc(MESA.x + 4.6, 4.6, MESA.z + 5.6, MESA.x, 1.1, MESA.z),
      vigia: enc(VIGIA.x + 3.8, 3.4, VIGIA.z + 5.2, VIGIA.x, VIGIA.y, VIGIA.z),
      gafas: enc(GAFAS.x - 3.2, 3.3, GAFAS.z + 4.2, GAFAS.x, GAFAS.y, GAFAS.z),
    },
    hotspots,
    orbita: (f) => (f === null ? 2.5 : f === "central" ? 1.6 : 0.8),
    update(t) {
      const w = {
        vestibulo: kit.peso("vestibulo"),
        central: kit.peso("central"),
        sede: kit.peso("sede"),
        mesa: kit.peso("mesa"),
        vigia: kit.peso("vigia"),
        gafas: kit.peso("gafas"),
      };
      suelo.u.uTime.value = t;
      matEstructura.opacity = 0.3 + 0.2 * w.central;

      // Tableros
      paneles.forEach((p, i) => {
        p.mat.opacity = 0.55 + 0.4 * w.central + 0.05 * Math.sin(t * 1.3 + i);
        p.marco.color.copy(colBright).lerp(acento, w.central);
        p.marco.opacity = 0.55 + 0.4 * w.central;
        if (p.anim === "scrollY") p.tex.offset.y = (t * 0.04) % 1;
        if (p.anim === "scrollX") p.tex.offset.x = (t * 0.03) % 1;
      });
      const pa = geoOnda.attributes.position as THREE.BufferAttribute;
      const th0 = grados(70) - ARCO_P * 0.42;
      const habla = 0.35 + 0.65 * Math.max(0, Math.sin(t * 0.9));
      for (let i = 0; i < nOnda; i++) {
        const u = i / (nOnda - 1);
        const env = Math.sin(u * Math.PI);
        const amp = env * habla * (0.35 * Math.sin(u * 40 + t * 9) + 0.2 * Math.sin(u * 97 - t * 13));
        const th = th0 + u * ARCO_P * 0.84;
        pa.setXYZ(i, Math.sin(th) * (RP - 0.08), YP - 0.15 + amp, Math.cos(th) * (RP - 0.08));
      }
      pa.needsUpdate = true;

      // Holograma central
      holo.rotation.y = t * (0.3 + 0.5 * w.central);
      holoCasco.rotation.x = Math.sin(t * 0.4) * 0.2;
      holo.position.y = 3.1 + Math.sin(t * 0.9) * 0.12;
      orbitas.forEach((o, i) => (o.rotation.y = t * (0.4 + i * 0.25) * (i % 2 ? -1 : 1)));
      holoGlow.material.opacity = 0.45 + 0.35 * w.central;
      (columna.material as THREE.MeshBasicMaterial).opacity = 0.06 + 0.06 * w.central;
      for (let i = 0; i < nDatos; i++) {
        const [a, r, s] = datosSeed[i];
        const y = ((t * 0.35 + s) % 1) * 4.6 + 0.5;
        datosPos[i * 3] = Math.cos(a + t * 0.5) * r;
        datosPos[i * 3 + 1] = y;
        datosPos[i * 3 + 2] = Math.sin(a + t * 0.5) * r;
      }
      (geoDatos.attributes.position as THREE.BufferAttribute).needsUpdate = true;

      // Vestíbulo: la pasarela guía al visitante hacia la sala.
      pasarela.forEach((s, i) => {
        const fila = Math.floor(i / 2);
        const ph = fase(t * 1.2 - fila * 0.12, 1);
        s.material.opacity = (0.15 + 0.6 * w.vestibulo) * (0.3 + 0.7 * Math.pow(1 - ph, 3));
      });
      matArco.opacity = 0.5 + 0.45 * w.vestibulo;
      matBienvenida.opacity = 0.55 + 0.4 * w.vestibulo;
      const pv = fase(t, 9);
      visitanteVR.grupo.position.set(0, 0, 8 - pv * 9);
      visitanteVR.mat.opacity = Math.min(1, pv * 6, (1 - pv) * 5) * 0.85;
      visitanteVR.halo.material.opacity = visitanteVR.mat.opacity * 0.4;

      // Sede: la maqueta respira y un anillo la escanea.
      maqueta.rotation.y = t * 0.12;
      matMaqueta.color.copy(colBright).lerp(acento, w.sede);
      conosSede.forEach((c, i) => {
        c.rotation.y += Math.sin(t * 0.8 + i) * 0.004;
        (c.material as THREE.MeshBasicMaterial).opacity = 0.12 + 0.25 * w.sede;
      });
      const ps = fase(t, 3);
      escanerSede.position.y = 1.0 + ps * 0.9;
      escanerSede.scale.setScalar(1 - ps * 0.25);
      (escanerSede.material as THREE.MeshBasicMaterial).opacity = (1 - ps) * (0.2 + 0.7 * w.sede);

      // Mesa directiva: los datos crecen sobre la mesa.
      barras.forEach((b, i) => {
        const v = 0.35 + 0.55 * (0.5 + 0.5 * Math.sin(t * 0.7 + i * 1.3));
        b.scale.y = 0.08 + v * (0.35 + 0.65 * w.mesa);
      });
      matBarra.opacity = 0.3 + 0.3 * w.mesa;
      dona.rotation.x = t * 0.5;
      dona.scale.setScalar(0.6 + 0.4 * w.mesa);
      directores.forEach((d, i) => {
        d.mat.opacity = 0.14 + 0.16 * w.mesa + 0.12 * Math.max(0, Math.sin(t * 1.5 + i * 2.1)) * w.mesa;
        d.halo.material.opacity = 0.04 + 0.08 * w.mesa;
      });

      // Vigía: el orbe "habla".
      const voz = 0.25 + 0.75 * w.vigia;
      const hablando = Math.max(0, Math.sin(t * 1.1)) * 0.8 + 0.2;
      anillosVoz.forEach((l, k) => {
        const p = l.geometry.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < nVoz; i++) {
          const a = (i / nVoz) * Math.PI * 2;
          const n = Math.sin(a * 6 + t * 7 + k) * 0.5 + Math.sin(a * 13 - t * 11) * 0.3 + Math.sin(a * 3 + t * 3) * 0.2;
          const r = 0.85 + k * 0.12 + n * 0.16 * voz * hablando;
          p.setXYZ(i, Math.cos(a) * r, 0, Math.sin(a) * r);
        }
        p.needsUpdate = true;
        l.rotation.z = t * 0.2 * (k + 1);
      });
      orbe.scale.setScalar(1 + 0.08 * voz * hablando * Math.sin(t * 14));
      orbeGlow.material.opacity = 0.35 + 0.5 * voz * hablando;
      orbeMalla.rotation.y = t * 0.4;
      vigia.position.y = VIGIA.y + Math.sin(t * 0.8) * 0.1;

      // Gafas
      gafas.position.y = GAFAS.y + Math.sin(t * 0.9 + 1) * 0.12;
      gafasCuerpo.rotation.y = Math.PI + Math.sin(t * 0.35) * 0.6 + 0.4;
      gafasCuerpo.rotation.x = Math.sin(t * 0.5) * 0.08;
      lentes.forEach((s) => (s.material.opacity = 0.4 + 0.5 * w.gafas * (0.7 + 0.3 * Math.sin(t * 3))));
      rayos.forEach((m) => (m.opacity = 0.12 * w.gafas));
    },
  };
}

const crear: FabricaEscena = (op) => montarEscena("inmersiva", op, construir, { fov: 42, niebla: 0.02, polarMax: 1.42 });

export default crear;
