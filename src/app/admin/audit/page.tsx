import { requireAdmin } from "@/lib/admin"
import { PageHeader } from "@/components/ui/page-header"

const fmt = new Intl.DateTimeFormat("es-PE", { dateStyle: "short", timeStyle: "short" })

export default async function AdminAudit() {
    const { supabase } = await requireAdmin()
    const { data: rows } = await supabase
        .from("admin_audit_log")
        .select("id, admin_id, action, target_id, details, created_at")
        .order("created_at", { ascending: false })
        .limit(100)

    return (
        <div className="space-y-6">
            <PageHeader title="Auditoría" text="Registro de las acciones de moderación (las 100 más recientes)." />
            <div className="overflow-x-auto rounded-3xl border bg-card shadow-[var(--shadow-soft)]">
                <table className="w-full text-left text-sm">
                    <thead className="border-b bg-secondary/60 text-xs uppercase tracking-wider text-muted-foreground">
                        <tr><th className="p-4">Fecha</th><th className="p-4">Acción</th><th className="p-4">Objetivo</th><th className="p-4">Admin</th></tr>
                    </thead>
                    <tbody className="divide-y">
                        {(rows ?? []).length === 0 && <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Sin acciones registradas</td></tr>}
                        {(rows ?? []).map((r) => (
                            <tr key={r.id}>
                                <td className="whitespace-nowrap p-4 text-muted-foreground">{fmt.format(new Date(r.created_at))}</td>
                                <td className="p-4 font-semibold">{r.action}</td>
                                <td className="p-4 font-mono text-xs">{r.target_id}</td>
                                <td className="p-4 font-mono text-xs">{r.admin_id.slice(0, 8)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
