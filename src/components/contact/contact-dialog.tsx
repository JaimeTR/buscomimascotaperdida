"use client"

import { MessageCircleHeart } from "lucide-react"
import { FormDialog } from "@/components/ui/form-dialog"
import { ContactForm } from "@/components/contact/contact-form"
import { CONTACT_KINDS, type ContactKind } from "@/lib/contact-kinds"

const isKind = (v?: string): v is ContactKind => CONTACT_KINDS.some((k) => k.value === v)

// Modal del formulario de contacto: se abre con <OpenFormButton form="contacto" detail={{ kind }} />.
export function ContactDialog({ groupUrl, openKind }: { groupUrl?: string; openKind?: ContactKind }) {
    return (
        <FormDialog
            id="contacto"
            icon={MessageCircleHeart}
            title="Escríbenos"
            intro="Consultas, alianzas, voluntariado, colaboraciones y avisos de apoyo."
            points={["Te respondemos al correo que indiques.", "Puedes adjuntar tu comprobante si apoyaste.", "Sin cuenta ni costo: es solo un mensaje.", "Tus datos se usan únicamente para responderte."]}
            openOnLoad={openKind ? { form: "contacto", kind: openKind } : undefined}
        >
            {(detail, close) => <ContactForm initialKind={isKind(detail.kind) ? detail.kind : "consulta"} initialAmount={detail.amount} initialMonthly={detail.monthly === "1"} groupUrl={groupUrl} onDone={close} />}
        </FormDialog>
    )
}
