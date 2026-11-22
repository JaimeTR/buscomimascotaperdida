// Tipos de mensaje del formulario de contacto. Archivo aparte (sin "use client") para poder usarlo también en el servidor.
export const CONTACT_KINDS = [
    { value: "consulta", label: "Tengo una consulta" },
    { value: "aliado", label: "Quiero ser aliado" },
    { value: "voluntario", label: "Quiero ser voluntario" },
    { value: "colaborar", label: "Quiero colaborar" },
    { value: "apoyo", label: "Ya apoyé al proyecto" },
    { value: "grupo", label: "Unirme al grupo" },
] as const
export type ContactKind = (typeof CONTACT_KINDS)[number]["value"]
