import Image from "next/image"
import Link from "next/link"
import { Building2, HeartHandshake, Stethoscope, Newspaper, ChevronRight, Handshake, HandHeart, Megaphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { Reveal } from "@/components/ui/reveal"
import { PromoDialog } from "@/components/promo/promo-dialog"
import { OpenFormButton } from "@/components/ui/form-dialog"
import { getPartners, PARTNER_KINDS } from "@/lib/ads"
import { STOCK } from "@/lib/stock-images"
import { createClient } from "@/utils/supabase/server"

export const metadata = { title: "Aliados y colaboradores | Busco mi mascota", description: "Empresas, veterinarias, refugios y personas que ayudan a que las mascotas vuelvan a casa.", alternates: { canonical: "/aliados" } }

const WAYS = [
    { icon: Building2, title: "Empresas", text: "Apoya con difusión, descuentos para casos resueltos o publicidad dentro de la plataforma." },
    { icon: Stethoscope, title: "Veterinarias y refugios", text: "Recibe a mascotas encontradas, escanea microchips y ayuda a reunirlas con sus familias." },
    { icon: Newspaper, title: "Medios y creadores", text: "Comparte casos de tu zona y llega a la comunidad que busca respuestas." },
    { icon: HeartHandshake, title: "Voluntarios", text: "Reparte carteles, comparte reportes y acompaña a quienes perdieron a su mascota." },
]

export default async function AliadosPage({ searchParams }: { searchParams: Promise<{ tipo?: string; ciudad?: string }> }) {
    const { tipo, ciudad } = await searchParams
    const all = await getPartners()
    const kinds = Array.from(new Set(all.map((p) => p.kind)))
    const cities = Array.from(new Set(all.map((p) => p.city).filter((c): c is string => Boolean(c)))).sort()
    const partners = all.filter((p) => (!tipo || p.kind === tipo) && (!ciudad || p.city === ciudad))
    const chip = (active: boolean) => `inline-flex min-h-10 items-center rounded-full border px-4 text-sm font-medium transition-colors ${active ? "border-primary bg-primary text-primary-foreground" : "border-input bg-card hover:bg-accent"}`
    const { data: { user } } = await (await createClient()).auth.getUser()

    return (
        <div>
            <section className="container mx-auto px-4 pt-6 md:pt-10">
                <div className="grid overflow-hidden rounded-[2rem] bg-accent md:grid-cols-2">
                    <div className="flex flex-col items-center justify-center gap-5 p-8 text-center md:items-start md:p-14 md:text-left">
                        <p className="inline-flex w-fit items-center gap-2 rounded-full bg-card px-4 py-1.5 text-sm font-medium text-primary shadow-[var(--shadow-soft)]"><Handshake className="h-4 w-4" aria-hidden /> Aliados</p>
                        <h1 className="font-display text-4xl leading-[1.05] text-primary md:text-5xl">Juntos llegamos <span className="text-cta">más lejos</span></h1>
                        <p className="text-lg text-muted-foreground">Cada empresa, veterinaria y persona que colabora ayuda a que más mascotas vuelvan a casa.</p>
                        <div className="flex flex-wrap justify-center gap-3 md:justify-start">
                            <OpenFormButton form="aliados" variant="cta" size="lg" className="rounded-full"><HandHeart className="mr-2 h-5 w-5" aria-hidden /> Quiero colaborar</OpenFormButton>
                            <Button asChild variant="outline" size="lg" className="rounded-full bg-card"><Link href="/anuncios"><Megaphone className="mr-2 h-5 w-5" aria-hidden /> Cómo anunciarte</Link></Button>
                        </div>
                    </div>
                    <div className="relative min-h-64 md:min-h-[26rem]">
                        <Image src={STOCK.voluntaria.src} alt={STOCK.voluntaria.alt} fill priority sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
                    </div>
                </div>
            </section>

            <section aria-labelledby="h-formas" className="container mx-auto px-4 py-14">
                <h2 id="h-formas" className="mb-8 text-center font-display text-3xl text-primary md:text-4xl">Formas de colaborar</h2>
                <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {WAYS.map((w, i) => (
                        <Reveal as="li" key={w.title} delay={i * 0.06}>
                            <div className="hover-lift h-full rounded-3xl border bg-card p-6 text-center shadow-[var(--shadow-soft)] sm:text-left">
                                <span className="mx-auto mb-4 sm:mx-0 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground"><w.icon className="h-6 w-6" aria-hidden /></span>
                                <h3 className="text-lg font-semibold">{w.title}</h3>
                                <p className="mt-1 text-sm text-muted-foreground">{w.text}</p>
                            </div>
                        </Reveal>
                    ))}
                </ul>
            </section>

            <section aria-labelledby="h-aliados" className="container mx-auto px-4 pb-14">
                <h2 id="h-aliados" className="mb-8 text-center font-display text-3xl text-primary md:text-left">Nuestros aliados</h2>
                {(kinds.length > 1 || cities.length > 1) && (
                    <nav aria-label="Filtrar aliados" className="mb-6 flex flex-wrap items-center justify-center gap-2 md:justify-start">
                        <Link href="/aliados" className={chip(!tipo && !ciudad)} aria-current={!tipo && !ciudad ? "true" : undefined}>Todos</Link>
                        {kinds.map((k) => <Link key={k} href={`/aliados?tipo=${k}`} className={chip(tipo === k)} aria-current={tipo === k ? "true" : undefined}>{PARTNER_KINDS[k]}</Link>)}
                        {cities.map((c) => <Link key={c} href={`/aliados?ciudad=${encodeURIComponent(c)}`} className={chip(ciudad === c)} aria-current={ciudad === c ? "true" : undefined}>{c}</Link>)}
                    </nav>
                )}
                {partners.length === 0 ? (
                    <EmptyState icon={Handshake} title={all.length ? "No hay aliados con ese filtro" : "Aún no hay aliados publicados"} text="Sé la primera empresa o persona en aparecer aquí y ayuda a que la red crezca.">
                        <OpenFormButton form="aliados" detail={{ kind: "aliado" }} variant="cta"><Handshake className="mr-2 h-4 w-4" aria-hidden /> Quiero ser aliado</OpenFormButton>
                    </EmptyState>
                ) : (
                    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {partners.map((p) => {
                            const body = (
                                <>
                                    <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:gap-4 sm:text-left">
                                        {p.logo_url ? (
                                            <Image src={p.logo_url} alt="" width={56} height={56} unoptimized={p.logo_url.startsWith("http")} className="h-14 w-14 rounded-2xl border object-contain p-1" />
                                        ) : (
                                            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent font-display text-xl text-primary">{p.name.slice(0, 1).toUpperCase()}</span>
                                        )}
                                        <div className="min-w-0">
                                            <h3 className="truncate font-semibold">{p.name}</h3>
                                            <p className="text-xs text-muted-foreground">{PARTNER_KINDS[p.kind]}{p.city ? ` · ${p.city}` : ""}</p>
                                        </div>
                                        <ChevronRight className="h-5 w-5 shrink-0 text-primary sm:ml-auto" aria-hidden />
                                    </div>
                                    {p.description && <p className="mt-3 text-center text-sm sm:text-left text-muted-foreground">{p.description}</p>}
                                </>
                            )
                            const cls = "block h-full rounded-3xl border bg-card p-5 shadow-[var(--shadow-soft)] hover-lift"
                            return (
                                <li key={p.id}>
                                    <Link href={`/aliados/${p.id}`} className={cls}>{body}</Link>
                                </li>
                            )
                        })}
                    </ul>
                )}
            </section>

            <section id="colaborar" className="container mx-auto scroll-mt-20 px-4 pb-6">
                <div className="relative overflow-hidden rounded-[2rem] bg-primary px-6 py-12 text-center text-primary-foreground md:py-16">
                    <div aria-hidden className="paws-white pointer-events-none absolute inset-0 opacity-[0.07]" />
                    <div className="relative mx-auto max-w-xl space-y-4">
                        <Handshake className="mx-auto h-9 w-9 text-orange-200" aria-hidden />
                        <h2 className="font-display text-3xl leading-tight md:text-4xl">Quiero colaborar</h2>
                        <p className="text-primary-foreground/90">Cuéntanos cómo quieres ayudar y te escribimos.</p>
                        <div className="flex flex-col justify-center gap-3 pt-2 sm:flex-row">
                            <OpenFormButton form="aliados" detail={{ kind: "aliado" }} variant="cta" size="lg" className="rounded-full"><Building2 className="mr-2 h-5 w-5" aria-hidden /> Quiero ser aliado</OpenFormButton>
                            <OpenFormButton form="aliados" detail={{ kind: "voluntario" }} variant="outline" size="lg" className="rounded-full border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"><HeartHandshake className="mr-2 h-5 w-5" aria-hidden /> Quiero ser voluntario</OpenFormButton>
                        </div>
                    </div>
                </div>
            </section>

            <PromoDialog form="aliados" loggedIn={Boolean(user)} />
        </div>
    )
}
