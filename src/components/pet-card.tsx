import Link from "next/link"
import { Clock, MapPin, Dog, Cat, PawPrint, Squirrel } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface PetCardProps {
    id: string
    name: string
    type: string
    breed: string
    district: string
    province?: string
    colors?: string[]
    imageUrl: string
    lostDate: string
    status: 'lost' | 'found' | 'reunited'
    timeLeft: string
}

const COLOR_MAP: Record<string, string> = {
    "Blanco": "#FFFFFF",
    "Negro": "#000000",
    "Gris": "#718096",
    "Marrón": "#744210",
    "Dorado": "#D4AF37",
    "Crema": "#FDF5E6",
    "Naranja": "#ED8936",
    "Atigrado": "repeating-linear-gradient(45deg, #718096, #718096 2px, #2D3748 2px, #2D3748 4px)",
    "Calicó": "conic-gradient(#FFFFFF, #ED8936, #000000)",
    "Bombay": "#000000"
}

export function PetCard({
    id,
    name,
    type,
    breed,
    district,
    province,
    colors = [],
    imageUrl,
    status,
    lostDate,
    timeLeft
}: PetCardProps) {
    const TypeIcon = type === 'dog' ? Dog : type === 'cat' ? Cat : Squirrel

    // Format date: "12 Oct"
    const dateObj = new Date(lostDate)
    const formattedDate = dateObj.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })

    return (
        <div className="group relative overflow-hidden rounded-3xl border bg-card transition-all hover:shadow-2xl hover:-translate-y-1">
            <div className="aspect-[4/3] w-full overflow-hidden bg-muted relative">
                <img
                    src={imageUrl}
                    alt={name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute left-3 top-3 flex flex-col gap-2">
                    {status === 'lost' ? (
                        <Badge className="bg-red-500 hover:bg-red-600 text-white border-0 uppercase tracking-wider font-bold text-[10px] px-3 py-1 shadow-lg">Perdido</Badge>
                    ) : status === 'found' ? (
                        <Badge className="bg-green-500 hover:bg-green-600 text-white border-0 uppercase tracking-wider font-bold text-[10px] px-3 py-1 shadow-lg">Encontrado</Badge>
                    ) : (
                        <Badge className="bg-blue-500 hover:bg-blue-600 text-white border-0 uppercase tracking-wider font-bold text-[10px] px-3 py-1 shadow-lg">Reunido</Badge>
                    )}
                    <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm text-slate-900 border-0 flex items-center gap-1 font-bold text-[10px] py-1 shadow-md">
                        <Clock className="w-3 h-3 text-blue-500" /> {formattedDate}
                    </Badge>
                </div>

                {/* Color Chips overlap on image */}
                <div className="absolute bottom-3 right-3 flex -space-x-1.5">
                    {(colors || []).slice(0, 3).map((color, i) => (
                        <div
                            key={i}
                            title={color}
                            className="h-5 w-5 rounded-full border-2 border-white shadow-md"
                            style={{
                                background: COLOR_MAP[color] || '#CBD5E0',
                                zIndex: 3 - i
                            }}
                        />
                    ))}
                </div>
            </div>

            <div className="p-5 space-y-4">
                <div className="space-y-1">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-black text-slate-800 tracking-tight leading-tight">{name}</h3>
                        <div className="p-2 bg-blue-50 rounded-xl text-blue-500">
                            <TypeIcon className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{breed}</p>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-slate-600 font-semibold">
                        <MapPin className="w-4 h-4 text-red-400" />
                        <span>{district}{province ? `, ${province}` : ''}</span>
                    </div>
                </div>

                <div className="pt-2">
                    <Button variant="outline" className="w-full rounded-2xl border-slate-200 font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all group/btn" asChild>
                        <Link href={`/mascotas/${id}`} className="flex items-center justify-center gap-2">
                            Ver reporte completo
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}
