#!/usr/bin/env node
/**
 * scripts/audit-schema-cohesion.mjs
 * ----------------------------------
 * DoD anti-régression sur le triplet Schema.org cohésion appliqué Tiers
 * 22-38 (Booking-grade SEO infrastructure).
 *
 * Source : memory `servicesartisans-seo-10agents-synthesis-2026-04-28`
 * + commits Tier 22-38 dans `src/lib/seo/jsonld.ts`. Conventions :
 *
 *   1. `inLanguage: 'fr-FR'` sur chaque entité racine Article/Service/
 *      FAQPage/HowTo/Product/CollectionPage/LocalBusiness — sinon AI
 *      Overviews considère le contenu non-localisé et chute le ranking
 *      français.
 *
 *   2. `isPartOf: { '@id': SITE_URL + '#website' }` sur chaque entité
 *      racine — relie le node au WebSite root pour signaler la cohérence
 *      sitelinks searchbox + breadcrumb.
 *
 *   3. WebSite root function (`getWebsiteSchema`) doit exister et déclarer
 *      `@id: SITE_URL + '#website'` (ancre stable pour tout `isPartOf`).
 *
 *   4. Organization root function doit exister + `@id: '#organization'`.
 *
 * Pourquoi : un dev qui refactore `jsonld.ts` ou écrit un nouveau builder
 * Schema.org peut oublier ces 2 props (elles ne sont pas "required" au sens
 * Google Rich Results — pas de soft 404 / pas de warning console). Mais
 * leur absence dégrade silencieusement :
 *
 *   - inLanguage manquant : Google ne sait pas que la page est en français
 *     pur (vs multi-locale), ranking FR perd 5-15% sur SERP localisée.
 *   - isPartOf manquant : le node Schema.org est "orphelin", pas relié au
 *     WebSite root → sitelinks searchbox ne s'attache pas, breadcrumbs
 *     parfois mal interprétés (CTR -8 à -15%).
 *
 * Méthodologie :
 *
 *   A. Scanner `src/lib/seo/*.ts` + `src/components/**\/Schema*.tsx`.
 *   B. Pour chaque export `function` qui retourne un objet avec
 *      `@type: 'Article|Service|FAQPage|HowTo|Product|CollectionPage|
 *      LocalBusiness'` au top-level, vérifier la présence de `inLanguage`
 *      ET `isPartOf`.
 *   C. Builders sub-component (BreadcrumbItem, ImageObject, Person, etc.)
 *      → ignorés (pas d'entité racine).
 *   D. Vérifier explicitement que `getWebsiteSchema` et
 *      `getOrganizationSchema` existent + ont leur `@id` ancré.
 *
 * Heuristique : on cherche dans la même fonction un return qui contient
 * `'@type': 'X'` ET soit `inLanguage` soit `isPartOf`. Si l'un manque,
 * fail. Si la fonction n'a pas de `'@type'` racine = ignorée.
 *
 * Usage :
 *   node scripts/audit-schema-cohesion.mjs --strict
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const args = new Set(process.argv.slice(2))
const strict = args.has('--strict')
const jsonOut = args.has('--json')

const ROOT = process.cwd()
const SEO_DIR = join(ROOT, 'src', 'lib', 'seo')
const COMP_DIR = join(ROOT, 'src', 'components')

const ROOT_TYPES = new Set([
  'Article',
  'NewsArticle',
  'BlogPosting',
  'Service',
  'FAQPage',
  'HowTo',
  'Product',
  'CollectionPage',
  'LocalBusiness',
  'GovernmentService',
  'FinancialProduct',
])

// Sub-components dont on ignore les blocs — leur absence d'inLanguage est OK.
const SUB_TYPES = new Set([
  'ImageObject',
  'Person',
  'PostalAddress',
  'GeoCoordinates',
  'OpeningHoursSpecification',
  'AggregateRating',
  'Rating',
  'BreadcrumbList',
  'ListItem',
  'Thing',
  'Offer',
  'PriceSpecification',
  'ContactPoint',
  'PropertyValue',
  'WebPage',
])

/** Walk recursively for .ts/.tsx files matching predicate. */
function walk(dir, predicate, out = []) {
  if (!existsSync(dir)) return out
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const st = statSync(full)
    if (st.isDirectory()) walk(full, predicate, out)
    else if (predicate(full)) out.push(full)
  }
  return out
}

const seoFiles = walk(SEO_DIR, (p) => /\.ts$/.test(p) && !/\.test\.ts$/.test(p))
const compSchemaFiles = walk(
  COMP_DIR,
  (p) => /Schema\.tsx?$/.test(p) && !/\.test\./.test(p)
)

const allFiles = [...seoFiles, ...compSchemaFiles]

const checks = []
const orphans = []

