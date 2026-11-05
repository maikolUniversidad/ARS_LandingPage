# Asistente IA «Ars»

Guía de IA que acompaña a la persona en todo el sitio: explica, muestra y lleva a la sección correcta. Funciona por texto (Claude, con streaming) y por voz (ElevenLabs), entiende documentos, imágenes y video, y recuerda a la persona. Las pautas de diseño y sus fuentes están en [`asistente-diseno.md`](./asistente-diseno.md).

## Piezas

| Capa | Archivos |
|---|---|
| UI (montada en `src/app/layout.tsx`) | `src/components/asistente/` — `Asistente` (estado, acciones, voz), `PanelAsistente`, `PiezasPanel`, `BotonFlotante`, `OrbeArs`, `OrbeVoz`, `EstilosChat`, `tema.ts`, `Tarjetas`, `bloques/`, `FormularioContacto`, `TextoRico` |
| Lógica cliente | `src/lib/asistente/` — `cliente.ts` (stream NDJSON + historial en `localStorage`), `contexto-pagina.ts` (ruta, sección visible, analítica abierta), `acciones.ts` (scroll + resaltado), `adjuntos.ts` (PDF/imagen/texto/video; redimensiona imágenes y muestrea fotogramas de video en el navegador), `voz.ts` (TTS por frases con subtítulos, Scribe en tiempo real con texto parcial, interrupción por voz, respaldo del navegador), `memoria.ts` (perfil, recorrido y resumen de conversaciones largas), `voz-agente.ts` (agente ElevenLabs en tiempo real), `i18n.ts` (claves `asistente.*`, ES/EN) |
| Lógica servidor | `src/lib/asistente/` — `prompt.ts` (system prompt estable + base de conocimiento, cacheado), `herramientas.ts` (tools y su validación), `servidor.ts` (config, límites, validación), `simulado.ts` (modo demo solo en desarrollo) |
| API | `src/app/api/asistente/` — `chat` (POST, streaming NDJSON), `estado` (qué está configurado), `tts`, `stt` (por lotes), `stt-token` (token de un solo uso para Scribe en tiempo real), `voz-sesion` (URL firmada + prompt para el agente) |
| Conocimiento | `src/data/asistente/` — ver su `README.md` para ampliarlo |

## Cómo funciona

- **Chat**: `POST /api/asistente/chat` → `responder()` en `src/lib/asistente/proveedores/`, que recorre los proveedores con clave en el orden de `ASISTENTE_PROVEEDORES` y pasa al siguiente si uno falla antes de enviar texto:
  - **Claude** (`anthropic.ts`, destino `claude`; `ASISTENTE_MODELO`, por defecto `claude-sonnet-5-5`): streaming, `effort` bajo (medio con adjuntos), *fallback* de servidor para rechazos, caché de prompt (herramientas + system con la base de conocimiento, TTL 1 h; conversación con caché automática) y citas en documentos.
  - **DeepSeek** (`anthropic.ts`, destino `deepseek`; `deepseek-flash`): el mismo SDK contra `https://api.deepseek.com/anthropic`. Sin betas ni bloques `document` (los textos viajan como texto), sin razonamiento en la charla para responder rápido. Lee imágenes y fotogramas; **no PDF**, así que con un PDF adjunto se salta.
  - **GPT** (`openai.ts`; `gpt-5.5`): API de Responses en streaming, mismas herramientas como `function`, `store: false` con razonamiento cifrado entre vueltas y `prompt_cache_key`. Lee PDF (`input_file`), imágenes y fotogramas.
  - El contexto de página y los documentos van siempre en el último mensaje, después del prefijo estable que se cachea.
