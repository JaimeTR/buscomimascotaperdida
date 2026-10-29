
"use client"

import { useState } from "react"
import {
    Heart,
    MessageCircle,
    Share2,
    MoreHorizontal,
    Image as ImageIcon,
    MapPin,
    Send,
    Search,
    Users
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function CommunityPage() {
    const [posts, setPosts] = useState([
        {
            id: 1,
            author: "Maria Gonzalez",
            avatar: "https://i.pravatar.cc/150?u=maria",
            time: "Hace 2 horas",
            content: "¡Buenas noticias! Encontré a Bobby cerca del parque Kennedy. Ya me contacté con sus dueños y vienen en camino. Gracias a todos por compartir y ayudar ❤️",
            image: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=600&auto=format&fit=crop",
            likes: 45,
            comments: 12,
            type: "success"
        },
        {
            id: 2,
            author: "Carlos Ruiz",
            avatar: "https://i.pravatar.cc/150?u=carlos",
            time: "Hace 4 horas",
            content: "Vecinos de Miraflores, acabo de ver un Golden Retriever caminando solo por la Av. Larco. No tiene collar. Intenté acercarme pero está asustado.",
            image: "",
            likes: 18,
            comments: 5,
            type: "alert"
        }
    ])

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-slate-50">

            {/* Main Feed Area */}
            <div className="flex-1 overflow-y-auto px-4 py-8">
                <div className="max-w-2xl mx-auto space-y-6">

                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-slate-900">Comunidad</h1>
                        <p className="text-slate-500">Conecta con vecinos y ayuda a reunir familias.</p>
                    </div>

                    {/* Create Post */}
                    <Card className="border-slate-100 shadow-sm">
                        <CardContent className="p-4 pt-4">
                            <div className="flex gap-4">
                                <Avatar>
                                    <AvatarImage src="https://github.com/shadcn.png" />
                                    <AvatarFallback>YO</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 space-y-4">
                                    <Input
                                        className="bg-slate-50 border-slate-100 h-10 rounded-full px-4"
                                        placeholder="¿Qué está pasando? Reporta un avistamiento..."
                                    />
                                    <div className="flex justify-between items-center">
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-blue-500 hover:bg-blue-50">
                                                <ImageIcon className="h-4 w-4 mr-2" /> Foto
                                            </Button>
                                            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-blue-500 hover:bg-blue-50">
                                                <MapPin className="h-4 w-4 mr-2" /> Ubicación
                                            </Button>
                                        </div>
                                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 rounded-full px-6">
                                            Publicar
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Posts Feed */}
                    {posts.map(post => (
                        <Card key={post.id} className="border-slate-100 shadow-sm overflow-hidden">
                            <div className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarImage src={post.avatar} />
                                        <AvatarFallback>{post.author[0]}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-bold text-slate-900">{post.author}</p>
                                        <p className="text-xs text-slate-500">{post.time}</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" className="text-slate-400">
                                    <MoreHorizontal className="h-5 w-5" />
                                </Button>
                            </div>

                            <div className="px-4 pb-2">
                                {post.type === 'success' && (
                                    <Badge className="bg-emerald-100 text-emerald-600 hover:bg-emerald-200 border-none mb-2">¡Reencuentro Exitoso! 🎉</Badge>
                                )}
                                {post.type === 'alert' && (
                                    <Badge className="bg-orange-100 text-orange-600 hover:bg-orange-200 border-none mb-2">Avistamiento 👁️</Badge>
                                )}
                                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{post.content}</p>
                            </div>

                            {post.image && (
                                <div className="mt-3">
                                    <img src={post.image} className="w-full h-auto max-h-[400px] object-cover bg-slate-100" />
                                </div>
                            )}

                            <div className="p-4 flex items-center gap-6 border-t border-slate-50 mt-3">
                                <button className="flex items-center gap-2 text-slate-500 hover:text-red-500 transition-colors text-sm font-medium">
                                    <Heart className="h-5 w-5" /> {post.likes}
                                </button>
                                <button className="flex items-center gap-2 text-slate-500 hover:text-blue-500 transition-colors text-sm font-medium">
                                    <MessageCircle className="h-5 w-5" /> {post.comments}
                                </button>
                                <button className="flex items-center gap-2 text-slate-500 hover:text-blue-500 transition-colors text-sm font-medium ml-auto">
                                    <Share2 className="h-5 w-5" /> Compartir
                                </button>
                            </div>
                        </Card>
                    ))}

                </div>
            </div>

            {/* Right Sidebar */}
            <div className="w-80 hidden xl:block p-6 border-l bg-white space-y-8">

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input placeholder="Buscar en la comunidad" className="pl-9 bg-slate-50 border-slate-200" />
                </div>

                {/* Trending */}
                <div>
                    <h3 className="font-bold text-slate-900 mb-4 text-lg">Tendencias</h3>
                    <div className="space-y-4">
                        {['#MirafloresUnido', '#GatoPerdido', '#AdopcionResponsable', '#VoluntariosLima'].map(tag => (
                            <div key={tag} className="flex justify-between items-center group cursor-pointer">
                                <div>
                                    <p className="text-slate-700 font-medium group-hover:text-blue-600 transition-colors">{tag}</p>
                                    <p className="text-xs text-slate-400">1.2k publicaciones</p>
                                </div>
                                <MoreHorizontal className="h-4 w-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Contributors */}
                <Card className="bg-blue-50 border-blue-100 shadow-none">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold text-blue-900 flex items-center gap-2">
                            <Users className="h-4 w-4" /> Líderes de Zona
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex items-center gap-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={`https://i.pravatar.cc/150?u=${i + 10}`} />
                                        <AvatarFallback>U{i}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-slate-800 truncate">Ana Maria</p>
                                        <p className="text-xs text-slate-500">540 pts</p>
                                    </div>
                                </div>
                            ))}
                            <Button variant="link" className="w-full text-blue-600 text-xs p-0 h-auto">Ver ranking completo</Button>
                        </div>
                    </CardContent>
                </Card>

            </div>

        </div>
    )
}
