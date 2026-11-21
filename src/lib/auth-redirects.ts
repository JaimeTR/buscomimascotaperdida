import { isSafeInternalPath } from "@/lib/safe-path"

export function getForgotPasswordPath(next: string | null): string {
    const safeNext = isSafeInternalPath(next, "/panel")
    return `/recuperar-contrasena?next=${encodeURIComponent(safeNext)}`
}

export function getRecoveryPath(next: string | null): string {
    const safeNext = isSafeInternalPath(next, "/panel")
    return `/nueva-contrasena?next=${encodeURIComponent(safeNext)}`
}
