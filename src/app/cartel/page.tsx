import Link from "next/link"
import { redirect } from "next/navigation"
import {
    BadgeCheck, Camera, Download, Hand, ImagePlus, LayoutTemplate, MapPin, Megaphone, PawPrint, Phone, Printer, QrCode,
    Scissors, Share2, Smartphone, Sparkles, Type, LogIn, Search,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Reveal } from "@/components/ui/reveal"
import { StatusBadge } from "@/components/status-badge"
import { PosterThumb } from "@/components/poster/poster-thumb"
import { FORMATS, TEMPLATES, type FormatId, type TemplateId } from "@/lib/poster"
import { createClient } from "@/utils/supabase/server"

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const lift = "hover-lift"

const FEATURES = [
    { icon: LayoutTemplate, t: "5 plantillas", d: "Marca, Alerta, Foto completa, Urgente y Encontrado: cambia el estilo con un toque." },
    { icon: Type, t: "Textos a tu medida", d: "Titular, nombre, datos, señas particulares, zona, calle y recompensa." },
    { icon: Camera, t: "Tu mejor foto", d: "Elige entre las fotos del reporte o sube otra desde tu celular." },
    { icon: Phone, t: "Contacto claro", d: "Teléfono, WhatsApp e Instagram con letra grande y legible a distancia." },
    { icon: QrCode, t: "QR al reporte", d: "Quien lo escanea ve la ficha completa y puede avisarte al instante." },
    { icon: Scissors, t: "Tiras recortables", d: "Con tu teléfono al pie para que la gente se lleve el dato." },
]

const FORMAT_USE: Record<FormatId, string> = {
    a4: "El más usado: impresora de casa o copistería.",
    letter: "Para papel carta, también imprimir o PDF.",
    a3: "Grande, para vitrinas, postes y paraderos.",
    half: "Dos carteles por hoja A4: reparte más gastando menos.",
    story: "WhatsApp, Instagram y Facebook en pantalla completa.",
    square: "Para el feed de Instagram y Facebook.",
}
const FORMAT_ICON: Record<FormatId, typeof Printer> = { a4: Printer, letter: Printer, a3: Printer, half: Scissors, story: Smartphone, square: ImagePlus }

const STEPS = [
    { t: "Reporta a tu mascota", d: "Publica el reporte con fotos y la zona. El cartel se genera solo, con todos tus datos." },
    { t: "Personalízalo", d: "Elige plantilla, tamaño, textos y foto. Ves el resultado al instante." },
    { t: "Imprime y comparte", d: "Descárgalo en PDF o imagen, imprímelo y compártelo por WhatsApp y redes." },
]

const TIPS = [
    "Usa una foto clara, de frente y con buena luz.",
    "Pon un teléfono que contestes: si lo ven de noche, que puedan escribirte.",
    "Indica la calle o referencia exacta de la última vez.",
    "Agrega señas particulares: collar, manchas, cicatrices.",
    "Pega el cartel a la altura de los ojos, en esquinas y tiendas de la zona.",
]

