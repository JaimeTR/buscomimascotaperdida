"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Suspense } from "react"

import { AuthShell } from "@/components/auth/auth-shell"
import { LoginForm } from "@/components/auth/login-form"
import { SocialButtons } from "@/components/auth/social-buttons"
import { isSafeInternalPath } from "@/lib/safe-path"
import { getForgotPasswordPath } from "@/lib/auth-redirects"

function LoginContent() {
    const searchParams = useSearchParams()
    const nextUrl = isSafeInternalPath(searchParams.get("next"), "/panel")
    const needsAccount = searchParams.get("reason") === "report"
    const failed = searchParams.get("error") === "auth-callback-failed"

    return (
        <AuthShell
            title="Inicia sesión"
            subtitle={needsAccount ? "Para reportar necesitas una cuenta. Entra o crea una en un minuto: es gratis." : "Entra para publicar tu caso o seguir tus pistas."}
        >
            {failed && <p role="alert" className="mb-5 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm font-medium text-foreground">No pudimos completar el acceso. Inténtalo de nuevo.</p>}
            <SocialButtons next={nextUrl} />

            <div className="my-6 flex items-center gap-3 text-sm text-muted-foreground">
                <span className="h-px flex-1 bg-border" aria-hidden /> o con tu correo <span className="h-px flex-1 bg-border" aria-hidden />
            </div>

            <LoginForm next={nextUrl} forgotHref={getForgotPasswordPath(nextUrl)} />

            <p className="mt-8 text-center text-muted-foreground">
                ¿No tienes cuenta?{" "}
                <Link href={`/registro?next=${encodeURIComponent(nextUrl)}`} className="inline-flex min-h-11 items-center font-semibold text-primary underline-offset-4 hover:underline">Crear cuenta</Link>
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
