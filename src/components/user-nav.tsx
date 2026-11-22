"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { User, FileText, Lightbulb, LogOut, LogIn, UserPlus } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { createClient } from "@/utils/supabase/client"

type Me = { email: string; name: string | null; avatar: string | null }

const CACHE_KEY = "bmm.me"
const readCache = (): Me | null => {
    try { return JSON.parse(localStorage.getItem(CACHE_KEY) ?? "null") } catch { return null }
}
const writeCache = (me: Me | null) => {
    try { if (me) localStorage.setItem(CACHE_KEY, JSON.stringify(me)); else localStorage.removeItem(CACHE_KEY) } catch { /* sin storage */ }
}

const MENU = [
    { label: "Mis reportes", icon: FileText, href: "/panel/reportes", description: "Gestiona tus reportes" },
    { label: "Pistas recibidas", icon: Lightbulb, href: "/panel/mensajes", description: "Avistamientos de tus casos" },
    { label: "Mi perfil", icon: User, href: "/panel/ajustes", description: "Datos de contacto y avisos" },
]

export function UserNav() {
    const router = useRouter()
    const [supabase] = useState(() => createClient())
    // undefined = aún sin saber; null = sin sesión. La foto en caché aparece al instante y luego se verifica.
    const [me, setMe] = useState<Me | null | undefined>(undefined)
    const [isOpen, setIsOpen] = useState(false)

    const load = useCallback(async () => {
        const cached = readCache()
        if (cached) setMe((prev) => prev ?? cached)
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) { setMe(null); writeCache(null); return }
        const user = session.user
        const base: Me = {
            email: user.email ?? "",
            name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
            avatar: user.user_metadata?.avatar_url ?? user.user_metadata?.picture ?? null,
        }
        setMe((prev) => prev ?? base)
        const { data } = await supabase.from("profiles").select("full_name, avatar_url").eq("id", user.id).maybeSingle()
        const next = { ...base, name: data?.full_name ?? base.name, avatar: data?.avatar_url ?? base.avatar }
        setMe(next)
        writeCache(next)
    }, [supabase])

    useEffect(() => {
        const t = setTimeout(load, 0) // fuera del cuerpo síncrono del efecto
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === "SIGNED_OUT") { setMe(null); writeCache(null) }
            else if (event === "SIGNED_IN" || event === "USER_UPDATED") load()
        })
        window.addEventListener("focus", load) // refleja cambios hechos en Mi perfil
        return () => { clearTimeout(t); subscription.unsubscribe(); window.removeEventListener("focus", load) }
    }, [supabase, load])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        setMe(null)
        writeCache(null)
        router.push("/")
        router.refresh()
    }

    if (me === undefined) return <div className="h-10 w-10 rounded-full bg-muted" aria-hidden />

    if (!me) {
        return (
            // En móvil, ingresar y crear cuenta están en el menú inferior.
            <div className="hidden items-center gap-2 lg:flex">
                <Button variant="ghost" asChild className="hidden font-semibold text-muted-foreground xl:inline-flex">
                    <Link href="/ingresar"><LogIn className="mr-2 h-4 w-4" aria-hidden /> Iniciar sesión</Link>
                </Button>
                <Button variant="ghost" size="icon" asChild className="xl:hidden">
                    <Link href="/ingresar" aria-label="Iniciar sesión"><LogIn className="h-5 w-5" aria-hidden /></Link>
                </Button>
                <Button asChild className="rounded-full bg-primary px-5 font-bold shadow-md shadow-primary/20 hover:bg-primary">
                    <Link href="/registro"><UserPlus className="mr-2 h-4 w-4" aria-hidden /> Unirme</Link>
                </Button>
            </div>
        )
    }

    const display = me.name || me.email.split("@")[0]

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <button aria-label={`Mi cuenta, ${display}`} className="group flex items-center gap-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <Avatar className="h-10 w-10 border-2 border-card shadow-sm transition-transform group-hover:scale-105">
                        {me.avatar && <AvatarImage src={me.avatar} alt="" referrerPolicy="no-referrer" />}
                        <AvatarFallback className="bg-accent font-bold text-primary">{display.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                </button>
            </PopoverTrigger>
            <PopoverContent className="mr-4 mt-2 w-64 rounded-3xl border-border p-2 shadow-2xl" align="end">
                <div className="mb-2 border-b p-3">
                    <p className="truncate text-sm font-bold text-foreground">{display}</p>
                    <p className="truncate text-xs text-muted-foreground">{me.email}</p>
                </div>

                <div className="space-y-1">
                    {MENU.map((item) => (
                        <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)} className="group/item flex items-start gap-3 rounded-2xl p-3 transition-colors hover:bg-accent">
                            <div className="rounded-xl bg-secondary p-2"><item.icon className="h-4 w-4 text-muted-foreground" aria-hidden /></div>
                            <div className="space-y-0.5">
                                <p className="text-sm font-bold text-foreground">{item.label}</p>
                                <p className="text-xs leading-none text-muted-foreground">{item.description}</p>
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="mt-2 border-t px-1 pt-2">
                    <button onClick={handleLogout} className="flex min-h-11 w-full items-center gap-3 rounded-2xl p-3 text-sm font-bold text-destructive transition-colors hover:bg-destructive/10">
                        <LogOut className="h-4 w-4" aria-hidden /> Cerrar sesión
                    </button>
                </div>
            </PopoverContent>
        </Popover>
    )
}
