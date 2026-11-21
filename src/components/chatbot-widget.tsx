
"use client"

import { useState, useRef, useEffect } from "react"
import { Bot, X, Send, Sparkles, Image as ImageIcon, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createClient } from "@/utils/supabase/client"

interface Message {
    id: string
    role: 'bot' | 'user'
    content: string
    actions?: { label: string; action: string }[]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    petResults?: any[]
    timestamp: string
}

interface PetSearchFilters {
    type?: string
    breed?: string
    color?: string
    size?: string
    district?: string
    gender?: string
}

export function ChatbotWidget() {
    const supabase = createClient()
    const messageIdRef = useRef(1)
    const [isOpen, setIsOpen] = useState(false)
    const [inputValue, setInputValue] = useState("")
    const [isTyping, setIsTyping] = useState(false)
    const [showPrompt, setShowPrompt] = useState(false)
    const [searchFilters, setSearchFilters] = useState<PetSearchFilters>({})
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'bot',
            content: 'Hola, estoy aquí para ayudarte a encontrar a tu mascota. ¿Qué tipo de mascota buscas?',
            actions: [
                { label: 'Perro', action: 'dog' },
                { label: 'Gato', action: 'cat' },
                { label: 'Otro animal', action: 'other' }
            ],
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
    ])

    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages, isOpen])

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowPrompt(true)
        }, 3000)
        return () => clearTimeout(timer)
    }, [])

    const handleActionClick = async (action: string) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const actionMap: Record<string, any> = {
            'dog': { type: 'dog', label: 'Perro' },
            'cat': { type: 'cat', label: 'Gato' },
            'other': { type: 'rabbit', label: 'Otro animal' },
            'small': { size: 'small', label: 'Pequeño' },
            'medium': { size: 'medium', label: 'Mediano' },
            'large': { size: 'large', label: 'Grande' },
        }

        const selected = actionMap[action]
        if (selected) {
            const newFilters = { ...searchFilters, ...selected }
            setSearchFilters(newFilters)

            // Buscar mascotas con los filtros actuales
            const results = await searchPetsWithFilters(newFilters)

            let botResponse = ''
            let nextActions: { label: string; action: string }[] = []

            if (results.length > 0) {
                botResponse = `Encontré ${results.length} mascota${results.length > 1 ? 's' : ''} que coincide${results.length > 1 ? 'n' : ''}:`
            } else {
                botResponse = `No encontré mascotas con esas características. ¿Quieres ajustar tu búsqueda?`
                nextActions = [
                    { label: 'Buscar de nuevo', action: 'restart' },
                    { label: 'Ver todas', action: 'all' }
                ]
            }

            const botMsg: Message = {
                id: String(messageIdRef.current++),
                role: 'bot',
                content: botResponse,
                petResults: results,
                actions: nextActions,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
            setMessages(prev => [...prev, botMsg])
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const searchPetsWithFilters = async (filters: PetSearchFilters): Promise<any[]> => {
        try {
            let query = supabase
                .from('pets')
                .select('id, name, type, breed, colors, size, gender, last_seen_district, image_urls, status, description')
                .in('status', ['lost', 'found', 'in_contact'])

            if (filters.type) query = query.eq('type', filters.type)
            if (filters.breed) query = query.ilike('breed', `%${filters.breed}%`)
            if (filters.size) query = query.eq('size', filters.size)
            if (filters.gender) query = query.eq('gender', filters.gender)
            if (filters.district) query = query.ilike('last_seen_district', `%${filters.district}%`)

            const { data, error } = await query.limit(5)

            if (error) throw error
            return data || []
        } catch (error) {
            console.error('Error searching pets:', error)
            return []
        }
    }

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return

        const userMsg: Message = {
            id: String(messageIdRef.current++),
            role: 'user',
            content: inputValue,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }

        setMessages(prev => [...prev, userMsg])
        const currentMessage = inputValue
        setInputValue("")
        setIsTyping(true)

        try {
            // Llamar al API route seguro (backend)
            const response = await fetch('/api/chatbot', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: currentMessage
                })
            })

            const data = await response.json()

            // Manejar errores del servidor
            if (!response.ok) {
                if (response.status === 429) {
                    throw new Error('Demasiadas solicitudes. Por favor espera un momento.')
                }
                throw new Error(data.error || 'Error al procesar tu mensaje')
            }

            // Verificar si debemos usar fallback
            if (data.fallback) {
                throw new Error('IA no disponible')
            }

            const { analysis } = data

            // Buscar mascotas si es necesario
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let petResults: any[] = []
            if (analysis.isPetSearch && analysis.filters) {
                petResults = await searchPetsWithFilters(analysis.filters)
            }

            const botMsg: Message = {
                id: String(messageIdRef.current++),
                role: 'bot',
                content: analysis.response || "No pude procesar tu mensaje.",
                petResults: petResults,
                actions: petResults.length > 0 ? [
                    { label: 'Generar cartel', action: 'poster' },
                    { label: 'Ver más detalles', action: 'details' },
                    { label: 'Contactar comunidad', action: 'community' }
                ] : [],
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
            setMessages(prev => [...prev, botMsg])
        } catch (error) {
            console.error('Chatbot error:', error)

            // FALLBACK: Sistema tradicional de búsqueda guiada
            const errorMessage = error instanceof Error && error.message.includes('Demasiadas solicitudes')
                ? error.message
                : "Déjame ayudarte paso a paso. ¿Qué tipo de mascota buscas?"

            const botMsg: Message = {
                id: String(messageIdRef.current++),
                role: 'bot',
                content: errorMessage,
                actions: error instanceof Error && error.message.includes('Demasiadas solicitudes') ? [] : [
                    { label: 'Perro', action: 'dog' },
                    { label: 'Gato', action: 'cat' },
                    { label: 'Otro', action: 'other' }
                ],
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
            setMessages(prev => [...prev, botMsg])
        } finally {
            setIsTyping(false)
        }
    }

    return (
        <div className="fixed bottom-24 right-4 md:bottom-6 md:right-6 z-[100] flex flex-col items-end pointer-events-none">

            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-[90vw] md:w-[400px] h-[500px] bg-card rounded-3xl shadow-2xl border border-border flex flex-col overflow-hidden pointer-events-auto animate-in slide-in-from-bottom-5 fade-in duration-200">

                    {/* Header */}
                    <div className="p-4 border-b flex items-center justify-between bg-card">
                        <div className="flex items-center gap-3">
                            <div className="bg-primary rounded-full p-2 text-white">
                                <Bot className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-foreground text-sm">Asistente de Búsqueda IA</h3>
                                <p className="text-xs text-emerald-500 font-medium flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> En línea para ayudarte
                                </p>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-secondary" onClick={() => setIsOpen(false)}>
                            <X className="h-4 w-4 text-muted-foreground" />
                        </Button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background" ref={scrollRef}>
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>

                                    {/* Avatar */}
                                    {msg.role === 'bot' ? (
                                        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center shrink-0">
                                            <Bot className="h-4 w-4 text-primary" />
                                        </div>
                                    ) : (
                                        <Avatar className="w-8 h-8 border border-white">
                                            <AvatarImage src="https://github.com/shadcn.png" />
                                            <AvatarFallback>User</AvatarFallback>
                                        </Avatar>
                                    )}

                                    {/* Bubble */}
                                    <div className="space-y-2">
                                        <div className={`p-4 text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                                            ? 'bg-primary text-white rounded-2xl rounded-tr-sm'
                                            : 'bg-card text-foreground border border-border rounded-2xl rounded-tl-sm'
                                            }`}>
                                            {msg.content}
                                        </div>

                                        {/* Actions */}
                                        {msg.actions && (
                                            <div className="flex flex-wrap gap-2">
                                                {msg.actions.map(action => (
                                                    <button
                                                        key={action.action}
                                                        className="text-xs font-medium text-primary bg-accent hover:bg-accent px-3 py-1.5 rounded-full border border-teal-100 transition-colors flex items-center gap-1"
                                                        onClick={() => handleActionClick(action.action)}
                                                    >
                                                        <Sparkles className="h-3 w-3" /> {action.label}
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {/* Pet Results */}
                                        {msg.petResults && msg.petResults.length > 0 && (
                                            <div className="space-y-2 mt-3">
                                                {msg.petResults.map((pet) => (
                                                    <a
                                                        key={pet.id}
                                                        href={`/mascotas/${pet.id}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="block bg-card border border-border hover:border-teal-300 rounded-lg p-2 hover:bg-accent transition-all"
                                                    >
                                                        <div className="flex gap-2">
                                                            {pet.image_urls?.[0] && (
                                                                <img
                                                                    src={pet.image_urls[0]}
                                                                    alt={pet.name}
                                                                    className="w-12 h-12 object-cover rounded"
                                                                />
                                                            )}
                                                            <div className="flex-1 text-xs">
                                                                <p className="font-bold text-foreground">{pet.name}</p>
                                                                <p className="text-muted-foreground">{pet.breed} • {pet.size || 'Med'}</p>
                                                                <p className="text-muted-foreground">{pet.last_seen_district}</p>
                                                            </div>
                                                        </div>
                                                    </a>
                                                ))}
                                            </div>
                                        )}

                                        <span className="text-[10px] text-muted-foreground block px-1">
                                            {msg.timestamp}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center shrink-0">
                                        <Bot className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className="bg-card p-4 rounded-2xl rounded-tl-sm border border-border shadow-sm flex gap-1">
                                        <span className="w-2 h-2 bg-primary rounded-full animate-bounce"></span>
                                        <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                        <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.4s]"></span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-card border-t">
                        <div className="flex items-center gap-2 bg-background border rounded-2xl px-3 py-2 focus-within:ring-2 focus-within:ring-teal-100 transition-all shadow-sm">
                            <button className="text-muted-foreground hover:text-primary transition-colors">
                                <ImageIcon className="h-5 w-5" />
                            </button>
                            <Input
                                className="border-none shadow-none bg-transparent focus-visible:ring-0 px-2 h-auto py-1"
                                placeholder="Escribe un mensaje o describe a tu mascota..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                            />
                            <Button size="icon" className="h-8 w-8 rounded-full bg-primary hover:bg-primary shrink-0" onClick={handleSendMessage}>
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground px-2">
                            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> Compartir ubicación</span>
                            <span>IA analizando área 500m</span>
                        </div>
                    </div>

                </div>
            )}

            {/* Prompt Bubble */}
            {showPrompt && !isOpen && (
                <div
                    className="absolute bottom-20 right-0 mr-2 bg-card px-4 py-2 rounded-xl shadow-xl border border-teal-100 flex items-center gap-3 animate-in slide-in-from-right-5 fade-in duration-500 cursor-pointer hover:bg-background transition-colors w-max max-w-[200px]"
                    onClick={() => {
                        setIsOpen(true)
                        setShowPrompt(false)
                    }}
                >
                    <div className="relative shrink-0">
                        <span className="flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                        </span>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-foreground">¿Quieres que te ayude a buscar?</p>
                        <p className="text-[10px] text-muted-foreground">Asistente IA activo</p>
                    </div>
                    {/* Arrow pointer */}
                    <div className="absolute -bottom-2 right-6 w-4 h-4 bg-card border-b border-r border-teal-100 transform rotate-45"></div>
                </div>
            )}

            {/* Floating Button */}
            <Button
                className={`h-16 w-16 rounded-full shadow-2xl transition-all duration-300 pointer-events-auto ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
                    } bg-gradient-to-tr from-teal-800 to-teal-700 hover:to-teal-700 border-4 border-white`}
                onClick={() => {
                    setIsOpen(true)
                    setShowPrompt(false)
                }}
            >
                <Bot className="h-8 w-8 text-white animate-pulse" />
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white"></span>
                </span>
            </Button>

        </div>
    )
}
