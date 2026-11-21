import { getAds, pickRandom, type Placement } from "@/lib/ads"
import { AdCard, HouseAd } from "@/components/ads/ad-card"

// Espacio publicitario (componente de servidor): un anuncio vigente al azar o, si no hay, la invitación a anunciar.
export async function AdSlot({ placement, variant = "banner" }: { placement: Placement; variant?: "banner" | "side" }) {
    const ad = pickRandom(await getAds(placement))
    return ad ? <AdCard ad={ad} variant={variant} /> : <HouseAd variant={variant} />
}
