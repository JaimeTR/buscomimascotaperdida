import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { CalendarCheck, ChevronLeft, Flag, Heart, Lightbulb, MapPin, PartyPopper } from "lucide-react"
import type { Metadata } from "next"

import { createPublicClient } from "@/utils/supabase/public"
import { reunionDays } from "@/lib/reunion"
import { SightingsMapWrapper } from "@/components/sightings-map-wrapper"
import { SocialShare } from "@/components/social-share"
import { Button } from "@/components/ui/button"
import { SUCCESS_COLUMNS, type SuccessPet } from "../page"

export const revalidate = 300

const fmt = new Intl.DateTimeFormat("es-PE", { day: "numeric", month: "long", year: "numeric" })

async function getStory(id: string) {
    const { data } = await createPublicClient()
        .from("pets").select(`${SUCCESS_COLUMNS}, last_seen_lat, last_seen_lng, sightings(id, created_at, district, lat, lng)`)
        .eq("id", id).eq("status", "reunited").eq("reunion_public", true).eq("is_hidden", false).maybeSingle()
    return data as (SuccessPet & { last_seen_lat: number | null; last_seen_lng: number | null; sightings: { id: string; created_at: string; district: string | null; lat: number | null; lng: number | null }[] }) | null
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const pet = await getStory((await params).id)
    if (!pet) return {}
    const title = `${pet.name ?? "Una mascota"} volvió a casa`
    const description = pet.reunion_story?.slice(0, 150) || "Una historia de reencuentro en Busco mi mascota."
    const images = [pet.reunion_images?.[0] ?? pet.image_urls?.[0] ?? `/mascotas/${pet.id}/opengraph-image`]
    return { title, description, alternates: { canonical: `/casos-de-exito/${pet.id}` }, openGraph: { title, description, images }, twitter: { card: "summary_large_image", title, description, images } }
}

