import Image from "next/image"
import { ArrowRight, ArrowUpNarrowWide, Eye, HandHeart, Heart, Megaphone, MousePointerClick, Send, ShieldCheck, Sparkles, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Reveal } from "@/components/ui/reveal"
import { PromoDialog } from "@/components/promo/promo-dialog"
import { OpenFormButton } from "@/components/ui/form-dialog"
import { STOCK } from "@/lib/stock-images"
import { createClient } from "@/utils/supabase/server"

export const metadata = { title: "Anuncia tu negocio o destaca tu caso | Busco mi mascota", description: "Apoya con un aporte voluntario: tu negocio o el caso de tu mascota aparece como destacado, ordenado según el aporte. Sin planes fijos.", alternates: { canonical: "/anuncios" } }

const AMOUNTS = [20, 50, 100, 200]
const lift = "hover-lift"

const BENEFITS = [
    { icon: Eye, t: "Más visibilidad", d: "Apareces como destacado en la portada y como aviso en otras páginas, mientras la gente recorre el sitio." },
    { icon: ArrowUpNarrowWide, t: "A mayor aporte, más adelante", d: "Los destacados se ordenan del mayor al menor aporte confirmado. Así de simple y transparente." },
    { icon: MousePointerClick, t: "Clics medidos", d: "Los anuncios de negocios cuentan sus clics para que sepas cuánta gente llega a tu web o redes." },
    { icon: ShieldCheck, t: "Con transparencia", d: "Todo se marca como destacado o anuncio y el equipo verifica cada aporte antes de publicar." },
]

const STEPS = [
    { t: "Decide tu aporte", d: "No hay planes: el monto es voluntario. Elige el que quieras y ayudas a sostener la red." },
    { t: "Envíalo por Yape o Plin", d: "Te mostramos el número al momento de reportar o de enviar tu solicitud. Puedes adjuntar tu captura." },
    { t: "Verificamos y publicamos", d: "Confirmamos el monto y tu caso o negocio sale como destacado, en el orden que corresponde." },
]

