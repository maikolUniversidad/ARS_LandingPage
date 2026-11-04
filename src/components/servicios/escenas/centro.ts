/**
 * Escena «centro»: el CENTRO DE OPERACIONES sobre un mapa-ciudad holográfico.
 *
 * Manzanas procedurales con calles en grilla, sedes marcadas con pines y
 * vigilantes (puntos) recorriendo sus rutas. Cada foco cuenta un servicio:
 * zonas que se levantan y un supervisor que sale de la suya (alerta), un
 * recorrido GPS que se dibuja con su cabezal de reproducción, la sala del
 * coordinador («¿quién cubre?»), barras de cumplimiento por persona y alias
 * cortos que se posan sobre cada sede.
 *
 * Focos: ciudad · zonas · coordinador · recorridos · cumplimiento · alias.
 */

import * as THREE from "three";
import { COLOR, Kit, arco, clamp01, enc, fase, montarEscena, mulberry32, ramp, suave, v3, type Escena } from "./_edificio-motor";
import type { FabricaEscena } from "./contrato";

const P = 5.2; // paso de manzana (manzana + calle)
const NB = 6; // manzanas a cada lado del centro
const centroManzana = (bx: number, bz: number) => v3((bx + 0.5) * P, 0, (bz + 0.5) * P);
const cruce = (i: number, j: number) => v3(i * P, 0, j * P);

const SEDES: Array<[number, number]> = [
  [-1, -1],
  [2, 1],
  [-4, 2],
  [-3, -2],
  [4, 4],
  [-5, -5],
  [2, -4], // grupo del coordinador
  [4, -4],
  [3, -3],
];
const ALIAS = ["Sede Centro", "Torre 80", "CC Andino", "Planta 3", "Bodega Sur", "Clínica N"];
const CUMPLIMIENTO = [0.96, 0.88, 0.74, 0.99, 0.62, 0.91, 0.83, 0.47];

type Zona = { pts: Array<[number, number]>; color: number };
const ZONAS: Zona[] = [
  { pts: [[-21, -15], [-6, -16], [-5, -2], [-15, 0.5], [-22, -6]], color: COLOR.cyan },
  { pts: [[6, 2], [20.5, 1], [21.5, 14], [8.5, 15.5]], color: COLOR.amber },
  { pts: [[-25.5, 7], [-11, 6], [-10, 19.5], [-24.5, 20.5]], color: 0x9d7bff },
];

