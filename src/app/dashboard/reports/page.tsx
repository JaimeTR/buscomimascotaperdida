
"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { Megaphone, Eye, Lightbulb, Search, Printer, PenLine, CheckCircle2, Share2, Heart, Loader2, Plus, PawPrint, MapPin, ChevronDown, Trash2, Facebook, Twitter, Copy, Check, MessageCircle, Instagram } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { createClient } from "@/utils/supabase/client"
import { useToast } from "@/components/ui/toast-modern"
import { useConfirm } from "@/components/ui/confirm-modern"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export default function MyReportsPage() {
    const supabase = createClient()
    const { toast } = useToast()
    const { confirm } = useConfirm()
    const [isLoading, setIsLoading] = useState(true)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [reports, setReports] = useState<any[]>([])
    const [statusFilter, setStatusFilter] = useState("all")
    const [searchQuery, setSearchQuery] = useState("")
    const filteredReports = useMemo(() => {
        let filtered = [...reports]

        if (statusFilter !== "all") {
            const statusMap: Record<string, string> = {
                lost: "lost",
                found: "found",
                closed: "reunited"
            }
            filtered = filtered.filter(r => r.status === statusMap[statusFilter])
        }

        if (searchQuery) {
            filtered = filtered.filter(r =>
                r.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                r.last_seen_district?.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        return filtered
    }, [reports, statusFilter, searchQuery])
    const [stats, setStats] = useState({
        active: 0,
        resolved: 0,
        recentLeads: 0
    })
    const [copiedId, setCopiedId] = useState<string | null>(null)

    const getStatusMeta = (status: string) => {
        switch (status) {
            case 'lost':
                return { label: 'PERDIDO', badgeClass: 'bg-orange-500 text-white' }
            case 'found':
                return { label: 'ENCONTRADO', badgeClass: 'bg-emerald-500 text-white' }
            case 'in_contact':
                return { label: 'EN CONTACTO', badgeClass: 'bg-teal-700 text-white' }
            default:
                return { label: 'REUNIDO', badgeClass: 'bg-stone-500 text-white' }
        }
    }

    const fetchData = async () => {
        setIsLoading(true)
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) return

            // 1. Fetch Pets with sightings
            const { data: petsData, error: petsError } = await supabase
                .from('pets')
                .select('*, sightings(id, created_at)')
                .eq('owner_id', session.user.id)
                .order('created_at', { ascending: false })

            if (petsError) throw petsError

            setReports(petsData || [])

            // 2. Calculate Real Stats
            const activeCount = petsData?.filter(p => p.status === 'lost' || p.status === 'found').length || 0
            const leadsCount = petsData?.reduce((acc, p) => acc + (p.sightings?.length || 0), 0) || 0

            setStats({
                active: activeCount,
                resolved: petsData?.filter(p => p.status === 'reunited').length || 0,
                recentLeads: leadsCount
            })

        } catch (error) {
            console.error("Error fetching dashboard data:", error)
            toast("Error al cargar tus reportes", { type: "error" })
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        queueMicrotask(() => {
            void fetchData()
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps -- carga inicial única; fetchData se redefine en cada render
    }, [])

    // Helper to calculate estimated views for a single pet
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const calculatePetViews = (pet: any): number => {
        const now = new Date()
        const createdAt = new Date(pet.created_at)
        const daysOld = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24))

        // Base views: 20 views per day for first week, then decreasing
        let petViews = 0
        if (daysOld <= 7) {
            petViews = daysOld * 20
        } else if (daysOld <= 30) {
            petViews = (7 * 20) + ((daysOld - 7) * 5)
        } else {
            petViews = (7 * 20) + (23 * 5) + ((daysOld - 30) * 2)
        }

        // Bonus for sightings (each represents engaged viewers)
        petViews += (pet.sightings?.length || 0) * 10

        // Bonus for active reports
        if (pet.status === 'lost' || pet.status === 'found') {
            petViews = Math.floor(petViews * 1.5)
        }

        return Math.max(petViews, (pet.sightings?.length || 0) * 5) // Minimum: 5 views per sighting
    }

    const handleStatusChange = async (petId: string, newStatus: string) => {
        try {
            const { error } = await supabase
                .from('pets')
                .update({ status: newStatus })
                .eq('id', petId)

            if (error) throw error

            toast("¡Estado actualizado con éxito!", { type: "success" })
            fetchData() // Refresh data
        } catch (error) {
            console.error('Error updating status:', error)
            toast("Error al actualizar el estado", { type: "error" })
        }
    }

    const handleDeleteReport = async (petId: string, petName: string) => {
        try {
            const confirmed = await confirm({
                title: "¿Eliminar reporte?",
                message: `¿Estás seguro de que deseas eliminar el reporte de "${petName}"? Esta acción no se puede deshacer.`,
                confirmLabel: "Sí, eliminar",
                cancelLabel: "Cancelar",
                variant: "destructive"
            })

            if (!confirmed) return

            const { error } = await supabase
                .from('pets')
                .delete()
                .eq('id', petId)

            if (error) throw error

            // Actualizar estado local inmediatamente para el usuario
            setReports(prev => prev.filter(item => item.id !== petId))

            toast("Reporte eliminado exitosamente", { type: "success", title: "¡Listo!" })
            // No necesitamos fetchData() porque ya actualizamos localmente
        } catch (error) {
            console.error('Error deleting report:', error)
            toast("Error al eliminar el reporte", { type: "error" })
        }
    }

    const handleCopyLink = async (petId: string) => {
        try {
            const url = `${window.location.origin}/mascotas/${petId}`
            await navigator.clipboard.writeText(url)
            setCopiedId(petId)
            toast("Enlace copiado al portapapeles", { type: "success" })
            setTimeout(() => setCopiedId(null), 2000)
        } catch (err) {
            console.error('Failed to copy: ', err);
            toast("Error al copiar enlace", { type: "error" })
        }
    }

    const handleShareSocial = (platform: 'facebook' | 'twitter' | 'whatsapp' | 'instagram' | 'tiktok', petId: string, name: string) => {
        const url = `${window.location.origin}/mascotas/${petId}`
        const text = `Ayúdame a encontrar a mi mascota ${name || 'sin nombre'}. ¡Por favor comparte!`
        let shareUrl = ''

        if (platform === 'facebook') {
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
        } else if (platform === 'twitter') {
            shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
        } else if (platform === 'whatsapp') {
            shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`
        } else if (platform === 'instagram') {
            // Instagram doesn't support direct sharing via URL, so we copy link and open IG
            handleCopyLink(petId)
            window.open('https://instagram.com/', '_blank')
            return
        } else if (platform === 'tiktok') {
            // TikTok doesn't support direct sharing via URL either
            handleCopyLink(petId)
            window.open('https://tiktok.com/', '_blank')
            return
        }

        if (shareUrl) {
            window.open(shareUrl, '_blank', 'noopener,noreferrer')
        }
    }

    if (isLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-teal-800" />
            </div>
        )
    }

    return (
        <div className="p-6 md:p-10 space-y-8 max-w-6xl mx-auto">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-stone-900 tracking-tight">Mis Reportes</h1>
                    <p className="text-stone-500 font-medium">Gestiona tus mascotas perdidas y encontradas</p>
                </div>
                <Button className="h-12 px-6 rounded-2xl bg-teal-800 hover:bg-teal-800 font-bold shadow-lg shadow-teal-800/20 transition-all" asChild>
                    <Link href="/reportar-mascota">
                        <Plus className="mr-2 h-5 w-5" /> Nuevo Reporte
                    </Link>
                </Button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm space-y-2 relative overflow-hidden group">
                    <div className="flex items-start justify-between">
                        <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Reportes Activos</span>
                        <div className="bg-teal-50 p-2 rounded-xl text-teal-700 group-hover:scale-110 transition-transform">
                            <Megaphone className="h-5 w-5" />
                        </div>
                    </div>
                    <div className="text-4xl font-black text-stone-900">{stats.active}</div>
                    <div className="text-xs font-medium text-stone-500">Perdidos o encontrados, sin resolver</div>
                </div>
                <div className="bg-white p-6 rounded-2xl border space-y-2">
                    <div className="flex items-start justify-between">
                        <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Casos resueltos</span>
                        <div className="bg-teal-50 p-2 rounded-xl text-teal-800">
                            <CheckCircle2 className="h-5 w-5" />
                        </div>
                    </div>
                    <div className="text-4xl font-black text-stone-900">{stats.resolved}</div>
                    <div className="text-xs font-medium text-stone-500">Mascotas que volvieron a casa</div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm space-y-2 group">
                    <div className="flex items-start justify-between">
                        <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Pistas Recibidas</span>
                        <div className="bg-emerald-50 p-2 rounded-xl text-emerald-500 group-hover:scale-110 transition-transform">
                            <Lightbulb className="h-5 w-5" />
                        </div>
                    </div>
                    <div className="text-4xl font-black text-stone-900">{stats.recentLeads}</div>
                    <div className="flex items-center text-xs font-medium text-teal-800">
                        <span className="mr-1">◎</span> Revisa tus mensajes
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-end justify-between">
                <div className="space-y-4 w-full md:w-auto">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-wider block">Filtrar por estado</label>
                    <Tabs defaultValue="all" className="w-full" onValueChange={(val) => {
                        setStatusFilter(val)
                        // Trigger effect? No, useEffect depends on statusFilter
                    }}>
                        <TabsList className="bg-stone-100 p-1 h-12 rounded-2xl w-full md:w-auto flex">
                            <TabsTrigger value="all" className="rounded-xl h-10 px-6 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all flex-1">Todos</TabsTrigger>
                            <TabsTrigger value="lost" className="rounded-xl h-10 px-6 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all flex-1">Perdidos</TabsTrigger>
                            <TabsTrigger value="found" className="rounded-xl h-10 px-6 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all flex-1">Encontrados</TabsTrigger>
                            <TabsTrigger value="closed" className="rounded-xl h-10 px-6 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all flex-1">Reunidos</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                <div className="space-y-4 w-full md:w-96">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-wider block">Buscar mascota</label>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
                        <Input
                            className="h-12 pl-12 rounded-2xl border-stone-200 bg-white font-medium focus-visible:ring-teal-700 transition-all"
                            placeholder="Nombre de tu mascota..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Reports Grid */}
            <div className="grid grid-cols-1 gap-6 pb-12">
                {filteredReports.length > 0 ? (
                    filteredReports.map((pet) => (
                        <div key={pet.id} className="bg-white rounded-[2rem] border border-stone-100 shadow-sm overflow-hidden flex flex-col md:flex-row p-5 gap-6 group hover:shadow-md transition-shadow">
                            <div className="w-full md:w-56 aspect-[4/3] md:aspect-square relative shrink-0">
                                <img
                                    src={pet.image_urls?.[0] || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=600"}
                                    className="w-full h-full object-cover rounded-2xl"
                                    alt={pet.name}
                                />
                                <span className={`absolute top-3 left-3 px-3 py-1.5 rounded-full text-[10px] font-black tracking-wider uppercase border-2 border-white shadow-lg flex items-center gap-1.5 ${getStatusMeta(pet.status).badgeClass}`}>
                                    {getStatusMeta(pet.status).label}
                                </span>
                            </div>

                            <div className="flex-1 flex flex-col justify-between py-1">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-2xl font-black text-stone-900 tracking-tight">{pet.name || "Sin nombre"}</h3>
                                            <div className="flex items-center text-sm text-stone-500 font-medium mt-1">
                                                <MapPin className="h-3 w-3 mr-1 text-teal-700" />
                                                {pet.last_seen_district}, {pet.last_seen_department}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="icon" className="h-10 w-10 text-stone-400 rounded-xl hover:bg-stone-50" asChild>
                                                <Link href={`/mascotas/${pet.id}`} aria-label={`Ver reporte de ${pet.name || "mascota"}`}>
                                                    <Eye className="h-5 w-5" />
                                                </Link>
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-10 w-10 text-stone-400 rounded-xl hover:bg-stone-50" asChild>
                                                <Link href={`/dashboard/reports/${pet.id}/edit`} aria-label={`Editar reporte de ${pet.name || "mascota"}`}>
                                                    <PenLine className="h-5 w-5" />
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-10 w-10 text-stone-400 rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors"
                                                aria-label={`Eliminar reporte de ${pet.name || "mascota"}`}
                                                onClick={() => handleDeleteReport(pet.id, pet.name || 'Sin nombre')}
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                        <div>
                                            <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Fecha de reporte</div>
                                            <div className="font-bold text-stone-900">
                                                {pet.created_at ? format(new Date(pet.created_at), "d MMM, yyyy", { locale: es }) : "---"}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Pistas</div>
                                            <div className="font-bold text-teal-800 flex items-center gap-1">
                                                <Lightbulb className="h-3 w-3" />
                                                {pet.sightings?.length || 0} recibidas
                                            </div>
                                        </div>
                                        <div className="hidden md:block">
                                            <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Raza</div>
                                            <div className="font-bold text-stone-900 truncate">{pet.breed || "No especificada"}</div>
                                        </div>
                                        <div className="hidden md:block">
                                            <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Vistas</div>
                                            <div className="font-bold text-stone-900">{calculatePetViews(pet).toLocaleString()}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-3 mt-6">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="h-11 px-6 rounded-xl border-stone-200 font-black text-stone-700 bg-white">
                                                <ChevronDown className="mr-2 h-4 w-4" /> {getStatusMeta(pet.status).label}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-56 p-2" align="start">
                                            <div className="space-y-1">
                                                <button
                                                    onClick={() => handleStatusChange(pet.id, 'lost')}
                                                    className="w-full text-left px-3 py-2 text-sm font-bold rounded-lg hover:bg-orange-50 text-orange-600 transition-colors"
                                                >
                                                    Perdido
                                                </button>
                                                <button
                                                    onClick={() => handleStatusChange(pet.id, 'found')}
                                                    className="w-full text-left px-3 py-2 text-sm font-bold rounded-lg hover:bg-emerald-50 text-emerald-600 transition-colors"
                                                >
                                                    Encontrado
                                                </button>
                                                <button
                                                    onClick={() => handleStatusChange(pet.id, 'in_contact')}
                                                    className="w-full text-left px-3 py-2 text-sm font-bold rounded-lg hover:bg-teal-50 text-teal-800 transition-colors"
                                                >
                                                    En contacto
                                                </button>
                                                <button
                                                    onClick={() => handleStatusChange(pet.id, 'reunited')}
                                                    className="w-full text-left px-3 py-2 text-sm font-bold rounded-lg hover:bg-stone-50 text-stone-600 transition-colors"
                                                >
                                                    Reunido
                                                </button>
                                            </div>
                                        </PopoverContent>
                                    </Popover>

                                    <Button className="bg-teal-700 hover:bg-teal-800 text-white font-bold h-11 px-6 rounded-xl shadow-lg shadow-teal-700/10 transition-all border-none" asChild>
                                        <Link href={`/cartel?id=${pet.id}`}>
                                            <Printer className="mr-2 h-4 w-4" /> Generar Cartel
                                        </Link>
                                    </Button>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="h-11 px-6 rounded-xl border-stone-200 font-bold text-stone-600">
                                                <Share2 className="mr-2 h-4 w-4" /> Compartir
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-80 p-5 rounded-2xl shadow-xl border-stone-100" align="end">
                                            <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-4">Compartir en redes</h4>
                                            <div className="grid grid-cols-3 gap-3 mb-4">
                                                <button
                                                    onClick={() => handleShareSocial('whatsapp', pet.id, pet.name)}
                                                    className="flex flex-col items-center justify-center gap-1.5 h-20 rounded-2xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:scale-105 transition-all"
                                                    title="WhatsApp"
                                                >
                                                    <MessageCircle className="h-6 w-6" />
                                                    <span className="text-[10px] font-bold">WhatsApp</span>
                                                </button>
                                                <button
                                                    onClick={() => handleShareSocial('facebook', pet.id, pet.name)}
                                                    className="flex flex-col items-center justify-center gap-1.5 h-20 rounded-2xl bg-teal-50 text-teal-800 hover:bg-teal-100 hover:scale-105 transition-all"
                                                    title="Facebook"
                                                >
                                                    <Facebook className="h-6 w-6" />
                                                    <span className="text-[10px] font-bold">Facebook</span>
                                                </button>
                                                <button
                                                    onClick={() => handleShareSocial('twitter', pet.id, pet.name)}
                                                    className="flex flex-col items-center justify-center gap-1.5 h-20 rounded-2xl bg-stone-50 text-stone-900 hover:bg-stone-100 hover:scale-105 transition-all"
                                                    title="X (Twitter)"
                                                >
                                                    <Twitter className="h-6 w-6" />
                                                    <span className="text-[10px] font-bold">X</span>
                                                </button>
                                                <button
                                                    onClick={() => handleShareSocial('instagram', pet.id, pet.name)}
                                                    className="flex flex-col items-center justify-center gap-1.5 h-20 rounded-2xl bg-pink-50 text-pink-600 hover:bg-pink-100 hover:scale-105 transition-all"
                                                    title="Instagram"
                                                >
                                                    <Instagram className="h-6 w-6" />
                                                    <span className="text-[10px] font-bold">Instagram</span>
                                                </button>
                                                <button
                                                    onClick={() => handleShareSocial('tiktok', pet.id, pet.name)}
                                                    className="flex flex-col items-center justify-center gap-1.5 h-20 rounded-2xl bg-stone-900 text-white hover:bg-black hover:scale-105 transition-all shadow-md shadow-stone-900/10"
                                                    title="TikTok"
                                                >
                                                    {/* Custom TikTok Icon */}
                                                    <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 10.692 6.33 6.33 0 0 0 10.857-4.424V8.687a8.182 8.182 0 0 0 4.773 1.526V6.79a4.831 4.831 0 0 1-1.003-.104z" />
                                                    </svg>
                                                    <span className="text-[10px] font-bold">TikTok</span>
                                                </button>
                                                <button
                                                    onClick={() => handleCopyLink(pet.id)}
                                                    className="flex flex-col items-center justify-center gap-1.5 h-20 rounded-2xl bg-teal-50 text-teal-600 hover:bg-teal-100 hover:scale-105 transition-all"
                                                    title="Copiar enlace"
                                                >
                                                    {copiedId === pet.id ? <Check className="h-6 w-6 text-emerald-600" /> : <Copy className="h-6 w-6" />}
                                                    <span className="text-[10px] font-bold">{copiedId === pet.id ? 'Copiado' : 'Copiar'}</span>
                                                </button>
                                            </div>
                                            <div
                                                onClick={() => handleCopyLink(pet.id)}
                                                className="flex items-center gap-2 p-3 rounded-xl bg-stone-50 cursor-pointer text-xs text-stone-500 font-medium truncate border border-stone-100 group hover:border-teal-200 transition-colors"
                                            >
                                                <div className="bg-white p-1.5 rounded-lg shadow-sm group-hover:text-teal-700 transition-colors">
                                                    <Share2 className="h-3 w-3" />
                                                </div>
                                                <span className="truncate flex-1 select-all">{`${typeof window !== 'undefined' ? window.location.origin : ''}/mascotas/${pet.id}`}</span>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                    <Button variant="secondary" className="h-11 px-6 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-600 font-bold transition-all border-none" asChild>
                                        <Link href={`/mascotas/${pet.id}/avistamiento`}>
                                            <Megaphone className="mr-2 h-4 w-4" /> Notificar Avistamientos
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="bg-white rounded-[2rem] border-2 border-dashed border-stone-100 p-16 flex flex-col items-center justify-center text-center space-y-4">
                        <div className="bg-stone-50 p-6 rounded-full">
                            <PawPrint className="h-12 w-12 text-stone-200" />
                        </div>
                        <div className="space-y-2 max-w-xs">
                            <h3 className="text-xl font-bold text-stone-900">No tienes reportes aún</h3>
                            <p className="text-stone-500 text-sm">
                                Tus reportes de mascotas perdidas o encontradas aparecerán aquí para que los gestiones.
                            </p>
                        </div>
                        <Button className="bg-teal-800 hover:bg-teal-800 font-bold px-8 h-12 rounded-xl mt-4" asChild>
                            <Link href="/reportar">
                                <Plus className="mr-2 h-5 w-5" /> Crear mi primer reporte
                            </Link>
                        </Button>
                    </div>
                )}
            </div>

            {/* Safety Banner */}
            <div className="bg-teal-800 rounded-[2.5rem] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none"></div>
                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                    <div className="bg-white/10 p-5 rounded-3xl backdrop-blur-sm text-white border border-white/20">
                        <Heart className="h-10 w-10 fill-current text-red-300" />
                    </div>
                    <div className="text-center md:text-left space-y-2">
                        <h3 className="text-2xl font-black text-white">No pierdas la esperanza</h3>
                        <p className="text-teal-100 font-medium max-w-lg">
                            Más del 80% de las mascotas reportadas se reúnen con sus familias en la primera semana. Estamos contigo.
                        </p>
                    </div>
                </div>
                <Button className="bg-white hover:bg-teal-50 text-teal-800 font-black px-10 h-14 rounded-2xl shadow-xl shadow-black/10 transition-all text-base border-none whitespace-nowrap">
                    Guía de Seguridad
                </Button>
            </div>

        </div>
    )
}
