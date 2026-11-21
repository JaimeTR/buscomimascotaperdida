import Link from "next/link"
import Image from "next/image"

const COLUMNS = [
    { title: "Plataforma", links: [["/mascotas", "Buscar mascotas"], ["/reportar", "Reportar una mascota"], ["/cartel", "Crear cartel"], ["/promocionar", "Difundir un caso"]] },
    { title: "Ayuda", links: [["/contacto", "Contacto"], ["/privacidad", "Privacidad"], ["/terminos", "Términos"]] },
]

export function Footer() {
    return (
        <footer className="mt-16 bg-primary pb-24 text-primary-foreground md:pb-0">
            <div className="container mx-auto grid gap-10 px-4 py-14 md:grid-cols-[2fr_1fr_1fr]">
                <div className="space-y-4">
                    <Image src="/brand/isologo-horizontal-claro.svg" alt="Busco mi mascota" width={300} height={85} className="h-20 w-auto" unoptimized />
                    <p className="max-w-sm text-sm leading-relaxed text-primary-foreground/85">
                        Una red comunitaria para que las mascotas perdidas vuelvan a casa. Publica, busca y comparte, sin costo.
                    </p>
                </div>
                {COLUMNS.map((c) => (
                    <nav key={c.title} aria-label={c.title} className="space-y-3">
                        <h2 className="font-display text-sm uppercase tracking-widest text-orange-300">{c.title}</h2>
                        <ul className="space-y-2 text-sm">
                            {c.links.map(([href, label]) => (
                                <li key={href}><Link href={href} className="text-primary-foreground/90 hover:underline">{label}</Link></li>
                            ))}
                        </ul>
                    </nav>
                ))}
            </div>
            <div className="border-t border-white/15">
                <p className="container mx-auto px-4 py-5 text-xs text-primary-foreground/75">© {new Date().getFullYear()} Busco mi mascota. Todos los derechos reservados.</p>
            </div>
        </footer>
    )
}
