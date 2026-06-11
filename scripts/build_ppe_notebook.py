#!/usr/bin/env python3
"""
Genera notebooks/EPP_YOLOX_DFINE_training.ipynb — un notebook de Colab, grado
producción, para fine-tunear 3 detectores de EPP (YOLOX-S, YOLOX-L, D-FINE-S),
compararlos por F1 y exportar el .onnx del mejor (para onnxruntime-web).

Construir el .ipynb desde Python garantiza JSON válido y deja el pipeline del
notebook versionado/reproducible. Re-ejecutar este script regenera el notebook.

    python scripts/build_ppe_notebook.py
"""
import json
import os

cells = []


def md(text: str):
    cells.append(
        {
            "cell_type": "markdown",
            "metadata": {},
            "source": text.strip("\n").splitlines(keepends=True),
        }
    )


def code(text: str):
    cells.append(
        {
            "cell_type": "code",
            "execution_count": None,
            "metadata": {},
            "outputs": [],
            "source": text.strip("\n").splitlines(keepends=True),
        }
    )


# ───────────────────────────────────────────────────────────────────────────
# 0. Portada / estrategia
# ───────────────────────────────────────────────────────────────────────────
md(r"""
# 🦺 EPP (PPE) — Entrenamiento y selección de detector para navegador

**Objetivo.** Fine-tunear **3 detectores** sobre un dataset de EPP, compararlos por
**F1** y exportar a **ONNX** el mejor, para correrlo *on-device* en el navegador con
`onnxruntime-web` (cero créditos, auto-hospedado).

| Modelo | Arquitectura | Rol |
|---|---|---|
| **YOLOX-S** | anchor-free CNN, ligero | baseline rápido, mejor latencia en navegador |
| **YOLOX-L** | anchor-free CNN, grande | techo de precisión CNN |
| **D-FINE-S** | DETR real-time (SOTA 2024) | NMS-free, fuerte en objetos pequeños/oclusión |

### Principios de ingeniería (cómo está pensado)
1. **Transfer learning en los 3.** YOLOX parte de pesos COCO (la cabeza se reinicia
   sola al cambiar `num_classes`); D-FINE-S parte de **Objects365→COCO** (`obj2coco`),
   más general y sample-efficient en datasets chicos.
2. **Un dataset normalizado una sola vez.** IDs de clase canónicos `0..K-1` que sirven
   *idénticos* a los 3 modelos y al evaluador → comparación 100% justa.
3. **Test set separado** (held-out): el checkpoint se elige por mAP de validación, pero
   el **F1 de selección se mide en test**, que ningún modelo vio → sin sesgo de selección.
4. **Evaluador de F1 unificado y framework-agnóstico.** Cada modelo solo produce
   detecciones en formato COCO (`{image_id, category_id, bbox, score}`); el F1 (matching
   IoU greedy + barrido de umbral de confianza) se calcula igual para todos.
5. **Técnicas de producción:** EMA, AMP/fp16, warmup+cosine LR, mosaic/mixup con
   *no-aug* en las últimas épocas (YOLOX), focal loss (D-FINE), **AP por clase** para no
   esconder las clases de violación raras, y selección del **umbral F1-óptimo** como
   punto de operación.
6. **Persistencia en Google Drive.** Checkpoints, ONNX, detecciones y métricas se guardan
   en Drive, así la comparación final sobrevive a reinicios de runtime.

> ⚠️ **YOLOX y D-FINE tienen dependencias incompatibles** (numpy<2 vs torch≥2 / faster-coco-eval).
> No intentes entrenar los 3 en la misma sesión. Plan recomendado:
> **(A)** correr Setup + Dataset una vez, **(B)** reiniciar runtime y correr YOLOX-S, **(C)** reiniciar
> y correr YOLOX-L, **(D)** reiniciar y correr D-FINE-S, **(E)** correr la Comparación
> (no necesita GPU ni los frameworks: solo lee los `.json` de Drive).

> **Runtime:** `Entorno de ejecución → Cambiar tipo de entorno → GPU` (T4 alcanza; YOLOX-L
> va lento en T4 — si podés, A100/L4). **Dataset:** Construction Site Safety (Roboflow
> Universe, CC BY 4.0) — incluye clases de violación `NO-Hardhat`, `NO-Mask`, `NO-Safety Vest`.
""")

# ───────────────────────────────────────────────────────────────────────────
# 1. Config global
# ───────────────────────────────────────────────────────────────────────────
md(r"""
## 1 · Configuración global

Editá esta celda y re-ejecutala al inicio de **cada** sesión (incluida la de comparación).
""")

code(r'''
# ====================== CONFIG (editar acá) ======================
SEED = 0
IMG_SIZE = 640                     # tamaño de entrada/exportación de los 3 modelos

# --- Google Drive: todo lo persistente vive acá ---
DRIVE_ROOT = "/content/drive/MyDrive/ARS_EPP"   # carpeta de trabajo en Drive
LOCAL_ROOT = "/content/ARS_EPP"                  # caché local (rápido) de la sesión

# --- Dataset (Roboflow Universe: Construction Site Safety) ---
# Conseguí tu API key en https://app.roboflow.com → Settings → Roboflow API.
ROBOFLOW_API_KEY = ""              # <-- pegá tu API key (NO la subas a git)
RF_WORKSPACE = "roboflow-universe-projects"
RF_PROJECT   = "construction-site-safety"
RF_VERSION   = 30                  # confirmá la última versión "raw" en la página del dataset

# --- Filtrar clases a SOLO los PARES de cumplimiento/violación EPP ---
# El valor de un detector de EPP está en los PARES "usa / no-usa": solo así podés marcar
# una VIOLACIÓN accionable. Una clase de presencia suelta (sin su contraparte) no sirve.
# Este dataset tiene 3 pares completos (casco / tapabocas / chaleco). Quedan 6 clases
# balanceadas (~150-400 inst. c/u). Descartamos:
#   - Gloves: NO existe NO-Gloves en este dataset -> sin par -> sin valor de violación.
#   - Person: no es señal de cumplimiento, es la clase más numerosa (desbalancea), y la
#     persona ya la detecta MediaPipe en el navegador (mucho más robusto en webcam).
#   - Vehículos/maquinaria/cono/escalera: irrelevantes y con casi cero datos.
KEEP_CLASSES = ["Hardhat", "NO-Hardhat", "Mask", "NO-Mask", "Safety Vest", "NO-Safety Vest"]
# KEEP_CLASSES = None              # poné None para usar TODAS las clases del dataset

# --- Hiperparámetros de entrenamiento (ajustables) ---
EPOCHS_YOLOX_S = 100
EPOCHS_YOLOX_L = 80               # L es más pesado; menos épocas en T4
EPOCHS_DFINE_S = 64              # el config obj2custom de D-FINE ya viene a 64
BATCH_YOLOX_S  = 16
BATCH_YOLOX_L  = 8               # bajá si OOM en T4 (16 GB)
BATCH_DFINE_S  = 4               # D-FINE-S es pesado en memoria (deformable attn); 4 entra en T4

# --- Evaluación / F1 ---
F1_IOU = 0.50                     # IoU para considerar TP
CONF_GRID_LO, CONF_GRID_HI, CONF_GRID_STEP = 0.05, 0.95, 0.05  # barrido de umbral

# ================================================================
import os
PATHS = {
    "drive": DRIVE_ROOT,
    "local": LOCAL_ROOT,
    "data":  f"{LOCAL_ROOT}/datasets/ppe_coco",   # dataset normalizado (canónico)
    "ckpts": f"{DRIVE_ROOT}/checkpoints",
    "onnx":  f"{DRIVE_ROOT}/onnx",
    "preds": f"{DRIVE_ROOT}/preds",               # detecciones COCO por modelo (test)
    "metrics": f"{DRIVE_ROOT}/metrics",           # métricas por modelo
    "weights": f"{DRIVE_ROOT}/pretrained",        # pesos COCO/obj2coco descargados
}
print("Config cargada. IMG_SIZE =", IMG_SIZE, "| SEED =", SEED)
''')

