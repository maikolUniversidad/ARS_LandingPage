#!/usr/bin/env python3
"""Render estilizado (Blender como modulo, sin ventana) de una escena ya verificada.

Uso: python render_bpy.py --escena <carpeta> --out <carpeta_salida> [--res 1280x720] [--muestras 64] [--fps 30]
                          [--cuadros 0:N] [--motor CYCLES|BLENDER_EEVEE_NEXT] [--gpu]
Lee:  salida/trayectoria.npz, salida/extras.npz, salida/escena_render.json, guion.json
Deja: cuadros PNG en <out>/img/, <out>/overlay.json (cajas 2D por cuadro para la landing) y <out>/<id>.mp4 si hay ffmpeg.
El render NO decide ningun contacto: solo dibuja lo que la trayectoria dice (regla del molde).
"""
import sys, json, argparse, math, subprocess, shutil
from pathlib import Path
import numpy as np
import bpy
from mathutils import Vector

J = dict(pelvis=0, espina=1, pecho=2, cuello=3, cabeza=4, hi=5, ci=6, mi=7, pi=8, ii=9, di=10, hd=11, cd=12, md=13, pd=14, id=15, dd=16,
         cai=17, roi=18, pie_i=19, cad=20, rod=21, pie_d=22)
COL = {"cliente": (0.16, 0.33, 0.62, 1), "staff": (0.95, 0.72, 0.10, 1), "intruso": (0.55, 0.16, 0.16, 1), "obrero": (0.85, 0.45, 0.10, 1),
       "montacarga": (0.5, 0.5, 0.5, 1), "piel": (0.80, 0.62, 0.50, 1), "pelo": (0.18, 0.12, 0.09, 1), "pantalon": (0.20, 0.22, 0.28, 1)}
COL_OBJ = {"caja_pequena": (0.85, 0.85, 0.80, 1), "botella": (0.2, 0.55, 0.3, 1), "celular": (0.05, 0.05, 0.06, 1), "maleta": (0.25, 0.2, 0.15, 1),
           "canastilla": (0.85, 0.2, 0.15, 1), "caja_grande": (0.70, 0.55, 0.35, 1), "lacteo": (0.95, 0.95, 0.95, 1), "pistola": (0.08, 0.08, 0.08, 1),
           "cuchillo": (0.75, 0.75, 0.78, 1), "fleje": (0.95, 0.95, 0.95, 1), "pila_cajas": (0.70, 0.55, 0.35, 1), "estiba_cargada": (0.7, 0.6, 0.4, 1),
           "contenedor": (0.3, 0.3, 0.32, 1), "carro": (0.6, 0.6, 0.62, 1), "monitor": (0.1, 0.1, 0.1, 1), "silla": (0.25, 0.25, 0.28, 1),
           "nevera": (0.9, 0.9, 0.92, 1), "lector": (0.2, 0.2, 0.22, 1), "bolsa": (0.9, 0.85, 0.7, 1), "auto": (0.6, 0.6, 0.65, 1),
           "moto": (0.2, 0.2, 0.2, 1), "furgon": (0.9, 0.9, 0.9, 1), "barrera": (0.9, 0.2, 0.2, 1), "puerta": (0.6, 0.65, 0.7, 1),
           "puerta_batiente": (0.6, 0.65, 0.7, 1), "puerta_corrediza": (0.7, 0.8, 0.9, 1)}
COL_VEH = {"gris": (0.5, 0.5, 0.52, 1), "blanco": (0.92, 0.92, 0.92, 1), "azul": (0.15, 0.3, 0.6, 1), "rojo": (0.75, 0.1, 0.1, 1)}
TAM_OBJ = {"caja_pequena": (0.08, 0.05, 0.12), "botella": (0.07, 0.07, 0.25), "celular": (0.07, 0.015, 0.15), "maleta": (0.35, 0.2, 0.45),
           "canastilla": (0.6, 0.4, 0.25), "caja_grande": (0.5, 0.4, 0.45), "lacteo": (0.08, 0.08, 0.2), "pistola": (0.18, 0.03, 0.12),
           "cuchillo": (0.22, 0.02, 0.04), "fleje": (0.3, 0.005, 0.04), "pila_cajas": (0.8, 0.8, 1.2), "estiba_cargada": (1.2, 1.0, 1.5),
           "contenedor": (0.8, 0.8, 1.0), "carro": (0.7, 0.5, 0.9), "monitor": (0.5, 0.05, 0.35), "silla": (0.45, 0.45, 0.45), "nevera": (0.8, 0.7, 2.0),
           "lector": (0.25, 0.25, 0.08), "bolsa": (0.3, 0.2, 0.35), "auto": (1.8, 4.4, 1.5), "moto": (0.7, 2.0, 1.1), "furgon": (2.2, 6.0, 2.6),
           "barrera": (0.15, 3.0, 0.1), "puerta": (1.2, 0.08, 2.1), "puerta_batiente": (0.9, 0.06, 2.1), "puerta_corrediza": (2.4, 0.06, 2.2)}

