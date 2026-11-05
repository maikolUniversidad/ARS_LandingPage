/**
 * Foco «portal»: el remolino verde de 2,2 m del vestíbulo, que gira y late, y a
 * través de él el patio de formación con cadetes trotando y el instructor Óscar,
 * que saluda de vez en cuando.
 */

import * as THREE from "three";
import { Kit, PALETA, enc, fase, poseReposo, poseTrote, silueta, type FabricaEstacion, type Silueta } from "../kit";

const R_PORTAL = 1.1;
const Y_PORTAL = 1.25;

const VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

// Remolino: bandas en espiral que giran hacia el centro; el centro es casi
// transparente para que se vea el patio detrás.
const FRAG = /* glsl */ `
uniform float uTime;
uniform float uLatido;
uniform vec3 uColor;
uniform vec3 uColor2;
varying vec2 vUv;
void main() {
  vec2 p = vUv * 2.0 - 1.0;
  float r = length(p);
  if (r > 1.0) discard;
  float a = atan(p.y, p.x);
  float espiral = sin(a * 3.0 + log(r + 0.02) * 7.0 - uTime * 2.4);
  float espiral2 = sin(a * 5.0 - log(r + 0.02) * 4.0 + uTime * 1.3);
  float bandas = smoothstep(0.1, 1.0, espiral) * 0.75 + smoothstep(0.5, 1.0, espiral2) * 0.35;
  float borde = smoothstep(1.0, 0.86, r);
  float anillo = smoothstep(0.7, 0.98, r) * borde;
  float centro = smoothstep(0.05, 0.75, r);
  float alpha = borde * (bandas * (0.18 + 0.62 * centro) + anillo * 0.55) * (0.8 + 0.35 * uLatido);
  vec3 col = mix(uColor2, uColor, clamp(bandas + anillo, 0.0, 1.0));
  gl_FragColor = vec4(col * alpha, alpha);
}`;

