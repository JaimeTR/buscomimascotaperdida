"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ArrowRight, Star, X } from "lucide-react"
import { StatusBadge } from "@/components/status-badge"

type Featured = { id: string; name: string; type: string; status: string; district: string | null; image: string | null }

const HIDE = [/^\/$/, /^\/reportar/, /^\/panel/, /^\/admin/, /^\/mascotas\/[^/]+\/avistamiento/, /^\/cartel\/[^/]+/]
const DELAY = 18_000 // se muestra después de un rato de navegación, no apenas se entra
const KEY = "bmm.featured.dismissed"

const read = (): string[] => { try { return JSON.parse(sessionStorage.getItem(KEY) ?? "[]") } catch { return [] } }

// Aviso flotante con un caso destacado (aporte voluntario) mientras la persona visita otras páginas.
// Sale el de mayor aporte que aún no se haya cerrado en esta sesión; nunca el caso que ya se está viendo.
export function FeaturedPopup() {
    const pathname = usePathname()
    const [pet, setPet] = useState<Featured | null>(null)

    useEffect(() => {
        if (HIDE.some((r) => r.test(pathname))) return
        let alive = true
        const t = setTimeout(async () => {
            try {
                const res = await fetch("/api/featured")
                if (!res.ok) return
                const list: Featured[] = await res.json()
                const closed = read()
                const viewing = pathname.match(/^\/mascotas\/([^/]+)/)?.[1]
                const next = list.find((p) => !closed.includes(p.id) && p.id !== viewing)
                if (alive && next) setPet(next)
            } catch { /* sin conexión: simplemente no se muestra */ }
        }, DELAY)
        return () => { alive = false; clearTimeout(t); setPet(null) }
    }, [pathname])

    if (!pet) return null
    const close = () => {
        try { sessionStorage.setItem(KEY, JSON.stringify([...read(), pet.id])) } catch { /* sin storage */ }
        setPet(null)
    }

    return (
        <aside aria-label="Mascota destacada" className="fixed bottom-24 left-4 z-40 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-3xl border bg-card shadow-[var(--shadow-lift)] duration-500 animate-in fade-in slide-in-from-left-6 lg:bottom-6 lg:left-6">
            <button type="button" onClick={close} aria-label="Cerrar aviso" className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur transition-all hover:rotate-90 hover:bg-black/65 active:scale-90">
                <X className="h-4 w-4" aria-hidden />
            </button>
            <Link href={`/mascotas/${pet.id}`} onClick={close} className="group block">
                <div className="relative aspect-[16/9] overflow-hidden bg-secondary">
                    <img src={pet.image ?? "/img/sin-foto.svg"} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-cta px-2.5 py-1 text-[11px] font-bold text-cta-foreground shadow-md"><Star className="h-3 w-3 fill-current" aria-hidden /> Destacado</span>
                </div>
                <div className="space-y-1 p-4">
                    <p className="flex items-center gap-2 font-display text-lg leading-tight text-primary">{pet.status === "found" ? "¿Es tu mascota?" : "Ayúdanos a encontrar a"} <span className="truncate">{pet.name}</span> <StatusBadge status={pet.status} className="shrink-0" /></p>
                    <p className="text-sm text-muted-foreground">{pet.district ? `Zona: ${pet.district}.` : ""} Compártelo, cada difusión cuenta.</p>
                    <span className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-primary">Ver el caso <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden /></span>
                </div>
            </Link>
        </aside>
    )
}
