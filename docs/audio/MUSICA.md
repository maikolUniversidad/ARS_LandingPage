# Música de fondo y efectos de la narración

Archivos de `MUSICA` (`src/lib/narracion/contrato.ts`) en `public/audio/musica/`. Generados con ElevenLabs el 2026-11-04 y masterizados con ffmpeg para sonar **debajo de la voz de Ars en un celular**.

- **Flow de ElevenLabs:** `bH1Wt0FQzBtkR2tPhLJs` («ARS – música narración (home, plataforma, sfx)»)
- **Modelos:** camas `eleven_music_v2_5` (instrumental, 104 s, 2 tomas c/u); efectos `eleven_text_to_sound_v2` (1 toma, `prompt_influence` 0.6)
- **Formato final:** MP3 estéreo, 44,1 kHz, 128 kbps CBR

## Resumen

| Archivo | Uso | BPM | Tonalidad | Duración | LUFS (I) | Pico |
|---|---|---|---|---|---|---|
| `home.mp3` | Cama de la home (loop) | 90 | Re (quinta Re–La, color de Re menor) | 96,000 s = 36 compases | −20,0 | −6,9 dBFS |
| `home-pulso.mp3` | Capa rítmica de la home (loop, traza/escala) | 90 | Sin tono (percusión) | 96,000 s = 36 compases | −20,0 | −3,3 dBFS |
| `plataforma.mp3` | Cama de /plataforma (loop) | 100 | Fa mayor (relativo de Re menor) | 96,000 s = 40 compases | −20,0 | −6,0 dBFS |
| `sfx-transicion.mp3` | Barrido entre capítulos | — | Ruido filtrado (sin tono) | 1,36 s | −18,1 | −4,9 dBFS |
| `sfx-ping.mp3` | Se enciende una capa / evento | — | Re5 (587 Hz, −2 cents) | 0,88 s | −18,0 | −5,1 dBFS |
| `sfx-cierre.mp3` | Evento cerrado / CTA final | — | La mayor → Fa‑Sol‑La (resuelve sobre Re menor) | 2,20 s | −18,0 | −6,9 dBFS |

Sonoridad medida con `ffmpeg -af ebur128=peak=true` sobre los MP3 finales. Las pistas ambiente existentes de /servicios (`public/servicios/ambiente/*.mp3`) miden −19,8 a −20,6 LUFS, así que estas camas están al mismo nivel.

## Para el motor (Web Audio)

- **`home.mp3` y `home-pulso.mp3` tienen exactamente las mismas muestras (4 233 600 a 44,1 kHz) y el mismo punto de inicio en la rejilla.** Si se arrancan en el mismo `start(t)`, quedan en fase indefinidamente. El primer pulso cae en ~0 s y hay un pulso cada 0,6667 s (compás de 2,6667 s).
- Loop: el crossfade de cierre ya está horneado en los primeros 2,67 s (home) / 2,4 s (plataforma). Basta con `AudioBufferSourceNode.loop = true`; no hace falta fundido extra.
- **Relleno del MP3:** ffmpeg, Chrome y Firefox recortan el retardo del codificador gracias a la cabecera LAME, y el buffer decodificado mide 96,000 s. Si algún navegador (Safari antiguo) entrega un buffer más largo, fija `loopStart = 0` y `loopEnd = 96` para que la vuelta siga siendo exacta.
- Cuantizar los cambios a pulso o compás: home a 90 BPM (0,6667 s), plataforma a 100 BPM (0,6 s).
- Energía en la banda de la voz (300 Hz–3 kHz), en % de la potencia total: home 11 %, plataforma 20 %, pulso 6 %. El resto está por debajo de 300 Hz, donde el paso‑bajo del motor puede abrir sin tapar a Ars.

## Procesado (ffmpeg 9.0.1)

Camas:
1. Remuestreo a 44,1 kHz → `highpass=f=35` → `equalizer=f=1732:t=o:w=1.58:g=-3` (−3 dB de 1 a 3 kHz, centrado en 1,73 kHz) para dejar hueco a la voz.
2. Corte a compases enteros, con precisión de muestra. Se salta el primer compás del crudo y el inicio cae sobre un pulso detectado: home y pulso desde 2,990 s, plataforma desde 2,981 s. Duración: 36 compases a 90 BPM o 40 a 100 BPM (96 s en los dos casos).
3. Crossfade de loop de 1 compás: el compás que sigue al corte se funde (sale) sobre el primer compás (entra). Así, el final del archivo empalma con su continuación natural. Curva `qsin` en las camas tonales y `tri` en la percusión, porque está correlada y en fase y así se evita el abombamiento de +3 dB.
4. Ganancia lineal hasta I = −20 LUFS, medida después de codificar a MP3 y corregida. Se usa ganancia lineal y no `loudnorm` dinámico para no alterar la dinámica ni la costura. TP < −2 dBTP en todos.

