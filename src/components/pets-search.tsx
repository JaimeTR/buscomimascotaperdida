"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Search, MapPin, Filter, FileText, UserPlus, Loader2, Calendar, Palette, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PetCard } from "@/components/pet-card"
import { usePets } from "@/hooks/use-pets"
import { ReportActionButton } from "@/components/report-action-button"
import Image from "next/image"
import { Reveal } from "@/components/ui/reveal"
import { STOCK } from "@/lib/stock-images"

function SearchContent({ ad }: { ad?: React.ReactNode }) {
    const searchParams = useSearchParams()

    // Search State
    const [query, setQuery] = useState(searchParams.get('q') || "")
    const [district, setDistrict] = useState("")
    const [type, setType] = useState<string>("all")
    const [breed, setBreed] = useState("")
    const [size, setSize] = useState("all")
    const [color, setColor] = useState("")
    const [dateFrom, setDateFrom] = useState("")

    const [showAdvanced, setShowAdvanced] = useState(false)

    // Sync query from URL if changed elsewhere
    useEffect(() => {
        const q = searchParams.get('q')
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (q) setQuery(q)
    }, [searchParams])

    // Data Fetching
    const { pets, isLoading } = usePets({
        searchQuery: query,
        district: district === "all" ? undefined : district,
        type: type,
        breed: breed,
        size: size,
        color: color,
        dateFrom: dateFrom
    })

    const clearFilters = () => {
        setQuery("")
        setDistrict("")
        setType("all")
        setBreed("")
        setSize("all")
        setColor("")
        setDateFrom("")
    }

    const hasActiveFilters = query || district || type !== "all" || breed || size !== "all" || color || dateFrom

    return (
        <div className="min-h-screen bg-background">

            {/* Hero Header */}
            <div className="bg-accent/50 pb-24 pt-12 md:pt-16 px-4 relative overflow-hidden">
                <div className="container max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="max-w-xl space-y-4">
                        <h1 className="font-display text-4xl md:text-5xl uppercase tracking-wide text-primary leading-[1.1]">
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
                <div className="container max-w-7xl mx-auto -mb-32 mt-12 relative z-20">
                    <div className="bg-card rounded-2xl shadow-xl p-4 space-y-4 border border-border">
                        <div className="flex flex-col md:flex-row items-center gap-4">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1 w-full">
                                {/* Text Search */}
                                <div className="relative md:col-span-2">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Buscar por nombre, raza o señas..."
                                        className="pl-9 h-12 border-border"
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                    />
                                </div>

                                {/* District Filter */}
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Distrito (ej. Miraflores)"
                                        className="pl-9 h-12 border-border"
                                        value={district}
                                        onChange={(e) => setDistrict(e.target.value)}
                                    />
                                </div>

                                {/* Type Filter */}
                                <select
                                    className="h-12 w-full rounded-md border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-teal-100 outline-none"
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                >
                                    <option value="all">Todo tipo</option>
                                    <option value="dog">Perros</option>
                                    <option value="cat">Gatos</option>
                                    <option value="other">Otros</option>
                                </select>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    className={`h-12 gap-2 border-border ${showAdvanced ? 'bg-accent text-primary border-teal-200' : ''}`}
                                    onClick={() => setShowAdvanced(!showAdvanced)}
                                >
                                    <Filter className="h-4 w-4" /> Filtros
                                </Button>
                                {hasActiveFilters && (
                                    <Button
                                        variant="outline"
                                        className="h-12 gap-2 border-border hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                                        onClick={clearFilters}
                                    >
                                        <X className="h-4 w-4" /> Limpiar
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Advanced Filters */}
                        {showAdvanced && (
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-border animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Raza específica"
                                        className="pl-9 h-10 border-border text-sm"
                                        value={breed}
                                        onChange={(e) => setBreed(e.target.value)}
                                    />
                                </div>
                                <select
                                    className="h-10 w-full rounded-md border border-border px-3 text-sm focus:ring-2 focus:ring-teal-100 outline-none"
                                    value={size}
                                    onChange={(e) => setSize(e.target.value)}
                                >
                                    <option value="all">Cualquier Tamaño</option>
                                    <option value="small">Pequeño</option>
                                    <option value="medium">Mediano</option>
                                    <option value="large">Grande</option>
                                </select>
                                <div className="relative">
                                    <Palette className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Color"
                                        className="pl-9 h-10 border-border text-sm"
                                        value={color}
                                        onChange={(e) => setColor(e.target.value)}
                                    />
                                </div>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="date"
                                        className="pl-9 h-10 border-border text-sm"
                                        value={dateFrom}
                                        onChange={(e) => setDateFrom(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="container max-w-7xl mx-auto px-4 pt-40 pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Left Column: Results (8 cols) */}
                    <div className="lg:col-span-8 space-y-6">

                        {/* Header & Controls */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <h2 className="text-2xl font-bold text-foreground">
                                {isLoading ? 'Buscando...' : `${pets.length} Mascotas encontradas`}
                            </h2>
                        </div>

                        {/* Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 min-h-[400px]">
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
                                        imageUrl={pet.image_urls?.[0] || "/img/stock/perrito-y-duena.webp"}
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
                                        onClick={() => { setQuery(""); setDistrict(""); setType("all") }}
                                    >
                                        Limpiar búsqueda
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
                                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 font-bold h-11"
                            />
                        </div>

                        {ad}
                    </div>

                </div>
            </div>

        </div>
    )
}

export function PetsSearch({ ad }: { ad?: React.ReactNode }) {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
            <SearchContent ad={ad} />
        </Suspense>
    )
}
