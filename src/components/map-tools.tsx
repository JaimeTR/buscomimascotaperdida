"use client"

import { useEffect, useRef, useState } from "react"
import { useMap } from "react-leaflet"
import L from "leaflet"
import { Crosshair, Loader2, Search, X } from "lucide-react"

type Hit = { lat: number; lng: number; label: string }

// Herramientas para no andar buscando en el mapa: "Mi ubicación" (GPS con permiso del usuario) y
// buscador de direcciones/lugares de Perú (Nominatim de OpenStreetMap, gratuito; solo al enviar, 1 consulta por vez).
export function MapTools({ onPick, search = true, zoom = 17 }: { onPick?: (lat: number, lng: number) => void; search?: boolean; zoom?: number }) {
    const map = useMap()
    const box = useRef<HTMLDivElement>(null)
    const dot = useRef<L.LayerGroup | null>(null)
    const [q, setQ] = useState("")
    const [hits, setHits] = useState<Hit[] | null>(null)
    const [busy, setBusy] = useState<"geo" | "search" | null>(null)
    const [msg, setMsg] = useState("")

    // Evita que clics y gestos sobre los controles muevan el mapa.
    useEffect(() => {
        if (!box.current) return
        L.DomEvent.disableClickPropagation(box.current)
        L.DomEvent.disableScrollPropagation(box.current)
    }, [])
    useEffect(() => () => { dot.current?.remove() }, [])

    const go = (lat: number, lng: number) => {
        map.flyTo([lat, lng], Math.max(map.getZoom(), zoom), { duration: 1 })
        onPick?.(lat, lng)
    }

    const locate = () => {
        setMsg("")
        if (!navigator.geolocation) return setMsg("Tu navegador no permite ubicación.")
        setBusy("geo")
        navigator.geolocation.getCurrentPosition(
            ({ coords }) => {
                setBusy(null)
                const here: [number, number] = [coords.latitude, coords.longitude]
                dot.current?.remove()
                dot.current = L.layerGroup([
                    L.circle(here, { radius: coords.accuracy, color: "#2563eb", weight: 1, fillOpacity: 0.12, interactive: false }),
                    L.circleMarker(here, { radius: 8, color: "#fff", weight: 3, fillColor: "#2563eb", fillOpacity: 1, interactive: false }),
                ]).addTo(map)
                go(...here)
            },
            (e) => {
                setBusy(null)
                setMsg(e.code === 1 ? "Permiso denegado. Actívalo en tu navegador o busca la dirección." : "No pudimos obtener tu ubicación.")
            },
            { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 },
        )
    }

    const find = async (e: React.FormEvent) => {
        e.preventDefault()
        const text = q.trim()
        if (text.length < 3) return
        setBusy("search"); setMsg(""); setHits(null)
        try {
            const r = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&countrycodes=pe&accept-language=es&q=${encodeURIComponent(text)}`)
            const data = (await r.json()) as { lat: string; lon: string; display_name: string }[]
            const list = data.map((d) => ({ lat: +d.lat, lng: +d.lon, label: d.display_name }))
            setHits(list)
            if (!list.length) setMsg("No encontramos ese lugar. Prueba con calle y distrito.")
        } catch {
            setMsg("No se pudo buscar ahora. Intenta de nuevo.")
        } finally {
            setBusy(null)
        }
    }

    return (
        <div ref={box} className="absolute left-14 right-2 top-2 z-[1000] flex flex-col gap-1.5 sm:left-auto sm:w-80">
            <div className="flex gap-1.5">
                {search && (
                    <form onSubmit={find} className="flex min-w-0 flex-1 items-center rounded-full border bg-card pl-3 shadow-[var(--shadow-soft)]">
                        <input
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Buscar dirección o lugar"
                            aria-label="Buscar dirección o lugar"
                            className="h-10 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                        />
                        {q && <button type="button" aria-label="Borrar" onClick={() => { setQ(""); setHits(null); setMsg("") }} className="p-1.5 text-muted-foreground"><X className="h-4 w-4" /></button>}
                        <button type="submit" aria-label="Buscar" className="flex h-10 w-10 items-center justify-center rounded-full text-primary">
                            {busy === "search" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                        </button>
                    </form>
                )}
                <button
                    type="button"
                    onClick={locate}
                    aria-label="Usar mi ubicación actual"
                    title="Usar mi ubicación actual"
                    className="ml-auto flex h-10 shrink-0 items-center gap-1.5 rounded-full border bg-card px-3 text-sm font-semibold text-primary shadow-[var(--shadow-soft)] hover:bg-accent"
                >
                    {busy === "geo" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Crosshair className="h-4 w-4" />}
                    <span className="hidden sm:inline">Mi ubicación</span>
                </button>
            </div>
            {hits && hits.length > 0 && (
                <ul className="max-h-48 overflow-auto rounded-2xl border bg-card py-1 text-sm shadow-[var(--shadow-lift)]">
                    {hits.map((h, i) => (
                        <li key={i}>
                            <button type="button" onClick={() => { go(h.lat, h.lng); setHits(null) }} className="block w-full px-3 py-2 text-left hover:bg-accent">{h.label}</button>
                        </li>
                    ))}
                </ul>
            )}
            {msg && <p role="status" className="rounded-xl border bg-card px-3 py-2 text-xs text-muted-foreground shadow-[var(--shadow-soft)]">{msg}</p>}
        </div>
    )
}
