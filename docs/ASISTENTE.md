# Asistente IA «Ars»

Guía de IA que acompaña a la persona en todo el sitio: explica, muestra y lleva a la sección correcta. Funciona por texto (Claude, con streaming) y por voz (ElevenLabs), entiende documentos, imágenes y video, y recuerda a la persona. Las pautas de diseño y sus fuentes están en [`asistente-diseno.md`](./asistente-diseno.md).

## Piezas

| Capa | Archivos |
|---|---|
| UI (montada en `src/app/layout.tsx`) | `src/components/asistente/` — `Asistente` (estado, acciones, voz), `PanelAsistente`, `BotonFlotante`, `OrbeVoz`, `Tarjetas`, `FormularioContacto`, `TextoRico` |
| Lógica cliente | `src/lib/asistente/` — `cliente.ts` (stream NDJSON + historial en `localStorage`), `contexto-pagina.ts` (ruta, sección visible, analítica abierta), `acciones.ts` (scroll + resaltado), `adjuntos.ts` (PDF/imagen/texto/video; redimensiona imágenes y muestrea fotogramas de video en el navegador), `voz.ts` (TTS por frases con subtítulos, Scribe en tiempo real con texto parcial, interrupción por voz, respaldo del navegador), `memoria.ts` (perfil, recorrido y resumen de conversaciones largas), `voz-agente.ts` (agente ElevenLabs en tiempo real), `i18n.ts` (claves `asistente.*`, ES/EN) |
| Lógica servidor | `src/lib/asistente/` — `prompt.ts` (system prompt estable + base de conocimiento, cacheado), `herramientas.ts` (tools y su validación), `servidor.ts` (config, límites, validación), `simulado.ts` (modo demo solo en desarrollo) |
| API | `src/app/api/asistente/` — `chat` (POST, streaming NDJSON), `estado` (qué está configurado), `tts`, `stt` (por lotes), `stt-token` (token de un solo uso para Scribe en tiempo real), `voz-sesion` (URL firmada + prompt para el agente) |
| Conocimiento | `src/data/asistente/` — ver su `README.md` para ampliarlo |

## Cómo funciona

- **Chat**: `POST /api/asistente/chat` llama a Claude (`ASISTENTE_MODELO`, por defecto `claude-sonnet-5-5`) con streaming, `effort: low`, *fallback* de servidor para rechazos y caché de prompt (herramientas + system con la base de conocimiento, TTL 1 h; la conversación con caché automática). El contexto de página y los documentos van en el último mensaje, después del punto de caché.
- **Herramientas**: `ir_a`, `mostrar_analitica`, `abrir_contacto`, `resaltar`, `recomendar`, `recordar`, `olvidar`, `analizar_video`, `sugerir` y `buscar_analiticas`. El servidor las valida (rutas, anclas e ids reales) y emite eventos `accion`/`tarjeta` que el navegador ejecuta.
- **Memoria**: el widget vive en el layout raíz (sobrevive a la navegación) y guarda en `localStorage`: el historial (`ars-asistente-v1`), el perfil que la persona contó (`ars-asistente-perfil-v1`, visible y borrable en el panel) y su recorrido (`ars-asistente-recorrido-v1`). En charlas largas, los mensajes antiguos viajan condensados. Los documentos solo se guardan en memoria mientras dura la sesión.
- **Documentos y video**: PDF y texto con citas («Fuentes del documento»), imágenes redimensionadas a 1568 px y video muestreado en el navegador en 4 a 12 fotogramas de 768 px, cada uno con su marca de tiempo; como máximo 4 a la vez y 3 MB en total, para quedar por debajo de los 4.5 MB por petición de Vercel. No se guardan en el servidor.
- **Voz**:
  - *Manos libres*: transcribe en vivo con Scribe Realtime (subtítulos mientras hablas; si falla, graba y transcribe por lotes), corta tras ~1.1 s de silencio, responde Claude y lo lee con TTS de ElevenLabs por frases (con precarga). Al terminar vuelve a escuchar. Si hablas encima o tocas el orbe, Ars se calla al instante. Si falta ElevenLabs, usa el reconocimiento y la voz del navegador.
  - *Tiempo real* (si existe `ELEVENLABS_AGENT_ID`): el agente de ElevenLabs con las mismas herramientas como *client tools*. El servidor le envía el mismo prompt y la misma base de conocimiento como *override*, y cada cambio de página llega al agente como *contextual update*.

## Abrir el asistente desde otro componente

```ts
window.dispatchEvent(new CustomEvent("ars:asistente", { detail: { mensaje: "Quiero una demo" } }));
// o { detail: { voz: true } } para abrir directamente en modo voz
```

## Variables de entorno

Ver la sección «Asistente IA» al final de `.env.example`. Para probar la UI sin claves en desarrollo: `ASISTENTE_DEMO=1` en `.env.local`.
