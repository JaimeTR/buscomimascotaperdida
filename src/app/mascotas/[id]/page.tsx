
import Link from "next/link"
import { notFound } from "next/navigation"
import { Calendar, ChevronRight, Download, Flag, MapPin, Megaphone, Star, Rocket, Pencil, PartyPopper, Ruler, ShieldAlert, Tag, UserRound, VenusAndMars, Cake, Cpu, Palette, PawPrint, Dog } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

import { Button } from "@/components/ui/button"
import { PetCard } from "@/components/pet-card"
import { StatusBadge } from "@/components/status-badge"
import { createClient } from "@/utils/supabase/server"
import { Sighting } from "@/hooks/use-pets"
import { ReportActionButton } from "@/components/report-action-button"
import { SocialShare } from "@/components/social-share"
import { districtCenter } from "@/lib/district-coords"
import { SightingsMapWrapper } from "@/components/sightings-map-wrapper"
import { PetGallery } from "@/components/pet/pet-gallery"
import { ContactCard } from "@/components/pet/contact-card"
import { SightingTimeline } from "@/components/pet/sighting-timeline"
import { Reveal } from "@/components/ui/reveal"
import { OpenFormButton } from "@/components/ui/form-dialog"
import { BoostDialog } from "@/components/boost/boost-dialog"
import { getFeaturedPets } from "@/lib/featured"
import { AdSlot } from "@/components/ads/ad-slot"
import { matchScore } from "@/lib/matches"

import type { Metadata } from "next"
import { createPublicClient } from "@/utils/supabase/public"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params
    const { data: pet } = await createPublicClient().from('pets')
        .select('name, type, breed, status, last_seen_district, last_seen_province, last_seen_date, colors, image_urls').eq('id', id).eq('is_hidden', false).maybeSingle()
    if (!pet) return {}
    const kind = pet.type === 'cat' ? 'Gato' : pet.type === 'dog' ? 'Perro' : 'Mascota'
    const title = `${pet.status === 'found' ? 'Encontrado' : 'Perdido'}: ${pet.name ?? kind}${pet.last_seen_district ? ` en ${pet.last_seen_district}` : ''}`
    const where = [pet.last_seen_district, pet.last_seen_province].filter(Boolean).join(', ')
    const when = pet.last_seen_date ? new Date(pet.last_seen_date).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' }) : ''
    const description = `${kind}${pet.breed ? ` ${pet.breed}` : ''}${pet.colors?.length ? ` de color ${pet.colors.join(', ')}` : ''}${pet.status === 'found' ? ' encontrado' : ' perdido'}${where ? ` en ${where}` : ''}${when ? ` el ${when}` : ''}. Ayúdanos a ${pet.status === 'found' ? 'encontrar a su dueño' : 'traerlo de vuelta a casa'}.`
    const images = [pet.image_urls?.[0] ?? `/mascotas/${id}/opengraph-image`]
    return { title, description, alternates: { canonical: `/mascotas/${id}` }, openGraph: { title, description, url: `/mascotas/${id}`, images }, twitter: { card: 'summary_large_image', title, description, images } }
}

const SWATCH: Record<string, string> = {
    blanco: "#ffffff", negro: "#1c1917", marrón: "#78492a", dorado: "#d9a441", gris: "#9ca3af", naranja: "#f08a24", beige: "#e8d5b5", crema: "#f3e8cf", caramelo: "#b8742f",
    atigrado: "repeating-linear-gradient(45deg, #78492a 0 4px, #d9a441 4px 8px)", manchado: "radial-gradient(circle at 30% 30%, #1c1917 0 22%, transparent 24%), #fff", plomo: "#6b7280",
}
const TYPE_LABEL: Record<string, string> = { dog: "Perro", cat: "Gato", other: "Otra mascota" }
const dateFmt = new Intl.DateTimeFormat("es-PE", { day: "numeric", month: "long", year: "numeric" })

