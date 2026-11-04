# Base de conocimiento del asistente

Texto que se concatena al system prompt (cacheado) del asistente que guía a los visitantes del sitio.

## Estructura

- `conocimiento/*.md`: un documento por tema, en español. Esta es la fuente que se edita.
- `conocimiento.generated.ts`: se genera a partir de los `.md`. No editar a mano.
- `generar.mjs`: regenera el archivo `.generated.ts`.
- `index.ts`: API (`DOCUMENTOS`, `construirBaseConocimiento()`, `catalogoAnaliticas()`, `buscarAnalitica()`, `RUTAS_SITIO`). El catálogo de las 45 analíticas se toma de `@/data/analiticas`; no se copia a los `.md`.

## Añadir o editar conocimiento

1. Crea o edita un `.md` en `conocimiento/` con este frontmatter:
   ```
   ---
   id: modulo-rondas          # único, kebab-case
   titulo: Módulo de rondas   # se usa como encabezado "# titulo"
   orden: 25                  # posición en el prompt (00 = primero)
   rutas: ["/plataforma"]     # rutas del sitio relacionadas (arreglo JSON)
   ---
   ```
2. Ejecuta `node src/data/asistente/generar.mjs`.
3. Haz commit del `.md` y del `conocimiento.generated.ts`.

Pon un número de orden en el nombre del archivo, igual al campo `orden` (p. ej. `25-modulo-rondas.md`).

## Reglas de contenido

- Usa solo hechos que estén en el sitio o en documentación oficial de ARS. Lo desconocido se escribe «a confirmar con el equipo comercial».
- No pongas precios, clientes, certificaciones ni cifras que no estén confirmados.
- Sé breve: todo el texto entra en cada conversación. Objetivo total ≤ ~6.000 palabras.
- Enlaza con rutas y anclas reales (ver `RUTAS_SITIO` en `index.ts`).
- Cualquier cambio en el texto invalida la caché del prompt. Agrupa los cambios.

## Material futuro (capturas y documentación de módulos ARS)

Documenta cada módulo de ARS en su propio `.md` dentro de `conocimiento/`. Guarda las capturas en `public/asistente/` y refiérete a ellas por su ruta pública, p. ej. `![Central de monitoreo](/asistente/central.png)`. El asistente recibe la ruta como texto y no ve la imagen. Por eso, describe también en texto lo que muestra cada captura.
