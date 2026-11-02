import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Html,
    Img,
    Link,
    Preview,
    Section,
    Text,
    Hr,
} from '@react-email/components'
import * as React from 'react'

interface PetAlertEmailProps {
    name: string
    type: string
    breed: string
    lastSeenDistrict: string
    imageUrl?: string
    reportUrl: string
    reporterName: string
}

export const PetAlertEmail = ({
    name = 'Luna',
    type = 'dog',
    breed = 'Golden Retriever',
    lastSeenDistrict = 'Miraflores',
    imageUrl = 'https://img.freepik.com/vector-gratis/lindo-perro-sacando-lengua-ilustracion-icono-dibujos-animados_138676-2709.jpg',
    reportUrl = 'https://buscomimascotaperdida.com',
    reporterName = 'Usuario'
}: PetAlertEmailProps) => {
    const petType = type === 'dog' ? 'Perro' : type === 'cat' ? 'Gato' : 'Mascota'


    return (
        <Html>
            <Head />
            <Preview>⚠️ Mascota perdida cerca de ti: {name} en {lastSeenDistrict}</Preview>
            <Body style={main}>
                <Container style={container}>
                    {/* Logo */}
                    <Section style={logoSection}>
                        <Img
                            src="https://img.freepik.com/vector-gratis/lindo-perro-sacando-lengua-ilustracion-icono-dibujos-animados_138676-2709.jpg"
                            width="60"
                            height="60"
                            alt="BuscoMiMascotaPerdida"
                            style={logo}
                        />
                        <Heading style={title}>BuscoMiMascota<span style={titleBlue}>Perdida</span></Heading>
                    </Section>

                    {/* Alert Badge */}
                    <Section style={alertBadge}>
                        <Text style={alertText}>🚨 ALERTA DE MASCOTA PERDIDA CERCA DE TI</Text>
                    </Section>

                    {/* Main Content */}
                    <Section style={content}>
                        <Text style={greeting}>¡Hola!</Text>

                        <Text style={paragraph}>
                            Te informamos que se ha reportado una <strong>mascota perdida en {lastSeenDistrict}</strong>.
                            Estamos juntos en esto y tu ayuda puede marcar la diferencia.
                        </Text>

                        {/* Pet Image */}
                        {imageUrl && (
                            <Section style={imageSection}>
                                <Img
                                    src={imageUrl}
                                    width="100%"
                                    height="auto"
                                    alt={name}
                                    style={petImage}
                                />
                            </Section>
                        )}

                        {/* Pet Details */}
                        <Section style={detailsBox}>
                            <Heading as="h2" style={detailsTitle}>Detalles de la mascota</Heading>
                            <table style={detailsTable}>
                                <tr>
                                    <td style={detailLabel}>Nombre:</td>
                                    <td style={detailValue}>{name}</td>
                                </tr>
                                <tr>
                                    <td style={detailLabel}>Tipo:</td>
                                    <td style={detailValue}>{petType}</td>
                                </tr>
                                <tr>
                                    <td style={detailLabel}>Raza:</td>
                                    <td style={detailValue}>{breed}</td>
                                </tr>
                                <tr>
                                    <td style={detailLabel}>Reportado por:</td>
                                    <td style={detailValue}>{reporterName}</td>
                                </tr>
                            </table>
                        </Section>

                        {/* Location */}
                        <Section style={locationBox}>
                            <Text style={locationTitle}>📍 Última ubicación conocida</Text>
                            <Text style={locationText}>
                                <strong>{lastSeenDistrict}</strong>
                            </Text>
                        </Section>



                        <Hr style={divider} />

                        {/* Call to Action */}
                        <Section style={ctaSection}>
                            <Text style={ctaText}>
                                <strong>¿Puedes ayudar?</strong> Si has visto a esta mascota o tienes información, por favor repórtalo.
                            </Text>
                            <Button style={button} href={reportUrl}>
                                Ver Detalles del Reporte
                            </Button>
                        </Section>

                        {/* Hope Message */}
                        <Section style={hopeBox}>
                            <Text style={hopeText}>
                                💙 <em>Estamos juntos en esto. Mantén la esperanza.</em>
                            </Text>
                        </Section>

                    </Section>

                    {/* Footer */}
                    <Section style={footer}>
                        <Text style={footerText}>
                            Recibiste este correo porque tienes activadas las notificaciones de mascotas perdidas en tu zona.
                        </Text>
                        <Link href={`${reportUrl}/settings`} style={footerLink}>
                            Administrar preferencias de notificación
                        </Link>
                    </Section>

                </Container>
            </Body>
        </Html>
    )
}

