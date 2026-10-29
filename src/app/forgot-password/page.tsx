
"use client"

import { Suspense, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Link from "next/link"
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/toast-modern"
import { resetPasswordAction } from "@/app/auth/actions"
import { isSafeInternalPath } from "@/lib/safe-path"

const forgotPasswordSchema = z.object({
    email: z.string().email({ message: "Ingresa un correo electrónico válido." }),
})

type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>

function ForgotPasswordContent() {
    const searchParams = useSearchParams()
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordSchema>({
        resolver: zodResolver(forgotPasswordSchema),
    })

    const onSubmit = async (data: ForgotPasswordSchema) => {
        setIsLoading(true)
        try {
            const next = isSafeInternalPath(searchParams.get("next"), "/dashboard")
            const result = await resetPasswordAction(data.email, next)
            if (result?.error) {
                toast(result.error, { type: "error" })
            } else {
                setIsSuccess(true)
                toast("Correo de recuperación enviado", { type: "success" })
            }

        } catch (error) {
            toast("Ocurrió un error inesperado", { type: "error" })
        } finally {
            setIsLoading(false)
        }

    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative">

                {/* Header Decoration */}
                <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-blue-400 to-blue-600" />

                <div className="p-8 pt-10">

                    <div className="text-center mb-8">
                        <div className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-600 rotate-3">
                            <Mail className="h-8 w-8" />
                        </div>
                        <h1 className="text-xl font-black text-slate-800 tracking-tight">Recuperar Contraseña</h1>
                        <p className="text-sm text-slate-500 mt-2 px-2">
                            Ingresa tu correo y te enviaremos un enlace para restablecer tu acceso.
                        </p>
                    </div>

                    {!isSuccess ? (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Correo Electrónico</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                    <Input
                                        {...register("email")}
                                        placeholder="ejemplo@correo.com"
                                        className={`pl-11 h-12 bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-blue-500 ${errors.email ? 'border-red-500' : ''}`}
                                    />
                                </div>
                                {errors.email && <p className="text-xs text-red-500 font-medium ml-1">{errors.email.message}</p>}
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                disabled={isLoading}
                            >
                                {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Enviar Enlace"}
                            </Button>
                        </form>
                    ) : (
                        <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-green-50 text-green-600 p-4 rounded-2xl border border-green-100 flex items-center gap-3 text-left">
                                <CheckCircle2 className="h-8 w-8 shrink-0" />
                                <div className="space-y-1">
                                    <p className="font-bold text-sm">¡Correo Enviado!</p>
                                    <p className="text-xs leading-relaxed opacity-90">Revisa tu bandeja de entrada (y spam) para continuar con el proceso.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                        <Link
                            href="/login"
                            className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors group"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                            Volver al Login
                        </Link>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default function ForgotPasswordPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400">Cargando...</div>}>
            <ForgotPasswordContent />
        </Suspense>
    )
}
