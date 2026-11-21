import Link from "next/link"
import { redirect } from "next/navigation"
import { MapPin, Megaphone, PawPrint, Printer, Share2, Smartphone } from "lucide-react"

import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/ui/page-header"
import { StatusBadge } from "@/components/status-badge"
import { createClient } from "@/utils/supabase/server"

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const PERKS = [
    { icon: Printer, t: "Imprime o guarda PDF", d: "A4, Carta, A3 y media hoja, con tiras recortables." },
    { icon: Smartphone, t: "Para WhatsApp e Instagram", d: "Imagen en formato historia o cuadrado." },
    { icon: Share2, t: "Con QR al reporte", d: "Quien lo escanea ve la ficha y avisa al instante." },
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
        <main className="mx-auto max-w-5xl space-y-8 px-4 py-8 md:py-12">
            <PageHeader title="Carteles" text="Cada reporte tiene su cartel listo: elígelo, personalízalo y difúndelo." />

            <ul className="grid gap-3 sm:grid-cols-3">
                {PERKS.map(({ icon: Icon, t, d }) => (
                    <li key={t} className="flex gap-3 rounded-2xl border bg-card p-4"><Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden /><div><p className="text-sm font-semibold">{t}</p><p className="text-sm text-muted-foreground">{d}</p></div></li>
                ))}
            </ul>

            {!user ? (
                <section className="rounded-3xl border bg-card p-6 text-center">
                    <Megaphone className="mx-auto h-8 w-8 text-primary" aria-hidden />
                    <h2 className="mt-3 text-xl font-semibold">Inicia sesión para ver los carteles de tus reportes</h2>
                    <p className="mt-1 text-muted-foreground">¿Quieres ayudar a otra familia? Abre su reporte y pulsa «Generar cartel».</p>
                    <div className="mt-4 flex flex-wrap justify-center gap-3">
                        <Button asChild variant="cta"><Link href="/ingresar?next=/cartel">Iniciar sesión</Link></Button>
                        <Button asChild variant="outline"><Link href="/mascotas">Ver mascotas reportadas</Link></Button>
                    </div>
                </section>
            ) : !reports?.length ? (
                <section className="rounded-3xl border bg-card p-6 text-center">
                    <PawPrint className="mx-auto h-8 w-8 text-primary" aria-hidden />
                    <h2 className="mt-3 text-xl font-semibold">Aún no tienes reportes</h2>
                    <p className="mt-1 text-muted-foreground">Al publicar un reporte se genera tu cartel automáticamente.</p>
                    <Button asChild variant="cta" className="mt-4"><Link href="/reportar">Reportar una mascota</Link></Button>
                </section>
            ) : (
                <section aria-label="Tus reportes" className="grid gap-4 sm:grid-cols-2">
                    {reports.map(r => (
                        <article key={r.id} className="flex gap-4 rounded-2xl border bg-card p-4">
                            { }
                            {r.image_urls?.[0] ? <img src={r.image_urls[0]} alt="" className="h-24 w-24 shrink-0 rounded-xl object-cover" /> : <div className="grid h-24 w-24 shrink-0 place-items-center rounded-xl bg-secondary"><PawPrint className="h-8 w-8 text-muted-foreground" aria-hidden /></div>}
                            <div className="flex min-w-0 flex-1 flex-col gap-2">
                                <div className="flex items-start justify-between gap-2"><h2 className="truncate font-semibold">{r.name || "Sin nombre"}</h2><StatusBadge status={r.status} /></div>
                                <p className="flex items-center gap-1 truncate text-sm text-muted-foreground"><MapPin className="h-4 w-4 shrink-0" aria-hidden />{[r.last_seen_district, r.last_seen_department].filter(Boolean).join(", ") || "Sin ubicación"}</p>
                                <Button asChild size="sm" className="mt-auto self-start"><Link href={`/cartel/${r.id}`}><Megaphone className="mr-1.5 h-4 w-4" aria-hidden /> Abrir cartel</Link></Button>
                            </div>
                        </article>
                    ))}
                </section>
            )}
        </main>
    )
}
