"use client"

import { useState } from "react"
import type { SupabaseClient } from "@supabase/supabase-js"
import { Check, Copy, HandHeart, Paperclip, Rocket, ShieldCheck, Star } from "lucide-react"
import { SUGGESTED_AMOUNTS } from "@/lib/featured"
import { SUPPORT_METHODS } from "@/lib/site-config"
import { cn } from "@/lib/utils"

export type BoostMethod = "yape" | "plin" | "transferencia"
export type BoostValue = { amount: string; method: BoostMethod; file: File | null }
export const EMPTY_BOOST: BoostValue = { amount: "", method: "yape", file: null }

const FILE_OK = ["image/jpeg", "image/png", "image/webp", "application/pdf"]
export const boostAmount = (v: BoostValue) => { const n = Number(v.amount.replace(",", ".")); return Number.isFinite(n) && n > 0 && n < 100000 ? Math.round(n * 100) / 100 : 0 }
export const boostFileError = (f: File | null) => !f ? null : !FILE_OK.includes(f.type) ? "El comprobante debe ser imagen (JPG, PNG, WebP) o PDF." : f.size > 5 * 1024 * 1024 ? "El comprobante pesa más de 5 MB." : null

// Registra el aporte voluntario de un reporte: sube el comprobante (si hay) a la carpeta de la persona y crea el impulso
// como "pendiente". Un administrador lo verifica y confirma el monto; solo entonces el caso sale como destacado.
export async function submitBoost(supabase: SupabaseClient, { petId, userId, value }: { petId: string; userId: string; value: BoostValue }) {
    const amount = boostAmount(value)
    if (!amount) return { ok: true as const, skipped: true }
    let proof: string | null = null
    if (value.file) {
        const err = boostFileError(value.file)
        if (err) return { ok: false as const, error: err }
        const ext = value.file.type === "application/pdf" ? "pdf" : value.file.type.split("/")[1]
        proof = `${userId}/${crypto.randomUUID()}.${ext}`
        const { error } = await supabase.storage.from("boost-proofs").upload(proof, value.file, { contentType: value.file.type, upsert: false })
        if (error) return { ok: false as const, error: "No se pudo subir el comprobante." }
    }
    const { data: created, error } = await supabase.from("pet_boosts").insert({ pet_id: petId, user_id: userId, amount_claimed: amount, method: value.method, proof_path: proof }).select("id").single()
    if (error) return { ok: false as const, error: "No se pudo registrar tu aporte." }
    // Aviso al equipo: no bloquea ni rompe el registro si falla.
    if (created?.id) void fetch("/api/notify-boost", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ boostId: created.id }) }).catch(() => {})
    return { ok: true as const, skipped: false }
}

