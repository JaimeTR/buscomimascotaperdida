"use client"

import { useState } from "react"
import Link from "next/link"
import { Check, Copy, Mail, MapPin, MessageCircle, Phone, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast-modern"
import { whatsappLink } from "@/lib/whatsapp"

type Props = {
    petId: string
    petName: string
    ownerName?: string
    found: boolean // true: la persona que publicó encontró a la mascota (no es su dueña)
    phone?: string
    whatsapp?: string
    email?: string
}

type RowProps = { href: string; icon: typeof Phone; label: string; value: string; tone: string; copyText: string; external?: boolean; copied: string | null; onCopy: (text: string, label: string) => void }

function Row({ href, icon: Icon, label, value, tone, copyText, external, copied, onCopy }: RowProps) {
    return (
        <div className="flex items-stretch gap-2">
            <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})} className={`group flex min-w-0 flex-1 items-center gap-3 rounded-2xl border p-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99] ${tone}`}>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/70"><Icon className="h-5 w-5 transition-transform duration-200 group-hover:scale-110 group-hover:-rotate-6" aria-hidden /></span>
                <span className="min-w-0"><span className="block text-sm font-semibold">{label}</span><span className="block truncate text-xs opacity-80">{value}</span></span>
            </a>
            <button type="button" onClick={() => onCopy(copyText, label)} aria-label={`Copiar ${label}`} className="flex w-11 shrink-0 items-center justify-center rounded-2xl border bg-card text-muted-foreground transition-all hover:-translate-y-0.5 hover:bg-accent hover:text-primary active:scale-95">
                {copied === label ? <Check className="h-4 w-4 text-primary" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
            </button>
        </div>
    )
}

// Datos de contacto que la persona que reportó decidió mostrar (el servidor ya filtró el resto).
// Si no mostró ninguno, la vía es reportar un avistamiento: llega a su panel como "pista".
export function ContactCard({ petId, petName, ownerName, found, phone, whatsapp, email }: Props) {
    const { toast } = useToast()
    const [copied, setCopied] = useState<string | null>(null)
    const waUrl = whatsappLink(whatsapp, `Hola, te escribo por el reporte de ${petName} en Busco mi mascota.`)
    const hasAny = Boolean(waUrl || phone || email)
    const who = found ? "quien la encontró" : "su dueño"

    const copy = async (text: string, label: string) => {
        try { await navigator.clipboard.writeText(text); setCopied(label); toast(`${label} copiado`, { type: "success" }); setTimeout(() => setCopied(null), 1800) }
        catch { toast("No se pudo copiar", { type: "error" }) }
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
                <h3 className="font-semibold">Contactar a {ownerName || who}</h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-[11px] font-semibold text-accent-foreground"><ShieldCheck className="h-3.5 w-3.5" aria-hidden /> Datos que eligió mostrar</span>
            </div>

            {hasAny ? (
                <div className="space-y-2">
                    {waUrl && <Row href={waUrl} external icon={MessageCircle} label="WhatsApp" value={whatsapp!} tone="border-emerald-200 bg-emerald-50 text-emerald-900" copyText={whatsapp!} copied={copied} onCopy={copy} />}
                    {phone && <Row href={`tel:${phone.replace(/[^\d+]/g, "")}`} icon={Phone} label="Llamar" value={phone} tone="border-teal-200 bg-accent text-accent-foreground" copyText={phone} copied={copied} onCopy={copy} />}
                    {email && <Row href={`mailto:${email}?subject=${encodeURIComponent(`Sobre ${petName}`)}`} icon={Mail} label="Correo" value={email} tone="border-violet-200 bg-violet-50 text-violet-900" copyText={email} copied={copied} onCopy={copy} />}
                </div>
            ) : (
                <div className="space-y-3 rounded-2xl border border-dashed bg-background p-4 text-sm">
                    <p className="text-muted-foreground">{found ? "Quien publicó este reporte" : "El dueño"} no muestra datos de contacto directos. Igual puedes ayudar: reporta un avistamiento y le llegará como pista a su panel.</p>
                    <Button asChild variant="outline" className="w-full rounded-full"><Link href={`/mascotas/${petId}/avistamiento`}><MapPin className="mr-2 h-4 w-4" aria-hidden /> Reportar avistamiento</Link></Button>
                </div>
            )}
        </div>
    )
}