function Fact({ icon: Icon, label, children }: { icon: typeof Tag; label: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-col items-center gap-2 rounded-2xl bg-background p-3.5 text-center sm:flex-row sm:items-start sm:gap-3 sm:text-left">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground"><Icon className="h-4 w-4" aria-hidden /></span>
            <div className="min-w-0"><p className="text-xs font-semibold text-muted-foreground">{label}</p><div className="font-semibold">{children}</div></div>
        </div>
    )
}

export default async function PetPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    // 1. Reporte + contacto. El contacto (teléfono/WhatsApp/correo) solo sale si su dueño
    // lo marcó público; lo decide la función SQL, nunca el navegador.
    const { data: pet, error } = await supabase.from('pets').select('*').eq('id', id).single()
    if (error) console.error('Error fetching pet details:', error.code)

    if (!pet) return notFound()

    const { data: { user } } = await supabase.auth.getUser()
    const isOwner = !!user && user.id === pet.owner_id

    const { data: extras } = await supabase.rpc('pet_contact_info', { p_pet: id })
    const owner: { full_name?: string; avatar_url?: string; phone?: string; whatsapp?: string; email?: string } = extras?.owner ?? {}
    const hasPublicContact = Boolean(owner.phone || owner.whatsapp || owner.email)

    // Avistamientos del más reciente al más antiguo
    const dbSightings: Sighting[] = (extras?.sightings ?? []).sort(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    // El extravío inicial es el primer evento: va al final de la línea de tiempo
    const initialSighting: Sighting = {
        id: 'initial',
        pet_id: pet.id,
        reporter_id: pet.owner_id,
        lat: pet.last_seen_lat,
        lng: pet.last_seen_lng,
        district: pet.last_seen_district,
        description: `Punto inicial de extravío: ${pet.last_seen_address || pet.last_seen_district}`,
        created_at: pet.last_seen_date,
        reporter: { full_name: owner.full_name || "Dueño", avatar_url: owner.avatar_url ?? "" },
    }
    const sightings = [...dbSightings, initialSighting]

    // 2. Otros casos de la zona
    const { data: similarPets } = await supabase
        .from('pets')
        .select('*')
        .eq('type', pet.type)
        .eq('last_seen_district', pet.last_seen_district)
        .neq('id', id)
        .limit(4)

    // Posibles coincidencias: perdidos <-> encontrados de la misma especie, cercanos en fecha y zona.
    const { data: candidates } = await supabase
        .from('pets')
        .select('*')
        .eq('type', pet.type)
        .eq('status', pet.status === 'found' ? 'lost' : 'found')
        .eq('is_hidden', false)
        .order('last_seen_date', { ascending: false })
        .limit(100)
    const matches = (candidates ?? [])
        .map((c) => ({ pet: c, score: matchScore(pet, c) }))
        .filter((m) => m.score >= 50)
        .sort((a, b) => b.score - a.score)
        .slice(0, 4)

    const isFeatured = (await getFeaturedPets(50)).some((f) => f.id === pet.id)
    const found = pet.status === 'found'
    const reunited = pet.status === 'reunited'
    const kind = TYPE_LABEL[pet.type] ?? "Mascota"
    const lastSignal = new Date(sightings[0].created_at)
    const validSightings = sightings.filter(s => s.lat != null && s.lng != null)
    // Sin coordenadas exactas se usa el centro del distrito (zona aproximada) en vez de un punto fijo de Lima.
    const districtPos = districtCenter(pet.last_seen_district)
    const mapCenterLat = validSightings[0]?.lat || pet.last_seen_lat || districtPos?.[0] || -12.0464
    const mapCenterLng = validSightings[0]?.lng || pet.last_seen_lng || districtPos?.[1] || -77.0428
    const place = [pet.last_seen_district, pet.last_seen_province].filter(Boolean).join(", ")
    const colors: string[] = pet.colors ?? []

    // SEO/GEO: migas de pan + descripción de la página con su lugar (distrito/provincia).
    const site = process.env.NEXT_PUBLIC_APP_URL || 'https://buscomimascotaperdida.com'
    const jsonLd = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'BreadcrumbList',
                itemListElement: [
                    { '@type': 'ListItem', position: 1, name: 'Inicio', item: site },
                    { '@type': 'ListItem', position: 2, name: 'Mascotas', item: `${site}/mascotas` },
                    { '@type': 'ListItem', position: 3, name: pet.name ?? kind, item: `${site}/mascotas/${pet.id}` },
                ],
            },
            {
                '@type': 'WebPage',
                url: `${site}/mascotas/${pet.id}`,
                name: `${found ? 'Encontrado' : 'Perdido'}: ${pet.name ?? kind}`,
                inLanguage: 'es-PE',
                datePublished: pet.created_at,
                ...(pet.image_urls?.[0] ? { primaryImageOfPage: { '@type': 'ImageObject', url: pet.image_urls[0] } } : {}),
                contentLocation: {
                    '@type': 'Place',
                    name: place,
                    address: { '@type': 'PostalAddress', addressLocality: pet.last_seen_district, addressRegion: pet.last_seen_province, addressCountry: 'PE' },
                    ...(pet.last_seen_lat != null && pet.last_seen_lng != null ? { geo: { '@type': 'GeoCoordinates', latitude: pet.last_seen_lat, longitude: pet.last_seen_lng } } : {}),
                },
            },
        ],
    }

    return (
        <div className="min-h-screen pb-28 lg:pb-20">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
            <div className="container mx-auto max-w-7xl space-y-8 px-4 py-6 md:py-10">
                {isOwner && <BoostDialog petId={pet.id} />}

                {/* Encabezado del caso */}
                <header className="space-y-4">
                    <nav aria-label="Migas de pan" className="flex flex-wrap items-center justify-center gap-1.5 md:justify-start text-xs font-medium text-muted-foreground">
                        <Link href="/" className="hover:text-foreground">Inicio</Link><ChevronRight className="h-3 w-3 opacity-50" aria-hidden />
                        <Link href="/mascotas" className="hover:text-foreground">Mascotas</Link><ChevronRight className="h-3 w-3 opacity-50" aria-hidden />
                        <span className="text-foreground">{pet.name}</span>
                    </nav>
                    <div className="flex flex-wrap items-end justify-center gap-4 text-center md:justify-between md:text-left">
                        <div className="min-w-0 space-y-2">
                            <div className="flex flex-wrap items-center justify-center gap-3 md:justify-start">
                                <h1 className="font-display text-4xl leading-tight text-primary md:text-5xl">{pet.name}</h1>
                                <StatusBadge status={pet.status} className="px-3.5 py-1 text-xs" />
                                {isFeatured && <span className="inline-flex items-center gap-1 rounded-full bg-cta px-3 py-1 text-xs font-bold text-cta-foreground"><Star className="h-3.5 w-3.5 fill-current" aria-hidden /> Caso destacado</span>}
                            </div>
                            <p className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm font-medium text-muted-foreground md:justify-start">
                                <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4 text-cta" aria-hidden /> {place || "Zona no indicada"}</span>
                                <span className="inline-flex items-center gap-1.5"><Calendar className="h-4 w-4" aria-hidden /> {found ? "Encontrado" : "Visto por última vez"} {formatDistanceToNow(new Date(pet.last_seen_date), { addSuffix: true, locale: es })}</span>
                            </p>
                        </div>
                    </div>
                </header>

                <div className="grid gap-6 lg:grid-cols-12 lg:gap-x-10 lg:gap-y-8">
                    {/* Galería */}
                    <div className="lg:col-span-7"><PetGallery images={pet.image_urls || []} petName={pet.name} status={pet.status} /></div>

                    {/* Acciones (a la derecha en escritorio; debajo de la galería en móvil) */}
                    <aside className="space-y-5 lg:col-span-5 lg:row-span-3">
                        <div className="space-y-5 lg:sticky lg:top-20">
                            {isOwner && (
                                <div className="space-y-3 rounded-[1.5rem] border border-primary/30 bg-accent p-5">
                                    <p className="flex items-center justify-center gap-2 font-semibold text-accent-foreground lg:justify-start"><UserRound className="h-5 w-5" aria-hidden /> Este es tu reporte</p>
                                    {!hasPublicContact && (
                                        <p className="flex gap-2 rounded-xl bg-card p-3 text-sm text-muted-foreground"><ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-cta" aria-hidden /><span>Nadie puede contactarte directamente porque no muestras datos de contacto. Las personas te escribirán por avistamientos. <Link href="/panel/ajustes" className="font-semibold text-primary underline-offset-2 hover:underline">Elige qué datos mostrar</Link>.</span></p>
                                    )}
                                    <div className="flex flex-wrap justify-center gap-2 lg:justify-start">
                                        <Button asChild size="sm" className="rounded-full"><Link href={`/panel/reportes/${pet.id}/editar`}><Pencil className="mr-1.5 h-4 w-4" aria-hidden /> Editar</Link></Button>
                                        <OpenFormButton form="impulso" size="sm" variant="cta" className="rounded-full"><Rocket className="mr-1.5 h-4 w-4" aria-hidden /> Destacar mi caso</OpenFormButton>
                                        <Button asChild size="sm" variant="outline" className="rounded-full bg-card"><Link href="/panel/reportes">Mis reportes</Link></Button>
                                        <Button asChild size="sm" variant="outline" className="rounded-full bg-card"><Link href="/panel/ajustes">Datos de contacto</Link></Button>
                                    </div>
                                </div>
                            )}

                            {reunited && (
                                <div className="flex items-start gap-3 rounded-[1.5rem] border border-primary/30 bg-accent p-5 text-accent-foreground">
                                    <PartyPopper className="mt-0.5 h-6 w-6 shrink-0 text-primary" aria-hidden />
                                    <div><p className="font-semibold">¡{pet.name} ya volvió a casa!</p><p className="text-sm">Gracias a toda la comunidad. <Link href="/casos-de-exito" className="font-semibold text-primary underline-offset-2 hover:underline">Ver casos de éxito</Link></p></div>
                                </div>
                            )}

                            <div className="space-y-4 rounded-[1.5rem] border bg-card p-5 shadow-[var(--shadow-lift)] sm:rounded-[2rem] sm:p-7">
                                {!reunited && (
                                    <div className="space-y-1 text-center lg:text-left">
                                        <h2 className="font-display text-2xl text-primary">{found ? "¿Es tu mascota?" : `¿Viste a ${pet.name}?`}</h2>
                                        <p className="text-sm text-muted-foreground">{found ? "Escríbele a quien la encontró o reporta un dato que ayude." : "Cualquier dato ayuda: dónde y a qué hora."}</p>
                                    </div>
                                )}
                                {!reunited && (
                                    <ReportActionButton
                                        nextUrl={`/mascotas/${pet.id}/avistamiento`}
                                        label="Reportar avistamiento"
                                        icon={<MapPin className="mr-2 h-5 w-5" aria-hidden />}
                                        variant="cta"
                                        size="lg"
                                        className="h-14 w-full rounded-full text-base"
                                    />
                                )}

                                {pet.source_url ? (
                                    <div className="space-y-3 rounded-2xl border bg-background p-4 text-sm">
                                        <p className="font-semibold">Información tomada de {pet.source_name || "una fuente externa"}</p>
                                        <p className="text-muted-foreground">Este caso lo publicamos nosotros a partir de esa fuente. Los datos de contacto están en la publicación original.</p>
                                        <a href={pet.source_url} target="_blank" rel="noopener noreferrer nofollow" className="inline-block font-bold text-primary hover:underline">Ver fuente: {pet.source_name || "enlace original"}</a>
                                        <div className="rounded-xl bg-accent p-3 text-accent-foreground">
                                            <p className="font-semibold">¿Es tu mascota?</p>
                                            <p className="mt-0.5">Crea tu cuenta y dale seguimiento a la búsqueda: sube fotos, recibe avisos de avistamientos y actualiza el caso.</p>
                                            <Link href="/registro" className="mt-2 inline-block font-bold underline">Crear mi cuenta</Link>
                                        </div>
                                    </div>
                                ) : !isOwner && (
                                    <ContactCard petId={pet.id} petName={pet.name} ownerName={owner.full_name} found={found} phone={owner.phone} whatsapp={owner.whatsapp} email={owner.email} />
                                )}

                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                                    <SocialShare petName={pet.name} variant="button" text={found ? `Encontramos a ${pet.name}. ¿Es tu mascota? Comparte para ayudar a encontrar a su familia 🐾` : undefined} />
                                    <Button asChild variant="outline" className="h-12 w-full rounded-full border-2 text-base"><Link href={`/cartel/${pet.id}`}><Download className="mr-2 h-5 w-5" aria-hidden /> Generar cartel</Link></Button>
                                </div>
                            </div>

                            <div className="flex flex-col items-center gap-3 rounded-2xl border bg-card p-4 text-center text-sm sm:flex-row sm:text-left">
                                <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent font-bold text-primary">
                                    {owner.avatar_url
                                        ? <img src={owner.avatar_url} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                                        : (owner.full_name || "?").charAt(0).toUpperCase()}
                                </span>
                                <div className="min-w-0">
                                    <p className="text-xs text-muted-foreground">{found ? "Encontrado y publicado por" : "Reportado por"}</p>
                                    <p className="truncate font-semibold">{owner.full_name || (pet.source_name ? `Fuente: ${pet.source_name}` : "Usuario de la comunidad")}</p>
                                    <p className="text-xs text-muted-foreground">Publicado el {dateFmt.format(new Date(pet.created_at))}</p>
                                </div>
                            </div>

                            <AdSlot placement="detail_sidebar" variant="side" />
                        </div>
                    </aside>

                    {/* Detalle, mapa, historial */}
                    <div className="space-y-6 lg:col-span-7">
                        <section aria-labelledby="h-sobre" className="space-y-5 rounded-[1.5rem] border bg-card p-5 shadow-[var(--shadow-soft)] sm:rounded-[2rem] sm:p-8">
                            <h2 id="h-sobre" className="text-center font-display text-2xl text-primary sm:text-left sm:text-3xl">Sobre {pet.name}</h2>
                            <p className="whitespace-pre-wrap text-center leading-relaxed text-foreground/90 sm:text-left">{pet.description || "Sin descripción proporcionada."}</p>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <Fact icon={Dog} label="Tipo">{kind}</Fact>
                                <Fact icon={PawPrint} label="Raza"><span className="truncate">{pet.breed || "No especificada"}</span></Fact>
                                <Fact icon={VenusAndMars} label="Género">{pet.gender || "No especificado"}</Fact>
                                <Fact icon={Ruler} label="Tamaño">{pet.size || "No especificado"}</Fact>
                                {pet.age && <Fact icon={Cake} label="Edad">{pet.age}</Fact>}
                                {pet.microchip && <Fact icon={Cpu} label="Microchip">Sí tiene</Fact>}
                                <Fact icon={Palette} label="Colores">
                                    {colors.length ? (
                                        <span className="flex flex-wrap justify-center gap-x-3 gap-y-1 sm:justify-start">
                                            {colors.map((c) => (
                                                <span key={c} className="inline-flex items-center gap-1.5 text-sm">
                                                    <span className="h-3.5 w-3.5 rounded-full border border-stone-300" style={{ background: SWATCH[c.toLowerCase()] ?? "#cbd5e0" }} aria-hidden /> {c}
                                                </span>
                                            ))}
                                        </span>
                                    ) : "No especificado"}
                                </Fact>
                            </div>

                            {(pet.markings || pet.personality?.length > 0) && (
                                <div className="space-y-3 border-t pt-4">
                                    {pet.markings && <p className="text-sm"><span className="font-semibold">Señas particulares:</span> <span className="text-muted-foreground">{pet.markings}</span></p>}
                                    {pet.personality?.length > 0 && (
                                        <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
                                            {pet.personality.map((t: string) => <span key={t} className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">{t}</span>)}
                                        </div>
                                    )}
                                </div>
                            )}
                        </section>

                        <section aria-labelledby="h-mapa" className="space-y-4 rounded-[1.5rem] border bg-card p-5 shadow-[var(--shadow-soft)] sm:rounded-[2rem] sm:p-8">
                            <div className="flex flex-col items-center justify-between gap-2 text-center sm:flex-row sm:text-left">
                                <h2 id="h-mapa" className="font-display text-2xl text-primary sm:text-3xl">Mapa de avistamientos</h2>
                                <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">Última señal: {dateFmt.format(lastSignal)}</span>
                            </div>
                            <div className="h-72 w-full overflow-hidden rounded-2xl border sm:h-96">
                                <SightingsMapWrapper
                                    initialLat={mapCenterLat}
                                    initialLng={mapCenterLng}
                                    zoom={validSightings.length || pet.last_seen_lat ? 16 : 14}
                                    sightings={validSightings.map(s => ({
                                        id: s.id,
                                        lat: s.lat as number,
                                        lng: s.lng as number,
                                        description: s.description,
                                        createdAt: s.created_at,
                                        reporterName: s.reporter?.full_name
                                    }))}
                                    className="h-full w-full"
                                />
                            </div>
                        </section>

                        <SightingTimeline sightings={sightings} petId={pet.id} petName={pet.name} />

                        {!reunited && (
                            <section aria-labelledby="h-ves" className="space-y-4 rounded-[1.5rem] border bg-accent p-5 sm:rounded-[2rem] sm:p-8">
                                <h2 id="h-ves" className="flex items-center justify-center gap-2 text-center font-display sm:justify-start sm:text-left text-2xl text-primary"><Megaphone className="h-6 w-6" aria-hidden /> {found ? "Si crees que es tu mascota" : `Si ves a ${pet.name}`}</h2>
                                <ol className="space-y-2 text-sm text-accent-foreground">
                                    {(found
                                        ? ["Mira bien las fotos y los datos del reporte.", "Escribe a quien la encontró con una foto tuya de ella.", "Preparen un punto de encuentro seguro y público.", "Si ya es tuya, marca el caso como reunido desde tu cuenta."]
                                        : ["No lo persigas: acércate despacio y háblale con calma.", "Toma una foto o video desde lejos si puedes.", "Reporta el avistamiento con el lugar exacto y la hora.", "Si lo logras resguardar, llévalo a una veterinaria para revisar si tiene microchip."]
                                    ).map((t, i) => <li key={t} className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-card text-xs font-bold text-primary">{i + 1}</span> {t}</li>)}
                                </ol>
                            </section>
                        )}
                    </div>
                </div>

                {matches.length > 0 && (
                    <section className="space-y-6 border-t pt-10">
                        <h2 className="text-center font-display text-3xl text-primary sm:text-left">Posibles coincidencias con {found ? 'mascotas perdidas' : 'mascotas encontradas'}</h2>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {matches.map(({ pet: m }, i) => (
                                <Reveal key={m.id} delay={i * 0.05}>
                                    <PetCard id={m.id} name={m.name} type={m.type} breed={m.breed} district={m.last_seen_district} province={m.last_seen_province} colors={m.colors} imageUrl={m.image_urls?.[0]} status={m.status} lostDate={m.last_seen_date} timeLeft="Reciente" />
                                </Reveal>
                            ))}
                        </div>
                    </section>
                )}

                {similarPets && similarPets.length > 0 && (
                    <section className="space-y-6 border-t pt-10">
                        <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left">
                            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-primary"><Flag className="h-5 w-5" aria-hidden /></span>
                            <h2 className="font-display text-3xl text-primary">Otras alertas en {pet.last_seen_district}</h2>
                        </div>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {similarPets.map((similar, i) => (
                                <Reveal key={similar.id} delay={i * 0.05}>
                                    <PetCard id={similar.id} name={similar.name} type={similar.type} breed={similar.breed} district={similar.last_seen_district} province={similar.last_seen_province} colors={similar.colors} imageUrl={similar.image_urls?.[0]} status={similar.status} lostDate={similar.last_seen_date} timeLeft="Reciente" />
                                </Reveal>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    )
}
