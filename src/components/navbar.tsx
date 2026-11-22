"use client"

import Link from "next/link"
import Image from "next/image"
import { useSyncExternalStore } from "react"
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
export function BrandMark({ className, showName = false, nameClassName, symbolClassName }: { className?: string; showName?: boolean; nameClassName?: string; symbolClassName?: string }) {
    return (
        <span className={cn("flex shrink-0 items-center gap-2.5 whitespace-nowrap", className)}>
            <Image src="/logo_symbol.svg" alt="" width={36} height={44} className={cn("h-9 w-auto transition-all duration-300 sm:h-11", symbolClassName)} priority unoptimized />
            {showName && (
                <span className={cn("font-display text-[16px] leading-[1.0] sm:text-[19px] lg:text-[21px]", nameClassName)}>
                    <span className="block text-primary">busco mi</span>
                    <span className="block text-cta">mascota</span>
                </span>
            )}
        </span>
    )
}

// Verdadero cuando la página ya se desplazó: el encabezado fijo se encoge y queda delgado.
const subscribeScroll = (cb: () => void) => { window.addEventListener("scroll", cb, { passive: true }); return () => window.removeEventListener("scroll", cb) }
const isScrolled = () => window.scrollY > 24

export function Navbar() {
    const pathname = usePathname()
    const scrolled = useSyncExternalStore(subscribeScroll, isScrolled, () => false)

    // El dashboard y el admin traen su propia navegación.
    if (pathname.startsWith("/panel") || pathname.startsWith("/admin")) return null

    return (
        // Móvil: encabezado simple que se va con el scroll (solo logo); cuenta y accesos viven en la barra inferior.
        <header className={cn("z-50 bg-background transition-shadow duration-300 lg:sticky lg:top-0 lg:border-b lg:bg-background/90 lg:backdrop-blur", scrolled && "lg:bg-background/95 lg:shadow-[0_6px_20px_-12px_rgb(11_43_42/0.35)]")}>
            <div className={cn("container mx-auto flex h-14 items-center justify-center gap-2 px-4 transition-[height] duration-300 lg:justify-between xl:gap-4", scrolled ? "lg:h-12" : "lg:h-16")}>
                <Link href="/" aria-label="Busco mi mascota, inicio"><BrandMark showName nameClassName="lg:hidden" symbolClassName={scrolled ? "lg:h-8" : undefined} /></Link>

                <nav aria-label="Principal" className="hidden items-center gap-1 lg:flex">
                    {LINKS.map((l) => (
                        <Link
                            key={l.href}
                            href={l.href}
                            aria-current={pathname === l.href ? "page" : undefined}
                            className={cn(
                                "whitespace-nowrap rounded-full px-2 text-sm font-medium text-muted-foreground transition-all duration-300 hover:bg-accent hover:text-accent-foreground xl:px-4", scrolled ? "py-1" : "py-2",
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
                        className={cn("rounded-full transition-all duration-300", scrolled && "h-9 px-4")}
                    />
                    <UserNav />
                </div>
            </div>
        </header>
    )
}
