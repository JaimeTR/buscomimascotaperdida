// Importa reportes de fuentes públicas verificadas (noticias, refugios) a la tabla pets.
//
//   node scripts/import-reports.mjs data/reports-lima.json          (valida y muestra, no escribe)
//   node scripts/import-reports.mjs data/reports-lima.json --apply  (escribe en Supabase)
//
// Requiere SUPABASE_SERVICE_ROLE_KEY y NEXT_PUBLIC_SUPABASE_URL en .env.local.
// Reglas: solo hechos del caso + enlace a la fuente. Sin teléfonos, sin nombres de personas,
// sin fotos de terceros. Solo casos de Lima ocurridos en el año actual.
import { readFileSync, existsSync } from "node:fs"
import { createClient } from "@supabase/supabase-js"
import { z } from "zod"

const YEAR = new Date().getFullYear()
const PHONE = /(?:\+?51)?[\s-]?9\d{2}[\s-]?\d{3}[\s-]?\d{3}/
const EMAIL = /\S+@\S+\.\S+/

const text = (max) => z.string().trim().min(1).max(max)
  .refine((v) => !PHONE.test(v) && !EMAIL.test(v), "no incluir teléfonos ni correos")

const entry = z.object({
  name: text(60).optional(),
  type: z.enum(["dog", "cat", "other"]),
  breed: text(60).optional(),
  colors: z.array(text(30)).max(4).optional(),
  description: text(500).optional(),
  status: z.enum(["lost", "found"]).default("lost"),
  district: text(60),
  province: z.literal("Lima").default("Lima"),
  department: z.literal("Lima").default("Lima"),
  address: text(120).optional(), // referencia pública (cruce de calles), nunca una dirección de domicilio
  lat: z.number().min(-12.5).max(-11.5).optional(), // caja aproximada de Lima Metropolitana
  lng: z.number().min(-77.3).max(-76.7).optional(),
  last_seen_date: z.string().date().refine((d) => new Date(d).getFullYear() === YEAR, `debe ser de ${YEAR}`),
  source_url: z.string().url().refine((u) => u.startsWith("https://"), "https obligatorio"),
  source_name: text(80),
}).strict()

const file = process.argv[2]
if (!file || !existsSync(file)) {
  console.error("Uso: node scripts/import-reports.mjs <archivo.json> [--apply]")
  process.exit(1)
}

const parsed = z.array(entry).safeParse(JSON.parse(readFileSync(file, "utf8")))
if (!parsed.success) {
  for (const i of parsed.error.issues) console.error(`#${i.path[0]} ${i.path.slice(1).join(".")}: ${i.message}`)
  process.exit(1)
}

const rows = parsed.data.map((e) => ({
  name: e.name ?? null,
  type: e.type,
  breed: e.breed ?? null,
  colors: e.colors ?? null,
  description: e.description ?? null,
  status: e.status,
  last_seen_department: e.department,
  last_seen_province: e.province,
  last_seen_district: e.district,
  last_seen_address: e.address ?? null,
  last_seen_lat: e.lat ?? null,
  last_seen_lng: e.lng ?? null,
  last_seen_date: new Date(e.last_seen_date).toISOString(),
  source_url: e.source_url,
  source_name: e.source_name,
}))

console.log(`${rows.length} reportes válidos`)
if (!process.argv.includes("--apply")) {
  console.table(rows.map((r) => ({ name: r.name, type: r.type, district: r.last_seen_district, date: r.last_seen_date.slice(0, 10), source: r.source_name })))
  console.log("Dry-run: agrega --apply para escribir.")
  process.exit(0)
}

if (existsSync(".env.local")) process.loadEnvFile(".env.local")
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) { console.error("Falta NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY"); process.exit(1) }

const db = createClient(url, key, { auth: { persistSession: false } })
const { error, count } = await db.from("pets").upsert(rows, { onConflict: "source_url", count: "exact" })
if (error) { console.error("Error:", error.message); process.exit(1) }
console.log(`Importados/actualizados: ${count}`)
