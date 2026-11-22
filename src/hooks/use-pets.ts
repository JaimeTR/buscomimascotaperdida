
import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'

export type Pet = {
    id: string
    owner_id: string
    name: string
    breed: string
    type: string
    gender?: string
    age?: string
    size?: string
    status: 'lost' | 'found' | 'reunited'
    image_urls: string[]
    last_seen_department: string
    last_seen_province: string
    last_seen_district: string
    last_seen_address?: string
    last_seen_lat?: number
    last_seen_lng?: number
    last_seen_date: string
    is_featured: boolean
    description?: string
    colors?: string[]
    microchip?: string
    personality?: string[]
    markings?: string
    sightings?: Sighting[]
    source_name?: string | null
    source_url?: string | null
}

export type Sighting = {
    id: string
    pet_id: string
    reporter_id: string
    lat: number
    lng: number
    district: string
    description: string
    image_url?: string
    created_at: string
    share_whatsapp?: boolean
    share_phone?: boolean
    share_email?: boolean
    reporter?: {
        full_name: string
        avatar_url: string
        whatsapp?: string
        instagram?: string
        facebook_url?: string
        phone?: string
        phone_public?: boolean
        email?: string
        email_public?: boolean
    }
}

type UsePetsOptions = {
    limit?: number
    featured?: boolean
    type?: string
    status?: string
    searchQuery?: string
    department?: string
    province?: string
    district?: string
    breed?: string
    color?: string
    dateFrom?: string
    size?: string
    enabled?: boolean // false: no consulta (el llamador ya tiene los datos)
}

// Filtros comunes a la lista simple y a la paginada (mismo criterio en ambas).
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- el constructor de consultas de supabase-js es genérico y cambia de tipo en cada paso
function applyFilters(query: any, options: UsePetsOptions) {
    // 'featured' se ignora: la tabla 'pets' no tiene columna is_featured.
    if (options.type && options.type !== 'all') query = query.eq('type', options.type.toLowerCase())
    if (options.status && options.status !== 'all') query = query.eq('status', options.status)
    if (options.department && options.department !== 'all') query = query.ilike('last_seen_department', `%${options.department}%`)
    if (options.province && options.province !== 'all') query = query.ilike('last_seen_province', `%${options.province}%`)
    if (options.district && options.district !== 'all') query = query.ilike('last_seen_district', `%${options.district}%`)
    if (options.breed && options.breed !== 'all') query = query.ilike('breed', `%${options.breed}%`)

    if (options.color && options.color !== 'all') {
        // `colors` es un arreglo y `contains` distingue mayúsculas: los casos importados guardan "blanco"
        // y el formulario "Blanco", así que se buscan ambas formas.
        const lower = options.color.trim().toLowerCase().replace(/[^\p{L} ]/gu, '')
        const cap = lower.charAt(0).toUpperCase() + lower.slice(1)
        query = query.or(`colors.cs.{${lower}},colors.cs.{${cap}}`)
    }

    if (options.size && options.size !== 'all') query = query.eq('size', options.size)
    if (options.dateFrom) query = query.gte('last_seen_date', options.dateFrom)

    if (options.searchQuery) {
        // Quitar caracteres con significado en la sintaxis de filtros PostgREST.
        const q = options.searchQuery.replace(/[,()%*\\]/g, ' ').trim()
        if (q) query = query.or(`name.ilike.%${q}%,breed.ilike.%${q}%,description.ilike.%${q}%`)
    }
    return query
}

