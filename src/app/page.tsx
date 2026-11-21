import { HomeClient } from "@/components/home/home-client"
import { AdSlot } from "@/components/ads/ad-slot"
import { ReunitedStories } from "@/components/home/reunited-stories"

// La portada se regenera cada 5 minutos: el anuncio del banner se elige al azar en cada regeneración.
export const revalidate = 300

export default function Home() {
  return (
    <>
      <HomeClient adSlot={<AdSlot placement="home_banner" />} />
      <ReunitedStories />
    </>
  )
}
