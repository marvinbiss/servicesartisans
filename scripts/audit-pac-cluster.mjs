#!/usr/bin/env node
/**
 * scripts/audit-pac-cluster.mjs
 * ------------------------------
 * DoD du backlog item P3-pac-cluster (Cluster #1 Ahrefs Bloc 1, vol 230K).
 *
 * Vérifie la cohérence du cluster pompe à chaleur :
 *
 *   1. Hub /renovation-energetique/travaux/pompe-a-chaleur existe
 *   2. Hub a header Ahrefs (@kw-primary + @ahrefs-source)
 *   3. ≥3 sub-pages PAC : air-air-prix, air-eau-prix, geothermie
 *   4. Hub utilise getFlagshipArticleSchema (E-E-A-T flagship)
 *   5. Hub utilise getFinancialProductSchema (cumul aides)
 *   6. ≥1 guide flagship pompe-a-chaleur* (E-E-A-T deep)
 *   7. /aides/pompe-a-chaleur-aides-comparatif existe
 *   8. /rge/labels/qualipac existe (label PAC RGE)
 *   9. Hub TldrBlock + FlagshipFaq rendered
 *   10. Hub LastUpdated rendered (signal fraîcheur)
 *
 * Stratégie : tous patterns OK = cluster prêt à scale. Garde-régression
 * pour empêcher la suppression d'une sub-page sans intention.
 *
 * Usage :
 *   node scripts/audit-pac-cluster.mjs           # human
 *   node scripts/audit-pac-cluster.mjs --json
 *   node scripts/audit-pac-cluster.mjs --strict  # exit 1 if gap
 */

import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const args = new Set(process.argv.slice(2))
const strict = args.has('--strict')
const jsonOut = args.has('--json')

const ROOT = process.cwd()
const PUBLIC = join(ROOT, 'src', 'app', '(public)')
const HUB = join(PUBLIC, 'renovation-energetique', 'travaux', 'pompe-a-chaleur', 'page.tsx')
const SUB = ['air-air-prix', 'air-eau-prix', 'geothermie'].map((s) =>
  join(PUBLIC, 'renovation-energetique', 'travaux', 'pompe-a-chaleur', s, 'page.tsx')
)
const GUIDE_HUB = join(PUBLIC, 'guides', 'pompe-a-chaleur', 'page.tsx')
const GUIDE_DEEP = join(PUBLIC, 'guides', 'pompe-a-chaleur-cee-maprimerenov-2026', 'page.tsx')
const AIDES_PAC = join(PUBLIC, 'aides', 'pompe-a-chaleur-aides-comparatif', 'page.tsx')
const RGE_QUALIPAC = join(PUBLIC, 'rge', 'labels', 'qualipac', 'page.tsx')

if (!existsSync(HUB)) {
  console.error('Audit PAC cluster : hub absent')
  if (strict) process.exit(1)
  process.exit(0)
}

const hubSrc = readFileSync(HUB, 'utf8')
const hubHead = hubSrc.split(/\r?\n/, 60).join('\n')

const checks = [
  {
    id: 'hub_exists',
    label: 'Hub /renovation-energetique/travaux/pompe-a-chaleur',
    ok: existsSync(HUB),
  },
  {
    id: 'hub_ahrefs_header',
    label: 'Hub : header @kw-primary + @ahrefs-source',
    ok: hubHead.includes('@kw-primary') && hubHead.includes('@ahrefs-source'),
  },
  {
    id: 'sub_pages',
    label: '3 sub-pages : air-air-prix + air-eau-prix + geothermie',
    ok: SUB.every((p) => existsSync(p)),
  },
  {
    id: 'flagship_article_schema',
    label: 'Hub : getFlagshipArticleSchema utilisé',
    ok: hubSrc.includes('getFlagshipArticleSchema'),
  },
  {
    id: 'financial_product_schema',
    label: 'Hub : getFinancialProductSchema (cumul aides)',
    ok: hubSrc.includes('getFinancialProductSchema'),
  },
  {
    id: 'guide_pac',
    label: '≥1 guide flagship pompe-a-chaleur* (E-E-A-T deep)',
    ok: existsSync(GUIDE_HUB) || existsSync(GUIDE_DEEP),
  },
  {
    id: 'aides_pac_compar',
    label: '/aides/pompe-a-chaleur-aides-comparatif',
    ok: existsSync(AIDES_PAC),
  },
  {
    id: 'rge_qualipac',
    label: '/rge/labels/qualipac (label PAC RGE)',
    ok: existsSync(RGE_QUALIPAC),
  },
  {
    id: 'tldr_faq_rendered',
    label: 'Hub : TldrBlock + FlagshipFaq rendered',
    ok:
      /import\s+TldrBlock/.test(hubSrc) &&
      /<TldrBlock[\s\S]*?bullets=/.test(hubSrc) &&
      /import\s+FlagshipFaq/.test(hubSrc) &&
      /<FlagshipFaq/.test(hubSrc),
  },
  {
    id: 'last_updated',
    label: 'Hub : LastUpdated rendered (fraîcheur)',
    ok: /import\s+LastUpdated/.test(hubSrc) && /<LastUpdated/.test(hubSrc),
  },
]

const failures = checks.filter((c) => !c.ok)

const report = {
  cluster: 'pompe-a-chaleur',
  hub: '/renovation-energetique/travaux/pompe-a-chaleur',
  total: checks.length,
  passed: checks.length - failures.length,
  failures: failures.map((f) => ({ id: f.id, label: f.label })),
}

if (jsonOut) {
  console.log(JSON.stringify(report, null, 2))
} else {
  console.log('\n📋 PAC Cluster Audit (DoD P3-pac-cluster)\n')
  console.log(`  Patterns vérifiés : ${checks.length}`)
  console.log(`  OK                : ${checks.length - failures.length}`)
  console.log(`  Échecs            : ${failures.length}`)
  for (const c of checks) {
    const icon = c.ok ? '✅' : '❌'
    console.log(`     ${icon}  [${c.id}] ${c.label}`)
  }
  console.log('')
  if (failures.length === 0) {
    console.log('  ✅ Cluster PAC conforme P3-pac-cluster.\n')
  } else {
    console.log(`  ⚠️  ${failures.length} pattern(s) manquant(s) — DoD non atteinte.\n`)
  }
}

if (strict && failures.length > 0) process.exit(1)
