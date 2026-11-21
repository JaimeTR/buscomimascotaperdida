import Link from "next/link"
import { Lightbulb } from "lucide-react"
import { getOwnerData } from "@/lib/dashboard-data"

export const metadata = { title: "Pistas | Busco mi mascota" }

const fmt = new Intl.DateTimeFormat("es-PE", { dateStyle: "medium", timeStyle: "short" })

export default async function CluesPage() {
    const { sightings } = await getOwnerData()

    return (
        <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-8">
            <header>
                <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">Pistas recibidas</h1>
                <p className="text-muted-foreground">Avistamientos que la comunidad reportó sobre tus mascotas.</p>
            </header>

            {sightings.length === 0 ? (
                <div className="rounded-2xl border border-dashed bg-card p-10 text-center">
                    <Lightbulb className="mx-auto mb-3 h-10 w-10 text-muted-foreground" aria-hidden />
                    <h2 className="font-bold">Sin pistas por ahora</h2>
                    <p className="mt-1 text-sm text-muted-foreground">Cuando alguien reporte un avistamiento aparecerá aquí.</p>
                </div>
            ) : (
                <ul className="space-y-3">
                    {sightings.map((s) => (
                        <li key={s.id} className="rounded-2xl border bg-card p-4">
                            <div className="flex flex-wrap items-baseline justify-between gap-2">
                                <Link href={`/mascotas/${s.pet_id}`} className="font-bold text-primary hover:underline">
                                    {s.pets?.name || "Tu mascota"}
                                </Link>
                                <time dateTime={s.created_at} className="text-xs text-muted-foreground">{fmt.format(new Date(s.created_at))}</time>
                            </div>
                            <p className="text-sm text-muted-foreground">{[s.district, s.department].filter(Boolean).join(", ") || "Ubicación sin indicar"}</p>
                            {s.description && <p className="mt-2 text-sm">{s.description}</p>}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
