import Link from "next/link"
import { z } from "zod"
import { requireAdmin } from "@/lib/admin"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { setReportHidden, setReportStatus, deleteReport } from "../actions"
import { ConfirmSubmit } from "./confirm-submit"

const PAGE_SIZE = 20
const STATUSES = ["lost", "found", "in_contact", "reunited", "paused", "closed"] as const

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
            <h1 className="text-2xl font-extrabold tracking-tight">Reportes <span className="text-base font-normal text-muted-foreground">({count ?? 0})</span></h1>

            <form className="flex flex-wrap gap-2" role="search">
                <input name="q" defaultValue={q} placeholder="Buscar por nombre" aria-label="Buscar por nombre" className="h-10 rounded-lg border bg-card px-3 text-sm" />
                <select name="status" defaultValue={status ?? ""} aria-label="Estado" className="h-10 rounded-lg border bg-card px-3 text-sm">
                    <option value="">Todos los estados</option>
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <Button type="submit">Filtrar</Button>
            </form>

            <div className="overflow-x-auto rounded-2xl border bg-card">
                <table className="w-full text-left text-sm">
                    <thead className="border-b bg-muted/50 text-xs uppercase text-muted-foreground">
                        <tr><th className="p-3">Mascota</th><th className="p-3">Estado</th><th className="p-3">Zona</th><th className="p-3">Acciones</th></tr>
                    </thead>
                    <tbody className="divide-y">
                        {(pets ?? []).length === 0 && <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">Sin resultados</td></tr>}
                        {(pets ?? []).map((p) => (
                            <tr key={p.id} className={p.is_hidden ? "bg-muted/40" : undefined}>
                                <td className="p-3">
                                    <Link href={`/mascotas/${p.id}`} className="font-semibold text-primary hover:underline">{p.name || "Sin nombre"}</Link>
                                    {p.is_hidden && <span className="ml-2 text-xs font-bold text-warning">OCULTO</span>}
                                </td>
                                <td className="p-3">
                                    <form action={setReportStatus} className="flex items-center gap-2">
                                        <input type="hidden" name="id" value={p.id} />
                                        <StatusBadge status={p.status} />
                                        <select name="status" defaultValue={p.status} aria-label="Cambiar estado" className="h-8 rounded border bg-card px-1 text-xs">
                                            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                        <button className="text-xs font-semibold text-primary hover:underline">Guardar</button>
                                    </form>
                                </td>
                                <td className="p-3 text-muted-foreground">{[p.last_seen_district, p.last_seen_department].filter(Boolean).join(", ")}</td>
                                <td className="p-3">
                                    <div className="flex gap-3">
                                        <form action={setReportHidden}>
                                            <input type="hidden" name="id" value={p.id} />
                                            <input type="hidden" name="hidden" value={String(!p.is_hidden)} />
                                            <button className="text-xs font-semibold text-primary hover:underline">{p.is_hidden ? "Mostrar" : "Ocultar"}</button>
                                        </form>
                                        <form action={deleteReport}>
                                            <input type="hidden" name="id" value={p.id} />
                                            <ConfirmSubmit message={`¿Eliminar definitivamente el reporte de ${p.name || "esta mascota"}?`}>Eliminar</ConfirmSubmit>
                                        </form>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <nav aria-label="Paginación" className="flex items-center justify-between text-sm">
                {page > 1 ? <Link href={href(page - 1)} className="font-semibold text-primary hover:underline">← Anterior</Link> : <span />}
                <span className="text-muted-foreground">Página {page} de {pages}</span>
                {page < pages ? <Link href={href(page + 1)} className="font-semibold text-primary hover:underline">Siguiente →</Link> : <span />}
            </nav>
        </div>
    )
}
