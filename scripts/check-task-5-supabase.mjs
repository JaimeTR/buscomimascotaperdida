import { readFile } from "node:fs/promises"
import { resolve } from "node:path"

const migrationPath = resolve("supabase/migrations/20261029140200_harden_pet_images_storage.sql")
const migration = await readFile(migrationPath, "utf8")
const appFiles = [
    "src/app/reportar/page.tsx",
    "src/app/dashboard/reports/[id]/edit/page.tsx",
    "src/app/mascotas/[id]/avistamiento/page.tsx",
]

const requiredMigrationPatterns = [
    /UPDATE\s+storage\.buckets[\s\S]*file_size_limit\s*=\s*5242880/i,
    /allowed_mime_types\s*=\s*ARRAY\['image\/jpeg',\s*'image\/png',\s*'image\/webp'\]/i,
    /DROP POLICY IF EXISTS "Authenticated users can upload pet images" ON storage\.objects/i,
    /CREATE POLICY "Authenticated users can upload pet images"[\s\S]*ON storage\.objects FOR INSERT[\s\S]*WITH CHECK\s*\([\s\S]*bucket_id\s*=\s*'pet-images'[\s\S]*storage\.foldername\(name\)\s*\)\[1\]\s*=\s*auth\.uid\(\)::text/i,
    /CREATE POLICY "Users can update their own pet images"[\s\S]*ON storage\.objects FOR UPDATE[\s\S]*USING\s*\([\s\S]*storage\.foldername\(name\)\s*\)\[1\]\s*=\s*auth\.uid\(\)::text[\s\S]*WITH CHECK\s*\([\s\S]*storage\.foldername\(name\)\s*\)\[1\]\s*=\s*auth\.uid\(\)::text/i,
    /CREATE POLICY "Users can delete their own pet images"[\s\S]*ON storage\.objects FOR DELETE[\s\S]*USING\s*\([\s\S]*storage\.foldername\(name\)\s*\)\[1\]\s*=\s*auth\.uid\(\)::text/i,
]

const missingMigrationPatterns = requiredMigrationPatterns.filter(pattern => !pattern.test(migration))
if (missingMigrationPatterns.length > 0) {
    console.error("Task 5 SQL assertion failed: hardened migration is incomplete.")
    process.exit(1)
}

for (const file of appFiles) {
    const source = await readFile(resolve(file), "utf8")
    if (!source.includes('from "@/lib/image-upload"') ||
        !source.includes("getImageUploadError") ||
        !source.includes("accept=\"image/jpeg,image/png,image/webp\"")) {
        console.error(`Task 5 upload assertion failed: ${file} lacks shared MIME/size enforcement hooks.`)
        process.exit(1)
    }
}

const utility = await readFile(resolve("src/lib/image-upload.ts"), "utf8")
for (const pattern of [
    /IMAGE_UPLOAD_MAX_BYTES\s*=\s*5\s*\*\s*1024\s*\*\s*1024/,
    /"image\/jpeg"/,
    /"image\/png"/,
    /"image\/webp"/,
    /file\.size\s*>\s*IMAGE_UPLOAD_MAX_BYTES/,
]) {
    if (!pattern.test(utility)) {
        console.error("Task 5 upload assertion failed: shared image constraints are incomplete.")
        process.exit(1)
    }
}

console.log("Task 5 assertions passed: legacy policy replacement, Storage limits, ownership, and app upload constraints are present.")
