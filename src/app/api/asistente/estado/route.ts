import { estadoServicios } from "@/lib/asistente/servidor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Qué servicios del asistente están configurados (sin exponer claves). */
export function GET() {
  return Response.json(estadoServicios(), { headers: { "Cache-Control": "no-store" } });
}
