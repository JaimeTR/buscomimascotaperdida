"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Search, Megaphone, MapPinned, Share2, Loader2, PawPrint, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { PetCard } from "@/components/pet-card"
import { PetFilters, EMPTY_FILTERS, hasActiveFilters, type Filters } from "@/components/pet-filters"
import { usePets, type Pet } from "@/hooks/use-pets"
import { Reveal } from "@/components/ui/reveal"
import { STOCK } from "@/lib/stock-images"

const ACTIONS = [
  { href: "/reportar", icon: PawPrint, title: "Reportar una mascota", text: "Publica en minutos con fotos y la zona donde la viste por última vez.", tone: "bg-orange-100 text-orange-800" },
  { href: "/mascotas", icon: MapPinned, title: "Buscar en tu zona", text: "Filtra por distrito, tipo, raza y color, y mira los casos en el mapa.", tone: "bg-accent text-accent-foreground" },
  { href: "/cartel", icon: Megaphone, title: "Crear un cartel", text: "Genera un cartel listo para imprimir y pegar en tu barrio.", tone: "bg-amber-100 text-amber-800" },
  { href: "/anuncios", icon: Share2, title: "Difundir un caso", text: "Comparte un reporte en redes para que llegue a más personas.", tone: "bg-emerald-100 text-emerald-800" },
]

const STEPS = [
  { t: "Publica el reporte", d: "Sube fotos e indica dónde y cuándo la viste por última vez." },
  { t: "La comunidad lo difunde", d: "Comparte el caso, crea un cartel y recibe avistamientos de tu zona." },
  { t: "Vuelve a casa", d: "Te contactan de forma segura. Marca el caso como resuelto." },
]

