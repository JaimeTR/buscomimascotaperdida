"use client"

import { usePathname } from "next/navigation"

const AUTH = ["/login", "/register", "/forgot-password", "/update-password"]

// Oculta el marco del sitio (barra, pie, chat) en las pantallas de acceso, que traen su propio diseño.
export function ChromeGate({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    return AUTH.includes(pathname) ? null : <>{children}</>
}
