# Auditoría de enlaces y navegación

Fecha: 2026-11-04 · Rama: `claude/auditoria-enlaces-bc9c7c` (base `d498a4a`).

Método: inventario con `grep` de `href`, `Link`, `router.push`, anclas, `mailto:`/`tel:`/`wa.me`, sitemap, robots, metadata y rutas del asistente; luego recorrido de cada ruta en el navegador (dev server, puerto 3017) con un script que lista los enlaces de la página, pide cada ruta interna (código HTTP) y comprueba que cada ancla `#id` exista en el DOM. Consola sin errores en todas las rutas públicas.

## Hallazgos principales

1. **Cada página tenía su propio menú**, con destinos distintos: la portada y `/servicios` mostraban 5 secciones, `/plataforma` omitía Plataforma pero añadía Inicio, `/laboratorio` no tenía Visión ni Laboratorio, `/vision-lab` no tenía Visión ni Proyectos. El menú móvil tampoco coincidía con el de escritorio.
2. **`/diagnostico` no estaba enlazado desde ningún menú ni CTA** del sitio (solo se llegaba escribiendo la URL), pese a ser el llamado principal de la landing nueva.
3. **El asistente apuntaba a anclas que ya no existen** en `/plataforma` (`#funcionalidades`, `#capturas`, `#casos`, `#feature-<id>`), herencia de la plataforma anterior. Y su mapa de anclas de `/` era el de la portada vieja (`#integral`, `#terreno`, `#monitoreo`…), así que rechazaba anclas válidas (`#fisica`, `#central`) y aceptaba inválidas.
4. **Canonical global a `/`** en `src/app/layout.tsx`: toda página sin canonical propio (`/plataforma`, `/laboratorio`, `/proyectos`, `/vision-lab`, `/admin`) declaraba como canónica la portada.
5. **Sin título propio**: `/plataforma`, `/laboratorio`, `/vision-lab`, `/admin` y `/proyectos` usaban el título por defecto del sitio.
6. **Menú móvil transparente**: los headers usan `backdrop-filter`, que convierte al header en bloque contenedor de los `fixed` descendientes; el panel del menú quedaba recortado al alto del header y el contenido de la página se veía a través.
7. **Sitemap** incluía `/vision-lab` (playground técnico) y omitía `/diagnostico`.

## Decisiones sobre páginas antiguas

| Página | Estado encontrado | Decisión | Por qué |
|---|---|---|---|
| `/vision` | Viva, catálogo de 45 analíticas, enlazada desde portada, menú y asistente | **Se mantiene** en menú y sitemap | Es el destino de «Visión con IA» (capa 02) y de `mostrar_analitica` del asistente. |
| `/laboratorio` | Demo en vivo con cámara/video; enlazada desde portada (capa robótica), `FinalCTA` de plataforma y asistente | **Se mantiene** en menú y sitemap (prioridad 0.6). Se le añade metadata propia y ancla `#cierre` | Es la demo pública que la landing ofrece para «ver la IA funcionando ya». |
| `/vision-lab` | Playground técnico, solo lo enlazaba el asistente y el sitemap | **Accesible pero `noindex`, fuera del sitemap y fuera del menú**; el header usa la navegación compartida | Duplica a `/laboratorio` para visitantes; sirve a integradores, y el asistente lo recomienda solo a perfiles técnicos. No se borra ni se redirige porque tiene uso propio. |
| `/admin` | Editor interno de datos del mapa; `robots.txt` lo bloquea; **enlazado desde el header público de `/proyectos`** | **`noindex, nofollow`** (layout nuevo) + sigue en `disallow` | Herramienta interna. El enlace desde `/proyectos` no se tocó (archivo de otra sesión): ver «Reportado en /proyectos». |
| `/analiticas-3d` | Estático en `public/`, redirección existente a `/analiticas-3d/index.html` | Sin cambios | Lo enlaza `/vision` («Abrir la presentación 3D»); responde 200. |

No hizo falta ninguna redirección nueva: ninguna página se eliminó ni cambió de ruta.

## Navegación unificada

- `src/lib/navegacion.ts`: lista única `NAV_PRINCIPAL` (Servicios → Plataforma → Visión IA → Laboratorio → Proyectos), `RUTA_DIAGNOSTICO` y `CONTACTO_PORTADA`.
- `src/components/SiteNav.tsx`: enlaces de escritorio (con `aria-current`), selector ES/EN opcional, «Contacto» (ancla de cierre de cada página; `/#contacto` si no tiene) y CTA principal **▸ Diagnóstico** → `/diagnostico`. El menú móvil se arma con exactamente los mismos destinos más Inicio.
- Usado en: portada, `/servicios`, `/servicios/[area]`, `/plataforma`, `/vision`, `/laboratorio`, `/vision-lab`.
- No usado en: `/diagnostico` (header de embudo con sus etapas: logo → inicio, «Ver ejemplo»/«Hacer el mío»), `/admin` (herramienta interna) y `/proyectos` (en rediseño por otra sesión).
- Portada: el bloque «Elige por dónde empezar» suma el CTA «Hacer mi diagnóstico».
- `MobileMenu` renderiza el panel en un portal sobre `<body>`.

