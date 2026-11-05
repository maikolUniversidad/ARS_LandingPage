/**
 * Sección «Su ERP y sus sistemas» del PDF: ARS es un ERP completo (nómina,
 * contabilidad, facturación, CRM…) y además se adapta. Según la estrategia,
 * todo converge en ARS, la información fluye con sus sistemas, o ambas cosas.
 */
import { Circle, G, Path, Rect, Svg, Text, View } from "@react-pdf/renderer";
import type { EstrategiaErp, Integracion } from "@/data/propuesta/tipos";
import { LINEA, MARCA, SUAVE, TINTA, TINTA_2, TINTA_3, s } from "./estilos";

export const TITULAR_ERP: Record<EstrategiaErp["modo"], string> = {
  "ars-centraliza": "Todo converge en ARS",
  "fluye-con-su-sistema": "La información fluye con sus sistemas",
  mixto: "ARS centraliza lo operativo y fluye con lo demás",
};

const OPCIONES: { modo: EstrategiaErp["modo"]; texto: string }[] = [
  { modo: "ars-centraliza", texto: "ARS centraliza" },
  { modo: "fluye-con-su-sistema", texto: "Fluye con su sistema" },
  { modo: "mixto", texto: "Mixto" },
];

const CONVERGE = MARCA.indigo;
const FLUYE = "#0e7490";

type Nodo = { nombre: string; flujo: "converge" | "fluye" };

/** Qué sistemas dibujar y con qué flujo, según el modo y lo que dice el mapa de integración. */
function nodosDe(e: EstrategiaErp, integraciones: Integracion[]): Nodo[] {
  const nombres = (e.sistemas.length ? e.sistemas : integraciones.map((i) => i.sistema)).slice(0, 6);
  const lista = nombres.length ? nombres : ["Su sistema actual"];
  return lista.map((nombre) => {
    if (e.modo === "ars-centraliza") return { nombre, flujo: "converge" };
    if (e.modo === "fluye-con-su-sistema") return { nombre, flujo: "fluye" };
    const modo = integraciones.find((i) => i.sistema.toLowerCase() === nombre.toLowerCase())?.modo;
    return { nombre, flujo: modo === "migra" || modo === "reemplaza" || modo === "centraliza" ? "converge" : "fluye" };
  });
}

/** Punta de flecha en (x, y) apuntando en la dirección (dx, dy). */
function punta(x: number, y: number, dx: number, dy: number, t = 5): string {
  const l = Math.hypot(dx, dy) || 1;
  const [ux, uy] = [dx / l, dy / l];
  const [bx, by] = [x - ux * t, y - uy * t];
  return `M ${x} ${y} L ${bx - uy * t * 0.6} ${by + ux * t * 0.6} L ${bx + uy * t * 0.6} ${by - ux * t * 0.6} Z`;
}

const W = 252;
const H = 200;
const CX = W / 2;
const CY = H / 2;
const R = 36;
const BW = 74;
const BH = 30;

