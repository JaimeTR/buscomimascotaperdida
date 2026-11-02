// Falla si una página/acción de /admin no pasa por requireAdmin().
import { readFileSync, readdirSync, statSync } from "node:fs"
import { join } from "node:path"

const walk = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]))
const files = walk("src/app/admin").filter((f) => /(page|layout|actions)\.tsx?$/.test(f))
const bad = files.filter((f) => !readFileSync(f, "utf8").includes("requireAdmin"))
if (bad.length) { console.error("Sin requireAdmin:", bad.join(", ")); process.exit(1) }
console.log(`OK: ${files.length} archivos admin protegidos`)
