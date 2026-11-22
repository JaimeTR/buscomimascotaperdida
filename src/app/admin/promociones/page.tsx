import { requireAdmin } from "@/lib/admin"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { PLACEMENTS } from "@/lib/ads"
import { approveAdRequest, setRequestStatus } from "../promo-actions"

const fmt = new Intl.DateTimeFormat("es-PE", { dateStyle: "medium", timeStyle: "short" })
const field = "h-10 w-full rounded-xl border border-input bg-card px-3 text-sm"
const KIND: Record<string, string> = { anuncio: "Anuncio", aliado: "Aliado", voluntario: "Voluntario" }

type Req = {
    id: string; kind: string; plan: string | null; business_name: string; contact_name: string; email: string
    phone: string | null; link_url: string | null; message: string | null; status: string; created_at: string
}

export default async function AdminPromos() {
    const { supabase } = await requireAdmin()
    const { data } = await supabase
        .from("promo_requests")
        .select("id, kind, plan, business_name, contact_name, email, phone, link_url, message, status, created_at")
        .order("created_at", { ascending: false })
        .limit(100)
        .returns<Req[]>()
    const rows = data ?? []
    const pending = rows.filter((r) => r.status === "pending").length

    return (
        <div className="space-y-6">
            <PageHeader title="Promociones" text={`${pending} solicitudes pendientes. Revisa y publica anuncios, o atiende alianzas y voluntarios.`} />

            {rows.length === 0 ? (
                <p className="rounded-3xl border border-dashed bg-card p-10 text-center text-muted-foreground">Todavía no hay solicitudes.</p>
            ) : (
                <ul className="space-y-4">
                    {rows.map((r) => (
                        <li key={r.id} className="rounded-3xl border bg-card p-5 shadow-[var(--shadow-soft)]">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <p className="font-semibold">{r.business_name} <span className="ml-1 rounded-full bg-accent px-2.5 py-0.5 text-xs font-bold text-accent-foreground">{KIND[r.kind]}{r.plan ? ` · ${r.plan}` : ""}</span></p>
                                    <p className="text-sm text-muted-foreground">{r.contact_name} · <a className="text-primary hover:underline" href={`mailto:${r.email}`}>{r.email}</a>{r.phone ? ` · ${r.phone}` : ""}</p>
                                    <p className="text-xs text-muted-foreground">{fmt.format(new Date(r.created_at))}</p>
                                </div>
                                <span className={`rounded-full px-3 py-1 text-xs font-bold ${r.status === "pending" ? "bg-amber-100 text-amber-800" : r.status === "approved" ? "bg-emerald-100 text-emerald-800" : "bg-secondary text-muted-foreground"}`}>
                                    {r.status === "pending" ? "Pendiente" : r.status === "approved" ? "Aprobada" : "Rechazada"}
                                </span>
                            </div>
                            {r.message && <p className="mt-3 rounded-2xl bg-secondary/60 p-3 text-sm">{r.message}</p>}
                            {r.link_url && <p className="mt-2 text-sm"><a className="text-primary hover:underline" href={r.link_url} target="_blank" rel="noopener noreferrer nofollow">{r.link_url}</a></p>}

                            <div className="mt-4 flex flex-wrap items-center gap-2">
                                {r.status !== "approved" && r.kind !== "anuncio" && (
                                    <form action={setRequestStatus}><input type="hidden" name="id" value={r.id} /><input type="hidden" name="status" value="approved" /><Button size="sm" type="submit">Marcar atendida</Button></form>
                                )}
                                {r.status === "pending" && (
                                    <form action={setRequestStatus}><input type="hidden" name="id" value={r.id} /><input type="hidden" name="status" value="rejected" /><Button size="sm" variant="ghost" type="submit">Rechazar</Button></form>
                                )}
                            </div>

                            {r.kind === "anuncio" && r.status === "pending" && (
                                <details className="mt-4 rounded-2xl border bg-background p-4">
                                    <summary className="cursor-pointer text-sm font-semibold text-primary">Aprobar y crear anuncio</summary>
                                    <form action={approveAdRequest} className="mt-4 grid gap-3 sm:grid-cols-2">
                                        <input type="hidden" name="request_id" value={r.id} />
                                        <label className="space-y-1 text-sm font-medium">Anunciante<input name="advertiser" defaultValue={r.business_name} required className={field} /></label>
                                        <label className="space-y-1 text-sm font-medium">Título<input name="title" required maxLength={90} className={field} /></label>
                                        <label className="space-y-1 text-sm font-medium sm:col-span-2">Texto (máx. 280)<input name="body" maxLength={280} className={field} /></label>
                                        <label className="space-y-1 text-sm font-medium">Enlace de destino (https)<input name="link_url" defaultValue={r.link_url ?? "https://"} required className={field} /></label>
                                        <label className="space-y-1 text-sm font-medium">Imagen (https o /img/stock/…)<input name="image_url" placeholder="/img/stock/paseo-en-el-parque.webp" className={field} /></label>
                                        <label className="space-y-1 text-sm font-medium">Texto del botón<input name="cta_label" defaultValue="Conocer más" maxLength={30} className={field} /></label>
                                        <label className="space-y-1 text-sm font-medium">Días en línea<input name="days" type="number" min={1} max={365} defaultValue={30} className={field} /></label>
                                        <fieldset className="sm:col-span-2">
                                            <legend className="mb-1 text-sm font-medium">Espacios</legend>
                                            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
                                                {PLACEMENTS.map((p) => <label key={p.key} className="flex items-center gap-2"><input type="checkbox" name="placements" value={p.key} defaultChecked={p.key === "home_banner"} /> {p.label}</label>)}
                                            </div>
                                        </fieldset>
                                        <div className="sm:col-span-2"><Button type="submit" variant="cta">Publicar anuncio</Button></div>
                                    </form>
                                </details>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
