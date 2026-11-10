#!/usr/bin/env python3
"""Arma el artifact final: una pagina con las 45 analiticas, su video 1080p (vista previa recomprimida),
las cajas de deteccion (overlay.json), las fases por tiempo y el veredicto fisico del certificado.
Uso: armar_artifact.py <lote> <certificados_dir> <salida_dir>
  lote/<id>/<id>.mp4 + overlay.json ; certificados_dir/<id>.json ; salida: index.html, media/, data/"""
import sys, json, re, subprocess, shutil
from pathlib import Path

lote, certs, out = Path(sys.argv[1]), Path(sys.argv[2]), Path(sys.argv[3])
(out / "media").mkdir(parents=True, exist_ok=True); (out / "data").mkdir(exist_ok=True)
TS = Path.home() / "landing-vigias/ARS_LandingPage/src/data/analiticas.ts"
s = TS.read_text()
AN = json.loads(re.search(r"export const analiticas: Analitica\[\] = (\[.*?\n\]);", s, re.S).group(1))
FAM = json.loads(re.search(r"export const familias: Familia\[\] = (\[.*?\n\]);", s, re.S).group(1))

items, pendientes = [], []
for a in AN:
    d = lote / a["id"]; mp4 = d / f"{a['id']}.mp4"; ov = d / "overlay.json"; cert = certs / f"{a['id']}.json"
    if not mp4.exists():
        pendientes.append(a["id"]); continue
    prev = out / "media" / f"{a['id']}.mp4"
    if not prev.exists() or prev.stat().st_mtime < mp4.stat().st_mtime:
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(mp4), "-vf", "scale=1280:-2", "-c:v", "libx264", "-preset", "slow",
                        "-crf", "27", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an", str(prev)], check=True)
    poster = out / "media" / f"{a['id']}.jpg"
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-ss", str(min(a["dur"] * 0.45, 6)), "-i", str(prev), "-frames:v", "1", "-q:v", "5", str(poster)], check=False)
    if ov.exists():
        o = json.loads(ov.read_text())
        # compactar: solo cajas con 3 decimales
        o["cuadros"] = [{"f": c["f"], "cajas": [{"t": x["tipo"][0] if x["tipo"] != "persona" else "p", "id": x["id"], "r": (x.get("rol") or "")[:1], "c": [round(v, 3) for v in x["caja"]]} for x in c["cajas"]]} for c in o["cuadros"]]
        (out / "data" / f"{a['id']}.json").write_text(json.dumps(o, separators=(",", ":")))
    c = json.loads(cert.read_text()) if cert.exists() else {}
    pruebas = {}
    try:
        inf = json.loads((lote / a["id"] / "informe.json").read_text()) if (lote / a["id"] / "informe.json").exists() else None
    except Exception:
        inf = None
    items.append({"id": a["id"], "familia": a["familia"], "nombre": a["nombre"], "corta": a["corta"], "desc": a["desc"], "dur": a["dur"],
                  "fases": a["fases"], "video": f"media/{a['id']}.mp4", "poster": f"media/{a['id']}.jpg", "overlay": f"data/{a['id']}.json" if ov.exists() else None,
                  "veredicto": c.get("veredicto", "sin certificado"), "reservas": c.get("reservas", []), "fecha": c.get("fecha"),
                  "semillas": c.get("semillas") or c.get("confirmaciones")})
tam = sum(p.stat().st_size for p in (out / "media").glob("*")) / 1e6
print(f"{len(items)} analiticas con video ({tam:.1f} MB de medios); pendientes: {pendientes}")

