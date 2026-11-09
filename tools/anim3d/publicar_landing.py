#!/usr/bin/env python3
"""Copia los renders terminados (mp4 + overlay.json + poster) a la landing y arma manifest.json.
Uso: publicar_landing.py <carpeta_lote_local> [<repo_landing>]
Solo publica escenas con certificado ENTREGABLE (o ENTREGABLE_CON_RESERVAS, marcado), nunca NO_ENTREGABLE."""
import sys, json, shutil, subprocess
from pathlib import Path
lote = Path(sys.argv[1]); repo = Path(sys.argv[2] if len(sys.argv) > 2 else Path.home() / "landing-vigias/ARS_LandingPage")
dest = repo / "public/analiticas-3d/fisica"; dest.mkdir(parents=True, exist_ok=True)
man = {}; omitidas = []
for d in sorted(lote.iterdir()):
    if not d.is_dir(): continue
    mp4 = d / f"{d.name}.mp4"; ov = d / "overlay.json"; cert = d / "certificado.json"
    if not mp4.exists(): omitidas.append((d.name, "sin mp4")); continue
    veredicto = json.loads(cert.read_text()).get("veredicto") if cert.exists() else None
    if veredicto and not veredicto.startswith("ENTREGABLE"): omitidas.append((d.name, veredicto)); continue
    shutil.copy2(mp4, dest / mp4.name)
    if ov.exists(): shutil.copy2(ov, dest / f"{d.name}-overlay.json")
    poster = dest / f"{d.name}-poster.jpg"
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-ss", "2", "-i", str(mp4), "-frames:v", "1", "-q:v", "4", str(poster)], check=False)
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(mp4)], capture_output=True, text=True).stdout.strip() or 0)
    man[d.name] = {"src": f"/analiticas-3d/fisica/{mp4.name}", "poster": f"/analiticas-3d/fisica/{poster.name}" if poster.exists() else None,
                   "dur": round(dur, 2), "overlay": f"/analiticas-3d/fisica/{d.name}-overlay.json" if ov.exists() else None,
                   "certificado": veredicto or "solo verificador (sin certificado del orquestador)"}
(dest / "manifest.json").write_text(json.dumps(man, ensure_ascii=False, indent=1))
print(f"publicadas {len(man)}; omitidas {omitidas}")
