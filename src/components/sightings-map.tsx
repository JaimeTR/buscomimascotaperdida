"use client"

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useState, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

// Fix for default marker icons
const createIcon = (color: string) => L.divIcon({
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2px solid white; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);"></div>`,
    className: 'custom-pin',
    iconSize: [24, 24],
    iconAnchor: [12, 24],
})

const INITIAL_ICON = createIcon('#ef4444') // red-500
const SIGHTING_ICON = createIcon('#3b82f6') // blue-500

function MapViewHandler({ center }: { center: [number, number] }) {
    const map = useMap()
    useEffect(() => {
        map.setView(center, map.getZoom())
    }, [center, map])
    return null
}

export type SightingLocation = {
    id: string
    lat: number
    lng: number
    description: string
    createdAt: string
    reporterName?: string
}

interface SightingsMapProps {
    initialLat: number
    initialLng: number
    sightings: SightingLocation[]
    className?: string
}

export function SightingsMap({ initialLat, initialLng, sightings, className }: SightingsMapProps) {
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsMounted(true)
    }, [])

    if (!isMounted) {
        return <div className={`bg-slate-50 animate-pulse flex items-center justify-center text-slate-400 text-xs rounded-[2.5rem] ${className}`}>Cargando mapa interactivo...</div>
    }

    return (
        <MapContainer
            center={[initialLat, initialLng]}
            zoom={16}
            scrollWheelZoom={true}
            className={`rounded-[2.5rem] overflow-hidden ${className}`}
            style={{ height: '100%', width: '100%' }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Initial Loss Marker */}
            <Marker position={[initialLat, initialLng]} icon={INITIAL_ICON}>
                <Popup className="rounded-2xl overflow-hidden">
                    <div className="p-1">
                        <p className="font-black text-slate-900 border-b pb-1 mb-1">📍 Punto Inicial</p>
                        <p className="text-xs text-slate-600">Lugar donde se perdió originalmente.</p>
                    </div>
                </Popup>
            </Marker>

            {/* Sighting Markers */}
            {sightings.map((sighting) => (
                <Marker
                    key={sighting.id}
                    position={[sighting.lat, sighting.lng]}
                    icon={SIGHTING_ICON}
                >
                    <Popup>
                        <div className="p-1 space-y-1">
                            <p className="font-bold text-blue-600">🐾 Avistamiento</p>
                            <p className="text-xs font-medium text-slate-700 leading-tight">{sighting.description}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider pt-1 border-t">
                                {formatDistanceToNow(new Date(sighting.createdAt), { addSuffix: true, locale: es })}
                                {sighting.reporterName && ` • por ${sighting.reporterName}`}
                            </p>
                        </div>
                    </Popup>
                </Marker>
            ))}

            <MapViewHandler center={[initialLat, initialLng]} />
        </MapContainer>
    )
}
