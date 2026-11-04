# Créditos de los clips de /vision

Cada clip, su fuente, autor, URL y licencia. Los clips generados con IA están marcados como tales; los de stock tienen licencia de uso comercial (Pexels License, Mixkit Stock Video Free License, Pixabay Content License) o CC BY 4.0 (MEVA, mevadata.org, Kitware/IARPA).

## Créditos · clips de la familia Comercial y comportamental

Todos los clips: 960×540, H.264 yuv420p, sin audio, loop con fundido de 0.5 s al inicio.
Las detecciones quemadas en los clips de MEVA y Pexels son del pipeline de la plataforma
(detector D-FINE-S + ReID PE-Core), ya presentes en los videos del portafolio; aquí solo se recortaron.

| Clip | Fuente | Autor | Licencia | Tramo del original |
|---|---|---|---|---|
| `seguimiento.mp4` | MEVA (Multiview Extended Video with Activities), cámara 0421 · vestíbulo/cafetería — https://mevadata.org | Kitware / IARPA DIVA | CC BY 4.0 | `evidencia-publica/seguimiento.mp4`, s 22.5–38.5 |
| `calor.mp4` | MEVA, cámara 0421 (mismo plano y tramo que seguimiento) | Kitware / IARPA DIVA | CC BY 4.0 | `evidencia-publica/calor.mp4`, s 22.5–38.5 |
| `permanencia.mp4` | MEVA, cámara G507 · sala de espera | Kitware / IARPA DIVA | CC BY 4.0 | `evidencia-publica/permanencia.mp4`, s 3–19 |
| `cruce.mp4` | MEVA, cámara G423 · pasillo | Kitware / IARPA DIVA | CC BY 4.0 | `evidencia-publica/cruce.mp4`, s 12–28 |
| `conteo.mp4` | Pexels, video 30138510 (cruce peatonal, Ciudad de México) — https://www.pexels.com/video/30138510/ | autor indicado en la página de Pexels (no se pudo consultar: 403) | Pexels License | `evidencia-publica/conteo.mp4`, s 18.9–28.9 |
| `comprador.mp4` | **Generado con IA** · ElevenLabs Creative, modelo Seedance 2.5 (texto a video), nov-2026 | ARS (generado) | contenido generado para la plataforma; rotulado `ia:true` | s 0.5–10 del clip generado |
| `demografia.mp4` | **Generado con IA** · ElevenLabs Creative, modelo Seedance 2.5 (texto a video), nov-2026 | ARS (generado) | contenido generado para la plataforma; rotulado `ia:true` | s 0.5–10 del clip generado |

Los clips generados con IA son una referencia visual: no muestran un caso real ni detecciones de un modelo real.


## Créditos · clips de la familia Operativo y de eficiencia

Todos los clips son 960×540, H.264 sin audio, en bucle (los últimos 0,5 s se funden con el inicio).

| Clip | Fuente | Autor | Licencia | Tramo | Qué lleva dibujado |
|---|---|---|---|---|---|
| `filas.mp4` | MEVA, cámara G421 (vestíbulo-cafetería), `2018-03-07.16-50-00.16-55-00.school.G421` | Kitware / IARPA DIVA · https://mevadata.org | CC BY 4.0 | s 0–18 | Cajas del detector EfficientDet-Lite0 (MediaPipe, local) + seguimiento por IoU; «en fila» dentro de la zona de la caja |
| `staff.mp4` | MEVA G421, mismo archivo | Kitware / IARPA DIVA | CC BY 4.0 | s 24–42 | Mismo detector; el rol personal/cliente lo asignamos a mano sobre las pistas (cajera y persona de limpieza) |
| `aforo.mp4` | MEVA G421, `2018-03-13.17-35-00.17-40-00.school.G421` | Kitware / IARPA DIVA | CC BY 4.0 | s 167,9–185,9 | Recorte del clip anterior del repo (detector D-FINE-S quemado, aforo superado a los 12,5 s) |
| `guardian.mp4` | MEVA G421, `2018-03-07.11-05-01.11-10-01.school.G421` | Kitware / IARPA DIVA | CC BY 4.0 | s 282–300 | Recorte del clip anterior del repo (Guardián de puestos v2 quemado; cambio de persona a los 14 s) |
| `blancas.mp4` | MEVA G326 (puerta del edificio administrativo), `2018-03-07.11-05-00.11-10-00.admin.G326` | Kitware / IARPA DIVA | CC BY 4.0 | s 98–114 | Nada: escena de referencia (no hay modelo de rostro local) |
| `cierre.mp4` | MEVA G326, mismo archivo | Kitware / IARPA DIVA | CC BY 4.0 | s 254–272 | Cajas EfficientDet-Lite0 + seguimiento |
| `apertura.mp4` | MEVA G506 (entrada de la terminal de buses), `2018-03-07.17-00-00.17-05-00.bus.G506` | Kitware / IARPA DIVA | CC BY 4.0 | s 26–42 | Cajas EfficientDet-Lite0 + seguimiento; «encargado» asignado a mano |
| `placas.mp4` | Pexels, video 37508953 (salida de parqueadero) | autor del video 37508953 en Pexels | Pexels License | s 0–11,5 | Recorte del clip anterior del repo (lpr_v2: YOLOv9-t + CCT-S quemado) |
| `derrames.mp4` | Generado con IA (ElevenLabs · Seedance 2.5), texto a video | — | uso propio · rotulado como IA | 15 s | Nada: video de referencia, no evidencia de modelo |

