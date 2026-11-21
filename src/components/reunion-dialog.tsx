"use client"

import { useEffect, useRef, useState } from "react"
import { Camera, Loader2, PartyPopper, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/toast-modern"
import { getImageUploadError } from "@/lib/image-upload"
import { createClient } from "@/utils/supabase/client"

const MAX_PHOTOS = 3
const MAX_STORY = 1500

// "¡Ya apareció!": marca el caso como reunido y recoge la foto del reencuentro y el relato para la página de casos de éxito.
export function ReunionDialog({ pet, onClose, onDone }: { pet: { id: string; name: string | null }; onClose: () => void; onDone: () => void }) {
    const { toast } = useToast()
    const [supabase] = useState(() => createClient())
    const [files, setFiles] = useState<{ file: File; url: string }[]>([])
    const [story, setStory] = useState("")
    const [publish, setPublish] = useState(true)
    const [busy, setBusy] = useState(false)
    const filesRef = useRef(files)
    useEffect(() => { filesRef.current = files }, [files])
    useEffect(() => () => filesRef.current.forEach((f) => URL.revokeObjectURL(f.url)), [])
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && !busy) onClose() }
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [busy, onClose])

    const name = pet.name || "tu mascota"

    const addFiles = (list: FileList | null) => {
        const picked = Array.from(list ?? []).slice(0, MAX_PHOTOS - files.length)
        const bad = picked.map(getImageUploadError).find(Boolean)
        if (bad) return toast(bad, { type: "error" })
        setFiles((prev) => [...prev, ...picked.map((file) => ({ file, url: URL.createObjectURL(file) }))])
    }

    const submit = async () => {
        setBusy(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("no-session")

            const urls: string[] = []
            for (const { file } of files) {
                const ext = file.name.split(".").pop()?.toLowerCase() || "jpg"
                const path = `${user.id}/reunion-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
                const { error } = await supabase.storage.from("pet-images").upload(path, file, { contentType: file.type })
                if (error) throw error
                urls.push(supabase.storage.from("pet-images").getPublicUrl(path).data.publicUrl)
            }

            const { error } = await supabase.from("pets").update({
                status: "reunited",
                reunion_story: story.trim() || null,
                reunion_images: urls.length ? urls : null,
                reunion_public: publish,
            }).eq("id", pet.id).eq("owner_id", user.id)
            if (error) throw error

            toast(publish ? "¡Qué alegría! Tu historia ya está en Casos de éxito." : "¡Qué alegría! Marcamos el caso como reunido.", { type: "success" })
            onDone()
        } catch {
            toast("No pudimos guardar el reencuentro. Inténtalo de nuevo.", { type: "error" })
        } finally {
            setBusy(false)
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="reunion-title">
            <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-card p-6 shadow-2xl sm:rounded-3xl sm:p-8">
                <div className="mb-5 flex items-start justify-between gap-3">
                    <div className="space-y-1.5">
                        <PartyPopper className="h-8 w-8 text-cta" aria-hidden />
                        <h2 id="reunion-title" className="font-display text-3xl text-primary">¡{name} volvió a casa!</h2>
                        <p className="text-sm text-muted-foreground">Cuéntanos cómo fue: tu historia da esperanza a quien sigue buscando. Todo esto es opcional.</p>
                    </div>
                    <button type="button" onClick={onClose} disabled={busy} aria-label="Cerrar" className="-mr-2 -mt-2 flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground hover:bg-accent"><X className="h-5 w-5" aria-hidden /></button>
                </div>

                <div className="space-y-5">
                    <div>
                        <p className="mb-2 text-sm font-semibold">Foto del reencuentro</p>
                        <div className="flex flex-wrap gap-3">
                            {files.map((f, i) => (
                                <div key={f.url} className="relative h-24 w-24 overflow-hidden rounded-xl border">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={f.url} alt={`Foto ${i + 1} del reencuentro`} className="h-full w-full object-cover" />
                                    <button type="button" onClick={() => { URL.revokeObjectURL(f.url); setFiles((p) => p.filter((x) => x !== f)) }} aria-label="Quitar foto" className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white"><X className="h-4 w-4" aria-hidden /></button>
                                </div>
                            ))}
                            {files.length < MAX_PHOTOS && (
                                <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed text-xs font-medium text-muted-foreground hover:border-primary hover:text-primary">
                                    <Camera className="h-6 w-6" aria-hidden /> Agregar
                                    <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" onChange={(e) => { addFiles(e.target.files); e.target.value = "" }} />
                                </label>
                            )}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="reunion-story" className="text-sm font-semibold">¿Cómo apareció?</label>
                        <Textarea id="reunion-story" value={story} onChange={(e) => setStory(e.target.value.slice(0, MAX_STORY))} rows={5} placeholder={`Quién la vio, dónde, cuánto tardó… cualquier detalle que ayude a otros.`} />
                        <p className="text-right text-xs text-muted-foreground">{story.length}/{MAX_STORY}</p>
                    </div>

                    <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-muted/50 p-4 text-sm">
                        <input type="checkbox" checked={publish} onChange={(e) => setPublish(e.target.checked)} className="mt-0.5 h-5 w-5 accent-[var(--primary)]" />
                        <span>Publicar en <strong>Casos de éxito</strong>. Se mostrarán las fotos, el relato y el recorrido del caso, sin tus datos de contacto.</span>
                    </label>
                </div>

                <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <Button type="button" variant="ghost" onClick={onClose} disabled={busy}>Cancelar</Button>
                    <Button type="button" variant="cta" onClick={submit} disabled={busy} aria-busy={busy} className="h-11">
                        {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />} Marcar como reunido
                    </Button>
                </div>
            </div>
        </div>
    )
}
