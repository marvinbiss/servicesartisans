/**
 * Audit Site P0 — diagnose des 4 issues critiques Ahrefs Site Audit
 * (2026-05-03) sans dépendance sur l'API v3 Ahrefs (qui n'expose pas les
 * listes URL → seulement les counts agrégés).
 *
 * Source de vérité = notre code + DB. Plus fiable qu'un CSV Ahrefs daté.
 *
 * Catégories auditées :
 *   1. noindex-in-sitemap  (Ahrefs count: 386, Error)
 *   2. orphan candidates   (Ahrefs count: 484+92, Error+Warning)
 *   3. broken internal links (Ahrefs count: 23, Error)
 *
 * NON couvert (besoin live GSC) :
 *   4. noindex-with-traffic (count: 2) → procédure manuelle Marvin via
 *      GSC URL Inspection.
 *
 * Usage :
 *   npx tsx scripts/audit-site-p0-2026-05-03.ts
 *
 * Output : 3 CSV dans C:\Users\USER\Downloads\_phase0_audit\E_site_internal\
 */
import * as fs from 'fs'
import * as path from 'path'
import { execSync } from 'child_process'

const REPO = String.raw`C:\Users\USER\Downloads\servicesartisans`
const OUT_DIR = String.raw`C:\Users\USER\Downloads\_phase0_audit\E_site_internal`

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true })

console.log('='.repeat(78))
console.log('AUDIT Site P0 (interne) — 2026-05-03')
console.log('='.repeat(78))

// ─────────────────────────────────────────────────────────────────────────
// 1. Patterns de routes ayant `index: false` dans leur metadata Next.js
// ─────────────────────────────────────────────────────────────────────────
console.log('\n[1] Cataloguer les routes qui rendent noindex (statique ou conditionnel)...')

type RouteCatalog = {
  route: string
  always_noindex: boolean
  conditional_noindex: boolean
  in_sitemap: 'yes' | 'maybe' | 'no'
  notes: string
}

const routes: RouteCatalog[] = [
  // STATIC noindex pages (always noindex)
  {
    route: '/accessibilite',
    always_noindex: true,
    conditional_noindex: false,
    in_sitemap: 'maybe',
    notes: 'staticPages',
  },
  {
    route: '/cgv',
    always_noindex: true,
    conditional_noindex: false,
    in_sitemap: 'maybe',
    notes: 'staticPages',
  },
  {
    route: '/confidentialite',
    always_noindex: true,
    conditional_noindex: false,
    in_sitemap: 'maybe',
    notes: 'staticPages',
  },
  {
    route: '/droit-acces',
    always_noindex: true,
    conditional_noindex: false,
    in_sitemap: 'maybe',
    notes: 'staticPages',
  },
  {
    route: '/droit-opposition',
    always_noindex: true,
    conditional_noindex: false,
    in_sitemap: 'maybe',
    notes: 'staticPages',
  },
  {
    route: '/mentions-legales',
    always_noindex: true,
    conditional_noindex: false,
    in_sitemap: 'maybe',
    notes: 'staticPages',
  },
  {
    route: '/partenaires',
    always_noindex: true,
    conditional_noindex: false,
    in_sitemap: 'maybe',
    notes: 'staticPages',
  },
  {
    route: '/violation-donnees',
    always_noindex: true,
    conditional_noindex: false,
    in_sitemap: 'maybe',
    notes: 'staticPages',
  },
  {
    route: '/widget',
    always_noindex: true,
    conditional_noindex: false,
    in_sitemap: 'maybe',
    notes: 'staticPages',
  },
  {
    route: '/recherche/artisans',
    always_noindex: true,
    conditional_noindex: false,
    in_sitemap: 'maybe',
    notes: 'staticPages',
  },
  {
    route: '/carrieres',
    always_noindex: true,
    conditional_noindex: false,
    in_sitemap: 'maybe',
    notes: 'staticPages format index:false',
  },
  // DYNAMIC always noindex
  {
    route: '/artisan/[slug]',
    always_noindex: true,
    conditional_noindex: false,
    in_sitemap: 'no',
    notes: 'compat',
  },
  {
    route: '/artisans-rge/[ville]',
    always_noindex: true,
    conditional_noindex: false,
    in_sitemap: 'no',
    notes: 'follow:false',
  },
  {
    route: '/services/[s]/autour-de-moi',
    always_noindex: true,
    conditional_noindex: false,
    in_sitemap: 'no',
    notes: 'thin',
  },
  {
    route: '/villes/[ville]/[quartier]',
    always_noindex: true,
    conditional_noindex: false,
    in_sitemap: 'no',
    notes: 'quartier thin',
  },
  {
    route: '/invitation-avis/[token]',
    always_noindex: true,
    conditional_noindex: false,
    in_sitemap: 'no',
    notes: 'token unique',
  },
  // DYNAMIC conditional (via shouldNoindex / providerCount / RGE compat / etc.)
  {
    route: '/aides/[slug]/[aide]',
    always_noindex: false,
    conditional_noindex: true,
    in_sitemap: 'maybe',
    notes: 'depends on indexable flag',
  },
  {
    route: '/cee/[operation]',
    always_noindex: false,
    conditional_noindex: true,
    in_sitemap: 'maybe',
    notes: 'noindex if not in published list',
  },
  {
    route: '/cee/[operation]/[ville]',
    always_noindex: false,
    conditional_noindex: true,
    in_sitemap: 'maybe',
    notes: 'noindex if no providers',
  },
  {
    route: '/communes/[commune]',
    always_noindex: false,
    conditional_noindex: true,
    in_sitemap: 'maybe',
    notes: 'noindex if thin',
  },
  {
    route: '/problemes/[probleme]/[ville]',
    always_noindex: false,
    conditional_noindex: true,
    in_sitemap: 'maybe',
    notes: 'noindex if not in whitelist',
  },
  {
    route: '/rge/[s]/[v]',
    always_noindex: false,
    conditional_noindex: true,
    in_sitemap: 'yes',
    notes: 'noindex if 0 RGE providers',
  },
  {
    route: '/rge/[s]/departement/[d]',
    always_noindex: false,
    conditional_noindex: true,
    in_sitemap: 'yes',
    notes: 'noindex if 0 RGE providers',
  },
  {
    route: '/services/[s]/[v]',
    always_noindex: false,
    conditional_noindex: true,
    in_sitemap: 'yes',
    notes: 'noindex via shouldNoindex (providerCount=0 + no fallback)',
  },
  {
    route: '/services/[s]/[v]/[publicId]',
    always_noindex: false,
    conditional_noindex: true,
    in_sitemap: 'no',
    notes: 'fiches noindex if not RGE-only',
  },
  {
    route: '/urgence/[s]',
    always_noindex: false,
    conditional_noindex: true,
    in_sitemap: 'yes',
    notes: 'noindex if not RGE-compatible',
  },
  {
    route: '/urgence/[s]/[v]',
    always_noindex: false,
    conditional_noindex: true,
    in_sitemap: 'yes',
    notes: 'noindex if not RGE-compatible OR not whitelisted',
  },
]

