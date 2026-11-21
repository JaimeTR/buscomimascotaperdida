import Link from "next/link"
import { LegalPage, LEGAL_EMAIL } from "@/components/legal-page"

export const metadata = { title: "Política de privacidad | Busco mi mascota", description: "Cómo tratamos tus datos personales según la Ley N° 29733 de Perú.", alternates: { canonical: "/privacidad" } }

export default function PrivacyPage() {
    return (
        <LegalPage
            title="Política de privacidad"
            intro={<p>Respetamos tu privacidad y tratamos tus datos conforme a la Ley N° 29733, Ley de Protección de Datos Personales, y su Reglamento (D.S. N° 003-2013-JUS). Aquí te explicamos qué datos usamos, para qué y qué control tienes.</p>}
            sections={[
                { title: "Responsable del tratamiento", body: <p>El responsable es el titular de BuscoMiMascotaPerdida.com. Puedes contactarlo en <a href={`mailto:${LEGAL_EMAIL}`}>{LEGAL_EMAIL}</a> para cualquier tema de privacidad.</p> },
                { title: "Datos que recopilamos", body: (<ul>
                    <li><strong>Cuenta:</strong> nombre, correo y contraseña (almacenada cifrada por nuestro proveedor de autenticación). Si entras con Google o Facebook, recibimos tu nombre, correo y foto de perfil; nunca tu contraseña de esos servicios.</li>
                    <li><strong>Perfil (opcional o al reportar):</strong> teléfono/WhatsApp, redes sociales, departamento y distrito.</li>
                    <li><strong>Reportes:</strong> fotos y descripción de la mascota, fecha y ubicación aproximada del hecho, y los avistamientos que registres.</li>
                    <li><strong>Notificaciones:</strong> si activas las alertas push, la suscripción de tu navegador.</li>
                    <li><strong>Datos técnicos:</strong> dirección IP, navegador y errores de la aplicación, para seguridad y diagnóstico.</li>
                    <li><strong>Ubicación del dispositivo:</strong> solo si tú la autorizas en el navegador, para centrar mapas o marcar un punto; no se guarda de forma continua.</li>
                    <li><strong>Mensajes al asistente virtual y a contacto:</strong> el contenido que escribas.</li>
                </ul>) },
                { title: "Para qué los usamos", body: (<ul>
                    <li>Crear y mantener tu cuenta y permitirte publicar reportes y avistamientos.</li>
                    <li>Mostrar tus reportes públicamente y, solo si lo decides, tus datos de contacto.</li>
                    <li>Avisarte de mascotas perdidas o encontradas cerca de tu zona o que coincidan con tu caso.</li>
                    <li>Enviar correos del servicio (confirmación de cuenta, recuperación de contraseña, alertas).</li>
                    <li>Prevenir fraude y abuso, moderar contenido y mejorar el servicio.</li>
                </ul>) },
                { title: "Base legal", body: <p>Tratamos tus datos con tu consentimiento (al registrarte y aceptar esta política) y para ejecutar el servicio que solicitas. Puedes retirar tu consentimiento en cualquier momento, sin efecto retroactivo.</p> },
                { title: "Con quién los compartimos", body: (<>
                    <p>No vendemos tus datos. Usamos proveedores que los tratan solo por encargo nuestro:</p>
                    <ul>
                        <li><strong>Supabase:</strong> base de datos, autenticación y almacenamiento de imágenes.</li>
                        <li><strong>Hostinger:</strong> alojamiento del sitio.</li>
                        <li><strong>Resend:</strong> envío de correos.</li>
                        <li><strong>Google y Facebook (Meta):</strong> solo si eliges iniciar sesión con ellos.</li>
                        <li><strong>Sentry:</strong> registro de errores técnicos.</li>
                        <li><strong>OpenStreetMap:</strong> mapas (tu navegador consulta sus servidores de mosaicos).</li>
                        <li><strong>Servicios de IA (Google Gemini / Hugging Face):</strong> procesan los mensajes que escribes al asistente virtual. No escribas datos sensibles en él.</li>
                    </ul>
                    <p>También podemos revelar datos si una autoridad competente lo exige conforme a ley.</p>
                </>) },
                { title: "Qué es público", body: <p>Las fotos, descripción, zona aproximada y estado de un reporte son visibles para cualquier visitante, y pueden compartirse en redes y carteles. Tu teléfono o WhatsApp solo se muestran si marcas esa opción. Tu correo nunca se publica.</p> },
                { title: "Transferencia al extranjero", body: <p>Algunos proveedores almacenan o procesan datos fuera del Perú (por ejemplo en Brasil y Estados Unidos). Exigimos medidas de seguridad adecuadas y usamos solo proveedores que las ofrecen.</p> },
                { title: "Cuánto tiempo los conservamos", body: <p>Mientras tu cuenta esté activa. Cuando elimines un reporte o pidas cerrar tu cuenta, borramos o anonimizamos los datos asociados, salvo los que debamos conservar por obligación legal o para resolver disputas.</p> },
                { title: "Seguridad", body: <p>Usamos conexión cifrada (HTTPS), control de acceso por usuario en la base de datos y contraseñas cifradas. Ningún sistema es infalible: si ocurre una brecha que te afecte, te lo comunicaremos conforme a la ley.</p> },
                { title: "Tus derechos (ARCO)", body: (<>
                    <p>Tienes derecho a acceder, rectificar, cancelar y oponerte al tratamiento de tus datos, así como a revocar tu consentimiento. Puedes editar tus datos en <Link href="/dashboard/settings">Mi perfil</Link> o escribir a <a href={`mailto:${LEGAL_EMAIL}`}>{LEGAL_EMAIL}</a> con el asunto «Derechos ARCO» y una copia de tu documento de identidad. Respondemos en los plazos de ley.</p>
                    <p>Si crees que no atendimos tu solicitud, puedes acudir a la Autoridad Nacional de Protección de Datos Personales (Ministerio de Justicia y Derechos Humanos).</p>
                </>) },
                { title: "Menores de edad", body: <p>La Plataforma no está dirigida a menores de 18 años. Si detectamos una cuenta de un menor sin autorización de sus padres o tutores, la eliminaremos.</p> },
                { title: "Cookies", body: <p>Usamos cookies y almacenamiento local necesarios para mantener tu sesión y recordar tus preferencias. Detalle en la <Link href="/cookies">Política de cookies</Link>.</p> },
                { title: "Cambios", body: <p>Si cambiamos esta política publicaremos la nueva versión con su fecha y, si el cambio es relevante, te avisaremos por la Plataforma o por correo.</p> },
            ]}
        />
    )
}
