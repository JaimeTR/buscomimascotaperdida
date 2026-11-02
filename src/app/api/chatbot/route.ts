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
const analysisSchema = z.object({
    isPetSearch: z.boolean(),
    response: z.string().trim().min(1).max(500),
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

        const body: unknown = parsedBody.body
        const message = (
            typeof body === 'object' &&
            body !== null &&
            'message' in body &&
            typeof body.message === 'string'
        ) ? body.message.trim() : ''

        if (!message || message.length > 500) {
            return NextResponse.json({ error: 'Mensaje inválido' }, { status: 400 })
        }

        const { huggingfaceApiKey, chatbotProviderReady } = assertServerEnv()

        if (!chatbotProviderReady || !huggingfaceApiKey) {
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
            hfResponse = await fetch(
            'https://api-inference.huggingface.co/models/meta-llama/Llama-2-7b-chat-hf',
            {
                method: 'POST',
                headers: {
                    Authorization: 'Bearer ' + huggingfaceApiKey,
                    'Content-Type': 'application/json',
                },
                signal: controller.signal,
                body: JSON.stringify({
                    inputs: `Eres un asistente para buscar mascotas perdidas en Perú. Analiza este mensaje y responde SOLO en JSON válido:

Mensaje: "${message}"

Responde EXACTAMENTE en este formato JSON (sin markdown):
{
  "isPetSearch": true o false,
  "response": "string con respuesta amable en español",
  "filters": {
    "type": "dog" o "cat" o "rabbit" o null,
    "breed": "string o null",
    "color": "string o null",
    "size": "small" o "medium" o "large" o null,
    "district": "string o null",
    "gender": "male" o "female" o null
  }
}`,
                    parameters: {
                        max_new_tokens: 300,
                        temperature: 0.7,
                        top_p: 0.95,
                    },
                }),
            }
            )
            if (!hfResponse.ok) {
                console.error('chatbot provider request failed', { status: hfResponse.status })
                return NextResponse.json(
                    { error: 'Error al procesar tu mensaje', fallback: true },
                    { status: 502 }
                )
            }

            const hfData: unknown = await hfResponse.json()
            let analysis: unknown = null

            if (
                Array.isArray(hfData) &&
                hfData.length > 0 &&
                typeof hfData[0] === 'object' &&
                hfData[0] !== null &&
                'generated_text' in hfData[0] &&
                typeof hfData[0].generated_text === 'string'
            ) {
                const jsonMatch = hfData[0].generated_text.match(/\{[\s\S]*\}/)
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
