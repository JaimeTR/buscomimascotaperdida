import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import "./leaflet-custom.css";
import { ChromeGate } from "@/components/chrome-gate";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { MobileTabbar } from "@/components/mobile-tabbar";
import { ChatbotWidget } from "@/components/chatbot-widget";
import { ToastProvider } from "@/components/ui/toast-modern";
import { ConfirmProvider } from "@/components/ui/confirm-modern";
import { PWAInstallPrompt } from "@/components/pwa-install-prompt";
import { PWARegister } from "@/components/pwa-register";

// Poppins: interfaz y texto. Braze: tipografía de marca (solo MAYÚSCULAS, títulos cortos). Ver DESIGN.md.
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});
const braze = localFont({
  src: "../fonts/Braze.otf",
  variable: "--font-braze",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://buscomimascotaperdida.com"),
  title: "Encuentra tu mascota perdida - Red de ayuda comunitaria",
  description: "La red comunitaria más grande y activa para encontrar a tu mejor amigo. Reporta mascotas perdidas y ayúdalas a volver a casa.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Busco Mascota",
  },
  openGraph: {
    title: "Busco mi mascota",
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
  themeColor: "#0f766e",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning className={`${poppins.variable} ${braze.variable}`}>
      <body
        className={`font-sans antialiased min-h-screen flex flex-col bg-background`}
      >
        <PWARegister />
        <ToastProvider>
          <ConfirmProvider>
            <ChromeGate><Navbar /></ChromeGate>
            <main className="flex-1">
              {children}
            </main>
            <ChromeGate><Footer /></ChromeGate>
            <ChromeGate><MobileTabbar /></ChromeGate>
            <ChromeGate><ChatbotWidget /></ChromeGate>
            <ChromeGate><PWAInstallPrompt /></ChromeGate>
          </ConfirmProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
