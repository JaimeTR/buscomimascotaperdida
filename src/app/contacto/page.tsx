import Link from "next/link"
import Image from "next/image"
import { HeartHandshake, Building2, LifeBuoy, ChevronDown, Mail } from "lucide-react"
import { Reveal } from "@/components/ui/reveal"
import { PageHeader } from "@/components/ui/page-header"
import { STOCK } from "@/lib/stock-images"

export const metadata = { title: "Contacto y ayuda | Busco mi mascota", description: "Preguntas frecuentes, soporte y formas de colaborar con Busco mi mascota." }

const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim()

const PATHS = [
    { href: "/aliados#colaborar", icon: HeartHandshake, title: "Quiero ser voluntario", text: "Reparte carteles, comparte casos y acompaña a quienes perdieron a su mascota." },
    { href: "/promocionar", icon: Building2, title: "Tengo un negocio", text: "Promociona tu marca o conviértete en aliado de la plataforma." },
    { href: "#faq", icon: LifeBuoy, title: "Necesito ayuda", text: "Respuestas rápidas sobre reportes, privacidad y cómo funciona la red." },
]

const FAQ = [
    { q: "¿Cuesta publicar un reporte?", a: "No. Publicar, buscar y compartir es gratis. Solo los negocios que quieren promocionarse contratan un plan." },
    { q: "¿Quién puede ver mi teléfono o correo?", a: "Solo lo que tú marques como público en Ajustes. Si no lo marcas, quien vea tu reporte puede escribirte únicamente por los canales que habilites." },
    { q: "Encontré una mascota, ¿qué hago?", a: "Busca en la lista si hay un reporte que coincida y envía un avistamiento desde su página. Si no hay reporte, toma buenas fotos y compártelas con los vecinos de la zona; también puedes llevarla a una veterinaria cercana para revisar si tiene microchip." },
    { q: "Mi mascota ya volvió, ¿cómo lo marco?", a: "Entra a tu dashboard, abre «Mis reportes» y pulsa «Marcar reunido». El reporte deja de aparecer como activo." },
    { q: "¿Cómo se eligen los anuncios y aliados?", a: "El equipo revisa cada solicitud. Los anuncios siempre se muestran marcados como anuncio y nunca se mezclan con los reportes de mascotas." },
    { q: "Vi un reporte falso o un abuso, ¿cómo aviso?", a: "Escríbenos con el enlace del reporte y lo revisamos. Los administradores pueden ocultar o eliminar reportes que incumplan las normas." },
]

export default function ContactPage() {
    return (
        <div className="container mx-auto space-y-14 px-4 py-8 md:py-12">
            <div className="grid items-center gap-8 overflow-hidden rounded-[2rem] bg-accent md:grid-cols-[1.2fr_1fr]">
                <div className="space-y-4 p-8 md:p-12">
                    <PageHeader title="Contacto y ayuda" text="Estamos para ayudarte a que más mascotas vuelvan a casa." />
                    {CONTACT_EMAIL && (
                        <a href={`mailto:${CONTACT_EMAIL}`} className="inline-flex items-center gap-2 rounded-full bg-card px-5 py-2.5 text-sm font-semibold text-primary shadow-[var(--shadow-soft)] hover:bg-secondary">
                            <Mail className="h-4 w-4" aria-hidden /> {CONTACT_EMAIL}
                        </a>
                    )}
                </div>
                <div className="relative hidden h-full min-h-60 md:block">
                    <Image src={STOCK.voluntaria.src} alt={STOCK.voluntaria.alt} fill sizes="40vw" className="object-cover" />
                </div>
            </div>

            <ul className="grid gap-4 md:grid-cols-3">
                {PATHS.map((p, i) => (
                    <Reveal as="li" key={p.title} delay={i * 0.06}>
                        <Link href={p.href} className="group block h-full rounded-3xl border bg-card p-6 shadow-[var(--shadow-soft)] transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]">
                            <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground"><p.icon className="h-6 w-6" aria-hidden /></span>
                            <h2 className="text-lg font-semibold">{p.title}</h2>
                            <p className="mt-1 text-sm text-muted-foreground">{p.text}</p>
                        </Link>
                    </Reveal>
                ))}
            </ul>

            <section id="faq" aria-labelledby="h-faq" className="mx-auto max-w-3xl scroll-mt-20 space-y-4">
                <h2 id="h-faq" className="text-center font-display text-3xl text-primary md:text-4xl">Preguntas frecuentes</h2>
                {FAQ.map((f) => (
                    <details key={f.q} className="group rounded-2xl border bg-card p-5 shadow-[var(--shadow-soft)] open:shadow-[var(--shadow-lift)]">
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                            {f.q}
                            <ChevronDown className="h-5 w-5 shrink-0 text-primary transition-transform group-open:rotate-180" aria-hidden />
                        </summary>
                        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
                    </details>
                ))}
            </section>
        </div>
    )
}
