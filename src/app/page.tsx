import { HomeClient } from "@/components/home/home-client"
import { FeaturedAds } from "@/components/ads/featured-ads"
import { FeaturedPets } from "@/components/home/featured-pets"
import { ReunitedStories } from "@/components/home/reunited-stories"
import { createPublicClient } from "@/utils/supabase/public"
import type { Pet } from "@/hooks/use-pets"

export const metadata = { alternates: { canonical: "/" } }

// La portada se regenera cada 5 minutos: los destacados se leen de nuevo en cada regeneración.
export const revalidate = 300

export default async function Home() {
  // Casos recientes en el HTML inicial para que buscadores e IA los vean.
  const { data } = await createPublicClient().from("pets").select("*").eq("is_hidden", false).order("created_at", { ascending: false }).limit(20)
  return (
    <>
      <HomeClient adSlot={<FeaturedAds />} featured={<FeaturedPets />} initialPets={(data ?? []) as Pet[]} />
      <ReunitedStories />
    </>
  )
}