ap = argparse.ArgumentParser()
ap.add_argument("--escena", required=True); ap.add_argument("--out", required=True)
ap.add_argument("--res", default="1280x720"); ap.add_argument("--muestras", type=int, default=64); ap.add_argument("--fps", type=int, default=30)
ap.add_argument("--cuadros", default=None); ap.add_argument("--motor", default="CYCLES"); ap.add_argument("--gpu", action="store_true")
ap.add_argument("--paso", type=int, default=1, help="renderizar 1 de cada N cuadros (pruebas)")
a = ap.parse_args(sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else sys.argv[1:])

E = Path(a.escena); OUT = Path(a.out); (OUT / "img").mkdir(parents=True, exist_ok=True)
tr = {k: v for k, v in np.load(E / "salida/trayectoria.npz").items()}      # todo en memoria: el archivo no se relee durante el render
ex = {k: v for k, v in np.load(E / "salida/extras.npz").items()}
R = json.loads((E / "salida/escena_render.json").read_text()); G = json.loads((E / "guion.json").read_text())
pos = tr["cuerpo_pos"]; T, P = pos.shape[:2]; huesos = tr["huesos"]; hr = tr["huesos_radio"]; radio = tr["cuerpo_radio"]
W, H = map(int, a.res.split("x"))
f0, f1 = (0, T) if not a.cuadros else map(int, a.cuadros.split(":"))

# ---------------- escena limpia
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
sc.render.engine = a.motor
sc.render.resolution_x, sc.render.resolution_y = W, H
sc.render.fps = a.fps
sc.render.image_settings.file_format = "PNG"
sc.render.film_transparent = False
if a.motor == "CYCLES":
    sc.cycles.samples = a.muestras
    sc.cycles.use_adaptive_sampling = True
    sc.cycles.adaptive_threshold = 0.01
    sc.cycles.use_denoising = True
    sc.cycles.max_bounces = 6
    if a.gpu:
        prefs = bpy.context.preferences.addons["cycles"].preferences
        elegido = None
        for tipo in ("OPTIX", "CUDA"):
            try:
                prefs.compute_device_type = tipo; prefs.get_devices()
                gpus = [d for d in prefs.devices if d.type == tipo]
                if gpus:
                    for d in prefs.devices: d.use = (d.type == tipo)
                    sc.cycles.device = "GPU"; elegido = (tipo, [d.name for d in gpus]); break
            except Exception as ex_:
                print("GPU", tipo, "no:", ex_)
        print("dispositivo de render:", elegido or "CPU")
vts = [i.identifier for i in sc.view_settings.bl_rna.properties["view_transform"].enum_items]
sc.view_settings.view_transform = "AgX" if "AgX" in vts else ("Filmic" if "Filmic" in vts else "Standard")
sc.view_settings.look = "None"; sc.view_settings.exposure = 0.0

mats = {}
def mat(nombre, rgba, rough=0.6, emis=0.0, metal=0.0):
    if nombre in mats: return mats[nombre]
    m = bpy.data.materials.new(nombre); m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = rgba; b.inputs["Roughness"].default_value = rough; b.inputs["Metallic"].default_value = metal
    if emis:
        b.inputs["Emission Color"].default_value = rgba; b.inputs["Emission Strength"].default_value = emis
    mats[nombre] = m; return m

