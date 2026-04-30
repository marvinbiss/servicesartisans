#!/usr/bin/env node
/**
 * Audit internal links — comptage statique sur les templates (public)/page.tsx.
 *
 * Compte les <Link href="..."> et `href={...}` dans chaque page pour
 * estimer le maillage interne. **Approximation** (compte du code source,
 * pas du rendu) — utile comme baseline / vérif post-Sprint maillage,
 * pas comme remplacement Screaming Frog.
 *
 * Usage :
 *   node scripts/audit-internal-links.mjs              # console table
 *   node scripts/audit-internal-links.mjs --json       # machine-readable
 *   node scripts/audit-internal-links.mjs --min 30     # alerter pages < 30 liens
 *   node scripts/audit-internal-links.mjs --top 20     # top 20 pages les + maillées
 *
 * Read-only. Idempotent.
 */

import { readFileSync } from 'node:fs'
import { relative } from 'node:path'
import { globSync } from 'glob'

const ROOT = process.cwd()
const args = new Set(process.argv.slice(2))
const JSON_MODE = args.has('--json')
const minIdx = process.argv.indexOf('--min')
const MIN_THRESHOLD = minIdx > 0 ? parseInt(process.argv[minIdx + 1], 10) || 0 : 0
const topIdx = process.argv.indexOf('--top')
const TOP_N = topIdx > 0 ? parseInt(process.argv[topIdx + 1], 10) || 20 : 20

const pages = globSync('src/app/(public)/**/page.tsx', { cwd: ROOT, absolute: true })

// Composants seo qui rendent eux-mêmes 5-30 liens internes ; quand un import
// est trouvé dans la page, on bonus le count avec une estimation moyenne
// (justifié au cas par cas pour ne pas sous-estimer Sprint 2/2.1).
const COMPONENT_BONUS = {
  CrossIntentLinks: 5,
  MaillageInterneBlock: 10,
  DeepPageLinks: 15,
  VerticalCrossLinks: 4,
  TopCitiesGrid: 20,
  InContentLinks: 5,
  CityHubLinks: 30,
  RelatedHubs: 4,
  DynamicFooterLinks: 15,
  FooterClusterLinks: 12,
  TopicalClusterLinks: 8,
  OrphanRescueLinks: 6,
  SeasonalLinks: 6,
  BlogClusterLinks: 8,
  BlogServiceCityLinks: 6,
  RelatedAides: 4,
  RelatedArticles: 4,
}

function countInlineLinks(source) {
  // 1) <Link href="..." OR href={...}>
  const linkMatches = source.match(/<Link\s+[^>]*href\s*=/g) || []
  // 2) <a href="..."> for external/internal in raw HTML
  const anchorMatches = source.match(/<a\s+[^>]*href\s*=\s*["{]/g) || []
  return linkMatches.length + anchorMatches.length
}

function detectComponentBonuses(source) {
  let bonus = 0
  const detected = []
  for (const [comp, count] of Object.entries(COMPONENT_BONUS)) {
    // Match `import X from` or `import { X }` or `<X` usage
    const re = new RegExp(`\\b${comp}\\b`)
    if (re.test(source)) {
      bonus += count
      detected.push(`${comp}(+${count})`)
    }
  }
  return { bonus, detected }
}

const results = []

for (const file of pages) {
  const source = readFileSync(file, 'utf8')
  const inline = countInlineLinks(source)
  const { bonus, detected } = detectComponentBonuses(source)
  const total = inline + bonus
  results.push({
    path: relative(ROOT, file).replace(/\\/g, '/'),
    inline,
    componentBonus: bonus,
    estimatedTotal: total,
    components: detected,
  })
}

results.sort((a, b) => b.estimatedTotal - a.estimatedTotal)

if (JSON_MODE) {
  console.log(JSON.stringify({ pages: results }, null, 2))
} else {
  const total = results.length
  const avg = total > 0 ? results.reduce((s, r) => s + r.estimatedTotal, 0) / total : 0
  const median = total > 0 ? results[Math.floor(total / 2)].estimatedTotal : 0
  const under10 = results.filter((r) => r.estimatedTotal < 10).length
  const under20 = results.filter((r) => r.estimatedTotal < 20).length
  const above30 = results.filter((r) => r.estimatedTotal >= 30).length

  console.log(`\n=== Audit internal links — ${total} pages (public)/page.tsx ===`)
  console.log(`Moyenne estimée : ${avg.toFixed(1)} liens/page`)
  console.log(`Médiane         : ${median} liens/page`)
  console.log(`Pages < 10 liens : ${under10}`)
  console.log(`Pages < 20 liens : ${under20}`)
  console.log(`Pages >= 30 liens : ${above30}`)

  console.log(`\n=== Top ${TOP_N} pages les plus maillées ===`)
  for (const r of results.slice(0, TOP_N)) {
    console.log(`${r.estimatedTotal.toString().padStart(4)} | ${r.path}`)
  }

  if (MIN_THRESHOLD > 0) {
    const below = results.filter((r) => r.estimatedTotal < MIN_THRESHOLD)
    console.log(`\n=== Pages < ${MIN_THRESHOLD} liens (alertes) — ${below.length} ===`)
    for (const r of below.slice(0, 50)) {
      console.log(`${r.estimatedTotal.toString().padStart(4)} | ${r.path}`)
    }
    if (below.length > 50) console.log(`... +${below.length - 50} autres`)
  }
}
