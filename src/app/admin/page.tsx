import { requireAdmin } from "@/lib/admin"
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

    const cards = [
        { label: "Reportes totales", value: total },
        { label: "Últimos 30 días", value: recent },
        { label: "Ocultos (moderados)", value: hidden },
        { label: "Usuarios", value: users },
    ]

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-extrabold tracking-tight">Resumen</h1>
            <section aria-label="Métricas" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {cards.map((c) => (
                    <div key={c.label} className="rounded-2xl border bg-card p-5">
                        <p className="text-sm font-semibold text-muted-foreground">{c.label}</p>
                        <p className="text-3xl font-extrabold">{c.value}</p>
                    </div>
                ))}
            </section>

            <div className="grid gap-8 lg:grid-cols-2">
                <section aria-labelledby="h-estados">
                    <h2 id="h-estados" className="mb-3 text-lg font-bold">Por estado</h2>
                    <ul className="divide-y rounded-2xl border bg-card">
                        {STATUSES.map((s, i) => (
                            <li key={s} className="flex justify-between p-3 text-sm"><span>{statusLabel(s)}</span><strong>{byStatus[i]}</strong></li>
                        ))}
                    </ul>
                </section>
                <section aria-labelledby="h-zonas">
                    <h2 id="h-zonas" className="mb-3 text-lg font-bold">Zonas con más reportes (30 días)</h2>
                    <ul className="divide-y rounded-2xl border bg-card">
                        {byZone.length === 0 && <li className="p-3 text-sm text-muted-foreground">Sin datos</li>}
                        {byZone.map(([zone, n]) => (
                            <li key={zone} className="flex justify-between p-3 text-sm"><span>{zone}</span><strong>{n}</strong></li>
                        ))}
                    </ul>
                </section>
            </div>
        </div>
    )
}
