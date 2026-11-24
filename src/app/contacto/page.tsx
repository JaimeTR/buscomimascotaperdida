import Link from "next/link"
import Image from "next/image"
import { HeartHandshake, Building2, LifeBuoy, ChevronDown, Mail, Phone, MessageCircle, Handshake, HandHeart, Users, PawPrint, Sparkles, Heart } from "lucide-react"
import { Reveal } from "@/components/ui/reveal"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { ContactDialog } from "@/components/contact/contact-dialog"
import { OpenFormButton } from "@/components/ui/form-dialog"
import { CONTACT_KINDS, type ContactKind } from "@/lib/contact-kinds"
import { CopyButton } from "@/components/contact/copy-button"
import { SITE_CONTACT, SUPPORT_METHODS } from "@/lib/site-config"
import { STOCK } from "@/lib/stock-images"

export const metadata = { title: "Contacto, alianzas y apoyo | Busco mi mascota", description: "Escríbenos, sé aliado o voluntario, colabora con el proyecto o apóyalo con Yape o Plin. Preguntas frecuentes y soporte.", alternates: { canonical: "/contacto" } }

const PATHS: { kind: ContactKind; icon: typeof Handshake; title: string; text: string }[] = [
    { kind: "aliado", icon: Building2, title: "Ser aliado", text: "Veterinarias, refugios, tiendas y marcas que quieren sumarse a la red y ayudar a su comunidad." },
    { kind: "voluntario", icon: HeartHandshake, title: "Ser voluntario", text: "Reparte carteles, comparte casos y acompaña a quienes perdieron a una mascota." },
    { kind: "colaborar", icon: Sparkles, title: "Colaborar en el proyecto", text: "Difusión, diseño, programación, traducciones o donaciones en especie: todo suma." },
]

const MEMBERSHIPS = [
    { name: "Amigo", amount: 10, text: "Un cafecito al mes para sostener la red.", icon: Heart },
    { name: "Aliado", amount: 25, text: "Ayudas a cubrir servidor, correos y avisos.", icon: HandHeart },
    { name: "Guardián", amount: 50, text: "Financias la difusión de casos que lo necesitan.", icon: Sparkles },
]

const FAQ = [
    { q: "¿Cuesta publicar un reporte?", a: "No. Publicar, buscar y compartir es gratis. Solo los negocios que quieren promocionarse contratan un plan." },
    { q: "¿Quién puede ver mi teléfono o correo?", a: "Solo lo que tú marques como público en Ajustes. Si no lo marcas, quien vea tu reporte puede escribirte únicamente por los canales que habilites." },
    { q: "Encontré una mascota, ¿qué hago?", a: "Busca en la lista si hay un reporte que coincida y envía un avistamiento desde su página. Si no hay reporte, toma buenas fotos y compártelas con los vecinos de la zona; también puedes llevarla a una veterinaria cercana para revisar si tiene microchip." },
    { q: "Mi mascota ya volvió, ¿cómo lo marco?", a: "Entra a tu panel, abre «Mis reportes» y pulsa «Marcar reunido». El reporte deja de aparecer como activo." },
    { q: "¿Cómo se eligen los anuncios y aliados?", a: "El equipo revisa cada solicitud. Los anuncios siempre se muestran marcados como anuncio y nunca se mezclan con los reportes de mascotas." },
    { q: "Vi un reporte falso o un abuso, ¿cómo aviso?", a: "Escríbenos desde el formulario con el enlace del reporte y lo revisamos. Los administradores pueden ocultar o eliminar reportes que incumplan las normas." },
    { q: "¿Para qué se usan los aportes?", a: "Apoyar el proyecto es voluntario. Ayuda a cubrir los costos de mantenerlo gratis: servidor, correos y avisos, y la difusión de casos." },
]

// FAQPage: respuestas citables por buscadores y asistentes de IA (GEO).
const FAQ_JSON_LD = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
}

