"use client"

import { Search, ChevronDown, Calendar, X, MapPin, Dog, Palette, PawPrint, Cat, Squirrel } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { LocationPopover } from "@/components/location-popover"
import { BreedPopover } from "@/components/breed-popover"
import { ColorPopover } from "@/components/color-popover"
import { cn } from "@/lib/utils"

export type Location = { department: string; province: string; district: string; address: string; lat?: number; lng?: number }
export type Filters = { q: string; location: Location; petType: string; breed: string; color: string; dateFrom: string }
export const EMPTY_FILTERS: Filters = {
    q: "", location: { department: "", province: "", district: "", address: "" }, petType: "all", breed: "", color: "", dateFrom: "",
}
export const hasActiveFilters = (f: Filters) => Boolean(f.q || f.location.department || f.petType !== "all" || f.breed || f.color || f.dateFrom)

const TYPES = [
    { value: "all", label: "Todas", icon: PawPrint },
    { value: "dog", label: "Perro", icon: Dog },
    { value: "cat", label: "Gato", icon: Cat },
    { value: "other", label: "Otros", icon: Squirrel },
]

// Chip de filtro: se rellena de teal suave cuando está activo.
function Chip({ active, icon: Icon, children }: { active: boolean; icon: React.ElementType; children: React.ReactNode }) {
    return (
        <Button
            variant="outline"
            size="sm"
            className={cn(
                "h-10 rounded-full border-input bg-card px-4 font-medium text-foreground shadow-none",
                active && "border-primary/40 bg-accent text-accent-foreground"
            )}
        >
            <Icon className="mr-2 h-4 w-4 opacity-70" aria-hidden />
            {children}
            <ChevronDown className="ml-2 h-3.5 w-3.5 opacity-60" aria-hidden />
        </Button>
    )
}

// Barra de búsqueda con chips (lugar, tipo, raza, color, fecha). El estado vive en el padre.
export function PetFilters({ value, onChange, onSubmit }: { value: Filters; onChange: (f: Filters) => void; onSubmit?: () => void }) {
    const set = (patch: Partial<Filters>) => onChange({ ...value, ...patch })
    const type = TYPES.find((t) => t.value === value.petType) ?? TYPES[0]
    const TypeIcon = type.icon

    return (
        <div className="space-y-4">
            <form
                role="search"
                className="relative"
                onSubmit={(e) => { e.preventDefault(); onSubmit?.() }}
            >
                <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" aria-hidden />
                <Input
                    aria-label="Buscar mascotas"
                    value={value.q}
                    onChange={(e) => set({ q: e.target.value })}
                    className="h-14 rounded-full border-input bg-card pl-12 pr-28 text-base shadow-[var(--shadow-soft)]"
                    placeholder="Nombre o raza"
                />
                <Button type="submit" className="absolute right-1.5 top-1.5 h-11 rounded-full px-6">Buscar</Button>
            </form>

            <div className="flex flex-wrap items-center gap-2">
                <Popover>
                    <PopoverTrigger asChild>
                        <span><Chip active={Boolean(value.location.department)} icon={MapPin}>
                            {value.location.district || value.location.province || value.location.department || "Lugar"}
                        </Chip></span>
                    </PopoverTrigger>
                    <PopoverContent className="max-h-[80vh] w-80 overflow-y-auto">
                        <LocationPopover
                            initialValues={value.location}
                            onLocationChange={(loc) => set({ location: { ...value.location, ...loc, address: loc.address || "" } })}
                        />
                    </PopoverContent>
                </Popover>

                <Popover>
                    <PopoverTrigger asChild>
                        <span><Chip active={value.petType !== "all"} icon={TypeIcon}>{value.petType === "all" ? "Mascota" : type.label}</Chip></span>
                    </PopoverTrigger>
                    <PopoverContent className="w-52 p-2">
                        <p className="p-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tipo de mascota</p>
                        {TYPES.map((t) => (
                            <button
                                key={t.value}
                                type="button"
                                onClick={() => set({ petType: t.value, breed: "" })}
                                className={cn(
                                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-accent",
                                    value.petType === t.value && "bg-accent text-accent-foreground"
                                )}
                            >
                                <t.icon className="h-4 w-4" aria-hidden /> {t.label}
                            </button>
                        ))}
                    </PopoverContent>
                </Popover>

                <Popover>
                    <PopoverTrigger asChild>
                        <span><Chip active={Boolean(value.breed)} icon={PawPrint}>{value.breed || "Raza"}</Chip></span>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 overflow-hidden p-0">
                        <BreedPopover petType={value.petType} initialBreed={value.breed} onBreedChange={(b) => set({ breed: b })} />
                    </PopoverContent>
                </Popover>

                <Popover>
                    <PopoverTrigger asChild>
                        <span><Chip active={Boolean(value.color)} icon={Palette}>{value.color || "Color"}</Chip></span>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-0">
                        <ColorPopover petType={value.petType} initialColor={value.color} onColorChange={(c) => set({ color: c })} />
                    </PopoverContent>
                </Popover>

                <Popover>
                    <PopoverTrigger asChild>
                        <span><Chip active={Boolean(value.dateFrom)} icon={Calendar}>{value.dateFrom || "Fecha"}</Chip></span>
                    </PopoverTrigger>
                    <PopoverContent className="w-64">
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground" htmlFor="desde-fecha">Desde la fecha</label>
                        <Input id="desde-fecha" type="date" value={value.dateFrom} onChange={(e) => set({ dateFrom: e.target.value })} className="h-10" />
                    </PopoverContent>
                </Popover>

                {hasActiveFilters(value) && (
                    <Button variant="ghost" size="sm" onClick={() => onChange(EMPTY_FILTERS)} className="h-10 gap-1.5 rounded-full text-muted-foreground">
                        <X className="h-4 w-4" aria-hidden /> Limpiar
                    </Button>
                )}
            </div>
        </div>
    )
}
