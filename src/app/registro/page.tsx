"use client"

import { Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { AuthShell } from "@/components/auth/auth-shell"
import { RegisterForm } from "@/components/auth/register-form"
import { SocialButtons } from "@/components/auth/social-buttons"
import { isSafeInternalPath } from "@/lib/safe-path"

function RegisterContent() {
    const next = isSafeInternalPath(useSearchParams().get("next"), "/panel")
    const loginHref = `/ingresar?next=${encodeURIComponent(next)}`

    return (
        <AuthShell title="Crea tu cuenta" subtitle="Gratis y en un minuto. Tu teléfono y zona te los pedimos recién al reportar.">
            <SocialButtons next={next} />

            <div className="my-6 flex items-center gap-3 text-sm text-muted-foreground">
                <span className="h-px flex-1 bg-border" aria-hidden /> o con tu correo <span className="h-px flex-1 bg-border" aria-hidden />
            </div>

            <RegisterForm next={next} loginHref={loginHref} />

            <p className="mt-6 text-center text-xs leading-relaxed text-muted-foreground">
                Al registrarte aceptas los <Link href="/terminos" className="text-primary underline-offset-4 hover:underline">Términos</Link> y la <Link href="/privacidad" className="text-primary underline-offset-4 hover:underline">Política de Privacidad</Link>.
            </p>

            <p className="mt-6 text-center text-muted-foreground">
                ¿Ya tienes cuenta?{" "}
                <Link href={loginHref} className="inline-flex min-h-11 items-center font-semibold text-primary underline-offset-4 hover:underline">Inicia sesión</Link>
            </p>
        </AuthShell>
    )
}

export default function RegisterPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-background" />}>
            <RegisterContent />
        </Suspense>
    )
}
