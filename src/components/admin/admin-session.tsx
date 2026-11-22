"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Home, LogOut } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createClient } from "@/utils/supabase/client"

type Props = { name: string; avatarUrl?: string | null; variant: "side" | "top" }

// Perfil + inicio + salir del marco de administración (el encabezado público no se muestra aquí).
export function AdminSession({ name, avatarUrl, variant }: Props) {
    const router = useRouter()
    const initials = (name || "A").trim().slice(0, 2).toUpperCase()
    const signOut = async () => {
        await createClient().auth.signOut()
        router.push("/")
        router.refresh()
    }
    const avatar = (
        <Avatar className="h-9 w-9">
            {avatarUrl && <AvatarImage src={avatarUrl} alt="" referrerPolicy="no-referrer" />}
            <AvatarFallback className="bg-white/15 text-xs font-semibold text-white">{initials}</AvatarFallback>
        </Avatar>
    )

    if (variant === "top") {
        return (
            <div className="flex items-center gap-1 text-white/80">
                <Link href="/" aria-label="Ir a la web" className="flex h-10 w-10 items-center justify-center rounded-full active:bg-white/10"><Home className="h-5 w-5" aria-hidden /></Link>
                <button onClick={signOut} aria-label="Cerrar sesión" className="flex h-10 w-10 items-center justify-center rounded-full active:bg-white/10"><LogOut className="h-5 w-5" aria-hidden /></button>
                <Link href="/panel/ajustes" aria-label="Mi perfil" className="ml-1">{avatar}</Link>
            </div>
        )
    }

    return (
        <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-3">
            <Link href="/panel/ajustes" aria-label="Mi perfil">{avatar}</Link>
            <p className="min-w-0 flex-1 truncate text-sm font-semibold text-white">{name || "Administrador"}</p>
            <button onClick={signOut} aria-label="Cerrar sesión" className="rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white">
                <LogOut className="h-4 w-4" aria-hidden />
            </button>
        </div>
    )
}
