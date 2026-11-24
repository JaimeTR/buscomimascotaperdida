import { unstable_cache } from "next/cache"
import { createPublicClient } from "@/utils/supabase/public"

// Lecturas públicas del perfil de una mascota (otras alertas de la zona y candidatas a coincidencia).
// No dependen de la sesión, así que se guardan 60 s: un caso viral no multiplica las consultas.
export const getSimilarPets = unstable_cache(
    async (id: string, type: string, district: string | null) => {
        if (!district) return []
        const { data } = await createPublicClient().from("pets").select("*")
            .eq("type", type).eq("last_seen_district", district).eq("is_hidden", false).neq("id", id).limit(4)
        return data ?? []
    },
    ["similar-pets"],
    { revalidate: 60, tags: ["pets"] },
)

export const getMatchCandidates = unstable_cache(
    async (type: string, status: "lost" | "found") => {
        const { data } = await createPublicClient().from("pets").select("*")
            .eq("type", type).eq("status", status).eq("is_hidden", false)
            .order("last_seen_date", { ascending: false }).limit(100)
        return data ?? []
    },
    ["match-candidates"],
    { revalidate: 60, tags: ["pets"] },
)
