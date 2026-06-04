/**
 * Heurísticas de comportamiento sobre POSE en tiempo real (navegador).
 *
 * Trabaja sobre el campo `keypoints` de Prediction, que YA viene remapeado a
 * COCO-17 normalizado [0..1] por vision-browser.ts. Índices COCO:
 *   0 nariz · 5/6 hombros L/R · 7/8 codos · 9/10 muñecas · 11/12 caderas.
 *
 * Detecta dos comportamientos para la demo del laboratorio:
 *   A) BRAZOS LEVANTADOS sostenidos 10 s  → alarma (la caja se pone roja).
 *   B) PUÑO / PELEA: movimiento rápido de muñeca + brazo extendido dirigido
 *      hacia otra persona cercana (≥2 personas) → alarma de pelea.
 *
 * Diseño geométrico calibrado contra la revisión adversarial:
 *  - eje Y crece hacia abajo ⇒ "arriba" = y menor.
 *  - velocidad medida sobre posición CRUDA + un solo EMA (no doble atenuación).
 *  - escala corporal = max(ancho de hombros, largo de torso) ⇒ invariante a
 *    distancia a cámara y a vista de perfil.
 *  - teleport-reject: si la muñeca "salta" >2.5 cuerpos en un frame, se asume
 *    swap de trackId (CentroidTracker) y se descarta esa velocidad.
 *  - histéresis + ventana de gracia + latch/cooldown ⇒ sin parpadeo.
 *
 * IMPORTANTE: B es una heurística de DEMOSTRACIÓN, no forense (falsos positivos
 * con saludos efusivos/baile, falsos negativos con golpes cortos). Mostrar el
 * disclaimer en UI.
 */

import type { Prediction } from "@/lib/vision-mock";

type KP = [number, number, number]; // [x, y, visibility] normalizado

// ─────────────── Umbrales (calibrables) ───────────────
const VIS_MIN = 0.3;          // visibilidad mínima (lite suele dar ~1, geometría manda)

// A) brazos arriba
const MARGIN_ENTER = 0.05;    // muñeca 5% por encima del hombro para ENTRAR
const MARGIN_EXIT = 0.01;     // histéresis: sale con margen menor
const HOLD_MS = 10000;        // 10 s sostenidos
const GRACE_MS = 700;         // tolera oclusión/jitter breve sin resetear
const ALARM_A_LATCH = 1500;   // mantener alarma visible ≥1.5 s

// B) puño / pelea
const EMA_VEL = 0.6;          // suavizado (único) de la velocidad
const VEL_PUNCH = 4.0;        // cuerpos/seg (recalibrado para esta tubería @15-30fps)
const EXT_MIN = 1.15;         // brazo extendido (suma de segmentos / escala)
const PROX_MAX = 1.4;         // otra persona a <1.4 cuerpos de la muñeca
const DOT_MIN = 0.25;         // la muñeca debe ir HACIA el otro (coseno)
const PUNCH_HIT = 1.0;        // suma por frame que cumple las 3 condiciones
const PUNCH_DECAY = 2.5;      // resta por segundo sin golpe
const TRIGGER_SCORE = 1.6;    // disparo (~2 frames buenos; alcanzable a 15 fps)
const PUNCH_CLAMP = 5.0;
const COOLDOWN_MS = 4000;     // banner de pelea estable ≥4 s

// dinámica
const DT_MIN = 0.02;
const DT_MAX = 0.2;
const DT_RESET = 0.25;        // si pasó más de esto, resetear velocidades
const TELEPORT = 2.5;         // salto > 2.5 cuerpos en un frame ⇒ swap de ID
const PRUNE_MS = 2500;        // olvidar tracks no vistos

// índices COCO-17
const NOSE = 0, LSH = 5, RSH = 6, LEL = 7, REL = 8, LWR = 9, RWR = 10, LHIP = 11, RHIP = 12;

type Vec = { x: number; y: number };

type TrackState = {
  // A
  raisedSince: number | null;
  lastRaisedOkT: number;
  alarmAUntil: number;
  // B
  prevWrist: { L: Vec | null; R: Vec | null };
  vel: { L: number; R: number };
  dir: { L: Vec; R: Vec };
  punchScore: number;
  alarmBUntil: number;
  // común
  lastT: number;
};

export type BehaviorResult = {
  /** trackId → tipo de alarma activa */
  alarms: Map<string, "arms" | "fight">;
  /** trackId → progreso 0..1 del temporizador de brazos arriba */
  armsProgress: Map<string, number>;
  anyFight: boolean;
  anyArms: boolean;
};

