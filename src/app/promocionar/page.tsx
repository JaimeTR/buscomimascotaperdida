
"use client"

import { useState } from "react"
import {
    Star,
    Zap,
    Share2,
    ArrowUp,
    CheckCircle2,
    ShieldCheck,
    CreditCard,
    QrCode,
    ArrowRight
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

export default function PromotePage() {
    const [amount, setAmount] = useState(15)
    const [method, setMethod] = useState<'yape' | 'plin'>('yape')

    return (
        <div className="min-h-screen bg-stone-50 py-12">
            <div className="container mx-auto px-4 md:px-6">

                {/* Header */}
                <div className="max-w-3xl mb-12">
                    <h1 className="text-4xl md:text-5xl font-black text-stone-900 tracking-tight leading-tight mb-4">
                        ¡Destaca tu reporte y llega a <br /> <span className="text-teal-700">más personas</span>!
                    </h1>
                    <p className="text-lg text-stone-500 leading-relaxed">
                        Tu contribución voluntaria nos ayuda a mantener la plataforma activa y le da a tu mascota la visibilidad prioritaria que necesita para volver a casa.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

                    {/* Left Column: Visuals & Benefits */}
                    <div className="space-y-12">

                        {/* Visual Comparison */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-stone-900 font-bold text-lg">
                                <Star className="h-5 w-5 text-teal-700 fill-current" /> Mira la diferencia
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Standard Card */}
                                <div className="bg-white p-3 rounded-2xl border border-stone-200 opacity-60 scale-95 origin-top-right">
                                    <div className="aspect-[4/5] bg-stone-100 rounded-xl mb-3 overflow-hidden relative">
                                        <img src="https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=400&auto=format&fit=crop" className="w-full h-full object-cover grayscale" />
                                        <Badge variant="outline" className="absolute bottom-2 left-2 bg-white/80 text-[10px]">ESTÁNDAR</Badge>
                                    </div>
                                    <h4 className="font-bold text-stone-700 text-sm">Reporte Estándar</h4>
                                    <p className="text-[10px] text-stone-400 mt-1">Aparece cronológicamente en el feed general.</p>
                                </div>

                                {/* Featured Card */}
                                <div className="bg-white p-3 rounded-2xl border-4 border-amber-400 shadow-2xl relative transform hover:scale-105 transition-transform duration-300">
                                    <div className="absolute -top-3 -right-3 bg-amber-400 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
                                        <Star className="h-3 w-3 fill-current" /> Destacado
                                    </div>
                                    <div className="aspect-[4/5] bg-stone-100 rounded-xl mb-3 overflow-hidden relative">
                                        <img src="https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=400&auto=format&fit=crop" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
                                            <div>
                                                <p className="text-white font-bold text-lg leading-none mb-1">&quot;Max&quot; - Visto hace 2h</p>
                                                <p className="text-white/80 text-xs">Surco, Lima</p>
                                            </div>
                                        </div>
                                    </div>
                                    <h4 className="font-bold text-amber-500 text-sm">Reporte Destacado (Home Page)</h4>
                                    <p className="text-[10px] text-stone-500 mt-1">Ubicación prioritaria, mayor alcance y visibilidad 24/7.</p>
                                </div>
                            </div>
                        </div>

                        {/* Features Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm">
                                <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center text-teal-700 mb-3">
                                    <Zap className="h-5 w-5 fill-current" />
                                </div>
                                <h3 className="font-bold text-stone-900 text-sm mb-1">Prioridad IA</h3>
                                <p className="text-xs text-stone-500">Análisis prioritario en nuestro motor de búsqueda visual.</p>
                            </div>
                            <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm">
                                <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center text-teal-700 mb-3">
                                    <Share2 className="h-5 w-5 fill-current" />
                                </div>
                                <h3 className="font-bold text-stone-900 text-sm mb-1">Redes Sociales</h3>
                                <p className="text-xs text-stone-500">Impulso automático en nuestras historias de Instagram y FB.</p>
                            </div>
                            <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm">
                                <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center text-teal-700 mb-3">
                                    <ArrowUp className="h-5 w-5" />
                                </div>
                                <h3 className="font-bold text-stone-900 text-sm mb-1">Top Inicio</h3>
                                <p className="text-xs text-stone-500">Tu reporte aparecerá siempre arriba en tu ciudad.</p>
                            </div>
                        </div>

                    </div>

                    {/* Right Column: Payment Action */}
                    <div className="space-y-6 lg:ml-auto w-full max-w-md">
                        <div className="bg-white rounded-3xl p-8 shadow-xl border border-stone-100">

                            <div className="mb-8">
                                <h2 className="text-xl font-bold text-stone-900 mb-1">Elige tu aporte</h2>
                                <p className="text-sm text-stone-500">Selecciona el monto para destacar tu reporte por 7 días.</p>
                            </div>

                            {/* Amount Selector */}
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                {[5, 15, 30].map((val) => (
                                    <button
                                        key={val}
                                        onClick={() => setAmount(val)}
                                        className={`group relative h-20 rounded-2xl border-2 transition-all flex flex-col items-center justify-center ${amount === val
                                                ? 'border-teal-700 bg-teal-50 text-teal-800 shadow-inner'
                                                : 'border-stone-100 hover:border-stone-200 hover:bg-stone-50'
                                            }`}
                                    >
                                        {val === 15 && (
                                            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-teal-700 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">POPULAR</span>
                                        )}
                                        <span className="text-xs font-medium text-stone-400 mb-0.5">S/</span>
                                        <span className="text-2xl font-black">{val}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="mb-8">
                                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2 block">Otro monto</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-bold">S/</span>
                                    <Input
                                        type="number"
                                        placeholder="0.00"
                                        className="h-12 pl-10 bg-stone-50 border-stone-100 font-medium text-lg"
                                        value={amount || ''}
                                        onChange={(e) => setAmount(Number(e.target.value))}
                                    />
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div className="mb-8">
                                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2 block">Pagar rápido con</label>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setMethod('yape')}
                                        className={`flex-1 h-12 rounded-full flex items-center justify-center gap-2 font-bold transition-all ${method === 'yape'
                                                ? 'bg-[#762678] text-white shadow-lg'
                                                : 'bg-stone-100 text-stone-400 hover:bg-stone-200'
                                            }`}
                                    >
                                        <QrCode className="h-4 w-4" /> Yape
                                    </button>
                                    <button
                                        onClick={() => setMethod('plin')}
                                        className={`flex-1 h-12 rounded-full flex items-center justify-center gap-2 font-bold transition-all ${method === 'plin'
                                                ? 'bg-[#00C3D6] text-white shadow-lg'
                                                : 'bg-stone-100 text-stone-400 hover:bg-stone-200'
                                            }`}
                                    >
                                        <CreditCard className="h-4 w-4" /> Plin
                                    </button>
                                </div>
                            </div>

                            <Button className="w-full h-14 bg-teal-700 hover:bg-teal-800 text-lg font-bold shadow-xl shadow-teal-700/20 mb-4 rounded-xl">
                                Continuar al Pago <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>

                            <div className="flex items-center justify-center gap-2 text-xs text-stone-400">
                                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                                Transacción 100% segura y transparente
                            </div>

                        </div>

                        {/* Trust Box */}
                        <div className="bg-teal-100 border border-teal-200 rounded-2xl p-4 flex gap-4 items-start">
                            <div className="bg-teal-700 rounded-full p-1.5 shrink-0 mt-0.5">
                                <Star className="h-4 w-4 text-white fill-current" />
                            </div>
                            <p className="text-xs text-teal-900 leading-relaxed font-medium">
                                <strong>Compromiso:</strong> El 100% de tu aporte voluntario se utiliza para financiar servidores, campañas de marketing digital y mantenimiento de la infraestructura que ayuda a miles de mascotas.
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}
