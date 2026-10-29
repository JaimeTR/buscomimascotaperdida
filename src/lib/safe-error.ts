export function getSafeErrorMessage(
    error: unknown,
    fallback = 'Unexpected server error'
): string {
    if (error instanceof Error && error.message.trim()) {
        return error.message
    }

    if (typeof error === 'string' && error.trim()) {
        return error
    }

    return fallback
}

export function getSafeErrorCode(error: unknown): string {
    if (typeof error !== 'object' || error === null || !('code' in error)) {
        return 'unknown'
    }

    const code = (error as { code?: unknown }).code
    return typeof code === 'string' && code.trim() ? code.slice(0, 64) : 'unknown'
}