export const crearPortal: FabricaEstacion = (kit: Kit, { lowPower }) => {
  const grupo = new THREE.Group();

  // ── Vestíbulo (primer plano, oscuro) ──
  const vest = kit.suelo(14, 0x06122c, PALETA.azul, 1, 0.14);
  vest.position.z = 3;
  grupo.add(vest);

  // ── Patio de formación (detrás del portal) ──
  const patio = new THREE.Group();
  patio.position.z = -9;
  grupo.add(patio);
  const pisoPatio = kit.suelo(30, 0x0d2350, PALETA.verde, 2, 0.12);
  pisoPatio.position.y = -0.002;
  patio.add(pisoPatio);
  // Pista de trote (anillo claro)
  const pista = new THREE.Mesh(kit.geo(new THREE.RingGeometry(4.2, 5.2, 48)), kit.mate(0x1a3570, { plano: true }));
  pista.rotation.x = -Math.PI / 2;
  pista.position.y = 0.01;
  patio.add(pista);
  // Edificios de la escuela al fondo, con ventanas encendidas
  const texVent = kit.textura(128, 64, (c, w, h) => {
    c.fillStyle = "#0e2048";
    c.fillRect(0, 0, w, h);
    for (let i = 0; i < 8; i++)
      for (let j = 0; j < 3; j++) {
        c.fillStyle = (i * 3 + j) % 5 === 0 ? "rgba(255,214,140,0.9)" : "rgba(107,138,255,0.35)";
        c.fillRect(6 + i * 15.5, 8 + j * 19, 9, 10);
      }
  });
  const mVent = kit.mate(0xffffff, { mapa: texVent, emisivo: 0x223366, intensidad: 0.6 });
  const fachadas: Array<[number, number, number, number]> = [
    [-9, -8, 10, 5],
    [4, -10, 14, 6.5],
    [13, -5, 6, 4],
  ];
  for (const [x, z, w, h] of fachadas) {
    const b = kit.caja(w, h, 3, mVent, x, h / 2, z);
    patio.add(b);
  }
  // Mástil con bandera
  const mastil = kit.cilindro(0.04, 0.05, 7, kit.mate(PALETA.hielo), 6);
  mastil.position.set(-4.5, 3.5, -5);
  patio.add(mastil);
  const bandera = kit.caja(1.4, 0.8, 0.02, kit.mate(PALETA.indigo, { emisivo: PALETA.indigo, intensidad: 0.3 }), -3.75, 6.5, -5);
  patio.add(bandera);

  // Cadetes trotando en óvalo
  const nCadetes = lowPower ? 6 : 10;
  const cadetes: Silueta[] = [];
  for (let i = 0; i < nCadetes; i++) {
    const c = silueta(kit, { ropa: 0x2a4fa8, pantalon: 0x0c1838, gorra: 0x0c1838, alto: 1.68 + (i % 3) * 0.05 });
    patio.add(c.grupo);
    cadetes.push(c);
  }
  // Instructor Óscar, de pie junto a la pista, frente al portal
  const oscar = silueta(kit, { ropa: 0x0e1f4a, pantalon: 0x0a1430, gorra: 0x0a1430, alto: 1.82, ancho: 1.08 });
  oscar.grupo.position.set(1.6, 0, 3.4);
  oscar.grupo.rotation.y = -0.25;
  patio.add(oscar.grupo);
  const pito = kit.halo(PALETA.ambar, 0.12, 0.8);
  pito.position.set(0, 0.6, 0.18);
  oscar.torso.add(pito);

  // ── Portal ──
  const portal = new THREE.Group();
  portal.position.set(0, Y_PORTAL, 0);
  grupo.add(portal);
  const uniforms = {
    uTime: { value: 0 },
    uLatido: { value: 0 },
    uColor: { value: new THREE.Color(PALETA.verde) },
    uColor2: { value: new THREE.Color(0x1aa0ff) },
  };
  const matRemolino = kit.track(
    new THREE.ShaderMaterial({
      uniforms,
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    })
  );
  const disco = new THREE.Mesh(kit.geo(new THREE.CircleGeometry(R_PORTAL, 64)), matRemolino);
  portal.add(disco);
  // Aro de piedra técnica + aro de luz
  const aro = new THREE.Mesh(kit.geo(new THREE.TorusGeometry(R_PORTAL + 0.05, 0.07, 8, 48)), kit.mate(0x1b2c55));
  portal.add(aro);
  const aroLuz = new THREE.Mesh(kit.geo(new THREE.TorusGeometry(R_PORTAL, 0.018, 6, 64)), kit.basico(PALETA.verde, { aditivo: true, opacidad: 0.9 }));
  portal.add(aroLuz);
  const halo = kit.halo(PALETA.verde, 3.6, 0.35);
  portal.add(halo);
  // Base del portal
  const base = kit.cilindro(0.9, 1.05, 0.12, kit.mate(0x13244c), 24);
  base.position.set(0, 0.06, 0);
  grupo.add(base);
  const baseLuz = new THREE.Mesh(kit.geo(new THREE.RingGeometry(0.92, 1.0, 40)), kit.basico(PALETA.verde, { aditivo: true, opacidad: 0.6 }));
  baseLuz.rotation.x = -Math.PI / 2;
  baseLuz.position.y = 0.125;
  grupo.add(baseLuz);

  // Chispas que giran en espiral hacia el remolino
  const nChispas = lowPower ? 90 : 180;
  const pos = new Float32Array(nChispas * 3);
  const semilla = new Float32Array(nChispas);
  for (let i = 0; i < nChispas; i++) semilla[i] = Math.random();
  const geoCh = kit.geo(new THREE.BufferGeometry());
  geoCh.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const matCh = kit.track(
    new THREE.PointsMaterial({ color: PALETA.verde, size: 0.035, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  const chispas = new THREE.Points(geoCh, matCh);
  chispas.frustumCulled = false;
  portal.add(chispas);

  // Columnas del vestíbulo que enmarcan
  for (const x of [-2.6, 2.6]) {
    const col = kit.caja(0.3, 3.4, 0.3, kit.mate(0x10204a), x, 1.7, 0.6);
    grupo.add(col);
    const fil = kit.caja(0.04, 3.0, 0.04, kit.basico(PALETA.azul, { aditivo: true, opacidad: 0.7 }), x + (x > 0 ? -0.17 : 0.17), 1.7, 0.6);
    grupo.add(fil);
  }

  return {
    grupo,
    encuadre: enc(0.4, 1.55, 5.2, 0, 1.2, -1.5, 42),
    ambiente: { fondo: 0x041029, niebla: 0.028, cielo: 0x6b8aff, suelo: 0x0a1630, hemi: 0.95, sol: 0.9, colorSol: 0xd5e0ff },
    etiquetas: [],
    tQuieto: 1.3,
    update(t) {
      const latido = 0.5 + 0.5 * Math.sin(t * 2.2);
      uniforms.uTime.value = t;
      uniforms.uLatido.value = latido;
      disco.rotation.z = -t * 0.35;
      const s = 1 + latido * 0.025;
      portal.scale.setScalar(s);
      (halo.material as THREE.SpriteMaterial).opacity = 0.25 + latido * 0.2;
      (aroLuz.material as THREE.MeshBasicMaterial).opacity = 0.65 + latido * 0.35;

      // Chispas: espiral entrante
      for (let i = 0; i < nChispas; i++) {
        const k = fase(t, 3.5, semilla[i]);
        const r = R_PORTAL * (1.6 - k * 1.45);
        const a = semilla[i] * Math.PI * 2 + k * 5;
        pos[i * 3] = Math.cos(a) * r;
        pos[i * 3 + 1] = Math.sin(a) * r;
        pos[i * 3 + 2] = (1 - k) * 0.5 * Math.sin(semilla[i] * 40);
      }
      geoCh.attributes.position.needsUpdate = true;

      // Cadetes en óvalo (sentido antihorario), con el paso sincronizado a la velocidad
      for (let i = 0; i < cadetes.length; i++) {
        const c = cadetes[i];
        const ang = (i / cadetes.length) * Math.PI * 2 + t * 0.22;
        const x = Math.cos(ang) * 4.7;
        const z = Math.sin(ang) * 4.7;
        c.grupo.position.x = x;
        c.grupo.position.z = z;
        c.grupo.rotation.y = -ang; // tangente a la pista
        poseTrote(c, fase(t, 0.62, i * 0.37));
      }

      // Óscar: reposo y, cada 7 s, saluda con la mano derecha
      poseReposo(oscar, t, 0.7);
      const ciclo = fase(t, 7);
      const saludo = ciclo < 0.3 ? Math.sin((ciclo / 0.3) * Math.PI) : 0;
      oscar.brazoD.rotation.z = 0.06 + saludo * 2.5;
      oscar.brazoD.rotation.x = -saludo * 0.2 + Math.sin(t * 12) * 0.15 * saludo;
      oscar.cabeza.rotation.y = 0.25 * saludo + oscar.cabeza.rotation.y * (1 - saludo);
      (pito.material as THREE.SpriteMaterial).opacity = 0.3 + 0.5 * (fase(t, 3.5) < 0.08 ? 1 : 0);
    },
  };
};
