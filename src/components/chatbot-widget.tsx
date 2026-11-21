"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { X, Send, Sparkles, PawPrint, RotateCcw, MapPin, ArrowUpRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"

type Filters = Partial<Record<"type" | "breed" | "color" | "size" | "district" | "gender", string>>

interface Pet {
    id: string
    name: string | null
    type: string
    breed: string | null
    size: string | null
    last_seen_district: string | null
    image_urls: string[] | null
    status: string
}

// chip: `filters` busca local sin IA; `href` navega; si no, se envía como mensaje.
interface Chip { label: string; filters?: Filters; href?: string }

interface Message {
    id: number
    role: "bot" | "user"
    content: string
    chips?: Chip[]
    pets?: Pet[]
}

const TYPE_LABEL: Record<string, string> = { dog: "Perro", cat: "Gato", rabbit: "Otro" }
const STATUS_LABEL: Record<string, string> = { lost: "Perdido", found: "Encontrado", in_contact: "En contacto" }
const STATUS_STYLE: Record<string, string> = {
    lost: "bg-red-100 text-red-700",
    found: "bg-emerald-100 text-emerald-700",
    in_contact: "bg-amber-100 text-amber-700",
}

const START_CHIPS: Chip[] = [
    { label: "Busco un perro", filters: { type: "dog" } },
    { label: "Busco un gato", filters: { type: "cat" } },
    { label: "Perdí a mi mascota", href: "/reportar" },
    { label: "Encontré una mascota", href: "/reportar" },
]

const WELCOME: Message = {
    id: 0,
    role: "bot",
    content: "¡Hola! Soy Huellita 🐾 Te ayudo a buscar mascotas perdidas o encontradas, o a publicar un reporte. ¿Qué necesitas?",
    chips: START_CHIPS,
}

// Respaldo sin IA: detecta tipo/tamaño/distrito en el texto para no dejar al usuario sin respuesta.
function parseLocal(text: string): Filters {
    const t = text.toLowerCase()
    const f: Filters = {}
    if (/\b(perr[oa]s?|cachorro|can)\b/.test(t)) f.type = "dog"
    else if (/\b(gat[oa]s?|minino)\b/.test(t)) f.type = "cat"
    else if (/\b(conejo|hámster|hamster|cuy|ave|loro)\b/.test(t)) f.type = "rabbit"
    if (/peque[ñn]o|chico|mini/.test(t)) f.size = "small"
    else if (/mediano/.test(t)) f.size = "medium"
    else if (/grande/.test(t)) f.size = "large"
    const d = t.match(/\ben\s+([a-záéíóúñ ]{4,30})$/)
    if (d) f.district = d[1].trim()
    return f
}

