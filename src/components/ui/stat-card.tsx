import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

// Tarjeta de métrica: número grande, etiqueta y ícono en un tinte suave.
export function StatCard({ label, value, icon: Icon, href, tone = "teal", hint }: {
    label: string; value: number | string; icon: LucideIcon; href?: string; tone?: "teal" | "orange" | "green" | "amber"; hint?: string
}) {
    const tones = {
        teal: "bg-accent text-accent-foreground",
        orange: "bg-orange-100 text-orange-800",
        green: "bg-emerald-100 text-emerald-800",
        amber: "bg-amber-100 text-amber-800",
    }
    const body = (
        <>
            <span className={cn("mb-4 flex h-11 w-11 items-center justify-center rounded-2xl", tones[tone])}>
                <Icon className="h-5 w-5" aria-hidden />
            </span>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </>
    )
    const cls = "block rounded-3xl border bg-card p-5 shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-lift)]"
    return href ? <Link href={href} className={cls}>{body}</Link> : <div className={cls}>{body}</div>
}
