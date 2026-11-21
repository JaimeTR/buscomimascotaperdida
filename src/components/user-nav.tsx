
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { User, FileText, MessageSquare, LogOut, Loader2 } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { createClient } from "@/utils/supabase/client"

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
                subscribeProfile(session.user.id)
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

        // Realtime de perfil: se crea con el id de sesión real (antes usaba un `user` obsoleto).
        let profileChannel: ReturnType<typeof supabase.channel> | null = null
        const subscribeProfile = (id: string) => {
            profileChannel?.unsubscribe()
            profileChannel = supabase
                .channel('profile-changes')
                .on('postgres_changes',
                    { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${id}` },
                    (payload) => setProfile(payload.new)
                )
                .subscribe()
        }

        getSession()

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session) {
                setUser(session.user)
                subscribeProfile(session.user.id)
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
            profileChannel?.unsubscribe()
            window.removeEventListener('focus', handleFocus)
        }
    }, [supabase])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/')
        router.refresh()
    }

    if (isLoading) {
        return <Loader2 className="h-5 w-5 animate-spin text-stone-300" />
    }

    if (!user) {
        return (
            <div className="flex items-center gap-2">
                <Button variant="ghost" asChild className="hidden sm:inline-flex font-bold text-muted-foreground">
                    <Link href="/login">Iniciar Sesión</Link>
                </Button>
                <Button asChild className="rounded-full bg-primary hover:bg-primary font-bold px-6 shadow-md shadow-teal-700/20">
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
                        <span className="text-sm font-bold text-foreground leading-tight truncate max-w-[120px]">
                            {profile?.full_name || user.email.split('@')[0]}
                        </span>
                        <Link
                            href="/dashboard/reports"
                            className="text-[10px] font-medium text-primary hover:text-primary transition-colors"
                            onClick={(e) => e.stopPropagation()}
                        >
                            Ver dashboard
                        </Link>
                    </div>
                    <Avatar className="h-10 w-10 border-2 border-white shadow-sm transition-transform group-hover:scale-105 group-data-[state=open]:ring-2 group-data-[state=open]:ring-teal-100">
                        <AvatarImage src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} />
                        <AvatarFallback className="bg-accent text-primary font-bold">
                            {(profile?.full_name || user.email).substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-2 mt-2 mr-4 rounded-3xl border-border shadow-2xl animate-in fade-in zoom-in-95 duration-200" align="end">
                <div className="p-3 mb-2 border-b border-stone-50">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Cuenta</p>
                    <p className="text-sm font-bold text-foreground truncate">{user.email}</p>
                </div>

                <div className="space-y-1">
                    {menuItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                            className="flex items-start gap-3 p-3 rounded-2xl hover:bg-background transition-colors group"
                        >
                            <div className="bg-secondary p-2 rounded-xl group-hover:bg-card transition-colors">
                                <item.icon className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="flex-1 flex justify-between items-center">
                                <div className="space-y-0.5">
                                    <p className="text-sm font-bold text-foreground">{item.label}</p>
                                    <p className="text-[10px] text-muted-foreground leading-none">{item.description}</p>
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

                <div className="mt-2 pt-2 border-t border-stone-50 px-1">
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
