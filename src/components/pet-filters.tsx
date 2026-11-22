"use client"

import { useRef, useState } from "react"
import { Search, ChevronDown, Calendar, X, MapPin, Dog, Palette, PawPrint, Cat, Squirrel, Check, SlidersHorizontal, Ruler } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DOG_BREEDS, CAT_BREEDS } from "@/components/breed-popover"
import { PERU_LOCATIONS, PERU_DEPARTMENTS } from "@/lib/peru-locations"
import { cn } from "@/lib/utils"

export type Location = { department: string; province: string; district: string }
export type Filters = { q: string; location: Location; petType: string; status: string; breed: string; color: string; dateFrom: string; size: string }
export const EMPTY_LOCATION: Location = { department: "", province: "", district: "" }
export const EMPTY_FILTERS: Filters = { q: "", location: EMPTY_LOCATION, petType: "all", status: "all", breed: "", color: "", dateFrom: "", size: "all" }
export const hasActiveFilters = (f: Filters) =>
    Boolean(f.q || f.location.department || f.petType !== "all" || f.status !== "all" || f.breed || f.color || f.dateFrom || f.size !== "all")
// Cantidad de filtros aplicados (sin contar el texto de búsqueda): se muestra en el botón "Filtros".
const countFilters = (f: Filters) =>
    [f.location.department, f.petType !== "all", f.breed, f.color, f.dateFrom, f.size !== "all"].filter(Boolean).length

const TYPES = [
    { value: "all", label: "Todas", icon: PawPrint },
    { value: "dog", label: "Perros", icon: Dog },
    { value: "cat", label: "Gatos", icon: Cat },
    { value: "other", label: "Otros", icon: Squirrel },
]
// Mismos valores que guarda el formulario de reporte.
const SIZES = [
    { value: "all", label: "Todos" },
    { value: "Pequeño", label: "Pequeño" },
    { value: "Mediano", label: "Mediano" },
    { value: "Grande", label: "Grande" },
]

