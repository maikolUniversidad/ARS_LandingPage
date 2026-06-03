# Opciones de APIs de Visión Computacional — ARS Intelligence

> Investigación de proveedores (occidentales y chinos) para alimentar el playground de
> [`/vision-lab`](../../src/app/vision-lab/page.tsx) y el backend descrito en
> [`vision-demo-api.md`](../vision-demo-api.md). Reemplaza `mockPredict()` de
> [`src/lib/vision-mock.ts`](../../src/lib/vision-mock.ts) con un motor real.
>
> Estado: junio 2026. Precios **aproximados** y sujetos a cambio — verificar en la fuente antes de comprometer.

---

## Cómo leer estas tablas

- **Modo** — `Navegador` (corre en el cliente, sin costo por frame) · `GPU propia` (self-host) · `Cloud API` (por llamada/minuto).
- **Tiempo real** — apto para webcam en vivo a 15–30 fps (✅), solo keyframes/muestreo (⚠️), o batch/asíncrono (❌).
- **Costo** — orden de magnitud, no cotización oficial.
- **Regla de oro:** cámara en vivo → **navegador o GPU propia**. Las Cloud APIs por-frame solo convienen para frames muestreados o análisis de video subido.

---

## 1. Segmentación de personas (siluetas / máscaras / quitar fondo)

Separa la persona del fondo pixel a pixel (semantic/instance segmentation, matting).

| Opción | Proveedor | Modo | Tiempo real | Costo aprox. | Notas |
|---|---|---|---|---|---|
| **MediaPipe Image Segmenter / Selfie Segmentation** | Google (open) | Navegador | ✅ 30+ fps | Gratis | Máscara persona/fondo en vivo. **Mejor default para la demo.** WASM+GPU. |
| **TF.js BodyPix / body-segmentation** | Google (open) | Navegador | ✅ | Gratis | Segmentación de cuerpo + 24 partes. Más lento que MediaPipe. |
| **PP-HumanSeg (PaddleSeg)** | Baidu (open) | GPU propia | ✅ | Gratis (tu cómputo) | Segmentación humana en tiempo real, optimizado para edge. Camino chino open-source. |
| **YOLO11-seg** | Ultralytics | GPU propia / Navegador (ONNX) | ✅ | ⚠️ Licencia AGPL-3.0 o Enterprise | Instance segmentation rápida. Ojo licencia en producto cerrado. |
| **SAM 2 (Segment Anything 2)** | Meta (open) | GPU propia / Cloud | ⚠️ pesado | Self-host gratis; vía Replicate/fal por seg-GPU | Segmentación de cualquier objeto + tracking en video. Muy potente, pesado para navegador. |
| **BiRefNet / RMBG-2.0** | Open weights | GPU propia / Cloud | ⚠️ | Self-host gratis; Replicate/fal | SOTA en matting/quitar fondo de alta calidad. |
| **remove.bg / Photoroom API** | Kaleido / Photoroom | Cloud API | ❌ batch | ~$0,10–0,20/imagen o suscripción | Quitar fondo llave en mano. Caro a volumen, no para vivo. |
| **Baidu Body Analysis (body seg)** | Baidu Cloud | Cloud API | ⚠️ | Por llamada (consola intl) | Segmentación de cuerpo + atributos. Catálogo orientado a consola China. |
| **Roboflow (instance seg / SAM2 hosted)** | Roboflow | Navegador / GPU dedicada | ✅ (inferencejs) | Core ~$79/mes + créditos | Entrenas clases custom y exportas. Integra bien con el proyecto. |

**Análisis:** para la demo en vivo de "te recortamos del fondo", **MediaPipe Selfie Segmentation** gana (gratis, navegador, 30 fps). Para máscaras de calidad sobre video subido o segmentar objetos arbitrarios con tracking, **SAM 2** en GPU propia. El camino chino viable es **PP-HumanSeg** (open-source, self-host) — evita el registro en consola China.

---

