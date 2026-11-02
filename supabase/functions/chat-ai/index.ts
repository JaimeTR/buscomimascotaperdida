import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js@2"
import { z } from "npm:zod@4.3.5"

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY")
const HF_API_KEY = Deno.env.get("HUGGINGFACE_API_KEY")
const ALLOWED_ORIGIN = Deno.env.get("ALLOWED_ORIGIN") || ""
const PROVIDER_TIMEOUT_MS = 15_000
const optionalFilter = z.string().trim().max(100).transform((value) => value || null)
const analysisSchema = z.object({
  isPetSearch: z.boolean(),
  response: z.string().trim().min(1).max(500),
  filters: z.object({
    type: z.enum(["dog", "cat", "rabbit"]).nullable().optional().default(null),
    breed: optionalFilter.nullable().optional().default(null),
    color: optionalFilter.nullable().optional().default(null),
    size: z.enum(["small", "medium", "large"]).nullable().optional().default(null),
    district: optionalFilter.nullable().optional().default(null),
    gender: z.enum(["male", "female"]).nullable().optional().default(null),
  }).strict(),
}).strict()

interface PetFilters {
  type?: string
  breed?: string
  color?: string
  size?: string
  district?: string
  gender?: string
}

async function fetchProvider(
  input: string,
  init: RequestInit
// eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), PROVIDER_TIMEOUT_MS)

  try {
    const response = await fetch(input, { ...init, signal: controller.signal })

    if (!response.ok) {
      throw new Error("Provider API error")
    }

    return await response.json()
  } finally {
    clearTimeout(timeout)
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function analyzeWithGemini(message: string): Promise<any> {
  if (!GEMINI_API_KEY) return null

  try {
    const data = await fetchProvider(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "x-goog-api-key": GEMINI_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Eres un asistente para buscar mascotas perdidas. Analiza este mensaje y extrae información.

Mensaje: "${message}"

Responde SOLO en JSON válido (sin markdown, sin explicaciones adicionales):
{
  "isPetSearch": boolean,
  "response": "string con respuesta conversacional amable",
  "filters": {
    "type": "dog" | "cat" | "rabbit" | null,
    "breed": "string o null",
    "color": "string o null",
    "size": "small" | "medium" | "large" | null,
    "district": "string o null",
    "gender": "male" | "female" | null
  }
}

Si es búsqueda de mascota, isPetSearch=true y extrae los datos que se mencionen.
Si NO es búsqueda, isPetSearch=false y deja filters con valores null.`,
                },
              ],
            },
          ],
        }),
      }
    )

    const text = data?.contents?.[0]?.parts?.[0]?.text || "{}"

    // Limpiar JSON si viene con markdown
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    const jsonStr = jsonMatch ? jsonMatch[0] : "{}"

    return JSON.parse(jsonStr)
  } catch (error) {
    console.error("Gemini error:", error)
    return null
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function analyzeWithHuggingFace(message: string): Promise<any> {
  if (!HF_API_KEY) return null

  try {
    const data = await fetchProvider(
      "https://api-inference.huggingface.co/models/meta-llama/Llama-2-7b-chat-hf",
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + HF_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: `Eres un asistente para buscar mascotas perdidas. Analiza este mensaje y responde SOLO en JSON válido:

Mensaje: "${message}"

Responde en JSON:
{
  "isPetSearch": boolean,
  "response": "string con respuesta amable",
  "filters": {
    "type": "dog" | "cat" | "rabbit" | null,
    "breed": "string o null",
    "color": "string o null",
    "size": "small" | "medium" | "large" | null,
    "district": "string o null",
    "gender": "male" | "female" | null
  }
}`,
          parameters: {
            max_new_tokens: 500,
          },
        }),
      }
    )

    const text = Array.isArray(data) ? data[0]?.generated_text : data?.generated_text

    if (!text) return null

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    const jsonStr = jsonMatch ? jsonMatch[0] : "{}"

    return JSON.parse(jsonStr)
  } catch (error) {
    console.error("HuggingFace error:", error)
    return null
  }
}

async function searchPets(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  filters: PetFilters
// eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any[]> {
  try {
    let query = supabase
      .from("pets")
      .select(
        "id, name, type, breed, colors, size, gender, last_seen_district, image_urls, status, description"
      )
      .in("status", ["lost", "found", "in_contact"])

    if (filters.type) query = query.eq("type", filters.type)
    if (filters.breed) query = query.ilike("breed", `%${filters.breed}%`)
    if (filters.size) query = query.eq("size", filters.size)
    if (filters.gender) query = query.eq("gender", filters.gender)
    if (filters.district)
      query = query.ilike("last_seen_district", `%${filters.district}%`)

    const { data, error } = await query.limit(5)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Search error:", error)
    return []
  }
}

Deno.serve(async (req: Request) => {
  if (!ALLOWED_ORIGIN || (!GEMINI_API_KEY && !HF_API_KEY)) {
    return new Response(JSON.stringify({ error: "Chat service is not configured" }), {
      status: 503,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "null",
      },
    })
  }

  const requestOrigin = req.headers.get("origin") || ""
  const corsOrigin =
    ALLOWED_ORIGIN && requestOrigin === ALLOWED_ORIGIN ? ALLOWED_ORIGIN : ALLOWED_ORIGIN || "null"

  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": corsOrigin,
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    })
  }

  try {
    const body = await req.json()
    const message = typeof body?.message === "string" ? body.message.trim() : ""

    if (!message || message.length > 500) {
      return new Response(
        JSON.stringify({ error: "Message is invalid" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": corsOrigin,
          },
        }
      )
    }

// Intentar con HuggingFace primero, Gemini como fallback
    let analysis = await analyzeWithHuggingFace(message)

    if (!analysis) {
      console.log("HuggingFace failed, trying Gemini...")
      analysis = await analyzeWithGemini(message)
    }

    if (!analysis) {
      console.error("Chat providers failed to return an analysis")
      return new Response(JSON.stringify({ error: "Unable to process chat response" }), {
        status: 502,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": corsOrigin,
        },
      })
    }

    const validatedAnalysis = analysisSchema.safeParse(analysis)

    if (!validatedAnalysis.success) {
      console.error("Chat providers returned an invalid analysis shape")
      return new Response(JSON.stringify({ error: "Unable to process chat response" }), {
        status: 502,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": corsOrigin,
        },
      })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let petResults: any[] = []

    // Si es búsqueda de mascota, buscar en BD
    if (validatedAnalysis.data.isPetSearch) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")
      const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")

      if (supabaseUrl && supabaseAnonKey) {
        const supabase = createClient(supabaseUrl, supabaseAnonKey)
        petResults = await searchPets(supabase, validatedAnalysis.data.filters)
      }
    }

    return new Response(
      JSON.stringify({
        response: validatedAnalysis.data.response,
        isPetSearch: validatedAnalysis.data.isPetSearch,
        petResults: petResults,
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": corsOrigin,
        },
      }
    )
  } catch (error) {
    console.error("Error:", error)
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": corsOrigin,
        },
      }
    )
  }
})