def caja(nombre, c0, c1, m, suav=False):
    c0, c1 = np.array(c0, float), np.array(c1, float)
    bpy.ops.mesh.primitive_cube_add(size=1, location=((c0 + c1) / 2).tolist())
    o = bpy.context.active_object; o.name = nombre; o.scale = (np.maximum(c1 - c0, 0.005)).tolist(); o.data.materials.append(m)
    if suav:
        bpy.ops.object.modifier_add(type="BEVEL"); o.modifiers["Bevel"].width = 0.01; o.modifiers["Bevel"].segments = 2
    return o

def esfera(nombre, r, m, seg=16):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r, segments=seg, ring_count=seg // 2)
    o = bpy.context.active_object; o.name = nombre; o.data.materials.append(m); bpy.ops.object.shade_smooth(); return o

def cilindro(nombre, r, m):
    bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=1.0, vertices=16)
    o = bpy.context.active_object; o.name = nombre; o.data.materials.append(m); bpy.ops.object.shade_smooth(); return o

def orientar_cilindro(o, p0, p1):
    p0, p1 = Vector(p0), Vector(p1); d = p1 - p0; L = max(d.length, 1e-4)
    o.location = (p0 + p1) / 2; o.scale = (o.scale[0], o.scale[1], L)
    o.rotation_mode = "QUATERNION"; o.rotation_quaternion = d.to_track_quat("Z", "Y")

# ---------------- piso, paredes, luz
m_piso = mat("piso", (0.62, 0.63, 0.62, 1), rough=0.45)
# baldosas 60x60 cm procedurales (solo apariencia)
_nt = m_piso.node_tree; _b = _nt.nodes["Principled BSDF"]
_tex = _nt.nodes.new("ShaderNodeTexBrick"); _tex.inputs["Scale"].default_value = 1.0 / 0.6; _tex.inputs["Mortar Size"].default_value = 0.006
_tex.inputs["Color1"].default_value = (0.66, 0.66, 0.65, 1); _tex.inputs["Color2"].default_value = (0.60, 0.61, 0.60, 1); _tex.inputs["Mortar"].default_value = (0.45, 0.45, 0.45, 1)
_tex.offset = 0.0; _tex.squash = 1.0
_co = _nt.nodes.new("ShaderNodeTexCoord"); _nt.links.new(_co.outputs["Object"], _tex.inputs["Vector"]); _nt.links.new(_tex.outputs["Color"], _b.inputs["Base Color"])
m_pared = mat("pared", (0.90, 0.91, 0.93, 1), rough=0.8)
caja("piso", (-2, -3, -0.05), (12, 10, 0.0), m_piso)
esc = G.get("escenario", "tienda")
if esc not in ("parqueadero", "perimetro"):
    caja("pared_fondo", (-2, 9.0, 0), (12, 9.1, 3.2), m_pared)
    caja("pared_izq", (-2.1, -3, 0), (-2, 10, 3.2), m_pared); caja("pared_der", (12, -3, 0), (12.1, 10, 3.2), m_pared)
if esc == "perimetro":
    caja("muro", (0, 6, 0), (8, 6.15, 2.0), mat("muro", (0.6, 0.6, 0.58, 1), rough=0.9))
bpy.ops.object.light_add(type="AREA", location=(4.5, 3.5, 3.1)); L = bpy.context.active_object; L.data.energy = 420; L.data.size = 12
bpy.ops.object.light_add(type="SUN", location=(0, 0, 10)); S = bpy.context.active_object; S.data.energy = 0.35; S.rotation_euler = (0.6, 0.3, 0.8)
world = bpy.data.worlds.new("w"); sc.world = world; world.use_nodes = True
world.node_tree.nodes["Background"].inputs[0].default_value = (0.75, 0.80, 0.88, 1); world.node_tree.nodes["Background"].inputs[1].default_value = 0.25

# ---------------- muebles: gondolas con bandejas, resto cajas
m_mueble = mat("mueble", (0.55, 0.57, 0.60, 1), rough=0.5)
m_bandeja = mat("bandeja", (0.80, 0.80, 0.78, 1), rough=0.5)
gond = {tuple(g[0]): g[1] for g in R.get("gondolas", [])}
for i, c in enumerate(R.get("muebles", [])):
    x0, y0, z0, x1, y1, z1 = c
    if tuple(c) in gond:
        fr = gond[tuple(c)]
        if fr > 0: caja(f"gond{i}_panel", (x0, y0, z0), (x1, y0 + 0.05, z1), m_mueble)
        else: caja(f"gond{i}_panel", (x0, y1 - 0.05, z0), (x1, y1, z1), m_mueble)
        for z in (0.0, 0.4, 0.8, 1.2, 1.6):
            caja(f"gond{i}_b{int(z*10)}", (x0, y0, max(z0, z - 0.03)), (x1, y1, z), m_bandeja)
        caja(f"gond{i}_lat0", (x0, y0, z0), (x0 + 0.03, y1, z1), m_mueble); caja(f"gond{i}_lat1", (x1 - 0.03, y0, z0), (x1, y1, z1), m_mueble)
    else:
        caja(f"mueble{i}", (x0, y0, z0), (x1, y1, z1), m_mueble, suav=True)

