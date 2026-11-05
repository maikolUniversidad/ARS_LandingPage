# Narración de Ars — cómo funciona

Ars narra cada sección mientras la persona recorre el sitio, con música de fondo que reacciona al avance. La persona le puede preguntar algo en cualquier momento, ahí mismo y sin abrir el chat; Ars responde en voz y con avisos pequeños, y después la narración sigue sola.

## Piezas

| Archivo | Qué hace |
|---|---|
| `src/lib/narracion/motor.ts` | Motor Web Audio (singleton `motorNarracion`): voz, camas en bucle, efectos, ducking y limitador maestro (mezcla pensada para el celular). Estado: `encendido`, `esperandoGesto`, `conversando`, `pausada`, `seccion` (capítulo en pantalla)… |
| `src/lib/narracion/contrato.ts` | Ids de cada clip (`IDS_*`), `urlNarracion(id)` y pistas de música. |
| `src/data/narracion/guiones-*.ts` + `index.ts` | Texto de cada clip (también son los subtítulos). |
| `src/components/narracion/NarracionArs.tsx` | Orquestador global (montado en `src/app/layout.tsx`): cama por ruta (`pistaDeRuta`), auto-arranque, arranque con gesto y, según la pantalla, el **panel de escritorio** (abajo a la izquierda) o el **dock móvil**. |
| `src/components/narracion/DockMovil.tsx` | Dock fijo inferior para pantallas táctiles/estrechas (push-to-talk, capítulos, páginas). |
| `src/components/narracion/useConversacionArs.ts` | Conversación corta con Ars dentro de la narración: escucha, pregunta, avisos, repregunta y retoma. |
| `src/components/narracion/AvisosArs.tsx` | Respuestas de Ars como notificaciones pequeñas apiladas. |
| `src/components/narracion/PiezasConversacion.tsx` | Piezas compartidas (campo de texto, rótulos de fase, botón «Escuchar con Ars»). |
| `src/components/narracion/AreaVivo.tsx` | Área en vivo del panel/dock: subtítulo sincronizado de la narración, «Usted: …», «Ars está pensando…» y la frase de la respuesta. |
| `src/components/narracion/OrbeArs.tsx` | Orbe en canvas que pulsa, se deforma y brilla con el nivel real del audio y suelta notas mientras habla. |
| `src/components/narracion/capitulos.ts` | Lista de capítulos (`[data-narracion]`) de la página y salto a cada uno. |
| `src/components/narracion/useNarracion.ts` | Observa `[data-narracion="<id>"]`: la sección que cruza el centro de la pantalla es la que se narra. |
| `src/lib/asistente/consulta.ts` | Puente al **cerebro del asistente**: `Asistente.tsx` registra ahí `consultar()` y la narración pregunta sin abrir el chat. |
| `src/components/servicios/eventos.ts` | Eventos de ventana entre la narración y el asistente. |
| `docs/audio/NARRACION-*.md` | Proceso de generación, costos y duraciones de cada tanda. |

## Activación

- **Encendida por defecto** (voz y música). Al cargar la página `NarracionArs` llama a `motorNarracion.intentarArranqueAutomatico()`: crea el `AudioContext` y lo reanuda sin gesto. Suena de inmediato si el navegador lo permite (Chrome con «engagement» del sitio, Firefox/Safari si la persona autorizó el autoplay; si existe `navigator.getAutoplayPolicy("audiocontext") === "disallowed"` ni se intenta). Chrome puede dejar en consola el aviso (warning) «The AudioContext was not allowed to start» cuando lo bloquea: es esperado.
- Si lo bloquea, el panel muestra **«Ars lista · Toque para escuchar»** y arranca con el **primer gesto que el navegador acepte como activación**. Escuchamos `pointerdown`, `pointerup`, `touchstart`, `touchend`, `keydown`, `click` y `wheel` (en captura) y solo intentamos si `navigator.userActivation.isActive` es verdadero. Por la especificación HTML **sí cuentan**: `keydown` (no Escape), `mousedown`/`pointerdown` con ratón, `pointerup`/`touchend` de un toque (sin scroll) y `click`. **No cuentan**: `touchstart`, `wheel`, `touchmove` ni el scroll. En el celular, por tanto, **el primer scroll con el dedo no puede desbloquear el audio**: arranca con el primer toque (tap) en cualquier parte. Sin la API `userActivation` (navegadores viejos) se intenta con todo menos `touchstart`/`wheel`.
- Los toques sobre el asistente (`[data-asistente-raiz]`) o sobre la X de «Ahora no» (`[data-narracion-ignorar]`) no la arrancan.
- **Minimizar** (–): colapsa a una píldora/orbe pequeño que sigue sonando; se recuerda en `localStorage["ars:narracion-ui"]`.
- **Cancelar** («Ahora no» X, o Apagar ⏻): guarda `encendido: false` en `localStorage["ars:narracion"]`. Desde ahí no vuelve a arrancar sola (ni el auto-arranque); queda el botón «Escuchar con Ars».
- En inglés (`locale === "en"`) y en `/diagnostico`, `/admin` y `/vision-lab` no se muestra. `/diagnostico` tiene su propio reproductor de voz y la narración no suena allí.

## Preguntarle a Ars ahí mismo (sin abrir el chat)

