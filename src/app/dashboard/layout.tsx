
"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import {
    LayoutDashboard,
    FileText,
    MessageSquare,
    Users,
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
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard
    },
    {
        label: "Mis Reportes",
        href: "/dashboard/reports",
        icon: FileText
    },
    {
        label: "Mensajes",
        href: "/dashboard/messages",
        icon: MessageSquare
    },
    {
        label: "Comunidad",
        href: "/dashboard/community",
        icon: Users
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
        <div className="flex min-h-screen bg-slate-50">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-white hidden md:flex flex-col">
                {/* Logo */}
                <div className="flex h-16 items-center px-6 border-b">
                    <Link href="/" className="flex items-center gap-2 font-bold text-lg text-slate-800">
                        <div className="bg-blue-500 rounded p-1"><Search className="text-white h-4 w-4" /></div>
                        BuscaMascotas
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-1 px-3 py-6">
                    {SIDEBAR_ITEMS.map((item) => {
                        const Icon = item.icon
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                                    ? "bg-blue-50 text-blue-600"
                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                    }`}
                            >
                                <Icon className={`h-5 w-5 ${isActive ? "text-blue-500" : "text-slate-400"}`} />
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>

                {/* Footer Actions */}
                <div className="p-4 space-y-4 border-t">
                    <Button className="w-full bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-500/20 font-bold" asChild>
                        <Link href="/reportar">
                            <Plus className="mr-2 h-4 w-4" /> Nuevo Reporte
                        </Link>
                    </Button>

                    <div className="flex items-center gap-3 pt-2">
                        <Avatar className="h-9 w-9 border border-slate-100 shadow-sm">
                            <AvatarImage src={profile?.avatar_url || "https://github.com/shadcn.png"} />
                            <AvatarFallback className="bg-blue-50 text-blue-600 font-bold text-xs">
                                {profile?.full_name?.substring(0, 2).toUpperCase() || "..."}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 overflow-hidden">
                            <p className="truncate text-sm font-bold text-slate-900">
                                {isLoading ? "Cargando..." : (profile?.full_name || "Usuario")}
                            </p>
                            <p className="truncate text-[10px] font-bold text-blue-500 uppercase tracking-wider">Miembro</p>
                        </div>
                        <button
                            onClick={handleSignOut}
                            className="text-slate-400 hover:text-red-500 transition-colors"
                            title="Cerrar sesión"
                        >
                            <LogOut className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-tight px-1 cursor-pointer hover:text-slate-600">
                        <ShieldAlert className="h-3 w-3" /> Soporte y Seguridad
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 min-h-screen">
                {children}
            </main>

        </div>
    )
}
