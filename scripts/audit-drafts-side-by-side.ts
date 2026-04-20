/**
 * Human-readable side-by-side audit of drafts across 3 cohorts :
 *   1. FLIP  — currently judged_fail, would pass with d2=7.5
 *   2. STUCK — currently judged_fail, would still fail with d2=7.5
 *   3. GOLD  — currently judged_pass (already live)
 *
 * Goal : before bumping rubric v1.2 → v1.3, confirm by eye that the FLIPs
 * are at least as good as the GOLDs and that the STUCKs really are weaker.
 * If a FLIP reads as slop, we kill the patch. If a STUCK reads fine, we
 * have a second scorer bug to hunt.
 *
 * CLI : npx tsx scripts/audit-drafts-side-by-side.ts --n 5
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
const D2_NEW = 7.5

type Args = { n: number }
const parseArgs = (argv: string[]): Args => {
  const out: Args = { n: 5 }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--n') {
      out.n = Number(argv[++i])
      if (!Number.isFinite(out.n) || out.n <= 0) throw new Error('--n > 0')
    } else throw new Error(`Unknown flag: ${a}`)
  }
  return out
}

const round1 = (x: number): number => Math.round(x * 10) / 10

function simulated(bd: Record<string, number>): number {
  let sum = 0
  for (const [dim, w] of Object.entries(WEIGHTS)) {
    const raw = dim === 'dim2_variability' ? D2_NEW : (bd[dim] ?? 0)
    sum += raw * w
  }
  return round1(sum / TOTAL_WEIGHT)
}

type Row = {
  provider_id: string
  draft_text: string
  status: string
  judge_score: number | null
  judge_breakdown: Record<string, number>
  model_used: string | null
  word_count: number | null
  hallucination_flags: Array<{ severity?: string; dimension?: string; message?: string }> | null
}

function render(label: string, r: Row): string {
  const sim = simulated(r.judge_breakdown)
  const bd = r.judge_breakdown
  const dims = [
    `d1:${bd.dim1_originality}`,
    `d2:${bd.dim2_variability}`,
    `d3:${bd.dim3_density}`,
    `d4:${bd.dim4_eeat}`,
    `d5:${bd.dim5_ymyl}`,
    `d6:${bd.dim6_seo}`,
    `d7:${bd.dim7_readability}`,
    `d8:${bd.dim8_intent}`,
    `d9:${bd.dim9_qrg}`,
  ].join(' ')
  const flagsStr = (r.hallucination_flags ?? [])
    .map((f) => `${f.severity}:${f.dimension}`)
    .join(', ')
  return [
    '='.repeat(80),
    `[${label}] ${r.provider_id.slice(0, 8)} model=${r.model_used}`,
    `current=${r.judge_score} simulated=${sim} words=${r.word_count} flags=[${flagsStr}]`,
    `dims: ${dims}`,
    '---',
    (r.draft_text ?? '').trim(),
    '',
  ].join('\n')
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const supabase = createAdminClient()

  const { data: fails, error: e1 } = await supabase
    .from('provider_descriptions_draft')
    .select(
      'provider_id, draft_text, status, judge_score, judge_breakdown, model_used, word_count, hallucination_flags'
    )
    .eq('status', 'judged_fail')
    .order('generated_at', { ascending: false })
    .limit(400)
  if (e1) throw new Error(`fails: ${e1.message}`)

  const { data: passes, error: e2 } = await supabase
    .from('provider_descriptions_draft')
    .select(
      'provider_id, draft_text, status, judge_score, judge_breakdown, model_used, word_count, hallucination_flags'
    )
    .eq('status', 'judged_pass')
    .order('generated_at', { ascending: false })
    .limit(args.n * 4)
  if (e2) throw new Error(`passes: ${e2.message}`)

  const flipRows: Row[] = []
  const stuckRows: Row[] = []
  for (const r of (fails ?? []) as Row[]) {
    if (!r.judge_breakdown) continue
    const sim = simulated(r.judge_breakdown)
    const ymyl = r.judge_breakdown.dim5_ymyl
    const blocking = (r.hallucination_flags ?? []).some((f) => f?.severity === 'block')
    if (!blocking && ymyl >= 8 && sim >= PASS_THRESHOLD) {
      if (flipRows.length < args.n) flipRows.push(r)
    } else if (stuckRows.length < args.n) {
      stuckRows.push(r)
    }
    if (flipRows.length >= args.n && stuckRows.length >= args.n) break
  }
  const goldRows = ((passes ?? []) as Row[]).slice(0, args.n)

  console.log(
    `[audit] cohort sizes — flip:${flipRows.length} stuck:${stuckRows.length} gold:${goldRows.length}`
  )
  for (const r of flipRows) console.log(render('FLIP (fail→pass)', r))
  for (const r of stuckRows) console.log(render('STUCK (still fail)', r))
  for (const r of goldRows) console.log(render('GOLD (live pass)', r))
}

main().catch((e) => {
  console.error('[audit] fatal:', e)
  process.exit(1)
})
