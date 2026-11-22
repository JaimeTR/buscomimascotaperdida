"use client"

import { useState, useEffect } from "react"
import { Download, X, Share } from "lucide-react"
import { Button } from "@/components/ui/button"
import { claimPrompt, markDismissed, releasePrompt } from "@/lib/prompt-gate"

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

const KEY = "pwa"
const DELAY = 45_000 // después de un rato de uso, nunca apenas se entra

// Aviso discreto para instalar la app: una línea y un botón. Si se cierra, vuelve a salir recién a las 24 h;
// si ya está instalada o la persona instala, no vuelve a salir.
export function PWAInstallPrompt() {
    const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
    const [show, setShow] = useState(false)
    const [ios, setIos] = useState(false)

    useEffect(() => {
        if (window.matchMedia("(display-mode: standalone)").matches) return
        const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent)
        let timer: ReturnType<typeof setTimeout> | undefined
        const arm = () => { timer = setTimeout(() => { if (claimPrompt(KEY)) { setIos(isIos); setShow(true) } }, DELAY) }

        const onPrompt = (e: Event) => { e.preventDefault(); setDeferred(e as BeforeInstallPromptEvent); arm() }
        const onInstalled = () => { markDismissed(KEY, true); releasePrompt(KEY); setShow(false) }

        if (isIos) arm() // iOS no dispara beforeinstallprompt: se muestran las instrucciones manuales
        else window.addEventListener("beforeinstallprompt", onPrompt)
        window.addEventListener("appinstalled", onInstalled)
        return () => {
            clearTimeout(timer)
            releasePrompt(KEY)
            window.removeEventListener("beforeinstallprompt", onPrompt)
            window.removeEventListener("appinstalled", onInstalled)
        }
    }, [])

    const close = () => { markDismissed(KEY); releasePrompt(KEY); setShow(false) }
    const install = async () => {
        if (!deferred) return
        await deferred.prompt()
        const { outcome } = await deferred.userChoice
        markDismissed(KEY, outcome === "accepted")
        releasePrompt(KEY)
        setDeferred(null)
        setShow(false)
    }

    if (!show) return null

    return (
        <div role="dialog" aria-label="Instalar la app" className="fixed inset-x-3 bottom-24 z-40 mx-auto flex max-w-sm items-center gap-3 rounded-2xl border bg-card p-3 pr-2 shadow-[var(--shadow-lift)] duration-300 animate-in fade-in slide-in-from-bottom-4 md:inset-x-auto md:bottom-6 md:right-6 md:mx-0">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-primary">
                {ios ? <Share className="h-5 w-5" aria-hidden /> : <Download className="h-5 w-5" aria-hidden />}
            </span>
            <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold leading-tight text-foreground">Instala la app</p>
                <p className="text-xs leading-snug text-muted-foreground">
                    {ios ? "Toca Compartir y luego “Añadir a pantalla de inicio”." : "Alertas de mascotas cerca de ti, en un toque."}
                </p>
            </div>
            {!ios && <Button size="sm" onClick={install} className="h-8 rounded-full px-3 text-xs">Instalar</Button>}
            <button type="button" onClick={close} aria-label="Cerrar" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary">
                <X className="h-4 w-4" aria-hidden />
            </button>
        </div>
    )
}
