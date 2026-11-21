"use client"

import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useEffect, Suspense } from "react"

import { AuthShell } from "@/components/auth/auth-shell"
import { LoginForm } from "@/components/auth/login-form"
import { GoogleLoginButton } from "@/components/auth/google-login-button"
import { createClient } from "@/utils/supabase/client"
import { isSafeInternalPath } from "@/lib/safe-path"
import { getForgotPasswordPath } from "@/lib/auth-redirects"

function LoginContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const supabase = createClient()

    const nextUrl = isSafeInternalPath(searchParams.get("next"), "/dashboard")

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (session) router.replace(nextUrl)
        }
        checkUser()
    }, [router, nextUrl, supabase])

    return (
        <AuthShell title="Inicia sesión" subtitle="Entra para publicar tu caso o seguir tus pistas.">
            <GoogleLoginButton next={nextUrl} />

            <div className="my-6 flex items-center gap-3 text-sm text-muted-foreground">
                <span className="h-px flex-1 bg-border" aria-hidden /> o con tu correo <span className="h-px flex-1 bg-border" aria-hidden />
            </div>

            <LoginForm next={nextUrl} forgotHref={getForgotPasswordPath(nextUrl)} />

            <p className="mt-8 text-center text-muted-foreground">
                ¿No tienes cuenta?{" "}
                <Link href="/register" className="inline-flex min-h-11 items-center font-semibold text-primary underline-offset-4 hover:underline">Crear cuenta</Link>
            </p>
        </AuthShell>
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-background" />}>
            <LoginContent />
        </Suspense>
    )
}
