"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
    Home, Search, Plus, Megaphone, Menu, X, FileText, Lightbulb, UserRound, LogIn, UserPlus, LogOut,
    Handshake, Newspaper, Store, Mail, ChevronRight,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createClient } from "@/utils/supabase/client"
import { cn } from "@/lib/utils"

type Me = { email: string; name: string | null; avatar: string | null }

const TABS = [
    { href: "/", label: "Inicio", icon: Home },
    { href: "/mascotas", label: "Buscar", icon: Search },
    { href: "/reportar", label: "Reportar", icon: Plus, center: true },
    { href: "/cartel", label: "Cartel", icon: Megaphone },
]

const ACCOUNT = [
    { href: "/panel/reportes", label: "Mis reportes", icon: FileText },
    { href: "/panel/mensajes", label: "Pistas recibidas", icon: Lightbulb },
    { href: "/panel/ajustes", label: "Mi perfil", icon: UserRound },
]
const GUEST = [
    { href: "/ingresar", label: "Iniciar sesión", icon: LogIn },
    { href: "/registro", label: "Crear cuenta gratis", icon: UserPlus },
]
const EXPLORE = [
    { href: "/aliados", label: "Aliados", icon: Handshake },
    { href: "/anuncios", label: "Anuncios", icon: Newspaper },
    { href: "/promocionar", label: "Promociona tu negocio", icon: Store },
    { href: "/contacto", label: "Contacto", icon: Mail },
]
const LEGAL = [
    { href: "/privacidad", label: "Privacidad" },
    { href: "/terminos", label: "Términos" },
    { href: "/cookies", label: "Cookies" },
    { href: "/libro-de-reclamaciones", label: "Reclamaciones" },
]

function Row({ href, label, icon: Icon }: { href: string; label: string; icon: typeof Home }) {
    return (
        <Link href={href} className="flex min-h-12 items-center gap-3 rounded-2xl px-3 text-[15px] font-medium active:bg-secondary">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-primary"><Icon className="h-[18px] w-[18px]" aria-hidden /></span>
            <span className="flex-1">{label}</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden />
        </Link>
    )
}

