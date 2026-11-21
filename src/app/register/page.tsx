
"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { useEffect } from "react"
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
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">

            <div className="mb-8 text-center flex flex-col items-center">
                <Link href="/" className="group mb-6">
                    <img
                        src="/logo_symbol.svg"
                        alt="Logo"
                        className="h-24 w-auto object-contain transition-transform group-hover:scale-105"
                    />
                </Link>
                <div className="space-y-1">
                    <h1 className="font-display text-3xl uppercase tracking-wide text-primary">Únete a la comunidad</h1>
                    <p className="text-primary font-bold text-[10px] uppercase tracking-[0.2em] px-4 opacity-80">
                        Registro de Usuario
                    </p>
                </div>
            </div>

            <div className="bg-card w-full max-w-md rounded-3xl shadow-xl border border-border overflow-hidden">
                <div className="p-8">

                    <div className="mb-6 text-center">
                        <h2 className="text-xl font-bold text-foreground">Crear una cuenta</h2>
                        <p className="text-sm text-muted-foreground">Completa tus datos para empezar</p>
                    </div>

                    <RegisterForm onSuccess={() => router.push('/login')} />

                    <div className="mt-8 pt-6 border-t border-border text-center">
                        <p className="text-sm text-muted-foreground">
                            ¿Ya tienes una cuenta?{" "}
                            <Link href="/login" className="font-bold text-primary hover:text-primary hover:underline">
                                Inicia Sesión
                            </Link>
                        </p>
                    </div>

                    <p className="text-center text-xs text-muted-foreground leading-relaxed px-4 mt-6">
                        Al registrarte aceptas nuestros <Link href="/terminos" className="text-primary hover:underline">Términos</Link> y <Link href="/privacidad" className="text-primary hover:underline">Política de Privacidad</Link>.
                    </p>

                </div>
            </div>

        </div>
    )
}
