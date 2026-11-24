import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { ZoneListing } from "@/components/seo/zone-listing"
import { districtFromSlug } from "@/lib/seo-zones"
import { createPublicClient } from "@/utils/supabase/public"

export const revalidate = 300

const site = process.env.NEXT_PUBLIC_APP_URL || "https://buscomimascotaperdida.com"

async function load(slug: string) {
    const district = districtFromSlug(slug)
    if (!district) return null
    const { data } = await createPublicClient().from("pets").select("*")
        .ilike("last_seen_district", district).eq("is_hidden", false)
        .order("created_at", { ascending: false }).limit(48)
    return { district, pets: data ?? [] }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const r = await load((await params).slug)
    if (!r) return {}
    const title = `Mascotas perdidas y encontradas en ${r.district}`
    const description = `Perros y gatos perdidos o encontrados en ${r.district}, Perú. Mira los casos recientes, comparte y reporta avistamientos.`
    return {
        title, description,
        alternates: { canonical: `/mascotas/distrito/${(await params).slug}` },
        openGraph: { title, description },
        robots: r.pets.length ? undefined : { index: false, follow: true }, // sin casos = contenido vacío: no se indexa
    }
}

export default async function DistrictPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const r = await load(slug)
    if (!r) notFound()
    return (
        <ZoneListing
            title={`Mascotas perdidas y encontradas en ${r.district}`}
            intro={`Casos recientes de perros y gatos en ${r.district}. Si viste a alguna de estas mascotas, entra al caso y reporta dónde y cuándo.`}
            pets={r.pets} crumb={r.district} site={site} path={`/mascotas/distrito/${slug}`}
        />
    )
}
