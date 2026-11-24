import Link from "next/link"
import type { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { createPublicClient } from "@/utils/supabase/public"

export const revalidate = 600

export const metadata: Metadata = {
    title: "Transparencia: cifras y uso de los aportes | Busco mi mascota",
    description: "Cifras reales de la red y en qué se usan los aportes voluntarios. Solo mostramos lo que existe.",
    alternates: { canonical: "/transparencia" },
}

type Impact = { reports: number; reunited: number; supporters: number; support_total: number }

export default async function TransparencyPage() {
    let impact: Impact | null = null
    try { impact = ((await createPublicClient().rpc("public_impact")).data ?? null) as Impact | null } catch { impact = null }
    // Regla de honestidad: una cifra en cero no se muestra (no aporta y puede desanimar).
    const stats = impact ? [
        { v: impact.reports, label: "casos publicados por la comunidad" },
        { v: impact.reunited, label: "mascotas reencontradas" },
        { v: impact.supporters, label: "personas que apoyaron" },
        { v: Number(impact.support_total), label: "soles aportados y confirmados", money: true },
    ].filter((s) => s.v > 0) : []

    return (
        <div className="container mx-auto max-w-3xl space-y-10 px-4 py-8 md:py-12">
            <header className="space-y-3 text-center md:text-left">
                <h1 className="font-display text-3xl text-primary md:text-5xl">Transparencia</h1>
                <p className="text-muted-foreground">Publicar, buscar y crear carteles es gratis. Esto es lo que sabemos hoy y cómo se usan los aportes voluntarios.</p>
            </header>

            {stats.length > 0 && (
                <section aria-labelledby="t-cifras" className="space-y-4">
                    <h2 id="t-cifras" className="font-display text-2xl text-primary">Cifras actuales</h2>
                    <ul className="grid gap-4 sm:grid-cols-2">
                        {stats.map((s) => (
                            <li key={s.label} className="rounded-3xl border bg-card p-6 text-center shadow-[var(--shadow-soft)]">
                                <p className="font-display text-4xl text-primary">{s.money ? `S/ ${s.v.toLocaleString("es-PE")}` : s.v.toLocaleString("es-PE")}</p>
                                <p className="text-sm text-muted-foreground">{s.label}</p>
                            </li>
                        ))}
                    </ul>
                    <p className="text-xs text-muted-foreground">Las cifras se calculan en vivo desde la base de datos. Los casos tomados de fuentes externas no se cuentan.</p>
                </section>
            )}

            <section aria-labelledby="t-uso" className="space-y-3">
                <h2 id="t-uso" className="font-display text-2xl text-primary">En qué se usan los aportes</h2>
                <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                    <li>Servidor y base de datos.</li>
                    <li>Envío de correos y avisos a vecinos.</li>
                    <li>Difusión de casos que lo necesitan.</li>
                </ul>
                <p className="text-sm text-muted-foreground">Los aportes son voluntarios, por Yape o Plin. Un administrador verifica cada comprobante antes de confirmarlo. No hay cobros en línea ni planes obligatorios.</p>
            </section>

            <Button asChild variant="cta" className="rounded-full"><Link href="/contacto?tipo=apoyo">Quiero apoyar</Link></Button>
        </div>
    )
}