export function ChatbotWidget() {
    const supabase = createClient()
    const router = useRouter()
    const idRef = useRef(1)
    const filtersRef = useRef<Filters>({})
    const scrollRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const [isOpen, setIsOpen] = useState(false)
    const [input, setInput] = useState("")
    const [isTyping, setIsTyping] = useState(false)
    const [showPrompt, setShowPrompt] = useState(false)
    const [messages, setMessages] = useState<Message[]>([WELCOME])

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
    }, [messages, isTyping, isOpen])

    useEffect(() => {
        const t = setTimeout(() => setShowPrompt(true), 3000)
        return () => clearTimeout(t)
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

    const searchPets = useCallback(async (f: Filters): Promise<Pet[]> => {
        const run = async (x: Filters) => {
            let q = supabase
                .from("pets")
                .select("id, name, type, breed, size, last_seen_district, image_urls, status")
                .in("status", ["lost", "found", "in_contact"])
                .order("created_at", { ascending: false })
            if (x.type) q = q.eq("type", x.type)
            if (x.breed) q = q.ilike("breed", `%${x.breed}%`)
            if (x.size) q = q.eq("size", x.size)
            if (x.gender) q = q.eq("gender", x.gender)
            if (x.district) q = q.ilike("last_seen_district", `%${x.district}%`)
            const { data, error } = await q.limit(5)
            if (error) throw error
            return (data ?? []) as Pet[]
        }
        try {
            return await run(f)
        } catch (e) {
            console.error("Error searching pets:", e)
            return []
        }
    }, [supabase])

    // Busca con los filtros acumulados; si no hay nada, relaja el distrito y avisa.
    const searchAndReply = useCallback(async (f: Filters, intro?: string) => {
        let pets = await searchPets(f)
        let note = ""
        if (pets.length === 0 && f.district) {
            pets = await searchPets({ ...f, district: undefined })
            if (pets.length) note = ` No hay en ${f.district}, pero estas están cerca de tu búsqueda:`
        }
        const found = pets.length
            ? note || (intro ?? `Encontré ${pets.length} reporte${pets.length > 1 ? "s" : ""} que podría${pets.length > 1 ? "n" : ""} coincidir:`)
            : "No hay reportes con esas características todavía. Puedes publicar uno y te avisamos si aparece algo."
        push({
            role: "bot",
            content: intro && pets.length && !note ? `${intro} ${found}` : found,
            pets,
            chips: pets.length
                ? [{ label: "Ver todos", href: "/mascotas" }, { label: "Generar cartel", href: "/cartel" }]
                : [{ label: "Reportar mascota", href: "/reportar" }, { label: "Nueva búsqueda", filters: {} }],
        })
    }, [push, searchPets])

    const send = useCallback(async (raw: string) => {
        const text = raw.trim().slice(0, 500)
        if (!text || isTyping) return
        const history = [...messages.filter(m => m.id !== 0), { id: -1, role: "user" as const, content: text }]
            .map(m => ({ role: m.role === "bot" ? "assistant" : "user", content: m.content }))
        push({ role: "user", content: text })
        setInput("")
        setIsTyping(true)

        try {
            const res = await fetch("/api/chatbot", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: history.slice(-8) }),
            })
            const data = await res.json().catch(() => ({}))
            if (res.status === 429) {
                push({ role: "bot", content: "Estás escribiendo muy rápido 😅 Espera un momento e intenta de nuevo." })
                return
            }
            if (!res.ok || data.fallback || !data.analysis) throw new Error("ai_unavailable")

            const a = data.analysis
            if (a.isPetSearch) {
                const clean = Object.fromEntries(Object.entries(a.filters ?? {}).filter(([, v]) => v)) as Filters
                filtersRef.current = { ...filtersRef.current, ...clean }
                await searchAndReply(filtersRef.current, a.response)
            } else {
                const chips: Chip[] = (a.suggestions ?? []).map((label: string) => ({ label }))
                if (a.intent === "report_lost" || a.intent === "report_found") chips.unshift({ label: "Ir a reportar", href: "/reportar" })
                push({ role: "bot", content: a.response, chips })
            }
        } catch {
            // Respaldo sin IA: interpreta palabras clave o devuelve al flujo guiado.
            const f = parseLocal(text)
            if (Object.keys(f).length) {
                filtersRef.current = { ...filtersRef.current, ...f }
                await searchAndReply(filtersRef.current)
            } else {
                push({ role: "bot", content: "Ahora mismo no puedo analizar mensajes libres, pero sí puedo buscar. ¿Qué tipo de mascota es?", chips: START_CHIPS })
            }
        } finally {
            setIsTyping(false)
        }
    }, [isTyping, messages, push, searchAndReply])

    const onChip = async (chip: Chip) => {
        if (chip.href) { router.push(chip.href); setIsOpen(false); return }
        if (!chip.filters) { void send(chip.label); return }
        push({ role: "user", content: chip.label })
        if (Object.keys(chip.filters).length === 0) {
            filtersRef.current = {}
            push({ role: "bot", content: "Empecemos de nuevo. ¿Qué mascota buscas?", chips: START_CHIPS })
            return
        }
        filtersRef.current = { ...filtersRef.current, ...chip.filters }
        setIsTyping(true)
        await searchAndReply(filtersRef.current)
        setIsTyping(false)
    }

    const reset = () => {
        filtersRef.current = {}
        setMessages([WELCOME])
    }

    const open = () => { setIsOpen(true); setShowPrompt(false) }

    return (
        <div className="fixed bottom-24 right-4 md:bottom-6 md:right-6 z-[100] flex flex-col items-end pointer-events-none">
            {isOpen && (
                <div
                    role="dialog"
                    aria-label="Asistente Huellita"
                    className="mb-4 w-[calc(100vw-2rem)] sm:w-[400px] h-[min(600px,calc(100dvh-9rem))] bg-card rounded-3xl shadow-2xl border border-border flex flex-col overflow-hidden pointer-events-auto animate-in slide-in-from-bottom-5 fade-in duration-200"
                >
                    <div className="px-4 py-3 flex items-center justify-between bg-gradient-to-r from-teal-800 to-teal-600 text-white">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 rounded-full p-2"><PawPrint className="h-5 w-5" /></div>
                            <div>
                                <h3 className="font-bold text-sm leading-tight">Huellita</h3>
                                <p className="text-[11px] text-teal-50/90 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 bg-emerald-300 rounded-full" /> Asistente con IA
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <button aria-label="Reiniciar conversación" title="Reiniciar" onClick={reset} className="h-8 w-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors">
                                <RotateCcw className="h-4 w-4" />
                            </button>
                            <button aria-label="Cerrar chat" onClick={() => setIsOpen(false)} className="h-8 w-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background" ref={scrollRef} role="log" aria-live="polite">
                        {messages.map((msg, i) => {
                            const isLast = i === messages.length - 1
                            const isUser = msg.role === "user"
                            return (
                                <div key={msg.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                                    <div className={`flex gap-2 max-w-[88%] ${isUser ? "flex-row-reverse" : ""}`}>
                                        {!isUser && (
                                            <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center shrink-0 mt-0.5">
                                                <PawPrint className="h-3.5 w-3.5 text-primary" />
                                            </div>
                                        )}
                                        <div className="space-y-2 min-w-0">
                                            <div className={`px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words ${isUser
                                                ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-sm"
                                                : "bg-card text-foreground border border-border rounded-2xl rounded-tl-sm shadow-sm"}`}>
                                                {msg.content}
                                            </div>

                                            {msg.pets && msg.pets.length > 0 && (
                                                <div className="space-y-2">
                                                    {msg.pets.map(pet => (
                                                        <a
                                                            key={pet.id}
                                                            href={`/mascotas/${pet.id}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="group flex gap-3 bg-card border border-border hover:border-primary/50 rounded-xl p-2 transition-colors"
                                                        >
                                                            {pet.image_urls?.[0] ? (
                                                                <img src={pet.image_urls[0]} alt={pet.name ?? "Mascota"} className="w-14 h-14 object-cover rounded-lg shrink-0" />
                                                            ) : (
                                                                <div className="w-14 h-14 rounded-lg bg-accent flex items-center justify-center shrink-0"><PawPrint className="h-6 w-6 text-primary/60" /></div>
                                                            )}
                                                            <div className="flex-1 min-w-0 text-xs">
                                                                <div className="flex items-center gap-2">
                                                                    <p className="font-bold text-foreground truncate">{pet.name || "Sin nombre"}</p>
                                                                    <span className={`shrink-0 px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${STATUS_STYLE[pet.status] ?? "bg-secondary"}`}>
                                                                        {STATUS_LABEL[pet.status] ?? pet.status}
                                                                    </span>
                                                                </div>
                                                                <p className="text-muted-foreground truncate">{[TYPE_LABEL[pet.type], pet.breed].filter(Boolean).join(" · ")}</p>
                                                                {pet.last_seen_district && (
                                                                    <p className="text-muted-foreground flex items-center gap-1 truncate"><MapPin className="h-3 w-3 shrink-0" />{pet.last_seen_district}</p>
                                                                )}
                                                            </div>
                                                            <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary self-center shrink-0" />
                                                        </a>
                                                    ))}
                                                </div>
                                            )}

                                            {isLast && !isTyping && msg.chips && msg.chips.length > 0 && (
                                                <div className="flex flex-wrap gap-2">
                                                    {msg.chips.map(chip => (
                                                        <button
                                                            key={chip.label}
                                                            onClick={() => onChip(chip)}
                                                            className="text-xs font-medium text-primary bg-accent hover:bg-primary hover:text-primary-foreground px-3 py-1.5 rounded-full border border-primary/20 transition-colors flex items-center gap-1"
                                                        >
                                                            {chip.href ? <ArrowUpRight className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />} {chip.label}
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
                            <div className="flex gap-2 items-center">
                                <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center shrink-0"><PawPrint className="h-3.5 w-3.5 text-primary" /></div>
                                <div className="bg-card px-4 py-3 rounded-2xl rounded-tl-sm border border-border shadow-sm flex gap-1" aria-label="Escribiendo">
                                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.15s]" />
                                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.3s]" />
                                </div>
                            </div>
                        )}
                    </div>

                    <form
                        className="p-3 bg-card border-t"
                        onSubmit={e => { e.preventDefault(); void send(input) }}
                    >
                        <div className="flex items-center gap-2 bg-background border rounded-full pl-4 pr-1.5 py-1.5 focus-within:ring-2 focus-within:ring-primary/30 transition-shadow">
                            <input
                                ref={inputRef}
                                style={{ outline: "none", boxShadow: "none" }}
                                className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground min-w-0"
                                placeholder="Describe a tu mascota o el distrito…"
                                aria-label="Mensaje"
                                maxLength={500}
                                value={input}
                                onChange={e => setInput(e.target.value)}
                            />
                            <button
                                type="submit"
                                aria-label="Enviar"
                                disabled={!input.trim() || isTyping}
                                className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 disabled:opacity-40 transition-opacity"
                            >
                                <Send className="h-4 w-4" />
                            </button>
                        </div>
                        <p className="mt-1.5 text-center text-[10px] text-muted-foreground">Respuestas generadas por IA · pueden contener errores</p>
                    </form>
                </div>
            )}

            {showPrompt && !isOpen && (
                <button
                    onClick={open}
                    className="absolute bottom-20 right-0 mr-2 bg-card px-4 py-2.5 rounded-2xl shadow-xl border border-border text-left animate-in slide-in-from-right-5 fade-in duration-500 hover:bg-background transition-colors w-max max-w-[220px] pointer-events-auto"
                >
                    <p className="text-xs font-bold text-foreground">¿Buscas a tu mascota?</p>
                    <p className="text-[11px] text-muted-foreground">Te ayudo a encontrarla</p>
                </button>
            )}

            <button
                aria-label="Abrir asistente de ayuda"
                onClick={open}
                className={`relative h-16 w-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 pointer-events-auto bg-gradient-to-tr from-teal-800 to-teal-600 border-4 border-white ${isOpen ? "scale-0 opacity-0" : "scale-100 opacity-100 hover:scale-105"}`}
            >
                <PawPrint className="h-7 w-7 text-white" />
            </button>
        </div>
    )
}
