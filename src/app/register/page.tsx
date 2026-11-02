
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
        <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-4">

            <div className="mb-8 text-center flex flex-col items-center">
                <Link href="/" className="group mb-6">
                    <img
                        src="/logo_symbol.svg"
                        alt="Logo"
                        className="h-24 w-auto object-contain transition-transform group-hover:scale-105"
                    />
                </Link>
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-stone-900 tracking-tighter">Únete a la comunidad</h1>
                    <p className="text-teal-700 font-bold text-[10px] uppercase tracking-[0.2em] px-4 opacity-80">
                        Registro de Usuario
                    </p>
                </div>
            </div>

            <div className="bg-white w-full max-w-md rounded-3xl shadow-xl border border-stone-100 overflow-hidden">
                <div className="p-8">

                    <div className="mb-6 text-center">
                        <h2 className="text-xl font-bold text-stone-800">Crear una cuenta</h2>
                        <p className="text-sm text-stone-500">Completa tus datos para empezar</p>
                    </div>

                    <RegisterForm onSuccess={() => router.push('/login')} />

                    <div className="mt-8 pt-6 border-t border-stone-100 text-center">
                        <p className="text-sm text-stone-600">
                            ¿Ya tienes una cuenta?{" "}
                            <Link href="/login" className="font-bold text-teal-800 hover:text-teal-800 hover:underline">
                                Inicia Sesión
                            </Link>
                        </p>
                    </div>

                    <p className="text-center text-xs text-stone-400 leading-relaxed px-4 mt-6">
                        Al registrarte aceptas nuestros <Link href="/terminos" className="text-teal-700 hover:underline">Términos</Link> y <Link href="/privacidad" className="text-teal-700 hover:underline">Política de Privacidad</Link>.
                    </p>

                </div>
            </div>

        </div>
    )
}