## Tabla de enlaces

Estado: **OK** = responde 200 / el ancla existe; **ROTO** = 404 o ancla inexistente; **INCOHERENTE** = funciona pero no tiene sentido con la landing nueva.

### Navegación global (headers y menús móviles)

| Origen | Destino | Estado | Acción |
|---|---|---|---|
| Header portada (`HomeExperience`) | `/servicios` `/vision` `/plataforma` `/laboratorio` `/proyectos` `#contacto` | OK | Reemplazado por `SiteNav` (contacto `#contacto`) + CTA `/diagnostico` |
| `ServiciosHeader` (`/servicios`, `/servicios/[area]`) | 5 secciones + `#cierre` + Inicio (móvil) | OK | Reemplazado por `SiteNav` (contacto `#cierre`) |
| Header `/plataforma` | Servicios, Visión, Laboratorio, Proyectos, Inicio, `#cierre` (sin Plataforma) | INCOHERENTE | `SiteNav` (contacto `#cierre`) |
| Header `/vision` | Servicios, Plataforma, Laboratorio, Proyectos, `#cierre` (sin Visión) | INCOHERENTE | `SiteNav` (contacto `#cierre`) |
| Header `/laboratorio` | Servicios, Plataforma, Proyectos, Inicio | INCOHERENTE | `SiteNav` (contacto `#cierre`, ancla nueva en el CTA final) |
| Header `/vision-lab` | Servicios, Plataforma, Laboratorio, Inicio | INCOHERENTE | `SiteNav` (contacto `/#contacto`) |
| Header `/diagnostico` | `/`, `/diagnostico?ejemplo=1` ↔ `/diagnostico` | OK | Sin cambios (embudo) |
| Header `/admin` | `/`, `/proyectos` | OK | Sin cambios |
| Header `/proyectos` | `/`, `/servicios`, `/plataforma`, `/laboratorio`, `/admin` | INCOHERENTE (expone `/admin`, falta Visión y diagnóstico) | **No tocado** (otra sesión). Reportado |
| Todo el sitio | `/diagnostico` | ROTO por ausencia (sin enlaces) | CTA principal en `SiteNav` + CTA en la portada |

### Portada `/`

| Origen | Destino | Estado | Acción |
|---|---|---|---|
| Hero | `#contacto`, `#traza` | OK | — |
| Capas 01/03/05 | `/servicios/operacion-en-campo`, `/servicios/monitoreo-inteligente#iot-y-domotica`, `/servicios/centro-de-operaciones` | OK (ancla verificada) | — |
| Capas 02/04 | `/vision`, `/laboratorio` | OK | — |
| Resumen | `/plataforma`, `/servicios` | OK | + `/diagnostico` («Hacer mi diagnóstico») |
| Contacto | `wa.me/573180005654?text=…`, `mailto:gerencia.comercial@vigiasdecolombia.com?subject=…` | OK (externo) | — |
| `ContactForm` | `wa.me/…` | OK (externo) | — |

### `/servicios` y `/servicios/[area]`

| Origen | Destino | Estado | Acción |
|---|---|---|---|
| Hub | `#areas`, `#buscar` | OK | — |
| Hub · tarjetas | `/servicios/<área>` (10) | OK | — |
| Área · índice de módulos | `#<módulo>` | OK (ids verificados) | — |
| Área · anterior/siguiente/otras | `/servicios/<área>` | OK | — |
| Área | `/servicios#areas` | OK | — |
| Buscador / `EscuchaFocoHub` / `AreaExperiencia` | `router.push('/servicios/<área>#<módulo>')` | OK | — |
| Cierre | `wa.me`, `mailto:` | OK (externo) | — |

### `/plataforma`

| Origen | Destino | Estado | Acción |
|---|---|---|---|
| Franja de anclas | `#en-movimiento`, `#recorrido`, `#arquitecto-ia`, `#cierre` | OK | — |
| Hero 3D | `#arquitecto-ia`, `#cierre` | OK | — |
| Reel / Recorrido | `/servicios/<área>` | OK | — |
| Arquitecto IA | `#arq-mod-<id>`, `/servicios/<área>#<módulo>`, `wa.me`, `mailto:` | OK | — |
| `FinalCTA` | `mailto:`, `wa.me`, `/laboratorio` | OK | — |
| Metadata | title por defecto, canonical `/` | INCOHERENTE | `plataforma/layout.tsx` con title, description y canonical |

### `/vision`

| Origen | Destino | Estado | Acción |
|---|---|---|---|
| Intro | `#planificador` | OK | — |
| Intro / cierre | `/analiticas-3d/index.html`, `/analiticas-3d/Portafolio-Analiticas-Vigias.pptx` | OK | — |
| Cierre | `mailto:`, `wa.me` | OK (externo) | — |
| `/vision#<id-analítica>` (asistente) | selecciona la analítica en el visor | OK | — |

### `/laboratorio`, `/vision-lab`, `/admin`

