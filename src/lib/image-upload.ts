export const IMAGE_UPLOAD_MAX_BYTES = 5 * 1024 * 1024
export const IMAGE_UPLOAD_ALLOWED_MIME_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
] as const

export function getImageUploadError(file: File): string | null {
    if (!IMAGE_UPLOAD_ALLOWED_MIME_TYPES.includes(file.type as typeof IMAGE_UPLOAD_ALLOWED_MIME_TYPES[number])) {
        return "Solo se permiten imágenes JPG, PNG o WebP."
    }

    if (file.size > IMAGE_UPLOAD_MAX_BYTES) {
        return "Cada imagen debe pesar 5 MB o menos."
    }

    return null
}
