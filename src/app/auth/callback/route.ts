
import { isSafeInternalPath } from '../../../lib/safe-path'

type ExchangeCodeForSession = (code: string) => Promise<{
    data: { session: unknown }
    error: unknown
}>

export async function handleAuthCallback(
    request: Request,
    exchangeCodeForSession: ExchangeCodeForSession,
) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = isSafeInternalPath(searchParams.get('next'), '/panel')

    if (code) {
        const { data, error } = await exchangeCodeForSession(code)

        if (!error && data.session) {
            return Response.redirect(new URL(next, origin), 307)
        }
    }

    // Si hay error o no hay code, redirigir a login con mensaje de error
    return Response.redirect(`${origin}/ingresar?error=auth-callback-failed`, 307)
}

export async function GET(request: Request) {
    const { createClient } = await import('@/utils/supabase/server')
    const supabase = await createClient()

    return handleAuthCallback(
        request,
        (code) => supabase.auth.exchangeCodeForSession(code),
    )
}