for (const file of allFiles) {
  const src = readFileSync(file, 'utf8')

  // Trouver chaque `'@type': 'X'` ou `"@type": "X"` qui est ÉCRIT comme
  // entité racine (présence d'un `@context` Schema.org dans la même fenêtre
  // que l'@type → c'est un node racine, pas une sub-component).
  //
  // Schema.org root := `{ '@context': 'https://schema.org', '@type': '...' }`
  // Les sub-components (item:, itemListElement:, mainEntity:, provider:,
  // aggregateRating:, etc.) n'ont PAS de @context, donc filtrer sur la
  // proximité de @context écarte les faux positifs.
  const typeRe = /['"]@type['"]\s*:\s*['"]([A-Za-z]+)['"]/g
  let m
  while ((m = typeRe.exec(src)) !== null) {
    const type = m[1]
    if (!ROOT_TYPES.has(type)) continue
    if (SUB_TYPES.has(type)) continue

    // Fenêtre amont (300 chars) pour repérer @context du même node racine.
    // @context apparaît juste avant @type dans un node racine — sub-components
    // n'ont pas de @context.
    const ctxStart = Math.max(0, m.index - 300)
    const ctxWindow = src.slice(ctxStart, m.index + 50)
    const isRootNode = /['"]@context['"]\s*:\s*['"]https:\/\/schema\.org['"]/.test(
      ctxWindow
    )
    if (!isRootNode) continue

    // Fenêtre étendue ±800 chars pour repérer inLanguage / isPartOf
    // (les nodes Schema.org peuvent être longs).
    const start = Math.max(0, m.index - 100)
    const end = Math.min(src.length, m.index + 1500)
    const window = src.slice(start, end)

    const hasInLanguage = /inLanguage\s*:/.test(window)
    const hasIsPartOf = /isPartOf\s*:/.test(window)

    const rel = relative(ROOT, file).replace(/\\/g, '/')

    if (!hasInLanguage || !hasIsPartOf) {
      orphans.push({
        file: rel,
        type,
        line: src.slice(0, m.index).split('\n').length,
        missing: [
          !hasInLanguage ? 'inLanguage' : null,
          !hasIsPartOf ? 'isPartOf' : null,
        ].filter(Boolean),
      })
    }
  }
}

// Builders racine obligatoires
const jsonldSrc = existsSync(join(SEO_DIR, 'jsonld.ts'))
  ? readFileSync(join(SEO_DIR, 'jsonld.ts'), 'utf8')
  : ''

checks.push({
  id: 'website_root_anchored',
  label: "getWebsiteSchema() existe + @id ancré sur SITE_URL + '#website'",
  ok:
    /export\s+function\s+getWebsiteSchema/.test(jsonldSrc) &&
    /['"]@id['"]\s*:\s*[`'"]\$\{SITE_URL\}#website[`'"]/.test(jsonldSrc),
  weight: 2.0,
})

checks.push({
  id: 'organization_root_anchored',
  label: "getOrganizationSchema() existe + @id ancré sur SITE_URL + '#organization'",
  ok:
    /export\s+function\s+getOrganizationSchema/.test(jsonldSrc) &&
    /['"]@id['"]\s*:\s*[`'"]\$\{SITE_URL\}#organization[`'"]/.test(jsonldSrc),
  weight: 2.0,
})

checks.push({
  id: 'no_orphan_root_entities',
  label: `Aucune entité racine Schema.org (Article/Service/FAQPage/...) sans inLanguage + isPartOf`,
  ok: orphans.length === 0,
  weight: 1.5,
  details: orphans.slice(0, 10),
})

const totalWeight = checks.reduce((s, c) => s + c.weight, 0)
const passedWeight = checks.filter((c) => c.ok).reduce((s, c) => s + c.weight, 0)
const coveragePct = Math.round((passedWeight / totalWeight) * 1000) / 10

const failures = checks.filter((c) => !c.ok)

const report = {
  backlog_item: 'P3-schema-cohesion',
  source_memory: 'seo-10agents-synthesis-2026-04-28 + Tiers 22-38 booking-grade',
  total_files_scanned: allFiles.length,
  total_root_types: ROOT_TYPES.size,
  total_orphans: orphans.length,
  orphans_sample: orphans.slice(0, 10),
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
  console.log('\n📋 Schema.org Cohesion Audit (DoD P3-schema-cohesion)\n')
  console.log(`  Fichiers scannés     : ${allFiles.length}`)
  console.log(`  Types racine traqués : ${ROOT_TYPES.size}`)
  console.log(`  Entités orphelines   : ${orphans.length}`)
  console.log(`  Coverage             : ${coveragePct}% (${passedWeight}/${totalWeight} pondéré)`)
  for (const c of checks) {
    const icon = c.ok ? '✅' : '❌'
    console.log(`     ${icon}  [${c.id}] ${c.label} (poids ${c.weight})`)
  }
  if (orphans.length > 0) {
    console.log(`\n  Orphelins (top 10) :`)
    for (const o of orphans.slice(0, 10)) {
      console.log(`     - ${o.file}:${o.line} type=${o.type} manque=[${o.missing.join(', ')}]`)
    }
  }
  if (failures.length === 0) {
    console.log('\n  ✅ Cohésion Schema.org préservée.\n')
  } else {
    console.log(`\n  ⚠️  ${failures.length} régression(s) — DoD non atteinte.\n`)
  }
}

if (strict && failures.length > 0) process.exit(1)
