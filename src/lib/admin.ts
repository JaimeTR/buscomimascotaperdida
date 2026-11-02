import { notFound, redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"

// Guard server-side: toda página y acción de /admin debe pasar por aquí.
// Usuarios sin rol reciben 404 para no revelar que la ruta existe.
export async function requireAdmin() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login?next=/admin")

    const { data: isAdmin } = await supabase.rpc("is_admin")
    if (isAdmin !== true) notFound()

    return { supabase, user }
}
