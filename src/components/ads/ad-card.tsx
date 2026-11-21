import Link from "next/link"
import Image from "next/image"
import { ArrowUpRight, Megaphone } from "lucide-react"
import type { Ad } from "@/lib/ads"
import { cn } from "@/lib/utils"

// Anuncio publicado. Siempre lleva la etiqueta “Anuncio” y el enlace pasa por /anuncios/ir/[id] para contar clics.
export function AdCard({ ad, variant = "card" }: { ad: Ad; variant?: "card" | "banner" | "side" }) {
    const href = `/anuncios/ir/${ad.id}`
    const external = { target: "_blank", rel: "sponsored noopener noreferrer" }

    if (variant === "banner") {
        return (
            <a href={href} {...external} className="group relative flex flex-col overflow-hidden rounded-[2rem] border bg-card shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-lift)] md:flex-row">
                {ad.image_url && (
                    <div className="relative h-48 w-full overflow-hidden md:h-auto md:w-2/5">
                        <Image src={ad.image_url} unoptimized alt="" fill sizes="(min-width: 768px) 40vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                    </div>
                )}
                <div className="flex flex-1 flex-col justify-center gap-3 p-6 md:p-10">
                    <span className="w-fit rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-muted-foreground">Anuncio · {ad.advertiser}</span>
                    <h2 className="font-display text-2xl uppercase leading-tight tracking-wide text-primary md:text-3xl">{ad.title}</h2>
                    {ad.body && <p className="max-w-xl text-muted-foreground">{ad.body}</p>}
                    <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-cta px-5 py-2.5 text-sm font-semibold text-cta-foreground transition-colors group-hover:bg-cta/90">
                        {ad.cta_label} <ArrowUpRight className="h-4 w-4" aria-hidden />
                    </span>
                </div>
            </a>
        )
    }

    return (
        <a href={href} {...external} className={cn("group flex overflow-hidden rounded-3xl border bg-card shadow-[var(--shadow-soft)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]", variant === "side" ? "flex-col" : "flex-col sm:flex-row")}>
            {ad.image_url && (
                <div className={cn("relative overflow-hidden", variant === "side" ? "h-40 w-full" : "h-44 w-full sm:h-auto sm:w-48")}>
                    <Image src={ad.image_url} unoptimized alt="" fill sizes="(min-width: 640px) 192px, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
            )}
            <div className="flex flex-1 flex-col gap-2 p-5">
                <span className="w-fit rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground">Anuncio · {ad.advertiser}</span>
                <h3 className="text-lg font-semibold leading-snug">{ad.title}</h3>
                {ad.body && <p className="line-clamp-3 text-sm text-muted-foreground">{ad.body}</p>}
                <span className="mt-auto inline-flex items-center gap-1 pt-2 text-sm font-semibold text-primary">{ad.cta_label} <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden /></span>
            </div>
        </a>
    )
}

// Cuando un espacio no tiene anuncio contratado, ofrece el espacio (no se inventa ninguna marca).
export function HouseAd({ variant = "banner" }: { variant?: "banner" | "side" }) {
    return (
        <Link
            href="/promocionar"
            className={cn("group flex items-center gap-4 rounded-3xl border border-dashed bg-card/60 p-5 transition-colors hover:bg-accent", variant === "banner" ? "md:p-8" : "flex-col text-center")}
        >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-orange-800"><Megaphone className="h-6 w-6" aria-hidden /></span>
            <span>
                <span className="block font-semibold">¿Tu negocio quiere aparecer aquí?</span>
                <span className="text-sm text-muted-foreground">Llega a quienes aman a sus mascotas. Mira los planes de promoción.</span>
            </span>
            <ArrowUpRight className={cn("h-5 w-5 shrink-0 text-primary transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5", variant === "banner" ? "ml-auto" : "")} aria-hidden />
        </Link>
    )
}