- **Herramientas**: `ir_a`, `mostrar_analitica`, `abrir_contacto`, `resaltar`, `recomendar`, `recordar`, `olvidar`, `analizar_video`, `sugerir`, `buscar_analiticas`, `mostrar_servicio` y `buscar_servicios` (estas dos para /servicios). El servidor las valida (rutas, anclas e ids reales) y emite eventos `accion`/`tarjeta` que el navegador ejecuta.
- **Memoria**: el widget vive en el layout raíz (sobrevive a la navegación) y guarda en `localStorage`: el historial (`ars-asistente-v1`), el perfil que la persona contó (`ars-asistente-perfil-v1`, visible y borrable en el panel) y su recorrido (`ars-asistente-recorrido-v1`). En charlas largas, los mensajes antiguos viajan condensados. Los documentos solo se guardan en memoria mientras dura la sesión.
- **Documentos y video**: PDF y texto con citas («Fuentes del documento»), imágenes redimensionadas a 1568 px y video muestreado en el navegador en 4 a 12 fotogramas de 768 px, cada uno con su marca de tiempo; como máximo 4 a la vez y 3 MB en total, para quedar por debajo de los 4.5 MB por petición de Vercel. No se guardan en el servidor.
- **Voz**:
  - *Manos libres*: transcribe en vivo con Scribe Realtime (subtítulos mientras hablas; si falla, graba y transcribe por lotes), corta tras ~1.1 s de silencio, responde Claude y lo lee con TTS de ElevenLabs por frases (con precarga). Al terminar vuelve a escuchar. Si hablas encima o tocas el orbe, Ars se calla al instante. Si falta ElevenLabs, usa el reconocimiento y la voz del navegador.
  - *Tiempo real* (si existe `ELEVENLABS_AGENT_ID`): el agente de ElevenLabs con las mismas herramientas como *client tools* (`ir_a`, `mostrar_analitica`, `mostrar_servicio`, `resaltar`, `abrir_contacto`; también hay que declararlas en la configuración del agente en ElevenLabs). El servidor le envía el mismo prompt y la misma base de conocimiento como *override*, y cada cambio de página llega al agente como *contextual update*.

## Abrir el asistente desde otro componente

```ts
window.dispatchEvent(new CustomEvent("ars:asistente", { detail: { mensaje: "Quiero una demo" } }));
// o { detail: { voz: true } } para abrir directamente en modo voz
```

## Eventos con las páginas de /servicios

Definidos en `src/lib/asistente/eventos-servicios.ts`:

- `ars:foco-servicio` (asistente → página) `{ modulo?, foco? }`: desplazar a `<section id={modulo}>` y volar la escena 3D.
- `ars:preguntar` (página → asistente) `{ texto, modulo? }`: abre el panel y envía el texto con el módulo como contexto.
- `ars:voz-activa` (asistente → sitio) `{ activa }`: Ars empezó o dejó de hablar (atenuar la música ambiente).

## Respuestas ricas: protocolo de bloques (v2)

Ars no responde con burbujas planas: cada respuesta es **texto que aparece en streaming + bloques visuales**. Los bloques viajan por el mismo stream NDJSON de siempre, como eventos `tarjeta`, así que el protocolo es **retrocompatible**: no hay eventos nuevos, solo tipos nuevos de `Tarjeta` (`src/lib/asistente/tipos.ts`) y campos opcionales en los existentes. Un cliente antiguo ignora lo que no conoce.

```
{"t":"texto","d":"Claro, te llevo a las rondas…"}
{"t":"accion","accion":{"tipo":"mostrar_servicio","area":"operacion-en-campo","modulo":"rondas-qr"}}
{"t":"tarjeta","tarjeta":{"tipo":"servicio", …}}
{"t":"tarjeta","tarjeta":{"tipo":"pasos","titulo":"Cómo funciona una ronda","pasos":[…]}}
{"t":"fin","motivo":"end_turn"}
```

### Quién arma qué

La IA **nunca** entrega URLs de medios ni HTML: llama herramientas con ids del catálogo, números y textos cortos; el servidor valida y arma la tarjeta con rutas reales (`src/lib/asistente/bloques.ts` y `herramientas.ts`). Las herramientas nuevas van **al final** de `HERRAMIENTAS` para no invalidar la caché de prompt. Cuándo usar cada bloque lo dice la sección «Bloques visuales» de `prompt.ts`.

