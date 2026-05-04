#!/usr/bin/env node
/**
 * scripts/audit-aides-hub.mjs
 * ----------------------------
 * DoD du backlog item P3-aides-hub-racine.
 *
 * Vérifie l'état du hub /aides + sous-pages thématiques.
 *
 * Patterns audités :
 *   1. /aides racine existe (page.tsx)
 *   2. /aides racine inclut header Ahrefs (@kw-primary + @ahrefs-source)
 *   3. WebPage schema avec @id + inLanguage + isPartOf #website (cohérence Tier 35)
 *   4. ItemList hub schema avec ≥10 items
 *   5. TldrBlock rendered (E-E-A-T pré-FAQ)
 *   6. EnBrefBox rendered
 *   7. Auteur YMYL (Person schema avec methodology/skills)
 *   8. Reviewer cross-review (getReviewerForAuthor)
 *   9. aidesCatalog contient ≥12 entries (cible backlog atteinte)
 *   10. ≥6 sous-pages comparatives statiques sous /aides/
 *
 * Stratégie : tous les patterns doivent passer. Si on baisse à <12
 * dans aidesCatalog (régression), ou perd le triplet Schema.org sur
 * la racine, l'audit rejette le commit.
 *
 * Usage :
 *   node scripts/audit-aides-hub.mjs           # human report
 *   node scripts/audit-aides-hub.mjs --json
 *   node scripts/audit-aides-hub.mjs --strict  # exit 1 if gap
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const args = new Set(process.argv.slice(2))
const strict = args.has('--strict')
const jsonOut = args.has('--json')

const ROOT = process.cwd()
const HUB_PAGE = join(ROOT, 'src', 'app', '(public)', 'aides', 'page.tsx')
const HUB_DIR = join(ROOT, 'src', 'app', '(public)', 'aides')
const CATALOG = join(ROOT, 'src', 'lib', 'aides', 'aides-catalog.ts')

if (!existsSync(HUB_PAGE)) {
  console.error('Audit /aides hub : page racine absente')
  if (strict) process.exit(1)
  process.exit(0)
}
if (!existsSync(CATALOG)) {
  console.error('Audit /aides hub : aides-catalog absent')
  if (strict) process.exit(1)
  process.exit(0)
}

const src = readFileSync(HUB_PAGE, 'utf8')
const head = src.split(/\r?\n/, 60).join('\n')
const catalogSrc = readFileSync(CATALOG, 'utf8')

// Count slug entries in aidesCatalog (only literal `slug: 'xxx'` lines)
const catalogSlugs = (catalogSrc.match(/^\s+slug:\s*'[^']+'/gm) || []).length

// Count static comparative subpages under /aides/ (folders with page.tsx, exclude dynamic [slug])
const subPages = readdirSync(HUB_DIR).filter((entry) => {
  if (entry.startsWith('[')) return false
  if (entry === 'page.tsx') return false
  const full = join(HUB_DIR, entry)
  if (!statSync(full).isDirectory()) return false
  return existsSync(join(full, 'page.tsx'))
}).length

const checks = [
  {
    id: 'racine_exists',
    label: '/aides racine existe (page.tsx)',
    ok: existsSync(HUB_PAGE),
  },
  {
    id: 'ahrefs_header',
    label: 'Header @kw-primary + @ahrefs-source dans 60 premières lignes',
    ok: head.includes('@kw-primary') && head.includes('@ahrefs-source'),
  },
  {
    id: 'webpage_triplet',
    label: 'WebPage @id + inLanguage + isPartOf #website',
    ok:
      src.includes("'@type': 'WebPage'") &&
      src.includes('#webpage') &&
      src.includes("inLanguage: 'fr-FR'") &&
      src.includes('#website'),
  },
  {
    id: 'itemlist_hub',
    label: 'ItemList hub avec numberOfItems ≥10',
    ok:
      src.includes("'@type': 'ItemList'") &&
      src.includes('aidesCatalog.length') &&
      catalogSlugs >= 10,
  },
  {
    id: 'tldr_rendered',
    label: 'TldrBlock rendered',
    ok: /import\s+TldrBlock/.test(src) && /<TldrBlock[\s\S]*?bullets=/.test(src),
  },
  {
    id: 'enbref_rendered',
    label: 'EnBrefBox rendered',
    ok: /import\s+EnBrefBox/.test(src) && /<EnBrefBox/.test(src),
  },
  {
    id: 'author_ymyl',
    label: 'Auteur Person + skills/methodology (YMYL)',
    ok: src.includes('AUTHOR') && src.includes('methodology') && src.includes('skills'),
  },
  {
    id: 'reviewer_crossreview',
    label: 'Reviewer cross-review (getReviewerForAuthor)',
    ok: src.includes('getReviewerForAuthor') && src.includes('REVIEWER'),
  },
  {
    id: 'catalog_size',
    label: `aidesCatalog ≥12 entries (actuel ${catalogSlugs})`,
    ok: catalogSlugs >= 12,
  },
  {
    id: 'comparative_subpages',
    label: `≥6 sous-pages comparatives statiques (actuel ${subPages})`,
    ok: subPages >= 6,
  },
]

const failures = checks.filter((c) => !c.ok)

const report = {
  hub: '/aides',
  catalog_slugs: catalogSlugs,
  comparative_subpages: subPages,
  total: checks.length,
  passed: checks.length - failures.length,
  failures: failures.map((f) => ({ id: f.id, label: f.label })),
}

if (jsonOut) {
  console.log(JSON.stringify(report, null, 2))
} else {
  console.log('\n📋 Aides Hub Audit (DoD P3-aides-hub-racine)\n')
  console.log(`  Catalogue aides     : ${catalogSlugs} entries`)
  console.log(`  Sous-pages compar.  : ${subPages}`)
  console.log(`  Patterns vérifiés   : ${checks.length}`)
  console.log(`  OK                  : ${checks.length - failures.length}`)
  console.log(`  Échecs              : ${failures.length}`)
  for (const c of checks) {
    const icon = c.ok ? '✅' : '❌'
    console.log(`     ${icon}  [${c.id}] ${c.label}`)
  }
  console.log('')
  if (failures.length === 0) {
    console.log('  ✅ Hub /aides conforme P3-aides-hub-racine.\n')
  } else {
    console.log(`  ⚠️  ${failures.length} pattern(s) manquant(s) — DoD non atteinte.\n`)
  }
}

if (strict && failures.length > 0) process.exit(1)
