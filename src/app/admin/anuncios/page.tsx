import { requireAdmin } from "@/lib/admin"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { PLACEMENTS } from "@/lib/ads"
import { ConfirmSubmit } from "../reports/confirm-submit"
import { deleteAd, setAdStatus } from "../promo-actions"

const fmt = new Intl.DateTimeFormat("es-PE", { dateStyle: "medium" })
type Row = { id: string; advertiser: string; title: string; status: string; placements: string[]; clicks: number; starts_at: string; ends_at: string }

export default async function AdminAds() {
    const { supabase } = await requireAdmin()
    const { data } = await supabase
        .from("ads")
        .select("id, advertiser, title, status, placements, clicks, starts_at, ends_at")
        .order("created_at", { ascending: false })
        .limit(100)
        .returns<Row[]>()
    const rows = data ?? []
    const label = (k: string) => PLACEMENTS.find((p) => p.key === k)?.label ?? k

    return (
        <div className="space-y-6">
            <PageHeader title="Anuncios" text="Anuncios publicados. Los crea el equipo al aprobar una solicitud en Promociones." />
            {rows.length === 0 ? (
                <p className="rounded-3xl border border-dashed bg-card p-10 text-center text-muted-foreground">Todavía no hay anuncios.</p>
            ) : (
                <ul className="space-y-3">
                    {rows.map((a) => {
                        const expired = new Date(a.ends_at) < new Date()
                        return (
                            <li key={a.id} className="flex flex-col gap-4 rounded-3xl border bg-card p-4 shadow-[var(--shadow-soft)] lg:flex-row lg:items-center">
                                <div className="min-w-0 flex-1">
                                    <p className="truncate font-semibold">{a.title} <span className="font-normal text-muted-foreground">· {a.advertiser}</span></p>
                                    <p className="text-sm text-muted-foreground">{a.placements.map(label).join(", ")}</p>
                                    <p className="text-xs text-muted-foreground">{fmt.format(new Date(a.starts_at))} → {fmt.format(new Date(a.ends_at))}{expired ? " (vencido)" : ""} · {a.clicks} clics</p>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <form action={setAdStatus} className="flex items-center gap-2">
                                        <input type="hidden" name="id" value={a.id} />
                                        <select name="status" defaultValue={a.status} aria-label="Estado del anuncio" className="h-10 rounded-xl border border-input bg-card px-2 text-sm">
                                            <option value="active">Activo</option><option value="paused">Pausado</option><option value="draft">Borrador</option>
                                        </select>
                                        <Button size="sm" variant="outline" type="submit">Guardar</Button>
                                    </form>
                                    <form action={deleteAd}><input type="hidden" name="id" value={a.id} /><ConfirmSubmit message={`¿Eliminar el anuncio "${a.title}"?`}>Eliminar</ConfirmSubmit></form>
                                </div>
                            </li>
                        )
                    })}
                </ul>
            )}
        </div>
    )
}
