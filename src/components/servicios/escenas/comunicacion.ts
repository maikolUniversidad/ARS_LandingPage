/**
 * Escena «comunicacion»: COMUNICACIÓN entre campo y Central.
 *
 * Un terreno estilizado con torres de radio, teléfonos en cada sede y la
 * Central (hub) en el centro, todos enlazados por arcos. Cada foco muestra un
 * canal: ondas PTT con puntos de grabación, burbujas de chat, la conversación
 * con la Central, la consola con pistas de audio, el reporte por sede (las
 * sedes en silencio quedan en rojo), el botón de pánico (todo converge a la
 * Central) y las notificaciones (campana y avión de papel).
 *
 * Focos: radio · chat · central · consola · reporte · panico · notificaciones.
 */

import * as THREE from "three";
import { COLOR, Kit, type Flujo, arco, enc, fase, montarEscena, mulberry32, v3, type Escena } from "./_edificio-motor";
import type { FabricaEscena } from "./contrato";

const altura = (x: number, z: number) => {
  const d = Math.hypot(x, z);
  const llano = Math.min(1, Math.max(0, (d - 6) / 14));
  return (2.4 * Math.sin(x * 0.075) * Math.cos(z * 0.068) + 1.3 * Math.sin(x * 0.16 + z * 0.11) + 0.6 * Math.cos(z * 0.23 - x * 0.05) + 1.2) * llano;
};
const sobre = (x: number, z: number, dy = 0) => v3(x, altura(x, z) + dy, z);

const N_TEL = 8;
const SILENCIOSAS = new Set([3, 6]);
const PANICO = 2;
const HUB_TOP = v3(0, 3.6, 0);
const CONSOLA = v3(0, 0, -10);

