
import { useState } from "react"
import { useActionState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { loginAction, resendConfirmationAction } from "@/app/auth/actions"
import type { LoginActionState } from "@/app/auth/actions"
import { Loader2, AlertTriangle, CheckCircle2 } from "lucide-react"
import { useToast } from "@/components/ui/toast-modern"

// Define the initial state type
const initialState: LoginActionState = {
    error: "",
    validationErrors: undefined,
    needsConfirmation: false,
    email: undefined
}

export function LoginForm({ next }: { next: string }) {
    const [state, formAction, isPending] = useActionState(loginAction, initialState)
    const { toast } = useToast()
    const [isResending, setIsResending] = useState(false)

    const handleResend = async () => {
        if (!state.email) return;
        setIsResending(true)
        try {
            const result = await resendConfirmationAction(state.email)
            if (result.error) {
                toast(result.error, { type: 'error' })
            } else {
                toast("Correo de confirmación reenviado. Revisa tu bandeja.", { type: 'success' })
            }
        } catch {
            toast("Error al reenviar el correo.", { type: 'error' })
        } finally {
            setIsResending(false)
        }
    }

    return (
        <form action={formAction} className="space-y-4">
            <input type="hidden" name="next" value={next} />

            <div className="space-y-2">
                <Input name="email" type="email" placeholder="Correo electrónico" required className="h-12 bg-background border-border" defaultValue={state.email || ""} />
                {state?.validationErrors?.email && (
                    <p className="text-xs text-red-500">{state.validationErrors.email[0]}</p>
                )}
            </div>

            <div className="space-y-2">
                <Input name="password" type="password" placeholder="Contraseña" required className="h-12 bg-background border-border" />
                {state?.validationErrors?.password && (
                    <p className="text-xs text-red-500">{state.validationErrors.password[0]}</p>
                )}
            </div>

            {state?.error && (
                <div className={`p-4 rounded-lg text-sm flex gap-3 items-start animate-in fade-in slide-in-from-top-1 ${state.needsConfirmation ? 'bg-amber-50 border border-amber-200 text-amber-800' : 'bg-red-50 border border-red-200 text-red-600'}`}>
                    <div className="shrink-0 mt-0.5">
                        <AlertTriangle className={`h-5 w-5 ${state.needsConfirmation ? 'text-amber-600' : 'text-red-500'}`} />
                    </div>
                    <div className="space-y-2 flex-1">
                        <p className="font-medium leading-none">{state.error}</p>
                        {state.needsConfirmation && (
                            <div className="pt-1">
                                <p className="text-xs opacity-90 mb-2">
                                    Revisa tu bandeja de entrada o spam. Si no lo encuentras, podemos enviarlo de nuevo.
                                </p>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleResend}
                                    disabled={isResending}
                                    className="bg-card border-amber-300 hover:bg-amber-100 text-amber-900 h-8 text-xs w-full sm:w-auto"
                                >
                                    {isResending ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <CheckCircle2 className="h-3 w-3 mr-2" />}
                                    Reenviar confirmación
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <Button type="submit" className="w-full h-12 bg-primary hover:bg-primary font-bold shadow-lg shadow-teal-700/20" disabled={isPending} aria-busy={isPending}>
                {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Ingresar"}
            </Button>
        </form>
    )
}
