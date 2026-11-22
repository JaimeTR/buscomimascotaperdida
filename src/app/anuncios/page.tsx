import Image from "next/image"
import { Check, Megaphone, Eye, MousePointerClick, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Reveal } from "@/components/ui/reveal"
import { PromoRequestForm } from "@/components/promo/request-form"
import { PLANS } from "@/lib/ads"
import { STOCK } from "@/lib/stock-images"
import { createClient } from "@/utils/supabase/server"
import { cn } from "@/lib/utils"

export const metadata = { title: "Anuncia tu negocio | Busco mi mascota", description: "Muestra tu marca como destacado en la portada y en los casos de la comunidad que ama a sus mascotas. Planes, cómo funciona y solicitud.", alternates: { canonical: "/anuncios" } }

const STEPS = [
    { t: "Elige un plan", d: "Básico, Destacado o Premium, según dónde quieras aparecer." },
    { t: "Envía la solicitud", d: "Cuéntanos de tu negocio. La revisamos en pocos días." },
    { t: "Coordinamos y publicamos", d: "Te escribimos para el pago y tu anuncio sale como destacado en las páginas de tu plan." },
]

const BENEFITS = [
    { icon: Eye, t: "Visibilidad real", d: "Tu anuncio aparece como destacado en la portada y, según el plan, en el detalle de cada caso y entre los resultados." },
    { icon: MousePointerClick, t: "Clics medidos", d: "Cada anuncio cuenta sus clics para que sepas cuánta gente llega a tu web o redes." },
    { icon: ShieldCheck, t: "Con transparencia", d: "Siempre marcado como anuncio y revisado antes de publicarse; nunca se mezcla con los reportes." },
]

export default async function AnunciosPage() {
    const { data: { user } } = await (await createClient()).auth.getUser()

    return (
        <div>
            <section className="container mx-auto px-4 pt-6 md:pt-10">
                <div className="grid overflow-hidden rounded-[2rem] bg-primary text-primary-foreground md:grid-cols-[1.1fr_1fr]">
                    <div className="flex flex-col justify-center gap-5 p-8 md:p-14">
                        <p className="inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium"><Megaphone className="h-4 w-4" aria-hidden /> Promociones</p>
                        <h1 className="font-display text-4xl leading-[1.05] md:text-5xl">Tu marca, junto a quienes <span className="text-orange-300">aman a sus mascotas</span></h1>
                        <p className="text-lg text-primary-foreground/90">Aparece como destacado en la portada y junto a los casos de tu zona. Y ayudas a sostener la red.</p>
                        <div className="flex flex-wrap gap-3">
                            <Button asChild variant="cta" size="lg" className="rounded-full"><a href="#planes">Ver planes</a></Button>
                            <Button asChild size="lg" variant="outline" className="rounded-full border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"><a href="#solicitud">Enviar solicitud</a></Button>
                        </div>
                    </div>
                    <div className="relative min-h-64 md:min-h-[26rem]">
                        <Image src={STOCK.paseo.src} alt={STOCK.paseo.alt} fill priority sizes="(min-width: 768px) 45vw, 100vw" className="object-cover" />
                    </div>
                </div>
            </section>

            <section aria-label="Beneficios" className="container mx-auto grid gap-4 px-4 py-12 md:grid-cols-3">
                {BENEFITS.map((b, i) => (
                    <Reveal key={b.t} delay={i * 0.06}>
                        <div className="h-full rounded-3xl border bg-card p-6 shadow-[var(--shadow-soft)]">
                            <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground"><b.icon className="h-6 w-6" aria-hidden /></span>
                            <h2 className="text-lg font-semibold">{b.t}</h2>
                            <p className="mt-1 text-sm text-muted-foreground">{b.d}</p>
                        </div>
                    </Reveal>
                ))}
            </section>

            <section id="planes" className="container mx-auto scroll-mt-20 px-4 py-6">
                <h2 className="mb-2 text-center font-display text-3xl text-primary md:text-4xl">Planes</h2>
                <p className="mb-8 text-center text-sm text-muted-foreground">Precios referenciales por 30 días; el equipo confirma el monto al coordinar contigo.</p>
                <ul className="grid gap-5 lg:grid-cols-3">
                    {PLANS.map((p, i) => (
                        <Reveal as="li" key={p.key} delay={i * 0.07}>
                            <div className={cn("relative flex h-full flex-col rounded-3xl border p-7 shadow-[var(--shadow-soft)] transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]", p.tone, "highlight" in p && p.highlight && "ring-2 ring-primary")}>
                                {"highlight" in p && p.highlight && <span className="absolute -top-3 left-6 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">Más elegido</span>}
                                <h3 className="font-display text-2xl text-primary">{p.name}</h3>
                                <p className="mt-2"><span className="text-4xl font-bold">{p.price}</span> <span className="text-sm text-muted-foreground">/ {p.period}</span></p>
                                <ul className="mt-5 flex-1 space-y-3 text-sm">
                                    {p.perks.map((perk) => <li key={perk} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden /> {perk}</li>)}
                                </ul>
                                <Button asChild variant={"highlight" in p && p.highlight ? "cta" : "default"} className="mt-6 w-full rounded-full"><a href="#solicitud">Elegir {p.name}</a></Button>
                            </div>
                        </Reveal>
                    ))}
                </ul>
            </section>

            <section aria-labelledby="h-pasos" className="container mx-auto px-4 py-14">
                <h2 id="h-pasos" className="mb-8 text-center font-display text-3xl text-primary md:text-4xl">Cómo funciona</h2>
                <ol className="grid gap-4 md:grid-cols-3">
                    {STEPS.map((s, i) => (
                        <Reveal as="li" key={s.t} delay={i * 0.06}>
                            <div className="h-full rounded-3xl border bg-card p-6 shadow-[var(--shadow-soft)]">
                                <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-primary font-display text-lg text-primary-foreground">{i + 1}</span>
                                <h3 className="mb-1 text-lg font-semibold">{s.t}</h3>
                                <p className="text-sm text-muted-foreground">{s.d}</p>
                            </div>
                        </Reveal>
                    ))}
                </ol>
            </section>

            <section id="solicitud" className="container mx-auto scroll-mt-20 px-4 pb-6">
                <div className="mx-auto max-w-3xl space-y-6">
                    <div className="text-center">
                        <h2 className="font-display text-3xl text-primary md:text-4xl">Solicita tu anuncio</h2>
                        <p className="mt-2 text-muted-foreground">Completa el formulario y te contactamos.</p>
                    </div>
                    <PromoRequestForm loggedIn={Boolean(user)} kinds={[{ value: "anuncio", label: "Quiero anunciar mi negocio" }]} defaultKind="anuncio" />
                </div>
            </section>
        </div>
    )
}