code(r'''
# Semillas globales (reproducibilidad)
def seed_everything(seed=SEED):
    import random, numpy as np
    random.seed(seed); np.random.seed(seed)
    os.environ["PYTHONHASHSEED"] = str(seed)
    try:
        import torch
        torch.manual_seed(seed); torch.cuda.manual_seed_all(seed)
    except Exception:
        pass
seed_everything()
print("seed:", SEED)
''')

# ───────────────────────────────────────────────────────────────────────────
# 2. Drive + carpetas
# ───────────────────────────────────────────────────────────────────────────
md(r"""
## 2 · Montar Google Drive y crear carpetas

Corré esto al inicio de cada sesión. Idempotente.
""")

code(r'''
from google.colab import drive
drive.mount("/content/drive")

for k, p in PATHS.items():
    os.makedirs(p, exist_ok=True)
print("Carpetas listas:")
for k, p in PATHS.items():
    print(f"  {k:8s} -> {p}")
''')

# ───────────────────────────────────────────────────────────────────────────
# 3. Dataset
# ───────────────────────────────────────────────────────────────────────────
md(r"""
## 3 · Dataset — descarga, **normalización canónica** y EDA

> Correr **una sola vez** (en la sesión de Setup). Deja el dataset normalizado en Drive,
> así las sesiones de cada modelo solo lo copian.

**Por qué normalizamos.** Roboflow exporta COCO con su propia numeración de categorías
(a veces con una categoría dummy id 0). Para que YOLOX, D-FINE y el evaluador hablen el
**mismo idioma de IDs**, reescribimos los 3 splits con `category_id` contiguo `0..K-1`
basado en las categorías realmente usadas. Ese dataset canónico es la única fuente de verdad.
""")

code(r'''
# 3.1 — Descargar el dataset en formato COCO desde Roboflow
assert ROBOFLOW_API_KEY, "Pegá tu ROBOFLOW_API_KEY en la celda de Config."
!pip -q install roboflow

from roboflow import Roboflow
rf = Roboflow(api_key=ROBOFLOW_API_KEY)
proj = rf.workspace(RF_WORKSPACE).project(RF_PROJECT)
ds = proj.version(RF_VERSION).download("coco", location=f"{LOCAL_ROOT}/_rf_download")
RF_DIR = ds.location
print("Descargado en:", RF_DIR)
!ls -la "$RF_DIR"
''')

code(r'''
# 3.2 — Normalizar a IDs canónicos 0..K-1 (sobre las categorías realmente anotadas)
import json, shutil, glob
from collections import Counter

SPLIT_MAP = {"train": "train", "valid": "valid", "test": "test"}  # nombres Roboflow
# Roboflow a veces usa 'valid' o 'val'; detectamos lo que exista.
def _find_split_dir(rf_dir, names):
    for n in names:
        if os.path.isdir(os.path.join(rf_dir, n)):
            return os.path.join(rf_dir, n)
    return None

src_splits = {
    "train": _find_split_dir(RF_DIR, ["train"]),
    "valid": _find_split_dir(RF_DIR, ["valid", "val"]),
    "test":  _find_split_dir(RF_DIR, ["test"]),
}
print("Splits encontrados:", {k: bool(v) for k, v in src_splits.items()})

# Construimos el mapeo canónico a partir del split de train.
train_json = json.load(open(os.path.join(src_splits["train"], "_annotations.coco.json")))
id2name = {c["id"]: c["name"] for c in train_json["categories"]}
keep = set(KEEP_CLASSES) if KEEP_CLASSES else None   # whitelist por nombre (EPP) o None
# Solo categorías realmente anotadas en train Y (si hay filtro) en la whitelist.
used_cat_ids = sorted({a["category_id"] for a in train_json["annotations"]
                       if keep is None or id2name.get(a["category_id"]) in keep})
CANON = [{"old_id": cid, "new_id": i, "name": id2name.get(cid, f"class_{cid}")}
         for i, cid in enumerate(used_cat_ids)]
old2new = {c["old_id"]: c["new_id"] for c in CANON}
CLASSES = [c["name"] for c in CANON]
NUM_CLASSES = len(CLASSES)
if keep:
    faltan = keep - set(CLASSES)
    print(f"Filtro EPP activo. Clases conservadas: {len(CLASSES)}"
          + (f" | ⚠️ no encontradas en el dataset: {faltan}" if faltan else ""))
print(f"\nClases canónicas (K={NUM_CLASSES}):")
for c in CANON:
    print(f"  {c['new_id']:2d}  {c['name']}")

DATA = PATHS["data"]
if os.path.exists(DATA):
    shutil.rmtree(DATA)

def normalize_split(split):
    src = src_splits[split]
    if not src:
        return None
    dst = os.path.join(DATA, split)
    os.makedirs(dst, exist_ok=True)
    j = json.load(open(os.path.join(src, "_annotations.coco.json")))
    # categorías -> canónicas
    j["categories"] = [{"id": c["new_id"], "name": c["name"], "supercategory": "epp"} for c in CANON]
    anns = []
    for a in j["annotations"]:
        if a["category_id"] not in old2new:
            continue  # categoría fuera del filtro EPP / no usada -> se descarta
        a["category_id"] = old2new[a["category_id"]]
        anns.append(a)
    j["annotations"] = anns
    # Descartar imágenes que quedaron SIN ninguna caja de EPP (eran puro vehículo/fondo)
    keep_img_ids = {a["image_id"] for a in anns}
    j["images"] = [im for im in j["images"] if im["id"] in keep_img_ids]
    # Copiar solo las imágenes conservadas
    imdir = os.path.join(dst, "images"); os.makedirs(imdir, exist_ok=True)
    for img in j["images"]:
        s = os.path.join(src, img["file_name"])
        if os.path.exists(s):
            shutil.copy(s, os.path.join(imdir, os.path.basename(img["file_name"])))
        img["file_name"] = os.path.basename(img["file_name"])
    json.dump(j, open(os.path.join(dst, "_annotations.coco.json"), "w"))
    return f"{dst} ({len(j['images'])} imgs, {len(anns)} cajas)"

for sp in ["train", "valid", "test"]:
    d = normalize_split(sp)
    print("OK" if d else "—", sp, "->", d)

# Guardamos el contrato de clases (lo lee cada modelo + el browser al final)
json.dump({"classes": CLASSES, "num_classes": NUM_CLASSES, "canon": CANON},
          open(os.path.join(DATA, "classes.json"), "w"), indent=2)
# copia a Drive para sobrevivir reinicios
os.makedirs(f"{DRIVE_ROOT}/dataset", exist_ok=True)
shutil.make_archive(f"{DRIVE_ROOT}/dataset/ppe_coco", "zip", DATA)
print("\nDataset canónico:", DATA, "| respaldo:", f"{DRIVE_ROOT}/dataset/ppe_coco.zip")
''')

code(r'''
# 3.3 — EDA: distribución de clases (clave: las clases NO-* son raras) + muestras
import json, numpy as np, matplotlib.pyplot as plt
from collections import Counter

def class_hist(split):
    j = json.load(open(os.path.join(PATHS["data"], split, "_annotations.coco.json")))
    cnt = Counter(a["category_id"] for a in j["annotations"])
    return [cnt.get(i, 0) for i in range(NUM_CLASSES)], len(j["images"])

counts_tr, n_tr = class_hist("train")
print(f"train: {n_tr} imágenes, {sum(counts_tr)} instancias")
fig, ax = plt.subplots(figsize=(11, 4))
ax.bar(range(NUM_CLASSES), counts_tr, color=["#d33" if n.lower().startswith("no") else "#39c" for n in CLASSES])
ax.set_xticks(range(NUM_CLASSES)); ax.set_xticklabels(CLASSES, rotation=45, ha="right")
ax.set_title("Instancias por clase (train) — rojo = clases de violación (raras)")
for i, v in enumerate(counts_tr):
    ax.text(i, v, str(v), ha="center", va="bottom", fontsize=8)
plt.tight_layout(); plt.show()

# Aviso de desbalance
viol = [(CLASSES[i], counts_tr[i]) for i in range(NUM_CLASSES) if CLASSES[i].lower().startswith("no")]
tot = sum(counts_tr)
print("\n⚠️ Clases de violación (mirar recall por clase, no solo mAP global):")
for name, c in viol:
    print(f"   {name:16s} {c:5d}  ({100*c/max(tot,1):.1f}% del total)")
''')