MEVA: Corona, K. et al., «MEVA: A Large-Scale Multiview, Multimodal Video Dataset for Activity Detection», WACV 2021. Datos: https://mevadata.org (CC BY 4.0).


## Créditos · clips de Prevención y riesgo (parte A)

Clips en loop (960×540, H.264, sin audio, último 0,5 s fundido con el inicio) emparejados con la simulación 3D
en `sync/prevencion.js`. Los segundos de evento son segundos del clip.

| id | archivo | origen | autor / fuente | licencia | evento |
|---|---|---|---|---|---|
| negras | negras.mp4 | **generado con IA** (ElevenLabs · Seedance 2.5, texto a video) | Vigías, prompt propio | uso propio · referencia (no es CCTV real) | 3,2 s |
| merodeo | merodeo.mp4 | **generado con IA** (ElevenLabs · LTX 2 Fast, texto a video; recortado de 4:3 a 16:9) | Vigías, prompt propio | uso propio · referencia | 10,5 s |
| intrusion | intrusion.mp4 | recorte (s 4–22) de `evidencia-publica/intrusion.mp4` | MEVA KF1, cámara G507 · Kitware / IARPA DIVA · https://mevadata.org — detecciones D-FINE-S COCO quemadas | CC BY 4.0 | 8,2 s |
| acceso | acceso.mp4 | **generado con IA** (ElevenLabs · Seedance 2.5, texto a video) | Vigías, prompt propio | uso propio · referencia | 9,5 s |
| aglomeracion | aglomeracion.mp4 | recorte (s 5–23) de `evidencia-publica/aglomeracion.mp4` | MEVA KF1, cámara G421 · Kitware / IARPA DIVA · https://mevadata.org — detector D-FINE-S quemado | CC BY 4.0 | 8,8 s |
| epp | epp.mp4 | recorte (s 0,6–13,6) de `evidencia-publica/epp.mp4` con las detecciones del modelo EPP quemadas | video público de obra; el autor y la URL originales no están registrados en el repo | **por confirmar** | 1,6 s |
| caidas | caidas.mp4 | **generado con IA** (ElevenLabs · LTX 2 Fast, texto a video) | Vigías, prompt propio | uso propio · referencia | 5 s |
| hurto | hurto.mp4 | recorte (s 6–22) y ampliación del panel «vista en vivo» de `evidencia-publica/hurto-vivo.mp4` | grabación propia del laboratorio Vigías (detector C+ v1 demo, rostro pixelado) | propia | 9,1 s |

Los clips de IA llevan `ia:true` y la chapa «video generado con IA · referencia»; no se presentan como «modelo real».
Las bandas superiores de estado («VIGILANDO / ALERTA») de los clips MEVA y EPP se recortaron al pasar a 16:9; los textos
y cajas del modelo dentro del cuadro se conservan.


## Créditos de los clips · prevención y riesgo, parte B

Clips en esta carpeta que pertenecen a la parte B: `ocultaProd`, `armas`, `blancas2`, `fuego`, `abandono`, `rostro`, `activos`
(cada uno con su `-poster.jpg`). Todos: 960×540, H.264, sin audio, loop cerrado con un fundido de 0,5 s.

