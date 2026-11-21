import Link from "next/link"
import { ChevronLeft } from "lucide-react"

export type LegalSection = { title: string; body: React.ReactNode }

export const LEGAL_UPDATED = "21 de noviembre de 2026"
export const LEGAL_EMAIL = "contacto@buscomimascotaperdida.com"

// Marco común de las páginas legales: una sola maquetación para términos, privacidad, cookies y reclamaciones.
export function LegalPage({ title, intro, sections }: { title: string; intro?: React.ReactNode; sections: LegalSection[] }) {
    return (
        <div className="min-h-screen bg-background px-4 py-12 sm:px-6 lg:px-8">
            <article className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-border bg-card p-8 shadow-sm sm:p-12">
                <Link href="/" className="-ml-2 mb-8 inline-flex min-h-11 items-center gap-1 rounded-lg px-2 text-sm font-medium text-muted-foreground hover:text-primary">
                    <ChevronLeft className="h-4 w-4" aria-hidden /> Volver al inicio
                </Link>

                <h1 className="font-display text-4xl text-primary">{title}</h1>
                <p className="mb-6 mt-2 text-sm text-muted-foreground">Última actualización: {LEGAL_UPDATED}</p>
                {intro && <div className="mb-8 space-y-3 leading-relaxed text-foreground">{intro}</div>}

                <nav aria-label="Contenido" className="mb-10 rounded-xl bg-muted/50 p-4 text-sm">
                    <ol className="grid gap-1 sm:grid-cols-2">
                        {sections.map((s, i) => (
                            <li key={s.title}><a href={`#s${i + 1}`} className="inline-flex min-h-8 items-center text-primary underline-offset-4 hover:underline">{i + 1}. {s.title}</a></li>
                        ))}
                    </ol>
                </nav>

                <div className="space-y-8">
                    {sections.map((s, i) => (
                        <section key={s.title} id={`s${i + 1}`} className="scroll-mt-24 space-y-3 leading-relaxed text-foreground [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-1.5">
                            <h2 className="font-display text-2xl text-foreground">{i + 1}. {s.title}</h2>
                            {s.body}
                        </section>
                    ))}
                </div>

                <p className="mt-10 border-t pt-6 text-sm text-muted-foreground">
                    ¿Dudas sobre este documento? Escríbenos a <a href={`mailto:${LEGAL_EMAIL}`} className="text-primary underline underline-offset-4">{LEGAL_EMAIL}</a>.
                </p>
            </article>
        </div>
    )
}
