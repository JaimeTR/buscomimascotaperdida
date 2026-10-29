import { readFile } from "node:fs/promises"
import { resolve } from "node:path"

const migrationPath = resolve("supabase/migrations/20261029140200_harden_pet_images_storage.sql")
const migration = await readFile(migrationPath, "utf8")
const appFiles = [
    "src/app/reportar/page.tsx",
    "src/app/dashboard/reports/[id]/edit/page.tsx",
    "src/app/mascotas/[id]/avistamiento/page.tsx",
]

const bucketBlock = migration.match(/UPDATE\s+storage\.buckets\b[\s\S]*?WHERE\b[\s\S]*?;/i)?.[0] ?? ""
const policyBlocks = [...migration.matchAll(/(?:DROP POLICY IF EXISTS|CREATE POLICY)[\s\S]*?;/gi)].map(match => match[0])
const insertPolicyBlock = policyBlocks.find(block => /CREATE POLICY "Authenticated users can upload pet images"/i.test(block)) ?? ""
const updatePolicyBlock = policyBlocks.find(block => /CREATE POLICY "Users can update their own pet images"/i.test(block)) ?? ""
const deletePolicyBlock = policyBlocks.find(block => /CREATE POLICY "Users can delete their own pet images"/i.test(block)) ?? ""

const requiredMigrationPatterns = [
    [/DROP POLICY IF EXISTS "Authenticated users can upload pet images" ON storage\.objects/i, migration],
    [/id\s*=\s*'pet-images'/i, bucketBlock],
    [/file_size_limit\s*=\s*5242880/i, bucketBlock],
    [/allowed_mime_types\s*=\s*ARRAY\['image\/jpeg',\s*'image\/png',\s*'image\/webp'\]/i, bucketBlock],
    [/ON storage\.objects FOR INSERT/i, insertPolicyBlock],
    [/WITH CHECK\s*\([\s\S]*bucket_id\s*=\s*'pet-images'[\s\S]*storage\.foldername\(name\)\s*\)\[1\]\s*=\s*auth\.uid\(\)::text/i, insertPolicyBlock],
    [/ON storage\.objects FOR UPDATE/i, updatePolicyBlock],
    [/USING\s*\([\s\S]*storage\.foldername\(name\)\s*\)\[1\]\s*=\s*auth\.uid\(\)::text[\s\S]*WITH CHECK\s*\([\s\S]*storage\.foldername\(name\)\s*\)\[1\]\s*=\s*auth\.uid\(\)::text/i, updatePolicyBlock],
    [/ON storage\.objects FOR DELETE/i, deletePolicyBlock],
    [/USING\s*\([\s\S]*storage\.foldername\(name\)\s*\)\[1\]\s*=\s*auth\.uid\(\)::text/i, deletePolicyBlock],
]

const missingMigrationPatterns = requiredMigrationPatterns.filter(([pattern, block]) => !pattern.test(block))
if (missingMigrationPatterns.length > 0 || !bucketBlock || !insertPolicyBlock || !updatePolicyBlock || !deletePolicyBlock) {
    console.error("Task 5 SQL assertion failed: hardened migration is incomplete.")
    process.exit(1)
}

for (const file of appFiles) {
    const source = await readFile(resolve(file), "utf8")
    if (!source.includes('from "@/lib/image-upload"') ||
        !source.includes("accept=\"image/jpeg,image/png,image/webp\"")) {
        console.error(`Task 5 upload assertion failed: ${file} lacks shared upload constraints.`)
        process.exit(1)
    }

    const uploadPositions = [...source.matchAll(/\.upload\s*\(/g)].map(match => match.index ?? -1)
    if (uploadPositions.length !== 1) {
        console.error(`Task 5 upload assertion failed: ${file} must contain exactly one Storage upload call.`)
        process.exit(1)
    }

    const uploadPosition = uploadPositions[0]
    const guardPosition = source.lastIndexOf("getImageUploadError(", uploadPosition)
    if (guardPosition < 0 || guardPosition > uploadPosition) {
        console.error(`Task 5 upload assertion failed: ${file} has no getImageUploadError(...) call before .upload(...).`)
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

console.log("Task 5 source-structure assertions passed: bucket target/limits, legacy policy replacement, ownership, and pre-upload guards are present.")
