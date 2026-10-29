
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Lock, Loader2, ArrowRight, Eye, EyeOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/utils/supabase/client"
import { useToast } from "@/components/ui/toast-modern"

export default function UpdatePasswordPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const { toast } = useToast()
    const supabase = createClient()

    // Función para traducir errores de Supabase al español
    const translateError = (errorMessage: string): string => {
        const translations: Record<string, string> = {
            // Password errors
            'New password should be different from the old password': 'La nueva contraseña debe ser diferente a la anterior',
            'Password should be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres',
            'Password is too weak': 'La contraseña es demasiado débil',
            'Invalid password': 'Contraseña inválida',

            // Auth errors
            'Invalid login credentials': 'Credenciales de inicio de sesión inválidas',
            'Email not confirmed': 'Email no confirmado',
            'User not found': 'Usuario no encontrado',
            'Invalid email': 'Email inválido',
            'Email already registered': 'Email ya registrado',

            // Session errors
            'Session expired': 'Sesión expirada',
            'Refresh token not found': 'Token de sesión no encontrado',
            'Invalid refresh token': 'Token de sesión inválido',

            // General errors
            'Unable to validate email address: invalid format': 'Formato de email inválido',
            'Network request failed': 'Error de conexión',
        }

        // Buscar traducción exacta
        if (translations[errorMessage]) {
            return translations[errorMessage]
        }

        // Buscar traducción parcial
        for (const [key, value] of Object.entries(translations)) {
            if (errorMessage.toLowerCase().includes(key.toLowerCase())) {
                return value
            }
        }

        // Si no hay traducción, devolver mensaje genérico en español
        return 'Error al actualizar la contraseña. Por favor intenta de nuevo.'
    }

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!password || !confirmPassword) {
            toast("Por favor completa todos los campos", { type: 'error' })
            return
        }

        if (password !== confirmPassword) {
            toast("Las contraseñas no coinciden", { type: 'error' })
            return
        }

        if (password.length < 6) {
            toast("La contraseña debe tener al menos 6 caracteres", { type: 'error' })
            return
        }

        setIsLoading(true)

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            })

            if (error) {
                // Traducir el error al español
                const errorMessageSpanish = translateError(error.message)
                throw new Error(errorMessageSpanish)
            }

            toast("Contraseña actualizada con éxito", { type: 'success', title: "¡Listo!" })

            // Redirigir al dashboard después de 1 segundo
            setTimeout(() => {
                router.push('/dashboard')
            }, 1000)
        } catch (error: any) {
            toast(error.message || "Error al actualizar la contraseña", { type: 'error' })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">

            <div className="mb-8 text-center flex flex-col items-center">
                <Link href="/" className="group mb-6">
                    <img
                        src="/logo_symbol.png"
                        alt="Logo"
                        className="h-24 w-auto object-contain transition-transform group-hover:scale-105"
                    />
                </Link>
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Actualizar Contraseña</h1>
                    <p className="text-blue-500 font-bold text-[10px] uppercase tracking-[0.2em] px-4 opacity-80">
                        Crea una nueva clave segura para tu cuenta
                    </p>
                </div>
            </div>

            <div className="bg-white w-full max-w-md rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
                <div className="p-8">
                    <form onSubmit={handleUpdatePassword} className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Nueva Contraseña</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        className="pl-10 pr-12 h-12 bg-slate-50 border-slate-200"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dynamic-transition"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Confirmar Contraseña</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        className="pl-10 h-12 bg-slate-50 border-slate-200"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-lg font-bold shadow-lg shadow-blue-500/20"
                            disabled={isLoading}
                        >
                            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Guardar Nueva Clave <ArrowRight className="ml-2 h-5 w-5" /></>}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    )
}
