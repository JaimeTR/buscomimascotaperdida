"use client"

import { MapContainer, Marker, useMapEvents, useMap } from 'react-leaflet'
import type L from 'leaflet'
import { useState, useEffect, useRef } from 'react'
import { MapTools } from '@/components/map-tools'
import { BaseMapLayer } from '@/components/base-map-layer'
import { dotPin } from '@/lib/map-kit'

const PIN = dotPin('#ea580c')

// Pin + eventos del mapa. El pin se mueve al tocar el mapa, al arrastrarlo, al buscar una dirección o con "Mi ubicación".
// Si el padre cambia lat/lng por otra vía (p. ej. eligió otro distrito) el mapa vuela hasta ahí.
function PickerLayer({ lat, lng, zoom, onChange }: { lat: number, lng: number, zoom: number, onChange: (lat: number, lng: number) => void }) {
    const map = useMap()
    const [position, setPosition] = useState<[number, number]>([lat, lng])
    const last = useRef<[number, number]>([lat, lng])

    const pick = (la: number, ln: number) => {
        last.current = [la, ln]
        setPosition([la, ln])
        onChange(la, ln)
    }

    useEffect(() => {
        if (typeof lat !== 'number' || typeof lng !== 'number') return
        if (last.current[0] === lat && last.current[1] === lng) return // eco de una elección del usuario
        last.current = [lat, lng]
        setPosition([lat, lng])
        map.flyTo([lat, lng], zoom, { duration: 1.5 })
    }, [lat, lng, zoom, map])

    useMapEvents({ click(e) { pick(e.latlng.lat, e.latlng.lng) } })

    return (
        <>
            <Marker
                position={position}
                icon={PIN}
                draggable
                eventHandlers={{ dragend: (e) => { const p = (e.target as L.Marker).getLatLng(); pick(p.lat, p.lng) } }}
            />
            <MapTools onPick={pick} />
        </>
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
        return <div className="h-full w-full bg-background animate-pulse flex items-center justify-center text-muted-foreground text-xs">Cargando mapa...</div>
    }

    if (typeof lat !== 'number' || typeof lng !== 'number') {
        return <div className="h-full w-full bg-background flex items-center justify-center text-muted-foreground text-xs italic">Ubicación no disponible</div>
    }

    return (
        <MapContainer
            center={[lat, lng]}
            zoom={zoom}
            maxZoom={19}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%' }}
        >
            <BaseMapLayer />
            <PickerLayer lat={lat} lng={lng} zoom={zoom} onChange={onChange} />
        </MapContainer>
    )
}
