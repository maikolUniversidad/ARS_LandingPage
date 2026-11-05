# Imágenes de «Propuesta ARS»

> **Son ilustraciones generadas con IA.** No muestran instalaciones, clientes ni personal reales de ARS.
> Donde se usen (web animada y PDF) deben ir rotuladas, p. ej. *«Ilustración generada con IA»*.

18 imágenes: 6 escenarios × 3 tipos, en `public/images/propuesta/<escenario>-<tipo>.jpg`,
resueltas por `imagenPropuesta(escenario, tipo)` en `src/data/propuesta/imagenes.ts`.

| Escenario | `portada` | `central` | `campo` |
|---|---|---|---|
| residencial | conjunto con portería de vidrio y talanquera | sala de monitoreo compacta, mapa 3D de torres | ronda con QR en sendero ajardinado |
| corporativo | torre de vidrio con lobby iluminado | centro de operaciones en piso alto, corte 3D de la torre | marcación QR junto a torniquetes del lobby |
| industrial | planta con bodegas y perímetro delineado | sala con mapa aéreo de la planta y cámaras | ronda QR sobre la cerca perimetral |
| comercial | centro comercial abierto, Medellín, tras el cierre | sala de control con plano del centro comercial | ronda QR en pasillo de tiendas cerrado |
| logistica | centro de distribución con muelles y camiones | monitoreo de flota con red vial de Colombia | marcación QR en muelle de carga |
| mixto | Bogotá desde el aire, sedes unidas por arcos de luz | gran centro de operaciones con mapa multisede | supervisor en azotea con el mapa de sedes en la app |

## Generación

- **Proveedor:** ElevenLabs (ElevenCreative, conector MCP).
- **Modelo:** `bytedance-seedream-5-pro`, 16:9, 2K (2048×1152), 2 variaciones por imagen.
- **Flow:** `VvEu6frQdY1xUybNaEe7` («ARS Propuesta — imágenes por escenario»), un nodo por imagen con el nombre `<escenario>-<tipo>`.
- **Costo:** 36 tomas × 818,02 créditos = **29.448,65 créditos (~5,35 USD)**. Coincide con el estimado previo (`estimate_only`). No hubo regeneraciones.
- **Fecha:** 2026-11-04.
- **Selección:** se descargaron las 36 tomas y se eligió una por imagen: sin texto legible, sin armas, sin rostros reconocibles (personas de espaldas o de perfil por encima del hombro) y con las manos revisadas de cerca en las 6 de `campo`. Las 18 pasaron en el primer lote.
- **Post-proceso:** `sharp` → recorte *cover* a 1600×900, JPEG mozjpeg progresivo, calidad 80. Pesos: 76–154 KB.

| Archivo | generation_id elegido |
|---|---|
| residencial-portada | FUpeekb6pXaWMksp6AJT |
| residencial-central | 44ESI962HRBTNvJFNqxV |
| residencial-campo | d6sejaKTqQ5uSzngDsqD |
| corporativo-portada | 7lAnE0yZsI8W5sh2Ps2f |
| corporativo-central | JvdLEodSRenS85YKlmAs |
| corporativo-campo | 0fuxFiKQD6rFp40QqrsI |
| industrial-portada | VWiqaLgV3D7kL9YPIxXG |
| industrial-central | MyHyM26d0HWmtFqRwSV9 |
| industrial-campo | Y2w5CKwDdV5uX2huDpUn |
| comercial-portada | nHBe4lbtCnIULgTnLUxr |
| comercial-central | 45njAsNJDazmzQOun4Xq |
| comercial-campo | JV2lDIBdneSQkJoT8JlJ |
| logistica-portada | VmfomdExJN1PFLtThQ8o |
| logistica-central | vaEVo5SGdl5LO0xvpeNl |
| logistica-campo | PMFqbYTs0mKu2b5pqm3I |
| mixto-portada | ifjq18ndkM2Wv7IDEyL9 |
| mixto-central | PyaN9qwn3HGXiApSCDCD |
| mixto-campo | AaC6rS6hpcL7V2L2TpGo |

## Prompts

Todos comparten el mismo bloque de estilo (tomado de `public/servicios/arte/*.jpg`):