| Bloque (`tipo`) | Lo produce | Datos | Se ve como |
|---|---|---|---|
| texto | stream `texto` | Markdown simple | Texto con línea de acento y cursor mientras llega |
| `servicio` | `mostrar_servicio`, `recomendar.servicios` | área, módulo, frase, estado, primera captura | Tarjeta con captura real, estado y botón **«Llévame»** (mueve la página y la escena 3D) |
| `analitica` (+`evidencia`) | `mostrar_analitica`, `recomendar.analiticas`, `analizar_video` | id + `evidencia { video?, poster?, imagen?, chapa, ia? }` del catálogo | Video de evidencia **en bucle** (silenciado, solo corre a la vista), rótulos **«Ejemplo de evidencia»** y, si `ia`, **«Generado con IA»**; «Llévame» abre el visor |
| `galeria` | `mostrar_galeria { titulo, servicios[], analiticas[] }` | capturas y clips de módulos, evidencias de analíticas (máx. 8) | Carrusel con *scroll snap*, flechas y teclado (←/→), cada elemento con «Llévame» |
| `grafico` | `mostrar_grafico { forma, titulo, unidad?, datos[], estimado, supuestos[], fuente? }` | 2 a 8 puntos numéricos | SVG animado (barras, línea o donut). **Sin `fuente` siempre se rotula «Estimado»** y muestra los supuestos + «Cifras orientativas» |
| `pasos` | `mostrar_pasos { titulo, pasos[{ titulo, detalle?, destino? }] }` | `destino` = `{modulo}`, `{area}`, `{analitica}`, `{ruta, ancla?}` o `{ancla}` (página actual) | Lista numerada; tocar un paso navega, resalta y hace scroll suave, y queda marcado como visto |
| `antes_despues` | `comparar_antes_despues { titulo, filas[{aspecto, antes, despues}], nota?, estimado? }` | 2 a 6 filas | Dos columnas «Antes» / «Con ARS» |
| `enlace` con `navegado: true` | `ir_a` | ruta + ancla | Bloque **«Te llevo a…»** con «Volver ahí» (los de `recomendar` siguen siendo enlaces normales) |
| `estimacion`, `comparacion`, `resumen_visita`, `hallazgos`, `contacto`, `sugerencias` | herramientas existentes | — | Tarjetas de siempre (`extra/TarjetasExtra.tsx`), con la misma entrada animada |

Validación (servidor): ids inexistentes se descartan y, si no queda nada, la herramienta devuelve error a la IA para que corrija; textos recortados; números finitos; donut sin negativos; `destino` resuelto contra el mapa del sitio y el catálogo (si no existe, el paso queda sin destino).

### Agregar un bloque nuevo

1. Tipo en `tipos.ts` (unión `Tarjeta`).
2. Definición + ejecutor en `bloques.ts` (`HERRAMIENTAS_BLOQUES`, `ejecutarBloque`).
3. Componente en `src/components/asistente/bloques/Bloques.tsx` y su rama en `Tarjetas.tsx`.
4. Cuándo usarlo en la sección «Bloques visuales» de `prompt.ts`.

## Diseño del chat (orbe, panel, movimiento)

