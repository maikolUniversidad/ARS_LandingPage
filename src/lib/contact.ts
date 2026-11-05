/**
 * Datos de contacto centralizados. Cambiá estos valores en un solo lugar y se
 * actualizan el botón de WhatsApp, el formulario y los CTAs de toda la web.
 */

// Gerencia comercial — +57 312 462 3357 (solo dígitos para wa.me).
export const WHATSAPP_NUMBER = "573124623357";

// Email donde llegan las solicitudes de demo / contacto.
export const CONTACT_EMAIL = "j.muriel@ars-group.co";

/** URL de WhatsApp con mensaje pre-cargado opcional. */
export function whatsappUrl(message?: string) {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/** mailto con asunto pre-cargado. */
export function mailtoUrl(subject = "Solicitud de demo - ARS Intelligence") {
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}`;
}
