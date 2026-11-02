import { readFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const root = process.cwd()
const routePath = path.join(root, 'src', 'app', 'api', 'chatbot', 'route.ts')
const edgePath = path.join(root, 'supabase', 'functions', 'chat-ai', 'index.ts')

const [route, edge] = await Promise.all([
  readFile(routePath, 'utf8'),
  readFile(edgePath, 'utf8'),
])

const checks = [
  ['route rejects messages over 500 characters', /message\.length\s*>\s*500/.test(route)],
  [
    'route sends the provider key only in the Authorization header',
    route.includes("Authorization: 'Bearer ' + huggingfaceApiKey") &&
      !/body:\s*JSON\.stringify\([\s\S]{0,500}huggingfaceApiKey/.test(route),
  ],
  [
    'route uses a 15-second AbortController timeout',
    /new AbortController\(\)/.test(route) &&
      /setTimeout\(\(\)\s*=>\s*controller\.abort\(\),\s*15_000\)/.test(route),
  ],
  [
    'route clears the timeout in finally',
    /finally\s*\{[\s\S]{0,120}clearTimeout\(timeout\)/.test(route),
  ],
  [
    'route parses the provider body inside the timed operation',
    /hfData:\s*unknown\s*=\s*await hfResponse\.json\(\)[\s\S]*finally\s*\{[\s\S]*clearTimeout\(timeout\)/.test(route),
  ],
  [
    'route maps provider body-read failures to HTTP 502',
    /chatbot provider operation failed[\s\S]*status:\s*502/.test(route),
  ],
  ['route validates provider output with Zod', /analysisSchema\.safeParse\(analysis\)/.test(route)],
  [
    'route has generic provider readiness and failure responses',
    /status:\s*503/.test(route) &&
      /status:\s*502/.test(route) &&
      /Error al procesar tu mensaje/.test(route),
  ],
  ['edge function validates provider output with a strict schema', /analysisSchema[\s\S]*?\.strict\(\)/.test(edge)],
  ['edge function fails closed when no provider is configured', /status:\s*503/.test(edge) && /!GEMINI_API_KEY && !HF_API_KEY/.test(edge)],
  [
    'edge function maps both-provider failures to HTTP 502',
    /if \(!analysis\)/.test(edge) && /Chat providers failed to return an analysis/.test(edge) &&
      /status:\s*502/.test(edge),
  ],
  [
    'optional filters normalize empty strings to null',
    /const optionalFilter = z\.string\(\)\.trim\(\)\.max\(100\)\.transform\(\(value\) => value \|\| null\)/.test(route) &&
      /const optionalFilter = z\.string\(\)\.trim\(\)\.max\(100\)\.transform\(\(value\) => value \|\| null\)/.test(edge),
  ],
]

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name)

if (failures.length > 0) {
  console.error('Chatbot structure check failed:')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exitCode = 1
} else {
  console.log(`Chatbot structure check passed (${checks.length} protections).`)
}