export function HomeClient({ adSlot, initialPets }: { adSlot: React.ReactNode; initialPets: Pet[] }) {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)
  const active = hasActiveFilters(filters)

  // Sin filtros se usan los casos renderizados en servidor (indexables); con filtros, consulta en el cliente.
  const { pets: found, isLoading: searching } = usePets({
    enabled: active,
    limit: 20,
    featured: false,
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
  })
  const pets = active ? found : initialPets
  const isLoading = active && searching

  return (
    <div>
      {/* Portada: panel con titular, acciones y foto; el buscador flota sobre su borde inferior */}
      <section className="container mx-auto px-4 pt-6 md:pt-10">
        <div className="relative overflow-hidden rounded-[1.5rem] bg-accent px-5 pb-14 pt-6 sm:rounded-[2rem] sm:px-8 md:px-14 md:pb-24 md:pt-14">
          <div aria-hidden className="paws-teal pointer-events-none absolute inset-0 opacity-[0.08]" />
          <PawPrint aria-hidden className="pointer-events-none absolute -bottom-6 -left-4 h-28 w-28 -rotate-12 text-primary/10 md:h-40 md:w-40" />
          <div className="relative grid grid-cols-1 items-center gap-6 md:grid-cols-[1.2fr_1fr] md:gap-12">
            <div className="min-w-0 space-y-5 md:space-y-6">
              <p className="inline-flex items-center gap-2 rounded-full bg-card px-4 py-1.5 text-sm font-medium text-primary shadow-[var(--shadow-soft)]">
                <PawPrint className="h-4 w-4" aria-hidden /> Red comunitaria de ayuda
              </p>
              <h1 className="text-balance font-display text-[2rem] leading-[1.08] text-primary sm:text-4xl md:text-6xl md:leading-[1.05]">
                Ayúdanos a traerlos de <span className="text-cta">vuelta a casa</span>
              </h1>
              <p className="max-w-xl text-base text-muted-foreground sm:text-lg">
                Publica el reporte de tu mascota o busca entre los casos de tu zona. Es gratis y lo ve toda la comunidad.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild variant="cta" size="lg" className="h-12 rounded-full px-7 text-base shadow-[var(--shadow-soft)]">
                  <Link href="/reportar">Reportar una mascota</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-12 rounded-full border-primary/30 bg-card px-7 text-base text-primary hover:bg-card/80">
                  <Link href="/reportar?tipo=encontrada">Encontré una mascota</Link>
                </Button>
              </div>
              <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-muted-foreground">
                {["Gratis", "Avisamos a tu zona", "Cartel listo para imprimir"].map((t) => (
                  <li key={t} className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-primary" aria-hidden /> {t}</li>
                ))}
              </ul>
            </div>
            <div className="relative order-first aspect-[16/10] md:order-none md:aspect-[4/5]">
              <div className="absolute inset-0 overflow-hidden rounded-[1.25rem] shadow-[var(--shadow-lift)] md:rounded-[2rem]">
                <Image src={STOCK.reencuentro.src} alt={STOCK.reencuentro.alt} fill priority quality={90} sizes="(min-width: 768px) 38vw, 100vw" className="object-cover object-[50%_35%] md:object-center" />
              </div>
              <div className="absolute -bottom-3 left-3 flex items-center gap-2 rounded-2xl bg-card px-3.5 py-2.5 text-sm font-semibold text-primary shadow-[var(--shadow-lift)] md:-left-6">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-800"><MapPinned className="h-4 w-4" aria-hidden /></span>
                Aviso a tu zona al instante
              </div>
            </div>
          </div>
        </div>

        {/* Buscador flotante */}
        <div className="relative z-10 -mt-9 px-2 sm:px-6 md:-mt-14 md:px-14">
          <div className="rounded-3xl border bg-card p-4 shadow-[var(--shadow-lift)] md:p-6">
            <p className="mb-3 text-sm font-semibold text-foreground">¿Buscas a tu mascota?</p>
            <PetFilters compact value={filters} onChange={setFilters} onSubmit={() => document.getElementById("resultados")?.scrollIntoView({ behavior: "smooth" })} />
          </div>
        </div>
      </section>

      {/* Accesos rápidos */}
      <section aria-label="Accesos rápidos" className="container mx-auto px-4 py-10">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ACTIONS.map((a, i) => (
            <Reveal as="li" key={a.href} delay={i * 0.06}>
              <Link href={a.href} className="group hover-lift block h-full rounded-3xl border bg-card p-5 shadow-[var(--shadow-soft)]">
                <span className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6 ${a.tone}`}><a.icon className="h-6 w-6" aria-hidden /></span>
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
                sourceName={pet.source_name}
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
      {adSlot}

      {/* Cómo funciona */}
      <section className="container mx-auto px-4 py-14">
        <h2 className="mb-8 text-center font-display text-3xl text-primary md:text-4xl">Cómo funciona</h2>
        <ol className="grid gap-4 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal as="li" key={s.t} delay={i * 0.06} className="hover-lift rounded-3xl border bg-card p-6 shadow-[var(--shadow-soft)]">
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
          <div className="group relative min-h-60 overflow-hidden">
            <Image src={STOCK.veterinarios.src} alt={STOCK.veterinarios.alt} fill sizes="(min-width: 768px) 50vw, 100vw" className="img-zoom object-cover" />
          </div>
          <div className="flex flex-col justify-center gap-4 p-8 md:p-12">
            <h2 className="font-display text-3xl leading-tight text-primary">Empresas y voluntarios que suman</h2>
            <p className="text-muted-foreground">Veterinarias, refugios, negocios y personas que ayudan a que más mascotas vuelvan a casa. Súmate o promociona tu negocio.</p>
            <div className="flex flex-wrap gap-3">
              <Button asChild className="rounded-full"><Link href="/aliados">Ser aliado</Link></Button>
              <Button asChild variant="outline" className="rounded-full"><Link href="/anuncios">Promocionar mi negocio</Link></Button>
            </div>
          </div>
        </div>
      </section>

      {/* Cierre */}
      <section className="container mx-auto px-4 pb-6">
        <div className="relative overflow-hidden rounded-[2rem] bg-primary px-6 py-12 text-center text-primary-foreground md:py-16">
          <div aria-hidden className="paws-white pointer-events-none absolute inset-0 opacity-[0.07]" />
          <h2 className="relative mx-auto max-w-2xl font-display text-3xl leading-tight md:text-4xl">¿Perdiste a tu mascota o encontraste una?</h2>
          <p className="relative mx-auto mt-3 max-w-xl text-primary-foreground/90">Cada minuto cuenta. Publica ahora y activa la red de tu zona.</p>
          <Button asChild variant="cta" size="lg" className="relative mt-6 rounded-full">
            <Link href="/reportar">Reportar una mascota</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
