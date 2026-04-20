/**
 * DRY-RUN : re-evaluate the weighted overall score of every judged_fail draft
 * assuming the dim2_variability placeholder is lifted from 5.0 → 7.5 (neutral
 * w.r.t. the 7.5 pass threshold). No DB writes.
 *
 * Purpose : prove (or disprove) that the current 560-hard-case plateau is
 * explained by the hardcoded dim2 placeholder bug in validator.ts:474.
 *
 * Output : distribution of current overall, simulated overall, and pass count
 * under the new assumption.
 *
 * CLI :
 *   npx tsx scripts/rejudge-dryrun.ts
 *   npx tsx scripts/rejudge-dryrun.ts --d2 7.5
 *   npx tsx scripts/rejudge-dryrun.ts --d2 7.5 --target all   # include pass
 */

import * as path from 'path'
import * as dotenv from 'dotenv'

dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

import { createAdminClient } from '@/lib/supabase/admin'

const WEIGHTS: Record<string, number> = {
  dim1_originality: 1.0,
  dim2_variability: 1.0,
  dim3_density: 1.2,
  dim4_eeat: 1.5,
  dim5_ymyl: 2.0,
  dim6_seo: 0.8,
  dim7_readability: 0.8,
  dim8_intent: 1.2,
  dim9_qrg: 1.5,
}
const TOTAL_WEIGHT = Object.values(WEIGHTS).reduce((a, b) => a + b, 0)
const PASS_THRESHOLD = 7.5
const YMYL_BLOCK = 8.0

type Args = { d2: number; target: 'judged_fail' | 'all' }

const parseArgs = (argv: string[]): Args => {
  const out: Args = { d2: 7.5, target: 'judged_fail' }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--d2') {
      out.d2 = Number(argv[++i])
      if (!Number.isFinite(out.d2) || out.d2 < 0 || out.d2 > 10) {
        throw new Error('--d2 must be in [0,10]')
      }
    } else if (a === '--target') {
      const v = argv[++i]
      if (v !== 'judged_fail' && v !== 'all') throw new Error('--target judged_fail|all')
      out.target = v
    } else throw new Error(`Unknown flag: ${a}`)
  }
  return out
}

const round1 = (x: number): number => Math.round(x * 10) / 10

function recomputeOverall(breakdown: Record<string, number>, d2Override: number): number {
  let sum = 0
  for (const [dim, w] of Object.entries(WEIGHTS)) {
    const raw = dim === 'dim2_variability' ? d2Override : (breakdown[dim] ?? 0)
    sum += raw * w
  }
  return round1(sum / TOTAL_WEIGHT)
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const supabase = createAdminClient()

  console.log(`[rejudge-dryrun] d2Override=${args.d2} target=${args.target}`)

  const out: Array<{
    id: string
    current: number
    status: string
    simulated: number
    wouldPass: boolean
    breakdown: Record<string, number>
    ymylOk: boolean
  }> = []
  const PAGE = 1000
  let cursor: string | null = null
  for (;;) {
    let q = supabase
      .from('provider_descriptions_draft')
      .select('provider_id, status, judge_score, judge_breakdown, hallucination_flags')
      .order('provider_id', { ascending: true })
      .limit(PAGE)
    if (args.target === 'judged_fail') q = q.eq('status', 'judged_fail')
    if (cursor !== null) q = q.gt('provider_id', cursor)
    const { data, error } = await q
    if (error) throw new Error(`query: ${error.message}`)
    const rows = data ?? []
    if (rows.length === 0) break
    for (const r of rows) {
      const bd = (r.judge_breakdown ?? {}) as Record<string, number>
      const simulated = recomputeOverall(bd, args.d2)
      const ymyl = typeof bd.dim5_ymyl === 'number' ? bd.dim5_ymyl : 10
      const ymylOk = ymyl >= YMYL_BLOCK
      const flags = (r.hallucination_flags ?? []) as Array<{ severity?: string }>
      const hasBlocking = flags.some((f) => f?.severity === 'block')
      const wouldPass = simulated >= PASS_THRESHOLD && ymylOk && !hasBlocking
      out.push({
        id: r.provider_id as string,
        current: Number(r.judge_score) || 0,
        status: r.status as string,
        simulated,
        wouldPass,
        breakdown: bd,
        ymylOk,
      })
      cursor = r.provider_id as string
    }
    if (rows.length < PAGE) break
  }

  const total = out.length
  const currentFails = out.filter((r) => r.status === 'judged_fail').length
  const wouldPass = out.filter((r) => r.wouldPass && r.status === 'judged_fail').length
  const gain = wouldPass
  const ymylBlocked = out.filter((r) => !r.ymylOk && r.status === 'judged_fail').length
  const stillFail = currentFails - wouldPass

  const buckets = { lt6: 0, lt7: 0, lt75: 0, gte75: 0 }
  for (const r of out) {
    if (r.status !== 'judged_fail') continue
    if (r.simulated < 6) buckets.lt6++
    else if (r.simulated < 7) buckets.lt7++
    else if (r.simulated < 7.5) buckets.lt75++
    else buckets.gte75++
  }

  console.log(`[rejudge-dryrun] total_rows=${total}`)
  console.log(`[rejudge-dryrun] current_fails=${currentFails}`)
  console.log(
    `[rejudge-dryrun] would_pass_with_d2=${args.d2}: ${wouldPass} (${((wouldPass / currentFails) * 100).toFixed(1)}%)`
  )
  console.log(`[rejudge-dryrun] would_still_fail: ${stillFail}`)
  console.log(`[rejudge-dryrun] ymyl_hard_blocked: ${ymylBlocked}`)
  console.log(`[rejudge-dryrun] simulated overall distribution (fails only):`)
  console.log(`[rejudge-dryrun]   <6    : ${buckets.lt6}`)
  console.log(`[rejudge-dryrun]   6-7   : ${buckets.lt7}`)
  console.log(`[rejudge-dryrun]   7-7.5 : ${buckets.lt75}`)
  console.log(`[rejudge-dryrun]   >=7.5 : ${buckets.gte75}`)

  if (gain > 0) {
    console.log(`[rejudge-dryrun] SAMPLE (5 drafts that would flip fail→pass):`)
    const flips = out.filter((r) => r.wouldPass && r.status === 'judged_fail').slice(0, 5)
    for (const f of flips) {
      console.log(
        `  ${f.id.slice(0, 8)}  current=${f.current}  simulated=${f.simulated}  ` +
          `dims=d1:${f.breakdown.dim1_originality} d3:${f.breakdown.dim3_density} ` +
          `d4:${f.breakdown.dim4_eeat} d5:${f.breakdown.dim5_ymyl} ` +
          `d6:${f.breakdown.dim6_seo} d7:${f.breakdown.dim7_readability} ` +
          `d8:${f.breakdown.dim8_intent} d9:${f.breakdown.dim9_qrg}`
      )
    }
  }
}

main().catch((e) => {
  console.error('[rejudge-dryrun] fatal:', e)
  process.exit(1)
})
