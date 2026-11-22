
"use client"

import { useEffect, useState } from "react"
import { MapPin, Loader2 } from "lucide-react"
import dynamic from "next/dynamic"

// Dynamic import to avoid SSR issues with Leaflet
const MapContainer = dynamic(
    () => import("react-leaflet").then((mod) => mod.MapContainer),
    { ssr: false }
)
const BaseMapLayer = dynamic(
    () => import("@/components/base-map-layer").then((mod) => mod.BaseMapLayer),
    { ssr: false }
)
const MapTools = dynamic(
    () => import("@/components/map-tools").then((mod) => mod.MapTools),
    { ssr: false }
)
const Marker = dynamic(
    () => import("react-leaflet").then((mod) => mod.Marker),
    { ssr: false }
)

interface LocationMapProps {
    onLocationSelect: (lat: number, lng: number) => void
    initialLat?: number
    initialLng?: number
}

export function LocationMap({ onLocationSelect, initialLat, initialLng }: LocationMapProps) {
    const [position, setPosition] = useState<[number, number] | null>(
        initialLat !== undefined && initialLng !== undefined
            ? [initialLat, initialLng]
            : null
    )
    const [isLoadingLocation, setIsLoadingLocation] = useState(
        initialLat === undefined || initialLng === undefined
    )
    const [pin, setPin] = useState<import("leaflet").DivIcon | null>(null) // leaflet solo existe en el navegador
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [MapEventsComponent, setMapEventsComponent] = useState<any>(null)

    // Default center (Lima, Peru)
    const defaultCenter: [number, number] = [-12.0464, -77.0428]

    useEffect(() => {
        import("@/lib/map-kit").then((k) => setPin(k.dotPin("#ea580c")))
        // Dynamically import the hooks component
        import("react-leaflet").then((mod) => {
            const MapEvents = () => {
                mod.useMapEvents({
                    click(e) {
                        const lat = e.latlng.lat
                        const lng = e.latlng.lng
                        setPosition([lat, lng])
                        onLocationSelect(lat, lng)
                    },
                })
                return null
            }
            setMapEventsComponent(() => MapEvents)
        })

        // Set initial position if provided
        if (initialLat !== undefined && initialLng !== undefined) {
            return
        } else {
            // Try to get user's current location
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (pos) => {
                        const lat = pos.coords.latitude
                        const lng = pos.coords.longitude
                        setPosition([lat, lng])
                        onLocationSelect(lat, lng)
                        setIsLoadingLocation(false)
                    },
                    () => {
                        // If location access denied, use default
                        setPosition(defaultCenter)
                        setIsLoadingLocation(false)
                    }
                )
            } else {
                queueMicrotask(() => {
                    setPosition(defaultCenter)
                    setIsLoadingLocation(false)
                })
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- defaultCenter es constante; no debe reiniciar la geolocalización
    }, [initialLat, initialLng, onLocationSelect])

    if (!MapEventsComponent) {
        return (
            <div className="w-full h-[400px] bg-secondary rounded-2xl border-2 border-dashed border-border flex items-center justify-center">
                <div className="text-center space-y-3">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto" />
                    <p className="text-sm text-muted-foreground font-medium">Cargando mapa...</p>
                </div>
            </div>
        )
    }

    if (isLoadingLocation || !position) {
        return (
            <div className="w-full h-[400px] bg-secondary rounded-2xl border-2 border-dashed border-border flex items-center justify-center">
                <div className="text-center space-y-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                    <p className="text-sm text-muted-foreground font-medium">Obteniendo tu ubicación...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full h-[400px] rounded-2xl overflow-hidden border-2 border-border relative">
            <div className="absolute top-4 left-4 z-[1000] bg-card px-4 py-2 rounded-xl shadow-lg border border-border">
                <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="font-bold text-foreground">Haz clic para ubicar</span>
                </div>
            </div>

            <MapContainer
                center={position}
                zoom={15}
                maxZoom={19}
                style={{ height: "100%", width: "100%" }}
                className="z-0"
            >
                <BaseMapLayer />
                <MapEventsComponent />
                {position && pin && (
                    <Marker
                        position={position}
                        icon={pin}
                        draggable
                        eventHandlers={{ dragend: (e: { target: { getLatLng: () => { lat: number; lng: number } } }) => { const p = e.target.getLatLng(); setPosition([p.lat, p.lng]); onLocationSelect(p.lat, p.lng) } }}
                    />
                )}
                <MapTools onPick={(lat, lng) => { setPosition([lat, lng]); onLocationSelect(lat, lng) }} />
            </MapContainer>
        </div>
    )
}
