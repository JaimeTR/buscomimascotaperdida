"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/toast-modern"
import {
    completeProfileSchema,
    CompleteProfileSchema,
} from "@/lib/schemas/auth"
import { createClient } from "@/utils/supabase/client"

const PERU_DATA: Record<string, string[]> = {
    "Lima": [
        "Ancón", "Ate", "Barranco", "Breña", "Carabayllo", "Chaclacayo", "Chorrillos",
        "Cieneguilla", "Comas", "El Agustino", "Independencia", "Jesús María",
        "La Molina", "La Victoria", "Lima", "Lince", "Los Olivos", "Lurigancho",
        "Lurín", "Magdalena del Mar", "Miraflores", "Pachacámac", "Pucusana",
        "Pueblo Libre", "Puente Piedra", "Punta Hermosa", "Punta Negra", "Rímac",
        "San Bartolo", "San Borja", "San Isidro", "San Juan de Lurigancho",
        "San Juan de Miraflores", "San Luis", "San Martín de Porres", "San Miguel",
        "Santa Anita", "Santa María del Mar", "Santa Rosa", "Santiago de Surco",
        "Surquillo", "Villa El Salvador", "Villa María del Triunfo"
    ],
    "Arequipa": ["Arequipa", "Yanahuara", "Cayma", "Selva Alegre", "Miraflores", "Jose Luis Bustamante"],
    "Cusco": ["Cusco", "San Jerónimo", "San Sebastián", "Wanchaq"],
    "La Libertad": ["Trujillo", "Victor Larco", "Huanchaco", "Moche"],
    "Piura": ["Piura", "Castilla", "Catacaos"],
    "Lambayeque": ["Chiclayo", "Jose Leonardo Ortiz", "La Victoria"]
}

interface Profile {
    id: string
    phone?: string | null
    department?: string | null
    district?: string | null
}

interface CompleteProfileDialogProps {
    profile: Profile
    onCompleted: (profile: Profile & CompleteProfileSchema) => void
}

export function CompleteProfileDialog({ profile, onCompleted }: CompleteProfileDialogProps) {
    const { toast } = useToast()
    const supabase = createClient()
    const [isSaving, setIsSaving] = useState(false)
    const missing = {
        phone: !profile.phone?.trim(),
        department: !profile.department?.trim(),
        district: !profile.district?.trim(),
    }

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<CompleteProfileSchema>({
        resolver: zodResolver(completeProfileSchema),
        defaultValues: {
            phone: profile.phone || "",
            department: profile.department || "",
            district: profile.district || "",
        },
    })

    const department = watch("department")

    const onSubmit = async (values: CompleteProfileSchema) => {
        setIsSaving(true)
        try {
            const updates: Partial<CompleteProfileSchema> = {}
            if (missing.phone) updates.phone = values.phone
            if (missing.department) updates.department = values.department
            if (missing.district) updates.district = values.district

            const { data, error } = await supabase
                .from("profiles")
                .update(updates)
                .eq("id", profile.id)
                .select("id, phone, department, district")
                .single()

            if (error) throw error

            toast("Tu perfil está listo para crear reportes.", { type: "success", title: "¡Perfil completado!" })
            onCompleted(data)
        } catch (error: unknown) {
            console.error("Error completing profile:", error)
            const message = error instanceof Error ? error.message : "No pudimos guardar tu perfil."
            toast(message, { type: "error" })
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4" role="dialog" aria-modal="true" aria-labelledby="complete-profile-title">
            <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl md:p-8">
                <div className="mb-6 space-y-2">
                    <h2 id="complete-profile-title" className="text-2xl font-bold text-slate-900">Completa tu perfil</h2>
                    <p className="text-sm text-slate-500">
                        Necesitamos estos datos para identificarte y avisarte sobre tu reporte.
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    {missing.phone && (
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-slate-500">Teléfono / WhatsApp</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                                <Input
                                    placeholder="987 654 321"
                                    className={`h-12 bg-slate-50 pl-10 ${errors.phone ? "border-red-500" : ""}`}
                                    {...register("phone")}
                                />
                            </div>
                            {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
                        </div>
                    )}

                    {missing.department && (
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-slate-500">Departamento</label>
                            <Select onValueChange={(value) => {
                                setValue("department", value, { shouldValidate: true })
                                setValue("district", "", { shouldValidate: true })
                            }}>
                                <SelectTrigger className={`h-12 bg-slate-50 ${errors.department ? "border-red-500" : ""}`}>
                                    <SelectValue placeholder="Selecciona tu departamento" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.keys(PERU_DATA).map((value) => (
                                        <SelectItem key={value} value={value}>{value}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.department && <p className="text-xs text-red-500">{errors.department.message}</p>}
                        </div>
                    )}

                    {missing.district && (
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-slate-500">Distrito</label>
                            <Select
                                onValueChange={(value) => setValue("district", value, { shouldValidate: true })}
                                disabled={!department}
                            >
                                <SelectTrigger className={`h-12 bg-slate-50 ${errors.district ? "border-red-500" : ""}`}>
                                    <SelectValue placeholder="Selecciona tu distrito" />
                                </SelectTrigger>
                                <SelectContent>
                                    {department && PERU_DATA[department]?.map((value) => (
                                        <SelectItem key={value} value={value}>{value}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.district && <p className="text-xs text-red-500">{errors.district.message}</p>}
                        </div>
                    )}

                    <Button type="submit" className="h-12 w-full bg-blue-600 font-bold hover:bg-blue-700" disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Guardar y continuar
                    </Button>
                </form>
            </div>
        </div>
    )
}
