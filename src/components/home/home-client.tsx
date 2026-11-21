"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Search, Megaphone, MapPinned, Share2, Loader2, PawPrint } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { PetCard } from "@/components/pet-card"
import { PetFilters, EMPTY_FILTERS, hasActiveFilters, type Filters } from "@/components/pet-filters"
import { usePets } from "@/hooks/use-pets"
import { Reveal } from "@/components/ui/reveal"
import { STOCK } from "@/lib/stock-images"

const ACTIONS = [
  { href: "/reportar", icon: PawPrint, title: "Reportar una mascota", text: "Publica en minutos con fotos y la zona donde la viste por última vez.", tone: "bg-orange-100 text-orange-800" },
  { href: "/mascotas", icon: MapPinned, title: "Buscar en tu zona", text: "Filtra por distrito, tipo, raza y color, y mira los casos en el mapa.", tone: "bg-accent text-accent-foreground" },
  { href: "/cartel", icon: Megaphone, title: "Crear un cartel", text: "Genera un cartel listo para imprimir y pegar en tu barrio.", tone: "bg-amber-100 text-amber-800" },
  { href: "/promocionar", icon: Share2, title: "Difundir un caso", text: "Comparte un reporte en redes para que llegue a más personas.", tone: "bg-emerald-100 text-emerald-800" },
]

const STEPS = [
  { t: "Publica el reporte", d: "Sube fotos e indica dónde y cuándo la viste por última vez." },
  { t: "La comunidad lo difunde", d: "Comparte el caso, crea un cartel y recibe avistamientos de tu zona." },
  { t: "Vuelve a casa", d: "Te contactan de forma segura. Marca el caso como resuelto." },
]

