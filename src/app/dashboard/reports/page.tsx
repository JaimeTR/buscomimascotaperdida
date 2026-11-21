"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Check, Copy, Eye, FileText, Lightbulb, Loader2, Megaphone, MapPin, Pause, PenLine, Play, Plus, Search, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { EmptyState } from "@/components/ui/empty-state"
import { PageHeader } from "@/components/ui/page-header"
import { StatusBadge } from "@/components/status-badge"
import { createClient } from "@/utils/supabase/client"
import { useToast } from "@/components/ui/toast-modern"
import { useConfirm } from "@/components/ui/confirm-modern"
import { cn } from "@/lib/utils"
import { ReunionDialog } from "@/components/reunion-dialog"
import { reminderDue } from "@/lib/reunion"

type Report = {
    id: string
    name: string | null
    status: string
    breed: string | null
    image_urls: string[] | null
    last_seen_district: string | null
    last_seen_department: string | null
    created_at: string
    reminded_at: string | null
    sightings: { id: string }[] | null
}

const ACTIVE = ["lost", "found", "in_contact"]
const FILTERS = [
    { key: "all", label: "Todos", test: () => true },
    { key: "active", label: "Activos", test: (s: string) => ACTIVE.includes(s) },
    { key: "resolved", label: "Resueltos", test: (s: string) => s === "reunited" },
    { key: "paused", label: "Pausados", test: (s: string) => s === "paused" || s === "closed" },
]
const fmt = new Intl.DateTimeFormat("es-PE", { day: "numeric", month: "short", year: "numeric" })

