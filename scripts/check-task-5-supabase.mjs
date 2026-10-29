import { readFile } from "node:fs/promises"
import { resolve } from "node:path"

const migrationPath = resolve("supabase/migrations/create_pet_images_storage.sql")
const sql = await readFile(migrationPath, "utf8")

const required = [
  /CREATE POLICY "Authenticated users can upload pet images"/i,
  /ON storage\.objects FOR INSERT/i,
  /TO authenticated/i,
  /WITH CHECK\s*\([\s\S]*bucket_id\s*=\s*'pet-images'/i,
  /storage\.foldername\(name\)\s*\)\[1\]\s*=\s*auth\.uid\(\)::text/i,
]

const missing = required.filter((pattern) => !pattern.test(sql))
if (missing.length > 0) {
  console.error("Task 5 SQL assertion failed: ownership-scoped INSERT policy is incomplete.")
  process.exit(1)
}

console.log("Task 5 SQL assertion passed: pet-images INSERT requires authenticated auth.uid ownership.")
