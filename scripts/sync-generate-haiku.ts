/**
 * Synchronous Haiku 4.5 generator — fallback when Anthropic Batches stalls.
 *
 * Replicates the batch runner pipeline (fetch context → build prompt v1.1 →
 * call Anthropic /v1/messages → validate → upsert provider_descriptions_draft)
 * but in serial against the live API. No batch discount, but no queue stall.
 *
 * Rate limit : Tier 1 binding constraints per memory note
 * (servicesartisans-anthropic-tier1-limits) — 50 RPM + 10K output TPM, max
 * safe sustained throughput at concurrency=1, ~18 RPM. We pace at 3.5s
 * between calls.
 *
 * CLI :
 *   npx tsx scripts/sync-generate-haiku.ts --limit 5
 *   npx tsx scripts/sync-generate-haiku.ts            # all judged_fail
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

const MODEL = 'claude-haiku-4-5-20251001'
const MAX_TOKENS_OUTPUT = 600
const TEMPERATURE = 0.6
const PACE_MS = 3500 // 60_000 / 17 ≈ 3.5s/call → ~17 RPM (under 18 binding cap)

type Args = { limit: number | null }

const parseArgs = (argv: string[]): Args => {
  const out: Args = { limit: null }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--limit') {
      out.limit = Number(argv[++i])
      if (!Number.isFinite(out.limit) || out.limit! <= 0) {
        throw new Error('--limit requires a positive integer')
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

const HAIKU_INPUT_PRICE = 1.0 / 1_000_000 // $1 / M tokens (live, not batch)
const HAIKU_OUTPUT_PRICE = 5.0 / 1_000_000 // $5 / M tokens

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
      temperature: TEMPERATURE,
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

  console.log(`[sync-haiku] model=${MODEL} prompt=${PROMPT_VERSION} rubric=${RUBRIC_VERSION}`)

  const ids = await fetchFailedProviderIds()
  const scope = args.limit ? ids.slice(0, args.limit) : ids
  console.log(`[sync-haiku] judged_fail=${ids.length} scope=${scope.length}`)
  if (scope.length === 0) return

  // Pre-fetch all contexts in one batch (uses INSEE join under the hood).
  console.log(`[sync-haiku] prefetching ${scope.length} contexts...`)
  const contexts = await fetchProviderContextsBatch(scope)
  console.log(`[sync-haiku] contexts=${contexts.size}`)

  const supabase = createAdminClient()
  let pass = 0
  let fail = 0
  let errored = 0
  let costTotal = 0
  const start = Date.now()

  for (let i = 0; i < scope.length; i++) {
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
      const cost = tokensIn * HAIKU_INPUT_PRICE + tokensOut * HAIKU_OUTPUT_PRICE
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
        logger.warn('[sync-haiku] upsert failed', { id, error: error.message })
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

    if ((i + 1) % 20 === 0) {
      const elapsed = ((Date.now() - start) / 1000).toFixed(0)
      console.log(
        `  [${i + 1}/${scope.length}] pass=${pass} fail=${fail} err=${errored} cost=$${costTotal.toFixed(3)} elapsed=${elapsed}s`
      )
    }

    // Rate budget : keep 3.5s spacing between API calls (subtract API latency).
    const elapsedThisCall = Date.now() - callStart
    if (elapsedThisCall < PACE_MS) await delay(PACE_MS - elapsedThisCall)
  }

  const elapsed = ((Date.now() - start) / 1000).toFixed(1)
  console.log(
    `[sync-haiku] done pass=${pass} fail=${fail} errored=${errored} cost=$${costTotal.toFixed(3)} elapsed=${elapsed}s`
  )
}

main().catch((e) => {
  console.error('[sync-haiku] fatal:', e)
  process.exit(1)
})