# zonas y lineas (decal en el piso, emisivo suave)
m_zona = mat("zona", (0.95, 0.55, 0.15, 1), emis=0.6); m_linea = mat("linea", (0.95, 0.2, 0.2, 1), emis=1.2); m_mag = mat("magenta", (0.9, 0.2, 0.9, 1), emis=1.2)
for z in R.get("zonas", []):
    if "caja" in z:
        x0, y0, x1, y1 = z["caja"]
        for (a0, b0, a1, b1) in ((x0, y0, x1, y0 + 0.03), (x0, y1 - 0.03, x1, y1), (x0, y0, x0 + 0.03, y1), (x1 - 0.03, y0, x1, y1)):
            caja(f"zona_{z['id']}", (a0, b0, 0.001), (a1, b1, 0.006), m_zona)
for l in R.get("lineas", []):
    (xa, ya), (xb, yb) = l["de"], l["a"]
    o = cilindro(f"linea_{l['id']}", 0.02, m_mag if l.get("color") == "magenta" else m_linea); orientar_cilindro(o, (xa, ya, 0.01), (xb, yb, 0.01))

# ---------------- personas: capsulas por hueso + cabeza + manos
personas = []
for p in range(P):
    meta = R["actores"][p] if p < len(R["actores"]) else {}
    rol = meta.get("rol", "cliente")
    col = COL.get(rol, COL["cliente"])
    if meta.get("uniforme") == "amarillo": col = COL["staff"]
    if meta.get("chaqueta"): col = (0.12, 0.12, 0.14, 1)
    m_ropa = mat(f"ropa{p}", col, rough=0.7); m_piel = mat("piel", COL["piel"], rough=0.6); m_pant = mat("pantalon", COL["pantalon"], rough=0.7)
    m_casco = mat("casco", (0.95, 0.85, 0.1, 1), rough=0.3); m_chal = mat("chaleco", (0.95, 0.5, 0.05, 1), rough=0.7, emis=0.3)
    partes = {}
    for b, (i, j) in enumerate(huesos):
        es_pierna = i in (17, 18, 20, 21)
        es_brazo = i in (6, 12) or j in (7, 13)
        es_dedo = j in (8, 9, 10, 14, 15, 16)
        m = m_pant if es_pierna else (m_piel if (es_brazo or es_dedo) else m_ropa)
        if meta.get("chaleco") and i in (1, 2) and j in (2, 3): m = m_chal
        o = cilindro(f"p{p}_h{b}", float(hr[b]) * (0.9 if not es_dedo else 1.0), m); partes[("h", b)] = o
        for k in (i, j):
            if ("e", k) not in partes:
                partes[("e", k)] = esfera(f"p{p}_e{k}", float(radio[k]) * (1.0 if k == 4 else 0.95), m_casco if (k == 4 and (meta.get("casco") or meta.get("casco_moto"))) else (m_piel if k in (4, 7, 13, 8, 9, 10, 14, 15, 16) else m), seg=20 if k == 4 else 10)
    if meta.get("casco") is False and rol == "obrero":
        pass
    personas.append(partes)

# ---------------- surtido de gondolas (filas de productos; la fisica los tiene como cajas de fila)
TONOS = [(0.85, 0.25, 0.20, 1), (0.20, 0.45, 0.80, 1), (0.95, 0.80, 0.25, 1), (0.30, 0.65, 0.35, 1)]
for sp in R.get("surtido", []):
    ax, ay, az = sp["tam"]; x, y, z = sp["pos"]
    m = mat(f"surt_{sp['tipo']}_{sp['tono']}", TONOS[sp["tono"] % 4], rough=0.45)
    if sp["tipo"] in ("botella", "lacteo"):
        ob = cilindro(sp["id"], ax / 2, m); ob.scale = (1, 1, az); ob.location = (x, y, z)
    else:
        caja(sp["id"], (x - ax / 2, y - ay / 2, z - az / 2), (x + ax / 2, y + ay / 2, z + az / 2), m, suav=True)

