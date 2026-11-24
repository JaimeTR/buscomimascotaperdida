import Link from "next/link"
import { notFound } from "next/navigation"
import { Eye, MousePointerClick, Handshake } from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { StatCard } from "@/components/ui/stat-card"
import { Button } from "@/components/ui/button"
import { createClient } from "@/utils/supabase/server"

export const metadata = { title: "Mi negocio aliado | Busco mi mascota" }

const sinceDay = () => new Date(Date.now() - 30 * 86_400_000).toISOString().slice(0, 10)
const dayFmt = new Intl.DateTimeFormat("es-PE", { day: "numeric", month: "short" })

// Cifras de la ficha pública de un aliado, solo para su responsable (RLS). Sin responsable asignado, la ruta no existe.
export default async function PartnerPanel() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return notFound()
    const { data: partner } = await supabase.from("partners").select("id, name, is_active").eq("owner_id", user.id).limit(1).maybeSingle()
    if (!partner) return notFound()

    const since = sinceDay()
    const { data } = await supabase.from("partner_stats").select("day, views, clicks").eq("partner_id", partner.id).gte("day", since).order("day", { ascending: false })
    const rows = data ?? []
    const views = rows.reduce((n, r) => n + r.views, 0)
    const clicks = rows.reduce((n, r) => n + r.clicks, 0)

    return (
        <div className="mx-auto max-w-4xl space-y-8 p-4 md:p-8">
            <PageHeader title={partner.name} text="Visitas y clics de tu ficha pública en los últimos 30 días.">
                <Button asChild variant="outline" className="rounded-full"><Link href={`/aliados/${partner.id}`}>Ver mi ficha</Link></Button>
            </PageHeader>
            {!partner.is_active && <p className="rounded-2xl border bg-accent p-4 text-sm text-accent-foreground">Tu ficha está oculta por ahora, así que no recibe visitas. Escríbenos si quieres que vuelva a mostrarse.</p>}

            <section aria-label="Métricas" className="grid grid-cols-2 gap-4">
                <StatCard label="Visitas a tu ficha" value={views} icon={Eye} tone="teal" />
                <StatCard label="Clics a tu sitio web" value={clicks} icon={MousePointerClick} tone="orange" hint="Solo si tu ficha tiene web" />
            </section>

            <section aria-labelledby="h-dias" className="rounded-3xl border bg-card p-6 shadow-[var(--shadow-soft)]">
                <h2 id="h-dias" className="mb-4 flex items-center gap-2 text-lg font-semibold"><Handshake className="h-5 w-5 text-primary" aria-hidden /> Por día</h2>
                {rows.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Todavía no hay visitas registradas. Comparte el enlace de tu ficha para empezar.</p>
                ) : (
                    <table className="w-full text-left text-sm">
                        <thead><tr className="text-muted-foreground"><th className="py-2 font-medium">Día</th><th className="py-2 font-medium">Visitas</th><th className="py-2 font-medium">Clics</th></tr></thead>
                        <tbody>{rows.map((r) => <tr key={r.day} className="border-t"><td className="py-2">{dayFmt.format(new Date(`${r.day}T12:00:00`))}</td><td className="py-2">{r.views}</td><td className="py-2">{r.clicks}</td></tr>)}</tbody>
                    </table>
                )}
                <p className="mt-4 text-xs text-muted-foreground">Cuentan navegadores reales con un límite por persona; no incluye a los buscadores.</p>
            </section>
        </div>
    )
}
