/**
 * REJUDGE — re-evaluate every draft in provider_descriptions_draft using the
 * current validator (rubric v1.3), without regenerating text. Pure scoring
 * pass, no API calls.
 *
 * What changes :
 *   - judge_breakdown.dim2_variability : 5.0 → 7.5 (placeholder neutralized)
 *   - judge_score                     : recomputed weighted overall
 *   - status                          : flips judged_fail ↔ judged_pass when
 *                                       the new overall crosses PASS_THRESHOLD
 *                                       (and YMYL/blocking flags still OK)
 *   - rubric_version                   : 'rge-rubric-v1.2' → 'rge-rubric-v1.3'
 *   - judged_at                        : now()
 *
 * Drafts already published (published_at IS NOT NULL) are UNTOUCHED to keep
 * prod pages stable. Only the draft table is rescored ; the publish script
 * handles flipping live pages afterwards.
 *
 * Idempotent : safe to re-run. DRY-RUN by default ; pass --commit to write.
 *
 * CLI :
 *   npx tsx scripts/rejudge-commit.ts            # dry-run, prints counts
 *   npx tsx scripts/rejudge-commit.ts --commit   # actually writes
 *   npx tsx scripts/rejudge-commit.ts --commit --limit 100
 */

import * as path from 'path'
import * as dotenv from 'dotenv'

dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

import { createAdminClient } from '@/lib/supabase/admin'
import { RUBRIC_VERSION, validateDescription } from '@/lib/descriptions/validator'
import { fetchProviderContextsBatch } from '@/lib/descriptions/retrieval'

type Args = { commit: boolean; limit: number | null }

const parseArgs = (argv: string[]): Args => {
  const out: Args = { commit: false, limit: null }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--commit') out.commit = true
    else if (a === '--limit') {
      out.limit = Number(argv[++i])
      if (!Number.isFinite(out.limit) || out.limit! <= 0) {
        throw new Error('--limit > 0')
      }
    } else throw new Error(`Unknown flag: ${a}`)
  }
  return out
}

type DraftRow = {
  provider_id: string
  draft_text: string
  status: string
  judge_score: number | null
  rubric_version: string | null
  published_at: string | null
}

async function fetchAllDrafts(limit: number | null): Promise<DraftRow[]> {
  const supabase = createAdminClient()
  const out: DraftRow[] = []
  const PAGE = 1000
  let cursor: string | null = null
  for (;;) {
    let q = supabase
      .from('provider_descriptions_draft')
      .select('provider_id, draft_text, status, judge_score, rubric_version, published_at')
      .is('published_at', null)
      .order('provider_id', { ascending: true })
      .limit(PAGE)
    if (cursor !== null) q = q.gt('provider_id', cursor)
    const { data, error } = await q
    if (error) throw new Error(`fetchAllDrafts: ${error.message}`)
    const rows = data ?? []
    if (rows.length === 0) break
    for (const r of rows as DraftRow[]) {
      out.push(r)
      if (limit !== null && out.length >= limit) return out
    }
    cursor = rows[rows.length - 1].provider_id as string
    if (rows.length < PAGE) break
  }
  return out
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  console.log(
    `[rejudge] RUBRIC_VERSION=${RUBRIC_VERSION} commit=${args.commit} limit=${args.limit ?? 'all'}`
  )

  const drafts = await fetchAllDrafts(args.limit)
  console.log(`[rejudge] loaded ${drafts.length} unpublished drafts`)
  if (drafts.length === 0) return

  const ids = drafts.map((d) => d.provider_id)
  console.log(`[rejudge] prefetching ${ids.length} contexts...`)
  const contexts = await fetchProviderContextsBatch(ids)
  console.log(`[rejudge] contexts=${contexts.size}`)

  const supabase = createAdminClient()
  let flips = 0
  let stayPass = 0
  let stayFail = 0
  let orphans = 0
  let unchanged = 0
  let written = 0
  let failed = 0

  const BATCH = 50
  for (let i = 0; i < drafts.length; i += BATCH) {
    const chunk = drafts.slice(i, i + BATCH)
    const updates: Array<{
      provider_id: string
      newStatus: 'judged_pass' | 'judged_fail'
      score: ReturnType<typeof validateDescription>
      wordCount: number
      prevStatus: string
    }> = []

    for (const d of chunk) {
      const ctx = contexts.get(d.provider_id)
      if (!ctx) {
        orphans++
        continue
      }
      const score = validateDescription(d.draft_text, ctx)
      const newStatus = score.verdict === 'pass' ? 'judged_pass' : 'judged_fail'
      const wordCount = d.draft_text.trim().split(/\s+/).length

      const wasPass = d.status === 'judged_pass'
      const nowPass = newStatus === 'judged_pass'
      if (!wasPass && nowPass) flips++
      else if (wasPass && nowPass) stayPass++
      else if (!wasPass && !nowPass) stayFail++
      else flips-- // pass → fail (subtracts from flip count, tracked in log below)

      updates.push({
        provider_id: d.provider_id,
        newStatus,
        score,
        wordCount,
        prevStatus: d.status,
      })
    }

    if (args.commit && updates.length > 0) {
      for (const u of updates) {
        const { error } = await supabase
          .from('provider_descriptions_draft')
          .update({
            rubric_version: RUBRIC_VERSION,
            judge_score: u.score.overall,
            judge_breakdown: {
              dim1_originality: u.score.dim1_originality,
              dim2_variability: u.score.dim2_variability,
              dim3_density: u.score.dim3_density,
              dim4_eeat: u.score.dim4_eeat,
              dim5_ymyl: u.score.dim5_ymyl,
              dim6_seo: u.score.dim6_seo,
              dim7_readability: u.score.dim7_readability,
              dim8_intent: u.score.dim8_intent,
              dim9_qrg: u.score.dim9_qrg,
            },
            hallucination_flags: u.score.flags,
            status: u.newStatus,
            word_count: u.wordCount,
            judged_at: new Date().toISOString(),
          })
          .eq('provider_id', u.provider_id)
        if (error) {
          console.error(`  update failed ${u.provider_id.slice(0, 8)}: ${error.message}`)
          failed++
        } else {
          written++
        }
      }
    } else {
      unchanged += updates.length
    }

    if ((i + BATCH) % 1000 < BATCH) {
      console.log(
        `  [${Math.min(i + BATCH, drafts.length)}/${drafts.length}] flips=${flips} stayPass=${stayPass} stayFail=${stayFail} written=${written}`
      )
    }
  }

  console.log('')
  console.log('=== SUMMARY ===')
  console.log(`total unpublished drafts : ${drafts.length}`)
  console.log(`flip fail→pass           : ${flips}`)
  console.log(`stay pass (confirmed)    : ${stayPass}`)
  console.log(`stay fail (confirmed)    : ${stayFail}`)
  console.log(`orphan (no context)      : ${orphans}`)
  console.log(`written                  : ${written}`)
  console.log(`failed                   : ${failed}`)
  if (!args.commit) console.log('(DRY-RUN — re-run with --commit to persist)')
}

main().catch((e) => {
  console.error('[rejudge] fatal:', e)
  process.exit(1)
})
