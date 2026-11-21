"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import QRCode from "qrcode"
import { toPng } from "html-to-image"
import { ArrowLeft, Check, Copy, Download, ImagePlus, Loader2, MessageCircle, Printer, Share2, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/toast-modern"
import { cn } from "@/lib/utils"
import { FORMATS, HEADLINES, TEMPLATES, type FormatId, type PosterState, type TemplateId } from "@/lib/poster"
import { Poster } from "./poster"

type Props = { petId: string; initial: PosterState; photos: string[]; fresh: boolean }

const toDataUrl = (blob: Blob) => new Promise<string>((res, rej) => {
    const r = new FileReader()
    r.onload = () => res(r.result as string)
    r.onerror = () => rej(r.error)
    r.readAsDataURL(blob)
})
// La foto remota pasa a data URL para que la exportación a PNG no falle por CORS.
const inline = async (url: string) => url.startsWith("data:") || !url ? url : toDataUrl(await (await fetch(url)).blob())

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return <label className="block space-y-1"><span className="text-xs font-semibold text-muted-foreground">{label}</span>{children}</label>
}

export function PosterStudio({ petId, initial, photos, fresh }: Props) {
    const { toast } = useToast()
    const [s, setS] = useState<PosterState>(initial)
    const [photo, setPhoto] = useState(initial.photo)
    const [qr, setQr] = useState("")
    const [busy, setBusy] = useState(false)
    const [copied, setCopied] = useState(false)
    const [scale, setScale] = useState(0.5)
    const posterRef = useRef<HTMLDivElement>(null)
    const boxRef = useRef<HTMLDivElement>(null)
    const set = useCallback(<K extends keyof PosterState>(k: K, v: PosterState[K]) => setS(p => ({ ...p, [k]: v })), [])
    const f = FORMATS[s.format]
    const url = typeof window === "undefined" ? "" : `${window.location.origin}/mascotas/${petId}`

    // Recupera los ajustes guardados de este reporte (la foto subida a mano no se guarda: pesa).
    const key = `cartel:${petId}`
    useEffect(() => {
        try {
            const saved = JSON.parse(localStorage.getItem(key) ?? "null")
            // eslint-disable-next-line react-hooks/set-state-in-effect -- lectura única de localStorage tras montar
            if (saved) setS(p => ({ ...p, ...saved, photo: p.photo }))
        } catch { /* sin almacenamiento: se usa el cartel por defecto */ }
    }, [key])
    useEffect(() => {
        try { localStorage.setItem(key, JSON.stringify({ ...s, photo: undefined })) } catch { /* idem */ }
    }, [key, s])

    // Foto en data URL y QR.
    useEffect(() => {
        let off = false
        inline(s.photo).then(d => { if (!off) setPhoto(d) }).catch(() => { if (!off) setPhoto(s.photo) })
        return () => { off = true }
    }, [s.photo])
    useEffect(() => {
        QRCode.toDataURL(url, { margin: 1, width: 400, errorCorrectionLevel: "M", color: { dark: "#0b2b2a", light: "#ffffff" } }).then(setQr).catch(() => setQr(""))
    }, [url])

    // Escala la vista previa al ancho disponible (y a un alto razonable).
    useEffect(() => {
        const el = boxRef.current
        if (!el) return
        const fit = () => setScale(Math.min(1, el.clientWidth / f.w, (window.innerHeight * 0.78) / f.h))
        fit()
        const ro = new ResizeObserver(fit)
        ro.observe(el)
        return () => ro.disconnect()
    }, [f.w, f.h])

    const png = async () => toPng(posterRef.current!, { pixelRatio: 2, cacheBust: true })
    const fileName = `cartel-${(s.name || "mascota").toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${s.format}.png`

    const run = async (fn: () => Promise<void>) => {
        setBusy(true)
        try { await fn() } catch (e) { console.error(e); toast("No se pudo generar la imagen. Intenta de nuevo.", { type: "error" }) } finally { setBusy(false) }
    }
    const download = () => run(async () => {
        const a = document.createElement("a")
        a.href = await png(); a.download = fileName; a.click()
    })
    const share = () => run(async () => {
        const text = `${s.headline}: ${s.name}${s.place ? " en " + s.place : ""}. Ayúdanos a difundir: ${url}`
        const file = new File([await (await fetch(await png())).blob()], fileName, { type: "image/png" })
        if (navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], text, title: s.headline })
        else window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener")
    })
    const copy = async () => { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1800) }
    const upload = (file?: File) => {
        if (!file || !file.type.startsWith("image/")) return
        if (file.size > 8 * 1024 * 1024) return toast("La foto pesa más de 8 MB", { type: "error" })
        toDataUrl(file).then(d => set("photo", d))
    }

    return (
        <div className="mx-auto max-w-7xl px-4 py-6 md:py-10">
            <Link href="/cartel" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline print:hidden"><ArrowLeft className="h-4 w-4" aria-hidden /> Mis carteles</Link>

            {fresh && (
                <div className="mt-4 flex items-start gap-3 rounded-2xl border border-primary/20 bg-accent p-4 text-accent-foreground print:hidden" role="status">
                    <Sparkles className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
                    <p className="text-sm"><strong>¡Tu reporte está publicado y tu cartel ya está listo!</strong> Imprímelo, descárgalo o compártelo ahora: mientras más rápido se difunde, más rápido aparece.</p>
                </div>
            )}

            <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px] print:hidden">
                {/* Vista previa + acciones */}
                <div className="space-y-4">
                    <div ref={boxRef} className="flex justify-center rounded-3xl border bg-secondary p-3 md:p-6">
                        <div style={{ width: f.w * scale, height: f.h * scale }} className="shadow-2xl">
                            <div style={{ width: f.w, height: f.h, transform: `scale(${scale})`, transformOrigin: "top left" }}>
                                <Poster ref={posterRef} state={s} photo={photo} qr={qr} />
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        <Button variant="cta" size="lg" onClick={() => window.print()} className="col-span-2 sm:col-span-1"><Printer className="mr-2 h-5 w-5" aria-hidden /> Imprimir / PDF</Button>
                        <Button size="lg" variant="outline" onClick={download} disabled={busy}>{busy ? <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden /> : <Download className="mr-2 h-5 w-5" aria-hidden />} Imagen PNG</Button>
                        <Button size="lg" variant="outline" onClick={share} disabled={busy}><Share2 className="mr-2 h-5 w-5" aria-hidden /> Compartir</Button>
                        <Button size="lg" variant="outline" onClick={copy}>{copied ? <Check className="mr-2 h-5 w-5" aria-hidden /> : <Copy className="mr-2 h-5 w-5" aria-hidden />} {copied ? "Copiado" : "Copiar enlace"}</Button>
                    </div>
                    <p className="text-xs text-muted-foreground">En el diálogo de impresión elige «Guardar como PDF» para obtener el archivo. Desactiva «Encabezados y pies de página» para un resultado limpio. Los cambios se guardan solos en este dispositivo.</p>
                </div>

                {/* Panel de edición */}
                <div className="rounded-3xl border bg-card p-4 md:p-5">
                    <Tabs defaultValue="diseno">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="diseno">Diseño</TabsTrigger>
                            <TabsTrigger value="textos">Textos</TabsTrigger>
                            <TabsTrigger value="foto">Foto</TabsTrigger>
                            <TabsTrigger value="contacto">Contacto</TabsTrigger>
                        </TabsList>

                        <TabsContent value="diseno" className="space-y-5 pt-4">
                            <div>
                                <p className="mb-2 text-sm font-semibold">Plantilla</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {(Object.keys(TEMPLATES) as TemplateId[]).map(id => (
                                        <button key={id} type="button" onClick={() => set("template", id)} aria-pressed={s.template === id}
                                            className={cn("flex items-center gap-3 rounded-xl border p-3 text-left transition", s.template === id ? "border-primary bg-accent ring-2 ring-primary" : "hover:bg-secondary")}>
                                            <span className="h-9 w-9 shrink-0 rounded-lg border" style={{ background: TEMPLATES[id].head }} aria-hidden />
                                            <span className="min-w-0"><span className="block text-sm font-semibold">{TEMPLATES[id].label}</span><span className="block truncate text-xs text-muted-foreground">{TEMPLATES[id].hint}</span></span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <p className="mb-2 text-sm font-semibold">Tamaño y formato</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {(Object.keys(FORMATS) as FormatId[]).map(id => (
                                        <button key={id} type="button" onClick={() => set("format", id)} aria-pressed={s.format === id}
                                            className={cn("rounded-xl border p-3 text-left transition", s.format === id ? "border-primary bg-accent ring-2 ring-primary" : "hover:bg-secondary")}>
                                            <span className="block text-sm font-semibold">{FORMATS[id].label}</span><span className="block text-xs text-muted-foreground">{FORMATS[id].hint}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="textos" className="space-y-4 pt-4">
                            <div>
                                <p className="mb-2 text-sm font-semibold">Titular</p>
                                <div className="mb-2 flex flex-wrap gap-1.5">
                                    {HEADLINES.map(h => <button key={h} type="button" onClick={() => set("headline", h)} className={cn("rounded-full border px-3 py-1 text-xs font-semibold", s.headline === h ? "border-primary bg-primary text-primary-foreground" : "hover:bg-secondary")}>{h}</button>)}
                                </div>
                                <Input value={s.headline} onChange={e => set("headline", e.target.value.toUpperCase())} maxLength={28} aria-label="Titular" />
                            </div>
                            <Field label="Nombre"><Input value={s.name} onChange={e => set("name", e.target.value)} maxLength={24} /></Field>
                            <Field label="Datos (raza, colores, tamaño)"><Input value={s.details} onChange={e => set("details", e.target.value)} maxLength={70} /></Field>
                            <Field label="Señas particulares o mensaje"><Input value={s.note} onChange={e => set("note", e.target.value)} maxLength={90} placeholder="Ej. Collar rojo, es muy dócil" /></Field>
                            <Field label="Zona / distrito"><Input value={s.place} onChange={e => set("place", e.target.value)} maxLength={60} /></Field>
                            <Field label="Calle o referencia"><Input value={s.reference} onChange={e => set("reference", e.target.value)} maxLength={70} /></Field>
                            <Field label="Recompensa (opcional)"><Input value={s.reward} onChange={e => set("reward", e.target.value)} maxLength={20} placeholder="Ej. S/ 500" /></Field>
                        </TabsContent>

                        <TabsContent value="foto" className="space-y-4 pt-4">
                            <p className="text-sm text-muted-foreground">Elige la foto del cartel. Una foto clara, de frente y con buena luz ayuda más.</p>
                            <div className="grid grid-cols-3 gap-2">
                                {photos.map(p => (
                                     
                                    <button key={p} type="button" onClick={() => set("photo", p)} aria-pressed={s.photo === p} className={cn("aspect-square overflow-hidden rounded-xl border-2", s.photo === p ? "border-primary ring-2 ring-primary" : "border-transparent")}><img src={p} alt="" className="h-full w-full object-cover" /></button>
                                ))}
                                <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed text-xs font-semibold text-muted-foreground hover:bg-secondary">
                                    <ImagePlus className="h-6 w-6" aria-hidden /> Subir foto
                                    <input type="file" accept="image/*" className="sr-only" onChange={e => upload(e.target.files?.[0])} />
                                </label>
                            </div>
                        </TabsContent>

                        <TabsContent value="contacto" className="space-y-4 pt-4">
                            <Field label="Teléfono"><Input value={s.phone} onChange={e => set("phone", e.target.value)} inputMode="tel" maxLength={20} placeholder="987 654 321" /></Field>
                            <Field label="WhatsApp (si es otro)"><Input value={s.whatsapp} onChange={e => set("whatsapp", e.target.value)} inputMode="tel" maxLength={20} /></Field>
                            <Field label="Instagram u otra red"><Input value={s.social} onChange={e => set("social", e.target.value)} maxLength={30} placeholder="@usuario" /></Field>
                            <p className="text-xs text-muted-foreground">Deja un campo vacío para ocultarlo. Sin teléfono, el cartel invita a escribir desde la web.</p>
                            <div className="flex items-center justify-between gap-3 rounded-xl border p-3"><div><p className="text-sm font-semibold">Código QR del reporte</p><p className="text-xs text-muted-foreground">Quien lo escanea ve la ficha y puede avisar.</p></div><Switch checked={s.qr} onCheckedChange={v => set("qr", v)} aria-label="Código QR" /></div>
                            <div className={cn("flex items-center justify-between gap-3 rounded-xl border p-3", !f.paper && "opacity-50")}><div><p className="text-sm font-semibold">Tiras recortables</p><p className="text-xs text-muted-foreground">Con el teléfono al pie, solo en papel vertical.</p></div><Switch checked={s.tabs} disabled={!f.paper || s.format === "half"} onCheckedChange={v => set("tabs", v)} aria-label="Tiras recortables" /></div>
                            <Button asChild variant="outline" className="w-full"><a href={`https://wa.me/?text=${encodeURIComponent(`${s.headline}: ${s.name}. ${url}`)}`} target="_blank" rel="noopener noreferrer"><MessageCircle className="mr-2 h-4 w-4" aria-hidden /> Enviar enlace por WhatsApp</a></Button>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            {/* Solo impresión: copias a tamaño real. */}
            <div id="print-root" className="hidden print:block">
                {Array.from({ length: f.copies }, (_, i) => <Poster key={i} state={s} photo={photo} qr={qr} />)}
            </div>
            <style>{`@media print{@page{size:${f.page ?? "A4 portrait"};margin:0}html,body{height:auto!important;overflow:hidden!important;background:#fff!important}body *{visibility:hidden}#print-root,#print-root *{visibility:visible;-webkit-print-color-adjust:exact;print-color-adjust:exact}#print-root{position:fixed;left:0;top:0}}`}</style>
        </div>
    )
}
