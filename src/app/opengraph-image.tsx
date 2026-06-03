import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "ARS Intelligence — Monitoreo inteligente con IA";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Imagen OG branded generada en runtime (preview al compartir el link). */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background:
            "linear-gradient(135deg, #050914 0%, #0b1f4d 55%, #2348d4 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 22,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.75)",
          }}
        >
          <div
            style={{ width: 14, height: 14, background: "#22d3ee" }}
          />
          ARS Intelligence
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div
            style={{
              fontSize: 76,
              fontWeight: 900,
              lineHeight: 1.04,
              textTransform: "uppercase",
              letterSpacing: -1,
            }}
          >
            Seguridad integral
          </div>
          <div
            style={{
              fontSize: 76,
              fontWeight: 900,
              lineHeight: 1.04,
              textTransform: "uppercase",
              letterSpacing: -1,
              color: "rgba(255,255,255,0.82)",
            }}
          >
            conectada con IA.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 40,
            fontSize: 24,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.7)",
          }}
        >
          <span>Video analítica</span>
          <span>·</span>
          <span>Alertas en tiempo real</span>
          <span>·</span>
          <span>LATAM</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
