#!/usr/bin/env python3
"""Adaptador real (metodo A del molde): cuerpos articulados por cinematica con contactos verificados.

Lee  : --guion guion.json  --params parametros.json  --out salida/
Escribe: salida/trayectoria.npz (contrato MANIFIESTO-DESCARGAS.md seccion 5) + salida/escena_render.json
         (todo lo que necesita el render: actores, objetos, vehiculos, muebles, zonas, lineas, eventos en cuadros).

Que es fisica real aqui y que no (honesto):
  * Pies: un pie apoyado NO se mueve (cero deslizamiento); siempre hay al menos un pie en el piso.
  * Agarre: el objeto se une a la mano SOLO cuando pulgar + indice (y palma) quedan a < 5 mm de su superficie
    (regla APRENDIZAJES 2026-11-09). Mientras se sostiene, el objeto sigue a la palma con desfase fijo.
  * Soltar/caer de objetos: caida libre con gravedad (g=9.81) hasta el destino o el piso, con rebote amortiguado.
  * Cuerpos: esqueleto de 23 articulaciones con capsulas por hueso; penetracion cuerpo-mueble y cuerpo-cuerpo
    la mide el verificador, no se "pinta" por encima.
  * Humo/fuego/aspecto (uniforme, casco, chaqueta): solo marcas para el render; no son fisica.
Parametros declarados (los unicos que el orquestador toca): ver PARAMS_DEFECTO.
"""
import json, argparse, math, os
from pathlib import Path
import numpy as np

PARAMS_DEFECTO = {"semilla": 1, "ruta_holgura_m": 0.0, "friccion_pie": 0.9, "agarre_cierre_dedos": 1.0,
                  "colision_margen_m": 0.0, "suavizado_pose": 0.0, "union_mano_objeto": 1,
                  "paso_largo_m": 0.60, "paso_dur_s": 0.30, "altura_paso_m": 0.10, "separacion_personas_m": 0.0}

# ---- esqueleto (23 articulaciones)
J = dict(pelvis=0, espina=1, pecho=2, cuello=3, cabeza=4,
         hi=5, ci=6, mi=7, pi=8, ii=9, di=10,      # brazo izq: hombro, codo, muneca/palma, pulgar, indice, medio
         hd=11, cd=12, md=13, pd=14, id=15, dd=16,  # brazo der
         cai=17, roi=18, pie_i=19, cad=20, rod=21, pie_d=22)
NJ = 23
RADIO = np.array([.12, .11, .13, .05, .10, .06, .045, .035, .008, .008, .008, .06, .045, .035, .008, .008, .008,
                  .08, .06, .04, .08, .06, .04])
HUESOS = np.array([(0, 1), (1, 2), (2, 3), (3, 4), (2, 5), (5, 6), (6, 7), (7, 8), (7, 9), (7, 10),
                   (2, 11), (11, 12), (12, 13), (13, 14), (13, 15), (13, 16), (0, 17), (17, 18), (18, 19), (0, 20), (20, 21), (21, 22)])
HUESOS_R = np.array([.11, .12, .05, .07, .06, .045, .035, .008, .008, .008, .06, .045, .035, .008, .008, .008, .08, .06, .04, .08, .06, .04])
Z_PIE = 0.04          # centro del pie apoyado (radio 0.04 -> altura de contacto 0)
RADIO_OBJ = {"caja_pequena": .04, "botella": .035, "celular": .03, "maleta": .20, "canastilla": .22, "caja_grande": .25,
             "lacteo": .045, "pistola": .05, "cuchillo": .04, "fleje": .02, "pila_cajas": .4, "estiba_cargada": .6,
             "contenedor": .4, "carro": .35, "monitor": .2, "silla": .25, "nevera": .4, "lector": .1, "bolsa": .15,
             "puerta": .5, "puerta_batiente": .5, "puerta_corrediza": .5, "barrera": .3, "auto": 1.0, "moto": .5, "furgon": 1.5}
G = 9.81


def suave(u):
    u = np.clip(u, 0, 1)
    return u * u * (3 - 2 * u)


def interp_ruta(ruta, t):
    """ruta [[x,y,t],...] -> posicion (x,y) y direccion unitaria en el tiempo t (espera en los tramos de t igual)."""
    r = np.asarray(ruta, float)
    if t <= r[0, 2]:
        p = r[0, :2]
    elif t >= r[-1, 2]:
        p = r[-1, :2]
    else:
        k = np.searchsorted(r[:, 2], t, side="right") - 1
        a, b = r[k], r[k + 1]
        u = (t - a[2]) / max(b[2] - a[2], 1e-6)
        p = a[:2] + (b[:2] - a[:2]) * suave(u)
    # direccion: al siguiente punto distinto
    d = np.array([0.0, 1.0])
    k_act = min(max(np.searchsorted(r[:, 2], t, side="right") - 1, 0), len(r) - 2)
    # tramo vigente; si es de espera (longitud 0), la ultima direccion con la que se llego
    for k in range(k_act, -1, -1):
        seg = r[k + 1, :2] - r[k, :2]
        if np.linalg.norm(seg) > 1e-6:
            d = seg / np.linalg.norm(seg); break
    else:
        for k in range(k_act, len(r) - 1):
            seg = r[k + 1, :2] - r[k, :2]
            if np.linalg.norm(seg) > 1e-6:
                d = seg / np.linalg.norm(seg); break
    return p, d


def dist_caja_min(pts, cajas):
    """distancia con signo minima de cada punto (N,3) a cualquier caja (M,6)."""
    mn, mx = cajas[:, :3], cajas[:, 3:]
    c, h = (mn + mx) / 2.0, (mx - mn) / 2.0
    q = np.abs(pts[:, None, :] - c) - h
    fuera = np.linalg.norm(np.maximum(q, 0.0), axis=-1)
    dentro = np.minimum(np.max(q, axis=-1), 0.0)
    return (fuera + dentro).min(axis=1)


def fuera_de_muebles(xy, obst, margen):
    """saca un punto 2D del footprint de cualquier mueble (expandido margen) por la cara mas cercana."""
    if obst is None or not len(obst):
        return xy
    xy = np.array(xy, float)
    for _ in range(3):
        for c in obst:
            if c[5] < 0.05: continue
            mg = margen + (0.15 if c[5] > 1.0 else 0.0)
            x0, y0, x1, y1 = c[0] - mg, c[1] - mg, c[3] + mg, c[4] + mg
            if x0 < xy[0] < x1 and y0 < xy[1] < y1:
                opts = [xy[0] - x0, x1 - xy[0], xy[1] - y0, y1 - xy[1]]; j = int(np.argmin(opts))
                xy = xy + np.array([[-opts[0], 0], [opts[1], 0], [0, -opts[2]], [0, opts[3]]][j], float)
    return xy


