import Link from "next/link"
import Image from "next/image"
import { CalendarCheck, MapPin, PawPrint } from "lucide-react"

import { createPublicClient } from "@/utils/supabase/public"
import { reunionDays } from "@/lib/reunion"
import { Button } from "@/components/ui/button"

export const revalidate = 300
export const metadata = {
    title: "Casos de éxito | Busco mi mascota",
    description: "Historias reales de mascotas que volvieron a casa gracias a la comunidad.",
    alternates: { canonical: "/casos-de-exito" },
}

export type SuccessPet = {
    id: string; name: string | null; type: string; last_seen_district: string | null
    image_urls: string[] | null; reunion_images: string[] | null; reunion_story: string | null
    created_at: string; reunited_at: string | null
}
export const SUCCESS_COLUMNS = "id, name, type, last_seen_district, image_urls, reunion_images, reunion_story, created_at, reunited_at"

export default async function SuccessStoriesPage() {
    const { data } = await createPublicClient()
        .from("pets").select(SUCCESS_COLUMNS)
        .eq("status", "reunited").eq("reunion_public", true).eq("is_hidden", false)
        .order("reunited_at", { ascending: false, nullsFirst: false }).limit(60)
    const pets = (data ?? []) as SuccessPet[]

    return (
        <div className="container mx-auto max-w-7xl px-4 py-12">
            <header className="mb-10 max-w-2xl">
                <h1 className="font-display text-4xl text-primary md:text-5xl">Casos de éxito</h1>
                <p className="mt-3 text-lg text-muted-foreground">Cada una de estas mascotas volvió a casa porque alguien compartió, miró y avisó. Aquí están sus historias.</p>
            </header>

            {pets.length === 0 ? (
                <div className="rounded-3xl border bg-card p-10 text-center">
                    <PawPrint className="mx-auto mb-3 h-10 w-10 text-primary" aria-hidden />
                    <p className="text-lg font-semibold">Aún no hay historias publicadas.</p>
                    <p className="mt-1 text-muted-foreground">Cuando una mascota vuelva a casa y su familia lo cuente, aparecerá aquí.</p>
                    <Button asChild variant="cta" className="mt-6 rounded-full"><Link href="/mascotas">Ver mascotas buscadas</Link></Button>
                </div>
            ) : (
                <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {pets.map((p) => {
                        const photo = p.reunion_images?.[0] ?? p.image_urls?.[0] ?? "/img/sin-foto.svg"
                        const days = reunionDays(p)
                        return (
                            <li key={p.id}>
                                <Link href={`/casos-de-exito/${p.id}`} className="group block overflow-hidden rounded-3xl border bg-card shadow-[var(--shadow-soft)] transition-shadow hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                                    <div className="relative aspect-[4/3] bg-muted">
                                        <Image src={photo} alt={`${p.name ?? "Mascota"} después de volver a casa`} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                                    </div>
                                    <div className="space-y-2 p-5">
                                        <h2 className="font-display text-2xl text-primary">{p.name ?? "Sin nombre"} volvió a casa</h2>
                                        {p.reunion_story && <p className="line-clamp-3 text-muted-foreground">{p.reunion_story}</p>}
                                        <p className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-sm text-muted-foreground">
                                            {p.last_seen_district && <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4 text-cta" aria-hidden /> {p.last_seen_district}</span>}
                                            {days !== null && <span className="inline-flex items-center gap-1"><CalendarCheck className="h-4 w-4 text-primary" aria-hidden /> {days === 0 ? "El mismo día" : `${days} ${days === 1 ? "día" : "días"} de búsqueda`}</span>}
                                        </p>
                                    </div>
                                </Link>
                            </li>
                        )
                    })}
                </ul>
            )}
        </div>
    )
}
