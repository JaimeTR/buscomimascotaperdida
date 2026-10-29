import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export default function TermsPage() {
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

                    <h1 className="text-3xl font-black text-slate-900 mb-6">Términos y Condiciones</h1>
                    <p className="text-slate-500 mb-8">Última actualización: 11 de Febrero, 2026</p>

                    <div className="prose prose-slate max-w-none text-slate-700 space-y-6">
                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">1. Aceptación de los Términos</h2>
                            <p>
                                Al acceder y utilizar BuscoMiMascotaPerdida.com (en adelante, "la Plataforma"), usted acepta cumplir con estos Términos y Condiciones.
                                Si no está de acuerdo con alguna parte de estos términos, no debe utilizar nuestros servicios.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">2. Uso de la Plataforma</h2>
                            <p>
                                La Plataforma está diseñada para ayudar en la búsqueda y recuperación de mascotas perdidas en Perú. Usted se compromete a:
                            </p>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                <li>Proporcionar información veraz y actualizada sobre mascotas perdidas o encontradas.</li>
                                <li>No utilizar la Plataforma para actividades fraudulentas, engañosas o ilegales.</li>
                                <li>No publicar contenido ofensivo, spam, o que infrinja derechos de terceros.</li>
                                <li>Respetar la privacidad de otros usuarios y no compartir información personal sensible sin consentimiento.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">3. Registro de Usuarios</h2>
                            <p>
                                Para publicar reportes, es necesario registrarse. Usted es responsable de mantener la confidencialidad de su contraseña y de todas las actividades que ocurran bajo su cuenta.
                                Nos reservamos el derecho de suspender o eliminar cuentas que violen estos términos.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">4. Propiedad Intelectual</h2>
                            <p>
                                Las imágenes y descripciones de mascotas subidas por los usuarios siguen siendo propiedad de sus respectivos autores.
                                Sin embargo, al publicarlas, usted otorga a la Plataforma una licencia no exclusiva para mostrar, distribuir y promocionar dicho contenido con el fin de ayudar en la búsqueda.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">5. Limitación de Responsabilidad</h2>
                            <p>
                                BuscoMiMascotaPerdida.com actúa como un intermediario y no garantiza la recuperación de ninguna mascota.
                                No somos responsables verificaciones de identidad de los usuarios ni de la veracidad de los reportes. El usuario asume el riesgo al contactar con terceros.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">6. Modificaciones</h2>
                            <p>
                                Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios entrarán en vigor inmediatamente después de su publicación en la Plataforma.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">7. Ley Aplicable y Jurisdicción</h2>
                            <p>
                                Estos Términos se rigen por las leyes de la República del Perú. Cualquier disputa se resolverá en los tribunales competentes de Lima, Perú.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
