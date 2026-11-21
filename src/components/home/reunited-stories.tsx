import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"

import { createPublicClient } from "@/utils/supabase/public"
import { reunionDays } from "@/lib/reunion"

// Casos de éxito publicados por sus dueños: prueba social para quien está buscando. No se muestra si aún no hay ninguno.
export async function ReunitedStories() {
    const { data: pets } = await createPublicClient()
        .from("pets")
        .select("id, name, image_urls, reunion_images, reunion_story, created_at, reunited_at, last_seen_district")
        .eq("status", "reunited").eq("reunion_public", true).eq("is_hidden", false)
        .order("reunited_at", { ascending: false, nullsFirst: false })
        .limit(3)
    if (!pets?.length) return null

    return (
        <section className="container mx-auto max-w-7xl px-4 pb-16" aria-labelledby="reunited-title">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h2 id="reunited-title" className="mb-2 font-display text-3xl text-primary">Volvieron a casa</h2>
                    <p className="text-muted-foreground">Cada reencuentro empezó con alguien que compartió un reporte.</p>
                </div>
                <Link href="/casos-de-exito" className="inline-flex min-h-11 items-center gap-1 font-semibold text-primary underline-offset-4 hover:underline">Ver todos los casos <ArrowRight className="h-4 w-4" aria-hidden /></Link>
            </div>
            <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {pets.map((p) => {
                    const days = reunionDays(p)
                    return (
                        <li key={p.id}>
                            <Link href={`/casos-de-exito/${p.id}`} className="group block overflow-hidden rounded-3xl border bg-card shadow-[var(--shadow-soft)] transition-shadow hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                                <div className="relative aspect-[4/3] bg-muted">
                                    <Image src={p.reunion_images?.[0] ?? p.image_urls?.[0] ?? "/img/sin-foto.svg"} alt={`${p.name ?? "Mascota"} de vuelta en casa`} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                                </div>
                                <div className="space-y-1 p-5">
                                    <h3 className="font-display text-xl text-primary">{p.name ?? "Sin nombre"} volvió a casa</h3>
                                    <p className="text-sm text-muted-foreground">{[p.last_seen_district, days === null ? null : days === 0 ? "el mismo día" : `${days} ${days === 1 ? "día" : "días"} de búsqueda`].filter(Boolean).join(" · ")}</p>
                                </div>
                            </Link>
                        </li>
                    )
                })}
            </ul>
        </section>
    )
}
