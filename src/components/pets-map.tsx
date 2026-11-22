"use client"

import { MapContainer, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet.markercluster"
import "leaflet.markercluster/dist/MarkerCluster.css"
import { useEffect, useMemo, useRef } from "react"
import { MapPin, CalendarDays } from "lucide-react"
import type { Pet } from "@/hooks/use-pets"
import { districtCenter } from "@/lib/district-coords"
import { MapTools } from "@/components/map-tools"
import { BaseMapLayer } from "@/components/base-map-layer"
import { LIMA, STATUS_COLOR, photoPin } from "@/lib/map-kit"

type Located = { pet: Pet; pos: [number, number]; approx: boolean }

// Hash estable para separar un poco los casos de un mismo distrito (sin saltos entre renders).
function jitter(id: string): [number, number] {
    let h = 0
    for (const c of id) h = (h * 31 + c.charCodeAt(0)) | 0
    return [(((h & 0xff) / 255) - 0.5) * 0.02, ((((h >> 8) & 0xff) / 255) - 0.5) * 0.02]
}

function locate(p: Pet): Located | null {
    if (p.last_seen_lat != null && p.last_seen_lng != null) return { pet: p, pos: [p.last_seen_lat, p.last_seen_lng], approx: false }
    const c = districtCenter(p.last_seen_district)
    if (!c) return null
    const [a, b] = jitter(p.id)
    return { pet: p, pos: [c[0] + a, c[1] + b], approx: true }
}

const statusOf = (p: Pet) => (p.status === "found" || p.status === "reunited" ? "found" : "lost")

function Cluster({ items }: { items: Located[] }) {
    const map = useMap()
    const fitted = useRef(false) // solo se encuadra una vez: los casos llegan por bloques y no hay que mover el mapa al usuario
    useEffect(() => {
        const group = L.markerClusterGroup({
            showCoverageOnHover: false,
            maxClusterRadius: 48,
            spiderfyOnMaxZoom: true,
            iconCreateFunction: (c) => L.divIcon({
                html: `<div class="pm-cluster">${c.getChildCount()}</div>`,
                className: "pm-pin-wrap",
                iconSize: [40, 40],
            }),
        })
        const esc = (s: string) => s.replace(/[&<>"']/g, (ch) => `&#${ch.charCodeAt(0)};`)
        for (const { pet, pos, approx } of items) {
            const st = statusOf(pet)
            const label = st === "found" ? "Encontrado" : "Perdido"
            const date = new Date(pet.last_seen_date).toLocaleDateString("es-PE", { day: "numeric", month: "short" })
            const photo = pet.image_urls?.[0]
            const m = L.marker(pos, { icon: photoPin(st, photo, approx), title: `${label}: ${pet.name || "Sin nombre"}` })
            m.bindPopup(
                `<a class="pm-card" href="/mascotas/${encodeURIComponent(pet.id)}">
                    ${photo ? `<img src="${esc(photo)}" alt="" loading="lazy"/>` : ""}
                    <span class="pm-body">
                        <span class="pm-badge" style="background:${STATUS_COLOR[st]}">${label}</span>
                        <strong>${esc(pet.name || "Sin nombre")}</strong>
                        <span class="pm-meta">${esc(pet.breed || "Raza desconocida")}</span>
                        <span class="pm-meta">${esc(pet.last_seen_district || "")} · ${date}${approx ? " · zona aproximada" : ""}</span>
                        <span class="pm-link">Ver reporte →</span>
                    </span>
                </a>`,
                { maxWidth: 300, minWidth: 220, autoPanPadding: [16, 16], closeButton: false },
            )
            group.addLayer(m)
        }
        map.addLayer(group)
        if (items.length && !fitted.current) {
            fitted.current = true
            map.fitBounds(L.latLngBounds(items.map((i) => i.pos)), { padding: [40, 40], maxZoom: 14 })
        }
        return () => { map.removeLayer(group) }
    }, [items, map])
    return null
}

export function PetsMap({ pets, loadingMore = false }: { pets: Pet[]; loadingMore?: boolean }) {
    const items = useMemo(() => pets.map(locate).filter((x): x is Located => !!x), [pets])
    const exact = items.filter((i) => !i.approx).length
    return (
        <div className="space-y-3">
            <div className="relative h-[68vh] min-h-[380px] overflow-hidden rounded-2xl border border-border shadow-[var(--shadow-soft)] sm:h-[600px]">
                <MapContainer center={LIMA} zoom={11} minZoom={5} maxZoom={19} scrollWheelZoom style={{ height: "100%", width: "100%" }}>
                    <BaseMapLayer />
                    <Cluster items={items} />
                    <MapTools zoom={14} />
                </MapContainer>
                {items.length === 0 && !loadingMore && (
                    <div className="pointer-events-none absolute inset-x-0 top-4 z-[500] mx-auto w-fit max-w-[90%] rounded-full bg-card px-4 py-2 text-sm font-medium shadow-[var(--shadow-lift)]">
                        Ningún reporte tiene ubicación en el mapa.
                    </div>
                )}
                {loadingMore && (
                    <div className="pointer-events-none absolute bottom-3 left-3 z-[500] rounded-full bg-card px-3 py-1.5 text-xs font-semibold text-primary shadow-[var(--shadow-soft)]">
                        Cargando más reportes…
                    </div>
                )}
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded-full" style={{ background: STATUS_COLOR.lost }} /> Perdido</span>
                <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded-full" style={{ background: STATUS_COLOR.found }} /> Encontrado</span>
                <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" aria-hidden /> {items.length} de {pets.length} en el mapa{items.length > exact ? " (zona aproximada por distrito)" : ""}</span>
                <span className="inline-flex items-center gap-1.5 text-xs"><CalendarDays className="h-3.5 w-3.5" aria-hidden /> Toca un grupo para acercar</span>
            </div>
        </div>
    )
}
