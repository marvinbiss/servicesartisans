/**
 * Analyze judged_fail dimension distribution — decide whether to :
 *   - stop (<30 items left, not worth cost)
 *   - fix  (one dim fails >30% → likely validator bug)
 *   - opus (residue ≥30 items, distributed fails → throw Opus at it)
 *
 * Prints a single JSON line to stdout so a shell wrapper can parse it :
 *   {"count":N,"verdict":"stop|fix|opus","dominant":{"dim":"dim6_seo","pct":0.42}}
 */

import * as path from 'path'
import * as dotenv from 'dotenv'

dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

import { createAdminClient } from '@/lib/supabase/admin'

const DIMS = [
  'dim1_originality',
  'dim2_variability',
  'dim3_density',
  'dim4_eeat',
  'dim5_ymyl',
  'dim6_seo',
  'dim7_readability',
  'dim8_intent',
  'dim9_qrg',
] as const

type Dim = (typeof DIMS)[number]

const MIN_COUNT = 30
const DOMINANT_THRESHOLD = 0.3
const PASS_THRESHOLD = 7.0

async function main() {
  const supabase = createAdminClient()
  const totals = new Map<Dim, number>(DIMS.map((d) => [d, 0]))
  let total = 0
  const PAGE = 1000
  let cursor: string | null = null
  for (;;) {
    let q = supabase
      .from('provider_descriptions_draft')
      .select('provider_id, judge_breakdown')
      .eq('status', 'judged_fail')
      .order('provider_id', { ascending: true })
      .limit(PAGE)
    if (cursor !== null) q = q.gt('provider_id', cursor)
    const { data, error } = await q
    if (error) throw new Error(`query: ${error.message}`)
    const rows = data ?? []
    if (rows.length === 0) break
    for (const r of rows) {
      total++
      const bd = (r.judge_breakdown ?? {}) as Record<string, number>
      for (const d of DIMS) {
        const v = typeof bd[d] === 'number' ? bd[d] : null
        if (v !== null && v < PASS_THRESHOLD) {
          totals.set(d, (totals.get(d) ?? 0) + 1)
        }
      }
      cursor = r.provider_id as string
    }
    if (rows.length < PAGE) break
  }

  let dominantDim: Dim = DIMS[0]
  let dominantCount = 0
  for (const d of DIMS) {
    const c = totals.get(d) ?? 0
    if (c > dominantCount) {
      dominantCount = c
      dominantDim = d
    }
  }
  const dominantPct = total > 0 ? dominantCount / total : 0

  let verdict: 'stop' | 'fix' | 'opus'
  if (total < MIN_COUNT) verdict = 'stop'
  else if (dominantPct >= DOMINANT_THRESHOLD) verdict = 'fix'
  else verdict = 'opus'

  const breakdown: Record<string, number> = {}
  for (const d of DIMS) breakdown[d] = totals.get(d) ?? 0

  console.log(
    JSON.stringify({
      count: total,
      verdict,
      dominant: { dim: dominantDim, pct: Number(dominantPct.toFixed(3)) },
      breakdown,
    })
  )
}

main().catch((e) => {
  console.error('[analyze-fails] fatal:', e)
  process.exit(1)
})
