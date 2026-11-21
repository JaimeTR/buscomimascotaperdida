"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, FileText, Lightbulb, Settings, Plus, LogOut, ShieldCheck, Home } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BrandMark } from "@/components/navbar"
import { createClient } from "@/utils/supabase/client"
import { cn } from "@/lib/utils"

const ITEMS = [
    { href: "/dashboard", label: "Resumen", icon: LayoutDashboard, exact: true },
    { href: "/dashboard/reports", label: "Mis reportes", icon: FileText },
    { href: "/dashboard/messages", label: "Pistas", icon: Lightbulb },
    { href: "/dashboard/settings", label: "Ajustes", icon: Settings },
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

            {/* Barra superior (móvil) */}
            <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background/90 px-4 backdrop-blur md:hidden">
                <Link href="/" aria-label="Ir al inicio"><BrandMark showName /></Link>
                <div className="flex items-center gap-1 text-muted-foreground">
                    <Link href="/" aria-label="Ir a la web" className="flex h-10 w-10 items-center justify-center rounded-full active:bg-secondary"><Home className="h-5 w-5" aria-hidden /></Link>
                    {isAdmin && <Link href="/admin" aria-label="Administración" className="flex h-10 w-10 items-center justify-center rounded-full active:bg-secondary"><ShieldCheck className="h-5 w-5" aria-hidden /></Link>}
                    <button onClick={signOut} aria-label="Cerrar sesión" className="flex h-10 w-10 items-center justify-center rounded-full active:bg-secondary hover:text-destructive"><LogOut className="h-5 w-5" aria-hidden /></button>
                    <Link href="/dashboard/settings" aria-label="Mi perfil" className="ml-1">
                        <Avatar className="h-9 w-9">
                            {avatarUrl && <AvatarImage src={avatarUrl} alt="" />}
                            <AvatarFallback className="bg-accent text-xs font-semibold text-accent-foreground">{initials}</AvatarFallback>
                        </Avatar>
                    </Link>
                </div>
            </header>

            <main className="min-h-screen pb-28 md:pb-10">{children}</main>

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
