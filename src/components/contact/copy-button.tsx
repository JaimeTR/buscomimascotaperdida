"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"

// Copia un texto (ej. un número de Yape) y confirma con un cambio de icono.
export function CopyButton({ text, label }: { text: string; label: string }) {
    const [ok, setOk] = useState(false)
    return (
        <button
            type="button"
            aria-label={`Copiar ${label}`}
            onClick={async () => { try { await navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 1800) } catch { /* sin permiso de portapapeles */ } }}
            className="inline-flex h-10 items-center gap-2 rounded-full border bg-card px-4 text-sm font-semibold transition-all hover:-translate-y-0.5 hover:bg-accent active:scale-95"
        >
            {ok ? <Check className="h-4 w-4 text-primary" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />} {ok ? "Copiado" : "Copiar"}
        </button>
    )
}
