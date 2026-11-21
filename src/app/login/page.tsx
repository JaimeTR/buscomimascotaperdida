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
        <AuthShell title="Inicia sesión">
            <LoginForm next={nextUrl} forgotHref={getForgotPasswordPath(nextUrl)} />

            <div className="my-6 flex items-center gap-3 text-sm text-muted-foreground" role="separator">
                <span className="h-px flex-1 bg-border" /> o <span className="h-px flex-1 bg-border" />
            </div>

            <GoogleLoginButton next={nextUrl} />

            <p className="mt-8 text-center text-sm text-muted-foreground">
                ¿No tienes cuenta?{" "}
                <Link href="/register" className="font-semibold text-primary underline-offset-4 hover:underline">Crear cuenta</Link>
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
