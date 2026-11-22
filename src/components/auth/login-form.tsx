
import { useState, useRef, useEffect, useActionState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { loginAction, resendConfirmationAction } from "@/app/auth/actions"
import type { LoginActionState } from "@/app/auth/actions"
import Link from "next/link"
import { Loader2, AlertTriangle, CheckCircle2, Eye, EyeOff, Mail, Lock } from "lucide-react"
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
    const emailRef = useRef<HTMLInputElement>(null)
    const rememberRef = useRef<HTMLInputElement>(null)
    // Recordar solo el correo (nunca la contraseña); la sesión ya persiste en cookie segura.
    useEffect(() => {
        try {
            const saved = localStorage.getItem("bmm.email")
            if (saved && emailRef.current && !emailRef.current.value) emailRef.current.value = saved
            if (!saved && localStorage.getItem("bmm.email.off") && rememberRef.current) rememberRef.current.checked = false
        } catch { /* sin storage: no pasa nada */ }
    }, [])
    const saveEmail = (e: React.FormEvent<HTMLFormElement>) => {
        try {
            const fd = new FormData(e.currentTarget)
            const email = String(fd.get("email") ?? "").trim()
            if (fd.get("remember") && email) { localStorage.setItem("bmm.email", email); localStorage.removeItem("bmm.email.off") }
            else { localStorage.removeItem("bmm.email"); localStorage.setItem("bmm.email.off", "1") }
        } catch { /* idem */ }
    }
    const alertRef = useRef<HTMLDivElement>(null)
    useEffect(() => { if (state?.error) alertRef.current?.focus() }, [state])

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
        <form action={formAction} onSubmit={saveEmail} className="space-y-5">
            <input type="hidden" name="next" value={next} />

            <div className="space-y-1.5">
                <label htmlFor="email" className={label}>Correo</label>
                <div className="group/field relative"><Mail aria-hidden className="pointer-events-none absolute left-4 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-muted-foreground transition-all duration-200 group-focus-within/field:scale-110 group-focus-within/field:text-primary" /><Input ref={emailRef} id="email" name="email" type="email" enterKeyHint="next" autoComplete="email" inputMode="email" required className={`${field} pl-12`} defaultValue={state.email || ""} aria-invalid={!!state?.validationErrors?.email} aria-describedby={state?.validationErrors?.email ? "email-error" : undefined} /></div>
                {state?.validationErrors?.email && <p id="email-error" className="text-sm text-destructive">{state.validationErrors.email[0]}</p>}
            </div>

            <div className="space-y-1.5">
                <div className="flex items-baseline justify-between">
                    <label htmlFor="password" className={label}>Contraseña</label>
                    <Link href={forgotHref} className="-my-3 inline-flex min-h-11 items-center text-sm font-medium text-primary underline-offset-4 hover:underline">¿La olvidaste?</Link>
                </div>
                <div className="group/field relative">
                    <Lock aria-hidden className="pointer-events-none absolute left-4 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-muted-foreground transition-all duration-200 group-focus-within/field:scale-110 group-focus-within/field:text-primary" />
                    <Input id="password" name="password" enterKeyHint="go" type={show ? "text" : "password"} autoComplete="current-password" required className={`${field} pl-12 pr-12`} aria-invalid={!!state?.validationErrors?.password} aria-describedby={state?.validationErrors?.password ? "password-error" : undefined} />
                    <button
                        type="button"
                        onClick={() => setShow((v) => !v)}
                        aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
                        aria-pressed={show}
                        className="absolute right-0.5 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                        {show ? <EyeOff className="h-5 w-5" aria-hidden /> : <Eye className="h-5 w-5" aria-hidden />}
                    </button>
                </div>
                {state?.validationErrors?.password && <p id="password-error" className="text-sm text-destructive">{state.validationErrors.password[0]}</p>}
            </div>

            <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm text-foreground">
                <input ref={rememberRef} type="checkbox" name="remember" defaultChecked className="h-5 w-5 rounded border-input accent-[var(--primary)]" />
                Recordar mi correo en este equipo
            </label>

            {state?.error && (
                <div ref={alertRef} tabIndex={-1} role="alert" className={`flex items-start gap-3 rounded-xl border p-4 text-sm text-foreground outline-none animate-in fade-in slide-in-from-top-1 ${state.needsConfirmation ? "border-warning/40 bg-warning/10" : "border-destructive/40 bg-destructive/10"}`}>
                    <AlertTriangle className={`mt-0.5 h-5 w-5 shrink-0 ${state.needsConfirmation ? "text-warning" : "text-destructive"}`} aria-hidden />
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
                {isPending ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden /> Ingresando…</> : "Ingresar"}
            </Button>
        </form>
    )
}
