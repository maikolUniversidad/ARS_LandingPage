# Diseño conversacional del asistente «Ars»

Guías y buenas prácticas revisadas en noviembre de 2026, qué se adoptó en el código y qué queda pendiente. La arquitectura está en [`ASISTENTE.md`](./ASISTENTE.md).

## 1. Conversación (texto)

| Pauta | Fuente | Dónde está en Ars |
|---|---|---|
| Un único punto de entrada, disponible en todas las páginas, con la conversación conservada al navegar | NN/g, *10 Guidelines for Site AI Chatbots* | Widget en el layout raíz; historial en `localStorage` (`cliente.ts`) |
| Mensaje inicial que dice lo que el bot sabe hacer **según la página** | NN/g | `bienvenida` en `Asistente.tsx` (portada, `/vision`, `/plataforma`, `/proyectos`, laboratorio) |
| Preguntas sugeridas al inicio **y después de cada respuesta** | NN/g | Chips por página al inicio. Tras cada respuesta, la herramienta `sugerir` (2–3 respuestas rápidas que propone el modelo) |
| Respuestas cortas y escaneables, salvo que pidan detalle | NN/g, *Less Chat, More Answer* | Prompt «Cómo hablas»: corto por defecto; completo y estructurado para análisis, documentos o video |
| No arrastrar el scroll mientras llega el texto | NN/g | El panel solo sigue el final si la persona ya estaba abajo, y muestra la flecha «↓» si subió (`PanelAsistente.tsx`) |
| Guardar o compartir respuestas | NN/g | Botón **Copiar** en cada respuesta |
| Entrada por voz | NN/g | Modo voz (manos libres y tiempo real) |
| Escalera de reparación: reformular, luego dar opciones y a la tercera ofrecer una persona | Google Conversation Design, *Errors* | Prompt «Errores y casos difíciles» + `sugerir` + `abrir_contacto` |
| Confirmación implícita al navegar, explícita al enviar datos | Práctica común (no verificada en NN/g) | Navegar: «Te llevé a…». Contacto: formulario con botón Enviar |
| Pocos pasos: pedir los datos relacionados de una vez | MITRE Chatbot Accessibility Playbook 4.2.6 | El formulario de contacto pide todo en una sola tarjeta y llega con el motivo ya escrito |
| Descubrir la necesidad con **una** pregunta a la vez y recordar lo que la persona cuenta | Diseño propio con base en lo anterior | Herramientas `recordar` y `olvidar`; panel «Lo que recuerdo de ti» con borrado (`memoria.ts`) |

## 2. Accesibilidad

- La conversación es `role="log"` con `aria-busy` mientras llega el texto. Los fragmentos del stream **no** pasan por una región *live*: hay una región `role="status"` aparte que anuncia la respuesta terminada (MITRE 4.4.8 y el artículo *Streaming tokens meet the screen reader*, que es un blog técnico).
- Panel `role="dialog"` con título. `Esc` lo cierra, el foco vuelve al botón flotante y todo se maneja con teclado. Botones con `aria-label` y anillo de foco visible.
- `prefers-reduced-motion`: el orbe se dibuja a baja cadencia y sin ondulación, el scroll no es suave y las animaciones de entrada se desactivan.
- Subtítulos de voz siempre visibles en el panel, para quien no puede o no quiere oír.

## 3. Voz

| Pauta | Fuente | En Ars |
|---|---|---|
| Subtítulos en vivo: el texto parcial se va reemplazando por el definitivo | ElevenLabs Scribe Realtime | `GrabadoraVoz.escucharTiempoReal()` usa `scribe_v2_realtime`, con un token de un solo uso emitido por el servidor (`/api/asistente/stt-token` → `POST /v1/single-use-token/realtime_scribe`). Si no hay token, graba y transcribe por lotes; sin ElevenLabs usa el `SpeechRecognition` del navegador, que también da resultados parciales |
| Micrófono con cancelación de eco, supresión de ruido y control de ganancia | ElevenLabs, client-side streaming | Las tres activadas en Scribe y en la escucha de interrupción |
| *Barge-in*: si la persona habla, callar al instante y vaciar el audio en cola; ignorar los «ajá» | Picovoice / blogs de latencia (no verificado) | `VigiaInterrupcion` detecta voz sostenida (más de 320 ms y por encima del umbral) mientras Ars habla, y entonces aborta el stream del LLM y vacía la cola de TTS. En el agente de ElevenLabs, «ajá», «sí», «ok», «claro»… no cuentan como interrupción |
| Estados visuales claros: escuchando, transcribiendo, pensando, hablando | Varios | Orbe de voz con color y animación por fase, más su etiqueta |
| Frase breve antes de usar una herramienta | ElevenLabs, *tool call sounds* | Prompt del agente de voz: «Antes de usar una herramienta di una frase muy corta» |
| Frases de relleno si el LLM tarda | ElevenLabs, *conversation flow* | `soft_timeout` de 3 s con «Déjame ver…», «Un momento…» |
| Turnos: eagerness `normal`, timeout de unos 7 s | ElevenLabs | Configurado en el agente `agent_5101m6khr039ezdvqfderetj65p6` |
| Normalizar el texto para TTS (correos, teléfonos, URLs) | ElevenLabs TTS | `apply_text_normalization: "auto"` + `textoHablable()` (correos como «arroba… punto…», el teléfono +57 en grupos, sin URLs ni Markdown) |
| Mantener el contexto de página en el agente en vivo | ElevenLabs, `sendContextualUpdate` | Cada cambio de ruta o ancla envía una actualización de contexto. El perfil y el historial reciente viajan en el prompt de inicio |

