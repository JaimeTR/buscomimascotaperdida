import Link from "next/link"
import type { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { GUIDES } from "@/lib/guides"

export const metadata: Metadata = {
    title: "Qué hacer si se pierde tu mascota: guía de las primeras 24 horas",
    description: "Pasos concretos si se perdió tu perro o gato, y qué hacer si encuentras una mascota: dónde buscar, cómo publicar, cartel, microchip y seguridad al reencontrarse.",
    alternates: { canonical: "/guias" },
}

const LOST = [
    ["Busca cerca y de inmediato", "Recorre la cuadra y las calles vecinas llamándolo con calma. Los animales asustados suelen esconderse cerca: bajo autos, en jardines, en garajes."],
    ["Avisa a tus vecinos y al serenazgo", "Deja tu teléfono a porteros, vigilantes y tiendas de la zona. Pregunta en la comisaría y en el serenazgo del distrito."],
    ["Publica el caso con fotos claras", "Reporta en esta web con una foto de frente y otra de cuerpo entero, el lugar exacto y la hora. Un caso con zona precisa recibe más avisos."],
    ["Imprime y pega el cartel", "Usa el generador de carteles con un QR que lleva al caso. Pégalos en postes, veterinarias y tiendas de la zona."],
    ["Revisa veterinarias y refugios", "Llama a las veterinarias del distrito y a los refugios. Si tiene microchip, pide que lo registren como perdido."],
    ["Comparte en grupos del barrio", "Publica el enlace del caso en los grupos de WhatsApp y Facebook del distrito, no solo una foto."],
    ["No te rindas el primer día", "Muchos reencuentros ocurren días después. Actualiza el caso y revisa los avistamientos que lleguen."],
] as const

const FOUND = [
    ["Acércate con calma", "No lo persigas. Háblale suave y ofrécele agua. Si muerde o se asusta, llama a serenazgo o a un rescatista."],
    ["Revisa si tiene collar o chapita", "Puede tener teléfono grabado. Si no, llévalo a una veterinaria para que revisen si tiene microchip."],
    ["Publica que lo encontraste", "Reporta el hallazgo con fotos y la zona. No publiques todos los detalles: guarda alguna seña para verificar al dueño."],
    ["Verifica al dueño", "Pide una foto suya con la mascota y una seña que no esté en el anuncio, antes de entregarla."],
    ["Encuéntrense en un lugar público", "Acuerden un punto seguro y público, de día y, de ser posible, acompañado."],
] as const

const FAQ = [
    ["¿Cuánto cuesta publicar una mascota perdida?", "Nada. Publicar, buscar y generar el cartel es gratis. El apoyo para destacar un caso es voluntario."],
    ["¿Qué datos de contacto se muestran?", "Solo los que el dueño del reporte marcó como públicos. Los demás no se ven."],
    ["¿Qué hago si mi mascota tiene microchip?", "Avisa a la veterinaria o al registro donde lo inscribiste para que lo marquen como perdido."],
] as const

const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
        { "@type": "FAQPage", mainEntity: FAQ.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
        { "@type": "HowTo", name: "Qué hacer si se pierde tu mascota", step: LOST.map(([name, text], i) => ({ "@type": "HowToStep", position: i + 1, name, text })) },
    ],
}

function Steps({ items }: { items: readonly (readonly [string, string])[] }) {
    return (
        <ol className="space-y-4">
            {items.map(([t, d], i) => (
                <li key={t} className="flex gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent font-bold text-primary">{i + 1}</span>
                    <div><h3 className="font-semibold">{t}</h3><p className="text-sm text-muted-foreground">{d}</p></div>
                </li>
            ))}
        </ol>
    )
}

export default function GuidesPage() {
    return (
        <div className="container mx-auto max-w-3xl space-y-10 px-4 py-8 md:py-12">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
            <header className="space-y-3 text-center md:text-left">
                <h1 className="font-display text-3xl text-primary md:text-5xl">Qué hacer si se pierde tu mascota</h1>
                <p className="text-muted-foreground">Una guía corta para las primeras 24 horas. Cuanto antes actúes, más chances hay de reencontrarla.</p>
                <Button asChild variant="cta" className="rounded-full"><Link href="/reportar">Reportar mi mascota</Link></Button>
            </header>
            <section aria-labelledby="g-perdi" className="space-y-5"><h2 id="g-perdi" className="font-display text-2xl text-primary">Si se perdió tu mascota</h2><Steps items={LOST} /></section>
            <section aria-labelledby="g-encontre" className="space-y-5"><h2 id="g-encontre" className="font-display text-2xl text-primary">Si encontraste una mascota</h2><Steps items={FOUND} /></section>
            <section aria-labelledby="g-mas" className="space-y-4">
                <h2 id="g-mas" className="font-display text-2xl text-primary">Más guías</h2>
                <ul className="space-y-3">
                    {GUIDES.map((g) => (
                        <li key={g.slug}><Link href={`/guias/${g.slug}`} className="block rounded-2xl border bg-card p-4 hover-lift"><span className="font-semibold text-primary">{g.title}</span><span className="mt-1 block text-sm text-muted-foreground">{g.description}</span></Link></li>
                    ))}
                </ul>
            </section>
            <section aria-labelledby="g-faq" className="space-y-4">
                <h2 id="g-faq" className="font-display text-2xl text-primary">Preguntas frecuentes</h2>
                {FAQ.map(([q, a]) => <div key={q}><h3 className="font-semibold">{q}</h3><p className="text-sm text-muted-foreground">{a}</p></div>)}
            </section>
        </div>
    )
}