export default function MyReportsPage() {
    const supabase = useMemo(() => createClient(), [])
    const { toast } = useToast()
    const { confirm } = useConfirm()
    const [reports, setReports] = useState<Report[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState("all")
    const [query, setQuery] = useState("")
    const [copied, setCopied] = useState<string | null>(null)
    const [reuniting, setReuniting] = useState<Report | null>(null)

    const load = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        const { data, error } = await supabase
            .from("pets")
            .select("id, name, status, breed, image_urls, last_seen_district, last_seen_department, created_at, reminded_at, sightings(id)")
            .eq("owner_id", user.id) // ownership: solo mis reportes (RLS es la segunda barrera)
            .order("created_at", { ascending: false })
            .returns<Report[]>()
        if (error) toast("Error al cargar tus reportes", { type: "error" })
        else setReports(data ?? [])
        setLoading(false)
    }, [supabase, toast])

    useEffect(() => { queueMicrotask(() => void load()) }, [load])

    const visible = useMemo(() => {
        const test = FILTERS.find((f) => f.key === filter)!.test
        const q = query.trim().toLowerCase()
        return reports.filter((r) => test(r.status) && (!q || `${r.name ?? ""} ${r.last_seen_district ?? ""}`.toLowerCase().includes(q)))
    }, [reports, filter, query])

    const setStatus = async (id: string, status: string) => {
        const { error } = await supabase.from("pets").update({ status }).eq("id", id)
        if (error) return toast("No se pudo actualizar el estado", { type: "error" })
        toast("Estado actualizado", { type: "success" })
        void load()
    }

    // "Todavía no": pospone el recordatorio 14 días.
    const snooze = async (id: string) => {
        const now = new Date().toISOString()
        await supabase.from("pets").update({ reminded_at: now }).eq("id", id)
        setReports((prev) => prev.map((x) => (x.id === id ? { ...x, reminded_at: now } : x)))
    }

    const remove = async (r: Report) => {
        const ok = await confirm({
            title: "¿Eliminar reporte?",
            message: `Se eliminará el reporte de "${r.name || "esta mascota"}". Esta acción no se puede deshacer.`,
            confirmLabel: "Sí, eliminar",
            cancelLabel: "Cancelar",
            variant: "destructive",
        })
        if (!ok) return
        const { error } = await supabase.from("pets").delete().eq("id", r.id)
        if (error) return toast("No se pudo eliminar el reporte", { type: "error" })
        setReports((prev) => prev.filter((x) => x.id !== r.id))
        toast("Reporte eliminado", { type: "success" })
    }

    const copyLink = async (id: string) => {
        try {
            await navigator.clipboard.writeText(`${window.location.origin}/mascotas/${id}`)
            setCopied(id)
            toast("Enlace copiado", { type: "success" })
            setTimeout(() => setCopied(null), 2000)
        } catch {
            toast("No se pudo copiar el enlace", { type: "error" })
        }
    }

    return (
        <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-8">
            <PageHeader title="Mis reportes" text="Gestiona el estado de cada caso y compártelo.">
                <Button asChild variant="cta" className="rounded-full"><Link href="/reportar"><Plus className="mr-2 h-4 w-4" aria-hidden /> Nuevo reporte</Link></Button>
            </PageHeader>

            <div className="flex flex-wrap items-center gap-3">
                <div role="tablist" aria-label="Filtrar por estado" className="flex flex-wrap gap-2">
                    {FILTERS.map((f) => (
                        <button
                            key={f.key}
                            role="tab"
                            aria-selected={filter === f.key}
                            onClick={() => setFilter(f.key)}
                            className={cn("h-10 rounded-full border px-4 text-sm font-medium", filter === f.key ? "border-primary/40 bg-accent text-accent-foreground" : "bg-card text-muted-foreground hover:bg-secondary")}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
                <div className="relative ml-auto w-full sm:w-64">
                    <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                    <Input aria-label="Buscar en mis reportes" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Nombre o distrito" className="h-10 rounded-full pl-10" />
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20" role="status"><Loader2 className="h-8 w-8 animate-spin text-primary" aria-label="Cargando" /></div>
            ) : visible.length === 0 ? (
                reports.length === 0 ? (
                    <EmptyState icon={FileText} title="Aún no has publicado ningún reporte" text="Publica el primero para que la comunidad pueda ayudar.">
                        <Button asChild variant="cta"><Link href="/reportar">Crear un reporte</Link></Button>
                    </EmptyState>
                ) : (
                    <EmptyState icon={Search} title="Sin resultados" text="Prueba con otro filtro o búsqueda." />
                )
            ) : (
                <>
                {reports.filter((r) => reminderDue(r)).slice(0, 2).map((r) => (
                    <div key={r.id} role="status" className="mb-4 flex flex-col gap-3 rounded-2xl border border-cta/30 bg-cta/10 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm font-medium">¿Ya apareció <strong>{r.name || "tu mascota"}</strong>? Si volvió a casa, cuéntanos y celebra su historia.</p>
                        <div className="flex gap-2">
                            <Button size="sm" variant="cta" onClick={() => setReuniting(r)}>Sí, ya apareció</Button>
                            <Button size="sm" variant="ghost" onClick={() => snooze(r.id)}>Todavía no</Button>
                        </div>
                    </div>
                ))}
                <ul className="space-y-4">
                    {visible.map((r) => {
                        const isActive = ACTIVE.includes(r.status)
                        return (
                            <li key={r.id} className="flex flex-col gap-4 rounded-3xl border bg-card p-4 shadow-[var(--shadow-soft)] sm:flex-row">
                                <img src={r.image_urls?.[0] || "/img/sin-foto.svg"} alt={`Foto de ${r.name || "la mascota"}`} className="h-40 w-full rounded-2xl object-cover sm:h-28 sm:w-28" loading="lazy" />
                                <div className="min-w-0 flex-1 space-y-3">
                                    <div className="flex flex-wrap items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <h2 className="truncate text-lg font-semibold">{r.name || "Sin nombre"}</h2>
                                            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                                <MapPin className="h-4 w-4 text-cta" aria-hidden />
                                                {[r.last_seen_district, r.last_seen_department].filter(Boolean).join(", ") || "Sin ubicación"} · {fmt.format(new Date(r.created_at))}
                                            </p>
                                        </div>
                                        <StatusBadge status={r.status} />
                                    </div>
                                    <p className="flex items-center gap-1.5 text-sm text-muted-foreground"><Lightbulb className="h-4 w-4" aria-hidden /> {r.sightings?.length ?? 0} {r.sightings?.length === 1 ? "pista" : "pistas"}</p>

                                    <div className="flex flex-wrap gap-2">
                                        <Button asChild size="sm" variant="outline"><Link href={`/mascotas/${r.id}`}><Eye className="mr-1.5 h-4 w-4" aria-hidden /> Ver</Link></Button>
                                        <Button asChild size="sm" variant="cta"><Link href={`/cartel/${r.id}`}><Megaphone className="mr-1.5 h-4 w-4" aria-hidden /> Cartel</Link></Button>
                                        <Button asChild size="sm" variant="outline"><Link href={`/dashboard/reports/${r.id}/edit`}><PenLine className="mr-1.5 h-4 w-4" aria-hidden /> Editar</Link></Button>
                                        <Button size="sm" variant="outline" onClick={() => copyLink(r.id)}>
                                            {copied === r.id ? <Check className="mr-1.5 h-4 w-4" aria-hidden /> : <Copy className="mr-1.5 h-4 w-4" aria-hidden />} Copiar enlace
                                        </Button>
                                        {isActive && <Button size="sm" onClick={() => setReuniting(r)}><Check className="mr-1.5 h-4 w-4" aria-hidden /> Marcar reunido</Button>}
                                        {isActive && <Button size="sm" variant="ghost" onClick={() => setStatus(r.id, "paused")}><Pause className="mr-1.5 h-4 w-4" aria-hidden /> Pausar</Button>}
                                        {(r.status === "paused" || r.status === "closed") && <Button size="sm" variant="ghost" onClick={() => setStatus(r.id, "lost")}><Play className="mr-1.5 h-4 w-4" aria-hidden /> Reactivar</Button>}
                                        <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => remove(r)} aria-label={`Eliminar reporte de ${r.name || "mascota"}`}>
                                            <Trash2 className="h-4 w-4" aria-hidden />
                                        </Button>
                                    </div>
                                </div>
                            </li>
                        )
                    })}
                </ul>
                </>
            )}
            {reuniting && <ReunionDialog pet={reuniting} onClose={() => setReuniting(null)} onDone={() => { setReuniting(null); void load() }} />}
        </div>
    )
}