> Style: cinematic night photograph, photorealistic, full-frame camera, [lente], subtle film grain. Cold deep-blue palette: near-black navy shadows (#020a18), imperial blue and indigo (#2348d4) light accents, soft periwinkle (#6b8aff) glows. Subtle holographic data layer: thin glowing blue lines […], small luminous data points — elegant and minimal. Sober, premium, technological mood. No readable text, no letters or numbers, no logos or brands, no weapons, no police, no helmets. People only from behind or in silhouette, no recognizable faces; private security staff in generic dark navy uniforms with cap and radio, no insignia.

Las tomas de `campo` añaden «Warm, human and professional» y «Natural correct hands»; las de `central`, «Screens show only abstract shapes and lines».

Escena de cada prompt (antes del bloque de estilo):

- **residencial-portada:** Wide establishing shot at night of a modern gated residential complex in Bogotá, Colombia: brick and glass apartment towers with warm lit windows, landscaped gardens, a glass-and-steel gatehouse (portería) with a vehicle barrier at the entrance, a lone private security guard seen from behind inside the booth. Andean mountains silhouetted far behind under a deep blue night sky, light mist, wet reflective driveway. *(capa: perimeter fence and patrol route, cameras and access points, geofence; 35mm)*
- **residencial-central:** Compact, modern private-security monitoring room for a residential complex at night: two operators seen from behind with headsets at a sleek desk facing a wall of large screens showing an abstract glowing map of apartment towers and gardens with patrol routes and access points, plus a grid of abstract blurred camera feeds; window with Bogotá city lights. *(35mm)*
- **residencial-campo:** A private security guard on a night patrol inside a Colombian gated residential complex, seen over the shoulder, scanning a small glowing QR checkpoint plate on a garden wall near a lit apartment entrance; phone shows an abstract blue app with a map and a check mark. Path lamps, hedges, warm windows, light drizzle, wet stone path. *(capa: patrol route between checkpoints; 50mm)*
- **corporativo-portada:** Low-angle wide shot at night of a modern glass office tower in a Bogotá business district with a double-height illuminated lobby: reception desk, turnstiles, an officer seen from behind. Wet plaza, small trees, mist, other towers and mountains. *(capa: building floors, cameras and access points; 24mm)*
- **corporativo-central:** Premium corporate security operations center on a high floor at night: three operators from behind at a curved desk facing a video wall with an abstract glowing 3D cutaway of a skyscraper, access points and alert markers, surrounded by blurred camera tiles; floor-to-ceiling windows with Bogotá skyline. *(35mm)*
- **corporativo-campo:** A private security officer at night in the marble-and-glass lobby of a corporate tower, three-quarter view from behind, checking in at a glowing QR plate on a pillar near glass turnstiles; phone shows a floor map and check mark. Warm lobby lights, polished floor, city lights through the façade. *(capa: route line along the floor; 50mm)*
- **industrial-portada:** Wide elevated shot at night of an industrial plant on the outskirts of a Colombian city: warehouses, production building with pipes and a small stack, floodlit yard, long perimeter fence with lamp posts and cameras, guard booth at the gate. Mist, wet asphalt, distant city glow and mountains. *(capa: whole perimeter, geofence zones; 35mm)*
- **industrial-central:** Security monitoring room at an industrial plant at night: two operators from behind facing screens with an abstract aerial map of warehouses with the perimeter highlighted, zones and alert markers, plus blurred camera tiles of yards, gates and loading areas; window to the floodlit yard. *(35mm)*
- **industrial-campo:** A guard on night patrol along the perimeter fence of an industrial plant, seen over the shoulder, scanning a glowing QR plate on a fence post; floodlit warehouses, wet gravel, mist; cap, reflective vest stripes and radio. *(capa: line along the fence connecting checkpoints; 50mm)*
- **comercial-portada:** Wide shot at night of a modern open-air shopping center in Medellín after closing: glass storefronts with soft light and no signage, plaza with palm trees and planters, a guard from behind walking the plaza, quiet parking; green Andean hills with city lights. *(capa: store entrances, cameras, patrol route; 28mm)*
- **comercial-central:** Security control room of a shopping center at night: two operators from behind facing screens with an abstract floor plan of a mall (store units, corridors, entrances, parking, alert markers) plus blurred camera tiles. *(35mm)*
- **comercial-campo:** A guard doing a night round in a closed, softly lit mall corridor, seen over the shoulder, scanning a glowing QR plate on a column next to dark storefronts with no signage; phone shows a floor map and check mark; polished floor, planters, escalator. *(capa: route line along the corridor; 50mm)*
- **logistica-portada:** Wide elevated shot at night of a large logistics distribution center near a Colombian city: long warehouse with lit loading docks, unbranded white trucks backed in, truck yard, gatehouse with barrier and fence. Wet asphalt, mist, city lights and mountains. *(capa: truck routes gate→docks and perimeter; 35mm)*
- **logistica-central:** Logistics security and fleet monitoring center at night: three operators from behind facing a video wall with an abstract map of Colombia's road network, moving vehicle dots and routes, a schematic of loading docks and blurred camera tiles of truck yards. *(35mm)*
- **logistica-campo:** A guard at night at the loading docks of a distribution center, seen over the shoulder, scanning a glowing QR plate next to a dock door with an unbranded white truck backed in; dock lights, bumpers, wet concrete; reflective vest stripes. *(capa: route line connecting the docks; 50mm)*
- **mixto-portada:** Aerial panoramic view at night of a large Colombian city like Bogotá in a valley surrounded by Andean mountains, with an office tower, a gated residential complex, an industrial plant and a shopping center each outlined by a glowing blue geofence and connected by thin arcs of light converging to a central point; low clouds and mist. *(drone shot)*
- **mixto-central:** Large national security operations center at night: four operators from behind at tiered curved desks facing a panoramic video wall with an abstract city map showing multiple highlighted sites connected by lines of light, status markers and blurred camera tiles. *(24mm)*
- **mixto-campo:** A private security supervisor at night on a rooftop terrace overlooking a Colombian city, seen over the shoulder, holding a phone with an abstract city map and connected site markers; city lights in the valley, Andean mountains, faint blue arcs connecting distant buildings; mist, wet rooftop. *(50mm)*

Los prompts completos están en cada nodo del flow `VvEu6frQdY1xUybNaEe7`.
