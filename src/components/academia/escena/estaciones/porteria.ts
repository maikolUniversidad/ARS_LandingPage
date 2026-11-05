/**
 * Foco «porteria»: la portería de un conjunto, vista desde detrás del mostrador.
 * La tableta ARS está encendida con la minuta; en la fila esperan un residente,
 * un domiciliario con su caja, un adulto mayor con bastón y una visita. A un
 * lado, los paquetes recibidos.
 */

import * as THREE from "three";
import { Kit, PALETA, enc, fase, fondoPantalla, poseReposo, renglon, silueta, type FabricaEstacion, type Silueta } from "../kit";

export const crearPorteria: FabricaEstacion = (kit: Kit) => {
  const grupo = new THREE.Group();

  // ── Recepción ──
  grupo.add(kit.suelo(24, 0x0b1a3e, PALETA.azul, 0.6, 0.08));
  const mPared = kit.mate(0x0f2150);
  grupo.add(kit.caja(14, 4, 0.2, mPared, 0, 2, -6.2)); // fondo
  grupo.add(kit.caja(0.2, 4, 9, mPared, -4.6, 2, -1.8)); // lateral
  // Puerta de vidrio al fondo y su luz
  grupo.add(kit.caja(2.4, 2.6, 0.04, kit.basico(0x9fb6ff, { opacidad: 0.18 }), 1.2, 1.3, -6.05));
  grupo.add(kit.caja(2.5, 0.06, 0.08, kit.mate(PALETA.hielo), 1.2, 2.63, -6.05));
  const luzPuerta = kit.halo(0x9fb6ff, 4, 0.22);
  luzPuerta.position.set(1.2, 1.4, -5.8);
  grupo.add(luzPuerta);
  // Letrero
  const texLetrero = kit.textura(256, 64, (c, w, h) => {
    c.fillStyle = "#06102a";
    c.fillRect(0, 0, w, h);
    c.fillStyle = "#d5e0ff";
    c.font = "700 22px system-ui, sans-serif";
    c.fillText("PORTERÍA · TORRE 2", 16, 40);
    c.fillStyle = "#6b8aff";
    c.fillRect(0, h - 5, w, 5);
  });
  grupo.add(kit.caja(2.4, 0.6, 0.04, kit.basico(0xffffff, { mapa: texLetrero }), -1.0, 2.95, -6.08));

  // ── Mostrador (primer plano) ──
  const mMostrador = kit.mate(0x1b336e);
  grupo.add(kit.caja(3.4, 1.05, 0.5, mMostrador, 0, 0.525, 0.4));
  grupo.add(kit.caja(3.6, 0.06, 0.7, kit.mate(0x2a4a96), 0, 1.08, 0.45));
  grupo.add(kit.caja(3.6, 0.02, 0.02, kit.basico(PALETA.azul, { aditivo: true, opacidad: 0.8 }), 0, 1.0, 0.09));

  // Tableta ARS con la minuta
  const texTab = kit.textura(512, 340, (c, w, h) => {
    fondoPantalla(c, w, h, "Minuta · Portería", "#6b8aff");
    const filas = [
      ["06:12", "Salida residente · Apto 402", "#35e0a1"],
      ["06:40", "Domicilio · Torre 2", "#6b8aff"],
      ["07:05", "Paquete recibido · 3", "#ffb547"],
      ["07:18", "Visita autorizada · 1103", "#35e0a1"],
      ["07:30", "Ronda 1 · sin novedad", "#6b8aff"],
    ];
    c.font = "500 22px system-ui, sans-serif";
    filas.forEach(([hora, txt, col], i) => {
      const y = 78 + i * 46;
      c.fillStyle = "rgba(35,72,212,0.18)";
      c.fillRect(20, y - 28, w - 40, 38);
      c.fillStyle = col;
      c.beginPath();
      c.arc(40, y - 9, 7, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = "rgba(213,224,255,0.65)";
      c.fillText(hora, 58, y);
      c.fillStyle = "rgba(213,224,255,0.92)";
      c.fillText(txt, 130, y);
    });
    renglon(c, 20, h - 34, 160, 18, "rgba(107,138,255,0.75)");
  });
  const tableta = new THREE.Group();
  tableta.position.set(-0.55, 1.2, 0.42);
  tableta.rotation.x = -0.95;
  tableta.rotation.y = 0.18;
  grupo.add(tableta);
  tableta.add(kit.caja(0.36, 0.25, 0.015, kit.mate(0x070b16)));
  const pantalla = new THREE.Mesh(kit.geo(new THREE.PlaneGeometry(0.33, 0.22)), kit.basico(0xffffff, { mapa: texTab }));
  pantalla.position.z = 0.0081;
  tableta.add(pantalla);
  const soporteT = kit.caja(0.08, 0.1, 0.04, kit.mate(0x070b16), -0.55, 1.13, 0.34);
  grupo.add(soporteT);
  const brilloTab = kit.halo(PALETA.azul, 0.9, 0.35);
  brilloTab.position.set(-0.55, 1.25, 0.48);
  grupo.add(brilloTab);
  // Libro de minuta y citófono interno
  grupo.add(kit.caja(0.3, 0.03, 0.22, kit.mate(0xe8dcc0), 0.45, 1.125, 0.5));
  grupo.add(kit.caja(0.12, 0.2, 0.08, kit.mate(0x101a33), 1.2, 1.21, 0.55));

  // Paquetes (estante lateral y mostrador)
  const mCarton = kit.mate(0x8a6a44);
  const mCartonOsc = kit.mate(0x6e5232);
  const paquetes: Array<[number, number, number, number, number, number]> = [
    [2.35, 0.2, 0.3, 0.4, 0.4, 0.4],
    [2.35, 0.55, 0.3, 0.34, 0.3, 0.3],
    [2.85, 0.15, 0.25, 0.3, 0.3, 0.45],
    [2.8, 0.42, 0.25, 0.26, 0.24, 0.3],
    [1.4, 1.2, 0.35, 0.28, 0.18, 0.22],
  ];
  paquetes.forEach(([x, y, z, w, h, d], i) => {
    const p = kit.caja(w, h, d, i % 2 ? mCartonOsc : mCarton, x, y, z);
    p.rotation.y = (i - 2) * 0.12;
    grupo.add(p);
    grupo.add(kit.caja(w * 1.01, 0.03, d * 0.25, kit.mate(0xd8c9a0), x, y + h / 2 + 0.002, z));
  });

  // ── Fila de visitantes ──
  type Persona = { s: Silueta; base: THREE.Vector3; desfase: number };
  const personas: Persona[] = [];
  const agregar = (s: Silueta, x: number, z: number, rotY: number, desfase: number) => {
    s.grupo.position.set(x, 0, z);
    s.grupo.rotation.y = rotY;
    grupo.add(s.grupo);
    personas.push({ s, base: new THREE.Vector3(x, 0, z), desfase });
  };
  // Residente (al frente, en el mostrador)
  const residente = silueta(kit, { ropa: 0x3e6fd1, pantalon: 0x1a2a52, alto: 1.7 });
  agregar(residente, 0.05, -0.55, 0, 0);
  // Domiciliario con la caja térmica
  const domi = silueta(kit, { ropa: 0xe0503c, pantalon: 0x1a1f2a, gorra: 0xe0503c, alto: 1.76 });
  agregar(domi, 0.95, -1.55, -0.75, 1.1);
  const caja = kit.caja(0.4, 0.38, 0.3, kit.mate(0xe0503c), 0, 0.42, -0.22);
  domi.torso.add(caja);
  const tapa = kit.caja(0.41, 0.03, 0.31, kit.mate(0xff8a6a), 0, 0.62, -0.22);
  domi.torso.add(tapa);
  domi.brazoI.rotation.x = -0.7;
  domi.brazoD.rotation.x = -0.7;
  const bolsa = kit.caja(0.3, 0.22, 0.12, kit.mate(0xd8c9a0), 0, -0.62, 0.08);
  domi.brazoD.add(bolsa);
  // Adulto mayor con bastón
  const mayor = silueta(kit, { ropa: 0x7a6a9c, pantalon: 0x2a2a3e, piel: 0x9a8070, alto: 1.6, encorvado: 0.22 });
  agregar(mayor, -0.45, -2.35, 0.3, 2.3);
  const baston = kit.cilindro(0.012, 0.012, 0.86, kit.mate(PALETA.madera), 6);
  baston.position.set(0, -0.62 - 0.43 + 0.3, 0.1);
  mayor.brazoD.add(baston);
  mayor.brazoD.rotation.x = -0.25;
  // Visita
  const visita = silueta(kit, { ropa: 0x2d8a74, pantalon: 0x14223e, alto: 1.74 });
  agregar(visita, 0.45, -3.5, -0.2, 3.4);

  // Fila marcada en el piso
  for (let i = 0; i < 4; i++) {
    const marca = new THREE.Mesh(kit.geo(new THREE.RingGeometry(0.22, 0.26, 24)), kit.basico(PALETA.azul, { aditivo: true, opacidad: 0.35 }));
    marca.rotation.x = -Math.PI / 2;
    marca.position.set(0.45, 0.012, -0.6 - i * 1.08);
    grupo.add(marca);
  }

  return {
    grupo,
    encuadre: enc(-0.9, 1.95, 2.6, 0.55, 1.05, -1.9, 44),
    ambiente: { fondo: 0x041029, niebla: 0.035, cielo: 0x8aa2ff, suelo: 0x0a1630, hemi: 1.0, sol: 0.95, colorSol: 0xe6ecff },
    etiquetas: [],
    tQuieto: 1.5,
    update(t) {
      for (const p of personas) {
        poseReposo(p.s, t, p.desfase);
        // Un leve paso en el sitio, como quien espera su turno
        p.s.grupo.position.z = p.base.z + Math.sin(t * 0.5 + p.desfase) * 0.03;
      }
      // El residente conversa: la cabeza asiente
      residente.cabeza.rotation.x = Math.max(0, Math.sin(t * 2.2)) * 0.08;
      residente.brazoD.rotation.x = -0.3 - Math.max(0, Math.sin(t * 1.1)) * 0.4;
      mayor.brazoD.rotation.x = -0.25 + Math.sin(t * 0.9) * 0.03;
      domi.brazoI.rotation.x = domi.brazoD.rotation.x = -0.7;
      (brilloTab.material as THREE.SpriteMaterial).opacity = 0.3 + 0.08 * Math.sin(fase(t, 3) * Math.PI * 2);
    },
  };
};
