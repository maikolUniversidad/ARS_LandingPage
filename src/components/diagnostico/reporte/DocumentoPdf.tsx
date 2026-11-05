/**
 * PDF del Diagnóstico ARS con @react-pdf/renderer (A4, varias páginas, encabezado,
 * pie y numeración). Se carga SOLO con import() dinámico desde el botón «Descargar PDF»
 * para no pesar en el bundle inicial.
 */
import { Circle, Document, Font, Image, Link, Page, Path, Rect, StyleSheet, Svg, Text, View, pdf } from "@react-pdf/renderer";
import type { Diagnostico, ItemReporte } from "@/data/diagnostico/tipos";
import { mailtoUrl, whatsappUrl, CONTACT_EMAIL } from "@/lib/contact";
import {
  arco,
  barra,
  colorArea,
  cronograma,
  esMejora,
  fechaLarga,
  MARCA,
  mapaAreas,
  mejora,
  nombreArea,
  PRIORIDAD_TEXTO,
  recomendacionesOrdenadas,
  SERIE,
  TAMANO_TEXTO,
  totalSemanas,
  valorConUnidad,
} from "./datos";

const C = SERIE.claro;
const TINTA = "#0b1530";
const TINTA_2 = "#3b4863";
const TINTA_3 = "#6b7891";
const LINEA = "#dfe5f0";
const SUAVE = "#f3f6fb";

let fuentesListas = "";
function registrarFuentes(origen: string) {
  if (fuentesListas === origen) return;
  const f = (n: string) => `${origen}/fonts/reporte/${n}.ttf`;
  Font.register({
    family: "Lato",
    fonts: [
      { src: f("Lato-Regular") },
      { src: f("Lato-Italic"), fontStyle: "italic" },
      { src: f("Lato-Bold"), fontWeight: 700 },
      { src: f("Lato-Black"), fontWeight: 900 },
    ],
  });
  Font.register({
    family: "Radley",
    fonts: [{ src: f("Radley-Regular") }, { src: f("Radley-Italic"), fontStyle: "italic" }],
  });
  // Sin guiones de silabeo: las palabras se pasan completas a la línea siguiente.
  Font.registerHyphenationCallback((palabra) => [palabra]);
  fuentesListas = origen;
}

const s = StyleSheet.create({
  pagina: { fontFamily: "Lato", fontSize: 10, color: TINTA, paddingTop: 64, paddingBottom: 56, paddingHorizontal: 44, lineHeight: 1.45 },
  encabezado: {
    position: "absolute",
    top: 22,
    left: 44,
    right: 44,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 0.6,
    borderBottomColor: LINEA,
    paddingBottom: 8,
  },
  pie: {
    position: "absolute",
    top: 806,
    left: 44,
    right: 44,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 7.5,
    color: TINTA_3,
    borderTopWidth: 0.6,
    borderTopColor: LINEA,
    paddingTop: 7,
  },
  eyebrow: { fontSize: 7.5, letterSpacing: 1.6, textTransform: "uppercase", color: TINTA_3 },
  num: { fontSize: 7.5, letterSpacing: 1.6, color: MARCA.indigo, fontWeight: 700 },
  h2: { fontSize: 20, fontWeight: 900, marginTop: 4, marginBottom: 10, lineHeight: 1.15 },
  h3: { fontSize: 12, fontWeight: 900, lineHeight: 1.2 },
  p: { fontSize: 10, color: TINTA_2 },
  etiqueta: { fontSize: 6.8, letterSpacing: 1.3, textTransform: "uppercase", color: TINTA_3, marginTop: 7, marginBottom: 2 },
  tarjeta: { borderWidth: 0.7, borderColor: LINEA, borderRadius: 8, padding: 12, backgroundColor: "#ffffff" },
  chip: { flexDirection: "row", alignItems: "center", borderWidth: 0.6, borderColor: LINEA, borderRadius: 10, paddingVertical: 2.5, paddingHorizontal: 7, marginRight: 4, marginBottom: 4 },
  estimado: { fontSize: 6.5, lineHeight: 1, letterSpacing: 1.2, textTransform: "uppercase", color: TINTA_3, borderWidth: 0.6, borderColor: LINEA, borderRadius: 8, paddingTop: 3.5, paddingBottom: 2.5, paddingHorizontal: 6 },
});

