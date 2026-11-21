"use client"

import { useEffect, useState } from "react"
import { Switch } from "@/components/ui/switch"
import { createClient } from "@/utils/supabase/client"

const KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

function keyToBytes(b64: string) {
    const raw = atob((b64 + "=".repeat((4 - (b64.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/"))
    return Uint8Array.from(raw, (c) => c.charCodeAt(0))
}

// Activa o desactiva las alertas push en este dispositivo.
export function PushToggle() {
    const [supported, setSupported] = useState(false)
    const [on, setOn] = useState(false)
    const [error, setError] = useState("")

    useEffect(() => {
        if (!KEY || !("serviceWorker" in navigator) || !("PushManager" in window)) return
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSupported(true)
        navigator.serviceWorker.ready.then((r) => r.pushManager.getSubscription()).then((s) => setOn(!!s)).catch(() => {})
    }, [])

    if (!supported) return <p className="text-sm text-muted-foreground">Las notificaciones en el dispositivo no están disponibles en este navegador.</p>

    async function toggle(next: boolean) {
        setError("")
        try {
            const reg = await navigator.serviceWorker.ready
            const supabase = createClient()
            if (next) {
                if ((await Notification.requestPermission()) !== "granted") { setError("Permiso denegado en el navegador."); return }
                const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyToBytes(KEY!) })
                const j = sub.toJSON()
                const { data: { user } } = await supabase.auth.getUser()
                if (!user || !j.keys) throw new Error("no-user")
                const { error: e } = await supabase.from("push_subscriptions").upsert({ endpoint: sub.endpoint, user_id: user.id, p256dh: j.keys.p256dh, auth: j.keys.auth })
                if (e) throw e
            } else {
                const sub = await reg.pushManager.getSubscription()
                if (sub) { await supabase.from("push_subscriptions").delete().eq("endpoint", sub.endpoint); await sub.unsubscribe() }
            }
            setOn(next)
        } catch {
            setError("No se pudo actualizar. Intenta de nuevo.")
        }
    }

    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between space-x-4">
                <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">Notificaciones en este dispositivo</p>
                    <p className="text-sm text-muted-foreground">Aviso al instante cuando se reporte una mascota cerca de ti.</p>
                </div>
                <Switch checked={on} onCheckedChange={toggle} aria-label="Notificaciones en este dispositivo" />
            </div>
            {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        </div>
    )
}
