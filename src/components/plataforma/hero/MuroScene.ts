import * as THREE from "three";
import { createSafeRenderer, type SafeRenderer } from "@/lib/three/safe-renderer";
import type { Pantalla } from "./pantallas";

/**
 * «Muro de mando»: pantallas flotantes en un arco curvo con capturas reales.
 *
 * - Una sola malla por pantalla (marco, pantalla, brillo y halo en un shader) y su
 *   reflejo en el piso (la misma geometría espejada, con desvanecido).
 * - Texturas progresivas: arranca con un «sin señal» del color del área y carga las
 *   capturas de a dos cuando el navegador queda libre, con un fundido.
 * - El bucle corre solo mientras `start()` (la sección se ve y la pestaña está
 *   visible). Con movimiento reducido no hay bucle continuo: se dibuja bajo demanda.
 * - `dispose()` libera geometrías, materiales, texturas y el contexto.
 */

export type MuroOptions = {
  pantallas: Pantalla[];
  lowPower: boolean;
  reducedMotion: boolean;
  /** Sin hover (táctil): solo toque para enfocar. */
  touch: boolean;
  onFatal: () => void;
  /** Primer cuadro dibujado: el póster puede desvanecerse. */
  onReady: () => void;
  onHover: (index: number | null) => void;
  onFocus: (index: number | null) => void;
  /** Posición en píxeles (relativa al canvas) del borde superior de la pantalla resaltada. */
  onLabel: (x: number, y: number, visible: boolean) => void;
};

const ALTO = 1.35; // alto útil de cada pantalla (unidades de escena)
const MARCO = 0.075; // grosor del bisel
const HALO = 0.32; // margen del halo alrededor del bisel
const RADIO = 9;
const PISO = -1.95;

