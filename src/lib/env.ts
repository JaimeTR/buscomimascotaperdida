export type ServerEnv = {
    supabaseUrl: string
    supabaseAnonKey: string
    appUrl?: string
    resendApiKey?: string
    huggingfaceApiKey?: string
}

function readEnv(name: string): string | undefined {
    const value = process.env[name]?.trim()
    return value || undefined
}

export function assertServerEnv(): ServerEnv {
    const supabaseUrl = readEnv('NEXT_PUBLIC_SUPABASE_URL')
    const supabaseAnonKey = readEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
    const missing = [
        !supabaseUrl && 'NEXT_PUBLIC_SUPABASE_URL',
        !supabaseAnonKey && 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    ].filter((name): name is string => Boolean(name))

    if (missing.length > 0) {
        throw new Error(
            `Missing required server environment variables: ${missing.join(', ')}`
        )
    }

    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Missing required Supabase server environment variables')
    }

    return {
        supabaseUrl,
        supabaseAnonKey,
        appUrl: readEnv('NEXT_PUBLIC_APP_URL'),
        resendApiKey: readEnv('RESEND_API_KEY'),
        huggingfaceApiKey: readEnv('HUGGINGFACE_API_KEY'),
    }
}

export function isSafeInternalPath(
    value: string | null,
    fallback: string
): string {
    if (!value || !value.startsWith('/') || value.startsWith('//')) {
        return fallback
    }

    if (value.includes('\\') || /[\u0000-\u001f\u007f]/.test(value)) {
        return fallback
    }

    return value
}
