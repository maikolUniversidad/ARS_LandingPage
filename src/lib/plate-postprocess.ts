/**
 * Post-proceso de placas compartido por los dos motores de OCR (tesseract de
 * fallback en [plate-ocr.ts](./plate-ocr.ts) y el stack dedicado ONNX en
 * [plate-lpr.ts](./plate-lpr.ts)).
 *
 * Dos piezas:
 *  - `normalizePlate`: encaja el texto crudo del OCR en un patrón de placa de
 *    Colombia (carro LLL DDD / moto LLL DD L), corrigiendo confusiones por
 *    posición (0↔O, 1↔I, 5↔S…). Si no encaja, devuelve null (no inventa).
 *  - `consensus`: voto por carácter sobre varias lecturas → un error aislado
 *    queda en minoría. Devuelve el texto consensuado + % de acuerdo.
 */

export const PLATE_LEN = 6;

// ─────────────── Validación de patrón (Colombia) ───────────────

// Confusiones típicas del OCR según si la posición espera letra o dígito.
const TO_LETTER: Record<string, string> = { "0": "O", "1": "I", "5": "S", "8": "B", "2": "Z", "6": "G", "4": "A" };
const TO_DIGIT: Record<string, string> = {
  O: "0", Q: "0", D: "0", I: "1", L: "1", S: "5", B: "8", Z: "2", G: "6", A: "4", T: "7",
};
const L = (c: string) => TO_LETTER[c] ?? c;
const N = (c: string) => TO_DIGIT[c] ?? c;

/**
 * Encaja el texto OCR en un patrón de placa de Colombia (carro LLL DDD / moto
 * LLL DD L). Recorre ventanas de 6 chars y aplica corrección por posición.
 */
export function normalizePlate(cleaned: string): string | null {
  const c = cleaned.toUpperCase().replace(/[^A-Z0-9]/g, "");
  for (let i = 0; i + PLATE_LEN <= c.length; i++) {
    const w = c.slice(i, i + PLATE_LEN);
    const car = L(w[0]) + L(w[1]) + L(w[2]) + N(w[3]) + N(w[4]) + N(w[5]);
    if (/^[A-Z]{3}[0-9]{3}$/.test(car)) return car;
    const moto = L(w[0]) + L(w[1]) + L(w[2]) + N(w[3]) + N(w[4]) + L(w[5]);
    if (/^[A-Z]{3}[0-9]{2}[A-Z]$/.test(moto)) return moto;
  }
  return null;
}

// ─────────────── Voto por carácter ───────────────

/** Consenso por posición sobre lecturas válidas (6 chars). Texto + % de acuerdo. */
export function consensus(reads: string[]): { text: string; confidence: number } | null {
  const valid = reads.filter((r) => r.length === PLATE_LEN);
  if (!valid.length) return null;
  let text = "";
  let agree = 0;
  for (let i = 0; i < PLATE_LEN; i++) {
    const tally: Record<string, number> = {};
    for (const r of valid) tally[r[i]] = (tally[r[i]] ?? 0) + 1;
    let best = "";
    let bestC = 0;
    for (const ch in tally) if (tally[ch] > bestC) [best, bestC] = [ch, tally[ch]];
    text += best;
    agree += bestC;
  }
  const confidence = Math.round((agree / (valid.length * PLATE_LEN)) * 100);
  return { text, confidence };
}
