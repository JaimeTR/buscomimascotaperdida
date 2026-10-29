
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { isSafeInternalPath } from '@/lib/safe-path'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = isSafeInternalPath(searchParams.get('next'), '/dashboard')

    if (code) {
        const supabase = await createClient()
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error && data.session) {
            return NextResponse.redirect(new URL(next, origin))
        }
    }

    // Si hay error o no hay code, redirigir a login con mensaje de error
    return NextResponse.redirect(`${origin}/login?error=auth-callback-failed`)
}
