"use client";

import { useId, useState } from "react";
import { useTextosAsistente } from "@/lib/asistente/i18n";

type Estado = "listo" | "enviando" | "ok" | "error";

/** Formulario compacto dentro del chat. Reutiliza /api/contact. */
export function FormularioContacto({ motivo }: { motivo?: string }) {
  const { t } = useTextosAsistente();
  const [estado, setEstado] = useState<Estado>("listo");
  const [error, setError] = useState<string | null>(null);
  const id = useId();

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEstado("enviando");
    setError(null);
    const datos = Object.fromEntries(new FormData(e.currentTarget).entries());
    try {
      const r = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...datos, message: `${datos.message ?? ""}\n\n— Enviado desde el asistente Ars` }),
      });
      const j = (await r.json()) as { ok: boolean; error?: string };
      if (!r.ok || !j.ok) throw new Error(j.error ?? "error");
      setEstado("ok");
    } catch (err) {
      setEstado("error");
      setError(err instanceof Error && err.message !== "error" ? err.message : t("asistente.contacto.error"));
    }
  }

  if (estado === "ok") {
    return (
      <p role="status" className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-3 text-sm text-emerald-100">
        {t("asistente.contacto.ok")}
      </p>
    );
  }

  const campo =
    "w-full rounded-lg border border-white/10 bg-[#020a18]/70 px-3 py-2 text-sm text-foreground placeholder:text-foreground/35 focus:border-[#2348d4] focus:outline-none focus:ring-2 focus:ring-[#2348d4]/40";

  return (
    <form onSubmit={enviar} className="space-y-2 rounded-xl border border-[#2348d4]/40 bg-[#142664]/30 p-3" aria-labelledby={`${id}-t`}>
      <p id={`${id}-t`} className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#9eb0c0]">
        {t("asistente.contacto.titulo")}
      </p>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <label className="sr-only" htmlFor={`${id}-n`}>{t("asistente.contacto.nombre")}</label>
      <input id={`${id}-n`} name="name" required minLength={2} placeholder={t("asistente.contacto.nombre")} autoComplete="name" className={campo} />
      <label className="sr-only" htmlFor={`${id}-e`}>{t("asistente.contacto.email")}</label>
      <input id={`${id}-e`} name="email" type="email" required placeholder={t("asistente.contacto.email")} autoComplete="email" className={campo} />
      <label className="sr-only" htmlFor={`${id}-c`}>{t("asistente.contacto.empresa")}</label>
      <input id={`${id}-c`} name="company" placeholder={t("asistente.contacto.empresa")} autoComplete="organization" className={campo} />
      <label className="sr-only" htmlFor={`${id}-m`}>{t("asistente.contacto.mensaje")}</label>
      <textarea id={`${id}-m`} name="message" required minLength={5} rows={3} defaultValue={motivo ?? ""} placeholder={t("asistente.contacto.mensaje")} className={`${campo} resize-none`} />
      {error && <p role="alert" className="text-xs text-red-300">{error}</p>}
      <button
        type="submit"
        disabled={estado === "enviando"}
        className="w-full rounded-lg bg-[#2348d4] px-3 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#2f57ee] disabled:opacity-60"
      >
        {estado === "enviando" ? t("asistente.contacto.enviando") : t("asistente.contacto.enviar")}
      </button>
    </form>
  );
}
