// Quita specifiers de import marcados como "never used" por ESLint.
// Uso: eslint src -f json > lint.json && node scripts/remove-unused-imports.mjs lint.json
import { readFileSync, writeFileSync } from "node:fs"
import ts from "typescript"

const report = JSON.parse(readFileSync(process.argv[2], "utf8"))

for (const file of report) {
    const unused = new Set(
        file.messages
            .filter((m) => m.ruleId === "@typescript-eslint/no-unused-vars")
            .map((m) => /^'(.+)' is defined but never used/.exec(m.message)?.[1])
            .filter(Boolean)
    )
    if (!unused.size) continue

    const text = readFileSync(file.filePath, "utf8")
    const sf = ts.createSourceFile(file.filePath, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
    const edits = []

    for (const st of sf.statements) {
        if (!ts.isImportDeclaration(st) || !st.importClause) continue
        const c = st.importClause
        const defaultUnused = c.name && unused.has(c.name.text)
        const named = c.namedBindings && ts.isNamedImports(c.namedBindings) ? c.namedBindings.elements : []
        const keep = named.filter((e) => !unused.has(e.name.text))
        if (!defaultUnused && keep.length === named.length) continue

        if ((defaultUnused || !c.name) && keep.length === 0 && (defaultUnused || !c.name)) {
            edits.push([st.getFullStart(), st.getEnd(), ""])
            continue
        }
        const parts = []
        if (c.name && !defaultUnused) parts.push(c.name.text)
        if (keep.length) parts.push(`{ ${keep.map((e) => e.getText()).join(", ")} }`)
        edits.push([c.getStart(), c.getEnd(), parts.join(", ")])
    }

    let out = text
    for (const [s, e, r] of edits.sort((a, b) => b[0] - a[0])) out = out.slice(0, s) + r + out.slice(e)
    if (out !== text) { writeFileSync(file.filePath, out); console.log("fixed", file.filePath.split("buscomimascotaperdida.com")[1]) }
}
