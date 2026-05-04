#!/usr/bin/env node
/**
 * scripts/audit-vmc-cluster.mjs
 * ------------------------------
 * DoD du backlog item P3-vmc-cluster (goldmine KD 0.7, vol 127K cumulé).
 *
 * Vérifie :
 *
 *   1. Hub /renovation-energetique/travaux/vmc existe
 *   2. ≥3 sub-pages : simple-flux + hygroreglable + installation
 *   3. Hub a header Ahrefs strict (@kw-primary "vmc double flux")
 *   4. Chaque sub-page a son propre @kw-primary distinct + @ahrefs-source
 *   5. Hub utilise getFlagshipArticleSchema (E-E-A-T flagship)
 *   6. Hub utilise getGovernmentServiceSchema (cumul aides VMC)
 *   7. Hub TldrBlock + FlagshipFaq + LastUpdated rendered
 *   8. Hub mentionne ≥4 marques (Aldes, Atlantic, Helios, Unelvent ou ZehnderHelios)
 *   9. Hub linke ≥2 sub-pages (cocon interne)
 *
 * Usage :
 *   node scripts/audit-vmc-cluster.mjs --strict
 */

import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const args = new Set(process.argv.slice(2))
const strict = args.has('--strict')
const jsonOut = args.has('--json')

const ROOT = process.cwd()
const PUBLIC = join(ROOT, 'src', 'app', '(public)')
const VMC_BASE = join(PUBLIC, 'renovation-energetique', 'travaux', 'vmc')
const HUB = join(VMC_BASE, 'page.tsx')
const SUBS = ['simple-flux', 'hygroreglable', 'installation']

if (!existsSync(HUB)) {
  console.error('Audit VMC cluster : hub absent')
  if (strict) process.exit(1)
  process.exit(0)
}

const hubSrc = readFileSync(HUB, 'utf8')
const hubHead = hubSrc.split(/\r?\n/, 60).join('\n')

// Sub-pages : header Ahrefs distinct
const subData = SUBS.map((slug) => {
  const path = join(VMC_BASE, slug, 'page.tsx')
  if (!existsSync(path)) return { slug, exists: false, kwPrimary: null }
  const src = readFileSync(path, 'utf8')
  const head = src.split(/\r?\n/, 60).join('\n')
  const m = head.match(/@kw-primary\s+(.+)/)
  return {
    slug,
    exists: true,
    hasAhrefs: head.includes('@kw-primary') && head.includes('@ahrefs-source'),
    kwPrimary: m ? m[1].trim() : null,
  }
})

const allSubsExist = subData.every((s) => s.exists)
const allSubsAhrefs = subData.filter((s) => s.exists).every((s) => s.hasAhrefs)
const distinctKws = new Set(subData.filter((s) => s.kwPrimary).map((s) => s.kwPrimary))

const BRANDS = ['Aldes', 'Atlantic', 'Helios', 'Unelvent', 'Zehnder', 'ZehnderHelios']
const brandsFound = BRANDS.filter((b) => hubSrc.includes(b)).length

const subLinks = SUBS.filter((s) => hubSrc.includes(`/vmc/${s}`)).length

const checks = [
  {
    id: 'hub_exists',
    label: 'Hub /renovation-energetique/travaux/vmc',
    ok: existsSync(HUB),
  },
  {
    id: 'sub_pages',
    label: `3 sub-pages présentes (${SUBS.join(', ')})`,
    ok: allSubsExist,
  },
  {
    id: 'hub_ahrefs_header',
    label: 'Hub : header @kw-primary + @ahrefs-source',
    ok:
      hubHead.includes('@kw-primary') &&
      hubHead.includes('@ahrefs-source') &&
      hubHead.includes('vmc double flux'),
  },
  {
    id: 'sub_ahrefs_headers',
    label: `Chaque sub-page a header Ahrefs (${subData.filter((s) => s.exists && s.hasAhrefs).length}/${SUBS.length})`,
    ok: allSubsAhrefs,
  },
  {
    id: 'distinct_kws',
    label: `KW primaires distincts par sub-page (${distinctKws.size}/${SUBS.length})`,
    ok: distinctKws.size === SUBS.length,
  },
  {
    id: 'flagship_article',
    label: 'Hub : getFlagshipArticleSchema utilisé',
    ok: hubSrc.includes('getFlagshipArticleSchema'),
  },
  {
    id: 'government_service',
    label: 'Hub : getGovernmentServiceSchema (cumul aides VMC)',
    ok: hubSrc.includes('getGovernmentServiceSchema'),
  },
  {
    id: 'tldr_faq_lastupdated',
    label: 'Hub : TldrBlock + FlagshipFaq + LastUpdated rendered',
    ok:
      /<TldrBlock[\s\S]*?bullets=/.test(hubSrc) &&
      /<FlagshipFaq/.test(hubSrc) &&
      /<LastUpdated/.test(hubSrc),
  },
  {
    id: 'brands_mentioned',
    label: `Hub mentionne ≥4 marques VMC (actuel ${brandsFound}/6)`,
    ok: brandsFound >= 4,
  },
  {
    id: 'cocon_internal',
    label: `Hub linke ≥2 sub-pages (cocon, actuel ${subLinks}/${SUBS.length})`,
    ok: subLinks >= 2,
  },
]

const failures = checks.filter((c) => !c.ok)

const report = {
  cluster: 'vmc',
  hub: '/renovation-energetique/travaux/vmc',
  subs: subData,
  brands_found: brandsFound,
  sub_links: subLinks,
  total: checks.length,
  passed: checks.length - failures.length,
  failures: failures.map((f) => ({ id: f.id, label: f.label })),
}

if (jsonOut) {
  console.log(JSON.stringify(report, null, 2))
} else {
  console.log('\n📋 VMC Cluster Audit (DoD P3-vmc-cluster)\n')
  console.log(`  Patterns vérifiés : ${checks.length}`)
  console.log(`  OK                : ${checks.length - failures.length}`)
  console.log(`  Échecs            : ${failures.length}`)
  for (const c of checks) {
    const icon = c.ok ? '✅' : '❌'
    console.log(`     ${icon}  [${c.id}] ${c.label}`)
  }
  console.log('')
  if (failures.length === 0) {
    console.log('  ✅ Cluster VMC conforme P3-vmc-cluster.\n')
  } else {
    console.log(`  ⚠️  ${failures.length} pattern(s) manquant(s) — DoD non atteinte.\n`)
  }
}

if (strict && failures.length > 0) process.exit(1)
