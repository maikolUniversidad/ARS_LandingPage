import { NextResponse } from "next/server";
import { enviarCorreoEquipo } from "@/lib/registros/correo";
import { guardarRegistro, registroContacto } from "@/lib/registros";

export const runtime = "nodejs";

type ContactPayload = {
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
  message?: string;
  /** Ruta de la página desde la que se envió (opcional; si falta se usa el Referer). */
  pagina?: string;
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

  const name = body.name?.trim().slice(0, 120) ?? "";
  const email = body.email?.trim().slice(0, 200) ?? "";
  const message = body.message?.trim().slice(0, 5_000) ?? "";

  if (name.length < 2) {
    return NextResponse.json({ ok: false, error: "Nombre requerido" }, { status: 422 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: "Email inválido" }, { status: 422 });
  }
  if (message.length < 5) {
    return NextResponse.json({ ok: false, error: "Mensaje muy corto" }, { status: 422 });
  }

  const registro = registroContacto(req, {
    nombre: name,
    email,
    empresa: body.company?.trim().slice(0, 160),
    telefono: body.phone?.trim().slice(0, 40),
    mensaje: message,
    pagina: body.pagina,
  });
  const c = registro.contacto;

  // Guardado (ARS remoto + copia local) y correo en paralelo.
  const [guardado, correo] = await Promise.all([
    guardarRegistro(registro),
    enviarCorreoEquipo(
      {
        asunto: `Nuevo lead — ${c.nombre}${c.empresa ? ` (${c.empresa})` : ""}`,
        responderA: c.email,
        texto:
          `Nombre: ${c.nombre}\n` +
          `Empresa: ${c.empresa || "—"}\n` +
          `Email: ${c.email}\n` +
          `Teléfono: ${c.telefono || "—"}\n\n` +
          `Mensaje:\n${registro.mensaje}\n\n` +
          `Registro: ${registro.id}\n` +
          `Página: ${registro.origen.pagina ?? "—"}\n` +
          `Recibido: ${registro.creado}`,
      },
      "contact",
    ),
  ]);

  if (correo === null) console.info(`[contact] Nuevo lead ${registro.id} (sin RESEND_API_KEY, no se envió correo).`);

  // Solo fallamos si el lead no quedó en ningún lado: ni correo ni registro.
  if (correo === false && !guardado.guardado) {
    return NextResponse.json({ ok: false, error: "No se pudo enviar el mensaje" }, { status: 502 });
  }

  return NextResponse.json({ ok: true, registro: guardado });
}