function Encabezado({ origen, empresa }: { origen: string; empresa: string }) {
  return (
    <View style={s.encabezado} fixed>
      {/* eslint-disable-next-line jsx-a11y/alt-text -- Image de react-pdf no admite alt */}
      <Image src={`${origen}/images/logos/horizontal-negro.png`} style={{ width: 62, height: 35, marginVertical: -9, marginLeft: -4 }} />
      <Text style={{ fontSize: 7.5, color: TINTA_3, letterSpacing: 1.2, textTransform: "uppercase" }}>Diagnóstico ARS · {empresa}</Text>
    </View>
  );
}

function Pie({ fecha }: { fecha: string }) {
  return (
    <View style={s.pie} fixed>
      <Text>ARS Intelligence · ars-intelligence.com · {fechaLarga(fecha)}</Text>
      <Text render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
    </View>
  );
}

function TituloSeccion({ numero, eyebrow, titulo }: { numero: string; eyebrow: string; titulo: string }) {
  return (
    <View minPresenceAhead={120}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Text style={s.num}>{numero}</Text>
        <View style={{ width: 16, height: 0.6, backgroundColor: LINEA, marginHorizontal: 6 }} />
        <Text style={s.eyebrow}>{eyebrow}</Text>
      </View>
      <Text style={s.h2}>{titulo}</Text>
    </View>
  );
}

function Punto({ color, size = 5 }: { color: string; size?: number }) {
  return <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color, marginRight: 4 }} />;
}

function ChipArea({ id }: { id: Parameters<typeof colorArea>[0] }) {
  return (
    <View style={s.chip}>
      <Punto color={colorArea(id)} />
      <Text style={{ fontSize: 7.5, color: TINTA_2 }}>{nombreArea(id)}</Text>
    </View>
  );
}

/* ───────────────────────── Portada ───────────────────────── */

function Portada({ d, origen }: { d: Diagnostico; origen: string }) {
  const p = d.perfil;
  const meta = [
    ["Sector", p.sector],
    p.ciudad ? ["Ciudad", p.ciudad] : null,
    ["Tamaño", TAMANO_TEXTO[p.tamano]],
    p.sedes ? ["Sedes", String(p.sedes)] : null,
  ].filter((x): x is string[] => x !== null);
  return (
    <Page size="A4" style={{ fontFamily: "Lato", backgroundColor: MARCA.fondo, color: "#ffffff" }}>
      <Svg style={{ position: "absolute", top: 0, left: 0 }} width={595} height={840} viewBox="0 0 595 840">
        <Rect x={0} y={0} width={595} height={840} fill={MARCA.fondo} />
        <Circle cx={560} cy={60} r={330} fill={MARCA.imperial} />
        <Circle cx={560} cy={60} r={240} fill={MARCA.french} />
        <Circle cx={560} cy={60} r={150} fill={MARCA.indigo} />
        {[380, 420, 460].map((r) => (
          <Circle key={r} cx={560} cy={60} r={r} fill="none" stroke={MARCA.acero} strokeWidth={0.5} strokeOpacity={0.35} />
        ))}
        <Rect x={44} y={772} width={507} height={0.6} fill="#ffffff" fillOpacity={0.25} />
      </Svg>
      <View style={{ paddingHorizontal: 44, paddingTop: 40, flexGrow: 1 }}>
        {/* eslint-disable-next-line jsx-a11y/alt-text -- Image de react-pdf no admite alt */}
        <Image src={`${origen}/images/logos/horizontal-blanco.png`} style={{ width: 150, height: 84, marginLeft: -8, marginTop: -14 }} />
        <View style={{ marginTop: 250 }}>
          <Text style={{ fontSize: 9, letterSpacing: 2.6, textTransform: "uppercase", color: MARCA.acero }}>Diagnóstico de operación digital</Text>
          <Text style={{ fontSize: 44, fontWeight: 900, lineHeight: 1.05, marginTop: 12 }}>{p.nombre}</Text>
          <Text style={{ fontFamily: "Radley", fontStyle: "italic", fontSize: 19, lineHeight: 1.3, marginTop: 18, color: "#e3e9f6", maxWidth: 440 }}>
            {d.titular}
          </Text>
        </View>
        <View style={{ flexDirection: "row", marginTop: 48, borderTopWidth: 0.6, borderTopColor: "#3a4a72", paddingTop: 14 }}>
          {meta.map(([k, v]) => (
            <View key={k} style={{ flex: 1, paddingRight: 10 }}>
              <Text style={{ fontSize: 7, letterSpacing: 1.6, textTransform: "uppercase", color: MARCA.acero }}>{k}</Text>
              <Text style={{ fontSize: 11, fontWeight: 700, marginTop: 3 }}>{v}</Text>
            </View>
          ))}
        </View>
      </View>
      <View style={{ position: "absolute", top: 790, left: 44, right: 44, flexDirection: "row", justifyContent: "space-between", fontSize: 9 }}>
        <Text>
          Preparado por <Text style={{ fontWeight: 900 }}>ARS Intelligence</Text>
        </Text>
        <Text style={{ color: MARCA.acero }}>
          {fechaLarga(d.fecha)}
          {d.fuente === "demo" ? " · Ejemplo ilustrativo" : ""}
        </Text>
      </View>
    </Page>
  );
}