// Campos del aporte voluntario (se usan al reportar y desde el reporte ya publicado).
export function BoostFields({ value, onChange }: { value: BoostValue; onChange: (v: BoostValue) => void }) {
    const [copied, setCopied] = useState<string | null>(null)
    const amount = boostAmount(value)
    const set = (patch: Partial<BoostValue>) => onChange({ ...value, ...patch })
    const fileError = boostFileError(value.file)

    return (
        <div className="space-y-5">
            <div className="flex items-start gap-3 rounded-2xl border border-primary/20 bg-accent p-4">
                <Rocket className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
                <div className="space-y-1 text-sm">
                    <p className="font-semibold text-accent-foreground">Opcional: destaca tu caso con un aporte voluntario</p>
                    <p className="text-muted-foreground">Tu reporte se publica igual, con o sin aporte. Los casos apoyados salen en <strong className="text-foreground">Mascotas destacadas</strong> de la portada y como aviso en otras páginas: <strong className="text-foreground">a mayor aporte, más adelante aparecen</strong>.</p>
                </div>
            </div>

            <div className="space-y-2">
                <p className="text-sm font-semibold">¿Cuánto quieres aportar?</p>
                <div className="flex flex-wrap items-center gap-2">
                    <button type="button" aria-pressed={!amount} onClick={() => set({ amount: "" })} className={cn("min-h-10 rounded-full border px-4 text-sm font-medium transition-all active:scale-95", !amount ? "border-primary bg-primary text-primary-foreground" : "border-input bg-background hover:-translate-y-0.5 hover:bg-accent")}>No por ahora</button>
                    {SUGGESTED_AMOUNTS.map((a) => (
                        <button key={a} type="button" aria-pressed={amount === a} onClick={() => set({ amount: String(a) })} className={cn("inline-flex min-h-10 items-center gap-1.5 rounded-full border px-4 text-sm font-semibold transition-all active:scale-95", amount === a ? "border-cta bg-cta text-cta-foreground shadow-sm" : "border-input bg-background hover:-translate-y-0.5 hover:bg-accent")}>
                            <HandHeart className="h-4 w-4" aria-hidden /> S/ {a}
                        </button>
                    ))}
                    <label className="flex items-center gap-1 rounded-full border border-input bg-background pl-4 pr-2 transition-shadow focus-within:ring-2 focus-within:ring-ring">
                        <span className="text-sm text-muted-foreground">S/</span>
                        <input type="number" inputMode="decimal" min={1} max={99999} step="0.5" value={SUGGESTED_AMOUNTS.includes(amount as never) ? "" : value.amount} onChange={(e) => set({ amount: e.target.value })} aria-label="Otro monto en soles" placeholder="Otro" className="h-10 w-20 bg-transparent px-1 text-sm outline-none" />
                    </label>
                </div>
            </div>

            {amount > 0 && (
                <div className="space-y-4 rounded-2xl border border-dashed p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <p className="flex items-center gap-2 text-sm font-semibold"><Star className="h-4 w-4 fill-cta text-cta" aria-hidden /> Aporte de S/ {amount.toFixed(2)}</p>
                    {SUPPORT_METHODS.length > 0 ? (
                        <>
                            <p className="text-sm text-muted-foreground">1. Envía el monto por Yape o Plin. 2. Adjunta la captura (opcional). 3. Publica tu reporte: lo verificamos y tu caso sube.</p>
                            <ul className="grid gap-2 sm:grid-cols-2">
                                {SUPPORT_METHODS.map((m) => (
                                    <li key={m.id}>
                                        <div className={cn("flex items-center justify-between gap-2 rounded-xl border p-3", value.method === m.id && "border-primary bg-accent/60")}>
                                            <button type="button" onClick={() => set({ method: m.id as BoostMethod })} aria-pressed={value.method === m.id} className="flex min-w-0 flex-1 items-center gap-2 text-left">
                                                <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold", m.color)}>{m.name}</span>
                                                <span className="min-w-0"><span className="block truncate font-semibold">{m.number}</span>{m.holder && <span className="block truncate text-xs text-muted-foreground">{m.holder}</span>}</span>
                                            </button>
                                            <button type="button" onClick={async () => { try { await navigator.clipboard.writeText(m.number!); setCopied(m.id); setTimeout(() => setCopied(null), 1600) } catch { /* sin portapapeles */ } }} aria-label={`Copiar número de ${m.name}`} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border bg-card transition-all hover:bg-accent active:scale-90">
                                                {copied === m.id ? <Check className="h-4 w-4 text-primary" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </>
                    ) : (
                        <p className="text-sm text-muted-foreground">Estamos activando los medios de pago (Yape y Plin). Tu intención de aporte queda registrada y te escribiremos para coordinarlo.</p>
                    )}

                    <label className="group flex cursor-pointer items-center gap-3 rounded-xl border border-input bg-background px-4 py-3 text-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-accent/50">
                        <Paperclip className="h-5 w-5 shrink-0 text-primary transition-transform group-hover:-rotate-12" aria-hidden />
                        <span className="min-w-0 flex-1 truncate">{value.file?.name ?? "Adjuntar comprobante (captura o PDF, máx. 5 MB)"}</span>
                        <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" className="sr-only" onChange={(e) => set({ file: e.target.files?.[0] ?? null })} />
                    </label>
                    {fileError && <p role="alert" className="text-sm font-medium text-destructive">{fileError}</p>}
                    <p className="flex items-start gap-2 text-xs text-muted-foreground"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden /> Un administrador verifica el aporte antes de destacar tu caso. El comprobante solo lo ve el equipo.</p>
                </div>
            )}
        </div>
    )
}
