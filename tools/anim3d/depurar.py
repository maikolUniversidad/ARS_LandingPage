import sys, numpy as np
sys.path.insert(0, "/datos2/vigias/anim3d-molde/servidor")
import verificar_fisica as V
d = np.load(sys.argv[1] + "/salida/trayectoria.npz")
pos = d["cuerpo_pos"]; hu = d["huesos"]; hr = d["huesos_radio"]; k = 5; fps = float(d["fps"])
if len(d["obst_cajas"]):
    pts = V.puntos_capsulas(pos, hu, k); sd = V.dist_caja(pts, d["obst_cajas"]); pen = np.repeat(hr, k)[None, None, :, None] - sd
    t, p, b, c = np.unravel_index(np.argmax(pen), pen.shape)
    print(f"  PEN_MUEBLE {pen.max():.3f} m cuadro {t} (t={t/fps:.1f}s) persona {p} hueso {hu[b // k]} caja {np.round(d['obst_cajas'][c],2)}; extremos {np.round(pos[t,p,hu[b//k][0]],2)} {np.round(pos[t,p,hu[b//k][1]],2)} pelvis {np.round(pos[t,p,0],2)}")
v = np.linalg.norm(np.diff(pos, axis=0), axis=-1) * fps; t, p, j = np.unravel_index(np.argmax(v), v.shape)
print(f"  VEL {v.max():.2f} m/s cuadro {t + 1} (t={(t+1)/fps:.1f}s) persona {p} articulacion {j}; perfil: " + " ".join(f"{x:.1f}" for x in v[max(0,t-4):t+5, p, j]))
if pos.shape[1] >= 2:
    pts = V.puntos_capsulas(pos, hu, k); rp = np.repeat(hr, k); peor = (-1, None)
    for i in range(pos.shape[1]):
        for jj in range(i + 1, pos.shape[1]):
            dist = np.linalg.norm(pts[:, i, :, None, :] - pts[:, jj, None, :, :], axis=-1); pen = rp[None, :, None] + rp[None, None, :] - dist
            if pen.max() > peor[0]:
                tt, a, b = np.unravel_index(np.argmax(pen), pen.shape); peor = (float(pen.max()), (tt, i, jj, hu[a // k].tolist(), hu[b // k].tolist()))
    if peor[1] is not None: print(f"  PEN_PERSONAS {peor[0]:.3f} m cuadro {peor[1][0]} (t={peor[1][0]/fps:.1f}s) personas {peor[1][1]}/{peor[1][2]} huesos {peor[1][3]} vs {peor[1][4]}")
pies = d["pies_idx"]; alt = pos[:, :, pies, 2] - d["cuerpo_radio"][pies][None, None]; cont = alt < 0.03
ambos = cont[:-1] & cont[1:]; vh = np.linalg.norm(np.diff(pos[:, :, pies, :2], axis=0), axis=-1) * fps
w = np.where(ambos, vh, 0); t, p, i = np.unravel_index(np.argmax(w), w.shape)
print(f"  PATINA max {w.max():.3f} m/s cuadro {t+1} persona {p} pie {i}")
