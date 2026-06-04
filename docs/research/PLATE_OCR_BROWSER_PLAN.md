# OCR de placas 100% en navegador — Viabilidad + Plan

> Investigación (junio 2026) + verificación adversarial. Pregunta: ¿es posible
> que, cuando la cámara detecta un **auto**, el navegador haga **OCR de la placa**
> de forma liviana ("sin consumo de recursos" = throttled, no por frame), sin
> servidor? Integrable sobre lo que ya existe en
> [vision-browser.ts](../../src/lib/vision-browser.ts) (MediaPipe ya detecta `car`).

---

## 1. Veredicto: **VIABLE-CON-LÍMITES** ✅⚠️

Es técnicamente posible y razonable correr el pipeline `car → detectar placa → OCR`
100% client-side, throttled. La etapa 1 (`car`) **ya existe** (MediaPipe `ObjectDetector`
en `objectPredictions`, filtra `car/truck/bus`). Faltan 2 etapas ONNX livianas vía
`onnxruntime-web`.

**Por qué "con-límites" y no "viable" a secas — la variable que decide todo es la
resolución de la placa en píxeles.** Webcam 720p + auto a >4–5 m ⇒ placa <80 px de
ancho ⇒ OCR no confiable. Funciona bien con placa **cercana, frontal, nítida y casi
estática**; degrada rápido con ángulo (>30°), distancia, movimiento (motion blur) y
poca luz. Para ANPR serio (calle, portón, velocidad) se necesita cámara dedicada o
backend — esto es para demo / casos controlados.

### ⚠️ Dos correcciones OBLIGATORIAS antes de codear (de la verificación adversarial)

1. **Resolver la licencia ANTES de empezar.** El mejor detector de placa abierto
   (`morsetechlab/yolov11-license-plate-detection`) es **YOLO/Ultralytics → AGPL-3.0**.
   En una web comercial pública, AGPL obliga a abrir TODO el código. Opciones:
   - aceptar AGPL, **o**
   - usar un detector **Apache/MIT** (entrenar/buscar uno), **o**
   - el OCR `fast-plate-ocr` es la pieza "limpia"; el detector es el punto a resolver.
   - ❌ NO sirve el atajo "recortar la mitad inferior del bbox del auto y pasárselo al
     OCR": `fast-plate-ocr` espera el **crop de la placa ya recortado**; darle medio
     auto degrada fuerte la lectura.
2. **No prometer calidad sin un spike de validación (1 día).** Las métricas del
   detector recomendado están **contaminadas** (la propia model card lo advierte) y el
   "submilisegundo" de `fast-plate-ocr` es **nativo (CUDA/Python), no browser**. Antes
   de integrar, prototipar detector+OCR en `onnxruntime-web` sobre 20–30 frames reales
   de webcam a la distancia/ángulo de uso y medir: (a) ms reales con WebGPU
   **contendiendo con MediaPipe por la misma GPU**, (b) accuracy con placas a la
   resolución esperada. Si la placa cae <80 px en el caso real, **el plan no sirve** y
   hay que ir a cámara dedicada/backend, por bueno que sea el software.

---

## 2. Stack recomendado (paquetes + modelos, verificados a jun-2026)

Pipeline de **3 etapas**, todo client-side, reaprovechando lo existente:

| Etapa | Tecnología | Modelo | Peso | Licencia |
|---|---|---|---|---|
| 1. Auto (`car`) | **Ya existe** | EfficientDet-Lite0 (`@mediapipe/tasks-vision`) | ~7 MB (ya cargado) | Apache-2.0 ✅ |
| 2. Detección de placa | ONNX vía `onnxruntime-web` | YOLOv11-**n** placa (`morsetechlab`) → ONNX, 640×640 | **~10.5 MB** | ⚠️ AGPL-3.0 |
| 3. OCR de la placa | ONNX vía `onnxruntime-web` | **fast-plate-ocr `cct-xs-v2-global`** (65+ países, LATAM) | sub-MB a pocos MB | ✅ permisiva |

