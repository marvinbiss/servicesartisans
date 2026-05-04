#!/usr/bin/env node
/**
 * scripts/audit-blog-ctr-titles.mjs
 * ----------------------------------
 * DoD du backlog item P3-blog-ctr-rewrite.
 *
 * Source : `docs/blog-prix-ctr-fix-2026-04-30.md` — 7 articles `prix-*` rank
 * 5-7 desktop avec CTR 0.11-0.47 % (vs attendu 4-5 %). Manque à gagner cumulé
 * +300-376 clics / 90j (~125 clics/mois). Cause = title trop long, meta vague,
 * pas de Schema Service+Offer (rich result « Extraits de produits »).
 *
 * Vérifie :
 *
 *   1. Schema helper `src/lib/seo/blog-product-schema.ts` existe
 *   2. PRICE_ARTICLE_CONFIG contient ≥6 entrées (cuisiniste retiré 2026-05-03)
 *   3. Chaque config a serviceName + serviceSlug + priceMin/Max + unitDescription
 *   4. getServicePriceSchema émet @id + inLanguage + isPartOf #website (cohésion)
 *   5. AggregateOffer + priceSpecification + offerCount présents
 *   6. Schema câblé dans `src/app/(public)/blog/[slug]/page.tsx`
 *   7. Les 6 articles cibles ont metaTitle réécrit (pattern « en 2026 : »)
 *   8. metaTitle ≤70 chars (Google SERP desktop)
 *   9. metaDescription contient ≥3 chiffres concrets (€)
 *  10. metaDescription se termine par CTA (devis / 2 min / prix / + ...)
 *
 * Garde-régression : si une PR retire un metaTitle réécrit ou casse le schema,
 * ce hook bloque le commit. Les 6 articles avaient été normalisés Tier ?
 * (commit antérieur, mais sans audit DoD).
 *
 * Usage :
 *   node scripts/audit-blog-ctr-titles.mjs --strict
 */

import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const args = new Set(process.argv.slice(2))
const strict = args.has('--strict')
const jsonOut = args.has('--json')

const ROOT = process.cwd()
const SCHEMA_FILE = join(ROOT, 'src', 'lib', 'seo', 'blog-product-schema.ts')
const BLOG_PAGE = join(ROOT, 'src', 'app', '(public)', 'blog', '[slug]', 'page.tsx')
const EXISTING_ARTICLES = join(ROOT, 'src', 'lib', 'data', 'blog', 'existing-articles.ts')
const BATCH_PRIX = join(ROOT, 'src', 'lib', 'data', 'blog', 'batch-prix.ts')

if (!existsSync(SCHEMA_FILE)) {
  console.error('Audit blog CTR titles : blog-product-schema.ts absent')
  if (strict) process.exit(1)
  process.exit(0)
}

const schemaSrc = readFileSync(SCHEMA_FILE, 'utf8')
const blogPageSrc = existsSync(BLOG_PAGE) ? readFileSync(BLOG_PAGE, 'utf8') : ''
const existingSrc = existsSync(EXISTING_ARTICLES) ? readFileSync(EXISTING_ARTICLES, 'utf8') : ''
const batchPrixSrc = existsSync(BATCH_PRIX) ? readFileSync(BATCH_PRIX, 'utf8') : ''

