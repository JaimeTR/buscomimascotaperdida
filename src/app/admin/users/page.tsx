import { requireAdmin } from "@/lib/admin"

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
            <h1 className="text-2xl font-extrabold tracking-tight">Usuarios <span className="text-base font-normal text-muted-foreground">({count ?? 0})</span></h1>
            <div className="overflow-x-auto rounded-2xl border bg-card">
                <table className="w-full text-left text-sm">
                    <thead className="border-b bg-muted/50 text-xs uppercase text-muted-foreground">
                        <tr><th className="p-3">Nombre</th><th className="p-3">Zona</th><th className="p-3">Alta</th></tr>
                    </thead>
                    <tbody className="divide-y">
                        {(users ?? []).map((u) => (
                            <tr key={u.id}>
                                <td className="p-3 font-semibold">{u.full_name || "Sin nombre"}</td>
                                <td className="p-3 text-muted-foreground">{[u.district, u.department].filter(Boolean).join(", ") || "—"}</td>
                                <td className="p-3 text-muted-foreground">{u.created_at ? fmt.format(new Date(u.created_at)) : "—"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <p className="text-xs text-muted-foreground">Se muestran los 100 más recientes. No se exponen teléfono ni correo.</p>
        </div>
    )
}
