"use client"

import { useState } from "react"
import { Search, ChevronDown, Calendar, ArrowRight, Loader2, X, MapPin, Dog, Palette, PawPrint, Cat, Squirrel } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PetCard } from "@/components/pet-card"
import Link from "next/link"
import { usePets } from "@/hooks/use-pets"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { LocationPopover } from "@/components/location-popover"
import { BreedPopover } from "@/components/breed-popover"
import { ColorPopover } from "@/components/color-popover"

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("")
  const [location, setLocation] = useState({
    department: "",
    province: "",
    district: "",
    address: "",
    lat: undefined as number | undefined,
    lng: undefined as number | undefined
  })
  const [petType, setPetType] = useState("all") // Show all pets by default
  const [breed, setBreed] = useState("")
  const [color, setColor] = useState("")
  const [dateFrom, setDateFrom] = useState("")

  // Dynamic results fetching
  const { pets: searchResults, isLoading } = usePets({
    limit: 20,
    featured: false,
    searchQuery: searchQuery,
    type: petType,
    department: location.department,
    province: location.province,
    district: location.district,
    breed: breed,
    color: color,
    dateFrom: dateFrom
  })

  const hasActiveFilters = searchQuery || location.department || petType !== 'all' || breed || color || dateFrom

  const clearFilters = () => {
    setSearchQuery("")
    setLocation({
      department: "",
      province: "",
      district: "",
      address: "",
      lat: undefined,
      lng: undefined
    })
    setPetType("all")
    setBreed("")
    setColor("")
    setDateFrom("")
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-background py-16 md:py-24">

        <div className="container mx-auto px-4 md:px-6 text-center space-y-10">
          <div className="space-y-6 max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1]">
              Ayúdanos a traerlos de <br className="hidden md:block" />
              <span className="text-primary">vuelta a casa</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Busca entre los reportes de tu zona o publica el tuyo. Es gratis y lo ve toda la comunidad.
            </p>
            <div className="flex justify-center">
              <Button asChild size="lg" className="h-12 rounded-full bg-cta px-8 text-base font-bold text-cta-foreground hover:bg-cta/90">
                <Link href="/reportar">Reportar una mascota</Link>
              </Button>
            </div>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            <form
              role="search"
              className="relative shadow-2xl shadow-teal-700/10 rounded-full"
              onSubmit={(e) => {
                e.preventDefault()
                document.getElementById("resultados")?.scrollIntoView({ behavior: "smooth" })
              }}
            >
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
              <Input
                aria-label="Buscar mascotas"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-16 pl-14 pr-36 rounded-full text-lg shadow-none border-0 ring-1 ring-stone-200 focus-visible:ring-2 focus-visible:ring-teal-700 bg-white"
                placeholder="Busca por nombre, raza o señas particulares..."
              />
              <Button type="submit" className="absolute right-2 top-2 h-12 px-8 rounded-full font-bold">
                Buscar
              </Button>
            </form>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              {/* LOCATION PILL */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className={`rounded-full h-10 px-6 font-semibold border-stone-200 shadow-sm transition-colors ${location.department ? 'bg-teal-50 border-teal-200 text-teal-800' : 'bg-white text-stone-600 hover:bg-stone-50'}`}>
                    <MapPin className="mr-2 h-3.5 w-3.5 opacity-50" />
                    {location.district || location.province || location.department || 'Lugar'} <ChevronDown className="ml-2 h-3.5 w-3.5 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 overflow-y-auto max-h-[80vh]">
                  <LocationPopover
                    initialValues={location}
                    onLocationChange={(loc) => setLocation(prev => ({ ...prev, ...loc, address: loc.address || "" }))}
                  />
                </PopoverContent>
              </Popover>

              {/* PET TYPE PILL */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className={`rounded-full h-10 px-6 font-semibold border-stone-200 shadow-sm transition-colors ${petType !== 'all' ? 'bg-teal-50 border-teal-200 text-teal-800' : 'bg-white text-stone-600 hover:bg-stone-50'}`}>
                    {petType === 'dog' ? <Dog className="mr-2 h-3.5 w-3.5 opacity-70" /> : petType === 'cat' ? <Cat className="mr-2 h-3.5 w-3.5 opacity-70" /> : petType === 'other' ? <Squirrel className="mr-2 h-3.5 w-3.5 opacity-70" /> : <PawPrint className="mr-2 h-3.5 w-3.5 opacity-70" />}
                    {petType === 'dog' ? 'Perro' : petType === 'cat' ? 'Gato' : petType === 'other' ? 'Otros' : 'Mascota'} <ChevronDown className="ml-2 h-3.5 w-3.5 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-2">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase text-stone-400 tracking-wider p-2">Tipo de Mascota</p>
                    <button
                      onClick={() => { setPetType('all'); setBreed(""); }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${petType === 'all' ? 'bg-teal-50 text-teal-800' : 'hover:bg-stone-50 text-stone-600'}`}
                    >
                      <PawPrint className="h-4 w-4" /> Todas
                    </button>
                    <button
                      onClick={() => { setPetType('dog'); setBreed(""); }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${petType === 'dog' ? 'bg-teal-50 text-teal-800' : 'hover:bg-stone-50 text-stone-600'}`}
                    >
                      <Dog className="h-4 w-4" /> Perro
                    </button>
                    <button
                      onClick={() => { setPetType('cat'); setBreed(""); }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${petType === 'cat' ? 'bg-teal-50 text-teal-800' : 'hover:bg-stone-50 text-stone-600'}`}
                    >
                      <Cat className="h-4 w-4" /> Gato
                    </button>
                    <button
                      onClick={() => { setPetType('other'); setBreed(""); }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${petType === 'other' ? 'bg-teal-50 text-teal-800' : 'hover:bg-stone-50 text-stone-600'}`}
                    >
                      <Squirrel className="h-4 w-4" /> Otros
                    </button>
                  </div>
                </PopoverContent>
              </Popover>

              {/* BREED PILL */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className={`rounded-full h-10 px-6 font-semibold border-stone-200 shadow-sm transition-colors ${breed ? 'bg-teal-50 border-teal-200 text-teal-800' : 'bg-white text-stone-600 hover:bg-stone-50'}`}>
                    <PawPrint className="mr-2 h-3.5 w-3.5 opacity-50" />
                    {breed || 'Raza'} <ChevronDown className="ml-2 h-3.5 w-3.5 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0 overflow-hidden">
                  <BreedPopover
                    petType={petType}
                    initialBreed={breed}
                    onBreedChange={setBreed}
                  />
                </PopoverContent>
              </Popover>

              {/* COLOR PILL */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className={`rounded-full h-10 px-6 font-semibold border-stone-200 shadow-sm transition-colors ${color ? 'bg-teal-50 border-teal-200 text-teal-800' : 'bg-white text-stone-600 hover:bg-stone-50'}`}>
                    <Palette className="mr-2 h-3.5 w-3.5 opacity-50" />
                    {color || 'Color'} <ChevronDown className="ml-2 h-3.5 w-3.5 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-0">
                  <ColorPopover
                    petType={petType}
                    initialColor={color}
                    onColorChange={setColor}
                  />
                </PopoverContent>
              </Popover>

              {/* DATE PILL */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className={`rounded-full h-10 px-6 font-semibold border-stone-200 shadow-sm transition-colors ${dateFrom ? 'bg-teal-50 border-teal-200 text-teal-800' : 'bg-white text-stone-600 hover:bg-stone-50'}`}>
                    {dateFrom || 'Fecha'} <Calendar className="ml-2 h-3.5 w-3.5 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64">
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase text-stone-400 tracking-wider">Desde la fecha</p>
                    <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-9 w-full text-sm" />
                  </div>
                </PopoverContent>
              </Popover>

              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-stone-400 hover:text-red-500 font-bold gap-2 text-[10px] uppercase tracking-wider ml-2">
                  <X className="h-3 w-3" /> Limpiar Todo
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Results / Recent Pets Section */}
      <section id="resultados" className="py-16 md:py-20 bg-secondary/50 scroll-mt-16">
        <div className="container mx-auto px-4 md:px-6 space-y-12">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight text-stone-900">
              {hasActiveFilters ? (
                <>Resultados de tu búsqueda ({searchResults.length})</>
              ) : (
                <>Mascotas perdidas recientemente</>
              )}
            </h2>
            <Link href="/mascotas" className="text-teal-700 font-semibold hover:text-teal-800 flex items-center text-sm group">
              Explorar mapa <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="h-10 w-10 text-teal-700 animate-spin" />
              <p className="text-stone-400 font-medium italic">Consultando con la comunidad...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 min-h-[400px]">
              {searchResults.length > 0 ? (
                searchResults.map(pet => (
                  <PetCard
                    key={pet.id}
                    id={pet.id}
                    name={pet.name}
                    type={pet.type}
                    breed={pet.breed || "Raza desconocida"}
                    district={pet.last_seen_district}
                    province={pet.last_seen_province}
                    colors={pet.colors}
                    imageUrl={pet.image_urls?.[0] || "https://placehold.co/600x400?text=Sin+foto"}
                    status={pet.status === 'reunited' ? 'found' : pet.status as 'lost' | 'found' | 'reunited'}
                    timeLeft="Hace poco"
                    lostDate={pet.last_seen_date}
                  />
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                  <div className="bg-stone-100 p-6 rounded-full mb-4">
                    <Search className="h-10 w-10 text-stone-300" />
                  </div>
                  {hasActiveFilters ? (
                    <>
                      <h3 className="text-xl font-bold text-stone-900 mb-2">No encontramos coincidencias</h3>
                      <p className="text-stone-500 max-w-sm">Prueba ajustando los filtros o buscando en otro distrito.</p>
                      <Button variant="link" onClick={clearFilters} className="text-teal-700 font-bold mt-4">Quitar filtros</Button>
                    </>
                  ) : (
                    <>
                      <h3 className="text-xl font-bold text-stone-900 mb-2">Aún no hay reportes publicados</h3>
                      <p className="text-stone-500 max-w-sm">Si perdiste o encontraste una mascota, publícala para que la comunidad pueda ayudar.</p>
                      <Button asChild className="mt-4 bg-cta text-cta-foreground hover:bg-cta/90"><Link href="/reportar">Crear un reporte</Link></Button>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="bg-background py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="mb-10 text-center text-3xl font-extrabold tracking-tight md:text-4xl">Cómo funciona</h2>
          <ol className="grid gap-6 md:grid-cols-3">
            {[
              { n: 1, t: "Publica el reporte", d: "Sube fotos, indica dónde y cuándo lo viste por última vez. Toma menos de cinco minutos." },
              { n: 2, t: "La comunidad lo difunde", d: "Comparte el caso, crea un cartel y recibe avistamientos de personas cerca de la zona." },
              { n: 3, t: "Vuelve a casa", d: "Te contactan de forma segura. Marca el caso como resuelto cuando lo encuentres." },
            ].map((s) => (
              <li key={s.n} className="rounded-2xl border bg-card p-6">
                <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-lg font-extrabold text-primary-foreground">{s.n}</span>
                <h3 className="mb-2 text-lg font-bold">{s.t}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="container mx-auto flex flex-col items-center gap-6 px-4 text-center">
          <h2 className="max-w-2xl text-3xl font-extrabold tracking-tight md:text-4xl">¿Perdiste a tu mascota o encontraste una?</h2>
          <p className="max-w-xl text-primary-foreground/90">Cada minuto cuenta. Publica ahora y activa la red de tu zona.</p>
          <Button asChild size="lg" className="h-12 rounded-full bg-cta px-8 text-base font-bold text-cta-foreground hover:bg-cta/90">
            <Link href="/reportar">Reportar una mascota</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
