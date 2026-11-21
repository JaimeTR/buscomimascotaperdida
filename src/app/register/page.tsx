
"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { useEffect } from "react"
import { AuthShell } from "@/components/auth/auth-shell"
import { RegisterForm } from "@/components/auth/register-form"
import { createClient } from "@/utils/supabase/client"

export default function RegisterPage() {
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (session) {
                router.replace('/dashboard')
            }
        }
        checkUser()
    }, [router, supabase])

    return (
        <AuthShell title="Crea tu cuenta" subtitle="Es gratis. Publica tu caso y activa la red de tu zona.">
            <RegisterForm onSuccess={() => router.push('/login')} />

            <p className="mt-6 text-center text-xs leading-relaxed text-muted-foreground">
                Al registrarte aceptas los <Link href="/terminos" className="text-primary underline-offset-4 hover:underline">Términos</Link> y la <Link href="/privacidad" className="text-primary underline-offset-4 hover:underline">Política de Privacidad</Link>.
            </p>

            <p className="mt-6 text-center text-muted-foreground">
                ¿Ya tienes cuenta?{" "}
                <Link href="/login" className="inline-flex min-h-11 items-center font-semibold text-primary underline-offset-4 hover:underline">Inicia sesión</Link>
            </p>
        </AuthShell>
    )
}
