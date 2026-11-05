/**
 * Foco «poligono»: carril de 25 m con semáforo y blanco de papel. En primer
 * plano, un revólver .38 de entrenamiento (genérico, sin marca) hace en bucle
 * lento la verificación de vacío: abre el tambor, empuja la varilla, gira el
 * tambor y lo cierra. El cañón apunta SIEMPRE hacia la zona segura (al fondo del
 * carril) y el martillo nunca se monta. El «guardián» marca en verde el cañón al
 * frente y el dedo fuera del gatillo.
 */

import * as THREE from "three";
import { Kit, PALETA, easeInOut, enc, fase, ramp, type FabricaEstacion } from "../kit";

const CICLO = 11;
const LARGO = 25;

/** Construye el revólver. Coordenadas locales en metros; el cañón mira a −Z. */
function revolver(kit: Kit) {
  const acero = kit.metal(0x2c3548, 70, 0x8a9cc4);
  const aceroClaro = kit.metal(0x46526a, 90, 0xb0c0e0);
  const hueco = kit.mate(0x03050a, { plano: true });
  const madera = kit.metal(0x4a2a1a, 25, 0x3a2a20);

  const arma = new THREE.Group();

  // Armazón
  arma.add(kit.caja(0.022, 0.009, 0.062, acero, 0, 0.0425, 0.002)); // puente superior
  arma.add(kit.caja(0.024, 0.014, 0.062, acero, 0, -0.004, 0.002)); // base bajo el tambor
  arma.add(kit.caja(0.026, 0.054, 0.012, acero, 0, 0.019, 0.034)); // escudo trasero
  arma.add(kit.caja(0.022, 0.044, 0.009, acero, 0, 0.024, -0.0305)); // marco delantero
  arma.add(kit.caja(0.021, 0.032, 0.026, acero, 0, 0.003, 0.05)); // culata del armazón
  // Mira trasera (muesca) y delantera
  arma.add(kit.caja(0.006, 0.005, 0.008, acero, -0.006, 0.049, 0.03));
  arma.add(kit.caja(0.006, 0.005, 0.008, acero, 0.006, 0.049, 0.03));

  // Cañón con costilla y protector de la varilla
  const canon = kit.cilindro(0.0085, 0.0085, 0.1, acero, 16);
  canon.rotation.x = Math.PI / 2;
  canon.position.set(0, 0.029, -0.084);
  arma.add(canon);
  const boca = kit.cilindro(0.0042, 0.0042, 0.002, hueco, 12);
  boca.rotation.x = Math.PI / 2;
  boca.position.set(0, 0.029, -0.1345);
  arma.add(boca);
  arma.add(kit.caja(0.008, 0.005, 0.1, acero, 0, 0.0385, -0.084)); // costilla
  arma.add(kit.caja(0.003, 0.009, 0.012, aceroClaro, 0, 0.044, -0.127)); // mira delantera
  arma.add(kit.caja(0.012, 0.012, 0.046, acero, 0, 0.0155, -0.057)); // protector de la varilla

  // Grúa + tambor (bascula hacia la izquierda del tirador, −X)
  const grua = new THREE.Group();
  grua.position.set(0, -0.001, 0);
  arma.add(grua);
  grua.add(kit.caja(0.006, 0.02, 0.006, acero, 0, 0.009, -0.0235)); // brazo de la grúa
  const tambor = new THREE.Group();
  tambor.position.set(0, 0.018, 0.001);
  grua.add(tambor);
  const cuerpo = kit.cilindro(0.019, 0.019, 0.042, aceroClaro, 18);
  cuerpo.rotation.x = Math.PI / 2;
  tambor.add(cuerpo);
  // 6 recámaras (vacías: se ven negras al abrir) y 6 estrías
  const geoRec = kit.geo(new THREE.CircleGeometry(0.0046, 12));
  for (let i = 0; i < 6; i++) {
    const a = Math.PI / 2 + (i * Math.PI) / 3;
    for (const z of [-0.0212, 0.0212]) {
      const r = new THREE.Mesh(geoRec, hueco);
      r.position.set(Math.cos(a) * 0.012, Math.sin(a) * 0.012, z);
      r.rotation.y = z < 0 ? Math.PI : 0; // la cara delantera mira a −Z
      tambor.add(r);
    }
    const b = a + Math.PI / 6;
    const estria = kit.caja(0.0045, 0.0025, 0.024, hueco, Math.cos(b) * 0.0183, Math.sin(b) * 0.0183, 0);
    estria.rotation.z = b + Math.PI / 2;
    tambor.add(estria);
  }
  // Varilla expulsora + estrella extractora (se desplazan al empujar)
  const varilla = new THREE.Group();
  tambor.add(varilla);
  const vara = kit.cilindro(0.0028, 0.0028, 0.046, aceroClaro, 8);
  vara.rotation.x = Math.PI / 2;
  vara.position.z = -0.044;
  varilla.add(vara);
  const punta = kit.cilindro(0.0038, 0.0038, 0.007, acero, 10);
  punta.rotation.x = Math.PI / 2;
  punta.position.z = -0.066;
  varilla.add(punta);
  const estrella = kit.cilindro(0.0135, 0.0135, 0.003, aceroClaro, 6);
  estrella.rotation.x = Math.PI / 2;
  estrella.position.z = 0.0215;
  varilla.add(estrella);

  // Martillo (abajo, sin montar)
  const martillo = new THREE.Group();
  martillo.position.set(0, 0.038, 0.038);
  arma.add(martillo);
  const cuerpoM = kit.caja(0.007, 0.022, 0.01, acero, 0, 0.008, 0.004);
  cuerpoM.rotation.x = -0.35;
  martillo.add(cuerpoM);
  const espuela = kit.caja(0.009, 0.005, 0.014, aceroClaro, 0, 0.019, 0.012);
  espuela.rotation.x = -0.2;
  martillo.add(espuela);

  // Guardamonte y gatillo
  const geoGuarda = kit.geo(new THREE.TorusGeometry(0.021, 0.0026, 6, 20, Math.PI));
  geoGuarda.rotateZ(Math.PI);
  geoGuarda.rotateY(Math.PI / 2);
  const guarda = new THREE.Mesh(geoGuarda, acero);
  guarda.position.set(0, -0.011, 0.014);
  arma.add(guarda);
  const geoGat = kit.geo(new THREE.TorusGeometry(0.014, 0.0028, 6, 10, Math.PI * 0.5));
  geoGat.rotateZ(Math.PI * 0.75);
  geoGat.rotateY(Math.PI / 2);
  const gatillo = new THREE.Mesh(geoGat, aceroClaro);
  gatillo.position.set(0, -0.013, -0.004);
  arma.add(gatillo);

  // Empuñadura (madera, inclinada hacia atrás)
  const geoEmp = kit.geo(new THREE.CapsuleGeometry(0.0155, 0.04, 3, 10));
  const empunadura = new THREE.Mesh(geoEmp, madera);
  empunadura.scale.set(0.9, 1, 1.12);
  empunadura.rotation.x = -0.36;
  empunadura.position.set(0, -0.032, 0.062);
  arma.add(empunadura);

  return { arma, grua, tambor, varilla, gatillo, guarda, boca };
}

