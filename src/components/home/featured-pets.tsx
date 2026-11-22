import Link from "next/link"
import { HandHeart, Star } from "lucide-react"
import { PetCard } from "@/components/pet-card"
import { Reveal } from "@/components/ui/reveal"
import { Button } from "@/components/ui/button"
import { getFeaturedPets } from "@/lib/featured"

// "Mascotas destacadas": casos que la comunidad impulsó con un aporte voluntario. Van del mayor al menor aporte confirmado.
// Sin casos destacados no se dibuja nada.
export async function FeaturedPets() {
    const pets = await getFeaturedPets(6)
    if (pets.length === 0) return null

    return (
        <section aria-labelledby="h-destacadas" className="container mx-auto space-y-6 px-4 pt-14">
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div className="space-y-1">
                    <h2 id="h-destacadas" className="flex items-center gap-2 font-display text-3xl text-primary md:text-4xl"><Star className="h-7 w-7 fill-cta text-cta" aria-hidden /> Mascotas destacadas</h2>
                    <p className="text-muted-foreground">Casos impulsados por el apoyo voluntario de la comunidad. Compártelos: cada difusión ayuda.</p>
                </div>
                <Button asChild variant="outline" className="rounded-full"><Link href="/contacto#apoyar"><HandHeart className="mr-2 h-4 w-4" aria-hidden /> Destacar mi caso</Link></Button>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {pets.map((pet, i) => (
                    <Reveal key={pet.id} delay={(i % 3) * 0.06}>
                        <PetCard
                            id={pet.id}
                            name={pet.name}
                            type={pet.type}
                            breed={pet.breed || "Raza desconocida"}
                            district={pet.last_seen_district}
                            province={pet.last_seen_province}
                            colors={pet.colors}
                            imageUrl={pet.image_urls?.[0] || "/img/sin-foto.svg"}
                            sourceName={pet.source_name}
                            status={pet.status === "reunited" ? "found" : (pet.status as "lost" | "found" | "reunited")}
                            lostDate={pet.last_seen_date}
                            featured
                        />
                    </Reveal>
                ))}
            </div>
        </section>
    )
}
