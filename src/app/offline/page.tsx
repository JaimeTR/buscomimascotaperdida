"use client"

import { WifiOff, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function OfflinePage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 to-teal-50 p-4">
            <div className="max-w-md w-full text-center space-y-6">
                {/* Icon */}
                <div className="flex justify-center">
                    <div className="relative">
                        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                        <div className="relative bg-card p-6 rounded-full shadow-xl">
                            <WifiOff className="h-16 w-16 text-primary" />
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-3">
                    <h1 className="text-3xl font-bold text-foreground">
                        Sin conexión
                    </h1>
                    <p className="text-muted-foreground">
                        No pudimos conectarnos al servidor. Verifica tu conexión a internet e intenta de nuevo.
                    </p>
                </div>

                {/* Actions */}
                <div className="space-y-3 pt-4">
                    <Button
                        onClick={() => window.location.reload()}
                        className="w-full bg-primary hover:bg-primary text-white"
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
                <div className="pt-6 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                        Solo se guardan recursos públicos para mostrar esta pantalla.
                        Los formularios y datos de tu cuenta no se almacenan sin conexión.
                    </p>
                </div>
            </div>
        </div>
    )
}
