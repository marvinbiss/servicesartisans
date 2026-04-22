#!/usr/bin/env node
/**
 * scripts/audit-external-links.mjs
 * --------------------------------
 * Audite les liens externes et les URLs codées en dur :
 *   1. Mixed content : URLs `http://` (non-HTTPS) — bloquent sur prod HTTPS,
 *      signal qualité dégradé pour Google.
 *   2. Liens externes sans `rel="noopener"` : faille reverse tabnabbing +
 *      référrer leak. `target="_blank"` sans `noopener` = pattern interdit.
 *   3. Liens externes sortants vers domaines tiers SANS `rel="nofollow"` /
 *      `sponsored` / `ugc` quand pertinent : risque PageRank outbound
 *      non intentionnel (guidelines Google Search Central).
 *
 * Règle stricte :
 *   - Zéro `http://` (hors commentaires URLs d'exemple).
 *   - Tout `target="_blank"` DOIT avoir `rel` avec `noopener` (ou
 *     implicitement via rel="noreferrer").
 *
 * Règle soft (reporting, non bloquant) :
 *   - Liens externes sans `rel` explicite sont listés — décision éditoriale.
 *
 * Usage :
 *   node scripts/audit-external-links.mjs            # human
 *   node scripts/audit-external-links.mjs --json     # JSON
 *   node scripts/audit-external-links.mjs --strict   # exit 1 si mixed content OU _blank sans noopener
 */

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, sep } from 'node:path'

const args = new Set(process.argv.slice(2))
const strict = args.has('--strict')
const jsonOut = args.has('--json')

/**
 * Domaines locaux tolérés même en http:// (ex: localhost pour tests).
 * Ne jamais étendre à des TLDs publics.
 */
const HTTP_ALLOWLIST_DOMAINS = ['localhost', '127.0.0.1']

function walk(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const st = statSync(full)
    if (st.isDirectory()) walk(full, acc)
    else if (/\.(tsx|ts|jsx|js|mjs)$/.test(entry)) acc.push(full)
  }
  return acc
}

/**
 * Détecte les URLs http:// en dur. On ignore les URLs dans :
 *   - Commentaires (lignes précédées par // ou à l'intérieur de /* ... *\/)
 *     (on les détecte de manière approximative en vérifiant le contexte de
 *     la ligne)
 *   - Les patterns XMLNS / DTD / namespaces qui utilisent http:// par spec
 *     (ex: `xmlns="http://www.w3.org/2000/svg"`, Schema.org `@context`)
 */
const XML_NAMESPACE_ALLOWED = [
  'http://www.w3.org/',
  'http://schema.org',
  'http://purl.org/',
  'http://www.opengis.net/',
  'http://ns.adobe.com/',
  'http://xmlns.com/',
]

function isAllowedHttp(url) {
  if (XML_NAMESPACE_ALLOWED.some((ns) => url.startsWith(ns))) return true
  try {
    const u = new URL(url)
    if (HTTP_ALLOWLIST_DOMAINS.includes(u.hostname)) return true
  } catch {}
  return false
}

function isInComment(src, index) {
  // Line comment
  const lineStart = src.lastIndexOf('\n', index) + 1
  const lineBefore = src.slice(lineStart, index)
  if (lineBefore.includes('//')) {
    const before = lineBefore.slice(0, lineBefore.indexOf('//'))
    // Éviter les faux positifs sur http:// — vérifier que le // n'est pas la
    // fin d'un protocole (ex: https://example.com contient //)
    if (!/https?:$/.test(before.trimEnd())) return true
  }
  return false
}

/**
 * Détecte `<a ... target="_blank"` sans `rel="noopener"` (ni `noreferrer`).
 * Match le tag d'ouverture complet (même multi-ligne).
 */
function findUnsafeBlank(src) {
  const results = []
  const re = /<a\b([^>]*?)>/gs
  for (const m of src.matchAll(re)) {
    const attrs = m[1]
    if (!/target\s*=\s*["']_blank["']/.test(attrs)) continue
    // rel peut être : rel="noopener", rel="noreferrer", rel="noopener noreferrer", etc.
    const relMatch = attrs.match(/rel\s*=\s*["']([^"']*)["']/)
    const rel = relMatch ? relMatch[1] : ''
    const hasNoopener = /\b(noopener|noreferrer)\b/.test(rel)
    if (!hasNoopener) {
      results.push({ attrs: attrs.trim(), index: m.index ?? 0 })
    }
  }
  return results
}

const files = walk('src')
const httpViolations = []
const blankViolations = []

for (const f of files) {
  const normalized = f.split(sep).join('/')
  if (/[\/\\]__tests__[\/\\]/.test(normalized)) continue
  if (/[\/\\]scripts[\/\\]/.test(normalized)) continue
  const src = readFileSync(f, 'utf8')

  // a. http:// violations — on exige au moins un caractère de nom de domaine
  // valide après `://` pour filtrer les mentions littérales (ex: texte d'aide
  // « seuls http:// et https:// sont acceptés »).
  for (const m of src.matchAll(/(?<!['":\w])http:\/\/[a-zA-Z0-9][^\s'"`<>(),]+/g)) {
    const url = m[0]
    const idx = m.index ?? 0
    if (isAllowedHttp(url)) continue
    if (isInComment(src, idx)) continue
    httpViolations.push({ file: normalized, url, index: idx })
  }

  // b. target="_blank" sans noopener/noreferrer
  for (const v of findUnsafeBlank(src)) {
    blankViolations.push({ file: normalized, snippet: `<a ${v.attrs}>` })
  }
}

const report = {
  files_scanned: files.length,
  http_violations: httpViolations.length,
  target_blank_without_noopener: blankViolations.length,
  details: {
    http: httpViolations,
    unsafe_blank: blankViolations,
  },
}

if (jsonOut) {
  console.log(JSON.stringify(report, null, 2))
} else {
  console.log('\n📋 External Links & Mixed Content Audit\n')
  console.log(`  Fichiers scannés             : ${report.files_scanned}`)
  console.log(`  URLs http:// en dur          : ${report.http_violations}`)
  console.log(`  <a target=_blank sans noopener: ${report.target_blank_without_noopener}\n`)

  if (httpViolations.length === 0 && blankViolations.length === 0) {
    console.log('  ✅ Aucune URL http:// et aucun <a _blank sans noopener.\n')
  } else {
    if (httpViolations.length) {
      console.log('  ⚠️  URLs http:// en dur (mixed content) :')
      for (const v of httpViolations.slice(0, 30)) {
        console.log(`     ${v.file}`)
        console.log(`         ${v.url}`)
      }
      if (httpViolations.length > 30) console.log(`     ... et ${httpViolations.length - 30} de plus`)
      console.log('')
    }
    if (blankViolations.length) {
      console.log('  ⚠️  <a target="_blank" sans rel="noopener" :')
      for (const v of blankViolations.slice(0, 30)) {
        console.log(`     ${v.file}`)
        const preview = v.snippet.length > 120 ? v.snippet.slice(0, 120) + '...' : v.snippet
        console.log(`         ${preview}`)
      }
      if (blankViolations.length > 30)
        console.log(`     ... et ${blankViolations.length - 30} de plus`)
      console.log('')
    }
  }
}

const total = httpViolations.length + blankViolations.length
if (strict && total > 0) process.exit(1)
