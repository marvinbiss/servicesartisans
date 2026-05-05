#!/usr/bin/env node
/**
 * scripts/audit-rge-cee-linking.mjs
 * ----------------------------------
 * DoD anti-régression sur le maillage interne RGE↔CEE + PageRank sculpting.
 *
 * Source : memory `servicesartisans-internal-linking-rge-cee-2026-04-20`.
 * Mapping étendu (5 nouveaux codes CEE BAR-TH-172/174/143/159 + BAR-EN-108)
 * + helpers inverses + rel=nofollow sur noindex=true.
 *
 * Pourquoi : SA a 970K fiches noindex et 459K pages indexées. Sans
 * sculpting :
 *
 *   - rel="nofollow" retiré sur les liens vers fiches noindex → PageRank
 *     fuit vers 920K pages morts → dilution du jus interne pour les
 *     pages indexées (RGE/CEE/villes/services qui rankent).
 *   - getCeeOpsForRgeService() supprimée → bloc CEE inline sur
 *     /rge/[s]/[v] disparaît → 1 lien interne perdu vers /cee/[op] par
 *     fiche × 50K fiches RGE = 50K liens internes perdus.
 *   - getRgeServicesForCeeOp() supprimée → bloc RGE inline sur
 *     /cee/[op] disparaît → idem côté CEE.
 *   - 5 codes étendus retirés → mapping incomplet → cluster CEE-PAC
 *     orphelin (BAR-TH-172/159), cluster Iso/menuiseries cassé.
 *
 * Vérifications :
 *
 *   1. service-guides-map.ts exporte les 4 helpers core :
 *      getRgeGuidesForService, getCeeGuidesForService,
 *      getCeeOpsForRgeService, getRgeServicesForCeeOp
 *   2. qualification-matcher.ts contient les 5 codes étendus :
 *      BAR-TH-172, BAR-TH-174, BAR-TH-143, BAR-TH-159, BAR-EN-108
 *   3. ArtisanSimilar (et autres composants listings) utilisent
 *      `rel={noindex ? 'nofollow' : undefined}` ou pattern équivalent
 *   4. ProviderCard mentionne le rel=nofollow PageRank dans son JSDoc
 *      (documentation fait-foi vs régression)
 *
 * Usage :
 *   node scripts/audit-rge-cee-linking.mjs --strict
 */

import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const args = new Set(process.argv.slice(2))
const strict = args.has('--strict')
const jsonOut = args.has('--json')

const ROOT = process.cwd()
const MAP_LIB = join(ROOT, 'src', 'lib', 'rge', 'service-guides-map.ts')
const MATCHER_LIB = join(ROOT, 'src', 'lib', 'rge', 'qualification-matcher.ts')
const ARTISAN_SIMILAR = join(ROOT, 'src', 'components', 'artisan', 'ArtisanSimilar.tsx')
const PROVIDER_CARD = join(ROOT, 'src', 'components', 'ProviderCard.tsx')

const read = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : '')

const mapSrc = read(MAP_LIB)
const matcherSrc = read(MATCHER_LIB)
const similarSrc = read(ARTISAN_SIMILAR)
const cardSrc = read(PROVIDER_CARD)

const checks = [
  {
    id: 'service_guides_map_exports',
    label:
      'service-guides-map.ts exporte les 4 helpers RGE↔CEE (forward + inverse)',
    ok:
      mapSrc.length > 0 &&
      /export\s+function\s+getRgeGuidesForService/.test(mapSrc) &&
      /export\s+function\s+getCeeGuidesForService/.test(mapSrc) &&
      /export\s+function\s+getCeeOpsForRgeService/.test(mapSrc) &&
      /export\s+function\s+getRgeServicesForCeeOp/.test(mapSrc),
    weight: 2.0,
  },
  {
    id: 'cee_codes_extended_5',
    label:
      'qualification-matcher.ts contient les 5 codes étendus (BAR-TH-172/174/143/159 + BAR-EN-108)',
    ok:
      matcherSrc.length > 0 &&
      /BAR-TH-172/.test(matcherSrc) &&
      /BAR-TH-174/.test(matcherSrc) &&
      /BAR-TH-143/.test(matcherSrc) &&
      /BAR-TH-159/.test(matcherSrc) &&
      /BAR-EN-108/.test(matcherSrc),
    weight: 1.5,
  },
  {
    id: 'artisan_similar_nofollow_noindex',
    label:
      'ArtisanSimilar utilise rel="nofollow" sur items noindex (PageRank sculpting)',
    ok:
      similarSrc.length > 0 &&
      /rel\s*=\s*\{[^}]*noindex[^}]*['"]nofollow['"]/i.test(similarSrc),
    weight: 2.0,
  },
  {
    id: 'provider_card_nofollow_doc',
    label:
      'ProviderCard.tsx documente le pattern rel=nofollow PageRank (JSDoc)',
    ok:
      cardSrc.length > 0 &&
      /rel\s*=\s*['"]nofollow['"]|nofollow.*PageRank|PageRank.*nofollow/i.test(
        cardSrc
      ),
    weight: 1.0,
  },
]

const totalWeight = checks.reduce((s, c) => s + c.weight, 0)
const passedWeight = checks.filter((c) => c.ok).reduce((s, c) => s + c.weight, 0)
const coveragePct = Math.round((passedWeight / totalWeight) * 1000) / 10

const failures = checks.filter((c) => !c.ok)

const report = {
  backlog_item: 'P3-rge-cee-linking',
  source_memory: 'servicesartisans-internal-linking-rge-cee-2026-04-20',
  total_checks: checks.length,
  passed: checks.length - failures.length,
  passed_weight: passedWeight,
  total_weight: totalWeight,
  coverage_pct: coveragePct,
  failures: failures.map((f) => ({ id: f.id, label: f.label, weight: f.weight })),
}

if (jsonOut) {
  console.log(JSON.stringify(report, null, 2))
} else {
  console.log('\n📋 RGE↔CEE Internal Linking Audit (DoD P3-rge-cee-linking)\n')
  console.log(`  Patterns  : ${checks.length}`)
  console.log(`  Coverage  : ${coveragePct}% (${passedWeight}/${totalWeight} pondéré)`)
  for (const c of checks) {
    const icon = c.ok ? '✅' : '❌'
    console.log(`     ${icon}  [${c.id}] ${c.label} (poids ${c.weight})`)
  }
  if (failures.length === 0) {
    console.log('\n  ✅ Maillage RGE↔CEE + PageRank sculpting préservé.\n')
  } else {
    console.log(`\n  ⚠️  ${failures.length} régression(s) — DoD non atteinte.\n`)
  }
}

if (strict && failures.length > 0) process.exit(1)
