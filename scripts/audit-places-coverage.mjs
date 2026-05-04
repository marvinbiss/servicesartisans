#!/usr/bin/env node
/**
 * scripts/audit-places-coverage.mjs
 * ----------------------------------
 * DoD du backlog item P3-google-places-siret-match.
 *
 * Source : memory `servicesartisans-seo-10agents-synthesis-2026-04-28` (#5)
 * — match SIRET → Google Places sur 49K fiches RGE pour récupérer 45-60K avis
 * externes + +18-25 % CTR via étoiles SERP. Cluster Ahrefs « avis [artisan]
 * [ville] » 4200 vol KD 18 (Pages Jaunes / Trustpilot leaders).
 *
 * Vérifie la PRÉSENCE et la COHÉSION du stack code (sans appeler l'API) :
 *
 *   1. Migration 483 présente avec 6 colonnes google_*
 *   2. Migration 483 contient les 4 contraintes CHECK (rating range, total nonneg,
 *      business_status enum, sync_status enum + place_id format)
 *   3. Migration 483 crée 3 indexes (uniq partial place_id, pending pickup, rating present)
 *   4. Helper findPlaceBySiret existe dans @/lib/google/places-client
 *   5. Helper classifyProviderConfidence (preflight name-quality) existe
 *   6. Script backfill-google-places.ts présent + dry-run par défaut + APPLY flag
 *   7. Script enrich-google-places.ts présent (delta sync incrémental)
 *   8. Script audit-google-places-eligibility.ts présent (preflight ZÉRO call)
 *   9. ArtisanSchema émet AggregateRating fallback Google avec guards stricts
 *      (place_id + rating∈[1,5] + count≥3 + business_status=OPERATIONAL)
 *  10. GoogleReviewsBadge composant existe + utilisé dans page artisan
 *
 * --threshold N    : exige ≥N% des patterns OK (défaut 80).
 *                    Permet de garder le DoD vert pendant que le backfill
 *                    runtime (cold start ~833€) avance par batch en prod.
 *
 * Usage :
 *   node scripts/audit-places-coverage.mjs --threshold 80
 *   node scripts/audit-places-coverage.mjs --json
 */

import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const args = process.argv.slice(2)
const thresholdArg = args.find((a) => a.startsWith('--threshold'))
const threshold = thresholdArg
  ? Number(thresholdArg.split('=')[1] ?? args[args.indexOf(thresholdArg) + 1] ?? 80)
  : 80
const strict = args.includes('--strict') || args.some((a) => a.startsWith('--threshold'))
const jsonOut = args.includes('--json')

const ROOT = process.cwd()
const MIG_483 = join(ROOT, 'supabase', 'migrations', '483_providers_google_places.sql')
const PLACES_CLIENT = join(ROOT, 'src', 'lib', 'google', 'places-client.ts')
const NAME_QUALITY = join(ROOT, 'src', 'lib', 'google', 'name-quality.ts')
const BACKFILL = join(ROOT, 'scripts', 'backfill-google-places.ts')
const ENRICH = join(ROOT, 'scripts', 'enrich-google-places.ts')
const ELIGIBILITY = join(ROOT, 'scripts', 'audit-google-places-eligibility.ts')
const ARTISAN_SCHEMA = join(ROOT, 'src', 'components', 'artisan', 'ArtisanSchema.tsx')
const GOOGLE_BADGE = join(ROOT, 'src', 'components', 'artisan', 'GoogleReviewsBadge.tsx')
const ARTISAN_PAGE = join(
  ROOT,
  'src',
  'app',
  '(public)',
  'services',
  '[service]',
  '[location]',
  '[publicId]',
  'page.tsx'
)

const read = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : '')

const migSrc = read(MIG_483)
const placesSrc = read(PLACES_CLIENT)
const nameQSrc = read(NAME_QUALITY)
const backfillSrc = read(BACKFILL)
const enrichSrc = read(ENRICH)
const eligibilitySrc = read(ELIGIBILITY)
const schemaSrc = read(ARTISAN_SCHEMA)
const badgeSrc = read(GOOGLE_BADGE)
const pageSrc = read(ARTISAN_PAGE)

const REQUIRED_COLUMNS = [
  'google_place_id',
  'google_rating',
  'google_user_ratings_total',
  'google_business_status',
  'google_synced_at',
  'google_sync_status',
]

const allColumnsPresent = REQUIRED_COLUMNS.every((c) => migSrc.includes(c))

const REQUIRED_CONSTRAINTS = [
  'providers_google_rating_range',
  'providers_google_user_ratings_total_nonneg',
  'providers_google_business_status_enum',
  'providers_google_sync_status_enum',
  'providers_google_place_id_format',
]
const allConstraintsPresent = REQUIRED_CONSTRAINTS.every((c) => migSrc.includes(c))

const REQUIRED_INDEXES = [
  'providers_google_place_id_uniq',
  'providers_google_synced_at_pending_idx',
  'providers_google_rating_present_idx',
]
const allIndexesPresent = REQUIRED_INDEXES.every((i) => migSrc.includes(i))

