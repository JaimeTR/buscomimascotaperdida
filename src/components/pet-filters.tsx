"use client"

import { useState } from "react"
import { Search, ChevronDown, Calendar, X, MapPin, Dog, Palette, PawPrint, Cat, Squirrel, Flag, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DOG_BREEDS, CAT_BREEDS } from "@/components/breed-popover"
import { PERU_LOCATIONS, PERU_DEPARTMENTS } from "@/lib/peru-locations"
import { cn } from "@/lib/utils"

export type Location = { department: string; province: string; district: string }
export type Filters = { q: string; location: Location; petType: string; status: string; breed: string; color: string; dateFrom: string }
export const EMPTY_LOCATION: Location = { department: "", province: "", district: "" }
export const EMPTY_FILTERS: Filters = { q: "", location: EMPTY_LOCATION, petType: "all", status: "all", breed: "", color: "", dateFrom: "" }
export const hasActiveFilters = (f: Filters) =>
    Boolean(f.q || f.location.department || f.petType !== "all" || f.status !== "all" || f.breed || f.color || f.dateFrom)

const TYPES = [
    { value: "all", label: "Todas", icon: PawPrint },
    { value: "dog", label: "Perros", icon: Dog },
    { value: "cat", label: "Gatos", icon: Cat },
    { value: "other", label: "Otros", icon: Squirrel },
]
const STATUSES = [
    { value: "all", label: "Todos" },
    { value: "lost", label: "Perdidas" },
    { value: "found", label: "Encontradas" },
    { value: "reunited", label: "Reunidas" },
]

// Colores = los mismos nombres que guarda el formulario de reporte (color-popover).
const SWATCH: Record<string, string> = {
    Blanco: "#ffffff", Negro: "#1c1917", Marrón: "#78492a", Dorado: "#d9a441", Gris: "#9ca3af", Naranja: "#f08a24",
    Manchado: "radial-gradient(circle at 30% 30%, #1c1917 0 22%, transparent 24%), radial-gradient(circle at 70% 65%, #78492a 0 20%, transparent 22%), #fff",
    Atigrado: "repeating-linear-gradient(45deg, #78492a 0 5px, #d9a441 5px 10px)",
    Bicolor: "linear-gradient(90deg, #1c1917 50%, #fff 50%)",
    Calicó: "linear-gradient(135deg, #fff 33%, #f08a24 33% 66%, #1c1917 66%)",
    Carey: "linear-gradient(135deg, #1c1917 40%, #f08a24 40% 70%, #78492a 70%)",
    Siamés: "linear-gradient(90deg, #f3e5d0 50%, #5b4636 50%)",
    Colorido: "linear-gradient(135deg, #ef4444, #f59e0b, #22c55e, #3b82f6)",
}
const COLORS: Record<string, string[]> = {
    dog: ["Blanco", "Negro", "Marrón", "Dorado", "Gris", "Manchado", "Atigrado", "Bicolor"],
    cat: ["Blanco", "Negro", "Gris", "Atigrado", "Calicó", "Carey", "Siamés", "Naranja"],
    other: ["Blanco", "Gris", "Marrón", "Colorido"],
    all: Object.keys(SWATCH),
}

const iso = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
const daysAgo = (n: number) => iso(new Date(Date.now() - n * 86400000))
const DATE_PRESETS = [
    { label: "Hoy", days: 0 },
    { label: "Últimos 7 días", days: 7 },
    { label: "Últimos 30 días", days: 30 },
]
const fmtDate = (v: string) => new Intl.DateTimeFormat("es-PE", { day: "numeric", month: "short" }).format(new Date(`${v}T00:00`))

// Opción de lista dentro de un popover (marca la activa).
function Option({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn("flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium hover:bg-accent", selected && "bg-accent text-accent-foreground")}
        >
            {children}
            {selected && <Check className="ml-auto h-4 w-4" aria-hidden />}
        </button>
    )
}

