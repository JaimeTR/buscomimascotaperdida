import { isSafeInternalPath } from "@/lib/safe-path"

export function getForgotPasswordPath(next: string | null): string {
    const safeNext = isSafeInternalPath(next, "/dashboard")
    return `/forgot-password?next=${encodeURIComponent(safeNext)}`
}

export function getRecoveryPath(next: string | null): string {
    const safeNext = isSafeInternalPath(next, "/dashboard")
    return `/update-password?next=${encodeURIComponent(safeNext)}`
}
