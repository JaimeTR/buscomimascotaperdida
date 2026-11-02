"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, MapPin, Camera, Loader2, Send, AlertCircle, Upload, Phone, Mail, X, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { createClient } from "@/utils/supabase/client"
import { useToast } from "@/components/ui/toast-modern"
import dynamic from 'next/dynamic'
import { LocationPopover } from "@/components/location-popover"
import { getImageUploadError } from "@/lib/image-upload"

// Dynamically import MapPicker to avoid SSR issues with Leaflet
const MapPicker = dynamic(() => import('@/components/map-picker').then(mod => mod.MapPicker), {
    ssr: false,
    loading: () => <div className="h-[300px] w-full bg-stone-100 animate-pulse rounded-2xl flex items-center justify-center text-stone-400 text-sm">Cargando mapa...</div>
})

export default function SightingReportPage() {
    const params = useParams()
    const router = useRouter()
    const petId = params.id as string
    const supabase = createClient()
    const { toast } = useToast()

    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [pet, setPet] = useState<any>(null)
    const [userId, setUserId] = useState<string | null>(null)

    const [formData, setFormData] = useState({
        lat: -12.046374, // Default to Lima
        lng: -77.042793,
        department: "",
        province: "",
        district: "",
        description: "",
        image_url: "",
        share_phone: false,
        share_email: false,
        share_whatsapp: false
    })
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)

    useEffect(() => {
        const init = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                router.push(`/login?next=/mascotas/${petId}/avistamiento`)
                return
            }
            setUserId(session.user.id)

            const { data: petData } = await supabase
                .from('pets')
                .select('name, last_seen_lat, last_seen_lng, last_seen_district, last_seen_department, last_seen_province')
                .eq('id', petId)
                .single()

            if (petData) {
                setPet(petData)
                if (petData.last_seen_lat && petData.last_seen_lng) {
                    setFormData(prev => ({
                        ...prev,
                        lat: petData.last_seen_lat,
                        lng: petData.last_seen_lng,
                        department: petData.last_seen_department || "",
                        province: petData.last_seen_province || "",
                        district: petData.last_seen_district || ""
                    }))
                }
            }
            setIsLoading(false)
        }
        init()
    }, [petId, router, supabase])

    const handleImageCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const imageError = getImageUploadError(file)
            if (imageError) {
                toast(imageError, { type: "error" })
                e.target.value = ""
                return
            }
            setImageFile(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const removeImage = () => {
        setImageFile(null)
        setImagePreview(null)
        setFormData(prev => ({ ...prev, image_url: "" }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!userId) return

        setIsSubmitting(true)
        try {
            let imageUrl = formData.image_url || null

            // Upload image to Supabase Storage if there's an image file
            if (imageFile) {
                const imageError = getImageUploadError(imageFile)
                if (imageError) throw new Error(imageError)
                const fileExt = imageFile.name.split('.').pop()
                const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
                
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('pet-images')
                    .upload(fileName, imageFile, {
                        cacheControl: '3600',
                        upsert: false
                    })
                
                if (uploadError) {
                    console.error('Error uploading image:', uploadError)
                    throw new Error(`Error al subir la imagen: ${uploadError.message}`)
                }
                
                // Get public URL
                const { data: { publicUrl } } = supabase.storage
                    .from('pet-images')
                    .getPublicUrl(uploadData.path)
                
                imageUrl = publicUrl
            }

            const { error } = await supabase
                .from('sightings')
                .insert({
                    pet_id: petId,
                    reporter_id: userId,
                    lat: formData.lat,
                    lng: formData.lng,
                    department: formData.department,
                    province: formData.province,
                    district: formData.district,
                    description: formData.description,
                    image_url: imageUrl,
                    share_phone: formData.share_phone,
                    share_email: formData.share_email,
                    share_whatsapp: formData.share_whatsapp
                })

            if (error) throw error

            toast("Avistamiento reportado con éxito. ¡Gracias por ayudar!", { type: "success", title: "¡Enviado!" })
            router.push(`/mascotas/${petId}`)
            router.refresh()
        } catch (error) {
            console.error("Error reporting sighting:", error)
            toast(error instanceof Error ? error.message : "Hubo un error al guardar el reporte.", { type: "error", title: "Error" })
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-stone-50"><Loader2 className="animate-spin h-10 w-10 text-teal-700" /></div>
    }

    return (
        <div className="min-h-screen bg-stone-50 py-12 px-4">
            <div className="max-w-2xl mx-auto space-y-6">
                <Button variant="ghost" className="rounded-full" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Volver al pet
                </Button>

                <Card className="border-0 shadow-2xl rounded-[2.5rem] overflow-hidden">
                    <CardHeader className="bg-teal-800 text-white p-8 md:p-12">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                                <MapPin className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-3xl font-black">Reportar Avistamiento</CardTitle>
                                <CardDescription className="text-teal-100 text-lg">¿Viste a {pet?.name}? Cuéntanos dónde y cómo estaba.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 md:p-12 space-y-8">
                        <form id="sighting-form" onSubmit={handleSubmit} className="space-y-8">

                            <div className="space-y-4">
                                <label className="text-sm font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-teal-700" /> Ubicación Exacta
                                </label>
                                <div className="h-[300px] rounded-3xl overflow-hidden border-2 border-stone-100 relative">
                                    <MapPicker
                                        onChange={(lat, lng) => setFormData(prev => ({ ...prev, lat, lng }))}
                                        lat={formData.lat}
                                        lng={formData.lng}
                                    />
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-stone-100 text-[10px] font-black uppercase text-stone-600">
                                        Mueve el pin azul al lugar exacto
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-sm font-bold text-stone-900 uppercase tracking-wider">Ubicación del Avistamiento</label>
                                <LocationPopover
                                    onLocationChange={(loc) => {
                                        setFormData(prev => ({
                                            ...prev,
                                            department: loc.department,
                                            province: loc.province,
                                            district: loc.district,
                                            lat: loc.lat || prev.lat,
                                            lng: loc.lng || prev.lng
                                        }))
                                    }}
                                    initialValues={{
                                        department: formData.department,
                                        province: formData.province,
                                        district: formData.district
                                    }}
                                    showMap={false}
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="text-sm font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2">
                                    <Camera className="h-4 w-4 text-teal-700" /> Foto del Avistamiento (Opcional)
                                </label>

                                {imagePreview ? (
                                    <div className="relative rounded-2xl overflow-hidden border-2 border-stone-100">
                                        <img src={imagePreview} alt="Preview" className="w-full h-64 object-cover" />
                                        <button
                                            type="button"
                                            onClick={removeImage}
                                            className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-colors"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-4">
                                        <label className="cursor-pointer">
                                            <input
                                                type="file"
                                                accept="image/jpeg,image/png,image/webp"
                                                capture="environment"
                                                onChange={handleImageCapture}
                                                className="hidden"
                                            />
                                            <div className="h-32 bg-teal-50 hover:bg-teal-100 border-2 border-dashed border-teal-200 rounded-2xl flex flex-col items-center justify-center gap-2 transition-colors">
                                                <Camera className="h-8 w-8 text-teal-700" />
                                                <span className="text-sm font-bold text-teal-800">Tomar Foto</span>
                                            </div>
                                        </label>
                                        <label className="cursor-pointer">
                                            <input
                                                type="file"
                                                accept="image/jpeg,image/png,image/webp"
                                                onChange={handleImageCapture}
                                                className="hidden"
                                            />
                                            <div className="h-32 bg-stone-50 hover:bg-stone-100 border-2 border-dashed border-stone-200 rounded-2xl flex flex-col items-center justify-center gap-2 transition-colors">
                                                <Upload className="h-8 w-8 text-stone-500" />
                                                <span className="text-sm font-bold text-stone-600">Subir Imagen</span>
                                            </div>
                                        </label>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-stone-900 uppercase tracking-wider">Descripción del avistamiento</label>
                                <Textarea
                                    required
                                    placeholder="¿Cómo estaba? ¿Tenía collar? ¿Parecía asustado?..."
                                    className="min-h-[120px] bg-teal-50 border-teal-200 rounded-2xl p-4 text-stone-900 placeholder:text-stone-500"
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="text-sm font-bold text-stone-900 uppercase tracking-wider">Opciones de Contacto</label>
                                <div className="bg-stone-50 rounded-2xl p-6 space-y-4">
                                    <div className="flex items-center space-x-3">
                                        <Checkbox
                                            id="share-phone"
                                            checked={formData.share_phone}
                                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, share_phone: checked as boolean }))}
                                        />
                                        <label htmlFor="share-phone" className="text-sm font-medium text-stone-700 cursor-pointer flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-teal-700" />
                                            Compartir mi teléfono con el dueño
                                        </label>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Checkbox
                                            id="share-email"
                                            checked={formData.share_email}
                                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, share_email: checked as boolean }))}
                                        />
                                        <label htmlFor="share-email" className="text-sm font-medium text-stone-700 cursor-pointer flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-teal-700" />
                                            Compartir mi correo con el dueño
                                        </label>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Checkbox
                                            id="share-whatsapp"
                                            checked={formData.share_whatsapp}
                                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, share_whatsapp: checked as boolean }))}
                                        />
                                        <label htmlFor="share-whatsapp" className="text-sm font-medium text-stone-700 cursor-pointer flex items-center gap-2">
                                            <MessageCircle className="h-4 w-4 text-green-500" />
                                            Compartir mi WhatsApp con el dueño
                                        </label>
                                    </div>
                                    <p className="text-xs text-stone-500 italic mt-2">
                                        Esta información solo será visible para el dueño de la mascota
                                    </p>
                                </div>
                            </div>

                            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 flex gap-4">
                                <AlertCircle className="h-6 w-6 text-amber-500 shrink-0" />
                                <p className="text-sm text-amber-700 leading-relaxed">
                                    <b>Aviso importante:</b> Tu información de contacto (si la tienes pública) será visible para el dueño de {pet?.name} para que pueda contactarte. ¡Gracias por participar!
                                </p>
                            </div>

                        </form>
                    </CardContent>
                    <CardFooter className="p-8 md:p-12 bg-stone-50 border-t border-stone-100 flex justify-end">
                        <Button
                            type="submit"
                            form="sighting-form"
                            size="lg"
                            className="bg-teal-800 hover:bg-teal-800 text-white font-black px-12 h-14 rounded-full shadow-xl shadow-teal-700/20"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Guardando...</> : <>Enviar Reporte <Send className="ml-2 h-5 w-5" /></>}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
