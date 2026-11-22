"use client"

import { useActionState } from "react"
import Link from "next/link"
import { Building2, CheckCircle2, Gem, Link2, ListChecks, Loader2, Mail, MessageSquareText, Phone, Send, User, UserCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { IconField, iconFieldClass } from "@/components/ui/icon-field"
import { submitPromoRequest, type PromoState } from "@/app/anuncios/actions"
import { PLANS } from "@/lib/ads"
import { cn } from "@/lib/utils"

const sel = cn(iconFieldClass, "h-12")

// Formulario único para anuncios, alianzas y voluntariado (vive dentro de un modal). `kinds` limita las opciones del selector.
export function PromoRequestForm({ loggedIn, kinds, defaultKind, defaultPlan, nextPath, onDone }: {
    loggedIn: boolean
    kinds: { value: "anuncio" | "aliado" | "voluntario"; label: string }[]
    defaultKind: "anuncio" | "aliado" | "voluntario"
    defaultPlan?: string
    nextPath: string
    onDone?: () => void
}) {
    const [state, action, pending] = useActionState<PromoState, FormData>(submitPromoRequest, { ok: false })

    if (state.ok) {
        return (
            <div role="status" className="space-y-3 py-8 text-center animate-in fade-in zoom-in-95 duration-300">
                <CheckCircle2 className="mx-auto h-14 w-14 text-primary" aria-hidden />
                <h3 className="font-display text-2xl text-primary">¡Solicitud enviada!</h3>
                <p className="text-muted-foreground">Revisaremos tus datos y te escribiremos al correo que indicaste.</p>
                <Button variant="ghost" onClick={onDone}>Cerrar</Button>
            </div>
        )
    }

    if (!loggedIn) {
        return (
            <div className="space-y-4 py-6 text-center">
                <UserCheck className="mx-auto h-12 w-12 text-primary" aria-hidden />
                <h3 className="font-display text-2xl text-primary">Inicia sesión para enviar tu solicitud</h3>
                <p className="mx-auto max-w-md text-muted-foreground">Así evitamos el spam y puedes ver el estado de tus solicitudes. Es gratis.</p>
                <div className="flex flex-wrap justify-center gap-3">
                    <Button asChild variant="cta" size="lg" className="rounded-full"><Link href={`/ingresar?next=${encodeURIComponent(nextPath)}`}>Iniciar sesión</Link></Button>
                    <Button asChild variant="outline" size="lg" className="rounded-full"><Link href="/registro">Crear cuenta</Link></Button>
                </div>
            </div>
        )
    }

    const onlyAds = kinds.length === 1 && kinds[0].value === "anuncio"
    return (
        <form action={action} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-1.5 text-sm font-medium">¿Qué quieres hacer?
                    <IconField icon={ListChecks}>
                        <select name="kind" defaultValue={defaultKind} className={sel}>
                            {kinds.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}
                        </select>
                    </IconField>
                </label>
                {onlyAds && (
                    <label className="block space-y-1.5 text-sm font-medium">Plan
                        <IconField icon={Gem}>
                            <select name="plan" defaultValue={defaultPlan ?? "destacado"} className={sel}>
                                {PLANS.map((p) => <option key={p.key} value={p.key}>{p.name} · {p.price}</option>)}
                            </select>
                        </IconField>
                    </label>
                )}
                <label className="block space-y-1.5 text-sm font-medium">Negocio o nombre
                    <IconField icon={Building2}><input name="business_name" required minLength={2} maxLength={120} className={sel} placeholder="Ej. Veterinaria Patitas" /></IconField>
                </label>
                <label className="block space-y-1.5 text-sm font-medium">Persona de contacto
                    <IconField icon={User}><input name="contact_name" required minLength={2} maxLength={120} className={sel} autoComplete="name" /></IconField>
                </label>
                <label className="block space-y-1.5 text-sm font-medium">Correo
                    <IconField icon={Mail}><input name="email" type="email" required maxLength={160} className={sel} autoComplete="email" /></IconField>
                </label>
                <label className="block space-y-1.5 text-sm font-medium">Teléfono o WhatsApp <span className="font-normal text-muted-foreground">(opcional)</span>
                    <IconField icon={Phone}><input name="phone" maxLength={30} className={sel} autoComplete="tel" /></IconField>
                </label>
            </div>
            <label className="block space-y-1.5 text-sm font-medium">Web o red social <span className="font-normal text-muted-foreground">(opcional, con https://)</span>
                <IconField icon={Link2}><input name="link_url" type="url" maxLength={300} className={sel} placeholder="https://" /></IconField>
            </label>
            <label className="block space-y-1.5 text-sm font-medium">{onlyAds ? "Cuéntanos qué quieres promocionar" : "Cuéntanos cómo quieres colaborar"}
                <IconField icon={MessageSquareText} multiline><textarea name="message" maxLength={1000} rows={4} className={cn(iconFieldClass, "py-3")} /></IconField>
            </label>

            {state.error && <p role="alert" className="rounded-xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive animate-in fade-in">{state.error}</p>}
            <Button type="submit" variant="cta" size="lg" disabled={pending} className="w-full rounded-full sm:w-auto">
                {pending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden /> : <Send className="mr-2 h-5 w-5" aria-hidden />} Enviar solicitud
            </Button>
            <p className="text-xs text-muted-foreground">No cobramos en línea: el equipo revisa tu solicitud y coordina contigo los detalles y el pago.</p>
        </form>
    )
}