```
npm i onnxruntime-web@^1.22   # WebGPU + WASM EPs; auto-hospedar los .wasm/.mjs
```
- OCR: https://github.com/ankandrew/fast-plate-ocr (region-aware, cubre Colombia/Perú). Espera el **crop de placa**.
- Detector (AGPL): https://huggingface.co/morsetechlab/yolov11-license-plate-detection — métricas no validadas (dataset contaminado): testear antes.
- Plan B de OCR (genérico, peor en placas chicas): PP-OCRv4 mobile vía `@gutenye/ocr-browser` (det ~2.4 MB + rec ~7–10 MB).
- Plan C descartado: `tesseract.js` (usar **v7**, no v6) — mediocre en placas sin preproceso fuerte; solo WASM/CPU.
- ❌ No usar transformers.js + TrOCR: pensado para documentos, modelo pesado, over-kill.

**Peso incremental realista: ~25–35 MB one-time, cacheable** (onnxruntime-web jsep wasm ~20 MB + YOLOv11n 10.5 MB + OCR). El "~12 MB" sería irreal (rompería WebGPU). Se descarga una vez y queda en caché.

---

## 3. Arquitectura "liviana" (la clave de "sin consumo de recursos")

- El OCR **NUNCA corre por frame**. Corre **1 vez cada N s por `trackId`** de auto
  (N≈3000 ms), y se **cachea** el resultado por track. El loop de MediaPipe sigue intacto.
- Todo el OCR vive en un **Web Worker** dedicado (no bloquea el hilo de UI ni el rAF de
  MediaPipe). Se le pasa un `ImageBitmap` (transferible, cero copia) del crop del auto.
- **Selección de EP:** intentar `['webgpu']`; si falla → `['wasm']` (SIMD + threads).
- ⚠️ **Riesgo a vigilar:** MediaPipe ya usa la GPU; el OCR en WebGPU **contiende** por
  la misma GPU. Por eso el throttling por trackId + worker es obligatorio, no opcional.

---

## 4. Plan de implementación por fases

Integra directo sobre la arquitectura actual (`BrowserVisionEngine` + loop rAF, `draw()`
en [LiveAIOverlay.tsx](../../src/components/LiveAIOverlay.tsx), tipo `Prediction` con `trackId`).

### FASE 0 — Decisión de licencia + spike de validación (sin integrar)
- Resolver AGPL (§1.1). Exportar modelos a ONNX y **auto-hospedar** en `public/models/plate/`
  y los binarios de `onnxruntime-web` en `public/ort/` (setear `ort.env.wasm.wasmPaths`).
- Prototipo de 1 día (§1.2): medir ms reales (WebGPU vs WASM, con MediaPipe activo) y
  accuracy a la resolución de placa esperada. **Gate de decisión.**

### FASE 1 — Worker de OCR aislado
- **`src/workers/plate-ocr.worker.ts`** — importa `onnxruntime-web`, crea 2 `InferenceSession`
  (detector placa + OCR). API por `postMessage`: recibe `{ trackId, imageBitmap }`,
  devuelve `{ trackId, plateText, plateConf }`. Preproceso con `OffscreenCanvas`
  (resize 640×640 detector; input del OCR).
- **`src/lib/plate-ocr-client.ts`** — wrapper: `class PlateOcrClient { ready(); recognize(trackId, bitmap) }`,
  con un solo `inflight` (descarta si está ocupado).

### FASE 2 — Throttling + caché en el motor
- **`src/lib/vision-mock.ts`** — extender `Prediction` con `plate?: { text: string; confidence: number }`.
- **`src/lib/vision-browser.ts`** — en `BrowserVisionEngine`: `plateCache = Map<trackId, {text, conf, ts}>`.
  En `objectPredictions`, si `modelId === "vehicle_detection"` y categoría `car/truck/bus`:
  si el `trackId` no tiene lectura fresca (`now - ts > 3000`) y no hay inferencia en vuelo →
  `createImageBitmap(video, sx,sy,sw,sh)` del bbox y encolar al worker. Adjuntar `plate` cacheada.

### FASE 3 — UI
- **`LiveAIOverlay.tsx`** — en `draw()`, si `p.plate?.text`, dibujar etiqueta `🚗 ABC123 · 87%`
  bajo el bbox del auto (reusar estilo HUD). Activar pipeline en `browserModelForDemo`
  para `demoType === "lpr"` (o `vehicle` con flag de placa). Mostrar en el badge `placa: ON · GPU/WASM`.