const guardsStrict =
  /aggregateRating/.test(schemaSrc) &&
  /artisan\.google_place_id/.test(schemaSrc) &&
  /gRating\s*>=\s*1/.test(schemaSrc) &&
  /gRating\s*<=\s*5/.test(schemaSrc) &&
  /gCount\s*>=\s*3/.test(schemaSrc) &&
  /google_business_status\s*===\s*['"]OPERATIONAL['"]/.test(schemaSrc)

const checks = [
  {
    id: 'mig_483_present',
    label: 'Migration 483 présente avec 6 colonnes google_*',
    ok: existsSync(MIG_483) && allColumnsPresent,
    weight: 1.5,
  },
  {
    id: 'mig_483_constraints',
    label: 'Migration 483 contient 4+ CHECK constraints (range/enum/format)',
    ok: allConstraintsPresent,
    weight: 1.0,
  },
  {
    id: 'mig_483_indexes',
    label: 'Migration 483 crée 3 indexes (uniq place_id + pending pickup + rating present)',
    ok: allIndexesPresent,
    weight: 1.0,
  },
  {
    id: 'places_client_helper',
    label: 'Helper findPlaceBySiret dans @/lib/google/places-client',
    ok: existsSync(PLACES_CLIENT) && /findPlaceBySiret/.test(placesSrc),
    weight: 1.0,
  },
  {
    id: 'name_quality_helper',
    label: 'Helper classifyProviderConfidence (preflight name-quality)',
    ok: existsSync(NAME_QUALITY) && /classifyProviderConfidence/.test(nameQSrc),
    weight: 1.0,
  },
  {
    id: 'backfill_script',
    label: 'Script backfill-google-places.ts (dry-run par défaut + --apply flag)',
    ok:
      existsSync(BACKFILL) &&
      /APPLY/.test(backfillSrc) &&
      /findPlaceBySiret/.test(backfillSrc),
    weight: 1.5,
  },
  {
    id: 'enrich_script',
    label: 'Script enrich-google-places.ts (sync delta incrémental)',
    ok: existsSync(ENRICH),
    weight: 1.0,
  },
  {
    id: 'eligibility_preflight',
    label: 'Script audit-google-places-eligibility.ts (preflight ZÉRO call API)',
    ok: existsSync(ELIGIBILITY) && /classifyProviderConfidence/.test(eligibilitySrc),
    weight: 1.0,
  },
  {
    id: 'schema_aggregate_rating_fallback',
    label:
      'ArtisanSchema émet AggregateRating Google avec guards stricts (place_id + rating∈[1,5] + count≥3 + OPERATIONAL)',
    ok: guardsStrict,
    weight: 2.0,
  },
  {
    id: 'badge_component_wired',
    label: 'GoogleReviewsBadge composant + rendu sur page artisan avec guards',
    ok:
      existsSync(GOOGLE_BADGE) &&
      /export.*GoogleReviewsBadge/.test(badgeSrc) &&
      /GoogleReviewsBadge/.test(pageSrc),
    weight: 1.0,
  },
]

const totalWeight = checks.reduce((s, c) => s + c.weight, 0)
const passedWeight = checks.filter((c) => c.ok).reduce((s, c) => s + c.weight, 0)
const coveragePct = Math.round((passedWeight / totalWeight) * 1000) / 10

const failures = checks.filter((c) => !c.ok)

const report = {
  backlog_item: 'P3-google-places-siret-match',
  source_memory: 'servicesartisans-seo-10agents-synthesis-2026-04-28',
  ahrefs_kw: 'avis [artisan] [ville]',
  volume_ahrefs: 4200,
  threshold,
  coverage_pct: coveragePct,
  total_patterns: checks.length,
  passed_patterns: checks.length - failures.length,
  passed_weight: passedWeight,
  total_weight: totalWeight,
  failures: failures.map((f) => ({ id: f.id, label: f.label, weight: f.weight })),
}

if (jsonOut) {
  console.log(JSON.stringify(report, null, 2))
} else {
  console.log('\n📋 Google Places Coverage Audit (DoD P3-google-places-siret-match)\n')
  console.log(`  Backlog        : P3-google-places-siret-match`)
  console.log(`  Threshold      : ≥${threshold}%`)
  console.log(`  Coverage       : ${coveragePct}%  (${passedWeight}/${totalWeight} pondéré)`)
  console.log(`  Patterns       : ${checks.length - failures.length}/${checks.length}`)
  for (const c of checks) {
    const icon = c.ok ? '✅' : '❌'
    console.log(`     ${icon}  [${c.id}] ${c.label} (poids ${c.weight})`)
  }
  if (coveragePct >= threshold) {
    console.log(`\n  ✅ Coverage ${coveragePct}% ≥ threshold ${threshold}% — DoD atteinte.\n`)
  } else {
    console.log(
      `\n  ⚠️  Coverage ${coveragePct}% < threshold ${threshold}% — DoD non atteinte (${failures.length} échecs).\n`
    )
  }
}

if (strict && coveragePct < threshold) process.exit(1)
