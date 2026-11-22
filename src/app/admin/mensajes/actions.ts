"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { requireAdmin } from "@/lib/admin"

const schema = z.object({ id: z.string().uuid(), status: z.enum(["new", "read", "done"]) })

export async function setMessageStatus(formData: FormData) {
    const parsed = schema.safeParse({ id: formData.get("id"), status: formData.get("status") })
    if (!parsed.success) return
    const { supabase } = await requireAdmin()
    await supabase.from("contact_messages").update({ status: parsed.data.status }).eq("id", parsed.data.id)
    revalidatePath("/admin/mensajes")
}
