import type { LucideIcon } from "lucide-react"

// Estado vacío: ícono suave, titular, ayuda y (opcional) una acción.
export function EmptyState({ icon: Icon, title, text, children }: { icon: LucideIcon; title: string; text?: string; children?: React.ReactNode }) {
    return (
        <div className="rounded-3xl border border-dashed bg-card px-6 py-12 text-center">
            <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                <Icon className="h-7 w-7" aria-hidden />
            </span>
            <h2 className="text-lg font-semibold">{title}</h2>
            {text && <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">{text}</p>}
            {children && <div className="mt-5 flex justify-center gap-3">{children}</div>}
        </div>
    )
}