/* ───────────────────────── Gráficos ───────────────────────── */

function Medidor({ hoy, conArs }: { hoy: number; conArs: number }) {
  const cx = 110;
  const cy = 104;
  return (
    <View style={{ alignItems: "center" }}>
      <Svg width={220} height={112} viewBox="0 0 220 112">
        <Path d={arco(cx, cy, 92, 0, 100)} stroke="#e8edf6" strokeWidth={13} fill="none" strokeLinecap="round" />
        {conArs > 0 && <Path d={arco(cx, cy, 92, 0, conArs)} stroke={C.despues} strokeWidth={13} fill="none" strokeLinecap="round" />}
        <Path d={arco(cx, cy, 71, 0, 100)} stroke="#e8edf6" strokeWidth={13} fill="none" strokeLinecap="round" />
        {hoy > 0 && <Path d={arco(cx, cy, 71, 0, hoy)} stroke={C.antes} strokeWidth={13} fill="none" strokeLinecap="round" />}
      </Svg>
      <View style={{ flexDirection: "row", alignItems: "flex-end", marginTop: 4 }}>
        <View style={{ alignItems: "center" }}>
          <Text style={{ fontSize: 22, lineHeight: 1.15, fontWeight: 900, color: TINTA_2 }}>{hoy}</Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Punto color={C.antes} />
            <Text style={{ fontSize: 7, letterSpacing: 1.2, textTransform: "uppercase", color: TINTA_3 }}>Hoy</Text>
          </View>
        </View>
        <Text style={{ fontSize: 14, lineHeight: 1.2, color: TINTA_3, marginHorizontal: 12, marginBottom: 14 }}>→</Text>
        <View style={{ alignItems: "center" }}>
          <Text style={{ fontSize: 28, lineHeight: 1.15, fontWeight: 900 }}>{conArs}</Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Punto color={C.despues} />
            <Text style={{ fontSize: 7, letterSpacing: 1.2, textTransform: "uppercase", color: TINTA_3 }}>Con ARS</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function Leyenda() {
  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <View style={{ width: 12, height: 7, borderRadius: 1.5, backgroundColor: C.antes, marginRight: 4 }} />
      <Text style={{ fontSize: 8, color: TINTA_2, marginRight: 12 }}>Hoy</Text>
      <View style={{ width: 12, height: 7, borderRadius: 1.5, backgroundColor: C.despues, marginRight: 4 }} />
      <Text style={{ fontSize: 8, color: TINTA_2 }}>Con ARS</Text>
    </View>
  );
}

function TarjetaMetrica({ m }: { m: Diagnostico["metricas"][number] }) {
  const W = 220;
  const x0 = 46;
  const etiquetaMax = Math.max(valorConUnidad(m.antes, m.unidad).length, valorConUnidad(m.despues, m.unidad).length);
  const ancho = W - x0 - Math.max(40, etiquetaMax * 5 + 10);
  const max = Math.max(m.antes, m.despues, 1);
  const filas = [
    { etiqueta: "Hoy", valor: m.antes, color: C.antes, y: 1, fuerte: false },
    { etiqueta: "Con ARS", valor: m.despues, color: C.despues, y: 21, fuerte: true },
  ];
  return (
    <View style={[s.tarjeta, { width: "48.5%", marginBottom: 8, paddingVertical: 9 }]} wrap={false}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <View style={{ flex: 1, paddingRight: 8 }}>
          <Text style={{ fontSize: 10, fontWeight: 700, lineHeight: 1.25 }}>{m.nombre}</Text>
          <Text style={{ fontSize: 7.5, color: TINTA_3, marginTop: 2 }}>
            {nombreArea(m.areaId)} · {m.menosEsMejor ? "menos es mejor" : "más es mejor"}
          </Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={{ fontSize: 13, lineHeight: 1.2, fontWeight: 900 }}>{mejora(m)}</Text>
          <Text style={{ fontSize: 6.5, letterSpacing: 1.1, textTransform: "uppercase", color: TINTA_3 }}>{esMejora(m) ? "mejora" : "cambio"}</Text>
        </View>
      </View>
      <View style={{ marginTop: 5, position: "relative", height: 40 }}>
        <Svg width={W} height={40} viewBox={`0 0 ${W} 40`}>
          <Rect x={x0} y={0} width={0.7} height={40} fill="#b9c3d6" />
          {filas.map((f) => {
            const w = (f.valor / max) * ancho;
            return w > 0 ? (
              <Path key={f.etiqueta} d={barra(x0 + 1, f.y + 2, w, 13, 3)} fill={f.color} />
            ) : (
              <Rect key={f.etiqueta} x={x0 + 1} y={f.y + 2} width={1.5} height={13} fill={f.color} />
            );
          })}
        </Svg>
        {/* Etiquetas como texto real (mejor tipografía que Svg Text) */}
        {filas.map((f) => {
          const w = Math.max((f.valor / max) * ancho, 1.5);
          return (
            <View key={f.etiqueta} style={{ position: "absolute", top: f.y + 3, left: 0, width: W, height: 14 }}>
              <Text style={{ position: "absolute", left: 0, width: x0 - 6, textAlign: "right", fontSize: 8, color: TINTA_2 }}>{f.etiqueta}</Text>
              <Text style={{ position: "absolute", left: x0 + 1 + w + 5, fontSize: 8.5, fontWeight: f.fuerte ? 900 : 400, color: f.fuerte ? TINTA : TINTA_2 }}>
                {valorConUnidad(f.valor, m.unidad)}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function Tendencia({ item }: { item: ItemReporte }) {
  if (!item.tendencia) return null;
  const color = item.bueno === undefined ? TINTA_3 : item.bueno ? "#0f8a5f" : "#c2410c";
  const flecha = item.tendencia === "sube" ? "↑" : item.tendencia === "baja" ? "↓" : "→";
  const texto = item.tendencia === "sube" ? "Sube" : item.tendencia === "baja" ? "Baja" : "Igual";
  return (
    <Text style={{ fontSize: 7.5, fontWeight: 700, color }}>
      {flecha} {texto}
    </Text>
  );
}

/* ───────────────────────── Documento ───────────────────────── */

export function DocumentoPdf({ d, origen }: { d: Diagnostico; origen: string }) {
  const p = d.perfil;
  const recs = recomendacionesOrdenadas(d);
  const mapa = mapaAreas(d);
  const filas = cronograma(d.fases);
  const total = totalSemanas(filas);
  const r = d.reporteDiario;
  const grupos = [
    { titulo: "Lo que duele hoy", items: p.dolores },
    { titulo: "Con qué trabajan", items: p.herramientasActuales },
    { titulo: "Lo que más importa", items: p.prioridades },
  ].filter((g) => g.items.length);
  const mensaje = `Hola, soy de ${p.nombre}. Acabo de hacer el Diagnóstico ARS y quiero conversar sobre el plan.`;

  return (
    <Document
      title={`Diagnóstico ARS · ${p.nombre}`}
      author="ARS Intelligence"
      subject={d.titular}
      creator="ARS Intelligence"
      producer="ARS Intelligence"
      language="es"
    >
      <Portada d={d} origen={origen} />

      <Page size="A4" style={s.pagina}>
        <Encabezado origen={origen} empresa={p.nombre} />
        <Pie fecha={d.fecha} />

        {/* 01 · Resumen */}
        <TituloSeccion numero="01" eyebrow="Resumen ejecutivo" titulo="En una mirada" />
        <View style={{ flexDirection: "row" }}>
          <View style={{ flex: 1.35, paddingRight: 18 }}>
            <Text style={{ fontSize: 11, lineHeight: 1.55, color: TINTA }}>{d.resumen}</Text>
            {grupos.map((g) => (
              <View key={g.titulo}>
                <Text style={[s.etiqueta, { marginTop: 12 }]}>{g.titulo}</Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                  {g.items.map((it) => (
                    <View key={it} style={[s.chip, { borderRadius: 5, backgroundColor: SUAVE, borderColor: SUAVE }]}>
                      <Text style={{ fontSize: 8, color: TINTA_2 }}>{it.charAt(0).toUpperCase() + it.slice(1)}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
            {p.notas ? (
              <Text style={{ marginTop: 10, fontSize: 9, fontStyle: "italic", color: TINTA_2, borderLeftWidth: 2, borderLeftColor: MARCA.indigo, paddingLeft: 8 }}>
                «{p.notas}»
              </Text>
            ) : null}
          </View>
          <View style={[s.tarjeta, { flex: 1, backgroundColor: SUAVE, borderColor: SUAVE }]}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={s.h3}>Madurez digital</Text>
              <Text style={s.estimado}>Estimado</Text>
            </View>
            <Text style={{ fontSize: 7.5, color: TINTA_3, marginTop: 3, marginBottom: 12 }}>
              Índice de 0 a 100: registro, trazabilidad, integración y automatización.
            </Text>
            <Medidor hoy={d.madurez.hoy} conArs={d.madurez.conArs} />
            <Text style={{ fontSize: 9, textAlign: "center", marginTop: 10, color: TINTA_2 }}>
              <Text style={{ fontWeight: 900, color: TINTA }}>+{Math.max(0, d.madurez.conArs - d.madurez.hoy)} puntos</Text> al completar el plan.
            </Text>
          </View>
        </View>

        {/* 02 · Hallazgos */}
        <View style={{ marginTop: 20 }}>
          <TituloSeccion numero="02" eyebrow="Hallazgos" titulo="Lo que encontramos" />
          <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
            {d.hallazgos.map((h, i) => (
              <View key={h.titulo} style={[s.tarjeta, { width: "32.3%", marginBottom: 8, padding: 10 }]} wrap={false}>
                <View style={{ flexDirection: "row", alignItems: "baseline" }}>
                  <Text style={{ fontSize: 9, fontWeight: 900, color: MARCA.indigo, marginRight: 5 }}>{String(i + 1).padStart(2, "0")}</Text>
                  <Text style={[s.h3, { fontSize: 10.5, flex: 1 }]}>{h.titulo}</Text>
                </View>
                <Text style={s.etiqueta}>Hoy</Text>
                <Text style={[s.p, { fontSize: 8.3, lineHeight: 1.4 }]}>{h.hoy}</Text>
                <Text style={s.etiqueta}>Impacto</Text>
                <Text style={[s.p, { fontSize: 8.3, lineHeight: 1.4 }]}>{h.impacto}</Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 7 }}>
                  {h.areas.map((a) => (
                    <ChipArea key={a} id={a} />
                  ))}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* 03 · Mapa de áreas */}
        <View break>
          <TituloSeccion numero="03" eyebrow="Mapa de las 10 áreas" titulo="Dónde actuar primero" />
          <Text style={[s.p, { marginBottom: 8 }]}>
            ARS cubre diez áreas de la operación. Encendimos las {recs.length} que más impacto tienen para {p.nombre}; las demás quedan listas para
            cuando las necesite.
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
            {mapa.map(({ area, rec }) => (
              <View
                key={area.id}
                style={{
                  width: 96,
                  minHeight: 64,
                  justifyContent: "space-between",
                  borderRadius: 7,
                  padding: 7,
                  marginBottom: 6,
                  borderWidth: rec ? 1 : 0.6,
                  borderColor: rec ? area.color : LINEA,
                  backgroundColor: rec ? "#ffffff" : SUAVE,
                }}
              >
                <View>
                  <View
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: 4,
                      backgroundColor: rec ? area.color : "#d9e0ec",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ fontSize: 8, fontWeight: 900, color: rec ? MARCA.fondo : TINTA_3 }}>{area.letra}</Text>
                  </View>
                  <Text style={{ width: 82, fontSize: 7.8, fontWeight: 700, marginTop: 5, lineHeight: 1.2, color: rec ? TINTA : TINTA_3 }}>{area.nombre}</Text>
                </View>
                <Text
                  style={{
                    fontSize: 6.5,
                    fontWeight: rec ? 900 : 400,
                    color: rec ? (rec.rec.prioridad === "alta" ? MARCA.indigo : TINTA_2) : TINTA_3,
                  }}
                >
                  {rec ? PRIORIDAD_TEXTO[rec.rec.prioridad] : "Más adelante"}
                </Text>
              </View>
            ))}
          </View>

          <Text style={[s.h3, { marginTop: 6, marginBottom: 5 }]}>Recomendaciones</Text>
          {recs.map(({ area, rec, modulos }) => (
            <View key={area.id} style={[s.tarjeta, { flexDirection: "row", marginBottom: 4, paddingVertical: 5, paddingHorizontal: 9, borderLeftWidth: 3, borderLeftColor: area.color }]} wrap={false}>
              <View style={{ width: 130, paddingRight: 10 }}>
                <Text style={{ fontSize: 10, fontWeight: 900, lineHeight: 1.2 }}>{area.nombre}</Text>
                <Text style={{ fontSize: 7.5, fontWeight: 700, marginTop: 3, color: rec.prioridad === "alta" ? MARCA.indigo : TINTA_3 }}>
                  {PRIORIDAD_TEXTO[rec.prioridad]}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 8.8, color: TINTA_2 }}>
                  <Text style={{ fontWeight: 700, color: TINTA }}>Por qué: </Text>
                  {rec.porque}
                </Text>
                <Text style={{ fontSize: 8.8, color: TINTA, marginTop: 3 }}>→ {rec.cambio}</Text>
                {modulos.length > 0 && (
                  <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 4, marginBottom: -4 }}>
                    {modulos.map((m) => (
                      <View key={m.id} style={[s.chip, { backgroundColor: SUAVE, borderColor: SUAVE, borderRadius: 4, paddingVertical: 1.5 }]}>
                        <Text style={{ fontSize: 7.5, fontWeight: 700, color: TINTA }}>{m.nombre}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* 04 · Métricas */}
        <View break>
          <TituloSeccion numero="04" eyebrow="Cifras antes y después" titulo="Lo que cambia en números" />
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
            <Leyenda />
            <Text style={s.estimado}>Estimado</Text>
          </View>
          <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
            {d.metricas.map((m) => (
              <TarjetaMetrica key={m.nombre} m={m} />
            ))}
          </View>
          <Text style={{ fontSize: 7.5, color: TINTA_3, marginTop: 2 }}>
            Cada indicador usa su propia escala. Estimaciones ilustrativas a partir de la conversación; se afinan con datos reales en la primera semana.
          </Text>
        </View>

        {/* 05 · Plan por fases */}
        <View style={{ marginTop: 14 }}>
          <TituloSeccion numero="05" eyebrow="Plan por fases" titulo="Cómo llegamos, paso a paso" />
          {filas.map(({ fase, inicio, fin }, i) => {
            const color = colorArea(fase.areas[0] ?? "operacion-en-campo");
            const izq = ((inicio - 1) / total) * 100;
            const anc = Math.max(6, ((fin - inicio + 1) / total) * 100);
            return (
              <View key={fase.nombre} style={{ flexDirection: "row", marginBottom: 9 }} wrap={false}>
                <View style={{ width: 22, alignItems: "center" }}>
                  <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: MARCA.imperial, alignItems: "center", justifyContent: "center" }}>
                    <Text style={{ fontSize: 8.5, fontWeight: 900, color: "#ffffff" }}>{i + 1}</Text>
                  </View>
                  {i < filas.length - 1 && <View style={{ width: 0.8, flexGrow: 1, backgroundColor: LINEA, marginTop: 3 }} />}
                </View>
                <View style={{ flex: 1, paddingLeft: 10 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={s.h3}>{fase.nombre}</Text>
                    <Text style={{ fontSize: 8, color: TINTA_3 }}>{fase.semanas}</Text>
                  </View>
                  <View style={{ height: 9, backgroundColor: SUAVE, borderRadius: 3, marginTop: 5, position: "relative" }}>
                    <View style={{ position: "absolute", top: 0, bottom: 0, left: `${izq}%`, width: `${anc}%`, backgroundColor: color, borderRadius: 3 }} />
                  </View>
                  <Text style={{ fontSize: 7.5, color: TINTA_3, marginTop: 4, marginBottom: 2 }}>{fase.areas.map(nombreArea).join(" · ")}</Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                  {fase.entregables.map((e) => (
                    <View key={e} style={{ flexDirection: "row", marginTop: 1, width: "50%", paddingRight: 6 }}>
                      <View style={{ width: 4, height: 4, backgroundColor: color, marginTop: 4, marginRight: 6 }} />
                      <Text style={{ fontSize: 8.8, color: TINTA_2, flex: 1 }}>{e}</Text>
                    </View>
                  ))}
                  </View>
                </View>
              </View>
            );
          })}
          <View style={{ flexDirection: "row", justifyContent: "space-between", paddingLeft: 32 }}>
            <Text style={{ fontSize: 7, color: TINTA_3 }}>Semana 1</Text>
            <Text style={{ fontSize: 7, color: TINTA_3 }}>Semana {total}</Text>
          </View>
        </View>

        {/* 06 · Reporte que le llegaría */}
        <View break>
          <TituloSeccion numero="06" eyebrow="El reporte que le llegaría" titulo="Cada mañana, la operación en su teléfono" />
          <View style={{ flexDirection: "row" }}>
            <View style={{ flex: 1, paddingRight: 22 }}>
              <Text style={[s.p, { fontSize: 10.5, lineHeight: 1.55 }]}>
                Sin pedirlo y sin armar nada: a las <Text style={{ fontWeight: 900, color: TINTA }}>{r.hora}</Text> le llega un resumen con lo que pasó en la
                operación, lo que va bien y lo que necesita su atención.
              </Text>
              <Text style={[s.p, { fontSize: 10.5, lineHeight: 1.55, marginTop: 8 }]}>
                Así se vería el de {p.nombre} con el plan en marcha. Lo recibe por correo, en la aplicación o por Telegram.
              </Text>
              {["Datos que salen del trabajo real, no de planillas", "Alertas solo cuando hay algo que decidir", "El mismo informe puede ir a sus clientes"].map(
                (t) => (
                  <View key={t} style={{ flexDirection: "row", marginTop: 7 }}>
                    <Svg width={12} height={10} viewBox="0 0 12 10">
                      <Path d="M1.5 5.2 L4.5 8 L10.5 1.8" stroke={MARCA.indigo} strokeWidth={1.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                    <Text style={{ fontSize: 9, color: TINTA_2, flex: 1 }}>{t}</Text>
                  </View>
                )
              )}
            </View>
            {/* Maqueta de teléfono */}
            <View style={{ width: 210, backgroundColor: "#16244a", borderRadius: 26, padding: 7 }} wrap={false}>
              <View style={{ backgroundColor: "#f4f6fb", borderRadius: 20, overflow: "hidden" }}>
                <View style={{ backgroundColor: "#ffffff", paddingVertical: 7, paddingHorizontal: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <Text style={{ fontSize: 7, fontWeight: 700 }}>{r.hora}</Text>
                  <View style={{ width: 44, height: 9, borderRadius: 5, backgroundColor: TINTA }} />
                  <Text style={{ fontSize: 7, fontWeight: 700 }}>100 %</Text>
                </View>
                <View style={{ backgroundColor: "#ffffff", borderBottomWidth: 0.6, borderBottomColor: LINEA, paddingHorizontal: 12, paddingBottom: 6 }}>
                  <Text style={{ fontSize: 8, fontWeight: 900 }}>Bandeja de entrada</Text>
                </View>
                <View style={{ margin: 7, backgroundColor: "#ffffff", borderRadius: 10, padding: 9 }}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: MARCA.imperial, alignItems: "center", justifyContent: "center", marginRight: 6 }}>
                      {/* eslint-disable-next-line jsx-a11y/alt-text -- Image de react-pdf no admite alt */}
                      <Image src={`${origen}/images/logos/icono-blanco.png`} style={{ width: 12, height: 12 }} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 7.5, fontWeight: 900 }}>ARS Intelligence</Text>
                      <Text style={{ fontSize: 6.5, color: TINTA_3 }}>Reporte automático · {r.hora}</Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: 9, fontWeight: 900, marginTop: 7, lineHeight: 1.25 }}>{r.titulo}</Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginTop: 6 }}>
                    {r.items.map((it) => (
                      <View key={it.etiqueta} style={{ width: "48.5%", backgroundColor: SUAVE, borderRadius: 6, padding: 5, marginBottom: 4 }}>
                        <Text style={{ fontSize: 6.3, color: TINTA_3, lineHeight: 1.2 }}>{it.etiqueta}</Text>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
                          <Text style={{ fontSize: 10, fontWeight: 900 }}>{it.valor}</Text>
                          <Tendencia item={it} />
                        </View>
                      </View>
                    ))}
                  </View>
                  {r.destacados.length > 0 && (
                    <View style={{ borderTopWidth: 0.6, borderTopColor: LINEA, marginTop: 3, paddingTop: 5 }}>
                      <Text style={{ fontSize: 6, letterSpacing: 1, textTransform: "uppercase", color: TINTA_3, fontWeight: 700 }}>Destacados</Text>
                      {r.destacados.map((t) => (
                        <View key={t} style={{ flexDirection: "row", marginTop: 3 }}>
                          <Punto color={MARCA.indigo} size={3.5} />
                          <Text style={{ fontSize: 6.8, color: TINTA_2, flex: 1, lineHeight: 1.3 }}>{t}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
                <View style={{ alignSelf: "center", width: 60, height: 3, borderRadius: 2, backgroundColor: TINTA, marginBottom: 6 }} />
              </View>
            </View>
          </View>
        </View>

        {/* Cierre */}
        <View style={{ marginTop: 28, backgroundColor: MARCA.imperial, borderRadius: 12, padding: 26, color: "#ffffff" }} wrap={false}>
          <Text style={{ fontSize: 7.5, letterSpacing: 2, textTransform: "uppercase", color: MARCA.acero }}>Siguiente paso</Text>
          <Text style={{ fontSize: 20, fontWeight: 900, lineHeight: 1.15, marginTop: 6 }}>Convirtamos este diagnóstico en su primera mejora visible</Text>
          <Text style={{ fontSize: 9.5, color: "#d7def0", marginTop: 8, lineHeight: 1.5 }}>
            En una llamada de 30 minutos revisamos el plan con su equipo, ajustamos las cifras con datos reales y dejamos lista la Fase 1.
          </Text>
          <View style={{ flexDirection: "row", marginTop: 14 }}>
            <Link src={whatsappUrl(mensaje)} style={{ backgroundColor: "#ffffff", color: MARCA.imperial, borderRadius: 14, paddingVertical: 6, paddingHorizontal: 14, fontSize: 9, fontWeight: 900, textDecoration: "none", marginRight: 8 }}>
              Agendar por WhatsApp →
            </Link>
            <Link src={mailtoUrl(`Diagnóstico ARS · ${p.nombre}`)} style={{ borderWidth: 0.8, borderColor: "#8ea0c8", color: "#ffffff", borderRadius: 14, paddingVertical: 6, paddingHorizontal: 14, fontSize: 9, fontWeight: 700, textDecoration: "none" }}>
              {CONTACT_EMAIL}
            </Link>
          </View>
        </View>
        <Text style={{ fontSize: 7, color: TINTA_3, marginTop: 10 }}>
          Cifras estimadas e ilustrativas; no constituyen una oferta comercial. Diagnóstico generado el {fechaLarga(d.fecha)}.
        </Text>
      </Page>
    </Document>
  );
}

/** Genera el PDF como Blob. `origen` = window.location.origin (para fuentes e imágenes). */
export async function generarPdf(d: Diagnostico, origen: string): Promise<Blob> {
  registrarFuentes(origen);
  return pdf(<DocumentoPdf d={d} origen={origen} />).toBlob();
}