## 2. Estimación de pose (esqueleto / keypoints)

Detecta articulaciones (hombros, codos, rodillas…) — base para caídas, ergonomía, conteo de repeticiones.

| Opción | Proveedor | Modo | Tiempo real | Costo aprox. | Notas |
|---|---|---|---|---|---|
| **MediaPipe Pose Landmarker** | Google (open) | Navegador | ✅ 30+ fps | Gratis | 33 landmarks 3D + segmentación. **Mejor default**, ya alineado con `pose_detection` y `fall_detection_demo`. |
| **MoveNet (Lightning / Thunder)** | Google / TF.js | Navegador | ✅ 30–50 fps | Gratis | 17 keypoints. Lightning = ultrarrápido; Thunder = más preciso. |
| **BlazePose (TF.js)** | Google | Navegador | ✅ | Gratis | 33 keypoints, base de MediaPipe Pose. |
| **YOLO11-pose** | Ultralytics | GPU propia / Navegador (ONNX) | ✅ | ⚠️ AGPL-3.0 / Enterprise | Multi-persona + pose en un paso. Ojo licencia. |
| **ViTPose / MMPose** | Open weights | GPU propia | ✅ (GPU) | Gratis (tu cómputo) | SOTA en precisión multi-persona. Pesado. |
| **Baidu Body Analysis (keypoints)** | Baidu Cloud | Cloud API | ⚠️ | Por llamada | Keypoints de cuerpo + gesto. Consola China. |
| **Roboflow Keypoint Detection** | Roboflow | Navegador / GPU dedicada | ✅ (inferencejs) | Core ~$79/mes | Keypoints custom (ej. EPP en partes del cuerpo). |

**Nota:** AWS Rekognition, Google Vision y Azure **no** ofrecen pose de keypoints como producto dedicado. Para pose, lo correcto es **navegador (MediaPipe/MoveNet)** o **GPU propia (YOLO-pose / MMPose)**.

**Análisis:** **MediaPipe Pose** cubre tus modelos `pose_detection` y `fall_detection_demo` sin costo y en tiempo real. Para multi-persona robusto en escenas de seguridad densas, **YOLO11-pose** o **MMPose** en GPU propia.

---

## 3. VLMs (Vision-Language Models) — "describe qué pasa en la escena"

Razonamiento visual, descripción de escena, Q&A sobre imagen/frame, lectura de contexto. Latencia tipo LLM (segundos) → **se usan sobre keyframes muestreados, no a 30 fps.**

| Modelo | Proveedor | Acceso | Video nativo | Costo aprox. | Notas |
|---|---|---|---|---|---|
| **Qwen3-VL** | Alibaba (DashScope) | Cloud API (portal **intl**, compat. OpenAI) | ✅ clips ~20 min | ~$0,01–0,78/M tokens + free tier | **Mejor opción china**: registro internacional fácil, buen español, localización temporal. ⭐ |
| **GLM-4.5V / 4.6V** | Zhipu (Z.ai) | Cloud API / OpenRouter | ✅ | ~$0,30–0,60/M tokens | SOTA video. Cómputo en China → +latencia desde LATAM. Pesos también abiertos. |
| **Gemini 2.x Flash** | Google | Cloud API | ✅ | Bajo por token, free tier | Multimodal fuerte, acepta video, barato en Flash. Buena opción occidental. |
| **GPT-4o / 4.x mini vision** | OpenAI | Cloud API | ⚠️ frames | Por token | Calidad alta, ecosistema maduro. Video = frames muestreados. |
| **Claude (Opus/Sonnet) vision** | Anthropic | Cloud API | ⚠️ frames | Por token | Buen razonamiento sobre imágenes/documentos. |
| **Moondream 3** | Moondream | Cloud API / Navegador | ⚠️ frames | **~$0,06/1.000 imgs**, free tier | VLM pequeño y barato; detección/conteo/pointing nativo. Corre incluso en navegador. ⭐ costo |
| **MiniCPM-V** | OpenBMB (open) | GPU propia | ⚠️ | Gratis (tu cómputo) | VLM eficiente edge, sin barrera de registro. |
| **InternVL** | Shanghai AI Lab (open) | GPU propia | ⚠️ | Gratis (tu cómputo) | VLM abierto potente, control total. |
| **Florence-2 / PaliGemma** | Microsoft / Google (open) | GPU propia / Roboflow | ⚠️ | Gratis / hosted | Tareas dirigidas (caption, detección, OCR) más livianas que un VLM grande. |

