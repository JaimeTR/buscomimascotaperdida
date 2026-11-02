
"use client"

import { useState } from "react"
import {
    Heart,
    Send,
    QrCode,
    Info,
    Banknote,
    Users
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function ContactPage() {
    const [selectedBank, setSelectedBank] = useState<'yape' | 'plin'>('yape')

    return (
        <div className="flex flex-col min-h-screen bg-stone-50">

            {/* Hero Section */}
            <section className="relative h-[400px] bg-stone-900 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-40">
                    <img
                        src="https://images.unsplash.com/photo-1450778869180-41d0601e046e?q=80&w=2000&auto=format&fit=crop"
                        className="w-full h-full object-cover"
                        alt="Hero"
                    />
                </div>
                <div className="relative z-10 container mx-auto px-6 text-center md:text-left">
                    <div className="inline-block bg-teal-700 text-white text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
                        Comunidad Activa
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight">
                        Contacto y Apoyo <br /> Voluntario
                    </h1>
                    <p className="text-lg text-stone-200 max-w-xl leading-relaxed">
                        Uniendo corazones para que ninguna mascota se quede atrás. Tu apoyo es el motor de este proyecto.
                    </p>
                </div>
            </section>

            <div className="container mx-auto px-6 -mt-24 relative z-20 pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Left: Volunteer Form */}
                    <div className="bg-white rounded-3xl p-8 shadow-xl border border-stone-100">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-teal-50 rounded-2xl text-teal-800">
                                <Users className="h-6 w-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-stone-900">Sé un Colaborador</h2>
                                <p className="text-sm text-stone-500">Tu tiempo y talento pueden salvar vidas. Únete a nuestra red de apoyo local.</p>
                            </div>
                        </div>

                        <form className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-stone-600 uppercase">Nombre completo</label>
                                    <Input placeholder="Ej. Juan Pérez" className="h-12 bg-stone-50 border-stone-200" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-stone-600 uppercase">Correo electrónico</label>
                                    <Input placeholder="ejemplo@correo.com" className="h-12 bg-stone-50 border-stone-200" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-stone-600 uppercase">Tipo de colaboración</label>
                                <Select>
                                    <SelectTrigger className="h-12 bg-stone-50 border-stone-200">
                                        <SelectValue placeholder="Selecciona una opción" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="temporal">Hogar Temporal</SelectItem>
                                        <SelectItem value="search">Búsqueda en campo</SelectItem>
                                        <SelectItem value="diffusion">Difusión en redes</SelectItem>
                                        <SelectItem value="transport">Transporte de emergencia</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-stone-600 uppercase">Mensaje o propuesta</label>
                                <textarea
                                    className="w-full min-h-[120px] rounded-md border border-stone-200 bg-stone-50 p-3 text-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-700"
                                    placeholder="Cuéntanos cómo te gustaría ayudar..."
                                ></textarea>
                            </div>

                            <Button className="w-full h-12 bg-teal-700 hover:bg-teal-800 text-lg font-bold shadow-lg shadow-teal-700/20">
                                <Send className="mr-2 h-5 w-5" /> Enviar Mensaje
                            </Button>
                        </form>
                    </div>

                    {/* Right: Donation & Support */}
                    <div className="space-y-8">

                        {/* Donation Card */}
                        <div className="bg-white rounded-3xl p-8 shadow-xl border border-stone-100 h-fit">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-3 bg-red-50 rounded-2xl text-red-500">
                                    <Heart className="h-6 w-6 fill-current" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-stone-900">Apoya el Proyecto</h2>
                                    <p className="text-sm text-stone-500">Cada aporte voluntario nos ayuda a mantener los servidores y la publicidad.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <button
                                    onClick={() => setSelectedBank('yape')}
                                    className={`p-6 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${selectedBank === 'yape' ? 'border-purple-500 bg-purple-50' : 'border-stone-100 hover:border-stone-200'
                                        }`}
                                >
                                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold">Y</div>
                                    <span className={`font-bold ${selectedBank === 'yape' ? 'text-purple-700' : 'text-stone-600'}`}>Yape</span>
                                </button>
                                <button
                                    onClick={() => setSelectedBank('plin')}
                                    className={`p-6 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${selectedBank === 'plin' ? 'border-emerald-500 bg-emerald-50' : 'border-stone-100 hover:border-stone-200'
                                        }`}
                                >
                                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold">P</div>
                                    <span className={`font-bold ${selectedBank === 'plin' ? 'text-emerald-700' : 'text-stone-600'}`}>Plin</span>
                                </button>
                            </div>

                            <div className="bg-stone-50 rounded-2xl p-8 flex flex-col items-center justify-center border-2 border-dashed border-stone-200 mb-6">
                                <QrCode className="h-24 w-24 text-stone-300 mb-4" />
                                <p className="font-mono text-xl font-bold text-stone-900 tracking-wider">900 000 000</p>
                                <p className="text-xs text-stone-400 mt-2 uppercase tracking-widest">Escanea o digita</p>
                            </div>

                            <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 flex gap-3">
                                <Info className="h-5 w-5 text-teal-700 shrink-0 mt-0.5" />
                                <p className="text-xs text-teal-800 leading-relaxed">
                                    Los fondos se destinan íntegramente al mantenimiento técnico de la plataforma y campañas de difusión pagada para mascotas en estado crítico.
                                </p>
                            </div>
                        </div>

                        {/* Thanks Banner */}
                        <div className="bg-teal-800 rounded-3xl p-8 shadow-xl text-white relative overflow-hidden">
                            <div className="relative z-10">
                                <h3 className="text-2xl font-bold mb-2">Gracias a ti</h3>
                                <p className="text-teal-100 mb-6 max-w-sm">
                                    El mes pasado logramos reunir a 124 familias con sus mascotas gracias a las donaciones de la comunidad.
                                </p>
                                <div className="flex items-center -space-x-3">
                                    <Avatar className="border-2 border-teal-800 w-10 h-10">
                                        <AvatarImage src="https://i.pravatar.cc/150?u=1" />
                                        <AvatarFallback>U1</AvatarFallback>
                                    </Avatar>
                                    <Avatar className="border-2 border-teal-800 w-10 h-10">
                                        <AvatarImage src="https://i.pravatar.cc/150?u=2" />
                                        <AvatarFallback>U2</AvatarFallback>
                                    </Avatar>
                                    <Avatar className="border-2 border-teal-800 w-10 h-10">
                                        <AvatarImage src="https://i.pravatar.cc/150?u=3" />
                                        <AvatarFallback>U3</AvatarFallback>
                                    </Avatar>
                                    <div className="w-10 h-10 rounded-full bg-white text-teal-800 flex items-center justify-center text-xs font-bold border-2 border-teal-800 z-10 pl-1">
                                        +121
                                    </div>
                                </div>
                            </div>
                            {/* Decorative paw */}
                            <div className="absolute -bottom-8 -right-8 opacity-20">
                                <Banknote className="w-48 h-48 rotate-12" />
                            </div>
                        </div>
                    </div>

                </div>
            </div>

        </div>
    )
}
