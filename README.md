# AI Website Cloner Template

<a href="https://github.com/JCodesMore/ai-website-cloner-template/blob/master/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT License" /></a> <a href="https://github.com/JCodesMore/ai-website-cloner-template/stargazers"><img src="https://img.shields.io/github/stars/JCodesMore/ai-website-cloner-template?style=flat" alt="Stars" /></a> <a href="https://discord.gg/hrTSX5yTpB"><img src="https://img.shields.io/discord/1400896964597383279?label=discord" alt="Discord" /></a>

> **Este repositorio contiene la plataforma web de ARS Intelligence.** La
> documentación de abajo (a partir de "AI Website Cloner Template") es del
> andamiaje original; lo específico de ARS está en esta sección.

---

# ARS Intelligence — Plataforma web

Landing/plataforma de **ARS Intelligence** (seguridad y videovigilancia con IA).
Incluye demos de **visión por computador que corren 100 % en el navegador** —
pose/esqueleto, personas, vehículos, rostros, conteo, heurísticas de
comportamiento (brazos arriba 10 s, pelea) y **OCR de placas** — sin servidor y
sin costo por inferencia (el video del usuario nunca se sube).

## Clonar y correr (todo automático)

```bash
git clone <repo-url> ars
cd ars
npm install     # ⬅ el postinstall descarga/copia los modelos de IA a /public
npm run dev     # http://localhost:3000
```

**No hay paso manual para "bajar modelos".** El script
[`scripts/fetch-models.mjs`](scripts/fetch-models.mjs) corre en `postinstall` y deja
todo local en `/public/mediapipe` y `/public/tesseract` (MediaPipe + tesseract.js).
En runtime la IA carga **100 % local, sin CDNs externos**.

- Requiere **Node 24+** y **internet durante `npm install`** (igual que cualquier install).
- Si instalaste sin red o con `--ignore-scripts`, corré: `npm run fetch-models`.
- La **cámara** necesita **HTTPS o `http://localhost`** (contexto seguro) y un
  navegador real (Chrome/Edge/Safari) — no el navegador embebido de algunos editores.
- Los modelos (~22 MB) están en `.gitignore` (no se commitean; se generan en install).

## Demos de IA (dónde verlas)

| Ruta | Qué hace |
|------|----------|
| `/laboratorio` | Prendé la cámara o subí un video → detección real en vivo (incluye OCR de placas). |
| `/vision-lab` | Playground técnico, con toggle **IA real (navegador)** / demo. |
| `/plataforma` | Sitio institucional, **bilingüe ES/EN**. |
| `/proyectos` | Mapa de operaciones (datos de ejemplo — ver checklist). |

## Pendiente antes de publicar (checklist)

- [ ] Definir `RESEND_API_KEY` en el entorno para que el **formulario de contacto**
      envíe los leads por email (sin la key, solo quedan en el log del servidor).
- [ ] Quitar/proteger el link público **"Admin"** en `/proyectos`.
- [ ] Reemplazar los **datos placeholder de `/proyectos`** (direcciones, nº de
      cámaras, stats) por datos reales.
- [ ] Confirmar el **dominio** (`arsintelligence.com`) en la config de SEO
      (`layout.tsx`, `sitemap.ts`, `robots.ts`).
- [ ] Conseguir **autorización de uso de marca** de los logos de clientes.
- [ ] (Opcional) Videos reales para las escenas 2–8 del home (hoy usan visuales generadas).

## Comandos

```bash
npm run dev          # dev server
npm run build        # build de producción
npm run typecheck    # chequeo de tipos
npm run lint         # ESLint
npm run check        # lint + typecheck + build
npm run fetch-models # (re)descargar modelos de IA a /public
```

---

A reusable template for reverse-engineering any website into a clean, modern Next.js codebase using AI coding agents. 

