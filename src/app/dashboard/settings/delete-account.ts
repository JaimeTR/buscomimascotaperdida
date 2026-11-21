"use server"

import { createClient } from "@/utils/supabase/server"
import { createAdminClient } from "@/utils/supabase/admin"

const DELETE_CONFIRM_WORD = "ELIMINAR" // las "use server" solo pueden exportar funciones async

// Borra la cuenta del usuario autenticado: sus fotos y, por cascada en la base, perfil, reportes, avistamientos y suscripciones.
export async function deleteAccountAction(confirmation: string): Promise<{ success?: true; error?: string }> {
    if (confirmation.trim().toUpperCase() !== DELETE_CONFIRM_WORD) return { error: `Escribe ${DELETE_CONFIRM_WORD} para confirmar.` }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Tu sesión expiró. Inicia sesión de nuevo." }

    let admin
    try {
        admin = createAdminClient()
    } catch {
        return { error: "No pudimos procesar la eliminación ahora. Escríbenos a contacto@buscomimascotaperdida.com." }
    }

    // Los administradores dejan rastro en la auditoría: su baja la hace otro admin.
    const { data: isAdmin } = await admin.from("admin_users").select("user_id").eq("user_id", user.id).maybeSingle()
    if (isAdmin) return { error: "Tu cuenta es de administrador. Pide a otro administrador que la dé de baja primero." }

    // Fotos propias (carpeta por usuario). Si falla el borrado de archivos no frenamos la baja de datos.
    try {
        for (let i = 0; i < 20; i++) {
            const { data: files } = await admin.storage.from("pet-images").list(user.id, { limit: 100 })
            if (!files?.length) break
            await admin.storage.from("pet-images").remove(files.map((f) => `${user.id}/${f.name}`))
        }
    } catch {
        console.error("account deletion: storage cleanup failed")
    }

    const { error } = await admin.auth.admin.deleteUser(user.id)
    if (error) {
        console.error("account deletion failed")
        return { error: "No pudimos eliminar tu cuenta. Inténtalo de nuevo o escríbenos." }
    }

    await supabase.auth.signOut()
    return { success: true }
}