// Colores = los nombres que guarda el formulario de reporte y los que traen los casos importados.
const SWATCH: Record<string, string> = {
    Blanco: "#ffffff", Negro: "#1c1917", Marrón: "#78492a", Dorado: "#d9a441", Gris: "#9ca3af", Naranja: "#f08a24",
    Beige: "#e8d5b5", Crema: "#f3e8cf", Caramelo: "#b8742f",
    Manchado: "radial-gradient(circle at 30% 30%, #1c1917 0 22%, transparent 24%), radial-gradient(circle at 70% 65%, #78492a 0 20%, transparent 22%), #fff",
    Atigrado: "repeating-linear-gradient(45deg, #78492a 0 5px, #d9a441 5px 10px)",
    Bicolor: "linear-gradient(90deg, #1c1917 50%, #fff 50%)",
    Calicó: "linear-gradient(135deg, #fff 33%, #f08a24 33% 66%, #1c1917 66%)",
    Carey: "linear-gradient(135deg, #1c1917 40%, #f08a24 40% 70%, #78492a 70%)",
    Siamés: "linear-gradient(90deg, #f3e5d0 50%, #5b4636 50%)",
    Colorido: "linear-gradient(135deg, #ef4444, #f59e0b, #22c55e, #3b82f6)",
}
// Tonos claros: el check de selección va oscuro para que se vea.
const LIGHT = new Set(["Blanco", "Beige", "Crema", "Dorado", "Manchado", "Bicolor", "Calicó", "Siamés"])
const COLORS: Record<string, string[]> = {
    dog: ["Blanco", "Negro", "Marrón", "Beige", "Caramelo", "Dorado", "Gris", "Crema", "Manchado", "Atigrado", "Bicolor"],
    cat: ["Blanco", "Negro", "Gris", "Beige", "Crema", "Atigrado", "Calicó", "Carey", "Siamés", "Naranja"],
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
const breedsFor = (petType: string) => petType === "dog" ? DOG_BREEDS : petType === "cat" ? CAT_BREEDS : [...new Set([...DOG_BREEDS, ...CAT_BREEDS])].sort()

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
function FilterChip({ icon: Icon, label, active, onClear, className, fill, children }: {
    icon: React.ElementType; label: string; active: boolean; onClear: () => void; className?: string
    fill?: boolean // ocupa todo el ancho de su celda (vista compacta en cuadrícula)
    children: (close: () => void) => React.ReactNode
}) {
    const [open, setOpen] = useState(false)
    return (
        <Popover open={open} onOpenChange={setOpen}>
            <div className={cn("inline-flex h-10 shrink-0 items-center rounded-full border border-input bg-card", fill && "max-sm:flex max-sm:w-full max-sm:min-w-0", active && "border-primary/40 bg-accent text-accent-foreground")}>
                <PopoverTrigger asChild>
                    <button
                        type="button"
                        className={cn("inline-flex h-full items-center gap-2 rounded-full pl-4 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", fill && "max-sm:min-w-0 max-sm:flex-1 max-sm:justify-center max-sm:gap-1 max-sm:pl-2 max-sm:text-[13px]", active ? "pr-2" : fill ? "pr-2 sm:pr-3" : "pr-3")}
                    >
                        <Icon className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
                        <span className={cn("max-w-[9rem] truncate", fill && "max-sm:max-w-none")}>{label}</span>
                        {!active && <ChevronDown className={cn("h-3.5 w-3.5 opacity-60", fill && "hidden sm:block")} aria-hidden />}
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

// Chips de selección única dentro del panel completo.
function Choice({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={selected}
            className={cn("inline-flex min-h-10 items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition-colors", selected ? "border-primary bg-primary text-primary-foreground" : "border-input bg-card hover:bg-accent")}
        >
            {children}
        </button>
    )
}

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section className="space-y-2.5">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {children}
    </section>
)

const selectCls = "h-11 w-full rounded-xl border border-input bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"

// Panel completo de filtros: hoja inferior en móvil, ventana centrada en escritorio. Trabaja con un borrador y se aplica al final.
function FiltersSheet({ value, onApply, onClose }: { value: Filters; onApply: (f: Filters) => void; onClose: () => void }) {
    const [draft, setDraft] = useState<Filters>(value)
    const set = (patch: Partial<Filters>) => setDraft((d) => ({ ...d, ...patch }))
    const loc = draft.location
    const provinces = loc.department ? Object.keys(PERU_LOCATIONS[loc.department] ?? {}) : []
    const districts = loc.department && loc.province ? PERU_LOCATIONS[loc.department]?.[loc.province] ?? [] : []
    const colors = COLORS[draft.petType] ?? COLORS.all
    const n = countFilters(draft)

    return (
        <>
            <div className="flex items-center justify-between border-b px-5 py-4">
                <h2 className="font-display text-xl text-primary">Filtros</h2>
                <button type="button" onClick={onClose} aria-label="Cerrar filtros" className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary">
                    <X className="h-5 w-5" aria-hidden />
                </button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
                <Section title="Mascota">
                    <div className="flex flex-wrap gap-2">
                        {TYPES.map((t) => (
                            <Choice key={t.value} selected={draft.petType === t.value} onClick={() => set({ petType: t.value, breed: "", color: "" })}>
                                <t.icon className="h-4 w-4" aria-hidden /> {t.label}
                            </Choice>
                        ))}
                    </div>
                </Section>

                <Section title="Lugar">
                    <div className="grid gap-2 sm:grid-cols-3">
                        <select aria-label="Departamento" className={selectCls} value={loc.department} onChange={(e) => set({ location: { department: e.target.value, province: "", district: "" } })}>
                            <option value="">Departamento</option>
                            {PERU_DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                        </select>
                        <select aria-label="Provincia" className={selectCls} disabled={!loc.department} value={loc.province} onChange={(e) => set({ location: { ...loc, province: e.target.value, district: "" } })}>
                            <option value="">Provincia</option>
                            {provinces.map((p) => <option key={p} value={p}>{p}</option>)}
                        </select>
                        <select aria-label="Distrito" className={selectCls} disabled={!loc.province} value={loc.district} onChange={(e) => set({ location: { ...loc, district: e.target.value } })}>
                            <option value="">Distrito</option>
                            {districts.map((d) => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                </Section>

                {draft.petType !== "other" && (
                    <Section title="Raza">
                        <select aria-label="Raza" className={selectCls} value={draft.breed} onChange={(e) => set({ breed: e.target.value })}>
                            <option value="">Todas las razas</option>
                            <option value="Mestizo">Mestizo</option>
                            {breedsFor(draft.petType).map((b) => <option key={b} value={b}>{b}</option>)}
                        </select>
                    </Section>
                )}

                <Section title="Color de la mascota">
                    <div className="grid grid-cols-4 gap-x-2 gap-y-3 min-[440px]:grid-cols-5 sm:grid-cols-6">
                        {colors.map((c) => {
                            const on = draft.color === c
                            return (
                                <button
                                    key={c}
                                    type="button"
                                    aria-pressed={on}
                                    onClick={() => set({ color: on ? "" : c })}
                                    className={cn("group flex flex-col items-center gap-1.5 rounded-2xl px-1 py-2 transition-colors hover:bg-accent/60 active:scale-95", on && "bg-accent")}
                                >
                                    <span
                                        className={cn("relative flex h-12 w-12 items-center justify-center rounded-full border border-stone-300 shadow-sm transition-transform duration-200 group-hover:scale-110", on && "scale-110 ring-2 ring-primary ring-offset-2 ring-offset-card")}
                                        style={{ background: SWATCH[c] }}
                                        aria-hidden
                                    >
                                        {on && <Check className={cn("h-5 w-5 drop-shadow", LIGHT.has(c) ? "text-stone-800" : "text-white")} />}
                                    </span>
                                    <span className={cn("text-xs leading-tight", on ? "font-semibold text-primary" : "font-medium text-foreground")}>{c}</span>
                                </button>
                            )
                        })}
                    </div>
                    {draft.color && <p className="text-xs text-muted-foreground">Mostrando mascotas de color <strong className="text-foreground">{draft.color.toLowerCase()}</strong> o con ese color entre sus tonos.</p>}
                </Section>

                <Section title="Tamaño">
                    <div className="flex flex-wrap gap-2">
                        {SIZES.map((s) => <Choice key={s.value} selected={draft.size === s.value} onClick={() => set({ size: s.value })}>{s.label}</Choice>)}
                    </div>
                </Section>

                <Section title="Fecha del reporte">
                    <div className="flex flex-wrap gap-2">
                        {DATE_PRESETS.map((p) => <Choice key={p.label} selected={draft.dateFrom === daysAgo(p.days)} onClick={() => set({ dateFrom: draft.dateFrom === daysAgo(p.days) ? "" : daysAgo(p.days) })}>{p.label}</Choice>)}
                    </div>
                    <div className="flex items-center gap-3">
                        <label htmlFor="filtro-desde" className="shrink-0 text-sm text-muted-foreground">Desde</label>
                        <Input id="filtro-desde" type="date" max={iso(new Date())} value={draft.dateFrom} onChange={(e) => set({ dateFrom: e.target.value })} className="h-11 rounded-xl sm:max-w-[12rem]" />
                    </div>
                </Section>
            </div>

            <div className="flex items-center gap-3 border-t bg-card px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                <Button type="button" variant="ghost" className="h-12 rounded-full" onClick={() => setDraft({ ...EMPTY_FILTERS, q: value.q })} disabled={n === 0}>Limpiar</Button>
                <Button type="button" className="h-12 flex-1 rounded-full text-base" onClick={() => { onApply(draft); onClose() }}>
                    Aplicar{n > 0 ? ` (${n})` : ""}
                </Button>
            </div>
        </>
    )
}

// Barra de búsqueda + filtros rápidos (lugar, mascota, estado) + botón "Filtros" con el panel completo.
// `compact`: filtros rápidos en cuadrícula de 3 (portada); si no, en fila. El estado vive en el padre.
export function PetFilters({ value, onChange, onSubmit, compact = false }: { value: Filters; onChange: (f: Filters) => void; onSubmit?: () => void; compact?: boolean }) {
    const dialog = useRef<HTMLDialogElement>(null)
    const [sheetKey, setSheetKey] = useState(0)
    const set = (patch: Partial<Filters>) => onChange({ ...value, ...patch })
    const loc = value.location
    const type = TYPES.find((t) => t.value === value.petType) ?? TYPES[0]
        const setLoc = (patch: Partial<Location>) => set({ location: { ...loc, ...patch } })
    const total = countFilters(value)
    const provinces = loc.department ? Object.keys(PERU_LOCATIONS[loc.department] ?? {}) : []
    const districts = loc.department && loc.province ? PERU_LOCATIONS[loc.department]?.[loc.province] ?? [] : []

    const openSheet = () => { setSheetKey((k) => k + 1); dialog.current?.showModal() } // clave nueva = borrador desde lo aplicado
    const closeSheet = () => dialog.current?.close()

    // Filtros avanzados aplicados (raza, color, tamaño, fecha) como chips que se quitan de a uno.
    const extra: { key: string; label: string; clear: () => void }[] = [
        value.breed && { key: "breed", label: value.breed, clear: () => set({ breed: "" }) },
        value.color && { key: "color", label: value.color, clear: () => set({ color: "" }) },
        value.size !== "all" && { key: "size", label: `Tamaño ${value.size.toLowerCase()}`, clear: () => set({ size: "all" }) },
        value.dateFrom && { key: "date", label: `Desde ${fmtDate(value.dateFrom)}`, clear: () => set({ dateFrom: "" }) },
    ].filter(Boolean) as { key: string; label: string; clear: () => void }[]

    const filtersButton = (
        <Button
            type="button"
            variant="outline"
            onClick={openSheet}
            aria-haspopup="dialog"
            className={cn("h-10 shrink-0 gap-2 rounded-full border-input bg-card px-4 font-medium", compact && "max-sm:w-full")}
        >
            <SlidersHorizontal className="h-4 w-4 opacity-70" aria-hidden /> Filtros
            {total > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-bold text-primary-foreground">{total}</span>}
        </Button>
    )

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

            <div className={compact ? "grid grid-cols-[1fr_1.3fr] items-center gap-2 sm:flex sm:flex-wrap" : "flex flex-wrap items-center gap-2"}>
                <FilterChip
                    fill={compact}
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

                <FilterChip fill={compact} icon={type.icon} label={value.petType === "all" ? "Mascota" : type.label} active={value.petType !== "all"} onClear={() => set({ petType: "all", breed: "", color: "" })} className="w-52 p-2">
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

                {compact ? <div className="col-span-2 sm:col-auto">{filtersButton}</div> : filtersButton}
            </div>

            {(extra.length > 0 || total > 0) && (
                <div className="flex flex-wrap items-center gap-2" aria-label="Filtros aplicados">
                    {extra.map((e) => (
                        <button key={e.key} type="button" onClick={e.clear} aria-label={`Quitar filtro: ${e.label}`} className="inline-flex h-8 items-center gap-1.5 rounded-full border border-primary/30 bg-accent px-3 text-xs font-medium text-accent-foreground hover:bg-accent/70">
                            {e.key === "color" ? <Palette className="h-3.5 w-3.5" aria-hidden /> : e.key === "date" ? <Calendar className="h-3.5 w-3.5" aria-hidden /> : e.key === "size" ? <Ruler className="h-3.5 w-3.5" aria-hidden /> : <PawPrint className="h-3.5 w-3.5" aria-hidden />}
                            {e.label} <X className="h-3.5 w-3.5" aria-hidden />
                        </button>
                    ))}
                    {total > 0 && (
                        <Button type="button" variant="ghost" size="sm" onClick={() => onChange({ ...EMPTY_FILTERS, q: value.q })} className="h-8 gap-1 rounded-full px-3 text-xs text-muted-foreground">
                            <X className="h-3.5 w-3.5" aria-hidden /> Limpiar filtros
                        </Button>
                    )}
                </div>
            )}

            <dialog
                ref={dialog}
                aria-label="Filtros"
                onClick={(e) => { if (e.target === dialog.current) closeSheet() }}
                className="fixed inset-x-0 bottom-0 top-auto m-0 max-h-[92dvh] w-full max-w-none flex-col overflow-hidden rounded-t-3xl bg-card p-0 text-foreground shadow-[var(--shadow-lift)] backdrop:bg-black/40 open:flex md:inset-0 md:m-auto md:h-fit md:max-h-[88dvh] md:max-w-xl md:rounded-3xl"
            >
                <FiltersSheet key={sheetKey} value={value} onApply={onChange} onClose={closeSheet} />
            </dialog>
        </div>
    )
}
