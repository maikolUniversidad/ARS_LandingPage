# Narración de Ars — cómo funciona

Ars narra cada sección mientras la persona recorre el sitio, con música de fondo que reacciona al avance. La persona le puede preguntar algo por voz en cualquier momento y después la narración sigue sola.

## Piezas

| Archivo | Qué hace |
|---|---|
| `src/lib/narracion/motor.ts` | Motor Web Audio (singleton `motorNarracion`): voz, camas en bucle, efectos, ducking y limitador maestro (mezcla pensada para el celular). |
| `src/lib/narracion/contrato.ts` | Ids de cada clip (`IDS_*`), `urlNarracion(id)` y pistas de música. |
| `src/data/narracion/guiones-*.ts` + `index.ts` | Texto de cada clip (también son los subtítulos). |
| `src/components/narracion/NarracionArs.tsx` | Panel global abajo a la izquierda (montado en `src/app/layout.tsx`), cama musical por ruta (`pistaDeRuta`) y arranque con el primer gesto. |
| `src/components/narracion/useNarracion.ts` | Observa `[data-narracion="<id>"]`: la sección que cruza el centro de la pantalla es la que se narra. |
| `src/components/servicios/eventos.ts` | Eventos de ventana entre la narración y el asistente. |
| `docs/audio/NARRACION-*.md` | Proceso de generación, costos y duraciones de cada tanda. |

## Activación

- **Encendida por defecto** (voz y música). Los navegadores no dejan sonar audio sin un gesto, así que al entrar el panel muestra **«Ars lista · Toque para escuchar»** (orbe con pulso; sin animación con `prefers-reduced-motion`).
- El **primer gesto en cualquier parte de la página** (`pointerdown`, `touchend`, `keydown` o `click`, en captura) llama a `motorNarracion.arrancarConGesto()`. Solo enciende si el `AudioContext` quedó en `running`. Soltar el dedo tras un scroll en el celular no cuenta como gesto, así que la escucha sigue hasta el siguiente. Los toques sobre el asistente (`[data-asistente-raiz]`) o sobre la X de «Ahora no» (`[data-narracion-ignorar]`) no la arrancan.
- **«Ahora no» (X)** o **Apagar (⏻)** guardan `encendido: false` en `localStorage["ars:narracion"]`. Desde ahí no vuelve a arrancar sola; queda el botón «Escuchar con Ars».
- En inglés (`locale === "en"`) y en `/diagnostico`, `/admin` y `/vision-lab` no se muestra. `/diagnostico` tiene su propio reproductor de voz y la narración no suena allí: al entrar se calla la voz y la cama se apaga.

## Preguntarle a Ars en medio de la narración

1. El botón **«Preguntarle a Ars»** (micrófono) del panel llama a `motorNarracion.pausarParaConversar()`: corta la voz, deja la música abajo y recuerda la sección en pantalla. Luego dispara `ars:asistente` con `{ voz: true, origen: "narracion" }`.
2. El asistente (`Asistente.tsx`) se abre en voz: **tiempo real** (agente de ElevenLabs) si está configurado, si no **manos libres** (TTS/STT del servidor o del navegador). Avisa `ars:conversacion { activa: true, origen }`.
3. **Fin de la conversación** (cualquiera de estos):
   - Ars terminó de responder y la persona no habla en **4 s** (10 s si Ars aún no ha dicho nada). El panel se cierra solo.
   - La persona cierra el panel del asistente.
   - La persona toca **«Terminar y seguir el recorrido»** en el panel de narración (dispara `ars:terminar-conversacion`).
   - Si no hay micrófono, el panel queda abierto para escribir y la narración sigue en pausa hasta que se cierre.
4. El asistente avisa `ars:conversacion { activa: false }` y el motor llama a `retomarTrasConversar()`: suena una **frase puente** al azar (`puente/1..3`, por ejemplo «Sigamos con el recorrido.») y en cola **la sección que está en pantalla**.

Cualquier conversación por voz con Ars (aunque se abra desde su propio botón) pausa la narración mientras dura; el fin automático por silencio solo aplica a la que vino de la narración. Mientras Ars habla, `ars:voz-activa` sigue bajando la música (ducking).

## Agregar una sección narrada

1. **Id**: agréguelo al contrato (`src/lib/narracion/contrato.ts`), con la forma `ruta/seccion`.
2. **Guion**: en `src/data/narracion/guiones-<ruta>.ts` (registre el objeto en `index.ts`). Trato de usted, primera persona de Ars, 1–3 frases (8–18 s), «Ars» para la asistente y nada de lo prohibido en `src/lib/asistente/prompt.ts`.
3. **Marcado**: `data-narracion="<id>"` en la sección (un elemento con caja: no sirve `display: contents`). Para pasos que no dependen del scroll, llame a `motorNarracion.narrar(id, { inmediato: true, forzar: true })`.
4. **Ruta nueva**: súmela a `RUTAS_NARRADAS` y elija su cama en `pistaDeRuta` (`NarracionArs.tsx`).
5. **Audio**: genérelo con el conector de ElevenLabs (`creative_generate_speech`, voz `b2htR0pMe28pYwCY9gnP`, `eleven_v4`, 1 toma; antes, `estimate_only`). Descárguelo desde `creative_get_generations` → `full_res_url` y normalícelo:

   ```bash
   ffmpeg -i crudo.mp3 -af "loudnorm=I=-16:TP=-1.5:LRA=7" -ac 1 -ar 44100 -b:a 96k -map_metadata -1 public/audio/narracion/<id>.mp3
   ```

6. Anote ids, duraciones y costo en `docs/audio/`.
