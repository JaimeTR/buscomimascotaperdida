
"use client"

import { useState, useEffect } from "react"
import { Search, ChevronDown, Repeat, Info, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const DOG_IMAGES: Record<string, string> = {
    "Golden Retriever": "https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=200&auto=format&fit=crop",
    "Poodle": "https://images.unsplash.com/photo-1591768575198-88dac53fbd0a?q=80&w=200&auto=format&fit=crop",
    "Pastor Alemán": "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?q=80&w=200&auto=format&fit=crop",
    "Labrador": "https://images.unsplash.com/photo-1579213838058-c9978772990a?q=80&w=200&auto=format&fit=crop",
    "Chihuahua": "https://images.unsplash.com/photo-1558121591-b684092bb548?q=80&w=200&auto=format&fit=crop",
    "Pug": "https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?q=80&w=200&auto=format&fit=crop",
    "Bulldog": "https://images.unsplash.com/photo-1517849845537-4d257902454a?q=80&w=200&auto=format&fit=crop",
    "Beagle": "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?q=80&w=200&auto=format&fit=crop",
    "Boxer": "https://images.unsplash.com/photo-1558322394-4d8813ceef8a?q=80&w=200&auto=format&fit=crop",
    "Siberian Husky": "https://images.unsplash.com/photo-1534361960057-19889db9621e?q=80&w=200&auto=format&fit=crop",
    "Doberman": "https://images.unsplash.com/photo-1560743110-330f7301931a?q=80&w=200&auto=format&fit=crop",
    "Rottweiler": "https://images.unsplash.com/photo-1567752881298-894bb81f9379?q=80&w=200&auto=format&fit=crop",
    "Shiba Inu": "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=200&auto=format&fit=crop",
    "Corgi": "https://images.unsplash.com/photo-1519098901909-b1553a1190af?q=80&w=200&auto=format&fit=crop",
    "Mestizo": "https://images.unsplash.com/photo-1544568100-847a948585b9?q=80&w=200&auto=format&fit=crop"
}

const CAT_IMAGES: Record<string, string> = {
    "Persa": "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=200&auto=format&fit=crop",
    "Siamés": "https://images.unsplash.com/photo-1557406230-cb64c8d5d9b5?q=80&w=200&auto=format&fit=crop",
    "Maine Coon": "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?q=80&w=200&auto=format&fit=crop",
    "Bengalí": "https://images.unsplash.com/photo-1513245538863-1bf50390313a?q=80&w=200&auto=format&fit=crop",
    "Ragdoll": "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=200&auto=format&fit=crop",
    "Esfinge": "https://images.unsplash.com/photo-1520315342629-6ea920342281?q=80&w=200&auto=format&fit=crop",
    "Bombay": "https://images.unsplash.com/photo-1548802673-380ab8ebc7b7?q=80&w=200&auto=format&fit=crop",
    "Azul Ruso": "https://images.unsplash.com/photo-1543852786-1cf6624b9987?q=80&w=200&auto=format&fit=crop",
    "Scottish Fold": "https://images.unsplash.com/photo-1516750105099-4b8a83e217ee?q=80&w=200&auto=format&fit=crop",
    "Munchkin": "https://images.unsplash.com/photo-1511044568932-338cba0ad803?q=80&w=200&auto=format&fit=crop",
    "Mestizo": "https://images.unsplash.com/photo-1511044568932-338cba0ad803?q=80&w=200&auto=format&fit=crop"
}

interface BreedPopoverProps {
    onBreedChange: (breed: string) => void
    initialBreed?: string
    petType?: string
}

export function BreedPopover({ onBreedChange, initialBreed, petType = 'dog' }: BreedPopoverProps) {
    const isMestizoInitial = initialBreed?.toLowerCase().includes("mezcla") || initialBreed?.toLowerCase() === "mestizo"

    const [searchTerm, setSearchTerm] = useState("")
    const [selectedBreed, setSelectedBreed] = useState(initialBreed || "")
    const [isMestizo, setIsMestizo] = useState(isMestizoInitial)
    const [mix1, setMix1] = useState("")
    const [mix2, setMix2] = useState("")

    const images = petType === 'cat' ? CAT_IMAGES : DOG_IMAGES
    const breedList = Object.keys(images).filter(b => b !== "Mestizo").sort()

    useEffect(() => {
        if (isMestizo && mix1 && mix2) {
            onBreedChange(`Mestizo (${mix1} y ${mix2})`)
        } else if (!isMestizo) {
            onBreedChange(selectedBreed)
        }
    }, [selectedBreed, isMestizo, mix1, mix2])

    const filteredBreeds = breedList.filter(b =>
        b.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="flex flex-col h-[400px]">
            <div className="p-3 border-b border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                    <p className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                        Razas de {petType === 'cat' ? 'Gato' : (petType === 'dog' ? 'Perro' : 'Mascota')}
                    </p>
                    <Button
                        variant={isMestizo ? "default" : "outline"}
                        size="sm"
                        onClick={() => setIsMestizo(!isMestizo)}
                        className={`h-7 px-3 text-[10px] font-bold rounded-full gap-1.5 transition-all ${isMestizo ? 'bg-orange-400 hover:bg-orange-500 border-none' : 'text-slate-400'}`}
                    >
                        <Repeat className="h-3 w-3" /> Es Mestizo
                    </Button>
                </div>

                {!isMestizo && (
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Buscar raza..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="h-9 pl-9 text-sm rounded-full bg-slate-50 border-none ring-0 focus-visible:ring-1 focus-visible:ring-blue-100"
                        />
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto">
                <div className="p-2 grid grid-cols-2 gap-2">
                    {isMestizo ? (
                        <div className="col-span-2 space-y-4 p-2 animate-in fade-in slide-in-from-top-2">
                            <div className="bg-orange-50 p-3 rounded-2xl border border-orange-100 flex items-start gap-3">
                                <Info className="h-4 w-4 text-orange-400 shrink-0 mt-0.5" />
                                <p className="text-[11px] text-orange-700 font-medium leading-relaxed">
                                    ¡Genial! Los {petType === 'cat' ? 'gatitos' : 'perritos'} mestizos son únicos. Selecciona las dos razas predominantes.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pb-4">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Raza 1</label>
                                    <select
                                        value={mix1}
                                        onChange={(e) => setMix1(e.target.value)}
                                        className="w-full h-9 rounded-xl border border-slate-100 text-xs px-2 outline-none focus:ring-2 focus:ring-orange-100"
                                    >
                                        <option value="">Seleccionar</option>
                                        {breedList.map(b => <option key={b} value={b}>{b}</option>)}
                                    </select>
                                    {mix1 && (
                                        <div className="aspect-square bg-slate-100 rounded-xl overflow-hidden border-2 border-white shadow-sm ring-1 ring-slate-100">
                                            <img src={images[mix1]} className="w-full h-full object-cover" alt={mix1} />
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Raza 2</label>
                                    <select
                                        value={mix2}
                                        onChange={(e) => setMix2(e.target.value)}
                                        className="w-full h-9 rounded-xl border border-slate-100 text-xs px-2 outline-none focus:ring-2 focus:ring-orange-100"
                                    >
                                        <option value="">Seleccionar</option>
                                        {breedList.map(b => <option key={b} value={b}>{b}</option>)}
                                    </select>
                                    {mix2 && (
                                        <div className="aspect-square bg-slate-100 rounded-xl overflow-hidden border-2 border-white shadow-sm ring-1 ring-slate-100">
                                            <img src={images[mix2]} className="w-full h-full object-cover" alt={mix2} />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {mix1 && mix2 && (
                                <div className="pt-4 border-t border-slate-100 space-y-3">
                                    <p className="text-[10px] font-bold uppercase text-slate-400 text-center">Resultado Probable</p>
                                    <div className="relative h-40 rounded-2xl overflow-hidden shadow-xl ring-4 ring-white">
                                        <img src={images["Mestizo"]} className="w-full h-full object-cover" alt="Mezcla" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-4 text-white">
                                            <p className="text-xs font-bold">{mix1} + {mix2}</p>
                                            <p className="text-[9px] font-medium opacity-80 italic">Un compañero único e irrepetible</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        filteredBreeds.map(breed => (
                            <button
                                key={breed}
                                onClick={() => setSelectedBreed(breed)}
                                className={`group relative aspect-square rounded-2xl overflow-hidden transition-all hover:ring-4 hover:ring-blue-100 ${selectedBreed === breed ? 'ring-4 ring-blue-400' : 'bg-slate-50'}`}
                            >
                                <img
                                    src={images[breed]}
                                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                    alt={breed}
                                />
                                <div className={`absolute inset-0 flex flex-col justify-end p-2 ${selectedBreed === breed ? 'bg-blue-500/20' : 'bg-gradient-to-t from-black/60 to-transparent'}`}>
                                    <p className="text-[10px] font-bold text-white line-clamp-1">{breed}</p>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {selectedBreed && !isMestizo && (
                <div className="p-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-2">
                        <img src={images[selectedBreed]} className="h-8 w-8 rounded-full border border-white shadow-sm" alt="" />
                        <p className="text-xs font-bold text-slate-700">{selectedBreed}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => setSelectedBreed("")}>
                        <X className="h-3 w-3" />
                    </Button>
                </div>
            )}
        </div>
    )
}
