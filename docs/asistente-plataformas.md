# Asistentes líderes: qué hacen y qué adoptó «Ars»

Revisión de noviembre de 2026 de cómo funcionan los asistentes de sitio más usados, qué ideas se tomaron para Ars y dónde están en el código. Complementa [`ASISTENTE.md`](./ASISTENTE.md) (arquitectura) y [`asistente-diseno.md`](./asistente-diseno.md) (pautas de conversación).

## 1. Qué se revisó

Solo se anota lo que se leyó en la página citada. Lo marcado *[blog]* no viene de documentación oficial, y las cifras de los proveedores son autodeclaradas.

| Plataforma | Patrones relevantes | Fuente |
|---|---|---|
| **Intercom Fin** | <ul><li>*Fin for Sales*: hace preguntas de descubrimiento (necesidad, presupuesto, plazo) según criterios configurables, agenda reuniones y pasa al comercial el historial más un **resumen IA de intereses y estado de calificación**.</li><li>El handoff incluye «transcript, summary, field updates».</li><li>Responde en más de 45 idiomas, incluso desde contenido sin traducir.</li><li>*Procedures*: flujos de varios pasos con simulaciones antes de publicar.</li></ul> | [fin.ai/sales](https://fin.ai/sales) · [Fin explained](https://www.intercom.com/help/en/articles/7120684-fin-ai-agent-explained) · [Procedures](https://www.intercom.com/help/en/articles/12495167-fin-procedures-explained) · [Personio](https://www.intercom.com/solutions/technology) |
| **Drift / Salesloft** | Salesloft dice que pasó de Drift a «1mind». Sus agentes hacen preguntas predefinidas, califican, envían los visitantes de alta intención a un comercial y personalizan con la actividad web. El blog de *Playbooks* solo redirige y no se pudo leer. | [salesloft.com/platform/drift](https://www.salesloft.com/platform/drift) |
| **Ada** | *Reasoning Engine* que decide el siguiente paso según las políticas, acciones por API o código con salvaguardas, *playbooks*, *coaching* y simulaciones. | [ada.cx reasoning engine](https://www.ada.cx/platform/reasoning-engine) |
| **Voiceflow** | <ul><li>El agente invoca la base de conocimiento como **herramienta**.</li><li>Reescritura opcional de la consulta.</li><li>De 1 a 10 fragmentos (3 por defecto), con filtros por metadatos y URL de la fuente en la respuesta.</li></ul> | [Querying the KB](https://www.voiceflow.com/docs/documentation/build/querying-the-knowledge-base) |
| **ElevenLabs (widget)** | <ul><li>Voz y texto en el mismo widget.</li><li>Respuestas rápidas y carruseles de hasta 5 tarjetas.</li><li>*Client tools* para mover la página.</li><li>Herramienta de detección de idioma (en llamada el idioma queda fijo).</li><li>Feedback por conversación.</li></ul> | [Widget](https://elevenlabs.io/docs/agents-platform/customization/widget) · [Language](https://elevenlabs.io/docs/agents-platform/customization/language) |
| **Vercel AI SDK** | *Generative UI*: el resultado de cada herramienta se dibuja como un componente React, con estados de carga, resultado y error. | [Generative UI](https://ai-sdk.dev/docs/ai-sdk-ui/generative-user-interfaces) |
| **Claude** | Citas con `cited_text` exacto y punteros válidos, que también sirven para fragmentos de RAG (*custom content*). *Artifacts* para contenido reutilizable junto al chat. | [Citations](https://platform.claude.com/docs/en/build-with-claude/citations) · [Artifacts](https://support.claude.com/en/articles/9487310-what-are-artifacts-and-how-do-i-use-them) |
| **ChatGPT (memoria)** | Las páginas de OpenAI devolvieron 403; no se verificó. | — |
| **Qualified Piper, HubSpot, Zendesk, Tidio Lyro** | <ul><li>Agenda reuniones y hace seguimiento de alta intención (Piper).</li><li>Escala con contexto completo; «calificar un lead» cuenta como resolución (HubSpot).</li><li>Procedimientos generativos y preguntas de aclaración (Zendesk).</li><li>Responde solo desde tu contenido y escala lo que no sabe (Lyro).</li></ul> | [Piper](https://www.qualified.com/ai-sdr) · [HubSpot](https://www.hubspot.com/products/chatbots) · [Zendesk](https://support.zendesk.com/hc/en-us/articles/6970583409690-About-AI-agents) · [Lyro](https://www.tidio.com/lyro/) |

**Evidencia transversal**

- **RAG.** Con una base de menos de unos 200 mil tokens conviene meterla entera en el prompt con caché. Para más detalle, la búsqueda híbrida de BM25 y embeddings supera a solo embeddings, y añadir contexto a cada fragmento reduce los fallos. Fuente: [Anthropic, *Contextual Retrieval*](https://www.anthropic.com/news/contextual-retrieval).
- **Embeddings.** `text-embedding-3-small` tiene 1536 dimensiones, recortables con `dimensions`, y cuesta unas 62.500 páginas por US$1. Fuente: [OpenAI, embeddings](https://developers.openai.com/api/docs/guides/embeddings).
- **Mensajes proactivos.** Esperar al menos unos 30 s, limitar cuántos ve cada persona, usar texto propio de cada página y no ponerlos en todas. Fuente: [Gladly](https://help.gladly.com/docs/proactive-chat-best-practices-1). Lo de «uno por sesión y no repetir si se cierra» viene de un blog *[blog]*.
- **Calificación en el chat.** Empezar por la necesidad, no sonar a lista de preguntas y puntuar sin que se note *[blog]*. Fin for Sales, que es fuente oficial, usa necesidad, presupuesto y plazo.
- **Estimadores y tablas comparativas en el chat.** No se encontró documentación oficial; se apoyan en el patrón de *Generative UI*.

## 2. Qué se adoptó

| # | Idea | Por qué encaja en una empresa de seguridad con IA | En Ars |
|---|---|---|---|
| 1 | **Resumen de la visita para ventas** con calificación ligera | El handoff con resumen y estado de calificación es el patrón central de Fin for Sales | Herramienta `resumen_visita`: arma el resumen (necesidad, tamaño, analíticas y funcionalidades de interés, plazo, siguiente paso y etapa *explorando/evaluando/listo*) y abre el **formulario de contacto ya escrito**. La persona lo revisa y lo envía ella misma por `/api/contact`; no hay envío automático. Quita las secuencias largas de dígitos. |
| 2 | **Alcance orientativo** (estimador) | La pregunta «¿cuánto / qué necesito?» es la más frecuente en B2B, y el sitio no publica precios | Herramienta `estimar_proyecto`: tamaño de la operación, funcionalidades de `/plataforma`, analíticas del catálogo según los objetivos (en operaciones pequeñas primero las *lite*), **unidades con las que se cotizaría** (sedes, cámaras, piloto, analíticas), etapas, indicadores de reportes de ARS y supuestos. **Sin precios** y con aviso de que es orientativo. |
| 3 | **Comparador de analíticas** | 45 analíticas, varias parecidas (intrusión, merodeo y acceso) | Herramienta `comparar_analiticas`: tabla con qué detecta, cómo funciona, cómo se activa, estado, prueba real y para qué sectores sirve, más una conclusión opcional. |
| 4 | **«¿Qué detectaría ARS en mi foto o video?»** | Es la demostración más convincente para una empresa de visión por computador | Herramienta `reportar_hallazgos`: tras analizar una foto o video adjunto, una tarjeta con cada hallazgo ligado a una analítica, su prioridad y su segundo. El prompt la pide al cerrar cada análisis y explica qué hacer si no hay adjunto (adjuntarlo o ir a `/laboratorio`). |
| 5 | **Búsqueda semántica (RAG híbrido)** con fuentes | Fin, Voiceflow y Lyro responden solo desde el contenido y enlazan la fuente | Herramienta `buscar_conocimiento` (sección 3). La base resumida sigue entera en el prompt, como recomienda Anthropic; la búsqueda trae el **detalle** que no cabe ahí. El prompt pide mostrar la fuente con tarjetas (`recomendar`, `mostrar_analitica`), sin escribir enlaces Markdown. |
| 6 | **Detección automática de idioma** | Fin lo hace en más de 45 idiomas; el sitio solo tiene ES/EN, pero las visitas pueden escribir en inglés o portugués | Prompt: responde en el idioma del **último mensaje**, traduce nombres, conserva ids y enlaces. Probado: una pregunta en inglés con la interfaz en español se responde en inglés. |
| 7 | **Sugerencia proactiva con tope** | Gladly: ≥30 s, texto propio de la página y pocas veces | `useSugerenciaProactiva`: una por sesión, tras 30 s en la página, solo con el panel cerrado y si la persona aún no habló con Ars; texto por página (en `/vision#<id>` ofrece comparar esa analítica). |
| 8 | **Escalamiento con reglas** | Fin y Lyro pasan a una persona según el tema | Prompt: pasa a una persona si la piden, o ante preguntas de precios, contratos, SLA o integraciones concretas, o si es una empresa grande y lista para avanzar (`resumen_visita`). |

### No adoptado (por ahora)

- **Agendar la demo en el chat** (Calendly, Chili Piper): el sitio no tiene agenda; hoy el cierre es el formulario. Es el siguiente paso natural si ARS adopta una.
- **👍/👎 por respuesta y simulaciones antes de publicar** (ElevenLabs, Fin, Ada): la UI del panel es de otra sesión. Como alternativa están los scripts de prueba descritos en la sección 5.
- **Citas de Claude sobre los fragmentos de RAG** (*custom content documents*): exigiría cambiar `route.ts`, que es del proveedor. Hoy las fuentes se muestran como tarjetas.
- **Reescritura de la consulta como paso aparte** (Voiceflow): el modelo ya reformula la consulta al llamar a la herramienta (la descripción se lo pide).

## 3. Búsqueda semántica (RAG)

- **Índice** (`src/data/asistente/indice.generated.ts`, unos 210 KB, solo servidor). Lo genera `node src/data/asistente/generar.mjs` con 147 fragmentos:
  - los `.md` partidos por sección `##` (unas 170 palabras como máximo, sin cortar preguntas frecuentes);
  - las 45 analíticas con descripción completa, fases de «cómo se activa», estado y evidencia;
  - las 14 funcionalidades y los 4 casos de uso de `/plataforma`, más el flujo del turno al reporte;
  - las 13 capacidades de `/laboratorio` y los 14 modelos de `/vision-lab`.
- **Embeddings.** Cada fragmento lleva su embedding `text-embedding-3-small` de **512 dimensiones**, cuantizado a int8 en base64 (el coseno no depende de la escala).
  - Al regenerar solo se recalculan los fragmentos cuyo hash cambió.
  - Sin `OPENAI_API_KEY`, o con `--sin-embeddings`, el índice queda sin vectores.
- **Consulta** (`src/lib/asistente/busqueda.ts`):
  - En cada búsqueda **solo se embebe el texto de la consulta**, en el servidor, con `OPENAI_API_KEY`, con 3,5 s de límite y una caché en memoria de 300 consultas.
  - Los documentos adjuntos del visitante nunca se envían a OpenAI ni se guardan, y la consulta no se registra.
  - El puntaje es `1 × coseno normalizado + 0,3 × BM25 normalizado`. Con RRF puro, el ruido de BM25 en preguntas coloquiales («alguien rondando la reja de noche») desplazaba la respuesta correcta.
- **Respaldo.** Si falta la clave, si OpenAI falla o tarda, o si el índice no tiene vectores, se usa solo BM25 (`buscarPorPalabras`, con raíz española simple). La herramienta nunca lanza un error.
- **Resultados de prueba** (8 consultas coloquiales; latencia de 230 a 480 ms con la caché fría):
  - «the worker is not wearing a hard hat» → `/vision#epp` (la búsqueda por palabras no encontraba nada);
  - «botón de pánico para el guarda» → `/plataforma#feature-pot` (tras añadir esa equivalencia al `.md`);
  - «clientes que se van porque la cola es muy larga» → `permanencia` y `filas`.

## 4. Integración (para la sesión que fusiona)

Archivos nuevos o cambiados en esta rama:

- `src/lib/asistente/herramientas.ts`:
  - 5 herramientas nuevas, al final de `HERRAMIENTAS` y sin cambiar el orden de las existentes;
  - el tipo `DefinicionHerramienta` (JSON Schema plano, sin el SDK de Anthropic);
  - `comoFuncionesOpenAI()`;
  - `ejecutarHerramientaAsync()`.
- `src/lib/asistente/busqueda.ts` (nuevo) y `src/lib/asistente/prompt.ts` (instrucciones nuevas).
- `src/lib/asistente/tipos.ts`: **solo se añadieron** las variantes `estimacion`, `comparacion`, `resumen_visita` y `hallazgos` a `Tarjeta`, y sus tipos.
- `src/data/asistente/**`: `generar.mjs` también genera el índice. Hay un `.md` nuevo (`70-asistente-ars.md`) y retoques en `20` y `90`.
- `src/components/asistente/extra/`: `TarjetasExtra`, `useSugerenciaProactiva`, `proactivo.ts` y `textos.ts`.

### 4.1 Bucle de herramientas (`route.ts`, proveedor)

Cambiar la ejecución por la versión asíncrona, para que `buscar_conocimiento` use embeddings (sin el cambio funciona igual, pero solo por palabras):

```ts
import { HERRAMIENTAS, ejecutarHerramientaAsync } from "@/lib/asistente/herramientas";
// …
const resultados = await Promise.all(usos.map(async (u) => {
  const r = await ejecutarHerramientaAsync(u.name, u.input);
  for (const accion of r.acciones) enviar({ t: "accion", accion });
  for (const tarjeta of r.tarjetas) enviar({ t: "tarjeta", tarjeta });
  return { type: "tool_result", tool_use_id: u.id, content: r.resultado, is_error: r.esError || undefined };
}));
```

- **Anthropic y DeepSeek** (endpoint compatible): `tools: HERRAMIENTAS`. El tipo es compatible con `BetaTool[]` y `typecheck` pasa con el `route.ts` actual.
- **OpenAI**: `tools: comoFuncionesOpenAI()`. Las herramientas son las mismas y `ejecutarHerramientaAsync` recibe `function.name` y los argumentos ya parseados (`JSON.parse(arguments)`).
- **`resumen_visita`** emite la acción `abrir_contacto` y las tarjetas `resumen_visita` y `contacto`. Sin más cambios, el formulario aparece con el resumen escrito.

### 4.2 Tarjetas (`Tarjetas.tsx`, UX del panel)

Los tipos nuevos no rompen nada: hoy `Tarjetas` dibuja `null` para ellos. Para mostrarlos:

```tsx
import { TarjetasExtra } from "./extra";
// En Tarjetas(), junto al <ul> de `resto` (mismas props):
<TarjetasExtra tarjetas={unicas} ejecutar={ejecutar} alEnviar={alEnviar} />
```

Además, en el `<ul>` de `resto`, excluye las extra para no dejar `<li>` vacíos: `resto = unicas.filter((x) => x.tipo !== "sugerencias" && !esTarjetaExtra(x))`. La deduplicación por `x.tipo` ya deja una tarjeta de cada tipo nuevo por mensaje.

### 4.3 Sugerencia proactiva (`Asistente.tsx`)

```tsx
import { useSugerenciaProactiva } from "./extra";
const proactiva = useSugerenciaProactiva(abierto);
// En <BotonFlotante>: si no hay otra burbuja, usar la proactiva.
burbuja={burbuja ?? proactiva.sugerencia?.texto ?? null}
alCerrarBurbuja={burbuja ? cerrarBurbuja : proactiva.cerrar}
// y al hacer clic sobre la burbuja proactiva: proactiva.aceptar()
// (despacha `ars:asistente` con el mensaje, que Asistente ya escucha).
```

### 4.4 Agente de voz de ElevenLabs

Las herramientas nuevas **no** se añadieron como *client tools* del agente; el prompt de voz lo dice. Para la demo y la cotización por voz se usa `abrir_contacto` con un motivo que resume la necesidad.

### 4.5 Variables de entorno

- `OPENAI_API_KEY` (servidor): la usan la búsqueda semántica y la regeneración del índice. Sin ella, todo funciona por palabras.
- `.env.example` no se tocó, porque es del proveedor. Hay que documentar ahí este uso.

## 5. Cómo se probó

1. **Lógica de las herramientas.** Un script con jiti (fuera del repo) hizo 30 comprobaciones:
   - niveles de estimación, la prioridad *lite* en operaciones pequeñas, la ausencia de precios y los errores de validación;
   - la comparación con ids aproximados («casco» → `epp`);
   - el resumen (etapa, motivo idéntico en las dos tarjetas, números largos omitidos, funcionalidades validadas);
   - el orden de los hallazgos;
   - la búsqueda por palabras y la híbrida, y el respaldo con una clave inválida.
2. **Bucle real con un LLM.** Las mismas `HERRAMIENTAS` y `systemEstable()` contra DeepSeek (`deepseek-chat`, endpoint compatible con Anthropic) en 5 escenarios:
   - estimado → `estimar_proyecto`;
   - comparar → `comparar_analiticas`;
   - detalle → `buscar_conocimiento` + `mostrar_analitica`;
   - inglés → respuesta en inglés;
   - demo → `resumen_visita` con plazo y siguiente paso.

   El modelo usó cada herramienta en su caso. Defecto menor: en el estimado mencionó «grabadores actuales» sin que la persona lo dijera.
3. **UI.** Las cuatro tarjetas se renderizaron en una ruta temporal, ya borrada, a 400 px de ancho, sin errores en consola. La comparación de 3 o 4 columnas se desplaza en horizontal dentro de la tarjeta.
4. **`curl` a `/api/asistente/chat`.** Primero en modo demo (sin `ANTHROPIC_API_KEY`). Después de fusionar el backend de varios proveedores (`27d578c`), con `ASISTENTE_PROVEEDORES=deepseek,openai` y `next start`:
   - «dame un estimado» → `recordar` ×4 + tarjeta `estimacion`;
   - «compara aforo y filas» → tarjeta `comparacion`;
   - «universidad, 5 sedes, demo ya» → `resumen_visita` + `contacto` + `abrir_contacto`.

   El modelo escribía ids técnicos entre comillas invertidas y dijo que dos analíticas «ya funcionan» sin estado declarado; el prompt ya lo prohíbe.
   - **Pendiente para el backend:** `proveedores/anthropic.ts` y `proveedores/openai.ts` todavía llaman a `ejecutarHerramienta`, que es síncrona. Mientras no pasen a `await ejecutarHerramientaAsync(...)`, `buscar_conocimiento` busca solo por palabras.
5. **Comprobaciones finales.** `npm run typecheck`, `npm run lint` y `npm run build` pasan.

**No verificado:**

- el chat completo en el navegador con Claude (no hay clave de Anthropic) y con los componentes montados (dependen de la fusión);
- la sugerencia proactiva en vivo (requiere montarla);
- la voz;
- el funcionamiento con lectores de pantalla.