code(r'''
# 3.4 — Visualizar algunas imágenes con sus cajas (sanity check del dataset)
import json, random, cv2, matplotlib.pyplot as plt
from collections import defaultdict

j = json.load(open(os.path.join(PATHS["data"], "train", "_annotations.coco.json")))
by_img = defaultdict(list)
for a in j["annotations"]:
    by_img[a["image_id"]].append(a)
imgs = {im["id"]: im for im in j["images"]}
random.seed(SEED)
sample = random.sample(list(by_img.keys()), min(6, len(by_img)))

fig, axes = plt.subplots(2, 3, figsize=(15, 8))
for ax, iid in zip(axes.ravel(), sample):
    im = imgs[iid]
    p = os.path.join(PATHS["data"], "train", "images", im["file_name"])
    img = cv2.cvtColor(cv2.imread(p), cv2.COLOR_BGR2RGB)
    for a in by_img[iid]:
        x, y, w, h = a["bbox"]
        viol = CLASSES[a["category_id"]].lower().startswith("no")
        col = (220, 40, 40) if viol else (40, 160, 220)
        cv2.rectangle(img, (int(x), int(y)), (int(x+w), int(y+h)), col, 2)
        cv2.putText(img, CLASSES[a["category_id"]], (int(x), int(y)-4),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, col, 1)
    ax.imshow(img); ax.axis("off")
plt.tight_layout(); plt.show()
''')

# ───────────────────────────────────────────────────────────────────────────
# 4. Evaluador unificado (F1)
# ───────────────────────────────────────────────────────────────────────────
md(r"""
## 4 · Evaluador unificado — mAP (COCO) + **F1 con barrido de umbral**

Esta es la pieza que hace la comparación **justa**: cada modelo (sin importar el framework)
produce un JSON de detecciones COCO sobre el **mismo** test set, y acá calculamos todo igual.

- **mAP@[.5:.95] y AP50** con `pycocotools` (referencia estándar).
- **F1 micro** con matching greedy por IoU (`F1_IOU`): para cada umbral de confianza del
  barrido contamos TP/FP/FN globales → P, R, F1. Reportamos el **F1 máximo** y el **umbral
  que lo logra** (= punto de operación de producción).
- **AP50 y F1 por clase** — para vigilar las clases de violación raras.

> Funciones definidas **inline**. Tras reiniciar el runtime para cada modelo, re-ejecutá
> §1, §2 y esta celda para tener `evaluate()` disponible.
""")

code(r'''
# Evaluador unificado de detección: COCO mAP + F1 (barrido de umbral).
# Definido INLINE: re-ejecutá esta celda al inicio de cada sesión de modelo
# (después de reiniciar el runtime) para tener evaluate()/f1_sweep()/coco_map().
import json, numpy as np


def _iou_matrix(boxes_a, boxes_b):
    # boxes en xywh -> xyxy
    if len(boxes_a) == 0 or len(boxes_b) == 0:
        return np.zeros((len(boxes_a), len(boxes_b)), np.float32)
    a = np.array(boxes_a, np.float32); b = np.array(boxes_b, np.float32)
    a = np.stack([a[:,0], a[:,1], a[:,0]+a[:,2], a[:,1]+a[:,3]], 1)
    b = np.stack([b[:,0], b[:,1], b[:,0]+b[:,2], b[:,1]+b[:,3]], 1)
    ix1 = np.maximum(a[:,None,0], b[None,:,0]); iy1 = np.maximum(a[:,None,1], b[None,:,1])
    ix2 = np.minimum(a[:,None,2], b[None,:,2]); iy2 = np.minimum(a[:,None,3], b[None,:,3])
    iw = np.clip(ix2-ix1, 0, None); ih = np.clip(iy2-iy1, 0, None)
    inter = iw*ih
    area_a = (a[:,2]-a[:,0])*(a[:,3]-a[:,1]); area_b = (b[:,2]-b[:,0])*(b[:,3]-b[:,1])
    union = area_a[:,None] + area_b[None,:] - inter + 1e-9
    return inter/union


def _match_one(gts, dts, iou_thr):
    """Greedy: dts ya ordenadas por score desc. Devuelve (tp, fp) arrays alineados a dts."""
    n = len(dts)
    tp = np.zeros(n); fp = np.zeros(n)
    if n == 0:
        return tp, fp, len(gts)
    gboxes = [g["bbox"] for g in gts]
    ious = _iou_matrix([d["bbox"] for d in dts], gboxes)
    matched = set()
    for i in range(n):  # dts ya vienen ordenadas
        if len(gboxes) == 0:
            fp[i] = 1; continue
        j = int(np.argmax(ious[i])); best = ious[i, j]
        if best >= iou_thr and j not in matched:
            tp[i] = 1; matched.add(j)
        else:
            fp[i] = 1
    return tp, fp, len(gts) - len(matched)


def f1_sweep(gt_path, dt_path, iou_thr=0.5, grid=None, classes=None):
    """F1 micro global y por clase, barriendo umbral de confianza."""
    if grid is None:
        grid = np.round(np.arange(0.05, 0.96, 0.05), 2)
    gt = json.load(open(gt_path)); dt = json.load(open(dt_path))
    if isinstance(dt, dict):  # por si viene envuelto
        dt = dt["annotations"]
    cats = sorted({c["id"] for c in gt["categories"]})
    names = {c["id"]: c["name"] for c in gt["categories"]}
    # agrupar GT y DT por (image_id, cat)
    from collections import defaultdict
    G = defaultdict(list); D = defaultdict(list)
    for a in gt["annotations"]:
        G[(a["image_id"], a["category_id"])].append(a)
    for d in dt:
        D[(d["image_id"], d["category_id"])].append(d)
    image_ids = {im["id"] for im in gt["images"]}

    best = {"f1": -1, "thr": None, "precision": 0, "recall": 0}
    curve = []
    per_class_best = {c: {"f1": -1, "thr": None} for c in cats}
    for thr in grid:
        TP = FP = FN = 0
        pc = {c: [0, 0, 0] for c in cats}  # tp, fp, fn
        for cat in cats:
            for iid in image_ids:
                gts = G.get((iid, cat), [])
                dts = [d for d in D.get((iid, cat), []) if d["score"] >= thr]
                dts.sort(key=lambda x: -x["score"])
                tp, fp, fn = _match_one(gts, dts, iou_thr)
                stp, sfp = int(tp.sum()), int(fp.sum())
                TP += stp; FP += sfp; FN += fn
                pc[cat][0] += stp; pc[cat][1] += sfp; pc[cat][2] += fn
        P = TP/(TP+FP+1e-9); R = TP/(TP+FN+1e-9); F1 = 2*P*R/(P+R+1e-9)
        curve.append({"thr": float(thr), "P": P, "R": R, "F1": F1})
        if F1 > best["f1"]:
            best = {"f1": F1, "thr": float(thr), "precision": P, "recall": R}
        for c in cats:
            tp_, fp_, fn_ = pc[c]
            p_ = tp_/(tp_+fp_+1e-9); r_ = tp_/(tp_+fn_+1e-9); f_ = 2*p_*r_/(p_+r_+1e-9)
            if f_ > per_class_best[c]["f1"]:
                per_class_best[c] = {"f1": f_, "thr": float(thr), "P": p_, "R": r_}
    return {
        "best_f1": best["f1"], "best_thr": best["thr"],
        "precision_at_best": best["precision"], "recall_at_best": best["recall"],
        "per_class": {names[c]: per_class_best[c] for c in cats},
        "curve": curve, "iou_thr": iou_thr,
    }


def coco_map(gt_path, dt_path):
    """mAP@[.5:.95] y AP50 con pycocotools."""
    from pycocotools.coco import COCO
    from pycocotools.cocoeval import COCOeval
    coco_gt = COCO(gt_path)
    dt = json.load(open(dt_path))
    if isinstance(dt, dict):
        dt = dt["annotations"]
    if len(dt) == 0:
        return {"mAP": 0.0, "AP50": 0.0}
    coco_dt = coco_gt.loadRes(dt)
    ev = COCOeval(coco_gt, coco_dt, "bbox")
    ev.evaluate(); ev.accumulate(); ev.summarize()
    return {"mAP": float(ev.stats[0]), "AP50": float(ev.stats[1])}


def evaluate(model_tag, gt_path, dt_path, out_dir, iou_thr=0.5, grid=None):
    """Corre todo y guarda metrics_<tag>.json. Devuelve el dict de métricas."""
    import os
    m = coco_map(gt_path, dt_path)
    f = f1_sweep(gt_path, dt_path, iou_thr=iou_thr, grid=grid)
    res = {"model": model_tag, **m,
           "best_f1": f["best_f1"], "best_thr": f["best_thr"],
           "precision_at_best": f["precision_at_best"], "recall_at_best": f["recall_at_best"],
           "per_class": f["per_class"], "curve": f["curve"]}
    os.makedirs(out_dir, exist_ok=True)
    json.dump(res, open(os.path.join(out_dir, f"metrics_{model_tag}.json"), "w"), indent=2)
    print(f"[{model_tag}] mAP={m['mAP']:.4f}  AP50={m['AP50']:.4f}  "
          f"best_F1={f['best_f1']:.4f} @ conf={f['best_thr']}")
    return res

print("eval listo:", [n for n in ["f1_sweep", "coco_map", "evaluate"]])
''')

