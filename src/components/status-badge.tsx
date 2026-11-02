import { cn } from "@/lib/utils"

export type ReportStatus = "lost" | "found" | "in_contact" | "reunited" | "paused" | "pending" | "closed"

const META: Record<ReportStatus, { label: string; cls: string }> = {
    lost: { label: "Perdido", cls: "bg-cta text-cta-foreground" },
    found: { label: "Encontrado", cls: "bg-success text-white" },
    in_contact: { label: "En contacto", cls: "bg-primary text-primary-foreground" },
    reunited: { label: "Reunido", cls: "bg-accent text-accent-foreground border border-primary/30" },
    paused: { label: "Pausado", cls: "bg-muted text-muted-foreground border" },
    pending: { label: "En revisión", cls: "bg-warning text-white" },
    closed: { label: "Cerrado", cls: "bg-muted text-muted-foreground border" },
}

export function statusLabel(status: string) {
    return (META[status as ReportStatus] ?? META.closed).label
}

// Estado siempre con texto (no solo color) para accesibilidad.
export function StatusBadge({ status, className }: { status: string; className?: string }) {
    const m = META[status as ReportStatus] ?? META.closed
    return (
        <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold", m.cls, className)}>
            {m.label}
        </span>
    )
}
