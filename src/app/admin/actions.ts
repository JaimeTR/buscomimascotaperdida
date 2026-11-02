"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { requireAdmin } from "@/lib/admin"

const idSchema = z.string().uuid()
const STATUSES = ["lost", "found", "in_contact", "reunited", "paused", "closed"] as const

const schemas = {
    hide: z.object({ id: idSchema, hidden: z.enum(["true", "false"]) }),
    status: z.object({ id: idSchema, status: z.enum(STATUSES) }),
    remove: z.object({ id: idSchema }),
}

async function run(action: string, details: Record<string, unknown> & { id: string }, mutate: (db: Awaited<ReturnType<typeof requireAdmin>>["supabase"]) => PromiseLike<{ error: unknown }>) {
    const { supabase, user } = await requireAdmin()
    const { error } = await mutate(supabase)
    if (error) throw new Error("No se pudo completar la acción")
    await supabase.from("admin_audit_log").insert({
        admin_id: user.id,
        action,
        target_type: "pet",
        target_id: details.id,
        details,
    })
    revalidatePath("/admin", "layout")
}

export async function setReportHidden(formData: FormData) {
    const { id, hidden } = schemas.hide.parse(Object.fromEntries(formData))
    await run(hidden === "true" ? "report.hide" : "report.unhide", { id }, (db) =>
        db.from("pets").update({ is_hidden: hidden === "true" }).eq("id", id))
}

export async function setReportStatus(formData: FormData) {
    const { id, status } = schemas.status.parse(Object.fromEntries(formData))
    await run("report.status", { id, status }, (db) => db.from("pets").update({ status }).eq("id", id))
}

export async function deleteReport(formData: FormData) {
    const { id } = schemas.remove.parse(Object.fromEntries(formData))
    await run("report.delete", { id }, (db) => db.from("pets").delete().eq("id", id))
}
