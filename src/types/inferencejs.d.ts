// inferencejs publica tipos en dist/index.d.ts pero su `exports` no los expone,
// así que TS no los resuelve. Declaramos lo mínimo que usamos.
declare module "inferencejs" {
  export class CVImage {
    constructor(el: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement);
  }
  export class InferenceEngine {
    startWorker(model: string, version: number, apiKey: string): Promise<string>;
    stopWorker(id: string): Promise<boolean>;
    infer(id: string, img: unknown): Promise<unknown[]>;
  }
}
