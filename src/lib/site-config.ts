// Datos públicos de contacto y apoyo. Se leen de variables NEXT_PUBLIC_* (Vercel → Settings → Environment Variables);
// lo que no esté definido simplemente no se muestra. Así no hay números inventados en el sitio.
const env = (v: string | undefined) => v?.trim() || undefined

export const SITE_CONTACT = {
    email: env(process.env.NEXT_PUBLIC_CONTACT_EMAIL),
    phone: env(process.env.NEXT_PUBLIC_CONTACT_PHONE), // ej. 987 654 321
    whatsapp: env(process.env.NEXT_PUBLIC_CONTACT_WHATSAPP), // solo dígitos con código de país, ej. 51987654321
    collabGroupUrl: env(process.env.NEXT_PUBLIC_COLLAB_GROUP_URL), // enlace del grupo de colaboradores (WhatsApp/Telegram)
}

export const SUPPORT_METHODS = [
    { id: "yape", name: "Yape", number: env(process.env.NEXT_PUBLIC_YAPE_NUMBER), holder: env(process.env.NEXT_PUBLIC_SUPPORT_HOLDER), color: "bg-purple-100 text-purple-900" },
    { id: "plin", name: "Plin", number: env(process.env.NEXT_PUBLIC_PLIN_NUMBER), holder: env(process.env.NEXT_PUBLIC_SUPPORT_HOLDER), color: "bg-sky-100 text-sky-900" },
].filter((m) => m.number)
