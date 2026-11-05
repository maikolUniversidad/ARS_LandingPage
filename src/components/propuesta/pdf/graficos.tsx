/**
 * Gráficos del PDF de la propuesta, dibujados con las primitivas SVG de react-pdf.
 * Las etiquetas van como <Text> real encima del SVG (mejor tipografía que Svg Text).
 */
import { Circle, G, Path, Rect, Svg, Text, View } from "@react-pdf/renderer";
import type { FaseTrabajo, Indicador, ModuloPropuesto } from "@/data/propuesta/tipos";
import { areaPorId } from "@/data/servicios";
import { LINEA, MARCA, SUAVE, TINTA, TINTA_2, TINTA_3, UTIL, colorArea, nombreArea, s } from "./estilos";

export const COLOR_HOY = "#b8693c";
export const COLOR_ARS = MARCA.indigo;

/* ───────────── Cobertura por área (donut) ───────────── */

const polar = (cx: number, cy: number, r: number, a: number) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];

function sector(cx: number, cy: number, r0: number, r1: number, a0: number, a1: number): string {
  const grande = a1 - a0 > Math.PI ? 1 : 0;
  const [x0, y0] = polar(cx, cy, r1, a0);
  const [x1, y1] = polar(cx, cy, r1, a1);
  const [x2, y2] = polar(cx, cy, r0, a1);
  const [x3, y3] = polar(cx, cy, r0, a0);
  return `M ${x0} ${y0} A ${r1} ${r1} 0 ${grande} 1 ${x1} ${y1} L ${x2} ${y2} A ${r0} ${r0} 0 ${grande} 0 ${x3} ${y3} Z`;
}

/** Fracciones → [inicio, fin] en radianes, empezando arriba. */
function angulos(fracciones: number[]): [number, number][] {
  const out: [number, number][] = [];
  for (const f of fracciones) {
    const a0 = out.length ? out[out.length - 1][1] : -Math.PI / 2;
    out.push([a0, a0 + f * Math.PI * 2]);
  }
  return out;
}

export function CoberturaAreas({ modulos }: { modulos: ModuloPropuesto[] }) {
  const cuenta = new Map<string, number>();
  for (const m of modulos) cuenta.set(m.area, (cuenta.get(m.area) ?? 0) + 1);
  const filas = [...cuenta.entries()].sort((a, b) => b[1] - a[1]);
  const total = modulos.length || 1;
  const D = 132;
  const c = D / 2;
  const hueco = filas.length > 1 ? 0.025 : 0;
  const sectores = angulos(filas.map(([, n]) => n / total));
  return (
    <View style={{ flexDirection: "row", alignItems: "center" }} wrap={false}>
      <View style={{ width: D, height: D, position: "relative" }}>
        <Svg width={D} height={D} viewBox={`0 0 ${D} ${D}`}>
          {filas.length === 1 ? (
            <Circle cx={c} cy={c} r={c - 12} fill="none" stroke={colorArea(filas[0][0])} strokeWidth={22} />
          ) : (
            filas.map(([area], i) => <Path key={area} d={sector(c, c, c - 23, c - 1, sectores[i][0] + hueco, sectores[i][1] - hueco)} fill={colorArea(area)} />)
          )}
        </Svg>
        <View style={{ position: "absolute", top: 0, left: 0, width: D, height: D, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ fontSize: 24, fontWeight: 900, lineHeight: 1 }}>{modulos.length}</Text>
          <Text style={{ fontSize: 6.5, letterSpacing: 1.2, textTransform: "uppercase", color: TINTA_3, marginTop: 3 }}>módulos</Text>
        </View>
      </View>
      <View style={{ flex: 1, paddingLeft: 22 }}>
        {filas.map(([area, n]) => {
          const disponibles = areaPorId(area)?.modulos.length ?? n;
          return (
            <View key={area} style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
              <View style={{ width: 9, height: 9, borderRadius: 2, backgroundColor: colorArea(area), marginRight: 7 }} />
              <Text style={{ width: 150, fontSize: 9, fontWeight: 700 }}>{nombreArea(area)}</Text>
              <View style={{ flex: 1, height: 6, backgroundColor: SUAVE, borderRadius: 3, marginRight: 8 }}>
                <View
                  style={{ width: `${Math.min(100, (n / Math.max(disponibles, 1)) * 100)}%`, height: 6, backgroundColor: colorArea(area), borderRadius: 3 }}
                />
              </View>
              <Text style={{ width: 92, fontSize: 8, color: TINTA_2, textAlign: "right" }}>
                {n} de {disponibles} {disponibles === 1 ? "módulo" : "módulos"}
              </Text>
            </View>
          );
        })}
        <Text style={{ fontSize: 7.5, color: TINTA_3, marginTop: 2 }}>
          La barra muestra cuánto del área se enciende ahora; el resto queda listo para cuando lo necesite.
        </Text>
      </View>
    </View>
  );
}

