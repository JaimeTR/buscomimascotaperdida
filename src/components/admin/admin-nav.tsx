"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, FileText, Users, ScrollText, Megaphone, ImageIcon, Handshake } from "lucide-react"
import { cn } from "@/lib/utils"

const NAV = [
    { href: "/admin", label: "Resumen", icon: LayoutDashboard, exact: true },
    { href: "/admin/reports", label: "Reportes", icon: FileText },
    { href: "/admin/promociones", label: "Promociones", icon: Megaphone },
    { href: "/admin/anuncios", label: "Anuncios", icon: ImageIcon },
    { href: "/admin/aliados", label: "Aliados", icon: Handshake },
    { href: "/admin/users", label: "Usuarios", icon: Users },
    { href: "/admin/audit", label: "Auditoría", icon: ScrollText },
]

// side = lista vertical sobre fondo oscuro (escritorio); top = chips con desplazamiento (móvil).
export function AdminNav({ variant }: { variant: "side" | "top" }) {
    const pathname = usePathname()
    const active = (n: (typeof NAV)[number]) => (n.exact ? pathname === n.href : pathname.startsWith(n.href))

    if (variant === "side") {
        return (
            <nav aria-label="Administración" className="space-y-1">
                {NAV.map((n) => (
                    <Link
                        key={n.href}
                        href={n.href}
                        aria-current={active(n) ? "page" : undefined}
                        className={cn(
                            "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors",
                            active(n) ? "bg-white/15 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
                        )}
                    >
                        <n.icon className="h-5 w-5" aria-hidden /> {n.label}
                    </Link>
                ))}
            </nav>
        )
    }

    return (
        <nav aria-label="Administración" className="flex gap-2 overflow-x-auto px-4 py-3 lg:hidden">
            {NAV.map((n) => (
                <Link
                    key={n.href}
                    href={n.href}
                    aria-current={active(n) ? "page" : undefined}
                    className={cn(
                        "flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium",
                        active(n) ? "border-primary/40 bg-accent text-accent-foreground" : "bg-card text-muted-foreground"
                    )}
                >
                    <n.icon className="h-4 w-4" aria-hidden /> {n.label}
                </Link>
            ))}
        </nav>
    )
}
