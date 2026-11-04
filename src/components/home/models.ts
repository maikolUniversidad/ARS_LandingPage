import * as THREE from "three";

/**
 * Modelos procedurales del home (sin descargas): guardia/persona, robot
 * cuadrúpedo, sensores y tablero de gerencia. Todos son low-poly y comparten
 * materiales para que un móvil medio los mueva sin esfuerzo.
 */

const BODY = 0x16295a;

type Pivot = THREE.Group;

function pivot(x: number, y: number, z: number): Pivot {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  return g;
}

function limb(geo: THREE.BufferGeometry, mat: THREE.Material, dy: number) {
  const m = new THREE.Mesh(geo, mat);
  m.position.y = dy;
  return m;
}

// ───────────────────────── Persona (guardia, supervisor, intruso) ─────────────────────────

export type Humanoid = {
  group: THREE.Group;
  accent: THREE.MeshBasicMaterial;
  body: THREE.MeshStandardMaterial;
  /** Fase de marcha en radianes y cuánto camina (0 = quieto). */
  pose: (phase: number, amount: number) => void;
  /** Punto en la mano derecha (teléfono / radio), en coordenadas locales. */
  hand: THREE.Object3D;
};

export function createHumanoid(accentColor: number, opts: { cap?: boolean; bodyColor?: number } = {}): Humanoid {
  const body = new THREE.MeshStandardMaterial({ color: opts.bodyColor ?? BODY, roughness: 0.75, metalness: 0.1 });
  const accent = new THREE.MeshBasicMaterial({ color: accentColor, transparent: true });
  const group = new THREE.Group();

  const legGeo = new THREE.BoxGeometry(0.17, 0.86, 0.2);
  const legL = pivot(-0.12, 0.92, 0);
  const legR = pivot(0.12, 0.92, 0);
  legL.add(limb(legGeo, body, -0.43));
  legR.add(limb(legGeo, body, -0.43));

  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.64, 0.28), body);
  torso.position.y = 1.26;
  const vest = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.07, 0.3), accent);
  vest.position.y = 1.36;
  const belt = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.05, 0.3), accent);
  belt.position.y = 0.97;

  const armGeo = new THREE.BoxGeometry(0.12, 0.6, 0.14);
  const armL = pivot(-0.33, 1.54, 0);
  const armR = pivot(0.33, 1.54, 0);
  armL.add(limb(armGeo, body, -0.3));
  armR.add(limb(armGeo, body, -0.3));
  const hand = new THREE.Object3D();
  hand.position.set(0, -0.62, 0.06);
  armR.add(hand);
  const phone = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.16, 0.1), accent);
  hand.add(phone);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 10), body);
  head.position.y = 1.76;
  group.add(legL, legR, torso, vest, belt, armL, armR, head);
  if (opts.cap !== false) {
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.17, 0.08, 12), accent);
    cap.position.set(0, 1.87, 0.02);
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.025, 0.12), accent);
    visor.position.set(0, 1.84, 0.17);
    group.add(cap, visor);
  }

  const pose = (phase: number, amount: number) => {
    const s = Math.sin(phase) * 0.55 * amount;
    legL.rotation.x = s;
    legR.rotation.x = -s;
    armL.rotation.x = -s * 0.8;
    // El brazo derecho sostiene el teléfono cuando está quieto.
    armR.rotation.x = amount > 0.2 ? s * 0.8 : -0.9;
    group.children[2].position.y = 1.26 + Math.abs(Math.cos(phase)) * 0.03 * amount;
  };
  pose(0, 0);

  return { group, accent, body, pose, hand };
}

// ───────────────────────── Robot cuadrúpedo ─────────────────────────

export type Quadruped = {
  group: THREE.Group;
  accent: THREE.MeshBasicMaterial;
  /** Fase del trote y amplitud (0 = de pie). */
  pose: (phase: number, amount: number) => void;
  /** Punto del sensor frontal (local). */
  eye: THREE.Object3D;
};

