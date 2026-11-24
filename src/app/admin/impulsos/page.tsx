import Link from "next/link"
import { requireAdmin } from "@/lib/admin"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { decideBoost } from "./actions"

const fmt = new Intl.DateTimeFormat("es-PE", { dateStyle: "medium", timeStyle: "short" })
const STATUS: Record<string, { label: string; cls: string }> = {
    pending: { label: "Por verificar", cls: "bg-amber-100 text-amber-800" },
    approved: { label: "Aprobado", cls: "bg-emerald-100 text-emerald-800" },
    rejected: { label: "Rechazado", cls: "bg-secondary text-muted-foreground" },
}
const field = "h-10 w-28 rounded-xl border border-input bg-card px-3 text-sm"

type Boost = {
    id: string; created_at: string; amount_claimed: number; amount_confirmed: number | null; method: string | null
    proof_path: string | null; note: string | null; status: string; starts_at: string | null; ends_at: string | null
    pet: { id: string; name: string | null } | null
}

export default async function AdminBoosts() {
    const { supabase } = await requireAdmin()
    const { data } = await supabase
        .from("pet_boosts")
        .select("id, created_at, amount_claimed, amount_confirmed, method, proof_path, note, status, starts_at, ends_at, pet:pets(id, name)")
        .order("created_at", { ascending: false })
        .limit(100)
        .returns<Boost[]>()
    const rows = data ?? []

    // Enlaces temporales (10 min) a los comprobantes: el bucket es privado.
    const links = new Map<string, string>()
    await Promise.all(rows.filter((r) => r.proof_path).map(async (r) => {
        const { data: s } = await supabase.storage.from("boost-proofs").createSignedUrl(r.proof_path!, 600)
        if (s?.signedUrl) links.set(r.id, s.signedUrl)
    }))
    const pending = rows.filter((r) => r.status === "pending").length

    return (
        <div className="space-y-6">
            <PageHeader title="Impulsos" text={`${pending} aportes por verificar. Confirma el monto: define el orden de las mascotas destacadas (mayor aporte, más adelante).`} />

            <a href="/admin/impulsos/exportar" className="inline-block text-sm font-semibold text-primary underline-offset-2 hover:underline">Descargar CSV de aportes</a>

            {rows.length === 0 ? (
                <p className="rounded-3xl border border-dashed bg-card p-10 text-center text-muted-foreground">Todavía no hay aportes.</p>
            ) : (
                <ul className="space-y-4">
                    {rows.map((r) => (
                        <li key={r.id} className="rounded-3xl border bg-card p-5 shadow-[var(--shadow-soft)]">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <p className="font-semibold">
                                        {r.pet ? <Link href={`/mascotas/${r.pet.id}`} className="text-primary hover:underline">{r.pet.name || "Sin nombre"}</Link> : "Caso eliminado"}
                                        <span className="ml-2 rounded-full bg-accent px-2.5 py-0.5 text-xs font-bold text-accent-foreground">Ofrece S/ {Number(r.amount_claimed).toFixed(2)}{r.method ? ` · ${r.method}` : ""}</span>
                                    </p>
                                    <p className="text-xs text-muted-foreground">{fmt.format(new Date(r.created_at))}</p>
                                </div>
                                <span className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS[r.status]?.cls}`}>{STATUS[r.status]?.label}</span>
                            </div>

                            <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium">
                                {r.amount_confirmed != null && <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-800">Confirmado: S/ {Number(r.amount_confirmed).toFixed(2)}</span>}
                                {r.ends_at && <span className="rounded-full bg-secondary px-3 py-1">Vigente hasta {fmt.format(new Date(r.ends_at))}</span>}
                                {links.get(r.id) ? <a href={links.get(r.id)} target="_blank" rel="noopener noreferrer" className="rounded-full bg-secondary px-3 py-1 text-primary hover:underline">Ver comprobante</a> : <span className="rounded-full bg-secondary px-3 py-1 text-muted-foreground">Sin comprobante</span>}
                            </div>

                            {r.status === "pending" && (
                                <div className="mt-4 flex flex-wrap items-end gap-3">
                                    <form action={decideBoost} className="flex flex-wrap items-end gap-3">
                                        <input type="hidden" name="id" value={r.id} />
                                        <input type="hidden" name="decision" value="approve" />
                                        <label className="space-y-1 text-xs font-medium">Monto confirmado (S/)<input name="amount" type="number" min={0} step="0.5" defaultValue={Number(r.amount_claimed)} className={field} /></label>
                                        <label className="space-y-1 text-xs font-medium">Días destacado<input name="days" type="number" min={1} max={365} defaultValue={30} className={field} /></label>
                                        <Button type="submit">Aprobar y destacar</Button>
                                    </form>
                                    <form action={decideBoost}><input type="hidden" name="id" value={r.id} /><input type="hidden" name="decision" value="reject" /><Button type="submit" variant="ghost">Rechazar</Button></form>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
