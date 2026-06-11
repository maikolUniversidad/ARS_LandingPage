/**
 * Dibujo de la malla facial de MediaPipe FaceLandmarker (478 puntos) sobre un
 * canvas 2D. Compartido por el Vision Lab (VisionCanvas) y el overlay de cámara
 * en vivo (LiveAIOverlay), que usan sistemas de coordenadas distintos: por eso
 * recibe funciones `toX`/`toY` que mapean normalizado [0..1] → píxel.
 */

// Índices estándar de MediaPipe FaceMesh para dibujar los contornos como bucles.
const FACE_OVAL = [
  10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379,
  378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127,
  162, 21, 54, 103, 67, 109,
];
const LIPS_OUTER = [
  61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291, 375, 321, 405, 314, 17, 84,
  181, 91, 146,
];
const LIPS_INNER = [
  78, 191, 80, 81, 82, 13, 312, 311, 310, 415, 308, 324, 318, 402, 317, 14, 87,
  178, 88, 95,
];
const LEFT_EYE = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246];
const RIGHT_EYE = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398];
const LEFT_BROW = [70, 63, 105, 66, 107, 55, 65, 52, 53, 46];
const RIGHT_BROW = [336, 296, 334, 293, 300, 285, 295, 282, 283, 276];
const RIGHT_IRIS = [469, 470, 471, 472];
const LEFT_IRIS = [474, 475, 476, 477];

type Mesh = Array<[number, number]>;
type Map1 = (v: number) => number;

function strokeLoop(
  ctx: CanvasRenderingContext2D,
  mesh: Mesh,
  idx: number[],
  toX: Map1,
  toY: Map1,
  close: boolean,
) {
  ctx.beginPath();
  idx.forEach((i, n) => {
    const p = mesh[i];
    if (!p) return;
    const x = toX(p[0]);
    const y = toY(p[1]);
    if (n === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  if (close) ctx.closePath();
  ctx.stroke();
}

/** Dibuja los 478 puntos como nube + contornos + iris. `dot` controla el radio. */
export function drawFaceMesh(
  ctx: CanvasRenderingContext2D,
  mesh: Mesh,
  toX: Map1,
  toY: Map1,
  dot = 1.1,
) {
  // 1) Nube de puntos: los 478 landmarks como malla tenue (efecto "scan").
  ctx.fillStyle = "rgba(34, 211, 238, 0.45)";
  for (const p of mesh) {
    ctx.beginPath();
    ctx.arc(toX(p[0]), toY(p[1]), dot, 0, Math.PI * 2);
    ctx.fill();
  }

  // 2) Contornos principales (silueta, cejas, ojos, labios).
  ctx.strokeStyle = "rgba(34, 211, 238, 0.85)";
  ctx.lineWidth = 1.2;
  strokeLoop(ctx, mesh, FACE_OVAL, toX, toY, true);
  strokeLoop(ctx, mesh, LIPS_OUTER, toX, toY, true);
  strokeLoop(ctx, mesh, LIPS_INNER, toX, toY, true);
  strokeLoop(ctx, mesh, LEFT_EYE, toX, toY, true);
  strokeLoop(ctx, mesh, RIGHT_EYE, toX, toY, true);
  strokeLoop(ctx, mesh, LEFT_BROW, toX, toY, false);
  strokeLoop(ctx, mesh, RIGHT_BROW, toX, toY, false);

  // 3) Iris (si el modelo entrega los 478 puntos refinados).
  if (mesh.length >= 478) {
    ctx.strokeStyle = "rgba(255, 255, 255, 0.95)";
    ctx.lineWidth = 1.4;
    strokeLoop(ctx, mesh, RIGHT_IRIS, toX, toY, true);
    strokeLoop(ctx, mesh, LEFT_IRIS, toX, toY, true);
  }
}
