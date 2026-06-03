import { NextResponse } from "next/server";
import { CONTACT_EMAIL } from "@/lib/contact";

export const runtime = "nodejs";

type ContactPayload = {
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
  message?: string;
  /** Honeypot anti-spam: debe venir vacío. */
  website?: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  let body: ContactPayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON inválido" }, { status: 400 });
  }

  // Honeypot: si un bot rellena este campo oculto, respondemos OK sin hacer nada.
  if (body.website) {
    return NextResponse.json({ ok: true });
  }

  const name = body.name?.trim() ?? "";
  const email = body.email?.trim() ?? "";
  const message = body.message?.trim() ?? "";

  if (name.length < 2) {
    return NextResponse.json({ ok: false, error: "Nombre requerido" }, { status: 422 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: "Email inválido" }, { status: 422 });
  }
  if (message.length < 5) {
    return NextResponse.json({ ok: false, error: "Mensaje muy corto" }, { status: 422 });
  }

  const lead = {
    name,
    email,
    company: body.company?.trim() ?? "",
    phone: body.phone?.trim() ?? "",
    message,
    receivedAt: new Date().toISOString(),
  };

  // Envío por email vía Resend si hay API key configurada; si no, se registra
  // en el log del servidor (suficiente para desarrollo / demo).
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM ?? "ARS Intelligence <onboarding@resend.dev>",
          to: process.env.CONTACT_TO ?? CONTACT_EMAIL,
          reply_to: lead.email,
          subject: `Nuevo lead — ${lead.name}${lead.company ? ` (${lead.company})` : ""}`,
          text:
            `Nombre: ${lead.name}\n` +
            `Empresa: ${lead.company || "—"}\n` +
            `Email: ${lead.email}\n` +
            `Teléfono: ${lead.phone || "—"}\n\n` +
            `Mensaje:\n${lead.message}\n\n` +
            `Recibido: ${lead.receivedAt}`,
        }),
      });
      if (!res.ok) {
        const detail = await res.text();
        console.error("[contact] Resend error:", detail);
        return NextResponse.json(
          { ok: false, error: "No se pudo enviar el mensaje" },
          { status: 502 },
        );
      }
    } catch (err) {
      console.error("[contact] Resend exception:", err);
      return NextResponse.json(
        { ok: false, error: "No se pudo enviar el mensaje" },
        { status: 502 },
      );
    }
  } else {
    // Sin servicio de email configurado: dejamos el lead en el log del servidor.
    console.info("[contact] Nuevo lead (sin RESEND_API_KEY):", lead);
  }

  return NextResponse.json({ ok: true });
}
