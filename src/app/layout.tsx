import type { Metadata } from "next";
import { Lato, Radley, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n/context";
import { DataStoreProvider } from "@/lib/data-store";
import { Asistente } from "@/components/asistente/Asistente";
import { NarracionArs } from "@/components/narracion/NarracionArs";

const lato = Lato({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["100", "300", "400", "700", "900"],
  display: "swap",
});

const radley = Radley({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const SITE_URL = "https://ars-intelligence.com";
const SITE_NAME = "ARS Intelligence";
const TITLE = "ARS Intelligence — Todas las capas de la seguridad, una sola traza";
const DESCRIPTION =
  "Laboratorio de tecnología para la seguridad privada: vigilancia física, cámaras con IA, IoT y central de operaciones sobre un ERP propio de gestión, en una sola plataforma con traza de punta a punta.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s — ARS Intelligence",
  },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "monitoreo inteligente",
    "video analítica",
    "inteligencia artificial",
    "seguridad privada",
    "empresas de seguridad",
    "rondas con QR",
    "central de operaciones",
    "IoT",
    "trazabilidad",
    "seguridad integral",
    "ERP para empresas de seguridad",
    "nómina de vigilantes",
    "CCTV",
    "alertas en tiempo real",
    "LATAM",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  // Sin canonical global: cada página declara la suya (si no, todas heredarían "/").
  openGraph: {
    type: "website",
    locale: "es_CO",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  category: "technology",
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  description: DESCRIPTION,
  logo: `${SITE_URL}/images/logos/horizontal-blanco.png`,
  areaServed: ["CO", "PE", "LATAM"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`dark ${lato.variable} ${radley.variable} ${ibmPlexMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full bg-background text-foreground overflow-x-hidden"
        suppressHydrationWarning
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <I18nProvider>
          <DataStoreProvider>{children}</DataStoreProvider>
          <Asistente />
          <NarracionArs />
        </I18nProvider>
      </body>
    </html>
  );
}
