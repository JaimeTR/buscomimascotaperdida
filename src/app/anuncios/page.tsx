import Link from "next/link"
import { Megaphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { PageHeader } from "@/components/ui/page-header"
import { Reveal } from "@/components/ui/reveal"
import { AdCard, HouseAd } from "@/components/ads/ad-card"
import { getAds } from "@/lib/ads"

export const revalidate = 300
export const metadata = { title: "Anuncios | Busco mi mascota", description: "Negocios y servicios para quienes aman a sus mascotas." }

export default async function AnunciosPage() {
    const ads = await getAds("ads_page", 40)

    return (
        <div className="container mx-auto space-y-8 px-4 py-8 md:py-12">
            <PageHeader title="Anuncios" text="Negocios y servicios para quienes aman a sus mascotas. Los anuncios están marcados como tales y ayudan a sostener la plataforma.">
                <Button asChild variant="cta" className="rounded-full"><Link href="/promocionar">Anunciar mi negocio</Link></Button>
            </PageHeader>

            {ads.length === 0 ? (
                <EmptyState icon={Megaphone} title="Todavía no hay anuncios publicados" text="Sé el primero en mostrar tu negocio a la comunidad.">
                    <Button asChild variant="cta"><Link href="/promocionar">Ver planes</Link></Button>
                </EmptyState>
            ) : (
                <ul className="grid gap-5 md:grid-cols-2">
                    {ads.map((ad, i) => <Reveal as="li" key={ad.id} delay={(i % 4) * 0.05}><AdCard ad={ad} /></Reveal>)}
                </ul>
            )}

            <HouseAd />
        </div>
    )
}
