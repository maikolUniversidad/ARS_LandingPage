/**
 * Foco «dotacion»: el aula-vestier. Un maniquí del vigilante recibe, pieza por
 * pieza, la dotación completa: uniforme, gorra, credencial, radio, linterna,
 * pito, bastón, libreta y celular. Cada pieza llega flotando a su lugar y lleva
 * su etiqueta HTML.
 */

import * as THREE from "three";
import { PIEZAS_DOTACION, type PiezaDotacion } from "../focos";
import { Kit, PALETA, easeInOut, enc, ramp, renglon, silueta, v3, type Etiqueta, type FabricaEstacion } from "../kit";

const CICLO = 17;
const T0 = 1.2; // llega la primera pieza
const PASO = 1.05; // separación entre piezas
const VUELO = 0.9;
const DISPERSA = 14.2; // se dispersan todas

type Pieza = {
  id: PiezaDotacion;
  grupo: THREE.Group;
  destino: THREE.Vector3;
  origen: THREE.Vector3;
  giroOrigen: THREE.Quaternion;
  llegada: number;
};

export const crearDotacion: FabricaEstacion = (kit: Kit) => {
  const grupo = new THREE.Group();

  // ── Aula-vestier ──
  grupo.add(kit.suelo(16, 0x0a1838, PALETA.azul, 0.8, 0.12));
  const pared = kit.caja(12, 4.2, 0.2, kit.mate(0x0c1b40), 0, 2.1, -2.6);
  grupo.add(pared);
  const franja = kit.caja(12, 0.04, 0.02, kit.basico(PALETA.azul, { aditivo: true, opacidad: 0.6 }), 0, 3.3, -2.49);
  grupo.add(franja);
  // Casilleros
  const mCas = kit.mate(0x18306a);
  const mRej = kit.mate(0x0a1430);
  for (let i = 0; i < 9; i++) {
    const x = -3.6 + i * 0.9;
    if (Math.abs(x) < 0.5) continue;
    grupo.add(kit.caja(0.84, 2.0, 0.5, mCas, x, 1.0, -2.25));
    for (let j = 0; j < 3; j++) grupo.add(kit.caja(0.5, 0.02, 0.01, mRej, x, 1.75 - j * 0.06, -1.995));
    grupo.add(kit.caja(0.04, 0.12, 0.02, kit.mate(PALETA.hielo), x + 0.3, 1.1, -1.99));
  }
  // Banca
  grupo.add(kit.caja(3.2, 0.06, 0.4, kit.mate(PALETA.madera), -2.4, 0.46, -1.4));
  for (const x of [-3.8, -1.0]) grupo.add(kit.caja(0.06, 0.44, 0.34, mRej, x, 0.22, -1.4));

  // Pedestal
  const pedestal = kit.cilindro(0.5, 0.55, 0.08, kit.mate(0x142a5c), 32);
  pedestal.position.y = 0.04;
  grupo.add(pedestal);
  const aro = new THREE.Mesh(kit.geo(new THREE.RingGeometry(0.52, 0.58, 48)), kit.basico(PALETA.azul, { aditivo: true, opacidad: 0.8 }));
  aro.rotation.x = -Math.PI / 2;
  aro.position.y = 0.085;
  grupo.add(aro);

  // ── Maniquí (gris neutro) ──
  const man = silueta(kit, { ropa: 0x55607a, pantalon: 0x4a5470, piel: 0x6a7590, alto: 1.78 });
  man.grupo.position.y = 0.08;
  man.brazoI.rotation.z = -0.14;
  man.brazoD.rotation.z = 0.14;
  grupo.add(man.grupo);
  grupo.updateMatrixWorld(true);

  /** Lleva una malla construida en el marco de `marco` al espacio de la estación. */
  const enMarco = (marco: THREE.Object3D, m: THREE.Object3D) => {
    m.updateMatrix();
    m.applyMatrix4(marco.matrixWorld);
    return m;
  };

  const piezas: Pieza[] = [];
  const rnd = (i: number) => (Math.sin(i * 91.7) * 0.5 + 0.5);

  const nueva = (id: PiezaDotacion, hijos: THREE.Object3D[]) => {
    const g = new THREE.Group();
    // Centro de la pieza = centro de sus hijos (en espacio de la estación).
    const caja = new THREE.Box3();
    for (const h of hijos) caja.expandByObject(h);
    const centro = caja.getCenter(new THREE.Vector3());
    for (const h of hijos) {
      h.position.sub(centro);
      g.add(h);
    }
    g.position.copy(centro);
    grupo.add(g);
    const i = piezas.length;
    // Origen: en arco frente al maniquí, flotando
    const ang = -1.25 + (i / (PIEZAS_DOTACION.length - 1)) * 2.5;
    const origen = v3(Math.sin(ang) * 1.25, 0.7 + rnd(i) * 1.1, Math.cos(ang) * 0.55 + 0.25);
    const giro = new THREE.Quaternion().setFromEuler(new THREE.Euler(rnd(i + 3) * 1.2 - 0.6, rnd(i + 7) * 2 - 1, rnd(i + 5) * 0.8 - 0.4));
    piezas.push({ id, grupo: g, destino: centro.clone(), origen, giroOrigen: giro, llegada: T0 + i * PASO });
  };

  // Uniforme: camisa, mangas, pantalón y correa
  const mCamisa = kit.mate(0x2448a0);
  const mPant = kit.mate(0x0e1b42);
  const mNegro = kit.mate(0x070b16);
  {
    const hijos: THREE.Object3D[] = [];
    const camisa = new THREE.Mesh(kit.geo(new THREE.CylinderGeometry(0.205, 0.165, 0.58, 7)), mCamisa);
    camisa.position.y = 0.3;
    hijos.push(enMarco(man.torso, camisa));
    const cuelloC = new THREE.Mesh(kit.geo(new THREE.CylinderGeometry(0.075, 0.09, 0.05, 7)), mCamisa);
    cuelloC.position.y = 0.6;
    hijos.push(enMarco(man.torso, cuelloC));
    for (const b of [man.brazoI, man.brazoD]) {
      const manga = new THREE.Mesh(kit.geo(new THREE.CylinderGeometry(0.058, 0.052, 0.34, 6)), mCamisa);
      manga.position.y = -0.16;
      hijos.push(enMarco(b, manga));
    }
    for (const p of [man.piernaI, man.piernaD]) {
      const pan = new THREE.Mesh(kit.geo(new THREE.CylinderGeometry(0.083, 0.064, 0.84, 6)), mPant);
      pan.position.y = -0.42;
      hijos.push(enMarco(p, pan));
    }
    const correa = new THREE.Mesh(kit.geo(new THREE.CylinderGeometry(0.172, 0.17, 0.05, 10)), mNegro);
    correa.position.y = 0.03;
    hijos.push(enMarco(man.torso, correa));
    const hebilla = kit.caja(0.05, 0.035, 0.01, kit.metal(0xc8d2e6, 80), 0, 0.03, 0.172);
    hijos.push(enMarco(man.torso, hebilla));
    nueva("uniforme", hijos);
  }
  // Gorra
  {
    const mG = kit.mate(0x0e1b42);
    const copa = new THREE.Mesh(kit.geo(new THREE.SphereGeometry(0.118, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2)), mG);
    copa.position.y = 0.035;
    const visera = kit.caja(0.17, 0.012, 0.1, mG, 0, 0.04, 0.105);
    const escudo = kit.caja(0.04, 0.03, 0.005, kit.basico(PALETA.ambar), 0, 0.065, 0.108);
    nueva("gorra", [enMarco(man.cabeza, copa), enMarco(man.cabeza, visera), enMarco(man.cabeza, escudo)]);
  }
  // Credencial (pecho, lado izquierdo del vigilante = +x)
  {
    const tex = kit.textura(128, 180, (c, w, h) => {
      c.fillStyle = "#f2f5ff";
      c.fillRect(0, 0, w, h);
      c.fillStyle = "#2348d4";
      c.fillRect(0, 0, w, 30);
      c.fillStyle = "#ffffff";
      c.font = "700 16px system-ui, sans-serif";
      c.fillText("VIGILANTE", 14, 21);
      c.fillStyle = "#9eb0c0";
      c.fillRect(34, 42, 60, 70);
      c.fillStyle = "#6a7590";
      c.beginPath();
      c.arc(64, 68, 16, 0, Math.PI * 2);
      c.fill();
      c.fillRect(42, 88, 44, 24);
      renglon(c, 18, 124, 92, 9, "rgba(20,38,100,0.55)");
      renglon(c, 18, 140, 70, 9, "rgba(20,38,100,0.35)");
      c.fillStyle = "#35e0a1";
      c.fillRect(18, 158, 40, 10);
    });
    const tarj = kit.caja(0.07, 0.1, 0.006, kit.mate(0xffffff, { mapa: tex, emisivo: 0x223366, intensidad: 0.25 }), 0.095, 0.43, 0.188);
    tarj.rotation.y = 0.35;
    nueva("credencial", [enMarco(man.torso, tarj)]);
  }
  // Radio (correa, lado izquierdo)
  {
    const cuerpo = kit.caja(0.055, 0.12, 0.035, mNegro, 0.155, 0.08, 0.075);
    const antena = kit.cilindro(0.006, 0.008, 0.09, mNegro, 6);
    antena.position.set(0.17, 0.185, 0.075);
    const led = kit.caja(0.01, 0.01, 0.004, kit.basico(PALETA.verde), 0.145, 0.13, 0.094);
    nueva("radio", [enMarco(man.torso, cuerpo), enMarco(man.torso, antena), enMarco(man.torso, led)]);
  }
  // Linterna (correa, lado derecho)
  {
    const tubo = kit.cilindro(0.018, 0.016, 0.16, kit.metal(0x262c38, 50), 10);
    tubo.position.set(-0.16, 0.02, 0.08);
    const cabeza = kit.cilindro(0.026, 0.019, 0.04, kit.metal(0x262c38, 50), 10);
    cabeza.position.set(-0.16, 0.12, 0.08);
    const lente = kit.cilindro(0.022, 0.022, 0.004, kit.basico(0xfff2c8), 12);
    lente.position.set(-0.16, 0.142, 0.08);
    nueva("linterna", [enMarco(man.torso, tubo), enMarco(man.torso, cabeza), enMarco(man.torso, lente)]);
  }
  // Pito (pecho derecho, con cordón)
  {
    const cuerpo = kit.cilindro(0.012, 0.012, 0.045, kit.metal(0xc8d2e6, 90), 10);
    cuerpo.rotation.z = Math.PI / 2;
    cuerpo.position.set(-0.09, 0.4, 0.19);
    const boquilla = kit.caja(0.02, 0.012, 0.01, kit.metal(0xc8d2e6, 90), -0.06, 0.4, 0.19);
    const cord = new THREE.Mesh(kit.geo(new THREE.TorusGeometry(0.075, 0.004, 4, 16, Math.PI * 1.1)), kit.mate(PALETA.rojo));
    cord.position.set(-0.12, 0.47, 0.18);
    cord.rotation.z = Math.PI * 1.1;
    nueva("pito", [enMarco(man.torso, cuerpo), enMarco(man.torso, boquilla), enMarco(man.torso, cord)]);
  }
  // Bastón (colgado al costado izquierdo)
  {
    const vara = kit.cilindro(0.016, 0.016, 0.52, mNegro, 8);
    vara.position.set(0.19, -0.2, -0.02);
    vara.rotation.z = 0.06;
    const puno = kit.cilindro(0.02, 0.02, 0.1, kit.mate(0x1a1f2a), 8);
    puno.position.set(0.186, 0.08, -0.02);
    nueva("baston", [enMarco(man.torso, vara), enMarco(man.torso, puno)]);
  }
  // Libreta (bolsillo derecho)
  {
    const tapa = kit.caja(0.07, 0.09, 0.014, kit.mate(0xe8dcc0), -0.1, 0.27, 0.183);
    const espiral = kit.caja(0.07, 0.008, 0.016, kit.metal(0x9eb0c0, 60), -0.1, 0.315, 0.184);
    const boli = kit.cilindro(0.004, 0.004, 0.1, kit.mate(PALETA.indigo), 6);
    boli.position.set(-0.055, 0.28, 0.19);
    nueva("libreta", [enMarco(man.torso, tapa), enMarco(man.torso, espiral), enMarco(man.torso, boli)]);
  }
  // Celular (correa, frente derecho) con la pantalla de contactos
  {
    const tex = kit.textura(64, 128, (c, w, h) => {
      c.fillStyle = "#06102a";
      c.fillRect(0, 0, w, h);
      const n = ["Central", "Supervisor", "Cuadrante", "123", "Bomberos", "Cruz Roja"];
      c.font = "600 9px system-ui, sans-serif";
      n.forEach((t, i) => {
        c.fillStyle = i === 3 ? "#ff3b5c" : "#6b8aff";
        c.fillRect(6, 10 + i * 19, 8, 8);
        c.fillStyle = "rgba(213,224,255,0.85)";
        c.fillText(t, 18, 18 + i * 19);
      });
    });
    const cuerpo = kit.caja(0.045, 0.09, 0.009, mNegro, -0.085, 0.05, 0.172);
    const pantalla = new THREE.Mesh(kit.geo(new THREE.PlaneGeometry(0.039, 0.08)), kit.basico(0xffffff, { mapa: tex }));
    pantalla.position.set(-0.085, 0.05, 0.1772);
    nueva("celular", [enMarco(man.torso, cuerpo), enMarco(man.torso, pantalla)]);
  }

  // Etiquetas en dos columnas (izquierda/derecha del maniquí) unidas a cada pieza
  // por una línea guía, para que no se encimen.
  const DER: PiezaDotacion[] = ["gorra", "credencial", "radio", "uniforme", "baston"];
  const anclas = new Map<PiezaDotacion, THREE.Object3D>();
  for (const lado of ["izq", "der"] as const) {
    const col = piezas.filter((p) => DER.includes(p.id) === (lado === "der")).sort((a, b) => b.destino.y - a.destino.y);
    let y = Infinity;
    for (const p of col) {
      y = Math.min(p.destino.y + (p.id === "gorra" ? 0.08 : 0), y - 0.17);
      const a = new THREE.Object3D();
      a.position.set(lado === "der" ? 0.5 : -0.5, y, 0.15);
      grupo.add(a);
      anclas.set(p.id, a);
    }
  }
  const opacidadPieza = (p: Pieza) => (t: number) => {
    const k = ((t % CICLO) + CICLO) % CICLO;
    return ramp(k, p.llegada + VUELO * 0.5, p.llegada + VUELO) * (1 - ramp(k, DISPERSA - 0.3, DISPERSA + 0.2));
  };
  const etiquetas: Etiqueta[] = piezas.map((p) => {
    const def = PIEZAS_DOTACION.find((d) => d.id === p.id);
    return {
      id: p.id,
      texto: def?.texto ?? p.id,
      ancla: anclas.get(p.id) ?? p.grupo,
      lado: DER.includes(p.id) ? "der" : "izq",
      tono: "azul",
      opacidad: opacidadPieza(p),
    };
  });
  // Líneas guía (aditivas: el color por vértice hace de opacidad)
  const posGuia = new Float32Array(piezas.length * 6);
  const colGuia = new Float32Array(piezas.length * 6);
  const geoGuia = kit.geo(new THREE.BufferGeometry());
  geoGuia.setAttribute("position", new THREE.BufferAttribute(posGuia, 3));
  geoGuia.setAttribute("color", new THREE.BufferAttribute(colGuia, 3));
  const guias = new THREE.LineSegments(
    geoGuia,
    kit.track(new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false }))
  );
  guias.frustumCulled = false;
  guias.renderOrder = 5;
  grupo.add(guias);
  const opGuia = piezas.map(opacidadPieza);
  const colAzul = new THREE.Color(PALETA.azul);

  const q = new THREE.Quaternion();
  const ident = new THREE.Quaternion();

  return {
    grupo,
    encuadre: enc(0.15, 1.3, 3.3, 0, 1.12, 0, 40),
    ambiente: { fondo: 0x041029, niebla: 0.04, cielo: 0x8aa2ff, suelo: 0x0a1630, hemi: 1.05, sol: 1.0, colorSol: 0xe6ecff },
    etiquetas,
    tQuieto: 13.4,
    update(t) {
      const k = ((t % CICLO) + CICLO) % CICLO;
      const salida = easeInOut(ramp(k, DISPERSA, DISPERSA + 1.6));
      for (let i = 0; i < piezas.length; i++) {
        const p = piezas[i];
        const llega = easeInOut(ramp(k, p.llegada, p.llegada + VUELO));
        const m = llega * (1 - salida);
        const flota = (1 - m) * 0.04 * Math.sin(t * 1.6 + i);
        p.grupo.position.lerpVectors(p.origen, p.destino, m);
        p.grupo.position.y += flota;
        q.copy(p.giroOrigen).slerp(ident, m);
        p.grupo.quaternion.copy(q);
        // Las que no han llegado se ven más pequeñas, como piezas en exhibición.
        p.grupo.scale.setScalar(0.85 + 0.15 * m);
        p.grupo.visible = k > 0.15 || m > 0;
        const a = anclas.get(p.id);
        const o = opGuia[i](t) * 0.8;
        if (a) {
          p.grupo.position.toArray(posGuia, i * 6);
          a.position.toArray(posGuia, i * 6 + 3);
        }
        for (let j = 0; j < 2; j++) {
          colGuia[i * 6 + j * 3] = colAzul.r * o;
          colGuia[i * 6 + j * 3 + 1] = colAzul.g * o;
          colGuia[i * 6 + j * 3 + 2] = colAzul.b * o;
        }
      }
      geoGuia.attributes.position.needsUpdate = true;
      geoGuia.attributes.color.needsUpdate = true;
      aro.rotation.z = t * 0.2;
    },
  };
};
