import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js@2"

const GEMINI_API_KEY = "AIzaSyB3IsU33a_VFRK8DSp65l6cDS1rcF7amjs"
const HF_API_KEY = "hf_REDACTED"

interface PetFilters {
  type?: string
  breed?: string
  color?: string
  size?: string
  district?: string
  gender?: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function analyzeWithGemini(message: string): Promise<any> {
  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" +
        GEMINI_API_KEY,
      {
        method: "POST",
        headers: {
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

    if (!response.ok) {
      throw new Error("Gemini API error")
    }

    const data = await response.json()
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
  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/meta-llama/Llama-2-7b-chat-hf",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
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

    if (!response.ok) {
      throw new Error("HF API error")
    }

    const data = await response.json()
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
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    })
  }

  try {
    const { message } = await req.json()

    if (!message) {
      return new Response(
        JSON.stringify({ error: "Message is required" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
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

    // Si ambas fallan, respuesta genérica
    if (!analysis) {
      analysis = {
        isPetSearch: false,
        response:
          "Perdón, tuve un problema procesando tu mensaje. ¿Puedes intentar de nuevo?",
        filters: {},
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let petResults: any[] = []

    // Si es búsqueda de mascota, buscar en BD
    if (analysis.isPetSearch && analysis.filters) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")
      const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")

      if (supabaseUrl && supabaseAnonKey) {
        const supabase = createClient(supabaseUrl, supabaseAnonKey)
        petResults = await searchPets(supabase, analysis.filters)
      }
    }

    return new Response(
      JSON.stringify({
        response: analysis.response,
        isPetSearch: analysis.isPetSearch,
        petResults: petResults,
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    )
  } catch (error) {
    console.error("Error:", error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    )
  }
})