function Diagrama({ nodos }: { nodos: Nodo[] }) {
  const izq = nodos.filter((_, i) => i % 2 === 0);
  const der = nodos.filter((_, i) => i % 2 === 1);
  const cajas = [
    ...izq.map((n, i) => ({ n, x: 0, y: ((i + 0.5) * H) / izq.length - BH / 2, lado: -1 })),
    ...der.map((n, i) => ({ n, x: W - BW, y: ((i + 0.5) * H) / der.length - BH / 2, lado: 1 })),
  ];
  return (
    <View style={{ width: W, height: H, position: "relative" }}>
      <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {cajas.map(({ n, x, y, lado }, i) => {
          // del borde de la caja al borde del círculo
          const x0 = lado < 0 ? x + BW : x;
          const y0 = y + BH / 2;
          const dx = CX - x0;
          const dy = CY - y0;
          const l = Math.hypot(dx, dy);
          const x1 = CX - (dx / l) * (R + 3);
          const y1 = CY - (dy / l) * (R + 3);
          if (n.flujo === "converge") {
            return (
              <G key={i}>
                <Path d={`M ${x0} ${y0} L ${x1} ${y1}`} stroke={CONVERGE} strokeWidth={1.5} />
                <Path d={punta(x1, y1, dx, dy)} fill={CONVERGE} />
              </G>
            );
          }
          // ida y vuelta: dos líneas paralelas con puntas opuestas
          const [nx, ny] = [(-dy / l) * 3, (dx / l) * 3];
          return (
            <G key={i}>
              <Path d={`M ${x0 + nx} ${y0 + ny} L ${x1 + nx} ${y1 + ny}`} stroke={FLUYE} strokeWidth={1.2} />
              <Path d={punta(x1 + nx, y1 + ny, dx, dy, 4.5)} fill={FLUYE} />
              <Path d={`M ${x1 - nx} ${y1 - ny} L ${x0 - nx} ${y0 - ny}`} stroke={FLUYE} strokeWidth={1.2} />
              <Path d={punta(x0 - nx, y0 - ny, -dx, -dy, 4.5)} fill={FLUYE} />
            </G>
          );
        })}
        {cajas.map(({ n, x, y }, i) => (
          <Rect
            key={`c${i}`}
            x={x}
            y={y}
            width={BW}
            height={BH}
            rx={5}
            ry={5}
            fill="#ffffff"
            stroke={n.flujo === "converge" ? CONVERGE : FLUYE}
            strokeWidth={0.9}
          />
        ))}
        <Circle cx={CX} cy={CY} r={R + 9} fill="none" stroke={MARCA.indigoClaro} strokeWidth={0.6} strokeOpacity={0.6} />
        <Circle cx={CX} cy={CY} r={R} fill={MARCA.imperial} />
      </Svg>
      {cajas.map(({ n, x, y }, i) => (
        <View key={`t${i}`} style={{ position: "absolute", left: x + 4, top: y, width: BW - 8, height: BH, justifyContent: "center", alignItems: "center" }}>
          <Text style={{ fontSize: 7, fontWeight: 700, color: TINTA, textAlign: "center", lineHeight: 1.15, maxLines: 2, textOverflow: "ellipsis" }}>
            {n.nombre}
          </Text>
        </View>
      ))}
      <View style={{ position: "absolute", left: CX - R, top: CY - R, width: R * 2, height: R * 2, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ fontSize: 12, fontWeight: 900, color: "#ffffff" }}>ARS</Text>
        <Text style={{ fontSize: 5.2, letterSpacing: 0.8, textTransform: "uppercase", color: MARCA.acero, marginTop: 1 }}>ERP completo</Text>
      </View>
    </View>
  );
}

export function SeccionErp({ e, integraciones }: { e: EstrategiaErp; integraciones: Integracion[] }) {
  const nodos = nodosDe(e, integraciones);
  const hayConverge = nodos.some((n) => n.flujo === "converge");
  const hayFluye = nodos.some((n) => n.flujo === "fluye");
  return (
    <View style={{ flexDirection: "row" }} wrap={false}>
      <View style={{ flex: 1, paddingRight: 18 }}>
        <Text style={{ fontFamily: "Radley", fontStyle: "italic", fontSize: 11.5, color: TINTA, lineHeight: 1.4 }}>
          ARS es un ERP completo —nómina, contabilidad, facturación y CRM— y se adapta a cómo trabaja usted.
        </Text>
        <Text style={{ fontSize: 9.3, color: TINTA_2, marginTop: 8, lineHeight: 1.5 }}>{e.explicacion}</Text>
        <Text style={[s.etiqueta, { marginTop: 12 }]}>Cómo lo armamos para usted</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {OPCIONES.map((o) => {
            const activa = o.modo === e.modo;
            return (
              <View
                key={o.modo}
                style={{
                  borderRadius: 10,
                  paddingVertical: 3,
                  paddingHorizontal: 8,
                  marginRight: 5,
                  marginBottom: 4,
                  backgroundColor: activa ? MARCA.imperial : SUAVE,
                  borderWidth: 0.6,
                  borderColor: activa ? MARCA.imperial : LINEA,
                }}
              >
                <Text style={{ fontSize: 7.8, fontWeight: activa ? 900 : 400, color: activa ? "#ffffff" : TINTA_3 }}>{o.texto}</Text>
              </View>
            );
          })}
        </View>
        {e.sistemas.length > 0 && (
          <Text style={{ fontSize: 8, color: TINTA_3, marginTop: 6 }}>
            Sus sistemas hoy: <Text style={{ color: TINTA, fontWeight: 700 }}>{e.sistemas.join(" · ")}</Text>
          </Text>
        )}
      </View>
      <View style={{ width: W, alignItems: "center" }}>
        <Diagrama nodos={nodos} />
        <View style={{ flexDirection: "row", marginTop: 6 }}>
          {hayConverge && (
            <View style={{ flexDirection: "row", alignItems: "center", marginRight: 12 }}>
              <View style={{ width: 14, height: 1.6, backgroundColor: CONVERGE, marginRight: 4 }} />
              <Text style={{ fontSize: 7, color: TINTA_2 }}>Converge en ARS</Text>
            </View>
          )}
          {hayFluye && (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={{ width: 14, height: 1.6, backgroundColor: FLUYE, marginRight: 4 }} />
              <Text style={{ fontSize: 7, color: TINTA_2 }}>Ida y vuelta con su sistema</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
