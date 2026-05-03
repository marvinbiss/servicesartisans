#!/usr/bin/env node
/**
 * scripts/audit-jsonld-integrity.mjs
 * ----------------------------------
 * Audit de cohérence des JSON-LD générés statiquement dans src/lib/seo/**.
 * Complémentaire à audit-jsonld (présence) et audit-schema-required-fields
 * (champs obligatoires).
 *
 * Vérifie :
 *
 *   1. url / @id / sameAs / logo / image.url / author.url sont ABSOLUES
 *      (http(s)://…) — Google rejette les URLs relatives dans le JSON-LD.
 *
 *   2. Pas de hardcoded servicesartisans.fr (doit passer par SITE_URL),
 *      sauf dans lib/seo/config.ts (source de vérité du domaine).
 *
 *   3. datePublished / dateModified respectent ISO 8601 strict
 *      (YYYY-MM-DD ou YYYY-MM-DDTHH:MM:SS[Z|±HH:MM]). Google tolère
 *      les 2 mais refuse les variantes "01/04/2026" ou "April 1, 2026".
 *
 *   4. @context est la string officielle "https://schema.org" (pas
 *      "http://schema.org" qui est legacy et trigger warnings dans GSC).
 *
 *   5. Aucun @type inventé — vérifie contre un allowlist des @types
 *      officiels du repo (Article, BreadcrumbList, FAQPage, etc.).
 *
 * Usage :
 *   node scripts/audit-jsonld-integrity.mjs           # human
 *   node scripts/audit-jsonld-integrity.mjs --json    # JSON
 *   node scripts/audit-jsonld-integrity.mjs --strict  # exit 1 si gap
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join, relative } from 'node:path'

const args = new Set(process.argv.slice(2))
const strict = args.has('--strict')
const jsonOut = args.has('--json')

const ROOT = process.cwd()
const SEO_DIR = join(ROOT, 'src', 'lib', 'seo')
const CONFIG_FILE = 'config.ts' // allowlist pour hardcoded domain

// Allowlist des @types officiels Schema.org utilisés dans ce repo.
// Source : schema.org/Type et usages réels du projet.
const ALLOWED_TYPES = new Set([
  // Core
  'Thing',
  'Organization',
  'GovernmentOrganization',
  'WebSite',
  'WebPage',
  'Article',
  'TechArticle',
  'WebPageElement',
  'BlogPosting',
  'NewsArticle',
  'FAQPage',
  'Question',
  'Answer',
  'BreadcrumbList',
  'ListItem',
  'HowTo',
  'HowToStep',
  'SpeakableSpecification',
  // People/Authors
  'Person',
  'Occupation',
  'ImageObject',
  'VideoObject',
  'ContactPoint',
  'Audience',
  // Commerce/Service
  'Service',
  'LocalBusiness',
  'HomeAndConstructionBusiness',
  'Plumber',
  'Electrician',
  'HVACBusiness',
  'RoofingContractor',
  'GeneralContractor',
  'Product',
  'Offer',
  'AggregateOffer',
  'OfferCatalog',
  'AggregateRating',
  'Rating',
  'Review',
  'ReviewRating',
  'MonetaryAmount',
  'UnitPriceSpecification',
  'PriceSpecification',
  'OpeningHoursSpecification',
  // Financial / Gov
  'GovernmentService',
  'FinancialProduct',
  'LoanOrCredit',
  // Collections
  'CollectionPage',
  'ProfilePage',
  'QAPage',
  'ItemList',
  'SearchAction',
  'EntryPoint',
  // Data
  'Dataset',
  'DataCatalog',
  'DataDownload',
  'CreativeWork',
  'DefinedTerm',
  'DefinedTermSet',
  // Web App
  'WebApplication',
  'SoftwareApplication',
  // Location
  'Place',
  'PostalAddress',
  'GeoCoordinates',
  'City',
  'Country',
  'AdministrativeArea',
])

function walk(dir, acc = []) {
  if (!existsSync(dir)) return acc
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const st = statSync(full)
    if (st.isDirectory()) walk(full, acc)
    else if (/\.tsx?$/.test(entry)) acc.push(full)
  }
  return acc
}

function isIsoDate(s) {
  // Accept YYYY-MM-DD or full ISO (with time + tz)
  return /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2})?(\.\d+)?(Z|[+-]\d{2}:?\d{2})?)?$/.test(s)
}

function main() {
  // Scope to files that actually produce JSON-LD (contain @context or @type)
  // Exclut __tests__/ : les tests utilisent légitimement des URLs hardcodées
  // pour vérifier le shape des Schemas (vérification déterministe vs SITE_URL).
  const files = walk(SEO_DIR).filter((f) => {
    if (f.includes('__tests__') || /\.test\.(ts|tsx)$/.test(f)) return false
    const src = readFileSync(f, 'utf8')
    return /@context|@type/.test(src)
  })
  const issues = []

  // Collect all @type references to cross-check against allowlist
  const typesSeen = new Map() // type -> [file]

  for (const file of files) {
    const src = readFileSync(file, 'utf8')
    const rel = relative(ROOT, file).replace(/\\/g, '/')

    // 1) @context must be "https://schema.org"
    const ctxRe = /['"]@context['"]\s*:\s*(['"])([^'"]+)\1/g
    let m
    while ((m = ctxRe.exec(src))) {
      if (m[2] !== 'https://schema.org') {
        issues.push({
          kind: 'bad_context',
          file: rel,
          value: m[2],
        })
      }
    }

    // 2) @type validation
    const typeRe = /['"]@type['"]\s*:\s*(['"])([A-Za-z]+)\1/g
    while ((m = typeRe.exec(src))) {
      const t = m[2]
      if (!typesSeen.has(t)) typesSeen.set(t, [])
      typesSeen.get(t).push(rel)
      if (!ALLOWED_TYPES.has(t)) {
        issues.push({
          kind: 'unknown_type',
          file: rel,
          value: t,
        })
      }
    }

    // 3) datePublished / dateModified must be ISO 8601
    const dateRe = /['"]?(datePublished|dateModified|startDate|endDate|uploadDate)['"]?\s*:\s*(['"`])([^'"`]+)\2/g
    while ((m = dateRe.exec(src))) {
      const key = m[1]
      const raw = m[3]
      // Skip template literals with ${} — cannot evaluate statically
      if (raw.includes('${')) continue
      if (!isIsoDate(raw)) {
        issues.push({
          kind: 'bad_iso_date',
          file: rel,
          field: key,
          value: raw,
        })
      }
    }

    // 4) Hardcoded domain outside config.ts
    if (!file.endsWith(CONFIG_FILE)) {
      const hardcodedRe = /['"`]https?:\/\/(?:www\.)?servicesartisans\.fr[^'"`]*['"`]/g
      while ((m = hardcodedRe.exec(src))) {
        // Allow https://servicesartisans.fr if it's inside a comment
        const before = src.slice(Math.max(0, m.index - 3), m.index)
        if (before.includes('//') || before.includes('*')) continue
        issues.push({
          kind: 'hardcoded_domain',
          file: rel,
          value: m[0].slice(0, 80),
        })
      }
    }

    // 5) url / image / logo relative (must start with SITE_URL template or http)
    // We focus on literal string values. Template literals `${SITE_URL}/...` are fine.
    const relativeUrlRe = /['"`](url|logo|image|sameAs|mainEntityOfPage|@id)['"`]?\s*:\s*(['"])(\/[^'"]*)\2/g
    while ((m = relativeUrlRe.exec(src))) {
      issues.push({
        kind: 'relative_url',
        file: rel,
        field: m[1],
        value: m[3],
      })
    }
  }

  const byKind = {
    bad_context: issues.filter((i) => i.kind === 'bad_context').length,
    unknown_type: issues.filter((i) => i.kind === 'unknown_type').length,
    bad_iso_date: issues.filter((i) => i.kind === 'bad_iso_date').length,
    hardcoded_domain: issues.filter((i) => i.kind === 'hardcoded_domain').length,
    relative_url: issues.filter((i) => i.kind === 'relative_url').length,
  }

  const report = {
    files_scanned: files.length,
    types_distinct: typesSeen.size,
    issues_total: issues.length,
    issues_by_kind: byKind,
    issues,
  }

  if (jsonOut) {
    console.log(JSON.stringify(report, null, 2))
  } else {
    console.log('\n📋 JSON-LD Integrity Audit (src/lib/seo/**)\n')
    console.log(`  Fichiers scannés        : ${files.length}`)
    console.log(`  @type distincts trouvés : ${typesSeen.size}`)
    console.log(`  Issues total            : ${issues.length}`)
    console.log(`    - bad_context         : ${byKind.bad_context}`)
    console.log(`    - unknown_type        : ${byKind.unknown_type}`)
    console.log(`    - bad_iso_date        : ${byKind.bad_iso_date}`)
    console.log(`    - hardcoded_domain    : ${byKind.hardcoded_domain}`)
    console.log(`    - relative_url        : ${byKind.relative_url}`)
    if (issues.length) {
      console.log('\n  ⚠️  Top 20 issues :')
      for (const i of issues.slice(0, 20)) {
        console.log(`     [${i.kind}] ${i.file}  ${i.field ?? ''} = ${i.value}`)
      }
    } else {
      console.log('\n  ✅ Intégrité JSON-LD OK.\n')
    }
  }

  if (strict && issues.length > 0) process.exit(1)
}

main()
