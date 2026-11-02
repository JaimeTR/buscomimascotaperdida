"use client"

import { useState, useEffect } from "react"
import { Download, X, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
    const [showPrompt, setShowPrompt] = useState(false)
    const [isIOS, setIsIOS] = useState(false)
    const [isStandalone, setIsStandalone] = useState(false)

    useEffect(() => {
        // Check if already installed
        const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsStandalone(isInStandaloneMode)

        // Check if iOS
        const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
        setIsIOS(iOS)

        // Check if user already dismissed the prompt
        const dismissed = localStorage.getItem('pwa-prompt-dismissed')
        if (dismissed) return

        // Listen for the install prompt
        const handler = (e: Event) => {
            e.preventDefault()
            setDeferredPrompt(e as BeforeInstallPromptEvent)

            // Show prompt after 30 seconds
            setTimeout(() => {
                setShowPrompt(true)
            }, 30000)
        }

        window.addEventListener('beforeinstallprompt', handler)

        return () => {
            window.removeEventListener('beforeinstallprompt', handler)
        }
    }, [])

    const handleInstallClick = async () => {
        if (!deferredPrompt) return

        deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice

        if (outcome === 'accepted') {
            console.log('PWA instalada')
        }

        setDeferredPrompt(null)
        setShowPrompt(false)
    }

    const handleDismiss = () => {
        setShowPrompt(false)
        localStorage.setItem('pwa-prompt-dismissed', 'true')
    }

    // Don't show if already installed or dismissed
    if (isStandalone || !showPrompt) {
        return null
    }

    // iOS Installation Instructions
    if (isIOS && !isStandalone) {
        return (
            <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white rounded-2xl shadow-2xl border border-stone-200 p-5 z-50 animate-in slide-in-from-bottom-5 fade-in">
                <button
                    onClick={handleDismiss}
                    className="absolute top-3 right-3 text-stone-400 hover:text-stone-600"
                >
                    <X className="h-4 w-4" />
                </button>

                <div className="space-y-4">
                    <div className="flex items-start gap-3">
                        <div className="bg-teal-100 p-2 rounded-xl">
                            <Smartphone className="h-6 w-6 text-teal-800" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-stone-900">
                                Instala la App
                            </h3>
                            <p className="text-sm text-stone-600 mt-1">
                                Accede más rápido y recibe notificaciones
                            </p>
                        </div>
                    </div>

                    <div className="bg-stone-50 rounded-xl p-4 space-y-2">
                        <p className="text-xs text-stone-700 font-medium">
                            Para instalar en iOS:
                        </p>
                        <ol className="text-xs text-stone-600 space-y-2 list-decimal list-inside">
                            <li>Toca el botón de Compartir (cuadrado con flecha)</li>
                            <li>Desliza y selecciona &quot;Añadir a pantalla de inicio&quot;</li>
                            <li>Confirma tocando &quot;Añadir&quot;</li>
                        </ol>
                    </div>
                </div>
            </div>
        )
    }

    // Android/Desktop Installation Prompt
    return (
        <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-gradient-to-br from-teal-700 to-teal-800 rounded-2xl shadow-2xl p-5 z-50 animate-in slide-in-from-bottom-5 fade-in">
            <button
                onClick={handleDismiss}
                className="absolute top-3 right-3 text-white/80 hover:text-white"
            >
                <X className="h-4 w-4" />
            </button>

            <div className="space-y-4">
                <div className="flex items-start gap-3">
                    <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl">
                        <Download className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-white">
                            ¡Instala nuestra App!
                        </h3>
                        <p className="text-sm text-teal-100 mt-1">
                            Encuentra a tu mascota más rápido con la app instalada
                        </p>
                    </div>
                </div>

                <ul className="space-y-2 text-sm text-teal-50">
                    <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                        Acceso rápido desde tu pantalla de inicio
                    </li>
                    <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                        Notificaciones de mascotas cerca de ti
                    </li>
                    <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                        Funciona sin conexión
                    </li>
                </ul>

                <Button
                    onClick={handleInstallClick}
                    className="w-full bg-white text-teal-800 hover:bg-teal-50 font-semibold"
                >
                    <Download className="h-4 w-4 mr-2" />
                    Instalar App
                </Button>

                <button
                    onClick={handleDismiss}
                    className="w-full text-center text-xs text-teal-100 hover:text-white"
                >
                    Ahora no
                </button>
            </div>
        </div>
    )
}
