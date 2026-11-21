import { FileText, CalendarDays, EyeOff, Users } from "lucide-react"
import { requireAdmin } from "@/lib/admin"
import { PageHeader } from "@/components/ui/page-header"
import { StatCard } from "@/components/ui/stat-card"
import { statusLabel } from "@/components/status-badge"

const STATUSES = ["lost", "found", "in_contact", "reunited", "paused", "closed"]
const DAY = 24 * 60 * 60 * 1000
const sinceDate = () => new Date(Date.now() - 30 * DAY).toISOString()

export default async function AdminHome() {
    const { supabase } = await requireAdmin()
    const since = sinceDate()

    const count = (q: PromiseLike<{ count: number | null }>) => q.then((r) => r.count ?? 0)
    const head = { count: "exact", head: true } as const

    const [total, hidden, recent, users, ...byStatus] = await Promise.all([
        count(supabase.from("pets").select("id", head)),
        count(supabase.from("pets").select("id", head).eq("is_hidden", true)),
        count(supabase.from("pets").select("id", head).gte("created_at", since)),
        count(supabase.from("profiles").select("id", head)),
        ...STATUSES.map((s) => count(supabase.from("pets").select("id", head).eq("status", s))),
    ])

    const { data: zones } = await supabase.from("pets").select("last_seen_department").gte("created_at", since).limit(1000)
    const byZone = Object.entries(
        (zones ?? []).reduce<Record<string, number>>((acc, z) => {
            const k = z.last_seen_department || "Sin dato"
            acc[k] = (acc[k] ?? 0) + 1
            return acc
        }, {})
    ).sort((a, b) => b[1] - a[1]).slice(0, 8)

    const maxStatus = Math.max(1, ...byStatus)
    const maxZone = Math.max(1, ...byZone.map(([, n]) => n))

    return (
        <div className="space-y-8">
            <PageHeader title="Resumen" text="Actividad de la plataforma." />

            <section aria-label="Métricas" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard label="Reportes totales" value={total} icon={FileText} tone="teal" />
                <StatCard label="Últimos 30 días" value={recent} icon={CalendarDays} tone="orange" />
                <StatCard label="Ocultos (moderados)" value={hidden} icon={EyeOff} tone="amber" />
                <StatCard label="Usuarios" value={users} icon={Users} tone="green" />
            </section>

            <div className="grid gap-6 lg:grid-cols-2">
                <section aria-labelledby="h-estados" className="rounded-3xl border bg-card p-6 shadow-[var(--shadow-soft)]">
                    <h2 id="h-estados" className="mb-4 text-lg font-semibold">Por estado</h2>
                    <ul className="space-y-3">
                        {STATUSES.map((s, i) => (
                            <li key={s}>
                                <div className="mb-1 flex justify-between text-sm"><span>{statusLabel(s)}</span><strong>{byStatus[i]}</strong></div>
                                <div className="h-2 rounded-full bg-secondary"><div className="h-2 rounded-full bg-primary" style={{ width: `${(byStatus[i] / maxStatus) * 100}%` }} /></div>
                            </li>
                        ))}
                    </ul>
                </section>

                <section aria-labelledby="h-zonas" className="rounded-3xl border bg-card p-6 shadow-[var(--shadow-soft)]">
                    <h2 id="h-zonas" className="mb-4 text-lg font-semibold">Zonas con más reportes (30 días)</h2>
                    {byZone.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Sin datos todavía.</p>
                    ) : (
                        <ul className="space-y-3">
                            {byZone.map(([zone, n]) => (
                                <li key={zone}>
                                    <div className="mb-1 flex justify-between text-sm"><span>{zone}</span><strong>{n}</strong></div>
                                    <div className="h-2 rounded-full bg-secondary"><div className="h-2 rounded-full bg-cta" style={{ width: `${(n / maxZone) * 100}%` }} /></div>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </div>
    )
}
