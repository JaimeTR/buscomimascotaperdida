import Link from "next/link"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"
import { STOCK } from "@/lib/stock-images"

const SLOGAN = "Juntos, de vuelta a casa"

// Marco compartido de las pantallas de acceso: foto + lema (lateral en escritorio, banda en móvil) y el formulario.
export function AuthShell({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
    return (
        <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
            <aside className="relative hidden overflow-hidden lg:block" aria-hidden>
                <Image src={STOCK.reencuentro.src} alt="" fill priority sizes="55vw" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-deep/90 via-primary-deep/25 to-primary-deep/10" />
                <p className="absolute inset-x-0 bottom-0 p-12 font-display text-5xl leading-[1.05] text-white xl:p-16 xl:text-6xl">{SLOGAN}</p>
            </aside>

            <div className="flex flex-col bg-background px-6 py-6 sm:px-12 lg:py-8">
                <div className="flex items-center justify-between">
                    <Link href="/" aria-label="Busco mi mascota, ir al inicio" className="w-fit">
                        <Image src="/brand/isologo-horizontal.svg" alt="Busco mi mascota" width={176} height={48} priority unoptimized className="h-11 w-auto" />
                    </Link>
                    <Link href="/mascotas" className="-mr-3 inline-flex min-h-11 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                        <ArrowLeft className="h-4 w-4" aria-hidden /> Ver mascotas
                    </Link>
                </div>

                <div className="relative mt-6 h-32 overflow-hidden rounded-2xl lg:hidden" aria-hidden>
                    <Image src={STOCK.reencuentro.src} alt="" fill sizes="(max-width: 1024px) 100vw, 0px" className="object-cover object-[50%_40%]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary-deep/85 to-transparent" />
                    <p className="absolute bottom-3 left-4 font-display text-xl text-white">{SLOGAN}</p>
                </div>

                <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-8 lg:py-10">
                    <h1 className="font-display text-4xl leading-none text-primary">{title}</h1>
                    {subtitle && <p className="mt-3 text-muted-foreground">{subtitle}</p>}
                    <div className="mt-8">{children}</div>
                </div>
            </div>
        </div>
    )
}