const VERT = /* glsl */ `
  varying vec2 vUv;
  varying float vWorldY;
  void main() {
    vUv = uv;
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorldY = wp.y;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

const FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uHas;      // 0 → sin textura, 1 → captura visible
  uniform vec3 uColor;     // color del área
  uniform float uHover;
  uniform float uDim;      // 1 normal, <1 cuando otra pantalla está enfocada
  uniform float uTime;
  uniform float uSeed;
  uniform float uImgAspect;
  uniform vec2 uInner;     // ancho, alto útiles
  uniform vec2 uOuter;     // ancho, alto de la malla (con halo)
  uniform float uReflect;  // 1 en el reflejo del piso
  uniform float uFloor;
  varying vec2 vUv;
  varying float vWorldY;

  float sdRound(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
  }

  void main() {
    vec2 p = (vUv - 0.5) * uOuter;
    float d = sdRound(p, uInner * 0.5, 0.035);
    float bezel = ${MARCO.toFixed(3)};
    vec3 col = vec3(0.0);
    float alpha = 1.0;

    if (d < 0.0) {
      // ── Pantalla: captura en modo «contain» sobre fondo de consola ──
      vec2 uv = p / uInner + 0.5;
      float sa = uInner.x / uInner.y;
      vec2 iuv = uv;
      if (uImgAspect > sa) iuv.y = (uv.y - 0.5) * uImgAspect / sa + 0.5;
      else iuv.x = (uv.x - 0.5) * sa / uImgAspect + 0.5;
      float inside = step(0.0, iuv.x) * step(iuv.x, 1.0) * step(0.0, iuv.y) * step(iuv.y, 1.0);

      vec3 fondo = vec3(0.012, 0.028, 0.07) + uColor * 0.035 * (1.0 - uv.y);
      // «Sin señal»: rejilla tenue del color del área y una barra de barrido.
      vec2 g = abs(fract(uv * vec2(18.0, 9.0)) - 0.5);
      float grid = smoothstep(0.47, 0.5, max(g.x, g.y));
      float barrido = smoothstep(0.08, 0.0, abs(fract(uTime * 0.35 + uSeed) - uv.y));
      vec3 vacio = fondo + uColor * (grid * 0.08 + barrido * 0.12);

      vec3 img = texture2D(uMap, clamp(iuv, 0.0, 1.0)).rgb;
      vec3 conImg = mix(fondo, img, inside);
      col = mix(vacio, conImg, uHas);

      // Brillo de refresco, scanlines sutiles y viñeta.
      float refresco = smoothstep(0.12, 0.0, abs(fract(uTime * 0.07 + uSeed) - (1.0 - uv.y)));
      col += uColor * refresco * 0.05 * uHas;
      col *= 0.955 + 0.045 * sin(gl_FragCoord.y * 1.9);
      vec2 v = uv - 0.5;
      col *= 1.0 - dot(v, v) * 0.55;
      col *= 0.9 + 0.2 * uHover;
      // Reflejo especular diagonal del vidrio.
      float vidrio = smoothstep(0.0, 0.5, uv.x + uv.y * 0.6 - 0.35) * smoothstep(1.2, 0.6, uv.x + uv.y * 0.6);
      col += vec3(0.6, 0.75, 1.0) * vidrio * 0.035;
      // Borde interior encendido con el color del área.
      col += uColor * exp(d * 120.0) * (0.3 + 0.35 * uHover);
    } else if (d < bezel) {
      // ── Bisel metálico ──
      float t = d / bezel;
      col = mix(vec3(0.03, 0.05, 0.1), vec3(0.075, 0.1, 0.17), vUv.y) * (1.0 - t * 0.35);
      col += uColor * exp(-d * 90.0) * (0.4 + 0.45 * uHover);
      col += vec3(0.35, 0.45, 0.65) * smoothstep(0.75, 1.0, t) * 0.18;
      // LED de estado en la esquina inferior derecha.
      vec2 led = p - vec2(uInner.x * 0.5 - 0.06, -uInner.y * 0.5 - bezel * 0.5);
      col += uColor * smoothstep(0.022, 0.0, length(led)) * (0.6 + 0.4 * sin(uTime * 2.0 + uSeed * 6.0));
    } else {
      // ── Halo del color del área ──
      float dd = d - bezel;
      float h = exp(-dd * 10.0) * (0.08 + 0.22 * uHover) * uDim;
      if (h < 0.004) discard;
      col = uColor * h;
      alpha = h;
      col /= max(alpha, 0.0001);
    }

    col *= uDim;
    if (uReflect > 0.5) {
      float f = exp(-(uFloor - vWorldY) * 1.25) * 0.2;
      alpha *= f;
      if (alpha < 0.003) discard;
    }
    gl_FragColor = vec4(col, alpha);
    #include <colorspace_fragment>
  }
`;

const FLOOR_FRAG = /* glsl */ `
  uniform vec3 uTint;
  uniform vec3 uBg;
  varying vec2 vUv;
  void main() {
    vec2 p = (vUv - 0.5) * 60.0;
    vec2 g = abs(fract(p) - 0.5);
    float line = smoothstep(0.47, 0.5, max(g.x, g.y));
    float dist = length(p - vec2(0.0, 6.0));
    float fade = exp(-dist * 0.11);
    vec3 col = uBg + uTint * (line * 0.14 * fade + exp(-dist * 0.18) * 0.1);
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

const FLOOR_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const DUST_VERT = /* glsl */ `
  uniform float uTime;
  uniform float uPx;
  attribute float aSpeed;
  varying float vA;
  void main() {
    vec3 p = position;
    p.y = mod(p.y + uTime * aSpeed + 2.2, 6.0) - 2.2;
    p.x += sin(uTime * 0.2 + position.z) * 0.15;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uPx * (1.4 + aSpeed * 10.0) * (6.0 / -mv.z);
    vA = smoothstep(-2.2, -1.2, p.y) * smoothstep(3.8, 2.4, p.y);
  }
`;

const DUST_FRAG = /* glsl */ `
  uniform vec3 uColor;
  varying float vA;
  void main() {
    float r = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, r) * vA * 0.55;
    gl_FragColor = vec4(uColor * a, a);
    #include <colorspace_fragment>
  }
