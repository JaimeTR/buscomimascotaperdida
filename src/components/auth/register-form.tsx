
"use client"

import { useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { registerSchema, RegisterSchema } from "@/lib/schemas/auth"
import { registerAction } from "@/app/auth/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, User, Phone, Mail, Lock, Eye, EyeOff } from "lucide-react"
import { useToast } from "@/components/ui/toast-modern"
import { useRouter } from "next/navigation"
import { ProfileLocationFields } from "@/components/auth/profile-location-fields"

interface RegisterFormProps {
    onSuccess?: () => void
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
    const { toast } = useToast()
    const router = useRouter()
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    // React Hook Form
    const {
        register,
        handleSubmit,
        setValue,
        control,
        formState: { errors },
    } = useForm<RegisterSchema>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            department: "",
            district: ""
        }
    })

    const department = useWatch({ control, name: "department" })
    const district = useWatch({ control, name: "district" })

    const onSubmit = async (data: RegisterSchema) => {
        setIsLoading(true)
        try {
            const result = await registerAction(data)

            if (result?.error) {
                if (result.code === "user_already_exists") {
                    toast(result.error, {
                        type: 'warning',
                        title: "Cuenta Existente",

                    })
                    if (onSuccess) {
                        onSuccess() // Redirect to login tab
                    }
                } else {
                    toast(result.error, { type: 'error' })
                }
            } else if (result?.validationErrors) {
                // Handle field errors from server
                Object.values(result.validationErrors).flat().forEach(err => {
                    toast(err, { type: 'error' })
                })
            } else if (result?.success) {
                toast("Registro exitoso. Inicia sesión para continuar.", { type: 'success', title: "¡Cuenta Creada!" })

                // Small delay to ensure toast is seen, then redirect
                setTimeout(() => {
                    if (onSuccess) {
                        onSuccess()
                    } else {
                        router.push('/login') // Fallback redirect
                    }
                }, 1000)
            }
        } catch {
            console.error("register action failed")
            // Ignore standard Next.js redirect errors if they happen
            toast("Ocurrió un error inesperado al procesar el registro.", { type: 'error' })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2 animate-in fade-in slide-in-from-left-2 duration-300">
                <label className="text-xs font-bold text-stone-500 uppercase">Nombre Completo</label>
                <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
                    <Input
                        placeholder="Juan Pérez"
                        className={`pl-10 h-12 bg-stone-50 border-stone-200 ${errors.fullName ? 'border-red-500' : ''}`}
                        {...register("fullName")}
                    />
                </div>
                {errors.fullName && <p className="text-xs text-red-500">{errors.fullName.message}</p>}
            </div>

            <div className="space-y-2 animate-in fade-in slide-in-from-left-2 duration-300 delay-75">
                <label className="text-xs font-bold text-stone-500 uppercase">Teléfono / WhatsApp</label>
                <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
                    <Input
                        placeholder="987 654 321"
                        className={`pl-10 h-12 bg-stone-50 border-stone-200 ${errors.phone ? 'border-red-500' : ''}`}
                        {...register("phone")}
                    />
                </div>
                {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
            </div>

            <div className="animate-in fade-in slide-in-from-left-2 duration-300 delay-100">
                <ProfileLocationFields
                    department={department}
                    district={district}
                    onDepartmentChange={(value) => {
                        setValue("department", value, { shouldValidate: true })
                        setValue("district", "", { shouldValidate: true })
                    }}
                    onDistrictChange={(value) => setValue("district", value, { shouldValidate: true })}
                    departmentError={errors.department?.message}
                    districtError={errors.district?.message}
                    compact
                />
            </div>

            <div className="space-y-2">
                <label className="text-xs font-bold text-stone-500 uppercase">Correo Electrónico</label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
                    <Input
                        type="email"
                        placeholder="hola@ejemplo.com"
                        className={`pl-10 h-12 bg-stone-50 border-stone-200 ${errors.email ? 'border-red-500' : ''}`}
                        {...register("email")}
                    />
                </div>
                {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
                <label className="text-xs font-bold text-stone-500 uppercase">Contraseña</label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
                    <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className={`pl-10 pr-12 h-12 bg-stone-50 border-stone-200 ${errors.password ? 'border-red-500' : ''}`}
                        {...register("password")}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                    >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                </div>
                {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            </div>

            <Button
                type="submit"
                className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-lg font-bold shadow-lg shadow-emerald-500/20"
                disabled={isLoading}
            >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Crear Cuenta"}
            </Button>
        </form>
    )
}