export function usePets(options: UsePetsOptions = {}) {
    const [pets, setPets] = useState<Pet[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()

    useEffect(() => {
        let cancelled = false
        if (options.enabled === false) return
        const fetchPets = async () => {
            setIsLoading(true)
            setError(null)

            try {
                let query = supabase.from('pets').select('*').order('created_at', { ascending: false })
                if (options.limit) query = query.limit(options.limit)
                query = applyFilters(query, options)

                const { data, error } = await query
                if (cancelled) return // respuesta obsoleta: ya hay otra consulta más nueva

                if (error) throw error

                setPets(data as Pet[])

            } catch (err) {
                if (cancelled) return
                console.error("Error fetching pets details:", JSON.stringify(err, null, 2))
                setError(err instanceof Error ? err.message : "Error desconocido al obtener mascotas")
                setPets([])
            } finally {
                if (!cancelled) setIsLoading(false)
            }
        }

        // Debounce solo al escribir en el buscador; los filtros de selección aplican al instante.
        const timer = setTimeout(fetchPets, options.searchQuery ? 300 : 0)
        return () => {
            cancelled = true
            clearTimeout(timer)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps -- se compara por campos: `options` es un objeto nuevo en cada render
    }, [
        options.limit,
        options.featured,
        options.type,
        options.status,
        options.searchQuery,
        options.department,
        options.province,
        options.district,
        options.breed,
        options.color,
        options.dateFrom,
        options.size,
        options.enabled,
        supabase
    ])

    return { pets, isLoading: options.enabled === false ? false : isLoading, error }
}

/**
 * Lista paginada en la base de datos: pide `pageSize` casos por vez y `loadMore()` trae los siguientes,
 * así la página no descarga todo de golpe. `total` es el conteo real con los filtros aplicados.
 */
export function useInfinitePets(options: Omit<UsePetsOptions, 'limit' | 'enabled'> = {}, pageSize = 12) {
    const [pets, setPets] = useState<Pet[]>([])
    const [total, setTotal] = useState(0)
    const [isLoading, setIsLoading] = useState(true) // primera página
    const [isLoadingMore, setIsLoadingMore] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()
    const generation = useRef(0) // descarta respuestas de una búsqueda anterior
    const busy = useRef(false)
    const loaded = useRef(0)

    const fetchPage = useCallback(async (from: number, gen: number) => {
        let query = supabase.from('pets').select('*', { count: 'exact' }).order('created_at', { ascending: false }).order('id').range(from, from + pageSize - 1)
        query = applyFilters(query, options)
        const { data, error, count } = await query
        if (gen !== generation.current) return null
        if (error) throw error
        return { rows: (data ?? []) as Pet[], count: count ?? 0 }
        // eslint-disable-next-line react-hooks/exhaustive-deps -- `options` se compara por sus campos en la clave de abajo
    }, [supabase, pageSize, options.type, options.status, options.searchQuery, options.department, options.province, options.district, options.breed, options.color, options.dateFrom, options.size])

    // Nueva búsqueda: se reinicia y se pide la primera página.
    useEffect(() => {
        const gen = ++generation.current
        busy.current = false
        loaded.current = 0
        const run = async () => {
            setIsLoading(true)
            setError(null)
            try {
                const res = await fetchPage(0, gen)
                if (!res) return
                setPets(res.rows)
                setTotal(res.count)
                loaded.current = res.rows.length
            } catch (err) {
                if (gen !== generation.current) return
                console.error('Error fetching pets:', JSON.stringify(err, null, 2))
                setError(err instanceof Error ? err.message : 'Error desconocido al obtener mascotas')
                setPets([])
                setTotal(0)
            } finally {
                if (gen === generation.current) setIsLoading(false)
            }
        }
        const timer = setTimeout(run, options.searchQuery ? 300 : 0)
        return () => clearTimeout(timer)
    }, [fetchPage, options.searchQuery])

    const hasMore = pets.length < total
    const loadMore = useCallback(async () => {
        if (busy.current || isLoading || loaded.current >= total) return
        busy.current = true
        setIsLoadingMore(true)
        const gen = generation.current
        try {
            const res = await fetchPage(loaded.current, gen)
            if (!res) return
            loaded.current += res.rows.length
            setPets((prev) => [...prev, ...res.rows.filter((r) => !prev.some((p) => p.id === r.id))])
            if (res.rows.length === 0) setTotal(loaded.current) // evita pedir páginas vacías para siempre
        } catch (err) {
            console.error('Error loading more pets:', JSON.stringify(err, null, 2))
            setTotal(loaded.current) // se detiene la carga; lo ya cargado sigue visible
        } finally {
            busy.current = false
            if (gen === generation.current) setIsLoadingMore(false)
        }
    }, [fetchPage, isLoading, total])

    return { pets, total, isLoading, isLoadingMore, hasMore, loadMore, error }
}
