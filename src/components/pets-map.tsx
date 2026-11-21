"use client"

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import L from "leaflet"
import Link from "next/link"
import { useEffect } from "react"
import type { Pet } from "@/hooks/use-pets"

const pin = (color: string) => L.divIcon({
    html: `<div style="background:${color};width:24px;height:24px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid white;box-shadow:0 4px 6px -1px rgb(0 0 0/.2)"></div>`,
    className: "custom-pin",
    iconSize: [24, 24],
    iconAnchor: [12, 24],
})
const ICONS = { lost: pin("#ef4444"), found: pin("#0f766e") }
const LIMA: [number, number] = [-12.0464, -77.0428]

function FitBounds({ points }: { points: [number, number][] }) {
    const map = useMap()
    useEffect(() => {
        if (points.length) map.fitBounds(L.latLngBounds(points), { padding: [40, 40], maxZoom: 14 })
    }, [points, map])
    return null
}

export function PetsMap({ pets }: { pets: Pet[] }) {
    const located = pets.filter((p) => p.last_seen_lat != null && p.last_seen_lng != null)
    const points = located.map((p) => [p.last_seen_lat!, p.last_seen_lng!] as [number, number])
    return (
        <div className="space-y-2">
            <div className="h-[520px] overflow-hidden rounded-2xl border border-border">
                <MapContainer center={LIMA} zoom={11} scrollWheelZoom style={{ height: "100%", width: "100%" }}>
                    <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <FitBounds points={points} />
                    {located.map((p) => (
                        <Marker key={p.id} position={[p.last_seen_lat!, p.last_seen_lng!]} icon={p.status === "found" ? ICONS.found : ICONS.lost}>
                            <Popup>
                                <p className="font-bold">{p.status === "found" ? "Encontrado" : "Perdido"}: {p.name || "Sin nombre"}</p>
                                <p className="text-xs">{p.breed || "Raza desconocida"} · {p.last_seen_district}</p>
                                <Link href={`/mascotas/${p.id}`} className="text-xs font-semibold text-primary underline">Ver reporte</Link>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>
            <p className="text-sm text-muted-foreground">
                {located.length} de {pets.length} reportes tienen ubicación en el mapa. <span className="text-red-500">●</span> Perdido <span className="text-teal-700">●</span> Encontrado
            </p>
        </div>
    )
}
