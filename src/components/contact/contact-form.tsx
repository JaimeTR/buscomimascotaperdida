"use client"

import { useRef, useState } from "react"
import { CheckCircle2, Loader2, Paperclip, Send, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { CONTACT_KINDS, type ContactKind } from "@/lib/contact-kinds"

const PLACEHOLDER: Record<ContactKind, string> = {
    consulta: "Cuéntanos en qué podemos ayudarte.",
    aliado: "Cuéntanos de tu negocio, refugio o veterinaria y cómo te gustaría sumarte.",
    voluntario: "¿Qué zona te queda cerca y cuánto tiempo puedes dedicar? Ej. repartir carteles los fines de semana.",
    colaborar: "¿Cómo te gustaría colaborar? Ej. difusión, diseño, programación, traducción, donaciones en especie.",
    apoyo: "Si quieres, cuéntanos cómo apoyaste (Yape, Plin, transferencia, donación en especie…). ¡Gracias!",
    grupo: "Si quieres, cuéntanos un poco sobre ti y en qué te gustaría ayudar.",
}

const field = "w-full rounded-xl border border-input bg-background px-4 text-sm outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-ring"
const Check = ({ name, children }: { name: string; children: React.ReactNode }) => (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border bg-background p-3 text-sm transition-colors hover:bg-accent/50">
        <input type="checkbox" name={name} className="mt-0.5 h-4 w-4 shrink-0 accent-[hsl(var(--primary))]" />
        <span>{children}</span>
    </label>
)

export function ContactForm({ initialKind = "consulta", groupUrl }: { initialKind?: ContactKind; groupUrl?: string }) {
    const [kind, setKind] = useState<ContactKind>(initialKind)
    const [sending, setSending] = useState(false)
    const [error, setError] = useState("")
    const [done, setDone] = useState(false)
    const [fileName, setFileName] = useState("")
    const formRef = useRef<HTMLFormElement>(null)

    const submit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setSending(true)
        setError("")
        try {
            const res = await fetch("/api/contact", { method: "POST", body: new FormData(e.currentTarget) })
            const data = await res.json().catch(() => ({}))
            if (!res.ok) throw new Error(data.error || "No pudimos enviar tu mensaje.")
            setDone(true)
        } catch (err) {
            setError(err instanceof Error ? err.message : "No pudimos enviar tu mensaje.")
        } finally {
            setSending(false)
        }
    }

    if (done) {
        return (
            <div role="status" className="space-y-4 rounded-3xl border bg-accent p-8 text-center animate-in fade-in zoom-in-95 duration-300">
                <CheckCircle2 className="mx-auto h-12 w-12 text-primary" aria-hidden />
                <h3 className="font-display text-2xl text-primary">¡Gracias! Recibimos tu mensaje</h3>
                <p className="text-muted-foreground">Te escribiremos al correo que indicaste.</p>
                {groupUrl && (
                    <Button asChild variant="cta" size="lg" className="rounded-full">
                        <a href={groupUrl} target="_blank" rel="noopener noreferrer"><Users className="mr-2 h-5 w-5" aria-hidden /> Entrar al grupo de colaboradores</a>
                    </Button>
                )}
                <div><Button variant="ghost" onClick={() => { setDone(false); setFileName(""); formRef.current?.reset() }}>Enviar otro mensaje</Button></div>
            </div>
        )
    }

    return (
        <form ref={formRef} onSubmit={submit} className="space-y-5 rounded-3xl border bg-card p-5 shadow-[var(--shadow-soft)] sm:p-8" noValidate={false}>
            <input type="hidden" name="kind" value={kind} />
            {/* Campo trampa anti-spam: invisible para las personas */}
            <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden"><label>Sitio web<input name="website" tabIndex={-1} autoComplete="off" /></label></div>

            <fieldset>
                <legend className="mb-2 text-sm font-semibold">¿Qué quieres hacer?</legend>
                <div className="flex flex-wrap gap-2">
                    {CONTACT_KINDS.map((k) => (
                        <button
                            key={k.value}
                            type="button"
                            aria-pressed={kind === k.value}
                            onClick={() => setKind(k.value)}
                            className={cn("min-h-10 rounded-full border px-4 text-sm font-medium transition-all active:scale-95", kind === k.value ? "border-primary bg-primary text-primary-foreground shadow-sm" : "border-input bg-background hover:-translate-y-0.5 hover:bg-accent")}
                        >
                            {k.label}
                        </button>
                    ))}
                </div>
            </fieldset>

            <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-1.5 text-sm font-medium">Tu nombre
                    <input name="name" required minLength={2} maxLength={120} autoComplete="name" className={cn(field, "h-12")} placeholder="Nombre y apellido" />
                </label>
                <label className="block space-y-1.5 text-sm font-medium">Correo
                    <input name="email" type="email" required maxLength={160} autoComplete="email" className={cn(field, "h-12")} placeholder="tucorreo@ejemplo.com" />
                </label>
                <label className="block space-y-1.5 text-sm font-medium sm:col-span-2">Teléfono o WhatsApp <span className="font-normal text-muted-foreground">(opcional)</span>
                    <input name="phone" type="tel" inputMode="tel" maxLength={30} autoComplete="tel" className={cn(field, "h-12")} placeholder="987 654 321" />
                </label>
            </div>

            {kind === "apoyo" && (
                <div className="space-y-4 rounded-2xl border border-dashed bg-accent/40 p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <p className="text-sm text-muted-foreground">Todo esto es opcional. Nos ayuda a agradecerte y a llevar la cuenta del proyecto.</p>
                    <label className="block space-y-1.5 text-sm font-medium">Monto aportado (S/)
                        <input name="amount" type="number" min={0} max={999999} step="0.01" inputMode="decimal" className={cn(field, "h-12 sm:max-w-[12rem]")} placeholder="Ej. 20" />
                    </label>
                    <div className="space-y-1.5 text-sm font-medium">Comprobante
                        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-input bg-background px-4 py-3 font-normal transition-colors hover:bg-accent/50">
                            <Paperclip className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                            <span className="min-w-0 flex-1 truncate">{fileName || "Adjuntar captura o PDF (máx. 5 MB)"}</span>
                            <input name="attachment" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" className="sr-only" onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")} />
                        </label>
                    </div>
                </div>
            )}

            {kind !== "grupo" && (
                <label className="block space-y-1.5 text-sm font-medium">Mensaje {kind === "apoyo" && <span className="font-normal text-muted-foreground">(opcional)</span>}
                    <textarea name="message" required={kind !== "apoyo"} maxLength={2000} rows={5} className={cn(field, "py-3")} placeholder={PLACEHOLDER[kind]} />
                </label>
            )}
            {kind === "grupo" && <p className="rounded-xl bg-accent/50 p-3 text-sm text-muted-foreground">{PLACEHOLDER.grupo} Escríbelo abajo si quieres.<textarea name="message" maxLength={2000} rows={3} className={cn(field, "mt-3 py-3")} placeholder="Opcional" /></p>}

            <div className="space-y-2">
                {kind !== "grupo" && kind !== "consulta" && <Check name="join_group">Quiero unirme al grupo de colaboradores del proyecto.</Check>}
                {(kind === "apoyo" || kind === "colaborar") && <Check name="allow_mention">Pueden mencionar mi apoyo públicamente como colaborador.</Check>}
            </div>

            {error && <p role="alert" className="rounded-xl bg-destructive/10 p-3 text-sm font-medium text-destructive animate-in fade-in">{error}</p>}

            <Button type="submit" variant="cta" size="lg" disabled={sending} className="w-full rounded-full sm:w-auto">
                {sending ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden /> Enviando…</> : <><Send className="mr-2 h-5 w-5" aria-hidden /> Enviar mensaje</>}
            </Button>
            <p className="text-xs text-muted-foreground">Usamos tus datos solo para responderte. Consulta la <a className="underline underline-offset-2" href="/privacidad">política de privacidad</a>.</p>
        </form>
    )
}
