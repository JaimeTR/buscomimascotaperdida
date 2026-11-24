import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { ZoneListing } from "@/components/seo/zone-listing"
import { SPECIES, isSpecies } from "@/lib/seo-zones"
import { createPublicClient } from "@/utils/supabase/public"

export const revalidate = 300

const site = process.env.NEXT_PUBLIC_APP_URL || "https://buscomimascotaperdida.com"

export function generateStaticParams() {
    return Object.keys(SPECIES).map((tipo) => ({ tipo }))
}

export async function generateMetadata({ params }: { params: Promise<{ tipo: string }> }): Promise<Metadata> {
    const { tipo } = await params
    if (!isSpecies(tipo)) return {}
    const s = SPECIES[tipo]
    const title = `${s.plural.charAt(0).toUpperCase() + s.plural.slice(1)} perdidos y encontrados en Perú`
    const description = `Casos recientes de ${s.plural} perdidos o encontrados en Perú. Busca por distrito, comparte y ayuda a que vuelvan a casa.`
    return { title, description, alternates: { canonical: `/mascotas/especie/${tipo}` }, openGraph: { title, description } }
}

export default async function SpeciesPage({ params }: { params: Promise<{ tipo: string }> }) {
    const { tipo } = await params
    if (!isSpecies(tipo)) notFound()
    const s = SPECIES[tipo]
    const { data } = await createPublicClient().from("pets").select("*")
        .eq("type", s.type).eq("is_hidden", false).order("created_at", { ascending: false }).limit(48)
    return (
        <ZoneListing
            title={`${s.plural.charAt(0).toUpperCase() + s.plural.slice(1)} perdidos y encontrados en Perú`}
            intro={`Casos recientes de ${s.plural}. Si viste ${s.article} ${s.singular} parecido, entra al caso y reporta dónde y cuándo.`}
            pets={data ?? []} crumb={s.plural.charAt(0).toUpperCase() + s.plural.slice(1)} site={site} path={`/mascotas/especie/${tipo}`}
        />
    )
}
