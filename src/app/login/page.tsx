"use client"

import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Plus } from "lucide-react"
import { useEffect, Suspense } from "react"

import { LoginForm } from "@/components/auth/login-form"
import { GoogleLoginButton } from "@/components/auth/google-login-button"
import { createClient } from "@/utils/supabase/client"
import { isSafeInternalPath } from "@/lib/safe-path"
import { getForgotPasswordPath } from "@/lib/auth-redirects"

function LoginContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const supabase = createClient()

    const nextUrl = isSafeInternalPath(searchParams.get('next'), '/dashboard')

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (session) {
                router.replace(nextUrl)
            }
        }
        checkUser()
    }, [router, nextUrl, supabase])

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
                    <h1 className="text-3xl font-black text-stone-900 tracking-tighter">Encuentra tu mascota perdida</h1>
                    <p className="text-teal-700 font-bold text-[10px] uppercase tracking-[0.2em] px-4 opacity-80">
                        Red comunitaria de ayuda
                    </p>
                </div>
            </div>

            <div className="bg-white w-full max-w-md rounded-3xl shadow-xl border border-stone-100 overflow-hidden">
                <div className="p-8">
                    {/* Show alert only if explicitly coming from a report action */}
                    {nextUrl && (nextUrl.includes('reportar') || nextUrl.includes('avistamiento')) && nextUrl !== '/dashboard' && (
                        <div className="mb-6 p-4 bg-orange-50 border border-orange-100 rounded-2xl flex gap-3 items-start animate-in fade-in slide-in-from-top-2">
                            <div className="bg-orange-100 p-1.5 rounded-lg">
                                <Plus className="h-4 w-4 text-orange-600" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-bold text-orange-900 leading-none">Inicia sesión para reportar</p>
                                <p className="text-xs text-orange-600/80 leading-relaxed">
                                    Necesitamos identificarte para que puedas gestionar tus reportes. Si no tienes cuenta, usa la pestaña <b>Registrarse</b>.
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="mb-6 text-center">
                        <h2 className="text-xl font-bold text-stone-800">Bienvenido de nuevo</h2>
                        <p className="text-sm text-stone-500">Ingresa tus credenciales para continuar</p>
                    </div>

                    <LoginForm next={nextUrl} />

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-stone-100" />
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="bg-white px-3 text-stone-400">o continúa con</span>
                        </div>
                    </div>

                    <GoogleLoginButton next={nextUrl} />

                    <p className="text-center text-xs text-stone-400 mt-4">
                        ¿Olvidaste tu contraseña? <Link href={getForgotPasswordPath(nextUrl)} className="text-teal-700 hover:underline font-medium">Recupérala aquí</Link>
                    </p>

                    <div className="mt-8 pt-6 border-t border-stone-100 text-center">
                        <p className="text-sm text-stone-600">
                            ¿Aún no tienes cuenta?{" "}
                            <Link href="/register" className="font-bold text-teal-800 hover:text-teal-800 hover:underline">
                                Regístrate gratis
                            </Link>
                        </p>
                    </div>

                </div>
            </div>

        </div>
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-stone-50 flex items-center justify-center text-stone-400">Cargando...</div>}>
            <LoginContent />
        </Suspense>
    )
}
