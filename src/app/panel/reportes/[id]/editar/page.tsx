"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Camera, MapPin, Loader2, Dog, Cat, Squirrel, ChevronDown, Palette, PawPrint, Trash2, ImagePlus, Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/utils/supabase/client"
import { useToast } from "@/components/ui/toast-modern"
import { LocationPopover } from "@/components/location-popover"
import { BreedPopover } from "@/components/breed-popover"
import { ColorPopover } from "@/components/color-popover"
import { getImageUploadError, prepareImageForUpload } from "@/lib/image-upload"

export default function EditReportPage() {
    const params = useParams()
    const router = useRouter()
    const petId = params.id as string
    const supabase = createClient()
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [userId, setUserId] = useState<string | null>(null)

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
    const [, setExistingImageUrls] = useState<string[]>([])

    // Auth & Data Loading
    useEffect(() => {
        const init = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                router.push(`/ingresar?next=/panel/reportes/${petId}/editar`)
                return
            }
            setUserId(session.user.id)

            // Fetch pet data
            const { data: pet, error } = await supabase
                .from('pets')
                .select('*')
                .eq('id', petId)
                .eq('owner_id', session.user.id) // Security: only owner can edit
                .single()

            if (error || !pet) {
                toast("No se pudo cargar el reporte", { type: "error" })
                router.push('/panel/reportes')
                return
            }

            // Populate form with existing data
            setName(pet.name || "")
            setType(pet.type || "dog")
            setBreed(pet.breed || "")
            setGender(pet.gender || "")
            setSize(pet.size || "")
            setSelectedColors(pet.colors || [])
            setDescription(pet.description || "")
            setLocation({
                department: pet.last_seen_department || "",
                province: pet.last_seen_province || "",
                district: pet.last_seen_district || "",
                address: pet.last_seen_address || "",
                lat: pet.last_seen_lat,
                lng: pet.last_seen_lng
            })

            // Load existing images
            if (pet.image_urls && pet.image_urls.length > 0) {
                setExistingImageUrls(pet.image_urls)
                setImages(pet.image_urls.map((url: string, i: number) => ({
                    file: null,
                    url,
                    isMain: i === 0
                })))
            }

            setIsLoading(false)
        }
        init()
    }, [petId, router, supabase, toast])

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

        // Validation
        if (!name || !type || !location.district || images.length === 0) {
            toast("Nombre, tipo, ubicación y al menos una foto son obligatorios", { type: "error" })
            return
        }

        setIsSubmitting(true)

        try {
            // 1. Upload new images to Supabase Storage
            const uploadedUrls: string[] = []
            
            for (let i = 0; i < images.length; i++) {
                const img = images[i]
                if (img.file) {
                    const imageError = getImageUploadError(img.file)
                    if (imageError) throw new Error(imageError)
                    // It's a new image, upload it
                    const prepared = await prepareImageForUpload(img.file)
                    const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${prepared.ext}`

                    const { data: uploadData, error: uploadError } = await supabase.storage
                        .from('pet-images')
                        .upload(fileName, prepared.blob, {
                            cacheControl: '31536000',
                            contentType: prepared.type,
                            upsert: false
                        })
                    
                    if (uploadError) {
                        console.error('Upload error details:', {
                            message: uploadError.message,
                            name: uploadError.name,
                            cause: uploadError.cause
                        })
                        throw new Error(`Error al subir la imagen ${i + 1}: ${uploadError.message}`)
                    }
                    
                    const { data: { publicUrl } } = supabase.storage
                        .from('pet-images')
                        .getPublicUrl(uploadData.path)
                    
                    uploadedUrls.push(publicUrl)
                } else {
                    // It's an existing image, keep it
                    uploadedUrls.push(img.url)
                }
            }

            // 2. Reorder so main image is first
            const mainImageIndex = images.findIndex(img => img.isMain)
            const finalImageUrls = [
                uploadedUrls[mainImageIndex],
                ...uploadedUrls.filter((_, i) => i !== mainImageIndex)
            ]

            // 3. Update pet record
            const { error } = await supabase
                .from('pets')
                .update({
                    name,
                    type,
                    breed,
                    gender,
                    size,
                    colors: selectedColors,
                    last_seen_department: location.department,
                    last_seen_province: location.province,
                    last_seen_district: location.district,
                    last_seen_address: location.address,
                    last_seen_lat: location.lat,
                    last_seen_lng: location.lng,
                    image_urls: finalImageUrls,
                    description: description
                })
                .eq('id', petId)

            if (error) throw error

            toast("Reporte actualizado con éxito", { type: "success", title: "¡Guardado!" })
            router.push('/panel/reportes')

        } catch (error) {
            console.error('Error updating pet:', error)
            toast(error instanceof Error ? error.message : "Error al actualizar el reporte", { type: "error" })
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>
    }

    return (
        <div className="min-h-screen bg-background pb-20 pt-10">
            <div className="container max-w-3xl mx-auto px-4 mt-12">

                {/* Header */}
                <div className="mb-12 space-y-6">
                    <Button variant="ghost" onClick={() => router.back()} className="gap-2">
                        <ArrowLeft className="h-4 w-4" /> Volver
                    </Button>

                    <div className="text-center space-y-2 pt-4">
                        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground">Editar Reporte</h1>
                        <p className="text-muted-foreground">Actualiza la información de tu mascota perdida.</p>
                    </div>
                </div>

                {/* Main Card */}
                <div className="bg-card rounded-[2rem] shadow-xl shadow-stone-200/50 p-6 md:p-10 border border-border relative z-10 space-y-12">

                    <section className="space-y-6">
                        <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                            <PawPrint className="h-5 w-5 text-primary" /> Datos de la Mascota
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase ml-1">Nombre</label>
                                <Input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="¿Cómo se llama?"
                                    className="h-12 bg-background border-border focus:bg-card focus:ring-2 focus:ring-teal-100 transition-all rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase ml-1">Tipo de mascota</label>
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
                            <div className="space-y-2 md:col-span-1">
                                <label className="text-xs font-bold text-muted-foreground uppercase ml-1">Raza</label>
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
                                <label className="text-xs font-bold text-muted-foreground uppercase ml-1">Género</label>
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
                                <label className="text-xs font-bold text-muted-foreground uppercase ml-1">Tamaño</label>
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

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase ml-1">Colores</label>
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
                            <label className="text-xs font-bold text-muted-foreground uppercase ml-1">Descripción de la mascota</label>
                            <Textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Escribe señas particulares, comportamiento, o qué llevaba puesto..."
                                className="min-h-[100px] bg-background border-border focus:bg-card transition-all rounded-2xl p-4"
                            />
                        </div>
                    </section>

                    <section className="space-y-6">
                        <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-red-500" /> Lugar de desaparición
                        </h3>
                        <div className="bg-background rounded-2xl p-6 border border-border">
                            <LocationPopover 
                                onLocationChange={(loc) => {
                                    setLocation({
                                        department: loc.department,
                                        province: loc.province,
                                        district: loc.district,
                                        address: loc.address || "",
                                        lat: loc.lat,
                                        lng: loc.lng
                                    })
                                }} 
                                initialValues={location} 
                            />
                        </div>
                    </section>

                    <section className="space-y-6">
                        <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                            <Camera className="h-5 w-5 text-orange-500" /> Fotos de la mascota
                        </h3>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {images.map((img, index) => (
                                <div key={index} className={`relative aspect-square rounded-2xl overflow-hidden group border-2 ${img.isMain ? 'border-orange-400 ring-2 ring-orange-100' : 'border-white'}`}>
                                    <img src={img.url} className="w-full h-full object-cover" alt={`Foto ${index + 1} de la mascota`} />

                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                        {!img.isMain && (
                                            <Button size="sm" variant="secondary" className="h-8 text-[10px] font-bold uppercase rounded-full" onClick={() => setMainImage(index)}>
                                                Hacer Principal
                                            </Button>
                                        )}
                                        <Button type="button" size="icon" variant="destructive" aria-label="Quitar foto" className="h-8 w-8 rounded-full" onClick={() => removeImage(index)}>
                                            <Trash2 className="h-4 w-4" aria-hidden />
                                        </Button>
                                    </div>

                                    {img.isMain && (
                                        <div className="absolute top-2 left-2 bg-orange-400 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tight shadow-lg">
                                            Principal
                                        </div>
                                    )}
                                </div>
                            ))}

                            <label className="aspect-square border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-background hover:border-teal-700 transition-all text-muted-foreground hover:text-primary group">
                                <div className="bg-secondary p-3 rounded-full group-hover:bg-accent transition-colors">
                                    <ImagePlus className="h-6 w-6" />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-wide">Añadir Foto</span>
                                <input type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} className="hidden" />
                            </label>
                        </div>
                    </section>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-10">
                        <Button variant="ghost" onClick={() => router.back()} disabled={isSubmitting}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Cancelar
                        </Button>
                        <Button
                            size="lg"
                            className="rounded-full px-8 bg-primary hover:bg-primary shadow-xl shadow-teal-700/30 text-base h-12"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</>
                            ) : (
                                <><Save className="mr-2 h-5 w-5" /> Guardar Cambios</>
                            )}
                        </Button>
                    </div>

                </div>
            </div>
        </div>
    )
}