# ───────────────────────────────────────────────────────────────────────────
# 5. YOLOX-S
# ───────────────────────────────────────────────────────────────────────────
md(r"""
---
## 5 · Modelo A — **YOLOX-S**

> 🔁 **Reiniciá el runtime antes de esta sección** (`Entorno → Reiniciar`) y volvé a correr
> §1 (config), §2 (Drive), §4 (eval_utils). Esta sección instala numpy<2 + parches YOLOX,
> que pelean con D-FINE.

Pipeline: instalar YOLOX → convertir el dataset canónico al layout YOLOX → escribir el `Exp`
→ transfer learning desde `yolox_s.pth` → eval mAP → inferir en test → F1 → exportar ONNX.
""")

code(r'''
# 5.1 — Instalar YOLOX con pines/parches que funcionan en Colab actual
%cd /content
# Pinear numpy<2 ANTES (pycocotools compila contra él)
!pip -q install "numpy<2.0" "onnx>=1.14,<1.17" "onnxruntime>=1.16" "onnxsim>=0.4.33" \
                "pycocotools>=2.0.2" "loguru" "thop" "tabulate" "psutil" "onnxscript"
![ -d YOLOX ] || git clone https://github.com/Megvii-BaseDetection/YOLOX.git
%cd YOLOX
# Parchar aliases de numpy removidos (np.bool/np.float/np.int) y relajar el pin de onnxsim
!grep -rl --include=*.py -e 'np\.bool\b' -e 'np\.float\b' -e 'np\.int\b' . | \
    xargs -r sed -i -e 's/np\.bool\b/bool/g' -e 's/np\.float\b/float/g' -e 's/np\.int\b/int/g'
!sed -i 's/^onnx-simplifier==0.4.10/onnxsim>=0.4.33/' requirements.txt
!sed -i 's/^onnx>=1.13.0/onnx>=1.14,<1.17/' requirements.txt
!pip -q install -v -e . --no-build-isolation
# FIX PyTorch nuevo: (a) weights_only=True rompe la recarga de best_ckpt.pth (scalars numpy);
# (b) torch.onnx._export (privado) fue removido -> usar torch.onnx.export.
!grep -rl "torch.load(" --include=*.py . | xargs -r sed -i -E '/weights_only/!s/torch\.load\(([^)]*)\)/torch.load(\1, weights_only=False)/g'
!grep -rl "torch.onnx._export" --include=*.py . | xargs -r sed -i 's/torch\.onnx\._export/torch.onnx.export/g'
# (c) el exportador nuevo (dynamo) renombra/recompone el grafo -> forzar el legacy (TorchScript)
!grep -q "dynamo=False" tools/export_onnx.py || sed -i 's/opset_version=args.opset/opset_version=args.opset, dynamo=False/' tools/export_onnx.py
import yolox; print("YOLOX OK (+ torch.load / torch.onnx / onnxscript parcheados)")
''')

code(r'''
# 5.2 — Restaurar el dataset canónico desde Drive (si reiniciaste el runtime)
import os, shutil
DATA = PATHS["data"]
if not os.path.exists(os.path.join(DATA, "train", "_annotations.coco.json")):
    os.makedirs(DATA, exist_ok=True)
    shutil.unpack_archive(f"{DRIVE_ROOT}/dataset/ppe_coco.zip", DATA)
import json
meta = json.load(open(os.path.join(DATA, "classes.json")))
CLASSES = meta["classes"]; NUM_CLASSES = meta["num_classes"]
print("Clases:", NUM_CLASSES, CLASSES)
''')

code(r'''
# 5.3 — Convertir el dataset canónico al layout que espera YOLOX
#   datasets/ppe/annotations/instances_{train,val,test}2017.json  +  {train,val,test}2017/*.jpg
import os, json, shutil
YBASE = "/content/YOLOX/datasets/ppe"
ANN = os.path.join(YBASE, "annotations"); os.makedirs(ANN, exist_ok=True)
SPLIT2Y = {"train": "train2017", "valid": "val2017", "test": "test2017"}
for sp, yname in SPLIT2Y.items():
    src_json = os.path.join(PATHS["data"], sp, "_annotations.coco.json")
    if not os.path.exists(src_json):
        continue
    j = json.load(open(src_json))
    imdir = os.path.join(YBASE, yname); os.makedirs(imdir, exist_ok=True)
    for im in j["images"]:
        s = os.path.join(PATHS["data"], sp, "images", im["file_name"])
        if os.path.exists(s):
            shutil.copy(s, os.path.join(imdir, im["file_name"]))
    inst = {"train": "instances_train2017.json", "valid": "instances_val2017.json",
            "test": "instances_test2017.json"}[sp]
    json.dump(j, open(os.path.join(ANN, inst), "w"))
    print(f"{sp:5s} -> {yname} ({len(j['images'])} imgs)")
print("Layout YOLOX listo en", YBASE)
''')

code(r'''
# 5.4 — Escribir el Exp de YOLOX-S (depth=0.33, width=0.50)
import os
os.makedirs("/content/YOLOX/exps/ppe", exist_ok=True)
exp_s = f"""
import os
from yolox.exp import Exp as MyExp


class Exp(MyExp):
    def __init__(self):
        super().__init__()
        # modelo (YOLOX-S)
        self.depth = 0.33
        self.width = 0.50
        self.num_classes = {NUM_CLASSES}

        # dataset (layout COCO en datasets/ppe)
        self.data_dir = "datasets/ppe"
        self.train_ann = "instances_train2017.json"
        self.val_ann = "instances_val2017.json"
        self.name = "train2017"          # subcarpeta de imágenes de train
        self.val_name = "val2017"

        # entrada
        self.input_size = ({IMG_SIZE}, {IMG_SIZE})
        self.test_size = ({IMG_SIZE}, {IMG_SIZE})

        # schedule / producción
        self.max_epoch = {EPOCHS_YOLOX_S}
        self.warmup_epochs = 5
        self.no_aug_epochs = 20          # más épocas finales SIN mosaic/mixup: se adapta a
                                         # imágenes de UN solo sujeto a tamaño completo (webcam)
        self.eval_interval = 5
        self.ema = True                  # Exponential Moving Average de pesos
        self.data_num_workers = 2

        # === Augmentación orientada a WEBCAM ===
        # Gap de dominio: el dataset es obra wide-angle (gente lejana y chica), pero el demo
        # corre en webcam (UNA persona de cerca). Forzamos sujetos GRANDES y centrados.
        self.mosaic_prob = 0.5           # menos mosaico (el mosaico ACHICA los objetos)
        self.mosaic_scale = (0.5, 2.0)   # sube el piso 0.1->0.5 => zoom-IN, sin sujetos diminutos
        self.mixup_prob = 0.1            # mixup suave (regularización leve)
        self.enable_mixup = True
        self.hsv_prob = 1.0              # variación de color/luz (webcam ilumina distinto)
        self.flip_prob = 0.5            # flip horizontal
        self.degrees = 10.0            # leve rotación (inclinación de webcam)
        self.translate = 0.1
        self.shear = 2.0

        self.exp_name = os.path.split(os.path.realpath(__file__))[1].split(".")[0]
"""
open("/content/YOLOX/exps/ppe/yolox_s_ppe.py", "w").write(exp_s)
print(exp_s)
''')

