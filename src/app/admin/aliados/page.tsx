import { requireAdmin } from "@/lib/admin"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { PARTNER_KINDS } from "@/lib/ads"
import { ConfirmSubmit } from "../reports/confirm-submit"
import { createPartner, deletePartner, setPartnerActive, setPartnerOwner } from "../promo-actions"

const field = "h-10 w-full rounded-xl border border-input bg-card px-3 text-sm"
type Row = { id: string; name: string; kind: keyof typeof PARTNER_KINDS; city: string | null; is_active: boolean; owner_id: string | null }

export default async function AdminPartners() {
    const { supabase } = await requireAdmin()
    const { data } = await supabase.from("partners").select("id, name, kind, city, is_active, owner_id").order("sort").order("created_at", { ascending: false }).returns<Row[]>()
    const rows = data ?? []

    return (
        <div className="space-y-6">
            <PageHeader title="Aliados" text="Empresas, veterinarias, refugios y personas que aparecen en la página de aliados." />

            <details className="rounded-3xl border bg-card p-5 shadow-[var(--shadow-soft)]">
                <summary className="cursor-pointer font-semibold text-primary">Agregar aliado</summary>
                <form action={createPartner} className="mt-4 grid gap-3 sm:grid-cols-2">
                    <label className="space-y-1 text-sm font-medium">Nombre<input name="name" required minLength={2} maxLength={120} className={field} /></label>
                    <label className="space-y-1 text-sm font-medium">Tipo
                        <select name="kind" className={field}>{Object.entries(PARTNER_KINDS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
                    </label>
                    <label className="space-y-1 text-sm font-medium sm:col-span-2">Descripción (máx. 280)<input name="description" maxLength={280} className={field} /></label>
                    <label className="space-y-1 text-sm font-medium">Web (https)<input name="website_url" placeholder="https://" className={field} /></label>
                    <label className="space-y-1 text-sm font-medium">Logo (https o /ruta)<input name="logo_url" className={field} /></label>
                    <label className="space-y-1 text-sm font-medium">Ciudad<input name="city" maxLength={80} className={field} /></label>
                    <div className="flex items-end"><Button type="submit" variant="cta">Publicar aliado</Button></div>
                </form>
            </details>

            {rows.length === 0 ? (
                <p className="rounded-3xl border border-dashed bg-card p-10 text-center text-muted-foreground">Todavía no hay aliados.</p>
            ) : (
                <ul className="space-y-3">
                    {rows.map((p) => (
                        <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border bg-card p-4 shadow-[var(--shadow-soft)]">
                            <div><p className="font-semibold">{p.name}</p><p className="text-sm text-muted-foreground">{PARTNER_KINDS[p.kind]}{p.city ? ` · ${p.city}` : ""} · {p.is_active ? "Visible" : "Oculto"}</p></div>
                            <form action={setPartnerOwner} className="flex items-center gap-2">
                                <input type="hidden" name="id" value={p.id} />
                                <input name="email" type="email" placeholder={p.owner_id ? "Responsable asignado (correo para cambiar)" : "correo del responsable"} aria-label={`Correo del responsable de ${p.name}`} className="h-9 w-64 rounded-xl border border-input bg-card px-3 text-sm" />
                                <Button size="sm" variant="outline" type="submit">Guardar</Button>
                            </form>
                            <div className="flex items-center gap-2">
                                <form action={setPartnerActive}><input type="hidden" name="id" value={p.id} /><input type="hidden" name="active" value={String(!p.is_active)} /><Button size="sm" variant="outline" type="submit">{p.is_active ? "Ocultar" : "Mostrar"}</Button></form>
                                <form action={deletePartner}><input type="hidden" name="id" value={p.id} /><ConfirmSubmit message={`¿Eliminar a ${p.name}?`}>Eliminar</ConfirmSubmit></form>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