DATA = json.dumps({"familias": FAM, "items": items}, ensure_ascii=False)
html = r'''<title>Vigías Analíticas 3D</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@500;700;800&family=Source+Sans+3:wght@400;600&family=JetBrains+Mono:wght@500&display=swap">
<style>
/* Plano de planta de una tienda: fondo gris-azulado frío, una sola tinta cálida (ámbar de aviso) y los cuatro estados de la analítica. */
:root{--bg:#EEF1F5;--panel:#FFFFFF;--fg:#0E1626;--muted:#5B6578;--line:#D4DAE3;--accent:#D98A1F;
 --vigila:#5F6883;--detecta:#C99700;--alerta:#D63B3B;--ok:#2F9E63;--oro:#B8860B;--azul:#2F5FA8;--rojo:#B23A3A;--verde:#2E8B57;
 --display:"Archivo",system-ui,sans-serif;--body:"Source Sans 3",system-ui,sans-serif;--mono:"JetBrains Mono",ui-monospace,monospace}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#0F141C;--panel:#161D28;--fg:#E8ECF2;--muted:#9AA4B5;--line:#273040;--accent:#E8A33A;color-scheme:dark}}
:root[data-theme="dark"]{--bg:#0F141C;--panel:#161D28;--fg:#E8ECF2;--muted:#9AA4B5;--line:#273040;--accent:#E8A33A;color-scheme:dark}
body{background:var(--bg);color:var(--fg);font-family:var(--body);font-size:16px;line-height:1.5;margin:0}
.wrap{max-width:1360px;margin:0 auto;padding-block:28px 48px;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}
header h1{font-family:var(--display);font-weight:800;font-size:clamp(28px,4vw,44px);letter-spacing:-.02em;line-height:1.05;margin:0 0 10px;text-wrap:balance}
header p{max-width:68ch;color:var(--muted);margin:0 0 6px}
.resumen{display:flex;flex-wrap:wrap;gap:10px 22px;margin:18px 0 22px;font-family:var(--mono);font-size:13px;color:var(--muted)}
.resumen b{color:var(--fg);font-weight:500}
.filtros{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:22px}
.filtros button{font:600 14px var(--body);padding:7px 14px;border-radius:999px;border:1px solid var(--line);background:var(--panel);color:var(--fg);cursor:pointer}
.filtros button[aria-pressed="true"]{background:var(--fg);color:var(--bg);border-color:var(--fg)}
.filtros button:focus-visible,.card:focus-within{outline:3px solid var(--accent);outline-offset:2px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,400px),1fr));gap:22px}
.card{background:var(--panel);border:1px solid var(--line);border-radius:10px;overflow:hidden;min-width:0;display:flex;flex-direction:column}
.card .vis{position:relative;aspect-ratio:16/9;max-width:100%;background:#1a212c}
.card video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
.card canvas{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
.fam{position:absolute;left:10px;top:10px;font:500 11px var(--mono);letter-spacing:.06em;padding:3px 8px;border-radius:4px;color:#fff;background:var(--c)}
.cuerpo{padding:14px 16px 16px;display:flex;flex-direction:column;gap:10px}
.cuerpo h2{font-family:var(--display);font-weight:700;font-size:19px;margin:0;letter-spacing:-.01em;text-wrap:balance}
.cuerpo p{margin:0;color:var(--muted);font-size:14.5px}
.fase{display:flex;align-items:flex-start;gap:10px;min-height:44px;font-size:14px}
.pill{flex:none;font:500 11px var(--mono);letter-spacing:.06em;text-transform:uppercase;padding:3px 8px;border-radius:4px;color:#fff;background:var(--vigila);margin-top:2px}
.pill[data-e="detecta"]{background:var(--detecta)}.pill[data-e="alerta"]{background:var(--alerta)}.pill[data-e="ok"]{background:var(--ok)}
.linea{height:4px;background:var(--line);border-radius:2px;overflow:hidden}.linea i{display:block;height:100%;width:0;background:var(--accent)}
.fisica{display:flex;justify-content:space-between;gap:10px;align-items:center;font:500 12px var(--mono);color:var(--muted);border-top:1px solid var(--line);padding-top:10px}
.fisica .v{color:var(--ok)}.fisica .v.res{color:var(--detecta)}.fisica .v.no{color:var(--alerta)}
footer{margin-top:40px;color:var(--muted);font-size:14px;max-width:78ch}
footer h3{font-family:var(--display);font-size:16px;margin:0 0 6px;color:var(--fg)}
@media (prefers-reduced-motion:reduce){.linea i{transition:none}}
</style>
<div class="wrap">
<header>
 <h1>Analíticas de video de Vigías, en 3D con física verificada</h1>
 <p>Cada escena fue simulada en el servidor local: cuerpos articulados con pasos que no deslizan, agarres con contacto real de los dedos y objetos que caen con gravedad. Un verificador midió penetraciones, velocidades y contactos antes de renderizar, y cada escena lleva su certificado con dos semillas de confirmación.</p>
 <p>Los recuadros sobre el video son las posiciones reales de personas y objetos proyectadas a la cámara, con el estado que la analítica tendría en ese instante.</p>
 <div class="resumen" id="resumen"></div>
</header>
<nav class="filtros" id="filtros" aria-label="Familias"></nav>
<section class="grid" id="grid"></section>
<footer>
 <h3>Lo que es y lo que no es</h3>
 <p>Es cinemática con contactos verificados (método A del molde de animación con física) más caída libre con gravedad; el render en Blender solo dibuja la trayectoria aprobada y no decide ningún contacto. Las góndolas, mesas y productos del decorado también están en el modelo de colisión. Los maniquíes son estilizados a propósito: no representan a ninguna persona.</p>
</footer>
</div>
<script id="datos" type="application/json">__DATA__</script>
<script>
const D=JSON.parse(document.getElementById('datos').textContent);
const COLF={oro:'var(--oro)',azul:'var(--azul)',rojo:'var(--rojo)',verde:'var(--verde)'};
const famDe=id=>D.familias.find(f=>f.id===id);
const grid=document.getElementById('grid'),filtros=document.getElementById('filtros');
let activa='todas';
const n=D.items.length,ok=D.items.filter(i=>i.veredicto==='ENTREGABLE').length,res=D.items.filter(i=>/RESERVAS/.test(i.veredicto)).length;
document.getElementById('resumen').innerHTML=`<span><b>${n}</b> analíticas</span><span><b>${ok}</b> certificadas limpias</span><span><b>${res}</b> con reservas (margen &lt; 10 %)</span><span>render <b>1920×1080</b>, 128 muestras</span><span>vista previa <b>1280</b></span>`;
function boton(id,txt){const b=document.createElement('button');b.textContent=txt;b.setAttribute('aria-pressed',id===activa);b.onclick=()=>{activa=id;[...filtros.children].forEach(x=>x.setAttribute('aria-pressed',x.dataset.id===id));filtrar()};b.dataset.id=id;return b}
filtros.append(boton('todas','Todas'));D.familias.forEach(f=>filtros.append(boton(f.id,f.nombre)));
function filtrar(){[...grid.children].forEach(c=>{c.hidden=!(activa==='todas'||c.dataset.fam===activa)})}
const overlays=new Map();
async function cargarOverlay(it){if(!it.overlay)return null;if(overlays.has(it.id))return overlays.get(it.id);try{const r=await fetch(it.overlay);const j=r.ok?await r.json():null;overlays.set(it.id,j);return j}catch(e){overlays.set(it.id,null);return null}}
const EST={vigila:'#5F6883',detecta:'#C99700',alerta:'#D63B3B',ok:'#2F9E63'};
for(const it of D.items){
 const f=famDe(it.familia);const card=document.createElement('article');card.className='card';card.dataset.fam=it.familia;card.id=it.id;
 card.innerHTML=`<div class="vis"><video muted loop playsinline preload="metadata" poster="${it.poster}" aria-label="Animación 3D: ${it.nombre}"><source src="${it.video}" type="video/mp4"></video><canvas aria-hidden="true"></canvas><span class="fam" style="--c:${COLF[f.color]}">${f.nombre.split(' ')[0].toUpperCase()}</span></div>
 <div class="cuerpo"><h2>${it.nombre}</h2><p>${it.desc}</p><div class="fase"><span class="pill" data-e="vigila">vigila</span><span class="txt">${it.fases[0].texto}</span></div><div class="linea"><i></i></div>
 <div class="fisica"><span>física: <span class="v ${it.veredicto==='ENTREGABLE'?'':/RESERVAS/.test(it.veredicto)?'res':'no'}">${it.veredicto.replace('ENTREGABLE_CON_RESERVAS','entregable con reservas').replace('ENTREGABLE','entregable')}</span></span><span>${it.dur} s · ${it.fases.length} fases</span></div></div>`;
 grid.append(card);
 const v=card.querySelector('video'),cv=card.querySelector('canvas'),pill=card.querySelector('.pill'),txt=card.querySelector('.txt'),barra=card.querySelector('.linea i');
 let ov=null,idx=-1;
 const io=new IntersectionObserver(es=>{es.forEach(async e=>{if(e.isIntersecting){ov=await cargarOverlay(it);v.play().catch(()=>{})}else v.pause()})},{rootMargin:'120px'});io.observe(card);
 function pintar(){const t=v.currentTime;let i=-1;for(let k=0;k<it.fases.length;k++)if(t>=it.fases[k].t)i=k;
  if(i!==idx&&i>=0){idx=i;pill.dataset.e=it.fases[i].estado;pill.textContent=it.fases[i].estado;txt.textContent=it.fases[i].texto}
  barra.style.width=(100*t/it.dur).toFixed(1)+'%';
  const w=cv.clientWidth,h=cv.clientHeight;if(cv.width!==w*devicePixelRatio){cv.width=w*devicePixelRatio;cv.height=h*devicePixelRatio}
  const g=cv.getContext('2d');g.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);g.clearRect(0,0,w,h);
  if(ov){const f=Math.min(ov.T-1,Math.round(t*ov.fps));const cu=ov.cuadros[f]||ov.cuadros.find(c=>c.f===f);if(cu){const est=i>=0?it.fases[i].estado:'vigila';
   for(const c of cu.cajas){const[x0,y0,x1,y1]=c.c;const per=c.t==='p';g.lineWidth=per?2:1.2;g.setLineDash(per?[]:[4,3]);g.strokeStyle=per?EST[est]:'rgba(255,255,255,.7)';g.strokeRect(x0*w,y0*h,(x1-x0)*w,(y1-y0)*h);
    if(per){g.setLineDash([]);g.font='600 10px JetBrains Mono, monospace';const lab=(c.r==='s'?'PERSONAL':c.r==='i'?'INTRUSO':c.r==='o'?'OBRERO':'PERSONA')+' · '+c.id;const tw=g.measureText(lab).width+8;g.fillStyle=EST[est];g.fillRect(x0*w,y0*h-14,tw,14);g.fillStyle='#fff';g.fillText(lab,x0*w+4,y0*h-4)}}}}
  if(!v.paused)requestAnimationFrame(pintar)}
 v.addEventListener('play',()=>requestAnimationFrame(pintar));v.addEventListener('seeked',pintar);
 card.querySelector('.vis').addEventListener('click',()=>{v.paused?v.play():v.pause()});
}
if(location.hash){const el=document.getElementById(location.hash.slice(1));if(el)el.scrollIntoView()}
</script>
'''
(out / "index.html").write_text(html.replace("__DATA__", DATA.replace("</", "<\\/")))
print("index.html listo en", out)
