/**
 * Calibration sampler — `/sa-description-audit` skill (rubric v1.0)
 * -----------------------------------------------------------------------------
 * Builds a deterministic 50-description calibration set stratified across four
 * quality profiles. The user then runs the skill on each sample, compares the
 * auto-scores against a manual ground-truth pass, and computes Cohen's kappa
 * against the upcoming Opus L2 judge. Target kappa ≥ 0.7 (see SKILL.md §Calibration).
 *
 * Sampling rules (12-13 rows per profile, 50 total):
 *   A — Long & rich     : length(description) >= 600
 *   B — Medium          : length(description) BETWEEN 300 AND 599
 *   C — Short           : length(description) BETWEEN 100 AND 299
 *   D — RGE-specific    : rge_qualifications non-empty JSONB + length >= 100
 *
 * Determinism : rows are fetched ordered by `id ASC`, then a hash of the id
 * picks a pseudo-random but stable slot inside the candidate pool. Re-running
 * the script overwrites the same 50 files.
 *
 * PII discipline : phone / email / SIRET are NEVER written to the output JSON —
 * the calibration artefacts are for description audit only, not provider profiling.
 *
 * Usage:
 *   npx tsx scripts/calibration-sample-descriptions.ts
 */

import * as path from 'path'
import * as fs from 'fs/promises'
import * as crypto from 'crypto'
import * as dotenv from 'dotenv'

dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'

type Profile = 'A' | 'B' | 'C' | 'D'

type RgeQualification = {
  code: string
  nom: string
  organisme: string
  domaine: string | null
  meta_domaine: string | null
  date_debut: string
  date_fin: string
  url: string | null
}

type ProviderRow = {
  id: string
  name: string | null
  specialty: string | null
  address_city: string | null
  address_region: string | null
  rge_qualifications: RgeQualification[] | null
  rge_valid_until: string | null
  claimed_at: string | null
  description: string | null
}

type CalibrationSample = {
  provider_id: string
  profile: Profile
  name: string
  specialty: string
  address_city: string
  address_region: string
  rge_qualifications: string[]
  rge_valid_until: string | null
  claimed_at: string | null
  description: string
  word_count: number
  char_count: number
}

const OUTPUT_DIR = path.join(__dirname, '..', 'docs', 'descriptions-pipeline', 'calibration')
const TOTAL_SAMPLES = 50
const PROFILES: readonly Profile[] = ['A', 'B', 'C', 'D'] as const
const QUOTA: Record<Profile, number> = { A: 13, B: 13, C: 12, D: 12 }
const CANDIDATE_POOL_SIZE = 2000
const SELECT_COLS =
  'id, name, specialty, address_city, address_region, rge_qualifications, rge_valid_until, claimed_at, description'

const SELECT_FIELDS: readonly string[] = [
  'provider_id',
  'profile',
  'name',
  'specialty',
  'address_city',
  'address_region',
  'rge_qualifications',
  'rge_valid_until',
  'claimed_at',
  'description',
  'word_count',
  'char_count',
]