# ---------------- paredes con vano para las puertas (la puerta nunca flota sola)
for o in R.get("objetos", []):
    if o["tipo"] in ("puerta", "puerta_batiente", "puerta_corrediza"):
        px, py, _ = o["pos"] if "pos" in o else (None, None, None)
        if px is None:
            q = ex.get(f"obj_{o['id']}")
            if q is None: continue
            px, py = float(q[0][0]), float(q[0][1])
        an = TAM_OBJ[o["tipo"]][0]
        caja(f"pared_{o['id']}_a", (-2, py - 0.08, 0), (px - an / 2 - 0.02, py + 0.08, 2.8), m_pared)
        caja(f"pared_{o['id']}_b", (px + an / 2 + 0.02, py - 0.08, 0), (12, py + 0.08, 2.8), m_pared)
        caja(f"pared_{o['id']}_c", (px - an / 2 - 0.02, py - 0.08, 2.15), (px + an / 2 + 0.02, py + 0.08, 2.8), m_pared)

# ---------------- objetos y vehiculos
objetos = {}
for o in R.get("objetos", []):
    tipo = o["tipo"]; tam = TAM_OBJ.get(tipo, (0.1, 0.1, 0.1))
    col = COL_VEH.get(o.get("color"), COL_OBJ.get(tipo, (0.7, 0.7, 0.7, 1)))
    m = mat(f"obj_{tipo}_{o.get('color','')}", col, rough=0.5, metal=0.3 if tipo in ("auto", "moto", "furgon", "cuchillo", "pistola") else 0.0)
    if tipo in ("botella", "lacteo"):
        ob = cilindro(f"o_{o['id']}", tam[0] / 2, m); ob.scale = (1, 1, tam[2])
    else:
        ob = caja(f"o_{o['id']}", (-tam[0] / 2, -tam[1] / 2, -tam[2] / 2), (tam[0] / 2, tam[1] / 2, tam[2] / 2), m, suav=True)
    objetos[o["id"]] = (ob, tam, o)

# ---------------- camara
cam = G.get("camara") or {"pos": [4, -4.5, 3.2], "mira": [4, 3, 1.0]}
bpy.ops.object.camera_add(location=cam["pos"]); C = bpy.context.active_object; sc.camera = C
d = Vector(cam["mira"]) - Vector(cam["pos"]); C.rotation_mode = "QUATERNION"; C.rotation_quaternion = d.to_track_quat("-Z", "Y")
C.data.lens = 24

def proyectar(pt):
    """(x,y,z) -> (u,v) en [0,1] con origen arriba-izquierda, o None si queda detras."""
    from bpy_extras.object_utils import world_to_camera_view
    co = world_to_camera_view(sc, C, Vector(pt))
    if co.z <= 0: return None
    return (float(co.x), float(1 - co.y))

def colocar(f):
    for p in range(P):
        partes = personas[p]
        for b, (i, j) in enumerate(huesos):
            orientar_cilindro(partes[("h", b)], pos[f, p, i], pos[f, p, j])
        for k in range(pos.shape[2]):
            if ("e", k) in partes: partes[("e", k)].location = pos[f, p, k].tolist()
    for oid, (ob, tam, meta) in objetos.items():
        key = f"obj_{oid}"
        if key in ex:
            q = ex[key][f]; ob.location = (float(q[0]), float(q[1]), float(q[2]))
            if meta.get("tipo") in ("puerta_batiente", "puerta", "barrera", "puerta_corrediza"):
                ab = apertura(oid, f)
                if meta["tipo"] == "puerta_corrediza":
                    ob.location = (float(q[0]) + ab * tam[0] * 0.95, float(q[1]), float(q[2]) + tam[2] / 2)
                elif meta["tipo"] == "barrera":
                    ob.location = (float(q[0]) - tam[0] / 2, float(q[1]) - tam[1] / 2, float(q[2]) + 0.9)
                    ob.rotation_euler = (0, 0, 0); ob.rotation_euler = (ab * math.radians(-85), 0, 0)
                else:
                    ob.location = (float(q[0]) - tam[0] / 2, float(q[1]), float(q[2]) + tam[2] / 2)
                    ob.rotation_euler = (0, 0, ab * math.radians(-95))
        if meta.get("oculto_desde") is not None and f >= meta["oculto_desde"]:
            ob.hide_render = True; ob.hide_viewport = True
        else:
            ob.hide_render = False; ob.hide_viewport = False
    for k in ex:
        if k.startswith("veh_"):
            vid = k[4:]
            if vid in objetos:
                ob, tam, meta = objetos[vid]; q = ex[k][f]; ob.location = (float(q[0]), float(q[1]), tam[2] / 2)