| Clip | Fuente | Autor | Licencia | Detecciones sobre el video |
|---|---|---|---|---|
| `ocultaProd.mp4` | Prueba en el laboratorio propio de Vigías, recorte de `evidencia-publica/hurto-vivo.mp4` (s 6–21, solo la vista de cámara) | Vigías | Material propio | Detector C+ v1 (real), quemado en la grabación original |
| `armas.mp4` | Mixkit · «A robbery in the coffee shop» (#23252), https://mixkit.co/free-stock-video/a-robbery-in-the-coffee-shop-23252/ — reprocesado de `evidencia-publica/armas.mp4` | Mixkit | Mixkit Stock Video Free License | Modelo de armas (real), quemado en `armas.mp4` original |
| `blancas2.mp4` | Cámara propia de la sala de monitoreo, de `evidencia-publica/blancas-vivo.mp4` | Vigías | Material propio | Detector de personas + VLM «cuchillo» (real), quemado en el original |
| `fuego.mp4` | Video público de un incendio urbano (toma aérea), de `evidencia-publica/fuego.mp4` (s 0–16,5). El origen exacto no está registrado en el repo | — | Material ya publicado en el sitio | `yolox_s_fire` (real), quemado en el original |
| `abandono.mp4` | **Generado con IA** (ElevenLabs · Seedance 2.5, texto a video, 14 s, 720p) | Vigías (IA) | Generado para Vigías | Ninguna (solo las marcas del visor) |
| `rostro.mp4` | Mixkit · «Thief creep through house and looks up at camera» (#12830), https://mixkit.co/free-stock-video/thief-creep-through-house-and-looks-up-at-camera-12830/ | Mixkit | Mixkit Stock Video Free License | `public/models/epp/yolox_s_ppe.onnx`, clase «Mask» (real), confirmación tras 0,4 s seguidos ≥ 0,5 |
| `activos.mp4` | Mixkit · «Two thieves recorded on a security camera» (#31372), https://mixkit.co/free-stock-video/two-thieves-recorded-on-a-security-camera-31372/ (s 1,46–21,46) | Mixkit | Mixkit Stock Video Free License | Detección de cambio por zona con OpenCV (real): ámbar si el sitio está tapado, rojo si se ve el fondo vacío ≥ 0,6 s |


## Créditos · clips lite (parte A)

Todos los clips están recortados, sin audio, en H.264 y con un fundido de 0,5 s al final para que el loop no salte.

| Archivo | Analíticas | Fuente | Autor | URL | Licencia | Notas |
|---|---|---|---|---|---|---|
| `huecos.mp4` | huecos | Pixabay (video 208777), procesado con el modelo de huecos v3 | modoflai | https://pixabay.com/videos/man-store-shop-supermarket-208777/ | Pixabay Content License | Viene del `evidencia-publica/huecos.mp4` que ya existía, con las detecciones del modelo quemadas. Se usa entero (0–13,4 s), recortado a 16:9. |
| `fleje.mp4` | fleje y vencido | Pixabay (video 208777), limpio | modoflai | https://pixabay.com/videos/man-store-shop-supermarket-208777/ | Pixabay Content License | Es la misma toma de huecos, sin detecciones. Las marcas del visor son de referencia: aquí no corrió ningún modelo. |
| `puertas.mp4` | puertas | Mixkit (video 49350) | Mixkit | https://mixkit.co/free-stock-video/man-chooses-products-from-supermarket-refrigerators-49350/ | Mixkit Stock Video Free License | 0–11,5 s. Marcas de referencia, sin modelo. |
| `bodega.mp4` | bodega | Pixabay (video 209883) | GreenCardShow | https://pixabay.com/videos/forklift-machinery-loading-209883/ | Pixabay Content License | 0–16,5 s, reducido de 4K a 960×540. Marcas de referencia, sin modelo. |
| `destruccion.mp4` | destruccion | Clip que ya estaba en `evidencia-publica/destruccion.mp4` (cámara de seguridad, con detecciones del modelo quemadas) | — | — | La del clip original. Su procedencia no está documentada en el repo. | Tramo 5,5–19,5 s del original. |

Pósters: un cuadro del mismo clip en el segundo del evento, a 960 px.


## Créditos · clips lite-b

| Clip | Origen | Autor | Licencia / condición | Procesado |
|---|---|---|---|---|
| `pasillos.mp4` | Clip público ya publicado en `evidencia-publica/pasillos.mp4` (segmentación del modelo de pasillos ya quemada) | el del clip original (no consta en el repo) | la del clip original de `evidencia-publica/` | reencuadre vertical → 16:9 con fondo desenfocado, tramo 0,5–10 s, fundido de loop 0,5 s, 960×540, sin audio |
| `racks.mp4` | **Generado con IA** · ElevenLabs Flows, modelo LTX-2 Fast, texto a video | generado para Vigías (nov-2026) | contenido generado; se usa solo como referencia ilustrativa, rotulado «video generado con IA · referencia» | recorte de barras negras y a 16:9, tramo 0,5–9,5 s, fundido 0,5 s |
| `autopago.mp4` | **Generado con IA** · ElevenLabs Flows, LTX-2 Fast, texto a video | generado para Vigías (nov-2026) | ídem | 1920×1080 → 960×540, tramo 0–10 s, fundido 0,5 s |
| `zonaCiega.mp4` | **Generado con IA** · ElevenLabs Flows, LTX-2 Fast, texto a video | generado para Vigías (nov-2026) | ídem | recorte de barras negras y a 16:9, tramo 0–8 s, fundido 0,5 s |

Ningún clip de IA lleva detecciones de modelo: las zonas que se ven encima las dibuja el visor (`marcas`), no un modelo.
