"use client"

import { useEffect } from "react"

const hit = (id: string, kind: "view" | "click") =>
    void fetch("/api/partner-hit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, kind }), keepalive: true }).catch(() => {})

// Cuenta una visita a la ficha del aliado (solo navegadores reales: los buscadores sin JavaScript no suman).
export function PartnerView({ id }: { id: string }) {
    useEffect(() => { hit(id, "view") }, [id])
    return null
}

// Enlace a la web del aliado que cuenta el clic.
export function PartnerLink({ id, href, className, children }: { id: string; href: string; className?: string; children: React.ReactNode }) {
    return <a href={href} target="_blank" rel="noopener noreferrer nofollow" className={className} onClick={() => hit(id, "click")}>{children}</a>
}
