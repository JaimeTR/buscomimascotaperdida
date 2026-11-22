import L from "leaflet"

export const LIMA: [number, number] = [-12.0464, -77.0428]

// Colores por estado: naranja (CTA) = perdido, teal = encontrado.
export const STATUS_COLOR = { lost: "#ea580c", found: "#0f766e", reunited: "#0f766e" } as const

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)

/** Pin redondo con la foto de la mascota y un anillo del color del estado. */
export function photoPin(status: keyof typeof STATUS_COLOR, photo?: string, approx = false) {
    const color = STATUS_COLOR[status] ?? STATUS_COLOR.lost
    const img = photo ? `<img src="${esc(photo)}" alt="" loading="lazy" draggable="false"/>` : ""
    return L.divIcon({
        html: `<div class="pm-pin${approx ? " pm-approx" : ""}" style="--c:${color}">${img}</div>`,
        className: "pm-pin-wrap",
        iconSize: [44, 52],
        iconAnchor: [22, 50],
        popupAnchor: [0, -46],
    })
}

/** Pin simple de color (punto de pérdida / avistamiento). */
export function dotPin(color: string, label = "") {
    return L.divIcon({
        html: `<div class="pm-dot" style="--c:${color}">${esc(label)}</div>`,
        className: "pm-pin-wrap",
        iconSize: [32, 38],
        iconAnchor: [16, 36],
        popupAnchor: [0, -34],
    })
}