const lift = "hover-lift"

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ tipo?: string }> }) {
    const { tipo } = await searchParams
    const initialKind = CONTACT_KINDS.find((k) => k.value === tipo)?.value ?? "consulta"
    const { email, phone, whatsapp, collabGroupUrl } = SITE_CONTACT
    const channels = [
        whatsapp && { href: `https://wa.me/${whatsapp.replace(/\D/g, "")}`, icon: MessageCircle, label: "WhatsApp", value: "Escríbenos", external: true },
        email && { href: `mailto:${email}`, icon: Mail, label: "Correo", value: email, external: false },
        phone && { href: `tel:${phone.replace(/[^\d+]/g, "")}`, icon: Phone, label: "Teléfono", value: phone, external: false },
    ].filter(Boolean) as { href: string; icon: typeof Mail; label: string; value: string; external: boolean }[]

    return (
        <div className="container mx-auto space-y-16 px-4 py-8 md:py-12">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }} />

            {/* Portada */}
            <div className="relative grid items-center gap-8 overflow-hidden rounded-[2rem] bg-accent md:grid-cols-[1.2fr_1fr]">
                <div aria-hidden className="paws-teal pointer-events-none absolute inset-0 opacity-[0.07]" />
                <div className="relative space-y-5 p-8 md:p-12">
                    <PageHeader title="Contacto, alianzas y apoyo" text="Escríbenos, súmate como aliado o voluntario, o apoya el proyecto para que más mascotas vuelvan a casa." />
                    <div className="flex flex-wrap justify-center gap-3 md:justify-start">
                        <OpenFormButton form="contacto" detail={{ kind: "consulta" }} variant="cta" size="lg" className="rounded-full"><MessageCircle className="mr-2 h-5 w-5" aria-hidden /> Escribir un mensaje</OpenFormButton>
                        <Button asChild variant="outline" size="lg" className="rounded-full bg-card"><a href="#apoyar"><HandHeart className="mr-2 h-5 w-5" aria-hidden /> Apoyar el proyecto</a></Button>
                    </div>
                </div>
                <div className="relative hidden h-full min-h-72 md:block">
                    <Image src={STOCK.voluntaria.src} alt={STOCK.voluntaria.alt} fill sizes="40vw" className="object-cover" />
                </div>
            </div>

            {/* Canales directos (solo los configurados) */}
            {channels.length > 0 && (
                <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {channels.map((c, i) => (
                        <Reveal as="li" key={c.label} delay={i * 0.06}>
                            <a href={c.href} {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})} className={`group flex flex-col items-center gap-3 rounded-3xl border bg-card p-5 text-center sm:flex-row sm:gap-4 sm:text-left shadow-[var(--shadow-soft)] ${lift}`}>
                                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent text-accent-foreground transition-transform duration-300 group-hover:scale-110"><c.icon className="h-6 w-6" aria-hidden /></span>
                                <span className="min-w-0"><span className="block text-sm text-muted-foreground">{c.label}</span><span className="block truncate font-semibold">{c.value}</span></span>
                            </a>
                        </Reveal>
                    ))}
                </ul>
            )}

            {/* Súmate */}
            <section aria-labelledby="h-sumate" className="space-y-6">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 id="h-sumate" className="font-display text-3xl text-primary md:text-4xl">Súmate a la red</h2>
                    <p className="mt-2 text-muted-foreground">Cada persona y cada negocio que se une hace la red más fuerte. Elige cómo quieres ayudar.</p>
                </div>
                <ul className="grid gap-4 md:grid-cols-3">
                    {PATHS.map((p, i) => (
                        <Reveal as="li" key={p.kind} delay={i * 0.06}>
                            <OpenFormButton plain form="contacto" detail={{ kind: p.kind }} className={`group block h-full w-full rounded-3xl border bg-card p-6 text-center shadow-[var(--shadow-soft)] active:scale-[0.99] md:text-left ${lift}`}>
                                <span className="mx-auto mb-4 md:mx-0 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6"><p.icon className="h-6 w-6" aria-hidden /></span>
                                <h3 className="text-lg font-semibold">{p.title}</h3>
                                <p className="mt-1 text-sm text-muted-foreground">{p.text}</p>
                                <span className="mt-4 inline-flex items-center text-sm font-semibold text-primary">Quiero sumarme <span className="ml-1 transition-transform duration-300 group-hover:translate-x-1" aria-hidden>→</span></span>
                            </OpenFormButton>
                        </Reveal>
                    ))}
                </ul>
                <p className="text-center text-sm text-muted-foreground">¿Tienes un negocio y quieres anunciarte? Mira los <Link href="/anuncios" className="font-semibold text-primary underline-offset-2 hover:underline">planes de promoción</Link>.</p>
            </section>

            {/* Apoyar el proyecto */}
            <section id="apoyar" aria-labelledby="h-apoyo" className="scroll-mt-20 overflow-hidden rounded-[2rem] border bg-card shadow-[var(--shadow-soft)]">
                <div className="grid md:grid-cols-[1fr_1.1fr]">
                    <div className="relative space-y-4 bg-primary p-8 text-primary-foreground md:p-12">
                        <div aria-hidden className="paws-white pointer-events-none absolute inset-0 opacity-[0.07]" />
                        <div className="relative space-y-4 text-center md:text-left">
                            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 md:mx-0"><HandHeart className="h-6 w-6" aria-hidden /></span>
                            <h2 id="h-apoyo" className="font-display text-3xl leading-tight md:text-4xl">Apoya el proyecto</h2>
                            <p className="text-primary-foreground/90">Busco mi mascota es gratis y seguirá siéndolo. Tu aporte, grande o pequeño, es voluntario y ayuda a cubrir servidor, avisos por correo y la difusión de casos.</p>
                            <p className="text-sm text-primary-foreground/80">¿Ya apoyaste? Avísanos para agradecerte: puedes adjuntar tu comprobante y, si quieres, unirte al grupo de colaboradores.</p>
                            <OpenFormButton form="contacto" detail={{ kind: "apoyo" }} variant="cta" size="lg" className="rounded-full"><HandHeart className="mr-2 h-5 w-5" aria-hidden /> Ya apoyé, avisar</OpenFormButton>
                        </div>
                    </div>
                    <div className="space-y-4 p-8 md:p-12">
                        <h3 className="text-center text-lg font-semibold md:text-left">Formas de apoyar</h3>
                        {SUPPORT_METHODS.length > 0 ? (
                            <ul className="space-y-3">
                                {SUPPORT_METHODS.map((m) => (
                                    <li key={m.id} className={`flex flex-wrap items-center justify-center gap-3 text-center sm:justify-between sm:text-left rounded-2xl border p-4 ${lift}`}>
                                        <div className="flex flex-col items-center gap-3 sm:flex-row">
                                            <span className={`flex h-11 w-11 items-center justify-center rounded-xl text-sm font-bold ${m.color}`}>{m.name}</span>
                                            <div>
                                                <p className="font-display text-xl tracking-wide">{m.number}</p>
                                                {m.holder && <p className="text-xs text-muted-foreground">A nombre de {m.holder}</p>}
                                            </div>
                                        </div>
                                        <CopyButton text={m.number!} label={`número de ${m.name}`} />
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="rounded-2xl border border-dashed p-5 text-sm text-muted-foreground">Estamos preparando los medios de apoyo (Yape y Plin). Mientras tanto puedes <OpenFormButton plain form="contacto" detail={{ kind: "colaborar" }} className="font-semibold text-primary underline-offset-2 hover:underline">escribirnos</OpenFormButton> y te contamos cómo colaborar.</p>
                        )}
                        <div className="space-y-3 border-t pt-4">
                            <h3 className="text-center text-lg font-semibold md:text-left">Apoyo mensual (voluntario)</h3>
                            <p className="text-center text-sm text-muted-foreground md:text-left">Si quieres apoyar de forma constante, elige un nivel. No es obligatorio ni hay cobro automático: nos escribes, coordinamos y tú envías tu aporte cada mes por Yape o Plin.</p>
                            <ul className="grid gap-3 sm:grid-cols-3">
                                {MEMBERSHIPS.map((m) => (
                                    <li key={m.name}>
                                        <OpenFormButton plain form="contacto" detail={{ kind: "apoyo", amount: String(m.amount), monthly: "1" }} className={`group flex h-full w-full flex-col items-center gap-1 rounded-2xl border p-4 text-center active:scale-[0.99] ${lift}`}>
                                            <span className="flex items-center gap-2 font-semibold"><m.icon className="h-4 w-4 text-primary" aria-hidden /> {m.name}</span>
                                            <span className="font-display text-2xl">S/ {m.amount}<span className="text-sm font-normal text-muted-foreground"> / mes</span></span>
                                            <span className="text-xs text-muted-foreground">{m.text}</span>
                                        </OpenFormButton>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li className="flex gap-2 text-left"><PawPrint className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden /> También aceptamos ayuda en especie: difusión, diseño, tiempo.</li>
                            <li className="flex gap-2 text-left"><PawPrint className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden /> Si quieres, mencionamos tu apoyo en la sección de colaboradores.</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Escríbenos: el formulario vive en un modal */}
            <section id="formulario" aria-labelledby="h-form" className="scroll-mt-20">
                <div className="relative overflow-hidden rounded-[2rem] border bg-card px-6 py-12 shadow-[var(--shadow-soft)] md:px-12 md:py-16">
                    <div aria-hidden className="paws-teal pointer-events-none absolute inset-0 opacity-[0.05]" />
                    <div className="relative mx-auto max-w-2xl space-y-5 text-center">
                        <MessageCircle className="mx-auto h-10 w-10 text-primary" aria-hidden />
                        <h2 id="h-form" className="font-display text-3xl text-primary md:text-4xl">Escríbenos</h2>
                        <p className="text-muted-foreground">Una consulta, una alianza, ser voluntario, colaborar o avisarnos que apoyaste: elige y completa el formulario en un momento. Te respondemos al correo que indiques.</p>
                        <div className="flex flex-col justify-center gap-3 sm:flex-row">
                            <OpenFormButton form="contacto" detail={{ kind: "consulta" }} variant="cta" size="lg" className="rounded-full"><MessageCircle className="mr-2 h-5 w-5" aria-hidden /> Abrir formulario</OpenFormButton>
                            {collabGroupUrl
                                ? <Button asChild variant="outline" size="lg" className="rounded-full"><a href={collabGroupUrl} target="_blank" rel="noopener noreferrer"><Users className="mr-2 h-5 w-5" aria-hidden /> Pedir acceso al grupo por WhatsApp</a></Button>
                                : <OpenFormButton form="contacto" detail={{ kind: "grupo" }} variant="outline" size="lg" className="rounded-full"><Users className="mr-2 h-5 w-5" aria-hidden /> Unirme al grupo de colaboradores</OpenFormButton>}
                        </div>
                        <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground"><LifeBuoy className="h-4 w-4 shrink-0 text-primary" aria-hidden /> ¿Un reporte falso o un abuso? Incluye el enlace del reporte en tu mensaje.</p>
                    </div>
                </div>
            </section>

            {/* Preguntas frecuentes */}
            <section id="faq" aria-labelledby="h-faq" className="mx-auto max-w-3xl scroll-mt-20 space-y-4">
                <h2 id="h-faq" className="text-center font-display text-3xl text-primary md:text-4xl">Preguntas frecuentes</h2>
                {FAQ.map((f) => (
                    <details key={f.q} className="group rounded-2xl border bg-card p-5 shadow-[var(--shadow-soft)] transition-shadow open:shadow-[var(--shadow-lift)]">
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                            {f.q}
                            <ChevronDown className="h-5 w-5 shrink-0 text-primary transition-transform duration-300 group-open:rotate-180" aria-hidden />
                        </summary>
                        <p className="mt-3 text-sm leading-relaxed text-muted-foreground animate-in fade-in slide-in-from-top-1 duration-300">{f.a}</p>
                    </details>
                ))}
            </section>

            <ContactDialog groupUrl={collabGroupUrl} openKind={tipo ? initialKind : undefined} />
        </div>
    )
}
