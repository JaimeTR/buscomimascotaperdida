import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PetCard } from "@/components/pet-card"
import { SPECIES } from "@/lib/seo-zones"

type ZonePet = {
    id: string; name: string; type: string; breed: string | null; last_seen_district: string; last_seen_province?: string
    colors?: string[]; image_urls?: string[]; status: "lost" | "found" | "reunited"; last_seen_date: string
}

// Listado de casos reales de una zona o especie. Las páginas sin casos no se indexan (ver generateMetadata).
export function ZoneListing({ title, intro, pets, crumb, site, path }: {
    title: string; intro: string; pets: ZonePet[]; crumb: string; site: string; path: string
}) {
    const jsonLd = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "BreadcrumbList",
                itemListElement: [
                    { "@type": "ListItem", position: 1, name: "Inicio", item: site },
                    { "@type": "ListItem", position: 2, name: "Mascotas", item: `${site}/mascotas` },
                    { "@type": "ListItem", position: 3, name: crumb, item: `${site}${path}` },
                ],
            },
            {
                "@type": "ItemList",
                name: title,
                itemListElement: pets.map((p, i) => ({ "@type": "ListItem", position: i + 1, url: `${site}/mascotas/${p.id}`, name: p.name })),
            },
        ],
    }
    return (
        <div className="container mx-auto max-w-7xl space-y-8 px-4 py-8 md:py-12">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
            <header className="space-y-3 text-center md:text-left">
                <nav aria-label="Migas de pan" className="flex flex-wrap items-center justify-center gap-1.5 text-xs font-medium text-muted-foreground md:justify-start">
                    <Link href="/" className="hover:text-foreground">Inicio</Link><ChevronRight className="h-3 w-3 opacity-50" aria-hidden />
                    <Link href="/mascotas" className="hover:text-foreground">Mascotas</Link><ChevronRight className="h-3 w-3 opacity-50" aria-hidden />
                    <span className="text-foreground">{crumb}</span>
                </nav>
                <h1 className="font-display text-3xl leading-tight text-primary md:text-5xl">{title}</h1>
                <p className="max-w-3xl text-muted-foreground">{intro}</p>
                <div className="flex flex-wrap justify-center gap-2 md:justify-start">
                    {Object.entries(SPECIES).map(([slug, s]) => (
                        <Button key={slug} asChild variant="outline" size="sm" className="rounded-full"><Link href={`/mascotas/especie/${slug}`}>{s.plural.charAt(0).toUpperCase() + s.plural.slice(1)}</Link></Button>
                    ))}
                </div>
            </header>

            {pets.length ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {pets.map((p) => (
                        <PetCard key={p.id} id={p.id} name={p.name} type={p.type} breed={p.breed ?? ""} district={p.last_seen_district} province={p.last_seen_province}
                            colors={p.colors} imageUrl={p.image_urls?.[0] ?? "/img/sin-foto.svg"} status={p.status} lostDate={p.last_seen_date} />
                    ))}
                </div>
            ) : (
                <div className="space-y-4 rounded-[2rem] border bg-card p-8 text-center">
                    <p className="font-semibold">Todavía no hay casos publicados aquí.</p>
                    <p className="text-sm text-muted-foreground">Si perdiste o encontraste una mascota, reportarla ayuda a que más vecinos la busquen.</p>
                    <Button asChild variant="cta" className="rounded-full"><Link href="/reportar">Reportar una mascota</Link></Button>
                </div>
            )}
        </div>
    )
}
