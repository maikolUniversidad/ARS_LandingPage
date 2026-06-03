"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n/context";
import { whatsappUrl } from "@/lib/contact";

type Status = "idle" | "sending" | "ok" | "error";

/**
 * Formulario de captación de leads. Envía a /api/contact (que reenvía por
 * email vía Resend si está configurado). Incluye honeypot anti-spam y un
 * fallback a WhatsApp.
 */
export function ContactForm() {
  const { locale } = useI18n();
  const isES = locale === "es";
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const tx = isES
    ? {
        name: "Nombre",
        company: "Empresa",
        email: "Email corporativo",
        phone: "Teléfono (opcional)",
        message: "¿Qué necesitás resolver?",
        send: "Enviar solicitud",
        sending: "Enviando…",
        ok: "¡Recibido! Te contactamos en breve.",
        err: "No se pudo enviar. Probá de nuevo o escribinos por WhatsApp.",
        whatsapp: "Escribir por WhatsApp",
      }
    : {
        name: "Name",
        company: "Company",
        email: "Work email",
        phone: "Phone (optional)",
        message: "What do you need to solve?",
        send: "Send request",
        sending: "Sending…",
        ok: "Got it! We'll be in touch shortly.",
        err: "Couldn't send. Try again or reach us on WhatsApp.",
        whatsapp: "Message on WhatsApp",
      };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setError(null);

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error || "error");
      }
      setStatus("ok");
      form.reset();
    } catch {
      setStatus("error");
      setError(tx.err);
    }
  }

  if (status === "ok") {
    return (
      <div className="border border-accent/50 bg-accent/10 px-6 py-10 text-center">
        <div className="font-heading text-2xl font-black uppercase tracking-tight text-foreground">
          ✓
        </div>
        <p className="mt-3 font-mono text-sm uppercase tracking-[0.18em] text-foreground/85">
          {tx.ok}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4 text-left">
      {/* Honeypot anti-spam (oculto a usuarios reales) */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="hidden"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={tx.name} name="name" required />
        <Field label={tx.company} name="company" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={tx.email} name="email" type="email" required />
        <Field label={tx.phone} name="phone" type="tel" />
      </div>
      <label className="grid gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-foreground/55">
          {tx.message}
        </span>
        <textarea
          name="message"
          required
          rows={4}
          className="resize-y border border-border bg-background/60 px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-accent"
        />
      </label>

      {error && (
        <p className="font-mono text-xs text-red-400" role="alert">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={status === "sending"}
          className="bevel-btn inline-flex items-center gap-3 border border-border/60 bg-foreground px-8 py-4 font-mono text-xs font-bold uppercase tracking-[0.22em] text-background transition-opacity disabled:opacity-60"
        >
          <span>▸</span>
          {status === "sending" ? tx.sending : tx.send}
        </button>
        <a
          href={whatsappUrl("Hola ARS Intelligence, quiero más información.")}
          target="_blank"
          rel="noopener noreferrer"
          className="bevel-btn inline-flex items-center gap-2 border border-border bg-background/40 px-6 py-4 font-mono text-xs font-bold uppercase tracking-[0.22em] text-foreground/85 transition-colors hover:bg-background/70"
        >
          <span className="text-accent">◇</span>
          {tx.whatsapp}
        </a>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2">
      <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-foreground/55">
        {label}
        {required && <span className="text-accent"> *</span>}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        className="border border-border bg-background/60 px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-accent"
      />
    </label>
  );
}
