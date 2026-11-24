import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/utils/supabase/server'
import { allowRequest } from '@/lib/rate-limit'
import { notifyAdminContact } from '@/lib/owner-alerts'
import { getSafeErrorCode, methodNotAllowedResponse } from '@/lib/safe-error'

const MAX_FILE = 5 * 1024 * 1024
const FILE_TYPES: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'application/pdf': 'pdf' }

const text = (max: number) => z.string().trim().max(max)
const schema = z.object({
    kind: z.enum(['consulta', 'aliado', 'voluntario', 'colaborar', 'apoyo', 'grupo']),
    name: text(120).min(2),
    email: text(160).email(),
    phone: text(30).optional(),
    message: text(2000).optional(),
    amount: z.coerce.number().min(0).max(999999).optional(),
    join_group: z.boolean(),
    allow_mention: z.boolean(),
    monthly: z.boolean(),
})

const str = (f: FormData, k: string) => { const v = f.get(k); return typeof v === 'string' && v.trim() ? v : undefined }

export async function POST(request: NextRequest) {
    try {
        const form = await request.formData()
        // Campo trampa: las personas no lo ven; los bots suelen llenarlo. Se responde "ok" sin guardar nada.
        if (str(form, 'website')) return NextResponse.json({ ok: true })

        const ip = (request.headers.get('x-forwarded-for') ?? 'local').split(',')[0].trim()
        if (!(await allowRequest(`contact:${ip}`, 5, 3600))) {
            return NextResponse.json({ error: 'Enviaste varios mensajes seguidos. Intenta de nuevo en un rato.' }, { status: 429 })
        }

        const parsed = schema.safeParse({
            kind: str(form, 'kind'),
            name: str(form, 'name'),
            email: str(form, 'email'),
            phone: str(form, 'phone'),
            message: str(form, 'message'),
            amount: str(form, 'amount'),
            join_group: form.get('join_group') === 'on',
            allow_mention: form.get('allow_mention') === 'on',
            monthly: form.get('monthly') === 'on',
        })
        if (!parsed.success) return NextResponse.json({ error: 'Revisa los datos: falta tu nombre, un correo válido o el mensaje es muy largo.' }, { status: 400 })
        const d = parsed.data
        if (d.kind !== 'grupo' && !d.message && d.kind !== 'apoyo') return NextResponse.json({ error: 'Escribe tu mensaje.' }, { status: 400 })

        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        // Comprobante opcional (solo imagen o PDF, hasta 5 MB). El tipo se valida aquí y también lo limita el bucket.
        let attachment: string | null = null
        const file = form.get('attachment')
        if (file instanceof File && file.size > 0) {
            const ext = FILE_TYPES[file.type]
            if (!ext) return NextResponse.json({ error: 'El archivo debe ser una imagen (JPG, PNG, WebP) o un PDF.' }, { status: 400 })
            if (file.size > MAX_FILE) return NextResponse.json({ error: 'El archivo pesa más de 5 MB.' }, { status: 400 })
            const path = `${crypto.randomUUID()}.${ext}`
            const { error } = await supabase.storage.from('contact-attachments').upload(path, file, { contentType: file.type, upsert: false })
            if (error) return NextResponse.json({ error: 'No pudimos subir el archivo. Intenta de nuevo o envía el mensaje sin adjunto.' }, { status: 500 })
            attachment = path
        }

        const { error } = await supabase.from('contact_messages').insert({
            kind: d.kind,
            name: d.name,
            email: d.email,
            phone: d.phone ?? null,
            message: d.message ?? null,
            amount: d.amount ?? null,
            attachment_path: attachment,
            join_group: d.join_group || d.kind === 'grupo',
            allow_mention: d.allow_mention,
            monthly: d.monthly && d.kind === 'apoyo',
            user_id: user?.id ?? null,
        })
        if (error) {
            console.error('contact insert failed', { code: getSafeErrorCode(error) })
            return NextResponse.json({ error: 'No pudimos enviar tu mensaje. Intenta de nuevo.' }, { status: 500 })
        }
        await notifyAdminContact(d.kind, d.name)
        return NextResponse.json({ ok: true })
    } catch (error: unknown) {
        console.error('contact API error', { code: getSafeErrorCode(error) })
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    }
}

export const GET = methodNotAllowedResponse
export const PUT = methodNotAllowedResponse
export const PATCH = methodNotAllowedResponse
export const DELETE = methodNotAllowedResponse
