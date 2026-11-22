"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { registerSchema, RegisterSchema } from "@/lib/schemas/auth"
import { registerAction, resendConfirmationAction } from "@/app/auth/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Eye, EyeOff, MailCheck, Mail, Lock, User, UserPlus } from "lucide-react"
import { useToast } from "@/components/ui/toast-modern"
import { useRouter } from "next/navigation"
import Link from "next/link"

const label = "text-sm font-semibold text-foreground"
const field = "h-12 rounded-xl border-input bg-card px-4 text-base"

export function RegisterForm({ next, loginHref }: { next: string; loginHref: string }) {
    const { toast } = useToast()
    const router = useRouter()
    const [show, setShow] = useState(false)
    const [pendingEmail, setPendingEmail] = useState<string | null>(null)
    const [resending, setResending] = useState(false)
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterSchema>({ resolver: zodResolver(registerSchema) })

    const onSubmit = async (data: RegisterSchema) => {
        try {
            const result = await registerAction(data, next)
            if (result?.code === "user_already_exists") {
                toast(result.error!, { type: "warning", title: "Ya tienes cuenta" })
                router.push(loginHref)
            } else if (result?.error) {
                toast(result.error, { type: "error" })
            } else if (result?.needsConfirmation) {
                setPendingEmail(data.email)
            } else if (result?.success) {
                router.push(next)
                router.refresh()
            }
        } catch {
            toast("Ocurrió un error inesperado. Inténtalo de nuevo.", { type: "error" })
        }
    }

    const resend = async () => {
        if (!pendingEmail) return
        setResending(true)
        const r = await resendConfirmationAction(pendingEmail)
        toast(r.error ?? "Te enviamos otro correo.", { type: r.error ? "error" : "success" })
        setResending(false)
    }

    if (pendingEmail) {
        return (
            <div role="status" className="space-y-4 rounded-2xl border bg-card p-6 text-center">
                <MailCheck className="mx-auto h-10 w-10 text-primary" aria-hidden />
                <h2 className="font-display text-2xl text-primary">Revisa tu correo</h2>
                <p className="text-muted-foreground">Enviamos un enlace a <strong className="text-foreground">{pendingEmail}</strong>. Tócalo para activar tu cuenta; si no lo ves, mira en spam.</p>
                <Button type="button" variant="outline" onClick={resend} disabled={resending} className="h-11 rounded-xl">
                    {resending && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />} Reenviar correo
                </Button>
                <p className="text-sm"><button type="button" onClick={() => setPendingEmail(null)} className="font-medium text-primary underline-offset-4 hover:underline">Corregir mi correo</button> · <Link href={loginHref} className="font-medium text-primary underline-offset-4 hover:underline">Ya confirmé</Link></p>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <div className="space-y-1.5">
                <label htmlFor="reg-fullName" className={label}>Nombre</label>
                <div className="group/field relative"><User aria-hidden className="pointer-events-none absolute left-4 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-muted-foreground transition-all duration-200 group-focus-within/field:scale-110 group-focus-within/field:text-primary" /><Input id="reg-fullName" autoComplete="name" enterKeyHint="next" className={`${field} pl-12`} aria-invalid={!!errors.fullName} {...register("fullName")} /></div>
                {errors.fullName && <p className="text-sm text-destructive">{errors.fullName.message}</p>}
            </div>

            <div className="space-y-1.5">
                <label htmlFor="reg-email" className={label}>Correo</label>
                <div className="group/field relative"><Mail aria-hidden className="pointer-events-none absolute left-4 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-muted-foreground transition-all duration-200 group-focus-within/field:scale-110 group-focus-within/field:text-primary" /><Input id="reg-email" type="email" inputMode="email" autoComplete="email" enterKeyHint="next" className={`${field} pl-12`} aria-invalid={!!errors.email} {...register("email")} /></div>
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
                <label htmlFor="reg-password" className={label}>Contraseña</label>
                <div className="group/field relative">
                    <Lock aria-hidden className="pointer-events-none absolute left-4 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-muted-foreground transition-all duration-200 group-focus-within/field:scale-110 group-focus-within/field:text-primary" />
                    <Input id="reg-password" type={show ? "text" : "password"} autoComplete="new-password" enterKeyHint="go" className={`${field} pl-12 pr-12`} aria-invalid={!!errors.password} aria-describedby="reg-password-hint" {...register("password")} />
                    <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"} aria-pressed={show}
                        className="absolute right-0.5 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                        {show ? <EyeOff className="h-5 w-5" aria-hidden /> : <Eye className="h-5 w-5" aria-hidden />}
                    </button>
                </div>
                <p id="reg-password-hint" className={errors.password ? "text-sm text-destructive" : "text-sm text-muted-foreground"}>{errors.password?.message ?? "Mínimo 8 caracteres."}</p>
            </div>

            <Button type="submit" variant="cta" className="h-12 w-full rounded-xl text-base font-bold" disabled={isSubmitting} aria-busy={isSubmitting}>
                {isSubmitting ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden /> Creando cuenta…</> : <><UserPlus className="mr-2 h-5 w-5" aria-hidden /> Crear cuenta</>}
            </Button>
        </form>
    )
}