**Análisis:** cubre tu modelo `scene_description_vlm`. Para producción con buen español y facturación internacional sin fricción: **Qwen3-VL (DashScope-intl)** o **Gemini Flash**. Para el costo más bajo o correr en navegador: **Moondream**. Para soberanía de datos total (cliente sensible): **MiniCPM-V / InternVL** self-host. Úsalos sobre 1 frame/seg o disparados por evento, nunca por cada frame.

---

## 4. Detección de objetos / personas / vehículos / EPP

Bounding boxes con clase y confianza — el núcleo de tu pipeline (`people_detection`, `vehicle_detection`, `ppe_detection`).

| Opción | Proveedor | Modo | Tiempo real | Costo aprox. | Notas |
|---|---|---|---|---|---|
| **Roboflow (inferencejs / Workflows)** | Roboflow | Navegador / GPU dedicada | ✅ | Core ~$79/mes, free $60 créditos | Entrena EPP/placas custom, exporta a navegador o WebRTC→GPU. ⭐ encaje con el proyecto |
| **YOLO11 / YOLO-World** | Ultralytics | GPU propia / Navegador (ONNX) | ✅ | ⚠️ AGPL-3.0 / Enterprise | El detector base más usado. YOLO-World = open-vocabulary. Ojo licencia. |
| **PaddleDetection** | Baidu (open) | GPU propia | ✅ | Gratis (tu cómputo) | Detección + tracking en tiempo real. Camino chino open-source, sin registro. |
| **AWS Rekognition** | AWS | Cloud API | ❌ vivo | ~$1/1.000 imágenes | ⚠️ Streaming Video cierra a clientes nuevos el **30-abr-2026**. Solo batch/imagen. |
| **Google Cloud Vision** | Google | Cloud API | ❌ vivo | ~$1,50/1.000 unidades | Etiquetado/objetos. Caro a alto fps. |
| **Azure AI Vision** | Microsoft | Cloud API | ❌ vivo | Por 1.000 transacciones | Detección general OK; Face restringido (ver §6). |
| **Replicate / fal.ai** | varios | Cloud (GPU/seg) | ❌ vivo | ~$0,0002–0,0014/seg-GPU | Corre YOLO/modelos por segundo. Bueno para batch, malo para vivo. |
| **Huawei Image Recognition** | Huawei Cloud | Cloud API | ❌ vivo | **~$0,001/llamada** | El más barato y transparente de los chinos, facturación USD. |

---

## 5. OCR / Placas (LPR)

Lectura de texto y matrículas — tu modelo `plate_ocr` / `plate_detection`.

| Opción | Proveedor | Modo | Tiempo real | Costo aprox. | Notas |
|---|---|---|---|---|---|
| **PaddleOCR** | Baidu (open) | GPU propia | ✅ | Gratis (tu cómputo) | OCR + placas, multilenguaje. Camino chino open-source. ⭐ |
| **EasyOCR** | open | GPU propia | ⚠️ | Gratis | Simple, ya referenciado en tu catálogo. |
| **Tencent LicensePlateOCR** | Tencent Cloud | Cloud API | ❌ | Por llamada (consola intl, USD) | API de placas dedicada, buena postura internacional. |
| **Google Cloud Vision OCR** | Google | Cloud API | ❌ | ~$1,50/1.000 | OCR robusto general. |
| **Roboflow + OCR** | Roboflow | Navegador / GPU | ✅ | Core plan | Detecta placa (bbox) y pasas el crop al OCR. |

