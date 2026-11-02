import Link from "next/link"
import { Plus, FileText, Lightbulb, CheckCircle2, Megaphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/status-badge"
import { ACTIVE_STATUSES, getOwnerData } from "@/lib/dashboard-data"

export const metadata = { title: "Resumen | Busco mi mascota" }

const fmt = new Intl.DateTimeFormat("es-PE", { day: "numeric", month: "short" })

export default async function DashboardPage() {
    const { pets, sightings } = await getOwnerData()
    const active = pets.filter((p) => ACTIVE_STATUSES.includes(p.status))
    const resolved = pets.filter((p) => p.status === "reunited").length

    const stats = [
        { label: "Casos activos", value: active.length, icon: Megaphone, href: "/dashboard/reports" },
        { label: "Pistas recibidas", value: sightings.length, icon: Lightbulb, href: "/dashboard/messages" },
        { label: "Casos resueltos", value: resolved, icon: CheckCircle2, href: "/dashboard/reports" },
    ]

    return (
        <div className="mx-auto max-w-5xl space-y-8 p-4 md:p-8">
            <header className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">Tu resumen</h1>
                    <p className="text-muted-foreground">Estado de tus reportes y pistas recientes.</p>
                </div>
                <Button asChild className="bg-cta text-cta-foreground hover:bg-cta/90">
                    <Link href="/reportar"><Plus className="mr-2 h-4 w-4" aria-hidden /> Nuevo reporte</Link>
                </Button>
            </header>

            <section aria-label="Métricas" className="grid gap-4 sm:grid-cols-3">
                {stats.map((s) => (
                    <Link key={s.label} href={s.href} className="rounded-2xl border bg-card p-5 transition-shadow hover:shadow-md">
                        <div className="mb-3 flex items-center justify-between text-sm font-semibold text-muted-foreground">
                            {s.label} <s.icon className="h-5 w-5 text-primary" aria-hidden />
                        </div>
                        <div className="text-4xl font-extrabold">{s.value}</div>
                    </Link>
                ))}
            </section>

            {pets.length === 0 ? (
                <section className="rounded-2xl border border-dashed bg-card p-10 text-center">
                    <FileText className="mx-auto mb-3 h-10 w-10 text-muted-foreground" aria-hidden />
                    <h2 className="text-lg font-bold">Aún no has publicado ningún reporte</h2>
                    <p className="mx-auto mb-5 mt-1 max-w-md text-sm text-muted-foreground">
                        Si perdiste o encontraste una mascota, publícala para que la comunidad pueda ayudar.
                    </p>
                    <Button asChild><Link href="/reportar">Crear mi primer reporte</Link></Button>
                </section>
            ) : (
                <div className="grid gap-8 lg:grid-cols-2">
                    <section aria-labelledby="h-casos">
                        <h2 id="h-casos" className="mb-3 text-lg font-bold">Casos recientes</h2>
                        <ul className="divide-y rounded-2xl border bg-card">
                            {pets.slice(0, 5).map((p) => (
                                <li key={p.id} className="flex items-center justify-between gap-3 p-4">
                                    <div className="min-w-0">
                                        <p className="truncate font-semibold">{p.name || "Sin nombre"}</p>
                                        <p className="truncate text-sm text-muted-foreground">
                                            {[p.last_seen_district, p.last_seen_department].filter(Boolean).join(", ")}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <StatusBadge status={p.status} />
                                        <Link href={`/dashboard/reports/${p.id}/edit`} className="text-sm font-semibold text-primary hover:underline">Editar</Link>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section aria-labelledby="h-pistas">
                        <h2 id="h-pistas" className="mb-3 text-lg font-bold">Últimas pistas</h2>
                        {sightings.length === 0 ? (
                            <p className="rounded-2xl border bg-card p-6 text-sm text-muted-foreground">
                                Todavía nadie ha reportado un avistamiento. Comparte tu caso para llegar a más personas.
                            </p>
                        ) : (
                            <ul className="divide-y rounded-2xl border bg-card">
                                {sightings.slice(0, 5).map((s) => (
                                    <li key={s.id} className="p-4">
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
