import Link from "next/link"
import Image from "next/image"
import { STOCK } from "@/lib/stock-images"

// Marco compartido de las pantallas de acceso: foto + lema a la izquierda (solo escritorio), formulario a la derecha.
export function AuthShell({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
            <aside className="relative hidden overflow-hidden lg:block" aria-hidden>
                <Image src={STOCK.reencuentro.src} alt="" fill priority sizes="55vw" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#042f2e]/90 via-[#042f2e]/25 to-[#042f2e]/10" />
                <div className="absolute inset-x-0 bottom-0 p-12 xl:p-16">
                    <p className="font-display text-5xl uppercase leading-[1.05] tracking-wide text-white xl:text-6xl">Juntos, de vuelta a casa</p>
                </div>
            </aside>

            <div className="flex flex-col bg-background px-6 py-8 sm:px-12">
                <Link href="/" aria-label="Busco mi mascota, ir al inicio" className="w-fit">
                    <Image src="/brand/isologo-horizontal.svg" alt="Busco mi mascota" width={176} height={48} priority unoptimized className="h-11 w-auto" />
                </Link>

                <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">
                    <h1 className="font-display text-4xl uppercase leading-none tracking-wide text-primary">{title}</h1>
                    <div className="mt-8">{children}</div>
                </div>
            </div>
        </div>
    )
}
