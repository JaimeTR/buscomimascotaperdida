"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { requireAdmin } from "@/lib/admin"

const id = z.string().uuid()
const https = z.string().trim().max(400).refine((v) => /^https:\/\//.test(v), "Debe empezar con https://")
const imageUrl = z.string().trim().max(400).optional().transform((v) => v || undefined).refine((v) => !v || /^(https:\/\/|\/)/.test(v), "Imagen: https:// o ruta local")
const PLACEMENTS = ["home_banner", "detail_sidebar", "listing_inline", "ads_page"] as const

const schemas = {
    approveAd: z.object({
        request_id: id,
        advertiser: z.string().trim().min(2).max(120),
        title: z.string().trim().min(3).max(90),
        body: z.string().trim().max(280).optional().transform((v) => v || undefined),
        image_url: imageUrl,
        link_url: https,
        cta_label: z.string().trim().min(2).max(30).default("Conocer más"),
        days: z.coerce.number().int().min(1).max(365),
    }),
    status: z.object({ id, status: z.enum(["pending", "approved", "rejected"]) }),
    adStatus: z.object({ id, status: z.enum(["draft", "active", "paused"]) }),
    one: z.object({ id }),
    partner: z.object({
        name: z.string().trim().min(2).max(120),
        kind: z.enum(["empresa", "persona", "veterinaria", "refugio", "medio"]),
        description: z.string().trim().max(280).optional().transform((v) => v || undefined),
        logo_url: imageUrl,
        website_url: z.string().trim().max(400).optional().transform((v) => v || undefined).refine((v) => !v || /^https:\/\//.test(v), "Web: https://"),
        city: z.string().trim().max(80).optional().transform((v) => v || undefined),
    }),
    partnerToggle: z.object({ id, active: z.enum(["true", "false"]) }),
}

// Ejecuta una mutación como administrador y deja rastro en la auditoría. Los errores no revelan detalles internos.
async function run(action: string, targetType: string, targetId: string, mutate: (db: Awaited<ReturnType<typeof requireAdmin>>["supabase"]) => PromiseLike<{ error: unknown }>) {
    const { supabase, user } = await requireAdmin()
    const { error } = await mutate(supabase)
    if (error) throw new Error("No se pudo completar la acción")
    await supabase.from("admin_audit_log").insert({ admin_id: user.id, action, target_type: targetType, target_id: targetId, details: {} })
    revalidatePath("/admin", "layout")
    revalidatePath("/", "layout")
}

// Aprueba una solicitud de anuncio: crea el anuncio ya activo por N días en los espacios elegidos.
export async function approveAdRequest(formData: FormData) {
    const raw = Object.fromEntries(formData)
    const data = schemas.approveAd.parse(raw)
    const placements = formData.getAll("placements").map(String).filter((p): p is (typeof PLACEMENTS)[number] => (PLACEMENTS as readonly string[]).includes(p))
    const { days, ...rest } = data
    await run("promo.approve_ad", "promo_request", data.request_id, async (db) => {
        const ends = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()
        const ins = await db.from("ads").insert({ ...rest, placements: placements.length ? placements : ["home_banner"], status: "active", ends_at: ends })
        if (ins.error) return ins
        return db.from("promo_requests").update({ status: "approved" }).eq("id", data.request_id)
    })
}

export async function setRequestStatus(formData: FormData) {
    const { id: rid, status } = schemas.status.parse(Object.fromEntries(formData))
    await run("promo.request_status", "promo_request", rid, (db) => db.from("promo_requests").update({ status }).eq("id", rid))
}

export async function setAdStatus(formData: FormData) {
    const { id: aid, status } = schemas.adStatus.parse(Object.fromEntries(formData))
    await run("ad.status", "ad", aid, (db) => db.from("ads").update({ status }).eq("id", aid))
}

export async function deleteAd(formData: FormData) {
    const { id: aid } = schemas.one.parse(Object.fromEntries(formData))
    await run("ad.delete", "ad", aid, (db) => db.from("ads").delete().eq("id", aid))
}

export async function createPartner(formData: FormData) {
    const data = schemas.partner.parse(Object.fromEntries(formData))
    await run("partner.create", "partner", data.name, (db) => db.from("partners").insert(data))
}

export async function setPartnerActive(formData: FormData) {
    const { id: pid, active } = schemas.partnerToggle.parse(Object.fromEntries(formData))
    await run("partner.active", "partner", pid, (db) => db.from("partners").update({ is_active: active === "true" }).eq("id", pid))
}

export async function deletePartner(formData: FormData) {
    const { id: pid } = schemas.one.parse(Object.fromEntries(formData))
    await run("partner.delete", "partner", pid, (db) => db.from("partners").delete().eq("id", pid))
}
