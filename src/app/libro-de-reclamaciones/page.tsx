import { LegalPage, LEGAL_EMAIL } from "@/components/legal-page"

export const metadata = { title: "Libro de reclamaciones | Busco mi mascota", description: "Presenta una queja o reclamo sobre Busco mi mascota.", alternates: { canonical: "/libro-de-reclamaciones" } }

const mailto = `mailto:${LEGAL_EMAIL}?subject=${encodeURIComponent("Libro de reclamaciones")}&body=${encodeURIComponent(
    "Nombre completo:\nDocumento de identidad:\nDomicilio:\nTeléfono y correo:\n\nTipo (Reclamo = disconformidad con el servicio / Queja = malestar no ligado al servicio):\n\nDetalle del hecho:\n\nPedido del consumidor:\n",
)}`

export default function ReclamacionesPage() {
    return (
        <LegalPage
            title="Libro de reclamaciones"
            intro={<p>Conforme al Código de Protección y Defensa del Consumidor (Ley N° 29571), puedes registrar aquí un reclamo o una queja sobre nuestros servicios.</p>}
            sections={[
                { title: "Cómo presentarlo", body: (<>
                    <p>Escríbenos con los datos de abajo. Te respondemos por el mismo medio en un plazo máximo de 15 días hábiles.</p>
                    <a href={mailto} className="inline-flex min-h-11 items-center rounded-xl bg-primary px-5 font-semibold !text-primary-foreground !no-underline hover:opacity-90">Presentar reclamo o queja por correo</a>
                </>) },
                { title: "Datos que debe incluir", body: (<ul>
                    <li>Nombre completo, documento de identidad, domicilio, teléfono y correo.</li>
                    <li>Si es <strong>reclamo</strong> (disconformidad con el servicio) o <strong>queja</strong> (malestar no relacionado con el servicio).</li>
                    <li>Detalle de lo ocurrido y lo que pides como solución.</li>
                </ul>) },
                { title: "Si no estás conforme", body: <p>Puedes acudir al INDECOPI una vez presentado tu reclamo. Presentarlo aquí no impide ese derecho.</p> },
            ]}
        />
    )
}
