import { NextResponse } from "next/server"
import { getFeaturedPets } from "@/lib/featured"
import { methodNotAllowedResponse } from "@/lib/safe-error"

// Siempre dinámico (si no, Next lo prerenderiza una vez en el build); el CDN lo cachea por cabecera.
export const dynamic = "force-dynamic"

// Casos destacados para el aviso flotante de las demás páginas. Solo datos públicos y mínimos; se cachea 5 minutos.
export async function GET() {
    const pets = await getFeaturedPets(5)
    return NextResponse.json(
        pets.map((p) => ({ id: p.id, name: p.name, type: p.type, status: p.status, district: p.last_seen_district, image: p.image_urls?.[0] ?? null })),
        { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } },
    )
}

export const POST = methodNotAllowedResponse
export const PUT = methodNotAllowedResponse
export const PATCH = methodNotAllowedResponse
export const DELETE = methodNotAllowedResponse
