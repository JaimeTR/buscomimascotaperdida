"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/toast-modern"
import { deleteAccountAction } from "@/app/dashboard/settings/delete-account"

const DELETE_CONFIRM_WORD = "ELIMINAR"

// Derecho de cancelación (Ley 29733): borra cuenta, reportes y fotos. Pide escribir ELIMINAR para evitar clics accidentales.
export function DeleteAccountCard() {
    const router = useRouter()
    const { toast } = useToast()
    const [open, setOpen] = useState(false)
    const [word, setWord] = useState("")
    const [busy, setBusy] = useState(false)

    const submit = async () => {
        setBusy(true)
        try {
            const r = await deleteAccountAction(word)
            if (r.error) { toast(r.error, { type: "error" }); return }
            try { localStorage.removeItem("bmm.me"); localStorage.removeItem("bmm.email") } catch { /* sin storage */ }
            toast("Tu cuenta y tus datos fueron eliminados.", { type: "success" })
            router.push("/")
            router.refresh()
        } catch {
            toast("No pudimos eliminar tu cuenta. Inténtalo de nuevo.", { type: "error" })
        } finally {
            setBusy(false)
        }
    }

    return (
        <Card className="border-destructive/40 shadow-sm">
            <CardHeader>
                <CardTitle className="text-destructive">Eliminar mi cuenta</CardTitle>
                <CardDescription>Borra para siempre tu perfil, tus reportes, avistamientos, fotos y alertas. No se puede deshacer.</CardDescription>
            </CardHeader>
            <CardContent>
                {!open ? (
                    <Button type="button" variant="outline" className="border-destructive/50 text-destructive hover:bg-destructive/10" onClick={() => setOpen(true)}>
                        <Trash2 className="mr-2 h-4 w-4" aria-hidden /> Eliminar mi cuenta
                    </Button>
                ) : (
                    <div className="space-y-3">
                        <label htmlFor="delete-confirm" className="text-sm font-medium">Escribe <strong>{DELETE_CONFIRM_WORD}</strong> para confirmar</label>
                        <Input id="delete-confirm" value={word} onChange={(e) => setWord(e.target.value)} autoComplete="off" className="max-w-xs" />
                        <div className="flex gap-2">
                            <Button type="button" variant="destructive" disabled={busy || word.trim().toUpperCase() !== DELETE_CONFIRM_WORD} onClick={submit} aria-busy={busy}>
                                {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />} Eliminar definitivamente
                            </Button>
                            <Button type="button" variant="ghost" disabled={busy} onClick={() => { setOpen(false); setWord("") }}>Cancelar</Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