export function createQuadruped(accentColor: number): Quadruped {
  const shell = new THREE.MeshStandardMaterial({ color: 0x9fb0c8, roughness: 0.45, metalness: 0.55 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x1b2747, roughness: 0.6, metalness: 0.4 });
  const accent = new THREE.MeshBasicMaterial({ color: accentColor, transparent: true });
  const group = new THREE.Group();

  // Mira hacia +x.
  const torso = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.36, 0.56), shell);
  torso.position.y = 0.8;
  const spine = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.08, 0.3), dark);
  spine.position.y = 1.0;
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(1.52, 0.05, 0.58), accent);
  stripe.position.y = 0.72;
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.28, 0.44), shell);
  head.position.set(0.9, 0.86, 0);
  const visor = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.1, 0.36), accent);
  visor.position.set(1.11, 0.88, 0);
  const lidar = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 0.12, 14), dark);
  lidar.position.set(0.55, 1.06, 0);
  const lidarRing = new THREE.Mesh(new THREE.CylinderGeometry(0.115, 0.115, 0.03, 14), accent);
  lidarRing.position.set(0.55, 1.1, 0);
  group.add(torso, spine, stripe, head, visor, lidar, lidarRing);

  const eye = new THREE.Object3D();
  eye.position.set(1.14, 0.88, 0);
  group.add(eye);

  const upperGeo = new THREE.BoxGeometry(0.12, 0.42, 0.12);
  const lowerGeo = new THREE.BoxGeometry(0.09, 0.44, 0.09);
  const footGeo = new THREE.SphereGeometry(0.07, 8, 6);
  const legs: Array<{ hip: Pivot; knee: Pivot; phase: number }> = [];
  const hips: Array<[number, number, number]> = [
    [0.56, 0.33, 0],
    [0.56, -0.33, Math.PI],
    [-0.56, 0.33, Math.PI],
    [-0.56, -0.33, 0],
  ];
  for (const [x, z, p] of hips) legs.push({ hip: pivot(x, 0.72, z), knee: pivot(0, -0.4, 0), phase: p });
  for (const leg of legs) {
    leg.hip.add(limb(upperGeo, dark, -0.2));
    leg.knee.add(limb(lowerGeo, shell, -0.22));
    const foot = new THREE.Mesh(footGeo, dark);
    foot.position.y = -0.44;
    leg.knee.add(foot);
    leg.hip.add(leg.knee);
    group.add(leg.hip);
  }

  // Eleva todo para que las patas (dobladas) apoyen en el suelo.
  for (const ch of group.children) ch.position.y += 0.1;

  const pose = (phase: number, amount: number) => {
    for (const leg of legs) {
      const s = Math.sin(phase + leg.phase);
      leg.hip.rotation.z = 0.28 + s * 0.38 * amount;
      leg.knee.rotation.z = -0.56 + Math.max(0, -Math.cos(phase + leg.phase)) * -0.45 * amount;
    }
    torso.position.y = 0.9 + Math.abs(Math.sin(phase * 2)) * 0.025 * amount;
  };
  pose(0, 0);

  return { group, accent, pose, eye };
}

// ───────────────────────── Tablero de gerencia ─────────────────────────

export type BoardStrings = {
  title: string;
  live: string;
  rows: string[];
  times: string[];
  done: string;
  sites: string;
};

export type Dashboard = {
  group: THREE.Group;
  screen: THREE.MeshBasicMaterial;
  frame: THREE.LineBasicMaterial;
  /** Redibuja el tablero: `steps` = nodos de la traza alcanzados (0..6). */
  draw: (time: number, steps: number, glow: number) => void;
  dispose: () => void;
};

const ROW_TINT = ["#5fd8ff", "#ffb547", "#35e0a1", "#a88bff", "#d5e0ff", "#35e0a1"];