// ─────────────── helpers geométricos ───────────────
function vis(k?: KP): number {
  return k ? k[2] : 0;
}
function ok(k?: KP): boolean {
  return !!k && k[2] >= VIS_MIN;
}
function dist(a: Vec, b: Vec): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
function mid(a: KP, b: KP): Vec {
  return { x: (a[0] + b[0]) / 2, y: (a[1] + b[1]) / 2 };
}
function pt(k: KP): Vec {
  return { x: k[0], y: k[1] };
}
function norm(v: Vec): Vec {
  const m = Math.hypot(v.x, v.y) || 1;
  return { x: v.x / m, y: v.y / m };
}

/** Escala corporal: max(ancho de hombros, largo de torso). Robusta a perfil/zoom. */
function bodyScale(kp: KP[]): number | null {
  const sh = kp[LSH], rs = kp[RSH], lh = kp[LHIP], rh = kp[RHIP];
  let shoulderW = 0;
  if (ok(sh) && ok(rs)) shoulderW = dist(pt(sh), pt(rs));
  let torso = 0;
  if (ok(sh) && ok(rs) && (ok(lh) || ok(rh))) {
    const hip = ok(lh) && ok(rh) ? mid(lh, rh) : ok(lh) ? pt(lh) : pt(rh);
    torso = dist(mid(sh, rs), hip);
  }
  const scale = Math.max(shoulderW, torso);
  return scale >= 0.05 ? Math.max(scale, 0.08) : null;
}

function torsoCenter(kp: KP[]): Vec | null {
  if (ok(kp[LSH]) && ok(kp[RSH])) return mid(kp[LSH], kp[RSH]);
  return null;
}

// ─────────────── analizador ───────────────
export class BehaviorAnalyzer {
  private tracks = new Map<string, TrackState>();

  private state(id: string, t: number): TrackState {
    let s = this.tracks.get(id);
    if (!s) {
      s = {
        raisedSince: null,
        lastRaisedOkT: t,
        alarmAUntil: 0,
        prevWrist: { L: null, R: null },
        vel: { L: 0, R: 0 },
        dir: { L: { x: 0, y: 0 }, R: { x: 0, y: 0 } },
        punchScore: 0,
        alarmBUntil: 0,
        lastT: t,
      };
      this.tracks.set(id, s);
    }
    return s;
  }

