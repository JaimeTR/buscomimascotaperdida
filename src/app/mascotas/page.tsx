import { PetsSearch } from "@/components/pets-search"
import { AdSlot } from "@/components/ads/ad-slot"

export const metadata = {
    title: "Mascotas perdidas y encontradas en Perú | Busco mi mascota",
    description: "Busca perros y gatos perdidos o encontrados por distrito, raza y color. Mira los casos en el mapa y ayuda a que vuelvan a casa.",
    alternates: { canonical: "/mascotas" },
}

export default async function PetsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
    const { q } = await searchParams
    return <PetsSearch key={q} initialQuery={q ?? ""} ad={<AdSlot placement="listing_inline" variant="banner" />} />
}
