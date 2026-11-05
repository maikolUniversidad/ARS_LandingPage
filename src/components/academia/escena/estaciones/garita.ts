/**
 * Foco «garita»: la garita de un conjunto residencial, de noche. Reja,
 * talanquera, citófono y el radio sobre el mostrador; al otro lado de la reja
 * espera Edgar. La única luz cálida es la de la garita.
 */

import * as THREE from "three";
import { Kit, PALETA, enc, mulberry32, poseReposo, silueta, type FabricaEstacion } from "../kit";

const CALIDA = 0xffcf8a;

export const crearGarita: FabricaEstacion = (kit: Kit, { lowPower }) => {
  const grupo = new THREE.Group();
  const rnd = mulberry32(21);

  // ── Suelo: adoquín interno y andén/calle afuera ──
  grupo.add(kit.suelo(40, 0x07112a, PALETA.azul, 1, 0.06));
  const calle = kit.caja(40, 0.02, 9, kit.mate(0x050b1c), 0, 0.01, -6);
  grupo.add(calle);
  const anden = kit.caja(40, 0.1, 1.6, kit.mate(0x0c1a3a), 0, 0.05, -0.6);
  grupo.add(anden);

  // ── Garita ──
  const garita = new THREE.Group();
  garita.position.set(-2.1, 0, 0.9);
  grupo.add(garita);
  const mPared = kit.mate(0x1a2c5c);
  const mMarco = kit.mate(0x0a1430);
  garita.add(kit.caja(1.7, 0.9, 1.7, mPared, 0, 0.45, 0)); // zócalo
  // Pilares de esquina
  for (const [x, z] of [
    [-0.82, -0.82],
    [0.82, -0.82],
    [-0.82, 0.82],
    [0.82, 0.82],
  ])
    garita.add(kit.caja(0.08, 1.5, 0.08, mMarco, x, 1.65, z));
  garita.add(kit.caja(2.1, 0.14, 2.1, kit.mate(0x0e1d44), 0, 2.45, 0)); // techo
  garita.add(kit.caja(2.12, 0.03, 2.12, kit.basico(CALIDA, { aditivo: true, opacidad: 0.35 }), 0, 2.37, 0));
  // Vidrios cálidos (laterales y frente) con el interior encendido
  const mVidrio = kit.basico(CALIDA, { opacidad: 0.22, doble: true });
  garita.add(kit.caja(1.56, 1.4, 0.01, mVidrio, 0, 1.6, 0.83));
  garita.add(kit.caja(1.56, 1.4, 0.01, mVidrio, 0, 1.6, -0.83));
  garita.add(kit.caja(0.01, 1.4, 1.56, mVidrio, 0.83, 1.6, 0));
  garita.add(kit.caja(0.01, 1.4, 1.56, mVidrio, -0.83, 1.6, 0));
  garita.add(kit.caja(1.6, 2.4, 0.04, kit.mate(0x2a2414, { emisivo: CALIDA, intensidad: 0.25 }), 0, 1.2, -0.78)); // pared interior iluminada
  // Mostrador interior, monitor y radio
  garita.add(kit.caja(1.5, 0.05, 0.45, kit.mate(PALETA.madera, { emisivo: 0x3a2410, intensidad: 0.6 }), 0, 0.98, -0.45));
  const monitor = kit.caja(0.45, 0.3, 0.03, kit.basico(0x2a4fc8), -0.35, 1.2, -0.6);
  garita.add(monitor);
  const radio = new THREE.Group();
  radio.position.set(0.35, 1.0, -0.4);
  garita.add(radio);
  radio.add(kit.caja(0.07, 0.15, 0.045, kit.mate(0x0a0d14), 0, 0.075, 0));
  const antena = kit.cilindro(0.006, 0.008, 0.12, kit.mate(0x0a0d14), 6);
  antena.position.set(0.02, 0.21, 0);
  radio.add(antena);
  const ledRadio = kit.halo(PALETA.verde, 0.08, 0.9);
  ledRadio.position.set(-0.015, 0.13, 0.03);
  radio.add(ledRadio);
  // Lámpara de la garita y charco de luz en el suelo
  const lampara = kit.halo(CALIDA, 3.2, 0.5);
  lampara.position.set(0, 2.2, 0.2);
  garita.add(lampara);
  const texCharco = kit.textura(128, 128, (c, w, h) => {
    const g = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    g.addColorStop(0, "rgba(255,207,138,0.65)");
    g.addColorStop(1, "rgba(255,207,138,0)");
    c.fillStyle = g;
    c.fillRect(0, 0, w, h);
  });
  const charco = new THREE.Mesh(kit.geo(new THREE.PlaneGeometry(6, 6)), kit.basico(0xffffff, { mapa: texCharco, aditivo: true }));
  charco.rotation.x = -Math.PI / 2;
  charco.position.set(-1.6, 0.03, 0.9);
  grupo.add(charco);

  // ── Talanquera (vía vehicular) ──
  const posteT = kit.caja(0.22, 1.0, 0.22, kit.mate(0x1d3885), -0.9, 0.5, -0.05);
  grupo.add(posteT);
  const texRayas = kit.textura(256, 16, (c, w, h) => {
    for (let i = 0; i < 8; i++) {
      c.fillStyle = i % 2 ? "#f2f5ff" : "#ff3b5c";
      c.fillRect((i * w) / 8, 0, w / 8, h);
    }
  });
  const brazo = new THREE.Group();
  brazo.position.set(-0.9, 0.92, -0.05);
  grupo.add(brazo);
  const barra = kit.caja(3.1, 0.07, 0.05, kit.mate(0xffffff, { mapa: texRayas, emisivo: 0x221111, intensidad: 0.6 }), 1.6, 0, 0);
  brazo.add(barra);
  const luzT = kit.halo(PALETA.ambar, 0.35, 0.8);
  luzT.position.set(-0.9, 1.08, 0.08);
  grupo.add(luzT);

  // ── Reja peatonal con puerta ──
  const reja = new THREE.Group();
  reja.position.set(2.4, 0, -0.05);
  grupo.add(reja);
  const mReja = kit.mate(0x2c3a5e);
  const nBarras = 34;
  const geoB = kit.geo(new THREE.CylinderGeometry(0.014, 0.014, 2.1, 5));
  const barras = new THREE.InstancedMesh(geoB, mReja, nBarras);
  const m4 = new THREE.Matrix4();
  for (let i = 0; i < nBarras; i++) {
    m4.makeTranslation(i * 0.14, 1.05, 0);
    barras.setMatrixAt(i, m4);
  }
  reja.add(barras);
  for (const y of [0.15, 1.95]) reja.add(kit.caja(nBarras * 0.14, 0.05, 0.04, mReja, (nBarras * 0.14) / 2 - 0.07, y, 0));
  for (const x of [-0.12, 1.25, nBarras * 0.14]) reja.add(kit.caja(0.16, 2.3, 0.16, kit.mate(0x1d3885), x, 1.15, 0));
  // Puntas
  const geoP = kit.geo(new THREE.ConeGeometry(0.03, 0.09, 4));
  const puntas = new THREE.InstancedMesh(geoP, mReja, nBarras);
  for (let i = 0; i < nBarras; i++) {
    m4.makeTranslation(i * 0.14, 2.15, 0);
    puntas.setMatrixAt(i, m4);
  }
  reja.add(puntas);

  // ── Citófono (afuera, junto a la puerta peatonal) ──
  const cito = new THREE.Group();
  cito.position.set(3.75, 0, -0.22);
  grupo.add(cito);
  cito.add(kit.caja(0.08, 1.25, 0.08, kit.mate(0x1d3885), 0, 0.62, 0));
  cito.add(kit.caja(0.2, 0.3, 0.06, kit.mate(0x101a33), 0, 1.35, -0.02));
  const boton = kit.caja(0.12, 0.05, 0.01, kit.basico(PALETA.azul), 0, 1.3, -0.055);
  cito.add(boton);
  const haloCito = kit.halo(PALETA.azul, 0.35, 0.6);
  haloCito.position.set(0, 1.34, -0.08);
  cito.add(haloCito);

  // ── Edgar, afuera, en la reja ──
  const edgar = silueta(kit, { ropa: 0x2a3550, pantalon: 0x141c30, alto: 1.76 });
  edgar.grupo.position.set(3.05, 0.1, -0.42);
  edgar.grupo.rotation.y = 0.15;
  grupo.add(edgar.grupo);
  edgar.brazoD.rotation.x = -1.15; // mano en un barrote
  const contraluz = kit.halo(0x6b8aff, 2.6, 0.18);
  contraluz.position.set(3.05, 1.2, -1.3);
  grupo.add(contraluz);

  // ── Exterior: calle, postes y edificios con ventanas ──
  for (const x of [-6, 1.5, 9]) {
    const poste = kit.cilindro(0.05, 0.07, 5, kit.mate(0x1a2440), 6);
    poste.position.set(x, 2.5, -2.4);
    grupo.add(poste);
    const luz = kit.halo(0x9fb6ff, 1.6, 0.45);
    luz.position.set(x, 5, -2.4);
    grupo.add(luz);
  }
  const texEdif = kit.textura(128, 128, (c, w, h) => {
    c.fillStyle = "#061028";
    c.fillRect(0, 0, w, h);
    for (let i = 0; i < 8; i++)
      for (let j = 0; j < 10; j++) {
        const on = rnd() > 0.72;
        c.fillStyle = on ? "rgba(255,207,138,0.9)" : "rgba(35,72,212,0.2)";
        c.fillRect(6 + i * 15, 6 + j * 12, 8, 6);
      }
  });
  const mEdif = kit.basico(0xffffff, { mapa: texEdif });
  for (const [x, w, h] of [
    [-9, 7, 11],
    [-1, 6, 14],
    [7, 8, 10],
    [14, 5, 16],
  ] as const) {
    grupo.add(kit.caja(w, h, 4, mEdif, x, h / 2, -15));
  }
  // Estrellas
  const nEst = lowPower ? 80 : 160;
  const pe = new Float32Array(nEst * 3);
  for (let i = 0; i < nEst; i++) {
    pe[i * 3] = (rnd() - 0.5) * 60;
    pe[i * 3 + 1] = 12 + rnd() * 20;
    pe[i * 3 + 2] = -25 - rnd() * 10;
  }
  const geoE = kit.geo(new THREE.BufferGeometry());
  geoE.setAttribute("position", new THREE.BufferAttribute(pe, 3));
  grupo.add(new THREE.Points(geoE, kit.track(new THREE.PointsMaterial({ color: PALETA.hielo, size: 0.06, transparent: true, opacity: 0.7, depthWrite: false }))));

  return {
    grupo,
    encuadre: enc(1.0, 2.1, 6.4, 0.9, 1.15, -0.4, 42),
    ambiente: { fondo: 0x01050f, niebla: 0.03, cielo: 0x2a3e8a, suelo: 0x02060f, hemi: 0.35, sol: 0.25, colorSol: 0x8aa2ff },
    etiquetas: [],
    tQuieto: 2,
    update(t) {
      poseReposo(edgar, t, 1.3);
      edgar.brazoD.rotation.x = -1.15 + Math.sin(t * 0.8) * 0.03;
      edgar.cabeza.rotation.y = -0.35 + Math.sin(t * 0.35) * 0.3; // mira hacia la garita
      const parpadeo = 0.9 + 0.1 * Math.sin(t * 7.3) * Math.sin(t * 2.1);
      (lampara.material as THREE.SpriteMaterial).opacity = 0.45 * parpadeo;
      (luzT.material as THREE.SpriteMaterial).opacity = Math.sin(t * 3) > 0 ? 0.85 : 0.2;
      (ledRadio.material as THREE.SpriteMaterial).opacity = 0.5 + 0.5 * Math.max(0, Math.sin(t * 1.7));
      (haloCito.material as THREE.SpriteMaterial).opacity = 0.4 + 0.3 * Math.sin(t * 2);
      brazo.rotation.z = 0;
    },
  };
};