---

## 6. Rostros (detección / reconocimiento / liveness)

Tu modelo `face_detection` / `face_recognition_demo`. **Sensible legalmente** — revisar privacidad/consentimiento en LATAM.

| Opción | Proveedor | Modo | Tiempo real | Costo aprox. | Notas |
|---|---|---|---|---|---|
| **MediaPipe Face Detector / BlazeFace** | Google (open) | Navegador | ✅ 30+ fps | Gratis | Detección + landmarks en vivo. Para la demo. |
| **InsightFace** | open | GPU propia | ✅ | Gratis (tu cómputo) | Detección + reconocimiento SOTA, ya en tu catálogo. ⭐ self-host |
| **AWS Rekognition Face** | AWS | Cloud API | ❌ vivo | ~$1/1.000 | Detección + comparación + búsqueda. |
| **Azure Face API** | Microsoft | Cloud API | ❌ | Por 1.000 | ⚠️ Identificación/verificación = **acceso limitado** (requiere solicitud aprobada). Detección sí disponible. |
| **Face++ (Megvii)** | Megvii | Cloud API | ❌ | free 1.000/mes, $1,50/1.000 | API de rostro china más fácil de registrar. ⚠️ jurisdicción china → revisar soberanía de datos. |
| **Tencent Face Recognition** | Tencent Cloud | Cloud API | ❌ | Por llamada (USD) | Detección/compare/liveness, buena postura intl. |

---

## 7. Barreras de acceso (proveedores chinos)

- Las **consolas domésticas** (`.com.cn`) suelen exigir teléfono chino + Alipay/entidad china. Para el catálogo profundo de Baidu/SenseTime/iFlytek esto es un bloqueo.
- **Cómo evitarlo:**
  1. Usar **portales internacionales**: `dashscope-intl.console.aliyun.com`, `intl.cloud.tencent.com`, `huaweicloud.com/intl`, `intl.cloud.baidu.com`.
  2. O **self-host pesos abiertos**: PaddleDetection, PaddleOCR, PP-HumanSeg, MiniCPM-V, InternVL, Qwen-VL, GLM-V — cero registro, control total de datos.
- Para clientes sensibles (gobierno/seguridad en LATAM), el self-host de pesos abiertos también resuelve la **soberanía de datos**: el video nunca sale de tu infraestructura.

---

## 8. Recomendación arquitectónica para ARS

| Necesidad | Recomendación | Por qué |
|---|---|---|
| **Demo "prende tu cámara" (vision-lab)** | Navegador: **MediaPipe** (pose, segmentación, rostro) + **Roboflow inferencejs** (detección custom) | 15–30 fps, $0 por frame, privacidad (video no sale del dispositivo). Reemplaza `mockPredict()` directo. |
| **Modelos pesados (EPP/placas/loitering reales, video subido)** | **GPU propia** vía WebRTC/WebSocket: PaddleDetection / YOLO / SAM2, según [`vision-demo-api.md`](../vision-demo-api.md) | <100 ms, ~$0,01–0,02/min por stream — mucho más barato que Cloud por-frame. |
| **"Describe la escena" (VLM)** | **Qwen3-VL (DashScope-intl)** o **Gemini Flash** sobre keyframes (1/seg) | Buen español, video nativo, costo controlado al muestrear. |
| **Soberanía de datos / cliente sensible** | Self-host pesos abiertos (Paddle*, InsightFace, MiniCPM-V) | El video nunca sale de tu infraestructura. |

**Qué NO hacer:** llamar a una Cloud API por-frame para cámara en vivo (Rekognition/Vision/Replicate). A 30 fps el costo y la latencia se disparan; reservarlas para frames muestreados o análisis de video subido.

---