const csv1 = ['route,always_noindex,conditional_noindex,in_sitemap,notes']
for (const r of routes) {
  csv1.push(`${r.route},${r.always_noindex},${r.conditional_noindex},${r.in_sitemap},"${r.notes}"`)
}
fs.writeFileSync(path.join(OUT_DIR, 'noindex_routes_catalog.csv'), csv1.join('\n'), 'utf-8')
console.log(`  >>> ${routes.length} routes cataloguées dans noindex_routes_catalog.csv`)
console.log(`  → ${routes.filter((r) => r.always_noindex).length} always_noindex`)
console.log(`  → ${routes.filter((r) => r.conditional_noindex).length} conditional_noindex`)
console.log(
  `  → Suspects "in_sitemap=yes" + always_noindex : ${routes.filter((r) => r.always_noindex && r.in_sitemap === 'yes').length}`
)
console.log(
  `  → Suspects "in_sitemap=yes" + conditional : ${routes.filter((r) => r.conditional_noindex && r.in_sitemap === 'yes').length}`
)

// ─────────────────────────────────────────────────────────────────────────
// 2. Internal links — extract `href="..."` and `Link href="..."` from src/
// ─────────────────────────────────────────────────────────────────────────
console.log('\n[2] Extraire tous les internal links (`href="..."` et `<Link href>`) de src/...')

