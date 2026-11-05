# Narración de Ars · /vision, /laboratorio, /proyectos, «Propuesta ARS» y frases puente

Generado el 2026-11-04.

- **Guiones:** `src/data/narracion/guiones-vision-lab-proyectos.ts` (`GUIONES_VISION`, `GUIONES_LABORATORIO`, `GUIONES_PROYECTOS`, `GUIONES_PROPUESTA`, `GUIONES_PUENTE`), registrados en `src/data/narracion/index.ts`.
- **Ids:** `IDS_VISION`, `IDS_LABORATORIO`, `IDS_PROYECTOS`, `IDS_PROPUESTA`, `IDS_PUENTE` en `src/lib/narracion/contrato.ts`.
- **Audio:** `public/audio/narracion/<id>.mp3`.
- **Voz:** «Sofía – Confianza & Calidez» (`b2htR0pMe28pYwCY9gnP`), modelo `eleven_v4`, una toma por clip.
- **Flow de ElevenLabs:** `VKigTZhHkOdajxLXL5ru` («ARS · Narración vision/lab/proyectos/propuesta/puente»).
- **Post-proceso (ffmpeg 9.0.1):** igual que las demás: mono, 44,1 kHz, 96 kbps CBR, `loudnorm=I=-16:TP=-1.5:LRA=7`, sin metadatos. Medido: −16,1 a −16,5 LUFS integrado.

## Costo

| Concepto | Créditos | USD aprox. |
|---|---:|---:|
| Estimación previa (`estimate_only`, 1 clip) | 0 | 0 |
| 19 clips TTS (`eleven_v4`, 1 toma c/u, sin regeneraciones) | **2.804** | **≈ 0,51** |
| 2 transcripciones de verificación (`eleven_scribe_v1`) | 0 | 0 |

## Verificación

- `proyectos/intro` y `propuesta/enviada` transcritos con Scribe: idénticos al guion. «ARS» (la empresa) se dice igual que en `servicios/hero` y `home/*` (se escribe en mayúsculas como en esos guiones); «Ars» (la asistente) se escribe así para que salga como una palabra.
- Ninguno promete placas, armas, EPP, térmica, fuego, plazos («48 horas») ni SLA; el laboratorio cuenta lo que dice la página (la detección del demo corre en el navegador).

## Dónde suena cada uno

| id | Disparador | s |
|---|---|---:|
| `vision/hero` | sección intro de /vision | 15.84 |
| `vision/visor` | `<div>` que envuelve `VisorAnaliticas` | 13.60 |
| `vision/planificador` | `<div>` que envuelve `PlanificadorIA` | 13.76 |
| `vision/indice` | `section#indice` | 7.44 |
| `vision/cierre` | `section#cierre` | 10.08 |
| `laboratorio/hero` | hero de /laboratorio | 12.32 |
| `laboratorio/modelos` | rejilla «Modelos disponibles» | 6.24 |
| `laboratorio/demo` | `section#demo-stage` | 11.76 |
| `laboratorio/cierre` | CTA final | 9.76 |
| `proyectos/intro` | portada de /proyectos (antes de «Entrar al mapa») | 12.88 |
| `proyectos/mapa` | el mapa (aparece al entrar; el observador lo detecta al montarse) | 11.76 |
| `propuesta/entrevista` | fase inicio → entrevista | 11.12 |
| `propuesta/seguimiento` | fase seguimiento (preguntas a medida) | 7.52 |
| `propuesta/armando` | fase armando | 10.80 |
| `propuesta/lista` | armando → propuesta | 11.68 |
| `propuesta/enviada` | al enviarla a un asesor | 8.56 |
| `puente/1` «Sigamos con el recorrido.» | al retomar tras hablar con Ars | 1.52 |
| `puente/2` «Bueno, retomemos donde íbamos.» | ídem (al azar) | 2.32 |
| `puente/3` «Listo. Sigamos con el recorrido.» | ídem (al azar) | 2.24 |

Los de la Propuesta los dispara `ExperienciaPropuesta.tsx` con `motorNarracion.narrar(id, { inmediato, forzar })` al cambiar de fase (no al restaurar lo guardado en la pestaña). Si la narración está apagada, si Ars (el asistente) está hablando o si hay una conversación en curso, no suenan.

## Camas musicales (reutilizadas, sin generar nada nuevo)

| Ruta | Pista |
|---|---|
| /vision | `/servicios/ambiente/monitoreo-inteligente.mp3` |
| /laboratorio | `/servicios/ambiente/productividad-e-ia.mp3` |
| /proyectos | `/servicios/ambiente/centro-de-operaciones.mp3` |