export default async function SuccessStoryPage({ params }: { params: Promise<{ id: string }> }) {
    const pet = await getStory((await params).id)
    if (!pet) notFound()

    const name = pet.name ?? "Esta mascota"
    const days = reunionDays(pet)
    const sightings = [...pet.sightings].sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at))
    const withCoords = sightings.filter((s) => s.lat != null && s.lng != null)
    const hasMap = pet.last_seen_lat != null && pet.last_seen_lng != null
    const gallery = pet.reunion_images?.length ? pet.reunion_images : null
    const hero = gallery?.[0] ?? pet.image_urls?.[0] ?? "/img/sin-foto.svg"

    const steps: { icon: typeof Flag; date: string; title: string; text?: string }[] = [
        { icon: Flag, date: fmt.format(new Date(pet.created_at)), title: "Se publicó el reporte", text: pet.last_seen_district ? `Visto por última vez en ${pet.last_seen_district}.` : undefined },
        ...sightings.map((s) => ({ icon: Lightbulb, date: fmt.format(new Date(s.created_at)), title: "Alguien dejó una pista", text: s.district ? `Avistamiento en ${s.district}.` : undefined })),
        ...(pet.reunited_at ? [{ icon: PartyPopper, date: fmt.format(new Date(pet.reunited_at)), title: `${name} volvió a casa`, text: days !== null ? (days === 0 ? "Apareció el mismo día." : `Tras ${days} ${days === 1 ? "día" : "días"} de búsqueda.`) : undefined }] : []),
    ]

    return (
        <article className="container mx-auto max-w-4xl px-4 py-10">
            <Link href="/casos-de-exito" className="-ml-2 mb-6 inline-flex min-h-11 items-center gap-1 rounded-lg px-2 text-sm font-medium text-muted-foreground hover:text-primary">
                <ChevronLeft className="h-4 w-4" aria-hidden /> Casos de éxito
            </Link>

            <header className="mb-8">
                <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-sm font-semibold text-primary"><Heart className="h-4 w-4" aria-hidden /> Volvió a casa</p>
                <h1 className="font-display text-4xl text-primary md:text-5xl">{name} volvió a casa</h1>
                <p className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-muted-foreground">
                    {pet.last_seen_district && <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4 text-cta" aria-hidden /> {pet.last_seen_district}</span>}
                    {days !== null && <span className="inline-flex items-center gap-1.5"><CalendarCheck className="h-4 w-4 text-primary" aria-hidden /> {days === 0 ? "Apareció el mismo día" : `${days} ${days === 1 ? "día" : "días"} de búsqueda`}</span>}
                    {sightings.length > 0 && <span className="inline-flex items-center gap-1.5"><Lightbulb className="h-4 w-4 text-primary" aria-hidden /> {sightings.length} {sightings.length === 1 ? "pista" : "pistas"} de la comunidad</span>}
                </p>
            </header>

            <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-3xl bg-muted sm:aspect-[16/10]">
                <Image src={hero} alt={`${name} de vuelta en casa`} fill priority sizes="(min-width: 896px) 896px, 100vw" className="object-cover" />
            </div>
            {gallery && gallery.length > 1 && (
                <ul className="mb-8 grid grid-cols-2 gap-4">
                    {gallery.slice(1).map((src, i) => (
                        <li key={src} className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted"><Image src={src} alt={`Foto ${i + 2} del reencuentro de ${name}`} fill sizes="(min-width: 640px) 440px, 50vw" className="object-cover" /></li>
                    ))}
                </ul>
            )}

            {pet.reunion_story && (
                <section className="mb-12" aria-labelledby="story-title">
                    <h2 id="story-title" className="mb-3 font-display text-2xl">Así fue</h2>
                    <p className="whitespace-pre-line text-lg leading-relaxed text-foreground">{pet.reunion_story}</p>
                </section>
            )}

            <section className="mb-12" aria-labelledby="path-title">
                <h2 id="path-title" className="mb-6 font-display text-2xl">El recorrido</h2>
                <ol className="relative space-y-6 border-l-2 border-primary/20 pl-8">
                    {steps.map((s, i) => (
                        <li key={i} className="relative">
                            <span className="absolute -left-[2.9rem] flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground"><s.icon className="h-4 w-4" aria-hidden /></span>
                            <p className="text-sm text-muted-foreground">{s.date}</p>
                            <p className="font-semibold">{s.title}</p>
                            {s.text && <p className="text-muted-foreground">{s.text}</p>}
                        </li>
                    ))}
                </ol>
            </section>

            {hasMap && (
                <section className="mb-12" aria-labelledby="map-title">
                    <h2 id="map-title" className="mb-4 font-display text-2xl">Dónde se le vio</h2>
                    <div className="h-72 overflow-hidden rounded-3xl border">
                        <SightingsMapWrapper
                            initialLat={pet.last_seen_lat as number}
                            initialLng={pet.last_seen_lng as number}
                            sightings={withCoords.map((s) => ({ id: s.id, lat: s.lat as number, lng: s.lng as number, description: s.district ?? "Avistamiento", createdAt: s.created_at }))}
                            className="h-full w-full"
                        />
                    </div>
                </section>
            )}

            {pet.image_urls?.[0] && gallery && (
                <section className="mb-12" aria-labelledby="before-title">
                    <h2 id="before-title" className="mb-4 font-display text-2xl">Así lo buscábamos</h2>
                    <div className="relative aspect-[4/3] max-w-sm overflow-hidden rounded-2xl bg-muted"><Image src={pet.image_urls[0]} alt={`Foto del reporte de ${name}`} fill sizes="384px" className="object-cover" /></div>
                </section>
            )}

            <aside className="flex flex-col items-start gap-4 rounded-3xl bg-accent p-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="font-display text-xl text-primary">Comparte esta historia</p>
                    <p className="text-sm text-muted-foreground">Da esperanza a quien sigue buscando.</p>
                </div>
                <SocialShare petName={name} text={`🐾 ¡${name} volvió a casa! Mira su historia:`} />
            </aside>

            <p className="mt-10 text-center text-muted-foreground">¿Perdiste una mascota? <Button asChild variant="link" className="px-1"><Link href="/reportar">Publica tu reporte</Link></Button></p>
        </article>
    )
}
