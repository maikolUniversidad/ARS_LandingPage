import type { Metadata } from "next";
import { Lato, Radley, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n/context";
import { DataStoreProvider } from "@/lib/data-store";

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

const SITE_URL = "https://arsintelligence.com";
const SITE_NAME = "ARS Intelligence";
const TITLE = "ARS Intelligence — La forma simple de hacer que todo funcione";
const DESCRIPTION =
  "Plataforma de monitoreo inteligente con IA: video analítica, reconocimiento facial, LPR, detección de personas y EPP, y alertas en tiempo real.";

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
    "reconocimiento facial",
    "LPR",
    "detección de personas",
    "EPP",
    "seguridad integral",
    "CCTV",
    "alertas en tiempo real",
    "LATAM",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  alternates: { canonical: "/" },
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
  icons: { icon: "/favicon.ico" },
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
        </I18nProvider>
      </body>
    </html>
  );
}
