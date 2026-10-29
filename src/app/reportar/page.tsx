"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
    ArrowLeft,
    ArrowRight,
    Camera,
    MapPin,
    Search,
    AlertTriangle,
    HandHeart,
    Loader2,
    Plus,
    X,
    Dog,
    Cat,
    Squirrel,
    ChevronDown,
    Palette,
    PawPrint,
    Trash2,
    CheckCircle2,
    ImagePlus
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/utils/supabase/client"
import { useToast } from "@/components/ui/toast-modern"
import { LocationPopover } from "@/components/location-popover"
import { BreedPopover } from "@/components/breed-popover"
import { ColorPopover } from "@/components/color-popover"
import { LocationMap } from "@/components/location-map"
import { CompleteProfileDialog } from "@/components/auth/complete-profile-dialog"
import { getImageUploadError } from "@/lib/image-upload"

export default function ReportPage() {
    const router = useRouter()
    const supabase = createClient()
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [userId, setUserId] = useState<string | null>(null)
    const [profile, setProfile] = useState<{ id: string, phone?: string | null, department?: string | null, district?: string | null } | null>(null)
    const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false)

    // Form State
    const [name, setName] = useState("")
    const [type, setType] = useState("dog")
    const [breed, setBreed] = useState("")
    const [gender, setGender] = useState("")
    const [size, setSize] = useState("")
    const [selectedColors, setSelectedColors] = useState<string[]>([])
    const [description, setDescription] = useState("")

    // Location State
    const [location, setLocation] = useState({
        department: "",
        province: "",
        district: "",
        address: "",
        lat: undefined as number | undefined,
        lng: undefined as number | undefined
    })

    // Images State
    const [images, setImages] = useState<{ file: File | null, url: string, isMain: boolean }[]>([])

    // Auth Protection
    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                router.push("/login?next=/reportar")
            } else {
                setUserId(session.user.id)
                const { data: currentProfile, error } = await supabase
                    .from("profiles")
                    .select("id, phone, department, district")
                    .eq("id", session.user.id)
                    .maybeSingle()

                if (error) {
                    console.error("Error fetching profile:", error)
                    toast("No pudimos cargar tu perfil.", { type: "error" })
                }

                setProfile(currentProfile || { id: session.user.id })
                setIsLoading(false)
            }
        }
        checkSession()
    }, [router, supabase])

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files)
            const invalidFile = newFiles.find(file => getImageUploadError(file))
            if (invalidFile) {
                toast(getImageUploadError(invalidFile)!, { type: "error" })
                e.target.value = ""
                return
            }
            const newImages = newFiles.map(file => ({
                file,
                url: URL.createObjectURL(file),
                isMain: images.length === 0 // First image is main by default
            }))
            setImages(prev => [...prev, ...newImages])
        }
    }

    const setMainImage = (index: number) => {
        setImages(prev => prev.map((img, i) => ({ ...img, isMain: i === index })))
    }

    const removeImage = (index: number) => {
        setImages(prev => {
            const updated = prev.filter((_, i) => i !== index)
            // Ensure at least one is main if there are images left
            if (updated.length > 0 && !updated.some(img => img.isMain)) {
                updated[0].isMain = true
            }
            return updated
        })
    }

    const handleSubmit = async () => {
        if (!userId) return

        if (!profile?.phone?.trim() || !profile.department?.trim() || !profile.district?.trim()) {
            setIsProfileDialogOpen(true)
            return
        }

        // Validation
        if (!name || !type || !location.district || images.length === 0) {
            toast("Nombre, tipo, ubicación y al menos una foto son obligatorios", { type: "error" })
            return
        }

        setIsSubmitting(true)

        try {
            // 1. Upload images to Supabase Storage
            const uploadedUrls: string[] = []

            for (let i = 0; i < images.length; i++) {
                const img = images[i]
                if (img.file) {
                    const imageError = getImageUploadError(img.file)
                    if (imageError) throw new Error(imageError)
                    // Generate unique filename
                    const fileExt = img.file.name.split('.').pop()
                    const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

                    // Upload to Supabase Storage
                    const { data: uploadData, error: uploadError } = await supabase.storage
                        .from('pet-images')
                        .upload(fileName, img.file, {
                            cacheControl: '3600',
                            upsert: false
                        })

                    if (uploadError) {
                        console.error('Error uploading image:', uploadError)
                        throw new Error(`Error al subir la imagen ${i + 1}: ${uploadError.message}`)
                    }

                    // Get public URL
                    const { data: { publicUrl } } = supabase.storage
                        .from('pet-images')
                        .getPublicUrl(uploadData.path)

                    uploadedUrls.push(publicUrl)
                } else {
                    // If it's already a URL (shouldn't happen in normal flow)
                    uploadedUrls.push(img.url)
                }
            }

            // 2. Reorder so main image is first
            const mainImageIndex = images.findIndex(img => img.isMain)
            const finalImageUrls = [
                uploadedUrls[mainImageIndex],
                ...uploadedUrls.filter((_, i) => i !== mainImageIndex)
            ]

            // 3. Insert pet record with ordered images
            const { data: insertedPet, error } = await supabase
                .from('pets')
                .insert({
                    owner_id: userId,
                    name,
                    type,
                    breed,
                    gender,
                    size,
                    colors: selectedColors,
                    status: 'lost',
                    last_seen_department: location.department,
                    last_seen_province: location.province,
                    last_seen_district: location.district,
                    last_seen_address: location.address,
                    last_seen_lat: location.lat,
                    last_seen_lng: location.lng,
                    last_seen_date: new Date().toISOString(),
                    image_urls: finalImageUrls,
                    description: description
                })
                .select()
                .single()

            if (error) throw error

            // 4. Notify nearby users if coordinates are available
            if (location.lat && location.lng && insertedPet) {
                try {
                    const response = await fetch('/api/notify-nearby-users', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            petId: insertedPet.id,
                            petName: name,
                            petType: type,
                            petBreed: breed,
                            petDescription: description,
                            lastSeenAddress: location.address || '',
                            lastSeenDistrict: location.district,
                            lastSeenLat: location.lat,
                            lastSeenLng: location.lng,
                            petImageUrl: finalImageUrls[0]
                        })
                    })

                    const notificationResult = await response.json()

                    if (notificationResult.success && notificationResult.notified > 0) {
                        toast(`Notificamos a ${notificationResult.notified} personas cercanas`, {
                            type: "success",
                            title: "¡Ayuda en camino!"
                        })
                    }
                } catch (notifError) {
                    // Don't fail the report if notifications fail
                    console.error('Failed to send notifications:', notifError)
                }
            }

            toast("Reporte creado con éxito", { type: "success", title: "¡Excelente!" })
            router.push('/dashboard')

        } catch (error: any) {
            console.error('Error reporting pet:', error)
            toast(error.message || "Error al crear el reporte", { type: "error" })
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin h-10 w-10 text-blue-500" /></div>
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-20 pt-10">
            {profile && isProfileDialogOpen && (
                <CompleteProfileDialog
                    profile={profile}
                    onCompleted={(completedProfile) => {
                        setProfile(completedProfile)
                        setIsProfileDialogOpen(false)
                    }}
                />
            )}

            {/* Top Navbar Placeholder */}
            <div className="absolute top-0 left-0 w-full h-16 bg-white border-b flex items-center justify-between px-6 md:px-12 z-50">
                <div className="flex items-center gap-2 font-bold text-xl text-slate-800">
                    <div className="bg-blue-500 rounded p-1"><Search className="text-white h-4 w-4" /></div>
                    BuscaMascotas
                </div>
                <div className="flex gap-8 text-sm font-medium text-slate-600">
                    <Link href="/mascotas">Ver Perdidos</Link>
                </div>
                <Button variant="ghost" className="rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700" onClick={() => router.back()}>Cancelar</Button>
            </div>

            <div className="container max-w-3xl mx-auto px-4 mt-12">

                {/* Progress Header */}
                <div className="mb-12 space-y-6">
                    <div className="flex items-center justify-between text-sm">
                        <Badge variant="secondary" className="bg-orange-100 text-orange-600 hover:bg-orange-200 border-none px-3 py-1 uppercase text-xs font-bold tracking-wide">
                            <AlertTriangle className="h-3 w-3 mr-1" /> Alerta Urgente
                        </Badge>
                        <span className="text-muted-foreground font-medium">Nuevo Reporte</span>
                    </div>

                    <div className="text-center space-y-2 pt-4">
                        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900">Reportar Mascota Perdida</h1>
                        <p className="text-slate-500">Mientra más detalles nos des, más rápido podrá ayudar nuestra comunidad.</p>
                    </div>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 p-6 md:p-10 border border-slate-100 relative z-10 space-y-12">

                    <section className="space-y-6">
                        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <PawPrint className="h-5 w-5 text-blue-500" /> Datos de la Mascota
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Nombre</label>
                                <Input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="¿Cómo se llama?"
                                    className="h-12 bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Tipo de mascota</label>
                                <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200 h-12">
                                    <button
                                        onClick={() => { setType('dog'); setBreed(""); }}
                                        className={`flex-1 flex items-center justify-center gap-2 rounded-lg text-sm font-bold transition-all ${type === 'dog' ? 'bg-white shadow-sm text-blue-600 border border-slate-100' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        <Dog className="h-4 w-4" /> Perro
                                    </button>
                                    <button
                                        onClick={() => { setType('cat'); setBreed(""); }}
                                        className={`flex-1 flex items-center justify-center gap-2 rounded-lg text-sm font-bold transition-all ${type === 'cat' ? 'bg-white shadow-sm text-blue-600 border border-slate-100' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        <Cat className="h-4 w-4" /> Gato
                                    </button>
                                    <button
                                        onClick={() => { setType('other'); setBreed(""); }}
                                        className={`flex-1 flex items-center justify-center gap-2 rounded-lg text-sm font-bold transition-all ${type === 'other' ? 'bg-white shadow-sm text-blue-600 border border-slate-100' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        <Squirrel className="h-4 w-4" /> Otro
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Breed Popover Integration */}
                            <div className="space-y-2 md:col-span-1">
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Raza</label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="w-full h-12 justify-between bg-slate-50 border-slate-200 rounded-xl px-4 font-medium text-slate-700">
                                            {breed || "Seleccionar"} <ChevronDown className="h-4 w-4 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-80 p-0">
                                        <BreedPopover petType={type} initialBreed={breed} onBreedChange={setBreed} />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Género</label>
                                <Select value={gender} onValueChange={setGender}>
                                    <SelectTrigger className="h-12 bg-slate-50 border-slate-200 rounded-xl">
                                        <SelectValue placeholder="Seleccionar" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Macho">Macho</SelectItem>
                                        <SelectItem value="Hembra">Hembra</SelectItem>
                                        <SelectItem value="Desconocido">Desconocido</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Tamaño</label>
                                <Select value={size} onValueChange={setSize}>
                                    <SelectTrigger className="h-12 bg-slate-50 border-slate-200 rounded-xl">
                                        <SelectValue placeholder="Seleccionar" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Pequeño">Pequeño (0-10kg)</SelectItem>
                                        <SelectItem value="Mediano">Mediano (11-25kg)</SelectItem>
                                        <SelectItem value="Grande">Grande (26kg+)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Color Popover Integration */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Colores</label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="w-full h-12 justify-between bg-slate-50 border-slate-200 rounded-xl px-4 font-medium text-slate-700 overflow-hidden">
                                            <span className="truncate">{selectedColors.length > 0 ? selectedColors.join(", ") : "Seleccionar"}</span> <Palette className="h-4 w-4 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-64 p-0">
                                        <ColorPopover petType={type} initialColor={selectedColors.join(", ")} onColorChange={(c) => setSelectedColors(c ? [c] : [])} />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Descripción de la mascota</label>
                            <Textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Escribe señas particulares, comportamiento, o qué llevaba puesto..."
                                className="min-h-[100px] bg-slate-50 border-slate-200 focus:bg-white transition-all rounded-2xl p-4"
                            />
                        </div>
                    </section>

                    <section className="space-y-6">
                        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-red-500" /> Lugar de desaparición
                        </h3>
                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-6">
                            <LocationPopover onLocationChange={(loc) => setLocation(prev => ({ ...prev, ...loc, address: loc.address || "" }))} initialValues={location} showMap={false} />

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">
                                        Ubicación exacta en el mapa
                                    </label>
                                    {location.lat && location.lng && (
                                        <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                                            <CheckCircle2 className="h-3 w-3" />
                                            Ubicación guardada
                                        </span>
                                    )}
                                </div>
                                <LocationMap
                                    onLocationSelect={(lat, lng) => {
                                        setLocation(prev => ({ ...prev, lat, lng }))
                                    }}
                                    initialLat={location.lat}
                                    initialLng={location.lng}
                                />
                                <p className="text-xs text-slate-500 font-medium">
                                    💡 Haz clic en el mapa para marcar exactamente dónde viste o perdiste a tu mascota. Esto ayudará a otros usuarios a saber dónde buscar.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-6">
                        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <Camera className="h-5 w-5 text-orange-500" /> Fotos de la mascota
                        </h3>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {images.map((img, index) => (
                                <div key={index} className={`relative aspect-square rounded-2xl overflow-hidden group border-2 ${img.isMain ? 'border-orange-400 ring-2 ring-orange-100' : 'border-white'}`}>
                                    <img src={img.url} className="w-full h-full object-cover" alt={`Pet ${index}`} />

                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                        {!img.isMain && (
                                            <Button size="sm" variant="secondary" className="h-8 text-[10px] font-bold uppercase rounded-full" onClick={() => setMainImage(index)}>
                                                Hacer Principal
                                            </Button>
                                        )}
                                        <Button size="icon" variant="destructive" className="h-8 w-8 rounded-full" onClick={() => removeImage(index)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    {img.isMain && (
                                        <div className="absolute top-2 left-2 bg-orange-400 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter shadow-lg">
                                            Principal
                                        </div>
                                    )}
                                </div>
                            ))}

                            <label className="aspect-square border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 hover:border-blue-400 transition-all text-slate-400 hover:text-blue-500 group">
                                <div className="bg-slate-100 p-3 rounded-full group-hover:bg-blue-50 transition-colors">
                                    <ImagePlus className="h-6 w-6" />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-wide">Añadir Foto</span>
                                <input type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} className="hidden" />
                            </label>
                        </div>
                        <p className="text-[11px] text-slate-400 text-center font-medium">
                            * Se recomienda subir al menos 3 fotos (frente, perfil, cuerpo entero).
                        </p>
                    </section>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-10">
                        <Button variant="ghost" onClick={() => router.back()} disabled={isSubmitting}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Cancelar
                        </Button>
                        <Button
                            size="lg"
                            className="rounded-full px-8 bg-blue-500 hover:bg-blue-600 shadow-xl shadow-blue-500/30 text-base h-12"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando...</>
                            ) : (
                                <>Publicar Reporte <ArrowRight className="ml-2 h-5 w-5" /></>
                            )}
                        </Button>
                    </div>

                </div>

                {/* Info Footer */}
                <div className="mt-8 bg-blue-50 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 text-center md:text-left border border-blue-100">
                    <div className="bg-blue-100 p-3 rounded-full text-blue-600 shrink-0">
                        <HandHeart className="h-8 w-8" />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 mb-1">Estamos juntos en esto</h4>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            Apenas termines este formulario, notificaremos a todos los usuarios en un radio de 5km de tu última ubicación. Mantén la esperanza.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    )
}
