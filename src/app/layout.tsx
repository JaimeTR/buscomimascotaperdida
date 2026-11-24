import type { Metadata, Viewport } from "next";
import { Poppins, Outfit } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import "./leaflet-custom.css";
import { ChromeGate } from "@/components/chrome-gate";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { MobileTabbar } from "@/components/mobile-tabbar";
import { ChatbotWidget } from "@/components/chatbot-widget";
import { FeaturedPopup } from "@/components/featured-popup";
import { ToastProvider } from "@/components/ui/toast-modern";
import { ConfirmProvider } from "@/components/ui/confirm-modern";
import { PWAInstallPrompt } from "@/components/pwa-install-prompt";
import { PWARegister } from "@/components/pwa-register";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

// Poppins: interfaz y texto. Outfit: títulos (sentence case, peso 600). Ver DESIGN.md.
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});
const outfit = Outfit({ subsets: ["latin"], weight: ["500", "600"], variable: "--font-outfit", display: "swap" });

const SITE = process.env.NEXT_PUBLIC_APP_URL || "https://buscomimascotaperdida.com"

// Datos estructurados del sitio (SEO + GEO): quién es, dónde opera y cómo se busca.
const SITE_JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE}/#org`,
      name: "Busco mi mascota",
      url: SITE,
      logo: `${SITE}/icons/icon-512x512.png`,
      description: "Red comunitaria gratuita para reportar y encontrar mascotas perdidas en Perú.",
      areaServed: { "@type": "Country", name: "Perú" },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE}/#website`,
      url: SITE,
      name: "Busco mi mascota",
      inLanguage: "es-PE",
      publisher: { "@id": `${SITE}/#org` },
      potentialAction: {
        "@type": "SearchAction",
        target: `${SITE}/mascotas?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
  ],
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: "Mascotas perdidas en Perú: reporta y encuentra | Busco mi mascota",
  description: "Red comunitaria gratuita para encontrar mascotas perdidas en Lima y todo el Perú. Reporta un perro o gato perdido, busca por distrito y comparte el caso.",
  applicationName: "Busco mi mascota",
  // Verificación de Google Search Console: define NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION con el código que te da Google.
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION } : undefined,
  alternates: { canonical: "./" },
  keywords: ["mascotas perdidas", "perro perdido", "gato perdido", "mascota encontrada", "Lima", "Perú", "cartel de mascota perdida"],
  other: { "geo.region": "PE", "geo.placename": "Perú", language: "es" },
  twitter: { card: "summary_large_image", title: "Mascotas perdidas en Perú: reporta y encuentra", description: "Red comunitaria gratuita para que las mascotas perdidas vuelvan a casa.", images: ["/og.png"] },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Busco Mascota",
  },
  openGraph: {
    siteName: "Busco mi mascota",
    title: "Mascotas perdidas en Perú: reporta y encuentra",
    description: "Red comunitaria para que las mascotas perdidas vuelvan a casa.",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
    locale: "es_PE",
    type: "website",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/icon-180x180.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover", // sin esto env(safe-area-inset-*) vale 0 y la barra inferior queda bajo el notch/gestos
  themeColor: "#0f766e",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning className={`${poppins.variable} ${outfit.variable}`}>
      <body
        className={`font-sans antialiased min-h-screen flex flex-col bg-background`}
      >
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SITE_JSON_LD) }} />
        <PWARegister />
        <ToastProvider>
          <ConfirmProvider>
            <a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground">Saltar al contenido</a>
            <ChromeGate><Navbar /></ChromeGate>
            <main id="contenido" className="flex-1 pt-[env(safe-area-inset-top)] lg:pt-0">
              {children}
            </main>
            <ChromeGate><Footer /></ChromeGate>
            <ChromeGate><MobileTabbar /></ChromeGate>
            <ChromeGate><ChatbotWidget /></ChromeGate>
            <ChromeGate><FeaturedPopup /></ChromeGate>
            <ChromeGate><PWAInstallPrompt /></ChromeGate>
          </ConfirmProvider>
        </ToastProvider>
        {/* Medición sin cookies (Vercel). Se activa en el panel de Vercel; sin activarlo no hace nada. */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
