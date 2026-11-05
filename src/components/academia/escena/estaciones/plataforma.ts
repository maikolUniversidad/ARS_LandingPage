/**
 * Foco «plataforma»: la gafa de realidad virtual (estilizada, sin marca) de la
 * que salen los eventos del curso como pulsos de luz violeta que viajan hasta el
 * panel de la plataforma web ARS, donde se actualizan la hoja de vida y el
 * certificado con código QR.
 */

import * as THREE from "three";
import { Kit, PALETA, dibujarQR, enc, fase, fondoPantalla, ramp, renglon, v3, type FabricaEstacion } from "../kit";

const N_CARRILES = 4;

function redondeado(w: number, h: number, r: number) {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

export const crearPlataforma: FabricaEstacion = (kit: Kit, { lowPower }) => {
  const grupo = new THREE.Group();

  grupo.add(kit.suelo(30, 0x061230, PALETA.violeta, 1, 0.08));
  const plataforma = kit.cilindro(1.0, 1.1, 0.08, kit.mate(0x12204a), 36);
  plataforma.position.set(-1.7, 0.04, 0);
  grupo.add(plataforma);
  const aroP = new THREE.Mesh(kit.geo(new THREE.RingGeometry(1.02, 1.1, 48)), kit.basico(PALETA.violeta, { aditivo: true, opacidad: 0.7 }));
  aroP.rotation.x = -Math.PI / 2;
  aroP.position.set(-1.7, 0.085, 0);
  grupo.add(aroP);

  // ── Gafa ──
  const gafa = new THREE.Group();
  gafa.position.set(-1.7, 1.35, 0);
  grupo.add(gafa);
  const cuerpo = new THREE.Group();
  gafa.add(cuerpo);
  cuerpo.scale.setScalar(0.9);
  const blanco = kit.metal(0xe9edf6, 40, 0x9aa8c8);
  const gris = kit.metal(0x9aa4b8, 20, 0x667088);
  const negro = kit.metal(0x0b0f1a, 80, 0x8899cc);
  const geoVisor = kit.geo(
    new THREE.ExtrudeGeometry(redondeado(1.0, 0.56, 0.2), { depth: 0.22, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.05, bevelSegments: 4, curveSegments: 10 })
  );
  geoVisor.translate(0, 0, -0.11);
  cuerpo.add(new THREE.Mesh(geoVisor, blanco));
  // Frente: tres sensores en forma de píldora
  const geoPildora = kit.geo(new THREE.CapsuleGeometry(0.045, 0.14, 4, 10));
  for (const x of [-0.3, 0, 0.3]) {
    const p = new THREE.Mesh(geoPildora, negro);
    p.scale.z = 0.35;
    p.position.set(x, -0.02, 0.17);
    cuerpo.add(p);
  }
  for (const x of [-0.42, 0.42]) {
    const c = kit.cilindro(0.025, 0.025, 0.02, negro, 12);
    c.rotation.x = Math.PI / 2;
    c.position.set(x, -0.2, 0.15);
    cuerpo.add(c);
  }
  // Interfaz facial
  const geoFacial = kit.geo(new THREE.ExtrudeGeometry(redondeado(0.92, 0.48, 0.18), { depth: 0.12, bevelEnabled: false, curveSegments: 8 }));
  geoFacial.translate(0, 0, -0.3);
  cuerpo.add(new THREE.Mesh(geoFacial, kit.mate(0x1a2030)));
  // Correas
  const correa = new THREE.Mesh(kit.geo(new THREE.TorusGeometry(0.58, 0.045, 6, 40)), gris);
  correa.rotation.x = Math.PI / 2;
  correa.scale.set(1, 1.25, 1);
  correa.position.set(0, 0, -0.75);
  cuerpo.add(correa);
  const superior = new THREE.Mesh(kit.geo(new THREE.TorusGeometry(0.62, 0.04, 6, 30, Math.PI)), gris);
  superior.rotation.y = Math.PI / 2;
  superior.position.set(0, 0, -0.72);
  cuerpo.add(superior);
  const brilloGafa = kit.halo(PALETA.violeta, 3.2, 0.3);
  brilloGafa.position.set(0, 0, -0.2);
  gafa.add(brilloGafa);
  const emisor = new THREE.Object3D();
  emisor.position.set(0.0, 0.0, 0.25);
  gafa.add(emisor);

  // ── Panel de la plataforma web ARS ──
  const panel = new THREE.Group();
  panel.position.set(1.65, 1.45, -0.6);
  panel.rotation.y = -0.38;
  grupo.add(panel);
  const W = 2.6;
  const H = 1.7;
  const texPanel = kit.textura(1024, 670, (c, w, h) => {
    fondoPantalla(c, w, h, "Academia · Plataforma web", "#b78bff");
    // Hoja de vida
    const x1 = 34;
    const y1 = 110;
    const cw = w * 0.5 - 52;
    c.fillStyle = "rgba(35,72,212,0.22)";
    c.fillRect(x1, y1, cw, h - 150);
    c.strokeStyle = "rgba(107,138,255,0.7)";
    c.lineWidth = 2;
    c.strokeRect(x1, y1, cw, h - 150);
    c.fillStyle = "#d5e0ff";
    c.font = "700 30px system-ui, sans-serif";
    c.fillText("Hoja de vida", x1 + 24, y1 + 48);
    c.fillStyle = "#9eb0c0";
    c.beginPath();
    c.arc(x1 + 64, y1 + 112, 34, 0, Math.PI * 2);
    c.fill();
    renglon(c, x1 + 116, y1 + 90, 220, 16, "rgba(213,224,255,0.6)");
    renglon(c, x1 + 116, y1 + 118, 150, 14, "rgba(213,224,255,0.3)");
    const mods = ["M1 · Su puesto, su dotación", "M2 · Polígono", "M3 · ¿Puede o no puede?", "M4 · Un turno en la portería"];
    c.font = "500 22px system-ui, sans-serif";
    mods.forEach((m, i) => {
      const y = y1 + 200 + i * 78;
      c.fillStyle = "rgba(213,224,255,0.88)";
      c.fillText(m, x1 + 24, y);
      c.fillStyle = "rgba(107,138,255,0.2)";
      c.fillRect(x1 + 24, y + 14, cw - 48, 12);
      c.fillStyle = i < 3 ? "#35e0a1" : "#b78bff";
      c.fillRect(x1 + 24, y + 14, (cw - 48) * [1, 0.92, 0.86, 0.55][i], 12);
    });
    // Certificado
    const x2 = w * 0.5 + 18;
    c.fillStyle = "#f4f1ea";
    c.fillRect(x2, y1, cw, h - 150);
    c.strokeStyle = "#b78bff";
    c.lineWidth = 6;
    c.strokeRect(x2 + 10, y1 + 10, cw - 20, h - 170);
    c.fillStyle = "#142664";
    c.font = "700 32px system-ui, sans-serif";
    c.fillText("Certificado", x2 + 32, y1 + 66);
    c.font = "500 20px system-ui, sans-serif";
    c.fillStyle = "#1d3885";
    c.fillText("Academia ARS · Vigilante", x2 + 32, y1 + 100);
    renglon(c, x2 + 32, y1 + 130, cw - 64, 14, "rgba(20,38,100,0.35)");
    renglon(c, x2 + 32, y1 + 156, cw - 120, 14, "rgba(20,38,100,0.25)");
    dibujarQR(c, x2 + cw / 2 - 90, y1 + 210, 180, 11);
    c.fillStyle = "#1d3885";
    c.font = "500 18px system-ui, sans-serif";
    c.fillText("Verifique con el código QR", x2 + cw / 2 - 112, h - 58);
  });
  const lamina = new THREE.Mesh(kit.geo(new THREE.PlaneGeometry(W, H)), kit.basico(0xffffff, { mapa: texPanel }));
  panel.add(lamina);
  panel.add(kit.caja(W + 0.06, H + 0.06, 0.03, kit.mate(0x0a1430), 0, 0, -0.03));
  const marco = new THREE.LineSegments(kit.geo(new THREE.EdgesGeometry(kit.geo(new THREE.PlaneGeometry(W + 0.04, H + 0.04)))), kit.linea(PALETA.violeta, 0.9));
  panel.add(marco);
  // Destellos donde llegan los pulsos (filas de módulos de la hoja de vida)
  const destinos: THREE.Vector3[] = [];
  const destellos: THREE.MeshBasicMaterial[] = [];
  for (let i = 0; i < N_CARRILES; i++) {
    const y = H / 2 - ((110 + 200 + i * 78 + 8) / 670) * H;
    const x = -W / 2 + ((34 + 230) / 1024) * W;
    const m = kit.basico(PALETA.violeta, { aditivo: true, opacidad: 0 });
    const d = new THREE.Mesh(kit.geo(new THREE.PlaneGeometry(W * 0.44, 0.09)), m);
    d.position.set(x, y, 0.005);
    panel.add(d);
    destellos.push(m);
    destinos.push(new THREE.Vector3(x - W * 0.2, y, 0.02));
  }
  const destelloCert = kit.basico(PALETA.violeta, { aditivo: true, opacidad: 0 });
  const dc = new THREE.Mesh(kit.geo(new THREE.PlaneGeometry(W * 0.44, H * 0.78)), destelloCert);
  dc.position.set(W * 0.25, -0.06, 0.004);
  panel.add(dc);
  const anclaHoja = new THREE.Object3D();
  anclaHoja.position.set(-W * 0.25, H / 2 + 0.02, 0);
  panel.add(anclaHoja);
  const anclaCert = new THREE.Object3D();
  anclaCert.position.set(W * 0.25, H / 2 + 0.02, 0);
  panel.add(anclaCert);

  // ── Pulsos (gafa → panel) ──
  const porCarril = lowPower ? 2 : 3;
  type Pulso = { s: THREE.Sprite; carril: number; desfase: number };
  const pulsos: Pulso[] = [];
  const curvas: THREE.QuadraticBezierCurve3[] = [];
  const estelas: THREE.Line[] = [];
  grupo.updateMatrixWorld(true);
  const origen = emisor.getWorldPosition(new THREE.Vector3());
  for (let i = 0; i < N_CARRILES; i++) {
    const fin = panel.localToWorld(destinos[i].clone());
    const medio = origen.clone().lerp(fin, 0.5).add(v3(0, 0.5 + i * 0.12, 0.6));
    const curva = new THREE.QuadraticBezierCurve3(origen.clone(), medio, fin);
    curvas.push(curva);
    const geo = kit.geo(new THREE.BufferGeometry().setFromPoints(curva.getPoints(40)));
    const l = new THREE.Line(geo, kit.linea(PALETA.violeta, 0.16));
    grupo.add(l);
    estelas.push(l);
    for (let j = 0; j < porCarril; j++) {
      const s = kit.halo(PALETA.violeta, 0.22, 0.95);
      grupo.add(s);
      pulsos.push({ s, carril: i, desfase: j / porCarril + i * 0.17 });
    }
  }
  const tmp = new THREE.Vector3();
  const colV = new THREE.Color(PALETA.violeta);
  const colA = new THREE.Color(PALETA.azul);

  return {
    grupo,
    encuadre: enc(0.1, 1.9, 4.9, 0.1, 1.35, -0.2, 44),
    ambiente: { fondo: 0x050a22, niebla: 0.03, cielo: 0xb78bff, suelo: 0x0a1030, hemi: 1.0, sol: 1.1, colorSol: 0xece6ff },
    etiquetas: [
      { id: "hoja", texto: "Hoja de vida", ancla: anclaHoja, tono: "violeta", lado: "izq" },
      { id: "certificado", texto: "Certificado con QR", ancla: anclaCert, tono: "violeta", lado: "der" },
    ],
    tQuieto: 1.7,
    update(t) {
      gafa.rotation.y = 0.55 + Math.sin(t * 0.45) * 0.18;
      gafa.rotation.x = Math.sin(t * 0.6) * 0.05;
      gafa.position.y = 1.35 + Math.sin(t * 1.1) * 0.04;
      (brilloGafa.material as THREE.SpriteMaterial).opacity = 0.22 + 0.1 * Math.sin(t * 2);
      const llegadas = new Array<number>(N_CARRILES).fill(0);
      for (const p of pulsos) {
        const f = fase(t, 2.6, p.desfase);
        curvas[p.carril].getPoint(f, tmp);
        p.s.position.copy(tmp);
        p.s.scale.setScalar(0.12 + 0.14 * Math.sin(f * Math.PI));
        const m = p.s.material as THREE.SpriteMaterial;
        m.color.copy(colV).lerp(colA, f);
        m.opacity = Math.min(1, f * 8) * (1 - ramp(f, 0.92, 1));
        // Destello al llegar
        llegadas[p.carril] = Math.max(llegadas[p.carril], ramp(f, 0.88, 1) * (1 - ramp(f, 0.98, 1)) + (f < 0.12 ? (1 - f / 0.12) * 0.6 : 0));
      }
      for (let i = 0; i < N_CARRILES; i++) destellos[i].opacity = llegadas[i] * 0.4;
      destelloCert.opacity = Math.max(0, Math.sin(t * 0.8)) ** 8 * 0.18;
      aroP.rotation.z = t * 0.15;
    },
  };
};
