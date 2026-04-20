/**
 * Re-score existing draft descriptions with current validator (v1.2).
 * No LLM call : reads draft_text + provider context, re-runs validateDescription,
 * updates status + breakdown + rubric_version in place.
 *
 * Default target : rows with status='judged_fail' AND rubric_version !=
 * current RUBRIC_VERSION. Use --include-pass to also re-score judged_pass
 * (not recommended — avoids churn on already-promoted rows).
 *
 * CLI:
 *   npx tsx scripts/rescore-drafts.ts --dry-run
 *   npx tsx scripts/rescore-drafts.ts --limit 100
 *   npx tsx scripts/rescore-drafts.ts
 */

import * as path from 'path'
import * as dotenv from 'dotenv'

dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import { RUBRIC_VERSION, validateDescription } from '@/lib/descriptions/validator'
import { fetchProviderContextsBatch } from '@/lib/descriptions/retrieval'

type Args = {
  dryRun: boolean
  limit: number | null
  includePass: boolean
}

const parseArgs = (argv: string[]): Args => {
  const out: Args = { dryRun: false, limit: null, includePass: false }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--dry-run') out.dryRun = true
    else if (a === '--include-pass') out.includePass = true
    else if (a === '--limit') {
      out.limit = Number(argv[++i])
      if (!Number.isFinite(out.limit) || out.limit! <= 0) {
        throw new Error('--limit requires a positive integer')
      }
    } else throw new Error(`Unknown flag: ${a}`)
  }
  return out
}

type DraftRow = {
  provider_id: string
  draft_text: string
  status: string
  prompt_version: string
  rubric_version: string
}

async function fetchStaleDrafts(includePass: boolean): Promise<DraftRow[]> {
  const supabase = createAdminClient()
  const out: DraftRow[] = []
  const PAGE = 1000
  let cursor: string | null = null
  const targetStatuses = includePass ? ['judged_fail', 'judged_pass'] : ['judged_fail']

  for (;;) {
    let q = supabase
      .from('provider_descriptions_draft')
      .select('provider_id, draft_text, status, prompt_version, rubric_version')
      .in('status', targetStatuses)
      .neq('rubric_version', RUBRIC_VERSION)
      .order('provider_id', { ascending: true })
      .limit(PAGE)
    if (cursor !== null) q = q.gt('provider_id', cursor)
    const { data, error } = await q
    if (error) throw new Error(`fetchStaleDrafts: ${error.message}`)
    const rows = (data ?? []) as DraftRow[]
    if (rows.length === 0) break
    for (const r of rows) out.push(r)
    cursor = rows[rows.length - 1].provider_id
    if (rows.length < PAGE) break
  }
  return out
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2))
  console.log(`[rescore] target rubric=${RUBRIC_VERSION} dryRun=${args.dryRun}`)

  const drafts = await fetchStaleDrafts(args.includePass)
  const scope = args.limit ? drafts.slice(0, args.limit) : drafts
  console.log(`[rescore] stale drafts=${drafts.length} scope=${scope.length}`)
  if (scope.length === 0) {
    console.log('[rescore] nothing to do.')
    return
  }

  const providerIds = scope.map((d) => d.provider_id)
  console.log(`[rescore] fetching provider contexts...`)
  const contexts = await fetchProviderContextsBatch(providerIds)
  console.log(`[rescore] contexts=${contexts.size}`)

  const supabase = createAdminClient()
  let pass = 0
  let fail = 0
  let skipped = 0
  const promotions: Array<{ id: string; old: number; neu: number }> = []

  const updates: Array<Record<string, unknown>> = []
  for (const draft of scope) {
    const ctx = contexts.get(draft.provider_id)
    if (!ctx) {
      skipped++
      continue
    }
    if (!draft.draft_text || draft.draft_text.trim().length === 0) {
      skipped++
      continue
    }
    const score = validateDescription(draft.draft_text, ctx)
    const newStatus: 'judged_pass' | 'judged_fail' =
      score.verdict === 'pass' ? 'judged_pass' : 'judged_fail'
    if (newStatus === 'judged_pass') {
      pass++
      if (draft.status === 'judged_fail') {
        promotions.push({ id: draft.provider_id, old: 0, neu: score.overall })
      }
    } else {
      fail++
    }
    updates.push({
      provider_id: draft.provider_id,
      status: newStatus,
      rubric_version: RUBRIC_VERSION,
      judge_score: score.overall,
      judge_breakdown: {
        dim1_originality: score.dim1_originality,
        dim2_variability: score.dim2_variability,
        dim3_density: score.dim3_density,
        dim4_eeat: score.dim4_eeat,
        dim5_ymyl: score.dim5_ymyl,
        dim6_seo: score.dim6_seo,
        dim7_readability: score.dim7_readability,
        dim8_intent: score.dim8_intent,
        dim9_qrg: score.dim9_qrg,
      },
      hallucination_flags: score.flags,
      judged_at: new Date().toISOString(),
    })
  }

  console.log(
    `[rescore] computed: pass=${pass} fail=${fail} skipped=${skipped} promotions=${promotions.length}`
  )

  if (args.dryRun) {
    console.log('[rescore] dry-run, skipping DB writes.')
    console.log(`[rescore] sample promotions:`)
    for (const p of promotions.slice(0, 10)) {
      console.log(`  ${p.id} overall=${p.neu.toFixed(2)}`)
    }
    return
  }

  console.log(`[rescore] upserting ${updates.length} rows...`)
  const CHUNK = 500
  for (let i = 0; i < updates.length; i += CHUNK) {
    const slice = updates.slice(i, i + CHUNK)
    const { error } = await supabase
      .from('provider_descriptions_draft')
      .upsert(slice, { onConflict: 'provider_id' })
    if (error) {
      logger.error('[rescore] upsert failed', error as Error)
      throw error
    }
    console.log(`[rescore]   ${Math.min(i + CHUNK, updates.length)}/${updates.length}`)
  }
  console.log(`[rescore] done. promoted=${promotions.length} to judged_pass.`)
}

main().catch((err) => {
  console.error('[rescore] fatal:', err)
  process.exit(1)
})