/* ───────────── Gantt de la línea de trabajo ───────────── */

export function semanas(duracion: string): { min: number; max: number } {
  const n = duracion.match(/\d+/g)?.map(Number) ?? [];
  const min = Math.max(1, n[0] ?? 4);
  return { min, max: Math.max(min, n[1] ?? min) };
}

/** Cada fase arranca cuando termina el mínimo de la anterior; el máximo es la holgura. */
function tramosDe(fases: FaseTrabajo[]): { inicio: number; min: number; max: number }[] {
  const out: { inicio: number; min: number; max: number }[] = [];
  for (const f of fases) {
    const prev = out[out.length - 1];
    out.push({ inicio: prev ? prev.inicio + prev.min : 0, ...semanas(f.duracion) });
  }
  return out;
}

export function Gantt({ fases }: { fases: FaseTrabajo[] }) {
  const ETQ = 150;
  const FILA = 24;
  const EJE = 16;
  const ancho = UTIL - ETQ;
  const tramos = tramosDe(fases);
  const total = Math.max(...tramos.map((t) => t.inicio + t.max), 1);
  const x = (sem: number) => ETQ + (sem / total) * ancho;
  const paso = total > 24 ? 4 : 2;
  const marcas = Array.from({ length: Math.floor(total / paso) + 1 }, (_, i) => i * paso);
  const H = EJE + fases.length * FILA;
  const colores = [MARCA.imperial, MARCA.french, MARCA.indigo, "#4a6bf0", "#6b8aff"];
  const minTotal = tramos.reduce((a, t) => a + t.min, 0);
  const maxTotal = tramos.reduce((a, t) => a + t.max, 0);

  return (
    <View style={{ marginBottom: 14 }} wrap={false}>
      <View style={{ position: "relative", height: H }}>
        <Svg style={{ position: "absolute", top: 0, left: 0 }} width={UTIL} height={H} viewBox={`0 0 ${UTIL} ${H}`}>
          {marcas.map((m) => (
            <Rect key={m} x={x(m)} y={EJE - 2} width={0.5} height={H - EJE + 2} fill={LINEA} />
          ))}
          {tramos.map((t, i) => {
            const y = EJE + i * FILA + 6;
            const color = colores[i % colores.length];
            return (
              <G key={i}>
                {t.max > t.min && (
                  <Rect x={x(t.inicio)} y={y} width={x(t.inicio + t.max) - x(t.inicio)} height={12} rx={3} ry={3} fill={color} fillOpacity={0.22} />
                )}
                <Rect x={x(t.inicio)} y={y} width={Math.max(3, x(t.inicio + t.min) - x(t.inicio))} height={12} rx={3} ry={3} fill={color} />
              </G>
            );
          })}
        </Svg>
        {marcas.map((m) => (
          <Text key={m} style={{ position: "absolute", top: 0, left: x(m) - 10, width: 20, textAlign: "center", fontSize: 6.5, color: TINTA_3 }}>
            {m}
          </Text>
        ))}
        {fases.map((f, i) => (
          <View key={f.nombre} style={{ position: "absolute", top: EJE + i * FILA + 3, left: 0, width: ETQ - 10, height: 18, justifyContent: "center" }}>
            <Text style={{ fontSize: 8, fontWeight: 700, color: TINTA, maxLines: 1, textOverflow: "ellipsis" }}>{f.nombre}</Text>
          </View>
        ))}
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 4, paddingLeft: ETQ }}>
        <Text style={{ fontSize: 7, color: TINTA_3 }}>Semanas desde el arranque · tramo claro: holgura del estimado</Text>
        <Text style={{ fontSize: 7, color: TINTA_3 }}>{minTotal === maxTotal ? `${maxTotal}` : `${minTotal} a ${maxTotal}`} semanas en total (estimado)</Text>
      </View>
    </View>
  );
}

/* ───────────── Indicadores hoy vs con ARS ───────────── */

