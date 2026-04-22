#!/usr/bin/env node
/**
 * scripts/audit-dynamic-meta.mjs
 * ------------------------------
 * Audit des metadata DYNAMIQUES (pages avec generateMetadata) :
 *   - extrait les templates `description: \`...\`` dans generateMetadata
 *   - calcule la longueur au pire cas en remplaçant les placeholders ${X}
 *     par des valeurs longues réalistes
 *   - reporte les templates où worstCase > 160 chars
 *
 * Pourquoi :
 *   audit-meta-quality ne peut pas évaluer les pages dynamiques. Or ce sont
 *   elles (services/[s]/[v], devis/[s]/[v], tarifs/[s]/[v], rge/[s]/[v],
 *   avis/[s]/[v]…) qui représentent 99 % du volume pSEO (408K+ URLs).
 *
 * Hypothèses worst-case :
 *   - tradeLower / serviceName ≤ 30 chars (ex: "chauffagiste installateur")
 *   - villeName / location.name ≤ 30 chars (ex: "Saint-Étienne-du-Rouvray")
 *   - departement ≤ 25 chars (ex: "Pyrénées-Atlantiques")
 *   - minPrice/maxPrice/unit ≤ 15 chars (ex: "1 500 €/m²")
 *   - autres placeholders : 20 chars par défaut
 *
 * Titles : le repo utilise déjà truncateTitle(…, 58) côté runtime, donc
 * on les ignore (garantie by construction).
 *
 * Usage :
 *   node scripts/audit-dynamic-meta.mjs           # human
 *   node scripts/audit-dynamic-meta.mjs --json    # JSON
 *   node scripts/audit-dynamic-meta.mjs --strict  # exit 1 si gap
 */

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const args = new Set(process.argv.slice(2))
const strict = args.has('--strict')
const jsonOut = args.has('--json')

const DESC_MAX = 160

const WORST = {
  // Services / métiers (le plus long connu dans le repo ≈ 28 chars)
  tradeLower: 30,
  tradeName: 30,
  trade: 30,
  service: 30,
  serviceName: 30,
  svcLower: 30,
  'service.name': 30,
  'trade.name': 30,
  // Localisations
  ville: 30,
  villeName: 30,
  'villeData.name': 30,
  'location.name': 30,
  'city.name': 30,
  'commune.name': 30,
  'villeData.departement': 25,
  'location.departement': 25,
  departement: 25,
  dept: 25,
  region: 30,
  // Tarifs
  minPrice: 8,
  maxPrice: 8,
  'trade.priceRange.unit': 8,
  'trade.averageResponseTime': 30,
  prix: 10,
  price: 10,
  unit: 8,
  // Temporel
  month: 15, // "septembre 2026"
  year: 4,
  // Compteurs (formatés avec espaces fr-FR, ex: "1 234 567")
  active: 10,
  total: 10,
  count: 10,
  n: 10,
  // Divers — fallback
  DEFAULT: 25,
}

function walk(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const st = statSync(full)
    if (st.isDirectory()) walk(full, acc)
    else if (entry === 'page.tsx') acc.push(full)
  }
  return acc
}

function hasGenerateMetadata(src) {
  return /export\s+async\s+function\s+generateMetadata\b/.test(src)
}

// Extract all description template literals inside generateMetadata block.
// On isole le body de generateMetadata et on cherche les `description: \`...\``
// puis `description: '...'` / `"..."`. On skip les commentaires.
function extractDescriptionTemplates(src) {
  const out = []
  const genStart = src.indexOf('export async function generateMetadata')
  if (genStart === -1) return out

  // Find the matching closing brace (rough): start after first '{' and count
  let i = src.indexOf('{', genStart)
  if (i === -1) return out
  let depth = 1
  let j = i + 1
  while (j < src.length && depth > 0) {
    const ch = src[j]
    if (ch === '{') depth++
    else if (ch === '}') depth--
    j++
  }
  const body = src.slice(i, j)

  // Match `description: \`...\`` (multi-line allowed)
  const tpl = /description\s*:\s*`([^`]+)`/g
  let m
  while ((m = tpl.exec(body))) out.push({ type: 'template', raw: m[1] })

  // Match `description: '...'` or `description: "..."` (single line)
  const str = /description\s*:\s*(['"])((?:\\.|(?!\1).)+)\1/g
  while ((m = str.exec(body))) out.push({ type: 'string', raw: m[2] })

  return out
}

function worstCaseLength(template) {
  // For string type (no interpolation), return length as-is
  // For template type, replace ${expr} with worst-case length for `expr`
  let worst = 0
  let collapsed = ''
  let i = 0
  while (i < template.length) {
    if (template[i] === '$' && template[i + 1] === '{') {
      // find matching }
      let depth = 1
      let j = i + 2
      while (j < template.length && depth > 0) {
        if (template[j] === '{') depth++
        else if (template[j] === '}') depth--
        j++
      }
      const expr = template.slice(i + 2, j - 1).trim()
      // Try exact key first (e.g. 'villeData.name'), fallback on last segment
      const lookup =
        WORST[expr] ??
        WORST[expr.split('.').pop() ?? ''] ??
        WORST[expr.split('.')[0] ?? ''] ??
        WORST.DEFAULT
      worst += lookup
      collapsed += `<${expr}:${lookup}>`
      i = j
    } else {
      worst += 1
      collapsed += template[i]
      i++
    }
  }
  return { worst, collapsed }
}

function main() {
  const root = join(process.cwd(), 'src', 'app', '(public)')
  const files = walk(root)
  const dynamicFiles = files.filter((f) => hasGenerateMetadata(readFileSync(f, 'utf8')))

  const issues = []
  for (const file of dynamicFiles) {
    const src = readFileSync(file, 'utf8')
    const templates = extractDescriptionTemplates(src)
    for (const t of templates) {
      const { worst, collapsed } = worstCaseLength(t.raw)
      if (worst > DESC_MAX) {
        issues.push({
          file: file.replace(process.cwd() + '\\', '').replace(/\\/g, '/'),
          worstLength: worst,
          template: t.raw.slice(0, 180),
          preview: collapsed.slice(0, 220),
        })
      }
    }
  }

  if (jsonOut) {
    console.log(
      JSON.stringify(
        {
          dynamic_files: dynamicFiles.length,
          templates_over_limit: issues.length,
          issues,
        },
        null,
        2,
      ),
    )
  } else {
    console.log('\n📋 Dynamic Metadata Audit (worst-case description length)\n')
    console.log(`  Pages dynamiques                 : ${dynamicFiles.length}`)
    console.log(`  Descriptions potentiellement >160 : ${issues.length}`)
    if (issues.length === 0) {
      console.log('\n  ✅ Toutes les descriptions dynamiques tiennent en 160 chars au pire cas.\n')
    } else {
      console.log('\n  ⚠️  Templates potentiellement trop longs :\n')
      for (const i of issues) {
        console.log(`    [${i.worstLength}] ${i.file}`)
        console.log(`       → ${i.preview}`)
      }
      console.log('')
    }
  }

  if (strict && issues.length > 0) process.exit(1)
}

main()
