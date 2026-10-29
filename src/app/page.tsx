"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, ChevronDown, Calendar, ArrowRight, Loader2, X, MapPin, Dog, Palette, PawPrint, Cat, Squirrel } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PetCard } from "@/components/pet-card"
import Link from "next/link"
import { usePets } from "@/hooks/use-pets"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LocationPopover } from "@/components/location-popover"
import { BreedPopover } from "@/components/breed-popover"
import { ColorPopover } from "@/components/color-popover"

export default function Home() {
  const router = useRouter()
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
      <section className="relative py-24 md:py-32 bg-white overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50 rounded-full blur-3xl -z-10 opacity-60 translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-50 rounded-full blur-3xl -z-10 opacity-40 -translate-x-1/2 translate-y-1/2"></div>

        <div className="container mx-auto px-4 md:px-6 text-center space-y-10">
          <div className="space-y-6 max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
              Ayúdanos a traerlos de <br className="hidden md:block" />
              <span className="text-blue-400">vuelta a casa</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto font-medium">
              Red de ayuda para encontrar nuestra mascota perdida. La comunidad más grande y activa para traerlos de vuelta a casa.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            <div className="relative shadow-2xl shadow-blue-500/10 rounded-full">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-16 pl-14 pr-36 rounded-full text-lg shadow-none border-0 ring-1 ring-slate-200 focus-visible:ring-2 focus-visible:ring-blue-500 bg-white"
                placeholder="Busca por nombre, raza o señas particulares..."
              />
              <Button className="absolute right-2 top-2 h-12 px-8 rounded-full shadow-lg bg-blue-400 hover:bg-blue-500 text-white font-bold tracking-wide">
                Buscar
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              {/* LOCATION PILL */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className={`rounded-full h-10 px-6 font-semibold border-slate-200 shadow-sm transition-colors ${location.department ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>
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
                  <Button variant="outline" size="sm" className={`rounded-full h-10 px-6 font-semibold border-slate-200 shadow-sm transition-colors ${petType !== 'all' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>
                    {petType === 'dog' ? <Dog className="mr-2 h-3.5 w-3.5 opacity-70" /> : petType === 'cat' ? <Cat className="mr-2 h-3.5 w-3.5 opacity-70" /> : petType === 'other' ? <Squirrel className="mr-2 h-3.5 w-3.5 opacity-70" /> : <PawPrint className="mr-2 h-3.5 w-3.5 opacity-70" />}
                    {petType === 'dog' ? 'Perro' : petType === 'cat' ? 'Gato' : petType === 'other' ? 'Otros' : 'Mascota'} <ChevronDown className="ml-2 h-3.5 w-3.5 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-2">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider p-2">Tipo de Mascota</p>
                    <button
                      onClick={() => { setPetType('all'); setBreed(""); }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${petType === 'all' ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-50 text-slate-600'}`}
                    >
                      <PawPrint className="h-4 w-4" /> Todas
                    </button>
                    <button
                      onClick={() => { setPetType('dog'); setBreed(""); }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${petType === 'dog' ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-50 text-slate-600'}`}
                    >
                      <Dog className="h-4 w-4" /> Perro
                    </button>
                    <button
                      onClick={() => { setPetType('cat'); setBreed(""); }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${petType === 'cat' ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-50 text-slate-600'}`}
                    >
                      <Cat className="h-4 w-4" /> Gato
                    </button>
                    <button
                      onClick={() => { setPetType('other'); setBreed(""); }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${petType === 'other' ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-50 text-slate-600'}`}
                    >
                      <Squirrel className="h-4 w-4" /> Otros
                    </button>
                  </div>
                </PopoverContent>
              </Popover>

              {/* BREED PILL */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className={`rounded-full h-10 px-6 font-semibold border-slate-200 shadow-sm transition-colors ${breed ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>
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
                  <Button variant="outline" size="sm" className={`rounded-full h-10 px-6 font-semibold border-slate-200 shadow-sm transition-colors ${color ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>
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
                  <Button variant="outline" size="sm" className={`rounded-full h-10 px-6 font-semibold border-slate-200 shadow-sm transition-colors ${dateFrom ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>
                    {dateFrom || 'Fecha'} <Calendar className="ml-2 h-3.5 w-3.5 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64">
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Desde la fecha</p>
                    <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-9 w-full text-sm" />
                  </div>
                </PopoverContent>
              </Popover>

              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-slate-400 hover:text-red-500 font-bold gap-2 text-[10px] uppercase tracking-wider ml-2">
                  <X className="h-3 w-3" /> Limpiar Todo
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Results / Recent Pets Section */}
      <section className="py-20 md:py-28 bg-slate-50/50">
        <div className="container mx-auto px-4 md:px-6 space-y-12">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              {hasActiveFilters ? (
                <>Resultados de tu búsqueda ({searchResults.length})</>
              ) : (
                <>Mascotas perdidas recientemente</>
              )}
            </h2>
            <Link href="/mascotas" className="text-blue-500 font-semibold hover:text-blue-600 flex items-center text-sm group">
              Explorar mapa <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="h-10 w-10 text-blue-400 animate-spin" />
              <p className="text-slate-400 font-medium italic">Consultando con la comunidad...</p>
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
                    imageUrl={pet.image_urls?.[0] || "https://via.placeholder.com/600x400?text=Sin+Foto"}
                    status={pet.status === 'reunited' ? 'found' : pet.status as 'lost' | 'found' | 'reunited'}
                    timeLeft="Hace poco"
                    lostDate={pet.last_seen_date}
                  />
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                  <div className="bg-slate-100 p-6 rounded-full mb-4">
                    <Search className="h-10 w-10 text-slate-300" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">No encontramos coincidencias</h3>
                  <p className="text-slate-500 max-w-sm">Prueba ajustando los filtros o buscando en otro distrito.</p>
                  <Button variant="link" onClick={clearFilters} className="text-blue-500 font-bold mt-4">Ver todas las mascotas</Button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Success Stories Section */}
      <section className="py-20 md:py-28 bg-slate-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-100 p-8 md:p-16 lg:p-20 flex flex-col md:flex-row items-center gap-16 shadow-sm">

            <div className="space-y-8 flex-1 text-center md:text-left z-10">
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">Historias de esperanza</h2>
              <p className="text-lg text-slate-600 max-w-md leading-relaxed">
                Cada día, cientos de familias vuelven a abrazar a sus mascotas gracias a nuestra comunidad. Lee sus testimonios y no pierdas la fe.
              </p>
              <Button variant="outline" size="lg" className="rounded-full border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white px-10 h-14 text-base font-bold bg-transparent">
                Ver testimonios
              </Button>
            </div>

            {/* Styled Illustration */}
            <div className="flex-1 relative w-full h-80 md:h-96 flex items-center justify-center">
              {/* Card 1 */}
              <div className="absolute right-10 top-0 w-56 h-72 bg-[#768C5C] rounded-2xl rotate-6 shadow-2xl overflow-hidden border-[6px] border-white transform hover:rotate-2 hover:scale-105 transition-all duration-500 z-10">
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white text-[10px] font-bold tracking-widest uppercase">¡En casa!</div>
                <img src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=400&auto=format&fit=crop" className="w-full h-full object-cover" alt="Success 1" />
              </div>
              {/* Card 2 */}
              <div className="absolute left-10 bottom-0 w-56 h-72 bg-[#F2D49B] rounded-2xl -rotate-6 shadow-2xl overflow-hidden border-[6px] border-white transform hover:-rotate-2 hover:scale-105 transition-all duration-500 z-0">
                <img src="https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?q=80&w=400&auto=format&fit=crop" className="w-full h-full object-cover" alt="Success 2" />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Donation Section */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-100 flex flex-col lg:flex-row">

            {/* Left: Impact & Info */}
            <div className="lg:w-2/5 bg-blue-50/50 p-12 flex flex-col justify-center space-y-8">
              <div className="inline-block">
                <span className="bg-blue-100 text-blue-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">Donaciones</span>
              </div>

              <h2 className="text-4xl font-extrabold text-slate-900 leading-tight">
                Tu ayuda nos permite seguir <span className="text-blue-500 underline decoration-blue-200 underline-offset-4">reuniendo familias</span>
              </h2>

              <p className="text-slate-600 leading-relaxed">
                Cada donación ayuda a financiar las alertas SMS y la publicidad en redes para encontrar a las mascotas perdidas en todo el país.
              </p>

              <div className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-blue-100">
                <div className="bg-blue-500 rounded-full p-3 text-white">
                  <Search className="h-6 w-6" /> {/* Reusing Search icon as placeholder for Heart/Hand */}
                </div>
                <div>
                  <p className="text-[10px] text-blue-500 font-bold uppercase tracking-wider mb-0.5">Impacto Real</p>
                  <p className="text-sm font-bold text-slate-900">+250 mascotas regresaron a casa este mes.</p>
                </div>
              </div>
            </div>

            {/* Right: Payment Methods */}
            <div className="lg:w-3/5 p-12 bg-white">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-slate-900">Escanea y dona</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Yape Card */}
                <div className="bg-slate-50 rounded-2xl p-6 flex flex-col items-center text-center border border-slate-100">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs">Y</div>
                    <span className="font-bold text-slate-900">Yape</span>
                  </div>
                  <div className="w-40 h-40 bg-white rounded-xl shadow-sm p-2 mb-4">
                    <div className="w-full h-full bg-slate-900 flex items-center justify-center text-white/50 text-xs">QR Placeholder</div>
                  </div>
                  <p className="font-black text-xl text-slate-900 mb-1">987 654 321</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-4">Titular: Asoc. Huellas</p>
                  <Button size="sm" className="w-full bg-blue-500 hover:bg-blue-600">Copiar número</Button>
                </div>

                {/* Plin Card */}
                <div className="bg-blue-50/30 rounded-2xl p-6 flex flex-col items-center text-center border border-blue-100">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-xs">P</div>
                    <span className="font-bold text-slate-900">Plin</span>
                  </div>
                  <div className="w-40 h-40 bg-white rounded-xl shadow-sm p-2 mb-4">
                    <div className="w-full h-full bg-slate-900 flex items-center justify-center text-white/50 text-xs">QR Placeholder</div>
                  </div>
                  <p className="font-black text-xl text-slate-900 mb-1">912 345 678</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-4">Titular: Asoc. Huellas</p>
                  <Button size="sm" className="w-full bg-blue-500 hover:bg-blue-600">Copiar número</Button>
                </div>
              </div>

              <div className="mt-8 text-center">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Pasos Rápidos</p>
                <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
                  <span className="bg-slate-100 px-2 py-1 rounded-md">1. Abre tu app</span>
                  <span className="bg-slate-100 px-2 py-1 rounded-md">2. Escanea el QR</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  )
}
