"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Search, List, Map as MapIcon, Loader2, MapPinned, PawPrint, Megaphone } from "lucide-react"

import { Button } from "@/components/ui/button"
import { PetFilters, EMPTY_FILTERS, type Filters } from "@/components/pet-filters"
import { PetCard } from "@/components/pet-card"
import { PetsMapWrapper } from "@/components/pets-map-wrapper"
import { useInfinitePets } from "@/hooks/use-pets"
import { ReportCta, ReportPopup, type ReportCtaVariant } from "@/components/pets/report-ctas"
import Image from "next/image"
import { Reveal } from "@/components/ui/reveal"
import { STOCK } from "@/lib/stock-images"

const PAGE = 12 // se muestran de 12 en 12; tras cada bloque va un llamado a la acción
// Orden de los bloques entre listas: aviso, pasos, anuncio/negocio, sección; luego se repite.
const BLOCKS: (ReportCtaVariant | "ad")[] = ["aviso", "pasos", "ad", "seccion"]

function SearchContent({ ad, initialQuery }: { ad?: React.ReactNode; initialQuery: string }) {

    const [filters, setFilters] = useState<Filters>({ ...EMPTY_FILTERS, q: initialQuery })
    const [view, setView] = useState<"list" | "map">("list")
    const sentinel = useRef<HTMLDivElement>(null)
    const applyFilters = (f: Filters) => setFilters(f)

    // La base entrega 12 por vez (paginación real); al acercarse al final se pide el siguiente bloque.
    const { pets, total, isLoading, isLoadingMore, hasMore, loadMore } = useInfinitePets({
        searchQuery: filters.q,
        type: filters.petType,
        status: filters.status,
        department: filters.location.department,
        province: filters.location.province,
        district: filters.location.district,
        breed: filters.breed,
        color: filters.color,
        dateFrom: filters.dateFrom,
        size: filters.size,
    }, PAGE)

    // Precarga: el siguiente bloque se pide cuando falta ~1 pantalla para llegar al final.
    useEffect(() => {
        const el = sentinel.current
        if (!el || !hasMore || view !== "list") return
        const io = new IntersectionObserver((e) => { if (e[0].isIntersecting) void loadMore() }, { rootMargin: "900px 0px" })
        io.observe(el)
        return () => io.disconnect()
    }, [hasMore, view, loadMore, pets.length])

    // El mapa necesita todos los puntos: al abrirlo se completa la carga, de a poco.
    useEffect(() => { if (view === "map" && hasMore && !isLoadingMore) void loadMore() }, [view, hasMore, isLoadingMore, loadMore])

    const visible = pets

    return (
        <div className="min-h-screen bg-background">
            <ReportPopup active={pets.length > PAGE && view === "list"} />

            {/* Portada: mismo estilo que el resto del sitio; el buscador flota sobre su borde inferior */}
            <section className="container mx-auto px-4 pt-6 md:pt-10">
                <div className="relative overflow-hidden rounded-[1.5rem] bg-accent px-5 pb-14 pt-8 sm:rounded-[2rem] sm:px-8 md:px-14 md:pb-24 md:pt-12">
                    <div aria-hidden className="paws-teal pointer-events-none absolute inset-0 opacity-[0.08]" />
                    <PawPrint aria-hidden className="pointer-events-none absolute -bottom-6 -left-4 h-28 w-28 -rotate-12 text-primary/10 md:h-40 md:w-40" />
                    <div className="relative grid items-center gap-8 md:grid-cols-[1.2fr_1fr] md:gap-12">
                        <div className="flex min-w-0 flex-col items-center space-y-5 text-center md:block md:space-y-6 md:text-left">
                            <p className="inline-flex items-center gap-2 rounded-full bg-card px-4 py-1.5 text-sm font-medium text-primary shadow-[var(--shadow-soft)]">
                                <MapPinned className="h-4 w-4" aria-hidden /> Búsqueda por zona, raza y color
                            </p>
                            <h1 className="text-balance font-display text-[2rem] leading-[1.08] text-primary sm:text-4xl md:text-5xl md:leading-[1.05]">
                                Encuentra o reporta mascotas perdidas <span className="text-cta">cerca de ti</span>
                            </h1>
                            <p className="max-w-xl text-base text-muted-foreground sm:text-lg">
                                Mira los casos de tu zona en lista o en el mapa. Si viste a una mascota, avisa a su familia; si perdiste a la tuya, publícala y crea su cartel.
                            </p>
                            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:justify-center md:justify-start">
                                <Button asChild variant="cta" size="lg" className="h-12 rounded-full px-7 text-base shadow-[var(--shadow-soft)]">
                                    <Link href="/reportar"><PawPrint className="mr-2 h-5 w-5" aria-hidden /> Reportar una mascota</Link>
                                </Button>
                                <Button asChild variant="outline" size="lg" className="h-12 rounded-full border-primary/30 bg-card px-7 text-base text-primary hover:bg-card/80">
                                    <Link href="/cartel"><Megaphone className="mr-2 h-5 w-5" aria-hidden /> Crear cartel</Link>
                                </Button>
                            </div>
                        </div>
                        <div className="relative order-first aspect-[16/10] md:order-none md:aspect-[4/3]">
                            <div className="absolute inset-0 overflow-hidden rounded-[1.25rem] shadow-[var(--shadow-lift)] md:rounded-[2rem]">
                                <Image src={STOCK.perritoDuena.src} alt={STOCK.perritoDuena.alt} fill priority sizes="(min-width: 768px) 38vw, 100vw" className="object-cover object-[50%_30%]" />
                            </div>
                            <div className="absolute -bottom-3 left-3 flex items-center gap-2 rounded-2xl bg-card px-3.5 py-2.5 text-sm font-semibold text-primary shadow-[var(--shadow-lift)] md:-left-6">
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-800"><Search className="h-4 w-4" aria-hidden /></span>
                                Filtra por lo que recuerdas
                            </div>
                        </div>
                    </div>
                </div>

                {/* Buscador flotante */}
                <div className="relative z-10 -mt-9 px-2 sm:px-6 md:-mt-14 md:px-14">
                    <div className="rounded-3xl border bg-card p-4 shadow-[var(--shadow-lift)] md:p-6">
                        <PetFilters value={filters} onChange={applyFilters} />
                    </div>
                </div>
            </section>

            {/* Resultados */}
            <div className="container max-w-7xl mx-auto px-4 pt-12 pb-20">
                <div className="space-y-6">

                    {/* Header & Controls */}
                    <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
                        <h2 className="text-2xl font-bold text-foreground">
                            {isLoading ? "Buscando..." : `${total} ${total === 1 ? "mascota encontrada" : "mascotas encontradas"}`}
                        </h2>
                        <div className="flex gap-1 rounded-lg border border-border p-1" role="group" aria-label="Vista">
                            <Button size="sm" variant={view === "list" ? "default" : "ghost"} aria-pressed={view === "list"} onClick={() => setView("list")}><List className="mr-1 h-4 w-4" />Lista</Button>
                            <Button size="sm" variant={view === "map" ? "default" : "ghost"} aria-pressed={view === "map"} onClick={() => setView("map")}><MapIcon className="mr-1 h-4 w-4" />Mapa</Button>
                        </div>
                    </div>

                    {view === "map" && !isLoading && <PetsMapWrapper pets={pets} loadingMore={hasMore} />}

                    {/* Lista: 12 por bloque y un llamado a la acción entre bloques */}
                    <div className={view === "map" ? "hidden" : "grid min-h-[400px] grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"}>
                        {isLoading ? (
                            [...Array(6)].map((_, i) => (
                                <div key={i} className="h-[400px] w-full rounded-[2rem] bg-secondary animate-pulse"></div>
                            ))
                        ) : visible.length > 0 ? (
                            visible.flatMap((pet, i) => {
                                const card = (
                                    <Reveal key={pet.id} delay={(i % 3) * 0.05}>
                                        <PetCard
                                            id={pet.id}
                                            name={pet.name}
                                            type={pet.type}
                                            breed={pet.breed || "Raza desconocida"}
                                            district={pet.last_seen_district || "Ubicación no especificada"}
                                            province={pet.last_seen_province}
                                            colors={pet.colors}
                                            imageUrl={pet.image_urls?.[0] || "/img/sin-foto.svg"}
                                            sourceName={pet.source_name}
                                            status={pet.status === "reunited" ? "found" : pet.status as "lost" | "found" | "reunited"}
                                            timeLeft="Hace poco"
                                            lostDate={pet.last_seen_date}
                                        />
                                    </Reveal>
                                )
                                // Al cerrar cada bloque de 12 (y si aún quedan más) va un bloque de llamado a la acción.
                                const endOfBlock = (i + 1) % PAGE === 0 && i + 1 < total
                                if (!endOfBlock) return [card]
                                const block = BLOCKS[((i + 1) / PAGE - 1) % BLOCKS.length]
                                return [card, (
                                    <div key={`cta-${i}`} className="col-span-full">
                                        {block === "ad" ? <div className="mx-auto max-w-4xl">{ad}</div> : <ReportCta variant={block} />}
                                    </div>
                                )]
                            })
                        ) : (
                            <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                                <div className="bg-secondary p-6 rounded-full mb-4">
                                    <Search className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <h3 className="font-bold text-foreground mb-1">No se encontraron mascotas</h3>
                                <p className="text-muted-foreground">Intenta con otros términos o limpia los filtros.</p>
                                <Button variant="link" className="text-primary mt-2" onClick={() => applyFilters(EMPTY_FILTERS)}>
                                    Quitar filtros
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Precarga del siguiente bloque */}
                    {view === "list" && !isLoading && hasMore && (
                        <div ref={sentinel} className="flex items-center justify-center py-6 text-sm text-muted-foreground" role="status">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden /> {isLoadingMore ? "Cargando más mascotas…" : "Desliza para ver más"}
                        </div>
                    )}

                    {/* Fin de la lista: un último llamado a la acción */}
                    {view === "list" && !isLoading && !hasMore && pets.length > 0 && <ReportCta variant={pets.length > PAGE ? "seccion" : "aviso"} />}
                </div>
            </div>

        </div>
    )
}

export function PetsSearch({ ad, initialQuery = "" }: { ad?: React.ReactNode; initialQuery?: string }) {
    return <SearchContent ad={ad} initialQuery={initialQuery} />
}
