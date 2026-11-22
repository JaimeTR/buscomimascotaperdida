"use client"

import { useEffect, useRef, useState } from "react"
import { Search, List, Map as MapIcon, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { PetFilters, EMPTY_FILTERS, type Filters } from "@/components/pet-filters"
import { PetCard } from "@/components/pet-card"
import { PetsMapWrapper } from "@/components/pets-map-wrapper"
import { usePets } from "@/hooks/use-pets"
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
    const [shown, setShown] = useState(PAGE)
    const sentinel = useRef<HTMLDivElement>(null)
    const applyFilters = (f: Filters) => { setFilters(f); setShown(PAGE) }

    const { pets, isLoading } = usePets({
        searchQuery: filters.q,
        type: filters.petType,
        status: filters.status,
        department: filters.location.department,
        province: filters.location.province,
        district: filters.location.district,
        breed: filters.breed,
        color: filters.color,
        dateFrom: filters.dateFrom,
    })

    // Scroll infinito con precarga: el siguiente bloque se pide cuando falta ~1 pantalla para llegar al final.
    const hasMore = shown < pets.length
    useEffect(() => {
        const el = sentinel.current
        if (!el || !hasMore || view !== "list") return
        const io = new IntersectionObserver((e) => { if (e[0].isIntersecting) setShown((n) => n + PAGE) }, { rootMargin: "900px 0px" })
        io.observe(el)
        return () => io.disconnect()
    }, [hasMore, view, shown])

    const visible = pets.slice(0, shown)

    return (
        <div className="min-h-screen bg-background">
            <ReportPopup active={shown > PAGE && view === "list"} />

            {/* Hero Header */}
            <div className="bg-accent/50 pb-10 pt-12 md:pt-16 px-4 relative overflow-hidden">
                <div className="container max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="max-w-xl space-y-4">
                        <h1 className="font-display text-4xl md:text-5xl text-primary leading-[1.1]">
                            Encuentra o reporta mascotas perdidas cerca de ti
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            Ayuda a otras personas a encontrar sus mascotas perdidas y genera carteles fácilmente.
                        </p>
                    </div>

                    <div className="hidden md:flex items-center gap-4">
                        <div className="h-48 w-48 bg-teal-200 rounded-full opacity-50 blur-3xl absolute right-0 top-0 -z-10"></div>
                        <div className="relative">
                            <Image src={STOCK.perritoDuena.src} width={256} height={192} alt={STOCK.perritoDuena.alt} priority className="h-48 w-64 -rotate-3 rounded-2xl border-4 border-white object-cover shadow-xl" />
                        </div>
                    </div>
                </div>

                {/* Floating Search Bar */}
                <div className="container max-w-7xl mx-auto mt-10 relative z-20">
                    <div className="bg-card rounded-2xl shadow-xl p-4 border border-border">
                        <PetFilters value={filters} onChange={applyFilters} />
                    </div>
                </div>
            </div>

            {/* Resultados */}
            <div className="container max-w-7xl mx-auto px-4 pt-10 pb-20">
                <div className="space-y-6">

                    {/* Header & Controls */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <h2 className="text-2xl font-bold text-foreground">
                            {isLoading ? "Buscando..." : `${pets.length} ${pets.length === 1 ? "mascota encontrada" : "mascotas encontradas"}`}
                        </h2>
                        <div className="flex gap-1 rounded-lg border border-border p-1 self-start" role="group" aria-label="Vista">
                            <Button size="sm" variant={view === "list" ? "default" : "ghost"} aria-pressed={view === "list"} onClick={() => setView("list")}><List className="mr-1 h-4 w-4" />Lista</Button>
                            <Button size="sm" variant={view === "map" ? "default" : "ghost"} aria-pressed={view === "map"} onClick={() => setView("map")}><MapIcon className="mr-1 h-4 w-4" />Mapa</Button>
                        </div>
                    </div>

                    {view === "map" && !isLoading && <PetsMapWrapper pets={pets} />}

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
                                const endOfBlock = (i + 1) % PAGE === 0 && i + 1 < pets.length
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
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden /> Cargando más mascotas…
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
