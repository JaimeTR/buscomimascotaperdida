import Link from "next/link"
import { requireAdmin } from "@/lib/admin"

export const metadata = { title: "Administración | Busco mi mascota", robots: { index: false, follow: false } }

const NAV = [
    { href: "/admin", label: "Resumen" },
    { href: "/admin/reports", label: "Reportes" },
    { href: "/admin/users", label: "Usuarios" },
    { href: "/admin/audit", label: "Auditoría" },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    await requireAdmin()

    return (
        <div className="min-h-screen bg-background">
            <header className="border-b bg-card">
                <div className="container mx-auto flex flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
                    <Link href="/admin" className="font-extrabold">Admin · Busco mi mascota</Link>
                    <nav aria-label="Administración" className="flex flex-1 flex-wrap gap-1 text-sm font-medium">
                        {NAV.map((n) => (
                            <Link key={n.href} href={n.href} className="rounded-full px-3 py-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground">
                                {n.label}
                            </Link>
                        ))}
                    </nav>
                    <Link href="/dashboard" className="text-sm text-muted-foreground hover:underline">Salir del panel</Link>
                </div>
            </header>
            <main className="container mx-auto px-4 py-8">{children}</main>
        </div>
    )
}
