"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, FileText, Lightbulb, Settings, Plus, LogOut, ShieldCheck, Home } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BrandMark } from "@/components/navbar"
import { createClient } from "@/utils/supabase/client"
import { cn } from "@/lib/utils"

const ITEMS = [
    { href: "/panel", label: "Resumen", icon: LayoutDashboard, exact: true },
    { href: "/panel/reportes", label: "Mis reportes", icon: FileText },
    { href: "/panel/mensajes", label: "Pistas", icon: Lightbulb },
    { href: "/panel/ajustes", label: "Ajustes", icon: Settings },
]

type Props = { name: string; avatarUrl?: string | null; isAdmin: boolean; children: React.ReactNode }

// Marco del dashboard: barra lateral en escritorio y barra de pestañas inferior en móvil.
export function DashboardShell({ name, avatarUrl, isAdmin, children }: Props) {
    const pathname = usePathname()
    const router = useRouter()
    const initials = (name || "U").trim().slice(0, 2).toUpperCase()
    const isActive = (i: (typeof ITEMS)[number]) => (i.exact ? pathname === i.href : pathname.startsWith(i.href))

    const signOut = async () => {
        await createClient().auth.signOut()
        router.push("/")
        router.refresh()
    }

    return (
        <div className="min-h-screen bg-background md:pl-72">
            {/* Barra lateral (escritorio) */}
            <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col border-r bg-card p-5 md:flex">
                <Link href="/" aria-label="Ir al inicio"><BrandMark showName /></Link>

                <Link
                    href="/reportar"
                    className="mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-cta font-semibold text-cta-foreground shadow-[var(--shadow-soft)] hover:bg-cta/90"
                >
                    <Plus className="h-5 w-5" aria-hidden /> Nuevo reporte
                </Link>

                <nav aria-label="Dashboard" className="mt-7 flex-1 space-y-1">
                    {ITEMS.map((i) => (
                        <Link
                            key={i.href}
                            href={i.href}
                            aria-current={isActive(i) ? "page" : undefined}
                            className={cn(
                                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors",
                                isActive(i) ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                            )}
                        >
                            <i.icon className="h-5 w-5" aria-hidden /> {i.label}
                        </Link>
                    ))}
                    {isAdmin && (
                        <Link href="/admin" className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground">
                            <ShieldCheck className="h-5 w-5" aria-hidden /> Administración
                        </Link>
                    )}
                    <Link href="/" className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground">
                        <Home className="h-5 w-5" aria-hidden /> Ir a la web
                    </Link>
                </nav>

                <div className="flex items-center gap-3 rounded-2xl bg-secondary p-3">
                    <Avatar className="h-10 w-10">
                        {avatarUrl && <AvatarImage src={avatarUrl} alt="" />}
                        <AvatarFallback className="bg-accent text-xs font-semibold text-accent-foreground">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{name || "Mi cuenta"}</p>
                        <p className="text-xs text-muted-foreground">Miembro</p>
                    </div>
                    <button onClick={signOut} aria-label="Cerrar sesión" className="rounded-lg p-2 text-muted-foreground hover:bg-card hover:text-destructive">
                        <LogOut className="h-4 w-4" />
                    </button>
                </div>
            </aside>

            {/* Cuenta (móvil, solo en Resumen): sin barra superior, como una app */}
            {pathname === "/panel" && (
                <div className="flex flex-col items-center gap-3 px-4 pt-[calc(1.5rem+env(safe-area-inset-top))] text-center md:hidden">
                    <Avatar className="h-16 w-16 border-2 border-card shadow-[var(--shadow-soft)]">
                        {avatarUrl && <AvatarImage src={avatarUrl} alt="" />}
                        <AvatarFallback className="bg-accent text-lg font-semibold text-accent-foreground">{initials}</AvatarFallback>
                    </Avatar>
                    <p className="max-w-full truncate text-sm font-semibold">{name || "Mi cuenta"}</p>
                    <div className="flex items-center gap-2 text-xs font-medium">
                        <Link href="/" className="inline-flex h-9 items-center gap-1.5 rounded-full border bg-card px-3.5"><Home className="h-4 w-4" aria-hidden /> Web</Link>
                        {isAdmin && <Link href="/admin" className="inline-flex h-9 items-center gap-1.5 rounded-full border bg-card px-3.5"><ShieldCheck className="h-4 w-4" aria-hidden /> Admin</Link>}
                        <button onClick={signOut} className="inline-flex h-9 items-center gap-1.5 rounded-full border bg-card px-3.5 text-destructive"><LogOut className="h-4 w-4" aria-hidden /> Salir</button>
                    </div>
                </div>
            )}

            <main className={cn("min-h-screen pb-28 md:pb-10", pathname !== "/panel" && "pt-[env(safe-area-inset-top)] md:pt-0")}>{children}</main>

            {/* Pestañas inferiores (móvil) */}
            <nav aria-label="Dashboard" className="fixed inset-x-0 bottom-0 z-40 border-t bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
                <ul className="mx-auto grid max-w-md grid-cols-5 items-end px-2">
                    {[ITEMS[0], ITEMS[1], null, ITEMS[2], ITEMS[3]].map((i, k) => (
                        <li key={i?.href ?? "nuevo"} className="flex justify-center">
                            {i ? (
                                <Link
                                    href={i.href}
                                    aria-current={isActive(i) ? "page" : undefined}
                                    className={cn("flex min-h-14 flex-col items-center justify-center gap-0.5 px-2 text-[11px] font-medium", isActive(i) ? "text-primary" : "text-muted-foreground")}
                                >
                                    <i.icon className="h-6 w-6" aria-hidden /> {i.label.replace("Mis ", "")}
                                </Link>
                            ) : (
                                <Link href="/reportar" aria-label="Nuevo reporte" className="-mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-cta text-cta-foreground shadow-[var(--shadow-lift)] ring-4 ring-background" key={k}>
                                    <Plus className="h-6 w-6" aria-hidden />
                                </Link>
                            )}
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    )
}