- **Tokens y variantes**: `src/components/asistente/tema.ts` — `VARIANTES_ORBE` (`marca`, `capas`, `calido`), `VARIANTE_ORBE` (la activa), `COLOR_ESTADO` (reposo / escuchando / pensando / hablando) y `SERIES` (colores de los gráficos).
- **Orbe** (`OrbeArs.tsx`, CSS puro): respira en reposo, se enciende al pasar el cursor (`.group:hover`), ondas al escuchar, anillo veloz al pensar, pulso al hablar. Se usa en el botón flotante, la cabecera, la bienvenida, la hoja guía móvil y el indicador de pensamiento.
- **Animaciones** (`EstilosChat.tsx`, montado por `BotonFlotante`): apertura del panel como expansión circular desde el orbe (`clip-path`), llegada escalonada de bloques (`.ars-bloque`, `--retraso`), texto con brillo al pensar y barra de escaneo, crecimiento de barras/trazos/arcos. **Todo** está dentro de `prefers-reduced-motion: no-preference`; con movimiento reducido los videos arrancan pausados (botón ▶).
- **Panel** (`PanelAsistente.tsx`): escritorio flotante amplio (480 px) o acoplado a la derecha (modo guía, 380 px) cuando Ars mueve la página; móvil = hoja inferior casi a pantalla completa con asa, que al navegar se pliega a la hoja guía compacta (`guia/HojaGuia.tsx`) para que la persona mire la página mientras sigue la conversación. Cabecera viva con estado (`aria-live`), línea **«Estás en: página · sección»** y **rastro** de las paradas recientes (`PiezasPanel.tsx`, migas tocables), sugerencias por página (vacío: rejilla; luego, fila desplazable si Ars no dejó respuestas rápidas), entrada de texto + micrófono.
- **Accesibilidad**: `role="log"` en la conversación, estado y anuncios con `aria-live`, foco al abrir y devuelto al orbe al cerrar, Esc cierra, gráficos con `role="img"` y resumen de datos, carrusel navegable con teclado, pasos con `aria-current="step"`.

## Variables de entorno

Ver la sección «Asistente IA» al final de `.env.example`. Para probar la UI sin claves en desarrollo: `ASISTENTE_DEMO=1` en `.env.local`.

## Avatar «Ars»

Ars se muestra como una **esfera de luz abstracta**, cian sobre azul marino, con dos puntos cálidos que se leen como una mirada amable. No imita a ninguna persona. Se generó con ElevenLabs Creative: imagen con `gpt-image-2.5-sunburst` y loop con `bytedance-seedance-v2-mini` a 480p, 5 s y sin audio, usando la misma imagen como primer y último fotograma. Después se recortó a cuadrado y se cerró la costura con un fundido de 0.4 s (ffmpeg).

| Archivo (`public/asistente/`) | Uso | Peso |
|---|---|---|
| `ars-avatar.avif` / `ars-avatar.webp` (512 px) | Póster estático (movimiento reducido o si falla el video) | 29 / 34 KB |
| `ars-avatar-128.webp` | `AvatarMini` (encabezado, botón) | 4 KB |
| `ars-reposo.webm` / `ars-reposo.mp4` (360 px, 4.7 s, en loop) | Loop de reposo | 116 / 133 KB |
| `ars-reposo-poster.webp` | Primer fotograma del loop (`poster` del `<video>`) | 15 KB |

- **`AvatarArs`** (`src/components/asistente/AvatarArs.tsx`) reproduce el loop. Su velocidad cambia con la fase: 1.6× pensando y 1.25× hablando. Encima lleva un brillo que sigue al nivel de audio: cian al escuchar y cálido al hablar. Con `prefers-reduced-motion`, o si el video no carga, muestra el póster.
- **`OrbeVoz`** monta el avatar dentro de sus anillos cuando `tamano >= 96`, es decir, en el escenario de voz. En ese caso no dibuja el núcleo. Para forzarlo o quitarlo, usa la prop `avatar`.
- **`AvatarMini`** sirve para el encabezado del panel y el botón flotante. Muestra la imagen fija con un aro que cambia según la fase. Con `animado`, reproduce el loop.

```tsx
import { AvatarMini } from "./AvatarArs";
// Encabezado del panel (en lugar de <OrbeVoz … tamano={36} />)
<AvatarMini fase={vozOn ? p.faseVoz : "inactivo"} tamano={36} />
// Botón flotante (en lugar de <OrbeVoz … tamano={60} className="relative" />)
<AvatarMini fase={vozActiva ? faseVoz : "inactivo"} tamano={56} animado className="relative" />
```
