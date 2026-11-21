"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Plus } from "lucide-react"

import { ReportActionButton } from "@/components/report-action-button"
import { UserNav } from "@/components/user-nav"
import { cn } from "@/lib/utils"

const LINKS = [
    { href: "/", label: "Inicio" },
    { href: "/mascotas", label: "Buscar mascota" },
    { href: "/cartel", label: "Crear cartel" },
    { href: "/aliados", label: "Aliados" },
    { href: "/anuncios", label: "Anuncios" },
    { href: "/contacto", label: "Contacto" },
]

// Logo: símbolo + nombre en Braze (texto real, nítido a cualquier tamaño).
export function BrandMark({ className }: { className?: string }) {
    return (
        <span className={cn("flex shrink-0 items-center gap-2.5 whitespace-nowrap", className)}>
            <Image src="/logo_symbol.svg" alt="" width={36} height={44} className="h-10 w-auto" priority unoptimized />
            <span className="font-display text-[15px] uppercase leading-[1.05] tracking-wide">
                <span className="block text-primary">Busco mi</span>
                <span className="block text-cta">mascota</span>
            </span>
        </span>
    )
}

export function Navbar() {
    const pathname = usePathname()

    // El dashboard y el admin traen su propia navegación.
    if (pathname.startsWith("/dashboard") || pathname.startsWith("/admin")) return null

    return (
        <header className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur">
            <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
                <Link href="/" aria-label="Busco mi mascota, inicio"><BrandMark /></Link>

                <nav aria-label="Principal" className="hidden items-center gap-1 lg:flex">
                    {LINKS.map((l) => (
                        <Link
                            key={l.href}
                            href={l.href}
                            aria-current={pathname === l.href ? "page" : undefined}
                            className={cn(
                                "whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
                                pathname === l.href && "bg-accent text-accent-foreground"
                            )}
                        >
                            {l.label}
                        </Link>
                    ))}
                </nav>

                <div className="flex items-center gap-3">
                    <ReportActionButton
                        nextUrl="/reportar"
                        label="Reportar mascota"
                        icon={<Plus className="mr-2 h-4 w-4" aria-hidden />}
                        variant="cta"
                        className="hidden rounded-full sm:inline-flex"
                    />
                    <UserNav />
                </div>
            </div>
        </header>
    )
}
