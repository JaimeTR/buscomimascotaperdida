import Link from "next/link"
import Image from "next/image"

const COLUMNS = [
    {
        title: "Plataforma",
        links: [
            { href: "/mascotas", label: "Buscar mascotas" },
            { href: "/reportar", label: "Reportar una mascota" },
            { href: "/cartel", label: "Crear cartel" },
            { href: "/promocionar", label: "Difundir un caso" },
        ],
    },
    {
        title: "Ayuda",
        links: [
            { href: "/contacto", label: "Contacto" },
            { href: "/privacidad", label: "Privacidad" },
            { href: "/terminos", label: "Términos" },
        ],
    },
]

export function Footer() {
    return (
        <footer className="border-t bg-card">
            <div className="container mx-auto grid gap-10 px-4 py-12 md:grid-cols-[2fr_1fr_1fr]">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Image src="/logo_symbol.svg" alt="" width={32} height={32} className="h-8 w-8" unoptimized />
                        <span className="text-lg font-extrabold tracking-tight">Busco mi mascota</span>
                    </div>
                    <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
                        Una red comunitaria para que las mascotas perdidas vuelvan a casa.
                        Publica, busca y comparte, sin costo.
                    </p>
                </div>

                {COLUMNS.map((col) => (
                    <nav key={col.title} aria-label={col.title} className="space-y-3">
                        <h2 className="text-sm font-bold">{col.title}</h2>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            {col.links.map((l) => (
                                <li key={l.href}>
                                    <Link href={l.href} className="hover:text-primary hover:underline">
                                        {l.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                ))}
            </div>
            <div className="border-t">
                <p className="container mx-auto px-4 py-5 text-xs text-muted-foreground">
                    © {new Date().getFullYear()} Busco mi mascota. Todos los derechos reservados.
                </p>
            </div>
        </footer>
    )
}