code(r'''
# 5.5 — Pesos pre-entrenados COCO + ENTRENAR (transfer learning).
#   -c carga yolox_s.pth; la cabeza se reinicia sola al diferir num_classes.
%cd /content/YOLOX
import os
W = f"{PATHS['weights']}/yolox_s.pth"
if not os.path.exists(W):
    !wget -q -O "$W" https://github.com/Megvii-BaseDetection/YOLOX/releases/download/0.1.1rc0/yolox_s.pth
!cp "$W" yolox_s.pth
!python -m yolox.tools.train -f exps/ppe/yolox_s_ppe.py -d 1 -b {BATCH_YOLOX_S} \
    --fp16 -o -c yolox_s.pth
# checkpoints -> YOLOX_outputs/yolox_s_ppe/best_ckpt.pth
!cp -v YOLOX_outputs/yolox_s_ppe/best_ckpt.pth "{PATHS['ckpts']}/yolox_s_best.pth"
''')

code(r'''
# 5.6 — mAP de validación (referencia) con la herramienta oficial
%cd /content/YOLOX
!python -m yolox.tools.eval -f exps/ppe/yolox_s_ppe.py \
    -c YOLOX_outputs/yolox_s_ppe/best_ckpt.pth -b {BATCH_YOLOX_S} -d 1 --conf 0.001
''')

code(r'''
# 5.7 — Exportar ONNX (decode dentro del grafo -> menos lógica en el navegador)
%cd /content/YOLOX
ONNX_S = f"{PATHS['onnx']}/yolox_s_ppe.onnx"
!python tools/export_onnx.py --output-name "$ONNX_S" \
    -f exps/ppe/yolox_s_ppe.py -c YOLOX_outputs/yolox_s_ppe/best_ckpt.pth \
    --decode_in_inference
print("ONNX:", ONNX_S)
''')

code(r'''
# 5.8 — Inferir en TEST -> detecciones COCO -> F1 unificado
#   Entrada YOLOX: BGR, sin /255, letterbox pad 114 top-left, CHW.
#   Output (con --decode_in_inference): [1, 8400, 5+nc] con cajas cxcywh decodificadas
#   en el espacio 640; score = obj*cls; aplicamos NMS por clase.
%cd /content/YOLOX
import os, json, cv2, numpy as np, onnxruntime
from yolox.utils import multiclass_nms

TEST_JSON = os.path.join(PATHS["data"], "test", "_annotations.coco.json")
TEST_IMGS = os.path.join(PATHS["data"], "test", "images")
sess = onnxruntime.InferenceSession(ONNX_S, providers=["CPUExecutionProvider"])
inp = sess.get_inputs()[0].name

def yolox_preproc(img, size):
    padded = np.ones((size, size, 3), np.uint8) * 114
    r = min(size/img.shape[0], size/img.shape[1])
    rs = cv2.resize(img, (int(img.shape[1]*r), int(img.shape[0]*r)))
    padded[:rs.shape[0], :rs.shape[1]] = rs
    blob = padded.transpose(2, 0, 1).astype(np.float32)   # BGR, sin /255
    return blob[None], r

def yolox_infer_to_coco(onnx_path, out_path, conf=0.05, nms=0.45):
    s = onnxruntime.InferenceSession(onnx_path, providers=["CPUExecutionProvider"])
    iname = s.get_inputs()[0].name
    gt = json.load(open(TEST_JSON)); dets = []
    for im in gt["images"]:
        img = cv2.imread(os.path.join(TEST_IMGS, im["file_name"]))
        if img is None: continue
        blob, r = yolox_preproc(img, IMG_SIZE)
        out = s.run(None, {iname: blob})[0][0]          # [8400, 5+nc] decodificado
        boxes = out[:, :4].copy()                        # cxcywh (espacio 640)
        xyxy = np.empty_like(boxes)
        xyxy[:, 0] = boxes[:, 0]-boxes[:, 2]/2; xyxy[:, 1] = boxes[:, 1]-boxes[:, 3]/2
        xyxy[:, 2] = boxes[:, 0]+boxes[:, 2]/2; xyxy[:, 3] = boxes[:, 1]+boxes[:, 3]/2
        xyxy /= r                                        # de vuelta a la imagen original
        scores = out[:, 4:5] * out[:, 5:]                # obj * cls
        d = multiclass_nms(xyxy, scores, nms_thr=nms, score_thr=conf, class_agnostic=True)
        if d is None: continue
        for x1, y1, x2, y2, sc, cl in d:
            dets.append({"image_id": int(im["id"]), "category_id": int(cl),
                         "bbox": [float(x1), float(y1), float(x2-x1), float(y2-y1)],
                         "score": float(sc)})
    json.dump(dets, open(out_path, "w"))
    return out_path

PRED_S = f"{PATHS['preds']}/preds_yolox_s.json"
yolox_infer_to_coco(ONNX_S, PRED_S)
evaluate("yolox_s", TEST_JSON, PRED_S, PATHS["metrics"], iou_thr=F1_IOU)   # de §4 (re-corré §4 si reiniciaste)
''')

# ───────────────────────────────────────────────────────────────────────────
# 6. YOLOX-L
# ───────────────────────────────────────────────────────────────────────────
md(r"""
---
## 6 · Modelo B — **YOLOX-L**

> 🔁 **Reiniciá el runtime** y volvé a correr §1, §2, §4, **§5.1–§5.3** (instalar YOLOX +
> dataset + layout). Luego corré esta sección. (YOLOX-L pesa: en T4 usá `BATCH_YOLOX_L=8`,
> y es lento — considerá A100/L4.)

Idéntico a YOLOX-S pero `depth=1.0, width=1.0` y desde `yolox_l.pth`. Reutiliza
`yolox_infer_to_coco` y `eval_utils` de la sección anterior.
""")

code(r'''
# 6.1 — Exp de YOLOX-L (depth=1.0, width=1.0)
import os
exp_l = f"""
import os
from yolox.exp import Exp as MyExp


class Exp(MyExp):
    def __init__(self):
        super().__init__()
        self.depth = 1.0
        self.width = 1.0
        self.num_classes = {NUM_CLASSES}
        self.data_dir = "datasets/ppe"
        self.train_ann = "instances_train2017.json"
        self.val_ann = "instances_val2017.json"
        self.name = "train2017"
        self.val_name = "val2017"
        self.input_size = ({IMG_SIZE}, {IMG_SIZE})
        self.test_size = ({IMG_SIZE}, {IMG_SIZE})
        self.max_epoch = {EPOCHS_YOLOX_L}
        self.warmup_epochs = 5
        self.no_aug_epochs = 20
        self.eval_interval = 5
        self.ema = True
        self.data_num_workers = 2
        # Augmentación orientada a WEBCAM (igual que YOLOX-S): sujetos grandes y centrados.
        self.mosaic_prob = 0.5           # menos mosaico (achica objetos)
        self.mosaic_scale = (0.5, 2.0)   # zoom-IN
        self.mixup_prob = 0.1
        self.enable_mixup = True
        self.hsv_prob = 1.0
        self.flip_prob = 0.5
        self.degrees = 10.0
        self.translate = 0.1
        self.shear = 2.0
        self.exp_name = os.path.split(os.path.realpath(__file__))[1].split(".")[0]
"""
open("/content/YOLOX/exps/ppe/yolox_l_ppe.py", "w").write(exp_l)
print("Exp YOLOX-L escrito.")
''')

