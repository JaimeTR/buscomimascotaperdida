"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
    ArrowLeft,
    Printer,
    Info,
    Image as ImageIcon,
    Loader2,
    ZoomIn,
    ZoomOut,
    Phone,
    MapPin,
    Globe,
    MessageCircle,
    Instagram,
    Facebook,
    Type,
    Minus,
    Plus
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { createClient } from "@/utils/supabase/client"

function PosterContent() {
    const searchParams = useSearchParams()
    const petId = searchParams.get("id")
    const supabase = createClient()

    const [isLoading, setIsLoading] = useState(true)
    const [zoom, setZoom] = useState(100)

    // Poster State
    const [headline, setHeadline] = useState("SE BUSCA")
    const [name, setName] = useState("...")
    const [location, setLocation] = useState("...")
    const [street, setStreet] = useState("...")

    // Customization State
    const [headlineSize, setHeadlineSize] = useState(100)
    const [nameSize, setNameSize] = useState(120)

    // Contact State
    const [phone, setPhone] = useState("...")
    const [whatsapp, setWhatsapp] = useState("")
    const [social, setSocial] = useState("")

    // Reward State
    const [showReward, setShowReward] = useState(false)
    const [rewardAmount, setRewardAmount] = useState("")

    const [image, setImage] = useState("https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=800&auto=format&fit=crop")

    useEffect(() => {
        if (!petId) {
            setIsLoading(false)
            return
        }

        const fetchPet = async () => {
            setIsLoading(true)
            const { data: pet, error } = await supabase
                .from('pets')
                .select('*')
                .eq('id', petId)
                .single()

            if (pet) {
                setName(pet.name || "Mascota")
                setLocation(pet.last_seen_district + ", " + pet.last_seen_department)
                setStreet(pet.last_seen_detail || "")
                setPhone(pet.contact_phone || "")
                if (pet.image_urls && pet.image_urls.length > 0) {
                    setImage(pet.image_urls[0])
                }

                // Set headline based on status
                if (pet.status === 'lost') setHeadline("SE BUSCA")
                if (pet.status === 'found') setHeadline("ENCONTRADO")

                // Pre-fill reward if available in description or custom field (mock logic for now)
                if (pet.reward_amount) {
                    setShowReward(true)
                    setRewardAmount(pet.reward_amount)
                }
            }
            setIsLoading(false)
        }

        fetchPet()
    }, [petId])

    const handlePrint = () => {
        window.print()
    }

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-100">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
            </div>
        )
    }

    return (
        <div className="flex h-screen bg-slate-100 overflow-hidden print:overflow-visible print:h-auto print:bg-white">

            {/* Sidebar Controls - Hidden when printing */}
            <div className="w-96 bg-white border-r flex flex-col h-full z-20 shadow-xl print:hidden">

                {/* Header */}
                <div className="p-6 border-b space-y-4">
                    <Link href="/dashboard/reports" className="flex items-center text-xs font-bold text-blue-500 uppercase tracking-wider hover:underline">
                        <ArrowLeft className="mr-1 h-3 w-3" /> Volver a Reportes
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 leading-none mb-1">Editor de Cartel</h1>
                        <p className="text-slate-500 text-sm">Personaliza e imprime tu cartel.</p>
                    </div>
                </div>

                {/* Scrollable Form Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">

                    {/* Section 1: Info */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 bg-blue-50 p-3 rounded-lg text-blue-700 text-sm font-semibold">
                            <Info className="h-4 w-4" /> Información Principal
                        </div>

                        <div className="space-y-3">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase">Título</label>
                                <Select value={headline} onValueChange={setHeadline}>
                                    <SelectTrigger className="h-10">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="SE BUSCA">SE BUSCA</SelectItem>
                                        <SelectItem value="PERDIDO">PERDIDO</SelectItem>
                                        <SelectItem value="ENCONTRADO">ENCONTRADO</SelectItem>
                                        <SelectItem value="AYUDA">AYUDA URGENTE</SelectItem>
                                        <SelectItem value="RECOMPENSA">RECOMPENSA</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase">Nombre de la Mascota</label>
                                <Input value={name} onChange={(e) => setName(e.target.value)} className="h-10" placeholder="Ej. Max" />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Appearance */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 bg-purple-50 p-3 rounded-lg text-purple-700 text-sm font-semibold">
                            <Type className="h-4 w-4" /> Personalizar Textos
                        </div>

                        <div className="space-y-4 px-1">
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Tamaño del Título</label>
                                    <span className="text-xs font-mono text-slate-400">{headlineSize}%</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setHeadlineSize(s => Math.max(50, s - 5))}><Minus className="h-3 w-3" /></Button>
                                    <Slider value={[headlineSize]} onValueChange={(val: number[]) => setHeadlineSize(val[0])} min={50} max={200} step={5} className="flex-1" />
                                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setHeadlineSize(s => Math.min(200, s + 5))}><Plus className="h-3 w-3" /></Button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Tamaño del Nombre</label>
                                    <span className="text-xs font-mono text-slate-400">{nameSize}%</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setNameSize(s => Math.max(50, s - 5))}><Minus className="h-3 w-3" /></Button>
                                    <Slider value={[nameSize]} onValueChange={(val: number[]) => setNameSize(val[0])} min={50} max={250} step={5} className="flex-1" />
                                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setNameSize(s => Math.min(250, s + 5))}><Plus className="h-3 w-3" /></Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Contact & Reward */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 bg-emerald-50 p-3 rounded-lg text-emerald-700 text-sm font-semibold">
                            <Phone className="h-4 w-4" /> Datos de Contacto
                        </div>

                        <div className="space-y-3">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase">Teléfono Principal</label>
                                <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="h-10 text-lg font-mono" />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase">WhatsApp / 2do Teléfono</label>
                                <Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className="h-10" placeholder="+51 999..." />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase">Red Social</label>
                                <Input value={social} onChange={(e) => setSocial(e.target.value)} className="h-10" placeholder="@usuario" />
                            </div>

                            {/* REWARD TOGGLE */}
                            <div className="pt-2">
                                <div className="flex items-center space-x-2 mb-2">
                                    <input
                                        type="checkbox"
                                        id="reward"
                                        checked={showReward}
                                        onChange={(e) => setShowReward(e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <label htmlFor="reward" className="text-sm font-bold text-slate-700 cursor-pointer select-none">
                                        Ofrecer Recompensa
                                    </label>
                                </div>
                                {showReward && (
                                    <div className="animate-in slide-in-from-top-2 fade-in duration-200">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Monto o Detalle</label>
                                        <Input
                                            value={rewardAmount}
                                            onChange={(e) => setRewardAmount(e.target.value)}
                                            className="h-10 border-yellow-400 focus-visible:ring-yellow-400 font-bold"
                                            placeholder="Ej. S/. 500"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Zona / Distrito</label>
                            <Input value={location} onChange={(e) => setLocation(e.target.value)} className="h-10" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Calle / Referencia</label>
                            <Input value={street} onChange={(e) => setStreet(e.target.value)} className="h-10" />
                        </div>
                    </div>

                    <Button variant="outline" className="w-full h-12 bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border-dashed border-2 pointer-events-none opacity-50">
                        <ImageIcon className="mr-2 h-4 w-4" /> Cambiar foto (Próximamente)
                    </Button>
                </div>

                {/* Footer Action */}
                <div className="p-6 border-t bg-slate-50/50">
                    <Button onClick={handlePrint} className="w-full h-12 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 text-base font-bold tracking-wide">
                        <Printer className="mr-2 h-5 w-5" /> IMPRIMIR CARTEL
                    </Button>
                    <p className="text-[10px] text-center text-slate-400 mt-2 uppercase tracking-widest font-medium">Optimizado para impresión A4</p>
                </div>
            </div>

            {/* Canvas Area */}
            <div className="flex-1 flex flex-col relative bg-slate-100/50 print:bg-white print:block print:w-full print:h-full">

                {/* Canvas Toolbar - Hidden when printing */}
                <div className="h-16 flex items-center justify-between px-8 print:hidden">
                    <div className="flex gap-2">
                        <Button variant="outline" size="icon" className="h-9 w-9 bg-white shadow-sm" onClick={() => setZoom(z => Math.max(z - 10, 50))}><ZoomOut className="h-4 w-4" /></Button>
                        <Button variant="outline" size="icon" className="h-9 w-9 bg-white shadow-sm" onClick={() => setZoom(z => Math.min(z + 10, 150))}><ZoomIn className="h-4 w-4" /></Button>
                    </div>
                </div>

                {/* Scrollable Canvas */}
                <div className="flex-1 overflow-auto flex justify-center p-8 pb-32 print:p-0 print:overflow-visible print:block">
                    <div
                        className="transition-transform origin-top duration-200 ease-out print:transform-none print:w-full print:h-full"
                        style={{ transform: `scale(${zoom / 100})`, width: '210mm', height: '297mm' }} // A4 size
                    >
                        {/* POSTER A4 */}
                        <div className="w-full h-full bg-white shadow-2xl relative flex flex-col print:shadow-none border print:border-none overflow-hidden">

                            {/* Main Header Strip - Yellow for High Contrast Black */}
                            <div className={`${headline === 'ENCONTRADO' ? 'bg-emerald-400' : 'bg-[#FFD600]'} h-28 flex items-center justify-center shrink-0 print-color-adjust-exact`}>
                                <h1
                                    className="font-black text-slate-900 tracking-widest uppercase flex items-center gap-4 text-center leading-none mt-2"
                                    style={{ fontSize: `${headlineSize * 0.8}px` }}
                                >
                                    {headline}
                                </h1>
                            </div>

                            {/* Pet Name Block - Brand Blue */}
                            {/* Reduced padding here to bring name closer to title */}
                            <div className="pt-0 pb-2 text-center z-10 bg-white">
                                <h2
                                    className="leading-none font-black text-blue-600 uppercase tracking-tighter truncate max-w-full px-4"
                                    style={{ fontSize: `${nameSize * 0.8}px`, lineHeight: '0.9' }}
                                >
                                    {name}
                                </h2>
                            </div>

                            {/* Main Content Area */}
                            <div className="flex-1 px-8 py-2 flex flex-col items-center relative">

                                {/* Photo Container */}
                                <div className="w-full flex-1 relative rounded-3xl overflow-hidden border-4 border-slate-100 shadow-xl mb-4 max-h-[500px]">
                                    <img
                                        src={image}
                                        className="w-full h-full object-cover"
                                        alt={name}
                                        style={{ objectPosition: 'center 20%' }}
                                    />
                                    {/* Location Badge Overlay */}
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 pt-12">
                                        <div className="text-white flex items-center gap-3">
                                            <MapPin className="h-8 w-8 text-yellow-400 shrink-0" />
                                            <div>
                                                <p className="font-bold text-2xl leading-none">{location}</p>
                                                <p className="text-white/90 text-lg mt-1">{street}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Reward Banner - Only shows if active */}
                                {showReward && rewardAmount && (
                                    <div className="w-full bg-yellow-400 text-slate-900 p-3 rounded-xl mb-4 shadow-lg flex items-center justify-center gap-4 animate-in zoom-in duration-300 print-color-adjust-exact border-4 border-black border-dashed">
                                        <span className="text-2xl font-black tracking-widest uppercase">Recompensa:</span>
                                        <span className="text-4xl font-black bg-white text-black px-4 rounded-lg transform -rotate-2 shadow-sm border-2 border-black">{rewardAmount}</span>
                                    </div>
                                )}

                                {/* Contact Information Grid */}
                                <div className="w-full grid grid-cols-1 gap-3 mt-auto">

                                    {/* Primary Phone - Massive */}
                                    <div className="bg-white border-4 border-slate-900 text-slate-900 rounded-3xl p-4 flex flex-col items-center justify-center shadow-sm print-color-adjust-exact">
                                        <p className="text-sm font-black text-slate-500 uppercase tracking-[0.2em] mb-1">SI ME VES, LLAMA AL:</p>
                                        <div className="flex items-center gap-4 justify-center">
                                            <Phone className="h-10 w-10 text-slate-900 fill-slate-900" />
                                            <p className="text-6xl font-black tracking-widest leading-none">{phone}</p>
                                        </div>
                                    </div>

                                    {/* Secondary Contact Info if present */}
                                    {(whatsapp || social) && (
                                        <div className="flex gap-3">
                                            {whatsapp && (
                                                <div className="flex-1 bg-emerald-100 border-2 border-emerald-500 text-slate-900 rounded-2xl p-3 flex items-center gap-3 shadow-md print-color-adjust-exact">
                                                    <MessageCircle className="h-6 w-6 shrink-0 text-emerald-700" />
                                                    <div className="min-w-0">
                                                        <p className="text-[10px] font-bold opacity-70 uppercase truncate text-emerald-800">WhatsApp</p>
                                                        <p className="text-xl font-bold truncate">{whatsapp}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {social && (
                                                <div className="flex-1 bg-purple-100 border-2 border-purple-500 text-slate-900 rounded-2xl p-3 flex items-center gap-3 shadow-md print-color-adjust-exact">
                                                    <Instagram className="h-6 w-6 shrink-0 text-purple-700" />
                                                    <div className="min-w-0">
                                                        <p className="text-[10px] font-bold opacity-70 uppercase truncate text-purple-800">Redes</p>
                                                        <p className="text-xl font-bold truncate">{social}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Website Footer Strip */}
                            <div className="h-16 bg-blue-600 flex items-center justify-between px-8 text-white mt-4 print-color-adjust-exact">
                                <div className="flex items-center gap-2 opacity-90">
                                    <Globe className="h-5 w-5" />
                                    <span className="font-bold tracking-wide">buscomimascotaperdida.com</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="bg-white text-blue-800 px-3 py-1 rounded-lg font-black text-sm tracking-wide flex items-center gap-3">
                                        <div className="flex items-center gap-1">
                                            <Instagram className="h-4 w-4" />
                                            <Facebook className="h-4 w-4" />
                                            <svg
                                                className="h-4 w-4"
                                                viewBox="0 0 24 24"
                                                fill="currentColor"
                                                stroke="none"
                                            >
                                                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                                            </svg>
                                        </div>
                                        <span>buscomimascotaperdida</span>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @media print {
                    @page {
                        margin: 0;
                        size: auto;
                    }
                    body {
                        background: white;
                    }
                    /* Ensure background colors print */
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
            `}</style>
        </div>
    )
}

export default function PosterPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>}>
            <PosterContent />
        </Suspense>
    )
}
