import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { ChevronRight, ExternalLink, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PARTNER_KINDS, type Partner } from "@/lib/ads"
import { PartnerLink, PartnerView } from "@/components/partner-track"
import { createPublicClient } from "@/utils/supabase/public"

export const revalidate = 600

const site = process.env.NEXT_PUBLIC_APP_URL || "https://buscomimascotaperdida.com"
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// RLS solo deja ver aliados activos.
async function load(id: string) {
    if (!UUID.test(id)) return null
    const { data } = await createPublicClient().from("partners")
        .select("id, name, kind, description, logo_url, website_url, city").eq("id", id).maybeSingle<Partner>()
    return data
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const p = await load((await params).id)
    if (!p) return {}
    const kind = PARTNER_KINDS[p.kind]
    const title = `${p.name}${p.city ? `, ${kind.toLowerCase()} en ${p.city}` : `, ${kind.toLowerCase()} aliada`}`
    const description = p.description ?? `${p.name} es aliado de Busco mi mascota y ayuda a que las mascotas perdidas vuelvan a casa.`
    return { title, description, alternates: { canonical: `/aliados/${p.id}` }, openGraph: { title, description } }
}

export default async function PartnerPage({ params }: { params: Promise<{ id: string }> }) {
    const p = await load((await params).id)
    if (!p) notFound()
    const kind = PARTNER_KINDS[p.kind]
    const jsonLd = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "BreadcrumbList",
                itemListElement: [
                    { "@type": "ListItem", position: 1, name: "Inicio", item: site },
                    { "@type": "ListItem", position: 2, name: "Aliados", item: `${site}/aliados` },
                    { "@type": "ListItem", position: 3, name: p.name, item: `${site}/aliados/${p.id}` },
                ],
            },
            {
                "@type": p.kind === "veterinaria" ? "VeterinaryCare" : "Organization",
                name: p.name,
                url: `${site}/aliados/${p.id}`,
                ...(p.description ? { description: p.description } : {}),
                ...(p.logo_url ? { logo: p.logo_url.startsWith("http") ? p.logo_url : `${site}${p.logo_url}` } : {}),
                ...(p.website_url ? { sameAs: [p.website_url] } : {}),
                ...(p.city ? { address: { "@type": "PostalAddress", addressLocality: p.city, addressCountry: "PE" } } : {}),
            },
        ],
    }

    return (
        <div className="container mx-auto max-w-3xl space-y-8 px-4 py-8 md:py-12">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
            <PartnerView id={p.id} />
            <nav aria-label="Migas de pan" className="flex flex-wrap items-center justify-center gap-1.5 text-xs font-medium text-muted-foreground md:justify-start">
                <Link href="/" className="hover:text-foreground">Inicio</Link><ChevronRight className="h-3 w-3 opacity-50" aria-hidden />
                <Link href="/aliados" className="hover:text-foreground">Aliados</Link><ChevronRight className="h-3 w-3 opacity-50" aria-hidden />
                <span className="text-foreground">{p.name}</span>
            </nav>
            <header className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
                {p.logo_url ? (
                    <Image src={p.logo_url} alt={`Logo de ${p.name}`} width={96} height={96} unoptimized={p.logo_url.startsWith("http")} className="h-24 w-24 rounded-3xl border object-contain p-2" />
                ) : (
                    <span className="flex h-24 w-24 items-center justify-center rounded-3xl bg-accent font-display text-4xl text-primary" aria-hidden>{p.name.slice(0, 1).toUpperCase()}</span>
                )}
                <div className="space-y-1">
                    <h1 className="font-display text-3xl text-primary md:text-4xl">{p.name}</h1>
                    <p className="flex flex-wrap items-center justify-center gap-x-3 text-sm text-muted-foreground sm:justify-start">
                        <span>{kind} aliada</span>
                        {p.city && <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4 text-cta" aria-hidden /> {p.city}</span>}
                    </p>
                </div>
            </header>
            {p.description && <p className="text-center leading-relaxed text-foreground/90 sm:text-left">{p.description}</p>}
            <div className="flex flex-wrap justify-center gap-3 sm:justify-start">
                {p.website_url && <Button asChild variant="cta" className="rounded-full"><PartnerLink id={p.id} href={p.website_url}><ExternalLink className="mr-2 h-4 w-4" aria-hidden /> Visitar su sitio</PartnerLink></Button>}
                <Button asChild variant="outline" className="rounded-full"><Link href="/aliados">Ver todos los aliados</Link></Button>
            </div>
        </div>
    )
}