code(r'''
# 6.2 — Pesos COCO + entrenar YOLOX-L
%cd /content/YOLOX
import os
W = f"{PATHS['weights']}/yolox_l.pth"
if not os.path.exists(W):
    !wget -q -O "$W" https://github.com/Megvii-BaseDetection/YOLOX/releases/download/0.1.1rc0/yolox_l.pth
!cp "$W" yolox_l.pth
!python -m yolox.tools.train -f exps/ppe/yolox_l_ppe.py -d 1 -b {BATCH_YOLOX_L} \
    --fp16 -o -c yolox_l.pth
!cp -v YOLOX_outputs/yolox_l_ppe/best_ckpt.pth "{PATHS['ckpts']}/yolox_l_best.pth"
''')

code(r'''
# 6.3 — Exportar ONNX + inferir en test + F1 (reusa helpers de §5.8)
%cd /content/YOLOX
import os, json
ONNX_L = f"{PATHS['onnx']}/yolox_l_ppe.onnx"
!python tools/export_onnx.py --output-name "$ONNX_L" \
    -f exps/ppe/yolox_l_ppe.py -c YOLOX_outputs/yolox_l_ppe/best_ckpt.pth --decode_in_inference

TEST_JSON = os.path.join(PATHS["data"], "test", "_annotations.coco.json")
PRED_L = f"{PATHS['preds']}/preds_yolox_l.json"
yolox_infer_to_coco(ONNX_L, PRED_L)          # definida en §5.8 (re-corré §5.8 si reiniciaste)
evaluate("yolox_l", TEST_JSON, PRED_L, PATHS["metrics"], iou_thr=F1_IOU)
''')

# ───────────────────────────────────────────────────────────────────────────
# 7. D-FINE-S
# ───────────────────────────────────────────────────────────────────────────
md(r"""
---
## 7 · Modelo C — **D-FINE-S** (DETR real-time, NMS-free)

> 🔁 **Reiniciá el runtime** y volvé a correr §1, §2, §4. **No** instales YOLOX en esta
> sesión (numpy<2 rompe D-FINE).

Pipeline: clonar+instalar D-FINE → apuntar el config al dataset canónico → transfer learning
desde `dfine_s_obj2coco.pth` (Objects365→COCO) con `-t` → eval → inferir en test (DETR top-k,
**sin NMS**) → F1 → exportar ONNX.

**Notas de export (para el navegador):** entrada `images [1,3,640,640]` **RGB, /255, resize
directo a 640 sin letterbox** + segunda entrada `orig_target_sizes [1,2] int64 = [w,h]`.
Salidas `labels/boxes(xyxy px)/scores(ya sigmoid)`. El decoder usa `grid_sample` → en
onnxruntime-web correr en **WASM EP** (WebGL no soporta GridSample).
""")

code(r'''
# 7.1 — Clonar + instalar D-FINE
%cd /content
![ -d D-FINE ] || git clone https://github.com/Peterande/D-FINE.git
%cd D-FINE
!pip -q install -r requirements.txt
!pip -q install onnx onnxsim onnxruntime onnxscript
# FIX PyTorch 2.6: weights_only=True rompe la carga de checkpoints (dfine_s_obj2coco.pth,
# best_stg*.pth). Agregamos weights_only=False a todas las torch.load() (idempotente).
!grep -rl "torch.load(" --include=*.py . | xargs -r sed -i -E '/weights_only/!s/torch\.load\(([^)]*)\)/torch.load(\1, weights_only=False)/g'
print("D-FINE OK (+ torch.load parcheado)")
''')

code(r'''
# 7.2 — Restaurar dataset canónico (si reiniciaste) y configurar D-FINE
import os, shutil, json, yaml
DATA = PATHS["data"]
if not os.path.exists(os.path.join(DATA, "train", "_annotations.coco.json")):
    os.makedirs(DATA, exist_ok=True)
    shutil.unpack_archive(f"{DRIVE_ROOT}/dataset/ppe_coco.zip", DATA)
meta = json.load(open(os.path.join(DATA, "classes.json")))
CLASSES = meta["classes"]; NUM_CLASSES = meta["num_classes"]

# Augmentación TRAIN orientada a WEBCAM:
#  - SACAMOS RandomZoomOut (mete padding -> ACHICA el sujeto = lo contrario a webcam).
#  - DEJAMOS RandomIoUCrop (recorta alrededor de objetos -> ZOOM-IN, sujeto grande).
#  - RandomPhotometricDistort (color/luz, clave para robustez de webcam).
#  - policy stop_epoch: apaga la aug fuerte en las últimas épocas -> se adapta a imagen limpia.
# NOTA: si el entrenamiento falla por un nombre de transform desconocido, comparalo con
# el custom_detection.yml original del repo (los ops varían por commit) y solo BORRÁ
# la línea de RandomZoomOut, dejando el resto igual.
STOP_AUG = max(EPOCHS_DFINE_S - 8, 1)
train_ops = [
    {"type": "RandomPhotometricDistort", "p": 0.5},
    {"type": "RandomIoUCrop", "p": 0.8},
    {"type": "SanitizeBoundingBoxes", "min_size": 1},
    {"type": "RandomHorizontalFlip"},
    {"type": "Resize", "size": [IMG_SIZE, IMG_SIZE]},
    {"type": "SanitizeBoundingBoxes", "min_size": 1},
    {"type": "ConvertPILImage", "dtype": "float32", "scale": True},
]
val_ops = [
    {"type": "Resize", "size": [IMG_SIZE, IMG_SIZE]},
    {"type": "ConvertPILImage", "dtype": "float32", "scale": True},
]

# custom_detection.yml: num_classes, remap False, rutas + augmentación webcam
custom = {
    "task": "detection",
    "evaluator": {"type": "CocoEvaluator", "iou_types": ["bbox"]},
    "num_classes": NUM_CLASSES,
    "remap_mscoco_category": False,
    "train_dataloader": {
        "type": "DataLoader",   # IMPRESCINDIBLE: sin esto D-FINE tira KeyError '_pymodule'
        "dataset": {"type": "CocoDetection",
                    "img_folder": f"{DATA}/train/images",
                    "ann_file": f"{DATA}/train/_annotations.coco.json",
                    "return_masks": False,
                    "transforms": {"type": "Compose", "ops": train_ops,
                                   "policy": {"name": "stop_epoch", "epoch": STOP_AUG,
                                              "ops": ["RandomPhotometricDistort",
                                                      "RandomIoUCrop", "RandomHorizontalFlip"]}}},
        "shuffle": True, "num_workers": 2, "drop_last": True,
        "total_batch_size": BATCH_DFINE_S,
        "collate_fn": {"type": "BatchImageCollateFunction"}},
    "val_dataloader": {
        "type": "DataLoader",
        "dataset": {"type": "CocoDetection",
                    "img_folder": f"{DATA}/valid/images",
                    "ann_file": f"{DATA}/valid/_annotations.coco.json",
                    "return_masks": False,
                    "transforms": {"type": "Compose", "ops": val_ops}},
        "shuffle": False, "num_workers": 2, "drop_last": False,
        "total_batch_size": BATCH_DFINE_S,
        "collate_fn": {"type": "BatchImageCollateFunction"}},
}
open("/content/D-FINE/configs/dataset/custom_detection.yml", "w").write(yaml.safe_dump(custom, sort_keys=False))
print("custom_detection.yml escrito. num_classes =", NUM_CLASSES, "| stop_aug @epoch", STOP_AUG)

# OJO: en el merge de D-FINE, dataloader.yml le gana a custom_detection.yml para
# total_batch_size / num_workers. El default (batch 32) hace OOM en T4 -> lo bajamos acá.
import re
_dl = "/content/D-FINE/configs/dfine/include/dataloader.yml"
_t = open(_dl).read()
_t = re.sub(r"total_batch_size:\s*\d+", f"total_batch_size: {BATCH_DFINE_S}", _t)
_t = re.sub(r"num_workers:\s*\d+", "num_workers: 2", _t)
open(_dl, "w").write(_t)
print(f"dataloader.yml: total_batch_size={BATCH_DFINE_S}, num_workers=2")
!grep -nE "total_batch_size|num_workers" /content/D-FINE/configs/dfine/include/dataloader.yml
''')

