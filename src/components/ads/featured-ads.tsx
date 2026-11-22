import { Star } from "lucide-react"
import { AdCard } from "@/components/ads/ad-card"
import { Reveal } from "@/components/ui/reveal"
import { getAds } from "@/lib/ads"

// "Destacados" de la portada: negocios que contrataron un plan y el admin publicó. Sin anuncios no se dibuja nada
// (la portada no muestra invitaciones a anunciar; eso vive en /anuncios).
export async function FeaturedAds() {
    const ads = (await getAds("home_banner", 3))
    if (ads.length === 0) return null
    return (
        <section aria-labelledby="h-destacados" className="container mx-auto space-y-5 px-4 py-8">
            <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-cta" aria-hidden />
                <h2 id="h-destacados" className="font-display text-2xl text-primary md:text-3xl">Destacados</h2>
            </div>
            <ul className={ads.length === 1 ? "grid gap-5" : "grid gap-5 md:grid-cols-2 lg:grid-cols-3"}>
                {ads.map((ad, i) => (
                    <Reveal as="li" key={ad.id} delay={i * 0.06}>
                        <AdCard ad={ad} variant={ads.length === 1 ? "banner" : "side"} />
                    </Reveal>
                ))}
            </ul>
        </section>
    )
}
