import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { isGuestOnlyPath, isProtectedPath, loginReason } from '@/lib/auth-guard'
import { isSafeInternalPath } from '@/lib/safe-path'

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

    // Guard de servidor: sin sesión nunca se sirven las rutas protegidas (RLS sigue siendo la barrera de datos);
    // con sesión, login/registro mandan directo a donde ibas.
    const { pathname, search } = request.nextUrl
    if (!user && isProtectedPath(pathname)) {
        const url = request.nextUrl.clone()
        url.pathname = '/ingresar'
        const params = new URLSearchParams({ next: pathname + search })
        const reason = loginReason(pathname)
        if (reason) params.set('reason', reason)
        url.search = `?${params}`
        return NextResponse.redirect(url)
    }
    if (user && isGuestOnlyPath(pathname)) {
        const url = request.nextUrl.clone()
        const next = isSafeInternalPath(request.nextUrl.searchParams.get('next'), '/panel')
        url.pathname = next.split('?')[0]
        url.search = next.includes('?') ? `?${next.split('?')[1]}` : ''
        return NextResponse.redirect(url)
    }

    return response
}
