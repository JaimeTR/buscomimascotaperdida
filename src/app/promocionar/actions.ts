"use server"

import { z } from "zod"
import { createClient } from "@/utils/supabase/server"

const text = (max: number, min = 2) => z.string().trim().min(min).max(max)
const optional = (max: number) => z.string().trim().max(max).optional().transform((v) => v || undefined)

const schema = z.object({
    kind: z.enum(["anuncio", "aliado", "voluntario"]),
    plan: z.enum(["basico", "destacado", "premium"]).optional().catch(undefined),
    business_name: text(120),
    contact_name: text(120),
    email: z.string().trim().email().max(160),
    phone: optional(30),
    link_url: optional(300).refine((v) => !v || /^https:\/\//.test(v), "El enlace debe empezar con https://"),
    message: optional(1000),
})

export type PromoState = { ok: boolean; error?: string }

// Solicitud de anuncio, alianza o voluntariado. Exige sesión (evita spam) y limita las solicitudes pendientes por persona.
export async function submitPromoRequest(_prev: PromoState, formData: FormData): Promise<PromoState> {
    const parsed = schema.safeParse(Object.fromEntries(formData))
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Revisa los datos del formulario." }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { ok: false, error: "Inicia sesión para enviar tu solicitud." }

    const { count } = await supabase
        .from("promo_requests")
        .select("id", { count: "exact", head: true })
        .eq("requester_id", user.id)
        .eq("status", "pending")
    if ((count ?? 0) >= 5) return { ok: false, error: "Ya tienes 5 solicitudes en revisión. Espera a que las atendamos." }

    const { error } = await supabase.from("promo_requests").insert({ ...parsed.data, requester_id: user.id })
    if (error) return { ok: false, error: "No se pudo enviar la solicitud. Intenta de nuevo." }
    return { ok: true }
}
