/**
 * Sample N failed drafts per model for human inspection.
 *
 * Dumps one JSON doc per draft with : draft text, score breakdown, flags,
 * context richness (does it have INSEE ? specialty ? qualifs count ?).
 *
 * CLI :
 *   npx tsx scripts/sample-fails.ts --n 10
 *   npx tsx scripts/sample-fails.ts --model claude-sonnet-4-5 --n 5
 */

import * as path from 'path'
import * as dotenv from 'dotenv'

dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

import { createAdminClient } from '@/lib/supabase/admin'
import { fetchProviderContextsBatch } from '@/lib/descriptions/retrieval'

type Args = { n: number; modelFilter: string | null }

const parseArgs = (argv: string[]): Args => {
  const out: Args = { n: 10, modelFilter: null }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--n') {
      out.n = Number(argv[++i])
      if (!Number.isFinite(out.n) || out.n <= 0) throw new Error('--n > 0')
    } else if (a === '--model') {
      out.modelFilter = argv[++i]
    } else throw new Error(`Unknown flag: ${a}`)
  }
  return out
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const supabase = createAdminClient()

  let q = supabase
    .from('provider_descriptions_draft')
    .select(
      'provider_id, draft_text, model_used, judge_score, judge_breakdown, hallucination_flags, word_count, generated_at'
    )
    .eq('status', 'judged_fail')
    .order('generated_at', { ascending: false })
    .limit(args.n * 3)
  if (args.modelFilter) q = q.ilike('model_used', `${args.modelFilter}%`)

  const { data, error } = await q
  if (error) throw new Error(`query: ${error.message}`)
  const rows = data ?? []
  if (rows.length === 0) {
    console.log('[sample-fails] no rows found')
    return
  }

  const ids = rows.slice(0, args.n).map((r) => r.provider_id as string)
  const contexts = await fetchProviderContextsBatch(ids)

  for (const r of rows.slice(0, args.n)) {
    const ctx = contexts.get(r.provider_id as string)
    const ctxSummary = ctx
      ? {
          city: ctx.address_city,
          specialty: ctx.specialty,
          qualifCount: ctx.rge_qualifications?.length ?? 0,
          qualifCodes: (ctx.rge_qualifications ?? []).map((q) => q.code).filter(Boolean),
          metaDomains: Array.from(
            new Set(
              (ctx.rge_qualifications ?? [])
                .map((q) => q.meta_domaine)
                .filter((d): d is string => Boolean(d))
            )
          ),
          hasInsee: Boolean((ctx as { insee?: unknown }).insee),
          inseeAgeYears: (ctx as { insee?: { ageYears?: number | null } }).insee?.ageYears ?? null,
          inseeStaffBucket:
            (ctx as { insee?: { staffBucket?: string | null } }).insee?.staffBucket ?? null,
        }
      : null

    console.log('='.repeat(80))
    console.log(`PROVIDER ${r.provider_id}`)
    console.log(`MODEL    ${r.model_used}  score=${r.judge_score}  words=${r.word_count}`)
    console.log(`BREAKDOWN ${JSON.stringify(r.judge_breakdown)}`)
    console.log(`FLAGS    ${JSON.stringify(r.hallucination_flags)}`)
    console.log(`CTX      ${JSON.stringify(ctxSummary)}`)
    console.log('---DRAFT---')
    console.log(r.draft_text)
    console.log()
  }

  console.log('='.repeat(80))
  console.log(`[sample-fails] dumped ${Math.min(args.n, rows.length)} samples`)
}

main().catch((e) => {
  console.error('[sample-fails] fatal:', e)
  process.exit(1)
})
