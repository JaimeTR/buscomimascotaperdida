import type { ElementType, ReactNode } from "react"
import { cn } from "@/lib/utils"

// Campo con icono a la izquierda. El icono se tiñe de color de marca cuando el campo tiene el foco.
// Usar con un <input>/<select>/<textarea> que lleve `pl-11` (ver `iconFieldClass`).
export const iconFieldClass = "w-full rounded-xl border border-input bg-background pl-11 pr-4 text-sm outline-none transition-[box-shadow,border-color] duration-200 placeholder:text-muted-foreground hover:border-primary/40 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring"

export function IconField({ icon: Icon, multiline, className, children }: { icon: ElementType; multiline?: boolean; className?: string; children: ReactNode }) {
    return (
        <div className={cn("group/field relative", className)}>
            <Icon aria-hidden className={cn("pointer-events-none absolute left-4 z-10 h-5 w-5 text-muted-foreground transition-all duration-200 group-focus-within/field:scale-110 group-focus-within/field:text-primary", multiline ? "top-3.5" : "top-1/2 -translate-y-1/2")} />
            {children}
        </div>
    )
}