### FASE 4 — Robustez de lectura
- **`src/lib/plate-postprocess.ts`** — validación por **regex LATAM** (Colombia carro
  `^[A-Z]{3}\d{3}$`, moto `^[A-Z]{3}\d{2}[A-Z]$`; Perú); **corrección de confusiones**
  por posición (letra: `0→O,1→I,5→S,8→B`; dígito al revés); **voto temporal** (moda de
  las últimas K lecturas por `trackId`) → confirmar solo tras 2–3 lecturas coincidentes.

### FASE 5 — Degradación elegante
- Sin WebGPU → worker en WASM, subir N (cada 5 s), bajar resolución.
- Sin placa / texto vacío / falla regex → **no mostrar nada** (no inventar).
- Modelo no carga (CSP/red) → ocultar capa de placa; el resto del overlay sigue.

---

## 5. Performance esperada
- MediaPipe `car`: sin cambios (~15–30 fps).
- Detector + OCR: 1 vez cada ~3 s por auto. En WebGPU **pocos a ~30 ms**; en WASM
  **decenas a ~150 ms** — por trackId, en worker, sin jank en el video. (Recordar: son
  **DOS** sesiones + `createImageBitmap` + resize; no una sola inferencia.)
- Latencia percibida: placa aparece ~0.1–0.5 s tras entrar el auto y se cachea por track.

## 6. Límites honestos
1. **Resolución manda** (placa <80 px → no lee). Caso útil estrecho: cercana, frontal, nítida.
2. Ángulo >30° y motion blur degradan mucho (no hay rectificación de perspectiva por defecto).
3. **Charset LATAM:** confusiones O↔0, I↔1, B↔8, S↔5; Colombia carro `ABC123` vs moto
   `ABC12D` tienen estructura distinta → regex por tipo + voto temporal son obligatorios.
4. **WebGPU desigual** (Firefox/Safari pueden caer a WASM) y soporte parcial de ops en
   onnxruntime-web; **contención GPU** con MediaPipe.
5. **AGPL** del detector en app comercial = riesgo legal real (§1.1).
6. Esto **lee** la placa, no la valida contra padrón. Toda acción (alerta/barrera) debe
   asumir error y umbral alto.

---

## 7. Estado — ✅ IMPLEMENTADO (versión license-clean)

Implementado con un stack **Apache-2.0** para evitar el AGPL del detector YOLO:

- **OCR:** [`tesseract.js`](../../src/lib/plate-ocr.ts) **7.0.0 (Apache-2.0)** — corre 100% en
  el navegador en su propio worker; descarga sus modelos del CDN la primera vez (cacheados).
- **Sin detector de placa dedicado** (así se evita el AGPL): se usa el bbox del **auto** que
  ya detecta MediaPipe, se recorta la región inferior, se preprocesa (gris + contraste +
  umbral) y se pasa a tesseract con whitelist `A-Z0-9` + modo línea única.
- **Validación:** solo se muestra si encaja en patrón **Colombia** (carro `LLL DDD` / moto
  `LLL DD L`), con corrección de confusiones (O↔0, I↔1…) y **voto temporal** por `trackId`
  (≥2 lecturas coincidentes). Si no logra leer, **no muestra nada** (no inventa).
- **Liviano:** máx. 1 OCR cada 1.5 s por vehículo, una sola inferencia en vuelo, en worker.
- **Dónde:** demo `lpr` ("Reconocimiento de placas") en [LiveAIOverlay](../../src/components/LiveAIOverlay.tsx),
  activo tanto en **cámara** como en **video subido** ([VideoUpload](../../src/components/VideoUpload.tsx)).

**Expectativa realista (lo de §6 sigue valiendo):** funciona con la placa **cercana, de
frente y nítida**; con autos lejanos/borrosos/oblicuos puede no leer (mostrará nada antes que
inventar). tesseract es el camino license-clean de **menor riesgo**, no el de máxima precisión.
Si se necesita más calidad, el upgrade es PP-OCR/RapidOCR (también Apache-2.0) vía
onnxruntime-web — documentado arriba como Plan B.

### Fuentes
fast-plate-ocr (github.com/ankandrew/fast-plate-ocr) · onnxruntime-web (npm, WebGPU EP docs) ·
morsetechlab YOLOv11 plate (HuggingFace, AGPL + caveat dataset) · @gutenye/ocr-browser (PP-OCRv4 ONNX) ·
tesseract.js v7 (github releases) · placas Colombia (Wikipedia).
