export const IMAGE_UPLOAD_MAX_BYTES = 5 * 1024 * 1024
export const IMAGE_UPLOAD_ALLOWED_MIME_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
] as const

// Reduce a 1600 px (lado largo) y WebP: fotos nítidas, livianas y rápidas de cargar.
// Si el navegador no puede, se sube el archivo original (ya validado por getImageUploadError).
export async function prepareImageForUpload(file: File): Promise<{ blob: Blob; ext: string; type: string }> {
    const original = { blob: file as Blob, ext: file.name.split(".").pop() || "jpg", type: file.type }
    try {
        const bmp = await createImageBitmap(file, { imageOrientation: "from-image" })
        const scale = Math.min(1, 1600 / Math.max(bmp.width, bmp.height))
        const canvas = document.createElement("canvas")
        canvas.width = Math.round(bmp.width * scale)
        canvas.height = Math.round(bmp.height * scale)
        canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height)
        const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/webp", 0.85))
        return blob && blob.size < file.size ? { blob, ext: "webp", type: "image/webp" } : original
    } catch {
        return original
    }
}

export function getImageUploadError(file: File): string | null {
    if (!IMAGE_UPLOAD_ALLOWED_MIME_TYPES.includes(file.type as typeof IMAGE_UPLOAD_ALLOWED_MIME_TYPES[number])) {
        return "Solo se permiten imágenes JPG, PNG o WebP."
    }

    if (file.size > IMAGE_UPLOAD_MAX_BYTES) {
        return "Cada imagen debe pesar 5 MB o menos."
    }

    return null
}
