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
    { href: "/anuncios", label: "Anunciar" },
    { href: "/contacto", label: "Contacto" },
]

// Logo: isologo (símbolo) y, si `showName`, el nombre como texto real (nítido a cualquier tamaño).
export function BrandMark({ className, showName = false, nameClassName }: { className?: string; showName?: boolean; nameClassName?: string }) {
    return (
        <span className={cn("flex shrink-0 items-center gap-2.5 whitespace-nowrap", className)}>
            <Image src="/logo_symbol.svg" alt="" width={36} height={44} className="h-9 w-auto sm:h-11" priority unoptimized />
            {showName && (
                <span className={cn("font-display text-[16px] leading-[1.0] sm:text-[19px] lg:text-[21px]", nameClassName)}>
                    <span className="block text-primary">busco mi</span>
                    <span className="block text-cta">mascota</span>
                </span>
            )}
        </span>
    )
}

export function Navbar() {
    const pathname = usePathname()

    // El dashboard y el admin traen su propia navegación.
    if (pathname.startsWith("/panel") || pathname.startsWith("/admin")) return null

    return (
        // Móvil: encabezado simple que se va con el scroll (solo logo); cuenta y accesos viven en la barra inferior.
        <header className="z-50 bg-background lg:sticky lg:top-0 lg:border-b lg:bg-background/90 lg:backdrop-blur">
            <div className="container mx-auto flex h-14 items-center justify-center gap-2 px-4 lg:h-16 lg:justify-between xl:gap-4">
                <Link href="/" aria-label="Busco mi mascota, inicio"><BrandMark showName nameClassName="lg:hidden" /></Link>

                <nav aria-label="Principal" className="hidden items-center gap-1 lg:flex">
                    {LINKS.map((l) => (
                        <Link
                            key={l.href}
                            href={l.href}
                            aria-current={pathname === l.href ? "page" : undefined}
                            className={cn(
                                "whitespace-nowrap rounded-full px-2 py-2 text-sm font-medium text-muted-foreground xl:px-4 transition-colors hover:bg-accent hover:text-accent-foreground",
                                pathname === l.href && "bg-accent text-accent-foreground"
                            )}
                        >
                            {l.label}
                        </Link>
                    ))}
                </nav>

                <div className="hidden items-center gap-3 lg:flex">
                    <ReportActionButton
                        nextUrl="/reportar"
                        label="Reportar mascota"
                        icon={<Plus className="mr-2 h-4 w-4" aria-hidden />}
                        variant="cta"
                        className="rounded-full"
                    />
                    <UserNav />
                </div>
            </div>
        </header>
    )
}
