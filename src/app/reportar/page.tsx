"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, Camera, MapPin, AlertTriangle, HandHeart, Loader2, Dog, Cat, Squirrel, ChevronDown, Palette, PawPrint, Trash2, CheckCircle2, ImagePlus } from "lucide-react"

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
import { getImageUploadError, prepareImageForUpload } from "@/lib/image-upload"
import { BoostFields, EMPTY_BOOST, boostAmount, boostFileError, submitBoost, type BoostValue } from "@/components/boost/boost-fields"

const MAX_PHOTOS = 6

export default function ReportPage() {
    const router = useRouter()
    const supabase = createClient()
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [userId, setUserId] = useState<string | null>(null)
    const [profile, setProfile] = useState<{ id: string, phone?: string | null, department?: string | null, district?: string | null } | null>(null)
    const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false)
    const [step, setStep] = useState(0)
    // ?tipo=encontrada abre el formulario de "encontré una mascota"
    const [kind, setKind] = useState<"lost" | "found">(() =>
        typeof window !== "undefined" && new URLSearchParams(window.location.search).get("tipo") === "encontrada" ? "found" : "lost")
    const isFound = kind === "found"
    const [today] = useState(() => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10))
    const [seenDate, setSeenDate] = useState(today)

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
    const [boost, setBoost] = useState<BoostValue>(EMPTY_BOOST)
    const [images, setImages] = useState<{ file: File | null, url: string, isMain: boolean }[]>([])

    // Auth Protection
    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                router.push(`/ingresar?next=${encodeURIComponent("/reportar" + window.location.search)}`)
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
    }, [router, supabase, toast])

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files)
            const invalidFile = newFiles.find(file => getImageUploadError(file))
            if (invalidFile) {
                toast(getImageUploadError(invalidFile)!, { type: "error" })
                e.target.value = ""
                return
            }
            const room = MAX_PHOTOS - images.length
            if (newFiles.length > room) toast(`Puedes subir hasta ${MAX_PHOTOS} fotos.`, { type: "error" })
            const newImages = newFiles.slice(0, Math.max(room, 0)).map(file => ({
                file,
                url: URL.createObjectURL(file),
                isMain: images.length === 0 // First image is main by default
            }))
            setImages(prev => [...prev, ...newImages])
            e.target.value = ""
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

    const STEPS = ["La mascota", "El lugar", "Las fotos", "Apoyo"]
    const goNext = () => {
        if (step === 0 && !isFound && !name.trim()) return toast("Escribe el nombre de la mascota (o \"Sin nombre\").", { type: "error" })
        if (step === 1 && !location.district) return toast(isFound ? "Elige al menos el distrito donde la encontraste." : "Elige al menos el distrito donde la viste por última vez.", { type: "error" })
        setStep((s) => Math.min(s + 1, 3))
        window.scrollTo({ top: 0, behavior: "smooth" })
    }
    const goBack = () => {
        if (step === 0) return router.back()
        setStep((s) => s - 1)
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    const handleSubmit = async () => {
        if (!userId) return

        if (!profile?.phone?.trim() || !profile.department?.trim() || !profile.district?.trim()) {
            setIsProfileDialogOpen(true)
            return
        }

        // Validation
        const petName = name.trim() || (isFound ? "Sin nombre" : "")
        if (!petName || !type || !location.district) {
            toast("Nombre, tipo y ubicación son obligatorios", { type: "error" })
            return
        }

        const proofError = boostFileError(boost.file)
        if (proofError) { toast(proofError, { type: "error" }); return }

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
                    const prepared = await prepareImageForUpload(img.file)
                    const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${prepared.ext}`

                    // Upload to Supabase Storage (nombre único => caché de 1 año)
                    const { data: uploadData, error: uploadError } = await supabase.storage
                        .from('pet-images')
                        .upload(fileName, prepared.blob, {
                            cacheControl: '31536000',
                            contentType: prepared.type,
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
            const finalImageUrls = mainImageIndex < 0 ? [] : [
                uploadedUrls[mainImageIndex],
                ...uploadedUrls.filter((_, i) => i !== mainImageIndex)
            ]

            // 3. Insert pet record with ordered images
            const { data: insertedPet, error } = await supabase
                .from('pets')
                .insert({
                    owner_id: userId,
                    name: petName,
                    type,
                    breed,
                    gender,
                    size,
                    colors: selectedColors,
                    status: kind,
                    last_seen_department: location.department,
                    last_seen_province: location.province,
                    last_seen_district: location.district,
                    last_seen_address: location.address,
                    last_seen_lat: location.lat,
                    last_seen_lng: location.lng,
                    last_seen_date: seenDate >= today ? new Date().toISOString() : new Date(`${seenDate}T12:00:00`).toISOString(),
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
                        body: JSON.stringify({ petId: insertedPet.id })
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

            if (insertedPet && boostAmount(boost) > 0) {
                const res = await submitBoost(supabase, { petId: insertedPet.id, userId, value: boost })
                if (!res.ok) toast(`${res.error} Puedes intentarlo de nuevo desde tu reporte.`, { type: "error" })
                else if (!res.skipped) toast("Registramos tu aporte. Lo verificaremos y tu caso saldrá destacado.", { type: "success", title: "¡Gracias por apoyar!" })
            }

            toast("Reporte creado con éxito", { type: "success", title: "¡Excelente!" })
            router.push(insertedPet ? `/cartel/${insertedPet.id}?nuevo=1` : '/panel')

        } catch (error) {
            console.error('Error reporting pet:', error)
            toast(error instanceof Error ? error.message : "Error al crear el reporte", { type: "error" })
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>
    }

    return (
        <div className="min-h-screen pb-32 pt-6 md:pb-20 md:pt-10">
            {profile && isProfileDialogOpen && (
                <CompleteProfileDialog
                    profile={profile}
                    onCompleted={(completedProfile) => {
                        setProfile(completedProfile)
                        setIsProfileDialogOpen(false)
                    }}
                />
            )}

            <div className="container mx-auto max-w-3xl px-4">

                {/* Encabezado del formulario (la barra del sitio ya está arriba) */}
                <div className="mb-8 space-y-5 md:mb-10">
                    <div className="text-center space-y-2">
                        <Badge variant="secondary" className="border-none bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-800 hover:bg-orange-100">
                            <AlertTriangle className="mr-1 h-3 w-3" aria-hidden /> {isFound ? "Ayuda a que vuelva a casa" : "Cada minuto cuenta"}
                        </Badge>
                        <h1 className="font-display text-[1.75rem] leading-tight text-primary md:text-4xl">{isFound ? "Reportar mascota encontrada" : "Reportar mascota perdida"}</h1>
                        <p className="mx-auto max-w-lg text-sm text-muted-foreground md:text-base">Mientras más detalles nos des, más rápido podrá ayudar nuestra comunidad.</p>
                    </div>

                    {/* ¿Perdida o encontrada? */}
                    <div role="radiogroup" aria-label="Tipo de reporte" className="mx-auto grid max-w-md grid-cols-2 gap-1 rounded-full border border-border bg-card p-1 shadow-[var(--shadow-soft)]">
                        {([["lost", "Perdí a mi mascota"], ["found", "Encontré una mascota"]] as const).map(([v, label]) => (
                            <button
                                key={v}
                                type="button"
                                role="radio"
                                aria-checked={kind === v}
                                onClick={() => setKind(v)}
                                className={`min-h-11 rounded-full px-3 text-sm font-semibold transition-colors ${kind === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    <ol aria-label="Pasos del reporte" className="mx-auto flex max-w-md items-center justify-center gap-2 pt-1">
                        {STEPS.map((label, i) => (
                            <li key={label} className="flex flex-1 items-center gap-2" aria-current={step === i ? "step" : undefined}>
                                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors ${i < step ? "bg-primary text-primary-foreground" : i === step ? "bg-cta text-cta-foreground" : "bg-secondary text-muted-foreground"}`}>
                                    {i < step ? <CheckCircle2 className="h-5 w-5" aria-hidden /> : i + 1}
                                </span>
                                <span className={`hidden text-sm font-medium sm:block ${i === step ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>
                                {i < STEPS.length - 1 && <span className="h-0.5 flex-1 rounded bg-border" aria-hidden />}
                            </li>
                        ))}
                    </ol>
                    <p className="text-center text-xs font-medium text-muted-foreground sm:hidden">Paso {step + 1} de {STEPS.length} · {STEPS[step]}</p>
                </div>

                {/* Main Card */}
                <div className="relative z-10 space-y-8 overflow-hidden rounded-[1.5rem] border border-border bg-card p-5 shadow-[var(--shadow-lift)] sm:p-8 md:space-y-10 md:rounded-[2rem] md:p-10">
                    <div aria-hidden className="paws-teal pointer-events-none absolute inset-0 opacity-[0.04]" />

                    {step === 0 && (
                    <section className="space-y-6">
                        <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                            <PawPrint className="h-5 w-5 text-primary" /> Datos de la Mascota
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label htmlFor="pet-name" className="ml-1 text-sm font-semibold text-foreground">{isFound ? "Nombre (si tiene chapa)" : "Nombre"}</label>
                                <Input
                                    id="pet-name"
                                    value={name}
                                    maxLength={60}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder={isFound ? "Déjalo vacío si no lo sabes" : "¿Cómo se llama?"}
                                    className="h-12 bg-background border-border focus:bg-card focus:ring-2 focus:ring-teal-100 transition-all rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="ml-1 text-sm font-semibold text-foreground">Tipo de mascota</label>
                                <div className="flex bg-background p-1 rounded-xl border border-border h-12">
                                    <button
                                        type="button"
                                        onClick={() => { setType('dog'); setBreed(""); }}
                                        className={`flex-1 flex items-center justify-center gap-2 rounded-lg text-sm font-bold transition-all ${type === 'dog' ? 'bg-card shadow-sm text-primary border border-border' : 'text-muted-foreground hover:text-foreground'}`}
                                    >
                                        <Dog className="h-4 w-4" /> Perro
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setType('cat'); setBreed(""); }}
                                        className={`flex-1 flex items-center justify-center gap-2 rounded-lg text-sm font-bold transition-all ${type === 'cat' ? 'bg-card shadow-sm text-primary border border-border' : 'text-muted-foreground hover:text-foreground'}`}
                                    >
                                        <Cat className="h-4 w-4" /> Gato
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setType('other'); setBreed(""); }}
                                        className={`flex-1 flex items-center justify-center gap-2 rounded-lg text-sm font-bold transition-all ${type === 'other' ? 'bg-card shadow-sm text-primary border border-border' : 'text-muted-foreground hover:text-foreground'}`}
                                    >
                                        <Squirrel className="h-4 w-4" /> Otro
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Breed Popover Integration */}
                            <div className="space-y-2 md:col-span-1">
                                <label className="ml-1 text-sm font-semibold text-foreground">Raza</label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="w-full h-12 justify-between bg-background border-border rounded-xl px-4 font-medium text-foreground">
                                            {breed || "Seleccionar"} <ChevronDown className="h-4 w-4 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-80 p-0">
                                        <BreedPopover petType={type} initialBreed={breed} onBreedChange={setBreed} />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="space-y-2">
                                <label className="ml-1 text-sm font-semibold text-foreground">Género</label>
                                <Select value={gender} onValueChange={setGender}>
                                    <SelectTrigger className="h-12 bg-background border-border rounded-xl">
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
                                <label className="ml-1 text-sm font-semibold text-foreground">Tamaño</label>
                                <Select value={size} onValueChange={setSize}>
                                    <SelectTrigger className="h-12 bg-background border-border rounded-xl">
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
                                <label className="ml-1 text-sm font-semibold text-foreground">Colores</label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="w-full h-12 justify-between bg-background border-border rounded-xl px-4 font-medium text-foreground overflow-hidden">
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
                            <label className="ml-1 text-sm font-semibold text-foreground">Descripción de la mascota</label>
                            <Textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Escribe señas particulares, comportamiento, o qué llevaba puesto..."
                                className="min-h-[100px] bg-background border-border focus:bg-card transition-all rounded-2xl p-4"
                            />
                        </div>
                    </section>
                    )}

                    {step === 1 && (
                    <section className="space-y-6">
                        <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-red-500" /> {isFound ? "Dónde la encontraste" : "Lugar de desaparición"}
                        </h3>
                        <div className="space-y-2">
                            <label htmlFor="seen-date" className="ml-1 text-sm font-semibold text-foreground">{isFound ? "¿Cuándo la encontraste?" : "¿Cuándo la viste por última vez?"}</label>
                            <Input id="seen-date" type="date" max={today} value={seenDate} onChange={(e) => setSeenDate(e.target.value || today)} className="h-12 rounded-xl border-border bg-background sm:max-w-xs" />
                        </div>
                        <div className="space-y-6 rounded-2xl border border-border bg-background p-4 sm:p-6">
                            <LocationPopover onLocationChange={(loc) => setLocation(prev => ({ ...prev, ...loc, address: loc.address || "" }))} initialValues={location} showMap={false} />

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="ml-1 text-sm font-semibold text-foreground">
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
                                <p className="text-xs text-muted-foreground font-medium">
                                    💡 Usa “Mi ubicación”, busca la dirección o toca el mapa para marcar exactamente dónde viste o perdiste a tu mascota. Esto ayudará a otros usuarios a saber dónde buscar.
                                </p>
                            </div>
                        </div>
                    </section>
                    )}

                    {step === 2 && (
                    <section className="space-y-6">
                        <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                            <Camera className="h-5 w-5 text-orange-500" /> Fotos de la mascota
                        </h3>

                        <p role="note" className={`rounded-2xl border px-4 py-3 text-sm font-medium ${images.length === 0 ? "border-orange-300 bg-orange-50 text-orange-900" : "border-teal-200 bg-teal-50 text-teal-900"}`}>
                            {images.length === 0
                                ? "Te recomendamos subir una foto: los anuncios con foto se reconocen mucho más rápido. Sin foto, tu anuncio mostrará nuestro logo con un aviso para que quien tenga una foto la suba."
                                : "¡Muy bien! Las fotos ayudan a que reconozcan a tu mascota más rápido."}
                        </p>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {images.map((img, index) => (
                                <div key={index} className={`relative aspect-square rounded-2xl overflow-hidden group border-2 ${img.isMain ? 'border-orange-400 ring-2 ring-orange-100' : 'border-white'}`}>
                                    <img src={img.url} className="w-full h-full object-cover" alt={`Foto ${index + 1} de la mascota`} />

                                    {/* Controles siempre visibles: en el celular no existe "hover". */}
                                    <Button type="button" size="icon" variant="destructive" aria-label="Quitar foto" className="absolute right-1.5 top-1.5 h-8 w-8 rounded-full shadow-md" onClick={() => removeImage(index)}>
                                        <Trash2 className="h-4 w-4" aria-hidden />
                                    </Button>
                                    {img.isMain ? (
                                        <div className="absolute bottom-1.5 left-1.5 rounded-full bg-orange-500 px-2.5 py-1 text-[11px] font-semibold text-white shadow-md">Principal</div>
                                    ) : (
                                        <Button type="button" size="sm" variant="secondary" className="absolute bottom-1.5 left-1.5 h-7 rounded-full px-2.5 text-[11px] font-semibold shadow-md" onClick={() => setMainImage(index)}>
                                            Hacer principal
                                        </Button>
                                    )}
                                </div>
                            ))}

                            {images.length < MAX_PHOTOS && <label className="aspect-square border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-background hover:border-teal-700 transition-all text-muted-foreground hover:text-primary group">
                                <div className="bg-secondary p-3 rounded-full group-hover:bg-accent transition-colors">
                                    <ImagePlus className="h-6 w-6" />
                                </div>
                                <span className="text-xs font-semibold">Añadir foto</span>
                                <input type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} className="hidden" />
                            </label>}
                        </div>
                        <p className="text-center text-xs font-medium text-muted-foreground">
                            Recomendamos 3 fotos (frente, perfil, cuerpo entero). Máximo {MAX_PHOTOS}.
                        </p>
                    </section>
                    )}

                    {step === 3 && (
                    <section className="space-y-6">
                        <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                            <HandHeart className="h-5 w-5 text-cta" aria-hidden /> Apoyo voluntario
                        </h3>
                        <BoostFields value={boost} onChange={setBoost} />
                    </section>
                    )}

                    {/* Acciones */}
                    <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
                        <Button variant="ghost" className="h-12 sm:h-10" onClick={goBack} disabled={isSubmitting}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> {step === 0 ? "Cancelar" : "Atrás"}
                        </Button>
                        {step < 3 ? (
                            <Button size="lg" className="h-12 w-full rounded-full px-8 sm:w-auto" onClick={goNext}>
                                Siguiente <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        ) : (
                            <Button size="lg" variant="cta" className="h-12 w-full rounded-full px-8 sm:w-auto" onClick={handleSubmit} disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando...</>
                                ) : (
                                    <>Publicar reporte <ArrowRight className="ml-2 h-5 w-5" /></>
                                )}
                            </Button>
                        )}
                    </div>

                </div>

                {/* Info Footer */}
                <div className="mt-8 flex flex-col items-center gap-4 rounded-2xl border border-teal-100 bg-accent p-5 text-center md:flex-row md:gap-6 md:p-6 md:text-left">
                    <div className="shrink-0 rounded-full bg-card p-3 text-primary">
                        <HandHeart className="h-8 w-8" aria-hidden />
                    </div>
                    <div>
                        <h2 className="mb-1 font-bold text-foreground">Estamos juntos en esto</h2>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            {isFound
                                ? "Al publicar, la comunidad cercana podrá reconocerla y su dueño podrá contactarte. Gracias por ayudar."
                                : "Al publicar, avisaremos a las personas cercanas a tu última ubicación y podrás crear un cartel para compartir. Mantén la esperanza."}
                        </p>
                    </div>
                </div>

            </div>
        </div>
    )
}
