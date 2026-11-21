"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast-modern"
import { isSafeInternalPath } from "@/lib/safe-path"
import { createClient } from "@/utils/supabase/client"

export function GoogleLoginButton({ next }: { next: string }) {
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()

    const handleGoogleLogin = async () => {
        setIsLoading(true)

        try {
            const safeNext = isSafeInternalPath(next, "/dashboard")
            const supabase = createClient()
            const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(safeNext)}`
            const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: { redirectTo },
            })

            if (error) {
                toast("No se pudo iniciar sesión con Google.", { type: "error" })
                setIsLoading(false)
            }
        } catch {
            toast("No se pudo iniciar sesión con Google.", { type: "error" })
            setIsLoading(false)
        }
    }

    return (
        <Button
            type="button"
            variant="outline"
            className="h-12 w-full rounded-xl border-input bg-card text-base font-semibold text-foreground hover:bg-accent"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            aria-busy={isLoading}
        >
            {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            ) : (
                <>
                    <svg aria-hidden="true" className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M21.35 12.23c0-.7-.06-1.37-.18-2.02H12v3.83h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.2Z" />
                        <path fill="#34A853" d="M12 21.75c2.63 0 4.84-.87 6.45-2.35l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.53A9.75 9.75 0 0 0 12 21.75Z" />
                        <path fill="#FBBC05" d="M6.54 13.84a5.86 5.86 0 0 1 0-3.68V7.63H3.3a9.75 9.75 0 0 0 0 8.74l3.24-2.53Z" />
                        <path fill="#EA4335" d="M12 6.13c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 3.23 14.63 2.25 12 2.25A9.75 9.75 0 0 0 3.3 7.63l3.24 2.53C7.31 7.85 9.46 6.13 12 6.13Z" />
                    </svg>
                    Continuar con Google
                </>
            )}
        </Button>
    )
}
