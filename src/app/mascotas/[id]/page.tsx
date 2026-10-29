import { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
    MapPin,
    Calendar,
    Share2,
    Flag,
    Heart,
    ShieldCheck,
    Phone,
    Download,
    ChevronLeft,
    ChevronRight,
    Facebook,
    Twitter,
    MessageCircle,
    Clock,
    Instagram,
    Send,
    Mail,
    ChevronDown
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PetCard } from "@/components/pet-card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { PetDetailActions } from "@/components/pet-detail-actions"
import { createClient } from "@/utils/supabase/server"
import { Sighting } from "@/hooks/use-pets"
import { ReportActionButton } from "@/components/report-action-button"
import { SocialShare } from "@/components/social-share"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { SightingsMapWrapper } from "@/components/sightings-map-wrapper"
import { ImageGallery } from "@/components/image-gallery"
import { OwnerContactModal } from "@/components/owner-contact-modal"

export default async function PetPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    // 1. Fetch Pet Details with joined Sightings and Profiles
    const { data: pet, error } = await supabase
        .from('pets')
        .select(`
            *,
            profiles:owner_id (
                full_name,
                avatar_url,
                whatsapp,
                phone,
                phone_public
            ),
            sightings (
                *,
                reporter:reporter_id (
                    full_name,
                    avatar_url,
                    whatsapp,
                    phone,
                    email
                )
            )
        `)
        .eq('id', id)
        .single()

    if (error) {
        console.error('Error fetching pet details:', error)
        // If it's a "column does not exist" error, it's a migration issue
    }

    if (!pet) return notFound()

    // Sort sightings by date (most recent first)
    const dbSightings: Sighting[] = (pet.sightings || []).sort(
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
            full_name: pet.profiles?.full_name || "Dueño",
            avatar_url: pet.profiles?.avatar_url,
            whatsapp: pet.profiles?.whatsapp,
            phone: pet.profiles?.phone,
            phone_public: pet.profiles?.phone_public
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

    const gallery = pet.image_urls || []
    const firstImage = gallery[0] || "https://via.placeholder.com/800x600?text=Sin+Foto"

    return (
        <div className="min-h-screen bg-slate-50/50 pb-20">
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
                        <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-slate-100 space-y-8">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-black text-slate-900">Historial de avistamientos</h2>
                                <ReportActionButton
                                    nextUrl={`/mascotas/${pet.id}/avistamiento`}
                                    label="Reportar lugar de avistamiento"
                                    icon={<Send className="w-4 h-4 mr-2" />}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-6"
                                />
                            </div>

                            {sightings.length > 0 ? (
                                <div className="space-y-8 relative before:absolute before:left-7 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                                    {sightings.map((sighting) => (
                                        <div key={sighting.id} className="relative pl-16 group">
                                            {/* Avatar reporter */}
                                            <div className="absolute left-0 top-0 h-14 w-14 rounded-full border-4 border-white shadow-lg overflow-hidden bg-slate-100 z-10 group-hover:scale-105 transition-transform">
                                                <img
                                                    src={sighting.reporter?.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + sighting.reporter_id}
                                                    alt={sighting.reporter?.full_name}
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>

                                            <div className="bg-slate-50 p-6 rounded-[2rem] space-y-3 group-hover:bg-white group-hover:shadow-md transition-all border border-transparent group-hover:border-slate-100">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <div className="font-black text-slate-900 flex items-center gap-2">
                                                            {sighting.reporter?.full_name || "Usuario Anónimo"}
                                                            {sighting.id === 'initial' && <Badge variant="secondary" className="bg-red-50 text-red-600 border-0 text-[10px] uppercase font-black tracking-tighter">Punto Inicial</Badge>}
                                                        </div>
                                                        <div className="text-xs font-bold text-blue-500 uppercase tracking-widest">
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
                                                                className="h-9 w-9 rounded-xl text-blue-500 border-blue-100 hover:bg-blue-50"
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
                                                                className="h-9 w-9 rounded-xl text-slate-500 border-slate-100 hover:bg-slate-50"
                                                                asChild
                                                            >
                                                                <a href={`mailto:${sighting.reporter.email}?subject=Avistamiento de ${pet.name}`}>
                                                                    <Mail className="h-4 w-4" />
                                                                </a>
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                                <p className="text-slate-600 leading-relaxed font-medium">
                                                    "{sighting.description}"
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
                                                                className="h-32 w-auto rounded-xl object-cover border-2 border-slate-100 hover:scale-110 hover:shadow-lg transition-all duration-300 cursor-pointer"
                                                            />
                                                        </a>
                                                    </div>
                                                )}                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-10 text-center space-y-4 bg-slate-50/50 rounded-[2.5rem] border border-dashed border-slate-200">
                                    <div className="h-16 w-16 bg-white rounded-full shadow-sm flex items-center justify-center">
                                        <Clock className="h-8 w-8 text-slate-300" />
                                    </div>
                                    <div className="max-w-xs">
                                        <p className="font-bold text-slate-800">No hay avistamientos aún</p>
                                        <p className="text-sm text-slate-500">Ayuda a {pet.name} a volver a casa reportando si lo has visto.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar: Sticky Info Card */}
                    <div className="lg:col-span-5">
                        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden p-8 md:p-10 space-y-8 sticky top-6">
                            {/* Breadcrumb */}
                            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                                <Link href="/" className="hover:text-slate-700 transition-colors">Inicio</Link>
                                <ChevronRight className="h-3 w-3 opacity-50" />
                                <Link href="/mascotas" className="hover:text-slate-700 transition-colors">Mascotas</Link>
                                <ChevronRight className="h-3 w-3 opacity-50" />
                                <span>{pet.name}</span>
                            </div>

                            <div className="space-y-2">
                                <h1 className="text-5xl font-black text-slate-900 tracking-tighter">{pet.name}</h1>
                                <div className="flex items-center text-slate-500 gap-2 font-semibold">
                                    <MapPin className="h-5 w-5 text-red-400" />
                                    <span>{pet.last_seen_district}, {pet.last_seen_province}</span>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-2 pb-6 border-b border-slate-100">
                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Descripción</span>
                                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                                    {pet.description || "Sin descripción proporcionada."}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-5 bg-slate-50 rounded-3xl space-y-1">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Raza</span>
                                    <div className="font-bold text-slate-900 truncate">{pet.breed}</div>
                                </div>
                                <div className="p-5 bg-slate-50 rounded-3xl space-y-1">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Género</span>
                                    <div className="font-bold text-slate-900">{pet.gender || 'No espec.'}</div>
                                </div>
                                <div className="p-5 bg-slate-50 rounded-3xl space-y-1">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tamaño</span>
                                    <div className="font-bold text-slate-900">{pet.size || 'No espec.'}</div>
                                </div>
                                <div className="p-5 bg-slate-50 rounded-3xl space-y-1">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Color</span>
                                    <div className="font-bold text-slate-900 truncate">{pet.colors?.join(', ') || 'No espec.'}</div>
                                </div>
                            </div>

                            {/* Map Info Box */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-slate-800">Mapa de avistamientos</span>
                                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-0 font-bold">
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
                                    className="w-full h-16 text-xl font-black rounded-2xl shadow-2xl shadow-blue-500/30 bg-blue-600 hover:bg-blue-700 text-white border-0"
                                    size="lg"
                                />
                                <OwnerContactModal
                                    ownerName={pet.profiles?.full_name}
                                    phone={pet.profiles?.phone}
                                    whatsapp={pet.profiles?.whatsapp}
                                    email={pet.profiles?.email}
                                />
                                <Button variant="outline" className="w-full h-16 text-lg font-bold rounded-2xl border-2 border-slate-100 text-slate-600 hover:bg-slate-50" size="lg" asChild>
                                    <Link href={`/cartel?id=${pet.id}`}>
                                        <Download className="mr-3 h-5 w-5" /> Generar Cartel PDF
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Similar Pets Section */}
                {similarPets && similarPets.length > 0 && (
                    <div className="space-y-8 pt-12 border-t border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-red-50 rounded-2xl text-red-500 shadow-sm">
                                <Flag className="h-6 w-6" />
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Otras alertas en {pet.last_seen_district}</h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {similarPets.map(similar => (
                                <PetCard
                                    key={similar.id}
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
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Floating Share Button */}
            <SocialShare petName={pet.name} petId={pet.id} variant="floating" />
        </div>
    )
}
