
import Link from "next/link"
import { PawPrint, Mail, Share2 } from "lucide-react"

export function Footer() {
    return (
        <footer className="bg-white border-t py-16">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">

                    {/* Brand Column */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <img
                                src="/logo_symbol.png"
                                alt="Logo"
                                className="h-8 w-auto object-contain"
                            />
                            <span className="text-xl font-black text-slate-900 leading-none tracking-tighter">Encuentra tu mascota</span>
                        </div>
                        <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
                            Red de ayuda para encontrar nuestra mascota perdida. Unidos por el amor a nuestras mascotas desde 2024.
                        </p>
                    </div>

                    {/* Links Column 1 */}
                    <div className="space-y-4">
                        <h4 className="font-bold text-slate-900">Plataforma</h4>
                        <ul className="space-y-2 text-sm text-slate-500">
                            <li><Link href="#" className="hover:text-blue-600">Cómo funciona</Link></li>
                            <li><Link href="/mascotas" className="hover:text-blue-600">Mascotas perdidas</Link></li>
                            <li><Link href="/mascotas" className="hover:text-blue-600">Mascotas encontradas</Link></li>
                            <li><Link href="#" className="hover:text-blue-600">Mapa de reportes</Link></li>
                        </ul>
                    </div>

                    {/* Links Column 2 */}
                    <div className="space-y-4">
                        <h4 className="font-bold text-slate-900">Comunidad</h4>
                        <ul className="space-y-2 text-sm text-slate-500">
                            <li><Link href="#" className="hover:text-blue-600">Historias de éxito</Link></li>
                            <li><Link href="#" className="hover:text-blue-600">Voluntariado</Link></li>
                            <li><Link href="#" className="hover:text-blue-600">Refugios aliados</Link></li>
                            <li><Link href="#" className="hover:text-blue-600">Blog de cuidado animal</Link></li>
                        </ul>
                    </div>

                    {/* Contact Column */}
                    <div className="space-y-4">
                        <h4 className="font-bold text-slate-900">Contáctanos</h4>
                        <div className="flex gap-4">
                            <button className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                                <Mail className="h-5 w-5" />
                            </button>
                            <button className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                                <Share2 className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                </div>

                <div className="border-t mt-16 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
                    <p>© 2024 Encuentra tu mascota perdida. Todos los derechos reservados.</p>
                    <div className="flex gap-6">
                        <Link href="#" className="hover:text-slate-600">Privacidad</Link>
                        <Link href="#" className="hover:text-slate-600">Términos</Link>
                        <Link href="#" className="hover:text-slate-600">Cookies</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