export default async function PosterHubPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
    const { id } = await searchParams
    if (id && UUID.test(id)) redirect(`/cartel/${id}`) // enlaces antiguos /cartel?id=

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { data: reports } = user
        ? await supabase.from("pets").select("id, name, status, image_urls, last_seen_district, last_seen_department").eq("owner_id", user.id).order("created_at", { ascending: false })
        : { data: null }

    return (
        <div className="space-y-16 pb-8 md:space-y-20">
            {/* Portada */}
            <section className="container mx-auto px-4 pt-6 md:pt-10">
                <div className="relative overflow-hidden rounded-[1.5rem] bg-accent px-5 py-8 sm:rounded-[2rem] sm:px-8 md:px-14 md:py-14">
                    <div aria-hidden className="paws-teal pointer-events-none absolute inset-0 opacity-[0.08]" />
                    <div className="relative grid items-center gap-10 md:grid-cols-[1.15fr_1fr]">
                        <div className="flex min-w-0 flex-col items-center space-y-5 text-center md:block md:space-y-6 md:text-left">
                            <p className="inline-flex items-center gap-2 rounded-full bg-card px-4 py-1.5 text-sm font-medium text-primary shadow-[var(--shadow-soft)]"><Megaphone className="h-4 w-4" aria-hidden /> Carteles de mascota perdida</p>
                            <h1 className="text-balance font-display text-[2rem] leading-[1.08] text-primary sm:text-4xl md:text-6xl md:leading-[1.05]">Un cartel <span className="text-cta">profesional</span> en minutos</h1>
                            <p className="max-w-xl text-base text-muted-foreground sm:text-lg">Elige una plantilla, personaliza los textos y la foto, y descárgalo o imprímelo. Con QR directo al reporte y en el tamaño que necesites.</p>
                            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:justify-center md:justify-start">
                                <Button asChild variant="cta" size="lg" className="h-12 rounded-full px-7 text-base"><a href="#mis-reportes"><Megaphone className="mr-2 h-5 w-5" aria-hidden /> Crear el cartel de mi reporte</a></Button>
                                <Button asChild variant="outline" size="lg" className="h-12 rounded-full border-primary/30 bg-card px-7 text-base text-primary hover:bg-card/80"><Link href="/reportar"><PawPrint className="mr-2 h-5 w-5" aria-hidden /> Reportar una mascota</Link></Button>
                            </div>
                            <ul className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm font-medium md:justify-start text-muted-foreground">
                                {["Gratis", "PDF, PNG o impreso", "Se guarda solo"].map((t) => <li key={t} className="inline-flex items-center gap-1.5"><BadgeCheck className="h-4 w-4 text-primary" aria-hidden /> {t}</li>)}
                            </ul>
                        </div>
                        <div className="relative mx-auto flex h-[22rem] w-full max-w-md items-center justify-center md:h-[30rem]">
                            <div className="absolute left-2 top-6 hidden sm:block"><PosterThumb template="alerta" width={190} tilt={-8} /></div>
                            <div className="absolute right-2 top-10 hidden sm:block"><PosterThumb template="foto" width={190} tilt={8} /></div>
                            <div className="relative z-10 transition-transform duration-500 hover:scale-105"><PosterThumb template="marca" width={250} /></div>
                            <span className="absolute -bottom-1 left-1/2 z-20 -translate-x-1/2 rounded-full bg-card px-4 py-2 text-xs font-semibold text-primary shadow-[var(--shadow-lift)]">Vista de ejemplo</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mis reportes */}
            <section id="mis-reportes" aria-labelledby="h-mis" className="container mx-auto max-w-5xl scroll-mt-20 space-y-5 px-4">
                <div className="space-y-1 text-center">
                    <h2 id="h-mis" className="font-display text-3xl text-primary md:text-4xl">{user ? "Elige el reporte" : "Empieza ahora"}</h2>
                    <p className="text-muted-foreground">{user ? "Cada reporte ya tiene su cartel listo: ábrelo y personalízalo." : "Inicia sesión para ver los carteles de tus reportes."}</p>
                </div>

                {!user ? (
                    <div className="rounded-3xl border bg-card p-8 text-center shadow-[var(--shadow-soft)]">
                        <Megaphone className="mx-auto h-9 w-9 text-primary" aria-hidden />
                        <p className="mx-auto mt-3 max-w-md text-muted-foreground">¿Quieres ayudar a otra familia? Abre su reporte en la lista y pulsa «Generar cartel».</p>
                        <div className="mt-5 flex flex-wrap justify-center gap-3">
                            <Button asChild variant="cta" size="lg" className="rounded-full"><Link href="/ingresar?next=/cartel"><LogIn className="mr-2 h-5 w-5" aria-hidden /> Iniciar sesión</Link></Button>
                            <Button asChild variant="outline" size="lg" className="rounded-full"><Link href="/mascotas"><Search className="mr-2 h-5 w-5" aria-hidden /> Ver mascotas reportadas</Link></Button>
                        </div>
                    </div>
                ) : !reports?.length ? (
                    <div className="rounded-3xl border bg-card p-8 text-center shadow-[var(--shadow-soft)]">
                        <PawPrint className="mx-auto h-9 w-9 text-primary" aria-hidden />
                        <h3 className="mt-3 text-xl font-semibold">Aún no tienes reportes</h3>
                        <p className="mt-1 text-muted-foreground">Al publicar un reporte se genera tu cartel automáticamente.</p>
                        <Button asChild variant="cta" size="lg" className="mt-5 rounded-full"><Link href="/reportar"><PawPrint className="mr-2 h-5 w-5" aria-hidden /> Reportar una mascota</Link></Button>
                    </div>
                ) : (
                    <ul className="grid gap-4 sm:grid-cols-2">
                        {reports.map((r, i) => (
                            <Reveal as="li" key={r.id} delay={(i % 4) * 0.05}>
                                <Link href={`/cartel/${r.id}`} className={`group flex gap-4 rounded-3xl border bg-card p-4 shadow-[var(--shadow-soft)] active:scale-[0.99] ${lift}`}>
                                    {r.image_urls?.[0]
                                        ? <img src={r.image_urls[0]} alt="" className="h-24 w-24 shrink-0 rounded-2xl object-cover" />
                                        : <div className="grid h-24 w-24 shrink-0 place-items-center rounded-2xl bg-secondary"><PawPrint className="h-8 w-8 text-muted-foreground" aria-hidden /></div>}
                                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                                        <div className="flex items-start justify-between gap-2"><h3 className="truncate font-semibold">{r.name || "Sin nombre"}</h3><StatusBadge status={r.status} /></div>
                                        <p className="flex items-center gap-1 truncate text-sm text-muted-foreground"><MapPin className="h-4 w-4 shrink-0" aria-hidden />{[r.last_seen_district, r.last_seen_department].filter(Boolean).join(", ") || "Sin ubicación"}</p>
                                        <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-primary"><Megaphone className="h-4 w-4" aria-hidden /> Abrir cartel <span className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden>→</span></span>
                                    </div>
                                </Link>
                            </Reveal>
                        ))}
                    </ul>
                )}
            </section>

            {/* Qué incluye */}
            <section aria-labelledby="h-incluye" className="container mx-auto space-y-8 px-4">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 id="h-incluye" className="font-display text-3xl text-primary md:text-4xl">Todo lo que necesitas para difundir</h2>
                    <p className="mt-2 text-muted-foreground">Un editor completo, sin instalar nada y sin saber de diseño.</p>
                </div>
                <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {FEATURES.map((f, i) => (
                        <Reveal as="li" key={f.t} delay={(i % 3) * 0.06}>
                            <div className={`group h-full rounded-3xl border bg-card p-6 text-center shadow-[var(--shadow-soft)] sm:text-left ${lift}`}>
                                <span className="mx-auto mb-4 sm:mx-0 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6"><f.icon className="h-6 w-6" aria-hidden /></span>
                                <h3 className="text-lg font-semibold">{f.t}</h3>
                                <p className="mt-1 text-sm text-muted-foreground">{f.d}</p>
                            </div>
                        </Reveal>
                    ))}
                </ul>
            </section>

            {/* Plantillas */}
            <section aria-labelledby="h-plantillas" className="container mx-auto space-y-8 px-4">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 id="h-plantillas" className="font-display text-3xl text-primary md:text-4xl">Elige tu plantilla</h2>
                    <p className="mt-2 text-muted-foreground">La de la marca es la inicial. Cámbiala cuando quieras en el editor.</p>
                </div>
                <ul className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] justify-items-center gap-x-6 gap-y-10">
                    {(Object.keys(TEMPLATES) as TemplateId[]).map((id, i) => (
                        <Reveal as="li" key={id} delay={(i % 5) * 0.05}>
                            <figure className="group flex flex-col items-center gap-3">
                                <div className="transition-transform duration-300 group-hover:-translate-y-2 group-hover:scale-[1.03]"><PosterThumb template={id} width={200} /></div>
                                <figcaption className="text-center"><span className="block font-semibold">{TEMPLATES[id].label}{id === "marca" && <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-[11px] font-bold text-primary-foreground">Inicial</span>}</span><span className="text-sm text-muted-foreground">{TEMPLATES[id].hint}</span></figcaption>
                            </figure>
                        </Reveal>
                    ))}
                </ul>
            </section>

            {/* Formatos */}
            <section aria-labelledby="h-formatos" className="container mx-auto space-y-8 px-4">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 id="h-formatos" className="font-display text-3xl text-primary md:text-4xl">Para imprimir y para redes</h2>
                    <p className="mt-2 text-muted-foreground">Seis tamaños listos. Descarga en PDF o imagen PNG.</p>
                </div>
                <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {(Object.keys(FORMATS) as FormatId[]).map((id, i) => {
                        const f = FORMATS[id]
                        const Icon = FORMAT_ICON[id]
                        const w = f.w >= f.h ? 44 : (44 * f.w) / f.h
                        const h = f.w >= f.h ? (44 * f.h) / f.w : 44
                        return (
                            <Reveal as="li" key={id} delay={(i % 3) * 0.06}>
                                <div className={`flex h-full flex-col items-center gap-3 rounded-3xl border bg-card p-5 text-center sm:flex-row sm:gap-4 sm:text-left shadow-[var(--shadow-soft)] ${lift}`}>
                                    <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-secondary"><span className="rounded-[3px] border-2 border-primary bg-card" style={{ width: w, height: h }} aria-hidden /></span>
                                    <div className="min-w-0">
                                        <p className="flex flex-wrap items-center justify-center gap-2 font-semibold sm:justify-start"><Icon className="h-4 w-4 text-primary" aria-hidden /> {f.label} <span className="text-xs font-normal text-muted-foreground">· {f.hint}</span></p>
                                        <p className="mt-0.5 text-sm text-muted-foreground">{FORMAT_USE[id]}</p>
                                    </div>
                                </div>
                            </Reveal>
                        )
                    })}
                </ul>
            </section>

            {/* Cómo funciona + consejos */}
            <section aria-labelledby="h-como" className="container mx-auto grid gap-8 px-4 lg:grid-cols-[1.1fr_1fr]">
                <div className="space-y-5">
                    <h2 id="h-como" className="text-center font-display lg:text-left text-3xl text-primary md:text-4xl">Así de simple</h2>
                    <ol className="space-y-4">
                        {STEPS.map((s, i) => (
                            <Reveal as="li" key={s.t} delay={i * 0.06}>
                                <div className="flex flex-col items-center gap-3 rounded-3xl border bg-card p-5 text-center shadow-[var(--shadow-soft)] sm:flex-row sm:items-start sm:gap-4 sm:text-left">
                                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary font-display text-lg text-primary-foreground">{i + 1}</span>
                                    <div><h3 className="font-semibold">{s.t}</h3><p className="text-sm text-muted-foreground">{s.d}</p></div>
                                </div>
                            </Reveal>
                        ))}
                    </ol>
                </div>
                <div className="relative overflow-hidden rounded-[2rem] bg-primary p-7 text-primary-foreground md:p-10">
                    <div aria-hidden className="paws-white pointer-events-none absolute inset-0 opacity-[0.07]" />
                    <div className="relative space-y-4 text-center md:text-left">
                        <span className="mx-auto flex h-12 w-12 md:mx-0 items-center justify-center rounded-2xl bg-white/15"><Sparkles className="h-6 w-6" aria-hidden /></span>
                        <h2 className="font-display text-2xl leading-tight md:text-3xl">Consejos para un buen cartel</h2>
                        <ul className="space-y-3 text-sm text-primary-foreground/95">
                            {TIPS.map((t) => <li key={t} className="flex gap-2.5 text-left"><Hand className="mt-0.5 h-4 w-4 shrink-0 text-orange-200" aria-hidden /> {t}</li>)}
                        </ul>
                    </div>
                </div>
            </section>

            {/* Cierre */}
            <section className="container mx-auto px-4">
                <div className="relative overflow-hidden rounded-[2rem] border bg-card px-6 py-10 text-center shadow-[var(--shadow-soft)] md:py-14">
                    <div className="mx-auto max-w-xl space-y-4">
                        <Share2 className="mx-auto h-9 w-9 text-primary" aria-hidden />
                        <h2 className="font-display text-3xl text-primary md:text-4xl">Cada cartel cuenta</h2>
                        <p className="text-muted-foreground">Mientras más rápido se difunde, más rápido aparece. Crea tu cartel ahora.</p>
                        <div className="flex flex-col justify-center gap-3 sm:flex-row">
                            <Button asChild variant="cta" size="lg" className="rounded-full"><a href="#mis-reportes"><Download className="mr-2 h-5 w-5" aria-hidden /> Crear mi cartel</a></Button>
                            <Button asChild variant="outline" size="lg" className="rounded-full"><Link href="/mascotas">Ver mascotas reportadas</Link></Button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
