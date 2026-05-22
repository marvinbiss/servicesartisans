#!/usr/bin/env node
/**
 * scripts/audit-rge-template.mjs
 * -------------------------------
 * DoD du backlog item P3-rge-template-upgrade.
 *
 * Vérifie que `src/app/(public)/rge/[service]/[ville]/page.tsx` contient
 * les 10 patterns du Sprint 5/Tier 40 :
 *
 *   1. truncate 60 — selectFittingTitle(..., 60)
 *   2. Sprint 2 review prefix — '★ ('
 *   3. AggregateRating fallback dept — getReviewStatsByDept
 *   4. Article + Speakable schema
 *   5. GovernmentService schema (getGovernmentServiceSchema)
 *   6. FinancialProduct schema (getFinancialProductSchema)
 *   7. CollectionPage @id + inLanguage + isPartOf #website
 *   8. PrimesCEEBlock conditionnel (showCeeBlock)
 *   9. TldrBlock rendered (pas seulement importé)
 *   10. Ahrefs-first header (@kw-primary + @ahrefs-source dans 60 premières
 *       lignes — déjà couvert par audit-ahrefs-first-rule mais on double-check)
 *
 * Garde-régression : si un futur edit casse un de ces patterns, le commit
 * est rejeté et le backlog item bascule status=blocked.
 *
 * Usage :
 *   node scripts/audit-rge-template.mjs           # rapport humain
 *   node scripts/audit-rge-template.mjs --json
 *   node scripts/audit-rge-template.mjs --strict  # exit 1 si gap
 */

import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const args = new Set(process.argv.slice(2))
const strict = args.has('--strict')
const jsonOut = args.has('--json')

const ROOT = process.cwd()
const PAGE = join(ROOT, 'src', 'app', '(public)', 'rge', '[service]', '[ville]', 'page.tsx')

if (!existsSync(PAGE)) {
  console.error(`Audit RGE template : page absente — ${PAGE}`)
  if (strict) process.exit(1)
  process.exit(0)
}

const src = readFileSync(PAGE, 'utf8')
const head = src.split(/\r?\n/, 60).join('\n')

const checks = [
  {
    id: 'fitting_title',
    label: 'selectFittingTitle wrap (maxLen ≤ 46 raw + 19 brand = 65 rendu)',
    // 2026-05-22 — bumped from maxLen=60 to maxLen=46 : le rendu HTML
    // ajoute ` | ServicesArtisans` (19c) via le root layout template,
    // donc 60 raw = 79 rendu (Google tronque ~580px desktop). Voir
    // scripts/audit-title-length.mjs --strict pour le gate cross-templates.
    ok: /selectFittingTitle\([^,]+,[^,]+,\s*(?:41|46)\s*\)/.test(src),
  },
  {
    id: 'sprint2_review_prefix',
    label: 'Sprint 2 review prefix ★',
    ok: src.includes('★ (') && src.includes('reviewPrefix'),
  },
  {
    id: 'aggregate_rating_dept_fallback',
    label: 'AggregateRating fallback département',
    ok: src.includes('getReviewStatsByDept') && src.includes('fallbackDeptUsed'),
  },
  {
    id: 'article_speakable',
    label: 'Article + SpeakableSpecification',
    ok:
      src.includes("'@type': 'Article'") &&
      src.includes('SpeakableSpecification') &&
      src.includes('reviewedBy'),
  },
  {
    id: 'government_service_schema',
    label: 'GovernmentService (ANAH / France Rénov)',
    // 2026-05-22 — extension Schema GovernmentService per-service.
    // Le template peut soit déclarer les sameAs france-renov en inline
    // (legacy generic injection), soit déléguer au helper aides-for-service
    // (per-service injection). On accepte les deux signatures pour ne pas
    // bloquer la migration.
    ok:
      src.includes('getGovernmentServiceSchema(') &&
      (src.includes('france-renov.gouv.fr') ||
        src.includes('getApplicableAidesForService') ||
        src.includes("from '@/lib/seo/aides-for-service'")),
  },
  {
    id: 'financial_product_schema',
    label: 'FinancialProduct (cumul aides)',
    ok: src.includes('getFinancialProductSchema(') && src.includes("'Government Grant'"),
  },
  {
    id: 'collectionpage_triplet',
    label: 'CollectionPage @id + inLanguage + isPartOf (Tier 35)',
    ok:
      src.includes("'@type': 'CollectionPage'") &&
      src.includes('#collection') &&
      src.includes("inLanguage: 'fr-FR'") &&
      src.includes('#website'),
  },
  {
    id: 'cee_block_conditional',
    label: 'PrimesCEEBlock conditionnel showCeeBlock',
    ok: src.includes('PrimesCEEBlock') && src.includes('showCeeBlock'),
  },
  {
    id: 'tldr_rendered',
    label: 'TldrBlock rendered (pas seulement importé)',
    ok: /import\s+TldrBlock\s+from/.test(src) && /<TldrBlock\s+bullets=\{tldrBullets\}/.test(src),
  },
  {
    id: 'ahrefs_first_header',
    label: 'Header @kw-primary + @ahrefs-source dans 60 premières lignes',
    ok: head.includes('@kw-primary') && head.includes('@ahrefs-source'),
  },
]

const failures = checks.filter((c) => !c.ok)

const report = {
  page: 'src/app/(public)/rge/[service]/[ville]/page.tsx',
  total: checks.length,
  passed: checks.length - failures.length,
  failures: failures.map((f) => ({ id: f.id, label: f.label })),
}

if (jsonOut) {
  console.log(JSON.stringify(report, null, 2))
} else {
  console.log('\n📋 RGE Template Audit (DoD P3-rge-template-upgrade)\n')
  console.log(`  Patterns vérifiés : ${checks.length}`)
  console.log(`  OK                : ${checks.length - failures.length}`)
  console.log(`  Échecs            : ${failures.length}`)
  for (const c of checks) {
    const icon = c.ok ? '✅' : '❌'
    console.log(`     ${icon}  [${c.id}] ${c.label}`)
  }
  console.log('')
  if (failures.length === 0) {
    console.log('  ✅ Template /rge/[s]/[v] conforme Sprint 5 / Tier 40.\n')
  } else {
    console.log(`  ⚠️  ${failures.length} pattern(s) manquant(s) — DoD non atteinte.\n`)
  }
}

if (strict && failures.length > 0) process.exit(1)
