import { Html, Head, Body, Container, Text, Button, Preview } from "@react-email/components"
import * as React from "react"

export function ReunionReminderEmail({ petName, url }: { petName: string; url: string }) {
    return (
        <Html>
            <Head />
            <Preview>{`¿Ya apareció ${petName}?`}</Preview>
            <Body style={{ backgroundColor: "#f4f4f5", fontFamily: "Arial, sans-serif" }}>
                <Container style={{ backgroundColor: "#ffffff", borderRadius: 16, margin: "32px auto", padding: 24, maxWidth: 520 }}>
                    <Text style={{ fontSize: 22, fontWeight: 700, color: "#0f766e" }}>¿Ya apareció {petName}?</Text>
                    <Text style={{ fontSize: 16, lineHeight: "24px", color: "#27272a" }}>
                        Hace unos días publicaste su reporte. Si volvió a casa, márcalo como reunido y cuéntanos cómo fue: tu historia da esperanza a otras familias.
                        Si todavía lo buscas, no hace falta que hagas nada; seguimos difundiendo tu caso.
                    </Text>
                    <Button href={url} style={{ backgroundColor: "#0f766e", color: "#ffffff", borderRadius: 12, padding: "12px 20px", fontWeight: 700 }}>Ya apareció, contar mi historia</Button>
                    <Text style={{ fontSize: 12, color: "#71717a" }}>Te escribimos porque tienes un reporte activo en BuscoMiMascotaPerdida.com.</Text>
                </Container>
            </Body>
        </Html>
    )
}