### Fuentes principales
Roboflow · AWS Rekognition · Google Cloud Vision/Video Intelligence · Azure AI Vision/Face ·
Ultralytics YOLO · Replicate/fal.ai · Modal · Moondream · MediaPipe · TensorFlow.js ·
transformers.js · Alibaba DashScope (Qwen-VL) · Zhipu GLM-V · Baidu PaddlePaddle ·
Tencent Cloud · Huawei Cloud · Face++ (Megvii) · Meta SAM 2 · InsightFace.

---

# 9. Inferencia en el navegador — Estado del arte (junio 2026)

> Esta es la capa que **ya implementamos** en [`/vision-lab`](../../src/app/vision-lab/page.tsx):
> el visitante prende su cámara y ve los modelos correr en vivo, **en su propio
> dispositivo, sin servidor y sin costo por frame**. Implementación en
> [`src/lib/vision-browser.ts`](../../src/lib/vision-browser.ts).

## 9.1 Cambio de juego: WebGPU es Baseline

Desde fines de 2025 / inicios de 2026, **WebGPU es "Baseline"** (soportado por defecto en
Chrome, Edge, **Safari 26** en macOS/iOS/iPadOS, y Firefox en Windows/macOS). Esto habilita
correr modelos pesados (incluso VLMs pequeños) en el navegador a velocidad interactiva.
**Siempre** hay que detectar `navigator.gpu` y caer a **WASM (CPU)** si no está — funciona
en todos lados, 3–10× más lento. Nuestro motor hace ese fallback automático (GPU→CPU).

## 9.2 Librerías SOTA para CV en navegador

| Librería | Paquete / versión | Tareas | Backend | Cuándo usarla |
|---|---|---|---|---|
| **MediaPipe Tasks Vision** ⭐ | `@mediapipe/tasks-vision` **0.10.35** | Pose, manos, rostro+malla, gesto, **segmentación selfie**, detección de objetos (EfficientDet), clasificación | WebGL/GPU + WASM | **Lo mejor para webcam en vivo.** Modelos `.task` livianos, modo `LIVE_STREAM`/`VIDEO`, 30–60 fps, Apache-2.0. **Es lo que usamos.** |
| **TensorFlow.js** | `@tensorflow/tfjs` 4.22.x | **MoveNet** (pose, ~50 fps), BlazeFace, coco-ssd, body-seg | WebGL/WebGPU/WASM | Si querés MoveNet específicamente. Desarrollo más estancado. |
| **transformers.js v3+** ⭐ VLM | `@huggingface/transformers` 3.8.x | Detección (DETR/YOLOS), segmentación, **VLMs** (FastVLM, SmolVLM2, Moondream, Florence-2) | **WebGPU** + WASM | "Describe la escena" 100% en navegador. Correr en Web Worker. |
| **ONNX Runtime Web** | `onnxruntime-web` 1.26.x | Cualquier modelo ONNX (YOLO custom, **SAM2**) | WebGPU/WASM/WebNN | Modelos custom/SOTA que las otras no envuelven. Vos hacés pre/post-proceso (NMS). |
| **Roboflow inferencejs** | `inferencejs` | Tus modelos custom entrenados en Roboflow | Web Worker (TF.js) | Deploy llave en mano de un detector custom (EPP/placas) con publishable key. |

## 9.3 Mejor modelo por tarea que corre en navegador (2026)

| Tarea | SOTA en navegador | Nota |
|---|---|---|
| **Pose** | MediaPipe PoseLandmarker / MoveNet | 33 (MP) o 17 (MoveNet) keypoints, 30–50 fps |
| **Segmentación selfie/semántica** | MediaPipe ImageSegmenter | 30+ fps |
| **Segmentación promptable (click)** | **SAM 2** vía ONNX Runtime Web | ~50 ms/prompt; aún no en transformers.js |
| **Detección de objetos liviana** | EfficientDet-Lite0 (MediaPipe) o **RF-DETR** (Apache-2.0) | License-clean; evitan AGPL de YOLO |
| **VLM pequeño (describir escena)** | **Apple FastVLM-0.5B** (`onnx-community/FastVLM-0.5B-ONNX`) | Caption de video en vivo en navegador vía WebGPU, ~300 MB |
| **VLM alternativo** | SmolVLM2-500M, Moondream2 | Moondream da salida estructurada/JSON |