// Barra inferior solo en móvil (como en una app): cuatro accesos, "Reportar" destacado y "Menú" con todo lo demás.
export function MobileTabbar() {
    const pathname = usePathname()
    const sheet = useRef<HTMLDialogElement>(null)
    const [me, setMe] = useState<Me | null>(null)
    const router = useRouter()

    // Foto/nombre en caché (la guarda UserNav) al instante; luego se confirma la sesión.
    useEffect(() => {
        const t = setTimeout(() => { // fuera del cuerpo síncrono del efecto
            try { setMe(JSON.parse(localStorage.getItem("bmm.me") ?? "null")) } catch { /* sin storage */ }
        }, 0)
        const supabase = createClient()
        supabase.auth.getSession().then(({ data }) => {
            const u = data.session?.user
            if (!u) { setMe(null); return }
            setMe((prev) => prev ?? { email: u.email ?? "", name: u.user_metadata?.full_name ?? u.user_metadata?.name ?? null, avatar: u.user_metadata?.avatar_url ?? u.user_metadata?.picture ?? null })
        })
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => { if (event === "SIGNED_OUT") setMe(null) })
        return () => { clearTimeout(t); subscription.unsubscribe() }
    }, [pathname])

    if (pathname.startsWith("/panel") || pathname.startsWith("/admin")) return null

    const logged = !!me
    const display = me ? me.name || me.email.split("@")[0] : ""
    const open = () => sheet.current?.showModal()
    const logout = async () => {
        sheet.current?.close()
        await createClient().auth.signOut()
        try { localStorage.removeItem("bmm.me") } catch { /* sin storage */ }
        setMe(null)
        router.push("/")
        router.refresh()
    }

    const tab = "flex min-h-14 flex-col items-center justify-center gap-0.5 px-2 text-[11px] font-medium"

    return (
        <>
            <nav aria-label="Navegación móvil" className="fixed inset-x-0 bottom-0 z-40 border-t bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
                <ul className="mx-auto grid max-w-md grid-cols-5 items-end px-2">
                    {TABS.map((t) => {
                        const active = t.href === "/" ? pathname === "/" : pathname.startsWith(t.href)
                        return (
                            <li key={t.href} className="flex justify-center">
                                <Link href={t.href} aria-current={active ? "page" : undefined} className={cn(tab, active ? "text-primary" : "text-muted-foreground")}>
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
                    <li className="flex justify-center">
                        <button onClick={open} aria-haspopup="dialog" className={cn(tab, "text-muted-foreground")}>
                            {me ? (
                                <Avatar className="h-7 w-7 border border-border">
                                    {me.avatar && <AvatarImage src={me.avatar} alt="" referrerPolicy="no-referrer" />}
                                    <AvatarFallback className="bg-accent text-[11px] font-bold text-primary">{display.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                            ) : (
                                <Menu className="h-6 w-6" aria-hidden />
                            )}
                            {me ? "Perfil" : "Menú"}
                        </button>
                    </li>
                </ul>
            </nav>

            {/* Hoja inferior: <dialog> nativo = foco atrapado, Esc y fondo gratis. */}
            <dialog
                ref={sheet}
                aria-label="Menú"
                onClick={(e) => {
                    if (e.target === sheet.current || (e.target as HTMLElement).closest("a")) sheet.current?.close()
                }}
                className="fixed inset-x-0 bottom-0 top-auto m-0 max-h-[88dvh] w-full max-w-none overflow-y-auto rounded-t-3xl bg-card p-0 text-foreground backdrop:bg-black/40 md:hidden"
            >
                <div className="px-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-3">
                    <div className="mx-auto mb-2 h-1.5 w-10 rounded-full bg-border" aria-hidden />
                    <div className="mb-1 flex items-center justify-between px-1">
                        <p className="font-display text-lg">Menú</p>
                        <button onClick={() => sheet.current?.close()} aria-label="Cerrar menú" className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground active:bg-secondary">
                            <X className="h-5 w-5" aria-hidden />
                        </button>
                    </div>

                    {me && (
                        <div className="mb-1 flex items-center gap-3 rounded-2xl bg-accent/60 p-3">
                            <Avatar className="h-12 w-12 border-2 border-card">
                                {me.avatar && <AvatarImage src={me.avatar} alt="" referrerPolicy="no-referrer" />}
                                <AvatarFallback className="bg-card font-bold text-primary">{display.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                                <p className="truncate text-sm font-bold">{display}</p>
                                <p className="truncate text-xs text-muted-foreground">{me.email}</p>
                            </div>
                        </div>
                    )}
                    <p className="px-3 pb-1 pt-2 text-xs font-semibold text-muted-foreground">Mi cuenta</p>
                    {(logged ? ACCOUNT : GUEST).map((r) => <Row key={r.href} {...r} />)}

                    <p className="px-3 pb-1 pt-4 text-xs font-semibold text-muted-foreground">Explorar</p>
                    {EXPLORE.map((r) => <Row key={r.href} {...r} />)}

                    {logged && (
                        <button onClick={logout} className="mt-2 flex min-h-12 w-full items-center gap-3 rounded-2xl px-3 text-[15px] font-medium text-destructive active:bg-destructive/10">
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-destructive/10"><LogOut className="h-[18px] w-[18px]" aria-hidden /></span>
                            Cerrar sesión
                        </button>
                    )}

                    <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 border-t px-3 pt-3 text-xs text-muted-foreground">
                        {LEGAL.map((l) => <Link key={l.href} href={l.href} className="py-1.5 underline-offset-2 hover:underline">{l.label}</Link>)}
                    </div>
                </div>
            </dialog>
        </>
    )
}