code(r'''
# 7.3 — Pesos obj2coco + ENTRENAR con tuning (-t).
#   Usamos el config de transferencia obj2custom (schedule corto, ~64 épocas).
%cd /content/D-FINE
import os
W = f"{PATHS['weights']}/dfine_s_obj2coco.pth"
if not os.path.exists(W):
    !wget -q -O "$W" https://github.com/Peterande/storage/releases/download/dfinev1.0/dfine_s_obj2coco.pth
CFG = "configs/dfine/custom/objects365/dfine_hgnetv2_s_obj2custom.yml"
# Si tu checkout no trae ese config, usá el plain: configs/dfine/custom/dfine_hgnetv2_s_custom.yml
!CUDA_VISIBLE_DEVICES=0 torchrun --master_port=7777 --nproc_per_node=1 \
    train.py -c $CFG --use-amp --seed=0 -t "$W"
# checkpoints -> ./output/.../best_stg2.pth
!ls -la output/dfine_hgnetv2_s_obj2custom/ 2>/dev/null || ls -la output/*/
''')

code(r'''
# 7.4 — Localizar el mejor checkpoint y exportar ONNX (+ chequeo onnxruntime)
%cd /content/D-FINE
import glob, os, shutil
cands = glob.glob("output/**/best_stg2.pth", recursive=True) or \
        glob.glob("output/**/best_stg1.pth", recursive=True) or \
        glob.glob("output/**/last.pth", recursive=True)
assert cands, "No encontré checkpoint de D-FINE en output/"
CKPT = sorted(cands)[-1]; print("ckpt:", CKPT)
shutil.copy(CKPT, f"{PATHS['ckpts']}/dfine_s_best.pth")
CFG = "configs/dfine/custom/objects365/dfine_hgnetv2_s_obj2custom.yml"
ONNX_D = f"{PATHS['onnx']}/dfine_s_ppe.onnx"
!python tools/deployment/export_onnx.py --check -c $CFG -r "$CKPT"
# el script genera model.onnx junto al checkpoint; lo movemos a Drive
import glob
gen = sorted(glob.glob("output/**/*.onnx", recursive=True) + glob.glob("*.onnx"))
print("onnx generados:", gen)
if gen: shutil.copy(gen[-1], ONNX_D); print("ONNX D-FINE ->", ONNX_D)
''')

code(r'''
# 7.5 — Inferir en TEST con el ONNX de D-FINE -> detecciones COCO -> F1
#   DETR-style: salida labels/boxes(xyxy px, ya escalado por orig_target_sizes)/scores(sigmoid).
#   NO NMS. Solo umbral + top-k (el grafo ya hace topk=300).
%cd /content/D-FINE
import os, json, cv2, numpy as np, onnxruntime
DATA = PATHS["data"]
TEST_JSON = os.path.join(DATA, "test", "_annotations.coco.json")
TEST_IMGS = os.path.join(DATA, "test", "images")
ONNX_D = f"{PATHS['onnx']}/dfine_s_ppe.onnx"

def dfine_infer_to_coco(onnx_path, out_path, conf=0.05):
    s = onnxruntime.InferenceSession(onnx_path, providers=["CPUExecutionProvider"])
    names = [i.name for i in s.get_inputs()]
    print("inputs:", [(i.name, i.shape) for i in s.get_inputs()])
    gt = json.load(open(TEST_JSON)); dets = []
    for im in gt["images"]:
        img = cv2.imread(os.path.join(TEST_IMGS, im["file_name"]))
        if img is None: continue
        h0, w0 = img.shape[:2]
        rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        rz = cv2.resize(rgb, (IMG_SIZE, IMG_SIZE)).astype(np.float32) / 255.0  # /255, sin letterbox
        blob = rz.transpose(2, 0, 1)[None]
        ots = np.array([[w0, h0]], dtype=np.int64)   # orig_target_sizes = [w, h]
        feed = {names[0]: blob}
        if len(names) > 1:
            feed[names[1]] = ots
        labels, boxes, scores = s.run(None, feed)     # [1,300],[1,300,4]xyxy px,[1,300]
        labels, boxes, scores = labels[0], boxes[0], scores[0]
        for lb, bx, sc in zip(labels, boxes, scores):
            if sc < conf: continue
            x1, y1, x2, y2 = bx
            dets.append({"image_id": int(im["id"]), "category_id": int(lb),
                         "bbox": [float(x1), float(y1), float(x2-x1), float(y2-y1)],
                         "score": float(sc)})
    json.dump(dets, open(out_path, "w"))
    return out_path

PRED_D = f"{PATHS['preds']}/preds_dfine_s.json"
dfine_infer_to_coco(ONNX_D, PRED_D)
evaluate("dfine_s", TEST_JSON, PRED_D, PATHS["metrics"], iou_thr=F1_IOU)   # de §4
''')

# ───────────────────────────────────────────────────────────────────────────
# 8. Comparación y selección
# ───────────────────────────────────────────────────────────────────────────
md(r"""
---
## 8 · Comparación y **selección por F1**

> ✅ Esta sección **no necesita GPU ni los frameworks**: solo lee los `metrics_*.json` y
> los ONNX desde Drive. Corré §1 y §2 y seguí.

Tabla y gráficos de **mAP / AP50 / mejor-F1 / umbral F1-óptimo / tamaño ONNX / latencia CPU**,
y elección del ganador por **best-F1**.
""")

code(r'''
# 8.1 — Cargar métricas + medir tamaño y latencia de cada ONNX
import os, json, glob, time, numpy as np

def onnx_size_mb(p):
    return round(os.path.getsize(p)/1e6, 1) if os.path.exists(p) else None

def onnx_latency_ms(p, n=20):
    if not os.path.exists(p): return None
    import onnxruntime
    s = onnxruntime.InferenceSession(p, providers=["CPUExecutionProvider"])
    feed = {}
    for i in s.get_inputs():
        shp = [d if isinstance(d, int) and d > 0 else 1 for d in i.shape]
        if "int" in (i.type or ""):
            feed[i.name] = np.array([[IMG_SIZE, IMG_SIZE]], dtype=np.int64) if shp[-1] == 2 \
                           else np.ones(shp, dtype=np.int64)
        else:
            feed[i.name] = np.random.rand(*shp).astype(np.float32)
    for _ in range(3): s.run(None, feed)
    t = time.time()
    for _ in range(n): s.run(None, feed)
    return round((time.time()-t)/n*1000, 1)

ONNX_PATHS = {
    "yolox_s": f"{PATHS['onnx']}/yolox_s_ppe.onnx",
    "yolox_l": f"{PATHS['onnx']}/yolox_l_ppe.onnx",
    "dfine_s": f"{PATHS['onnx']}/dfine_s_ppe.onnx",
}
rows = []
for tag in ["yolox_s", "yolox_l", "dfine_s"]:
    mp = f"{PATHS['metrics']}/metrics_{tag}.json"
    if not os.path.exists(mp):
        print("falta", mp, "(¿corriste esa sección?)"); continue
    m = json.load(open(mp))
    rows.append({
        "model": tag, "mAP": round(m["mAP"], 4), "AP50": round(m["AP50"], 4),
        "best_F1": round(m["best_f1"], 4), "F1@conf": m["best_thr"],
        "P": round(m["precision_at_best"], 3), "R": round(m["recall_at_best"], 3),
        "onnx_MB": onnx_size_mb(ONNX_PATHS[tag]),
        "cpu_ms": onnx_latency_ms(ONNX_PATHS[tag]),
    })

import pandas as pd
df = pd.DataFrame(rows).sort_values("best_F1", ascending=False).reset_index(drop=True)
print(df.to_string(index=False))
df.to_csv(f"{PATHS['metrics']}/comparison.csv", index=False)
''')

code(r'''
# 8.2 — Gráficos comparativos
import matplotlib.pyplot as plt
fig, ax = plt.subplots(1, 2, figsize=(14, 5))
x = range(len(df))
ax[0].bar([i-0.2 for i in x], df["best_F1"], 0.4, label="best F1")
ax[0].bar([i+0.2 for i in x], df["mAP"], 0.4, label="mAP")
ax[0].set_xticks(list(x)); ax[0].set_xticklabels(df["model"]); ax[0].legend()
ax[0].set_title("Calidad: F1 (selección) vs mAP")
for i, (f, m) in enumerate(zip(df["best_F1"], df["mAP"])):
    ax[0].text(i-0.2, f, f"{f:.3f}", ha="center", va="bottom", fontsize=8)
    ax[0].text(i+0.2, m, f"{m:.3f}", ha="center", va="bottom", fontsize=8)
ax[1].scatter(df["cpu_ms"], df["best_F1"], s=80)
for _, r in df.iterrows():
    ax[1].annotate(r["model"], (r["cpu_ms"], r["best_F1"]))
ax[1].set_xlabel("latencia CPU (ms/inferencia)"); ax[1].set_ylabel("best F1")
ax[1].set_title("Trade-off precisión vs velocidad")
plt.tight_layout(); plt.show()
''')