function construir(kit: Kit): Escena {
  const { scene } = kit;
  const acento = kit.acento;
  const rand = mulberry32(41);
  const colRed = new THREE.Color(COLOR.red);
  const colGreen = new THREE.Color(COLOR.green);
  const colBright = new THREE.Color(COLOR.bright);
  const colAmber = new THREE.Color(COLOR.amber);
  const colFrench = new THREE.Color(COLOR.french);
  const tmpC = new THREE.Color();

  // ── Terreno ──
  const seg = kit.lowPower ? 44 : 70;
  const geoT = new THREE.PlaneGeometry(130, 130, seg, seg);
  geoT.rotateX(-Math.PI / 2);
  const pos = geoT.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) pos.setY(i, altura(pos.getX(i), pos.getZ(i)));
  geoT.computeVertexNormals();
  scene.add(new THREE.Mesh(geoT, new THREE.MeshStandardMaterial({ color: 0x0a1838, roughness: 0.95, metalness: 0.05, flatShading: true })));
  const matMalla = new THREE.MeshBasicMaterial({ color: COLOR.french, wireframe: true, transparent: true, opacity: 0.26 });
  const malla = new THREE.Mesh(geoT, matMalla);
  malla.position.y = 0.02;
  scene.add(malla);
  kit.polvo(500, 110, 26, 23);

  // ── Central (hub) ──
  const hubGeo = new THREE.CylinderGeometry(2.4, 2.8, 2.4, 6);
  hubGeo.translate(0, 1.2, 0);
  scene.add(new THREE.Mesh(hubGeo, new THREE.MeshStandardMaterial({ color: COLOR.building, roughness: 0.6, metalness: 0.3 })));
  const hubBorde = kit.bordes(hubGeo, COLOR.bright, 0.9);
  scene.add(hubBorde);
  scene.add(kit.linea([v3(0, 2.4, 0), v3(0, 5.6, 0)], COLOR.bright, 0.8));
  const hubGlow = kit.sprite(acento, 7, 0.55);
  hubGlow.position.copy(HUB_TOP);
  scene.add(hubGlow);
  const hubAnillos = [0, 1, 2].map(() => {
    const r = kit.anillo(2.9, 3.1, acento, 64);
    r.position.y = 0.15;
    scene.add(r);
    return r;
  });

  // ── Torres de radio ──
  const torres = [sobre(-24, -12), sobre(22, -18), sobre(6, 26)].map((p) => {
    const g = new THREE.CylinderGeometry(0.15, 1.5, 13, 4, 6, true);
    g.translate(0, 6.5, 0);
    const t = new THREE.LineSegments(new THREE.WireframeGeometry(g), kit.matLinea(COLOR.steel, 0.7));
    t.position.copy(p);
    const luz = kit.sprite(COLOR.red, 1.6, 0.9);
    luz.position.copy(p).setY(p.y + 13.2);
    scene.add(t, luz);
    return { p: p.clone().setY(p.y + 12.5), luz };
  });

  // ── Teléfonos en sedes ──
  const geoTel = new THREE.BoxGeometry(0.55, 1.0, 0.08);
  const telefonos = Array.from({ length: N_TEL }, (_, i) => {
    const ang = (i / N_TEL) * Math.PI * 2 + 0.3;
    const r = 14 + (i % 3) * 6 + rand() * 3;
    const base = sobre(Math.cos(ang) * r, Math.sin(ang) * r);
    const p = base.clone().setY(base.y + 1.6);
    const mat = new THREE.MeshStandardMaterial({ color: 0x16306e, roughness: 0.4, metalness: 0.5, emissive: COLOR.indigo, emissiveIntensity: 0.4 });
    const tel = new THREE.Mesh(geoTel, mat);
    tel.position.copy(p);
    tel.lookAt(0, p.y, 0);
    const borde = new THREE.LineSegments(new THREE.EdgesGeometry(geoTel), kit.matLinea(COLOR.bright, 0.9));
    tel.add(borde);
    const glow = kit.sprite(acento, 2.6, 0.45);
    glow.position.copy(p);
    const anillo = kit.anillo(0.9, 1.05, acento, 40);
    anillo.position.copy(base).setY(base.y + 0.12);
    const rec = kit.sprite(COLOR.red, 0.7, 0);
    rec.position.copy(p).setY(p.y + 0.95);
    scene.add(tel, glow, anillo, rec);
    const enlaceGeo = new THREE.BufferGeometry().setFromPoints(arco(p, HUB_TOP, 5).getPoints(40));
    const enlaceMat = kit.matLinea(COLOR.bright, 0.25);
    scene.add(new THREE.Line(enlaceGeo, enlaceMat));
    const entrada = kit.flujo(arco(p, HUB_TOP, 5), acento, 20, 0.55);
    const salida = kit.flujo(arco(HUB_TOP, p, 5), acento, 20, 0.55);
    const ondas = [0, 1, 2].map(() => {
      const o = kit.anillo(0.9, 1.05, acento, 48);
      o.position.copy(base).setY(base.y + 0.15);
      scene.add(o);
      return o;
    });
    return { p, base, mat, borde: borde.material, glow, anillo, rec, enlaceMat, entrada, salida, ondas };
  });
  // Enlaces torre ↔ central
  for (const t of torres) scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(arco(t.p, HUB_TOP, 4).getPoints(40)), kit.matLinea(COLOR.steel, 0.25)));

  // ── Burbujas de chat ──
  const texBurbuja = kit.textura(128, 96, (c, w) => {
    c.fillStyle = "rgba(255,255,255,0.95)";
    c.beginPath();
    c.roundRect(6, 6, w - 12, 62, 18);
    c.fill();
    c.beginPath();
    c.moveTo(30, 66);
    c.lineTo(22, 90);
    c.lineTo(52, 66);
    c.fill();
    c.fillStyle = "#0a1736";
    for (const x of [40, 64, 88]) {
      c.beginPath();
      c.arc(x, 37, 7, 0, Math.PI * 2);
      c.fill();
    }
  });
  const burbujas = Array.from({ length: 7 }, (_, i) => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: texBurbuja, color: i % 2 ? acento : 0xffffff, transparent: true, opacity: 0, depthWrite: false }));
    s.scale.set(1.5, 1.12, 1);
    scene.add(s);
    return { s, tel: (i * 3) % N_TEL, sube: i % 2 === 0, off: i / 7 };
  });

  // ── Notificaciones: campana y avión de papel ──
  const texCampana = kit.textura(96, 96, (c, w) => {
    c.fillStyle = "rgba(255,255,255,0.95)";
    c.beginPath();
    c.moveTo(w * 0.2, w * 0.7);
    c.quadraticCurveTo(w * 0.28, w * 0.62, w * 0.28, w * 0.45);
    c.quadraticCurveTo(w * 0.3, w * 0.18, w * 0.5, w * 0.18);
    c.quadraticCurveTo(w * 0.7, w * 0.18, w * 0.72, w * 0.45);
    c.quadraticCurveTo(w * 0.72, w * 0.62, w * 0.8, w * 0.7);
    c.closePath();
    c.fill();
    c.beginPath();
    c.arc(w * 0.5, w * 0.78, w * 0.08, 0, Math.PI * 2);
    c.fill();
  });
  const texAvion = kit.textura(96, 96, (c, w) => {
    c.fillStyle = "rgba(255,255,255,0.95)";
    c.beginPath();
    c.moveTo(w * 0.12, w * 0.48);
    c.lineTo(w * 0.88, w * 0.18);
    c.lineTo(w * 0.62, w * 0.84);
    c.lineTo(w * 0.47, w * 0.6);
    c.closePath();
    c.fill();
    c.fillStyle = "rgba(95,216,255,0.9)";
    c.beginPath();
    c.moveTo(w * 0.47, w * 0.6);
    c.lineTo(w * 0.88, w * 0.18);
    c.lineTo(w * 0.42, w * 0.78);
    c.closePath();
    c.fill();
  });
  const avisos = Array.from({ length: 6 }, (_, i) => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: i % 2 ? texAvion : texCampana, color: i % 2 ? 0x8fd8ff : 0xffd47a, transparent: true, opacity: 0, depthWrite: false }));
    s.scale.setScalar(1.6);
    scene.add(s);
    const tel = (i * 5 + 1) % N_TEL;
    return { s, curva: arco(HUB_TOP, telefonos[tel].p.clone().setY(telefonos[tel].p.y + 1.2), 6), off: i / 6, tel };
  });

  // ── Consola: pared de pistas de audio ──
  const consola = new THREE.Group();
  consola.position.copy(CONSOLA).setY(altura(CONSOLA.x, CONSOLA.z));
  scene.add(consola);
  const ANCHO_C = 14;
  const ALTO_C = 5.2;
  const matFondoC = new THREE.MeshBasicMaterial({ color: COLOR.imperial, transparent: true, opacity: 0.35, depthWrite: false, side: THREE.DoubleSide });
  const fondoC = new THREE.Mesh(new THREE.PlaneGeometry(ANCHO_C, ALTO_C), matFondoC);
  fondoC.position.y = 1.4 + ALTO_C / 2;
  consola.add(fondoC);
  const marcoC = kit.linea([v3(-ANCHO_C / 2, 1.4, 0), v3(ANCHO_C / 2, 1.4, 0), v3(ANCHO_C / 2, 1.4 + ALTO_C, 0), v3(-ANCHO_C / 2, 1.4 + ALTO_C, 0)], COLOR.bright, 0.7, true);
  consola.add(marcoC);
  const N_PISTA = 5;
  const N_MUESTRAS = kit.lowPower ? 90 : 160;
  const pistas = Array.from({ length: N_PISTA }, (_, k) => {
    const g = new THREE.BufferGeometry().setFromPoints(Array.from({ length: N_MUESTRAS }, () => v3(0, 0, 0)));
    const l = new THREE.Line(g, kit.matLinea(k === 1 ? COLOR.red : k === 3 ? COLOR.amber : COLOR.cyan, 0.85));
    l.position.z = 0.05;
    l.frustumCulled = false;
    consola.add(l);
    const dot = kit.sprite(COLOR.red, 0.5, 0.8);
    dot.position.set(-ANCHO_C / 2 + 0.4, 1.4 + ALTO_C - (k + 0.7) * (ALTO_C / N_PISTA), 0.1);
    consola.add(dot);
    return { g, mat: l.material, dot, y: 1.4 + ALTO_C - (k + 0.6) * (ALTO_C / N_PISTA), semilla: rand() * 10 };
  });
  const cabezal = kit.linea([v3(0, 1.4, 0.08), v3(0, 1.4 + ALTO_C, 0.08)], 0xffffff, 0.9);
  consola.add(cabezal);
  const pieC = kit.linea([v3(-ANCHO_C / 2, 0, 0), v3(-ANCHO_C / 2, 1.4, 0), v3(ANCHO_C / 2, 1.4, 0), v3(ANCHO_C / 2, 0, 0)], COLOR.steel, 0.5);
  consola.add(pieC);

  // ── Pánico ──
  const telP = telefonos[PANICO];
  const ondasPanico = [0, 1, 2, 3].map(() => {
    const r = kit.anillo(1, 1.3, COLOR.red, 64);
    r.position.copy(telP.base).setY(telP.base.y + 0.3);
    scene.add(r);
    return r;
  });
  const columnaPanico = new THREE.Mesh(
    new THREE.CylinderGeometry(0.4, 1.0, 26, 16, 1, true),
    new THREE.MeshBasicMaterial({ color: COLOR.red, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }),
  );
  columnaPanico.position.copy(telP.base).setY(telP.base.y + 13);
  scene.add(columnaPanico);

  const actualizarFlujo = (f: Flujo, t: number, intensidad: number, color: THREE.Color, vel: number, tramo: number) => {
    f.points.material.color.copy(color);
    f.update(t, intensidad, vel, tramo);
  };

  const hotspots: Record<string, THREE.Vector3> = {
    radio: torres[0].p.clone().setY(torres[0].p.y + 2),
    chat: telefonos[0].p.clone().setY(telefonos[0].p.y + 2),
    central: HUB_TOP.clone().setY(6.4),
    consola: consola.position.clone().add(v3(ANCHO_C / 2 - 1, 1.4 + ALTO_C + 0.8, 0)),
    reporte: telefonos[3].p.clone().setY(telefonos[3].p.y + 2.2),
    panico: telP.p.clone().setY(telP.p.y + 2.2),
    notificaciones: telefonos[5].p.clone().setY(telefonos[5].p.y + 2.2),
  };
  const speakerDe = (t: number) => Math.floor(t / 2.6) % N_TEL;

  return {
    general: enc(0, 32, 48, 0, 2, 0),
    encuadres: {
      radio: enc(-34, 17, 24, -12, 3, -3),
      chat: enc(26, 13, 26, 4, 2.5, 4),
      central: enc(13, 10, 19, 0, 2.6, 0),
      consola: enc(3, consola.position.y + 4.6, consola.position.z + 13, 0, consola.position.y + 3.8, consola.position.z),
      reporte: enc(0, 44, 30, 0, 0, 0),
      panico: enc(telP.p.x * 0.5 + 24, 22, telP.p.z * 0.5 + 30, telP.p.x * 0.5, 2, telP.p.z * 0.5),
      notificaciones: enc(-20, 15, 26, 2, 3, 2),
    },
    hotspots,
    orbita: (f) => (f === null ? 3 : f === "reporte" ? 1.6 : 1),
    update(t) {
      const w = {
        radio: kit.peso("radio"),
        chat: kit.peso("chat"),
        central: kit.peso("central"),
        consola: kit.peso("consola"),
        reporte: kit.peso("reporte"),
        panico: kit.peso("panico"),
        notificaciones: kit.peso("notificaciones"),
      };
      const pan = w.panico;

      // Central
      hubAnillos.forEach((r, i) => {
        const ph = fase(t, 2.2, i / 3);
        r.scale.setScalar(1 + ph * (1.2 + 1.5 * w.central));
        const m = r.material as THREE.MeshBasicMaterial;
        m.opacity = (1 - ph) * (0.35 + 0.5 * Math.max(w.central, pan));
        m.color.copy(acento).lerp(colRed, pan);
      });
      hubGlow.material.color.copy(acento).lerp(colRed, pan * (0.6 + 0.4 * Math.sin(t * 10)));
      hubGlow.material.opacity = 0.45 + 0.4 * Math.max(w.central, pan);
      hubBorde.material.color.copy(colBright).lerp(acento, w.central).lerp(colRed, pan);
      torres.forEach((tr, i) => (tr.luz.material.opacity = 0.3 + 0.7 * Math.max(0, Math.sin(t * 2.5 + i * 2))));

      const hablante = speakerDe(t);
      const escuchas = [(hablante + 3) % N_TEL, (hablante + 5) % N_TEL];
      telefonos.forEach((tel, i) => {
        const silencio = SILENCIOSAS.has(i) ? w.reporte : 0;
        const esPanico = i === PANICO ? pan : 0;
        const habla = i === hablante ? w.radio : 0;

        tmpC.copy(acento).lerp(colRed, Math.max(silencio, esPanico));
        tel.glow.material.color.copy(tmpC);
        tel.glow.material.opacity = 0.35 + 0.4 * habla + esPanico * (0.5 + 0.5 * Math.sin(t * 12)) + silencio * 0.3 * (0.5 + 0.5 * Math.sin(t * 4));
        tel.mat.emissive.copy(tmpC);
        tel.mat.emissiveIntensity = 0.35 + 0.6 * Math.max(habla, esPanico, silencio);
        tel.borde.color.copy(colBright).lerp(tmpC, Math.max(habla, esPanico, silencio, w.chat * 0.5));
        const anilloMat = tel.anillo.material as THREE.MeshBasicMaterial;
        anilloMat.color.copy(tmpC);
        anilloMat.opacity = 0.35 + 0.4 * Math.max(silencio, esPanico);
        tel.rec.material.opacity = habla * (Math.sin(t * 8) > 0 ? 0.95 : 0.2);

        // ondas PTT del que habla / ping de reporte
        tel.ondas.forEach((o, k) => {
          const ph = fase(t, 1.3, k / 3);
          const m = o.material as THREE.MeshBasicMaterial;
          const ping = SILENCIOSAS.has(i) ? 0 : w.reporte * (fase(t, 3, i * 0.13) < 0.35 ? 1 : 0);
          const v = Math.max(habla, ping);
          o.scale.setScalar(1 + ph * (ping > habla ? 2 : 5));
          m.color.copy(ping > habla ? colGreen : acento);
          m.opacity = (1 - ph) * v * 0.9;
        });

        // enlaces
        tel.enlaceMat.color.copy(colBright).lerp(colRed, pan).lerp(colRed, silencio);
        tel.enlaceMat.opacity = 0.18 + 0.25 * Math.max(w.central, w.chat * 0.6, w.reporte * 0.6) + 0.5 * pan;

        // flujo hacia la Central: pánico > reporte > voz > conversación
        const pingRep = SILENCIOSAS.has(i) ? 0 : w.reporte;
        if (pan > 0.02) actualizarFlujo(tel.entrada, t + i * 0.13, pan, colRed, 0.75, 1);
        else if (pingRep > 0.02) actualizarFlujo(tel.entrada, t + i * 0.41, pingRep, colGreen, 0.33, 0.18);
        else if (habla > 0.02) actualizarFlujo(tel.entrada, t, habla, acento, 0.6, 0.35);
        else actualizarFlujo(tel.entrada, t, i === 0 ? w.central : 0, acento, 0.4, 0.5);
        // flujo desde la Central: retransmisión de radio y respuesta de la Central
        const esc = escuchas.includes(i) ? w.radio : 0;
        const resp = i === 0 ? w.central : 0;
        actualizarFlujo(tel.salida, t + 0.5, Math.max(esc, resp), resp > esc ? colAmber : acento, 0.6, esc > resp ? 0.35 : 0.5);
      });

      // Chat: burbujas que viajan entre sedes y Central.
      burbujas.forEach((b) => {
        const tel = telefonos[b.tel];
        const u = fase(t, 3.2, b.off);
        const curva = b.sube ? tel.entrada.curva : tel.salida.curva;
        curva.getPoint(u, b.s.position);
        b.s.position.y += 0.9;
        b.s.material.opacity = w.chat * Math.min(1, u * 6, (1 - u) * 6);
        b.s.visible = w.chat > 0.01;
      });

      // Notificaciones: campana y avión de papel desde la Central.
      avisos.forEach((a) => {
        const u = fase(t, 2.8, a.off);
        a.curva.getPoint(u, a.s.position);
        a.s.material.opacity = w.notificaciones * Math.min(1, u * 5, (1 - u) * 5);
        a.s.visible = w.notificaciones > 0.01;
        a.s.material.rotation = Math.sin(t * 3 + a.off * 6) * 0.25;
      });

      // Consola: pistas de audio que corren con su cabezal.
      const co = 0.2 + 0.8 * w.consola;
      matFondoC.opacity = 0.18 + 0.3 * w.consola;
      (marcoC.material as THREE.LineBasicMaterial).opacity = 0.35 + 0.55 * w.consola;
      pistas.forEach((p, k) => {
        const attr = p.g.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < N_MUESTRAS; i++) {
          const u = i / (N_MUESTRAS - 1);
          const x = -ANCHO_C / 2 + 0.8 + u * (ANCHO_C - 1.2);
          const s = u * 30 + t * 2.2 + p.semilla;
          const env = Math.max(0, Math.sin(s * 0.35 + k)) ** 2;
          const a = env * (0.32 * Math.sin(s * 7.1) + 0.18 * Math.sin(s * 13.7 + k));
          attr.setXYZ(i, x, p.y + a, 0.05);
        }
        attr.needsUpdate = true;
        p.mat.opacity = 0.25 + 0.7 * w.consola;
        p.dot.material.opacity = co * (Math.sin(t * 5 + k) > 0 ? 0.9 : 0.25);
      });
      cabezal.position.x = -ANCHO_C / 2 + 0.8 + fase(t, 6) * (ANCHO_C - 1.2);
      (cabezal.material as THREE.LineBasicMaterial).opacity = co;

      // Pánico: pulso rojo que se expande desde un teléfono.
      ondasPanico.forEach((r, i) => {
        const ph = fase(t, 1.6, i / 4);
        r.scale.setScalar(1 + ph * 14);
        (r.material as THREE.MeshBasicMaterial).opacity = (1 - ph) * pan * 0.9;
      });
      (columnaPanico.material as THREE.MeshBasicMaterial).opacity = pan * (0.12 + 0.08 * Math.sin(t * 10));
      matMalla.color.copy(colFrench).lerp(colRed, pan * 0.35);
    },
  };
}

const crear: FabricaEscena = (op) => montarEscena("comunicacion", op, construir, { fov: 40, niebla: 0.014, polarMax: 1.38 });

export default crear;
