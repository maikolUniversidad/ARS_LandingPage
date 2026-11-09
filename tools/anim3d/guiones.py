#!/usr/bin/env python3
"""Genera escenas/<id>/guion.json para las 45 analiticas de la landing /vision.
Fuente de fases y duraciones: src/data/analiticas.ts (no se inventan tiempos).
Convenciones: metros, z arriba, piso z=0, local de 8 x 6 m. Rutas = [x, y, t_segundos].
Eventos (vocabulario del adaptador sim_genesis.py): detener, tomar, soltar, esconder, caer,
empujar, golpear, abrir, cerrar, converger, apilar, derramar, humo, sentarse, levantarse, mirar.
"""
import json, re, sys
from pathlib import Path

TS = Path.home() / "landing-vigias/ARS_LandingPage/src/data/analiticas.ts"
OUT = Path(sys.argv[1] if len(sys.argv) > 1 else Path.home() / "landing-vigias/anim3d/escenas")

s = TS.read_text()
AN = {a["id"]: a for a in json.loads(re.search(r"export const analiticas: Analitica\[\] = (\[.*?\n\]);", s, re.S).group(1))}

G = lambda x0, x1, y, z0=0, z1=1.6: [x0, y - 0.3, z0, x1, y + 0.3, z1]   # gondola como caja
PUERTA = {"id": "puerta", "tipo": "puerta", "pos": [4, 6, 0], "ancho": 1.2}
CAM_TIENDA = {"pos": [0.8, 8.6, 3.3], "mira": [4.2, 2.6, 0.9]}
CAM_ACCESO = {"pos": [4, 1.0, 2.8], "mira": [4, 6, 1.2]}

def ruta(*pts): return [list(p) for p in pts]
def actor(i, rol, r, **k): return dict({"id": i, "rol": rol, "ruta": r}, **k)
def ev(t, tipo, actor=None, **k): return dict({"t": t, "tipo": tipo, "actor": actor}, **k)

E = {}
E["seguimiento"] = dict(escenario="tienda", muebles=[G(1, 3, 2), G(5, 7, 2)], actores=[
    actor("p1", "cliente", ruta((0.5, 4, 0), (3.8, 4, 6), (7.5, 4, 11), (7.5, 4, 12), (4, 4.5, 16))),
    actor("p2", "cliente", ruta((7.5, 3.8, 0), (4.2, 3.8, 6), (0.5, 3.8, 11), (0.5, 3.8, 16))),
    actor("p3", "cliente", ruta((2, 5, 0), (2, 5, 4), (6, 5, 10), (6, 5, 16)))])
E["conteo"] = dict(escenario="tienda", camara=CAM_ACCESO, lineas=[{"id": "puerta", "de": [3.4, 5.6], "a": [4.6, 5.6]}], actores=[
    actor("p1", "cliente", ruta((4, 7.5, 0), (4, 5.6, 3.4), (3, 3, 7), (3, 3, 16))),
    actor("p2", "cliente", ruta((5, 2.5, 0), (5, 2.5, 6), (4, 5.6, 9.4), (4, 7.5, 12), (4, 7.5, 16)))])
E["demografia"] = dict(escenario="tienda", camara=CAM_ACCESO, actores=[
    actor("p1", "cliente", ruta((4, 7.5, 0), (4, 5.6, 3), (3.5, 3, 7), (3.5, 3, 15)), aspecto="mujer_adulta"),
    actor("p2", "cliente", ruta((4.4, 7.8, 2), (4.4, 5.6, 6), (5, 3, 10), (5, 3, 15)), aspecto="hombre_mayor"),
    actor("p3", "cliente", ruta((3.6, 7.8, 5), (3.6, 5.6, 9), (2.5, 3.5, 13), (2.5, 3.5, 15)), aspecto="joven")])
E["calor"] = dict(escenario="tienda", camara={"pos": [4, -4.5, 4.2], "mira": [4, 3.2, 0.6]}, muebles=[G(1, 3, 2), G(5, 7, 2), G(1, 3, 4.5)], actores=[
    actor("p1", "cliente", ruta((4, 7, 0), (2, 3, 4), (2, 3, 9), (6, 3, 13), (6, 3, 18))),
    actor("p2", "cliente", ruta((4.6, 7.5, 1), (6.2, 2.8, 5), (6.2, 2.8, 11), (4.4, 6.0, 18))),
    actor("p3", "cliente", ruta((3.4, 7.5, 2), (1.2, 3.9, 6), (1.2, 3.9, 16), (2.4, 5.6, 18))),
    actor("p4", "cliente", ruta((5.2, 7.8, 4), (7.0, 3.4, 8), (7.0, 3.4, 15), (5.6, 7.5, 18)))])
E["permanencia"] = dict(escenario="tienda", muebles=[G(3, 5, 2)], zonas=[{"id": "exhibicion", "caja": [2.8, 2.4, 5.2, 3.8]}], actores=[
    actor("p1", "cliente", ruta((0.5, 4.5, 0), (4, 3.1, 3.5), (4, 3.1, 14), (7.5, 4.5, 16))),
    actor("p2", "cliente", ruta((7.5, 5, 0), (4.5, 4.2, 5), (0.5, 5, 10), (0.5, 5, 16)))],
    eventos=[ev(3.5, "detener", "p1", hasta=14), ev(5, "mirar", "p1", objetivo=[4, 2, 1.3])])
