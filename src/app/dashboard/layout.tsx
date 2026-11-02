
"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import {
    LayoutDashboard,
    FileText,
    Lightbulb,
    Settings,
    Plus,
    ShieldAlert,
    Search,
    LogOut,
    Loader2
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createClient } from "@/utils/supabase/client"

const SIDEBAR_ITEMS = [
    {
        label: "Resumen",
        href: "/dashboard",
        icon: LayoutDashboard
    },
    {
        label: "Mis Reportes",
        href: "/dashboard/reports",
        icon: FileText
    },
    {
        label: "Pistas",
        href: "/dashboard/messages",
        icon: Lightbulb
    },
    {
        label: "Configuración",
        href: "/dashboard/settings",
        icon: Settings
    }
]

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [profile, setProfile] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                router.push("/login")
                return
            }

            const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single()

            if (data) setProfile(data)
            setIsLoading(false)
        }
        fetchProfile()
    }, [supabase, router])

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push("/")
    }

    return (
        <div className="flex min-h-screen bg-stone-50">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-white hidden md:flex flex-col">
                {/* Logo */}
                <div className="flex h-16 items-center px-6 border-b">
                    <Link href="/" className="flex items-center gap-2 font-bold text-lg text-stone-800">
                        <div className="bg-teal-700 rounded p-1"><Search className="text-white h-4 w-4" /></div>
                        BuscaMascotas
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-1 px-3 py-6">
                    {SIDEBAR_ITEMS.map((item) => {
                        const Icon = item.icon
                        const isActive = item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href)
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                                    ? "bg-teal-50 text-teal-800"
                                    : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                                    }`}
                            >
                                <Icon className={`h-5 w-5 ${isActive ? "text-teal-700" : "text-stone-400"}`} />
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>

                {/* Footer Actions */}
                <div className="p-4 space-y-4 border-t">
                    <Button className="w-full bg-teal-700 hover:bg-teal-800 shadow-lg shadow-teal-700/20 font-bold" asChild>
                        <Link href="/reportar">
                            <Plus className="mr-2 h-4 w-4" /> Nuevo Reporte
                        </Link>
                    </Button>

                    <div className="flex items-center gap-3 pt-2">
                        <Avatar className="h-9 w-9 border border-stone-100 shadow-sm">
                            {profile?.avatar_url && <AvatarImage src={profile.avatar_url} alt="" />}
                            <AvatarFallback className="bg-teal-50 text-teal-800 font-bold text-xs">
                                {profile?.full_name?.substring(0, 2).toUpperCase() || "..."}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 overflow-hidden">
                            <p className="truncate text-sm font-bold text-stone-900">
                                {isLoading ? "Cargando..." : (profile?.full_name || "Usuario")}
                            </p>
                            <p className="truncate text-[10px] font-bold text-teal-700 uppercase tracking-wider">Miembro</p>
                        </div>
                        <button
                            onClick={handleSignOut}
                            className="text-stone-400 hover:text-red-500 transition-colors"
                            title="Cerrar sesión"
                            aria-label="Cerrar sesión"
                        >
                            <LogOut className="h-4 w-4" />
                        </button>
                    </div>

                    <Link href="/contacto" className="flex items-center gap-2 px-1 text-xs font-semibold text-stone-500 hover:text-stone-800">
                        <ShieldAlert className="h-3.5 w-3.5" /> Soporte
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 min-h-screen pb-20 md:pb-0">
                {children}
            </main>

            {/* Navegación móvil */}
            <nav aria-label="Dashboard" className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t bg-white md:hidden">
                {SIDEBAR_ITEMS.map((item) => {
                    const Icon = item.icon
                    const isActive = item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href)
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            aria-current={isActive ? "page" : undefined}
                            className={`flex flex-col items-center gap-1 py-2 text-[11px] font-medium ${isActive ? "text-teal-800" : "text-stone-500"}`}
                        >
                            <Icon className="h-5 w-5" aria-hidden />
                            {item.label === "Configuración" ? "Ajustes" : item.label === "Mis Reportes" ? "Reportes" : item.label}
                        </Link>
                    )
                })}
            </nav>

        </div>
    )
}
