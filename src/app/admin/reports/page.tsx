import Link from "next/link"
import { z } from "zod"
import { requireAdmin } from "@/lib/admin"
import { PageHeader } from "@/components/ui/page-header"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { setReportHidden, setReportStatus, deleteReport } from "../actions"
import { ConfirmSubmit } from "./confirm-submit"

const PAGE_SIZE = 20
const STATUSES = ["lost", "found", "in_contact", "reunited", "paused", "closed"] as const
const field = "h-11 rounded-xl border border-input bg-card px-3 text-sm"

const query = z.object({
    page: z.coerce.number().int().min(1).max(10000).catch(1),
    status: z.enum(STATUSES).optional().catch(undefined),
    q: z.string().trim().max(60).optional().catch(undefined),
})

export default async function AdminReports({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
    const { page, status, q } = query.parse(await searchParams)
    const { supabase } = await requireAdmin()

    let req = supabase
        .from("pets")
        .select("id, name, status, is_hidden, last_seen_district, last_seen_department, created_at", { count: "exact" })
        .order("created_at", { ascending: false })
        .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)
    if (status) req = req.eq("status", status)
    if (q) req = req.ilike("name", `%${q.replace(/[%_,()\\]/g, " ")}%`)

    const { data: pets, count } = await req
    const pages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE))
    const href = (p: number) => `/admin/reports?${new URLSearchParams({ ...(status && { status }), ...(q && { q }), page: String(p) })}`

    return (
        <div className="space-y-6">
            <PageHeader title="Reportes" text={`${count ?? 0} en total. Modera estados, oculta o elimina casos.`} />

            <form className="flex flex-wrap gap-2" role="search">
                <input name="q" defaultValue={q} placeholder="Buscar por nombre" aria-label="Buscar por nombre" className={`${field} w-full sm:w-64`} />
                <select name="status" defaultValue={status ?? ""} aria-label="Estado" className={field}>
                    <option value="">Todos los estados</option>
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <Button type="submit">Filtrar</Button>
            </form>

            {(pets ?? []).length === 0 ? (
                <p className="rounded-3xl border border-dashed bg-card p-10 text-center text-muted-foreground">Sin resultados.</p>
            ) : (
                <ul className="space-y-3">
                    {(pets ?? []).map((p) => (
                        <li key={p.id} className={`flex flex-col gap-4 rounded-3xl border bg-card p-4 shadow-[var(--shadow-soft)] lg:flex-row lg:items-center ${p.is_hidden ? "opacity-70" : ""}`}>
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <Link href={`/mascotas/${p.id}`} className="truncate text-base font-semibold text-primary hover:underline">{p.name || "Sin nombre"}</Link>
                                    <StatusBadge status={p.status} />
                                    {p.is_hidden && <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800">OCULTO</span>}
                                </div>
                                <p className="mt-1 text-sm text-muted-foreground">{[p.last_seen_district, p.last_seen_department].filter(Boolean).join(", ") || "Sin zona"}</p>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                <form action={setReportStatus} className="flex items-center gap-2">
                                    <input type="hidden" name="id" value={p.id} />
                                    <select name="status" defaultValue={p.status} aria-label="Cambiar estado" className="h-10 rounded-xl border border-input bg-card px-2 text-sm">
                                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                    <Button size="sm" variant="outline" type="submit">Guardar</Button>
                                </form>
                                <form action={setReportHidden}>
                                    <input type="hidden" name="id" value={p.id} />
                                    <input type="hidden" name="hidden" value={String(!p.is_hidden)} />
                                    <Button size="sm" variant="ghost" type="submit">{p.is_hidden ? "Mostrar" : "Ocultar"}</Button>
                                </form>
                                <form action={deleteReport}>
                                    <input type="hidden" name="id" value={p.id} />
                                    <ConfirmSubmit message={`¿Eliminar definitivamente el reporte de ${p.name || "esta mascota"}?`}>Eliminar</ConfirmSubmit>
                                </form>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            <nav aria-label="Paginación" className="flex items-center justify-between text-sm">
                {page > 1 ? <Link href={href(page - 1)} className="font-semibold text-primary hover:underline">← Anterior</Link> : <span />}
                <span className="text-muted-foreground">Página {page} de {pages}</span>
                {page < pages ? <Link href={href(page + 1)} className="font-semibold text-primary hover:underline">Siguiente →</Link> : <span />}
            </nav>
        </div>
    )
}