class Persona:
    obst = None
    otros = []
    sep = 1.10

    def __init__(self, a, T, fps, P):
        self.a, self.T, self.fps, self.P = a, T, fps, P
        self.pos = np.zeros((T, NJ, 3))
        self.sentado_hasta = a.get("sentado_hasta")
        self.caida_t = None
        self.lean_req = np.zeros((T, 2, 3))    # inclinacion pedida por cada brazo (i, d) en cada cuadro
        self.activo = np.zeros((T, 2), bool)   # brazo (i, d) con accion en ese cuadro

    # -- cuerpo basico: pelvis siguiendo la ruta, pies con pasos reales
    def pelvis_ruta(self):
        T, fps = self.T, self.fps
        pel = np.zeros((T, 2)); dirs = np.zeros((T, 2))
        for f in range(T):
            pel[f], dirs[f] = interp_ruta(self.a["ruta"], f / fps)
        return pel, dirs

    def cinematica(self, pel=None):
        T, fps, P = self.T, self.fps, self.P
        pel0, dirs = self.pelvis_ruta()
        if pel is None:
            pel = pel0
        else:   # direccion real de la marcha corregida; quieto -> conserva la de la ruta
            v = np.gradient(pel, axis=0) * fps
            rap = np.linalg.norm(v, axis=1)
            d0 = dirs[0].copy(); dirs = np.zeros_like(dirs); ult = d0
            for f in range(T):
                if rap[f] > 0.15: ult = v[f] / rap[f]
                dirs[f] = ult
        k = max(3, int(0.6 * fps)); ker = np.ones(k) / k
        ang = np.unwrap(np.arctan2(dirs[:, 1], dirs[:, 0]))
        ang = np.convolve(np.pad(ang, (k // 2, k - 1 - k // 2), mode="edge"), ker, "valid")
        dirs = np.stack([np.cos(ang), np.sin(ang)], 1)
        lado = np.stack([dirs[:, 1], -dirs[:, 0]], 1)     # derecha de la persona
        ancho = 0.10
        pies = np.zeros((T, 2, 3))
        plant = [pel[0] - lado[0] * ancho, pel[0] + lado[0] * ancho]   # izq, der
        swing = None   # (pie, f0, f1, origen, destino)
        paso_l, paso_d, alt = P["paso_largo_m"], P["paso_dur_s"], P["altura_paso_m"]
        nf_paso = max(2, int(round(paso_d * fps)))
        prox = 0
        for f in range(T):
            if swing is None:
                # el pie mas atrasado respecto a la pelvis en la direccion de marcha
                atras = [np.dot(plant[i] - pel[f], dirs[f]) for i in range(2)]
                lejos = [np.linalg.norm(plant[i] - pel[f]) for i in range(2)]
                i = int(np.argmin(atras)) if min(atras) < -paso_l / 2 else int(np.argmax(lejos))
                if (atras[i] < -paso_l / 2 or lejos[i] > 0.35) and f >= prox and f + nf_paso <= T - 2:
                    nf_paso = max(2, int(round((paso_d if lejos[i] < 0.6 else 0.22) * fps)))
                    f1 = min(T - 1, f + nf_paso)
                    dest = pel[min(T - 1, f1 + 2)] + dirs[f1] * (paso_l / 2) + lado[f1] * ancho * (1 if i else -1)
                    nf = max(nf_paso, int(np.linalg.norm(dest - plant[i]) / 2.5 * fps) + 1)
                    f1 = min(T - 1, f + nf)
                    dest = pel[min(T - 1, f1 + 2)] + dirs[f1] * (paso_l / 2) + lado[f1] * ancho * (1 if i else -1)
                    dd_ = dest - plant[i]; ld_ = np.linalg.norm(dd_)
                    rap_f = np.linalg.norm(pel[min(T - 1, f + 1)] - pel[f]) * fps
                    tope = 1.0 if rap_f < 1.8 else 1.3
                    if ld_ > tope:
                        dest = plant[i] + dd_ / ld_ * tope
                        nf = max(nf_paso, int(tope / 3.5 * fps) + 1); f1 = min(T - 1, f + nf)
                    dest = fuera_de_muebles(dest, self.obst, 0.10)
                    for po in self.otros:          # lejos de la pelvis de los demas (sus pies estan alrededor), mirando 0,2 s adelante
                        hol = min(0.90, 0.8 * self.sep)
                        for ff in (min(T - 1, f1), min(T - 1, f1 + 6)):
                            q = dest - po[ff]; nq = np.linalg.norm(q)
                            if nq < hol:
                                dest = po[ff] + (q / nq if nq > 1e-6 else dirs[f1]) * hol
                    if f1 <= T - 2:
                        swing = (i, f, f1, plant[i].copy(), dest)
            if swing is not None:
                i, f0, f1, o, d = swing
                u = (f - f0) / max(f1 - f0, 1)
                xy = o + (d - o) * suave((u - 0.06) / 0.88)
                z = Z_PIE + alt * math.sqrt(max(0.0, math.sin(math.pi * min(u, 1.0))))
                pies[f, i] = (*xy, z)
                pies[f, 1 - i] = (*plant[1 - i], Z_PIE)
                if f >= f1:
                    plant[i] = d.copy(); swing = None; prox = f + 1
            else:
                pies[f, 0] = (*plant[0], Z_PIE); pies[f, 1] = (*plant[1], Z_PIE)
        # alturas del tronco (de pie); sentado se ajusta luego
        zp = 0.95
        for f in range(T):
            d = dirs[f]; l = lado[f]
            p = self.pos[f]
            px, py = pel[f]
            p[J["pelvis"]] = (px, py, zp)
            p[J["espina"]] = (px, py, zp + 0.20)
            p[J["pecho"]] = (px, py, zp + 0.40)
            p[J["cuello"]] = (px, py, zp + 0.55)
            p[J["cabeza"]] = (px, py, zp + 0.70)
            for s, lab in ((-1, "i"), (1, "d")):
                hombro = np.array([px, py, zp + 0.48]) + np.array([*(l * s * 0.20), 0])
                codo = hombro + np.array([*(l * s * 0.04), -0.28])
                muneca = codo + np.array([*(d * 0.05), -0.26])
                p[J["h" + lab]] = hombro; p[J["c" + lab]] = codo; p[J["m" + lab]] = muneca
                p[J["p" + lab]] = muneca + np.array([*(d * 0.05), -0.03]) + np.array([*(l * -s * 0.03), 0])
                p[J["i" + lab]] = muneca + np.array([*(d * 0.02), -0.09])
                p[J["d" + lab]] = muneca + np.array([*(d * 0.0), -0.10])
            for s, lab, pie in ((-1, "i", 0), (1, "d", 1)):
                cad = np.array([px, py, zp - 0.05]) + np.array([*(l * s * 0.10), 0])
                pf = pies[f, pie]
                p[J["pie_" + lab]] = pf
                rod = (cad + pf) / 2 + np.array([*(d * 0.08), 0.02]) + np.array([0, 0, max(0.0, 0.5 - np.linalg.norm(cad - pf) / 2)])
                rod[2] = max(rod[2], 0.12)
                p[J["ca" + lab] if lab == "i" else J["cad"]] = cad
                p[J["roi"] if lab == "i" else J["rod"]] = rod
        self.pel, self.dirs, self.lado = pel, dirs, lado

    def aplicar_lean(self):
        """Pasada final: una inclinacion por cuadro (la mayor pedida por los brazos), limitada por los muebles y
        suavizada 0.3 s; mueve tronco, hombros y el brazo que este ocioso; recoloca codos y despeja ambos brazos."""
        T = self.T
        req = np.where((np.linalg.norm(self.lean_req[:, 0], axis=1) >= np.linalg.norm(self.lean_req[:, 1], axis=1))[:, None],
                       self.lean_req[:, 0], self.lean_req[:, 1])
        ks_t = ("pecho", "cuello", "cabeza", "hi", "hd")
        brazo_j = {0: ("ci", "mi", "pi", "ii", "di"), 1: ("cd", "md", "pd", "id", "dd")}
        lean = np.zeros((T, 3))
        for f in range(T):
            sh = req[f]
            if not sh.any():
                continue
            ks = list(ks_t) + [k for a in (0, 1) if not self.activo[f, a] for k in brazo_j[a]]
            esc = 1.0
            if self.obst is not None and len(self.obst):
                base = np.stack([self.pos[f, J[k]] for k in ks]); rad = np.array([RADIO[J[k]] for k in ks])
                lo, hi = 0.0, 1.0
                for _ in range(10):
                    mid = (lo + hi) / 2
                    if (dist_caja_min(base + sh * mid, self.obst) - rad >= 0.01).all(): lo = mid
                    else: hi = mid
                esc = lo
            lean[f] = sh * esc
        k = max(3, int(0.3 * self.fps)); ker = np.ones(k) / k
        for c in range(3):
            lean[:, c] = np.convolve(np.pad(lean[:, c], (k // 2, k - 1 - k // 2), mode="edge"), ker, "valid")
        for f in range(T):
            p = self.pos[f]
            if lean[f].any():
                ks = list(ks_t) + [k for a in (0, 1) if not self.activo[f, a] for k in brazo_j[a]]
                for k in ks:
                    p[J[k]] += lean[f]
                for a, mano in ((0, "i"), (1, "d")):
                    if self.activo[f, a]:
                        ho, co, m = J["h" + mano], J["c" + mano], J["m" + mano]
                        p[co] = (p[ho] + p[m]) / 2 + np.array([0, 0, 0.05 if p[m][2] < p[ho][2] - 0.15 else -0.08])
            for a, mano in ((0, "i"), (1, "d")):
                if self.activo[f, a]:
                    self.despejar_brazo(p, mano, debug=bool(os.environ.get("DEBUG_AGARRE")) and f == int(os.environ.get("DEBUG_F", "-1")))
        self.lean = lean

    def despejar_brazo(self, p, mano, debug=False):
        """sube palma, dedos y codo (en z, de a 1 cm) hasta que brazo y antebrazo no penetren ningun mueble."""
        if self.obst is None or not len(self.obst):
            return
        m, pu, ind, med, co, ho = (J[k + mano] for k in ("m", "p", "i", "d", "c", "h"))
        for _ in range(40):
            seg = np.concatenate([p[ho] + (p[co] - p[ho]) * np.linspace(0, 1, 6)[:, None], p[co] + (p[m] - p[co]) * np.linspace(0, 1, 6)[:, None], p[[pu, ind, med]]])
            rad = np.concatenate([np.full(6, RADIO[co]), np.full(6, RADIO[m]), np.full(3, RADIO[pu])])
            pen = rad - dist_caja_min(seg, self.obst)
            if debug:
                np.set_printoptions(linewidth=250)
                print("   [despejar]", mano, "pen mm", np.round(pen * 1000, 1))
            if (pen[:12] <= -0.005).all():
                break
            if pen[11] > -0.005:          # la palma misma toca: sube toda la mano
                for k in (m, pu, ind, med, co):
                    p[k] = p[k] + np.array([0, 0, 0.01])
            else:                          # solo brazo/antebrazo: sube el codo
                p[co] = p[co] + np.array([0, 0, 0.01])

    # -- modificadores de pose
    def sentarse(self, f0, f1, asiento):
        """pelvis sobre el asiento (z 0.50), pies fijos en el piso adelante, tronco vertical; transiciones de 0.8 s."""
        tr = int(0.8 * self.fps)
        for f in range(max(0, f0 - tr), min(self.T, f1 + tr)):
            w = 1.0
            if f < f0: w = suave((f - (f0 - tr)) / tr)
            elif f >= f1: w = 1 - suave((f - f1) / tr)
            p = self.pos[f]; d = self.dirs[f]; l = self.lado[f]
            base = np.array([asiento[0], asiento[1], 0.50])
            sent = p.copy()
            for k in ("pelvis", "espina", "pecho", "cuello", "cabeza", "hi", "ci", "mi", "pi", "ii", "di", "hd", "cd", "md", "pd", "id", "dd"):
                sent[J[k]] = p[J[k]] - p[J["pelvis"]] + base if k != "pelvis" else base
            for s, pie, cad, rod in ((-1, "pie_i", "cai", "roi"), (1, "pie_d", "cad", "rod")):
                sent[J[cad]] = base + np.array([*(l * s * 0.10), -0.05])
                sent[J[rod]] = sent[J[cad]] + np.array([*(d * 0.40), 0.0])
                sent[J[pie]] = np.array([*(sent[J[rod]][:2] + d * 0.05), Z_PIE])
            pies_g = p[[J["pie_i"], J["pie_d"]]].copy()
            p[:] = p + (sent - p) * w
            p[[J["pie_i"], J["pie_d"]]] = pies_g        # los pies quedan donde los dejo la marcha (apoyados, quietos)

    def caer(self, f0, fps, dur=0.8):
        """gira el cuerpo alrededor de los pies hasta quedar tendido; los pies no se mueven."""
        f1 = min(self.T - 1, f0 + int(dur * fps))
        ref = self.pos[f0].copy()
        d = self.dirs[f0]
        piv = (ref[J["pie_i"]] + ref[J["pie_d"]]) / 2 * np.array([1, 1, 0])
        for f in range(f0, self.T):
            u = suave((f - f0) / max(f1 - f0, 1))
            ang = u * (math.pi / 2 - 0.08)      # queda casi horizontal, apoyado en el costado del cuerpo
            for k in range(NJ):
                q = ref[k] - piv
                # rotacion alrededor del eje lateral (perpendicular a d) que pasa por los pies
                alt = q[2]; adel = np.dot(q[:2], d)
                z = alt * math.cos(ang) + 0.0
                ade = adel + alt * math.sin(ang)
                lat = q[:2] - d * adel
                xyz = np.array([*(piv[:2] + lat + d * ade), z])
                self.pos[f, k] = xyz
            # radio del cuerpo: que nada quede bajo el piso
            for k in range(NJ):
                self.pos[f, k, 2] = max(self.pos[f, k, 2], RADIO[k])
            for k in (J["pie_i"], J["pie_d"]):
                self.pos[f, k] = ref[k]

    def brazo(self, mano, f0, f1, objetivo, agarre=None, ro=0.0, cerrar=1.0):
        """mueve muneca/dedos de la mano ('i' o 'd') hacia objetivo(f)->xyz entre f0 y f1 (y lo sostiene hasta f1).
        agarre: si se da un objeto (centro xyz y radio), coloca los dedos SOBRE su superficie (contacto)."""
        m, pu, ind, med, co, ho = J["m" + mano], J["p" + mano], J["i" + mano], J["d" + mano], J["c" + mano], J["h" + mano]
        f0 = max(0, f0); f1 = min(self.T - 1, f1)
        ini = {k: self.pos[max(0, f0 - 1), k].copy() for k in (m, pu, ind, med)}     # pose real previa
        ref = {k: self.pos[max(0, f0 - 1), J["pelvis"]].copy() for k in (m,)}
        n_ret = int(0.5 * self.fps)
        otra = "i" if mano == "d" else "d"
        ks_base = ("pecho", "cuello", "cabeza", "hi", "hd", "c" + mano)
        ks_otra = ("c" + otra, "m" + otra, "p" + otra, "i" + otra, "d" + otra)
        ia, io = (0 if mano == "i" else 1), (0 if otra == "i" else 1)
        ult_sh = self.lean_req[max(0, f0 - 1), ia].copy()
        ini[co] = self.pos[max(0, f0 - 1), co].copy()
        for f in range(f0, min(self.T, f1 + 1 + n_ret)):
            p = self.pos[f]
            self.activo[f, ia] = True
            if f > f1:    # vuelta al reposo: de la ultima pose de accion a la pose base de este cuadro
                w = suave((f - f1) / max(1, n_ret))
                self.lean_req[f, ia] = ult_sh * (1 - w)
                arco = np.array([0, 0, 0.12 * math.sin(math.pi * w)])
                for k in (m, pu, ind, med, co):
                    p[k] = ult[k] + (p[J["pelvis"]] - ult_pel) + (p[k] - (ult[k] + (p[J["pelvis"]] - ult_pel))) * w + arco
                continue
            tgt = np.asarray(objetivo(f), float)
            u = suave((f - f0) / max(1, int(0.6 * self.fps))) if f - f0 < int(0.6 * self.fps) else 1.0
            reposo = ini[m] + (p[J["pelvis"]] - ref[m])      # la pose previa, desplazada con el cuerpo
            hombro = p[ho]
            if agarre is not None:
                c, r = tgt, ro
                hacia = hombro - c; hacia[2] *= 0.3
                n = hacia / max(np.linalg.norm(hacia), 1e-6)
                palma_fin = c + (n * 0.6 + np.array([0, 0, 0.8])) / np.linalg.norm(n * 0.6 + np.array([0, 0, 0.8])) * (r + 0.004 + 0.03)   # palma arriba-atras del objeto, a 3 cm
                if self.obst is not None and len(self.obst):   # la palma no entra en mesas ni bandejas: sube lo justo
                    for _ in range(30):
                        if dist_caja_min(palma_fin[None], self.obst)[0] >= RADIO[m] + 0.005: break
                        palma_fin = palma_fin + np.array([0, 0, 0.01])
                # dedos: pulgar a un lado, indice/medio al otro, a 3 mm de la superficie (contacto < 5 mm)
                lat = np.array([*self.lado[f], 0.0]); lat -= n * np.dot(lat, n); lat /= max(np.linalg.norm(lat), 1e-6)
                arriba = np.cross(lat, n); arriba /= max(np.linalg.norm(arriba), 1e-6)
                up = np.array([0, 0, 1.0])
                v1 = n * 0.3 + lat + up * 0.6; v2 = n * 0.3 - lat + up * 0.6; v3 = n * 0.2 - lat * 0.5 + up * 0.9
                pul_fin = c + v1 / np.linalg.norm(v1) * (r + 0.003)
                ind_fin = c + v2 / np.linalg.norm(v2) * (r + 0.003)
                med_fin = c + v3 / np.linalg.norm(v3) * (r + 0.003)
                # el cierre parcial (parametro) separa los dedos: solo con cierre>=0.5 hay contacto real
                sep = (1.0 - min(cerrar, 1.0)) * 0.02
                pul_fin += (pul_fin - c) / np.linalg.norm(pul_fin - c) * sep
                ind_fin += (ind_fin - c) / np.linalg.norm(ind_fin - c) * sep
                med_fin += (med_fin - c) / np.linalg.norm(med_fin - c) * sep
            else:
                palma_fin = tgt
                pul_fin = tgt + np.array([0, 0, -0.03]); ind_fin = tgt + np.array([0.02, 0, -0.06]); med_fin = tgt + np.array([0, 0, -0.07])
            if agarre is not None:
                nh = np.array([n[0], n[1], 0.0]); nh = nh / max(np.linalg.norm(nh), 1e-6)
                via = nh * 0.16 + np.array([0, 0, 0.14])          # punto de paso: hacia la persona y por encima
                def curva(a0, a1, uu, via=via):                   # Bezier cuadratica a0 -> (a1+via) -> a1
                    b = a1 + via
                    return (1 - uu) ** 2 * a0 + 2 * (1 - uu) * uu * b + uu ** 2 * a1
                p[m] = curva(reposo, palma_fin, u)
                for k, fin_k in ((pu, pul_fin), (ind, ind_fin), (med, med_fin)):
                    prev = ini[k] + (p[J["pelvis"]] - ref[m])
                    p[k] = curva(prev, fin_k, u)
            else:
                via = np.array([0, 0, 0.14])
                def curva(a0, a1, uu, via=via):
                    b = a0 * 0.65 + a1 * 0.35 + via          # primero sube desde donde esta, despues va al destino
                    return (1 - uu) ** 2 * a0 + 2 * (1 - uu) * uu * b + uu ** 2 * a1
                p[m] = curva(reposo, palma_fin, u)
                for k, fin_k in ((pu, pul_fin), (ind, ind_fin), (med, med_fin)):
                    prev = ini[k] + (p[J["pelvis"]] - ref[m])
                    p[k] = curva(prev, fin_k, u)
            ult = {k: p[k].copy() for k in (m, pu, ind, med)}; ult_pel = p[J["pelvis"]].copy()
            # inclinacion pedida si no alcanza (> 0.62 m del hombro); se aplica en aplicar_lean() al final
            alc = np.linalg.norm(p[m] - hombro)
            sh = (p[m] - hombro) * (alc - 0.62) / alc * 0.9 if alc > 0.62 else np.zeros(3)
            sh = ult_sh + (sh - ult_sh) * min(1.0, 0.25 + u * 0.75)
            self.lean_req[f, ia] = sh; ult_sh = sh
            codo_fin = (p[ho] + p[m]) / 2 + np.array([0, 0, 0.05 if p[m][2] < p[ho][2] - 0.15 else -0.08])
            prev_co = ini[co] + (p[J["pelvis"]] - ref[m])
            p[co] = prev_co + (codo_fin - prev_co) * u
            ult[co] = p[co].copy()


def caida(p0, v0, z_fin, fps, T_max):
    """caida libre con gravedad hasta z_fin (rebote amortiguado). Devuelve lista de posiciones por cuadro."""
    out, p, v = [], np.array(p0, float), np.array(v0, float)
    dt = 1.0 / fps
    for _ in range(T_max):
        v[2] -= G * dt
        p = p + v * dt
        if p[2] <= z_fin:
            p[2] = z_fin
            if abs(v[2]) < 0.6:
                v[:] = 0
            else:
                v[2] = -v[2] * 0.3; v[:2] *= 0.6
        out.append(p.copy())
        if not v.any() and p[2] <= z_fin + 1e-9:
            break
    return out


def muebles_colision(cajas, frente_y=None, frente_x=None):
    """gondolas (altas, poco profundas, largas; el largo puede ir en x o en y) -> panel trasero (lado opuesto a la gente)
    + 5 bandejas; el resto, caja tal cual. frente_y / frente_x: centro de la gente, decide el lado del frente.
    gondolas: (caja, frente, eje) con eje 'x' (largo en x, frente ±y) o 'y' (largo en y, frente ±x)."""
    out, gondolas = [], []
    for c in cajas:
        x0, y0, z0, x1, y1, z1 = c
        dx, dy = x1 - x0, y1 - y0
        if z1 >= 1.5 and min(dx, dy) <= 0.7 and max(dx, dy) >= 1.0:
            if dx >= dy:
                cy = (y0 + y1) / 2
                frente = 1 if (frente_y is None or frente_y >= cy) else -1
                out.append([x0, y0, z0, x1, y0 + 0.05, z1] if frente > 0 else [x0, y1 - 0.05, z0, x1, y1, z1])
                eje = "x"
            else:
                cx = (x0 + x1) / 2
                frente = 1 if (frente_x is None or frente_x >= cx) else -1       # +1: la gente esta en x mayor
                out.append([x0, y0, z0, x0 + 0.05, y1, z1] if frente > 0 else [x1 - 0.05, y0, z0, x1, y1, z1])
                eje = "y"
            for z in (0.0, 0.4, 0.8, 1.2, 1.6):
                out.append([x0, y0, max(z0, z - 0.03), x1, y1, z])
            gondolas.append((list(c), frente, eje))
        else:
            out.append(list(c))
    return np.array(out, float) if out else np.zeros((0, 6)), gondolas


def snap_gondola(obj, gondolas):
    """un producto 'en la gondola' se apoya sobre la bandeja mas cercana, 10 cm dentro del borde del frente."""
    x, y, z = obj.pos[0]
    for g, frente, eje in gondolas:
        x0, y0, z0, x1, y1, z1 = g
        if x0 - 0.3 <= x <= x1 + 0.3 and y0 - 0.5 <= y <= y1 + 0.5:
            band = min((0.4, 0.8, 1.2, 1.6), key=lambda b: abs(b - (z - obj.r)))
            if eje == "x":
                obj.pos[:] = (x, (y1 - 0.10) if frente > 0 else (y0 + 0.10), band + obj.r)
            else:
                obj.pos[:] = ((x1 - 0.10) if frente > 0 else (x0 + 0.10), y, band + obj.r)
            return True
    return False


SURTIDO = [("caja_pequena", 0.08, 0.05, 0.12), ("botella", 0.07, 0.07, 0.25), ("lacteo", 0.08, 0.08, 0.20), ("caja_mediana", 0.14, 0.09, 0.18)]


def surtir_gondolas(gondolas, objetos, eventos, dur, libres_x=0.40):
    """Rellena cada bandeja con filas de productos, dejando libre (± libres_x) la zona de los objetos de la escena
    y de los destinos de 'soltar'. Devuelve (cajas_colision (N,6), productos_render [dict]).
    Honestidad: la colision usa la caja envolvente de cada fila (mas grande que los productos: conservadora)."""
    cajas, prods = [], []
    ocupados = []     # (x, z_bandeja) que deben quedar libres
    for o in objetos.values():
        ocupados.append((float(o.pos[0][0]), float(o.pos[0][2] - o.r)))
    for e in eventos:
        if e.get("tipo") == "soltar" and e.get("destino"):
            ocupados.append((float(e["destino"][0]), float(e["destino"][2])))
    rng = np.random.default_rng(7)
    for gi, (g, frente, eje) in enumerate(gondolas):
        x0, y0, z0, x1, y1, z1 = g
        if eje == "x":
            yf = (y1 - 0.11) if frente > 0 else (y0 + 0.11); a0, a1 = x0, x1
        else:
            xf = (x1 - 0.11) if frente > 0 else (x0 + 0.11); a0, a1 = y0, y1
        for band in (0.0, 0.4, 0.8, 1.2):
            if band + 0.03 > z1: continue
            tipo, ax, ay, az = SURTIDO[rng.integers(len(SURTIDO))]
            if band + az > z1 - 0.02: tipo, ax, ay, az = SURTIDO[0]
            paso = ax + 0.02
            n = int((a1 - a0 - 0.1) / paso)
            fila = []
            def cerrar_fila():
                if len(fila) >= 1:
                    if eje == "x":
                        xs = [p["pos"][0] for p in fila]
                        cajas.append([min(xs) - ax / 2, yf - ay / 2, band, max(xs) + ax / 2, yf + ay / 2, band + az])
                    else:
                        ys_ = [p["pos"][1] for p in fila]
                        cajas.append([xf - ay / 2, min(ys_) - ax / 2, band, xf + ay / 2, max(ys_) + ax / 2, band + az])
            for i in range(n):
                u = a0 + 0.08 + ax / 2 + i * paso
                if eje == "x" and any(abs(u - ox) < libres_x and abs(band - oz) < 0.25 for ox, oz in ocupados):
                    cerrar_fila(); fila = []
                    continue
                pos_ = [round(u, 3), round(yf, 3), round(band + az / 2, 3)] if eje == "x" else [round(xf, 3), round(u, 3), round(band + az / 2, 3)]
                p = {"id": f"surt_{gi}_{int(band*10)}_{i}", "tipo": tipo, "pos": pos_, "tam": [ax, ay, az] if eje == "x" else [ay, ax, az], "tono": int(rng.integers(4))}
                prods.append(p); fila.append(p)
            cerrar_fila()
    return (np.array(cajas, float) if cajas else np.zeros((0, 6))), prods


def snap_punto(dest, gondolas, r):
    """destino 'en la gondola' -> sobre la bandeja mas cercana, 10 cm dentro del frente."""
    x, y, z = dest
    for g, frente, eje in gondolas:
        x0, y0, z0, x1, y1, z1 = g
        if x0 - 0.3 <= x <= x1 + 0.3 and y0 - 0.5 <= y <= y1 + 0.5:
            band = min((0.4, 0.8, 1.2, 1.6), key=lambda b: abs(b - (z - r)))
            if eje == "x":
                return [x, (y1 - 0.10) if frente > 0 else (y0 + 0.10), band]
            return [(x1 - 0.10) if frente > 0 else (x0 + 0.10), y, band]
    return list(dest)


def evitar(pels, obst, fps, d_pers=0.72, margen_mueble=0.36, iters=400, fijos=None):
    """Relaja las trayectorias de pelvis (lista de (T,2)) para que las personas no se atraviesen
    (distancia >= d_pers) ni pisen muebles (cajas expandidas margen_mueble). Suaviza 0.5 s por vuelta."""
    P = len(pels); T = pels[0].shape[0]
    pel = np.stack(pels, 0).copy()
    fijos = fijos or [False] * P
    peso = np.array([0.0 if fj else 1.0 for fj in fijos])
    k = max(3, int(0.3 * fps)); ker = np.ones(k) / k
    cajas = [(c[0] - mg, c[1] - mg, c[3] + mg, c[4] + mg) for c in obst if c[5] > 0.3 for mg in [margen_mueble + (0.15 if c[5] > 1.0 else 0.0)]]
    for it in range(iters):
        mov = 0.0
        for i in range(P):
            for j in range(i + 1, P):
                d = pel[i] - pel[j]; n = np.linalg.norm(d, axis=1)
                m = n < d_pers
                if m.any():
                    dirn = np.where(n[:, None] > 1e-6, d / np.maximum(n, 1e-6)[:, None], np.array([[1.0, 0.0]]))
                    perp = np.stack([-dirn[:, 1], dirn[:, 0]], 1)        # cada uno se hace a su derecha
                    vrel = np.gradient(d, axis=0) * fps
                    frente = (np.einsum("ij,ij->i", vrel, dirn) < -0.3)[:, None]   # se acercan de frente: esquivar de lado
                    emp = ((d_pers - n) / 2 * 0.8)[:, None] * np.where(frente, dirn * 0.5 + perp * 0.9, dirn) * m[:, None]
                    wi, wj = peso[i], peso[j]; tot = max(wi + wj, 1e-6)
                    pel[i] += emp * (2 * wi / tot); pel[j] -= emp * (2 * wj / tot); mov = max(mov, float(np.abs(emp).max()))
        for i in range(P):
            if fijos[i]: continue
            for (x0, y0, x1, y1) in cajas:
                m = (pel[i, :, 0] > x0) & (pel[i, :, 0] < x1) & (pel[i, :, 1] > y0) & (pel[i, :, 1] < y1)
                if m.any():
                    # salir por la cara mas cercana
                    dx0 = pel[i, :, 0] - x0; dx1 = x1 - pel[i, :, 0]; dy0 = pel[i, :, 1] - y0; dy1 = y1 - pel[i, :, 1]
                    opts = np.stack([dx0, dx1, dy0, dy1], 1); cual = np.argmin(opts, 1); dist = opts[np.arange(T), cual]
                    emp = np.zeros((T, 2))
                    emp[cual == 0, 0] = -dist[cual == 0]; emp[cual == 1, 0] = dist[cual == 1]
                    emp[cual == 2, 1] = -dist[cual == 2]; emp[cual == 3, 1] = dist[cual == 3]
                    pel[i] += emp * m[:, None] * 1.0; mov = max(mov, float(np.abs(emp[m]).max()))
        for i in range(P):
            if fijos[i]: continue
            for c in range(2):
                pel[i, :, c] = np.convolve(np.pad(pel[i, :, c], (k // 2, k - 1 - k // 2), mode="edge"), ker, "valid")
        if it % 10 == 9 and it < iters - 20:
            k2 = max(3, int(0.6 * fps)); ker2 = np.ones(k2) / k2
            for i in range(P):
                if fijos[i]: continue
                rap = np.linalg.norm(np.gradient(pel[i], axis=0), axis=1) * fps
                if rap.max() <= 2.0: continue
                suav = np.stack([np.convolve(np.pad(pel[i, :, c], (k2 // 2, k2 - 1 - k2 // 2), mode="edge"), ker2, "valid") for c in range(2)], 1)
                w = np.clip((np.convolve(np.pad(rap, (k2 // 2, k2 - 1 - k2 // 2), mode="edge"), ker2, "valid") - 1.6) / 0.8, 0, 1)[:, None]
                pel[i] = pel[i] * (1 - w) + suav * w
            mov = 1.0
        if mov < 1e-4 and it > 6:
            break
    dmin = 9.0
    for i in range(P):
        for j in range(i + 1, P):
            dmin = min(dmin, float(np.linalg.norm(pel[i] - pel[j], axis=1).min()))
    evitar.dmin = dmin
    return [pel[i] for i in range(P)]


class Objeto:
    def __init__(self, o, T):
        self.o, self.T = o, T
        self.r = RADIO_OBJ.get(o["tipo"], 0.05)
        self.pos = np.repeat(np.asarray(o["pos"], float)[None], T, 0)
        self.segs = []            # ("mano", f0, f1, pi, mano) | ("caida", f0, v0, z_fin) | ("pecho", f0, pi)
        self.en_mano = None
        self.oculto_desde = None

    def ultimo_mano(self):
        for s in reversed(self.segs):
            if s[0] == "mano":
                return s
        return None


def resolver_objetos(objetos, personas, fps):
    """Trayectorias finales de objetos: en mano = palma + desfase fijo (sin saltos); caida = gravedad; pecho = oculto."""
    for o in objetos.values():
        T = o.T; segs = sorted(o.segs, key=lambda s: s[1])
        pos = o.pos.copy()
        for s in segs:
            tipo, f0 = s[0], s[1]
            if tipo == "mano":
                _, f0, f1, pi, mano = s
                palma = personas[pi].pos[:, J["m" + mano]]
                off = pos[f0] - palma[f0]
                # si viene de una caida/estatico, el desfase es respecto a donde esta el objeto en f0
                for ff in range(f0, min(T, f1 + 1)):
                    pos[ff] = palma[ff] + off
                if f1 + 1 < T:
                    pos[f1 + 1:] = pos[f1]
            elif tipo == "caida":
                _, f0, v0, z_fin = s
                tray = caida(pos[f0], v0, z_fin, fps, T - f0)
                for k, q in enumerate(tray):
                    if f0 + k < T: pos[f0 + k] = q
                if f0 + len(tray) < T:
                    pos[f0 + len(tray):] = tray[-1]
            elif tipo == "pecho":
                _, f0, pi = s
                per = personas[pi]
                for ff in range(f0, T):
                    pos[ff] = np.array([*(per.pos[ff, J["pecho"]][:2] + per.dirs[ff] * 0.10), per.pos[ff, J["pecho"]][2] - 0.10])
            elif tipo == "mover":
                _, f0, f1, dest = s
                for ff in range(f0, min(T, f1 + 1)):
                    pos[ff] = pos[f0] + (np.asarray(dest) - pos[f0]) * suave((ff - f0) / max(f1 - f0, 1))
                if f1 + 1 < T: pos[f1 + 1:] = pos[min(T - 1, f1)]
        o.pos = pos


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--guion", required=True); ap.add_argument("--params", required=True); ap.add_argument("--out", required=True)
    a = ap.parse_args()
    g = json.loads(Path(a.guion).read_text(encoding="utf-8"))
    P = dict(PARAMS_DEFECTO); P.update(json.loads(Path(a.params).read_text(encoding="utf-8-sig")))
    rng = np.random.default_rng(int(P["semilla"]))
    fps = int(g.get("fps", 30)); T = int(round(g["dur"] * fps)) + 1
    out = Path(a.out); out.mkdir(parents=True, exist_ok=True)
    F = lambda t: int(round(float(t) * fps))

    actores = g.get("actores", [])
    if not actores:
        actores = [{"id": "fondo", "rol": "staff", "ruta": [[0.5, 5.8, 0], [7.5, 5.8, g["dur"]]], "uniforme": "amarillo"}]
    ys = [w[1] for act in actores for w in act["ruta"]]
    pts = [(w[0], w[1]) for act in actores for w in act["ruta"]] + [(o["pos"][0], o["pos"][1]) for o in g.get("objetos", [])] \
        + [(v[0], v[1]) for veh in g.get("vehiculos", []) for v in veh["ruta"]]
    def libre(c, margen=0.9):
        return not any(c[0] - margen <= x <= c[3] + margen and c[1] - margen <= y <= c[4] + margen for x, y in pts)
    DECOR = {"tienda": [[0.5, 7.6, 0, 7.5, 8.2, 1.6], [-1.6, 0.5, 0, -1.0, 6.0, 1.6], [9.0, 0.5, 0, 9.6, 6.0, 1.6]],
             "pasillo": [[0.5, 7.6, 0, 7.5, 8.2, 1.6]], "cafeteria": [[0.5, 7.6, 0, 7.5, 8.2, 1.6], [-1.6, 1.0, 0, -1.0, 5.0, 1.6]],
             "bodega": [[0.5, 7.6, 0, 7.5, 8.6, 3.0], [9.2, 0.5, 0, 10.2, 7.0, 3.0]], "oficina": [[-1.6, 1.0, 0, -0.8, 6.0, 1.8]],
             "acceso": [[-1.6, 0.5, 0, -1.0, 3.5, 1.6], [9.0, 0.5, 0, 9.6, 3.5, 1.6]], "recepcion": [[-1.6, 0.5, 0, -1.0, 3.5, 1.6]]}
    decor = [c for c in DECOR.get(g.get("escenario", "tienda"), []) if libre(c)] if g.get("decorado", True) else []
    cajas_muebles = list(g.get("cajas_muebles", [])) + decor
    xs_ = [w[0] for act in actores for w in act["ruta"]]
    obst, gondolas = muebles_colision(cajas_muebles, float(np.mean(ys)) if ys else None, float(np.mean(xs_)) if xs_ else None)
    holg = float(P["ruta_holgura_m"]) + float(P["colision_margen_m"])
    Persona.obst = obst
    personas = []
    for act in actores:
        act = json.loads(json.dumps(act))
        if int(P["semilla"]) != 1:      # variacion por semilla: pequeño desplazamiento de la ruta, mismos tiempos
            jit = rng.normal(0, 0.03, size=2)
            for w in act["ruta"]:
                w[0] += jit[0]; w[1] += jit[1]
        personas.append(Persona(act, T, fps, P))
    # evitacion: personas entre si y contra muebles (la fisica manda sobre el guion)
    pels = [p.pelvis_ruta()[0] for p in personas]
    fijos = [p.sentado_hasta is not None or len({tuple(w[:2]) for w in p.a["ruta"]}) == 1 for p in personas]
    sep = float(g.get("separacion_personas", 1.10)) + holg + float(P["separacion_personas_m"])
    Persona.sep = sep
    pels = evitar(pels, obst, fps, d_pers=sep, margen_mueble=0.60 + holg, fijos=fijos)
    for i, (p, pel) in enumerate(zip(personas, pels)):
        p.otros = [q for j, q in enumerate(pels) if j != i]
        p.cinematica(pel)
    idx = {p.a["id"]: i for i, p in enumerate(personas)}
    objetos = {o["id"]: Objeto(o, T) for o in g.get("objetos", [])}
    BASE = {"silla", "nevera", "contenedor", "carro", "maleta", "canastilla", "caja_grande", "estiba_cargada", "pila_cajas", "monitor", "lector", "bolsa", "auto", "moto", "furgon"}
    for o in objetos.values():
        if o.o["tipo"] in BASE and not snap_gondola(o, gondolas):
            o.pos[:, 2] = o.pos[:, 2] + o.r
        elif o.o["tipo"] not in BASE:
            snap_gondola(o, gondolas)
    surtido_cajas, surtido = ([], [])
    if g.get("surtir_gondolas", True) and gondolas:
        surtido_cajas, surtido = surtir_gondolas(gondolas, objetos, g.get("eventos", []), g["dur"])
        if len(surtido_cajas):
            obst = np.concatenate([obst, surtido_cajas], 0); Persona.obst = obst
    cerrar = float(P["agarre_cierre_dedos"])
    unir = int(P["union_mano_objeto"])
    eventos = sorted(g.get("eventos", []), key=lambda e: e["t"])
    agarres, marcas = [], []

    def tomar(per, pi, pa, o, f_toma, fin, mano):
        """mano a la superficie del objeto (0.6 s antes), contacto medido en f_toma; si hay contacto y union, se ata."""
        ini_mov = max(0, f_toma - int(0.6 * fps))
        resolver_objetos({o.o["id"]: o}, personas, fps)          # posicion actual del objeto (tras caidas previas)
        per.brazo(mano, ini_mov, fin, lambda f, o=o: o.pos[min(f, T - 1)], agarre=True, ro=o.r, cerrar=cerrar)
        m = per.pos[f_toma]
        dd = [np.linalg.norm(m[J[k + mano]] - o.pos[f_toma]) - o.r for k in ("p", "i", "d")]
        if os.environ.get("DEBUG_AGARRE"):
            print("  [agarre] tras brazo:", o.o["id"], f_toma, [round(x * 1000, 1) for x in dd], "palma", np.round(m[J["m" + mano]], 3), "obj", np.round(o.pos[f_toma], 3))
        dp = np.linalg.norm(m[J["m" + mano]] - o.pos[f_toma]) - o.r
        contacto = (dd[0] <= 0.005) and (sum(x <= 0.005 for x in dd[1:]) + (dp <= 0.005) >= 1)
        agarres.append({"objeto": o.o["id"], "actor": pa, "cuadro": f_toma, "cuadro_fin": fin, "mano": mano, "persona": pi,
                        "dist_dedos_mm": [round(x * 1000, 1) for x in dd], "contacto_verificado": bool(contacto)})
        if contacto and unir:
            o.segs.append(("mano", f_toma, fin, pi, mano)); o.en_mano = (pi, mano)
            if fin - f_toma > int(0.9 * fps):      # lo lleva: la mano vuelve junto al cuerpo (el objeto la sigue)
                lado_s = -1 if mano == "i" else 1
                per.brazo(mano, f_toma + int(0.3 * fps), fin,
                          lambda f, per=per, s_=lado_s, o=o: np.array([*(per.pos[f, J["pelvis"]][:2] + per.dirs[f] * 0.18 + per.lado[f] * s_ * 0.26), 0.85 + o.r * 0.5]))
        return contacto

    def mano_libre(pi):
        return "d" if not any(o.en_mano == (pi, "d") for o in objetos.values()) else "i"

    def fin_de(obj_id, t):
        for e2 in eventos:
            if e2.get("objeto") == obj_id and e2["t"] > t and e2["tipo"] in ("soltar", "esconder"):
                return F(e2["t"])
        return T - 1

    # sentados desde el inicio
    for pi, p in enumerate(personas):
        if p.sentado_hasta is not None:
            p.sentarse(0, F(p.sentado_hasta), p.a["ruta"][0][:2])
    # objetos que arrancan en la mano
    for o in objetos.values():
        if o.o.get("en_mano") in idx:
            pi = idx[o.o["en_mano"]]; per = personas[pi]
            fin = fin_de(o.o["id"], -1)
            per.brazo("d", 0, fin, lambda f, per=per: np.array([*(per.pos[f, J["pelvis"]][:2] + per.dirs[f] * 0.30), per.pos[f, J["pelvis"]][2] + 0.05]))
            o.pos[:] = personas[pi].pos[0, J["md"]] + np.array([0, 0, -o.r - 0.03])
            o.segs.append(("mano", 0, fin, pi, "d")); o.en_mano = (pi, "d")

    for e in eventos:
        f0 = F(e["t"]); tipo = e["tipo"]; pa = e.get("actor"); pi = idx.get(pa) if pa else None
        per = personas[pi] if pi is not None else None
        o = objetos.get(e.get("objeto")) if e.get("objeto") else None
        marcas.append({"cuadro": f0, **e})
        if tipo in ("tomar", "alcanzar") and per is not None and o is not None:
            f_toma = f0 if tipo == "tomar" else f0 + int(1.2 * fps)
            tomar(per, pi, pa, o, f_toma, fin_de(o.o["id"], e["t"]), mano_libre(pi))
        elif tipo == "esconder" and per is not None and o is not None and o.en_mano:
            mano = o.en_mano[1]; dur = int(0.6 * fps)
            per.brazo(mano, f0, min(T - 1, f0 + dur), lambda f, per=per: np.array([*(per.pos[f, J["pecho"]][:2] + per.dirs[f] * 0.14), per.pos[f, J["pecho"]][2] - 0.08]))
            o.segs.append(("mano", f0, f0 + dur, pi, mano)); o.segs.append(("pecho", f0 + dur + 1, pi))
            o.oculto_desde = f0 + dur; o.en_mano = None
        elif tipo == "soltar" and o is not None:
            dest = snap_punto(e["destino"], gondolas, o.r) if e.get("destino") else None; z_fin = (dest[2] + o.r) if dest else o.r
            um = o.ultimo_mano()
            if per is not None and um is not None:
                mano = um[4]; f_ini = max(0, f0 - int(0.5 * fps))
                arriba = np.array([dest[0], dest[1], dest[2] + o.r + 0.03]) if dest else None
                per.brazo(mano, f_ini, f0, (lambda f, q=arriba: q) if dest else (lambda f, per=per, mano=mano: per.pos[f, J["m" + mano]]), agarre=True, ro=o.r, cerrar=cerrar)
            o.segs.append(("caida", f0 + 1, [0.0, 0.0, 0.0], z_fin)); o.en_mano = None
        elif tipo == "empujar" and o is not None and per is not None:
            if e.get("destino"):            # empuja algo pesado: avanza con la persona
                hasta = F(e.get("hasta", e["t"] + 3))
                dest3 = np.array([e["destino"][0], e["destino"][1], float(o.pos[0][2])])
                mov = lambda f, o=o, d3=dest3, a=f0, b=hasta: o.pos[0] + (d3 - o.pos[0]) * suave((min(f, b) - a) / max(b - a, 1))
                per.brazo("d", f0, hasta, lambda f, mov=mov, o=o: mov(f) + np.array([0.15, -o.r - 0.05, 0.3]))
                per.brazo("i", f0, hasta, lambda f, mov=mov, o=o: mov(f) + np.array([-0.15, -o.r - 0.05, 0.3]))
                o.segs.append(("mover", f0, hasta, dest3.tolist()))
            else:                           # golpea un envase: sale de la bandeja y cae con gravedad
                per.brazo("d", max(0, f0 - int(0.5 * fps)), f0, lambda f, o=o: o.pos[min(f, T - 1)], agarre=True, ro=o.r, cerrar=0.0)
                o.segs.append(("caida", f0, [0.0, 0.9 * (1 if np.mean(ys) > o.pos[0][1] else -1), 0.3], o.r))
        elif tipo == "caer" and per is not None:
            per.caer(f0, fps)
        elif tipo in ("empujar", "golpear") and per is not None and e.get("objetivo") in idx:
            otro = personas[idx[e["objetivo"]]]; dur = int(0.35 * fps)
            def tgt(f, otro=otro, per=per):
                c = otro.pos[f, J["pecho"]]; d = per.pos[f, J["pecho"]] - c
                return c + d / max(np.linalg.norm(d), 1e-6) * (RADIO[J["pecho"]] + RADIO[J["md"]] + 0.01)
            per.brazo("d", f0, f0 + dur, tgt)
        elif tipo == "sentarse" and per is not None and o is not None:
            per.sentarse(f0 + int(0.5 * fps), T, o.pos[0][:2])
        elif tipo == "pasar_lector" and per is not None and o is not None and o.en_mano:
            lector = next((x for x in objetos.values() if x.o["tipo"] == "lector"), None)
            if lector is not None:
                mano = o.en_mano[1]
                per.brazo(mano, f0, f0 + int(0.5 * fps), lambda f, l=lector, o=o: l.pos[0] + np.array([0, -0.05, 0.10 + o.r]), agarre=True, ro=o.r, cerrar=cerrar)
        elif tipo == "sacar" and per is not None and o is not None:
            for f in range(T):
                ff = min(f, f0)
                o.pos[f] = np.array([*(per.pos[ff, J["pelvis"]][:2] + per.dirs[ff] * 0.14), per.pos[ff, J["pelvis"]][2]])
            if tomar(per, pi, pa, o, f0, T - 1, "d"):
                per.brazo("d", f0 + 1, T - 1, lambda f, per=per: np.array([*(per.pos[f, J["pecho"]][:2] + per.dirs[f] * 0.35), per.pos[f, J["pecho"]][2] - 0.15]), agarre=True, ro=o.r, cerrar=cerrar)
        elif tipo == "mostrar" and per is not None and o is not None:
            per.brazo("d", f0, T - 1, lambda f, per=per: np.array([*(per.pos[f, J["pecho"]][:2] + per.dirs[f] * 0.45), per.pos[f, J["pecho"]][2] - 0.05]))
            if not o.en_mano:
                o.pos[:] = per.pos[0, J["md"]] + np.array([0, 0, -0.02]); o.segs.append(("mano", 0, T - 1, pi, "d")); o.en_mano = (pi, "d")
        elif tipo == "mirar" and per is not None:
            tg = e.get("objetivo")
            arr = objetos[tg].pos if isinstance(tg, str) and tg in objetos else (None if isinstance(tg, str) else np.asarray(tg, float))
            if arr is not None:
                dur = int(1.2 * fps)
                for f in range(f0, min(T, f0 + dur)):
                    q = arr[min(f, T - 1)] if arr.ndim == 2 else arr
                    d = q - per.pos[f, J["cuello"]]; d = d / max(np.linalg.norm(d), 1e-6)
                    w = suave(min(1, (f - f0) / (0.3 * fps))) * suave(min(1, (f0 + dur - f) / (0.3 * fps)))
                    per.pos[f, J["cabeza"]] = per.pos[f, J["cuello"]] + np.array([0, 0, 0.15]) * (1 - w) + np.array([*(d[:2] * 0.06), 0.14]) * w
        elif tipo == "mano_cintura" and per is not None:
            per.brazo("d", f0, f0 + int(1.0 * fps), lambda f, per=per: np.array([*(per.pos[f, J["pelvis"]][:2] + per.dirs[f] * 0.14), per.pos[f, J["pelvis"]][2] + 0.02]))
        elif tipo == "limpiar" and per is not None:
            hasta = F(e.get("hasta", e["t"] + 2))
            per.brazo("d", f0, hasta, lambda f, e=e: np.array([e["pos"][0] + 0.15 * math.sin(f / 3.0), e["pos"][1], 0.75]))
            for f in range(f0, min(T, hasta + 1)):
                w = suave(min(1, (f - f0) / (0.5 * fps))) * suave(min(1, (hasta - f) / (0.5 * fps)))
                pp = per.pos[f]
                for k in ("pelvis", "espina", "pecho", "cuello", "cabeza", "hi", "hd", "ci", "cd", "mi", "pi", "ii", "di"):
                    pp[J[k], 2] -= 0.25 * w
        elif tipo == "trepar" and per is not None:
            hasta = F(e.get("hasta", e["t"] + 3))
            per.brazo("d", f0, hasta, lambda f, per=per: np.array([*(per.pos[f, J["pecho"]][:2] + per.dirs[f] * 0.35), 2.0]))
            per.brazo("i", f0, hasta, lambda f, per=per: np.array([*(per.pos[f, J["pecho"]][:2] + per.dirs[f] * 0.35), 1.9]))
        elif tipo == "apilar" and o is not None and e.get("destino"):
            o.segs.append(("mover", f0, f0 + int(2.0 * fps), list(map(float, e["destino"]))))
        # abrir/cerrar/converger/fuego/humo/humo_techo/detener/derramar/alejarse/desaparecer/levantarse: marcas para el render

    if os.environ.get("DEBUG_AGARRE"):
        for ag in agarres:
            per = personas[ag["persona"]]; o = objetos[ag["objeto"]]; f_ = ag["cuadro"]; mano = ag["mano"]
            print("  [agarre] antes de lean:", ag["objeto"], [round((np.linalg.norm(per.pos[f_, J[k + mano]] - o.pos[f_]) - o.r) * 1000, 1) for k in ("p", "i", "d")])
    for p in personas:
        p.aplicar_lean()
    if os.environ.get("DEBUG_AGARRE"):
        for ag in agarres:
            per = personas[ag["persona"]]; o = objetos[ag["objeto"]]; f_ = ag["cuadro"]; mano = ag["mano"]
            print("  [agarre] tras lean:", ag["objeto"], [round((np.linalg.norm(per.pos[f_, J[k + mano]] - o.pos[f_]) - o.r) * 1000, 1) for k in ("p", "i", "d")], "lean", np.round(per.lean[f_], 3))
    resolver_objetos(objetos, personas, fps)

    veh = {}
    for v in g.get("vehiculos", []):
        arr = np.zeros((T, 2))
        for f in range(T): arr[f], _ = interp_ruta(v["ruta"], f / fps)
        veh[v["id"]] = arr

    cuerpo = np.stack([p.pos for p in personas], 1)    # (T,P,J,3)
    if float(P["suavizado_pose"]) > 0:
        k = int(P["suavizado_pose"] * fps)
        if k >= 2:
            ker = np.ones(k) / k
            cp = cuerpo.copy()
            for i in range(cuerpo.shape[1]):
                for j in range(NJ):
                    if j in (J["pie_i"], J["pie_d"]): continue
                    for c in range(3):
                        cp[:, i, j, c] = np.convolve(np.pad(cuerpo[:, i, j, c], (k // 2, k - 1 - k // 2), mode="edge"), ker, "valid")
            cuerpo = cp

    d = {"fps": fps, "cuerpo_pos": cuerpo, "cuerpo_radio": RADIO, "huesos": HUESOS, "huesos_radio": HUESOS_R,
         "obst_cajas": obst, "pies_idx": np.array([J["pie_i"], J["pie_d"]])}
    principal = next((ag for ag in agarres if ag["contacto_verificado"]), agarres[0] if agarres else None)
    if principal is not None:
        o = objetos[principal["objeto"]]; mano = principal["mano"]
        d.update({"palma_idx": J["m" + mano], "dedos_idx": np.array([J["p" + mano], J["i" + mano], J["d" + mano]]),
                  "agarre_persona": principal["persona"], "obj_pos": o.pos, "obj_radio": o.r,
                  "evento_tomar": principal["cuadro"], "evento_soltar": principal["cuadro_fin"]})
    np.savez(out / "trayectoria.npz", **d)
    render = {"id": g["id"], "fps": fps, "T": T, "camara": g.get("camara"), "escenario": g.get("escenario"), "muebles": cajas_muebles, "decorado": decor,
              "gondolas": gondolas, "zonas": g.get("zonas", []), "lineas": g.get("lineas", []), "fases": g.get("fases", []), "reloj": g.get("reloj"),
              "camaras_virtuales": g.get("camaras_virtuales", []),
              "actores": [{k: v for k, v in p.a.items() if k != "ruta"} for p in personas],
              "objetos": [{"id": o.o["id"], "tipo": o.o["tipo"], "radio": o.r, **{k: v for k, v in o.o.items() if k not in ("id", "tipo", "pos")},
                           "oculto_desde": o.oculto_desde} for o in objetos.values()],
              "eventos": marcas, "agarres": agarres, "surtido": surtido}
    (out / "escena_render.json").write_text(json.dumps(render, ensure_ascii=False, indent=1))
    np.savez(out / "extras.npz", **{f"obj_{o.o['id']}": o.pos for o in objetos.values()}, **{f"veh_{k}": v for k, v in veh.items()})
    print(f"{g['id']}: {T} cuadros, {len(personas)} personas, {len(objetos)} objetos, agarres {len(agarres)} "
          f"({sum(a['contacto_verificado'] for a in agarres)} con contacto verificado), dist min pelvis {getattr(evitar, 'dmin', 9.0):.2f} m")


if __name__ == "__main__":
    main()
