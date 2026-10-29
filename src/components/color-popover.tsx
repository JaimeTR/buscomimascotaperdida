
"use client"

import { useState } from "react"
import { Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"

const DOG_COLORS = [
    { name: "Blanco", image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=150&auto=format&fit=crop" },
    { name: "Negro", image: "https://images.unsplash.com/photo-1503256207526-0d5d80fa2f47?q=80&w=150&auto=format&fit=crop" },
    { name: "Marrón", image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?q=80&w=150&auto=format&fit=crop" },
    { name: "Dorado", image: "https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=150&auto=format&fit=crop" },
    { name: "Gris", image: "https://images.unsplash.com/photo-1598133894008-61f7fdb8cc3a?q=80&w=150&auto=format&fit=crop" },
    { name: "Manchado", image: "https://images.unsplash.com/photo-1591147139263-e6024317926b?q=80&w=150&auto=format&fit=crop" },
    { name: "Atigrado", image: "https://images.unsplash.com/photo-1594411124403-9d108f978da2?q=80&w=150&auto=format&fit=crop" },
    { name: "Bicolor", image: "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?q=80&w=150&auto=format&fit=crop" },
]

const CAT_COLORS = [
    { name: "Blanco", image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=150&auto=format&fit=crop" },
    { name: "Negro", image: "https://images.unsplash.com/photo-1548247416-ec66f4900b2e?q=80&w=150&auto=format&fit=crop" },
    { name: "Gris", image: "https://images.unsplash.com/photo-1516750105099-4b8a83e217ee?q=80&w=150&auto=format&fit=crop" },
    { name: "Atigrado", image: "https://images.unsplash.com/photo-1513245538863-1bf50390313a?q=80&w=150&auto=format&fit=crop" },
    { name: "Calicó", image: "https://images.unsplash.com/photo-1511044568932-338cba0ad803?q=80&w=150&auto=format&fit=crop" },
    { name: "Carey", image: "https://images.unsplash.com/photo-1533738600-97be582f2ecd?q=80&w=150&auto=format&fit=crop" },
    { name: "Siamés", image: "https://images.unsplash.com/photo-1557406230-cb64c8d5d9b5?q=80&w=150&auto=format&fit=crop" },
    { name: "Naranja", image: "https://images.unsplash.com/photo-1574158622682-e40e69881006?q=80&w=150&auto=format&fit=crop" },
]

const OTHER_COLORS = [
    { name: "Blanco", image: "https://images.unsplash.com/photo-1585110396052-c073359392bb?q=80&w=150&auto=format&fit=crop" },
    { name: "Gris", image: "https://images.unsplash.com/photo-1548546738-8509cb246ed3?q=80&w=150&auto=format&fit=crop" },
    { name: "Marrón", image: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?q=80&w=150&auto=format&fit=crop" },
    { name: "Colorido", image: "https://images.unsplash.com/photo-1552728089-57bdde30eba3?q=80&w=150&auto=format&fit=crop" },
]

interface ColorPopoverProps {
    onColorChange: (color: string) => void
    initialColor?: string
    petType?: string
}

export function ColorPopover({ onColorChange, initialColor, petType = 'dog' }: ColorPopoverProps) {
    const [selected, setSelected] = useState(initialColor || "")

    const colors = petType === 'cat' ? CAT_COLORS : petType === 'dog' ? DOG_COLORS : OTHER_COLORS

    const handleSelect = (colorName: string) => {
        const newVal = selected === colorName ? "" : colorName
        setSelected(newVal)
        onColorChange(newVal)
    }

    return (
        <div className="p-3 space-y-3">
            <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                Colores de {petType === 'cat' ? 'Gato' : 'Perro'}
            </p>
            <div className="grid grid-cols-3 gap-3">
                {colors.map((color) => (
                    <button
                        key={color.name}
                        onClick={() => handleSelect(color.name)}
                        className={`group flex flex-col items-center gap-1.5 p-2 rounded-2xl transition-all ${selected === color.name ? 'bg-blue-50 ring-2 ring-blue-400' : 'hover:bg-slate-50'}`}
                    >
                        <div
                            className="relative h-12 w-12 rounded-full border-2 border-white shadow-md overflow-hidden flex items-center justify-center ring-1 ring-slate-100"
                            style={{
                                backgroundImage: `url(${color.image})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center'
                            }}
                        >
                            {selected === color.name && (
                                <div className="absolute inset-0 bg-blue-500/30 flex items-center justify-center backdrop-blur-[1px]">
                                    <Check className="h-6 w-6 text-white drop-shadow-md" />
                                </div>
                            )}
                        </div>
                        <span className={`text-[9px] font-bold text-center leading-tight ${selected === color.name ? 'text-blue-600' : 'text-slate-500'}`}>
                            {color.name}
                        </span>
                    </button>
                ))}
            </div>
            {selected && (
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full h-8 text-[10px] text-slate-400 hover:text-red-500 font-bold uppercase mt-2"
                    onClick={() => handleSelect(selected)}
                >
                    <X className="mr-1 h-3 w-3" /> Limpiar Selección
                </Button>
            )}
        </div>
    )
}
