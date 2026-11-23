"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, Loader2, Rocket, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FormDialog } from "@/components/ui/form-dialog"
import { BoostFields, EMPTY_BOOST, boostAmount, submitBoost, type BoostValue } from "@/components/boost/boost-fields"
import { createClient } from "@/utils/supabase/client"

function BoostForm({ petId, onDone, onSubmitted }: { petId: string; onDone: () => void; onSubmitted?: () => void }) {
    const router = useRouter()
    const [value, setValue] = useState<BoostValue>(EMPTY_BOOST)
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState("")
    const [done, setDone] = useState(false)

    const submit = async () => {
        if (!boostAmount(value)) { setError("Elige o escribe un monto para destacar tu caso."); return }
        setBusy(true); setError("")
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { setError("Inicia sesión de nuevo."); setBusy(false); return }
        const res = await submitBoost(supabase, { petId, userId: user.id, value })
        setBusy(false)
        if (!res.ok) { setError(res.error); return }
        setDone(true)
        onSubmitted?.()
        router.refresh()
    }

    if (done) {
        return (
            <div role="status" className="space-y-3 py-8 text-center animate-in fade-in zoom-in-95 duration-300">
                <CheckCircle2 className="mx-auto h-14 w-14 text-primary" aria-hidden />
                <h3 className="font-display text-2xl text-primary">¡Gracias por apoyar!</h3>
                <p className="text-muted-foreground">Verificaremos tu aporte y tu caso aparecerá como destacado. Te avisamos al confirmarlo.</p>
                <Button variant="ghost" onClick={onDone}>Cerrar</Button>
            </div>
        )
    }
    return (
        <div className="space-y-5">
            <BoostFields value={value} onChange={setValue} />
            {error && <p role="alert" className="rounded-xl bg-destructive/10 p-3 text-sm font-medium text-destructive">{error}</p>}
            <Button type="button" variant="cta" size="lg" disabled={busy} onClick={submit} className="w-full rounded-full sm:w-auto">
                {busy ? <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden /> : <Send className="mr-2 h-5 w-5" aria-hidden />} Enviar aporte
            </Button>
        </div>
    )
}

// Modal "Destacar mi caso" para un reporte ya publicado (lo abre el dueño desde su reporte).
export function BoostDialog({ petId, onSubmitted }: { petId: string; onSubmitted?: () => void }) {
    return (
        <FormDialog
            id="impulso"
            icon={Rocket}
            title="Destaca tu caso"
            intro="Un aporte voluntario hace que más gente vea tu reporte."
            points={["El aporte es libre y voluntario.", "Los casos con más aporte salen primero.", "Aparecen en la portada y como aviso en otras páginas.", "El equipo verifica cada aporte."]}
        >
            {(_, close) => <BoostForm petId={petId} onDone={close} onSubmitted={onSubmitted} />}
        </FormDialog>
    )
}
