"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Search, Plus, Megaphone, UserRound } from "lucide-react"
import { cn } from "@/lib/utils"

const TABS = [
    { href: "/", label: "Inicio", icon: Home },
    { href: "/mascotas", label: "Buscar", icon: Search },
    { href: "/reportar", label: "Reportar", icon: Plus, center: true },
    { href: "/cartel", label: "Cartel", icon: Megaphone },
    { href: "/dashboard", label: "Cuenta", icon: UserRound },
]

// Barra inferior solo en móvil (como en una app): cinco accesos y el de reportar destacado en el centro.
export function MobileTabbar() {
    const pathname = usePathname()
    if (pathname.startsWith("/dashboard") || pathname.startsWith("/admin")) return null

    return (
        <nav aria-label="Navegación móvil" className="fixed inset-x-0 bottom-0 z-40 border-t bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
            <ul className="mx-auto grid max-w-md grid-cols-5 items-end px-2">
                {TABS.map((t) => {
                    const active = t.href === "/" ? pathname === "/" : pathname.startsWith(t.href)
                    return (
                        <li key={t.href} className="flex justify-center">
                            <Link
                                href={t.href}
                                aria-current={active ? "page" : undefined}
                                className={cn("flex min-h-14 flex-col items-center justify-center gap-0.5 px-2 text-[11px] font-medium", active ? "text-primary" : "text-muted-foreground")}
                            >
                                {t.center ? (
                                    <span className="-mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-cta text-cta-foreground shadow-[var(--shadow-lift)] ring-4 ring-background">
                                        <t.icon className="h-6 w-6" aria-hidden />
                                    </span>
                                ) : (
                                    <t.icon className="h-6 w-6" aria-hidden />
                                )}
                                {t.label}
                            </Link>
                        </li>
                    )
                })}
            </ul>
        </nav>
    )
}