E["cruce"] = dict(escenario="tienda", camara={"pos": [-1.5, 3.0, 3.2], "mira": [5, 3.0, 0.8]}, lineas=[{"id": "pasillo", "de": [4, 1], "a": [4, 5], "sentido": [1, 0]}], muebles=[G(0.5, 7.5, 0.5), G(0.5, 7.5, 5.5)], actores=[
    actor("p1", "cliente", ruta((1, 3, 0), (7, 3, 6), (7, 3, 15))),
    actor("p2", "cliente", ruta((1, 2.2, 2), (7, 2.2, 8), (7, 2.2, 15))),
    actor("p3", "cliente", ruta((7, 3.8, 6), (1, 3.8, 12), (1, 3.8, 15)))])
E["comprador"] = dict(escenario="tienda", camara={"pos": [1.0, 7.5, 3.0], "mira": [4, 2.4, 1.0]}, muebles=[G(2, 6, 2)], objetos=[{"id": "prod", "tipo": "caja_pequena", "pos": [4, 1.75, 1.1]}], actores=[
    actor("p1", "cliente", ruta((0.5, 4, 0), (4, 2.9, 3), (4, 2.9, 15), (7, 4, 17))),
    actor("p2", "cliente", ruta((7.5, 4.5, 0), (2, 4.5, 8), (0.5, 4.5, 17))),
    actor("p3", "cliente", ruta((6, 5, 0), (6, 3, 5), (6, 3, 17)))],
    eventos=[ev(3, "detener", "p1", hasta=15), ev(3.5, "mirar", "p1", objetivo=[3, 2, 1.5]), ev(5.5, "mirar", "p1", objetivo=[5, 2, 0.6]),
             ev(8, "tomar", "p1", objeto="prod"), ev(9, "mirar", "p1", objetivo="prod"), ev(13, "soltar", "p1", objeto="prod", destino=[4, 1.75, 1.1])])
E["blancas"] = dict(escenario="acceso", camara=CAM_ACCESO, objetos=[{"id": "puerta", "tipo": "puerta_batiente", "pos": [4, 4, 0]}], actores=[
    actor("p1", "staff", ruta((4, 0.5, 0), (4, 3.4, 3), (4, 3.4, 4), (4, 6.5, 7), (4, 6.5, 15))),
    actor("p2", "cliente", ruta((4.3, 0.5, 6), (4.3, 3.4, 9), (4.3, 3.4, 15)))],
    eventos=[ev(3.2, "abrir", "puerta"), ev(7.5, "cerrar", "puerta"), ev(9, "detener", "p2", hasta=15)])
E["filas"] = dict(escenario="tienda", muebles=[[1, 4.5, 0, 2.2, 5.5, 1.0], [5, 4.5, 0, 6.2, 5.5, 1.0]], actores=[
    actor(f"p{i}", "cliente", ruta((2.6, 3.8 - 0.7 * i, 0), (2.6, 3.8 - 0.7 * i, 11), (6.6 if i % 2 else 2.6, 3.8 - 0.35 * i, 14), (6.6 if i % 2 else 2.6, 3.8 - 0.35 * i, 18))) for i in range(5)]
    + [actor("c1", "staff", ruta((1.5, 6.2, 0), (1.5, 6.2, 18))), actor("c2", "staff", ruta((7.5, 6.5, 0), (7.5, 6.5, 9), (5.5, 6.2, 11), (5.5, 6.2, 18)))])