// Chip + popover. Activo: se rellena y muestra una X para quitar solo ese filtro.
function FilterChip({ icon: Icon, label, active, onClear, className, children }: {
    icon: React.ElementType; label: string; active: boolean; onClear: () => void; className?: string
    children: (close: () => void) => React.ReactNode
}) {
    const [open, setOpen] = useState(false)
    return (
        <Popover open={open} onOpenChange={setOpen}>
            <div className={cn("inline-flex h-10 shrink-0 items-center rounded-full border border-input bg-card", active && "border-primary/40 bg-accent text-accent-foreground")}>
                <PopoverTrigger asChild>
                    <button
                        type="button"
                        className={cn("inline-flex h-full items-center gap-2 rounded-full pl-4 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", active ? "pr-2" : "pr-3")}
                    >
                        <Icon className="h-4 w-4 opacity-70" aria-hidden />
                        <span className="max-w-[9rem] truncate">{label}</span>
                        {!active && <ChevronDown className="h-3.5 w-3.5 opacity-60" aria-hidden />}
                    </button>
                </PopoverTrigger>
                {active && (
                    <button
                        type="button"
                        aria-label={`Quitar filtro: ${label}`}
                        onClick={onClear}
                        className="mr-1.5 flex h-7 w-7 items-center justify-center rounded-full hover:bg-primary/10"
                    >
                        <X className="h-4 w-4" aria-hidden />
                    </button>
                )}
            </div>
            <PopoverContent align="start" className={cn("max-h-[min(24rem,var(--radix-popover-content-available-height))] overflow-y-auto", className)}>
                {children(() => setOpen(false))}
            </PopoverContent>
        </Popover>
    )
}

const Title = ({ children }: { children: React.ReactNode }) => (
    <p className="px-1 pb-2 text-xs font-semibold text-muted-foreground">{children}</p>
)

