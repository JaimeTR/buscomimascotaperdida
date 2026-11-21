import Link from "next/link"
import Image from "next/image"
import { LayoutDashboard, Home, ShieldCheck } from "lucide-react"
import { requireAdmin } from "@/lib/admin"
import { AdminNav } from "@/components/admin/admin-nav"

export const metadata = { title: "Administración | Busco mi mascota", robots: { index: false, follow: false } }

// Marco de administración: barra lateral oscura en escritorio; barra superior con chips en móvil.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    await requireAdmin()

    return (
        <div className="min-h-screen bg-background lg:pl-64">
            <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-foreground p-5 text-background lg:flex">
                <Link href="/" aria-label="Ir al inicio">
                    <Image src="/brand/isologo-horizontal-blanco.svg" alt="Busco mi mascota" width={300} height={85} className="h-16 w-auto" unoptimized />
                </Link>
                <p className="mt-6 mb-2 flex items-center gap-2 px-4 font-display text-xs text-orange-300">
                    <ShieldCheck className="h-4 w-4" aria-hidden /> Administración
                </p>
                <div className="flex-1"><AdminNav variant="side" /></div>
                <div className="space-y-1 border-t border-white/15 pt-4 text-sm">
                    <Link href="/dashboard" className="flex items-center gap-3 rounded-2xl px-4 py-2.5 text-white/70 hover:bg-white/10 hover:text-white"><LayoutDashboard className="h-5 w-5" aria-hidden /> Mi dashboard</Link>
                    <Link href="/" className="flex items-center gap-3 rounded-2xl px-4 py-2.5 text-white/70 hover:bg-white/10 hover:text-white"><Home className="h-5 w-5" aria-hidden /> Ir a la web</Link>
                </div>
            </aside>

            <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-foreground px-4 text-background lg:hidden">
                <Link href="/" aria-label="Ir al inicio"><Image src="/brand/isologo-horizontal-blanco.svg" alt="Busco mi mascota" width={300} height={85} className="h-10 w-auto" unoptimized /></Link>
                <Link href="/dashboard" className="text-sm font-medium text-white/80">Mi dashboard</Link>
            </header>
            <AdminNav variant="top" />

            <main className="mx-auto max-w-6xl p-4 pb-12 md:p-8">{children}</main>
        </div>
    )
}
