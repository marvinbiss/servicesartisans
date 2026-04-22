#!/usr/bin/env node
/**
 * scripts/audit-schema-required-fields.mjs
 * ----------------------------------------
 * Vérifie que chaque bloc JSON-LD émis par le code déclare les champs
 * obligatoires Schema.org / Google Rich Results pour son `@type`.
 *
 * Pourquoi :
 *   - Google Rich Results Test rejette les schémas incomplets : Article sans
 *     `author`/`datePublished`, FAQPage sans `mainEntity`, Review sans
 *     `reviewRating`, etc. La page n'est alors ni éligible aux rich snippets
 *     ni signalée comme contenu structuré → perte de CTR de 30 à 70 % sur
 *     les SERP éligibles.
 *   - Conformité Schema.org stricte = signal de qualité E-E-A-T pour le
 *     calcul de trust (Helpful Content System, Google Search Central 2026).
 *
 * Méthodologie :
 *   1. Scanner `src/lib/seo/*.ts` + toutes les pages `src/app/**` pour
 *      trouver les occurrences `'@type': 'X'` (ou `"@type": "X"`).
 *   2. Pour chaque occurrence, remonter au `{` englobant avec un
 *      brace-balancer qui tient compte des strings et des backticks.
 *   3. Extraire les clés top-level de l'objet (patterns `key:`, `'key':`,
 *      `"key":`) sans descendre dans les objets imbriqués.
 *   4. Vérifier que les champs requis pour ce type sont présents (ou
 *      à défaut tolérer une clé conditionnelle spread si le champ y figure).
 *   5. Ignorer les objets qui sont des sous-composants Schema.org locaux
 *      (ex : un `ImageObject` avec juste `url` est OK s'il est imbriqué
 *      dans une prop, ce n'est pas une entité racine).
 *
 * Limite :
 *   - Analyse statique stricte : si une clé est strictement conditionnelle
 *     (`...(x && { author })`), on flag en warning uniquement lorsqu'un
 *     champ obligatoire n'a **aucun** chemin garanti.
 *
 * Usage :
 *   node scripts/audit-schema-required-fields.mjs           # human
 *   node scripts/audit-schema-required-fields.mjs --json    # JSON
 *   node scripts/audit-schema-required-fields.mjs --strict  # exit 1 si gap
 */

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const args = new Set(process.argv.slice(2))
const strict = args.has('--strict')
const jsonOut = args.has('--json')

// Required fields per Schema.org @type.
// Source : Schema.org spec + Google Rich Results eligibility requirements.
// `required` = must be present (hard fail).
// Types absents du map sont tolérés (objets auxiliaires).
const REQUIRED = {
  Article: ['headline', 'image', 'author', 'datePublished'],
  NewsArticle: ['headline', 'image', 'author', 'datePublished'],
  TechArticle: ['headline', 'image', 'author', 'datePublished'],
  BlogPosting: ['headline', 'image', 'author', 'datePublished'],
  Service: ['name', 'provider'],
  LocalBusiness: ['name', 'address'],
  Organization: ['name'],
  GovernmentOrganization: ['name'],
  WebSite: ['name', 'url'],
  WebPage: [],
  FAQPage: ['mainEntity'],
  Question: ['name', 'acceptedAnswer'],
  Answer: ['text'],
  HowTo: ['step'],
  HowToStep: ['text'],
  BreadcrumbList: ['itemListElement'],
  ListItem: ['position'],
  Place: ['name'],
  City: ['name'],
  Country: ['name'],
  AdministrativeArea: ['name'],
  PostalAddress: [],
  Person: ['name'],
  Product: ['name'],
  Review: ['reviewRating', 'author'],
  AggregateRating: ['ratingValue'],
  Rating: ['ratingValue'],
  Offer: [],
  AggregateOffer: [],
  Course: ['name', 'provider'],
  Event: ['name', 'startDate'],
  FinancialProduct: ['name', 'provider'],
  LoanOrCredit: ['name', 'provider'],
  GovernmentService: ['name', 'provider'],
  CollectionPage: ['name'],
  ItemList: ['itemListElement'],
  ImageObject: ['url'],
  MonetaryAmount: [],
  OpeningHoursSpecification: ['dayOfWeek'],
  Audience: [],
  ContactPoint: ['contactType'],
  Thing: ['name'],
  SearchAction: ['target'],
  EntryPoint: ['urlTemplate'],
  Dataset: ['name', 'description'],
  ImageGallery: ['name'],
}

function walk(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const st = statSync(full)
    if (st.isDirectory()) walk(full, acc)
    else if (/\.(tsx?|mjs)$/.test(entry)) acc.push(full)
  }
  return acc
}

/**
 * Trouve la position de `{` qui ouvre l'objet englobant la position `pos`.
 * Respecte les strings simples, doubles, backticks, et les commentaires.
 */
