import Link from "next/link"
import { LegalPage } from "@/components/legal-page"

export const metadata = { title: "Política de cookies | Busco mi mascota", description: "Qué cookies y almacenamiento local usa Busco mi mascota y para qué.", alternates: { canonical: "/cookies" } }

const rows: [string, string, string][] = [
    ["sb-…-auth-token", "Cookie necesaria", "Mantiene tu sesión iniciada (autenticación)."],
    ["bmm.email", "Almacenamiento local", "Recuerda tu correo en el formulario de acceso si marcas «Recordar mi correo»."],
    ["bmm.me", "Almacenamiento local", "Guarda tu nombre y foto para mostrarlos al instante en el encabezado."],
    ["pwa-prompt-dismissed", "Almacenamiento local", "Recuerda que cerraste el aviso de instalar la aplicación."],
]

export default function CookiesPage() {
    return (
        <LegalPage
            title="Política de cookies"
            intro={<p>Usamos solo lo imprescindible para que el sitio funcione y recuerde tus preferencias. No usamos cookies de publicidad ni de seguimiento entre sitios.</p>}
            sections={[
                { title: "Qué usamos", body: (
                    <div className="overflow-x-auto rounded-xl border">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-muted/50"><tr><th className="p-3">Nombre</th><th className="p-3">Tipo</th><th className="p-3">Para qué</th></tr></thead>
                            <tbody>{rows.map(([n, t, d]) => <tr key={n} className="border-t"><td className="p-3 font-mono text-xs">{n}</td><td className="p-3">{t}</td><td className="p-3">{d}</td></tr>)}</tbody>
                        </table>
                    </div>
                ) },
                { title: "Servicios de terceros", body: <p>Al cargar mapas, tu navegador se conecta a OpenStreetMap; si inicias sesión con Google o Facebook, esos servicios aplican sus propias políticas. Los errores técnicos pueden registrarse con Sentry.</p> },
                { title: "Cómo controlarlas", body: <p>Puedes borrar cookies y datos del sitio desde la configuración de tu navegador. Si bloqueas las necesarias, no podrás mantener la sesión iniciada. Si cierras sesión, borramos tu nombre y foto guardados en el equipo.</p> },
                { title: "Más información", body: <p>Consulta también la <Link href="/privacidad">Política de privacidad</Link>.</p> },
            ]}
        />
    )
}
