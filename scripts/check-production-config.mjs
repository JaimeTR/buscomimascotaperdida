import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const root = process.cwd()
const placeholderPattern =
    /your[_-]|your-production|example|changeme|replace[-_ ]?me|tu[-_ ]?dominio/i
const localUrlPattern = /\b(?:localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])\b/i
const sensitiveAssignmentPattern =
    /\b(?:API_KEY|SECRET|TOKEN|PASSWORD|PRIVATE_KEY)\s*=\s*([^\s#]+)/i

async function documentationFiles(directory) {
    const entries = await readdir(directory, { withFileTypes: true })
    const files = []

    for (const entry of entries) {
        if (entry.name.startsWith('.') && entry.name !== '.env.example') {
            continue
        }
        if (entry.name === 'superpowers') {
            continue
        }

        const entryPath = path.join(directory, entry.name)
        if (entry.isDirectory()) {
            files.push(...(await documentationFiles(entryPath)))
        } else if (
            entry.name === '.env.example' ||
            entry.name.toLowerCase().endsWith('.md')
        ) {
            files.push(entryPath)
        }
    }

    return files
}

function isAllowedPlaceholder(value) {
    return placeholderPattern.test(value)
}

const files = [
    path.join(root, '.env.example'),
    path.join(root, 'README.md'),
    path.join(root, 'DEPLOYMENT.md'),
    ...(await documentationFiles(path.join(root, 'docs')).catch(() => [])),
].filter((file, index, all) => all.indexOf(file) === index)

const findings = []

for (const file of files) {
    let content
    try {
        content = await readFile(file, 'utf8')
    } catch {
        continue
    }

    const relativeFile = path.relative(root, file)
    const isExampleEnv = relativeFile === '.env.example'

    content.split(/\r?\n/).forEach((line, index) => {
        const lineNumber = index + 1
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith('#')) {
            return
        }

        if (!isExampleEnv && localUrlPattern.test(line)) {
            findings.push(`${relativeFile}:${lineNumber} contains a local URL`)
        }

        const assignment = line.match(sensitiveAssignmentPattern)
        if (assignment) {
            const value = assignment[1].replace(/^['"]|['"]$/g, '')
            if (!isAllowedPlaceholder(value)) {
                findings.push(
                    `${relativeFile}:${lineNumber} contains a non-placeholder sensitive value`
                )
            }
        }
    })
}

if (findings.length > 0) {
    console.error('Production configuration check failed:')
    for (const finding of findings) {
        console.error(`- ${finding}`)
    }
    process.exitCode = 1
} else {
    console.log('Production configuration check passed.')
}
