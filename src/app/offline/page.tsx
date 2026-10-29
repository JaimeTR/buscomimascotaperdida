"use client"

import { WifiOff, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function OfflinePage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
            <div className="max-w-md w-full text-center space-y-6">
                {/* Icon */}
                <div className="flex justify-center">
                    <div className="relative">
                        <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full" />
                        <div className="relative bg-white p-6 rounded-full shadow-xl">
                            <WifiOff className="h-16 w-16 text-blue-500" />
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-3">
                    <h1 className="text-3xl font-bold text-slate-900">
                        Sin conexión
                    </h1>
                    <p className="text-slate-600">
                        No pudimos conectarnos al servidor. Verifica tu conexión a internet e intenta de nuevo.
                    </p>
                </div>

                {/* Actions */}
                <div className="space-y-3 pt-4">
                    <Button
                        onClick={() => window.location.reload()}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                        size="lg"
                    >
                        <RefreshCw className="h-5 w-5 mr-2" />
                        Reintentar
                    </Button>

                    <Button
                        onClick={() => window.history.back()}
                        variant="outline"
                        className="w-full"
                        size="lg"
                    >
                        Volver atrás
                    </Button>
                </div>

                {/* Info */}
                <div className="pt-6 border-t border-slate-200">
                    <p className="text-xs text-slate-500">
                        Algunas funciones pueden estar disponibles sin conexión.
                        Tus reportes se sincronizarán cuando vuelvas a estar en línea.
                    </p>
                </div>
            </div>
        </div>
    )
}
