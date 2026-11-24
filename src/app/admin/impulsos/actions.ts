"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { requireAdmin } from "@/lib/admin"
import { notifyBoostConfirmed } from "@/lib/owner-alerts"

const schema = z.object({
    id: z.string().uuid(),
    decision: z.enum(["approve", "reject"]),
    amount: z.coerce.number().min(0).max(99999).optional(),
    days: z.coerce.number().int().min(1).max(365).optional(),
})

// Confirma (o rechaza) un aporte voluntario. Al aprobar, el caso queda destacado `days` días y se ordena por `amount`.
export async function decideBoost(formData: FormData) {
    const parsed = schema.safeParse(Object.fromEntries(formData))
    if (!parsed.success) return
    const { supabase } = await requireAdmin()
    const { id, decision, amount, days } = parsed.data
    if (decision === "reject") {
        await supabase.from("pet_boosts").update({ status: "rejected" }).eq("id", id)
    } else {
        const now = new Date()
        await supabase.from("pet_boosts").update({
            status: "approved",
            amount_confirmed: amount ?? 0,
            starts_at: now.toISOString(),
            ends_at: new Date(now.getTime() + (days ?? 30) * 86_400_000).toISOString(),
        }).eq("id", id)
        await notifyBoostConfirmed(id)
    }
    revalidatePath("/admin/impulsos")
    revalidatePath("/")
}
