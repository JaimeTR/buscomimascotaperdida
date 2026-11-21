import Image from "next/image"
import Link from "next/link"
import { Building2, HeartHandshake, Stethoscope, Newspaper, ArrowUpRight, Handshake } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { Reveal } from "@/components/ui/reveal"
import { PromoRequestForm } from "@/components/promo/request-form"
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

export default async function AliadosPage() {
    const partners = await getPartners()
    const { data: { user } } = await (await createClient()).auth.getUser()

    return (
        <div>
            <section className="container mx-auto px-4 pt-6 md:pt-10">
                <div className="grid overflow-hidden rounded-[2rem] bg-accent md:grid-cols-2">
                    <div className="flex flex-col justify-center gap-5 p-8 md:p-14">
                        <p className="inline-flex w-fit items-center gap-2 rounded-full bg-card px-4 py-1.5 text-sm font-medium text-primary shadow-[var(--shadow-soft)]"><Handshake className="h-4 w-4" aria-hidden /> Aliados</p>
                        <h1 className="font-display text-4xl leading-[1.05] text-primary md:text-5xl">Juntos llegamos <span className="text-cta">más lejos</span></h1>
                        <p className="text-lg text-muted-foreground">Cada empresa, veterinaria y persona que colabora ayuda a que más mascotas vuelvan a casa.</p>
                        <div className="flex flex-wrap gap-3">
                            <Button asChild variant="cta" size="lg" className="rounded-full"><a href="#colaborar">Quiero colaborar</a></Button>
                            <Button asChild variant="outline" size="lg" className="rounded-full bg-card"><Link href="/promocionar">Ver planes de promoción</Link></Button>
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
                            <div className="h-full rounded-3xl border bg-card p-6 shadow-[var(--shadow-soft)] transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]">
                                <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground"><w.icon className="h-6 w-6" aria-hidden /></span>
                                <h3 className="text-lg font-semibold">{w.title}</h3>
                                <p className="mt-1 text-sm text-muted-foreground">{w.text}</p>
                            </div>
                        </Reveal>
                    ))}
                </ul>
            </section>

            <section aria-labelledby="h-aliados" className="container mx-auto px-4 pb-14">
                <h2 id="h-aliados" className="mb-8 font-display text-3xl text-primary">Nuestros aliados</h2>
                {partners.length === 0 ? (
                    <EmptyState icon={Handshake} title="Aún no hay aliados publicados" text="Sé la primera empresa o persona en aparecer aquí y ayuda a que la red crezca.">
                        <Button asChild variant="cta"><a href="#colaborar">Quiero ser aliado</a></Button>
                    </EmptyState>
                ) : (
                    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {partners.map((p) => {
                            const body = (
                                <>
                                    <div className="flex items-center gap-4">
                                        {p.logo_url ? (
                                            <Image src={p.logo_url} alt="" width={56} height={56} unoptimized={p.logo_url.startsWith("http")} className="h-14 w-14 rounded-2xl border object-contain p-1" />
                                        ) : (
                                            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent font-display text-xl text-primary">{p.name.slice(0, 1).toUpperCase()}</span>
                                        )}
                                        <div className="min-w-0">
                                            <h3 className="truncate font-semibold">{p.name}</h3>
                                            <p className="text-xs text-muted-foreground">{PARTNER_KINDS[p.kind]}{p.city ? ` · ${p.city}` : ""}</p>
                                        </div>
                                        {p.website_url && <ArrowUpRight className="ml-auto h-5 w-5 shrink-0 text-primary" aria-hidden />}
                                    </div>
                                    {p.description && <p className="mt-3 text-sm text-muted-foreground">{p.description}</p>}
                                </>
                            )
                            const cls = "block h-full rounded-3xl border bg-card p-5 shadow-[var(--shadow-soft)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]"
                            return (
                                <li key={p.id}>
                                    {p.website_url ? <a href={p.website_url} target="_blank" rel="noopener noreferrer" className={cls}>{body}</a> : <div className={cls}>{body}</div>}
                                </li>
                            )
                        })}
                    </ul>
                )}
            </section>

            <section id="colaborar" className="container mx-auto scroll-mt-20 px-4 pb-6">
                <div className="mx-auto max-w-3xl space-y-6">
                    <div className="text-center">
                        <h2 className="font-display text-3xl text-primary md:text-4xl">Quiero colaborar</h2>
                        <p className="mt-2 text-muted-foreground">Cuéntanos cómo quieres ayudar y te escribimos.</p>
                    </div>
                    <PromoRequestForm
                        loggedIn={Boolean(user)}
                        kinds={[{ value: "aliado", label: "Ser aliado (empresa, veterinaria, refugio)" }, { value: "voluntario", label: "Ser voluntario" }]}
                        defaultKind="aliado"
                    />
                </div>
            </section>
        </div>
    )
}
