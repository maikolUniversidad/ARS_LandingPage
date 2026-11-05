# Narración de Ars · home, /plataforma y hub /servicios

Generado el 4-nov-2026. Guiones en `src/data/narracion/guiones-home.ts`, `guiones-plataforma.ts` y `guiones-servicios-hub.ts`; audio en `public/audio/narracion/<id>.mp3`.

## Cómo se generó

- **Voz:** «Sofía – Confianza & Calidez» (`b2htR0pMe28pYwCY9gnP`), modelo `eleven_v4`, una toma por clip, vía el conector MCP de ElevenLabs.
- **Flow de ElevenLabs:** `1VhTgXKB2AgxaFLEEHjU` («Narración Ars · home, plataforma, servicios»). Ahí están las 35 generaciones originales y 3 transcripciones de control.
- **Texto enviado a la voz = guion**, con dos diferencias que no cambian lo que se oye:
  - En el texto para la voz, «ARS» se escribió «Ars» para que no lo deletreara (solo pasa en `servicios/hero`; los subtítulos conservan «ARS»).
  - Seis clips de apertura/cierre llevan la etiqueta `[warmly]` al inicio (`home/hero`, `home/contacto`, `plataforma/hero`, `plataforma/cierre`, `servicios/hero`, `servicios/cierre`). Las etiquetas no van en los guiones (son los subtítulos).
- **Post-proceso (ffmpeg 9.0.1):** recorte de silencio inicial/final (umbral −50 dB, deja ≤0,15 s), `loudnorm=I=-16:TP=-1.5:LRA=7`, mono, 44,1 kHz, 96 kbps. Los clips originales casi no traían silencio en los bordes, así que la duración apenas cambia. Medido después: ≈ −16,4 LUFS integrado.
- **Pronunciación de «Ars»:** se transcribieron `home/hero`, `plataforma/hero` y `servicios/hero` con Scribe; en los cuatro casos sale «Ars» como una sola palabra de ≈0,5 s (no deletreado). No hizo falta regenerar nada.

## Clips (id → duración final → créditos)

| id | duración (s) | créditos |
|---|---:|---:|
| `home/hero` | 17.12 | 286 |
| `home/fisica` | 17.44 | 263 |
| `home/vision` | 19.36 | 315 |
| `home/iot` | 16.72 | 237 |
| `home/robotica` | 17.36 | 286 |
| `home/central` | 17.68 | 260 |
| `home/traza` | 36.91 | 594 |
| `home/escala` | 17.76 | 267 |
| `home/recap` | 12.37 | 189 |
| `home/contacto` | 15.74 | 253 |
| `plataforma/hero` | 14.64 | 232 |
| `plataforma/en-movimiento` | 12.99 | 208 |
| `plataforma/recorrido` | 10.14 | 160 |
| `plataforma/recorrido/operacion-en-campo` | 9.20 | 146 |
| `plataforma/recorrido/centro-de-operaciones` | 8.53 | 125 |
| `plataforma/recorrido/comunicacion-y-emergencias` | 7.68 | 111 |
| `plataforma/recorrido/monitoreo-inteligente` | 10.08 | 149 |
| `plataforma/recorrido/realidad-virtual` | 7.92 | 121 |
| `plataforma/recorrido/gestion-humana` | 7.28 | 112 |
| `plataforma/recorrido/formacion` | 8.39 | 114 |
| `plataforma/recorrido/finanzas-y-erp` | 13.12 | 188 |
| `plataforma/recorrido/productividad-e-ia` | 10.61 | 157 |
| `plataforma/recorrido/gobierno-y-seguridad` | 9.12 | 135 |
| `plataforma/arquitecto-ia` | 16.72 | 264 |
| `plataforma/ciclo` | 13.23 | 193 |
| `plataforma/pilares` | 14.08 | 220 |
| `plataforma/antes-despues` | 15.19 | 240 |
| `plataforma/cierre` | 10.80 | 200 |
| `servicios/hero` | 15.92 | 250 |
| `servicios/dia` | 16.64 | 257 |
| `servicios/areas` | 14.00 | 200 |
| `servicios/por-que` | 12.72 | 206 |
| `servicios/buscar` | 9.68 | 146 |
| `servicios/canales` | 14.06 | 227 |
| `servicios/cierre` | 10.91 | 187 |
| **Total (35 clips)** | **478.3** | **7448** |

## Costo

- **Estimado** antes del lote (una sola llamada con `estimate_only`, `home/hero`): 286 créditos ≈ US$0,052 por clip de ~290 caracteres (≈ 1 crédito por carácter).
- **Real:** 7.448 créditos ≈ **US$1,35** por los 35 clips (suma de `price_cents` reportados por ElevenLabs). Las 3 transcripciones de control costaron 0 créditos.
- No hubo regeneraciones.

## Notas para quien integre

- `home/traza` dura ≈37 s (narra los seis pasos del evento de las 02:14 a. m.); es el único clip largo, a propósito.
- Los pasos `plataforma/recorrido/<área>` duran 7–11 s; el recorrido automático debería esperar a que termine el clip antes de avanzar (ya lo hace `RecorridoModulos` cuando la narración está encendida).
- Robótica se nombra siempre como «en desarrollo». No se mencionan marcas, clientes, cifras sin respaldo, SLA ni facturación electrónica (RADIAN/DIAN está en piloto).

## Regeneración por posicionamiento ERP (2026-11-04)

`plataforma/recorrido/finanzas-y-erp` se reescribió («Ars también es su ERP… y si ya tiene otros sistemas, todo se centraliza aquí o fluye entre ellos») y se regeneró con la misma voz, modelo y post-proceso (188 créditos). Ver `docs/posicionamiento-erp.md` y la lista completa en `NARRACION-servicios-areas.md`.
