#!/usr/bin/env node
/**
 * scripts/audit-schema-types.mjs
 * ------------------------------
 * Vérifie que chaque catégorie de page expose le bon Schema.org type :
 *
 *   Route pattern          → Type attendu
 *   ──────────────────────────────────────
 *   /blog/[slug]           → Article | NewsArticle | BlogPosting
 *   /blog/categorie/*      → CollectionPage | ItemList
 *   /blog/tag/*            → CollectionPage | ItemList
 *   /guides/*              → Article | HowTo | TechArticle
 *   /services              → CollectionPage | ItemList
 *   /services/[service]    → Service | CollectionPage
 *   /services/[s]/[v]      → Service | LocalBusiness | CollectionPage
 *   /villes/*              → CollectionPage | Place
 *   /departements/*        → CollectionPage | Place | AdministrativeArea
 *   /regions/*             → CollectionPage | Place | AdministrativeArea
 *   /faq                   → FAQPage
 *   /avis*                 → Review | AggregateRating | CollectionPage
 *   /simulateur-*          → WebApplication | FinancialProduct
 *   /cee/*                 → Article | HowTo | FinancialProduct | GovernmentService
 *   /rge/*                 → Article | Service
 *   /questions/*           → QAPage
 *
 * Pourquoi : Schema.org générique (WebPage, WebSite) est ok mais ne débloque
 * PAS les rich snippets. Un blog post sans `Article` ne peut pas remporter
 * le "Top Stories" ni les rich cards. Un guide sans `HowTo` perd le
 * step-by-step carousel. Une page service sans `Service` perd le price block.
 *
 * Usage :
 *   node scripts/audit-schema-types.mjs            # human
 *   node scripts/audit-schema-types.mjs --json     # JSON
 *   node scripts/audit-schema-types.mjs --strict   # exit 1 si gap
 */

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, sep } from 'node:path'

const args = new Set(process.argv.slice(2))
const strict = args.has('--strict')
const jsonOut = args.has('--json')

/**
 * Mapping pattern de route → types Schema.org acceptés.
 * L'ordre est important : la PREMIÈRE règle qui matche gagne.
 * `acceptedTypes` = au moins UN doit être présent sur la page.
 */
const RULES = [
  // Blog posts — contenu éditorial
  {
    label: 'blog article',
    match: (r) => /^\/blog\/[^/]+$/.test(r) && !/^\/blog\/(categorie|tag)\//.test(r),
    acceptedTypes: ['Article', 'NewsArticle', 'BlogPosting'],
  },
  {
    label: 'blog category',
    match: (r) => /^\/blog\/categorie\//.test(r),
    acceptedTypes: ['CollectionPage', 'ItemList'],
  },
  {
    label: 'blog tag',
    match: (r) => /^\/blog\/tag\//.test(r),
    acceptedTypes: ['CollectionPage', 'ItemList'],
  },
  // Guides éditoriaux
  {
    label: 'guide',
    match: (r) => /^\/guides\/[^/]+$/.test(r),
    acceptedTypes: ['Article', 'HowTo', 'TechArticle', 'FAQPage'],
  },
  // Questions (Q&A format)
  {
    label: 'question',
    match: (r) => /^\/questions\/[^/]+$/.test(r),
    acceptedTypes: ['QAPage', 'Question', 'FAQPage', 'Article'],
  },
  // FAQ hub
  {
    label: 'faq hub',
    match: (r) => r === '/faq',
    acceptedTypes: ['FAQPage'],
  },
  // Services
  {
    label: 'service × city',
    match: (r) => /^\/services\/[^/]+\/[^/]+$/.test(r),
    acceptedTypes: ['Service', 'LocalBusiness', 'CollectionPage', 'ItemList'],
  },
  {
    label: 'service hub',
    match: (r) => /^\/services\/[^/]+$/.test(r),
    acceptedTypes: ['Service', 'CollectionPage', 'ItemList'],
  },
  {
    label: 'services index',
    match: (r) => r === '/services',
    acceptedTypes: ['CollectionPage', 'ItemList'],
  },
  // Géo
  {
    label: 'ville',
    match: (r) => /^\/villes\/[^/]+$/.test(r),
    acceptedTypes: ['CollectionPage', 'Place', 'ItemList'],
  },
  {
    label: 'departement',
    match: (r) => /^\/departements\/[^/]+/.test(r),
    // Les pages dept × service sont sémantiquement des Services sur une
    // zone géographique → Service accepté en plus des types géo.
    acceptedTypes: ['CollectionPage', 'Place', 'AdministrativeArea', 'ItemList', 'Service'],
  },
  {
    label: 'region',
    match: (r) => /^\/regions\/[^/]+/.test(r),
    acceptedTypes: ['CollectionPage', 'Place', 'AdministrativeArea', 'ItemList', 'Service'],
  },
  // Avis / reviews
  {
    label: 'avis',
    match: (r) => /^\/avis/.test(r),
    acceptedTypes: ['CollectionPage', 'Review', 'AggregateRating', 'ItemList'],
  },
  // Simulateurs
  {
    label: 'simulateur',
    match: (r) => /^\/simulateur/.test(r),
    acceptedTypes: ['WebApplication', 'FinancialProduct', 'GovernmentService'],
  },
  // CEE / rénovation énergétique — YMYL
  {
    label: 'cee',
    match: (r) => /^\/cee/.test(r),
    acceptedTypes: ['Article', 'HowTo', 'FinancialProduct', 'GovernmentService', 'Service'],
  },
  // RGE — TechArticle accepté (sources techniques, méthodologie)
  {
    label: 'rge',
    match: (r) => /^\/rge/.test(r),
    acceptedTypes: ['Article', 'TechArticle', 'Service', 'ItemList', 'CollectionPage'],
  },
  // Urgence
  {
    label: 'urgence',
    match: (r) => /^\/urgence/.test(r),
    acceptedTypes: ['Service', 'LocalBusiness', 'CollectionPage'],
  },
  // Tarifs
  {
    label: 'tarifs',
    match: (r) => /^\/tarifs/.test(r),
    acceptedTypes: ['Article', 'CollectionPage', 'Service', 'PriceSpecification'],
  },
]

