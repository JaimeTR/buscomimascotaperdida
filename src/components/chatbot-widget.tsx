"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { X, Send, Sparkles, PawPrint, RotateCcw, MapPin, ArrowUpRight, Clock, Map as MapIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

type Filters = Partial<Record<"type" | "size" | "district" | "color" | "breed", string>>

interface ChatPet {
    id: string
    name: string | null
    type: string
    breed: string | null
    status: string
    district: string | null
    date: string
    image: string | null
    lat: number | null
    lng: number | null
}

// chip: `href` navega dentro del sitio; `filters` ajusta la búsqueda de la sesión; si no, se envía como mensaje.
interface Chip { label: string; filters?: Filters; href?: string }

interface Message {
    id: number
    role: "bot" | "user"
    content: string
    chips?: Chip[]
    pets?: ChatPet[]
    otherZones?: boolean
}

const STORAGE_KEY = "huellita.session.v1"
const TYPE_LABEL: Record<string, string> = { dog: "Perro", cat: "Gato", other: "Otro" }
const FILTER_LABEL: Record<string, Record<string, string>> = { type: TYPE_LABEL, size: { small: "Pequeño", medium: "Mediano", large: "Grande" } }
const STATUS_LABEL: Record<string, string> = { lost: "Perdido", found: "Encontrado", in_contact: "En contacto" }
const STATUS_STYLE: Record<string, string> = {
    lost: "bg-red-600 text-white",
    found: "bg-emerald-700 text-white",
    in_contact: "bg-amber-600 text-white",
}

const START_CHIPS: Chip[] = [
    { label: "Busco un perro", filters: { type: "dog" } },
    { label: "Busco un gato", filters: { type: "cat" } },
    { label: "Perdí a mi mascota", href: "/reportar" },
    { label: "Encontré una mascota", href: "/reportar?tipo=encontrada" },
]

const WELCOME: Message = {
    id: 0,
    role: "bot",
    content: "¡Hola! Soy Huellita 🐾 Busco mascotas perdidas o encontradas en nuestros reportes y te guío para publicar el tuyo. ¿Qué necesitas?",
    chips: START_CHIPS,
}

const filterText = (k: string, v: string) => FILTER_LABEL[k]?.[v] ?? v

function mapUrl(p: ChatPet) {
    return p.lat != null && p.lng != null
        ? `https://www.openstreetmap.org/?mlat=${p.lat}&mlon=${p.lng}#map=16/${p.lat}/${p.lng}`
        : `https://www.openstreetmap.org/search?query=${encodeURIComponent((p.district ?? "Lima") + ", Lima, Perú")}`
}

