import Link from "next/link"
import Image from "next/image"
import { PawPrint } from "lucide-react"

const COLUMNS = [
    { title: "Plataforma", links: [["/mascotas", "Buscar mascotas"], ["/reportar", "Reportar una mascota"], ["/cartel", "Crear cartel"]] },
    { title: "Comunidad", links: [["/guias", "Qué hacer si se pierde"], ["/casos-de-exito", "Casos de éxito"], ["/aliados", "Aliados y voluntarios"], ["/anuncios", "Anunciar tu negocio"]] },
    { title: "Ayuda", links: [["/contacto", "Contacto"], ["/privacidad", "Privacidad"], ["/terminos", "Términos"], ["/cookies", "Cookies"], ["/libro-de-reclamaciones", "Libro de reclamaciones"]] },
]

export function Footer() {
    return (
        <footer className="relative mt-20 overflow-hidden rounded-t-[2rem] bg-primary pb-24 text-primary-foreground md:rounded-t-[3rem] md:pb-0">
            {/* Marca de agua de huellitas + degradado suave para dar profundidad */}
            <div aria-hidden className="paws-white pointer-events-none absolute inset-0 opacity-[0.07]" />
            <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/15" />

            <div className="relative container mx-auto grid gap-10 px-4 py-14 md:grid-cols-[2fr_1fr_1fr_1fr]">
                <div className="space-y-4">
                    <Image src="/brand/isologo-horizontal-claro.svg" alt="Busco mi mascota" width={300} height={85} className="h-20 w-auto" unoptimized />
                    <p className="max-w-sm text-sm leading-relaxed text-primary-foreground/95">
                        Una red comunitaria para que las mascotas perdidas vuelvan a casa. Publica, busca y comparte, sin costo.
                    </p>
                </div>
                {COLUMNS.map((c) => (
                    <nav key={c.title} aria-label={c.title} className="space-y-3">
                        <h2 className="font-display text-sm text-orange-100">{c.title}</h2>
                        <ul className="space-y-2 text-sm">
                            {c.links.map(([href, label]) => (
                                <li key={href}><Link href={href} className="text-primary-foreground/90 hover:underline">{label}</Link></li>
                            ))}
                        </ul>
                    </nav>
                ))}
            </div>
            <div className="relative border-t border-white/15">
                <div className="container mx-auto flex flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-primary-foreground/90 sm:flex-row">
                    <p>© {new Date().getFullYear()} Busco mi mascota. Todos los derechos reservados.</p>
                    <p className="inline-flex items-center gap-1.5">
                        <PawPrint className="h-3.5 w-3.5 text-orange-200" aria-hidden /> Hecho en Perú para que vuelvan a casa
                    </p>
                </div>
            </div>
        </footer>
    )
}