export const crearPoligono: FabricaEstacion = (kit: Kit, { lowPower }) => {
  const grupo = new THREE.Group();

  // ── Nave del polígono ──
  const piso = kit.suelo(60, 0x081633, PALETA.azul, 1, 0.08);
  piso.position.z = -LARGO / 2;
  grupo.add(piso);
  const mMuro = kit.mate(0x0f2150);
  const mOscuro = kit.mate(0x081330);
  // Divisiones de las cabinas (3 carriles a la vista)
  for (const x of [-2.4, -0.8, 0.8, 2.4]) {
    grupo.add(kit.caja(0.06, 2.1, 1.3, mMuro, x, 1.05, -0.3));
    grupo.add(kit.caja(0.065, 0.03, 1.3, kit.basico(PALETA.azul, { aditivo: true, opacidad: 0.6 }), x, 2.1, -0.3));
  }
  // Mesa de tiro
  grupo.add(kit.caja(1.5, 0.05, 0.5, kit.mate(0x1b326a), 0, 0.98, -0.1));
  grupo.add(kit.caja(1.5, 0.95, 0.04, mOscuro, 0, 0.48, -0.33));
  // Deflectores del techo con franja de luz
  for (let i = 0; i < 6; i++) {
    const z = -3 - i * 4;
    grupo.add(kit.caja(6, 0.5, 0.12, mOscuro, 0, 2.9, z));
    grupo.add(kit.caja(6, 0.02, 0.03, kit.basico(PALETA.hielo, { aditivo: true, opacidad: 0.25 }), 0, 2.64, z + 0.08));
  }
  // Muros laterales y espaldón (zona segura)
  grupo.add(kit.caja(0.2, 3.2, LARGO + 2, mMuro, -4, 1.6, -LARGO / 2));
  grupo.add(kit.caja(0.2, 3.2, LARGO + 2, mMuro, 4, 1.6, -LARGO / 2));
  const espaldon = kit.caja(8, 3.4, 0.6, kit.mate(0x13285e), 0, 1.7, -LARGO - 1.6);
  espaldon.rotation.x = -0.18;
  grupo.add(espaldon);
  const zonaSegura = new THREE.Mesh(kit.geo(new THREE.PlaneGeometry(7.6, 1.2)), kit.basico(PALETA.verde, { aditivo: true, opacidad: 0.12 }));
  zonaSegura.rotation.x = -Math.PI / 2;
  zonaSegura.position.set(0, 0.01, -LARGO - 0.6);
  grupo.add(zonaSegura);

  // Blancos de papel (anillos concéntricos) en los tres carriles
  const texBlanco = kit.textura(256, 340, (c, w, h) => {
    c.fillStyle = "#f3efe4";
    c.fillRect(0, 0, w, h);
    const cx = w / 2;
    const cy = h * 0.47;
    for (let i = 7; i >= 1; i--) {
      c.beginPath();
      c.arc(cx, cy, i * 16, 0, Math.PI * 2);
      c.fillStyle = i <= 2 ? "#1d3885" : i % 2 ? "#f3efe4" : "#dfe4f2";
      c.fill();
      c.strokeStyle = "#1d3885";
      c.lineWidth = 2;
      c.stroke();
    }
    c.fillStyle = "#1d3885";
    c.font = "700 20px system-ui, sans-serif";
    c.fillText("25 m", 18, h - 18);
  });
  const mBlanco = kit.mate(0xffffff, { mapa: texBlanco, emisivo: 0x333333, intensidad: 0.5, plano: true });
  const blancos: THREE.Group[] = [];
  for (const x of [-1.6, 0, 1.6]) {
    const b = new THREE.Group();
    b.position.set(x, 1.45, -LARGO);
    b.add(kit.caja(0.5, 0.66, 0.01, mBlanco));
    b.add(kit.caja(0.02, 0.5, 0.02, mOscuro, 0, 0.58, 0));
    grupo.add(b);
    blancos.push(b);
  }
  grupo.add(kit.caja(6, 0.04, 0.04, mOscuro, 0, 2.08, -LARGO));
  const focoBlanco = kit.halo(0xfff4d8, 2.2, 0.25);
  focoBlanco.position.set(0, 1.5, -LARGO + 0.3);
  grupo.add(focoBlanco);

  // Semáforo (rojo: línea fría mientras se verifica el arma)
  const semaforo = new THREE.Group();
  semaforo.position.set(0.55, 1.45, -4.2);
  grupo.add(semaforo);
  semaforo.add(kit.caja(0.12, 0.34, 0.1, kit.mate(0x070b16)));
  semaforo.add(kit.caja(0.03, 0.6, 0.03, kit.mate(0x070b16), 0, -0.45, 0));
  const luces: Array<{ m: THREE.MeshBasicMaterial; h: THREE.Sprite }> = [];
  [PALETA.rojo, PALETA.ambar, PALETA.verde].forEach((col, i) => {
    const m = kit.basico(col, { opacidad: 0.25 });
    const disco = new THREE.Mesh(kit.geo(new THREE.CircleGeometry(0.032, 16)), m);
    disco.position.set(0, 0.105 - i * 0.105, 0.051);
    semaforo.add(disco);
    const h = kit.halo(col, 0.3, 0);
    h.position.copy(disco.position).z += 0.02;
    semaforo.add(h);
    luces.push({ m, h });
  });

  // ── Revólver ──
  const r = revolver(kit);
  const soporte = new THREE.Group();
  soporte.position.set(0, 1.13, 0.02);
  grupo.add(soporte);
  soporte.add(r.arma);
  const brilloMesa = kit.halo(PALETA.azul, 0.5, 0.25);
  brilloMesa.position.set(0, 1.01, 0.0);
  grupo.add(brilloMesa);

  // ── Guardián: cañón al frente (haz verde hacia la zona segura) ──
  const nHaz = lowPower ? 24 : 48;
  const posHaz = new Float32Array(nHaz * 3);
  const geoHaz = kit.geo(new THREE.BufferGeometry());
  geoHaz.setAttribute("position", new THREE.BufferAttribute(posHaz, 3));
  const haz = new THREE.Points(
    geoHaz,
    kit.track(new THREE.PointsMaterial({ color: PALETA.verde, size: 0.016, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false }))
  );
  haz.frustumCulled = false;
  grupo.add(haz);
  const aroBoca = new THREE.Mesh(kit.geo(new THREE.RingGeometry(0.014, 0.018, 24)), kit.basico(PALETA.verde, { aditivo: true, opacidad: 0.9, doble: true }));
  aroBoca.position.set(0, 0.029, -0.14);
  r.arma.add(aroBoca);
  // Dedo fuera: aro verde alrededor del guardamonte
  const aroGuarda = new THREE.Mesh(kit.geo(new THREE.RingGeometry(0.024, 0.0265, 32)), kit.basico(PALETA.verde, { aditivo: true, opacidad: 0.8, doble: true }));
  aroGuarda.rotation.y = Math.PI / 2;
  aroGuarda.position.set(-0.0145, -0.016, 0.014);
  r.arma.add(aroGuarda);
  const anclaBoca = new THREE.Object3D();
  anclaBoca.position.set(0, 0.03, -0.14);
  r.arma.add(anclaBoca);
  const anclaGuarda = new THREE.Object3D();
  anclaGuarda.position.set(0, -0.035, 0.014);
  r.arma.add(anclaGuarda);
  const anclaTambor = new THREE.Object3D();
  anclaTambor.position.set(0, 0.0, 0.0);
  r.tambor.add(anclaTambor);

  const abierto = (k: number) => easeInOut(ramp(k, 1.2, 2.6)) * (1 - easeInOut(ramp(k, 6.2, 7.6)));

  return {
    grupo,
    encuadre: enc(-0.34, 1.3, 0.5, 0.02, 1.15, -0.2, 36),
    ambiente: { fondo: 0x030c22, niebla: 0.018, cielo: 0x8aa2ff, suelo: 0x081633, hemi: 0.85, sol: 1.25, colorSol: 0xe6ecff },
    balanceo: 0.25,
    etiquetas: [
      { id: "canon", texto: "Cañón al frente ✓", ancla: anclaBoca, tono: "verde", lado: "izq" },
      { id: "dedo", texto: "Dedo fuera del gatillo ✓", ancla: anclaGuarda, tono: "verde", lado: "izq" },
      {
        id: "vacio",
        texto: "Verificar vacío: 6 recámaras",
        ancla: anclaTambor,
        tono: "azul",
        lado: "izq",
        opacidad: (t) => {
          const k = ((t % CICLO) + CICLO) % CICLO;
          return ramp(k, 2.2, 2.8) * (1 - ramp(k, 6.0, 6.5));
        },
      },
    ],
    tQuieto: 4.6,
    update(t) {
      const k = ((t % CICLO) + CICLO) % CICLO;
      const a = abierto(k);
      r.grua.rotation.z = a * 1.3;
      // La varilla empuja y vuelve (expulsa casquillos: no hay ninguno)
      const emp = ramp(k, 2.7, 3.2) * (1 - ramp(k, 3.4, 3.9));
      r.varilla.position.z = easeInOut(emp) * 0.014;
      // El tambor gira despacio mientras está abierto
      r.tambor.rotation.z = easeInOut(ramp(k, 3.9, 6.0)) * Math.PI * 2;
      // El arma se ladea un poco sobre su eje (sin cambiar hacia dónde apunta el cañón)
      r.arma.rotation.z = -a * 0.32;
      r.arma.position.y = Math.sin(t * 0.9) * 0.002;

      // Semáforo en rojo (alto el fuego) con latido suave
      const lat = 0.75 + 0.25 * Math.sin(t * 3);
      luces[0].m.opacity = 1;
      (luces[0].h.material as THREE.SpriteMaterial).opacity = 0.8 * lat;
      luces[1].m.opacity = 0.07;
      luces[2].m.opacity = 0.07;

      // Haz del guardián: puntos que viajan del cañón al espaldón
      const ox = 0;
      const oy = 1.13 + 0.029;
      const oz = -0.14 + 0.02;
      for (let i = 0; i < nHaz; i++) {
        const f = fase(t, 4, i / nHaz);
        const d = f * f * LARGO;
        posHaz[i * 3] = ox;
        posHaz[i * 3 + 1] = oy + (1.45 - oy) * f * f;
        posHaz[i * 3 + 2] = oz - d;
      }
      geoHaz.attributes.position.needsUpdate = true;
      const pulso = 0.6 + 0.4 * Math.sin(t * 2.4);
      (aroBoca.material as THREE.MeshBasicMaterial).opacity = 0.5 + 0.5 * pulso;
      (aroGuarda.material as THREE.MeshBasicMaterial).opacity = 0.45 + 0.45 * pulso;
      for (const b of blancos) b.rotation.y = Math.sin(t * 0.5 + b.position.x) * 0.03;
    },
  };
};