function hashScore(id: string): number {
  const digest = crypto.createHash('sha256').update(id).digest()
  return digest.readUInt32BE(0)
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

function hasNonEmptyRge(qs: RgeQualification[] | null): boolean {
  return Array.isArray(qs) && qs.length > 0
}

function fitsProfile(profile: Profile, row: ProviderRow): boolean {
  const len = row.description?.length ?? 0
  if (len < 100) return false
  switch (profile) {
    case 'A':
      return len >= 600
    case 'B':
      return len >= 300 && len <= 599
    case 'C':
      return len >= 100 && len <= 299
    case 'D':
      return hasNonEmptyRge(row.rge_qualifications)
  }
}

async function fetchCandidatePool(
  supabase: ReturnType<typeof createAdminClient>,
  profile: Profile
): Promise<ProviderRow[]> {
  let query = supabase
    .from('providers')
    .select(SELECT_COLS)
    .not('description', 'is', null)
    .order('id', { ascending: true })
    .limit(CANDIDATE_POOL_SIZE)

  if (profile === 'D') {
    query = query.not('rge_qualifications', 'is', null)
  }

  const { data, error } = await query
  if (error) throw new Error(`fetch pool ${profile}: ${error.message}`)

  const rows = (data ?? []) as ProviderRow[]
  return rows.filter((r) => fitsProfile(profile, r))
}

function pickDeterministic(pool: ProviderRow[], quota: number): ProviderRow[] {
  const ranked = pool
    .map((row) => ({ row, score: hashScore(row.id) }))
    .sort((a, b) => a.score - b.score)
  return ranked.slice(0, quota).map((r) => r.row)
}

function toSample(row: ProviderRow, profile: Profile): CalibrationSample {
  const description = row.description ?? ''
  const rgeCodes: string[] = hasNonEmptyRge(row.rge_qualifications)
    ? (row.rge_qualifications as RgeQualification[]).map((q) => q.code).filter(Boolean)
    : []

  return {
    provider_id: row.id,
    profile,
    name: row.name ?? '',
    specialty: row.specialty ?? '',
    address_city: row.address_city ?? '',
    address_region: row.address_region ?? '',
    rge_qualifications: rgeCodes,
    rge_valid_until: row.rge_valid_until,
    claimed_at: row.claimed_at,
    description,
    word_count: wordCount(description),
    char_count: description.length,
  }
}

function sampleFilename(profile: Profile, indexZeroBased: number): string {
  const idx = String(indexZeroBased + 1).padStart(2, '0')
  return `sample-${profile}-${idx}.json`
}

async function writeSample(sample: CalibrationSample, filename: string): Promise<void> {
  const filePath = path.join(OUTPUT_DIR, filename)
  await fs.writeFile(filePath, JSON.stringify(sample, null, 2) + '\n', 'utf8')
}

function buildIndexMarkdown(
  grouped: Record<Profile, { filename: string; sample: CalibrationSample }[]>
): string {
  const lines: string[] = []
  lines.push('# Calibration samples — `/sa-description-audit` v1.0')
  lines.push('')
  lines.push(`Generated : ${new Date().toISOString()}`)
  lines.push(`Total     : ${TOTAL_SAMPLES} samples across 4 profiles`)
  lines.push('')
  lines.push('Cocher chaque fiche au fur et à mesure du scoring manuel (ground-truth pass).')
  lines.push('Le kappa inter-annotateur sera calculé après le scoring complet.')
  lines.push('')
  lines.push(`Fields included per file : ${SELECT_FIELDS.join(', ')}`)
  lines.push('')

  const headings: Record<Profile, string> = {
    A: 'Profile A — Long & rich (`length >= 600`)',
    B: 'Profile B — Medium (`length 300-599`)',
    C: 'Profile C — Short (`length 100-299`)',
    D: 'Profile D — RGE-specific (non-empty `rge_qualifications`, `length >= 100`)',
  }

  for (const profile of PROFILES) {
    const entries = grouped[profile]
    lines.push(`## ${headings[profile]}`)
    lines.push('')
    lines.push(`Count : ${entries.length}`)
    lines.push('')
    for (const { filename, sample } of entries) {
      const meta = `${sample.char_count} chars · ${sample.word_count} words · ${sample.specialty || '—'} · ${sample.address_city || '—'}`
      lines.push(`- [ ] \`${filename}\` — ${meta}`)
    }
    lines.push('')
  }

  lines.push('## Next steps')
  lines.push('')
  lines.push('1. Run `/sa-description-audit` on each file (feed `description` + provider context).')
  lines.push('2. Record auto-scores in a tracking sheet alongside your manual ground-truth scores.')
  lines.push("3. Compute Cohen's kappa once all 50 are scored. Target ≥ 0.7.")
  lines.push('4. If kappa < 0.7, iterate the rubric to v1.1 before running the LLM judge at scale.')
  lines.push('')

  return lines.join('\n')
}

async function main(): Promise<void> {
  logger.info('[calibration-sample] start', { outputDir: OUTPUT_DIR, total: TOTAL_SAMPLES })

  await fs.mkdir(OUTPUT_DIR, { recursive: true })

  const supabase = createAdminClient()
  const grouped: Record<Profile, { filename: string; sample: CalibrationSample }[]> = {
    A: [],
    B: [],
    C: [],
    D: [],
  }
  const takenIds = new Set<string>()

  for (const profile of PROFILES) {
    const pool = await fetchCandidatePool(supabase, profile)
    const eligible = pool.filter((row) => !takenIds.has(row.id))
    const picked = pickDeterministic(eligible, QUOTA[profile])

    if (picked.length < QUOTA[profile]) {
      logger.warn('[calibration-sample] profile undersampled', {
        profile,
        picked: picked.length,
        quota: QUOTA[profile],
        poolSize: pool.length,
      })
    }

    for (let i = 0; i < picked.length; i++) {
      const row = picked[i]
      takenIds.add(row.id)
      const sample = toSample(row, profile)
      const filename = sampleFilename(profile, i)
      await writeSample(sample, filename)
      grouped[profile].push({ filename, sample })
    }

    logger.info('[calibration-sample] profile done', {
      profile,
      written: picked.length,
      quota: QUOTA[profile],
    })
  }

  const indexPath = path.join(OUTPUT_DIR, 'INDEX.md')
  await fs.writeFile(indexPath, buildIndexMarkdown(grouped), 'utf8')

  const totalWritten = PROFILES.reduce((acc, p) => acc + grouped[p].length, 0)
  logger.info('[calibration-sample] done', {
    outputDir: OUTPUT_DIR,
    indexFile: indexPath,
    totalWritten,
    perProfile: {
      A: grouped.A.length,
      B: grouped.B.length,
      C: grouped.C.length,
      D: grouped.D.length,
    },
  })

  process.exit(0)
}

main().catch((err) => {
  logger.error('[calibration-sample] failed', err)
  process.exit(1)
})
