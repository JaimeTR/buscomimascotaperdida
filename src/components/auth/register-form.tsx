
"use client"

import { useState, useActionState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { registerSchema, RegisterSchema } from "@/lib/schemas/auth"
import { registerAction } from "@/app/auth/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, User, Phone, Mail, Lock, Eye, EyeOff } from "lucide-react"
import { useToast } from "@/components/ui/toast-modern"
import { useRouter } from "next/navigation"

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
        watch,
        formState: { errors },
    } = useForm<RegisterSchema>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            department: "",
            district: ""
        }
    })

    const department = watch("department")

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
        } catch (error: any) {
            console.error("Register Error:", error)
            // Ignore standard Next.js redirect errors if they happen
            if (error?.message === 'NEXT_REDIRECT') return;

            toast("Ocurrió un error inesperado al procesar el registro.", { type: 'error' })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2 animate-in fade-in slide-in-from-left-2 duration-300">
                <label className="text-xs font-bold text-slate-500 uppercase">Nombre Completo</label>
                <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                        placeholder="Juan Pérez"
                        className={`pl-10 h-12 bg-slate-50 border-slate-200 ${errors.fullName ? 'border-red-500' : ''}`}
                        {...register("fullName")}
                    />
                </div>
                {errors.fullName && <p className="text-xs text-red-500">{errors.fullName.message}</p>}
            </div>

            <div className="space-y-2 animate-in fade-in slide-in-from-left-2 duration-300 delay-75">
                <label className="text-xs font-bold text-slate-500 uppercase">Teléfono / WhatsApp</label>
                <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                        placeholder="987 654 321"
                        className={`pl-10 h-12 bg-slate-50 border-slate-200 ${errors.phone ? 'border-red-500' : ''}`}
                        {...register("phone")}
                    />
                </div>
                {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-left-2 duration-300 delay-100">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Departamento</label>
                    <Select onValueChange={(v) => { setValue("department", v); setValue("district", ""); }}>
                        <SelectTrigger className={`h-12 bg-slate-50 border-slate-200 ${errors.department ? 'border-red-500' : ''}`}>
                            <SelectValue placeholder="DPTO" />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.keys(PERU_DATA).map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    {errors.department && <p className="text-xs text-red-500">{errors.department.message}</p>}
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Distrito</label>
                    <Select onValueChange={(v) => setValue("district", v)} disabled={!department}>
                        <SelectTrigger className={`h-12 bg-slate-50 border-slate-200 ${errors.district ? 'border-red-500' : ''}`}>
                            <SelectValue placeholder="DIST" />
                        </SelectTrigger>
                        <SelectContent>
                            {department && PERU_DATA[department]?.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    {errors.district && <p className="text-xs text-red-500">{errors.district.message}</p>}
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Correo Electrónico</label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                        type="email"
                        placeholder="hola@ejemplo.com"
                        className={`pl-10 h-12 bg-slate-50 border-slate-200 ${errors.email ? 'border-red-500' : ''}`}
                        {...register("email")}
                    />
                </div>
                {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Contraseña</label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className={`pl-10 pr-12 h-12 bg-slate-50 border-slate-200 ${errors.password ? 'border-red-500' : ''}`}
                        {...register("password")}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
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