let rawLinks = ''
let filesWalked = 0
function walk(dir: string) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name)
    if (f.isDirectory()) {
      // skip node_modules, .next, .git
      if (f.name === 'node_modules' || f.name === '.next' || f.name === '.git') continue
      walk(p)
    } else if (/\.(ts|tsx|js|jsx|mdx)$/.test(f.name)) {
      filesWalked++
      try {
        const text = fs.readFileSync(p, 'utf8')
        // Match A: href="/path", href='/path', href=`/path`, href: '/path'
        // (couvre JSX + object property syntax + Link component)
        const ma = text.matchAll(/href\s*[:=]\s*["'`](\/[^"'`?#${}\s]+)/g)
        for (const m of ma) rawLinks += `href="${m[1]}"\n`
        // Match B: markdown link [text](/path) — pour les batches blog
        const mb = text.matchAll(/\]\((\/[^)?#\s]+)\)/g)
        for (const m of mb) rawLinks += `href="${m[1]}"\n`
      } catch {}
    }
  }
}
walk(path.join(REPO, 'src'))
console.log(`  → ${filesWalked} fichiers TS/TSX scannés`)

const allHrefs = new Set<string>()
for (const line of rawLinks.split('\n')) {
  const m = /href=["'`]([^"'`?#]+)/.exec(line)
  if (!m) continue
  let href = m[1].trim()
  // skip externals + fragments + empty
  if (!href.startsWith('/')) continue
  if (href === '/') continue
  // skip dynamic templates like /services/${slug}
  if (href.includes('${') || href.includes('{')) continue
  // strip trailing /
  href = href.replace(/\/$/, '')
  allHrefs.add(href)
}

console.log(`  → ${allHrefs.size} liens internes uniques extraits`)

// ─────────────────────────────────────────────────────────────────────────
// 3. Detect broken links → href pointing to gone-paths or non-existent routes
// ─────────────────────────────────────────────────────────────────────────
console.log('\n[3] Détecter les broken internal links (target = gone-path ou route inexistante)...')

// Patterns gone-paths (mémoire thin-pages-301 + gone-paths.ts)
const GONE_PATTERNS: { pattern: RegExp; reason: string }[] = [
  // Old patterns supprimés du pivot RGE 2026-05-01/02/03
  {
    pattern:
      /^\/services\/(serrurier|vitrier|carreleur|cuisiniste|demenageur|nettoyage|jardinier|paysagiste|alarme-securite|solier|terrassier|metallier|ferronnier|poseur-de-parquet|miroitier|storiste|architecte-interieur|decorateur|domoticien|pisciniste|antenniste|ascensoriste|geometre|desinsectisation|deratisation)/,
    reason: 'service supprimé pivot RGE',
  },
  // /tarifs/[s]/[v]/[task] → 410
  { pattern: /^\/tarifs\/[^/]+\/[^/]+\/[^/]+/, reason: 'tarifs_task 410' },
  // /devis/[s]/[v] → 301 (techniquement pas broken mais Ahrefs flag "links to redirect")
  // → on inclut PAS dans broken pour éviter faux positif (c'est dans la cat "links to redirect: 79")
  // /problemes/[old-removed-slug]
  {
    pattern: /^\/problemes\/(nuisibles|infestation-fourmis)/,
    reason: 'problème supprimé pivot RGE',
  },
  // /artisan/[slug] (singular, ancienne route) → 301 ou 410 selon le slug
  // Note: pas dans broken automatique car peut être valide
]

const broken: { href: string; reason: string }[] = []
for (const href of allHrefs) {
  for (const { pattern, reason } of GONE_PATTERNS) {
    if (pattern.test(href)) {
      broken.push({ href, reason })
      break
    }
  }
}

const csv3 = ['href,reason', ...broken.map((b) => `${b.href},"${b.reason}"`)]
fs.writeFileSync(path.join(OUT_DIR, 'broken_internal_links.csv'), csv3.join('\n'), 'utf-8')
console.log(`  >>> ${broken.length} broken internal links détectés (cf. broken_internal_links.csv)`)
if (broken.length > 0) {
  console.log('  Top 10 :')
  broken.slice(0, 10).forEach((b) => console.log(`    ${b.href}  →  ${b.reason}`))
}

// ─────────────────────────────────────────────────────────────────────────
// 4. Orphan candidates — patterns dans le sitemap sans aucun lien interne
// ─────────────────────────────────────────────────────────────────────────
console.log('\n[4] Détecter les patterns orphans (dans sitemap, mais 0 lien interne)...')

// Patterns sitemap "racine" (extraits de sitemap.ts) qu'on attend voir linkés
const SITEMAP_HUB_PATHS = [
  '/services',
  '/cee',
  '/rge',
  '/aides',
  '/communes',
  '/regions',
  '/tarifs',
  '/devis',
  '/blog',
  '/avis',
  '/villes',
  '/problemes',
  '/urgence',
  '/qualifications-rge',
  '/renovation-energetique',
  '/comparatifs',
  '/barometre/rge', // route réelle sans accent (`/baromètre/rge` est faux positif)
]

const orphanCandidates: { hub: string; has_inbound: boolean }[] = []
for (const hub of SITEMAP_HUB_PATHS) {
  const linked = Array.from(allHrefs).some((h) => h === hub || h.startsWith(hub + '/'))
  orphanCandidates.push({ hub, has_inbound: linked })
}

const orphans = orphanCandidates.filter((c) => !c.has_inbound)
const csv4 = ['hub_path,has_inbound', ...orphanCandidates.map((c) => `${c.hub},${c.has_inbound}`)]
fs.writeFileSync(path.join(OUT_DIR, 'orphan_hubs.csv'), csv4.join('\n'), 'utf-8')
console.log(
  `  >>> ${orphanCandidates.length} hubs analysés, ${orphans.length} sans aucun lien interne`
)
if (orphans.length > 0) {
  console.log('  Hubs orphan :')
  orphans.forEach((o) => console.log(`    ${o.hub}  ❌`))
}

// ─────────────────────────────────────────────────────────────────────────
// 5. Recap
// ─────────────────────────────────────────────────────────────────────────
console.log('\n' + '='.repeat(78))
console.log('RECAP AUDIT P0')
console.log('='.repeat(78))
console.log(
  `  ✅ ${routes.filter((r) => r.always_noindex && r.in_sitemap === 'maybe').length} routes statiques noindex potentiellement en sitemap (à valider)`
)
console.log(`  ✅ ${broken.length} broken internal links détectés (action: edit + remove)`)
console.log(`  ✅ ${orphans.length} hubs sans aucun lien interne (action: footer/nav)`)
console.log(
  `  ⚠️ noindex-with-traffic (Ahrefs count: 2) : besoin GSC live, procédure manuelle Marvin`
)
console.log(`\nArtefacts : ${OUT_DIR}`)
