
"use client"

import { Suspense, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Link from "next/link"
import { ArrowLeft, Loader2, CheckCircle2 } from "lucide-react"
import { AuthShell } from "@/components/auth/auth-shell"
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

        } catch {
            toast("Ocurrió un error inesperado", { type: "error" })
        } finally {
            setIsLoading(false)
        }

    }

    return (
        <AuthShell title="Recupera tu acceso" subtitle="Te enviaremos un enlace para crear una contraseña nueva.">
            {!isSuccess ? (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                    <div className="space-y-1.5">
                        <label htmlFor="email" className="text-sm font-semibold text-foreground">Correo</label>
                        <Input
                            id="email"
                            type="email"
                            autoComplete="email"
                            inputMode="email"
                            aria-invalid={!!errors.email}
                            aria-describedby={errors.email ? "email-error" : undefined}
                            {...register("email")}
                            className="h-12 rounded-xl border-input bg-card px-4 text-base"
                        />
                        {errors.email && <p id="email-error" className="text-sm text-destructive">{errors.email.message}</p>}
                    </div>
                    <Button type="submit" variant="cta" className="h-12 w-full rounded-xl text-base font-bold" disabled={isLoading} aria-busy={isLoading}>
                        {isLoading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden /> Enviando…</> : "Enviar enlace"}
                    </Button>
                </form>
            ) : (
                <div role="status" className="flex items-start gap-3 rounded-xl border border-success/40 bg-success/10 p-4 text-foreground">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden />
                    <p className="text-sm"><span className="font-semibold">Correo enviado.</span> Revisa tu bandeja de entrada y la carpeta de spam.</p>
                </div>
            )}

            <p className="mt-8 text-center">
                <Link href="/login" className="inline-flex min-h-11 items-center gap-2 font-semibold text-primary underline-offset-4 hover:underline">
                    <ArrowLeft className="h-4 w-4" aria-hidden /> Volver a iniciar sesión
                </Link>
            </p>
        </AuthShell>
    )
}

export default function ForgotPasswordPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-background" />}>
            <ForgotPasswordContent />
        </Suspense>
    )
}