export function createDashboard(width: number, strings: BoardStrings): Dashboard {
  const W = 640;
  const H = 360;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  // Sin flipY (evita el warning de texturas 3D); se compensa invirtiendo el plano.
  tex.flipY = false;
  tex.anisotropy = 4;

  const height = (width * H) / W;
  const screen = new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide, depthWrite: false });
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(width, height), screen);
  plane.scale.y = -1;
  const frame = new THREE.LineBasicMaterial({ color: 0x6b8aff, transparent: true });
  const border = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(width * 1.02, height * 1.04)), frame);
  const group = new THREE.Group();
  group.add(plane, border);

  let lastKey = "";
  const draw = (time: number, steps: number, glow: number) => {
    if (!ctx) return;
    // Redibuja a ~8 Hz o cuando cambia la traza.
    const key = `${steps}|${Math.floor(time * 8)}`;
    if (key === lastKey) return;
    lastKey = key;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "rgba(4,12,32,0.92)";
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(107,138,255,0.25)";
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x + 0.5, 46);
      ctx.lineTo(x + 0.5, H);
      ctx.stroke();
    }

    // Encabezado
    ctx.fillStyle = "#0b1a44";
    ctx.fillRect(0, 0, W, 42);
    ctx.font = "600 17px ui-monospace, SFMono-Regular, Menlo, monospace";
    ctx.fillStyle = "#d5e0ff";
    ctx.textBaseline = "middle";
    ctx.fillText(strings.title.toUpperCase(), 18, 22);
    const blink = 0.5 + 0.5 * Math.sin(time * 5);
    ctx.fillStyle = `rgba(255,59,92,${0.5 + 0.5 * blink})`;
    ctx.fillRect(W - 112, 16, 10, 10);
    ctx.fillStyle = "#ff9aab";
    ctx.fillText(strings.live.toUpperCase(), W - 96, 22);

    // Traza del evento (columna izquierda)
    ctx.font = "500 14px ui-monospace, SFMono-Regular, Menlo, monospace";
    const rows = strings.rows.length;
    for (let i = 0; i < rows; i++) {
      const y = 70 + i * 38;
      const on = i < steps;
      ctx.fillStyle = on ? ROW_TINT[i] : "rgba(213,224,255,0.14)";
      ctx.fillRect(18, y - 8, 14, 14);
      if (i < rows - 1) {
        ctx.fillStyle = on && i + 1 < steps ? "rgba(213,224,255,0.55)" : "rgba(213,224,255,0.1)";
        ctx.fillRect(24, y + 8, 2, 22);
      }
      ctx.fillStyle = on ? "#ffffff" : "rgba(213,224,255,0.3)";
      ctx.fillText(strings.times[i] ?? "", 44, y);
      ctx.fillStyle = on ? "#c5d2ee" : "rgba(213,224,255,0.22)";
      ctx.fillText(strings.rows[i].toUpperCase().slice(0, 22), 132, y);
    }

    // Barras de sedes (columna derecha)
    const bx = 384;
    ctx.fillStyle = "rgba(213,224,255,0.55)";
    ctx.font = "500 12px ui-monospace, SFMono-Regular, Menlo, monospace";
    ctx.fillText(strings.sites.toUpperCase(), bx, 64);
    for (let i = 0; i < 7; i++) {
      const v = 0.35 + 0.5 * (0.5 + 0.5 * Math.sin(time * 0.7 + i * 1.7));
      const h = v * 96;
      ctx.fillStyle = i === 2 && steps > 0 && steps < 6 ? "#ffb547" : "#2348d4";
      ctx.fillRect(bx + i * 34, 180 - h, 22, h);
    }
    // Línea de actividad
    ctx.beginPath();
    for (let i = 0; i <= 32; i++) {
      const x = bx + (i / 32) * 236;
      const y = 250 - (0.5 + 0.5 * Math.sin(time * 1.3 + i * 0.6) * Math.cos(i * 0.21)) * 40 - (i > 20 && steps > 0 ? 18 : 0);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = "#5fd8ff";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Estado
    ctx.fillStyle = "rgba(213,224,255,0.1)";
    ctx.fillRect(bx, 300, 236, 8);
    ctx.fillStyle = steps >= 6 ? "#35e0a1" : "#6b8aff";
    ctx.fillRect(bx, 300, (236 * Math.min(steps, 6)) / 6, 8);
    if (steps >= 6) {
      ctx.fillStyle = "#35e0a1";
      ctx.font = "600 14px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.fillText(`✓ ${strings.done.toUpperCase()}`, bx, 330);
    }
    tex.needsUpdate = true;
    screen.opacity = glow;
  };

  return {
    group,
    screen,
    frame,
    draw,
    dispose: () => tex.dispose(),
  };
}
