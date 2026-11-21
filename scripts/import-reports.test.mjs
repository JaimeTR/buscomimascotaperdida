import test from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { writeFileSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const run = (entry) => {
  const file = join(mkdtempSync(join(tmpdir(), 'rep-')), 'r.json')
  writeFileSync(file, JSON.stringify([entry]))
  return spawnSync('node', ['scripts/import-reports.mjs', file], { encoding: 'utf8' })
}
const ok = { type: 'dog', district: 'Lince', last_seen_date: `${new Date().getFullYear()}-01-05`, source_url: 'https://example.com/x', source_name: 'Test' }

test('acepta un reporte válido (dry-run)', () => assert.equal(run(ok).status, 0))
test('rechaza teléfonos en el texto', () => assert.notEqual(run({ ...ok, description: 'llamar al 987 654 321' }).status, 0))
test('rechaza fuente sin https', () => assert.notEqual(run({ ...ok, source_url: 'http://example.com/x' }).status, 0))
