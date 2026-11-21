// Digital Asset Links: prueba a Android que la app (TWA) es dueña de este dominio.
// La huella SHA-256 sale de la clave de firmado (Play Console → Integridad de la app, o `bubblewrap fingerprint`).
export const dynamic = "force-static"

export function GET() {
    const fingerprints = (process.env.ANDROID_SHA256_FINGERPRINTS ?? "").split(",").map((s) => s.trim()).filter(Boolean)
    const body = fingerprints.length
        ? [{
            relation: ["delegate_permission/common.handle_all_urls"],
            target: { namespace: "android_app", package_name: "com.buscomimascotaperdida.app", sha256_cert_fingerprints: fingerprints },
        }]
        : []
    return Response.json(body)
}
