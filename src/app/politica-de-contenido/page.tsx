import Link from "next/link"
import { LegalPage, LEGAL_EMAIL } from "@/components/legal-page"

export const metadata = { title: "Política de contenido | Busco mi mascota", description: "Qué se puede y qué no se puede publicar, y cómo denunciar un reporte.", alternates: { canonical: "/politica-de-contenido" } }

export default function ContentPolicyPage() {
    return (
        <LegalPage
            title="Política de contenido"
            intro={<p>Esta red funciona porque las personas confían en lo que ven. Estas reglas complementan los <Link href="/terminos">Términos y condiciones</Link>.</p>}
            sections={[
                { title: "Qué sí se publica", body: <ul className="list-disc space-y-1 pl-5"><li>Casos reales de mascotas perdidas, encontradas o avistadas.</li><li>Fotos propias o con permiso de quien las tomó.</li><li>Datos de contacto solo si quieres que sean públicos.</li></ul> },
                { title: "Qué no se permite", body: <ul className="list-disc space-y-1 pl-5"><li>Reportes falsos, duplicados a propósito o ya resueltos que se dejan como activos.</li><li>Fotos de otras personas o de mascotas ajenas sin permiso.</li><li>Pedir dinero por adelantado para devolver una mascota o cualquier intento de estafa.</li><li>Publicidad disfrazada de reporte, contenido ofensivo, violento o que exponga a menores.</li><li>Datos personales de terceros sin su consentimiento.</li></ul> },
                { title: "Cómo denunciar", body: <p>En cada reporte hay un enlace «Denunciar este reporte». También puedes escribirnos desde <Link href="/contacto?tipo=denuncia">el formulario</Link> o a <a href={`mailto:${LEGAL_EMAIL}`}>{LEGAL_EMAIL}</a> con el enlace del caso y el motivo.</p> },
                { title: "Qué hacemos", body: <p>El equipo revisa las denuncias y puede ocultar o eliminar reportes que incumplan estas reglas, y suspender cuentas que reincidan. Si el caso involucra un delito, podemos conservar la información necesaria para colaborar con las autoridades.</p> },
                { title: "Si tu reporte fue ocultado", body: <p>Escríbenos con el enlace y revisamos de nuevo. Corregir los datos o las fotos suele bastar.</p> },
            ]}
        />
    )
}
