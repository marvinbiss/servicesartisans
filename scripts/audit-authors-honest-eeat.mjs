#!/usr/bin/env node
/**
 * scripts/audit-authors-honest-eeat.mjs
 * --------------------------------------
 * DoD anti-régression sur la honnêteté E-E-A-T des fiches auteurs.
 *
 * Source : memory `servicesartisans-authors-honest-eeat-2026-04-20`.
 * Retrait des certifs individuelles fantasmées + LinkedIn fake. Replacement
 * = methodology[] + credentialsBasis + process éditorial publié. 130+
 * flagship guides affectés. Commit `8618f552`.
 *
 * Pourquoi : Google E-E-A-T classifie les claims faux comme "low quality
 * content" (Helpful Content System 2026). Si un dev :
 *
 *   - Réintroduit `certifications: ['OPQTECC', 'Qualibat 6111', ...]`
 *     sur un auteur → claim trompeur sur compétence individuelle (ces
 *     certifs sont organisationnelles, pas personnelles) → pénalité
 *     YMYL (rénovation = Your Money Your Life).
 *   - Ajoute un linkedin.com/in/<fake-handle> non vérifié → Google
 *     Knowledge Graph détecte l'incohérence + crawl 404 → trust dropping.
 *   - Retire methodology[] ou credentialsBasis → fiche auteur vidée
 *     = revient à du fluff "auteur expert", anti-pattern E-E-A-T.
 *
 * Vérifications :
 *
 *   1. authors.ts définit le type Author avec methodology + credentialsBasis
 *   2. Aucun champ `certifications` au top-level d'une fiche auteur
 *      (les certifs en bio/text sont OK car contextualisées)
 *   3. Aucune URL `linkedin.com/in/` (LinkedIn handles fake retirés)
 *   4. Chaque auteur a au moins 2 entries methodology[] + credentialsBasis non vide
 *   5. Au moins 4 auteurs définis (memory dit 6 auteurs livrés)
 *
 * Usage :
 *   node scripts/audit-authors-honest-eeat.mjs --strict
 */

import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const args = new Set(process.argv.slice(2))
const strict = args.has('--strict')
const jsonOut = args.has('--json')

const ROOT = process.cwd()
const AUTHORS_LIB = join(ROOT, 'src', 'lib', 'data', 'authors.ts')

if (!existsSync(AUTHORS_LIB)) {
  console.error('Audit authors honest : src/lib/data/authors.ts absent')
  if (strict) process.exit(1)
  process.exit(0)
}

const src = readFileSync(AUTHORS_LIB, 'utf8')

// Compte de fiches auteurs : on cherche les `name: '...'` à l'indentation
// de premier niveau (4 espaces, l'objet authors étant un Record<string, Author>).
const authorEntries = src.match(/^\s{4}name:\s*['"][^'"]+['"]/gm) ?? []
const authorsCount = authorEntries.length

// Détection des champs `certifications:` au top-level d'une fiche
// (pas dans une string ni un commentaire).
const certifFieldMatches = src.match(/^\s{2,8}certifications\s*:/gm) ?? []

// linkedin.com/in/ → fake handles
const linkedinMatches = src.match(/linkedin\.com\/in\//g) ?? []

const checks = [
  {
    id: 'author_type_methodology_credentials',
    label:
      'Type Author définit methodology: string[] + credentialsBasis: string',
    ok:
      /methodology:\s*string\[\]/.test(src) &&
      /credentialsBasis:\s*string/.test(src),
    weight: 2.0,
  },
  {
    id: 'no_top_level_certifications_field',
    label:
      'Aucun champ certifications top-level (certifs sont organisationnelles, pas personnelles)',
    ok: certifFieldMatches.length === 0,
    weight: 2.0,
    details: certifFieldMatches.slice(0, 5),
  },
  {
    id: 'no_linkedin_handles',
    label: 'Aucune URL linkedin.com/in/ (LinkedIn handles fake retirés)',
    ok: linkedinMatches.length === 0,
    weight: 1.5,
    details: linkedinMatches.slice(0, 3),
  },
  {
    id: 'methodology_non_empty_per_author',
    label:
      'Chaque auteur a methodology[] ≥2 entries + credentialsBasis non vide',
    ok: (() => {
      // Chaque bloc methodology: [...] doit contenir au moins 2 strings
      const methodologies = src.match(/methodology:\s*\[([\s\S]*?)\]/g) ?? []
      for (const m of methodologies) {
        const items = m.match(/['"][^'"]+['"]/g) ?? []
        if (items.length < 2) return false
      }
      // credentialsBasis non vide
      const credentials = src.match(/credentialsBasis:\s*\n?\s*['"]([^'"]*)['"]/g) ?? []
      for (const c of credentials) {
        const content = c.match(/['"]([^'"]*)['"]/)?.[1] ?? ''
        if (content.trim().length < 20) return false
      }
      return methodologies.length > 0 && credentials.length > 0
    })(),
    weight: 1.5,
  },
  {
    id: 'minimum_authors_count',
    label: `Au moins 4 auteurs définis (cible 6 selon memory)`,
    ok: authorsCount >= 4,
    weight: 1.0,
    details: { authorsCount },
  },
]

const totalWeight = checks.reduce((s, c) => s + c.weight, 0)
const passedWeight = checks.filter((c) => c.ok).reduce((s, c) => s + c.weight, 0)
const coveragePct = Math.round((passedWeight / totalWeight) * 1000) / 10

const failures = checks.filter((c) => !c.ok)

const report = {
  backlog_item: 'P3-authors-honest-eeat',
  source_memory: 'servicesartisans-authors-honest-eeat-2026-04-20',
  authors_count: authorsCount,
  total_checks: checks.length,
  passed: checks.length - failures.length,
  passed_weight: passedWeight,
  total_weight: totalWeight,
  coverage_pct: coveragePct,
  failures: failures.map((f) => ({
    id: f.id,
    label: f.label,
    weight: f.weight,
    details: f.details,
  })),
}

if (jsonOut) {
  console.log(JSON.stringify(report, null, 2))
} else {
  console.log('\n📋 Authors Honest E-E-A-T Audit (DoD P3-authors-honest-eeat)\n')
  console.log(`  Auteurs détectés : ${authorsCount}`)
  console.log(`  Patterns         : ${checks.length}`)
  console.log(`  Coverage         : ${coveragePct}% (${passedWeight}/${totalWeight} pondéré)`)
  for (const c of checks) {
    const icon = c.ok ? '✅' : '❌'
    console.log(`     ${icon}  [${c.id}] ${c.label} (poids ${c.weight})`)
    if (!c.ok && c.details) {
      console.log(`         - ${JSON.stringify(c.details)}`)
    }
  }
  if (failures.length === 0) {
    console.log('\n  ✅ Honnêteté E-E-A-T auteurs préservée.\n')
  } else {
    console.log(`\n  ⚠️  ${failures.length} régression(s) — DoD non atteinte.\n`)
  }
}

if (strict && failures.length > 0) process.exit(1)