E["aforo"] = dict(escenario="tienda", camara=CAM_ACCESO, lineas=[{"id": "puerta", "de": [3.4, 5.6], "a": [4.6, 5.6]}], actores=[
    actor(f"p{i}", "cliente", ruta((4 + (i % 3 - 1) * 0.35, 8 + 1.2 * (i // 3) + 0.4 * (i % 3), i * 0.9), (4 + (i % 3 - 1) * 0.35, 5.6, i * 0.9 + 2.5), (1 + (i % 6), 1 + (i % 4), i * 0.9 + 6), (1 + (i % 6), 1 + (i % 4), 15))) for i in range(8)])
E["placas"] = dict(escenario="parqueadero", camara={"pos": [6, -8, 4], "mira": [6, 6, 0.8]}, objetos=[
    {"id": "barrera", "tipo": "barrera", "pos": [6, 0.5, 0]}] + [{"id": f"auto{i}", "tipo": "auto", "pos": [1.5 + 2.6 * i, 6, 0], "color": c} for i, c in enumerate(["gris", "blanco", "azul"])]
    + [{"id": "moto1", "tipo": "moto", "pos": [11, 6, 0]}, {"id": "auto_rojo", "tipo": "auto", "pos": [6, -6, 0], "color": "rojo", "placa": "KTV 482"},
       {"id": "furgon", "tipo": "furgon", "pos": [-4, 3, 0]}, {"id": "moto2", "tipo": "moto", "pos": [6, -7, 0]}],
    vehiculos=[{"id": "auto_rojo", "ruta": ruta((6, -6, 0), (6, 0, 3.4), (6, 0, 5), (9.3, 6, 9), (9.3, 6, 22))},
               {"id": "furgon", "ruta": ruta((-4, 3, 10), (14, 3, 16), (14, 3, 22))},
               {"id": "moto2", "ruta": ruta((6, -7, 13), (6, 0, 16), (11.8, 6, 19), (11.8, 6, 22))}],
    eventos=[ev(4.2, "abrir", "barrera"), ev(7, "cerrar", "barrera"), ev(15.5, "abrir", "barrera"), ev(18, "cerrar", "barrera")], personas=0)
E["staff"] = dict(escenario="tienda", muebles=[G(1, 3, 2), G(5, 7, 2)], actores=[
    actor("s1", "staff", ruta((2, 4.5, 0), (2, 3, 4), (6, 3, 10), (6, 3, 16)), uniforme="amarillo"),
    actor("s2", "staff", ruta((7, 5.5, 0), (7, 5.5, 16)), uniforme="amarillo"),
    actor("p1", "cliente", ruta((0.5, 4, 0), (3, 4, 5), (3, 4, 10), (7.5, 4.5, 16))),
    actor("p2", "cliente", ruta((5, 5, 0), (5.5, 3, 6), (5.5, 3, 16)))])
E["derrames"] = dict(escenario="tienda", muebles=[G(1, 7, 2)], objetos=[{"id": "envase", "tipo": "botella", "pos": [4, 1.75, 1.1], "liquido": True}], actores=[
    actor("p1", "cliente", ruta((0.5, 4, 0), (4, 2.9, 2), (7.5, 4, 5), (7.5, 4, 16))),
    actor("s1", "staff", ruta((7.5, 5.5, 8), (4, 3.2, 11), (4, 3.2, 14), (7.5, 5.5, 16)), uniforme="amarillo")],
    eventos=[ev(2.0, "empujar", "p1", objeto="envase"), ev(2.4, "derramar", objeto="envase", pos=[4, 2.6, 0]), ev(11, "limpiar", "s1", pos=[4, 2.6, 0], hasta=13.5)])
E["guardian"] = dict(escenario="oficina", camara={"pos": [4, -3.5, 3], "mira": [4, 3, 1]}, muebles=[[1, 2.5, 0, 3, 3.3, 0.75], [5, 2.5, 0, 7, 3.3, 0.75]],
    objetos=[{"id": "silla1", "tipo": "silla", "pos": [2, 2.0, 0]}, {"id": "silla2", "tipo": "silla", "pos": [6, 2.0, 0]}, {"id": "pc1", "tipo": "monitor", "pos": [2, 3, 0.75]}, {"id": "pc2", "tipo": "monitor", "pos": [6, 3, 0.75]}],
    actores=[actor("t1", "staff", ruta((2, 2.0, 0), (2, 2.0, 4), (0.4, 2.0, 5.6), (0.4, 5.5, 7.5), (0.4, 5.5, 16)), sentado_hasta=4),
             actor("t2", "staff", ruta((6, 2.0, 0), (6, 2.0, 16)), sentado_hasta=16),
             actor("x1", "cliente", ruta((7.7, 5.5, 0.5), (7.7, 0.9, 3.8), (2.4, 0.9, 7.3), (2, 2.0, 8), (2, 2.0, 16)))],
    eventos=[ev(4, "levantarse", "t1", objeto="silla1"), ev(8, "sentarse", "x1", objeto="silla1")])
E["negras"] = dict(escenario="acceso", camara=CAM_ACCESO, lineas=[{"id": "puerta", "de": [3.4, 5.6], "a": [4.6, 5.6]}], actores=[
    actor("p1", "cliente", ruta((4, 8, 0), (4, 5.6, 4), (2, 3, 8), (6, 2, 12), (6, 2, 14)), rostro="lista_negra"),
    actor("p2", "cliente", ruta((4.4, 8, 3), (4.4, 5.6, 7), (6.5, 3.5, 11), (6.5, 3.5, 14)))])
E["merodeo"] = dict(escenario="acceso", camara={"pos": [4, -4, 3], "mira": [4, 3, 1.2]}, muebles=[[1, 4.5, 0, 7, 4.8, 2.2]], zonas=[{"id": "vitrina", "caja": [1, 2.2, 7, 4.4]}], actores=[
    actor("p1", "cliente", ruta((0.5, 3.3, 0), (3, 3.3, 3), (6, 3.3, 6), (3, 3.5, 9), (6, 3.5, 12), (2, 3.3, 16), (2, 3.3, 18))),
    actor("p2", "cliente", ruta((7.5, 1.2, 0), (0.5, 1.2, 8), (0.5, 1.2, 18)))],
    eventos=[ev(3, "mirar", "p1", objetivo=[4, 4.6, 1.4]), ev(9, "mirar", "p1", objetivo=[3, 4.6, 1.4])])
E["intrusion"] = dict(escenario="perimetro", camara={"pos": [4, -5, 3.5], "mira": [4, 4, 0.8]}, muebles=[[0, 6, 0, 8, 6.1, 2.0]],
    zonas=[{"id": "franja1", "caja": [0, 2, 8, 3]}, {"id": "franja2", "caja": [0, 3, 8, 4]}, {"id": "franja3", "caja": [0, 4, 8, 6]}],
    actores=[actor("x1", "intruso", ruta((7.5, 0.5, 0), (5, 2.1, 3.5), (4, 3.2, 6), (3.5, 4.6, 8.5), (3, 5.6, 11), (3, 5.6, 15)))],
    eventos=[ev(11, "trepar", "x1", objeto="muro", hasta=14)])
E["acceso"] = dict(escenario="bodega_puerta", camara={"pos": [4, -4, 3], "mira": [4, 4, 1.2]}, objetos=[{"id": "puerta", "tipo": "puerta_batiente", "pos": [4, 4.5, 0], "rotulo": "SOLO PERSONAL"}],
    zonas=[{"id": "umbral", "caja": [3.2, 4.2, 4.8, 4.8]}],
    actores=[actor("s1", "staff", ruta((0.5, 2, 0), (4, 4.2, 3), (4, 6.5, 5.5), (4, 6.5, 15)), uniforme="amarillo"),
             actor("p1", "cliente", ruta((7.5, 1.5, 3), (4.2, 4.2, 8.4), (4.2, 6.5, 11), (4.2, 6.5, 15)))],
    eventos=[ev(2.6, "abrir", "puerta"), ev(5.8, "cerrar", "puerta"), ev(8, "abrir", "puerta"), ev(11.5, "cerrar", "puerta")])
E["aglomeracion"] = dict(escenario="tienda", zonas=[{"id": "zona", "caja": [5, 2, 7.5, 4.5]}], actores=[
    actor(f"p{i}", "cliente", ruta((0.5 + (i % 4) * 2, 0.5 + (i // 4) * 1.6, 0), (0.5 + (i % 4) * 2, 0.5 + (i // 4) * 1.6, 4), (6.0 + 0.62 * ((i % 3) - 1), 3.2 + 0.62 * ((i // 3) - 1.5), 8 + (i % 3) * 0.4), (6.0 + 0.62 * ((i % 3) - 1), 3.2 + 0.62 * ((i // 3) - 1.5), 15))) for i in range(12)],
    eventos=[ev(4, "converger", None, destino=[6.0, 3.2])], separacion_personas=0.72)
E["epp"] = dict(escenario="obra", camara={"pos": [4, -5, 3.2], "mira": [4, 3, 1]}, zonas=[{"id": "zona_epp", "caja": [1, 1, 7, 5]}], muebles=[[1, 4.5, 0, 3, 5.5, 1.2]],
    actores=[actor("w1", "obrero", ruta((0.5, 3, 0), (3, 3, 4), (5, 3.5, 9), (5, 3.5, 15)), casco=True, chaleco=True),
             actor("w2", "obrero", ruta((7.5, 0.5, 3), (6, 2.5, 7.5), (4, 4.2, 12), (4, 4.2, 15)), casco=False, chaleco=True)])
E["caidas"] = dict(escenario="pasillo", camara={"pos": [-1.5, 3.0, 3.0], "mira": [5, 3.0, 0.6]}, muebles=[G(0.5, 7.5, 0.5), G(0.5, 7.5, 5.5)], actores=[
    actor("p1", "cliente", ruta((0.5, 3, 0), (4, 3, 4.2), (4, 3, 15)))],
    eventos=[ev(4.2, "caer", "p1", hasta=15)])
E["hurto"] = dict(escenario="tienda", muebles=[G(2, 6, 2)], objetos=[{"id": "perfume", "tipo": "caja_pequena", "pos": [3.6, 1.75, 1.1]}, {"id": "cuchillas", "tipo": "caja_pequena", "pos": [4.4, 1.75, 1.1]}],
    actores=[actor("x1", "cliente", ruta((0.5, 4.5, 0), (4, 2.9, 3), (4, 2.9, 16), (7.5, 4.5, 20)), chaqueta=True),
             actor("p2", "cliente", ruta((7.5, 5, 0), (1, 5, 10), (1, 5, 20)))],
    eventos=[ev(3, "mirar", "x1", objetivo=[0.5, 4, 1.5]), ev(4, "mirar", "x1", objetivo=[7.5, 4, 1.5]), ev(5.2, "tomar", "x1", objeto="perfume"), ev(6.5, "esconder", "x1", objeto="perfume"),
             ev(9.5, "tomar", "x1", objeto="cuchillas"), ev(10.6, "esconder", "x1", objeto="cuchillas")])
E["ocultaProd"] = dict(escenario="tienda", muebles=[G(2, 6, 2)], objetos=[{"id": "prod", "tipo": "caja_pequena", "pos": [4, 1.75, 1.1]}],
    actores=[actor("x1", "cliente", ruta((0.5, 4.5, 0), (4, 2.9, 3), (4, 2.9, 11), (7.5, 4.5, 15)), chaqueta=True)],
    eventos=[ev(3.6, "tomar", "x1", objeto="prod"), ev(7.4, "esconder", "x1", objeto="prod")])
E["armas"] = dict(escenario="acceso", camara=CAM_ACCESO, objetos=[{"id": "arma", "tipo": "pistola", "pos": [4.3, 7.2, 1.0], "en_mano": "x1"}],
    actores=[actor("x1", "intruso", ruta((4.3, 8.5, 0), (4.3, 5.6, 4), (4.3, 4, 6), (4.3, 4, 13))), actor("p1", "cliente", ruta((2, 3, 0), (1, 2, 6), (1, 2, 13)))],
    eventos=[ev(4, "mostrar", "x1", objeto="arma")])
E["blancas2"] = dict(escenario="recepcion", camara={"pos": [4, -4, 3], "mira": [4, 3, 1.1]}, muebles=[[2, 4.5, 0, 6, 5.3, 1.1]], objetos=[{"id": "cuchillo", "tipo": "cuchillo", "pos": [4, 3, 1.0], "oculto": True}],
    actores=[actor("x1", "intruso", ruta((0.5, 1.5, 0), (4, 3, 2.6), (4, 3, 15))), actor("r1", "staff", ruta((4, 5.8, 0), (4, 5.8, 15)))],
    eventos=[ev(2.6, "detener", "x1", hasta=15), ev(3, "mirar", "x1", objetivo=[0.5, 3, 1.5]), ev(4.5, "mirar", "x1", objetivo=[7.5, 3, 1.5]), ev(5.5, "mano_cintura", "x1"), ev(6.6, "sacar", "x1", objeto="cuchillo")])
E["peleas"] = dict(escenario="tienda", actores=[
    actor("a", "cliente", ruta((3.3, 3, 0), (3.3, 3, 16))), actor("b", "cliente", ruta((4.7, 3, 0), (4.7, 3, 16))),
    actor("p3", "cliente", ruta((7.5, 5.5, 0), (6.5, 5, 6), (6.5, 5, 16)))],
    eventos=[ev(3.4, "empujar", "a", objetivo="b"), ev(5, "golpear", "a", objetivo="b"), ev(6.2, "golpear", "b", objetivo="a"), ev(7.6, "golpear", "a", objetivo="b"), ev(9, "golpear", "b", objetivo="a"), ev(10.4, "caer", "b", hasta=16)])
E["fuego"] = dict(escenario="bodega", camara={"pos": [4, -5, 3.5], "mira": [4, 3, 1.4]}, muebles=[[0.5, 4.5, 0, 7.5, 5.5, 3.0], [5, 1.5, 0, 6.5, 2.5, 1.2]],
    objetos=[{"id": "carton", "tipo": "pila_cajas", "pos": [5.75, 2, 1.2]}], personas=0,
    eventos=[ev(2.5, "fuego", objeto="carton", tamano="pequeno"), ev(5, "fuego", objeto="carton", tamano="mediano"), ev(2.5, "humo", objeto="carton", hasta=20), ev(11, "humo_techo", hasta=20)])
E["abandono"] = dict(escenario="cafeteria", muebles=[[3, 2.5, 0, 5, 3.5, 0.75]], objetos=[{"id": "maleta", "tipo": "maleta", "pos": [3.3, 2.2, 0]}, {"id": "celular", "tipo": "celular", "pos": [4.3, 3, 0.75]}, {"id": "silla", "tipo": "silla", "pos": [4, 2.0, 0]}],
    actores=[actor("p1", "cliente", ruta((4, 2.0, 0), (4, 2.0, 3), (3.3, 2.2, 3.6), (2.2, 1.8, 4.4), (0.5, 5.5, 6), (0.5, 5.5, 16)), sentado_hasta=3)],
    eventos=[ev(3, "levantarse", "p1", objeto="silla"), ev(3.6, "tomar", "p1", objeto="maleta")])
E["rostro"] = dict(escenario="acceso", camara=CAM_ACCESO, actores=[
    actor("x1", "cliente", ruta((4, 8.5, 0), (4, 5.6, 3.6), (4, 3.5, 6), (4, 3.5, 13)), casco_moto=True),
    actor("p1", "cliente", ruta((3.5, 8.5, 1), (3.5, 5.6, 5), (2.5, 3, 9), (2.5, 3, 13)))])
E["activos"] = dict(escenario="oficina", camara={"pos": [4, -3.5, 3], "mira": [4, 3, 1]}, muebles=[[2, 3, 0, 6, 3.8, 0.75]], lineas=[{"id": "mostrador", "de": [0, 2.9], "a": [8, 2.9], "color": "magenta"}],
    objetos=[{"id": "celular", "tipo": "celular", "pos": [3.2, 3.4, 0.75]}, {"id": "monitor", "tipo": "monitor", "pos": [5, 3.5, 0.75]}],
    actores=[actor("x1", "cliente", ruta((0.5, 1, 0), (3.2, 2.3, 4), (3.2, 2.3, 6.5), (7.5, 1, 9), (7.5, 1, 16))), actor("s1", "staff", ruta((6, 5, 0), (6, 5, 16)), uniforme="amarillo")],
    eventos=[ev(4.2, "alcanzar", "x1", objeto="celular"), ev(5.4, "tomar", "x1", objeto="celular"), ev(5.6, "esconder", "x1", objeto="celular")])
E["fleje"] = dict(escenario="tienda", surtir_gondolas=False, camara={"pos": [4, -2.5, 1.8], "mira": [4, 2, 1.0]}, muebles=[G(1, 7, 2)], personas=0,
    objetos=[{"id": f"fl{i}", "tipo": "fleje", "pos": [1.6 + i * 0.8, 1.68, 1.0], "estado": ("ok" if i not in (3, 5) else ("falta" if i == 3 else "precio_mal"))} for i in range(8)]
    + [{"id": f"pr{i}", "tipo": "caja_pequena", "pos": [1.6 + i * 0.8, 1.75, 1.1]} for i in range(8)])
E["canastillas"] = dict(escenario="bodega", camara={"pos": [4, -4, 2.8], "mira": [4, 3, 0.8]}, personas=1,
    objetos=[{"id": f"c{i}", "tipo": "canastilla", "pos": [3, 3, 0.25 * i]} for i in range(8)] + [{"id": f"d{i}", "tipo": "canastilla", "pos": [5, 3, 0.25 * i]} for i in range(4)],
    actores=[actor("s1", "staff", ruta((7.5, 5, 0), (3.7, 3.3, 4), (3.7, 3.3, 9), (7.5, 5, 12), (7.5, 5, 14)), uniforme="amarillo")],
    eventos=[ev(5, "tomar", "s1", objeto="c7"), ev(6.3, "tomar", "s1", objeto="c6"), ev(7.6, "tomar", "s1", objeto="c5")])
E["puertas"] = dict(escenario="tienda", camara={"pos": [4, -4, 3], "mira": [4, 3.5, 1.2]}, objetos=[{"id": f"nev{i}", "tipo": "nevera", "pos": [1.5 + i * 1.6, 5.2, 0]} for i in range(1, 5)] + [{"id": "bebida", "tipo": "botella", "pos": [3.1, 5.0, 1.0]}],
    actores=[actor("p1", "cliente", ruta((7.5, 1.5, 0), (3.1, 4.3, 3), (3.1, 4.3, 6), (0.5, 1.5, 9), (0.5, 1.5, 16)))],
    eventos=[ev(3, "abrir", "nev2"), ev(4.2, "tomar", "p1", objeto="bebida"), ev(6, "alejarse", "p1")])
E["huecos"] = dict(escenario="tienda", surtir_gondolas=False, camara={"pos": [4, -3, 2.2], "mira": [4, 2, 1.0]}, muebles=[G(1, 7, 2, 0, 1.8)], personas=2,
    objetos=[{"id": f"pr{i}", "tipo": "caja_pequena", "pos": [1.4 + 0.45 * (i % 12), 1.75, 0.5 + 0.6 * (i // 12)]} for i in range(36)],
    actores=[actor("p1", "cliente", ruta((0.5, 3.5, 0), (3, 2.9, 3), (3, 2.9, 9), (7.5, 3.5, 12), (7.5, 3.5, 15))), actor("p2", "cliente", ruta((7.5, 3.5, 1), (5.5, 2.9, 4), (5.5, 2.9, 11), (0.5, 3.5, 15)))],
    eventos=[ev(4, "tomar", "p1", objeto="pr3"), ev(5.5, "tomar", "p1", objeto="pr4"), ev(5, "tomar", "p2", objeto="pr21"), ev(7, "tomar", "p2", objeto="pr22"), ev(8, "tomar", "p1", objeto="pr15")])
E["vencido"] = dict(escenario="tienda", surtir_gondolas=False, camara={"pos": [4, -2.5, 1.8], "mira": [4, 2, 1.0]}, muebles=[G(1, 7, 2)], personas=0,
    objetos=[{"id": f"pr{i}", "tipo": "lacteo", "pos": [1.6 + i * 0.8, 1.75, 1.1], "vence": ["ok", "ok", "semana", "ok", "semana", "vencido", "ok", "semana"][i]} for i in range(8)])
E["destruccion"] = dict(escenario="bodega", camara={"pos": [4, -4, 2.8], "mira": [4, 3, 0.9]}, objetos=[{"id": "contenedor", "tipo": "contenedor", "pos": [5.5, 3, 0], "boca": [5.5, 3, 1.0]}, {"id": "carro", "tipo": "carro", "pos": [2.5, 3, 0]}, {"id": "venc", "tipo": "lacteo", "pos": [2.5, 3, 0.9]}],
    actores=[actor("s1", "staff", ruta((3.3, 2.2, 0), (3.3, 2.2, 15)), uniforme="amarillo")],
    eventos=[ev(3, "tomar", "s1", objeto="venc"), ev(5.5, "soltar", "s1", objeto="venc", destino=[5.5, 3, 1.05])])
E["bodega"] = dict(escenario="bodega", camara={"pos": [4, -5, 3.5], "mira": [4, 3, 1]}, muebles=[[0.5, 4.5, 0, 7.5, 5.5, 3.0], [0.5, 0.5, 0, 7.5, 1.5, 3.0]], zonas=[{"id": "pasillo", "caja": [0.5, 1.8, 7.5, 4.2]}],
    objetos=[{"id": "estiba", "tipo": "estiba_cargada", "pos": [1.5, 5, 0]}], personas=1,
    actores=[actor("s1", "staff", ruta((0.5, 3, 0), (1.5, 3.6, 2), (4, 3, 5), (4, 3, 15)), uniforme="amarillo")],
    eventos=[ev(2, "empujar", "s1", objeto="estiba", destino=[4, 3, 0], hasta=5)])
E["racks"] = dict(escenario="bodega", camara={"pos": [4, -5, 3.5], "mira": [4, 3, 1.8]}, muebles=[[1, 3.5, 0, 7, 4.5, 2.4]], zonas=[{"id": "franja_techo", "caja3d": [1, 3.5, 2.9, 7, 4.5, 3.2]}],
    objetos=[{"id": f"caja{i}", "tipo": "caja_grande", "pos": [1.6 + 0.9 * (i % 6), 4, 2.4 + 0.45 * (i // 6)]} for i in range(6)] + [{"id": "extra1", "tipo": "caja_grande", "pos": [6, 1, 0]}, {"id": "extra2", "tipo": "caja_grande", "pos": [6, 1, 0.45]}],
    actores=[actor("s1", "montacarga", ruta((6, 0.5, 0), (4, 2.8, 4), (4, 2.8, 14)))],
    eventos=[ev(4, "apilar", "s1", objeto="extra1", destino=[4, 4, 2.85]), ev(6.5, "apilar", "s1", objeto="extra2", destino=[4, 4, 3.3])])
E["pasillos"] = dict(escenario="pasillo", camara={"pos": [-1.5, 3.0, 3.0], "mira": [5, 3.0, 0.6]}, muebles=[G(0.5, 7.5, 0.5), G(0.5, 7.5, 5.5)], objetos=[{"id": "caja", "tipo": "caja_grande", "pos": [0.5, 3, 0], "en_mano": "s1"}],
    actores=[actor("s1", "staff", ruta((0.5, 3.5, 0), (4, 3, 3.4), (7.5, 3.5, 6), (7.5, 3.5, 11), (4, 3.3, 13), (0.5, 3.5, 16)), uniforme="amarillo")],
    eventos=[ev(3.4, "soltar", "s1", objeto="caja", destino=[4, 3, 0]), ev(13, "tomar", "s1", objeto="caja")])
E["exhibicion"] = dict(escenario="tienda", surtir_gondolas=False, camara={"pos": [4, -2.5, 1.8], "mira": [4, 2, 1.0]}, muebles=[G(1, 7, 2, 0, 1.8)], personas=0,
    objetos=[{"id": f"pr{i}", "tipo": "caja_pequena", "pos": [1.4 + 0.5 * (i % 11), 1.75, 0.5 + 0.6 * (i // 11)], "color_grupo": (i % 11) // 4, "fuera_de_lugar": i == 17} for i in range(33)] + [{"id": "fl_falta", "tipo": "fleje", "pos": [4.4, 1.68, 1.0], "estado": "falta"}])
E["trazabilidad"] = dict(escenario="tienda", camara={"pos": [4, -5, 3.3], "mira": [4, 3, 1]}, muebles=[G(1, 3.5, 2), [5.5, 4.5, 0, 7, 5.3, 1.0]],
    objetos=[{"id": f"pr{i}", "tipo": "caja_pequena", "pos": [1.6 + i * 0.6, 1.75, 1.1]} for i in range(3)],
    actores=[actor("p1", "cliente", ruta((0.5, 4.5, 0), (2.2, 2.9, 2), (2.2, 2.9, 7), (6.2, 4.0, 10), (6.2, 4.0, 18)), bolsa=True), actor("c1", "staff", ruta((6.2, 5.8, 0), (6.2, 5.8, 18)), uniforme="amarillo")],
    eventos=[ev(2.5, "tomar", "p1", objeto="pr0"), ev(4, "tomar", "p1", objeto="pr1"), ev(5.5, "tomar", "p1", objeto="pr2"), ev(10.5, "soltar", "p1", objeto="pr0", destino=[6.0, 4.9, 1.05]), ev(11.5, "soltar", "p1", objeto="pr1", destino=[6.4, 4.9, 1.05])])
E["autopago"] = dict(escenario="tienda", camara={"pos": [4, -3, 2.5], "mira": [4, 3, 1.0]}, muebles=[[3, 3.5, 0, 5, 4.3, 1.0]], objetos=[{"id": "lector", "tipo": "lector", "pos": [4, 3.9, 1.0]}] + [{"id": f"pr{i}", "tipo": "caja_pequena", "pos": [3.3 + 0.3 * i, 3.6, 1.05]} for i in range(4)] + [{"id": "bolsa", "tipo": "bolsa", "pos": [4.7, 3.7, 1.0]}],
    actores=[actor("p1", "cliente", ruta((4, 2.6, 0), (4, 2.6, 15)))],
    eventos=[ev(2.5, "tomar", "p1", objeto="pr0"), ev(3.2, "pasar_lector", "p1", objeto="pr0"), ev(4, "soltar", "p1", objeto="pr0", destino=[4.7, 3.7, 1.1]),
             ev(4.5, "tomar", "p1", objeto="pr1"), ev(5.2, "pasar_lector", "p1", objeto="pr1"), ev(6, "soltar", "p1", objeto="pr1", destino=[4.7, 3.7, 1.2]),
             ev(6.5, "tomar", "p1", objeto="pr2"), ev(7.2, "pasar_lector", "p1", objeto="pr2"), ev(8, "soltar", "p1", objeto="pr2", destino=[4.7, 3.7, 1.3]),
             ev(8.6, "tomar", "p1", objeto="pr3"), ev(9.4, "soltar", "p1", objeto="pr3", destino=[4.7, 3.7, 1.4])])
E["zonaCiega"] = dict(escenario="tienda", camara={"pos": [4, -6, 5], "mira": [4, 3, 0.5]}, muebles=[G(1, 3, 2), G(5, 7, 2), [5, 4.5, 0, 7, 5.8, 2.2]],
    camaras_virtuales=[{"pos": [0.3, 5.8, 2.6], "mira": [4, 2, 0.5], "fov": 70}, {"pos": [7.7, 0.3, 2.6], "mira": [3, 3, 0.5], "fov": 70}],
    actores=[actor("p1", "cliente", ruta((0.5, 4, 0), (4, 4, 5), (4.4, 6.6, 8), (6.2, 6.4, 10), (6.2, 6.4, 16)))],
    eventos=[ev(10, "desaparecer", "p1", zona="ciega")])
E["apertura"] = dict(escenario="acceso", camara={"pos": [4, -4, 3], "mira": [4, 5, 1.2]}, objetos=[{"id": "puerta", "tipo": "puerta_corrediza", "pos": [4, 5.5, 0], "cerrada": True}], reloj="06:55",
    actores=[actor("e1", "staff", ruta((4, 8, 0), (4, 5.9, 3), (4, 5.9, 5), (4, 3, 7), (4, 3, 16)), uniforme="amarillo"),
             actor("p1", "cliente", ruta((3.5, 9, 7), (3.5, 5.6, 10), (2.5, 3, 13), (2.5, 3, 16))), actor("p2", "cliente", ruta((4.5, 9.5, 8), (4.5, 5.6, 11.5), (6, 3, 14.5), (6, 3, 16)))],
    eventos=[ev(3, "abrir", "puerta", por="e1")])
E["cierre"] = dict(escenario="acceso", camara={"pos": [4, -4, 3], "mira": [4, 5, 1.2]}, objetos=[{"id": "puerta", "tipo": "puerta_corrediza", "pos": [4, 5.5, 0], "cerrada": False}], reloj="15:18",
    actores=[actor("e1", "staff", ruta((1, 3, 0), (4, 5, 3.5), (4, 5, 4.5), (6, 3, 7), (6, 3, 16)), uniforme="amarillo"),
             actor("p1", "cliente", ruta((4, 9, 5), (4, 6, 8), (4, 6, 11), (3, 8, 14), (3, 8, 16)))],
    eventos=[ev(4, "cerrar", "puerta", por="e1"), ev(8, "detener", "p1", hasta=11)])

assert set(E) == set(AN), set(AN) - set(E)
OUT.mkdir(parents=True, exist_ok=True)
for k, e in E.items():
    a = AN[k]
    g = {"id": k, "tipo": a["familia"], "nombre": a["nombre"], "dur": a["dur"], "fps": 30, "fases": a["fases"],
         "camara": e.get("camara", CAM_TIENDA), "escenario": e.get("escenario", "tienda"),
         "personas": e.get("personas", len(e.get("actores", []))), "muebles": bool(e.get("muebles")),
         "cajas_muebles": e.get("muebles", []), "actores": e.get("actores", []), "objetos": e.get("objetos", []),
         "vehiculos": e.get("vehiculos", []), "eventos": sorted(e.get("eventos", []), key=lambda x: x["t"]),
         "lineas": e.get("lineas", []), "zonas": e.get("zonas", []), "camaras_virtuales": e.get("camaras_virtuales", []), "reloj": e.get("reloj"),
         "separacion_personas": e.get("separacion_personas", 1.10), "surtir_gondolas": e.get("surtir_gondolas", True)}
    d = OUT / k; d.mkdir(exist_ok=True)
    (d / "guion.json").write_text(json.dumps(g, ensure_ascii=False, indent=1))
print(len(E), "guiones en", OUT)
