"use client"

import Link from "next/link"
import { Search, Plus, PawPrint, Menu } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ReportActionButton } from "@/components/report-action-button"
import { UserNav } from "@/components/user-nav"

export function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    return (
        <header className="border-b bg-white sticky top-0 z-50">
            <div className="container mx-auto px-4 h-20 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 md:gap-3 group">
                    <img
                        src="/logo_symbol.png"
                        alt="Logo"
                        className="h-12 md:h-10 w-auto object-contain transition-transform group-hover:scale-110"
                    />
                    {/* Desktop Text */}
                    <div className="flex flex-col hidden md:flex">
                        <span className="text-lg font-black text-slate-900 leading-none tracking-tighter">Encuentra tu mascota</span>
                        <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest hidden lg:block">Red de ayuda comunitaria</span>
                    </div>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
                    <Link href="/" className="hover:text-blue-600 transition-colors">Inicio</Link>
                    <Link href="/mascotas" className="hover:text-blue-600 transition-colors">Buscar Mascota</Link>
                    <Link href="/contacto" className="hover:text-blue-600 transition-colors">Voluntariado y Contacto</Link>
                </nav>

                {/* Right Actions - Desktop */}
                <div className="hidden md:flex items-center gap-4">
                    <ReportActionButton
                        nextUrl="/reportar"
                        label="Reportar Mascota"
                        icon={<Plus className="mr-2 h-4 w-4" />}
                        className="rounded-full bg-blue-500 hover:bg-blue-600 text-white font-semibold shadow-md shadow-blue-500/20"
                    />

                    <UserNav />
                </div>

                {/* Mobile Menu Button */}
                <div className="md:hidden flex items-center gap-3">
                    <UserNav />
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="rounded-lg"
                    >
                        <Menu className="h-6 w-6" />
                    </Button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden border-t bg-white p-4 space-y-4">
                    <nav className="flex flex-col gap-3 text-sm font-medium text-slate-600">
                        <Link href="/" className="hover:text-blue-600 transition-colors py-2">Inicio</Link>
                        <Link href="/mascotas" className="hover:text-blue-600 transition-colors py-2">Buscar Mascota</Link>
                        <Link href="/contacto" className="hover:text-blue-600 transition-colors py-2">Voluntariado y Contacto</Link>
                    </nav>
                    <div className="pt-4 border-t space-y-3 flex flex-col gap-2">
                        <ReportActionButton
                            nextUrl="/reportar"
                            label="Reportar Mascota"
                            icon={<Plus className="mr-2 h-4 w-4" />}
                            className="rounded-full bg-blue-500 hover:bg-blue-600 text-white font-semibold shadow-md shadow-blue-500/20 w-full"
                        />
                        <UserNav />
                    </div>
                </div>
            )}
        </header>
    )
}