| Origen | Destino | Estado | Acción |
|---|---|---|---|
| `/laboratorio` CTA final | `mailto:` | OK | Sección con `id="cierre"` |
| `/laboratorio` | `#demo-stage` (asistente) | OK | — |
| `/vision-lab` metadata | indexable, en sitemap, canonical `/` | INCOHERENTE | `noindex, follow`, fuera del sitemap, canonical propio |
| `/admin` metadata | sin `noindex` (solo `robots.txt`) | INCOHERENTE | `noindex, nofollow` |

### `/diagnostico`

| Origen | Destino | Estado | Acción |
|---|---|---|---|
| Header | `/`, `/diagnostico?ejemplo=1`, `/diagnostico` | OK | — |
| Reporte | `/servicios`, `wa.me`, `mailto:`, `navigator.share` | OK | — |
| Entrevista · tarjetas | `/servicios/<área>`, `/servicios/<área>#<módulo>` | OK | — |

### Asistente (`src/data/asistente`, `src/lib/asistente`, `src/components/asistente`)

| Origen | Destino | Estado | Acción |
|---|---|---|---|
| `RUTAS_SITIO` `/` | `#integral`, `#terreno`, `#monitoreo`, `#ia`, `#alertas`, `#respuesta`, `#control`, `#decisiones`, `#cierre` | ROTO (portada vieja) | Reemplazado por `#hero`, `#fisica`, `#vision`, `#iot`, `#robotica`, `#central`, `#traza`, `#escala`, `#contacto` |
| `RUTAS_SITIO` `/plataforma` | `#funcionalidades`, `#capturas`, `#casos`, `#feature-*` (14) | ROTO | `#en-movimiento`, `#recorrido`, `#arquitecto-ia`, `#pilares`, `#cierre` |
| `RUTAS_SITIO` | `/diagnostico` | Faltaba | Añadida (también en el `enum` de rutas de las herramientas) |
| `simulado.ts` | `/#monitoreo`, `/plataforma#funcionalidades`, `/plataforma#casos` | ROTO | `/#central`, `/plataforma#recorrido`, `/plataforma#arquitecto-ia` |
| `TarjetasExtra` (alcance) | `/plataforma#feature-<id>` | ROTO | `/plataforma#recorrido` |
| Conocimiento `10-mapa-del-sitio.md` | sección `/plataforma` de la versión anterior; sin `/diagnostico` | ROTO | Reescrita con las secciones reales; sección `/diagnostico`; reglas de navegación |
| `20-plataforma-erp.md`, `40-…`, `90-…`, `00-…` | `/plataforma#feature-<id>`, `#capturas`, `#casos` | ROTO | Anclas reales y menciones a `/diagnostico` |
| `generar.mjs` (índice) | funcionalidades → `#feature-<id>`, casos → `#casos` | ROTO | `#recorrido` y `#arquitecto-ia`; regenerados `conocimiento.generated.ts` e `indice.generated.ts` |
| `/proyectos`, `/laboratorio#demo-stage`, `/vision#<id>`, `/servicios/<área>#<módulo>` | — | OK | — |

### SEO / metadatos

| Origen | Destino | Estado | Acción |
|---|---|---|---|
| `layout.tsx` | `alternates.canonical: "/"` heredado por todo el sitio | ROTO | Quitado; cada página declara el suyo |
| `sitemap.ts` | `/vision-lab` incluido, `/diagnostico` ausente | INCOHERENTE | Rutas reales: `/`, `/servicios`, `/diagnostico`, `/plataforma`, `/vision`, `/laboratorio`, `/proyectos` y las 10 áreas |
| `robots.ts` | `disallow: /admin, /api/`, sitemap | OK | — |
| `opengraph-image` | `/opengraph-image` (200, PNG) | OK | — |

## Reportado en `/proyectos` (no tocado)

- El header público enlaza a **`/admin`** («⚙ Admin», también en el menú móvil): expone la herramienta interna a cualquier visitante.
- Su menú no usa la navegación compartida: falta **Visión IA**, el CTA **Diagnóstico** y Contacto. Para alinearlo basta con reemplazar su `<nav>` por `<SiteNav />` (y quitar `/admin`).
- Sin metadata propia: título por defecto y, tras quitar el canonical global, sin canonical. Sugerido: `src/app/proyectos/layout.tsx` con title, description y `alternates.canonical: "/proyectos"`.
- `npm run lint` marca en `src/app/proyectos/page.tsx:78` y `src/components/LatamMap.tsx:455` errores de React Compiler (`set-state-in-effect`, acceso a refs en render).

## Pendiente fuera de esta rama

- **Embeddings del asistente**: el índice se regeneró sin `OPENAI_API_KEY` en este entorno, así que los trozos cuyo texto cambió quedan sin vector y se buscan por palabras clave (71 de 167 con embedding). Hay que ejecutar `node src/data/asistente/generar.mjs` con la clave para recalcularlos.
- **`npm run lint` ya fallaba antes de esta rama** por errores de React Compiler en archivos no tocados (`proyectos/page.tsx`, `LatamMap.tsx`, `LiveAIOverlay.tsx`, `LocationPicker.tsx`, `vision-lab/page.tsx:122,130`). `typecheck` y `build` pasan.
