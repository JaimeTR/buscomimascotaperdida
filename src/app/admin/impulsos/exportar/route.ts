import { requireAdmin } from "@/lib/admin"

// CSV de aportes para contabilidad. Solo administradores (requireAdmin responde 404 al resto).
const cell = (v: unknown) => {
    let s = v == null ? "" : String(v)
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}` // evita fórmulas al abrir en Excel
    return `"${s.replace(/"/g, '""')}"`
}

export async function GET() {
    const { supabase } = await requireAdmin()
    const { data } = await supabase
        .from("pet_boosts")
        .select("created_at, status, method, amount_claimed, amount_confirmed, starts_at, ends_at, pet:pets(name)")
        .order("created_at", { ascending: false })
        .limit(5000)
        .returns<{ created_at: string; status: string; method: string | null; amount_claimed: number; amount_confirmed: number | null; starts_at: string | null; ends_at: string | null; pet: { name: string | null } | null }[]>()
    const head = ["fecha", "estado", "metodo", "monto_declarado", "monto_confirmado", "inicio", "fin", "mascota"]
    const rows = (data ?? []).map((r) => [r.created_at, r.status, r.method, r.amount_claimed, r.amount_confirmed, r.starts_at, r.ends_at, r.pet?.name])
    const csv = "﻿" + [head, ...rows].map((r) => r.map(cell).join(",")).join("\r\n")
    return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="aportes.csv"', "Cache-Control": "no-store" } })
}