export function HomeClient({ adSlot }: { adSlot: React.ReactNode }) {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)
  const active = hasActiveFilters(filters)

  const { pets, isLoading } = usePets({
    limit: 20,
    featured: false,
    searchQuery: filters.q,
    type: filters.petType,
    department: filters.location.department,
    province: filters.location.province,
    district: filters.location.district,
    breed: filters.breed,
    color: filters.color,
    dateFrom: filters.dateFrom,
  })

  return (
    <div>
      {/* Portada: panel suave con titular, búsqueda y símbolo de la marca */}
      <section className="container mx-auto px-4 pt-6 md:pt-10">
        <div className="relative overflow-hidden rounded-[2rem] bg-accent px-6 py-10 md:px-14 md:py-16">
          <div className="relative grid items-center gap-10 md:grid-cols-[1.25fr_1fr]">
          <div className="space-y-6">
            <p className="inline-flex items-center gap-2 rounded-full bg-card px-4 py-1.5 text-sm font-medium text-primary shadow-[var(--shadow-soft)]">
              <PawPrint className="h-4 w-4" aria-hidden /> Red comunitaria de ayuda
            </p>
            <h1 className="font-display text-4xl leading-[1.05] text-primary md:text-6xl">
              Ayúdanos a traerlos de <span className="text-cta">vuelta a casa</span>
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground">
              Busca entre los reportes de tu zona o publica el tuyo. Es gratis y lo ve toda la comunidad.
            </p>
            <PetFilters value={filters} onChange={setFilters} onSubmit={() => document.getElementById("resultados")?.scrollIntoView({ behavior: "smooth" })} />
            <Button asChild variant="cta" size="lg" className="rounded-full">
              <Link href="/reportar">Reportar una mascota</Link>
            </Button>
          </div>
          <div className="relative hidden aspect-[4/5] overflow-hidden rounded-[2rem] shadow-[var(--shadow-lift)] md:block">
            <Image src={STOCK.reencuentro.src} alt={STOCK.reencuentro.alt} fill priority sizes="(min-width: 768px) 38vw, 0px" className="object-cover transition-transform duration-700 hover:scale-105" />
          </div>
          </div>
        </div>
      </section>

      {/* Accesos rápidos */}
      <section aria-label="Accesos rápidos" className="container mx-auto px-4 py-10">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ACTIONS.map((a, i) => (
            <Reveal as="li" key={a.href} delay={i * 0.06}>
              <Link href={a.href} className="group block h-full rounded-3xl border bg-card p-5 shadow-[var(--shadow-soft)] transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]">
                <span className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${a.tone}`}><a.icon className="h-6 w-6" aria-hidden /></span>
                <h2 className="text-lg font-semibold">{a.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{a.text}</p>
              </Link>
            </Reveal>
          ))}
        </ul>
      </section>

      {/* Casos */}
      <section id="resultados" className="container mx-auto scroll-mt-20 space-y-6 px-4 py-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-2xl font-semibold md:text-3xl">
            {active ? `Resultados de tu búsqueda (${pets.length})` : "Casos recientes"}
          </h2>
          <Link href="/mascotas" className="inline-flex items-center text-sm font-semibold text-primary hover:underline">
            Ver todos y mapa <ArrowRight className="ml-1 h-4 w-4" aria-hidden />
          </Link>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center gap-3 py-20 text-muted-foreground" role="status">
            <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden />
            Consultando con la comunidad…
          </div>
        ) : pets.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {pets.map((pet) => (
              <PetCard
                key={pet.id}
                id={pet.id}
                name={pet.name}
                type={pet.type}
                breed={pet.breed || "Raza desconocida"}
                district={pet.last_seen_district}
                province={pet.last_seen_province}
                colors={pet.colors}
                imageUrl={pet.image_urls?.[0] || "/img/sin-foto.svg"}
                status={pet.status === "reunited" ? "found" : (pet.status as "lost" | "found" | "reunited")}
                lostDate={pet.last_seen_date}
              />
            ))}
          </div>
        ) : active ? (
          <EmptyState icon={Search} title="No encontramos coincidencias" text="Prueba ajustando los filtros o buscando en otro distrito.">
            <Button variant="outline" onClick={() => setFilters(EMPTY_FILTERS)}>Quitar filtros</Button>
          </EmptyState>
        ) : (
          <EmptyState icon={PawPrint} title="Aún no hay reportes publicados" text="Si perdiste o encontraste una mascota, publícala para que la comunidad pueda ayudar.">
            <Button asChild variant="cta"><Link href="/reportar">Crear un reporte</Link></Button>
          </EmptyState>
        )}
      </section>

      {/* Espacio publicitario (servidor) */}
      <section aria-label="Anuncio" className="container mx-auto px-4 py-6">{adSlot}</section>

      {/* Cómo funciona */}
      <section className="container mx-auto px-4 py-14">
        <h2 className="mb-8 text-center font-display text-3xl text-primary md:text-4xl">Cómo funciona</h2>
        <ol className="grid gap-4 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal as="li" key={s.t} delay={i * 0.06} className="rounded-3xl border bg-card p-6 shadow-[var(--shadow-soft)]">
              <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-primary font-display text-lg text-primary-foreground">{i + 1}</span>
              <h3 className="mb-1 text-lg font-semibold">{s.t}</h3>
              <p className="text-sm text-muted-foreground">{s.d}</p>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* Aliados y voluntarios */}
      <section className="container mx-auto px-4 pb-14">
        <div className="grid overflow-hidden rounded-[2rem] border bg-card shadow-[var(--shadow-soft)] md:grid-cols-2">
          <div className="relative min-h-60">
            <Image src={STOCK.veterinarios.src} alt={STOCK.veterinarios.alt} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
          </div>
          <div className="flex flex-col justify-center gap-4 p-8 md:p-12">
            <h2 className="font-display text-3xl leading-tight text-primary">Empresas y voluntarios que suman</h2>
            <p className="text-muted-foreground">Veterinarias, refugios, negocios y personas que ayudan a que más mascotas vuelvan a casa. Súmate o promociona tu negocio.</p>
            <div className="flex flex-wrap gap-3">
              <Button asChild className="rounded-full"><Link href="/aliados">Ser aliado</Link></Button>
              <Button asChild variant="outline" className="rounded-full"><Link href="/promocionar">Promocionar mi negocio</Link></Button>
            </div>
          </div>
        </div>
      </section>

      {/* Cierre */}
      <section className="container mx-auto px-4 pb-6">
        <div className="rounded-[2rem] bg-primary px-6 py-12 text-center text-primary-foreground md:py-16">
          <h2 className="mx-auto max-w-2xl font-display text-3xl leading-tight md:text-4xl">¿Perdiste a tu mascota o encontraste una?</h2>
          <p className="mx-auto mt-3 max-w-xl text-primary-foreground/90">Cada minuto cuenta. Publica ahora y activa la red de tu zona.</p>
          <Button asChild variant="cta" size="lg" className="mt-6 rounded-full">
            <Link href="/reportar">Reportar una mascota</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