function findEnclosingBraceOpen(src, pos) {
  let depth = 0
  let i = pos
  while (i > 0) {
    i--
    const c = src[i]
    if (c === '}') depth++
    else if (c === '{') {
      if (depth === 0) return i
      depth--
    } else if (c === "'" || c === '"' || c === '`') {
      // Skip string literal backwards
      const quote = c
      i--
      while (i > 0 && !(src[i] === quote && src[i - 1] !== '\\')) i--
    }
  }
  return -1
}

/**
 * Trouve la position de `}` qui ferme l'objet ouvert à `open`.
 */
function findMatchingBraceClose(src, open) {
  let depth = 1
  let i = open + 1
  while (i < src.length) {
    const c = src[i]
    if (c === '{') depth++
    else if (c === '}') {
      depth--
      if (depth === 0) return i
    } else if (c === "'" || c === '"' || c === '`') {
      const quote = c
      i++
      while (i < src.length && src[i] !== quote) {
        if (src[i] === '\\') i++
        i++
      }
    }
    i++
  }
  return -1
}

/**
 * Collecte les clés top-level d'un objet JS (pas dans les objets imbriqués).
 * Détecte `key:`, `'key':`, `"key":`, shorthand `key,`, spread `...obj`.
 */
function extractTopLevelKeys(body) {
  const keys = new Set()
  let depth = 0
  let i = 0
  while (i < body.length) {
    const c = body[i]
    if (c === '{' || c === '[' || c === '(') depth++
    else if (c === '}' || c === ']' || c === ')') depth--
    else if (c === "'" || c === '"' || c === '`') {
      const quote = c
      i++
      while (i < body.length && body[i] !== quote) {
        if (body[i] === '\\') i++
        i++
      }
    } else if (c === '/' && body[i + 1] === '/') {
      while (i < body.length && body[i] !== '\n') i++
    } else if (c === '/' && body[i + 1] === '*') {
      i += 2
      while (i < body.length - 1 && !(body[i] === '*' && body[i + 1] === '/')) i++
      i += 2
    }

    if (depth === 0) {
      // Détecte une clé au début d'une ligne ou après une virgule.
      const startOfKey = i === 0 || /[,{\n]/.test(body[i - 1] || '{')
      if (startOfKey) {
        // Cherche `key:`, `'key':`, `"key":`, shorthand `key,`
        const slice = body.slice(i, i + 200)
        const km =
          slice.match(/^\s*['"]?([\w-]+|@\w+|@[\w-]+)['"]?\s*:/) ||
          slice.match(/^\s*\.\.\.\(\s*[^&?]*(?:&&|\?)\s*\{([^}]*)\}\s*\)/s) ||
          slice.match(/^\s*\.\.\.\(\s*([^?]*?)\?\s*\{([^}]*)\}\s*:/s)
        if (km) {
          if (km[0].includes('...(')) {
            // Extract keys from conditional spread (both branches count as "potentially present")
            const m2 = slice.match(/^\s*\.\.\.\([\s\S]*?\{([\s\S]*?)\}\s*[:)]/m)
            if (m2) {
              for (const inner of m2[1].matchAll(/['"]?([\w-]+|@\w+)['"]?\s*:/g)) {
                keys.add('?' + inner[1])
              }
            }
          } else {
            keys.add(km[1])
          }
        }
      }
    }
    i++
  }
  return keys
}

/**
 * Vrai si la clé `name` est présente de manière inconditionnelle dans
 * le set de clés (pas seulement derrière un `...(cond && {...})`).
 */
function hasUnconditionalKey(keys, name) {
  return keys.has(name)
}

/**
 * Vrai si la clé `name` est au moins présente conditionnellement.
 */
function hasConditionalKey(keys, name) {
  return keys.has(name) || keys.has('?' + name)
}

function scanFile(file) {
  const src = readFileSync(file, 'utf8')
  const findings = []
  // Detect both @type formats: '@type': 'X', "@type": "X", @type: "X"
  const typeRe = /['"`]@type['"`]\s*:\s*['"`]([A-Z][\w]*)['"`]/g
  for (const m of src.matchAll(typeRe)) {
    const type = m[1]
    const reqList = REQUIRED[type]
    if (!reqList) continue // Unknown/auxiliary type, no required fields to check
    const open = findEnclosingBraceOpen(src, m.index)
    if (open < 0) continue
    const close = findMatchingBraceClose(src, open)
    if (close < 0) continue
    const body = src.slice(open + 1, close)
    const keys = extractTopLevelKeys(body)
    // "Root" schema = has @context as a sibling key. Nested references
    // (hasPart, itemReviewed, itemListElement, author, publisher, provider,
    // about, brand, offers, aggregateRating, mainEntityOfPage) only require
    // `name` OR `@id` OR `url` per Schema.org referencing convention.
    const isRoot = keys.has('@context')
    // Entity types that can appear as references in nested contexts (hasPart,
    // itemReviewed, provider, publisher, author, about, brand). When nested,
    // they only need `name` OR `@id` OR `url` per Schema.org ref convention.
    const REFERENCE_SAFE = new Set([
      'Article', 'NewsArticle', 'TechArticle', 'BlogPosting',
      'Service', 'LocalBusiness', 'Organization', 'GovernmentOrganization',
      'WebSite', 'WebPage', 'Place', 'City', 'Country', 'AdministrativeArea',
      'Person', 'Product', 'Course', 'Event', 'FinancialProduct',
      'LoanOrCredit', 'GovernmentService', 'CollectionPage',
      'ImageGallery', 'Dataset', 'FAQPage', 'Thing',
      'ImageObject',
    ])
    if (!isRoot && REFERENCE_SAFE.has(type)) {
      // `headline` acts as name for Article subtypes.
      const ARTICLE_TYPES = new Set(['Article', 'NewsArticle', 'TechArticle', 'BlogPosting'])
      const hasRef =
        keys.has('name') ||
        keys.has('@id') ||
        keys.has('url') ||
        (ARTICLE_TYPES.has(type) && keys.has('headline'))
      if (!hasRef) {
        findings.push({
          file: file.replace(/\\/g, '/'),
          type,
          line: src.slice(0, m.index).split('\n').length,
          missing: ['name OR @id OR url (nested reference)'],
          conditional: [],
        })
      }
      continue
    }
    const missing = []
    const conditional = []
    for (const r of reqList) {
      if (hasUnconditionalKey(keys, r)) continue
      if (hasConditionalKey(keys, r)) {
        conditional.push(r)
      } else {
        missing.push(r)
      }
    }
    if (missing.length > 0 || conditional.length > 0) {
      // Only report as a finding if at least one is hard-missing.
      // Conditional-only misses are warnings.
      findings.push({
        file: file.replace(/\\/g, '/'),
        type,
        line: src.slice(0, m.index).split('\n').length,
        missing,
        conditional,
      })
    }
  }
  return findings
}

// ── Scan ────────────────────────────────────────────────────────────────
const seoFiles = walk('src/lib/seo').filter((f) => /\.ts$/.test(f))
const appFiles = walk('src/app').filter((f) => /\.tsx$/.test(f))
const componentFiles = walk('src/components').filter((f) => /\.tsx$/.test(f))

const allFiles = [...seoFiles, ...appFiles, ...componentFiles]

const allFindings = []
for (const f of allFiles) {
  try {
    const findings = scanFile(f)
    allFindings.push(...findings)
  } catch {
    // ignore unreadable files
  }
}

// Filter: hard gaps only (at least one missing field), group by file:type.
const hardGaps = allFindings.filter((f) => f.missing.length > 0)
const softGaps = allFindings.filter((f) => f.missing.length === 0 && f.conditional.length > 0)

const report = {
  files_scanned: allFiles.length,
  schema_blocks_checked: 0, // computed below
  hard_gaps: hardGaps.length,
  soft_gaps: softGaps.length,
  hard_findings: hardGaps.slice(0, 50),
  soft_findings: softGaps.slice(0, 30),
}

// Count total @type blocks scanned for coverage stat
let blocks = 0
for (const f of allFiles) {
  try {
    const src = readFileSync(f, 'utf8')
    blocks += (src.match(/['"`]@type['"`]\s*:/g) || []).length
  } catch {}
}
report.schema_blocks_checked = blocks
report.coverage_pct =
  blocks === 0 ? 100 : Number((((blocks - hardGaps.length) / blocks) * 100).toFixed(2))

if (jsonOut) {
  console.log(JSON.stringify(report, null, 2))
} else {
  console.log('\n📋 Schema.org Required Fields Audit\n')
  console.log(`  Fichiers scannés              : ${report.files_scanned}`)
  console.log(`  Blocs @type analysés          : ${report.schema_blocks_checked}`)
  console.log(`  Gaps durs (hard)              : ${report.hard_gaps}`)
  console.log(`  Gaps conditionnels (soft)     : ${report.soft_gaps}`)
  console.log(`  Coverage champs obligatoires  : ${report.coverage_pct}%\n`)
  if (hardGaps.length === 0 && softGaps.length === 0) {
    console.log('  ✅ Tous les blocs JSON-LD déclarent leurs champs obligatoires.\n')
  } else {
    if (hardGaps.length > 0) {
      console.log('  ❌ Gaps durs :')
      for (const g of hardGaps.slice(0, 30)) {
        console.log(
          `     ${g.type.padEnd(22)} ${g.file}:${g.line}  manque ${g.missing.join(', ')}`
        )
      }
      if (hardGaps.length > 30) console.log(`     ... et ${hardGaps.length - 30} de plus`)
      console.log('')
    }
    if (softGaps.length > 0) {
      console.log('  ⚠️  Gaps conditionnels (warning) :')
      for (const g of softGaps.slice(0, 15)) {
        console.log(
          `     ${g.type.padEnd(22)} ${g.file}:${g.line}  conditionnels ${g.conditional.join(
            ', '
          )}`
        )
      }
      if (softGaps.length > 15) console.log(`     ... et ${softGaps.length - 15} de plus`)
      console.log('')
    }
  }
}

if (strict && hardGaps.length > 0) process.exit(1)
