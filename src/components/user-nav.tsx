
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
    User,
    FileText,
    MessageSquare,
    LogOut,
    Settings,
    ChevronDown,
    Loader2
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { createClient } from "@/utils/supabase/client"
import { cn } from "@/lib/utils"

export function UserNav() {
    const router = useRouter()
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [user, setUser] = useState<any>(null)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [profile, setProfile] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (session) {
                setUser(session.user)
                // Fetch extra profile info if needed (like name for fallback)
                const { data } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single()
                if (data) setProfile(data)
            }
            setIsLoading(false)
        }

        getSession()

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session) {
                setUser(session.user)
                // Re-fetch profile when auth state changes
                supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single()
                    .then(({ data }) => {
                        if (data) setProfile(data)
                    })
            } else {
                setUser(null)
                setProfile(null)
            }
        })

        // Subscribe to profile changes to auto-update avatar
        const profileChannel = supabase
            .channel('profile-changes')
            .on('postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'profiles',
                    filter: `id=eq.${user?.id}`
                },
                (payload) => {
                    setProfile(payload.new)
                }
            )
            .subscribe()

        // Refresh profile when window gains focus (useful after updating in settings)
        const handleFocus = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (session) {
                const { data } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single()
                if (data) setProfile(data)
            }
        }
        window.addEventListener('focus', handleFocus)

        return () => {
            subscription.unsubscribe()
            profileChannel.unsubscribe()
            window.removeEventListener('focus', handleFocus)
        }
    }, [])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/')
        router.refresh()
    }

    if (isLoading) {
        return <Loader2 className="h-5 w-5 animate-spin text-slate-300" />
    }

    if (!user) {
        return (
            <div className="flex items-center gap-2">
                <Button variant="ghost" asChild className="hidden sm:inline-flex font-bold text-slate-600">
                    <Link href="/login">Iniciar Sesión</Link>
                </Button>
                <Button asChild className="rounded-full bg-blue-500 hover:bg-blue-600 font-bold px-6 shadow-md shadow-blue-500/20">
                    <Link href="/register">Unirme</Link>
                </Button>
            </div>
        )
    }

    const menuItems = [
        {
            label: "Reportes",
            icon: FileText,
            href: "/dashboard/reports",
            description: "Gestiona tus reportes de mascotas"
        },
        {
            label: "Mi Perfil",
            icon: User,
            href: "/dashboard/settings",
            description: "Datos de contacto y redes"
        },
        {
            label: "Mensajes",
            icon: MessageSquare,
            href: "/dashboard/messages",
            description: "Bandeja de entrada",
            badge: "2" // Example badge
        }
    ]

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <button className="flex items-center gap-2 group outline-none focus:ring-0">
                    <div className="hidden lg:flex flex-col items-end text-right">
                        <span className="text-sm font-bold text-slate-900 leading-tight truncate max-w-[120px]">
                            {profile?.full_name || user.email.split('@')[0]}
                        </span>
                        <Link
                            href="/dashboard/reports"
                            className="text-[10px] font-medium text-blue-500 hover:text-blue-600 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                        >
                            Ver dashboard
                        </Link>
                    </div>
                    <Avatar className="h-10 w-10 border-2 border-white shadow-sm transition-transform group-hover:scale-105 group-data-[state=open]:ring-2 group-data-[state=open]:ring-blue-100">
                        <AvatarImage src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} />
                        <AvatarFallback className="bg-blue-50 text-blue-600 font-bold">
                            {(profile?.full_name || user.email).substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-2 mt-2 mr-4 rounded-3xl border-slate-100 shadow-2xl animate-in fade-in zoom-in-95 duration-200" align="end">
                <div className="p-3 mb-2 border-b border-slate-50">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">Cuenta</p>
                    <p className="text-sm font-black text-slate-900 truncate">{user.email}</p>
                </div>

                <div className="space-y-1">
                    {menuItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                            className="flex items-start gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors group"
                        >
                            <div className="bg-slate-100 p-2 rounded-xl group-hover:bg-white transition-colors">
                                <item.icon className="h-4 w-4 text-slate-600" />
                            </div>
                            <div className="flex-1 flex justify-between items-center">
                                <div className="space-y-0.5">
                                    <p className="text-sm font-bold text-slate-900">{item.label}</p>
                                    <p className="text-[10px] text-slate-400 leading-none">{item.description}</p>
                                </div>
                                {item.badge && (
                                    <span className="bg-red-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                                        {item.badge}
                                    </span>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="mt-2 pt-2 border-t border-slate-50 px-1">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 p-3 rounded-2xl text-red-500 hover:bg-red-50 transition-colors font-bold text-sm"
                    >
                        <LogOut className="h-4 w-4" />
                        Cerrar Sesión
                    </button>
                </div>
            </PopoverContent>
        </Popover>
    )
}