1. **«Preguntarle a Ars»** (panel de escritorio) o **mantener presionado** el botón central del dock móvil llama a `useConversacionArs().empezar()`: `motorNarracion.pausarParaConversar()` corta la voz y deja la música abajo, y se abre el micrófono (`GrabadoraVoz`: Scribe de ElevenLabs si hay clave, si no el reconocimiento del navegador). El orbe se anima con el nivel del micrófono y se ve la transcripción en vivo.
2. La pregunta va al **mismo cerebro del asistente**: `useConsultaArs()` / `obtenerCerebro().consultar()` (`src/lib/asistente/consulta.ts`) ejecuta el `enviar()` de `Asistente.tsx` en modo `silencioso`: mismo contexto de página, perfil, recorrido, historial (queda en el chat), herramientas y persona. Las herramientas que mueven el sitio (`ir_a`, `mostrar_servicio`, `mostrar_analitica`, `resaltar`) funcionan igual, pero **sin abrir ni acoplar el panel**.
3. Ars responde **en voz** (`ReproductorVoz`: ElevenLabs si `voz.tts`, si no `speechSynthesis`) y como **avisos pequeños** (`AvisosArs`): subtítulo de la frase que suena y, al terminar, un resumen corto. Se ocultan solos (6,5–16 s; no mientras el puntero o el foco estén encima). Si la respuesta trae tarjeta (enlace, servicio, analítica) o un enlace interno, el aviso muestra un botón que lo abre; contacto, estimaciones y demás abren el chat completo. Solo la respuesta terminada se anuncia por `aria-live`.
4. **Conversación corta**: en escritorio, al terminar vuelve a escuchar una vez («¿Algo más?»); si la persona no dice nada, retoma. En el dock, espera 6 s a que vuelva a presionar. Se puede interrumpir a Ars mientras habla («Interrumpir y hablar», o toque/mantener en el dock).
5. **Retomar**: «Seguir el recorrido», el silencio o la ventana vencida llaman a `motorNarracion.retomarTrasConversar()`: suena una **frase puente** (`puente/1..3`) y en cola la sección en pantalla.
6. El **chat completo** sigue en el botón flotante de la derecha (y en el menú del dock: «Chat con Ars»); este flujo ya no lo abre. El viejo `ars:asistente { voz: true, origen: "narracion" }` sigue soportado por `Asistente.tsx` (fin por silencio de 4 s / 10 s) por si otro componente lo usa.

Cualquier conversación por voz abierta desde el chat (`ars:conversacion`) también pausa la narración mientras dura.

### Modo de prueba sin micrófono: `?arsTexto=1`

Con `?arsTexto=1` en la URL, «Preguntarle a Ars» / mantener presionado abre un **campo para escribir** la pregunta en vez del micrófono; el resto del flujo (cerebro, voz, avisos, herramientas, repregunta, retomar) es idéntico. Se activa también solo si el micrófono o el reconocimiento fallan («No tengo acceso al micrófono: escríbame la pregunta»). Útil en el navegador integrado de Claude, que bloquea el micrófono.

## Área en vivo y orbe

- **Subtítulo de la narración en el panel/dock** (`AreaVivo` → `SubtituloNarracion`): muestra la frase que suena y va iluminando las palabras al ritmo del clip. `motorNarracion.progresoVoz()` da segundos transcurridos y duración real del buffer; el avance se reparte por caracteres (un pelo adelantado, sin la cola de silencio) y solo re-renderiza al cambiar de palabra. Al preguntar, esa misma área pasa a la transcripción de la persona.
- **Envío automático, sin botón de enviar**: al soltar el push-to-talk (dock) o cuando la persona calla (escritorio, corte por silencio de `GrabadoraVoz`), la pregunta sale sola. Se ve la burbuja **«Usted · …»** y luego **«Ars está pensando»** con puntos animados, en el área y en el aviso. (El campo de texto con botón solo existe en modo `?arsTexto=1` o sin micrófono.)
- **Orbe** (`OrbeArs`): con el nivel real — `motorNarracion.nivel()` durante la narración, `ReproductorVoz.nivel()` en las respuestas (analizador real con ElevenLabs; con `speechSynthesis` el navegador no expone audio y el nivel es sintético), el micrófono al escuchar. Pulsa (radio), se deforma (armónicos que crecen con el nivel), brilla (halo + `shadowBlur`) y le brotan **notas** (♪ ♫ ♩ •) mientras habla. Cian con anillos al escuchar, brillo que gira al pensar. Con `prefers-reduced-motion`: sin deformación ni partículas, a 4 fps.

## Dock móvil

En `(max-width: 767px), (pointer: coarse) and (max-width: 1024px)` el panel flotante se reemplaza por un **dock fijo inferior** (respeta `env(safe-area-inset-bottom)`):

- Fila superior: subtítulo (narración, transcripción o estado), música on/off, minimizar, apagar (o «Ahora no» antes de arrancar).
- Fila inferior: capítulo anterior · menú de capítulos (los `[data-narracion]` visibles, con su encabezado) · **botón grande de Ars** · menú de páginas (Inicio, Servicios, Plataforma, Visión, Propuesta y contacto + «Chat con Ars» y voz on/off) · capítulo siguiente.
- **Botón de Ars**: mantener presionado (≥ 260 ms) = **push-to-talk** (pausa y escucha; al soltar envía y Ars responde ahí mismo). Toque corto = pausar/reanudar la narración (`motorNarracion.pausar()` / `reanudar()`, la música sigue); en plena conversación, el toque corta a Ars mientras habla o vuelve al recorrido. Teclado: **mantener Espacio** sobre el botón = hablar; Enter = toque. `aria-pressed` = escuchando. Háptica corta (`navigator.vibrate`) al empezar y terminar de escuchar, solo si la página ya tuvo activación.
- Mientras el dock está desplegado, `<html data-ars-dock>`: el `BotonFlotante` del asistente se oculta (el chat está en el menú) y el `body` deja `7rem` libres abajo para que el dock no tape el final de la página (p. ej. la Propuesta ARS). Minimizado, el dock es una píldora a la izquierda y el botón flotante vuelve.

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
