"use client"

import { useState } from "react"
import { Search, FileText, UserPlus, List, Map as MapIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { PetFilters, EMPTY_FILTERS, type Filters } from "@/components/pet-filters"
import { PetCard } from "@/components/pet-card"
import { PetsMapWrapper } from "@/components/pets-map-wrapper"
import { usePets } from "@/hooks/use-pets"
import { ReportActionButton } from "@/components/report-action-button"
import Image from "next/image"
import { Reveal } from "@/components/ui/reveal"
import { STOCK } from "@/lib/stock-images"

function SearchContent({ ad, initialQuery }: { ad?: React.ReactNode; initialQuery: string }) {

    const [filters, setFilters] = useState<Filters>({ ...EMPTY_FILTERS, q: initialQuery })
    const [view, setView] = useState<"list" | "map">("list")

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

    return (
        <div className="min-h-screen bg-background">

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
                        <PetFilters value={filters} onChange={setFilters} />
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="container max-w-7xl mx-auto px-4 pt-10 pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Left Column: Results (8 cols) */}
                    <div className="lg:col-span-8 space-y-6">

                        {/* Header & Controls */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <h2 className="text-2xl font-bold text-foreground">
                                {isLoading ? 'Buscando...' : `${pets.length} Mascotas encontradas`}
                            </h2>
                            <div className="flex gap-1 rounded-lg border border-border p-1" role="group" aria-label="Vista">
                                <Button size="sm" variant={view === "list" ? "default" : "ghost"} aria-pressed={view === "list"} onClick={() => setView("list")}><List className="mr-1 h-4 w-4" />Lista</Button>
                                <Button size="sm" variant={view === "map" ? "default" : "ghost"} aria-pressed={view === "map"} onClick={() => setView("map")}><MapIcon className="mr-1 h-4 w-4" />Mapa</Button>
                            </div>
                        </div>

                        {view === "map" && !isLoading && <PetsMapWrapper pets={pets} />}

                        {/* Grid */}
                        <div className={view === "map" ? "hidden" : "grid grid-cols-1 sm:grid-cols-2 gap-6 min-h-[400px]"}>
                            {isLoading ? (
                                [...Array(4)].map((_, i) => (
                                    <div key={i} className="h-[400px] w-full rounded-[2rem] bg-secondary animate-pulse"></div>
                                ))
                            ) : pets.length > 0 ? (
                                pets.map((pet, i) => (
                                    <Reveal key={pet.id} delay={(i % 4) * 0.05}>
                                    <PetCard
                                        id={pet.id}
                                        name={pet.name}
                                        type={pet.type}
                                        breed={pet.breed || "Raza desconocida"}
                                        district={pet.last_seen_district || "Ubicación no especificada"}
                                        province={pet.last_seen_province}
                                        colors={pet.colors}
                                        imageUrl={pet.image_urls?.[0] || "/img/sin-foto.svg"}
                                        status={pet.status === 'reunited' ? 'found' : pet.status as 'lost' | 'found' | 'reunited'}
                                        timeLeft="Hace poco"
                                        lostDate={pet.last_seen_date}
                                    />
                                    </Reveal>
                                ))
                            ) : (
                                <div className="col-span-2 flex flex-col items-center justify-center py-12 text-center">
                                    <div className="bg-secondary p-6 rounded-full mb-4">
                                        <Search className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <h3 className="font-bold text-foreground mb-1">No se encontraron mascotas</h3>
                                    <p className="text-muted-foreground">Intenta con otros términos o limpia los filtros.</p>
                                    <Button
                                        variant="link"
                                        className="text-primary mt-2"
                                        onClick={() => setFilters(EMPTY_FILTERS)}
                                    >
                                        Quitar filtros
                                    </Button>
                                </div>
                            )}
                        </div>

                    </div>


                    {/* Right Column: Sidebar (4 cols) */}
                    <div className="lg:col-span-4 space-y-6">

                        {/* Report Widget */}
                        <div className="bg-card rounded-2xl shadow-sm border p-6 space-y-6">
                            <h3 className="text-lg font-bold text-foreground">Reportar Mascota Perdida</h3>

                            <div className="space-y-4">
                                <div className="flex gap-3">
                                    <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center text-primary shrink-0">
                                        <UserPlus className="h-4 w-4" />
                                    </div>
                                    <div className="text-sm">
                                        <span className="font-semibold block">Crea una cuenta</span>
                                        <span className="text-muted-foreground">Para gestionar tus reportes</span>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center text-primary shrink-0">
                                        <FileText className="h-4 w-4" />
                                    </div>
                                    <div className="text-sm">
                                        <span className="font-semibold block">Completa el formulario</span>
                                        <span className="text-muted-foreground">Sube fotos y detalles</span>
                                    </div>
                                </div>
                            </div>

                            <ReportActionButton
                                nextUrl="/reportar"
                                label="Reportar Mascota"
                                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white shadow-lg shadow-emerald-700/20 font-bold h-11"
                            />
                        </div>

                        {ad}
                    </div>

                </div>
            </div>

        </div>
    )
}

export function PetsSearch({ ad, initialQuery = "" }: { ad?: React.ReactNode; initialQuery?: string }) {
    return <SearchContent ad={ad} initialQuery={initialQuery} />
}
