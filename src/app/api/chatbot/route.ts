import { NextRequest, NextResponse } from 'next/server'

// Rate limiting simple en memoria (para producción, usa Redis)
const requestCounts = new Map<string, { count: number; resetTime: number }>()

const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minuto
const MAX_REQUESTS_PER_WINDOW = 10 // 10 requests por minuto

function checkRateLimit(ip: string): boolean {
    const now = Date.now()
    const userRecord = requestCounts.get(ip)

    if (!userRecord || now > userRecord.resetTime) {
        requestCounts.set(ip, {
            count: 1,
            resetTime: now + RATE_LIMIT_WINDOW
        })
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
        // Obtener IP del usuario para rate limiting
        const ip = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            'unknown'

        // Verificar rate limit
        if (!checkRateLimit(ip)) {
            return NextResponse.json(
                { error: 'Demasiadas solicitudes. Por favor espera un momento.' },
                { status: 429 }
            )
        }

        // Obtener el mensaje del usuario
        const body = await request.json()
        const { message } = body

        if (!message || typeof message !== 'string' || message.length > 500) {
            return NextResponse.json(
                { error: 'Mensaje inválido' },
                { status: 400 }
            )
        }

        // Llamar a HuggingFace desde el backend (API key segura)
        const HF_API_KEY = process.env.HUGGINGFACE_API_KEY

        if (!HF_API_KEY) {
            console.error('HUGGINGFACE_API_KEY no configurada')
            return NextResponse.json(
                {
                    error: 'Servicio temporalmente no disponible',
                    fallback: true
                },
                { status: 503 }
            )
        }

        const hfResponse = await fetch(
            "https://api-inference.huggingface.co/models/meta-llama/Llama-2-7b-chat-hf",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${HF_API_KEY}`,
                    "Content-Type": "application/json",
                },
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
            const errorText = await hfResponse.text()
            console.error('HuggingFace error:', errorText)

            return NextResponse.json(
                {
                    error: 'Error al procesar tu mensaje',
                    fallback: true
                },
                { status: 500 }
            )
        }

        const hfData = await hfResponse.json()

        // Extraer y parsear la respuesta JSON
        let analysis = null
        if (Array.isArray(hfData) && hfData[0]) {
            const text = hfData[0].generated_text
            const jsonMatch = text.match(/\{[\s\S]*\}/)
            if (jsonMatch) {
                try {
                    analysis = JSON.parse(jsonMatch[0])
                } catch (e) {
                    console.error('Error parsing AI response:', e)
                }
            }
        }

        if (!analysis) {
            return NextResponse.json(
                {
                    error: 'No se pudo procesar la respuesta',
                    fallback: true
                },
                { status: 500 }
            )
        }

        // Retornar la respuesta procesada
        return NextResponse.json({
            success: true,
            analysis
        })

    } catch (error) {
        console.error('API error:', error)
        return NextResponse.json(
            {
                error: 'Error interno del servidor',
                fallback: true
            },
            { status: 500 }
        )
    }
}
