/**
 * PDF de la Propuesta ARS (@react-pdf/renderer, carta, ~8–11 páginas).
 * Se usa en el navegador (descargar.ts, con import() dinámico) y en el servidor
 * (/api/propuesta/enviar, con renderToBuffer) — por eso fuentes e imágenes llegan
 * ya resueltas por `recursos` (ver imagenes.ts) y no por window.location.
 */
import { Circle, Defs, Document, Image, LinearGradient, Link, Page, Path, Rect, Stop, Svg, Text, View, pdf, renderToBuffer } from "@react-pdf/renderer";
import type { Propuesta, Respuestas, RespuestaSeguimiento } from "@/data/propuesta/tipos";
import { CONTACT_EMAIL, WHATSAPP_NUMBER, mailtoUrl, whatsappUrl } from "@/lib/contact";
import {
  ALTO,
  ANCHO,
  LINEA,
  MARCA,
  MARGEN,
  MODO,
  SUAVE,
  TINTA,
  TINTA_2,
  TINTA_3,
  UTIL,
  colorArea,
  colorModulo,
  fechaLarga,
  nombreArea,
  nombreModulo,
  registrarFuentes,
  s,
  type Recursos,
} from "./estilos";
import { COLOR_ARS, COLOR_HOY, CoberturaAreas, Gantt, LeyendaHoyArs, TarjetaIndicador } from "./graficos";
import { CLAVE, analiticasDe, capturasDe, type FuenteImagen } from "./imagenes";
import { SeccionErp, TITULAR_ERP } from "./erp";

type Props = {
  propuesta: Propuesta;
  recursos: Recursos;
  /** Opcionales: el servidor los tiene; la descarga desde el navegador puede no tenerlos. */
  respuestas?: Respuestas;
  seguimiento?: RespuestaSeguimiento[];
  /** Vistas 3D de la experiencia (dataURL o bytes), opcionales. */
  capturas3d?: FuenteImagen[];
};

const telefonoArs = `+${WHATSAPP_NUMBER.slice(0, 2)} ${WHATSAPP_NUMBER.slice(2, 5)} ${WHATSAPP_NUMBER.slice(5, 8)} ${WHATSAPP_NUMBER.slice(8)}`;

const CENTRAL: Record<Respuestas["central"], string> = {
  si: "Propia",
  no: "No tienen",
  "en-proyecto": "En proyecto",
  "": "—",
};

/* ───────────────────────── Piezas ───────────────────────── */

type EstiloImg = {
  width: number | string;
  height: number;
  [k: string]: number | string;
};

/** Imagen por clave del mapa ya resuelto; si no llegó, no dibuja nada. */
function Img({ recursos, clave, style }: { recursos: Recursos; clave: string; style: EstiloImg }) {
  const src = recursos.imagenes[clave];
  if (!src) return null;
  // eslint-disable-next-line jsx-a11y/alt-text -- Image de react-pdf no admite alt
  return <Image src={src} style={style} />;
}

/** Imagen de apoyo a lo ancho, con rótulo de ilustración. */
function Banner({ recursos, clave, alto = 112 }: { recursos: Recursos; clave: string; alto?: number }) {
  if (!recursos.imagenes[clave]) return null;
  return (
    <View
      style={{
        position: "relative",
        height: alto,
        marginBottom: 14,
        borderRadius: 8,
        overflow: "hidden",
      }}
      wrap={false}
    >
      <Img recursos={recursos} clave={clave} style={{ width: UTIL, height: alto, objectFit: "cover" }} />
      <Text
        style={{
          position: "absolute",
          bottom: 6,
          right: 6,
          fontSize: 6,
          letterSpacing: 1,
          textTransform: "uppercase",
          color: "#ffffff",
          backgroundColor: "#020a18",
          borderRadius: 6,
          paddingTop: 2.5,
          paddingBottom: 1.5,
          paddingHorizontal: 5,
        }}
      >
        Ilustración generada con IA
      </Text>
    </View>
  );
}

function Encabezado({ recursos, empresa }: { recursos: Recursos; empresa: string }) {
  return (
    <View style={s.encabezado} fixed>
      <Img recursos={recursos} clave={CLAVE.logoNegro} style={{ width: 62, height: 35, marginVertical: -9, marginLeft: -4 }} />
      <Text
        style={{
          fontSize: 7.5,
          color: TINTA_3,
          letterSpacing: 1.2,
          textTransform: "uppercase",
          maxWidth: 380,
          maxLines: 1,
          textOverflow: "ellipsis",
        }}
      >
        Propuesta ARS · {empresa}
      </Text>
    </View>
  );
}

function Pie({ id, fecha }: { id: string; fecha: string }) {
  return (
    <View style={s.pie} fixed>
      <Text>
        ARS Intelligence · Ref. {id} · {fechaLarga(fecha)}
      </Text>
      <Text render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
    </View>
  );
}

function TituloSeccion({ numero, eyebrow, titulo }: { numero: string; eyebrow: string; titulo: string }) {
  return (
    <View minPresenceAhead={140}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Text style={s.num}>{numero}</Text>
        <View
          style={{
            width: 16,
            height: 0.6,
            backgroundColor: LINEA,
            marginHorizontal: 6,
          }}
        />
        <Text style={s.eyebrow}>{eyebrow}</Text>
      </View>
      <Text style={s.h2}>{titulo}</Text>
    </View>
  );
}

function Punto({ color, size = 5 }: { color: string; size?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        marginRight: 4,
      }}
    />
  );
}

