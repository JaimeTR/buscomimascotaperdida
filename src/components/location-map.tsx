
"use client"

import { useEffect, useState } from "react"
import { MapPin, Loader2 } from "lucide-react"
import dynamic from "next/dynamic"

// Dynamic import to avoid SSR issues with Leaflet
const MapContainer = dynamic(
    () => import("react-leaflet").then((mod) => mod.MapContainer),
    { ssr: false }
)
const TileLayer = dynamic(
    () => import("react-leaflet").then((mod) => mod.TileLayer),
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
    const [isClient, setIsClient] = useState(false)
    const [position, setPosition] = useState<[number, number] | null>(null)
    const [isLoadingLocation, setIsLoadingLocation] = useState(false)
    const [MapEventsComponent, setMapEventsComponent] = useState<any>(null)

    // Default center (Lima, Peru)
    const defaultCenter: [number, number] = [-12.0464, -77.0428]

    useEffect(() => {
        setIsClient(true)

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
        if (initialLat && initialLng) {
            setPosition([initialLat, initialLng])
        } else {
            // Try to get user's current location
            setIsLoadingLocation(true)
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
                setPosition(defaultCenter)
                setIsLoadingLocation(false)
            }
        }
    }, [initialLat, initialLng, onLocationSelect])

    if (!isClient || !MapEventsComponent) {
        return (
            <div className="w-full h-[400px] bg-slate-100 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center">
                <div className="text-center space-y-3">
                    <Loader2 className="h-8 w-8 animate-spin text-slate-400 mx-auto" />
                    <p className="text-sm text-slate-500 font-medium">Cargando mapa...</p>
                </div>
            </div>
        )
    }

    if (isLoadingLocation || !position) {
        return (
            <div className="w-full h-[400px] bg-slate-100 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center">
                <div className="text-center space-y-3">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto" />
                    <p className="text-sm text-slate-600 font-medium">Obteniendo tu ubicación...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full h-[400px] rounded-2xl overflow-hidden border-2 border-slate-200 relative">
            <div className="absolute top-4 left-4 z-[1000] bg-white px-4 py-2 rounded-xl shadow-lg border border-slate-100">
                <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    <span className="font-bold text-slate-700">Haz clic para ubicar</span>
                </div>
            </div>

            <MapContainer
                center={position}
                zoom={15}
                style={{ height: "100%", width: "100%" }}
                className="z-0"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapEventsComponent />
                {position && <Marker position={position} />}
            </MapContainer>
        </div>
    )
}
