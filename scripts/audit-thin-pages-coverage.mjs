#!/usr/bin/env node
/**
 * scripts/audit-thin-pages-coverage.mjs
 * --------------------------------------
 * DoD du backlog item P3-thin-pages-coverage (Tier 52).
 *
 * Source : memory `servicesartisans-strategy-140k-2026-04-29` — 7 vagues
 * pour passer de 718K → 140K URLs (-80.5 %). 80.5 % retiré via :
 *   - DELETE 410 : 184 000 URLs (tarifs/task)
 *   - 301 vers /services/[s]/[v] : 370 000 URLs (devis + tarifs + urgence
 *     + services-thin + problèmes)
 *   - noindex : 23 000 URLs (avis)
 *
 * Chiffres GSC (memory `gsc-diagnostic-2026-04-30`) :
 *   - 112 429 pages "explorée non indexée" — Google juge insuffisant
 *     · 32.9 % /devis/[s]/[v]   (~37K)
 *     · 20.5 % /urgence/[s]/[v] (~23K)
 *     · 12.7 % /tarifs/[s]/[v]  (~14K)
 *     · 11.3 % /tarifs/[s]/[v]/[task] (~13K)
 *     · 8.0 % /avis/[s]/[v]     (~9K)
 *     · 4.9 % /problemes/[p]/[v] (~5.5K)
 *
 * Ces pages consomment du budget crawl + plombent l'autorité site sans
 * générer de trafic. La stratégie 140K a déjà 2 vagues actées dans
 * `next.config.js` (devis 301 + tarifs 301). Cet audit verrouille la
 * progression et guide les vagues suivantes.
 *
 * Vérifie sur next.config.js + arborescence src/app/(public)/ :
 *
 *   1. Vague devis : `/devis/:service/:location` → 301 /services/:s/:v
 *   2. Vague devis quartier : `/devis/:service/:location/:quartier` → 301
 *   3. Vague tarifs : `/tarifs/:service/:location` → 301 /services/:s/:v#tarifs
 *   4. Vague urgence : `/urgence/:service/:location` → 301 (À FAIRE)
 *   5. Vague problèmes : `/problemes/:probleme/:ville` → 301 (À FAIRE)
 *   6. Vague avis noindex : `/avis/[s]/[v]/page.tsx` exporte `robots:noindex`
 *      OU est listé dans audit-noindex-sitemap (À FAIRE)
 *   7. Vague tarifs/task 410 : `/tarifs/:service/:location/:task` →
 *      destination 410 ou DELETE route (À FAIRE)
 *
 * Threshold : --threshold N exige ≥N % des 7 vagues appliquées.
 * Coverage actuelle : 28-43 % (2-3/7). Lock-in regression au niveau actuel.
 *
 * Usage :
 *   node scripts/audit-thin-pages-coverage.mjs --strict
 *   node scripts/audit-thin-pages-coverage.mjs --threshold 50
 */

import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const args = process.argv.slice(2)
const thresholdArg = args.find((a) => a.startsWith('--threshold'))
const threshold = thresholdArg
  ? Number(thresholdArg.split('=')[1] ?? args[args.indexOf(thresholdArg) + 1] ?? 28)
  : 28
const strict = args.includes('--strict')
const jsonOut = args.includes('--json')

const ROOT = process.cwd()
const NEXT_CONFIG = join(ROOT, 'next.config.js')
const AVIS_VILLE_PAGE = join(
  ROOT,
  'src',
  'app',
  '(public)',
  'avis',
  '[service]',
  '[ville]',
  'page.tsx'
)
const TARIFS_TASK_PAGE = join(
  ROOT,
  'src',
  'app',
  '(public)',
  'tarifs',
  '[service]',
  '[location]',
  '[task]',
  'page.tsx'
)

const configSrc = existsSync(NEXT_CONFIG) ? readFileSync(NEXT_CONFIG, 'utf8') : ''
const avisSrc = existsSync(AVIS_VILLE_PAGE) ? readFileSync(AVIS_VILLE_PAGE, 'utf8') : ''

function hasRedirect(sourcePattern, destinationPattern) {
  // Match a redirect block { source: '...', destination: '...', permanent: true }
  const re = new RegExp(
    `source:\\s*['"]${sourcePattern.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}['"][\\s\\S]{0,300}?destination:\\s*['"]${destinationPattern.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}['"]`
  )
  return re.test(configSrc)
}