const num = (n: number) => n.toLocaleString("es-CO", { maximumFractionDigits: 1 });
const conUnidad = (n: number, u: string) => (u.trim() === "%" ? `${num(n)} %` : `${num(n)} ${u}`);

function cambio(i: Indicador): string {
  if (i.unidad.trim() === "%") {
    const d = i.conArs - i.hoy;
    return `${d > 0 ? "+" : d < 0 ? "−" : ""}${num(Math.abs(d))} pts`;
  }
  if (!i.hoy) return "";
  const d = ((i.conArs - i.hoy) / i.hoy) * 100;
  return `${d > 0 ? "+" : d < 0 ? "−" : ""}${num(Math.round(Math.abs(d)))} %`;
}

export function TarjetaIndicador({ i }: { i: Indicador }) {
  const W = 222;
  const x0 = 44;
  const etq = Math.max(conUnidad(i.hoy, i.unidad).length, conUnidad(i.conArs, i.unidad).length);
  const ancho = W - x0 - Math.min(110, etq * 4.6 + 8);
  const max = Math.max(i.hoy, i.conArs, 1);
  const filas = [
    { etiqueta: "Hoy", valor: i.hoy, color: COLOR_HOY, y: 0, fuerte: false },
    { etiqueta: "Con ARS", valor: i.conArs, color: COLOR_ARS, y: 19, fuerte: true },
  ];
  const mejora = i.mejorEsMayor ? i.conArs > i.hoy : i.conArs < i.hoy;
  return (
    <View style={[s.tarjeta, { width: "48.5%", marginBottom: 8, padding: 10 }]} wrap={false}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <View style={{ flex: 1, paddingRight: 8 }}>
          <Text style={{ fontSize: 9.5, fontWeight: 700, lineHeight: 1.25 }}>{i.nombre}</Text>
          <Text style={{ fontSize: 7, color: TINTA_3, marginTop: 2 }}>
            {i.unidad} · {i.mejorEsMayor ? "más es mejor" : "menos es mejor"}
          </Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={{ fontSize: 13, lineHeight: 1.2, fontWeight: 900, color: mejora ? MARCA.indigo : TINTA }}>{cambio(i)}</Text>
          <Text style={{ fontSize: 6, letterSpacing: 1.1, textTransform: "uppercase", color: TINTA_3 }}>estimado</Text>
        </View>
      </View>
      <View style={{ marginTop: 6, position: "relative", height: 36 }}>
        <Svg width={W} height={36} viewBox={`0 0 ${W} 36`}>
          <Rect x={x0} y={0} width={0.7} height={36} fill="#b9c3d6" />
          {filas.map((f) => (
            <Rect key={f.etiqueta} x={x0 + 1} y={f.y + 2} width={Math.max(1.5, (f.valor / max) * ancho)} height={13} rx={2.5} ry={2.5} fill={f.color} />
          ))}
        </Svg>
        {filas.map((f) => (
          <View key={f.etiqueta} style={{ position: "absolute", top: f.y + 3, left: 0, width: W, height: 14 }}>
            <Text style={{ position: "absolute", left: 0, width: x0 - 6, textAlign: "right", fontSize: 7.5, color: TINTA_2 }}>{f.etiqueta}</Text>
            <Text
              style={{
                position: "absolute",
                left: x0 + 1 + Math.max(1.5, (f.valor / max) * ancho) + 5,
                fontSize: 8,
                fontWeight: f.fuerte ? 900 : 400,
                color: f.fuerte ? TINTA : TINTA_2,
              }}
            >
              {conUnidad(f.valor, i.unidad)}
            </Text>
          </View>
        ))}
      </View>
      {i.nota ? <Text style={{ fontSize: 7.3, color: TINTA_3, marginTop: 4, lineHeight: 1.35 }}>{i.nota}</Text> : null}
    </View>
  );
}

export function LeyendaHoyArs() {
  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <View style={{ width: 12, height: 7, borderRadius: 1.5, backgroundColor: COLOR_HOY, marginRight: 4 }} />
      <Text style={{ fontSize: 8, color: TINTA_2, marginRight: 12 }}>Hoy</Text>
      <View style={{ width: 12, height: 7, borderRadius: 1.5, backgroundColor: COLOR_ARS, marginRight: 4 }} />
      <Text style={{ fontSize: 8, color: TINTA_2 }}>Con ARS</Text>
    </View>
  );
}
