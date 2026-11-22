import { FORMATS, defaultsFromPet, type FormatId, type PetForPoster, type TemplateId } from "@/lib/poster"
import { Poster } from "@/components/poster/poster"
import { STOCK } from "@/lib/stock-images"

// Caso de ejemplo para las vistas previas de la página de carteles (no es un reporte real).
const SAMPLE_PET: PetForPoster = {
    name: "Luna", type: "dog", breed: "Mestizo", gender: null, size: "medium", colors: ["Marrón", "Blanco"], markings: "Collar rojo, muy dócil",
    status: "lost", last_seen_district: "Miraflores", last_seen_department: "Lima", last_seen_address: "Cerca del parque Kennedy",
    image_urls: [STOCK.perritoDuena.src],
}

// Cartel real (mismo componente que el editor) dibujado a escala reducida. `width` en px del resultado.
export function PosterThumb({ template, format = "a4", width = 200, tilt = 0 }: { template: TemplateId; format?: FormatId; width?: number; tilt?: number }) {
    const f = FORMATS[format]
    const scale = width / f.w
    const state = { ...defaultsFromPet(SAMPLE_PET, { phone: "9XX XXX XXX" }), template, format, headline: template === "encontrado" ? "ENCONTRADO" : "SE BUSCA" }
    return (
        <div
            aria-hidden
            className="pointer-events-none select-none overflow-hidden rounded-lg bg-white shadow-[var(--shadow-lift)] ring-1 ring-black/5"
            style={{ width, height: f.h * scale, transform: tilt ? `rotate(${tilt}deg)` : undefined }}
        >
            <div style={{ width: f.w, height: f.h, transform: `scale(${scale})`, transformOrigin: "top left" }}>
                <Poster state={state} photo={STOCK.perritoDuena.src} qr="" />
            </div>
        </div>
    )
}