**Recommended: [Claude Code](https://docs.anthropic.com/en/docs/claude-code) with Opus 4.7 for best results** — but works with a variety of AI coding agents.

Point it at a URL, run `/clone-website`, and your AI agent will inspect the site, extract design tokens and assets, write component specs, and dispatch parallel builders to reconstruct every section.

## Demo

[![Watch the demo](docs/design-references/comparison.png)](https://youtu.be/O669pVZ_qr0)

> Click the image above to watch the full demo on YouTube.

## Quick Start

1. **Clone this repository**
   ```bash
   git clone https://github.com/JCodesMore/ai-website-cloner-template.git my-clone
   cd my-clone
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Start your AI agent** — Claude Code recommended:
   ```bash
   claude --chrome
   ```
4. **Run the skill**:
   ```
   /clone-website <target-url1> [<target-url2> ...]
   ```
5. **Customize** (optional) — after the base clone is built, modify as needed

> Using a different agent? Open `AGENTS.md` for project instructions — most agents pick it up automatically.

## Supported Platforms

| Agent                                                         | Status                     |
| ------------------------------------------------------------- | -------------------------- |
| [Claude Code](https://docs.anthropic.com/en/docs/claude-code) | **Recommended** — Opus 4.7 |
| [Codex CLI](https://github.com/openai/codex)                  | Supported                  |
| [OpenCode](https://opencode.ai/)                              | Supported                  |
| [GitHub Copilot](https://github.com/features/copilot)         | Supported                  |
| [Cursor](https://cursor.com/)                                 | Supported                  |
| [Windsurf](https://codeium.com/windsurf)                      | Supported                  |
| [Gemini CLI](https://github.com/google-gemini/gemini-cli)     | Supported                  |
| [Cline](https://github.com/cline/cline)                       | Supported                  |
| [Roo Code](https://github.com/RooCodeInc/Roo-Code)            | Supported                  |
| [Continue](https://continue.dev/)                             | Supported                  |
| [Amazon Q](https://aws.amazon.com/q/developer/)               | Supported                  |
| [Augment Code](https://www.augmentcode.com/)                  | Supported                  |
| [Aider](https://aider.chat/)                                  | Supported                  |

## Prerequisites

- [Node.js](https://nodejs.org/) 24+
- An AI coding agent (see [Supported Platforms](#supported-platforms))

## Tech Stack

- **Next.js 16** — App Router, React 19, TypeScript strict
- **shadcn/ui** — Radix primitives + Tailwind CSS v4
- **Tailwind CSS v4** — oklch design tokens
- **Lucide React** — default icons (replaced by extracted SVGs during cloning)

## How It Works

The `/clone-website` skill runs a multi-phase pipeline:

1. **Reconnaissance** — screenshots, design token extraction, interaction sweep (scroll, click, hover, responsive)
2. **Foundation** — updates fonts, colors, globals, downloads all assets
3. **Component Specs** — writes detailed spec files (`docs/research/components/`) with exact computed CSS values, states, behaviors, and content
4. **Parallel Build** — dispatches builder agents in git worktrees, one per section/component
5. **Assembly & QA** — merges worktrees, wires up the page, runs visual diff against the original

Each builder agent receives the full component specification inline — exact `getComputedStyle()` values, interaction models, multi-state content, responsive breakpoints, and asset paths. No guessing.

## Use Cases

- **Platform migration** — rebuild a site you own from WordPress/Webflow/Squarespace into a modern Next.js codebase
- **Lost source code** — your site is live but the repo is gone, the developer left, or the stack is legacy. Get the code back in a modern format
- **Learning** — deconstruct how production sites achieve specific layouts, animations, and responsive behavior by working with real code

## Not Intended For

- **Phishing or impersonation** — this project must not be used for deceptive purposes, impersonation, or any activity that breaks the law.
- **Passing off someone's design as your own** — logos, brand assets, and original copy belong to their owners.
- **Violating terms of service** — some sites explicitly prohibit scraping or reproduction. Check first.

## Project Structure

```
src/
  app/              # Next.js routes
  components/       # React components
    ui/             # shadcn/ui primitives
    icons.tsx       # Extracted SVG icons
  lib/utils.ts      # cn() utility
  types/            # TypeScript interfaces
  hooks/            # Custom React hooks
public/
  images/           # Downloaded images from target
  videos/           # Downloaded videos from target
  seo/              # Favicons, OG images
docs/
  research/         # Extraction output & component specs
  design-references/ # Screenshots
scripts/
  sync-agent-rules.sh  # Regenerate agent instruction files
  sync-skills.mjs      # Regenerate /clone-website for all platforms
AGENTS.md           # Agent instructions (single source of truth)
CLAUDE.md           # Claude Code config (imports AGENTS.md)
GEMINI.md           # Gemini CLI config (imports AGENTS.md)
```

## Commands

```bash
npm run dev    # Start dev server
npm run build  # Production build
npm run lint   # ESLint check
npm run typecheck # TypeScript check
npm run check  # Run lint + typecheck + build
```

### If using docker

```bash
docker compose up app --build # build and run the app
docker compose up dev --build # run the app in dev mode on port 3001
```

## Updating for Other Platforms

Two source-of-truth files power all platform support. Edit the source, then run the sync script:

| What                   | Source of truth                         | Sync command                       |
| ---------------------- | --------------------------------------- | ---------------------------------- |
| Project instructions   | `AGENTS.md`                             | `bash scripts/sync-agent-rules.sh` |
| `/clone-website` skill | `.claude/skills/clone-website/SKILL.md` | `node scripts/sync-skills.mjs`     |

Each script regenerates the platform-specific copies automatically. Agents that read the source files natively need no regeneration.


## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=JCodesMore/ai-website-cloner-template&type=Date)](https://star-history.com/#JCodesMore/ai-website-cloner-template&Date)

## License

MIT