function walk(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const st = statSync(full)
    if (st.isDirectory()) walk(full, acc)
    else if (entry === 'page.tsx') acc.push(full)
  }
  return acc
}

function inferNoindex(src, file) {
  if (/robots\s*:\s*\{\s*[^}]*index\s*:\s*false/s.test(src)) return true
  if (/robots\s*:\s*\{\s*\.\.\.\s*noindex/i.test(src)) return true
  if (/NOT_FOUND_METADATA|NOINDEX_METADATA/.test(src)) return true
  if (/\/\(private\)\//.test(file)) return true
  if (/\/espace-artisan\/|\/espace-client\/|\/admin\//.test(file)) return true
  if (/^\s*redirect\s*\(/m.test(src) && !/return\s*\(/m.test(src)) return true
  return false
}

function pathToRoute(file) {
  let route = file
    .replace(/^.*?src[\/\\]app/, '')
    .replace(/[\/\\]page\.tsx$/, '')
    .split(sep)
    .join('/')
  route = route.replace(/\/\([^)]+\)/g, '')
  return route || '/'
}

/**
 * Détecte les types Schema.org présents. On scan :
 *   - Les occurrences de `'@type': 'Xxx'` (object literal)
 *   - Les helpers explicitement typés (`getArticleSchema`, `getFAQSchema`,
 *     `getHowToSchema`, `getServiceSchema`, ...)
 *   - Les imports de helpers depuis `@/lib/seo/jsonld` qui encodent le type
 */
function detectSchemaTypes(src) {
  const types = new Set()
  // a. `@type: 'Xxx'` literals (json-ld)
  for (const m of src.matchAll(/['"]@type['"]\s*:\s*['"]([A-Za-z]+)['"]/g)) {
    types.add(m[1])
  }
  // b. Helpers : mapping helper-name → type(s)
  // Helpers utilisés dans le projet. Certains produisent des types dynamiques
  // (ex: `getBlogArticleSchema` → Article ou NewsArticle selon fraîcheur).
  // On ajoute TOUS les types qu'un helper peut produire.
  const helperTypes = {
    getArticleSchema: ['Article'],
    getBlogPostingSchema: ['BlogPosting'],
    getNewsArticleSchema: ['NewsArticle'],
    getBlogArticleSchema: ['Article', 'NewsArticle'], // dynamique selon <48h
    getHowToSchema: ['HowTo'],
    generateHowToSchemaUrgence: ['HowTo'],
    getTechArticleSchema: ['TechArticle'],
    getFAQSchema: ['FAQPage'],
    getFAQPageSchema: ['FAQPage'],
    getQAPageSchema: ['QAPage'],
    getQuestionSchema: ['Question'],
    getServiceSchema: ['Service'],
    getUrgencyServiceSchema: ['Service'],
    getServicePricingSchema: ['Service', 'PriceSpecification'],
    getCityServicesListSchema: ['ItemList', 'CollectionPage'],
    getLocalBusinessSchema: ['LocalBusiness'],
    getCollectionPageSchema: ['CollectionPage'],
    getItemListSchema: ['ItemList'],
    getPlaceSchema: ['Place'],
    getEnrichedPlaceSchema: ['Place'],
    getAdministrativeAreaSchema: ['AdministrativeArea'],
    getReviewSchema: ['Review'],
    getAggregateRatingSchema: ['AggregateRating'],
    generateAggregateRatingSchema: ['AggregateRating'],
    getWebApplicationSchema: ['WebApplication'],
    getFinancialProductSchema: ['FinancialProduct'],
    getGovernmentServiceSchema: ['GovernmentService'],
    getPriceSpecificationSchema: ['PriceSpecification'],
  }
  for (const [helper, typesList] of Object.entries(helperTypes)) {
    if (new RegExp(`\\b${helper}\\b`).test(src)) {
      for (const t of typesList) types.add(t)
    }
  }
  return [...types]
}

const pages = walk('src/app')
const gaps = []
const byRule = {}
let indexable = 0

for (const f of pages) {
  const normalized = f.split(sep).join('/')
  const src = readFileSync(f, 'utf8')
  const hasMeta =
    /export\s+(async\s+)?function\s+generateMetadata/.test(src) ||
    /export\s+const\s+metadata\s*[:=]/.test(src)
  if (!hasMeta) continue
  if (inferNoindex(src, normalized)) continue
  indexable++

  const route = pathToRoute(normalized)
  const rule = RULES.find((r) => r.match(route))
  if (!rule) continue // page hors-pattern (homepage, static utility pages…)

  byRule[rule.label] = (byRule[rule.label] || 0) + 1
  const types = detectSchemaTypes(src)
  const hasAny = rule.acceptedTypes.some((t) => types.includes(t))
  if (!hasAny) {
    gaps.push({
      route,
      file: normalized,
      rule: rule.label,
      expected_any_of: rule.acceptedTypes,
      found_types: types,
    })
  }
}

const report = {
  indexable_pages: indexable,
  categorized_pages: Object.values(byRule).reduce((a, b) => a + b, 0),
  pages_per_rule: byRule,
  pages_with_gap: gaps.length,
  coverage_pct:
    gaps.length === 0
      ? 100
      : Number(
          (((Object.values(byRule).reduce((a, b) => a + b, 0) - gaps.length) /
            Math.max(1, Object.values(byRule).reduce((a, b) => a + b, 0))) *
            100).toFixed(1)
        ),
  gaps,
}

if (jsonOut) {
  console.log(JSON.stringify(report, null, 2))
} else {
  console.log('\n📋 Schema.org Type Coverage Audit\n')
  console.log(`  Pages indexables scannées : ${report.indexable_pages}`)
  console.log(`  Pages catégorisées        : ${report.categorized_pages}`)
  console.log(`  Pages avec gap            : ${report.pages_with_gap}`)
  console.log(`  Coverage                  : ${report.coverage_pct}%\n`)

  console.log('  Répartition par règle :')
  for (const [rule, count] of Object.entries(byRule).sort((a, b) => b[1] - a[1])) {
    console.log(`     ${rule.padEnd(25)} ${count}`)
  }
  console.log('')

  if (gaps.length === 0) {
    console.log('  ✅ Chaque page a un Schema.org type adapté à son pattern.\n')
  } else {
    console.log('  ⚠️  Pages sans Schema.org type adapté :')
    for (const g of gaps.slice(0, 50)) {
      console.log(
        `     ${g.route.padEnd(40)} [${g.rule}] attendu: ${g.expected_any_of.join('|')} — trouvé: ${g.found_types.join(',') || 'none'}`
      )
    }
    if (gaps.length > 50) console.log(`     ... et ${gaps.length - 50} de plus`)
    console.log('')
  }
}

if (strict && gaps.length > 0) process.exit(1)
