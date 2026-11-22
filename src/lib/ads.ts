import { createPublicClient } from "@/utils/supabase/public"

export type Placement = "home_banner" | "detail_sidebar" | "listing_inline" | "ads_page" // ads_page: heredado, ya no hay página pública de anuncios
export const PLACEMENTS: { key: Placement; label: string }[] = [
    { key: "home_banner", label: "Portada (banner)" },
    { key: "detail_sidebar", label: "Detalle de mascota (lateral)" },
    { key: "listing_inline", label: "Entre los resultados" },
]

export type Ad = {
    id: string
    advertiser: string
    title: string
    body: string | null
    image_url: string | null
    link_url: string
    cta_label: string
    placements: Placement[]
}

export type Partner = {
    id: string
    name: string
    kind: "empresa" | "persona" | "veterinaria" | "refugio" | "medio"
    description: string | null
    logo_url: string | null
    website_url: string | null
    city: string | null
}

export const PARTNER_KINDS: Record<Partner["kind"], string> = {
    empresa: "Empresa", persona: "Persona", veterinaria: "Veterinaria", refugio: "Refugio", medio: "Medio",
}

// Planes de promoción. No hay cobro automático: la solicitud la revisa el equipo y coordina el pago por contacto.
export const PLANS = [
    {
        key: "basico", name: "Básico", price: "S/ 50", period: "30 días", tone: "bg-secondary",
        perks: ["Destacado en la portada", "Enlace a tu web o redes", "Etiqueta “Anuncio” visible"],
    },
    {
        key: "destacado", name: "Destacado", price: "S/ 120", period: "30 días", tone: "bg-accent", highlight: true,
        perks: ["Todo lo del plan Básico", "Espacio lateral en el detalle de mascotas", "Mayor rotación en la portada"],
    },
    {
        key: "premium", name: "Premium", price: "S/ 250", period: "30 días", tone: "bg-orange-100",
        perks: ["Todo lo del plan Destacado", "Aparición entre los resultados de búsqueda", "Logo en la página de aliados"],
    },
] as const
export type PlanKey = (typeof PLANS)[number]["key"]

// Anuncios activos y vigentes (RLS ya lo garantiza) para un espacio. Se piden pocos y se elige uno al azar.
export async function getAds(placement: Placement, limit = 12): Promise<Ad[]> {
    try {
        const { data } = await createPublicClient()
            .from("ads")
            .select("id, advertiser, title, body, image_url, link_url, cta_label, placements")
            .contains("placements", [placement])
            .order("amount", { ascending: false })
            .order("created_at", { ascending: false })
            .limit(limit)
            .returns<Ad[]>()
        return data ?? []
    } catch {
        return []
    }
}

export async function getPartners(): Promise<Partner[]> {
    try {
        const { data } = await createPublicClient()
            .from("partners")
            .select("id, name, kind, description, logo_url, website_url, city")
            .order("sort", { ascending: true })
            .order("created_at", { ascending: false })
            .returns<Partner[]>()
        return data ?? []
    } catch {
        return []
    }
}

export const pickRandom = <T,>(items: T[]): T | undefined => items[Math.floor(Math.random() * items.length)]
