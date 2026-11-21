
import { useState } from "react"
import { useActionState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { loginAction, resendConfirmationAction } from "@/app/auth/actions"
import type { LoginActionState } from "@/app/auth/actions"
import Link from "next/link"
import { Loader2, AlertTriangle, CheckCircle2, Eye, EyeOff } from "lucide-react"
import { useToast } from "@/components/ui/toast-modern"

// Define the initial state type
const initialState: LoginActionState = {
    error: "",
    validationErrors: undefined,
    needsConfirmation: false,
    email: undefined
}

const label = "text-sm font-semibold text-foreground"
const field = "h-12 rounded-xl border-input bg-card px-4 text-base"

export function LoginForm({ next, forgotHref }: { next: string; forgotHref: string }) {
    const [state, formAction, isPending] = useActionState(loginAction, initialState)
    const { toast } = useToast()
    const [isResending, setIsResending] = useState(false)
    const [show, setShow] = useState(false)

    const handleResend = async () => {
        if (!state.email) return
        setIsResending(true)
        try {
            const result = await resendConfirmationAction(state.email)
            if (result.error) toast(result.error, { type: "error" })
            else toast("Correo de confirmación reenviado. Revisa tu bandeja.", { type: "success" })
        } catch {
            toast("Error al reenviar el correo.", { type: "error" })
        } finally {
            setIsResending(false)
        }
    }

    return (
        <form action={formAction} className="space-y-5">
            <input type="hidden" name="next" value={next} />

            <div className="space-y-1.5">
                <label htmlFor="email" className={label}>Correo</label>
                <Input id="email" name="email" type="email" autoComplete="email" inputMode="email" required className={field} defaultValue={state.email || ""} aria-invalid={!!state?.validationErrors?.email} />
                {state?.validationErrors?.email && <p className="text-sm text-destructive">{state.validationErrors.email[0]}</p>}
            </div>

            <div className="space-y-1.5">
                <div className="flex items-baseline justify-between">
                    <label htmlFor="password" className={label}>Contraseña</label>
                    <Link href={forgotHref} className="text-sm font-medium text-primary underline-offset-4 hover:underline">¿La olvidaste?</Link>
                </div>
                <div className="relative">
                    <Input id="password" name="password" type={show ? "text" : "password"} autoComplete="current-password" required className={`${field} pr-12`} aria-invalid={!!state?.validationErrors?.password} />
                    <button
                        type="button"
                        onClick={() => setShow((v) => !v)}
                        aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
                        aria-pressed={show}
                        className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                        {show ? <EyeOff className="h-5 w-5" aria-hidden /> : <Eye className="h-5 w-5" aria-hidden />}
                    </button>
                </div>
                {state?.validationErrors?.password && <p className="text-sm text-destructive">{state.validationErrors.password[0]}</p>}
            </div>

            {state?.error && (
                <div role="alert" className={`flex items-start gap-3 rounded-xl border p-4 text-sm animate-in fade-in slide-in-from-top-1 ${state.needsConfirmation ? "border-warning/30 bg-warning/10 text-warning" : "border-destructive/30 bg-destructive/10 text-destructive"}`}>
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
                    <div className="flex-1 space-y-2">
                        <p className="font-medium">{state.error}</p>
                        {state.needsConfirmation && (
                            <Button type="button" variant="outline" size="sm" onClick={handleResend} disabled={isResending} className="h-9 bg-card text-foreground">
                                {isResending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                                Reenviar confirmación
                            </Button>
                        )}
                    </div>
                </div>
            )}

            <Button type="submit" variant="cta" className="h-12 w-full rounded-xl text-base font-bold" disabled={isPending} aria-busy={isPending}>
                {isPending ? <Loader2 className="h-5 w-5 animate-spin" aria-label="Ingresando" /> : "Ingresar"}
            </Button>
        </form>
    )
}
