
"use client"

import { useState } from "react"
import {
    Plus,
    Search,
    MapPin,
    Image as ImageIcon,
    Send,
    MoreVertical,
    Phone,
    Video,
    Users,
    MessageSquare,
    Lightbulb
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export default function MessagesPage() {
    const [activeChat, setActiveChat] = useState("1")

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const CONVERSATIONS: any[] = [
        {
            id: "1",
            type: "private",
            name: "Juan Pérez",
            subtitle: "Encontró a tu mascota",
            time: "2m",
            avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200&auto=format&fit=crop",
            status: "online",
            messages: [
                { id: 1, role: "other", content: "Hola Jaime, creo que he visto a tu perro Max cerca del parque Kennedy.", time: "14:02" },
                { id: 2, role: "me", content: "¡En serio! ¿Hace cuánto tiempo fue eso?", time: "14:03" },
                { id: 3, role: "other", content: "Hace unos 10 minutos. Llevaba un collar rojo, ¿verdad?", time: "14:05" },
                { id: 4, role: "me", content: "Sí, exacto. Voy para allá ahora mismo.", time: "14:06" }
            ]
        },
        {
            id: "2",
            type: "group",
            name: "Vecinos de Miraflores",
            subtitle: "342 miembros",
            time: "1h",
            avatar: "", // Initial variant
            status: "342 members",
            messages: [
                { id: 1, role: "other", content: "Alguien ha visto un gato siamés por la Av. Larco?", time: "13:00", sender: "Ana M." },
                { id: 2, role: "other", content: "Yo vi uno ayer por la noche cerca al óvalo.", time: "13:15", sender: "Carlos R." }
            ]
        },
        {
            id: "3",
            type: "private",
            name: "Maria Garcia",
            subtitle: "Dueña de la mascota",
            time: "1d",
            avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
            status: "offline",
            messages: []
        }
    ]

    const currentChat = CONVERSATIONS.find(c => c.id === activeChat) || CONVERSATIONS[0]

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-white">

            {/* Sidebar List */}
            <div className="w-80 border-r flex flex-col bg-white">

                <div className="p-4 space-y-4">
                    <Button className="w-full bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-500/20 h-11 text-base font-semibold" size="lg">
                        <Plus className="mr-2 h-5 w-5" /> Nueva Conversación
                    </Button>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input placeholder="Buscar chats..." className="pl-9 bg-slate-50 border-slate-200" />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-2">
                    <div className="px-2 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Recientes</div>
                    <div className="space-y-1">
                        {CONVERSATIONS.map((chat) => (
                            <button
                                key={chat.id}
                                onClick={() => setActiveChat(chat.id)}
                                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left ${activeChat === chat.id ? 'bg-blue-50' : 'hover:bg-slate-50'
                                    }`}
                            >
                                <Avatar className="h-10 w-10 border border-slate-100">
                                    {chat.type === "group" ? (
                                        <AvatarFallback className="bg-orange-100 text-orange-600"><Users className="h-5 w-5" /></AvatarFallback>
                                    ) : (
                                        <AvatarImage src={chat.avatar} />
                                    )}
                                    <AvatarFallback>{chat.name[0]}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-0.5">
                                        <span className={`font-semibold truncate ${activeChat === chat.id ? 'text-blue-700' : 'text-slate-900'}`}>
                                            {chat.name}
                                        </span>
                                        <span className="text-[10px] text-slate-400 shrink-0">{chat.time}</span>
                                    </div>
                                    <p className="text-xs text-slate-500 truncate">{chat.subtitle}</p>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Tip Widget */}
                    <div className="mt-6 mx-2 bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
                        <div className="flex items-center gap-2 mb-2 text-emerald-700 font-bold text-xs uppercase tracking-wider">
                            <Lightbulb className="h-4 w-4" /> Pro-Tip
                        </div>
                        <p className="text-xs text-emerald-800 leading-relaxed">
                            Las mascotas suelen quedarse a menos de 1km de donde se perdieron. Comparte tu ubicación para coordinar mejor.
                        </p>
                    </div>

                </div>

            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-[#F8FAFC]">

                {/* Header */}
                <div className="h-20 border-b bg-white px-6 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10 border">
                            {currentChat.type === "group" ? (
                                <AvatarFallback className="bg-orange-100 text-orange-600"><Users className="h-5 w-5" /></AvatarFallback>
                            ) : (
                                <AvatarImage src={currentChat.avatar} />
                            )}
                            <AvatarFallback>{currentChat.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h2 className="font-bold text-slate-900 text-lg leading-none">{currentChat.name}</h2>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`w-2 h-2 rounded-full ${currentChat.status === 'online' ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                                <span className="text-xs text-slate-500 font-medium">{currentChat.status === 'online' ? 'En línea ahora' : currentChat.status}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-blue-500"><Phone className="h-5 w-5" /></Button>
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-blue-500"><Video className="h-5 w-5" /></Button>
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600"><MoreVertical className="h-5 w-5" /></Button>
                    </div>
                </div>

                {/* Messages Feed */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {currentChat.messages.length > 0 ? (
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        currentChat.messages.map((msg: any) => (
                            <div key={msg.id} className={`flex ${msg.role === 'me' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex gap-4 max-w-[70%] ${msg.role === 'me' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <Avatar className="h-8 w-8 mt-1 shadow-sm border border-white">
                                        {msg.role === 'me' ? (
                                            <AvatarImage src="https://github.com/shadcn.png" />
                                        ) : (
                                            currentChat.type === 'group' ? <AvatarFallback>{msg.sender?.[0]}</AvatarFallback> : <AvatarImage src={currentChat.avatar} />
                                        )}
                                        <AvatarFallback>U</AvatarFallback>
                                    </Avatar>

                                    <div className={`space-y-1 ${msg.role === 'me' ? 'items-end flex flex-col' : 'items-start flex flex-col'}`}>
                                        {msg.role === 'other' && currentChat.type === 'group' && (
                                            <span className="text-xs font-bold text-slate-400 ml-1">{msg.sender}</span>
                                        )}
                                        <div className={`p-4 shadow-sm text-sm leading-relaxed ${msg.role === 'me'
                                                ? 'bg-blue-500 text-white rounded-2xl rounded-tr-sm'
                                                : 'bg-white text-slate-700 border border-slate-100 rounded-2xl rounded-tl-sm'
                                            }`}>
                                            {msg.content}
                                        </div>
                                        <span className="text-[10px] text-slate-400 px-1 font-medium">{msg.time}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                                <MessageSquare className="h-8 w-8 text-slate-300" />
                            </div>
                            <p>No hay mensajes en esta conversación aún.</p>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-6 bg-white border-t">
                    <div className="bg-white border rounded-3xl shadow-sm p-4 space-y-4 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                        <Input
                            className="border-none shadow-none text-base px-0 focus-visible:ring-0 placeholder:text-slate-300 h-auto py-2"
                            placeholder="Escribe un mensaje o describe a tu mascota..."
                        />
                        <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center gap-1">
                                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-full h-8 px-2 gap-1 text-xs">
                                    <ImageIcon className="h-4 w-4" /> Foto
                                </Button>
                                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-full h-8 px-2 gap-1 text-xs">
                                    <MapPin className="h-4 w-4" /> Ubicación
                                </Button>
                            </div>
                            <Button size="icon" className="h-10 w-10 rounded-full bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-500/20">
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    <p className="text-center text-[10px] text-slate-300 mt-4">
                        Mascotas Perdidas mantiene tus conversaciones seguras y privadas.
                    </p>
                </div>

            </div>
        </div>
    )
}
