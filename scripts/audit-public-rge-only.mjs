#!/usr/bin/env node
/**
 * audit-public-rge-only.mjs — pivot full RGE 2026-05-05.
 *
 * SA = annuaire 100% artisans RGE certifiés. Toute page publique qui
 * appelle un helper provider DOIT laisser le default `rgeOnly: true`,
 * sinon réintroduire `{ rgeOnly: false }` requalifie la page comme
 * annuaire généraliste — contradictoire avec le positionnement.
 *
 * Cette règle bloque uniquement le passage explicite de `{ rgeOnly: false }`
 * (ou `rgeOnly = false`) dans `src/app/(public)/...`. Les fichiers
 * `src/app/admin/...` + scripts + libs internes restent libres.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = join(process.cwd(), 'src', 'app', '(public)')
const strict = process.argv.includes('--strict')

function walk(dir) {
  const out = []
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    const stat = statSync(full)
    if (stat.isDirectory()) out.push(...walk(full))
    else if (/\.(tsx?|jsx?)$/.test(name)) out.push(full)
  }
  return out
}

const FORBIDDEN = [
  /\brgeOnly\s*[:=]\s*false\b/,
]

const violations = []
for (const file of walk(ROOT)) {
  const src = readFileSync(file, 'utf8')
  for (const re of FORBIDDEN) {
    const m = re.exec(src)
    if (!m) continue
    const upTo = src.slice(0, m.index)
    const line = upTo.split(/\r?\n/).length
    violations.push({
      file: file.replace(/\\/g, '/').replace(/.*\/src\//, 'src/'),
      line,
      code: m[0],
    })
  }
}

if (violations.length === 0) {
  console.log(`✅ audit-public-rge-only : aucun \`rgeOnly: false\` dans src/app/(public).`)
  process.exit(0)
}

console.error(`\n❌ ${violations.length} pages (public) désactivent le filtre RGE :\n`)
for (const v of violations) {
  console.error(`  ${v.file}:${v.line}\n    ${v.code}`)
}
console.error(
  '\n  Pivot full RGE 2026-05-05 — pages publiques = artisans RGE only. Retirer le `rgeOnly: false` ou retirer la page de (public).\n'
)
process.exit(strict ? 1 : 0)
