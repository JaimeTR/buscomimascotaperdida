/**
 * Utilidad para traducir mensajes de error de Supabase al español
 */

export const translateSupabaseError = (errorMessage: string): string => {
    const translations: Record<string, string> = {
        // Password errors
        'New password should be different from the old password': 'La nueva contraseña debe ser diferente a la anterior',
        'Password should be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres',
        'Password is too weak': 'La contraseña es demasiado débil',
        'Invalid password': 'Contraseña inválida',

        // Auth errors
        'Invalid login credentials': 'Credenciales de inicio de sesión inválidas',
        'Email not confirmed': 'Email no confirmado',
        'User not found': 'Usuario no encontrado',
        'Invalid email': 'Email inválido',
        'Email already registered': 'Email ya registrado',
        'User already registered': 'El usuario ya está registrado',

        // Session errors
        'Session expired': 'Sesión expirada',
        'Refresh token not found': 'Token de sesión no encontrado',
        'Invalid refresh token': 'Token de sesión inválido',
        'Auth session missing': 'Sesión no encontrada',

        // General errors
        'Unable to validate email address: invalid format': 'Formato de email inválido',
        'Network request failed': 'Error de conexión',
        'Failed to fetch': 'Error de conexión con el servidor',
        'Too many requests': 'Demasiados intentos. Por favor espera un momento',

        // Registration errors
        'Email rate limit exceeded': 'Has enviado demasiados emails. Espera unos minutos',
        'Signup disabled': 'El registro está deshabilitado temporalmente',

        // OTP/Verification errors
        'Token has expired or is invalid': 'El enlace ha expirado o es inválido',
        'Email link is invalid or has expired': 'El enlace de email ha expirado o es inválido',
    }

    // Buscar traducción exacta
    if (translations[errorMessage]) {
        return translations[errorMessage]
    }

    // Buscar traducción parcial (coincidencia parcial)
    for (const [key, value] of Object.entries(translations)) {
        if (errorMessage.toLowerCase().includes(key.toLowerCase())) {
            return value
        }
    }

    // Si no hay traducción, devolver mensaje genérico en español
    return 'Ha ocurrido un error. Por favor intenta de nuevo.'
}

/**
 * Traduce errores comunes de validación
 */
export const getValidationErrorMessage = (field: string, type: string): string => {
    const messages: Record<string, Record<string, string>> = {
        email: {
            required: 'El email es requerido',
            invalid: 'El email no es válido',
        },
        password: {
            required: 'La contraseña es requerida',
            minLength: 'La contraseña debe tener al menos 6 caracteres',
            weak: 'La contraseña es demasiado débil',
            mismatch: 'Las contraseñas no coinciden',
        },
        name: {
            required: 'El nombre es requerido',
            minLength: 'El nombre es demasiado corto',
        },
        phone: {
            required: 'El teléfono es requerido',
            invalid: 'El número de teléfono no es válido',
        },
    }

    return messages[field]?.[type] || 'Campo inválido'
}
