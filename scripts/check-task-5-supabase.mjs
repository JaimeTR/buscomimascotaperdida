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
    [/USING\s*\([\s\S]*bucket_id\s*=\s*'pet-images'[\s\S]*storage\.foldername\(name\)\s*\)\[1\]\s*=\s*auth\.uid\(\)::text[\s\S]*WITH CHECK\s*\([\s\S]*bucket_id\s*=\s*'pet-images'[\s\S]*storage\.foldername\(name\)\s*\)\[1\]\s*=\s*auth\.uid\(\)::text/i, updatePolicyBlock],
    [/ON storage\.objects FOR DELETE/i, deletePolicyBlock],
    [/USING\s*\([\s\S]*bucket_id\s*=\s*'pet-images'[\s\S]*storage\.foldername\(name\)\s*\)\[1\]\s*=\s*auth\.uid\(\)::text/i, deletePolicyBlock],
]

const missingMigrationPatterns = requiredMigrationPatterns.filter(([pattern, block]) => !pattern.test(block))
if (missingMigrationPatterns.length > 0 || !bucketBlock || !insertPolicyBlock || !updatePolicyBlock || !deletePolicyBlock) {
    console.error("Task 5 SQL assertion failed: hardened migration is incomplete.")
    process.exit(1)
}

function findMatchingDelimiter(source, start, opening, closing) {
    let depth = 0
    let quote = null
    let escaped = false

    for (let index = start; index < source.length; index += 1) {
        const character = source[index]
        const nextCharacter = source[index + 1]

        if (quote) {
            if (escaped) {
                escaped = false
            } else if (character === "\\") {
                escaped = true
            } else if (character === quote) {
                quote = null
            }
            continue
        }

        if ((character === "'" || character === '"' || character === "`")) {
            quote = character
            continue
        }
        if (character === "/" && nextCharacter === "/") {
            const lineEnd = source.indexOf("\n", index + 2)
            index = lineEnd === -1 ? source.length : lineEnd
            continue
        }
        if (character === "/" && nextCharacter === "*") {
            const commentEnd = source.indexOf("*/", index + 2)
            index = commentEnd === -1 ? source.length : commentEnd + 1
            continue
        }
        if (character === opening) depth += 1
        if (character === closing && --depth === 0) return index
    }

    return -1
}

function hasExactUploadGuard(source, uploadPosition) {
    const precedingSource = source.slice(0, uploadPosition)
    const assignmentMatches = [...precedingSource.matchAll(
        /\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*getImageUploadError\s*\(([^()]*)\)\s*;?/g,
    )]
    const assignment = assignmentMatches.at(-1)
    if (!assignment) return false

    const variableName = assignment[1]
    const guardStart = (assignment.index ?? 0) + assignment[0].length
    const flow = source.slice(guardStart, uploadPosition)
    const ifPattern = /\bif\s*\(/g

    for (const match of flow.matchAll(ifPattern)) {
        const ifStart = match.index ?? 0
        const conditionStart = flow.indexOf("(", ifStart)
        const conditionEnd = findMatchingDelimiter(flow, conditionStart, "(", ")")
        if (conditionEnd === -1) continue

        const condition = flow.slice(conditionStart + 1, conditionEnd).trim()
        if (condition !== variableName) continue

        let consequentStart = conditionEnd + 1
        while (/\s/.test(flow[consequentStart] ?? "")) consequentStart += 1

        if (flow[consequentStart] === "{") {
            const bodyEnd = findMatchingDelimiter(flow, consequentStart, "{", "}")
            if (bodyEnd === -1) continue
            if (/^\s*(?:throw\b|return\b)/.test(flow.slice(consequentStart + 1, bodyEnd))) {
                return true
            }
        } else if (/^(?:throw\b|return\b)/.test(flow.slice(consequentStart))) {
            return true
        }
    }

    return false
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
    if (!hasExactUploadGuard(source, uploadPosition)) {
        console.error(`Task 5 upload assertion failed: ${file} lacks a same-branch getImageUploadError(...) guard with an explicit throw/return before .upload(...).`)
        process.exit(1)
    }
}

const syntheticValidFlow = `
    const imageError = getImageUploadError(imageFile)
    if (imageError) throw new Error(imageError)
    await storage.upload(imageFile)
`
const syntheticUnrelatedCondition = `
    const imageError = getImageUploadError(imageFile)
    if (otherError) throw new Error(imageError)
    await storage.upload(imageFile)
`
if (!hasExactUploadGuard(syntheticValidFlow, syntheticValidFlow.indexOf(".upload(")) ||
    hasExactUploadGuard(syntheticUnrelatedCondition, syntheticUnrelatedCondition.indexOf(".upload("))) {
    console.error("Task 5 upload assertion regression failed: guard matching is not variable-specific.")
    process.exit(1)
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

console.log("Task 5 source-structure assertions passed: bucket targets/limits, legacy policy replacement, ownership, and same-branch pre-upload guards are present.")
