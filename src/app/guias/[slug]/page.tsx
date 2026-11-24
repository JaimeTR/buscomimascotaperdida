import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GUIDES, getGuide } from "@/lib/guides"

const site = process.env.NEXT_PUBLIC_APP_URL || "https://buscomimascotaperdida.com"

export function generateStaticParams() {
    return GUIDES.map((g) => ({ slug: g.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const g = getGuide((await params).slug)
    if (!g) return {}
    return { title: g.title, description: g.description, alternates: { canonical: `/guias/${g.slug}` }, openGraph: { title: g.title, description: g.description } }
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
    const g = getGuide((await params).slug)
    if (!g) notFound()
    const jsonLd = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "BreadcrumbList",
                itemListElement: [
                    { "@type": "ListItem", position: 1, name: "Inicio", item: site },
                    { "@type": "ListItem", position: 2, name: "Guías", item: `${site}/guias` },
                    { "@type": "ListItem", position: 3, name: g.title, item: `${site}/guias/${g.slug}` },
                ],
            },
            { "@type": "Article", headline: g.title, description: g.description, inLanguage: "es-PE", mainEntityOfPage: `${site}/guias/${g.slug}`, publisher: { "@type": "Organization", name: "Busco mi mascota" } },
        ],
    }
    return (
        <article className="container mx-auto max-w-3xl space-y-8 px-4 py-8 md:py-12">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
            <nav aria-label="Migas de pan" className="flex flex-wrap items-center justify-center gap-1.5 text-xs font-medium text-muted-foreground md:justify-start">
                <Link href="/" className="hover:text-foreground">Inicio</Link><ChevronRight className="h-3 w-3 opacity-50" aria-hidden />
                <Link href="/guias" className="hover:text-foreground">Guías</Link><ChevronRight className="h-3 w-3 opacity-50" aria-hidden />
                <span className="text-foreground">{g.title}</span>
            </nav>
            <h1 className="font-display text-3xl text-primary md:text-4xl">{g.title}</h1>
            {g.sections.map((s) => (
                <section key={s.h} className="space-y-2">
                    <h2 className="font-display text-xl text-primary">{s.h}</h2>
                    {s.p.map((t) => <p key={t} className="leading-relaxed text-foreground/90">{t}</p>)}
                </section>
            ))}
            <p className="text-sm text-muted-foreground">Esta guía es orientativa y no reemplaza la consulta con un veterinario.</p>
            <div className="flex flex-wrap gap-3">
                <Button asChild variant="cta" className="rounded-full"><Link href="/reportar">Reportar una mascota</Link></Button>
                <Button asChild variant="outline" className="rounded-full"><Link href="/guias">Más guías</Link></Button>
            </div>
        </article>
    )
}