const checks = [
  {
    id: 'wave_devis_2seg',
    label: '/devis/[s]/[v] → 301 /services/[s]/[v] (104K URLs)',
    ok: /source:\s*['"]\/devis\/:service\/:location['"]/.test(configSrc) &&
      /destination:\s*['"]\/services\/:service\/:location['"]/.test(configSrc),
    weight: 2.0,
  },
  {
    id: 'wave_devis_3seg',
    label: '/devis/[s]/[v]/[quartier] → 301 /services/[s]/[v] (5K URLs)',
    ok: /source:\s*['"]\/devis\/:service\/:location\/:quartier['"]/.test(configSrc),
    weight: 1.0,
  },
  {
    id: 'wave_tarifs_2seg',
    label: '/tarifs/[s]/[v] → 301 /services/[s]/[v]#tarifs (104K URLs)',
    ok: /source:\s*['"]\/tarifs\/:service\/:location['"]/.test(configSrc) &&
      /destination:\s*['"]\/services\/:service\/:location#tarifs['"]/.test(configSrc),
    weight: 2.0,
  },
  {
    id: 'wave_urgence_2seg',
    label: '/urgence/[s]/[v] → 301 /services/[s]/[v] (23K URLs)',
    ok: /source:\s*['"]\/urgence\/:service\/:(?:location|ville)['"]/.test(configSrc),
    weight: 2.0,
  },
  {
    id: 'wave_problemes_2seg',
    label: '/problemes/[p]/[v] → 301 /services/[s]/[v] (5.5K URLs)',
    ok: /source:\s*['"]\/problemes\/:[a-z]+\/:(?:location|ville)['"]/.test(configSrc),
    weight: 1.0,
  },
  {
    id: 'wave_avis_noindex',
    label: '/avis/[s]/[v] noindex conditionnelle ou totale (9K URLs)',
    ok:
      !existsSync(AVIS_VILLE_PAGE) ||
      /robots:\s*\{[\s\S]{0,200}?index:\s*false/.test(avisSrc) ||
      /noindex:\s*true/.test(avisSrc) ||
      // Pattern existant : `index: !noindex` avec calcul conditionnel
      // (noindexInsufficientSocialProof || shouldNoindex(...))
      (/index:\s*!noindex/.test(avisSrc) &&
        /shouldNoindex\s*\(/.test(avisSrc) &&
        /noindexInsufficientSocialProof/.test(avisSrc)),
    weight: 1.0,
  },
  {
    id: 'wave_tarifs_task_410',
    label: '/tarifs/[s]/[v]/[task] → 410 ou route supprimée (184K URLs)',
    ok:
      !existsSync(TARIFS_TASK_PAGE) ||
      /\/tarifs\/:service\/:location\/:task[\s\S]{0,300}?destination:\s*['"]\/410/.test(
        configSrc
      ),
    weight: 2.5,
  },
]

const totalWeight = checks.reduce((s, c) => s + c.weight, 0)
const passedWeight = checks.filter((c) => c.ok).reduce((s, c) => s + c.weight, 0)
const coveragePct = Math.round((passedWeight / totalWeight) * 1000) / 10

const failures = checks.filter((c) => !c.ok)

const report = {
  backlog_item: 'P3-thin-pages-coverage',
  source_memory: 'servicesartisans-strategy-140k-2026-04-29',
  source_gsc: 'servicesartisans-gsc-diagnostic-2026-04-30',
  target_url_count: 140000,
  current_indexed: 367127,
  threshold,
  coverage_pct: coveragePct,
  total_waves: checks.length,
  passed_waves: checks.length - failures.length,
  passed_weight: passedWeight,
  total_weight: totalWeight,
  pending_waves: failures.map((f) => ({ id: f.id, label: f.label, weight: f.weight })),
}

if (jsonOut) {
  console.log(JSON.stringify(report, null, 2))
} else {
  console.log('\n📋 Thin Pages Strategy 140K Coverage (DoD P3-thin-pages-coverage)\n')
  console.log(`  Cible          : 718K → 140K URLs (-80.5 %)`)
  console.log(`  Indexé GSC     : 367 127 (au 27/04)`)
  console.log(`  Threshold      : ≥${threshold}%`)
  console.log(`  Coverage       : ${coveragePct}%  (${passedWeight}/${totalWeight} pondéré)`)
  console.log(`  Vagues         : ${checks.length - failures.length}/${checks.length}`)
  for (const c of checks) {
    const icon = c.ok ? '✅' : '⏳'
    console.log(`     ${icon}  [${c.id}] ${c.label} (poids ${c.weight})`)
  }
  if (failures.length > 0) {
    console.log('\n  Vagues à venir : à appliquer dans des Tiers ultérieurs.')
  }
  if (coveragePct >= threshold) {
    console.log(`\n  ✅ Coverage ${coveragePct}% ≥ threshold ${threshold}% — DoD atteinte.\n`)
  } else {
    console.log(
      `\n  ⚠️  Coverage ${coveragePct}% < threshold ${threshold}% — DoD non atteinte.\n`
    )
  }
}

if (strict && coveragePct < threshold) process.exit(1)