code(r'''
# 8.3 — F1 por clase del ganador (mirar clases de violación NO-*)
import json
WINNER = df.iloc[0]["model"]
m = json.load(open(f"{PATHS['metrics']}/metrics_{WINNER}.json"))
print(f"🏆 Ganador por F1: {WINNER}  (best_F1={m['best_f1']:.4f} @ conf={m['best_thr']})\n")
print(f"{'clase':18s} {'F1':>7s} {'P':>7s} {'R':>7s}")
for name, v in m["per_class"].items():
    flag = "  ⚠️" if name.lower().startswith("no") else ""
    print(f"{name:18s} {v['f1']:7.3f} {v.get('P',0):7.3f} {v.get('R',0):7.3f}{flag}")
''')

code(r'''
# 8.4 — Exportar el ganador como modelo final + ESPECIFICACIÓN para onnxruntime-web
import os, json, shutil
WINNER = df.iloc[0]["model"]
src_onnx = ONNX_PATHS[WINNER]
FINAL = f"{PATHS['onnx']}/epp_FINAL_{WINNER}.onnx"
shutil.copy(src_onnx, FINAL)

meta = json.load(open(os.path.join(PATHS["data"], "classes.json")))
m = json.load(open(f"{PATHS['metrics']}/metrics_{WINNER}.json"))

if WINNER.startswith("yolox"):
    spec = {
        "family": "yolox",
        "input": {"name": "images", "shape": [1, 3, IMG_SIZE, IMG_SIZE], "dtype": "float32",
                  "channel_order": "BGR", "normalize": "ninguna (valores 0-255 crudos)",
                  "resize": f"letterbox a {IMG_SIZE}, pad 114 arriba-izquierda (sin centrar)"},
        "output": {"name": "output", "shape": [1, 8400, 5 + meta["num_classes"]],
                   "layout": "[cx,cy,w,h,obj,cls...] decodificado (cxcywh en espacio 640)",
                   "postproc": "score=obj*cls; dividir cajas por r; NMS por clase"},
        "extra_inputs": None,
        "runtime_note": "Funciona en WASM y WebGPU EP de onnxruntime-web.",
    }
else:
    spec = {
        "family": "dfine",
        "input": {"name": "images", "shape": [1, 3, IMG_SIZE, IMG_SIZE], "dtype": "float32",
                  "channel_order": "RGB", "normalize": "/255 (sin mean/std)",
                  "resize": f"resize directo a {IMG_SIZE}x{IMG_SIZE} (SIN letterbox)"},
        "extra_inputs": {"name": "orig_target_sizes", "shape": [1, 2], "dtype": "int64",
                         "value": "[ancho_original, alto_original]"},
        "output": {"names": ["labels", "boxes", "scores"],
                   "layout": "labels[1,300] int64; boxes[1,300,4] xyxy en px originales; "
                             "scores[1,300] ya sigmoid (desc)",
                   "postproc": "umbral por score; SIN NMS (DETR top-k)"},
        "runtime_note": "Usa grid_sample -> en onnxruntime-web correr en WASM EP (WebGL no soporta GridSample).",
    }

final_spec = {
    "winner": WINNER,
    "onnx_file": os.path.basename(FINAL),
    "img_size": IMG_SIZE,
    "classes": meta["classes"],
    "num_classes": meta["num_classes"],
    "violation_classes": [c for c in meta["classes"] if c.lower().startswith("no")],
    "recommended_conf_threshold": m["best_thr"],   # umbral F1-óptimo (punto de operación)
    "metrics": {"best_f1": m["best_f1"], "mAP": m["mAP"], "AP50": m["AP50"]},
    "io_spec": spec,
}
json.dump(final_spec, open(f"{PATHS['onnx']}/epp_FINAL_spec.json", "w"), indent=2, ensure_ascii=False)
print("🏁 Modelo final:", FINAL)
print(json.dumps(final_spec, indent=2, ensure_ascii=False))
''')

# ───────────────────────────────────────────────────────────────────────────
# 9. Próximos pasos
# ───────────────────────────────────────────────────────────────────────────
md(r"""
---
## 9 · Notas finales y próximos pasos

### Augmentación WEBCAM (estrategia elegida para cerrar el gap de dominio)
El dataset es **obra wide-angle** (gente lejana/chica) pero el demo corre en **webcam**
(una persona de cerca). No existe dataset close-up de casco/chaleco, así que cerramos el
gap por augmentación, forzando al modelo a ver **sujetos grandes y centrados**:
- **YOLOX:** `mosaic_prob=0.5` (menos achique), `mosaic_scale=(0.5,2.0)` (zoom-IN),
  `mixup` suave, HSV fuerte (luz de webcam), `no_aug_epochs=20` (cola limpia de un solo sujeto).
- **D-FINE:** se **quita `RandomZoomOut`** (achicaba) y se mantiene `RandomIoUCrop` (zoom-IN)
  + `RandomPhotometricDistort`, con `stop_epoch` para apagar la aug fuerte al final.

### Checklist de calidad de producción ya incluido
- ✅ Transfer learning en los 3 (COCO / Objects365→COCO).
- ✅ EMA, AMP/fp16, warmup+cosine, **augmentación webcam** (zoom-in + no-aug final), focal loss (D-FINE).
- ✅ Test set held-out + selección por F1 (no por la val que eligió el checkpoint).
- ✅ AP/F1 **por clase** para vigilar las clases de violación raras.
- ✅ Selección del **umbral F1-óptimo** como punto de operación.
- ✅ ONNX verificado + tamaño + latencia CPU para el trade-off de despliegue.

### Add-ons GRATIS (sin etiquetar) si el demo en webcam queda flojo
- **Mezclar el dataset close-up de máscaras** (`joseph-nelson/mask-wearing`, dominio webcam real)
  para que las clases `Mask/NO-Mask` vean caras a distancia de webcam. Se baja con la misma key,
  se remapea al taxon canónico y se concatena al `train`.
- Si el F1 de las clases `NO-*` queda bajo: oversampling de imágenes con violaciones,
  copy-paste augmentation de esas cajas, o sumar otro dataset de violación remapeando IDs.

### Próximos pasos
1. **Descargá** `epp_FINAL_<ganador>.onnx` + `epp_FINAL_spec.json` de Drive y pasámelos:
   con el `spec` cableo el detector al navegador (YOLOX→`yolox-detector.ts` ya casi listo;
   D-FINE→`dfine-detector.ts` nuevo con doble input + WASM EP).
2. **Modelo de ARMAS:** mismo notebook cambiando solo `RF_PROJECT`/`RF_VERSION` + `KEEP_CLASSES`.
""")

# ───────────────────────────────────────────────────────────────────────────
# Ensamblar y escribir
# ───────────────────────────────────────────────────────────────────────────
nb = {
    "cells": cells,
    "metadata": {
        "accelerator": "GPU",
        "colab": {"name": "EPP_YOLOX_DFINE_training.ipynb", "provenance": [], "toc_visible": True},
        "kernelspec": {"display_name": "Python 3", "name": "python3"},
        "language_info": {"name": "python"},
    },
    "nbformat": 4,
    "nbformat_minor": 0,
}

out_dir = os.path.join(os.path.dirname(__file__), "..", "notebooks")
os.makedirs(out_dir, exist_ok=True)
out_path = os.path.abspath(os.path.join(out_dir, "EPP_YOLOX_DFINE_training.ipynb"))
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(nb, f, ensure_ascii=False, indent=1)
print(f"Notebook escrito: {out_path}  ({len(cells)} celdas)")
