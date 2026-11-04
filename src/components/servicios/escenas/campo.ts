/**
 * Escena «campo»: OPERACIÓN EN CAMPO — un puesto de vigilancia de noche.
 *
 * Sede cercada con bodega, caseta de vigilancia, portería con talanquera y
 * postes de luz. El vigilante hace su ronda marcando puntos QR (aunque no haya
 * señal), marca asistencia con selfie y rostro, el supervisor llega a pasar
 * revista, la portería registra visitantes con escarapela y el inventario
 * muestra casillero, vehículo y caninos.
 *
 * Focos: puesto · asistencia · ronda · supervision · porteria · recursos.
 */

import * as THREE from "three";
import { COLOR, Kit, clamp01, enc, fase, montarEscena, mulberry32, ramp, suave, v3, type Escena } from "./_edificio-motor";
import type { FabricaEscena } from "./contrato";

const FW = 15; // medio ancho de la cerca
const FD = 11; // medio fondo de la cerca
const CASETA = v3(4.2, 0, 8.6);
const TELEFONO = v3(7.4, 1.95, 12.6);
const PIVOTE = v3(-2.3, 1.0, FD);
const U_QR = [0.08, 0.27, 0.47, 0.66, 0.86];

function construir(kit: Kit): Escena {
  const { scene } = kit;
  const acento = kit.acento;
  const rand = mulberry32(31);
  const colGreen = new THREE.Color(COLOR.green);
  const colBright = new THREE.Color(COLOR.bright);
  const colRed = new THREE.Color(COLOR.red);
  const colAmber = new THREE.Color(COLOR.amber);

  const suelo = kit.suelo(260, { reach: 0.028, celda: 2, mayor: 10, placa: 22 });
  scene.add(suelo.mesh);
  kit.polvo(400, 80, 20, 17);

  // Vía exterior frente a la portería
  const via: THREE.Vector3[] = [];
  for (const z of [FD + 3, FD + 7.5]) via.push(v3(-40, 0.03, z), v3(40, 0.03, z));
  for (let x = -38; x < 40; x += 4) via.push(v3(x, 0.03, FD + 5.25), v3(x + 2, 0.03, FD + 5.25));
  scene.add(kit.segmentos(via, COLOR.steel, 0.3));

  // ── Cerca perimetral (con hueco para la portería) ──
  const postes: THREE.Vector3[] = [];
  const esquinas = [v3(-FW, 0, -FD), v3(FW, 0, -FD), v3(FW, 0, FD), v3(-FW, 0, FD)];
  for (let i = 0; i < 4; i++) {
    const a = esquinas[i];
    const b = esquinas[(i + 1) % 4];
    const pasos = Math.round(a.distanceTo(b) / 2.2);
    for (let s = 0; s < pasos; s++) {
      const p = a.clone().lerp(b, s / pasos);
      if (i === 2 && Math.abs(p.x) < 2.5) continue;
      postes.push(p);
    }
  }
  const geoPoste = new THREE.BoxGeometry(0.12, 1.9, 0.12);
  geoPoste.translate(0, 0.95, 0);
  const postesMesh = new THREE.InstancedMesh(geoPoste, new THREE.MeshBasicMaterial({ color: COLOR.french }), postes.length);
  const m4 = new THREE.Matrix4();
  postes.forEach((p, i) => {
    m4.makeTranslation(p.x, 0, p.z);
    postesMesh.setMatrixAt(i, m4);
  });
  scene.add(postesMesh);
  const rieles: THREE.Vector3[] = [];
  for (const y of [0.75, 1.8]) {
    rieles.push(v3(-2.5, y, FD), v3(-FW, y, FD), v3(-FW, y, FD), v3(-FW, y, -FD), v3(-FW, y, -FD), v3(FW, y, -FD), v3(FW, y, -FD), v3(FW, y, FD), v3(FW, y, FD), v3(2.5, y, FD));
  }
  const matCerca = kit.matLinea(COLOR.bright, 0.5);
  scene.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(rieles), matCerca));

  // ── Edificios ──
  const bodega = kit.caja(14, 5, 9, { opBorde: 0.8 });
  bodega.grupo.position.set(-4, 0, -4);
  scene.add(bodega.grupo);
  const franjas: THREE.Vector3[] = [];
  for (let x = -10.5; x <= 2.5; x += 1.3) franjas.push(v3(x, 0.4, 0.52), v3(x, 4.2, 0.52));
  scene.add(kit.segmentos(franjas, COLOR.french, 0.5));

  const caseta = kit.caja(3, 2.6, 2.6, { relleno: 0x16306e, borde: COLOR.bright });
  caseta.grupo.position.copy(CASETA);
  scene.add(caseta.grupo);
  const techoCaseta = kit.caja(3.6, 0.18, 3.2, { relleno: 0x0c1d48, borde: COLOR.bright });
  techoCaseta.grupo.position.copy(CASETA).setY(2.6);
  scene.add(techoCaseta.grupo);
  const matVentana = new THREE.MeshBasicMaterial({ color: 0xffd99a, transparent: true, opacity: 0.55 });
  const ventana = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.9), matVentana);
  ventana.position.copy(CASETA).add(v3(0, 1.6, 1.31));
  scene.add(ventana);
  const luzCaseta = kit.sprite(0xffd99a, 5, 0.35);
  luzCaseta.position.copy(CASETA).add(v3(0, 1.5, 2));
  scene.add(luzCaseta);
  const balizaCaseta = kit.sprite(acento, 1.6, 0.8);
  balizaCaseta.position.copy(CASETA).setY(3.1);
  scene.add(balizaCaseta);

  // Postes de luz con cono
  const lamparas: Array<{ cono: THREE.MeshBasicMaterial; glow: THREE.Sprite }> = [];
  for (const [x, z] of [[-FW + 1, FD - 1], [FW - 1, FD - 1], [-FW + 1, -FD + 1], [FW - 1, -FD + 1], [6, -1], [-2, 9]]) {
    scene.add(kit.linea([v3(x, 0, z), v3(x, 5.2, z)], COLOR.steel, 0.7));
    const glow = kit.sprite(0xffe6b0, 2.2, 0.8);
    glow.position.set(x, 5.2, z);
    const g = new THREE.ConeGeometry(2.8, 5.2, 24, 1, true);
    g.translate(0, -2.6, 0);
    const mat = new THREE.MeshBasicMaterial({ color: 0xffe6b0, transparent: true, opacity: 0.05, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending });
    const cono = new THREE.Mesh(g, mat);
    cono.position.set(x, 5.2, z);
    const charco = kit.anillo(0, 2.6, 0xffe6b0, 32);
    (charco.material as THREE.MeshBasicMaterial).opacity = 0.05;
    charco.position.set(x, 0.04, z);
    scene.add(glow, cono, charco);
    lamparas.push({ cono: mat, glow });
  }

  // ── Ronda con puntos QR ──
  const ruta = new THREE.CatmullRomCurve3([v3(7, 0, 6.5), v3(12.5, 0, 2), v3(12.5, 0, -8.5), v3(0, 0, -9.5), v3(-12.5, 0, -9), v3(-12.5, 0, 3), v3(-6, 0, 6.5), v3(1, 0, 6)], true, "catmullrom", 0.2);
  const geoRuta = new THREE.BufferGeometry().setFromPoints(ruta.getSpacedPoints(200).map((p) => p.setY(0.06)));
  const matRuta = new THREE.LineDashedMaterial({ color: COLOR.bright, dashSize: 0.6, gapSize: 0.45, transparent: true, opacity: 0.25 });
  const lineaRuta = new THREE.Line(geoRuta, matRuta);
  lineaRuta.computeLineDistances();
  scene.add(lineaRuta);
  const texQR = kit.textura(64, 64, (c, w) => {
    c.fillStyle = "#ffffff";
    c.fillRect(0, 0, w, w);
    c.fillStyle = "#0a1736";
    const n = 9;
    const s = w / n;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (rand() < 0.45) c.fillRect(i * s, j * s, s, s);
    for (const [x, y] of [[0, 0], [n - 3, 0], [0, n - 3]]) {
      c.fillRect(x * s, y * s, 3 * s, 3 * s);
      c.fillStyle = "#ffffff";
      c.fillRect((x + 0.6) * s, (y + 0.6) * s, 1.8 * s, 1.8 * s);
      c.fillStyle = "#0a1736";
      c.fillRect((x + 1) * s, (y + 1) * s, s, s);
    }
  });
  texQR.magFilter = THREE.NearestFilter;
  const geoPlaca = new THREE.PlaneGeometry(0.9, 0.9);
  const checkpoints = U_QR.map((u) => {
    const p = ruta.getPointAt(u);
    const tg = ruta.getTangentAt(u);
    const poste = kit.linea([p.clone(), p.clone().setY(1.5)], COLOR.steel, 0.8);
    const mat = new THREE.MeshBasicMaterial({ map: texQR, color: COLOR.bright, transparent: true, opacity: 0.85, side: THREE.DoubleSide });
    const placa = new THREE.Mesh(geoPlaca, mat);
    placa.position.copy(p).setY(1.95);
    placa.rotation.y = Math.atan2(tg.x, tg.z) + Math.PI / 2;
    const glow = kit.sprite(COLOR.green, 3.4, 0);
    glow.position.copy(placa.position);
    const onda = kit.anillo(0.8, 0.98, COLOR.green, 40);
    onda.position.copy(p).setY(0.07);
    scene.add(poste, placa, glow, onda);
    return { u, p, mat, glow, onda };
  });
  const texOffline = kit.textura(128, 128, (c, w) => {
    c.strokeStyle = "rgba(255,255,255,0.95)";
    c.lineWidth = 8;
    c.beginPath();
    c.arc(w * 0.38, w * 0.56, w * 0.17, Math.PI * 0.5, Math.PI * 1.5);
    c.arc(w * 0.55, w * 0.42, w * 0.2, Math.PI * 1.05, Math.PI * 1.95);
    c.arc(w * 0.7, w * 0.58, w * 0.14, Math.PI * 1.5, Math.PI * 0.5);
    c.closePath();
    c.stroke();
    c.strokeStyle = "rgba(255,59,92,1)";
    c.beginPath();
    c.moveTo(w * 0.18, w * 0.18);
    c.lineTo(w * 0.86, w * 0.86);
    c.stroke();
  });
  const offline = new THREE.Sprite(new THREE.SpriteMaterial({ map: texOffline, transparent: true, opacity: 0, depthWrite: false }));
  offline.scale.setScalar(1.3);
  scene.add(offline);
  const nubeCola = kit.sprite(COLOR.amber, 0.7, 0);
  scene.add(nubeCola);

  // ── Vigilante ──
  const vigilante = kit.figura(COLOR.cyan, 1.75);
  scene.add(vigilante.grupo);
  const PUESTO_VIG = v3(6, 0, 11.4);

  // ── Asistencia: teléfono con selfie y rostro ──
  const tel = new THREE.Group();
  tel.position.copy(TELEFONO);
  scene.add(tel);
  const cuerpoTel = new THREE.BoxGeometry(0.8, 1.55, 0.08);
  tel.add(new THREE.Mesh(cuerpoTel, new THREE.MeshStandardMaterial({ color: 0x0c1d48, roughness: 0.4, metalness: 0.5, transparent: true })));
  const bordeTel = kit.bordes(cuerpoTel, COLOR.bright, 0.9);
  tel.add(bordeTel);
  const texSelfie = kit.textura(160, 300, (c, w, h) => {
    c.fillStyle = "rgba(20,38,100,0.9)";
    c.fillRect(0, 0, w, h);
    c.strokeStyle = "rgba(213,224,255,0.9)";
    c.lineWidth = 4;
    const m = 18;
    const L = 26;
    for (const [x, y, dx, dy] of [[m, 60, 1, 1], [w - m, 60, -1, 1], [m, h - 70, 1, -1], [w - m, h - 70, -1, -1]]) {
      c.beginPath();
      c.moveTo(x, y + dy * L);
      c.lineTo(x, y);
      c.lineTo(x + dx * L, y);
      c.stroke();
    }
    c.strokeStyle = "rgba(95,216,255,0.9)";
    c.beginPath();
    c.ellipse(w / 2, h / 2 - 8, 42, 56, 0, 0, Math.PI * 2);
    c.stroke();
    c.fillStyle = "rgba(213,224,255,0.9)";
    c.font = "600 18px system-ui, sans-serif";
    c.textAlign = "center";
    c.fillText("Marcación 06:00", w / 2, 36);
    c.font = "500 15px system-ui, sans-serif";
    c.fillText("Puesto 12 · GPS ok", w / 2, h - 28);
  });
  const matPantalla = new THREE.MeshBasicMaterial({ map: texSelfie, transparent: true, opacity: 0.95 });
  const pantalla = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 1.4), matPantalla);
  pantalla.position.z = 0.045;
  tel.add(pantalla);
  const matCara = kit.matLinea(COLOR.cyan, 0);
  const cara = new THREE.LineSegments(new THREE.WireframeGeometry(new THREE.SphereGeometry(0.2, 12, 9)), matCara);
  cara.scale.set(0.82, 1.08, 0.7);
  cara.position.set(0, 0.0, 0.32);
  tel.add(cara);
  const matScan = kit.basico(acento, 0, true);
  const scan = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.025), matScan);
  scan.position.z = 0.06;
  tel.add(scan);
  const matOk = kit.basico(COLOR.green, 0, true);
  const ok = new THREE.Mesh(new THREE.RingGeometry(0.42, 0.47, 48), matOk);
  ok.position.z = 0.1;
  tel.add(ok);
  const okGlow = kit.sprite(COLOR.green, 2.2, 0);
  tel.add(okGlow);

  // ── Supervisión: llega el supervisor con su revista ──
  const supervisor = kit.figura(COLOR.amber, 1.85);
  scene.add(supervisor.grupo);
  const SUP_DESDE = v3(26, 0, FD + 5.3);
  const SUP_HASTA = v3(5.5, 0, FD + 2.2);
  const texRevista = kit.textura(256, 320, (c, w, h) => {
    c.fillStyle = "rgba(2,10,24,0.88)";
    c.beginPath();
    c.roundRect(3, 3, w - 6, h - 6, 18);
    c.fill();
    c.strokeStyle = "rgba(255,181,71,0.95)";
    c.lineWidth = 4;
    c.stroke();
    c.fillStyle = "#ffe0a8";
    c.font = "700 26px system-ui, sans-serif";
    c.fillText("Revista · Puesto 12", 20, 44);
    c.strokeStyle = "rgba(213,224,255,0.7)";
    c.lineWidth = 3;
    c.strokeRect(20, 64, 96, 80);
    c.beginPath();
    c.moveTo(24, 138);
    c.lineTo(56, 100);
    c.lineTo(80, 124);
    c.lineTo(94, 110);
    c.lineTo(112, 138);
    c.stroke();
    c.fillStyle = "rgba(213,224,255,0.9)";
    c.font = "500 18px system-ui, sans-serif";
    c.fillText("Foto", 132, 96);
    c.fillText("Uniforme ✓", 132, 124);
    c.fillStyle = "#ff3b5c";
    c.beginPath();
    c.arc(34, 182, 10, Math.PI, 0);
    c.lineTo(34, 202);
    c.closePath();
    c.fill();
    c.fillStyle = "rgba(213,224,255,0.9)";
    c.fillText("GPS 4.65, -74.05", 54, 192);
    c.strokeStyle = "rgba(95,216,255,0.95)";
    c.lineWidth = 3;
    c.beginPath();
    c.moveTo(24, 268);
    for (let x = 0; x < 180; x += 6) c.lineTo(24 + x, 262 + Math.sin(x * 0.12) * 12 * Math.cos(x * 0.03));
    c.stroke();
    c.fillText("Firma", 24, 300);
  });
  const matRevista = new THREE.SpriteMaterial({ map: texRevista, transparent: true, opacity: 0, depthWrite: false });
  const revista = new THREE.Sprite(matRevista);
  revista.scale.set(2.2, 2.75, 1);
  scene.add(revista);

  // ── Portería: talanquera, visitante y escarapela ──
  const pivote = new THREE.Group();
  pivote.position.copy(PIVOTE);
  scene.add(pivote);
  const matBrazo = kit.basico(COLOR.red, 0.95);
  const brazo = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.12, 0.12), matBrazo);
  brazo.position.x = 2.25;
  pivote.add(brazo);
  const columnaTal = kit.caja(0.4, 1.2, 0.4, { relleno: COLOR.steel, borde: COLOR.bright });
  columnaTal.grupo.position.set(PIVOTE.x, 0, PIVOTE.z);
  scene.add(columnaTal.grupo);
  const visitante = kit.figura(COLOR.ice, 1.7);
  scene.add(visitante.grupo);
  const texEscarapela = kit.textura(128, 176, (c, w, h) => {
    c.fillStyle = "#e6eeff";
    c.beginPath();
    c.roundRect(2, 2, w - 4, h - 4, 12);
    c.fill();
    c.fillStyle = "#2348d4";
    c.fillRect(2, 2, w - 4, 40);
    c.fillStyle = "#ffffff";
    c.font = "700 19px system-ui, sans-serif";
    c.textAlign = "center";
    c.fillText("VISITANTE", w / 2, 29);
    c.fillStyle = "#0a1736";
    for (let i = 0; i < 7; i++) for (let j = 0; j < 7; j++) if (rand() < 0.5 || i < 2 || j < 2) c.fillRect(30 + i * 10, 62 + j * 10, 9, 9);
    c.font = "600 15px system-ui, sans-serif";
    c.fillText("Torre B · 4", w / 2, h - 18);
  });
  const matEscarapela = new THREE.SpriteMaterial({ map: texEscarapela, transparent: true, opacity: 0, depthWrite: false });
  const escarapela = new THREE.Sprite(matEscarapela);
  escarapela.scale.set(0.9, 1.24, 1);
  scene.add(escarapela);

  // ── Recursos: casillero, vehículo y canino ──
  const recursos = new THREE.Group();
  scene.add(recursos);
  const casillero = kit.caja(1.3, 2.1, 0.7, { relleno: 0x1a2a55, borde: COLOR.bright });
  casillero.grupo.position.set(9.6, 0, 9.4);
  recursos.add(casillero.grupo);
  const puertasCas = kit.segmentos([v3(9.6, 0.1, 9.76), v3(9.6, 2.0, 9.76), v3(9.3, 1.1, 9.76), v3(9.3, 1.3, 9.76), v3(9.9, 1.1, 9.76), v3(9.9, 1.3, 9.76)], COLOR.bright, 0.8);
  recursos.add(puertasCas);
  const vehiculo = new THREE.Group();
  vehiculo.position.set(10.5, 0, 3.6);
  vehiculo.rotation.y = -0.25;
  recursos.add(vehiculo);
  const carro = kit.caja(4, 0.9, 1.9, { relleno: 0x16306e, borde: COLOR.bright });
  carro.grupo.position.y = 0.38;
  const cabina = kit.caja(2.1, 0.7, 1.7, { relleno: 0x0c1d48, borde: COLOR.cyan });
  cabina.grupo.position.set(-0.3, 1.28, 0);
  vehiculo.add(carro.grupo, cabina.grupo);
  const geoRueda = new THREE.CylinderGeometry(0.38, 0.38, 0.3, 16);
  geoRueda.rotateX(Math.PI / 2);
  const matRueda = new THREE.MeshStandardMaterial({ color: 0x0a1230, roughness: 0.8 });
  for (const [x, z] of [[-1.3, 0.95], [1.3, 0.95], [-1.3, -0.95], [1.3, -0.95]]) {
    const r = new THREE.Mesh(geoRueda, matRueda);
    r.position.set(x, 0.38, z);
    vehiculo.add(r);
  }
  const perrera = new THREE.Group();
  perrera.position.set(11.8, 0, -2.6);
  recursos.add(perrera);
  const casa = kit.caja(1.6, 1.0, 1.8, { relleno: 0x16306e, borde: COLOR.bright });
  perrera.add(casa.grupo);
  const techoP = new THREE.ConeGeometry(1.35, 0.8, 4, 1);
  techoP.rotateY(Math.PI / 4);
  techoP.scale(0.85, 1, 0.95);
  techoP.translate(0, 1.4, 0);
  perrera.add(new THREE.Mesh(techoP, new THREE.MeshStandardMaterial({ color: 0x0c1d48 })), kit.bordes(techoP, COLOR.bright, 0.8));
  const canino = new THREE.Group();
  const matCan = new THREE.MeshBasicMaterial({ color: COLOR.cyan, transparent: true, opacity: 0.85 });
  const lomo = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 0.55, 4, 8), matCan);
  lomo.rotation.z = Math.PI / 2;
  lomo.position.y = 0.42;
  const cabeza = new THREE.Mesh(new THREE.SphereGeometry(0.17, 10, 8), matCan);
  cabeza.position.set(0.48, 0.62, 0);
  canino.add(lomo, cabeza);
  scene.add(canino);
  const etiquetas = [casillero.grupo.position, vehiculo.position, perrera.position].map((p) => {
    const r = kit.anillo(1.5, 1.62, acento, 48);
    r.position.set(p.x, 0.06, p.z);
    const s = kit.sprite(COLOR.green, 1.2, 0);
    s.position.set(p.x, 2.9, p.z);
    scene.add(r, s);
    return { r, s };
  });
  const bordesRecursos = [casillero.borde, carro.borde, cabina.borde, casa.borde];

  const hotspots: Record<string, THREE.Vector3> = {
    puesto: CASETA.clone().setY(3.8),
    asistencia: TELEFONO.clone().add(v3(0, 1.2, 0)),
    ronda: checkpoints[2].p.clone().setY(2.6),
    supervision: v3(14, 3, FD + 5),
    porteria: v3(0, 2.6, FD + 0.4),
    recursos: v3(10.5, 3.6, 3.6),
  };
  const tmp = new THREE.Vector3();
  let uRonda = 0;
  let pasoSup = 0;

  return {
    general: enc(25, 18, 33, 0, 0, 2),
    encuadres: {
      puesto: enc(15, 7.5, 24, 3.5, 1.6, 9),
      asistencia: enc(11, 3.4, 20, 6.6, 1.7, 12.3),
      ronda: enc(4, 32, 30, 0, 0, -1),
      supervision: enc(18, 7, 27, 9, 1.4, 13.5),
      porteria: enc(-7, 4.8, 23, 0, 1.3, 12),
      recursos: enc(22, 8.5, 13, 10.5, 1, 3.4),
    },
    hotspots,
    orbita: (f) => (f === null || f === "puesto" ? 2.4 : f === "ronda" ? 1.4 : 0.8),
    update(t) {
      const w = {
        puesto: kit.peso("puesto"),
        asistencia: kit.peso("asistencia"),
        ronda: kit.peso("ronda"),
        supervision: kit.peso("supervision"),
        porteria: kit.peso("porteria"),
        recursos: kit.peso("recursos"),
      };
      suelo.u.uTime.value = t;
      lamparas.forEach((l, i) => {
        const parpadeo = i === 4 ? 0.75 + 0.25 * Math.sin(t * 13) * Math.sin(t * 3.1) : 1;
        l.glow.material.opacity = 0.7 * parpadeo;
        l.cono.opacity = 0.045 * parpadeo;
      });
      matVentana.opacity = 0.45 + 0.3 * w.puesto + 0.05 * Math.sin(t * 1.7);
      luzCaseta.material.opacity = 0.25 + 0.3 * w.puesto;
      balizaCaseta.material.opacity = 0.5 + 0.5 * Math.max(0, Math.sin(t * 3));
      matCerca.opacity = 0.4 + 0.3 * w.puesto;

      // Ronda: el vigilante recorre la ruta y marca cada QR (sin señal también).
      const r = w.ronda;
      if (kit.foco === "ronda") uRonda = kit.reducedMotion ? 0.55 : (kit.enFoco("ronda") / 22) % 1;
      matRuta.opacity = 0.18 + 0.75 * r;
      matRuta.color.copy(colBright).lerp(acento, r);
      ruta.getPointAt(uRonda, tmp);
      const tg = ruta.getTangentAt(uRonda);
      // fuera de la ronda el vigilante camina despacio frente a la caseta
      const ida = Math.sin(t * 0.25);
      const enPuesto = v3(PUESTO_VIG.x + ida * 1.4, 0, PUESTO_VIG.z);
      vigilante.grupo.position.copy(enPuesto).lerp(tmp, r);
      vigilante.grupo.rotation.y = r > 0.5 ? Math.atan2(tg.x, tg.z) : ida > 0 ? Math.PI / 2 : -Math.PI / 2;
      vigilante.halo.material.opacity = 0.45 + 0.4 * r;
      vigilante.grupo.scale.setScalar(1 + 0.25 * r);
      checkpoints.forEach((c, i) => {
        const marcado = r > 0.01 && uRonda >= c.u ? 1 : 0;
        const reciente = marcado ? Math.exp(-(uRonda - c.u) * 30) : 0;
        c.mat.color.copy(colBright).lerp(colGreen, marcado * r);
        c.glow.material.opacity = (0.15 * r + reciente * 0.85) * r;
        const ph = fase(t, 1.4, i * 0.2);
        c.onda.scale.setScalar(1 + ph * 2 * reciente + 0.001);
        (c.onda.material as THREE.MeshBasicMaterial).opacity = r * (marcado ? 0.35 + 0.6 * reciente * (1 - ph) : 0.12);
      });
      offline.position.copy(vigilante.grupo.position).setY(2.6);
      offline.material.opacity = r * (0.65 + 0.25 * Math.sin(t * 2.5));
      // marcas guardadas en el teléfono, en cola hasta que vuelva la señal
      nubeCola.position.copy(vigilante.grupo.position).add(v3(0.55, 2.2, 0));
      nubeCola.material.opacity = r * 0.7 * (0.5 + 0.5 * Math.sin(t * 6));

      // Asistencia: selfie + reconocimiento facial.
      const a = w.asistencia;
      const pa = kit.reducedMotion ? 0.8 : fase(t, 5.5);
      const escaneando = ramp(pa, 0.05, 0.12) * (1 - ramp(pa, 0.55, 0.6));
      const exito = ramp(pa, 0.6, 0.66) * (1 - ramp(pa, 0.95, 1));
      tel.scale.setScalar(0.55 + 0.45 * a);
      tel.position.y = TELEFONO.y + Math.sin(t * 1.2) * 0.06;
      tel.rotation.y = -0.35 + Math.sin(t * 0.6) * 0.08;
      tel.visible = a > 0.02 || w.puesto > 0.5;
      matPantalla.opacity = 0.35 + 0.6 * a;
      matCara.opacity = a * (0.4 + 0.5 * escaneando + 0.4 * exito);
      matCara.color.copy(acento).lerp(colGreen, exito);
      cara.rotation.y = Math.sin(t * 1.4) * 0.5;
      scan.position.y = -0.55 + 1.1 * fase(t, 1.2);
      matScan.opacity = a * escaneando;
      matOk.opacity = a * exito;
      okGlow.material.opacity = a * exito * 0.5;
      bordeTel.material.color.copy(colBright).lerp(colGreen, exito * a);

      // Supervisión: llega caminando y deja la revista (foto, firma, GPS).
      const s = w.supervision;
      if (kit.foco === "supervision") pasoSup = kit.reducedMotion ? 1 : clamp01(kit.enFoco("supervision") / 4.5);
      const llegada = suave(pasoSup);
      supervisor.grupo.position.lerpVectors(SUP_DESDE, SUP_HASTA, llegada);
      supervisor.grupo.rotation.y = -Math.PI / 2 - 0.15;
      supervisor.grupo.visible = s > 0.02;
      supervisor.mat.opacity = s;
      supervisor.halo.material.opacity = s * 0.5;
      supervisor.grupo.position.y = llegada < 1 ? Math.abs(Math.sin(t * 7)) * 0.06 : 0;
      const reporte = ramp(pasoSup, 0.85, 1) * s;
      revista.position.copy(SUP_HASTA).add(v3(0.6, 3.4 + reporte * 0.3 + Math.sin(t * 1.3) * 0.08, 0.6));
      matRevista.opacity = reporte;
      hotspots.supervision.copy(supervisor.grupo.position).setY(2.6);
      if (s < 0.02) hotspots.supervision.set(14, 3, FD + 5);

      // Portería: visitante, escarapela y talanquera.
      const p = w.porteria;
      const pp = kit.reducedMotion ? 0.5 : fase(t, 10);
      let zv = FD + 7;
      let op = 1;
      if (pp < 0.25) {
        zv = FD + 7 - 5.2 * suave(pp / 0.25);
        op = ramp(pp, 0, 0.05);
      } else if (pp < 0.55) zv = FD + 1.8;
      else {
        zv = FD + 1.8 - 9 * suave(ramp(pp, 0.6, 0.95));
        op = 1 - ramp(pp, 0.88, 1);
      }
      visitante.grupo.position.set(0.4, 0, zv);
      visitante.grupo.rotation.y = Math.PI;
      visitante.mat.opacity = op * (0.3 + 0.65 * Math.max(p, 0.25));
      visitante.halo.material.opacity = op * 0.35;
      const badge = ramp(pp, 0.3, 0.38) * (1 - ramp(pp, 0.9, 1));
      escarapela.position.set(1.4, 2.2 + Math.sin(t * 2) * 0.05, zv);
      matEscarapela.opacity = badge * p;
      const abre = ramp(pp, 0.45, 0.55) * (1 - ramp(pp, 0.82, 0.92));
      pivote.rotation.z = abre * Math.PI * 0.45;
      matBrazo.color.copy(colRed).lerp(colGreen, abre);

      // Recursos: inventario de casillero, vehículo y canino.
      const re = w.recursos;
      bordesRecursos.forEach((m) => {
        m.color.copy(colBright).lerp(acento, re);
        m.opacity = 0.6 + 0.4 * re;
      });
      etiquetas.forEach((e, i) => {
        const ph = fase(t, 2, i * 0.3);
        e.r.scale.setScalar(1 + ph * 0.25);
        (e.r.material as THREE.MeshBasicMaterial).opacity = re * (0.9 - ph * 0.6);
        e.s.material.opacity = re * (0.5 + 0.4 * Math.sin(t * 3 + i));
      });
      const ang = t * 0.5;
      canino.position.set(perrera.position.x - 1.6 + Math.cos(ang) * 1.1, 0, perrera.position.z + 1.8 + Math.sin(ang) * 0.7);
      canino.rotation.y = -ang - Math.PI / 2 + Math.PI;
      matCan.opacity = 0.55 + 0.4 * re;
      matCan.color.copy(colAmber).lerp(acento, 0.6);
    },
  };
}

const crear: FabricaEscena = (op) => montarEscena("campo", op, construir, { fov: 40, niebla: 0.02, polarMax: 1.4 });

export default crear;