⚠️ **Licencia YOLO (Ultralytics):** YOLO11/26 es **AGPL-3.0** — servir los pesos en una web
comercial cerrada obliga a abrir TODO tu código, o pagar Enterprise. Para navegador, preferí
**EfficientDet-Lite (MediaPipe)**, **RF-DETR** o **DETR** (todos Apache-2.0).

## 9.4 Lo que implementamos en Vision Lab

Motor real en [`src/lib/vision-browser.ts`](../../src/lib/vision-browser.ts), con toggle
**"IA real (navegador)" ↔ "Demo simulado"** en la UI. Cuando hay cámara/video/imagen y el
modelo lo soporta, corre MediaPipe de verdad; el resto cae al simulador y se marca como tal.
El HUD muestra backend (GPU/CPU) y **fps** en vivo.

| Modelo del catálogo | Motor navegador | Task MediaPipe |
|---|---|---|
| `pose_detection` | ✅ real | PoseLandmarker (33→17 COCO) |
| `fall_detection_demo` | ✅ real | PoseLandmarker + ángulo de torso sostenido >1 s |
| `people_detection` | ✅ real | ObjectDetector (EfficientDet), clase persona |
| `vehicle_detection` | ✅ real | ObjectDetector, clases vehículo |
| `face_detection` | ✅ real | FaceDetector (BlazeFace) |
| `roi_intrusion` / `line_crossing` / `loitering` | ✅ real | ObjectDetector (persona) + motor de reglas |
| `ppe_detection`, `plate_*`, `face_recognition_demo`, `abandoned_object`, `scene_description_vlm` | ⏳ simulado | Requieren backend/GPU o API (ver §1–6) |

Notas técnicas:
- El motor reusa `evaluateRules()` de [`vision-mock.ts`](../../src/lib/vision-mock.ts), así que
  ROI, cruce de línea, loitering y eventos funcionan igual sobre detecciones reales.
- Tracker por centroide para IDs estables entre frames.
- WASM servido desde jsDelivr fijado a la versión `0.10.35` (coincide con el paquete npm).
- Alineación exacta del overlay con webcam 16:9; videos/imágenes con otro aspect-ratio pueden
  tener leve desfase por `object-cover` (no afecta el caso principal de cámara).

## 9.5 Próximos pasos sugeridos

1. **"Describe la escena" real en navegador:** integrar **FastVLM-0.5B** vía `@huggingface/transformers`
   + WebGPU en un Web Worker, disparado por botón (no por frame), throttle ~1 fps. Reemplaza el
   mock de `scene_description_vlm`.
2. **EPP / placas custom:** entrenar en Roboflow y desplegar con `inferencejs` (navegador) o
   `onnxruntime-web` + modelo ONNX propio (sin AGPL).
3. **Segmentación promptable:** SAM 2 vía ONNX Runtime Web para "click para segmentar".
4. **Modelos pesados / multi-cámara 24-7:** servidor GPU propio (WebRTC) según
   [`vision-demo-api.md`](../vision-demo-api.md) — el navegador es para la demo, no para producción.

### Fuentes (inferencia en navegador)
MediaPipe Tasks Vision (ai.google.dev/edge/mediapipe) · @mediapipe/tasks-vision npm 0.10.35 ·
transformers.js v3 / WebGPU (huggingface.co/blog/transformersjs-v3) · Apple FastVLM WebGPU
(huggingface.co/spaces/apple/fastvlm-webgpu) · onnxruntime-web 1.26 · TensorFlow.js MoveNet ·
Roboflow Web SDK · WebGPU Baseline (caniuse.com/webgpu) · Ultralytics YOLO26 (docs.ultralytics.com).