export default PetAlertEmail

// Styles
const main = {
    backgroundColor: '#f1f5f9',
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
    margin: '0 auto',
    padding: '20px 0',
    maxWidth: '600px',
}

const logoSection = {
    textAlign: 'center' as const,
    padding: '20px 0',
    backgroundColor: '#ffffff',
    borderRadius: '16px 16px 0 0',
}

const logo = {
    borderRadius: '50%',
    display: 'block',
    margin: '0 auto',
}

const title = {
    color: '#0f172a',
    fontSize: '24px',
    fontWeight: '800',
    margin: '10px 0 0 0',
    letterSpacing: '-0.5px',
}

const titleBlue = {
    color: '#2563eb',
}

const alertBadge = {
    backgroundColor: '#fef2f2',
    border: '2px solid #fca5a5',
    borderRadius: '12px',
    padding: '12px',
    margin: '20px 20px 0 20px',
}

const alertText = {
    color: '#dc2626',
    fontSize: '13px',
    fontWeight: '800',
    textAlign: 'center' as const,
    margin: '0',
    letterSpacing: '0.5px',
}

const content = {
    backgroundColor: '#ffffff',
    padding: '0 30px 30px',
}

const greeting = {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1e293b',
    margin: '24px 0 16px',
}

const paragraph = {
    fontSize: '15px',
    lineHeight: '24px',
    color: '#475569',
    margin: '0 0 20px',
}

const imageSection = {
    margin: '20px 0',
}

const petImage = {
    borderRadius: '16px',
    width: '100%',
    maxWidth: '540px',
    height: 'auto',
    border: '2px solid #e2e8f0',
}

const detailsBox = {
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    padding: '20px',
    margin: '20px 0',
    border: '1px solid #e2e8f0',
}

const detailsTitle = {
    fontSize: '16px',
    fontWeight: '700',
    color: '#1e293b',
    margin: '0 0 12px',
}

const detailsTable = {
    width: '100%',
    borderCollapse: 'collapse' as const,
}

const detailLabel = {
    fontSize: '13px',
    color: '#64748b',
    fontWeight: '600',
    padding: '6px 0',
    width: '35%',
}

const detailValue = {
    fontSize: '14px',
    color: '#1e293b',
    fontWeight: '500',
    padding: '6px 0',
}

const locationBox = {
    backgroundColor: '#eff6ff',
    border: '1px solid #bfdbfe',
    borderRadius: '12px',
    padding: '16px',
    margin: '20px 0',
}

const locationTitle = {
    fontSize: '14px',
    fontWeight: '700',
    color: '#1e3a8a',
    margin: '0 0 8px',
}

const locationText = {
    fontSize: '15px',
    color: '#1e40af',
    margin: '0 0 8px',
    lineHeight: '22px',
}





const divider = {
    borderColor: '#e2e8f0',
    margin: '24px 0',
}

const ctaSection = {
    textAlign: 'center' as const,
    margin: '24px 0',
}

const ctaText = {
    fontSize: '15px',
    color: '#475569',
    margin: '0 0 16px',
}

const button = {
    backgroundColor: '#2563eb',
    borderRadius: '99px',
    color: '#ffffff',
    fontSize: '15px',
    fontWeight: '700',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'inline-block',
    padding: '12px 32px',
    boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)',
}

const hopeBox = {
    backgroundColor: '#f0f9ff',
    borderRadius: '12px',
    padding: '16px',
    margin: '24px 0',
    textAlign: 'center' as const,
}

const hopeText = {
    fontSize: '15px',
    color: '#0369a1',
    margin: '0',
}

const footer = {
    backgroundColor: '#f8fafc',
    borderRadius: '0 0 16px 16px',
    padding: '20px 30px',
    textAlign: 'center' as const,
}

const footerText = {
    fontSize: '12px',
    color: '#94a3b8',
    margin: '0 0 8px',
    lineHeight: '18px',
}

const footerLink = {
    fontSize: '12px',
    color: '#0f766e',
    textDecoration: 'underline',
}
