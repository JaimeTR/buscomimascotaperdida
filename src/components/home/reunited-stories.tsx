import { PetCard } from "@/components/pet-card"
import { createPublicClient } from "@/utils/supabase/public"

// Reencuentros recientes: prueba social para quien está buscando. No se muestra si aún no hay ninguno.
export async function ReunitedStories() {
    const { data: pets } = await createPublicClient()
        .from("pets")
        .select("id, name, type, breed, colors, image_urls, last_seen_district, last_seen_province, last_seen_date")
        .eq("status", "reunited")
        .eq("is_hidden", false)
        .order("created_at", { ascending: false })
        .limit(3)
    if (!pets?.length) return null

    return (
        <section className="container mx-auto max-w-7xl px-4 pb-16" aria-labelledby="reunited-title">
            <h2 id="reunited-title" className="mb-2 font-display text-3xl text-primary">Volvieron a casa</h2>
            <p className="mb-8 text-muted-foreground">Cada reencuentro empezó con alguien que compartió un reporte.</p>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {pets.map((p) => (
                    <PetCard
                        key={p.id}
                        id={p.id}
                        name={p.name ?? "Sin nombre"}
                        type={p.type}
                        breed={p.breed ?? "Raza desconocida"}
                        district={p.last_seen_district ?? "Lima"}
                        province={p.last_seen_province ?? undefined}
                        colors={p.colors ?? []}
                        imageUrl={p.image_urls?.[0] ?? "/img/sin-foto.svg"}
                        status="reunited"
                        lostDate={p.last_seen_date}
                    />
                ))}
            </div>
        </section>
    )
}