`;

type Slot = {
  mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  reflejo: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  /** Posición/orientación de reposo dentro del grupo del muro. */
  base: THREE.Vector3;
  /** Normal hacia el centro del arco (local del grupo). */
  normal: THREE.Vector3;
  ancho: number;
  hover: number;
  has: number;
  hasTarget: number;
  dim: number;
  texture: THREE.Texture | null;
};

const ease = (cur: number, target: number, dt: number, rate: number, snap: boolean) =>
  snap ? target : cur + (target - cur) * (1 - Math.exp(-dt * rate));

export class MuroScene {
  private safe: SafeRenderer;
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(40, 1, 0.1, 80);
  private wall = new THREE.Group();
  private slots: Slot[] = [];
  private dust: THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial> | null = null;
  private raycaster = new THREE.Raycaster();
  private ndc = new THREE.Vector2();
  private opts: MuroOptions;

  private width = 1;
  private height = 1;
  private portrait = false;
  private time = 0;
  private last = 0;
  private raf = 0;
  private running = false;
  private wantRun = false;
  private pending = 0;
  private readyFired = false;
  private disposed = false;

  // Interacción
  private pointer = new THREE.Vector2(0, 0); // −1..1
  private pointerInside = false;
  private parallax = new THREE.Vector2(0, 0);
  private hovered: number | null = null;
  private focused: number | null = null;
  private zoom = 0; // 0 vista general → 1 enfocada
  private yaw = 0;
  private viewShift = 0;

  // Cámara
  private camPos = new THREE.Vector3();
  private camLook = new THREE.Vector3();
  private tmpA = new THREE.Vector3();
  private tmpB = new THREE.Vector3();
  private tmpC = new THREE.Vector3();

  private loader = new THREE.TextureLoader();
  private loadQueue: number[] = [];
  private loading = 0;
  private idle = 0;

  static create(canvas: HTMLCanvasElement, opts: MuroOptions): MuroScene {
    const safe = createSafeRenderer({ canvas, lowPower: opts.lowPower, onFatal: opts.onFatal });
    if (!safe) throw new Error("WebGL no disponible");
    try {
      return new MuroScene(safe, opts);
    } catch (e) {
      safe.dispose(true);
      throw e;
    }
  }

  private constructor(safe: SafeRenderer, opts: MuroOptions) {
    this.safe = safe;
    this.renderer = safe.renderer;
    this.opts = opts;
    const bg = new THREE.Color("#060f24");
    this.renderer.setClearColor(bg, 1);
    this.scene.fog = null;

    safe.onLost = () => {
      const was = this.wantRun;
      this.stop();
      this.wantRun = was;
    };
    safe.onRestored = () => {
      if (this.wantRun) this.start();
      else this.invalidate();
    };

    this.buildWall();
    this.buildFloor(bg);
    if (!opts.reducedMotion) this.buildDust();
    this.scene.add(this.wall);
    this.camPos.set(0, 0.25, 2.5);
    this.camLook.set(0, 0.1, -RADIO);
    this.scheduleTextures();
  }

  // ───────────────────────── Construcción ─────────────────────────

  private buildWall() {
    const list = this.opts.pantallas;
    const n = list.length;
    const filas = n > 4 ? 2 : 1;
    const porFila = Math.ceil(n / filas);
    const gap = 0.42;
    const ys = filas === 2 ? [0.82, -0.78] : [0];

    for (let f = 0; f < filas; f++) {
      const items = list.slice(f * porFila, (f + 1) * porFila);
      const anchos = items.map((p) => ALTO * THREE.MathUtils.clamp(p.ancho / p.alto, 1.5, 2.3));
      const total = anchos.reduce((a, b) => a + b, 0) + gap * (items.length - 1);
      // Fila inferior desplazada media pantalla: el muro queda escalonado.
      let s = -total / 2 + (f === 1 ? 0.55 : 0);
      items.forEach((p, k) => {
        const w = anchos[k];
        const theta = (s + w / 2) / RADIO;
        s += w + gap;
        this.addScreen(p, f * porFila + k, w, theta, ys[f], f === 0 ? -0.05 : 0.04);
      });
    }
  }

  private addScreen(p: Pantalla, index: number, w: number, theta: number, y: number, tilt: number) {
    const outerW = w + 2 * (MARCO + HALO);
    const outerH = ALTO + 2 * (MARCO + HALO);
    const geo = new THREE.PlaneGeometry(outerW, outerH);
    const uniforms = {
      uMap: { value: null as THREE.Texture | null },
      uHas: { value: 0 },
      uColor: { value: new THREE.Color(p.color) },
      uHover: { value: 0 },
      uDim: { value: 1 },
      uTime: { value: 0 },
      uSeed: { value: (index * 0.137) % 1 },
      uImgAspect: { value: p.ancho / p.alto },
      uInner: { value: new THREE.Vector2(w, ALTO) },
      uOuter: { value: new THREE.Vector2(outerW, outerH) },
      uReflect: { value: 0 },
      uFloor: { value: PISO },
    };
    const mat = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(geo, mat);
    const base = new THREE.Vector3(Math.sin(theta) * RADIO, y, -Math.cos(theta) * RADIO);
    mesh.position.copy(base);
    mesh.rotation.order = "YXZ";
    mesh.rotation.set(tilt, -theta, 0);
    mesh.userData.index = index;
    this.wall.add(mesh);

    // El reflejo comparte los uniforms (hover, textura, tiempo) salvo uReflect.
    const rmat = new THREE.ShaderMaterial({
      uniforms: { ...uniforms, uReflect: { value: 1 } },
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const reflejo = new THREE.Mesh(geo, rmat);
    reflejo.scale.y = -1;
    reflejo.rotation.order = "YXZ";
    reflejo.rotation.set(-tilt, -theta, 0);
    reflejo.position.set(base.x, 2 * PISO - y, base.z);
    this.wall.add(reflejo);

    const normal = new THREE.Vector3(-Math.sin(theta), 0, Math.cos(theta));
    this.slots.push({ mesh, reflejo, base, normal, ancho: w, hover: 0, has: 0, hasTarget: 0, dim: 1, texture: null });
  }

  private buildFloor(bg: THREE.Color) {
    const geo = new THREE.PlaneGeometry(60, 60);
    const mat = new THREE.ShaderMaterial({
      uniforms: { uTint: { value: new THREE.Color("#3a63ff") }, uBg: { value: bg.clone() } },
      vertexShader: FLOOR_VERT,
      fragmentShader: FLOOR_FRAG,
      depthWrite: false,
    });
    const floor = new THREE.Mesh(geo, mat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, PISO, -RADIO + 4);
    floor.renderOrder = -1;
    this.scene.add(floor);
  }

  private buildDust() {
    const n = this.opts.lowPower ? 160 : 420;
    const pos = new Float32Array(n * 3);
    const speed = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const a = (Math.random() - 0.5) * 2.4;
      const r = 2 + Math.random() * (RADIO - 1.5);
      pos[i * 3] = Math.sin(a) * r;
      pos[i * 3 + 1] = Math.random() * 6 - 2.2;
      pos[i * 3 + 2] = -Math.cos(a) * r;
      speed[i] = 0.02 + Math.random() * 0.08;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("aSpeed", new THREE.BufferAttribute(speed, 1));
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uPx: { value: this.safe.maxDpr },
        uColor: { value: new THREE.Color("#8fb0ff") },
      },
      vertexShader: DUST_VERT,
      fragmentShader: DUST_FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.dust = new THREE.Points(geo, mat);
    this.dust.frustumCulled = false;
    this.scene.add(this.dust);
  }

  // ───────────────────────── Texturas progresivas ─────────────────────────

  private scheduleTextures() {
    // Orden: de la pantalla central hacia los lados (lo primero que se ve).
    this.loadQueue = this.slots
      .map((s, i) => ({ i, d: Math.abs(s.base.x) + Math.abs(s.base.y) * 0.5 }))
      .sort((a, b) => a.d - b.d)
      .map((x) => x.i);
    const kick = () => {
      this.idle = 0;
      this.pump();
    };
    // Esperar a que el navegador quede libre: nada compite con el LCP.
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    if (w.requestIdleCallback) this.idle = w.requestIdleCallback(kick, { timeout: 1500 });
    else this.idle = window.setTimeout(kick, 400);
  }

  private pump() {
    const max = this.opts.lowPower ? 1 : 2;
    while (!this.disposed && this.loading < max && this.loadQueue.length) {
      const i = this.loadQueue.shift()!;
      const slot = this.slots[i];
      this.loading++;
      this.loader.load(
        this.opts.pantallas[i].src,
        (tex) => {
          this.loading--;
          if (this.disposed) {
            tex.dispose();
            return;
          }
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.anisotropy = Math.min(4, this.renderer.capabilities.getMaxAnisotropy());
          tex.generateMipmaps = true;
          slot.texture = tex;
          slot.mesh.material.uniforms.uMap.value = tex;
          slot.hasTarget = 1;
          this.invalidate();
          this.pump();
        },
        undefined,
        () => {
          // Si una captura falla, la pantalla se queda en «sin señal»; seguir con las demás.
          this.loading--;
          if (!this.disposed) this.pump();
        }
      );
    }
  }

  // ───────────────────────── API ─────────────────────────

  setSize(width: number, height: number) {
    this.width = Math.max(1, width);
    this.height = Math.max(1, height);
    this.portrait = this.width / this.height < 0.9;
    this.renderer.setSize(this.width, this.height, false);
    this.camera.aspect = this.width / this.height;
    this.camera.fov = this.portrait ? 62 : 40;
    this.applyView();
    this.invalidate();
  }

  /** Coordenadas del puntero relativas al canvas (px). `inside` false al salir. */
  setPointer(x: number, y: number, inside: boolean) {
    this.pointerInside = inside;
    if (inside) this.pointer.set((x / this.width) * 2 - 1, -(y / this.height) * 2 + 1);
    if (!this.opts.touch) this.updateHover();
    this.invalidate();
  }

  /** Clic/toque en (x, y) del canvas: enfoca la pantalla tocada o vuelve a la vista general. */
  click(x: number, y: number) {
    const hit = this.pick((x / this.width) * 2 - 1, -(y / this.height) * 2 + 1);
    if (hit === null) this.focus(null);
    else if (hit !== this.focused) this.focus(hit);
  }

  focus(index: number | null) {
    if (index !== null && (index < 0 || index >= this.slots.length)) index = null;
    if (index === this.focused) return;
    this.focused = index;
    this.opts.onFocus(index);
    if (index !== null) this.setHovered(null);
    this.invalidate();
  }

  start() {
    this.wantRun = true;
    if (this.safe.isLost() || this.disposed) return;
    if (this.opts.reducedMotion) {
      this.invalidate();
      return;
    }
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.loop);
  }

  stop() {
    this.wantRun = false;
    this.running = false;
    cancelAnimationFrame(this.raf);
    cancelAnimationFrame(this.pending);
    this.pending = 0;
  }

  dispose() {
    if (this.disposed) return;
    this.stop();
    this.disposed = true;
    const w = window as Window & { cancelIdleCallback?: (h: number) => void };
    if (w.cancelIdleCallback) w.cancelIdleCallback(this.idle);
    clearTimeout(this.idle);
    const geos = new Set<THREE.BufferGeometry>();
    const mats = new Set<THREE.Material>();
    this.scene.traverse((obj) => {
      const o = obj as THREE.Mesh;
      if (o.geometry) geos.add(o.geometry);
      const m = o.material;
      if (Array.isArray(m)) m.forEach((x) => mats.add(x));
      else if (m) mats.add(m);
    });
    geos.forEach((g) => g.dispose());
    mats.forEach((m) => m.dispose());
    for (const s of this.slots) s.texture?.dispose();
    this.slots = [];
    this.safe.dispose();
  }

  // ───────────────────────── Interacción ─────────────────────────

  private pick(nx: number, ny: number): number | null {
    this.camera.updateMatrixWorld();
    this.raycaster.setFromCamera(this.ndc.set(nx, ny), this.camera);
    const hits = this.raycaster.intersectObjects(
      this.slots.map((s) => s.mesh),
      false
    );
    for (const h of hits) {
      const i = h.object.userData.index as number;
      const s = this.slots[i];
      const uv = h.uv;
      if (!uv) continue;
      // Solo cuenta el bisel y la pantalla, no el halo.
      const outer = s.mesh.material.uniforms.uOuter.value as THREE.Vector2;
      const px = Math.abs((uv.x - 0.5) * outer.x);
      const py = Math.abs((uv.y - 0.5) * outer.y);
      if (px <= s.ancho / 2 + MARCO && py <= ALTO / 2 + MARCO) return i;
    }
    return null;
  }

  private updateHover() {
    if (this.focused !== null || !this.pointerInside) {
      this.setHovered(null);
      return;
    }
    this.setHovered(this.pick(this.pointer.x, this.pointer.y));
  }

  private setHovered(i: number | null) {
    if (i === this.hovered) return;
    this.hovered = i;
    this.opts.onHover(i);
  }

  // ───────────────────────── Bucle ─────────────────────────

  /** Pide un cuadro (modo bajo demanda o bucle detenido). */
  private invalidate() {
    if (this.running || this.pending || this.disposed || this.safe.isLost()) return;
    this.pending = requestAnimationFrame((now) => {
      this.pending = 0;
      const dt = this.last ? Math.min(Math.max((now - this.last) / 1000, 0), 0.1) : 0.016;
      this.last = now;
      const moving = this.frame(dt);
      // Con movimiento reducido las transiciones son instantáneas; si algo
      // todavía se mueve (fundido de textura), se pide otro cuadro.
      if (moving && this.wantRun) this.invalidate();
    });
  }

  private loop = (now: number) => {
    if (!this.running) return;
    this.raf = requestAnimationFrame(this.loop);
    const dt = Math.min(Math.max((now - this.last) / 1000, 0), 0.1);
    this.last = now;
    this.frame(dt);
  };

  private applyView() {
    // En escritorio el muro se corre a la derecha para dejar libre la columna de texto;
    // en vertical se sube para dejar el texto abajo. Al enfocar, se centra.
    const k = 1 - this.zoom;
    if (this.portrait) {
      this.camera.setViewOffset(this.width, this.height, 0, this.height * 0.3 * k, this.width, this.height);
    } else if (this.width >= 1024) {
      this.camera.setViewOffset(this.width, this.height, -this.width * 0.14 * k, 0, this.width, this.height);
    } else {
      this.camera.clearViewOffset();
    }
    this.camera.updateProjectionMatrix();
  }

  /** Devuelve true si algo sigue en transición. */
  private frame(dt: number): boolean {
    const snap = this.opts.reducedMotion;
    if (!snap) this.time += dt;
    let moving = false;

    // Rotación lenta del muro (se congela al enfocar).
    const drift = snap ? 0 : Math.sin(this.time * 0.07) * (this.portrait ? 0.32 : 0.13);
    const yawTarget = this.focused === null ? drift : this.yaw;
    this.yaw = ease(this.yaw, yawTarget, dt, 2, snap);

    // Parallax con el mouse (solo vista general y con puntero fino).
    const px = !this.opts.touch && this.pointerInside && this.focused === null && !snap ? this.pointer.x : 0;
    const py = !this.opts.touch && this.pointerInside && this.focused === null && !snap ? this.pointer.y : 0;
    this.parallax.x = ease(this.parallax.x, px, dt, 3, snap);
    this.parallax.y = ease(this.parallax.y, py, dt, 3, snap);
    this.wall.rotation.y = this.yaw + this.parallax.x * 0.09;

    const zoomTarget = this.focused === null ? 0 : 1;
    const z0 = this.zoom;
    this.zoom = ease(this.zoom, zoomTarget, dt, 3.2, snap);
    if (Math.abs(this.zoom - zoomTarget) < 0.001) this.zoom = zoomTarget;
    if (this.zoom !== z0) this.applyView();
    if (this.zoom !== zoomTarget) moving = true;

    // Pantallas: adelantarse con hover/enfoque, atenuar las demás, fundido de textura.
    this.slots.forEach((s, i) => {
      const active = i === this.hovered || i === this.focused;
      const ht = active ? 1 : 0;
      s.hover = ease(s.hover, ht, dt, 9, snap);
      const dimT = this.focused !== null && i !== this.focused ? 0.28 : 1;
      s.dim = ease(s.dim, dimT, dt, 5, snap);
      s.has = ease(s.has, s.hasTarget, dt, 2.5, snap);
      if (Math.abs(s.hover - ht) > 0.002 || Math.abs(s.dim - dimT) > 0.002 || Math.abs(s.has - s.hasTarget) > 0.002)
        moving = true;

      const fwd = i === this.focused ? 0.35 : 0.9;
      s.mesh.position.copy(s.base).addScaledVector(s.normal, s.hover * fwd);
      const bob = snap ? 0 : Math.sin(this.time * 0.6 + i * 1.7) * 0.03;
      s.mesh.position.y += bob;
      s.mesh.scale.setScalar(1 + s.hover * 0.06);
      s.reflejo.position.set(s.mesh.position.x, 2 * PISO - s.mesh.position.y, s.mesh.position.z);
      s.reflejo.scale.set(s.mesh.scale.x, -s.mesh.scale.y, 1);
      s.mesh.renderOrder = active ? 2 : 1;

      const u = s.mesh.material.uniforms; // compartidos con el reflejo
      u.uHover.value = s.hover;
      u.uDim.value = s.dim;
      u.uHas.value = s.has;
      u.uTime.value = this.time;
    });
    if (this.dust) this.dust.material.uniforms.uTime.value = this.time;
    this.wall.updateMatrixWorld();

    // Cámara: vista general con parallax ↔ frente a la pantalla enfocada.
    const general = this.tmpA.set(
      this.parallax.x * 0.45,
      0.25 + this.parallax.y * 0.22,
      this.portrait ? 6.5 : 2.5
    );
    const lookGeneral = this.tmpB.set(this.parallax.x * 0.6, 0.05, -RADIO);
    if (this.focused !== null) {
      const s = this.slots[this.focused];
      const center = this.tmpC.copy(s.mesh.position);
      this.wall.localToWorld(center);
      const n = s.normal.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), this.wall.rotation.y);
      const vfov = THREE.MathUtils.degToRad(this.camera.fov);
      const hfov = 2 * Math.atan(Math.tan(vfov / 2) * this.camera.aspect);
      const sw = s.ancho * (1 + s.hover * 0.06);
      const dist = Math.max((sw * (this.portrait ? 0.54 : 0.62)) / Math.tan(hfov / 2), (ALTO * 0.95) / Math.tan(vfov / 2));
      const camF = center.clone().addScaledVector(n, dist);
      camF.y -= ALTO * 0.12; // deja aire abajo para el pie de foto
      const lookF = center.clone();
      lookF.y -= ALTO * 0.2;
      general.lerp(camF, this.zoom);
      lookGeneral.lerp(lookF, this.zoom);
    } else if (this.zoom > 0) {
      // Saliendo del enfoque: interpolar desde la última vista enfocada.
      general.lerp(this.camPos, this.zoom);
      lookGeneral.lerp(this.camLook, this.zoom);
    }
    if (this.focused !== null) {
      this.camPos.copy(general);
      this.camLook.copy(lookGeneral);
    }
    this.camera.position.copy(general);
    this.camera.lookAt(lookGeneral);
    this.camera.updateMatrixWorld();

    // Etiqueta HTML sobre la pantalla resaltada (solo hover, no en enfoque).
    if (this.hovered !== null && this.focused === null) {
      const s = this.slots[this.hovered];
      const top = this.tmpC.set(0, ALTO / 2 + MARCO + 0.05, 0);
      s.mesh.localToWorld(top);
      top.project(this.camera);
      const visible = top.z < 1 && Math.abs(top.x) < 1.1 && Math.abs(top.y) < 1.1;
      this.opts.onLabel(((top.x + 1) / 2) * this.width, ((1 - top.y) / 2) * this.height, visible);
    } else {
      this.opts.onLabel(0, 0, false);
    }

    if (!this.safe.isLost()) {
      this.renderer.render(this.scene, this.camera);
      if (!this.readyFired) {
        this.readyFired = true;
        this.opts.onReady();
      }
    }
    return moving;
  }
}
