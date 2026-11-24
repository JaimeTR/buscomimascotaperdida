import { PERU_LOCATIONS } from "@/lib/peru-locations"

const strip = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "")

export const slugify = (s: string) => strip(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")

const ALL_DISTRICTS = Array.from(new Set(
    Object.values(PERU_LOCATIONS).flatMap((provs) => Object.values(provs).flat()),
))

/** Nombre real del distrito a partir de su slug en la URL (null si no existe). */
export function districtFromSlug(slug: string): string | null {
    return ALL_DISTRICTS.find((d) => slugify(d) === slug) ?? null
}

export const SPECIES = {
    perros: { type: "dog", singular: "perro", plural: "perros", article: "un" },
    gatos: { type: "cat", singular: "gato", plural: "gatos", article: "un" },
} as const

export type SpeciesSlug = keyof typeof SPECIES
export const isSpecies = (s: string): s is SpeciesSlug => s in SPECIES