## 4. Claude (texto, documentos, imágenes y video)

- **Caché**: herramientas y system prompt (con la base de conocimiento) quedan estables y van primero; la conversación usa la caché automática. Lo volátil (página, perfil, recorrido, resumen previo) viaja en el último mensaje del usuario. La lista de herramientas nunca cambia durante una sesión.
- **Herramientas**: `tool_choice` automático (Sonnet 5.5 rechaza el forzado). Las descripciones explican cuándo usar cada una y cuándo no. Todas las entradas se validan en el servidor (`herramientas.ts`).
- **Documentos**: los PDF y textos van antes de la pregunta y con `citations: {enabled: true}`. Los `citations_delta` se convierten en eventos `cita` y se muestran como **«Fuentes del documento»**, plegables y con página. Cuando hay adjuntos se usa `effort: "medium"`.
- **Imágenes**: se redimensionan en el navegador a 1568 px y van antes del texto. El prompt pide describir lo relevante para seguridad u operación y no identificar personas.
- **Video** (la API no recibe video directamente):
  - El navegador muestrea el clip **sin subirlo**: unos 1 fotograma cada 1.5 s, entre 4 y 12, a 768 px en JPEG 0.8, y baja a 0.5 si pasa de ~2 MB.
  - Cada fotograma va precedido de la etiqueta `Fotograma N — t=mm:ss.s` y todo va dentro de `<video duracion=… fotogramas=…>`.
  - Un clip de 12 s de `/vision` ocupa unos 0.45 MB en base64, lejos de los 4.5 MB por petición de Vercel.
  - El video real de una analítica se analiza con el chip **«Analiza el video real de esta analítica»** o porque el modelo llama a `analizar_video`. El cliente extrae los fotogramas al terminar la respuesta en curso y los envía en el turno siguiente.
- **Memoria**:
  - Perfil (sector, tamaño, sedes, cámaras…) guardado con `recordar` y visible y borrable en el panel.
  - Recorrido de las últimas 12 páginas o analíticas, con su antigüedad.
  - En charlas largas, los mensajes antiguos se condensan en `<conversacion_previa>`.
  - Todo vive en el navegador de la persona, nunca en el servidor.

## 5. Pendiente o descartado (por ahora)

- **Selección de fotogramas por cambio de escena** (keyframes), en vez del muestreo uniforme. Mejora la cobertura con el mismo presupuesto, pero en el navegador cada *seek* cuesta 0.5–1.5 s; queda como mejora futura.
- **TTS por WebSocket con `auto_mode`** y `previous_request_ids` para encadenar la prosodia entre frases. Hoy se pide una frase por petición, precargando la siguiente.
- **Confirmación explícita** con resumen antes de enviar el formulario: el formulario ya es explícito (botón Enviar). Un resumen de confirmación sería un paso extra que MITRE recomienda reservar para acciones irreversibles.
- **Ventana redimensionable** (NN/g): en móvil ocupa toda la pantalla; en escritorio el tamaño es fijo (440 × 760 máx.).
- **Pruebas con lectores de pantalla** (NVDA y VoiceOver): pendientes, se hacen en un equipo real.
- **Latencia por etapa** (meta orientativa: ~800 ms de punta a punta en voz): medirla cuando haya claves reales.

## Fuentes

- NN/g — https://www.nngroup.com/articles/ai-chatbots-design-guidelines/ · https://nngroup.com/articles/less-chat-more-answer
- MITRE Chatbot Accessibility Playbook — https://mitre.github.io/chatbot-accessibility-playbook/
- Google Conversation Design (errores) — https://developers.google.com/assistant/conversation-design/errors
- ElevenLabs:
  - Prompting guide — https://elevenlabs.io/docs/agents-platform/best-practices/prompting-guide
  - Conversation flow — https://elevenlabs.io/docs/agents-platform/customization/conversation-flow
  - Client tools — https://elevenlabs.io/docs/agents-platform/customization/tools/client-tools
  - Overrides — https://elevenlabs.io/docs/agents-platform/customization/personalization/overrides
  - Dynamic variables — https://elevenlabs.io/docs/agents-platform/customization/personalization/dynamic-variables
  - Tokens — https://elevenlabs.io/docs/api-reference/tokens/create
  - Scribe Realtime — https://elevenlabs.io/docs/api-reference/speech-to-text/v-1-speech-to-text-realtime
  - TTS stream — https://elevenlabs.io/docs/api-reference/text-to-speech/stream
  - Latencia — https://elevenlabs.io/docs/best-practices/latency-optimization
- Claude:
  - Visión — https://platform.claude.com/docs/en/build-with-claude/vision
  - PDF — https://platform.claude.com/docs/en/build-with-claude/pdf-support
  - Citas — https://platform.claude.com/docs/en/build-with-claude/citations
  - Caché de prompt — https://platform.claude.com/docs/en/build-with-claude/prompt-caching
  - Herramientas — https://platform.claude.com/docs/en/agents-and-tools/tool-use/define-tools
- Video por fotogramas (investigación, no es guía oficial) — https://arxiv.org/pdf/2503.09146 · https://arxiv.org/pdf/2506.19225
- Latencia de voz (blogs de proveedores, no verificado) — https://picovoice.ai/guide/voice-agents/voice-ux-latency-turn-taking/
