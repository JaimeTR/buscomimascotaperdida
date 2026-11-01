"use client"

import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useState, useEffect } from 'react'

function MapViewHandler({ lat, lng, zoom }: { lat: number, lng: number, zoom: number }) {
    const map = useMap()
    useEffect(() => {
        if (typeof lat === 'number' && typeof lng === 'number') {
            map.flyTo([lat, lng], zoom, {
                duration: 1.5
            })
        }
    }, [lat, lng, zoom, map])
    return null
}

function LocationMarker({ lat, lng, onChange }: { lat: number, lng: number, onChange: (lat: number, lng: number) => void }) {
    const [position, setPosition] = useState<[number, number] | null>([lat, lng])
    const [icon, setIcon] = useState<L.Icon | undefined>(undefined)

    useEffect(() => {
        const DefaultIcon = L.icon({
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41]
        })
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIcon(DefaultIcon)
    }, [])

    useMapEvents({
        click(e) {
            const newPos: [number, number] = [e.latlng.lat, e.latlng.lng]
            setPosition(newPos)
            onChange(e.latlng.lat, e.latlng.lng)
        },
    })

    if (!icon || !position) return null

    return (
        <Marker position={position} icon={icon} />
    )
}

interface MapPickerProps {
    lat: number
    lng: number
    zoom?: number
    onChange: (lat: number, lng: number) => void
}

export function MapPicker({ lat, lng, zoom = 13, onChange }: MapPickerProps) {
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsMounted(true)
    }, [])

    if (!isMounted) {
        return <div className="h-full w-full bg-slate-50 animate-pulse flex items-center justify-center text-slate-400 text-xs">Cargando mapa...</div>
    }

    if (typeof lat !== 'number' || typeof lng !== 'number') {
        return <div className="h-full w-full bg-slate-50 flex items-center justify-center text-slate-400 text-xs italic">Ubicación no disponible</div>
    }

    return (
        <MapContainer
            center={[lat, lng]}
            zoom={zoom}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%' }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapViewHandler lat={lat} lng={lng} zoom={zoom} />
            <LocationMarker lat={lat} lng={lng} onChange={onChange} />
        </MapContainer>
    )
}
