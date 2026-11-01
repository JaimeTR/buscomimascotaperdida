import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import "./leaflet-custom.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ChatbotWidget } from "@/components/chatbot-widget";
import { ToastProvider } from "@/components/ui/toast-modern";
import { ConfirmProvider } from "@/components/ui/confirm-modern";
import { PWAInstallPrompt } from "@/components/pwa-install-prompt";
import { PWARegister } from "@/components/pwa-register";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Encuentra tu mascota perdida - Red de ayuda comunitaria",
  description: "La red comunitaria más grande y activa para encontrar a tu mejor amigo. Reporta mascotas perdidas y ayúdalas a volver a casa.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Busco Mascota",
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
  themeColor: "#3b82f6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${outfit.variable} font-sans antialiased min-h-screen flex flex-col bg-background`}
      >
        <PWARegister />
        <ToastProvider>
          <ConfirmProvider>
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
            <ChatbotWidget />
            <PWAInstallPrompt />
          </ConfirmProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
