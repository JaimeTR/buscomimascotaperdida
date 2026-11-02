"use client"

import { useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/toast-modern"
import {
    completeProfileSchema,
    CompleteProfileSchema,
} from "@/lib/schemas/auth"
import { createClient } from "@/utils/supabase/client"
import { ProfileLocationFields } from "@/components/auth/profile-location-fields"

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
    const showDistrict = missing.district || missing.department

    const {
        register,
        handleSubmit,
        setValue,
        control,
        formState: { errors },
    } = useForm<CompleteProfileSchema>({
        resolver: zodResolver(completeProfileSchema),
        defaultValues: {
            phone: profile.phone || "",
            department: profile.department || "",
            district: profile.district || "",
        },
    })

    const department = useWatch({ control, name: "department" })
    const district = useWatch({ control, name: "district" })

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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-950/50 p-4" role="dialog" aria-modal="true" aria-labelledby="complete-profile-title">
            <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl md:p-8">
                <div className="mb-6 space-y-2">
                    <h2 id="complete-profile-title" className="text-2xl font-bold text-stone-900">Completa tu perfil</h2>
                    <p className="text-sm text-stone-500">
                        Necesitamos estos datos para identificarte y avisarte sobre tu reporte.
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    {missing.phone && (
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-stone-500">Teléfono / WhatsApp</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" />
                                <Input
                                    placeholder="987 654 321"
                                    className={`h-12 bg-stone-50 pl-10 ${errors.phone ? "border-red-500" : ""}`}
                                    {...register("phone")}
                                />
                            </div>
                            {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
                        </div>
                    )}

                    {(missing.department || showDistrict) && (
                        <ProfileLocationFields
                            department={department}
                            district={district}
                            onDepartmentChange={(value) => {
                                setValue("department", value, { shouldValidate: true })
                                setValue("district", "", { shouldValidate: true })
                            }}
                            onDistrictChange={(value) => setValue("district", value, { shouldValidate: true })}
                            departmentError={errors.department?.message}
                            districtError={showDistrict ? errors.district?.message : undefined}
                        />
                    )}

                    <Button type="submit" className="h-12 w-full bg-teal-800 font-bold hover:bg-teal-800" disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Guardar y continuar
                    </Button>
                </form>
            </div>
        </div>
    )
}
