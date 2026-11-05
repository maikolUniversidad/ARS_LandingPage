# Configuración: claves y variables de entorno

Guía rápida para quien empieza en el proyecto. La plantilla completa, con comentarios por servicio, está en [`.env.example`](../.env.example).

## 1. Primeros pasos

```bash
cp .env.example .env.local
npm install
npm run dev
```

- Completa en `.env.local` solo las claves que vayas a usar. **Ninguna es obligatoria para que el sitio arranque.**
- `.env.local` está en `.gitignore` (todo `.env*` lo está, salvo `.env.example`). Nunca lo subas ni lo pegues en issues, PR o chats.
- Las claves son **solo de servidor**. No les pongas `NEXT_PUBLIC_`: ese prefijo las mete en el JavaScript que descarga el navegador. La única variable pública es la *publishable key* de Roboflow, que es pública por diseño.
- Después de cambiar `.env.local`, reinicia `npm run dev`.

## 2. Variables

| Variable | Servicio | Para qué | ¿Obligatoria? | Si falta |
|---|---|---|---|---|
| `ANTHROPIC_API_KEY` | Anthropic | Chat de «Ars», diagnóstico, Propuesta ARS, arquitecto de `/plataforma`, plan de visión | Recomendada en producción | Diagnóstico y propuesta: 503 en producción, simulados en `dev`. `/plataforma` y `/api/vision/plan`: motor de reglas. Chat: usa OpenAI/DeepSeek si hay. |
| `ASISTENTE_MODELO` | Anthropic | Modelo del chat y del diagnóstico | No | `claude-sonnet-5-5` |
| `ASISTENTE_MODELO_RAPIDO` | Anthropic | Modelo rápido de la Propuesta | No | `claude-haiku-5-5` |
| `OPENAI_API_KEY` | OpenAI | Respaldo del chat y de `/plataforma`; embeddings de la búsqueda del asistente | No | El chat no tiene respaldo OpenAI y la búsqueda es solo por palabras clave |
| `ASISTENTE_MODELO_OPENAI` | OpenAI | Modelo de OpenAI | No | `gpt-5.5` |
| `DEEPSEEK_API_KEY` | DeepSeek | Respaldo económico del chat (no lee PDF) | No | Sin respaldo DeepSeek |
| `ASISTENTE_MODELO_DEEPSEEK` | DeepSeek | Modelo de DeepSeek | No | `deepseek-flash` |
| `ASISTENTE_PROVEEDORES` | Chat | Orden de proveedores, p. ej. `anthropic,openai,deepseek` | No | Ese mismo orden; solo cuentan los que tienen clave |
| `ASISTENTE_DEMO` | Chat / demo | `1` = respuestas simuladas sin claves | No | Ver [§4](#4-qué-funciona-sin-claves-modo-demo) |
| `ELEVENLABS_API_KEY` | ElevenLabs | Voz de «Ars»: TTS, STT y agente en vivo | No | El navegador pone la voz y el reconocimiento (Web Speech API); no hay agente en vivo |
| `ELEVENLABS_VOICE_ID` | ElevenLabs | Voz para el TTS (no es secreto) | Para usar el TTS | Sin TTS de ElevenLabs |
| `ELEVENLABS_AGENT_ID` | ElevenLabs | Agente conversacional (no es secreto) | Para la voz en vivo | Sin conversación en tiempo real |
| `ELEVENLABS_TTS_MODEL` | ElevenLabs | Modelo de TTS | No | `eleven_flash_v2_5` |
| `ELEVENLABS_STT_MODEL` | ElevenLabs | Modelo de STT | No | `scribe_v1` |
| `RESEND_API_KEY` | Resend | Correo de leads (contacto, resumen de diagnósticos y Propuesta con PDF) | **Sí en producción** | No hay aviso por correo; el lead queda en el registro (`ARS_REGISTROS_*`) y en el log |
| `RESEND_FROM` | Resend | Remitente (dominio verificado) | No | `ARS Intelligence <onboarding@resend.dev>` |
| `CONTACT_TO` | Resend | Destinatario de los leads | No | `CONTACT_EMAIL` de `src/lib/contact.ts` |
| `ARS_REGISTROS_URL` | ARS (ERP) | Endpoint del módulo de registros de ARS que recibe cada contacto y diagnóstico (push firmado) | **Sí en producción** (junto con `_TOKEN` y `_SECRET`) | Los registros solo quedan en la copia local, que en Vercel no persiste |
| `ARS_REGISTROS_TOKEN` | ARS (ERP) | Bearer que valida el servidor de ARS | Con `ARS_REGISTROS_URL` | Push desactivado |
| `ARS_REGISTROS_SECRET` | ARS (ERP) | Secreto HMAC-SHA256 para firmar el cuerpo (`X-ARS-Firma`) | Con `ARS_REGISTROS_URL` | Push desactivado |
| `ARS_REGISTROS_TIMEOUT_MS` | ARS (ERP) | Timeout por intento del push | No | `8000` |
| `REGISTROS_DIR` | Registros | Carpeta de la copia local | No | `.data/registros` |
| `REGISTROS_COPIA_LOCAL` | Registros | `siempre` o `respaldo` (solo si el push falla) | No | `siempre` |
| `REGISTROS_ESPERA_MS` | Registros | Cuánto espera la respuesta al usuario a que se confirme el guardado | No | `2500` |
| `REGISTROS_REINTENTO_MS` | Registros | Cada cuánto el servidor reintenta solo, en segundo plano, los registros `pendiente` (mín. 30000; `0` = apagado) | No | `300000` (5 min) |
| `REGISTROS_ENTORNO` | Registros | `production`, `preview` o `development` en `origen.entorno`; manda sobre `VERCEL_ENV`/`NODE_ENV` (para pruebas) | No | `VERCEL_ENV`, si no `NODE_ENV` |
| `REGISTROS_API_TOKEN` | Registros | Bearer de la API pull `/api/registros` para el ERP | No | La API responde 503 |
| `REGISTROS_SAL_IP` | Registros | Sal del hash de la IP en los registros | No | `ARS_REGISTROS_SECRET` |
| `NEXT_PUBLIC_ROBOFLOW_PUBLISHABLE_KEY` | Roboflow | Detector de EPP en el navegador (clave pública) | No | Se usa la que trae el código |
| `FORCE` | Script | `FORCE=1` hace que `scripts/fetch-models.mjs` vuelva a copiar los modelos | No | Solo copia lo que falta |

Las variables de la sección 10 de `.env.example` (`ROBOFLOW_API_KEY`, Google Cloud, AWS, Azure, `HF_TOKEN`, `VISION_API_URL`…) están **reservadas** para un backend de visión que todavía no existe. Hoy el código no las lee.

Dónde se consiguen las claves:

- Anthropic: <https://platform.claude.com> → Settings → API keys
- OpenAI: <https://platform.openai.com/api-keys>
- DeepSeek: <https://platform.deepseek.com/api_keys>
- ElevenLabs: <https://elevenlabs.io/app/settings/api-keys>. Tiene que ser del mismo workspace que el agente y llevar los permisos TTS, STT y Agents.
- Resend: <https://resend.com/api-keys>. Verifica el dominio en <https://resend.com/domains>.

El contrato completo con el servidor de ARS (endpoint, firma, esquema JSON, SQL y API pull) está en [`BACKEND-REGISTROS.md`](BACKEND-REGISTROS.md).

## 3. Vercel

Instala la CLI y vincula el proyecto (crea `.vercel/`, que también está ignorada):

```bash
npm i -g vercel
vercel link
```

Agrega cada variable al entorno que corresponda. El comando pide el valor de forma interactiva, así que no queda en el historial de la terminal:

```bash
vercel env add ANTHROPIC_API_KEY production
vercel env add ANTHROPIC_API_KEY preview
vercel env add RESEND_API_KEY production
```

- **production**: el dominio público. Usa aquí las claves reales y `RESEND_API_KEY`.
- **preview**: los deploys de las ramas y los PR. Conviene usar claves separadas o con límite de gasto.
- **development**: lo que baja `vercel env pull .env.local` para trabajar en local.

Otros comandos útiles: `vercel env ls` para ver qué hay definido y `vercel env rm NOMBRE production` para borrar una variable. Los cambios aplican **en el siguiente deploy**, así que vuelve a desplegar (`vercel --prod` o un push) después de cambiar una variable. También se puede hacer desde el panel: Project → Settings → Environment Variables.

No definas `ASISTENTE_DEMO` en production salvo para una demo controlada.

## 4. Qué funciona sin claves (modo demo)

Sin ninguna clave, todo el sitio navega: home, servicios, `/vision-lab` y `/laboratorio` (la IA de visión corre en el navegador), `/plataforma` y `/proyectos`.

| Función | Sin claves, en `npm run dev` | Sin claves, en producción |
|---|---|---|
| Chat de «Ars» | Aviso y formulario de contacto. Con `ASISTENTE_DEMO=1`, respuestas simuladas. | Aviso y formulario de contacto (`ASISTENTE_DEMO` se ignora) |
| Diagnóstico / Propuesta ARS | Respuestas simuladas automáticamente | 503 con mensaje para escribir por WhatsApp. Con `ASISTENTE_DEMO=1`, simuladas. |
| Arquitecto de `/plataforma` y plan de visión | Motor de reglas | Motor de reglas |
| Voz | Voz y micrófono del navegador | Voz y micrófono del navegador |
| Formulario de contacto / envío de propuesta | El lead queda en `.data/registros/` y en el log del servidor | **Configura Resend y `ARS_REGISTROS_*`** para no perder leads (el disco de Vercel no persiste) |
| Registro de diagnósticos | Se guarda en `.data/registros/` (también los demo, con `fuente: "demo"`) | Solo si está configurado `ARS_REGISTROS_*` |

## 5. Si una clave se expone

Si una clave aparece en un commit, en un log, en una captura o en un chat, trátala como comprometida:

1. **Revócala ya** en el panel del proveedor (enlaces de §2) y crea una nueva.
2. Reemplázala en `.env.local` y en Vercel (`vercel env rm` y luego `vercel env add`, en cada entorno), y vuelve a desplegar.
3. Revisa en el panel del proveedor el consumo y los registros por si hubo uso indebido.
4. Si llegó a git, revocarla es lo que importa: borrarla en un commit nuevo no la quita del historial. Reescribir el historial (`git filter-repo`) solo se hace de forma coordinada con todo el equipo.

Para revisar el historial sin mostrar valores:

```bash
git log --all -G"sk-ant-|sk-proj-|re_[A-Za-z0-9]{20,}" --format="%h %s"
```

Una auditoría del 2026-11-04 no encontró claves de Anthropic, OpenAI, Resend, ElevenLabs, AWS ni Hugging Face en el historial. El único `.env*` que se ha versionado es `.env.example`.

## 6. Archivos locales que no van al repo

- `.data/`: copia local de los registros de leads (`REGISTROS_DIR`). Tiene datos personales: no la subas ni la compartas.
- `vision-trabajo/`: material de trabajo de las demos de visión, unos 1,4 GB de videos, salidas y un perfil de Chrome con sesiones. Es **solo local** y está en `.gitignore`. No lo subas ni lo copies al deploy.
- `/Export/`, `public/mediapipe/`, `public/tesseract/`, `public/ort/`, `public/models/plate/`: modelos pesados que se regeneran con `npm install` (postinstall).
- `*.pem`, `*.key`, `*.p12`, `credentials*.json`, `service-account*.json`, `secrets/`: credenciales; también ignoradas.
