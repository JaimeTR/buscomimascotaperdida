import Link from "next/link"
import { LegalPage } from "@/components/legal-page"

export const metadata = { title: "Términos y condiciones | Busco mi mascota", description: "Condiciones de uso de la red comunitaria Busco mi mascota.", alternates: { canonical: "/terminos" } }

export default function TermsPage() {
    return (
        <LegalPage
            title="Términos y condiciones"
            intro={<p>Estos términos regulan el uso de BuscoMiMascotaPerdida.com (la «Plataforma»), una red comunitaria gratuita para encontrar mascotas perdidas en Perú. Al usarla, los aceptas.</p>}
            sections={[
                { title: "Qué es la Plataforma", body: <p>Un espacio donde personas publican reportes de mascotas perdidas, encontradas o avistadas, y se contactan entre sí. Somos un intermediario: no recuperamos mascotas ni verificamos a los usuarios y no garantizamos ningún resultado.</p> },
                { title: "Requisitos y cuenta", body: (<>
                    <p>Debes tener 18 años o más, o contar con autorización de tu padre, madre o tutor. Para publicar reportes o avistamientos necesitas una cuenta, que puedes crear con correo y contraseña, Google o Facebook.</p>
                    <p>Eres responsable de tu contraseña y de lo que ocurra en tu cuenta. Avísanos si sospechas un uso no autorizado.</p>
                </>) },
                { title: "Reglas de uso", body: (<>
                    <p>Te comprometes a:</p>
                    <ul>
                        <li>Publicar información veraz, actual y sobre casos reales. Retira el reporte cuando la mascota aparezca.</li>
                        <li>Subir solo fotos que te pertenezcan o que tengas derecho a usar.</li>
                        <li>No usar la Plataforma para fraude, estafas (por ejemplo pedir dinero por «recompensas» o «envíos»), spam, acoso ni venta de animales.</li>
                        <li>No publicar contenido ofensivo, ilegal ni datos personales de terceros sin su consentimiento.</li>
                        <li>No usar bots, scraping masivo ni intentar vulnerar la seguridad del sitio.</li>
                    </ul>
                </>) },
                { title: "Contacto entre usuarios y seguridad", body: <p>Al contactar o reunirte con otra persona, hazlo bajo tu responsabilidad: cita en lugares públicos, acompañado y sin adelantar dinero. No somos parte de lo que acuerden los usuarios ni responsables de ello. Los datos de contacto solo se muestran si el dueño del reporte decide hacerlos públicos.</p> },
                { title: "Contenido que publicas", body: <p>Sigues siendo titular de tus textos y fotos. Nos das una licencia gratuita, no exclusiva y limitada para mostrarlos, almacenarlos y difundirlos (incluidos carteles y redes sociales) con el único fin de ayudar a encontrar a la mascota. Puedes borrar tu reporte cuando quieras; las copias ya compartidas por terceros quedan fuera de nuestro control.</p> },
                { title: "Moderación", body: <p>Podemos ocultar o eliminar reportes y suspender cuentas que incumplan estos términos o que parezcan falsos o peligrosos, con o sin aviso previo. Si ves contenido indebido, <Link href="/contacto">avísanos</Link> indicando el enlace.</p> },
                { title: "Anuncios, aliados y promociones", body: <p>La Plataforma puede mostrar anuncios y espacios de aliados (veterinarias, tiendas, refugios). Están señalizados como tales. Los servicios de promoción de pago se rigen por las condiciones indicadas al contratarlos. No respondemos por los productos o servicios de terceros anunciados.</p> },
                { title: "Notificaciones", body: <p>Si lo activas, te enviaremos correos y notificaciones push sobre reportes de tu zona o coincidencias con tu caso. Puedes desactivarlas en tu perfil o desde tu navegador en cualquier momento.</p> },
                { title: "Propiedad intelectual", body: <p>La marca, el logo, el diseño y el código de la Plataforma son nuestros o están licenciados a nosotros. Las fotos de stock usadas como ilustración provienen de Pexels y no representan casos reales.</p> },
                { title: "Limitación de responsabilidad", body: <p>La Plataforma se ofrece «tal cual» y sin garantía de disponibilidad continua. En la máxima medida permitida por la ley, no respondemos por daños derivados de reportes falsos, del contacto entre usuarios, de interrupciones del servicio ni de la pérdida de una mascota. Nada de esto limita los derechos que la ley peruana te reconoce como consumidor.</p> },
                { title: "Privacidad, cookies y reclamos", body: <p>El tratamiento de tus datos se explica en la <Link href="/privacidad">Política de privacidad</Link> y la <Link href="/cookies">Política de cookies</Link>. Puedes presentar una queja o reclamo en nuestro <Link href="/libro-de-reclamaciones">Libro de reclamaciones</Link>.</p> },
                { title: "Cambios", body: <p>Podemos actualizar estos términos. Publicaremos la versión vigente con su fecha y, si el cambio es importante, te avisaremos en la Plataforma o por correo. Seguir usando el servicio implica aceptarlos.</p> },
                { title: "Ley aplicable", body: <p>Se rigen por las leyes de la República del Perú. Las controversias se someten a los jueces y tribunales de Lima, sin perjuicio de los derechos del consumidor ante INDECOPI.</p> },
            ]}
        />
    )
}
