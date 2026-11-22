"use client"

import { Handshake, Megaphone } from "lucide-react"
import { FormDialog } from "@/components/ui/form-dialog"
import { PromoRequestForm } from "@/components/promo/request-form"

type Kind = "anuncio" | "aliado" | "voluntario"

const CONFIG = {
    aliados: {
        icon: Handshake,
        title: "Quiero colaborar",
        intro: "Súmate como aliado o voluntario y ayuda a que más mascotas vuelvan a casa.",
        points: ["Empresas, veterinarias, refugios y personas.", "Revisamos tu solicitud y te escribimos.", "Puedes ser aliado, voluntario o ambos.", "No tiene costo."],
        nextPath: "/aliados",
        kinds: [{ value: "aliado" as Kind, label: "Ser aliado (empresa, veterinaria, refugio)" }, { value: "voluntario" as Kind, label: "Ser voluntario" }],
        defaultKind: "aliado" as Kind,
    },
    anuncios: {
        icon: Megaphone,
        title: "Solicita tu anuncio",
        intro: "Cuéntanos de tu negocio y elige el plan que más te conviene.",
        points: ["Aparece como destacado en la portada.", "Siempre marcado como anuncio.", "Revisamos cada solicitud antes de publicar.", "Coordinamos el pago contigo, sin cobros en línea."],
        nextPath: "/anuncios",
        kinds: [{ value: "anuncio" as Kind, label: "Quiero anunciar mi negocio" }],
        defaultKind: "anuncio" as Kind,
    },
}

// Modal de solicitudes (aliados/voluntarios y anuncios): se abre con <OpenFormButton form="aliados" detail={{ kind }} /> o form="anuncios" detail={{ plan }}.
export function PromoDialog({ form, loggedIn }: { form: keyof typeof CONFIG; loggedIn: boolean }) {
    const c = CONFIG[form]
    return (
        <FormDialog id={form} icon={c.icon} title={c.title} intro={c.intro} points={c.points}>
            {(detail, close) => (
                <PromoRequestForm
                    loggedIn={loggedIn}
                    kinds={c.kinds}
                    defaultKind={(c.kinds.some((k) => k.value === detail.kind) ? detail.kind : c.defaultKind) as Kind}
                    defaultPlan={detail.plan}
                    nextPath={c.nextPath}
                    onDone={close}
                />
            )}
        </FormDialog>
    )
}
