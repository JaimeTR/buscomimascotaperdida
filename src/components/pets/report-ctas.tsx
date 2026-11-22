"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Bell, Camera, FileText, HandHeart, PawPrint, UserPlus, X } from "lucide-react"

import { ReportActionButton } from "@/components/report-action-button"
import { STOCK } from "@/lib/stock-images"

export type ReportCtaVariant = "aviso" | "pasos" | "seccion"

// 1) Aviso: franja delgada, no estorba la lectura de la lista.
function Aviso() {
    return (
        <div className="flex flex-col items-start gap-4 rounded-2xl border border-orange-200 bg-orange-50 p-4 sm:flex-row sm:items-center sm:p-5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-800"><Bell className="h-5 w-5" aria-hidden /></span>
            <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground">¿Perdiste o encontraste una mascota?</p>
                <p className="text-sm text-muted-foreground">Publícala gratis en minutos y avisamos a las personas de tu zona.</p>
            </div>
            <ReportActionButton nextUrl="/reportar" label="Reportar ahora" icon={<PawPrint className="mr-2 h-4 w-4" aria-hidden />} variant="cta" className="w-full rounded-full sm:w-auto" />
        </div>
    )
}

// 2) Dentro de la página: explica los pasos con una foto.
function Pasos() {
    return (
        <div className="grid overflow-hidden rounded-[2rem] border bg-card shadow-[var(--shadow-soft)] md:grid-cols-[2fr_3fr]">
            <div className="relative hidden min-h-48 md:block">
                <Image src={STOCK.perritoDuena.src} alt={STOCK.perritoDuena.alt} fill sizes="(min-width: 768px) 30vw, 0px" className="object-cover" />
            </div>
            <div className="space-y-5 p-6 md:p-8">
                <h2 className="font-display text-2xl leading-tight text-primary">Reportar una mascota es muy fácil</h2>
                <ol className="space-y-3 text-sm">
                    {[
                        [UserPlus, "Crea tu cuenta", "Para gestionar tus reportes y recibir avisos."],
                        [FileText, "Completa el formulario", "Cuéntanos cómo es y dónde la viste por última vez."],
                        [Camera, "Sube fotos", "Con una buena foto la reconocen mucho más rápido."],
                    ].map(([Icon, t, d], i) => {
                        const I = Icon as typeof UserPlus
                        return (
                            <li key={i} className="flex gap-3">
                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-primary"><I className="h-4 w-4" aria-hidden /></span>
                                <span><span className="block font-semibold">{t as string}</span><span className="text-muted-foreground">{d as string}</span></span>
                            </li>
                        )
                    })}
                </ol>
                <ReportActionButton nextUrl="/reportar" label="Reportar mascota" icon={<PawPrint className="mr-2 h-5 w-5" aria-hidden />} variant="cta" size="lg" className="w-full rounded-full sm:w-auto" />
            </div>
        </div>
    )
}

// 3) Sección CTA: bloque de color de marca, el más llamativo.
function Seccion() {
    return (
        <div className="relative overflow-hidden rounded-[2rem] bg-primary px-6 py-10 text-center text-primary-foreground md:py-14">
            <div aria-hidden className="paws-white pointer-events-none absolute inset-0 opacity-[0.07]" />
            <div className="relative mx-auto max-w-xl space-y-4">
                <PawPrint className="mx-auto h-9 w-9 text-orange-200" aria-hidden />
                <h2 className="font-display text-3xl leading-tight md:text-4xl">Cada reporte puede traer a una mascota de vuelta a casa</h2>
                <p className="text-primary-foreground/90">Publica en minutos. Es gratis y lo ve toda la comunidad.</p>
                <div className="flex flex-col justify-center gap-3 pt-2 sm:flex-row">
                    <ReportActionButton nextUrl="/reportar" label="Perdí a mi mascota" icon={<PawPrint className="mr-2 h-5 w-5" aria-hidden />} variant="cta" size="lg" className="rounded-full" />
                    <ReportActionButton nextUrl="/reportar?tipo=encontrada" label="Encontré una mascota" icon={<HandHeart className="mr-2 h-5 w-5" aria-hidden />} variant="outline" size="lg" className="rounded-full border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white" />
                </div>
            </div>
        </div>
    )
}

export function ReportCta({ variant }: { variant: ReportCtaVariant }) {
    return variant === "aviso" ? <Aviso /> : variant === "pasos" ? <Pasos /> : <Seccion />
}

// 4) Ventana flotante: aparece una vez por sesión cuando la persona ya recorrió una parte de la lista.
export function ReportPopup({ active }: { active: boolean }) {
    const [closed, setClosed] = useState(true)
    useEffect(() => {
        const t = setTimeout(() => { try { setClosed(sessionStorage.getItem("bmm.reportPopup") === "1") } catch { setClosed(false) } }, 0)
        return () => clearTimeout(t)
    }, [])
    if (!active || closed) return null

    const close = () => { setClosed(true); try { sessionStorage.setItem("bmm.reportPopup", "1") } catch { /* sin storage */ } }
    return (
        <div role="dialog" aria-label="Reportar una mascota" className="fixed inset-x-4 bottom-24 z-40 mx-auto max-w-sm rounded-3xl border bg-card p-5 shadow-[var(--shadow-lift)] duration-300 animate-in fade-in slide-in-from-bottom-4 lg:inset-x-auto lg:bottom-28 lg:right-6 lg:mx-0">
            <button onClick={close} aria-label="Cerrar" className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary"><X className="h-4 w-4" aria-hidden /></button>
            <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-100 text-orange-800"><PawPrint className="h-5 w-5" aria-hidden /></span>
            <p className="pr-6 font-display text-lg leading-tight text-primary">¿Perdiste o encontraste una mascota?</p>
            <p className="mt-1 text-sm text-muted-foreground">Publícala gratis y avisamos a tu zona.</p>
            <ReportActionButton nextUrl="/reportar" label="Reportar ahora" icon={<PawPrint className="mr-2 h-4 w-4" aria-hidden />} variant="cta" className="mt-4 w-full rounded-full" />
        </div>
    )
}