function PetCard({ pet, onOpen }: { pet: ChatPet; onOpen: (href: string) => void }) {
    const when = formatDistanceToNow(new Date(pet.date), { addSuffix: true, locale: es })
    return (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <button onClick={() => onOpen(`/mascotas/${pet.id}`)} className="group block w-full text-left" aria-label={`Ver reporte de ${pet.name ?? "mascota sin nombre"}`}>
                <div className="relative aspect-[16/10] bg-secondary">
                    { }
                    <img src={pet.image ?? "/img/sin-foto.svg"} alt={pet.name ? `Foto de ${pet.name}` : "Mascota sin foto"} loading="lazy" referrerPolicy="no-referrer" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    <span className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-[11px] font-bold ${STATUS_STYLE[pet.status] ?? "bg-secondary text-foreground"}`}>
                        {STATUS_LABEL[pet.status] ?? pet.status}
                    </span>
                </div>
                <div className="space-y-0.5 p-3 text-xs">
                    <p className="truncate text-sm font-bold text-foreground">{pet.name || "Sin nombre"}</p>
                    <p className="truncate text-muted-foreground">{[TYPE_LABEL[pet.type], pet.breed].filter(Boolean).join(" · ")}</p>
                    <p className="flex items-center gap-1 text-muted-foreground"><MapPin className="h-3 w-3 shrink-0" aria-hidden />{pet.district ?? "Zona no indicada"}</p>
                    <p className="flex items-center gap-1 text-muted-foreground"><Clock className="h-3 w-3 shrink-0" aria-hidden />{when}</p>
                </div>
            </button>
            <div className="flex border-t border-border text-xs font-semibold">
                <button onClick={() => onOpen(`/mascotas/${pet.id}`)} className="flex flex-1 items-center justify-center gap-1 py-2 text-primary hover:bg-accent">
                    Ver reporte <ArrowUpRight className="h-3 w-3" aria-hidden />
                </button>
                <a href={mapUrl(pet)} target="_blank" rel="noopener noreferrer" className="flex flex-1 items-center justify-center gap-1 border-l border-border py-2 text-muted-foreground hover:bg-accent hover:text-primary">
                    <MapIcon className="h-3 w-3" aria-hidden /> Ver zona
                </a>
            </div>
        </div>
    )
}

export function ChatbotWidget() {
    const router = useRouter()
    const idRef = useRef(1)
    const scrollRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const [isOpen, setIsOpen] = useState(false)
    const [input, setInput] = useState("")
    const [isTyping, setIsTyping] = useState(false)
    const [showPrompt, setShowPrompt] = useState(false)
    const [messages, setMessages] = useState<Message[]>([WELCOME])
    const [filters, setFilters] = useState<Filters>({})
    const [restored, setRestored] = useState(false)

    // Memoria de la sesión: la conversación y la búsqueda sobreviven a navegar y recargar (solo en esta pestaña).
    useEffect(() => {
        try {
            const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "null")
            if (saved?.messages?.length) {
                setMessages(saved.messages)
                setFilters(saved.filters ?? {})
                idRef.current = Math.max(...saved.messages.map((m: Message) => m.id)) + 1
            }
            if (!sessionStorage.getItem(STORAGE_KEY + ".teaser")) {
                const t = setTimeout(() => setShowPrompt(true), 4000)
                setRestored(true)
                return () => clearTimeout(t)
            }
        } catch { /* sin storage: funciona sin memoria */ }
        setRestored(true)
    }, [])

    useEffect(() => {
        if (!restored) return
        try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ messages: messages.slice(-30), filters })) } catch { /* cuota o modo privado */ }
    }, [messages, filters, restored])

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
    }, [messages, isTyping, isOpen])

    // La barra inferior móvil abre el asistente con este evento (no hay botón flotante en móvil).
    useEffect(() => {
        const onOpen = () => { setIsOpen(true); setShowPrompt(false) }
        window.addEventListener("bmm:open-chat", onOpen)
        return () => window.removeEventListener("bmm:open-chat", onOpen)
    }, [])

    useEffect(() => {
        if (!isOpen) return
        inputRef.current?.focus()
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && setIsOpen(false)
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [isOpen])

    const push = useCallback((m: Omit<Message, "id">) => {
        setMessages(prev => [...prev, { ...m, id: idRef.current++ }])
    }, [])

    const go = useCallback((href: string) => {
        router.push(href)
        if (window.matchMedia("(max-width: 1023px)").matches) setIsOpen(false) // en móvil el chat tapa la página
    }, [router])

    const send = useCallback(async (raw: string, memory: Filters = filters) => {
        const text = raw.trim().slice(0, 500)
        if (!text || isTyping) return
        const history = [...messages.filter(m => m.id !== 0), { role: "user" as const, content: text }]
            .map(m => ({ role: m.role === "bot" ? "assistant" : "user", content: m.content }))
        push({ role: "user", content: text })
        setInput("")
        setIsTyping(true)

        try {
            const res = await fetch("/api/chatbot", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: history.slice(-8), memory }),
            })
            const data = await res.json().catch(() => ({}))
            if (res.status === 429) {
                push({ role: "bot", content: "Estás escribiendo muy rápido 😅 Espera un momento e intenta de nuevo." })
                return
            }
            if (!res.ok || !data.analysis) throw new Error("unavailable")

            if (data.filters) setFilters(data.filters)
            const a = data.analysis
            const pets: ChatPet[] = data.pets ?? []
            const chips: Chip[] = (a.suggestions ?? []).map((label: string) => ({ label }))
            if (a.intent === "report_lost" || a.intent === "report_found") chips.unshift({ label: "Ir a reportar", href: "/reportar" })
            for (const s of (data.sources ?? []) as { title: string; url: string }[]) {
                if (!chips.some(c => c.href === s.url)) chips.push({ label: s.title, href: s.url })
            }
            if (pets.length) chips.push({ label: "Ver todos en el mapa", href: "/mascotas" })
            else if (a.isPetSearch) chips.push({ label: "Reportar mascota", href: "/reportar" })
            push({ role: "bot", content: a.response, pets, otherZones: Boolean(data.relaxed), chips: chips.slice(0, 4) })
        } catch {
            push({ role: "bot", content: "No pude conectarme ahora mismo. Puedes buscar directamente en Mascotas o intentarlo en un momento.", chips: [{ label: "Ir a Mascotas", href: "/mascotas" }, { label: "Reportar mascota", href: "/reportar" }] })
        } finally {
            setIsTyping(false)
        }
    }, [filters, isTyping, messages, push])

    const onChip = (chip: Chip) => {
        if (chip.href) { go(chip.href); return }
        if (chip.filters) {
            const next = { ...filters, ...chip.filters }
            setFilters(next)
            void send(chip.label, next)
            return
        }
        void send(chip.label)
    }

    const clearFilter = (k: string) => setFilters(({ [k as keyof Filters]: _drop, ...rest }) => { void _drop; return rest })

    const reset = () => {
        setFilters({})
        setMessages([WELCOME])
        idRef.current = 1
        try { sessionStorage.removeItem(STORAGE_KEY) } catch { /* nada */ }
    }

    const open = () => {
        setIsOpen(true)
        setShowPrompt(false)
        try { sessionStorage.setItem(STORAGE_KEY + ".teaser", "1") } catch { /* nada */ }
    }
    const dismissPrompt = () => {
        setShowPrompt(false)
        try { sessionStorage.setItem(STORAGE_KEY + ".teaser", "1") } catch { /* nada */ }
    }

    const active = Object.entries(filters)

    return (
        <div className="pointer-events-none fixed bottom-6 right-6 z-[100] flex flex-col items-end max-lg:inset-0 max-lg:bottom-auto max-lg:right-auto">
            {isOpen && (
                <div
                    role="dialog"
                    aria-label="Asistente Huellita"
                    className="pointer-events-auto mb-4 flex h-[min(680px,calc(100dvh-11rem))] w-[420px] flex-col overflow-hidden rounded-[1.75rem] border border-border bg-card shadow-[0_28px_70px_-14px_rgba(15,118,110,0.45)] ring-1 ring-black/5 duration-200 animate-in fade-in slide-in-from-bottom-5 max-lg:fixed max-lg:inset-0 max-lg:mb-0 max-lg:h-[100dvh] max-lg:w-full max-lg:rounded-none max-lg:border-0"
                >
                    <div className="relative flex items-center justify-between overflow-hidden bg-gradient-to-br from-teal-900 via-teal-700 to-teal-600 px-5 py-4 pt-[max(1rem,env(safe-area-inset-top))] text-white">
                        <div aria-hidden className="paws-white pointer-events-none absolute inset-0 opacity-[0.09]" />
                        <div className="relative flex items-center gap-3">
                            <div className="relative">
                                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20 ring-2 ring-white/30"><PawPrint className="h-6 w-6" /></div>
                                <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-teal-700 bg-emerald-300" aria-hidden />
                            </div>
                            <div>
                                <h3 className="font-display text-base leading-tight">Huellita</h3>
                                <p className="text-xs text-teal-50/90">Tu asistente para encontrar mascotas</p>
                            </div>
                        </div>
                        <div className="relative flex items-center gap-1">
                            <button aria-label="Reiniciar conversación" title="Reiniciar" onClick={reset} className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-white/20">
                                <RotateCcw className="h-4 w-4" />
                            </button>
                            <button aria-label="Cerrar chat" onClick={() => setIsOpen(false)} className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-white/20">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {active.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 border-b border-border bg-accent/50 px-3 py-2" aria-label="Tu búsqueda en esta sesión">
                            <span className="text-[11px] font-semibold text-muted-foreground">Recuerdo:</span>
                            {active.map(([k, v]) => (
                                <button key={k} onClick={() => clearFilter(k)} aria-label={`Quitar ${filterText(k, v)}`} className="flex items-center gap-1 rounded-full border border-primary/20 bg-card px-2 py-0.5 text-[11px] font-medium text-primary hover:bg-accent">
                                    {filterText(k, v)} <X className="h-3 w-3" aria-hidden />
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="relative flex-1 space-y-4 overflow-y-auto bg-background p-4 sm:p-5" ref={scrollRef} role="log" aria-live="polite">
                        {messages.map((msg, i) => {
                            const isLast = i === messages.length - 1
                            const isUser = msg.role === "user"
                            return (
                                <div key={msg.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                                    <div className={`flex max-w-[92%] gap-2 ${isUser ? "flex-row-reverse" : ""}`}>
                                        {!isUser && (
                                            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent">
                                                <PawPrint className="h-3.5 w-3.5 text-primary" />
                                            </div>
                                        )}
                                        <div className="min-w-0 space-y-2">
                                            <div className={`whitespace-pre-wrap break-words px-3.5 py-2.5 text-sm leading-relaxed ${isUser
                                                ? "rounded-2xl rounded-tr-sm bg-primary text-primary-foreground"
                                                : "rounded-2xl rounded-tl-sm border border-border bg-card text-foreground shadow-sm"}`}>
                                                {msg.content}
                                            </div>

                                            {msg.pets && msg.pets.length > 0 && (
                                                <div className="grid gap-2.5">
                                                    {msg.otherZones && <p className="text-[11px] font-semibold text-muted-foreground">Estos son de otras zonas:</p>}
                                                    {msg.pets.map(pet => <PetCard key={pet.id} pet={pet} onOpen={go} />)}
                                                </div>
                                            )}

                                            {isLast && !isTyping && msg.chips && msg.chips.length > 0 && (
                                                <div className="flex flex-wrap gap-2">
                                                    {msg.chips.map(chip => (
                                                        <button
                                                            key={chip.label}
                                                            onClick={() => onChip(chip)}
                                                            className="flex items-center gap-1 rounded-full border border-primary/20 bg-accent px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                                                        >
                                                            {chip.href ? <ArrowUpRight className="h-3 w-3" aria-hidden /> : <Sparkles className="h-3 w-3" aria-hidden />} {chip.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}

                        {isTyping && (
                            <div className="flex items-center gap-2">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent"><PawPrint className="h-3.5 w-3.5 text-primary" /></div>
                                <div className="flex gap-1 rounded-2xl rounded-tl-sm border border-border bg-card px-4 py-3 shadow-sm" aria-label="Escribiendo">
                                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary" />
                                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:0.15s]" />
                                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:0.3s]" />
                                </div>
                            </div>
                        )}
                    </div>

                    <form className="border-t bg-card p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]" onSubmit={e => { e.preventDefault(); void send(input) }}>
                        <div className="flex items-center gap-2 rounded-full border bg-background py-1.5 pl-4 pr-1.5 shadow-[var(--shadow-soft)] transition-shadow focus-within:ring-2 focus-within:ring-primary/30">
                            <input
                                ref={inputRef}
                                style={{ outline: "none", boxShadow: "none" }}
                                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                                placeholder="Ej: perro negro perdido en Surco"
                                aria-label="Mensaje"
                                maxLength={500}
                                value={input}
                                onChange={e => setInput(e.target.value)}
                            />
                            <button
                                type="submit"
                                aria-label="Enviar"
                                disabled={!input.trim() || isTyping}
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity disabled:opacity-40"
                            >
                                <Send className="h-4 w-4" />
                            </button>
                        </div>
                        <p className="mt-1.5 text-center text-[10px] text-muted-foreground">Respuestas generadas por IA a partir de los reportes del sitio · pueden contener errores</p>
                    </form>
                </div>
            )}

            {showPrompt && !isOpen && (
                <div className="pointer-events-auto absolute bottom-20 right-0 mr-2 hidden w-max max-w-[230px] lg:block rounded-2xl border border-border bg-card p-3 pr-8 text-left shadow-xl duration-500 animate-in fade-in slide-in-from-right-5">
                    <button onClick={open} className="block text-left">
                        <p className="text-xs font-bold text-foreground">¿Buscas a tu mascota?</p>
                        <p className="text-[11px] text-muted-foreground">Dime cómo es y la busco en los reportes</p>
                    </button>
                    <button onClick={dismissPrompt} aria-label="Cerrar aviso" className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:bg-accent">
                        <X className="h-3.5 w-3.5" />
                    </button>
                </div>
            )}

            {/* Solo escritorio: en móvil el asistente se abre desde la barra inferior. El botón sigue visible y alterna abrir/cerrar. */}
            <button
                aria-label={isOpen ? "Cerrar asistente" : "Abrir asistente de ayuda"}
                aria-expanded={isOpen}
                onClick={() => (isOpen ? setIsOpen(false) : open())}
                className="pointer-events-auto relative hidden h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-gradient-to-tr from-teal-800 to-teal-600 shadow-2xl transition-transform duration-300 hover:scale-105 lg:flex"
            >
                {isOpen ? <X className="h-7 w-7 text-white" aria-hidden /> : <PawPrint className="h-7 w-7 text-white" aria-hidden />}
            </button>
        </div>
    )
}
