#!/usr/bin/env node
/**
 * scripts/audit-jsonld-escape.mjs
 * --------------------------------
 * Anti-régression XSS sur les injections JSON-LD inline.
 *
 * Vérifie que tout `dangerouslySetInnerHTML` portant du JSON-LD passe par
 * `safeJsonStringify` (importé depuis `@/lib/seo/safe-json`).
 *
 * Pourquoi :
 *   - JSON.stringify natif n'échappe pas U+2028 / U+2029 (line/paragraph
 *     separators), interprétés comme fins de ligne par le parser HTML →
 *     peut casser un script tag et créer une fenêtre d'injection.
 *   - JSON.stringify natif n'échappe pas non plus `<` / `>` / `&`, ce qui
 *     permet de fermer la balise `<script>` via une donnée DB.
 *
 * Régression historique : pendant Sprint 0.1+0.2, seul `helpers.ts` du
 * périmètre RGE avait été corrigé. JsonLd.tsx (composant racine utilisé par
 * /villes, /services, /datasets, /developpeurs, layout root) restait
 * vulnérable. Audit gap-analyst Sprint 0.3 a flagé le trou.
 *
 * Usage :
 *   node scripts/audit-jsonld-escape.mjs           # human
 *   node scripts/audit-jsonld-escape.mjs --strict  # exit 1 si gap
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const args = new Set(process.argv.slice(2))
const strict = args.has('--strict')

function walk(dir, acc = []) {
  if (!existsSync(dir)) return acc
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const st = statSync(full)
    if (st.isDirectory()) {
      if (entry === 'node_modules' || entry === '.next' || entry.startsWith('.')) continue
      walk(full, acc)
    } else if (/\.(tsx?|jsx?)$/.test(entry) && !entry.endsWith('.test.ts') && !entry.endsWith('.test.tsx')) {
      acc.push(full)
    }
  }
  return acc
}

const files = walk('src')
const issues = []

for (const file of files) {
  const src = readFileSync(file, 'utf8')
  if (!src.includes('dangerouslySetInnerHTML')) continue
  if (!src.includes('application/ld+json')) continue

  // Pour chaque bloc dangerouslySetInnerHTML qui suit un type="application/ld+json",
  // vérifier que __html provient de safeJsonStringify (et pas JSON.stringify direct).
  const lines = src.split('\n')
  let inJsonLdScript = false
  let scriptStartLine = -1
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line.includes('application/ld+json')) {
      inJsonLdScript = true
      scriptStartLine = i + 1
      continue
    }
    if (inJsonLdScript && line.includes('dangerouslySetInnerHTML')) {
      // Scan prochaines ~10 lignes pour __html
      const window = lines.slice(i, Math.min(i + 12, lines.length)).join('\n')
      const usesSafe = /safeJsonStringify\s*\(/.test(window)
      const usesNative =
        /__html\s*:\s*JSON\.stringify\s*\(/.test(window) && !usesSafe
      if (usesNative) {
        issues.push({
          file: file.replaceAll('\\', '/'),
          line: scriptStartLine,
          snippet: window.split('\n').slice(0, 6).join('\n'),
        })
      }
      inJsonLdScript = false
    }
    if (line.includes('</script>') || (inJsonLdScript && line.includes('/>'))) {
      inJsonLdScript = false
    }
  }
}

console.error('\n📋 JSON-LD Escape Audit (XSS U+2028 / U+2029 + <,>,&)')
console.error('')
console.error(`  Fichiers scannés         : ${files.length}`)
console.error(`  Issues (JSON.stringify direct dans <script ld+json>) : ${issues.length}`)
console.error('')

if (issues.length > 0) {
  console.error('  ❌ Injections JSON-LD non escapées :')
  for (const issue of issues) {
    console.error(`     ${issue.file}:${issue.line}`)
    console.error(`       ${issue.snippet.split('\n').slice(0, 3).join(' ')}`)
  }
  console.error('')
  console.error('  Fix : remplacer JSON.stringify(...) par safeJsonStringify(...)')
  console.error('        depuis "@/lib/seo/safe-json".')
  if (strict) process.exit(1)
} else {
  console.error('  ✅ Toutes les injections JSON-LD passent par safeJsonStringify.')
}
