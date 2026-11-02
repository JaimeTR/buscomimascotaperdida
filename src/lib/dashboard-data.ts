import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"

export type OwnedPet = {
    id: string
    name: string | null
    status: string
    last_seen_district: string | null
    last_seen_department: string | null
    image_urls: string[] | null
    created_at: string
}

export type Sighting = {
    id: string
    pet_id: string
    description: string | null
    district: string | null
    department: string | null
    image_url: string | null
    created_at: string
    pets: { name: string | null } | null
}

export const ACTIVE_STATUSES = ["lost", "found", "in_contact"]

// Siempre filtra por el usuario autenticado (ownership); RLS es la segunda barrera.
export async function getOwnerData() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login?next=/dashboard")

    const { data: pets } = await supabase
        .from("pets")
        .select("id, name, status, last_seen_district, last_seen_department, image_urls, created_at")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false })
        .returns<OwnedPet[]>()

    const petIds = (pets ?? []).map((p) => p.id)
    const { data: sightings } = petIds.length
        ? await supabase
            .from("sightings")
            .select("id, pet_id, description, district, department, image_url, created_at, pets(name)")
            .in("pet_id", petIds)
            .order("created_at", { ascending: false })
            .limit(50)
            .returns<Sighting[]>()
        : { data: [] as Sighting[] }

    return { user, pets: pets ?? [], sightings: sightings ?? [] }
}
