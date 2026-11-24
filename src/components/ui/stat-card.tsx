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
            <span className={cn("mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-2xl sm:mx-0 sm:mb-4 sm:h-11 sm:w-11", tones[tone])}>
                <Icon className="h-5 w-5" aria-hidden />
            </span>
            <p className="text-2xl font-bold tracking-tight sm:text-3xl">{value}</p>
            <p className="text-xs font-medium leading-tight text-muted-foreground sm:text-sm">{label}</p>
            {hint && <p className="mt-1 hidden text-xs text-muted-foreground sm:block">{hint}</p>}
        </>
    )
    const cls = "block rounded-3xl border bg-card p-3 text-center shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-lift)] sm:p-5 sm:text-left"
    return href ? <Link href={href} className={cls}>{body}</Link> : <div className={cls}>{body}</div>
}