function construir(kit: Kit): Escena {
  const { scene } = kit;
  const acento = kit.acento;
  const rand = mulberry32(21);
  const colBright = new THREE.Color(COLOR.bright);
  const colRed = new THREE.Color(COLOR.red);
  const colGreen = new THREE.Color(COLOR.green);
  const colAmber = new THREE.Color(COLOR.amber);

  const suelo = kit.suelo(400, { reach: 0.02, celda: P, mayor: P * 4, placa: 36 });
  // Las calles quedan a mitad de manzana: la grilla del suelo marca los ejes de calle.
  scene.add(suelo.mesh);
  kit.polvo(500, 120, 30, 13);

  // ── Manzanas y edificios (instanciados) ──
  const sedeEn = new Set(SEDES.map(([a, b]) => `${a},${b}`));
  type Caja = { x: number; z: number; w: number; d: number; h: number };
  const cajas: Caja[] = [];
  for (let bx = -NB; bx < NB; bx++) {
    for (let bz = -NB; bz < NB; bz++) {
      const c = centroManzana(bx, bz);
      const dist = Math.hypot(c.x, c.z);
      const alto = sedeEn.has(`${bx},${bz}`) ? 0.4 : 1;
      for (const [qx, qz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
        if (rand() < 0.22) continue;
        const h = (0.3 + rand() * 1.1 + 4.5 * Math.exp(-(dist * dist) / 220) * rand()) * alto;
        cajas.push({ x: c.x + qx * 1.02, z: c.z + qz * 1.02, w: 1.3 + rand() * 0.45, d: 1.3 + rand() * 0.45, h });
      }
    }
  }
  const geoCaja = new THREE.BoxGeometry(1, 1, 1);
  geoCaja.translate(0, 0.5, 0);
  const matCaja = new THREE.MeshStandardMaterial({ color: 0x0f2350, roughness: 0.8, metalness: 0.2, transparent: true, opacity: 0.6 });
  const edificios = new THREE.InstancedMesh(geoCaja, matCaja, cajas.length);
  const m4 = new THREE.Matrix4();
  const aristas: THREE.Vector3[] = [];
  cajas.forEach((b, i) => {
    m4.makeScale(b.w, b.h, b.d).setPosition(b.x, 0, b.z);
    edificios.setMatrixAt(i, m4);
    const x0 = b.x - b.w / 2;
    const x1 = b.x + b.w / 2;
    const z0 = b.z - b.d / 2;
    const z1 = b.z + b.d / 2;
    const top = [v3(x0, b.h, z0), v3(x1, b.h, z0), v3(x1, b.h, z1), v3(x0, b.h, z1)];
    for (let k = 0; k < 4; k++) {
      aristas.push(top[k], top[(k + 1) % 4]);
      aristas.push(top[k].clone().setY(0.02), top[k]);
    }
  });
  scene.add(edificios);
  const matAristas = kit.matLinea(COLOR.bright, 0.5);
  scene.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(aristas), matAristas));
  const borde = kit.linea([v3(-NB * P - 1, 0.03, -NB * P - 1), v3(NB * P + 1, 0.03, -NB * P - 1), v3(NB * P + 1, 0.03, NB * P + 1), v3(-NB * P - 1, 0.03, NB * P + 1)], COLOR.bright, 0.6, true);
  scene.add(borde);

  // ── Sedes (pines) ──
  const pines = SEDES.map(([bx, bz], i) => {
    const p = centroManzana(bx, bz);
    const alto = i >= 6 ? 4.5 : 6.5;
    const linea = kit.linea([p.clone().setY(0.05), p.clone().setY(alto)], acento, 0.8);
    const cabeza = kit.sprite(acento, 2.2, 0.9);
    cabeza.position.copy(p).setY(alto);
    const anillo = kit.anillo(0.9, 1.05, acento, 40);
    anillo.position.copy(p).setY(0.06);
    scene.add(linea, cabeza, anillo);
    return { p, alto, cabeza, anillo, linea };
  });

  // ── Vigilantes recorriendo sus rutas ──
  const nG = kit.lowPower ? 12 : 22;
  const rutas = Array.from({ length: nG }, () => {
    const i = Math.floor(rand() * (NB * 2 - 3)) - NB + 1;
    const j = Math.floor(rand() * (NB * 2 - 3)) - NB + 1;
    const a = 1 + Math.floor(rand() * 2);
    const b = 1 + Math.floor(rand() * 2);
    const esq = [cruce(i, j), cruce(i + a, j), cruce(i + a, j + b), cruce(i, j + b)];
    if (rand() < 0.5) esq.reverse();
    return { esq, per: 2 * (a + b) * P, vel: 1.2 + rand() * 0.8, off: rand() };
  });
  const posG = new Float32Array(nG * 3);
  const geoG = new THREE.BufferGeometry();
  geoG.setAttribute("position", new THREE.BufferAttribute(posG, 3));
  const matG = new THREE.PointsMaterial({ color: COLOR.cyan, size: 1.5, map: kit.glow, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  const guardias = new THREE.Points(geoG, matG);
  guardias.frustumCulled = false;
  scene.add(guardias);
  const enPoligono = (esq: THREE.Vector3[], u: number, out: THREE.Vector3) => {
    const n = esq.length;
    const f = u * n;
    const k = Math.floor(f) % n;
    return out.lerpVectors(esq[k], esq[(k + 1) % n], f - Math.floor(f));
  };

  // ── Zonas y territorios ──
  const zonas = ZONAS.map((z) => {
    const shape = new THREE.Shape(z.pts.map(([x, zz]) => new THREE.Vector2(x, -zz)));
    const geo = new THREE.ExtrudeGeometry(shape, { depth: 1, bevelEnabled: false });
    geo.rotateX(-Math.PI / 2);
    const mat = kit.basico(z.color, 0, true);
    const mesh = new THREE.Mesh(geo, mat);
    const contorno = kit.linea(z.pts.map(([x, zz]) => v3(x, 0.08, zz)), z.color, 0, true);
    const tapa = kit.linea(z.pts.map(([x, zz]) => v3(x, 1, zz)), z.color, 0, true);
    const grupoTapa = new THREE.Group();
    grupoTapa.add(tapa);
    scene.add(mesh, contorno, grupoTapa);
    return { mesh, mat, contorno: contorno.material, tapa: tapa.material, grupoTapa, color: new THREE.Color(z.color) };
  });
  const SUP_A = v3(-14, 0, -8);
  const SUP_B = v3(0, 0, -5.4);
  const U_CRUCE = 0.62;
  const salida = SUP_A.clone().lerp(SUP_B, U_CRUCE);
  const supervisor = kit.figura(COLOR.amber, 1.9);
  scene.add(supervisor.grupo);
  const alertas = [0, 1, 2].map(() => {
    const r = kit.anillo(1, 1.2, COLOR.red, 48);
    r.position.copy(salida).setY(0.12);
    scene.add(r);
    return r;
  });

  // ── Recorrido GPS ──
  const esquinasRuta = [[-4, 4], [-4, 1], [-1, 1], [-1, -2], [2, -2], [2, 2], [5, 2], [5, -1]].map(([i, j]) => cruce(i, j).setY(0.35));
  const curvaRuta = new THREE.CurvePath<THREE.Vector3>();
  for (let k = 0; k < esquinasRuta.length - 1; k++) curvaRuta.add(new THREE.LineCurve3(esquinasRuta[k], esquinasRuta[k + 1]));
  const nRuta = 400;
  const ptsRuta = curvaRuta.getSpacedPoints(nRuta);
  const geoRuta = new THREE.BufferGeometry().setFromPoints(ptsRuta);
  const RADIAL = 6;
  const geoTubo = new THREE.TubeGeometry(curvaRuta, nRuta, 0.2, RADIAL, false);
  const matRuta = kit.basico(acento, 0, true);
  const ruta = new THREE.Mesh(geoTubo, matRuta);
  scene.add(ruta);
  const fantasmaRuta = new THREE.Line(geoRuta, kit.matLinea(COLOR.bright, 0));
  scene.add(fantasmaRuta);
  const cabezal = kit.sprite(0xffffff, 2.4, 0);
  scene.add(cabezal);
  const paradas = [0.18, 0.43, 0.71].map((u) => {
    const s = kit.sprite(COLOR.amber, 1.5, 0);
    s.position.copy(curvaRuta.getPointAt(u));
    scene.add(s);
    return { s, u };
  });

  // ── Coordinador: «¿quién cubre?» ──
  const [c1, c2, c3] = [pines[6].p, pines[7].p, pines[8].p];
  const guardiaA = kit.figura(COLOR.cyan, 1.6);
  guardiaA.grupo.position.copy(c1).add(v3(1.6, 0, 1.6));
  const guardiaB = kit.figura(COLOR.cyan, 1.6);
  guardiaB.grupo.position.copy(c2).add(v3(-1.6, 0, 1.6));
  scene.add(guardiaA.grupo, guardiaB.grupo);
  const enlaceAB = kit.flujo(arco(guardiaA.grupo.position.clone().setY(1.8), guardiaB.grupo.position.clone().setY(1.8), 5), acento, 26, 0.7);
  const lineaAB = new THREE.Line(new THREE.BufferGeometry().setFromPoints(arco(guardiaA.grupo.position.clone().setY(1.8), guardiaB.grupo.position.clone().setY(1.8), 5).getPoints(48)), kit.matLinea(acento, 0));
  scene.add(lineaAB);
  const cubrirPts = [guardiaB.grupo.position.clone().setY(0.2), v3(guardiaB.grupo.position.x, 0.2, c3.z + 1.6), c3.clone().add(v3(1.2, 0.2, 1.2))];
  const curvaCubrir = new THREE.CatmullRomCurve3(cubrirPts, false, "catmullrom", 0.1);
  const geoCubrir = new THREE.BufferGeometry().setFromPoints(curvaCubrir.getPoints(80));
  const matCubrir = new THREE.LineDashedMaterial({ color: COLOR.green, dashSize: 0.6, gapSize: 0.4, transparent: true, opacity: 0 });
  const cubrir = new THREE.Line(geoCubrir, matCubrir);
  cubrir.computeLineDistances();
  scene.add(cubrir);
  const huecos = [0, 1].map(() => {
    const r = kit.anillo(1.4, 1.6, COLOR.amber, 48);
    r.position.copy(c3).setY(0.1);
    scene.add(r);
    return r;
  });

  // ── Cumplimiento por persona ──
  const CUMP_X = -20;
  const CUMP_Z = NB * P + 5;
  const barras = CUMPLIMIENTO.map((v, i) => {
    const g = new THREE.BoxGeometry(1.1, 1, 1.1);
    g.translate(0, 0.5, 0);
    const color = v >= 0.85 ? COLOR.green : v >= 0.7 ? COLOR.amber : COLOR.red;
    const mat = kit.basico(color, 0.75, true);
    const b = new THREE.Mesh(g, mat);
    b.position.set(CUMP_X + i * 2, 0, CUMP_Z);
    const persona = kit.sprite(COLOR.ice, 1.1, 0);
    persona.position.set(CUMP_X + i * 2, 0.3, CUMP_Z + 1.4);
    scene.add(b, persona);
    return { b, mat, v, persona };
  });
  const metaCump = kit.linea([v3(CUMP_X - 1, 4.5, CUMP_Z), v3(CUMP_X + CUMPLIMIENTO.length * 2 - 1, 4.5, CUMP_Z)], COLOR.ice, 0);
  const baseCump = kit.linea([v3(CUMP_X - 1, 0.04, CUMP_Z - 1), v3(CUMP_X + CUMPLIMIENTO.length * 2 - 1, 0.04, CUMP_Z - 1), v3(CUMP_X + CUMPLIMIENTO.length * 2 - 1, 0.04, CUMP_Z + 2.2), v3(CUMP_X - 1, 0.04, CUMP_Z + 2.2)], COLOR.bright, 0.3, true);
  scene.add(metaCump, baseCump);

  // ── Alias de clientes y sedes ──
  const etiquetas = ALIAS.map((texto, i) => {
    const tex = kit.textura(256, 64, (c, w, h) => {
      c.fillStyle = "rgba(2,10,24,0.82)";
      c.beginPath();
      c.roundRect(2, 2, w - 4, h - 4, 14);
      c.fill();
      c.strokeStyle = "rgba(95,216,255,0.95)";
      c.lineWidth = 3;
      c.stroke();
      c.fillStyle = "#e6eeff";
      c.font = "600 30px system-ui, sans-serif";
      c.textAlign = "center";
      c.textBaseline = "middle";
      c.fillText(texto, w / 2, h / 2 + 1);
    });
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0, depthWrite: false, depthTest: false }));
    s.scale.set(4.4, 1.1, 1);
    s.renderOrder = 12;
    scene.add(s);
    return { s, pin: pines[i], retraso: i * 0.18 };
  });

  const tmp = new THREE.Vector3();
  let progRuta = 0;
  let progCubrir = 0;
  const hotspots: Record<string, THREE.Vector3> = {
    ciudad: v3(0, 13, 0),
    zonas: v3(-12.5, 3, -6),
    coordinador: c3.clone().setY(6.5),
    recorridos: esquinasRuta[0].clone().setY(2.5),
    cumplimiento: v3(CUMP_X + 7, 6, CUMP_Z),
    alias: pines[1].p.clone().setY(9),
  };

  return {
    general: enc(0, 48, 56, 0, 0, 3),
    encuadres: {
      ciudad: enc(42, 34, 46, 0, 0, 0),
      zonas: enc(4, 24, 22, -10, 0, -5),
      coordinador: enc(30, 15, 6, 17, 1, -15),
      recorridos: enc(-16, 30, 38, 2, 0, 2),
      cumplimiento: enc(-4, 11, 56, -13, 2.2, CUMP_Z),
      alias: enc(16, 30, 38, -2, 2, 2),
    },
    hotspots,
    orbita: (f) => (f === null || f === "ciudad" ? 3 : 1),
    update(t) {
      const w = {
        ciudad: kit.peso("ciudad"),
        zonas: kit.peso("zonas"),
        coordinador: kit.peso("coordinador"),
        recorridos: kit.peso("recorridos"),
        cumplimiento: kit.peso("cumplimiento"),
        alias: kit.peso("alias"),
      };
      suelo.u.uTime.value = t;
      matAristas.color.copy(colBright).lerp(acento, 0.5 * w.ciudad);
      matAristas.opacity = 0.42 + 0.25 * w.ciudad;

      pines.forEach((p, i) => {
        const ph = fase(t, 2.4, i * 0.13);
        p.anillo.scale.setScalar(1 + ph * 1.6);
        (p.anillo.material as THREE.MeshBasicMaterial).opacity = (1 - ph) * (0.5 + 0.4 * w.ciudad);
        p.cabeza.material.opacity = 0.7 + 0.3 * Math.sin(t * 2 + i);
      });

      for (let i = 0; i < nG; i++) {
        const r = rutas[i];
        enPoligono(r.esq, (((t * r.vel) / r.per + r.off) % 1 + 1) % 1, tmp);
        posG[i * 3] = tmp.x;
        posG[i * 3 + 1] = 0.5;
        posG[i * 3 + 2] = tmp.z;
      }
      (geoG.attributes.position as THREE.BufferAttribute).needsUpdate = true;
      matG.opacity = 0.9 - 0.4 * Math.max(w.recorridos, w.cumplimiento);

      // Zonas: se extruyen; el supervisor sale de la suya → anillo de alerta.
      const z = w.zonas;
      const ph = fase(t, 7);
      const fuera = ph > U_CRUCE ? 1 : 0;
      supervisor.grupo.position.lerpVectors(SUP_A, SUP_B, Math.min(1, ph * 1.05));
      supervisor.grupo.visible = z > 0.02;
      supervisor.mat.color.copy(colAmber).lerp(colRed, fuera);
      supervisor.halo.material.color.copy(supervisor.mat.color);
      supervisor.mat.opacity = z;
      supervisor.halo.material.opacity = z * 0.6;
      zonas.forEach((zn, i) => {
        const alto = 0.05 + z * (1.4 + i * 0.5);
        zn.mesh.scale.y = alto;
        zn.grupoTapa.scale.y = alto;
        const alerta = i === 0 ? fuera * (0.5 + 0.5 * Math.sin(t * 9)) : 0;
        zn.mat.color.copy(zn.color).lerp(colRed, alerta * 0.7);
        zn.mat.opacity = 0.03 + z * 0.13;
        zn.contorno.opacity = 0.15 + z * 0.75;
        zn.tapa.opacity = z * 0.7;
        zn.contorno.color.copy(zn.color).lerp(colRed, alerta);
      });
      alertas.forEach((r, i) => {
        const p2 = fase(t, 1.2, i / 3);
        r.scale.setScalar(1 + p2 * 3.5);
        (r.material as THREE.MeshBasicMaterial).opacity = (1 - p2) * z * fuera;
      });
      suelo.u.uPulsoPos.value.copy(salida);
      suelo.u.uPulso.value = z * fuera * 0.6;

      // Recorrido GPS: la traza se dibuja y el cabezal la reproduce.
      const rc = w.recorridos;
      if (kit.foco === "recorridos") progRuta = kit.reducedMotion ? 1 : suave(ramp(kit.enFoco("recorridos") % 11, 0.6, 9));
      const pr = progRuta;
      const n = Math.max(2, Math.floor(nRuta * pr));
      geoTubo.setDrawRange(0, n * RADIAL * 6);
      matRuta.opacity = rc * 0.85;
      ruta.visible = rc > 0.01;
      (fantasmaRuta.material as THREE.LineBasicMaterial).opacity = rc * 0.3;
      cabezal.position.copy(ptsRuta[Math.min(n, nRuta) - 1]).setY(0.8);
      cabezal.material.opacity = rc * (0.75 + 0.25 * Math.sin(t * 8));
      paradas.forEach((pa) => {
        pa.s.material.opacity = rc * (pr >= pa.u ? 0.9 : 0.15);
        pa.s.scale.setScalar(pr >= pa.u ? 1.6 : 1.0);
      });

      // Coordinador: un sitio queda descubierto y se decide quién cubre.
      const co = w.coordinador;
      enlaceAB.update(t, co, 0.4);
      (lineaAB.material as THREE.LineBasicMaterial).opacity = co * 0.45;
      if (kit.foco === "coordinador") progCubrir = kit.reducedMotion ? 1 : ramp(kit.enFoco("coordinador") % 8, 1.5, 4.5);
      const pc = progCubrir;
      geoCubrir.setDrawRange(0, Math.floor(81 * pc));
      matCubrir.opacity = co * 0.95;
      guardiaA.mat.opacity = guardiaB.mat.opacity = 0.35 + 0.6 * co;
      guardiaB.mat.color.copy(colBright).lerp(colGreen, co * pc);
      huecos.forEach((r, i) => {
        const p2 = fase(t, 1.6, i / 2);
        r.scale.setScalar(1 + p2 * 1.4);
        (r.material as THREE.MeshBasicMaterial).opacity = (1 - p2) * co * (1 - pc * 0.7);
      });

      // Cumplimiento por persona: barras que suben.
      const cu = w.cumplimiento;
      barras.forEach((b, i) => {
        const k = clamp01(cu * 1.3 - i * 0.04);
        b.b.scale.y = 0.02 + suave(k) * b.v * 4.5;
        b.mat.opacity = 0.12 + 0.38 * cu;
        b.persona.material.opacity = cu * 0.8;
      });
      (metaCump.material as THREE.LineBasicMaterial).opacity = cu * 0.5;
      (baseCump.material as THREE.LineBasicMaterial).opacity = 0.15 + cu * 0.5;

      // Alias: caen desde arriba y se «pegan» sobre su sede.
      const al = w.alias;
      etiquetas.forEach((e) => {
        const k = clamp01((al - e.retraso * 0.6) / 0.55);
        const pega = 1 - Math.pow(1 - k, 3);
        e.s.position.copy(e.pin.p).setY(e.pin.alto + 1.3 + (1 - pega) * 9);
        e.s.material.opacity = k;
        e.s.visible = k > 0.01;
        e.pin.cabeza.scale.setScalar(2.2 + 0.6 * al);
      });

    },
  };
}

const crear: FabricaEscena = (op) => montarEscena("centro", op, construir, { fov: 40, niebla: 0.008, polarMax: 1.35 });

export default crear;
