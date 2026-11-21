import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const root = process.cwd()
const checkerPath = path.resolve(process.argv[1] ?? '')
const placeholderPattern =
  /your[_-]|your-production|example|changeme|replace[-_ ]?me|tu[-_ ]?(?:dominio|api[_-]?key)/i
const localUrlPattern = /\b(?:localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])\b/i
const sensitiveAssignmentPattern =
  /\b[A-Z0-9_]*(?:API_KEY|SECRET|TOKEN|PASSWORD|PRIVATE_KEY)\s*=\s*([^\s#]+)/i
const hardcodedGeminiPattern = /\bAIza[0-9A-Za-z_-]{20,}\b/
const hardcodedHuggingFacePattern = /\bhf_[0-9A-Za-z]{20,}\b/
const concreteSupabaseUrlPattern = /https:\/\/(?!your-project(?:[-.]))[a-z0-9-]+\.supabase\.co\b/i
const anonymousAdminFallbackPattern =
  /(?:SERVICE_ROLE_KEY|supabaseServiceKey)[\s\S]{0,160}NEXT_PUBLIC_SUPABASE_ANON_KEY|NEXT_PUBLIC_SUPABASE_ANON_KEY[\s\S]{0,160}(?:SERVICE_ROLE_KEY|supabaseServiceKey)/i

const sourceDirectories = ['scripts', 'src', 'supabase', 'docs']
const ignoredDirectories = new Set([
  '.git',
  '.next',
  '.superpowers',
  'superpowers',
  '.worktrees',
  'node_modules',
])

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    if (ignoredDirectories.has(entry.name)) continue
    const entryPath = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await collectFiles(entryPath)))
    } else if (/\.(?:js|mjs|ts|tsx|md|sql|env|yml|yaml)$/i.test(entry.name)) {
      files.push(entryPath)
    }
  }

  return files
}

function isAllowedPlaceholder(value) {
  return placeholderPattern.test(value)
}

function isAdministrativeScript(relativeFile) {
  return relativeFile.replaceAll('\\', '/').split('/')[0] === 'scripts'
}

function hasAnonymousAdminFallback(relativeFile, content) {
  return isAdministrativeScript(relativeFile) && anonymousAdminFallbackPattern.test(content)
}

function addPatternFindings(relativeFile, content, findings) {
  const lines = content.split(/\r?\n/)
  lines.forEach((line, index) => {
    if (
      hardcodedGeminiPattern.test(line) ||
      hardcodedHuggingFacePattern.test(line) ||
      concreteSupabaseUrlPattern.test(line)
    ) {
      findings.push(`${relativeFile}:${index + 1} contains a hardcoded provider credential or URL`)
    }
  })

  if (hasAnonymousAdminFallback(relativeFile, content)) {
    findings.push(`${relativeFile} uses NEXT_PUBLIC_SUPABASE_ANON_KEY as an administrative key`)
  }
}

if (process.argv.includes('--self-test')) {
  const fixtures = [
    ['hardcoded Gemini key', 'const key = "AIza123456789012345678901234567890";', hardcodedGeminiPattern],
    ['hardcoded Hugging Face key', 'const key = "hf_123456789012345678901234567890";', hardcodedHuggingFacePattern],
    ['concrete Supabase URL', 'const url = "https://qiiwqphdhpzkrjhrxsce.supabase.co";', concreteSupabaseUrlPattern],
  ]
  const failed = fixtures.filter(([, value, pattern]) => !pattern.test(value))
  const anonymousFallbackFixture =
    'const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY'
  if (!hasAnonymousAdminFallback('scripts/import-scraped-dogs.ts', anonymousFallbackFixture)) {
    failed.push(['anonymous Supabase administrative fallback'])
  }
  if (failed.length > 0) {
    console.error(`Production configuration self-test failed: ${failed.map(([name]) => name).join(', ')}`)
    process.exitCode = 1
  } else {
    console.log('Production configuration negative self-test passed.')
  }
  process.exit()
}

const files = [
  path.join(root, '.env.example'),
  ...(await Promise.all(sourceDirectories.map((directory) => collectFiles(path.join(root, directory)).catch(() => [])))).flat(),
  ...(await readdir(root, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.md'))
    .map((entry) => path.join(root, entry.name)),
].filter((file, index, all) => all.indexOf(file) === index)

const findings = []

for (const file of files) {
  if (path.resolve(file) === checkerPath) continue

  let content
  try {
    content = await readFile(file, 'utf8')
  } catch {
    continue
  }

  const relativeFile = path.relative(root, file)
  const isExampleEnv = relativeFile === '.env.example'
  const isDocumentation = isExampleEnv || relativeFile.toLowerCase().endsWith('.md')
  addPatternFindings(relativeFile, content, findings)

  content.split(/\r?\n/).forEach((line, index) => {
    const lineNumber = index + 1
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('//')) return

    if (isDocumentation && !isExampleEnv && localUrlPattern.test(line)) {
      findings.push(`${relativeFile}:${lineNumber} contains a local URL`)
    }

    const assignment = line.match(sensitiveAssignmentPattern)
    if (isDocumentation && assignment) {
      const value = assignment[1].replace(/^['"]|['"]$/g, '')
      if (!value.startsWith('process.env.') && !isAllowedPlaceholder(value)) {
        findings.push(`${relativeFile}:${lineNumber} contains a non-placeholder sensitive value`)
      }
    }
  })
}

if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_APP_URL?.trim()) {
  findings.push('production requires NEXT_PUBLIC_APP_URL')
}

if (findings.length > 0) {
  console.error('Production configuration check failed:')
  for (const finding of findings) console.error(`- ${finding}`)
  process.exitCode = 1
} else {
  console.log('Production configuration check passed.')
}
