import Link from "next/link"
import { Clock, Flag, Mail, MapPin, MessageCircle, Phone, Send } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Reveal } from "@/components/ui/reveal"
import { whatsappLink } from "@/lib/whatsapp"
import type { Sighting } from "@/hooks/use-pets"

const exact = new Intl.DateTimeFormat("es-PE", { dateStyle: "medium", timeStyle: "short" })

// Historial como línea de tiempo: el avistamiento más reciente arriba y, al final, el punto inicial de extravío.
// Cada reportante solo muestra los canales de contacto que eligió al reportar (el servidor ya filtró los demás).
export function SightingTimeline({ sightings, petId, petName }: { sightings: Sighting[]; petId: string; petName: string }) {
    const real = sightings.filter((s) => s.id !== "initial").length

    return (
        <section aria-labelledby="h-historial" className="rounded-[1.5rem] border bg-card p-5 shadow-[var(--shadow-soft)] sm:rounded-[2rem] sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h2 id="h-historial" className="font-display text-2xl text-primary sm:text-3xl">Historial de avistamientos</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{real === 0 ? "Aún nadie lo ha reportado." : `${real} ${real === 1 ? "avistamiento reportado" : "avistamientos reportados"} por la comunidad.`}</p>
                </div>
                <Button asChild variant="cta" className="w-full rounded-full sm:w-auto">
                    <Link href={`/mascotas/${petId}/avistamiento`}><Send className="mr-2 h-4 w-4" aria-hidden /> Reportar avistamiento</Link>
                </Button>
            </div>

            {real === 0 && (
                <div className="mt-6 flex items-center gap-4 rounded-2xl border border-dashed bg-background p-5">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-card shadow-sm"><Clock className="h-6 w-6 text-muted-foreground" aria-hidden /></span>
                    <div><p className="font-semibold">No hay avistamientos aún</p><p className="text-sm text-muted-foreground">Ayuda a {petName} a volver a casa: si lo viste, cuéntanos dónde y cuándo.</p></div>
                </div>
            )}

            <ol className="relative mt-6 space-y-5">
                <span aria-hidden className="absolute bottom-3 left-5 top-3 w-0.5 rounded bg-border sm:left-6" />
                {sightings.map((s, i) => {
                    const initial = s.id === "initial"
                    const name = s.reporter?.full_name || "Usuario"
                    const wa = s.share_whatsapp ? whatsappLink(s.reporter?.whatsapp, `Hola, te contacto por el avistamiento de ${petName}`) : null
                    const tel = s.share_phone ? s.reporter?.phone : undefined
                    const mail = s.share_email ? s.reporter?.email : undefined
                    return (
                        <Reveal as="li" key={s.id} delay={Math.min(i, 4) * 0.05} className="relative pl-14 sm:pl-[4.5rem]">
                            <span className={`absolute left-0 top-0 z-10 flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-4 border-card shadow-md sm:h-12 sm:w-12 ${initial ? "bg-cta text-cta-foreground" : "bg-accent text-primary"}`}>
                                {initial ? <Flag className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden />
                                    : s.reporter?.avatar_url
                                        ? <img src={s.reporter.avatar_url} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                                        : <span className="font-bold" aria-hidden>{name.charAt(0).toUpperCase()}</span>}
                            </span>

                            <article className="space-y-3 rounded-2xl border bg-background p-4 transition-all duration-300 hover:-translate-y-0.5 hover:bg-card hover:shadow-md sm:p-5">
                                <header className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                    <span className="font-semibold">{initial ? "Punto inicial de extravío" : name}</span>
                                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${initial ? "bg-cta/10 text-cta" : "bg-accent text-accent-foreground"}`}>{initial ? "Inicio" : "Avistamiento"}</span>
                                </header>

                                <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-muted-foreground">
                                    <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-cta" aria-hidden /> {initial ? "Última vez visto" : `Visto en ${s.district || "zona no indicada"}`}</span>
                                    <time dateTime={s.created_at} title={exact.format(new Date(s.created_at))} className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" aria-hidden /> {formatDistanceToNow(new Date(s.created_at), { addSuffix: true, locale: es })}</time>
                                </p>

                                <p className="leading-relaxed text-foreground/90">{initial ? s.description.replace("Punto inicial de extravío: ", "") : s.description}</p>

                                {s.image_url && (
                                    <a href={s.image_url} target="_blank" rel="noopener noreferrer" className="group/img block w-fit overflow-hidden rounded-xl border">
                                        <img src={s.image_url} alt="Foto del avistamiento" className="h-32 w-auto max-w-full object-cover transition-transform duration-500 group-hover/img:scale-110 sm:h-40" />
                                    </a>
                                )}

                                {(wa || tel || mail) && (
                                    <div className="flex flex-wrap gap-2 border-t pt-3">
                                        {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 text-xs font-semibold text-emerald-800 transition-all hover:-translate-y-0.5 hover:shadow-sm active:scale-95"><MessageCircle className="h-4 w-4" aria-hidden /> WhatsApp</a>}
                                        {tel && <a href={`tel:${tel.replace(/[^\d+]/g, "")}`} className="inline-flex h-9 items-center gap-1.5 rounded-full border border-teal-200 bg-accent px-3.5 text-xs font-semibold text-accent-foreground transition-all hover:-translate-y-0.5 hover:shadow-sm active:scale-95"><Phone className="h-4 w-4" aria-hidden /> Llamar</a>}
                                        {mail && <a href={`mailto:${mail}?subject=${encodeURIComponent(`Avistamiento de ${petName}`)}`} className="inline-flex h-9 items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-3.5 text-xs font-semibold text-violet-800 transition-all hover:-translate-y-0.5 hover:shadow-sm active:scale-95"><Mail className="h-4 w-4" aria-hidden /> Correo</a>}
                                    </div>
                                )}
                            </article>
                        </Reveal>
                    )
                })}
            </ol>
        </section>
    )
}
