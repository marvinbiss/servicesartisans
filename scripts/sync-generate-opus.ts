/**
 * Synchronous Opus 4.7 generator — last-resort for hard cases that failed
 * Haiku sync AND Sonnet sync.
 *
 * Opus 4.7 specifics :
 *   - Does NOT accept `temperature` (deprecated) — must be omitted.
 *   - Pricing : $15/M input, $75/M output. ~$0.04/call observed.
 *   - Budget cap : caller sets `--budget-cap 10` to abort if total cost exceeds.
 *
 * Rate limit : Tier 1 Opus = 50 RPM, 20K input TPM, 4K output TPM. At 3.5s
 * spacing (~17 RPM) we stay under all caps.
 *
 * CLI :
 *   npx tsx scripts/sync-generate-opus.ts --budget-cap 10
 *   npx tsx scripts/sync-generate-opus.ts --limit 20
 */

import * as path from 'path'
import * as dotenv from 'dotenv'

dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import {
  PROMPT_VERSION,
  buildRgeDescriptionPrompt,
} from '@/lib/descriptions/prompts/rge-description-v1'
import { fetchProviderContextsBatch } from '@/lib/descriptions/retrieval'
import { RUBRIC_VERSION, validateDescription } from '@/lib/descriptions/validator'

const MODEL = 'claude-opus-4-7'
const MAX_TOKENS_OUTPUT = 600
const PACE_MS = 3500

const OPUS_INPUT_PRICE = 15.0 / 1_000_000
const OPUS_OUTPUT_PRICE = 75.0 / 1_000_000

type Args = { limit: number | null; budgetCap: number }

const parseArgs = (argv: string[]): Args => {
  const out: Args = { limit: null, budgetCap: 10 }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--limit') {
      out.limit = Number(argv[++i])
      if (!Number.isFinite(out.limit) || out.limit! <= 0) {
        throw new Error('--limit requires a positive integer')
      }
    } else if (a === '--budget-cap') {
      out.budgetCap = Number(argv[++i])
      if (!Number.isFinite(out.budgetCap) || out.budgetCap <= 0) {
        throw new Error('--budget-cap requires a positive number')
      }
    } else throw new Error(`Unknown flag: ${a}`)
  }
  return out
}

async function fetchFailedProviderIds(): Promise<string[]> {
  const supabase = createAdminClient()
  const out: string[] = []
  const PAGE = 1000
  let cursor: string | null = null
  for (;;) {
    let q = supabase
      .from('provider_descriptions_draft')
      .select('provider_id')
      .eq('status', 'judged_fail')
      .order('provider_id', { ascending: true })
      .limit(PAGE)
    if (cursor !== null) q = q.gt('provider_id', cursor)
    const { data, error } = await q
    if (error) throw new Error(`fetchFailedProviderIds: ${error.message}`)
    const rows = data ?? []
    if (rows.length === 0) break
    for (const r of rows) out.push(r.provider_id as string)
    cursor = rows[rows.length - 1].provider_id as string
    if (rows.length < PAGE) break
  }
  return out
}

const delay = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

type AnthropicMessageResponse = {
  content: Array<{ type: string; text?: string }>
  usage: { input_tokens: number; output_tokens: number }
  stop_reason?: string
  type?: string
  error?: { message?: string }
}

async function callAnthropic(
  apiKey: string,
  prompt: string
): Promise<{ text: string; tokensIn: number; tokensOut: number }> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: MAX_TOKENS_OUTPUT,
      messages: [{ role: 'user', content: prompt }],
    }),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`anthropic ${res.status}: ${body.slice(0, 200)}`)
  }
  const body = (await res.json()) as AnthropicMessageResponse
  if (body.type === 'error') {
    throw new Error(`anthropic error: ${body.error?.message ?? 'unknown'}`)
  }
  const text = body.content.find((c) => c.type === 'text')?.text?.trim() ?? ''
  return {
    text,
    tokensIn: body.usage.input_tokens,
    tokensOut: body.usage.output_tokens,
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY missing')

  console.log(
    `[sync-opus] model=${MODEL} prompt=${PROMPT_VERSION} rubric=${RUBRIC_VERSION} budgetCap=$${args.budgetCap}`
  )

  const ids = await fetchFailedProviderIds()
  const scope = args.limit ? ids.slice(0, args.limit) : ids
  console.log(`[sync-opus] judged_fail=${ids.length} scope=${scope.length}`)
  if (scope.length === 0) return

  console.log(`[sync-opus] prefetching ${scope.length} contexts...`)
  const contexts = await fetchProviderContextsBatch(scope)
  console.log(`[sync-opus] contexts=${contexts.size}`)

  const supabase = createAdminClient()
  let pass = 0
  let fail = 0
  let errored = 0
  let costTotal = 0
  const start = Date.now()

  for (let i = 0; i < scope.length; i++) {
    if (costTotal >= args.budgetCap) {
      console.log(
        `[sync-opus] BUDGET CAP HIT cost=$${costTotal.toFixed(3)} cap=$${args.budgetCap}, stopping at ${i}/${scope.length}`
      )
      break
    }
    const id = scope[i]
    const callStart = Date.now()
    try {
      const ctx = contexts.get(id)
      if (!ctx) {
        errored++
        continue
      }
      const prompt = buildRgeDescriptionPrompt(ctx)
      const { text, tokensIn, tokensOut } = await callAnthropic(apiKey, prompt)
      if (!text) {
        errored++
        continue
      }
      const score = validateDescription(text, ctx)
      const status: 'judged_pass' | 'judged_fail' =
        score.verdict === 'pass' ? 'judged_pass' : 'judged_fail'
      const cost = tokensIn * OPUS_INPUT_PRICE + tokensOut * OPUS_OUTPUT_PRICE
      costTotal += cost

      const wordCount = text.trim().split(/\s+/).length
      const { error } = await supabase.from('provider_descriptions_draft').upsert(
        {
          provider_id: id,
          draft_text: text,
          word_count: wordCount,
          prompt_version: PROMPT_VERSION,
          rubric_version: RUBRIC_VERSION,
          model_used: MODEL,
          tokens_input: tokensIn,
          tokens_output: tokensOut,
          cost_estimate_usd: cost,
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
          status,
          generated_at: new Date().toISOString(),
          judged_at: new Date().toISOString(),
        },
        { onConflict: 'provider_id' }
      )
      if (error) {
        logger.warn('[sync-opus] upsert failed', { id, error: error.message })
        errored++
        continue
      }
      if (status === 'judged_pass') pass++
      else fail++
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error(`  ERR ${id.slice(0, 8)}: ${msg}`)
      errored++
    }

    if ((i + 1) % 10 === 0) {
      const elapsed = ((Date.now() - start) / 1000).toFixed(0)
      console.log(
        `  [${i + 1}/${scope.length}] pass=${pass} fail=${fail} err=${errored} cost=$${costTotal.toFixed(3)} elapsed=${elapsed}s`
      )
    }

    const elapsedThisCall = Date.now() - callStart
    if (elapsedThisCall < PACE_MS) await delay(PACE_MS - elapsedThisCall)
  }

  const elapsed = ((Date.now() - start) / 1000).toFixed(1)
  console.log(
    `[sync-opus] done pass=${pass} fail=${fail} errored=${errored} cost=$${costTotal.toFixed(3)} elapsed=${elapsed}s`
  )
}

main().catch((e) => {
  console.error('[sync-opus] fatal:', e)
  process.exit(1)
})
