import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { assertServerEnv } from '@/lib/env'
import {
    getSafeErrorCode,
    invalidPayloadResponse,
    methodNotAllowedResponse,
    parseJsonBody,
} from '@/lib/safe-error'

const requestCounts = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW = 60 * 1000
const MAX_REQUESTS_PER_WINDOW = 10
const optionalFilter = z.string().trim().max(100).transform((value) => value || null)
const HISTORY_LIMIT = 8
const MODEL = 'openai/gpt-oss-120b'
const inputSchema = z.object({
    messages: z.array(z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().trim().min(1).max(500),
    })).min(1).max(30),
})
const SYSTEM_PROMPT = `Eres "Huellita", asistente de buscomimascotaperdida.com, plataforma peruana para reportar y encontrar mascotas perdidas o halladas.
Tono: cálido, empático, breve (máx. 3 oraciones), español peruano natural. Quien escribe suele estar angustiado: tranquiliza y da un siguiente paso claro.
Capacidades del sitio: /reportar (reportar mascota perdida o encontrada), /mascotas (ver y filtrar reportes), /cartel (generar cartel imprimible), /contacto.
Consejos útiles cuando aplique: revisar refugios y veterinarias cercanas, pedir a vecinos que revisen sus jardines, llevar a la mascota a escanear microchip, publicar rápido con foto clara y zona exacta.
Nunca inventes mascotas ni datos; los resultados los muestra el sitio. No pidas datos personales sensibles.
Responde SOLO un JSON válido, sin markdown, con este formato exacto:
{"intent":"search|report_lost|report_found|help|other","isPetSearch":true|false,"response":"texto","suggestions":["hasta 3 respuestas rápidas cortas"],"filters":{"type":"dog|cat|rabbit|null","breed":null,"color":null,"size":"small|medium|large|null","district":null,"gender":"male|female|null"}}
- intent search: el usuario busca una mascota (isPetSearch=true); rellena filters con lo que dijo (distrito de Lima/Perú en district) y usa null en lo demás. Acumula filtros mencionados antes en la conversación.
- intent report_lost / report_found: quiere reportar; isPetSearch=false y guía a /reportar.
- Si falta info clave para buscar, pregunta UNA cosa y ofrece suggestions.
- Fuera de tema: redirige amablemente a mascotas.`
const analysisSchema = z.object({
    intent: z.enum(['search', 'report_lost', 'report_found', 'help', 'other']).catch('other'),
    isPetSearch: z.boolean(),
    response: z.string().trim().min(1).max(600),
    suggestions: z.array(z.string().trim().min(1).max(40)).max(3).catch([]),
    filters: z.object({
        type: z.enum(['dog', 'cat', 'rabbit']).nullable().optional().default(null),
        breed: optionalFilter.nullable().optional().default(null),
        color: optionalFilter.nullable().optional().default(null),
        size: z.enum(['small', 'medium', 'large']).nullable().optional().default(null),
        district: optionalFilter.nullable().optional().default(null),
        gender: z.enum(['male', 'female']).nullable().optional().default(null),
    }).strict(),
}).strict()

function checkRateLimit(ip: string): boolean {
    const now = Date.now()
    const userRecord = requestCounts.get(ip)

    if (!userRecord || now > userRecord.resetTime) {
        requestCounts.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
        return true
    }

    if (userRecord.count >= MAX_REQUESTS_PER_WINDOW) {
        return false
    }

    userRecord.count++
    return true
}

export async function POST(request: NextRequest) {
    try {
        const ip = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            'unknown'

        if (!checkRateLimit(ip)) {
            return NextResponse.json(
                { error: 'Demasiadas solicitudes. Por favor espera un momento.' },
                { status: 429 }
            )
        }

        const parsedBody = await parseJsonBody(request)
        if (!parsedBody.ok) {
            return invalidPayloadResponse()
        }

        const parsedInput = inputSchema.safeParse(parsedBody.body)
        if (!parsedInput.success) {
            return NextResponse.json({ error: 'Mensaje inválido' }, { status: 400 })
        }
        const history = parsedInput.data.messages.slice(-HISTORY_LIMIT)
        if (history[history.length - 1].role !== 'user') {
            return NextResponse.json({ error: 'Mensaje inválido' }, { status: 400 })
        }

        const { groqApiKey, chatbotProviderReady } = assertServerEnv()

        if (!chatbotProviderReady || !groqApiKey) {
            console.error('chatbot provider is not configured')
            return NextResponse.json(
                { error: 'Servicio temporalmente no disponible', fallback: true },
                { status: 503 }
            )
        }

        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 15_000)
        let hfResponse: Response
        try {
            // Groq (API compatible con OpenAI, plan gratuito).
            hfResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    Authorization: 'Bearer ' + groqApiKey,
                    'Content-Type': 'application/json',
                },
                signal: controller.signal,
                body: JSON.stringify({
                    model: MODEL,
                    max_tokens: 1000,
                    reasoning_effort: 'low',
                    temperature: 0.3,
                    messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...history],
                }),
            })
            if (!hfResponse.ok) {
                console.error('chatbot provider request failed', { status: hfResponse.status })
                return NextResponse.json(
                    { error: 'Error al procesar tu mensaje', fallback: true },
                    { status: 502 }
                )
            }

            const hfData: unknown = await hfResponse.json()
            let analysis: unknown = null
            const text = (hfData as { choices?: { message?: { content?: unknown } }[] })
                ?.choices?.[0]?.message?.content

            if (typeof text === 'string') {
                const jsonMatch = text.match(/\{[\s\S]*\}/)
                if (jsonMatch) {
                    try {
                        analysis = JSON.parse(jsonMatch[0])
                    } catch {
                        console.error('chatbot provider returned invalid analysis')
                    }
                }
            }

            const validatedAnalysis = analysisSchema.safeParse(analysis)
            if (!validatedAnalysis.success) {
                console.error('chatbot provider returned an invalid analysis shape')
                return NextResponse.json(
                    { error: 'No se pudo procesar la respuesta', fallback: true },
                    { status: 502 }
                )
            }

            return NextResponse.json({ success: true, analysis: validatedAnalysis.data })
        } catch (error: unknown) {
            console.error('chatbot provider operation failed', { code: getSafeErrorCode(error) })
            return NextResponse.json(
                { error: 'Error al procesar tu mensaje', fallback: true },
                { status: 502 }
            )
        } finally {
            clearTimeout(timeout)
        }
    } catch (error: unknown) {
        console.error('chatbot API error', { code: getSafeErrorCode(error) })
        return NextResponse.json(
            { error: 'Error interno del servidor', fallback: true },
            { status: 500 }
        )
    }
}

export const GET = methodNotAllowedResponse
export const PUT = methodNotAllowedResponse
export const PATCH = methodNotAllowedResponse
export const DELETE = methodNotAllowedResponse
export const OPTIONS = methodNotAllowedResponse
