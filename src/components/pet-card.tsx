import Link from "next/link"
import { CalendarDays, MapPin, Dog, Cat, Squirrel } from "lucide-react"
import { StatusBadge } from "@/components/status-badge"

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
    timeLeft?: string
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

// Tarjeta de caso: foto 4:3, estado arriba, y datos clave. Toda la tarjeta es un solo enlace.
export function PetCard({ id, name, type, breed, district, province, colors = [], imageUrl, status, lostDate }: PetCardProps) {
    const TypeIcon = type === 'dog' ? Dog : type === 'cat' ? Cat : Squirrel
    const date = new Date(lostDate).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })

    return (
        <Link
            href={`/mascotas/${id}`}
            className="group block overflow-hidden rounded-3xl border bg-card shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-lift)]"
        >
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                <img
                    src={imageUrl}
                    alt={`${name}, ${breed}`}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <StatusBadge status={status} className="absolute left-3 top-3 shadow-md" />
                <div className="absolute bottom-3 right-3 flex -space-x-1.5">
                    {(colors || []).slice(0, 3).map((color, i) => (
                        <span
                            key={i}
                            title={color}
                            className="h-5 w-5 rounded-full border-2 border-white shadow-md"
                            style={{ background: COLOR_MAP[color] || '#CBD5E0', zIndex: 3 - i }}
                        />
                    ))}
                </div>
            </div>

            <div className="space-y-3 p-5">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <h3 className="truncate text-lg font-semibold leading-tight">{name || "Sin nombre"}</h3>
                        <p className="truncate text-sm text-muted-foreground">{breed}</p>
                    </div>
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground" aria-hidden>
                        <TypeIcon className="h-4 w-4" />
                    </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4 text-cta" aria-hidden />{district}{province ? `, ${province}` : ''}</span>
                    <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4" aria-hidden />{date}</span>
                </div>
            </div>
        </Link>
    )
}
