"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Plus, Menu, X } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { ReportActionButton } from "@/components/report-action-button"
import { UserNav } from "@/components/user-nav"
import { cn } from "@/lib/utils"

const LINKS = [
    { href: "/", label: "Inicio" },
    { href: "/mascotas", label: "Buscar mascota" },
    { href: "/promocionar", label: "Difundir" },
    { href: "/contacto", label: "Contacto" },
]

export function Navbar() {
    const [open, setOpen] = useState(false)
    const pathname = usePathname()

    // El dashboard y el admin traen su propia navegación.
    if (pathname.startsWith("/dashboard") || pathname.startsWith("/admin")) return null

    const reportButton = (className?: string) => (
        <ReportActionButton
            nextUrl="/reportar"
            label="Reportar mascota"
            icon={<Plus className="mr-2 h-4 w-4" aria-hidden />}
            className={cn("rounded-full bg-cta text-cta-foreground font-semibold hover:bg-cta/90", className)}
        />
    )

    return (
        <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <Link href="/" className="flex items-center gap-3" aria-label="Busco mi mascota, inicio">
                    <Image src="/logo_symbol.svg" alt="" width={36} height={36} className="h-9 w-9" priority unoptimized />
                    <span className="hidden whitespace-nowrap text-lg font-extrabold tracking-tight text-foreground lg:block">
                        Busco mi mascota
                    </span>
                </Link>

                <nav aria-label="Principal" className="hidden items-center gap-1 md:flex">
                    {LINKS.map((l) => (
                        <Link
                            key={l.href}
                            href={l.href}
                            aria-current={pathname === l.href ? "page" : undefined}
                            className={cn(
                                "rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
                                pathname === l.href && "bg-accent text-accent-foreground"
                            )}
                        >
                            {l.label}
                        </Link>
                    ))}
                </nav>

                <div className="hidden items-center gap-3 md:flex">
                    {reportButton()}
                    <UserNav />
                </div>

                <div className="flex items-center gap-2 md:hidden">
                    <UserNav />
                    <Button
                        variant="ghost"
                        size="icon"
                        aria-expanded={open}
                        aria-controls="menu-movil"
                        aria-label={open ? "Cerrar menú" : "Abrir menú"}
                        onClick={() => setOpen(!open)}
                    >
                        {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </Button>
                </div>
            </div>

            {open && (
                <div id="menu-movil" className="space-y-4 border-t bg-background p-4 md:hidden">
                    <nav aria-label="Principal móvil" className="flex flex-col">
                        {LINKS.map((l) => (
                            <Link
                                key={l.href}
                                href={l.href}
                                aria-current={pathname === l.href ? "page" : undefined}
                                onClick={() => setOpen(false)}
                                className="rounded-lg px-3 py-3 text-base font-medium text-foreground hover:bg-accent"
                            >
                                {l.label}
                            </Link>
                        ))}
                    </nav>
                    {reportButton("h-12 w-full")}
                </div>
            )}
        </header>
    )
}
