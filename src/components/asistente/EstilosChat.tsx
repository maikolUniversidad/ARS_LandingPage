/**
 * Estilos globales del chat de Ars: el orbe, la apertura desde el orbe, la
 * llegada de los bloques, el indicador de pensamiento y los gráficos.
 * Toda animación vive dentro de `prefers-reduced-motion: no-preference`:
 * sin ella, todo se ve en su estado final y quieto.
 */
const CSS = `
.ars-orbe > span { position: absolute; border-radius: 9999px; pointer-events: none; }
.ars-orbe-halo { inset: -32%; background: radial-gradient(circle, var(--orbe-halo), transparent 64%); opacity: .55; transition: opacity .45s ease, transform .45s ease; }
.ars-orbe-anillo { inset: 0; background: conic-gradient(from 0deg, transparent 0 12%, var(--orbe-a0) 30%, transparent 46%, transparent 58%, var(--orbe-a1) 78%, transparent 94%);
  -webkit-mask: radial-gradient(circle, transparent 60%, #000 62%, #000 69%, transparent 71%); mask: radial-gradient(circle, transparent 60%, #000 62%, #000 69%, transparent 71%); opacity: .9; }
.ars-orbe-nucleo { inset: 19%; overflow: hidden; background: radial-gradient(circle at 34% 30%, var(--orbe-c0), var(--orbe-c1) 34%, var(--orbe-c2) 86%);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--orbe-estado) 55%, transparent), 0 0 18px -2px var(--orbe-halo), inset 0 -6px 14px rgba(2,10,24,.55); transition: box-shadow .4s ease; }
.ars-orbe-brillo { position: absolute; inset: 8% 38% 52% 14%; border-radius: 9999px; background: radial-gradient(circle, rgba(255,255,255,.85), transparent 70%); filter: blur(1px); }
.ars-orbe-nucleo::after { content: ""; position: absolute; inset: 0; border-radius: inherit; background: conic-gradient(from 90deg, transparent, color-mix(in srgb, var(--orbe-estado) 45%, transparent), transparent 40%); mix-blend-mode: screen; opacity: .6; }
.ars-orbe-onda { inset: 14%; border: 1.5px solid var(--orbe-estado); opacity: 0; }
.group:hover .ars-orbe-halo, .group:focus-visible .ars-orbe-halo { opacity: 1; transform: scale(1.18); }
.ars-orbe[data-estado="pensando"] .ars-orbe-nucleo, .ars-orbe[data-estado="hablando"] .ars-orbe-nucleo, .ars-orbe[data-estado="escuchando"] .ars-orbe-nucleo {
  box-shadow: 0 0 0 1.5px var(--orbe-estado), 0 0 22px 0 color-mix(in srgb, var(--orbe-estado) 60%, transparent), inset 0 -6px 14px rgba(2,10,24,.5); }

.ars-chispa { background: linear-gradient(90deg, #9eb0c0 0%, #e8eefc 45%, #9eb0c0 90%); background-size: 220% 100%; -webkit-background-clip: text; background-clip: text; color: transparent; }
.ars-escaner { position: relative; overflow: hidden; }
.ars-escaner::after { content: ""; position: absolute; inset: 0; width: 40%; background: linear-gradient(90deg, transparent, rgba(107,138,255,.9), transparent); }

.ars-panel { --origen: calc(100% - 3rem) calc(100% - 3rem); }
@media (max-width: 767px) { .ars-panel { --origen: calc(100% - 3rem) calc(100% - 5.25rem); } }

@media (prefers-reduced-motion: no-preference) {
  .ars-orbe-nucleo { animation: ars-respira 4.6s ease-in-out infinite; }
  .ars-orbe-anillo { animation: ars-gira 10s linear infinite; }
  .group:hover .ars-orbe-anillo { animation-duration: 3.2s; }
  .ars-orbe[data-estado="reposo"] .ars-orbe-onda { animation: ars-onda 4.6s ease-out infinite; opacity: 0; }
  .ars-orbe[data-estado="reposo"] .ars-orbe-onda-2 { animation: none; }
  .ars-orbe[data-estado="escuchando"] .ars-orbe-onda { animation: ars-onda 1.6s ease-out infinite; }
  .ars-orbe[data-estado="escuchando"] .ars-orbe-onda-2 { animation-delay: .8s; }
  .ars-orbe[data-estado="pensando"] .ars-orbe-anillo { animation-duration: 1.3s; }
  .ars-orbe[data-estado="pensando"] .ars-orbe-nucleo { animation: ars-respira 1.4s ease-in-out infinite; }
  .ars-orbe[data-estado="hablando"] .ars-orbe-nucleo { animation: ars-habla .42s ease-in-out infinite alternate; }
  .ars-orbe[data-estado="hablando"] .ars-orbe-onda { animation: ars-onda 1.1s ease-out infinite; }
  .ars-orbe[data-estado="hablando"] .ars-orbe-onda-2 { animation-delay: .55s; }

  .ars-panel-entra { animation: ars-expande .62s cubic-bezier(.2,.8,.2,1) both; }
  .ars-boton-entra { animation: ars-aparece .45s cubic-bezier(.2,.8,.2,1) both; }
  .ars-bloque { animation: ars-bloque .55s cubic-bezier(.2,.8,.2,1) both; animation-delay: var(--retraso, 0ms); }
  .ars-chispa { animation: ars-chispa 1.8s linear infinite; }
  .ars-escaner::after { animation: ars-escanea 1.5s ease-in-out infinite; }
  .ars-barra { transform-origin: bottom; animation: ars-crece .8s cubic-bezier(.2,.8,.2,1) both; animation-delay: calc(var(--i, 0) * 90ms + 150ms); }
  .ars-barra-h { transform-origin: left; animation: ars-crece-h .8s cubic-bezier(.2,.8,.2,1) both; animation-delay: calc(var(--i, 0) * 90ms + 150ms); }
  .ars-trazo { stroke-dasharray: 1; animation: ars-traza 1.2s cubic-bezier(.4,0,.2,1) .15s both; }
  .ars-punto { animation: ars-aparece .4s ease both; animation-delay: calc(var(--i, 0) * 110ms + 500ms); }
  .ars-arco { animation: ars-arco 1s cubic-bezier(.2,.8,.2,1) both; animation-delay: calc(var(--i, 0) * 120ms + 150ms); }
  .ars-rastro-nuevo { animation: ars-rastro 1.2s ease both; }
}

@keyframes ars-respira { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.06); } }
@keyframes ars-habla { from { transform: scale(.98); } to { transform: scale(1.1); } }
@keyframes ars-gira { to { transform: rotate(360deg); } }
@keyframes ars-onda { 0% { transform: scale(.85); opacity: .85; } 100% { transform: scale(1.75); opacity: 0; } }
@keyframes ars-expande { from { clip-path: circle(1.75rem at var(--origen)); opacity: .3; } 60% { opacity: 1; } to { clip-path: circle(150% at var(--origen)); opacity: 1; } }
@keyframes ars-aparece { from { opacity: 0; transform: scale(.7); } to { opacity: 1; transform: none; } }
@keyframes ars-bloque { from { opacity: 0; transform: translateY(10px) scale(.985); filter: blur(4px); } to { opacity: 1; transform: none; filter: none; } }
@keyframes ars-chispa { from { background-position: 120% 0; } to { background-position: -120% 0; } }
@keyframes ars-escanea { 0% { transform: translateX(-100%); } 100% { transform: translateX(250%); } }
@keyframes ars-crece { from { transform: scaleY(0); } to { transform: none; } }
@keyframes ars-crece-h { from { transform: scaleX(0); } to { transform: none; } }
@keyframes ars-traza { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
@keyframes ars-arco { from { stroke-dashoffset: var(--largo, 100); } to { stroke-dashoffset: 0; } }
@keyframes ars-rastro { 0% { box-shadow: 0 0 0 0 rgba(107,138,255,.7); } 100% { box-shadow: 0 0 0 10px rgba(107,138,255,0); } }
`;

export function EstilosChat() {
  return <style>{CSS}</style>;
}
