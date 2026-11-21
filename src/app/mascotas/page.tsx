import { PetsSearch } from "@/components/pets-search"
import { AdSlot } from "@/components/ads/ad-slot"

export const metadata = { title: "Buscar mascota | Busco mi mascota", description: "Busca mascotas perdidas y encontradas cerca de ti." }

export default function PetsPage() {
    return <PetsSearch ad={<AdSlot placement="listing_inline" variant="side" />} />
}