export default async function AnunciosPage() {
    const { data: { user } } = await (await createClient()).auth.getUser()

    return (
        <div>
            <section className="container mx-auto px-4 pt-6 md:pt-10">
                <div className="grid overflow-hidden rounded-[2rem] bg-primary text-primary-foreground md:grid-cols-[1.1fr_1fr]">
                    <div className="flex flex-col items-center justify-center gap-5 p-8 text-center md:items-start md:p-14 md:text-left">
                        <p className="inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium"><Star className="h-4 w-4 fill-current" aria-hidden /> Apoyo voluntario</p>
                        <h1 className="font-display text-4xl leading-[1.05] md:text-5xl">Destaca tu caso o tu negocio <span className="text-orange-300">con un aporte voluntario</span></h1>
                        <p className="text-lg text-primary-foreground/90">Sin planes ni precios fijos. Aportas lo que quieras y apareces como destacado: a mayor aporte, más adelante sales.</p>
                        <div className="flex flex-wrap justify-center gap-3 md:justify-start">
                            <OpenFormButton form="anuncios" variant="cta" size="lg" className="rounded-full"><Megaphone className="mr-2 h-5 w-5" aria-hidden /> Anunciar mi negocio</OpenFormButton>
                            <Button asChild size="lg" variant="outline" className="rounded-full border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"><a href="/reportar"><Heart className="mr-2 h-5 w-5" aria-hidden /> Destacar mi mascota</a></Button>
                        </div>
                    </div>
                    <div className="relative min-h-64 md:min-h-[26rem]">
                        <Image src={STOCK.paseo.src} alt={STOCK.paseo.alt} fill priority sizes="(min-width: 768px) 45vw, 100vw" className="object-cover" />
                    </div>
                </div>
            </section>

            <section aria-label="Beneficios" className="container mx-auto grid gap-4 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
                {BENEFITS.map((b, i) => (
                    <Reveal key={b.t} delay={i * 0.06}>
                        <div className={`${lift} group h-full rounded-3xl border bg-card p-6 text-center shadow-[var(--shadow-soft)] sm:text-left`}>
                            <span className="mx-auto mb-4 sm:mx-0 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6"><b.icon className="h-6 w-6" aria-hidden /></span>
                            <h2 className="text-lg font-semibold">{b.t}</h2>
                            <p className="mt-1 text-sm text-muted-foreground">{b.d}</p>
                        </div>
                    </Reveal>
                ))}
            </section>

            <section id="aporte" aria-labelledby="h-aporte" className="container mx-auto scroll-mt-20 space-y-8 px-4 py-6">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 id="h-aporte" className="font-display text-3xl text-primary md:text-4xl">Tú decides cuánto aportar</h2>
                    <p className="mt-2 text-muted-foreground">Estos montos son solo una guía. Cualquier aporte suma y el orden lo decide el monto confirmado.</p>
                </div>
                <ul className="mx-auto grid max-w-4xl grid-cols-2 gap-4 md:grid-cols-4">
                    {AMOUNTS.map((a, i) => (
                        <Reveal as="li" key={a} delay={i * 0.06}>
                            <OpenFormButton plain form="anuncios" detail={{ amount: String(a) }} className={`${lift} group flex w-full flex-col items-center gap-1 rounded-3xl border bg-card p-6 text-center shadow-[var(--shadow-soft)] ${i === 1 ? "ring-2 ring-primary" : ""}`}>
                                <HandHeart className="h-6 w-6 text-primary" aria-hidden />
                                <span className="font-display text-3xl">S/ {a}</span>
                                <span className="text-xs text-muted-foreground">{i === 0 ? "Para empezar" : i === 1 ? "El más común" : i === 2 ? "Mayor visibilidad" : "Máxima visibilidad"}</span>
                            </OpenFormButton>
                        </Reveal>
                    ))}
                </ul>
                <p className="text-center text-sm text-muted-foreground">¿Otro monto? Escríbelo en el formulario. ¿Quieres destacar a tu mascota? Lo ofrecemos al <a href="/reportar" className="font-semibold text-primary underline-offset-2 hover:underline">reportarla</a> o desde su página.</p>
            </section>

            <section aria-labelledby="h-pasos" className="container mx-auto px-4 py-14">
                <h2 id="h-pasos" className="mb-8 text-center font-display text-3xl text-primary md:text-4xl">Cómo funciona</h2>
                <ol className="grid gap-4 md:grid-cols-3">
                    {STEPS.map((s, i) => (
                        <Reveal as="li" key={s.t} delay={i * 0.06}>
                            <div className={`${lift} h-full rounded-3xl border bg-card p-6 text-center shadow-[var(--shadow-soft)] md:text-left`}>
                                <span className="mx-auto mb-4 md:mx-0 flex h-11 w-11 items-center justify-center rounded-full bg-primary font-display text-lg text-primary-foreground">{i + 1}</span>
                                <h3 className="mb-1 text-lg font-semibold">{s.t}</h3>
                                <p className="text-sm text-muted-foreground">{s.d}</p>
                            </div>
                        </Reveal>
                    ))}
                </ol>
            </section>

            <section id="solicitud" className="container mx-auto scroll-mt-20 px-4 pb-6">
                <div className="relative overflow-hidden rounded-[2rem] border bg-card px-6 py-12 text-center shadow-[var(--shadow-soft)] md:py-16">
                    <div aria-hidden className="paws-teal pointer-events-none absolute inset-0 opacity-[0.05]" />
                    <div className="relative mx-auto max-w-xl space-y-4">
                        <Sparkles className="mx-auto h-9 w-9 text-primary" aria-hidden />
                        <h2 className="font-display text-3xl text-primary md:text-4xl">Anuncia tu negocio</h2>
                        <p className="text-muted-foreground">Cuéntanos de tu negocio y cuánto quieres aportar. Te contactamos para coordinar todo.</p>
                        <OpenFormButton form="anuncios" variant="cta" size="lg" className="rounded-full"><Send className="mr-2 h-5 w-5" aria-hidden /> Enviar solicitud <ArrowRight className="ml-2 h-4 w-4" aria-hidden /></OpenFormButton>
                    </div>
                </div>
            </section>

            <PromoDialog form="anuncios" loggedIn={Boolean(user)} />
        </div>
    )
}