  analyze(preds: Prediction[], tNow: number): BehaviorResult {
    const persons = preds.filter((p) => p.keypoints && p.keypoints.length >= 17 && p.trackId);
    const alarms = new Map<string, "arms" | "fight">();
    const armsProgress = new Map<string, number>();

    // Centros de torso de todas las personas (para proximidad en B).
    const centers: Array<{ id: string; c: Vec }> = [];
    for (const p of persons) {
      const c = torsoCenter(p.keypoints as KP[]);
      if (c && p.trackId) centers.push({ id: p.trackId, c });
    }

    for (const p of persons) {
      const id = p.trackId as string;
      const kp = p.keypoints as KP[];
      const s = this.state(id, tNow);

      let dt = (tNow - s.lastT) / 1000;
      const teleported = dt > DT_RESET;
      dt = Math.min(Math.max(dt, DT_MIN), DT_MAX);

      const scale = bodyScale(kp);

      // ─── A) BRAZOS LEVANTADOS ───
      const margin = s.raisedSince == null ? MARGIN_ENTER : MARGIN_EXIT;
      const raisedNow = armsRaised(kp, margin);
      if (raisedNow) {
        if (s.raisedSince == null) s.raisedSince = tNow;
        s.lastRaisedOkT = tNow;
        if (tNow - s.raisedSince >= HOLD_MS) s.alarmAUntil = tNow + ALARM_A_LATCH;
      } else if (s.raisedSince != null && tNow - s.lastRaisedOkT > GRACE_MS) {
        s.raisedSince = null;
      }
      const armsAlarm = tNow < s.alarmAUntil;
      const progress =
        s.raisedSince != null ? Math.min(1, (tNow - s.raisedSince) / HOLD_MS) : armsAlarm ? 1 : 0;
      if (progress > 0) armsProgress.set(id, progress);

      // ─── B) PUÑO / PELEA ───
      let fightHit = false;
      if (scale != null && !teleported) {
        for (const side of ["L", "R"] as const) {
          const wIdx = side === "L" ? LWR : RWR;
          const w = kp[wIdx];
          if (!ok(w)) {
            s.prevWrist[side] = null;
            s.vel[side] = 0;
            continue;
          }
          const cur = pt(w);
          const prev = s.prevWrist[side];
          if (prev) {
            const dispVec = { x: cur.x - prev.x, y: cur.y - prev.y };
            const dispBodies = Math.hypot(dispVec.x, dispVec.y) / scale;
            if (dispBodies > TELEPORT) {
              // salto imposible ⇒ swap de trackId del tracker: descartar.
              s.vel[side] = 0;
            } else {
              const vInst = dispBodies / dt; // cuerpos/seg (posición CRUDA)
              s.vel[side] = s.vel[side] * (1 - EMA_VEL) + vInst * EMA_VEL; // un solo EMA
              s.dir[side] = norm(dispVec);
            }
          }
          s.prevWrist[side] = cur;

          // Las 3 condiciones del golpe.
          const fast = s.vel[side] >= VEL_PUNCH;
          const ext = armExtension(kp, side, scale) >= EXT_MIN;
          const near = ext && fast && targetNearby(id, cur, s.dir[side], centers, scale);
          if (fast && ext && near) fightHit = true;
        }
      } else {
        s.vel.L = 0;
        s.vel.R = 0;
        s.prevWrist.L = null;
        s.prevWrist.R = null;
      }

      if (fightHit) s.punchScore = Math.min(PUNCH_CLAMP, s.punchScore + PUNCH_HIT);
      else s.punchScore = Math.max(0, s.punchScore - PUNCH_DECAY * dt);
      if (s.punchScore >= TRIGGER_SCORE) s.alarmBUntil = tNow + COOLDOWN_MS;
      const fightAlarm = tNow < s.alarmBUntil;

      // Prioridad visual: pelea > brazos.
      if (fightAlarm) alarms.set(id, "fight");
      else if (armsAlarm) alarms.set(id, "arms");

      s.lastT = tNow;
    }

    // Olvidar tracks viejos.
    for (const [id, s] of this.tracks) {
      if (tNow - s.lastT > PRUNE_MS) this.tracks.delete(id);
    }

    return {
      alarms,
      armsProgress,
      anyFight: [...alarms.values()].includes("fight"),
      anyArms: [...alarms.values()].includes("arms"),
    };
  }

  reset() {
    this.tracks.clear();
  }
}

// ─────────────── condiciones ───────────────

/** Ambas muñecas por encima de su hombro respectivo (con margen). y menor = arriba. */
function armsRaised(kp: KP[], margin: number): boolean {
  const ls = kp[LSH], rs = kp[RSH], lw = kp[LWR], rw = kp[RWR];
  if (!ls || !rs || !lw || !rw) return false;
  // visibilidad de lite es poco fiable; si está presente y baja, descartamos,
  // pero no dependemos de ella (geometría + 10 s es el filtro real).
  if (vis(lw) > 0 && vis(lw) < VIS_MIN) return false;
  if (vis(rw) > 0 && vis(rw) < VIS_MIN) return false;
  const leftUp = lw[1] < ls[1] - margin;
  const rightUp = rw[1] < rs[1] - margin;
  return leftUp && rightUp;
}

/** Extensión del brazo (hombro→codo→muñeca) en unidades de escala corporal. */
function armExtension(kp: KP[], side: "L" | "R", scale: number): number {
  const sh = kp[side === "L" ? LSH : RSH];
  const el = kp[side === "L" ? LEL : REL];
  const wr = kp[side === "L" ? LWR : RWR];
  if (!ok(sh) || !ok(el) || !ok(wr)) return 0;
  return (dist(pt(sh), pt(el)) + dist(pt(el), pt(wr))) / scale;
}

/** ¿Hay OTRA persona cercana en la dirección del golpe? Exige ≥2 personas. */
function targetNearby(
  attackerId: string,
  wrist: Vec,
  dir: Vec,
  centers: Array<{ id: string; c: Vec }>,
  scale: number
): boolean {
  for (const o of centers) {
    if (o.id === attackerId) continue;
    const d = dist(wrist, o.c) / scale;
    if (d > PROX_MAX) continue;
    const toTarget = norm({ x: o.c.x - wrist.x, y: o.c.y - wrist.y });
    const dot = dir.x * toTarget.x + dir.y * toTarget.y;
    if (dot > DOT_MIN || (dir.x === 0 && dir.y === 0)) return true;
  }
  return false;
}