function Check({ color = MARCA.indigo }: { color?: string }) {
  return (
    <Svg width={12} height={10} viewBox="0 0 12 10" style={{ marginTop: 2, marginRight: 5 }}>
      <Path d="M1.5 5.2 L4.5 8 L10.5 1.8" stroke={color} strokeWidth={1.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ChipModulo({ id }: { id: string }) {
  return (
    <View style={s.chip}>
      <Punto color={colorModulo(id)} size={4.5} />
      <Text style={{ fontSize: 7.5, fontWeight: 700, color: TINTA }}>{nombreModulo(id)}</Text>
    </View>
  );
}

function Chips({ titulo, items }: { titulo: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <View style={{ marginTop: 9 }} wrap={false}>
      <Text style={s.etiqueta}>{titulo}</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {items.map((it) => (
          <View key={it} style={s.chip}>
            <Text style={{ fontSize: 8, color: TINTA_2 }}>{it.charAt(0).toUpperCase() + it.slice(1)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

/* ───────────────────────── Portada ───────────────────────── */

const FOTO_ALTO = 470;

function Portada({ p, recursos }: { p: Propuesta; recursos: Recursos }) {
  const meta = [
    ["Preparada para", p.contacto.nombre || "—"],
    ["Cargo", p.contacto.cargo || "—"],
    ["Ciudad", p.contacto.ciudad || "Colombia"],
    ["Referencia", p.id],
  ];
  const largo = p.empresa.length > 38;
  const cx = ANCHO - 40;
  const cy = 70;
  const foto = Boolean(recursos.imagenes[CLAVE.escena("portada")]);
  return (
    <Page
      size="LETTER"
      style={{
        fontFamily: "Lato",
        backgroundColor: MARCA.fondo,
        color: "#ffffff",
      }}
    >
      {foto ? (
        <>
          <Img
            recursos={recursos}
            clave={CLAVE.escena("portada")}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: ANCHO,
              height: FOTO_ALTO,
              objectFit: "cover",
            }}
          />
          <Svg style={{ position: "absolute", top: 0, left: 0 }} width={ANCHO} height={ALTO} viewBox={`0 0 ${ANCHO} ${ALTO}`}>
            <Defs>
              <LinearGradient id="velo" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={MARCA.fondo} stopOpacity={0.75} />
                <Stop offset="0.22" stopColor={MARCA.fondo} stopOpacity={0.15} />
                <Stop offset="0.55" stopColor={MARCA.fondo} stopOpacity={0.35} />
                <Stop offset="0.88" stopColor={MARCA.fondo} stopOpacity={1} />
                <Stop offset="1" stopColor={MARCA.fondo} stopOpacity={1} />
              </LinearGradient>
            </Defs>
            <Rect x={0} y={0} width={ANCHO} height={FOTO_ALTO + 2} fill="url(#velo)" />
            <Rect x={MARGEN} y={ALTO - 66} width={UTIL} height={0.6} fill="#ffffff" fillOpacity={0.25} />
          </Svg>
          <Text
            style={{
              position: "absolute",
              top: FOTO_ALTO - 150,
              right: MARGEN,
              fontSize: 6,
              letterSpacing: 1,
              textTransform: "uppercase",
              color: MARCA.acero,
            }}
          >
            Ilustración generada con IA
          </Text>
        </>
      ) : (
        <Svg style={{ position: "absolute", top: 0, left: 0 }} width={ANCHO} height={ALTO} viewBox={`0 0 ${ANCHO} ${ALTO}`}>
          <Rect x={0} y={0} width={ANCHO} height={ALTO} fill={MARCA.fondo} />
          <Circle cx={cx} cy={cy} r={330} fill={MARCA.imperial} />
          <Circle cx={cx} cy={cy} r={240} fill={MARCA.french} />
          <Circle cx={cx} cy={cy} r={150} fill={MARCA.indigo} />
          {[380, 420, 460, 500].map((r) => (
            <Circle key={r} cx={cx} cy={cy} r={r} fill="none" stroke={MARCA.acero} strokeWidth={0.5} strokeOpacity={0.3} />
          ))}
          <Rect x={MARGEN} y={ALTO - 66} width={UTIL} height={0.6} fill="#ffffff" fillOpacity={0.25} />
        </Svg>
      )}
      <View style={{ paddingHorizontal: MARGEN, paddingTop: 40, flexGrow: 1 }}>
        <Img recursos={recursos} clave={CLAVE.logoBlanco} style={{ width: 150, height: 84, marginLeft: -8, marginTop: -14 }} />
        <View style={{ marginTop: foto ? (largo ? 200 : 250) : 190 }}>
          <Text
            style={{
              fontSize: 9,
              letterSpacing: 2.6,
              textTransform: "uppercase",
              color: MARCA.acero,
            }}
          >
            Propuesta ARS · Plan de trabajo
          </Text>
          <Text
            style={{
              fontFamily: "Radley",
              fontStyle: "italic",
              fontSize: 22,
              marginTop: 14,
              color: MARCA.texto,
            }}
          >
            Propuesta para
          </Text>
          <Text
            style={{
              fontSize: largo ? 30 : 42,
              fontWeight: 900,
              lineHeight: 1.05,
              marginTop: 2,
              maxWidth: 470,
            }}
          >
            {p.empresa}
          </Text>
          <Text
            style={{
              fontFamily: "Radley",
              fontStyle: "italic",
              fontSize: 17,
              lineHeight: 1.35,
              marginTop: 18,
              color: "#e3e9f6",
              maxWidth: 440,
            }}
          >
            {p.titular}
          </Text>
        </View>
        <View
          style={{
            flexDirection: "row",
            marginTop: 44,
            borderTopWidth: 0.6,
            borderTopColor: "#3a4a72",
            paddingTop: 14,
          }}
        >
          {meta.map(([k, v]) => (
            <View key={k} style={{ flex: 1, paddingRight: 10 }}>
              <Text
                style={{
                  fontSize: 7,
                  letterSpacing: 1.6,
                  textTransform: "uppercase",
                  color: MARCA.acero,
                }}
              >
                {k}
              </Text>
              <Text
                style={{
                  fontSize: 10.5,
                  fontWeight: 700,
                  marginTop: 3,
                  lineHeight: 1.3,
                }}
              >
                {v}
              </Text>
            </View>
          ))}
        </View>
        {p.contacto.email ? (
          <Text style={{ fontSize: 8.5, color: MARCA.acero, marginTop: 10 }}>{[p.contacto.email, p.contacto.telefono].filter(Boolean).join("  ·  ")}</Text>
        ) : null}
      </View>
      <View
        style={{
          position: "absolute",
          top: ALTO - 52,
          left: MARGEN,
          right: MARGEN,
          flexDirection: "row",
          justifyContent: "space-between",
          fontSize: 9,
        }}
      >
        <Text>
          Preparado por <Text style={{ fontWeight: 900 }}>ARS Intelligence</Text> · Hecho en Colombia
        </Text>
        <Text style={{ color: MARCA.acero }}>{fechaLarga(p.fecha)}</Text>
      </View>
    </Page>
  );
}

/* ───────────────────────── 01 · Su operación ───────────────────────── */

function LoQueConto({ r, seguimiento }: { r: Respuestas; seguimiento: RespuestaSeguimiento[] }) {
  const datos = [
    ["Vigilantes", r.vigilantes || "—"],
    ["Sedes / puestos", r.sedes || "—"],
    ["Central de monitoreo", CENTRAL[r.central] ?? "—"],
    ["Plazo", r.plazo || "—"],
  ];
  const apps = r.erp && !r.aplicaciones.some((a) => a.toLowerCase().includes(r.erp.toLowerCase())) ? [...r.aplicaciones, `ERP: ${r.erp}`] : r.aplicaciones;
  const citas = [r.integraciones, r.notas].map((t) => t.trim()).filter(Boolean);
  return (
    <View style={{ marginTop: 14 }}>
      <Text style={[s.etiqueta, { marginBottom: 6 }]}>Lo que nos contó</Text>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        {datos.map(([k, v]) => (
          <View
            key={k}
            style={{
              width: "23.8%",
              backgroundColor: SUAVE,
              borderRadius: 6,
              padding: 8,
            }}
          >
            <Text
              style={{
                fontSize: 6.5,
                letterSpacing: 1.1,
                textTransform: "uppercase",
                color: TINTA_3,
              }}
            >
              {k}
            </Text>
            <Text style={{ fontSize: 12, fontWeight: 900, marginTop: 2 }}>{v}</Text>
          </View>
        ))}
      </View>
      <View style={{ flexDirection: "row" }}>
        <View style={{ flex: 1, paddingRight: 12 }}>
          <Chips titulo="Servicios que prestan" items={r.servicios} />
          <Chips titulo="Con qué trabajan hoy" items={apps} />
          <Chips titulo="Dónde viven sus datos" items={r.datos} />
        </View>
        <View style={{ flex: 1 }}>
          <Chips titulo="Lo que duele" items={r.dolores} />
          <Chips titulo="Reportes que necesitan" items={r.reportes} />
        </View>
      </View>
      {citas.map((c) => (
        <Text
          key={c}
          style={{
            marginTop: 9,
            fontSize: 9,
            fontStyle: "italic",
            color: TINTA_2,
            borderLeftWidth: 2,
            borderLeftColor: MARCA.indigo,
            paddingLeft: 8,
          }}
        >
          «{c}»
        </Text>
      ))}
      {seguimiento.length > 0 && (
        <View style={{ marginTop: 10 }}>
          <Text style={s.etiqueta}>Preguntas de seguimiento</Text>
          {seguimiento.map((q) => (
            <View key={q.id} style={{ flexDirection: "row", marginTop: 3 }} wrap={false}>
              <Text
                style={{
                  width: "48%",
                  fontSize: 8.5,
                  color: TINTA_3,
                  paddingRight: 8,
                }}
              >
                {q.pregunta}
              </Text>
              <Text
                style={{
                  flex: 1,
                  fontSize: 8.5,
                  fontWeight: 700,
                  color: TINTA,
                }}
              >
                {q.respuesta || "—"}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

/* ───────────────────────── 03 · Línea de trabajo ───────────────────────── */

function Fase({ f, i, ultima }: { f: Propuesta["lineaDeTrabajo"][number]; i: number; ultima: boolean }) {
  return (
    <View style={{ flexDirection: "row" }} wrap={false}>
      <View style={{ width: 24, alignItems: "center" }}>
        <View
          style={{
            width: 22,
            height: 22,
            borderRadius: 11,
            backgroundColor: MARCA.imperial,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 9.5, fontWeight: 900, color: "#ffffff" }}>{i + 1}</Text>
        </View>
        {!ultima && (
          <View
            style={{
              width: 0.8,
              flexGrow: 1,
              backgroundColor: "#b9c3d6",
              marginTop: 3,
              marginBottom: 3,
            }}
          />
        )}
      </View>
      <View style={[s.tarjeta, { flex: 1, marginLeft: 10, marginBottom: 12, paddingVertical: 11 }]}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <Text style={[s.h3, { flex: 1, paddingRight: 8 }]}>{f.nombre}</Text>
          <Text style={s.estimado}>{f.duracion}</Text>
        </View>
        <Text
          style={{
            fontFamily: "Radley",
            fontStyle: "italic",
            fontSize: 10.5,
            color: TINTA_2,
            marginTop: 4,
            lineHeight: 1.35,
          }}
        >
          {f.objetivo}
        </Text>
        <View style={{ flexDirection: "row", marginTop: 8 }}>
          <View style={{ flex: 1.15, paddingRight: 12 }}>
            <Text style={s.etiqueta}>Entregables</Text>
            {f.entregables.map((e) => (
              <View key={e} style={{ flexDirection: "row", marginTop: 1.5 }}>
                <Check />
                <Text style={{ fontSize: 8.8, color: TINTA_2, flex: 1 }}>{e}</Text>
              </View>
            ))}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.etiqueta}>Módulos</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {f.modulos.map((m) => (
                <ChipModulo key={m} id={m} />
              ))}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

/* ───────────────────────── 04 · Mapa de integración ───────────────────────── */

const COL = 166;
const CENTRO = 132;
const HUECO = (UTIL - COL * 2 - CENTRO) / 2;
const FILA = 46;
const CAJA = 37;

function MapaIntegracion({ p, recursos }: { p: Propuesta; recursos: Recursos }) {
  const izq = p.integraciones.slice(0, 7);
  const der = p.reportes.slice(0, 7);
  const n = Math.max(izq.length, der.length, 3);
  const H = n * FILA;
  const xC = COL + HUECO;
  const xD = xC + CENTRO + HUECO;
  const fila = (cuantos: number, i: number) => (H - cuantos * FILA) / 2 + i * FILA + (FILA - CAJA) / 2;
  const destino = (yc: number) => H / 2 + (yc - H / 2) * 0.45;
  const areas = [...new Set(p.modulos.map((m) => m.area))];

  return (
    <View style={{ marginTop: 4 }} wrap={false}>
      {/* Encabezados de columna */}
      <View style={{ flexDirection: "row", marginBottom: 4 }}>
        <View style={{ width: COL }}>
          <Text style={s.etiqueta}>Sus sistemas hoy</Text>
        </View>
        <View style={{ width: CENTRO, marginLeft: HUECO, alignItems: "center" }}>
          <Text style={s.etiqueta}>La plataforma</Text>
        </View>
        <View style={{ width: COL, marginLeft: HUECO, alignItems: "flex-end" }}>
          <Text style={s.etiqueta}>Lo que sale</Text>
        </View>
      </View>
      <View style={{ position: "relative", height: H }}>
        <Svg style={{ position: "absolute", top: 0, left: 0 }} width={UTIL} height={H} viewBox={`0 0 ${UTIL} ${H}`}>
          {izq.map((it, i) => {
            const yc = fila(izq.length, i) + CAJA / 2;
            const yt = destino(yc);
            const m = MODO[it.modo] ?? MODO.integra;
            return (
              <Path
                key={`i${i}`}
                d={`M ${COL} ${yc} C ${COL + HUECO * 0.6} ${yc}, ${xC - HUECO * 0.6} ${yt}, ${xC} ${yt}`}
                stroke={m.color}
                strokeWidth={1.4}
                fill="none"
                strokeDasharray={m.punteado ? "3 2" : undefined}
              />
            );
          })}
          {der.map((_, i) => {
            const yc = fila(der.length, i) + CAJA / 2;
            const yt = destino(yc);
            return (
              <Path
                key={`d${i}`}
                d={`M ${xC + CENTRO} ${yt} C ${xC + CENTRO + HUECO * 0.6} ${yt}, ${xD - HUECO * 0.6} ${yc}, ${xD} ${yc}`}
                stroke={MARCA.indigo}
                strokeWidth={1.4}
                fill="none"
              />
            );
          })}
          {izq.map((it, i) => (
            <Circle key={`ci${i}`} cx={COL} cy={fila(izq.length, i) + CAJA / 2} r={2.2} fill={(MODO[it.modo] ?? MODO.integra).color} />
          ))}
          {der.map((_, i) => (
            <Circle key={`cd${i}`} cx={xD} cy={fila(der.length, i) + CAJA / 2} r={2.2} fill={MARCA.indigo} />
          ))}
          <Rect x={xC} y={0} width={CENTRO} height={H} rx={10} ry={10} fill={MARCA.imperial} />
          {[0.3, 0.55, 0.8].map((k) => (
            <Circle
              key={k}
              cx={xC + CENTRO / 2}
              cy={H / 2}
              r={(CENTRO / 2) * k}
              fill="none"
              stroke={MARCA.indigoClaro}
              strokeWidth={0.5}
              strokeOpacity={0.35}
            />
          ))}
        </Svg>

        {/* Sus sistemas */}
        {izq.map((it, i) => {
          const m = MODO[it.modo] ?? MODO.integra;
          return (
            <View
              key={it.sistema}
              style={{
                position: "absolute",
                top: fila(izq.length, i),
                left: 0,
                width: COL,
                height: CAJA,
                borderWidth: 0.7,
                borderColor: LINEA,
                borderLeftWidth: 3,
                borderLeftColor: m.color,
                borderRadius: 5,
                backgroundColor: "#ffffff",
                paddingHorizontal: 8,
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 8.6,
                  fontWeight: 900,
                  lineHeight: 1.2,
                  maxLines: 1,
                  textOverflow: "ellipsis",
                }}
              >
                {it.sistema}
              </Text>
              <Text
                style={{
                  fontSize: 6.5,
                  fontWeight: 700,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  color: m.color,
                  marginTop: 2,
                }}
              >
                {m.texto}
              </Text>
            </View>
          );
        })}

        {/* ARS al centro */}
        <View
          style={{
            position: "absolute",
            top: 0,
            left: xC,
            width: CENTRO,
            height: H,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 10,
          }}
        >
          <Img recursos={recursos} clave={CLAVE.iconoBlanco} style={{ width: 30, height: 30 }} />
          <Text
            style={{
              fontSize: 13,
              fontWeight: 900,
              color: "#ffffff",
              marginTop: 6,
            }}
          >
            ARS
          </Text>
          <Text
            style={{
              fontSize: 6.5,
              letterSpacing: 1.2,
              textTransform: "uppercase",
              color: MARCA.acero,
              marginTop: 1,
            }}
          >
            Una sola operación
          </Text>
          <Text
            style={{
              fontSize: 8,
              color: MARCA.texto,
              marginTop: 8,
              textAlign: "center",
              lineHeight: 1.35,
            }}
          >
            {p.modulos.length} módulos · {areas.length} {areas.length === 1 ? "área" : "áreas"}
          </Text>
        </View>

        {/* Lo que sale */}
        {der.map((r, i) => (
          <View
            key={r.nombre}
            style={{
              position: "absolute",
              top: fila(der.length, i),
              left: xD,
              width: COL,
              height: CAJA,
              borderWidth: 0.7,
              borderColor: LINEA,
              borderRightWidth: 3,
              borderRightColor: MARCA.indigo,
              borderRadius: 5,
              backgroundColor: SUAVE,
              paddingHorizontal: 8,
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                fontSize: 8.6,
                fontWeight: 900,
                lineHeight: 1.2,
                maxLines: 1,
                textOverflow: "ellipsis",
              }}
            >
              {r.nombre}
            </Text>
            <Text
              style={{
                fontSize: 7,
                color: TINTA_3,
                marginTop: 2,
                maxLines: 1,
                textOverflow: "ellipsis",
              }}
            >
              {r.para} · {r.frecuencia}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function LeyendaModos() {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 10 }}>
      {Object.values(MODO).map((m) => (
        <View
          key={m.texto}
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginRight: 14,
          }}
        >
          <Svg width={18} height={6} viewBox="0 0 18 6" style={{ marginRight: 4 }}>
            <Path d="M1 3 L17 3" stroke={m.color} strokeWidth={1.6} strokeDasharray={m.punteado ? "3 2" : undefined} />
          </Svg>
          <Text style={{ fontSize: 7.5, color: TINTA_2 }}>{m.texto}</Text>
        </View>
      ))}
    </View>
  );
}

/* ───────────────────────── Tabla ───────────────────────── */

function Tabla({ columnas, filas }: { columnas: { titulo: string; ancho: string; fuerte?: boolean }[]; filas: string[][] }) {
  return (
    <View
      style={{
        borderRadius: 6,
        overflow: "hidden",
        borderWidth: 0.7,
        borderColor: LINEA,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          backgroundColor: MARCA.imperial,
          paddingVertical: 6,
          paddingHorizontal: 4,
        }}
        fixed
      >
        {columnas.map((c) => (
          <Text
            key={c.titulo}
            style={{
              width: c.ancho,
              paddingHorizontal: 5,
              fontSize: 6.8,
              fontWeight: 700,
              letterSpacing: 1.2,
              textTransform: "uppercase",
              color: "#ffffff",
            }}
          >
            {c.titulo}
          </Text>
        ))}
      </View>
      {filas.map((f, i) => (
        <View
          key={i}
          style={{
            flexDirection: "row",
            paddingVertical: 6,
            paddingHorizontal: 4,
            backgroundColor: i % 2 ? SUAVE : "#ffffff",
          }}
          wrap={false}
        >
          {f.map((celda, j) => (
            <Text
              key={j}
              style={{
                width: columnas[j].ancho,
                paddingHorizontal: 5,
                fontSize: columnas[j].fuerte ? 9 : 8.6,
                fontWeight: columnas[j].fuerte ? 900 : 400,
                color: columnas[j].fuerte ? TINTA : TINTA_2,
                lineHeight: 1.35,
              }}
            >
              {celda}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
}

function FilaImpacto({ it }: { it: Propuesta["impacto"][number] }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        borderTopWidth: 0.6,
        borderTopColor: LINEA,
        paddingVertical: 6,
      }}
      wrap={false}
    >
      <Text
        style={{
          width: 160,
          fontSize: 9.5,
          fontWeight: 900,
          paddingRight: 10,
          lineHeight: 1.3,
        }}
      >
        {it.indicador}
      </Text>
      <View
        style={{
          flex: 1,
          backgroundColor: "#f8efe9",
          borderRadius: 5,
          paddingVertical: 6,
          paddingHorizontal: 8,
          borderLeftWidth: 2.5,
          borderLeftColor: COLOR_HOY,
        }}
      >
        <Text
          style={{
            fontSize: 6.3,
            letterSpacing: 1.1,
            textTransform: "uppercase",
            color: COLOR_HOY,
            fontWeight: 700,
          }}
        >
          Hoy
        </Text>
        <Text style={{ fontSize: 9, color: TINTA_2 }}>{it.hoy}</Text>
      </View>
      <Text style={{ fontSize: 13, color: COLOR_ARS, marginHorizontal: 8 }}>→</Text>
      <View
        style={{
          flex: 1,
          backgroundColor: "#e8edfd",
          borderRadius: 5,
          paddingVertical: 6,
          paddingHorizontal: 8,
          borderLeftWidth: 2.5,
          borderLeftColor: MARCA.indigo,
        }}
      >
        <Text
          style={{
            fontSize: 6.3,
            letterSpacing: 1.1,
            textTransform: "uppercase",
            color: MARCA.indigo,
            fontWeight: 700,
          }}
        >
          Con ARS
        </Text>
        <Text style={{ fontSize: 9, fontWeight: 900, color: TINTA }}>{it.conArs}</Text>
      </View>
    </View>
  );
}

/* ───────────────────────── Capturas, analíticas y 3D ───────────────────────── */

const MEDIA = (UTIL - 12) / 2;

function SeccionCapturas({ p, recursos, numero }: { p: Propuesta; recursos: Recursos; numero: string }) {
  const grupos = capturasDe(p)
    .map((g) => ({
      ...g,
      capturas: g.capturas.filter((c) => recursos.imagenes[CLAVE.captura(c.src)]),
    }))
    .filter((g) => g.capturas.length);
  if (!grupos.length) return null;
  const ancho = MEDIA - 20;
  return (
    <View break>
      <TituloSeccion numero={numero} eyebrow="La plataforma" titulo="Así se ve en su operación" />
      <Text style={[s.p, { marginTop: -4, marginBottom: 10, fontSize: 9.3 }]}>
        Pantallas reales de ARS de los módulos que le proponemos. Los datos de ejemplo se reemplazan por los de sus sedes.
      </Text>
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "space-between",
        }}
      >
        {grupos.map(({ m, nombre, capturas }) => (
          <View
            key={m.modulo}
            style={[
              s.tarjeta,
              {
                width: MEDIA,
                marginBottom: 12,
                padding: 10,
                borderTopWidth: 3,
                borderTopColor: colorArea(m.area),
              },
            ]}
            wrap={false}
          >
            <Text
              style={{
                fontSize: 6.5,
                letterSpacing: 1.1,
                textTransform: "uppercase",
                color: TINTA_3,
              }}
            >
              {nombreArea(m.area)}
            </Text>
            <Text style={{ fontSize: 10.5, fontWeight: 900, marginTop: 1 }}>{nombre}</Text>
            <Text
              style={{
                fontSize: 8.3,
                color: TINTA_2,
                marginTop: 2,
                marginBottom: 6,
                lineHeight: 1.35,
              }}
            >
              {m.porQue}
            </Text>
            {capturas.map((c) => (
              <View key={c.src} style={{ marginTop: 4 }}>
                <View
                  style={{
                    backgroundColor: SUAVE,
                    borderWidth: 0.6,
                    borderColor: LINEA,
                    borderRadius: 4,
                    padding: 3,
                    alignItems: "center",
                  }}
                >
                  <Img
                    recursos={recursos}
                    clave={CLAVE.captura(c.src)}
                    style={{
                      width: ancho - 6,
                      height: Math.min(capturas.length > 1 ? 100 : 112, ((ancho - 6) * c.alto) / c.ancho),
                      objectFit: "contain",
                    }}
                  />
                </View>
                <Text
                  style={{
                    fontSize: 6.8,
                    color: TINTA_3,
                    marginTop: 2.5,
                    lineHeight: 1.3,
                    maxLines: 2,
                    textOverflow: "ellipsis",
                  }}
                >
                  {c.pie}
                </Text>
              </View>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

function Rotulo({ texto, fondo }: { texto: string; fondo: string }) {
  return (
    <Text
      style={{
        fontSize: 6,
        letterSpacing: 0.9,
        textTransform: "uppercase",
        color: "#ffffff",
        backgroundColor: fondo,
        borderRadius: 6,
        paddingTop: 2.5,
        paddingBottom: 1.5,
        paddingHorizontal: 5,
        marginRight: 4,
      }}
    >
      {texto}
    </Text>
  );
}

function SeccionAnaliticas({ p, recursos, numero }: { p: Propuesta; recursos: Recursos; numero: string }) {
  const items = analiticasDe(p).filter(({ a }) => recursos.imagenes[CLAVE.analitica(a.id)]);
  if (!items.length) return null;
  const alto = Math.round((MEDIA * 9) / 16);
  return (
    <View break>
      <TituloSeccion numero={numero} eyebrow="Visión con IA" titulo="Analíticas aplicadas a su operación" />
      <Text style={[s.p, { marginTop: -4, marginBottom: 10, fontSize: 9.3 }]}>
        Ejemplos del portafolio de analíticas de video de ARS, ubicados donde le servirían. Cada alerta llega con foto y video para que una persona la
        verifique.
      </Text>
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "space-between",
        }}
      >
        {items.map(({ a, info }) => (
          <View key={a.id} style={{ width: MEDIA, marginBottom: 14 }} wrap={false}>
            <View
              style={{
                position: "relative",
                height: alto,
                borderRadius: 6,
                overflow: "hidden",
                backgroundColor: MARCA.fondo,
              }}
            >
              <Img recursos={recursos} clave={CLAVE.analitica(a.id)} style={{ width: MEDIA, height: alto, objectFit: "cover" }} />
              <View
                style={{
                  position: "absolute",
                  top: 6,
                  left: 6,
                  flexDirection: "row",
                }}
              >
                <Rotulo texto="Ejemplo de evidencia" fondo="#020a18" />
                {info.video?.ia ? <Rotulo texto="Generado con IA" fondo="#8a4a26" /> : null}
              </View>
            </View>
            <Text style={{ fontSize: 10.5, fontWeight: 900, marginTop: 6 }}>{info.nombre}</Text>
            <Text style={{ fontSize: 8.5, color: TINTA, marginTop: 2 }}>
              <Text style={{ fontWeight: 700, color: MARCA.indigo }}>Dónde: </Text>
              {a.donde}
            </Text>
            <Text
              style={{
                fontSize: 8.5,
                color: TINTA_2,
                marginTop: 2,
                lineHeight: 1.35,
              }}
            >
              {a.porQue}
            </Text>
            {info.video?.chapa ? <Text style={{ fontSize: 6.8, color: TINTA_3, marginTop: 3 }}>Evidencia: {info.video.chapa}</Text> : null}
          </View>
        ))}
      </View>
    </View>
  );
}

function SeccionVistas3D({ vistas, numero }: { vistas: FuenteImagen[]; numero: string }) {
  if (!vistas.length) return null;
  const [primera, ...resto] = vistas.slice(0, 3);
  // 1 vista: grande. 2: apiladas y algo más bajas. 3: una grande y dos lado a lado. Siempre en una página.
  const altoGrande = resto.length === 1 ? 262 : Math.round((UTIL * 9) / 16);
  const anchoChica = resto.length > 1 ? MEDIA : UTIL;
  const altoChica = resto.length === 1 ? 262 : Math.round((anchoChica * 9) / 16);
  return (
    <View break>
      <TituloSeccion numero={numero} eyebrow="Vista 3D" titulo="Su operación en 3D" />
      <Text style={[s.p, { marginTop: -4, marginBottom: 10, fontSize: 9.3 }]}>
        Vistas de la simulación 3D de ARS armada con su propuesta: así se vería su operación con todo conectado.
      </Text>
      <View
        style={{
          height: altoGrande,
          backgroundColor: MARCA.fondo,
          borderRadius: 8,
          overflow: "hidden",
        }}
        wrap={false}
      >
        {/* eslint-disable-next-line jsx-a11y/alt-text -- Image de react-pdf no admite alt */}
        <Image src={primera} style={{ width: UTIL, height: altoGrande, objectFit: "contain" }} />
      </View>
      {resto.length > 0 && (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 12,
          }}
          wrap={false}
        >
          {resto.map((v, i) => (
            <View
              key={i}
              style={{
                width: anchoChica,
                height: altoChica,
                backgroundColor: MARCA.fondo,
                borderRadius: 8,
                overflow: "hidden",
              }}
            >
              {/* eslint-disable-next-line jsx-a11y/alt-text -- Image de react-pdf no admite alt */}
              <Image
                src={v}
                style={{
                  width: anchoChica,
                  height: altoChica,
                  objectFit: "contain",
                }}
              />
            </View>
          ))}
        </View>
      )}
      <Text style={{ fontSize: 7, color: TINTA_3, marginTop: 6 }}>Vistas ilustrativas generadas en la experiencia 3D de la propuesta.</Text>
    </View>
  );
}

/* ───────────────────────── Documento ───────────────────────── */

export function DocumentoPropuesta({ propuesta: p, recursos, respuestas, seguimiento = [], capturas3d = [] }: Props) {
  const hayCapturas = capturasDe(p).some((g) => g.capturas.some((c) => recursos.imagenes[CLAVE.captura(c.src)]));
  const hayAnaliticas = analiticasDe(p).some(({ a }) => recursos.imagenes[CLAVE.analitica(a.id)]);
  const indicadores = (p.indicadores ?? []).slice(0, 6);
  // Numeración según las secciones que de verdad aparecen.
  const orden = [
    "operacion",
    "alcance",
    "linea",
    "mapa",
    ...(p.estrategiaErp?.explicacion ? ["erp"] : []),
    "reportes",
    "impacto",
    ...(hayCapturas ? ["capturas"] : []),
    ...(hayAnaliticas ? ["analiticas"] : []),
    ...(capturas3d.length ? ["vistas3d"] : []),
    "pasos",
  ];
  const n = (clave: string) => String(orden.indexOf(clave) + 1).padStart(2, "0");
  const mensaje = `Hola, soy ${p.contacto.nombre || "parte del equipo"} de ${p.empresa}. Recibí la Propuesta ARS (${p.id}) y quiero conversar sobre ella.`;
  const porArea = new Map<string, Propuesta["modulos"]>();
  for (const m of p.modulos) porArea.set(m.area, [...(porArea.get(m.area) ?? []), m]);

  return (
    <Document
      title={`Propuesta ARS · ${p.empresa}`}
      author="ARS Intelligence"
      subject={p.titular}
      keywords={`ARS Intelligence, propuesta, ${p.id}`}
      creator="ARS Intelligence"
      producer="ARS Intelligence"
      language="es"
    >
      <Portada p={p} recursos={recursos} />

      <Page size="LETTER" style={s.pagina}>
        <Encabezado recursos={recursos} empresa={p.empresa} />
        <Pie id={p.id} fecha={p.fecha} />

        {/* 01 · Su operación hoy */}
        <TituloSeccion numero={n("operacion")} eyebrow="Su operación hoy" titulo="Lo que entendimos de su operación" />
        <Text
          style={{
            fontFamily: "Radley",
            fontStyle: "italic",
            fontSize: 13.5,
            lineHeight: 1.45,
            color: TINTA,
          }}
        >
          {p.situacion}
        </Text>
        {respuestas ? (
          <LoQueConto r={respuestas} seguimiento={seguimiento} />
        ) : (
          <View style={{ flexDirection: "row", marginTop: 12 }}>
            {[
              ["Contacto", `${p.contacto.nombre}${p.contacto.cargo ? ` · ${p.contacto.cargo}` : ""}`],
              ["Ciudad", p.contacto.ciudad || "—"],
              ["Módulos propuestos", String(p.modulos.length)],
            ].map(([k, v]) => (
              <View
                key={k}
                style={{
                  flex: 1,
                  backgroundColor: SUAVE,
                  borderRadius: 6,
                  padding: 8,
                  marginRight: 6,
                }}
              >
                <Text
                  style={{
                    fontSize: 6.5,
                    letterSpacing: 1.1,
                    textTransform: "uppercase",
                    color: TINTA_3,
                  }}
                >
                  {k}
                </Text>
                <Text style={{ fontSize: 10, fontWeight: 900, marginTop: 2 }}>{v}</Text>
              </View>
            ))}
          </View>
        )}

        {/* 02 · Lo que ARS suple / lo que se queda */}
        <View style={{ marginTop: 22 }}>
          <View wrap={false}>
            <TituloSeccion numero={n("alcance")} eyebrow="Alcance" titulo="Lo que ARS suple y lo que se queda" />
            <View style={{ flexDirection: "row" }}>
              <View
                style={[
                  s.tarjeta,
                  {
                    flex: 1.45,
                    marginRight: 10,
                    borderTopWidth: 3,
                    borderTopColor: MARCA.indigo,
                  },
                ]}
              >
                <Text style={[s.etiqueta, { color: MARCA.indigo, fontWeight: 700 }]}>ARS se encarga de</Text>
                {p.arsSuple.map((t) => (
                  <View key={t} style={{ flexDirection: "row", marginTop: 4 }}>
                    <Check />
                    <Text
                      style={{
                        fontSize: 9.3,
                        color: TINTA,
                        flex: 1,
                        lineHeight: 1.4,
                      }}
                    >
                      {t}
                    </Text>
                  </View>
                ))}
              </View>
              <View
                style={[
                  s.tarjeta,
                  {
                    flex: 1,
                    backgroundColor: SUAVE,
                    borderColor: SUAVE,
                    borderTopWidth: 3,
                    borderTopColor: "#9aa6bd",
                  },
                ]}
              >
                <Text style={[s.etiqueta, { fontWeight: 700 }]}>Convive mientras usted lo decida</Text>
                {p.seQueda.map((t) => (
                  <View key={t} style={{ flexDirection: "row", marginTop: 4 }}>
                    <View
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: 3,
                        borderWidth: 1.2,
                        borderColor: "#6b7891",
                        marginTop: 3.5,
                        marginRight: 7,
                      }}
                    />
                    <Text
                      style={{
                        fontSize: 9.3,
                        color: TINTA_2,
                        flex: 1,
                        lineHeight: 1.4,
                      }}
                    >
                      {t}
                    </Text>
                  </View>
                ))}
                <Text
                  style={{
                    fontFamily: "Radley",
                    fontStyle: "italic",
                    fontSize: 9.5,
                    color: TINTA_3,
                    marginTop: 10,
                    lineHeight: 1.35,
                  }}
                >
                  Cuando usted lo decida, ARS lo asume: también es un ERP completo.
                </Text>
              </View>
            </View>
          </View>

          <Text style={[s.h3, { marginTop: 18, marginBottom: 6 }]} minPresenceAhead={60}>
            Los módulos que proponemos
          </Text>
          {[...porArea.entries()].map(([area, mods]) => (
            <View
              key={area}
              style={{
                flexDirection: "row",
                borderTopWidth: 0.6,
                borderTopColor: LINEA,
                paddingVertical: 6,
              }}
              wrap={false}
            >
              <View style={{ width: 132, paddingRight: 10, flexDirection: "row" }}>
                <View
                  style={{
                    width: 3,
                    backgroundColor: colorArea(area),
                    borderRadius: 1.5,
                    marginRight: 7,
                  }}
                />
                <Text
                  style={{
                    fontSize: 8.5,
                    fontWeight: 900,
                    lineHeight: 1.25,
                    flex: 1,
                    color: TINTA_2,
                  }}
                >
                  {nombreArea(area)}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                {mods.map((m) => (
                  <View key={m.modulo} style={{ flexDirection: "row", marginBottom: 2 }}>
                    <Text
                      style={{
                        width: 150,
                        fontSize: 9,
                        fontWeight: 900,
                        paddingRight: 8,
                      }}
                    >
                      {nombreModulo(m.modulo)}
                    </Text>
                    <Text style={{ flex: 1, fontSize: 8.6, color: TINTA_2 }}>{m.porQue}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}

          <View style={{ marginTop: 16 }} wrap={false}>
            <Text style={[s.h3, { marginBottom: 8 }]}>Cobertura por área</Text>
            <CoberturaAreas modulos={p.modulos} />
          </View>
        </View>

        {/* 03 · Línea de trabajo */}
        {/* Título, barra y primera fase viajan juntos: la sección nunca queda huérfana al pie. */}
        <View style={{ marginTop: 26 }}>
          <View wrap={false}>
            <TituloSeccion numero={n("linea")} eyebrow="Línea de trabajo" titulo="Cómo lo ponemos en marcha, por fases" />
            <Banner recursos={recursos} clave={CLAVE.escena("campo")} />
            <Gantt fases={p.lineaDeTrabajo} />
            {p.lineaDeTrabajo.slice(0, 1).map((f) => (
              <Fase key={f.nombre} f={f} i={0} ultima={p.lineaDeTrabajo.length === 1} />
            ))}
          </View>
          {p.lineaDeTrabajo.slice(1).map((f, i) => (
            <Fase key={f.nombre} f={f} i={i + 1} ultima={i + 2 === p.lineaDeTrabajo.length} />
          ))}
        </View>

        {/* 04 · Mapa de integración */}
        <View style={{ marginTop: 22 }}>
          <View wrap={false}>
            <TituloSeccion numero={n("mapa")} eyebrow="Mapa de integración" titulo="Cómo se conecta con lo que ya tiene" />
            <Text style={[s.p, { marginBottom: 10 }]}>
              ARS queda en el centro: recibe lo que hoy vive en sus sistemas, lo ordena y entrega a cada quien su reporte.
            </Text>
            <MapaIntegracion p={p} recursos={recursos} />
            <LeyendaModos />
          </View>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "space-between",
              marginTop: 12,
            }}
          >
            {p.integraciones.map((it) => {
              const m = MODO[it.modo] ?? MODO.integra;
              return (
                <View
                  key={it.sistema}
                  style={{
                    width: "48.5%",
                    borderTopWidth: 0.6,
                    borderTopColor: LINEA,
                    paddingVertical: 6,
                  }}
                  wrap={false}
                >
                  <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "baseline" }}>
                    <Text style={{ fontSize: 9, fontWeight: 900, marginRight: 6 }}>{it.sistema}</Text>
                    <Text
                      style={{
                        fontSize: 6.5,
                        fontWeight: 700,
                        letterSpacing: 1,
                        textTransform: "uppercase",
                        color: m.color,
                      }}
                    >
                      {m.texto}
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontSize: 8.6,
                      color: TINTA_2,
                      marginTop: 2,
                      lineHeight: 1.4,
                    }}
                  >
                    {it.detalle}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Su ERP y sus sistemas */}
        {p.estrategiaErp?.explicacion ? (
          <View style={{ marginTop: 24 }} wrap={false}>
            <TituloSeccion numero={n("erp")} eyebrow="Su ERP y sus sistemas" titulo={TITULAR_ERP[p.estrategiaErp.modo] ?? TITULAR_ERP.mixto} />
            <SeccionErp e={p.estrategiaErp} integraciones={p.integraciones} />
          </View>
        ) : null}

        {/* 05 · Reportes */}
        <View style={{ marginTop: 24 }}>
          <View wrap={false}>
            <TituloSeccion numero={n("reportes")} eyebrow="Reportes" titulo="Los reportes que le entregaríamos" />
            <Banner recursos={recursos} clave={CLAVE.escena("central")} alto={104} />
            <Text style={[s.p, { marginTop: -6, marginBottom: 8, fontSize: 9 }]}>Salen solos del trabajo real de cada turno: nadie los arma a mano.</Text>
          </View>
          <Tabla
            columnas={[
              { titulo: "Reporte", ancho: "26%", fuerte: true },
              { titulo: "Para", ancho: "20%" },
              { titulo: "Frecuencia", ancho: "14%" },
              { titulo: "Qué trae", ancho: "40%" },
            ]}
            filas={p.reportes.map((r) => [r.nombre, r.para, r.frecuencia, r.contenido])}
          />
        </View>

        {/* 06 · Impacto */}
        <View style={{ marginTop: 24 }}>
          <View wrap={false}>
            <TituloSeccion numero={n("impacto")} eyebrow="Impacto estimado" titulo="Lo que cambia en el día a día" />
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <LeyendaHoyArs />
              <Text style={s.estimado}>Estimado</Text>
            </View>
            {indicadores.length > 0 ? (
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  justifyContent: "space-between",
                }}
              >
                {indicadores.slice(0, 2).map((i) => (
                  <TarjetaIndicador key={i.nombre} i={i} />
                ))}
              </View>
            ) : (
              p.impacto.slice(0, 1).map((it) => <FilaImpacto key={it.indicador} it={it} />)
            )}
          </View>
          {indicadores.length > 2 && (
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "space-between",
              }}
            >
              {indicadores.slice(2).map((i) => (
                <TarjetaIndicador key={i.nombre} i={i} />
              ))}
            </View>
          )}
          {indicadores.length > 0 && p.impacto.length > 0 && (
            <Text style={[s.h3, { fontSize: 10.5, marginTop: 8, marginBottom: 4 }]} minPresenceAhead={50}>
              En la rutina
            </Text>
          )}
          {(indicadores.length > 0 ? p.impacto : p.impacto.slice(1)).map((it) => (
            <FilaImpacto key={it.indicador} it={it} />
          ))}
          {indicadores.length > 0 && (
            <Text style={{ fontSize: 7, color: TINTA_3, marginTop: 4 }}>
              Cifras estimadas a partir de lo que nos contó; cada gráfico usa su propia escala y se afina con datos reales en las primeras semanas.
            </Text>
          )}
        </View>

        <SeccionCapturas p={p} recursos={recursos} numero={n("capturas")} />
        <SeccionAnaliticas p={p} recursos={recursos} numero={n("analiticas")} />
        <SeccionVistas3D vistas={capturas3d} numero={n("vistas3d")} />
      </Page>

      {/* Cierre: contraportada oscura con los siguientes pasos y el contacto de ARS */}
      <Page
        size="LETTER"
        style={{
          fontFamily: "Lato",
          backgroundColor: MARCA.fondo,
          color: "#ffffff",
        }}
      >
        <Svg style={{ position: "absolute", top: 0, left: 0 }} width={ANCHO} height={ALTO} viewBox={`0 0 ${ANCHO} ${ALTO}`}>
          <Rect x={0} y={0} width={ANCHO} height={ALTO} fill={MARCA.fondo} />
          <Circle cx={ANCHO - 30} cy={ALTO - 40} r={300} fill={MARCA.imperial} />
          <Circle cx={ANCHO - 30} cy={ALTO - 40} r={210} fill={MARCA.french} />
          {[340, 380, 420].map((r) => (
            <Circle key={r} cx={ANCHO - 30} cy={ALTO - 40} r={r} fill="none" stroke={MARCA.acero} strokeWidth={0.5} strokeOpacity={0.3} />
          ))}
        </Svg>
        <View style={{ paddingHorizontal: MARGEN, paddingTop: 56 }}>
          <Img recursos={recursos} clave={CLAVE.logoBlanco} style={{ width: 120, height: 67, marginLeft: -6, marginTop: -12 }} />
          <View style={{ marginTop: 70 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={[s.num, { color: MARCA.indigoClaro }]}>{n("pasos")}</Text>
              <View
                style={{
                  width: 16,
                  height: 0.6,
                  backgroundColor: "#3a4a72",
                  marginHorizontal: 6,
                }}
              />
              <Text style={[s.eyebrow, { color: MARCA.acero }]}>Siguientes pasos</Text>
            </View>
            <Text
              style={{
                fontSize: 34,
                fontWeight: 900,
                lineHeight: 1.1,
                marginTop: 8,
              }}
            >
              Qué pasa ahora
            </Text>
            <Text
              style={{
                fontFamily: "Radley",
                fontStyle: "italic",
                fontSize: 14,
                color: MARCA.texto,
                marginTop: 8,
                maxWidth: 420,
                lineHeight: 1.4,
              }}
            >
              Un asesor de ARS revisa esta propuesta con usted y la ajusta con sus datos reales.
            </Text>
          </View>
          <View style={{ flexDirection: "row", marginTop: 34 }}>
            {p.siguientesPasos.map((paso, i) => (
              <View
                key={paso}
                style={{
                  flex: 1,
                  marginRight: i < p.siguientesPasos.length - 1 ? 16 : 0,
                  borderTopWidth: 1.5,
                  borderTopColor: MARCA.indigoClaro,
                  paddingTop: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: 22,
                    fontWeight: 900,
                    color: MARCA.indigoClaro,
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </Text>
                <Text
                  style={{
                    fontSize: 10,
                    color: "#e3e9f6",
                    marginTop: 4,
                    lineHeight: 1.45,
                  }}
                >
                  {paso}
                </Text>
              </View>
            ))}
          </View>
          <View
            style={{
              marginTop: 40,
              backgroundColor: "#0b1a3f",
              borderRadius: 12,
              padding: 20,
              borderWidth: 0.6,
              borderColor: "#2a3a66",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Img recursos={recursos} clave={CLAVE.iconoBlanco} style={{ width: 34, height: 34, marginRight: 14 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: 900, lineHeight: 1.2 }}>Hablemos de su operación</Text>
                <Text style={{ fontSize: 8.5, color: "#c9d3ea", marginTop: 3 }}>Cite la referencia {p.id} para que el asesor tenga su propuesta a mano.</Text>
              </View>
            </View>
            <View style={{ flexDirection: "row", marginTop: 14 }}>
              <Link
                src={whatsappUrl(mensaje)}
                style={{
                  backgroundColor: "#ffffff",
                  color: MARCA.imperial,
                  borderRadius: 14,
                  paddingVertical: 6,
                  paddingHorizontal: 14,
                  fontSize: 9,
                  fontWeight: 900,
                  textDecoration: "none",
                  marginRight: 8,
                }}
              >
                WhatsApp {telefonoArs} →
              </Link>
              <Link
                src={mailtoUrl(`Propuesta ARS · ${p.empresa} · ${p.id}`)}
                style={{
                  borderWidth: 0.8,
                  borderColor: "#8ea0c8",
                  color: "#ffffff",
                  borderRadius: 14,
                  paddingVertical: 6,
                  paddingHorizontal: 14,
                  fontSize: 9,
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                {CONTACT_EMAIL}
              </Link>
            </View>
          </View>
          <Text
            style={{
              fontSize: 7.8,
              color: MARCA.acero,
              lineHeight: 1.5,
              marginTop: 18,
              maxWidth: 430,
            }}
          >
            {p.aviso}
          </Text>
        </View>
        <View
          style={{
            position: "absolute",
            top: ALTO - 44,
            left: MARGEN,
            right: MARGEN,
            flexDirection: "row",
            justifyContent: "space-between",
            fontSize: 7.5,
            color: MARCA.acero,
          }}
        >
          <Text>ARS Intelligence · Hecho en Colombia · Ref. {p.id}</Text>
          <Text render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}

/* ───────────────────────── Generación ───────────────────────── */

/** Navegador: genera el PDF como Blob. `recursos` apunta al propio sitio (fuentes e imágenes). */
export async function generarBlobPropuesta(props: Props): Promise<Blob> {
  registrarFuentes(props.recursos);
  return pdf(<DocumentoPropuesta {...props} />).toBlob();
}

/** Servidor (runtime nodejs): genera el PDF como Buffer para adjuntarlo al correo. */
export async function generarBufferPropuesta(props: Props): Promise<Buffer> {
  registrarFuentes(props.recursos);
  return renderToBuffer(<DocumentoPropuesta {...props} />);
}
