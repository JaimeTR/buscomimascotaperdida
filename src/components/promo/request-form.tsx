"use client"

import { useActionState } from "react"
import Link from "next/link"
import { CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { submitPromoRequest, type PromoState } from "@/app/anuncios/actions"
import { PLANS } from "@/lib/ads"

const field = "h-12 w-full rounded-xl border border-input bg-card px-4 text-sm outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-ring"

// Formulario único para anuncios, alianzas y voluntariado. `kinds` limita las opciones del selector.
export function PromoRequestForm({ loggedIn, kinds, defaultKind, defaultPlan }: {
    loggedIn: boolean
    kinds: { value: "anuncio" | "aliado" | "voluntario"; label: string }[]
    defaultKind: "anuncio" | "aliado" | "voluntario"
    defaultPlan?: string
}) {
    const [state, action, pending] = useActionState<PromoState, FormData>(submitPromoRequest, { ok: false })

    if (state.ok) {
        return (
            <div role="status" className="rounded-3xl border bg-accent p-8 text-center">
                <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-primary" aria-hidden />
                <h3 className="text-xl font-semibold">¡Solicitud enviada!</h3>
                <p className="mt-1 text-muted-foreground">Revisaremos tus datos y te escribiremos al correo que indicaste.</p>
            </div>
        )
    }

    if (!loggedIn) {
        return (
            <div className="rounded-3xl border bg-card p-8 text-center shadow-[var(--shadow-soft)]">
                <h3 className="text-xl font-semibold">Inicia sesión para enviar tu solicitud</h3>
                <p className="mx-auto mt-1 max-w-md text-muted-foreground">Así evitamos el spam y puedes ver el estado de tus solicitudes. Es gratis.</p>
                <div className="mt-5 flex justify-center gap-3">
                    <Button asChild variant="cta"><Link href="/ingresar?next=/anuncios">Iniciar sesión</Link></Button>
                    <Button asChild variant="outline"><Link href="/registro">Crear cuenta</Link></Button>
                </div>
            </div>
        )
    }

    return (
        <form action={action} className="space-y-5 rounded-3xl border bg-card p-6 shadow-[var(--shadow-soft)] md:p-8">
            <div className="grid gap-5 sm:grid-cols-2">
                <label className="block space-y-1.5 text-sm font-medium">¿Qué quieres hacer?
                    <select name="kind" defaultValue={defaultKind} className={field}>
                        {kinds.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}
                    </select>
                </label>
                <label className="block space-y-1.5 text-sm font-medium">Plan (solo anuncios)
                    <select name="plan" defaultValue={defaultPlan ?? "destacado"} className={field}>
                        {PLANS.map((p) => <option key={p.key} value={p.key}>{p.name} · {p.price}</option>)}
                    </select>
                </label>
                <label className="block space-y-1.5 text-sm font-medium">Negocio o nombre
                    <input name="business_name" required minLength={2} maxLength={120} className={field} placeholder="Ej. Veterinaria Patitas" />
                </label>
                <label className="block space-y-1.5 text-sm font-medium">Persona de contacto
                    <input name="contact_name" required minLength={2} maxLength={120} className={field} autoComplete="name" />
                </label>
                <label className="block space-y-1.5 text-sm font-medium">Correo
                    <input name="email" type="email" required maxLength={160} className={field} autoComplete="email" />
                </label>
                <label className="block space-y-1.5 text-sm font-medium">Teléfono o WhatsApp (opcional)
                    <input name="phone" maxLength={30} className={field} autoComplete="tel" />
                </label>
            </div>
            <label className="block space-y-1.5 text-sm font-medium">Web o red social (opcional, con https://)
                <input name="link_url" type="url" maxLength={300} className={field} placeholder="https://" />
            </label>
            <label className="block space-y-1.5 text-sm font-medium">Cuéntanos qué quieres promocionar o cómo quieres colaborar
                <textarea name="message" maxLength={1000} rows={4} className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </label>

            {state.error && <p role="alert" className="rounded-xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">{state.error}</p>}
            <Button type="submit" variant="cta" size="lg" disabled={pending} className="w-full rounded-full sm:w-auto">
                {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />} Enviar solicitud
            </Button>
            <p className="text-xs text-muted-foreground">No cobramos en línea: el equipo revisa tu solicitud y coordina contigo los detalles y el pago.</p>
        </form>
    )
}
