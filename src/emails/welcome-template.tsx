
import {
    Html,
    Head,
    Body,
    Container,
    Section,
    Text,
    Button,
    Img,
    Hr,
    Preview,
    Tailwind,
} from "@react-email/components";
import * as React from "react";

interface WelcomeEmailProps {
    firstName?: string;
}

export const WelcomeEmail = ({ firstName = "Usuario" }: WelcomeEmailProps) => {
    const previewText = `¡Bienvenido a BuscoMiMascotaPerdida!`;
    const logoUrl = "https://img.freepik.com/vector-gratis/lindo-perro-sacando-lengua-ilustracion-icono-dibujos-animados_138676-2709.jpg";

    return (
        <Html>
            <Head />
            <Preview>{previewText}</Preview>
            <Tailwind
                config={{
                    theme: {
                        extend: {
                            colors: {
                                brand: {
                                    500: '#0f766e',
                                    600: '#2563eb',
                                },
                            }
                        }
                    }
                }}
            >
                <Body className="bg-stone-100 font-sans my-auto mx-auto px-2">
                    <Container className="border border-solid border-[#eaeaea] rounded-[24px] mx-auto p-[20px] max-w-[560px] bg-white mt-[40px] mb-[40px] shadow-sm">

                        <Section className="mt-[24px] text-center">
                            <Img
                                src={logoUrl}
                                width="80"
                                height="80"
                                alt="BuscoMiMascota"
                                className="mx-auto rounded-full border-4 border-teal-50"
                            />
                            <Text className="text-[20px] font-black text-stone-800 tracking-tighter mt-4 uppercase m-0">
                                BuscoMiMascota<span className="text-teal-700">Perdida</span>
                            </Text>
                        </Section>

                        <Section className="px-[24px] py-[24px] text-center">
                            <Text className="text-[24px] leading-[32px] font-bold text-stone-800 mx-0 my-[16px]">
                                ¡Hola, {firstName}! 🐾
                            </Text>
                            <Text className="text-[16px] leading-[26px] text-stone-600 mb-[32px]">
                                Gracias por unirte a la red más grande de ayuda para mascotas perdidas en Perú.
                                Tu participación es clave para reunir a más familias con sus amigos peludos.
                            </Text>

                            <Section className="bg-teal-50 p-6 rounded-2xl mb-8 border border-teal-100 text-left">
                                <Text className="text-teal-900 font-bold text-[16px] m-0 mb-3 uppercase tracking-wide">
                                    ¿Qué puedes hacer ahora?
                                </Text>
                                <Text className="text-stone-700 text-[14px] m-0 mb-2">📢 <strong>Reportar</strong> una mascota perdida o encontrada.</Text>
                                <Text className="text-stone-700 text-[14px] m-0 mb-2">🔍 <strong>Buscar</strong> reportes en tu distrito.</Text>
                                <Text className="text-stone-700 text-[14px] m-0">🔔 <strong>Recibir alertas</strong> cercanas a ti.</Text>
                            </Section>

                            <Button
                                className="bg-teal-800 rounded-full text-white text-[16px] font-bold no-underline text-center px-8 py-4 block w-full shadow-lg shadow-teal-700/30"
                                href="http://localhost:3000/dashboard"
                            >
                                Ir a mi Panel
                            </Button>
                        </Section>

                        <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />

                        <Text className="text-[#666666] text-[12px] leading-[20px] text-center">
                            Si no te registraste en BuscoMiMascotaPerdida.com, puedes ignorar este correo.
                            <br />
                            Lima, Perú 🇵🇪
                        </Text>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};

export default WelcomeEmail;