def apertura(oid, f):
    """0 = cerrada, 1 = abierta, segun eventos abrir/cerrar del guion para ese objeto (transicion 0,8 s)."""
    meta = objetos[oid][2]
    est = 0.0 if meta.get("cerrada", meta["tipo"] != "puerta") else 1.0
    if meta["tipo"] in ("barrera", "puerta_batiente", "puerta_corrediza"): est = 0.0
    dur = int(0.8 * a.fps)
    for e in sorted(R.get("eventos", []), key=lambda e: e["cuadro"]):
        if e.get("tipo") in ("abrir", "cerrar") and (e.get("actor") == oid or e.get("objeto") == oid):
            if f < e["cuadro"]: break
            u = min(1.0, (f - e["cuadro"]) / dur); u = u * u * (3 - 2 * u)
            est = est + ((1.0 if e["tipo"] == "abrir" else 0.0) - est) * u
    return est

for oid, (ob, tam, meta) in objetos.items():
    if meta["tipo"] in ("puerta_batiente", "puerta", "barrera"):
        # mover el origen a la bisagra (extremo -x) para girar alrededor de ella
        ob.data.transform(__import__("mathutils").Matrix.Translation((tam[0] / 2, 0, 0)))
        ob.data.update()

overlay = {"id": R["id"], "fps": a.fps, "T": T, "res": [W, H], "cuadros": []}
hecho = 0
for f in range(f0, min(f1, T), a.paso):
    colocar(f)
    cajas2d = []
    for p in range(P):
        pts = [proyectar(pos[f, p, k] + np.array([0, 0, float(radio[k])])) for k in range(pos.shape[2])] + [proyectar(pos[f, p, k] - np.array([0, 0, float(radio[k])])) for k in range(pos.shape[2])]
        pts = [q for q in pts if q]
        if pts:
            us, vs = zip(*pts); meta = R["actores"][p] if p < len(R["actores"]) else {}
            cajas2d.append({"tipo": "persona", "id": meta.get("id", f"p{p}"), "rol": meta.get("rol"), "caja": [round(min(us) - 0.01, 4), round(min(vs) - 0.01, 4), round(max(us) + 0.01, 4), round(max(vs) + 0.01, 4)]})
    for oid, (ob, tam, meta) in objetos.items():
        if ob.hide_render: continue
        q = np.array(ob.location); half = np.array(tam) / 2
        pts = [proyectar(q + half * s) for s in np.array(np.meshgrid([-1, 1], [-1, 1], [-1, 1])).T.reshape(-1, 3)]
        pts = [x for x in pts if x]
        if pts:
            us, vs = zip(*pts); cajas2d.append({"tipo": meta["tipo"], "id": oid, "caja": [round(min(us), 4), round(min(vs), 4), round(max(us), 4), round(max(vs), 4)]})
    overlay["cuadros"].append({"f": f, "cajas": cajas2d})
    sc.render.filepath = str(OUT / "img" / f"{f:05d}.png")
    bpy.ops.render.render(write_still=True)
    hecho += 1
(OUT / "overlay.json").write_text(json.dumps(overlay))
print(f"render: {hecho} cuadros en {OUT/'img'}")
if shutil.which("ffmpeg") and a.paso == 1 and hecho >= 10:
    mp4 = OUT / f"{R['id']}.mp4"
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-framerate", str(a.fps), "-start_number", str(f0), "-i", str(OUT / "img" / "%05d.png"),
                    "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "23", "-movflags", "+faststart", str(mp4)], check=False)
    print("mp4:", mp4, mp4.exists())
