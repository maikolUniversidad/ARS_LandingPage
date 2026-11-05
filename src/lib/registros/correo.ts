/** Avisos por correo (Resend) al equipo comercial. Sin RESEND_API_KEY no hace nada. */
import { areaPorId } from "@/data/servicios";
import { CONTACT_EMAIL } from "@/lib/contact";
import type { RegistroDiagnostico } from "./tipos";

export type Correo = { asunto: string; texto: string; responderA?: string };

/** true = enviado; false = falló; null = Resend no configurado. */
export async function enviarCorreoEquipo(correo: Correo, etiqueta: string): Promise<boolean | null> {
  const clave = process.env.RESEND_API_KEY?.trim();
  if (!clave) return null;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${clave}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.RESEND_FROM?.trim() || "ARS Intelligence <onboarding@resend.dev>",
        to: process.env.CONTACT_TO?.trim() || CONTACT_EMAIL,
        ...(correo.responderA ? { reply_to: correo.responderA } : {}),
        subject: correo.asunto,
        text: correo.texto,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      console.error(`[${etiqueta}] Resend error:`, (await res.text().catch(() => "")).slice(0, 500));
      return false;
    }
    return true;
  } catch (err) {
    console.error(`[${etiqueta}] Resend exception:`, err);
    return false;
  }
}

const nombreArea = (id: string) => areaPorId(id)?.nombre ?? id;

/** Resumen del diagnóstico para el equipo (texto plano). */
export function correoDiagnostico(r: RegistroDiagnostico): Correo {
  const p = r.perfil;
  const c = r.contacto;
  const d = r.diagnostico;
  const lista = (xs: string[] | undefined) => (xs?.length ? xs.join(", ") : "—");
  const lineas = [
    `Registro: ${r.id}${r.fuente === "demo" ? "  ⚠ DEMO (simulado, sin IA)" : ""}`,
    `Fecha: ${r.creado}`,
    "",
    `Empresa: ${p.nombre || "—"}`,
    `Sector: ${p.sector || "—"} · Tamaño: ${p.tamano} · Ciudad: ${p.ciudad || "—"} · Sedes: ${p.sedes ?? "—"}`,
    `Contacto: ${c ? [c.nombre, c.cargo, c.email, c.telefono].filter(Boolean).join(" · ") : "— (no lo dejó)"}`,
    "",
    `Dolores: ${lista(p.dolores)}`,
    `Herramientas hoy: ${lista(p.herramientasActuales)}`,
    `Prioridades: ${lista(p.prioridades)}`,
    ...(p.plazo ? [`Plazo: ${p.plazo}`] : []),
    ...(p.presupuesto ? [`Presupuesto: ${p.presupuesto}`] : []),
    "",
    `Titular: ${d.titular}`,
    `Madurez digital: ${d.madurez.hoy} → ${d.madurez.conArs} con ARS (estimado)`,
    "",
    "Recomendaciones:",
    ...d.recomendaciones.map((x) => `  • [${x.prioridad}] ${nombreArea(x.areaId)} — ${x.porque}`),
    "",
    `Adjuntos: ${r.adjuntos.length ? r.adjuntos.map((a) => `${a.nombre} (${a.tipo})`).join(", ") : "ninguno"}`,
    `Turnos de conversación: ${r.conversacion.length}`,
    `Página: ${r.origen.pagina ?? "—"} · Sitio: ${r.origen.sitio ?? "—"}`,
    "",
    "El registro completo (perfil, conversación y diagnóstico) quedó en el módulo de registros de ARS.",
  ];
  return {
    asunto: `${r.fuente === "demo" ? "[DEMO] " : ""}Nuevo diagnóstico — ${p.nombre || "empresa sin nombre"} (${r.id})`,
    texto: lineas.join("\n"),
    responderA: c?.email,
  };
}