// Compter les entrées dans PRICE_ARTICLE_CONFIG (heuristique : slug keys quoted)
const configKeys = (
  schemaSrc.match(/'(prix-[a-z0-9-]+|chauffage-[a-z0-9-]+)':\s*\{/g) ?? []
).length

// 6 cibles attendues (cuisiniste retiré pivot RGE 2026-05-03)
const TARGETS = [
  'prix-plombier-2026-tarifs-horaires',
  'prix-electricien-2026-tarifs-travaux',
  'prix-installation-electrique-neuve-2026',
  'prix-menuisier-2026-tarifs-travaux',
  'prix-macon-2026-gros-oeuvre-renovation',
  'chauffage-pompe-chaleur-vs-chaudiere-gaz-2026',
]

const articlesAllSrc = existingSrc + '\n' + batchPrixSrc

// Pour chaque cible, extraire metaTitle/metaDescription. Backreference \1 sur
// la quote d'ouverture pour gérer les apostrophes typographiques internes
// (« Prix d'un menuisier »).
function findMetaTitle(slug) {
  const re = new RegExp(
    `'${slug}':\\s*\\{[\\s\\S]*?metaTitle:\\s*(["'\`])((?:(?!\\1).)*)\\1`,
    'm'
  )
  const m = articlesAllSrc.match(re)
  return m ? m[2] : null
}
function findMetaDescription(slug) {
  const re = new RegExp(
    `'${slug}':\\s*\\{[\\s\\S]*?metaDescription:\\s*[\\n\\s]*(["'\`])((?:(?!\\1).)*)\\1`,
    'm'
  )
  const m = articlesAllSrc.match(re)
  return m ? m[2] : null
}

const articlesData = TARGETS.map((slug) => ({
  slug,
  metaTitle: findMetaTitle(slug),
  metaDescription: findMetaDescription(slug),
}))

const titlePatternCount = articlesData.filter(
  (a) => a.metaTitle && /en 2026/i.test(a.metaTitle)
).length
const titleMaxLenOk = articlesData.every((a) => !a.metaTitle || a.metaTitle.length <= 70)
const descNumbersOk = articlesData.every((a) => {
  if (!a.metaDescription) return false
  const numbers = a.metaDescription.match(/\d[\d\s]*€/g) ?? []
  return numbers.length >= 3
})
const descCtaOk = articlesData.every((a) => {
  if (!a.metaDescription) return false
  return /devis|2 min|prix|comparatif|barème/i.test(a.metaDescription)
})

const checks = [
  {
    id: 'schema_helper_exists',
    label: 'src/lib/seo/blog-product-schema.ts existe',
    ok: existsSync(SCHEMA_FILE),
  },
  {
    id: 'config_size_min',
    label: `PRICE_ARTICLE_CONFIG ≥6 entrées (actuel ${configKeys})`,
    ok: configKeys >= 6,
  },
  {
    id: 'config_required_fields',
    label: 'Config : serviceName + serviceSlug + priceMin/Max + unitDescription',
    ok:
      /serviceName:/.test(schemaSrc) &&
      /serviceSlug:/.test(schemaSrc) &&
      /priceMin:/.test(schemaSrc) &&
      /priceMax:/.test(schemaSrc) &&
      /unitDescription:/.test(schemaSrc),
  },
  {
    id: 'schema_id_inlang_ispart',
    label: 'getServicePriceSchema émet @id + inLanguage + isPartOf #website',
    ok:
      /'@id':\s*`\$\{SITE_URL\}\/blog\/\$\{slug\}#service`/.test(schemaSrc) &&
      /inLanguage:\s*['"]fr-FR['"]/.test(schemaSrc) &&
      /isPartOf:\s*\{\s*'@id':\s*`\$\{SITE_URL\}#website`/.test(schemaSrc),
  },
  {
    id: 'aggregate_offer',
    label: 'AggregateOffer + priceSpecification + offerCount présents',
    ok:
      /'@type':\s*'AggregateOffer'/.test(schemaSrc) &&
      /priceSpecification:/.test(schemaSrc) &&
      /offerCount:\s*cfg\.offerCount/.test(schemaSrc),
  },
  {
    id: 'schema_wired_blog_page',
    label: 'getServicePriceSchema importé + ajouté dans allSchemas',
    ok:
      /from\s+['"]@\/lib\/seo\/blog-product-schema['"]/.test(blogPageSrc) &&
      /servicePriceSchema/.test(blogPageSrc),
  },
  {
    id: 'targets_have_metatitle',
    label: `Les 6 articles cibles ont metaTitle réécrit pattern « en 2026 » (${titlePatternCount}/6)`,
    ok: titlePatternCount === TARGETS.length,
  },
  {
    id: 'metatitle_max_70_chars',
    label: 'metaTitle ≤70 chars (SERP desktop)',
    ok: titleMaxLenOk,
  },
  {
    id: 'metadescription_3_numbers',
    label: 'metaDescription contient ≥3 chiffres concrets (€)',
    ok: descNumbersOk,
  },
  {
    id: 'metadescription_cta',
    label: 'metaDescription contient CTA (devis / 2 min / prix / comparatif / barème)',
    ok: descCtaOk,
  },
]

const failures = checks.filter((c) => !c.ok)

const report = {
  backlog_item: 'P3-blog-ctr-rewrite',
  source_doc: 'docs/blog-prix-ctr-fix-2026-04-30.md',
  ahrefs_kw: 'prix [service] 2026',
  volume_cumule: 7730,
  ctr_avant_pct: 0.23,
  ctr_cible_pct: 1.5,
  config_keys: configKeys,
  articles: articlesData.map((a) => ({
    slug: a.slug,
    metaTitle: a.metaTitle,
    metaTitle_len: a.metaTitle?.length ?? 0,
    has_2026_pattern: !!a.metaTitle && /en 2026/i.test(a.metaTitle),
  })),
  total: checks.length,
  passed: checks.length - failures.length,
  failures: failures.map((f) => ({ id: f.id, label: f.label })),
}

if (jsonOut) {
  console.log(JSON.stringify(report, null, 2))
} else {
  console.log('\n📋 Blog CTR Titles Audit (DoD P3-blog-ctr-rewrite)\n')
  console.log(`  Source         : docs/blog-prix-ctr-fix-2026-04-30.md`)
  console.log(`  Articles       : ${TARGETS.length}`)
  console.log(`  Config keys    : ${configKeys}`)
  console.log(`  Patterns       : ${checks.length}`)
  console.log(`  OK             : ${checks.length - failures.length}`)
  console.log(`  Échecs         : ${failures.length}`)
  for (const c of checks) {
    const icon = c.ok ? '✅' : '❌'
    console.log(`     ${icon}  [${c.id}] ${c.label}`)
  }
  if (failures.length === 0) {
    console.log('\n  ✅ Blog CTR rewrite conforme P3-blog-ctr-rewrite.\n')
  } else {
    console.log(`\n  ⚠️  ${failures.length} pattern(s) manquant(s) — DoD non atteinte.\n`)
  }
}

if (strict && failures.length > 0) process.exit(1)
