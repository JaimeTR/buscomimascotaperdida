import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    const response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        request.cookies.set(name, value)
                        response.cookies.set(name, value, options)
                    })
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()

    // Guard de servidor: el dashboard nunca se sirve sin sesión (RLS sigue siendo la barrera de datos).
    const { pathname } = request.nextUrl
    if (!user && (pathname === '/dashboard' || pathname.startsWith('/dashboard/'))) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        url.search = `?next=${encodeURIComponent(pathname)}`
        return NextResponse.redirect(url)
    }

    return response
}
