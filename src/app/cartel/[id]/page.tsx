import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { PosterStudio } from "@/components/poster/studio"
import { defaultsFromPet } from "@/lib/poster"

export const metadata: Metadata = { title: "Estudio de cartel | Busco mi mascota", robots: { index: false } }

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default async function PosterStudioPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ nuevo?: string }> }) {
    const { id } = await params
    const { nuevo } = await searchParams
    if (!UUID.test(id)) notFound()

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { data: pet } = await supabase.from("pets").select("*").eq("id", id).maybeSingle()
    if (!pet) notFound()

    // Contacto: el dueño usa el suyo; cualquier otra persona solo ve lo que el dueño hizo público.
    let contact: { phone?: string | null; whatsapp?: string | null; instagram?: string | null } = {}
    if (user && user.id === pet.owner_id) {
        const { data } = await supabase.from("profiles").select("phone, whatsapp, instagram").eq("id", user.id).maybeSingle()
        contact = data ?? {}
    } else {
        const { data } = await supabase.rpc("pet_contact_info", { p_pet: id })
        contact = { phone: data?.owner?.phone, whatsapp: data?.owner?.whatsapp }
    }

    return <PosterStudio petId={id} initial={defaultsFromPet(pet, contact)} photos={pet.image_urls ?? []} fresh={nuevo === "1" && !!user && user.id === pet.owner_id} />
}
