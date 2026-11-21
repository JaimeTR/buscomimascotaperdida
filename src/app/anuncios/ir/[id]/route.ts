import { NextResponse } from "next/server"
import { z } from "zod"
import { createPublicClient } from "@/utils/supabase/public"

// Cuenta el clic y redirige al destino del anuncio (solo https). Si el anuncio no existe o venció, vuelve a /anuncios.
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const parsed = z.string().uuid().safeParse((await params).id)
    const home = new URL("/anuncios", request.url)
    if (!parsed.success) return NextResponse.redirect(home)

    const { data } = await createPublicClient().rpc("ad_click", { p_id: parsed.data })
    if (typeof data !== "string" || !data.startsWith("https://")) return NextResponse.redirect(home)
    return NextResponse.redirect(data, 302)
}
