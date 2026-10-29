
"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Bell, Shield, User, LogOut, Camera, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/toast-modern"
import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"

export default function SettingsPage() {
    const router = useRouter()
    const { toast } = useToast()
    const supabase = createClient()
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
    const [profile, setProfile] = useState<any>(null)
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession()
                if (!session) {
                    router.push("/login")
                    return
                }

                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single()

                if (error && error.code !== 'PGRST116') throw error // PGRST116 is "no rows returned"

                if (data) {
                    setProfile(data)
                } else {
                    // Initialize empty profile if none exists
                    setProfile({
                        id: session.user.id,
                        email: session.user.email,
                        full_name: "",
                        phone: "",
                        whatsapp: "",
                        instagram: "",
                        facebook_url: "",
                        district: "",
                        phone_public: false,
                        email_public: false,
                        whatsapp_public: false,
                        avatar_url: ""
                    })
                }
            } catch (err: any) {
                console.error("Error fetching profile:", err)
                toast("Error al cargar el perfil", { type: "error" })
            } finally {
                setIsLoading(false)
            }
        }
        fetchProfile()
    }, [supabase, router])

    const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            toast("La imagen debe ser menor a 2MB", { type: "error" })
            return
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast("Solo se permiten archivos de imagen", { type: "error" })
            return
        }

        setIsUploadingPhoto(true)
        try {
            // Create preview
            const reader = new FileReader()
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string)
            }
            reader.readAsDataURL(file)

            // Upload to Supabase Storage
            const fileExt = file.name.split('.').pop()
            const fileName = `${profile.id}/avatar.${fileExt}`
            
            // Delete old avatar if exists
            await supabase.storage
                .from('pet-images')
                .remove([fileName])
            
            // Upload new avatar
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('pet-images')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: true
                })
            
            if (uploadError) {
                throw new Error(`Error al subir la imagen: ${uploadError.message}`)
            }
            
            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('pet-images')
                .getPublicUrl(uploadData.path)
            
            // Update profile with new avatar URL
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ avatar_url: publicUrl })
                .eq('id', profile.id)
            
            if (updateError) throw updateError
            
            setProfile({ ...profile, avatar_url: publicUrl })
            toast("¡Foto actualizada correctamente!", { type: "success" })
        } catch (error: any) {
            console.error('Error uploading photo:', error)
            toast(error.message || "Error al cargar la foto", { type: "error" })
        } finally {
            setIsUploadingPhoto(false)
        }
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: profile.full_name,
                    phone: profile.phone,
                    whatsapp: profile.whatsapp,
                    instagram: profile.instagram,
                    facebook_url: profile.facebook_url,
                    district: profile.district,
                    phone_public: profile.phone_public,
                    email_public: profile.email_public,
                    whatsapp_public: profile.whatsapp_public
                    // Note: avatar_url is saved separately when uploading photo
                })
                .eq('id', profile.id)

            if (error) throw error
            toast("Los cambios se han guardado correctamente.", { type: "success", title: "¡Guardado!" })
        } catch (error: any) {
            toast(error.message || "Error al guardar cambios", { type: "error" })
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        )
    }

    return (
        <div className="container mx-auto py-10 px-4 max-w-4xl space-y-8">

            <div>
                <h1 className="text-3xl font-bold text-slate-900">Configuración</h1>
                <p className="text-slate-500">Gestiona tu perfil y preferencias de la cuenta.</p>
            </div>

            <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-3 lg:w-[400px] mb-8 bg-slate-100 p-1 rounded-xl">
                    <TabsTrigger value="profile" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Perfil</TabsTrigger>
                    <TabsTrigger value="notifications" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Notificaciones</TabsTrigger>
                    <TabsTrigger value="security" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Seguridad</TabsTrigger>
                </TabsList>

                {/* Profile Tab */}
                <TabsContent value="profile" className="space-y-6">
                    <Card className="border-slate-100 shadow-sm">
                        <CardHeader>
                            <CardTitle>Información Personal</CardTitle>
                            <CardDescription>Actualiza tu foto y datos de contacto.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">

                            <div className="flex items-center gap-6">
                                <input
                                    type="file"
                                    id="avatar-upload"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handlePhotoChange}
                                />
                                <div
                                    className="relative group cursor-pointer"
                                    onClick={() => document.getElementById('avatar-upload')?.click()}
                                >
                                    <Avatar className="h-24 w-24">
                                        <AvatarImage src={avatarPreview || profile?.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + profile?.id} />
                                        <AvatarFallback>{profile?.full_name?.substring(0, 2).toUpperCase() || "JT"}</AvatarFallback>
                                    </Avatar>
                                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        {isUploadingPhoto ? (
                                            <Loader2 className="h-8 w-8 text-white animate-spin" />
                                        ) : (
                                            <Camera className="h-8 w-8 text-white" />
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-medium text-slate-900">Foto de Perfil</h3>
                                    <p className="text-xs text-slate-500">JPG, GIF o PNG. Max 1MB.</p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="mt-2"
                                        onClick={() => document.getElementById('avatar-upload')?.click()}
                                        disabled={isUploadingPhoto}
                                    >
                                        {isUploadingPhoto ? "Cargando..." : "Cambiar Foto"}
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>Nombre Completo</Label>
                                    <Input
                                        value={profile?.full_name || ""}
                                        onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input value={profile?.email || ""} disabled className="bg-slate-50 opacity-60" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Teléfono / Celular</Label>
                                    <Input
                                        value={profile?.phone || ""}
                                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>WhatsApp (Número limpio)</Label>
                                    <Input
                                        placeholder="Ej: 51987654321"
                                        value={profile?.whatsapp || ""}
                                        onChange={(e) => setProfile({ ...profile, whatsapp: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Usuario de Instagram</Label>
                                    <Input
                                        placeholder="@tuusuario"
                                        value={profile?.instagram || ""}
                                        onChange={(e) => setProfile({ ...profile, instagram: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Facebook (Link o Usuario)</Label>
                                    <Input
                                        placeholder="facebook.com/usuario"
                                        value={profile?.facebook_url || ""}
                                        onChange={(e) => setProfile({ ...profile, facebook_url: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Distrito Principal</Label>
                                    <Input
                                        value={profile?.district || ""}
                                        onChange={(e) => setProfile({ ...profile, district: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-50 space-y-4">
                                <h3 className="font-bold text-slate-900">Privacidad y Contacto</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                                        <div className="space-y-0.5">
                                            <Label className="text-sm font-bold">Mostrar mi teléfono</Label>
                                            <p className="text-xs text-slate-500">Permite que otros te llamen.</p>
                                        </div>
                                        <Switch
                                            checked={profile?.phone_public}
                                            onCheckedChange={(v) => setProfile({ ...profile, phone_public: v })}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                                        <div className="space-y-0.5">
                                            <Label className="text-sm font-bold">Mostrar mi email</Label>
                                            <p className="text-xs text-slate-500">Visible en tus reportes públicos.</p>
                                        </div>
                                        <Switch
                                            checked={profile?.email_public}
                                            onCheckedChange={(v) => setProfile({ ...profile, email_public: v })}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                                        <div className="space-y-0.5">
                                            <Label className="text-sm font-bold">Mostrar mi WhatsApp</Label>
                                            <p className="text-xs text-slate-500">Permite que otros te contacten por WhatsApp.</p>
                                        </div>
                                        <Switch
                                            checked={profile?.whatsapp_public}
                                            onCheckedChange={(v) => setProfile({ ...profile, whatsapp_public: v })}
                                        />
                                    </div>
                                </div>
                            </div>

                        </CardContent>
                        <CardFooter className="flex justify-end border-t border-slate-50 pt-6">
                            <Button className="bg-blue-600 hover:bg-blue-700 h-11 px-8 font-bold" onClick={handleSave} disabled={isSaving}>
                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                Guardar Cambios
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                {/* Notifications Tab */}
                <TabsContent value="notifications" className="space-y-6">
                    <Card className="border-slate-100 shadow-sm">
                        <CardHeader>
                            <CardTitle>Preferencias de Alerta</CardTitle>
                            <CardDescription>Controla cuándo y cómo te contactamos.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">

                            <div className="flex items-center justify-between space-x-4">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium leading-none">Alertas de Avistamiento Cercano</p>
                                    <p className="text-sm text-slate-500">Recibir notificaciones cuando se reporte una mascota a menos de 5km.</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <div className="flex items-center justify-between space-x-4">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium leading-none">Mensajes Directos</p>
                                    <p className="text-sm text-slate-500">Cuando alguien te envíe un mensaje sobre tu reporte.</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <div className="flex items-center justify-between space-x-4">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium leading-none">Boletín Semanal</p>
                                    <p className="text-sm text-slate-500">Resumen de mascotas encontradas y noticias de la comunidad.</p>
                                </div>
                                <Switch />
                            </div>

                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Security Tab */}
                <TabsContent value="security" className="space-y-6">
                    <Card className="border-slate-100 shadow-sm">
                        <CardHeader>
                            <CardTitle>Seguridad de la Cuenta</CardTitle>
                            <CardDescription>Mantén tu cuenta protegida.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Contraseña Actual</Label>
                                <Input type="password" />
                            </div>
                            <div className="space-y-2">
                                <Label>Nueva Contraseña</Label>
                                <Input type="password" />
                            </div>
                            <div className="space-y-2">
                                <Label>Confirmar Nueva Contraseña</Label>
                                <Input type="password" />
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between border-t border-slate-50 pt-6">
                            <Button variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                                <LogOut className="h-4 w-4 mr-2" /> Cerrar Sesión en todos los dispositivos
                            </Button>
                            <Button>Actualizar Contraseña</Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

            </Tabs>
        </div>
    )
}
