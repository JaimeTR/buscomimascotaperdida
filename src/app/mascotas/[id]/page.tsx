
import Link from "next/link"
import { notFound } from "next/navigation"
import { MapPin, Flag, Phone, Download, ChevronRight, MessageCircle, Clock, Send, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PetCard } from "@/components/pet-card"
import { createClient } from "@/utils/supabase/server"
import { Sighting } from "@/hooks/use-pets"
import { ReportActionButton } from "@/components/report-action-button"
import { SocialShare } from "@/components/social-share"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { SightingsMapWrapper } from "@/components/sightings-map-wrapper"
import { ImageGallery } from "@/components/image-gallery"
import { OwnerContactModal } from "@/components/owner-contact-modal"
import { Reveal } from "@/components/ui/reveal"
import { AdSlot } from "@/components/ads/ad-slot"

export default async function PetPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    // 1. Reporte + contacto. El contacto (teléfono/WhatsApp/correo) solo sale si su dueño
    // lo marcó público; lo decide la función SQL, nunca el navegador.
    const { data: pet, error } = await supabase.from('pets').select('*').eq('id', id).single()
    if (error) console.error('Error fetching pet details:', error.code)

    if (!pet) return notFound()

    const { data: extras } = await supabase.rpc('pet_contact_info', { p_pet: id })
    const owner: { full_name?: string; avatar_url?: string; phone?: string; whatsapp?: string; email?: string } = extras?.owner ?? {}

    // Sort sightings by date (most recent first)
    const dbSightings: Sighting[] = (extras?.sightings ?? []).sort(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    // Add initial loss as a special "sighting" at the end (it's the first event)
    const initialSighting: Sighting = {
        id: 'initial',
        pet_id: pet.id,
        reporter_id: pet.owner_id,
        lat: pet.last_seen_lat,
        lng: pet.last_seen_lng,
        district: pet.last_seen_district,
        description: `Punto inicial de extravío: ${pet.last_seen_address || pet.last_seen_district}`,
        created_at: pet.last_seen_date,
        reporter: {
            full_name: owner.full_name || "Dueño",
            avatar_url: owner.avatar_url ?? "",
            whatsapp: owner.whatsapp,
            phone: owner.phone,
            phone_public: !!owner.phone
        }
    }

    const sightings = [...dbSightings, initialSighting]

    // 2. Fetch Similar Pets (same district or type)
    const { data: similarPets } = await supabase
        .from('pets')
        .select('*')
        .eq('type', pet.type)
        .eq('last_seen_district', pet.last_seen_district)
        .neq('id', id)
        .limit(4)

    // Format date: "12 de Octubre"
    const dateObj = new Date(pet.last_seen_date)
    const formattedDate = dateObj.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })

    const lastSightingDateStr = sightings.length > 0
        ? new Date(sightings[0].created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
        : formattedDate

    // Filter valid sightings for the map
    const validSightings = sightings.filter(s => s.lat != null && s.lng != null)
    const mapCenterLat = validSightings[0]?.lat || pet.last_seen_lat || -12.0464
    const mapCenterLng = validSightings[0]?.lng || pet.last_seen_lng || -77.0428

    return (
        <div className="min-h-screen bg-background pb-20">
            <div className="container px-4 py-8 md:py-12 max-w-7xl mx-auto space-y-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

                    {/* Left Column: Gallery & Description */}
                    <div className="lg:col-span-7 space-y-8">
                        {/* Image Gallery */}
                        <ImageGallery
                            images={pet.image_urls || []}
                            petName={pet.name}
                            status={pet.status}
                        />



                        {/* Recent Sightings Section */}
                        <div className="bg-card rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-border space-y-8">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-foreground">Historial de avistamientos</h2>
                                <ReportActionButton
                                    nextUrl={`/mascotas/${pet.id}/avistamiento`}
                                    label="Reportar lugar de avistamiento"
                                    icon={<Send className="w-4 h-4 mr-2" />}
                                    className="bg-primary hover:bg-primary text-white font-bold rounded-xl px-6"
                                />
                            </div>

                            {sightings.length > 0 ? (
                                <div className="space-y-8 relative before:absolute before:left-7 before:top-2 before:bottom-2 before:w-0.5 before:bg-secondary">
                                    {sightings.map((sighting) => (
                                        <div key={sighting.id} className="relative pl-16 group">
                                            {/* Avatar reporter */}
                                            <div className="absolute left-0 top-0 h-14 w-14 rounded-full border-4 border-white shadow-lg overflow-hidden bg-secondary z-10 group-hover:scale-105 transition-transform">
                                                {sighting.reporter?.avatar_url ? (
                                                    <img src={sighting.reporter.avatar_url} alt={sighting.reporter.full_name} className="h-full w-full object-cover" />
                                                ) : (
                                                    <span className="flex h-full w-full items-center justify-center bg-accent text-lg font-bold text-primary" aria-hidden>{(sighting.reporter?.full_name || "?").charAt(0).toUpperCase()}</span>
                                                )}
                                            </div>

                                            <div className="bg-background p-6 rounded-[2rem] space-y-3 group-hover:bg-card group-hover:shadow-md transition-all border border-transparent group-hover:border-border">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <div className="font-bold text-foreground flex items-center gap-2">
                                                            {sighting.reporter?.full_name || "Usuario Anónimo"}
                                                            {sighting.id === 'initial' && <Badge variant="secondary" className="bg-red-50 text-red-600 border-0 text-[10px] uppercase font-bold tracking-tight">Punto Inicial</Badge>}
                                                        </div>
                                                        <div className="text-xs font-bold text-primary uppercase tracking-widest">
                                                            {sighting.id === 'initial' ? "Última vez visto" : `Visto en ${sighting.district}`} • {formatDistanceToNow(new Date(sighting.created_at), { addSuffix: true, locale: es })}
                                                        </div>
                                                    </div>

                                                    {/* Contact Options - Show based on sighting sharing preferences */}
                                                    <div className="flex gap-2">
                                                        {sighting.share_whatsapp && sighting.reporter?.whatsapp && (
                                                            <Button
                                                                size="icon"
                                                                variant="outline"
                                                                className="h-9 w-9 rounded-xl text-emerald-500 border-emerald-100 hover:bg-emerald-50"
                                                                asChild
                                                            >
                                                                <a href={`https://wa.me/${sighting.reporter.whatsapp}?text=Hola, te contacto por el avistamiento de ${pet.name}`} target="_blank" rel="noopener noreferrer">
                                                                    <MessageCircle className="h-4 w-4 fill-current" />
                                                                </a>
                                                            </Button>
                                                        )}
                                                        {sighting.share_phone && sighting.reporter?.phone && (
                                                            <Button
                                                                size="icon"
                                                                variant="outline"
                                                                className="h-9 w-9 rounded-xl text-primary border-teal-100 hover:bg-accent"
                                                                asChild
                                                            >
                                                                <a href={`tel:${sighting.reporter.phone}`}>
                                                                    <Phone className="h-4 w-4 fill-current" />
                                                                </a>
                                                            </Button>
                                                        )}
                                                        {sighting.share_email && sighting.reporter?.email && (
                                                            <Button
                                                                size="icon"
                                                                variant="outline"
                                                                className="h-9 w-9 rounded-xl text-muted-foreground border-border hover:bg-background"
                                                                asChild
                                                            >
                                                                <a href={`mailto:${sighting.reporter.email}?subject=Avistamiento de ${pet.name}`}>
                                                                    <Mail className="h-4 w-4" />
                                                                </a>
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                                <p className="text-muted-foreground leading-relaxed font-medium">
                                                    &quot;{sighting.description}&quot;
                                                </p>

                                                {/* Sighting Image */}
                                                {sighting.image_url && (
                                                    <div className="mt-4">
                                                        <a
                                                            href={sighting.image_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="block w-fit"
                                                        >
                                                            <img
                                                                src={sighting.image_url}
                                                                alt="Foto del avistamiento"
                                                                className="h-32 w-auto rounded-xl object-cover border-2 border-border hover:scale-110 hover:shadow-lg transition-all duration-300 cursor-pointer"
                                                            />
                                                        </a>
                                                    </div>
                                                )}                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-10 text-center space-y-4 bg-background rounded-[2.5rem] border border-dashed border-border">
                                    <div className="h-16 w-16 bg-card rounded-full shadow-sm flex items-center justify-center">
                                        <Clock className="h-8 w-8 text-stone-300" />
                                    </div>
                                    <div className="max-w-xs">
                                        <p className="font-bold text-foreground">No hay avistamientos aún</p>
                                        <p className="text-sm text-muted-foreground">Ayuda a {pet.name} a volver a casa reportando si lo has visto.</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Qué hacer si lo ves */}
                        <div className="rounded-[2.5rem] border bg-accent p-8 md:p-10 space-y-4">
                            <h2 className="font-display text-2xl uppercase tracking-wide text-primary">Si ves a {pet.name}</h2>
                            <ul className="space-y-2 text-sm text-accent-foreground">
                                <li>1. No lo persigas: acércate despacio y háblale con calma.</li>
                                <li>2. Toma una foto o video desde lejos si puedes.</li>
                                <li>3. Reporta el avistamiento con el lugar exacto y la hora.</li>
                                <li>4. Si lo logras resguardar, llévalo a una veterinaria para revisar si tiene microchip.</li>
                            </ul>
                        </div>
                    </div>

                    {/* Sidebar: Sticky Info Card */}
                    <div className="lg:col-span-5">
                        <div className="bg-card rounded-[2.5rem] shadow-2xl border border-border overflow-hidden p-8 md:p-10 space-y-8 sticky top-6">
                            {/* Breadcrumb */}
                            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                                <Link href="/" className="hover:text-foreground transition-colors">Inicio</Link>
                                <ChevronRight className="h-3 w-3 opacity-50" />
                                <Link href="/mascotas" className="hover:text-foreground transition-colors">Mascotas</Link>
                                <ChevronRight className="h-3 w-3 opacity-50" />
                                <span>{pet.name}</span>
                            </div>

                            <div className="space-y-2">
                                <h1 className="font-display text-4xl md:text-5xl uppercase tracking-wide text-primary">{pet.name}</h1>
                                <div className="flex items-center text-muted-foreground gap-2 font-semibold">
                                    <MapPin className="h-5 w-5 text-red-400" />
                                    <span>{pet.last_seen_district}, {pet.last_seen_province}</span>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-2 pb-6 border-b border-border">
                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Descripción</span>
                                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                    {pet.description || "Sin descripción proporcionada."}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-5 bg-background rounded-3xl space-y-1">
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Raza</span>
                                    <div className="font-bold text-foreground truncate">{pet.breed}</div>
                                </div>
                                <div className="p-5 bg-background rounded-3xl space-y-1">
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Género</span>
                                    <div className="font-bold text-foreground">{pet.gender || 'No espec.'}</div>
                                </div>
                                <div className="p-5 bg-background rounded-3xl space-y-1">
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Tamaño</span>
                                    <div className="font-bold text-foreground">{pet.size || 'No espec.'}</div>
                                </div>
                                <div className="p-5 bg-background rounded-3xl space-y-1">
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Color</span>
                                    <div className="font-bold text-foreground truncate">{pet.colors?.join(', ') || 'No espec.'}</div>
                                </div>
                            </div>

                            {/* Map Info Box */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-foreground">Mapa de avistamientos</span>
                                    <Badge variant="secondary" className="bg-accent text-primary border-0 font-bold">
                                        Última señal: {lastSightingDateStr}
                                    </Badge>
                                </div>

                                <div className="h-64 w-full border-4 border-white shadow-2xl rounded-[2.5rem] overflow-hidden">
                                    <SightingsMapWrapper
                                        initialLat={mapCenterLat}
                                        initialLng={mapCenterLng}
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
                            </div>

                            <div className="space-y-4 pt-4">
                                <ReportActionButton
                                    nextUrl={`/mascotas/${pet.id}/avistamiento`}
                                    label="Reportar avistamiento"
                                    icon={<MapPin className="mr-3 h-6 w-6" />}
                                    className="w-full h-16 text-xl font-bold rounded-2xl shadow-2xl shadow-teal-700/30 bg-primary hover:bg-primary text-white border-0"
                                    size="lg"
                                />
                                {pet.source_url ? (
                                    <div className="rounded-2xl border bg-card p-4 text-sm">
                                        <p className="font-semibold">Caso publicado desde una fuente externa</p>
                                        <p className="mt-1 text-muted-foreground">
                                            La información de contacto está en la publicación original.
                                        </p>
                                        <a href={pet.source_url} target="_blank" rel="noopener noreferrer nofollow" className="mt-2 inline-block font-bold text-primary hover:underline">
                                            Ver fuente: {pet.source_name || "enlace original"}
                                        </a>
                                    </div>
                                ) : (
                                                                    <OwnerContactModal
                                        ownerName={owner.full_name}
                                        phone={owner.phone}
                                        whatsapp={owner.whatsapp}
                                        email={owner.email}
                                    />
                                )}
                                <Button variant="outline" className="w-full h-16 text-lg font-bold rounded-2xl border-2 border-border text-muted-foreground hover:bg-background" size="lg" asChild>
                                    <Link href={`/cartel?id=${pet.id}`}>
                                        <Download className="mr-3 h-5 w-5" /> Generar Cartel PDF
                                    </Link>
                                </Button>
                                <AdSlot placement="detail_sidebar" variant="side" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Similar Pets Section */}
                {similarPets && similarPets.length > 0 && (
                    <div className="space-y-8 pt-12 border-t border-border">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-red-50 rounded-2xl text-red-500 shadow-sm">
                                <Flag className="h-6 w-6" />
                            </div>
                            <h2 className="text-3xl font-bold text-foreground tracking-tight">Otras alertas en {pet.last_seen_district}</h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {similarPets.map((similar, i) => (
                                <Reveal key={similar.id} delay={i * 0.05}>
                                <PetCard
                                    id={similar.id}
                                    name={similar.name}
                                    type={similar.type}
                                    breed={similar.breed}
                                    district={similar.last_seen_district}
                                    province={similar.last_seen_province}
                                    colors={similar.colors}
                                    imageUrl={similar.image_urls?.[0]}
                                    status={similar.status}
                                    lostDate={similar.last_seen_date}
                                    timeLeft="Reciente"
                                />
                                </Reveal>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Floating Share Button */}
            <SocialShare petName={pet.name} variant="floating" />
        </div>
    )
}
