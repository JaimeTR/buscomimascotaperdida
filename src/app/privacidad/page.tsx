import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-8 sm:p-12">
                    <div className="mb-8">
                        <Link href="/">
                            <Button variant="ghost" className="pl-0 hover:bg-transparent hover:text-blue-600">
                                <ChevronLeft className="mr-2 h-4 w-4" />
                                Volver al inicio
                            </Button>
                        </Link>
                    </div>

                    <h1 className="text-3xl font-black text-slate-900 mb-6">Política de Privacidad</h1>
                    <p className="text-slate-500 mb-8">Última actualización: 11 de Febrero, 2026</p>

                    <div className="prose prose-slate max-w-none text-slate-700 space-y-6">
                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">1. Introducción</h2>
                            <p>
                                En BuscoMiMascotaPerdida.com respetamos su privacidad y estamos comprometidos con proteger sus datos personales, en cumplimiento con la
                                <strong> Ley N° 29733, Ley de Protección de Datos Personales de Perú</strong>, y su Reglamento.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">2. Información que Recopilamos</h2>
                            <p>Podemos recopilar la siguiente información personal:</p>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                <li>Datos de contacto: Nombre, correo electrónico, número de teléfono.</li>
                                <li>Datos de ubicación: Departamento, Distrito (para reportes y alertas).</li>
                                <li>Información de mascotas: Fotos, descripciones y ubicación de avistamientos.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">3. Finalidad del Tratamiento de Datos</h2>
                            <p>Sus datos personales se utilizan para:</p>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                <li>Gestionar su cuenta de usuario y permitirle publicar reportes.</li>
                                <li>Facilitar el contacto entre usuarios para la recuperación de mascotas (solo si usted lo autoriza).</li>
                                <li>Enviar notificaciones sobre mascotas perdidas en su zona (si está suscrito).</li>
                                <li>Mejorar nuestros servicios y prevenir fraudes.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">4. Compartir Información</h2>
                            <p>
                                No vendemos ni alquilamos sus datos a terceros. Podemos compartir información pública de reportes (fotos de la mascota, zona aproximada) en redes sociales para ayudar en la búsqueda.
                                Sus datos de contacto directo (teléfono/email) solo serán visibles si usted marca esa opción al crear un reporte.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">5. Seguridad de los Datos</h2>
                            <p>
                                Implementamos medidas técnicas y organizativas razonables para proteger su información contra acceso no autorizado, pérdida o alteración.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">6. Sus Derechos ARCO</h2>
                            <p>
                                Como titular de datos personales, usted tiene derecho de Acceso, Rectificación, Cancelación y Oposición (Derechos ARCO).
                                Puede ejercer estos derechos escribiéndonos a <strong>contacto@buscomimascotaperdida.com</strong> o a través de la configuración de su cuenta.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">7. Cambios en la Política</h2>
                            <p>
                                Podemos actualizar esta política periódicamente. Le notificaremos cualquier cambio significativo a través de la Plataforma o por correo electrónico.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
