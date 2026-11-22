"use client"

import { useCallback, useRef, useState } from "react"
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react"
import { StatusBadge } from "@/components/status-badge"
import { cn } from "@/lib/utils"

// Galería del reporte: foto principal con flechas (siempre visibles en pantallas táctiles), deslizar con el dedo,
// contador, miniaturas y vista ampliada. Las flechas del teclado también funcionan.
export function PetGallery({ images, petName, status }: { images: string[]; petName: string; status: string }) {
    const gallery = images.length > 0 ? images : ["/img/sin-foto.svg"]
    const [index, setIndex] = useState(0)
    const zoom = useRef<HTMLDialogElement>(null)
    const touchX = useRef<number | null>(null)
    const many = gallery.length > 1

    const go = useCallback((d: number) => setIndex((i) => (i + d + gallery.length) % gallery.length), [gallery.length])

    return (
        <div className="space-y-3">
            <div
                className="group relative aspect-[4/3] w-full touch-pan-y overflow-hidden rounded-[1.5rem] border bg-secondary shadow-[var(--shadow-lift)] outline-none sm:rounded-[2rem]"
                tabIndex={0}
                aria-roledescription="carrusel"
                aria-label={`Fotos de ${petName}`}
                onKeyDown={(e) => { if (e.key === "ArrowLeft") go(-1); if (e.key === "ArrowRight") go(1) }}
                onTouchStart={(e) => { touchX.current = e.touches[0].clientX }}
                onTouchEnd={(e) => {
                    if (touchX.current == null) return
                    const dx = e.changedTouches[0].clientX - touchX.current
                    touchX.current = null
                    if (Math.abs(dx) > 40 && many) go(dx < 0 ? 1 : -1)
                }}
            >
                <img key={index} src={gallery[index]} alt={`${petName}, foto ${index + 1} de ${gallery.length}`} className="h-full w-full object-cover animate-in fade-in duration-300 transition-transform duration-700 group-hover:scale-105" />

                <StatusBadge status={status} className="absolute left-4 top-4 px-4 py-1.5 text-xs shadow-lg sm:left-5 sm:top-5" />

                <button type="button" onClick={() => zoom.current?.showModal()} aria-label="Ver foto ampliada" className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur transition-all hover:scale-110 hover:bg-black/70 active:scale-95 sm:right-5 sm:top-5">
                    <Expand className="h-5 w-5" aria-hidden />
                </button>

                {many && (
                    <>
                        <button type="button" onClick={() => go(-1)} aria-label="Foto anterior" className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-foreground shadow-lg transition-all hover:scale-110 active:scale-95 lg:opacity-0 lg:group-hover:opacity-100">
                            <ChevronLeft className="h-6 w-6" aria-hidden />
                        </button>
                        <button type="button" onClick={() => go(1)} aria-label="Foto siguiente" className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-foreground shadow-lg transition-all hover:scale-110 active:scale-95 lg:opacity-0 lg:group-hover:opacity-100">
                            <ChevronRight className="h-6 w-6" aria-hidden />
                        </button>
                        <span className="absolute bottom-4 right-4 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white backdrop-blur" aria-live="polite">{index + 1} / {gallery.length}</span>
                    </>
                )}
            </div>

            {many && (
                <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {gallery.map((url, i) => (
                        <button
                            key={url + i}
                            type="button"
                            onClick={() => setIndex(i)}
                            aria-label={`Ver foto ${i + 1}`}
                            aria-current={i === index}
                            className={cn("h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-200 sm:h-20 sm:w-20", i === index ? "border-primary shadow-md" : "border-transparent opacity-70 hover:-translate-y-0.5 hover:opacity-100")}
                        >
                            <img src={url} alt="" className="h-full w-full object-cover" />
                        </button>
                    ))}
                </div>
            )}

            <dialog
                ref={zoom}
                aria-label={`Foto ampliada de ${petName}`}
                onClick={(e) => { if (e.target === zoom.current) zoom.current?.close() }}
                className="fixed inset-0 m-auto h-[92dvh] w-[96vw] max-w-none rounded-2xl bg-transparent p-0 backdrop:bg-black/85 open:flex open:items-center open:justify-center"
            >
                <img src={gallery[index]} alt={petName} className="max-h-full max-w-full rounded-2xl object-contain" />
                <button type="button" onClick={() => zoom.current?.close()} aria-label="Cerrar" className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-foreground shadow-lg transition-all hover:rotate-90 active:scale-95"><X className="h-5 w-5" aria-hidden /></button>
                {many && (
                    <>
                        <button type="button" onClick={() => go(-1)} aria-label="Foto anterior" className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-lg"><ChevronLeft className="h-6 w-6" aria-hidden /></button>
                        <button type="button" onClick={() => go(1)} aria-label="Foto siguiente" className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-lg"><ChevronRight className="h-6 w-6" aria-hidden /></button>
                    </>
                )}
            </dialog>
        </div>
    )
}
