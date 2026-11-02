import 'server-only'

export type ServerEnv = {
    supabaseUrl: string
    supabaseAnonKey: string
    appUrl?: string
    resendApiKey?: string
    huggingfaceApiKey?: string
    chatbotProviderReady: boolean
    emailTestToken?: string
}

function readEnv(name: string): string | undefined {
    const value = process.env[name]?.trim()
    return value || undefined
}

export function assertServerEnv(): ServerEnv {
    const supabaseUrl = readEnv('NEXT_PUBLIC_SUPABASE_URL')
    const supabaseAnonKey = readEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
    const appUrl = readEnv('NEXT_PUBLIC_APP_URL')
    const missing = [
        !supabaseUrl && 'NEXT_PUBLIC_SUPABASE_URL',
        !supabaseAnonKey && 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        process.env.NODE_ENV === 'production' && !appUrl && 'NEXT_PUBLIC_APP_URL',
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
        appUrl,
        resendApiKey: readEnv('RESEND_API_KEY'),
        huggingfaceApiKey: readEnv('HUGGINGFACE_API_KEY'),
        chatbotProviderReady: Boolean(readEnv('HUGGINGFACE_API_KEY')),
        emailTestToken: readEnv('EMAIL_TEST_TOKEN'),
    }
}
