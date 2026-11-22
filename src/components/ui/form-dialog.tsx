"use client"

import { useCallback, useEffect, useRef, useState, type ElementType, type ReactNode } from "react"
import { CheckCircle2, X } from "lucide-react"
import { Button, type ButtonProps } from "@/components/ui/button"

export type FormDetail = Record<string, string | undefined>
const EVENT = "bmm:open-form"

// Botón (o tarjeta) que abre un formulario. Las páginas solo muestran estos botones; el formulario vive en el modal.
export function OpenFormButton({ form, detail, plain, children, className, ...props }: { form: string; detail?: FormDetail; plain?: boolean } & ButtonProps) {
    const open = () => window.dispatchEvent(new CustomEvent(EVENT, { detail: { form, ...detail } }))
    if (plain) return <button type="button" onClick={open} aria-haspopup="dialog" className={className}>{children}</button>
    return <Button type="button" onClick={open} aria-haspopup="dialog" className={className} {...props}>{children}</Button>
}

type Props = {
    id: string
    icon: ElementType
    title: string
    intro: string
    points: string[]
    openOnLoad?: FormDetail // si se indica, el modal se abre solo al cargar la página con esos datos
    children: (detail: FormDetail, close: () => void) => ReactNode
}

// Modal grande para formularios: panel de información a la izquierda (escritorio) y el formulario a la derecha.
// En móvil es una hoja que sube desde abajo. Cada apertura monta el formulario desde cero.
export function FormDialog({ id, icon: Icon, title, intro, points, openOnLoad, children }: Props) {
    const dialog = useRef<HTMLDialogElement>(null)
    const [detail, setDetail] = useState<FormDetail>({})
    const [run, setRun] = useState(0)

    const open = useCallback((d: FormDetail) => {
        setDetail(d)
        setRun((n) => n + 1)
        dialog.current?.showModal()
    }, [])
    // Se cierra por id (no por ref) para poder entregarlo a quien dibuja el formulario sin leer refs durante el render.
    const close = useCallback(() => (document.getElementById(`${id}-dialog`) as HTMLDialogElement | null)?.close(), [id])

    useEffect(() => {
        const onOpen = (e: Event) => {
            const d = (e as CustomEvent<FormDetail>).detail
            if (d?.form === id) open(d)
        }
        window.addEventListener(EVENT, onOpen)
        const t = openOnLoad ? setTimeout(() => open(openOnLoad), 350) : undefined
        return () => { window.removeEventListener(EVENT, onOpen); if (t) clearTimeout(t) }
        // eslint-disable-next-line react-hooks/exhaustive-deps -- solo al montar
    }, [id, open])

    return (
        <dialog
            ref={dialog}
            id={`${id}-dialog`}
            aria-labelledby={`${id}-title`}
            onClick={(e) => { if (e.target === dialog.current) close() }}
            className="fixed inset-x-0 bottom-0 top-auto m-0 max-h-[94dvh] w-full max-w-none overflow-hidden rounded-t-3xl bg-card p-0 text-foreground shadow-[var(--shadow-lift)] backdrop:bg-black/50 backdrop:backdrop-blur-sm sm:inset-0 sm:m-auto sm:h-fit sm:max-h-[90dvh] sm:max-w-4xl sm:rounded-3xl"
        >
            <div className="grid max-h-[94dvh] md:grid-cols-[2fr_3fr] sm:max-h-[90dvh]">
                <aside className="relative hidden flex-col justify-between gap-8 overflow-hidden bg-primary p-8 text-primary-foreground md:flex">
                    <div aria-hidden className="paws-white pointer-events-none absolute inset-0 opacity-[0.07]" />
                    <div className="relative space-y-4">
                        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15"><Icon className="h-7 w-7" aria-hidden /></span>
                        <h2 id={`${id}-title`} className="font-display text-3xl leading-tight">{title}</h2>
                        <p className="text-sm text-primary-foreground/90">{intro}</p>
                    </div>
                    <ul className="relative space-y-3 text-sm">
                        {points.map((p) => <li key={p} className="flex gap-2.5"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-orange-200" aria-hidden /> <span>{p}</span></li>)}
                    </ul>
                </aside>

                <div className="flex min-h-0 flex-col">
                    <div className="flex items-start justify-between gap-3 border-b px-5 py-4 md:hidden">
                        <div className="flex items-center gap-3">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground"><Icon className="h-5 w-5" aria-hidden /></span>
                            <div><h2 className="font-display text-xl leading-tight text-primary">{title}</h2><p className="text-xs text-muted-foreground">{intro}</p></div>
                        </div>
                    </div>
                    <button type="button" onClick={close} aria-label="Cerrar formulario" className="absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-all hover:rotate-90 hover:bg-secondary hover:text-foreground active:scale-90">
                        <X className="h-5 w-5" aria-hidden />
                    </button>
                    <div className="min-h-0 flex-1 overflow-y-auto p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:p-8">
                        <div key={run}>{children(detail, close)}</div>
                    </div>
                </div>
            </div>
        </dialog>
    )
}
