import Link from "next/link"
import { Plus, FileText, Lightbulb, CheckCircle2, Megaphone, ArrowRight, MapPinned } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { PageHeader } from "@/components/ui/page-header"
import { StatCard } from "@/components/ui/stat-card"
import { StatusBadge } from "@/components/status-badge"
import { ACTIVE_STATUSES, getOwnerData } from "@/lib/dashboard-data"

export const metadata = { title: "Resumen | Busco mi mascota" }

const fmt = new Intl.DateTimeFormat("es-PE", { day: "numeric", month: "short" })

export default async function DashboardPage() {
    const { user, pets, sightings } = await getOwnerData()
    const active = pets.filter((p) => ACTIVE_STATUSES.includes(p.status))
    const resolved = pets.filter((p) => p.status === "reunited").length
    const name = (user.user_metadata?.full_name as string | undefined)?.split(" ")[0]

    return (
        <div className="mx-auto max-w-6xl space-y-8 p-4 md:p-8">
            <PageHeader title={name ? `Hola, ${name}` : "Tu resumen"} text="Así van tus reportes y las pistas de la comunidad.">
                <Button asChild variant="cta" className="rounded-full"><Link href="/reportar"><Plus className="mr-2 h-4 w-4" aria-hidden /> Nuevo reporte</Link></Button>
            </PageHeader>

            <section aria-label="Métricas" className="grid grid-cols-3 gap-2 sm:gap-4">
                <StatCard label="Casos activos" value={active.length} icon={Megaphone} href="/panel/reportes" tone="orange" />
                <StatCard label="Pistas recibidas" value={sightings.length} icon={Lightbulb} href="/panel/mensajes" tone="teal" />
                <StatCard label="Casos resueltos" value={resolved} icon={CheckCircle2} href="/panel/reportes" tone="green" hint="Mascotas que volvieron a casa" />
            </section>

            <section aria-label="Accesos rápidos" className="grid grid-cols-3 gap-2 sm:gap-4">
                {[
                    { href: "/reportar", icon: Plus, t: "Publicar un reporte", d: "Perdida o encontrada" },
                    { href: "/cartel", icon: Megaphone, t: "Crear un cartel", d: "Listo para imprimir" },
                    { href: "/mascotas", icon: MapPinned, t: "Ver casos cercanos", d: "En la lista y el mapa" },
                ].map((a) => (
                    <Link key={a.href} href={a.href} className="flex flex-col items-center gap-2 rounded-3xl border bg-card p-3 text-center shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-lift)] sm:flex-row sm:gap-4 sm:p-4 sm:text-left">
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent text-accent-foreground"><a.icon className="h-5 w-5" aria-hidden /></span>
                        <span><span className="block text-xs font-semibold leading-tight sm:text-base">{a.t}</span><span className="hidden text-sm text-muted-foreground sm:inline">{a.d}</span></span>
                    </Link>
                ))}
            </section>

            {pets.length === 0 ? (
                <EmptyState icon={FileText} title="Aún no has publicado ningún reporte" text="Si perdiste o encontraste una mascota, publícala para que la comunidad pueda ayudar.">
                    <Button asChild variant="cta"><Link href="/reportar">Crear mi primer reporte</Link></Button>
                </EmptyState>
            ) : (
                <div className="grid gap-8 lg:grid-cols-2">
                    <section aria-labelledby="h-casos">
                        <div className="mb-3 flex flex-col items-center gap-1 sm:flex-row sm:justify-between">
                            <h2 id="h-casos" className="text-lg font-semibold">Casos recientes</h2>
                            <Link href="/panel/reportes" className="inline-flex items-center text-sm font-semibold text-primary hover:underline">Ver todos <ArrowRight className="ml-1 h-4 w-4" aria-hidden /></Link>
                        </div>
                        <ul className="divide-y overflow-hidden rounded-3xl border bg-card shadow-[var(--shadow-soft)]">
                            {pets.slice(0, 5).map((p) => (
                                <li key={p.id} className="flex flex-col items-center gap-2 p-4 text-center sm:flex-row sm:justify-between sm:gap-3 sm:text-left">
                                    <div className="min-w-0 max-w-full">
                                        <p className="truncate font-semibold">{p.name || "Sin nombre"}</p>
                                        <p className="truncate text-sm text-muted-foreground">{[p.last_seen_district, p.last_seen_department].filter(Boolean).join(", ")}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <StatusBadge status={p.status} />
                                        <Link href={`/panel/reportes/${p.id}/editar`} className="text-sm font-semibold text-primary hover:underline">Editar</Link>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section aria-labelledby="h-pistas">
                        <div className="mb-3 flex flex-col items-center gap-1 sm:flex-row sm:justify-between">
                            <h2 id="h-pistas" className="text-lg font-semibold">Últimas pistas</h2>
                            <Link href="/panel/mensajes" className="inline-flex items-center text-sm font-semibold text-primary hover:underline">Ver todas <ArrowRight className="ml-1 h-4 w-4" aria-hidden /></Link>
                        </div>
                        {sightings.length === 0 ? (
                            <p className="rounded-3xl border bg-card p-6 text-center text-sm text-muted-foreground">Todavía nadie ha reportado un avistamiento. Comparte tu caso para llegar a más personas.</p>
                        ) : (
                            <ul className="divide-y overflow-hidden rounded-3xl border bg-card shadow-[var(--shadow-soft)]">
                                {sightings.slice(0, 5).map((s) => (
                                    <li key={s.id} className="p-4 text-center sm:text-left">
                                        <p className="text-sm font-semibold">
                                            {s.pets?.name || "Tu mascota"} · {s.district || "Ubicación sin indicar"}
                                            <span className="ml-2 font-normal text-muted-foreground">{fmt.format(new Date(s.created_at))}</span>
                                        </p>
                                        {s.description && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{s.description}</p>}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                </div>
            )}
        </div>
    )
}
