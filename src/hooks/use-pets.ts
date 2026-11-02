
import { useState, useEffect } from 'react'
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
}

export function usePets(options: UsePetsOptions = {}) {
    const [pets, setPets] = useState<Pet[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()

    useEffect(() => {
        const fetchPets = async () => {
            setIsLoading(true)
            setError(null)

            try {
                let query = supabase
                    .from('pets')
                    .select('*')
                    .order('created_at', { ascending: false })

                // Apply Filters
                if (options.limit) {
                    query = query.limit(options.limit)
                }

                // FIXME: Uncomment this when 'is_featured' column is added to the 'pets' table
                // if (options.featured !== undefined) {
                //     query = query.eq('is_featured', options.featured)
                // }

                if (options.type && options.type !== 'all') {
                    query = query.eq('type', options.type.toLowerCase())
                }

                if (options.status && options.status !== 'all') {
                    query = query.eq('status', options.status)
                }

                if (options.department && options.department !== 'all') {
                    query = query.ilike('last_seen_department', `%${options.department}%`)
                }

                if (options.province && options.province !== 'all') {
                    query = query.ilike('last_seen_province', `%${options.province}%`)
                }

                if (options.district && options.district !== 'all') {
                    query = query.ilike('last_seen_district', `%${options.district}%`)
                }

                if (options.breed && options.breed !== 'all') {
                    query = query.ilike('breed', `%${options.breed}%`)
                }


                if (options.color && options.color !== 'all') {
                    // Assuming colors is an array in DB, check if it contains the selected color
                    query = query.contains('colors', [options.color])
                }

                if (options.size && options.size !== 'all') {
                    query = query.eq('size', options.size)
                }

                if (options.dateFrom) {
                    query = query.gte('last_seen_date', options.dateFrom)
                }

                if (options.searchQuery) {
                    // Broad search on name, breed or description
                    // Quitar caracteres con significado en la sintaxis de filtros PostgREST.
                    const q = options.searchQuery.replace(/[,()%*\\]/g, ' ').trim()
                    if (q) query = query.or(`name.ilike.%${q}%,breed.ilike.%${q}%,description.ilike.%${q}%`)
                }

                const { data, error } = await query

                if (error) throw error

                setPets(data as Pet[])

            } catch (err) {
                console.error("Error fetching pets details:", JSON.stringify(err, null, 2))
                setError(err instanceof Error ? err.message : "Error desconocido al obtener mascotas")
                setPets([])
            } finally {
                setIsLoading(false)
            }
        }

        fetchPets()
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
        options.dateFrom
    ])

    return { pets, isLoading, error }
}