Efectos: 44,1 kHz → `highpass=f=35` → fade‑in de 5 ms y fade‑out de 60 ms (sin clics) → ganancia lineal a I = −18 LUFS (TP < −2). Sin la muesca de 1–3 kHz, porque son cortos y deben oírse. El cierre se bajó **−116 cents** con `rubberband=pitch=0.9351`. En crudo empezaba en Si♭ mayor y acababa en un racimo de tonos enteros (Fa#, Sol#, La#) que chocaba con Re menor. Bajado, todas las parciales caen afinadas: abre en La mayor (V de Re menor) y resuelve en Fa‑Sol‑La.

Verificación de la costura (decodificando el MP3 final): el salto de muestra entre el final y el inicio es 0,007 / 0,002 / 0,004 (home / pulso / plataforma). Los saltos normales dentro de la pista llegan a 0,055 / 0,275 / 0,034 (percentil 99,9). El RMS en ±1 s alrededor de la vuelta queda dentro del rango del resto de la pista. No hay clic ni bache.

## Selección de tomas

| Pista | Toma elegida (generation_id) | Descartada | Motivo |
|---|---|---|---|
| home | A `tMvvoaoD7DRIji26HXWp` | B `uCxCmoGFLc1VWLgOpAxI` | A tiene pulso detectado limpio a 90,0 BPM (B daba ~120) y la mitad de energía en la banda de voz (11 % frente a 20 %). |
| home-pulso | A `e4AGlAxw8xoJ8MAyXOvE` | B `Mvyo9AdGzWaOWAyWesLK` | A tiene hi‑hats y ticks audibles en el altavoz del celular. B era 94 % sub‑bombo (<120 Hz), inaudible en el teléfono. A además arranca en la misma fase que home‑A (0,323 s). |
| plataforma | B `6bX0dBDf4QZIKmBuX9wG` | A `6aa9JLomLxiNsYRNieMm` | B está en Fa mayor (lo pedido, correlación 0,93) con envolvente estable. A tenía un bajón de −13 dB hacia 80 s y se iba a Re menor. |
| sfx-transicion | `XGMhT67wHHCeBRh6LXYW` | — | — |
| sfx-ping | `4ICaQCaxUXIIEindCkVD` | — | Salió en Re5 exacto. |
| sfx-cierre | `MLI2zalhQmQ24xuQvvdG` | — | Reafinado (ver arriba). |

Nodos del flow: home `xWY576M9a4E3Ygu20Bku`, home‑pulso `bX6014z111pSyLjvVN1T`, plataforma `VAHi6H3MvQKpX4VGWv8P`, transición `trAJxP4uX9Nh7d2StZzj`, ping `JAP9RNVZl0QsLk7XuPSF`, cierre `ba28EBf9ThBgVHjtRCSh`.

## Prompts

**home** (`duration_seconds` 104, instrumental):
> Instrumental atmospheric cinematic electronic background bed, strictly 90 BPM, key of D minor, steady tempo throughout. Warm analog synth pads, a subtle soft arpeggio in the high register, a smooth round sub bass. Elegant, technological, trustworthy, nocturnal city security control room mood. No vocals, no choir, no lead melody, sparse midrange (leave space for a spoken voice-over between 300 Hz and 3 kHz). Constant energy with no big build, no intro fade, no ending or fade-out, so it loops seamlessly.

**home-pulso** (`duration_seconds` 104, instrumental):
> Percussion-only electronic rhythm layer, strictly 90 BPM, steady four-on-the-floor grid. Muted soft kick, gentle closed hi-hats, subtle electronic pulse ticks and shaker. Drums and percussion only: no pads, no bass, no chords, no melody, no tonal or pitched instruments, no vocals. Constant pattern, no fills, no intro, no ending, loops seamlessly. Cinematic tech, restrained and tight.

**plataforma** (`duration_seconds` 104, instrumental):
> Instrumental atmospheric cinematic electronic background bed, strictly 100 BPM, key of F major (relative brightness to D minor), steady tempo. Brighter and more in motion: shimmering warm pads, a flowing soft pulsing arpeggio in the high register, smooth sub bass, light ticking electronic percussion. Elegant, optimistic, technological platform showcase mood. No vocals, no lead melody, sparse midrange (leave space for a spoken voice-over between 300 Hz and 3 kHz). Constant energy, no intro fade, no ending or fade-out, loops seamlessly.

**sfx-transicion** (`duration_seconds` 1.4):
> Soft smooth digital whoosh sweep transition, airy filtered noise rising and passing, clean modern UI, subtle and elegant, no impact

**sfx-ping** (`duration_seconds` 0.9):
> Single clean soft interface ping, pure sine bell tone on the note D, gentle attack, short shimmering decay, high-tech security system notification

**sfx-cierre** (`duration_seconds` 2.2):
> Subtle resolving confirmation chime, two soft ascending synth tones resolving to D, warm airy tail, calm "incident resolved" interface sound, elegant and reassuring

## Costo

| Lote | Estimado (`estimate_only`) | Cobrado |
|---|---|---|
| 3 camas × 2 tomas (104 s) | 17 160 créditos (US$3,12) | 6 × 1 559,65 = **9 357,9 créditos (≈ US$1,70)** |
| 3 efectos × 1 toma | 49,5 créditos (US$0,009) | 4,67 + 3,00 + 7,33 = **15,0 créditos (≈ US$0,003)** |
| **Total** | | **≈ 9 373 créditos (≈ US$1,70)** |

No se relanzó ninguna generación.
