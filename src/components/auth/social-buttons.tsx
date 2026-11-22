"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import type { Provider } from "@supabase/supabase-js"

import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast-modern"
import { isSafeInternalPath } from "@/lib/safe-path"
import { createClient } from "@/utils/supabase/client"

const GoogleIcon = () => (
    <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M21.35 12.23c0-.7-.06-1.37-.18-2.02H12v3.83h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.2Z" />
        <path fill="#34A853" d="M12 21.75c2.63 0 4.84-.87 6.45-2.35l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.53A9.75 9.75 0 0 0 12 21.75Z" />
        <path fill="#FBBC05" d="M6.54 13.84a5.86 5.86 0 0 1 0-3.68V7.63H3.3a9.75 9.75 0 0 0 0 8.74l3.24-2.53Z" />
        <path fill="#EA4335" d="M12 6.13c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 3.23 14.63 2.25 12 2.25A9.75 9.75 0 0 0 3.3 7.63l3.24 2.53C7.31 7.85 9.46 6.13 12 6.13Z" />
    </svg>
)

const FacebookIcon = () => (
    <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24">
        <path fill="#1877F2" d="M24 12a12 12 0 1 0-13.88 11.85v-8.38H7.08V12h3.04V9.36c0-3 1.79-4.67 4.53-4.67 1.31 0 2.69.23 2.69.23v2.95h-1.52c-1.49 0-1.96.93-1.96 1.88V12h3.33l-.53 3.47h-2.8v8.38A12 12 0 0 0 24 12Z" />
    </svg>
)

// Facebook oculto hasta configurar la app de Meta y activarlo en Supabase; poner en true para mostrarlo.
const FACEBOOK_ENABLED = false

const PROVIDERS: { id: Extract<Provider, "google" | "facebook">; label: string; Icon: () => React.JSX.Element }[] = [
    { id: "google", label: "Continuar con Google", Icon: GoogleIcon },
    ...(FACEBOOK_ENABLED ? [{ id: "facebook" as const, label: "Continuar con Facebook", Icon: FacebookIcon }] : []),
]

// Acceso con un clic (OAuth): mismo componente para login y registro.
export function SocialButtons({ next }: { next: string }) {
    const [loading, setLoading] = useState<string | null>(null)
    const { toast } = useToast()

    const go = async (provider: (typeof PROVIDERS)[number]["id"]) => {
        setLoading(provider)
        try {
            const safeNext = isSafeInternalPath(next, "/panel")
            const { error } = await createClient().auth.signInWithOAuth({
                provider,
                options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(safeNext)}` },
            })
            if (error) throw error
        } catch {
            toast("No pudimos conectar con ese servicio. Prueba con tu correo.", { type: "error" })
            setLoading(null)
        }
    }

    return (
        <div className="space-y-3">
            {PROVIDERS.map(({ id, label, Icon }) => (
                <Button
                    key={id}
                    type="button"
                    variant="outline"
                    className="h-12 w-full gap-2 rounded-xl border-input bg-card text-base font-semibold text-foreground hover:bg-accent"
                    onClick={() => go(id)}
                    disabled={loading !== null}
                    aria-busy={loading === id}
                >
                    {loading === id ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> : <Icon />}
                    {label}
                </Button>
            ))}
        </div>
    )
}