// Barra de búsqueda + chips (lugar, tipo, estado, raza, color, fecha). El estado vive en el padre.
export function PetFilters({ value, onChange, onSubmit }: { value: Filters; onChange: (f: Filters) => void; onSubmit?: () => void }) {
    const set = (patch: Partial<Filters>) => onChange({ ...value, ...patch })
    const loc = value.location
    const type = TYPES.find((t) => t.value === value.petType) ?? TYPES[0]
    const status = STATUSES.find((s) => s.value === value.status) ?? STATUSES[0]
    const breeds = value.petType === "dog" ? DOG_BREEDS : value.petType === "cat" ? CAT_BREEDS : [...new Set([...DOG_BREEDS, ...CAT_BREEDS])].sort()
    const colors = COLORS[value.petType] ?? COLORS.all
    const provinces = loc.department ? Object.keys(PERU_LOCATIONS[loc.department] ?? {}) : []
    const districts = loc.department && loc.province ? PERU_LOCATIONS[loc.department]?.[loc.province] ?? [] : []
    const setLoc = (patch: Partial<Location>) => set({ location: { ...loc, ...patch } })

    return (
        <div className="space-y-3">
            <form role="search" className="relative" onSubmit={(e) => { e.preventDefault(); onSubmit?.() }}>
                <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" aria-hidden />
                <Input
                    aria-label="Buscar mascotas"
                    value={value.q}
                    onChange={(e) => set({ q: e.target.value })}
                    className="h-14 rounded-full border-input bg-card pl-12 pr-32 text-base shadow-[var(--shadow-soft)] sm:pr-36"
                    placeholder="Nombre o raza"
                />
                {value.q && (
                    <button type="button" aria-label="Borrar búsqueda" onClick={() => set({ q: "" })} className="absolute right-[5.5rem] top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary sm:right-28">
                        <X className="h-4 w-4" aria-hidden />
                    </button>
                )}
                <Button type="submit" className="absolute right-1.5 top-1.5 h-11 rounded-full px-5 sm:px-6">Buscar</Button>
            </form>

            <div className="-mx-4 flex flex-nowrap items-center gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden">
                <FilterChip
                    icon={MapPin}
                    label={loc.district || loc.province || loc.department || "Lugar"}
                    active={Boolean(loc.department)}
                    onClear={() => set({ location: EMPTY_LOCATION })}
                    className="w-72"
                >
                    {() => (
                        <div className="space-y-3">
                            <Title>Departamento</Title>
                            <Select value={loc.department} onValueChange={(v) => setLoc({ department: v, province: "", district: "" })}>
                                <SelectTrigger className="h-10"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                                <SelectContent>{PERU_DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                            </Select>
                            {loc.department && (
                                <>
                                    <Title>Provincia</Title>
                                    <Select value={loc.province} onValueChange={(v) => setLoc({ province: v, district: "" })}>
                                        <SelectTrigger className="h-10"><SelectValue placeholder="Todas" /></SelectTrigger>
                                        <SelectContent>{provinces.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                                    </Select>
                                </>
                            )}
                            {loc.province && (
                                <>
                                    <Title>Distrito</Title>
                                    <Select value={loc.district} onValueChange={(v) => setLoc({ district: v })}>
                                        <SelectTrigger className="h-10"><SelectValue placeholder="Todos" /></SelectTrigger>
                                        <SelectContent>{districts.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                                    </Select>
                                </>
                            )}
                        </div>
                    )}
                </FilterChip>

                <FilterChip icon={type.icon} label={value.petType === "all" ? "Mascota" : type.label} active={value.petType !== "all"} onClear={() => set({ petType: "all", breed: "", color: "" })} className="w-52 p-2">
                    {(close) => (
                        <>
                            {TYPES.map((t) => (
                                <Option key={t.value} selected={value.petType === t.value} onClick={() => { set({ petType: t.value, breed: "", color: "" }); close() }}>
                                    <t.icon className="h-4 w-4" aria-hidden /> {t.label}
                                </Option>
                            ))}
                        </>
                    )}
                </FilterChip>

                <FilterChip icon={Flag} label={value.status === "all" ? "Estado" : status.label} active={value.status !== "all"} onClear={() => set({ status: "all" })} className="w-52 p-2">
                    {(close) => (
                        <>
                            {STATUSES.map((s) => (
                                <Option key={s.value} selected={value.status === s.value} onClick={() => { set({ status: s.value }); close() }}>{s.label}</Option>
                            ))}
                        </>
                    )}
                </FilterChip>

                {value.petType !== "other" && (
                    <FilterChip icon={PawPrint} label={value.breed || "Raza"} active={Boolean(value.breed)} onClear={() => set({ breed: "" })} className="w-60 p-2">
                        {(close) => (
                            <>
                                {["Mestizo", ...breeds].map((b) => (
                                    <Option key={b} selected={value.breed === b} onClick={() => { set({ breed: b }); close() }}>{b}</Option>
                                ))}
                            </>
                        )}
                    </FilterChip>
                )}

                <FilterChip icon={Palette} label={value.color || "Color"} active={Boolean(value.color)} onClear={() => set({ color: "" })} className="w-72">
                    {(close) => (
                        <div className="grid grid-cols-4 gap-2">
                            {colors.map((c) => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => { set({ color: c }); close() }}
                                    className={cn("flex flex-col items-center gap-1.5 rounded-xl p-2 hover:bg-accent", value.color === c && "bg-accent ring-2 ring-primary")}
                                >
                                    <span className="h-9 w-9 rounded-full border border-stone-300" style={{ background: SWATCH[c] }} aria-hidden />
                                    <span className="text-[11px] font-medium leading-tight">{c}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </FilterChip>

                <FilterChip icon={Calendar} label={value.dateFrom ? `Desde ${fmtDate(value.dateFrom)}` : "Fecha"} active={Boolean(value.dateFrom)} onClear={() => set({ dateFrom: "" })} className="w-64 p-2">
                    {(close) => (
                        <>
                            {DATE_PRESETS.map((p) => (
                                <Option key={p.label} selected={value.dateFrom === daysAgo(p.days)} onClick={() => { set({ dateFrom: daysAgo(p.days) }); close() }}>{p.label}</Option>
                            ))}
                            <div className="mt-1 border-t px-1 pt-3">
                                <label htmlFor="desde-fecha" className="mb-1.5 block text-xs font-semibold text-muted-foreground">Desde otra fecha</label>
                                <Input id="desde-fecha" type="date" max={iso(new Date())} value={value.dateFrom} onChange={(e) => set({ dateFrom: e.target.value })} className="h-10" />
                            </div>
                        </>
                    )}
                </FilterChip>

                {hasActiveFilters(value) && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => onChange(EMPTY_FILTERS)} className="h-10 shrink-0 gap-1.5 rounded-full text-muted-foreground">
                        <X className="h-4 w-4" aria-hidden /> Limpiar todo
                    </Button>
                )}
            </div>
        </div>
    )
}
