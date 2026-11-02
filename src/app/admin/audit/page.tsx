import { requireAdmin } from "@/lib/admin"

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
            <h1 className="text-2xl font-extrabold tracking-tight">Auditoría</h1>
            <div className="overflow-x-auto rounded-2xl border bg-card">
                <table className="w-full text-left text-sm">
                    <thead className="border-b bg-muted/50 text-xs uppercase text-muted-foreground">
                        <tr><th className="p-3">Fecha</th><th className="p-3">Acción</th><th className="p-3">Objetivo</th><th className="p-3">Admin</th></tr>
                    </thead>
                    <tbody className="divide-y">
                        {(rows ?? []).length === 0 && <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">Sin acciones registradas</td></tr>}
                        {(rows ?? []).map((r) => (
                            <tr key={r.id}>
                                <td className="p-3 whitespace-nowrap text-muted-foreground">{fmt.format(new Date(r.created_at))}</td>
                                <td className="p-3 font-semibold">{r.action}</td>
                                <td className="p-3 font-mono text-xs">{r.target_id}</td>
                                <td className="p-3 font-mono text-xs">{r.admin_id.slice(0, 8)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
