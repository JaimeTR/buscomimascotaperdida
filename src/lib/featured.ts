import { createPublicClient } from "@/utils/supabase/public"
import type { Pet } from "@/hooks/use-pets"

// Casos destacados: los que recibieron un aporte voluntario ya confirmado por el equipo. La base los entrega
// ordenados del mayor al menor monto (la función SQL featured_pets decide el orden; el navegador no puede alterarlo).
export async function getFeaturedPets(limit = 6): Promise<Pet[]> {
    try {
        const { data } = await createPublicClient().rpc("featured_pets", { p_limit: limit })
        return (data ?? []) as Pet[]
    } catch {
        return []
    }
}

// Montos sugeridos (soles). Son solo una guía: el aporte es libre y voluntario.
export const SUGGESTED_AMOUNTS = [5, 10, 20, 50] as const
