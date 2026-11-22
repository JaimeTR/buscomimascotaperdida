import { requireAdmin } from "@/lib/admin"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { setMessageStatus } from "./actions"

const fmt = new Intl.DateTimeFormat("es-PE", { dateStyle: "medium", timeStyle: "short" })
const KIND: Record<string, string> = { consulta: "Consulta", aliado: "Aliado", voluntario: "Voluntario", colaborar: "Colaborar", apoyo: "Apoyo", grupo: "Grupo" }
const STATUS: Record<string, { label: string; cls: string }> = {
    new: { label: "Nuevo", cls: "bg-amber-100 text-amber-800" },
    read: { label: "Leído", cls: "bg-sky-100 text-sky-800" },
    done: { label: "Atendido", cls: "bg-emerald-100 text-emerald-800" },
}

type Msg = {
    id: string; created_at: string; kind: string; name: string; email: string; phone: string | null; message: string | null
    amount: number | null; attachment_path: string | null; join_group: boolean; allow_mention: boolean; monthly: boolean; status: string
}

export default async function AdminMessages() {
    const { supabase } = await requireAdmin()
    const { data } = await supabase
        .from("contact_messages")
        .select("id, created_at, kind, name, email, phone, message, amount, attachment_path, join_group, allow_mention, monthly, status")
        .order("created_at", { ascending: false })
        .limit(100)
        .returns<Msg[]>()
    const rows = data ?? []

    // Enlaces temporales (10 min) a los comprobantes: el bucket es privado.
    const links = new Map<string, string>()
    await Promise.all(rows.filter((r) => r.attachment_path).map(async (r) => {
        const { data: s } = await supabase.storage.from("contact-attachments").createSignedUrl(r.attachment_path!, 600)
        if (s?.signedUrl) links.set(r.id, s.signedUrl)
    }))
    const fresh = rows.filter((r) => r.status === "new").length

    return (
        <div className="space-y-6">
            <PageHeader title="Mensajes" text={`${fresh} mensajes nuevos. Consultas, alianzas, voluntarios, colaboraciones y avisos de apoyo del formulario de contacto.`} />

            {rows.length === 0 ? (
                <p className="rounded-3xl border border-dashed bg-card p-10 text-center text-muted-foreground">Todavía no hay mensajes.</p>
            ) : (
                <ul className="space-y-4">
                    {rows.map((r) => (
                        <li key={r.id} className="rounded-3xl border bg-card p-5 shadow-[var(--shadow-soft)]">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <p className="font-semibold">{r.name} <span className="ml-1 rounded-full bg-accent px-2.5 py-0.5 text-xs font-bold text-accent-foreground">{KIND[r.kind] ?? r.kind}</span></p>
                                    <p className="text-sm text-muted-foreground"><a className="text-primary hover:underline" href={`mailto:${r.email}`}>{r.email}</a>{r.phone ? ` · ${r.phone}` : ""}</p>
                                    <p className="text-xs text-muted-foreground">{fmt.format(new Date(r.created_at))}</p>
                                </div>
                                <span className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS[r.status]?.cls}`}>{STATUS[r.status]?.label}</span>
                            </div>
                            {r.message && <p className="mt-3 whitespace-pre-wrap rounded-2xl bg-secondary/60 p-3 text-sm">{r.message}</p>}
                            <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium">
                                {r.amount != null && <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-800">Aporte: S/ {Number(r.amount).toFixed(2)}</span>}
                                {r.monthly && <span className="rounded-full bg-orange-100 px-3 py-1 text-orange-800">Apoyo mensual</span>}
                                {r.join_group && <span className="rounded-full bg-sky-100 px-3 py-1 text-sky-800">Quiere unirse al grupo</span>}
                                {r.allow_mention && <span className="rounded-full bg-violet-100 px-3 py-1 text-violet-800">Permite mencionar su apoyo</span>}
                                {links.get(r.id) && <a href={links.get(r.id)} target="_blank" rel="noopener noreferrer" className="rounded-full bg-secondary px-3 py-1 text-primary hover:underline">Ver comprobante</a>}
                            </div>
                            <div className="mt-4 flex flex-wrap gap-2">
                                {r.status !== "read" && r.status !== "done" && <form action={setMessageStatus}><input type="hidden" name="id" value={r.id} /><input type="hidden" name="status" value="read" /><Button size="sm" variant="outline" type="submit">Marcar leído</Button></form>}
                                {r.status !== "done" && <form action={setMessageStatus}><input type="hidden" name="id" value={r.id} /><input type="hidden" name="status" value="done" /><Button size="sm" type="submit">Marcar atendido</Button></form>}
                                {r.status === "done" && <form action={setMessageStatus}><input type="hidden" name="id" value={r.id} /><input type="hidden" name="status" value="new" /><Button size="sm" variant="ghost" type="submit">Reabrir</Button></form>}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
