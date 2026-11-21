import { requireAdmin } from "@/lib/admin"
import { PageHeader } from "@/components/ui/page-header"

const fmt = new Intl.DateTimeFormat("es-PE", { dateStyle: "medium" })

// Solo lectura: los roles admin se otorgan por SQL (ver migración), nunca desde la UI.
export default async function AdminUsers() {
    const { supabase } = await requireAdmin()
    const { data: users, count } = await supabase
        .from("profiles")
        .select("id, full_name, department, district, created_at", { count: "exact" })
        .order("created_at", { ascending: false })
        .limit(100)

    return (
        <div className="space-y-6">
            <PageHeader title="Usuarios" text={`${count ?? 0} registrados. Se muestran los 100 más recientes; no se exponen teléfono ni correo.`} />
            <div className="overflow-x-auto rounded-3xl border bg-card shadow-[var(--shadow-soft)]">
                <table className="w-full text-left text-sm">
                    <thead className="border-b bg-secondary/60 text-xs uppercase tracking-wider text-muted-foreground">
                        <tr><th className="p-4">Nombre</th><th className="p-4">Zona</th><th className="p-4">Alta</th></tr>
                    </thead>
                    <tbody className="divide-y">
                        {(users ?? []).length === 0 && <tr><td colSpan={3} className="p-8 text-center text-muted-foreground">Sin usuarios todavía</td></tr>}
                        {(users ?? []).map((u) => (
                            <tr key={u.id}>
                                <td className="p-4 font-semibold">{u.full_name || "Sin nombre"}</td>
                                <td className="p-4 text-muted-foreground">{[u.district, u.department].filter(Boolean).join(", ") || "—"}</td>
                                <td className="p-4 text-muted-foreground">{u.created_at ? fmt.format(new Date(u.created_at)) : "—"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
