/**
 * Batch runner — RGE provider descriptions (pipeline v1).
 * -----------------------------------------------------------------------------
 * For every RGE-active provider (50 332 target), generates a YMYL-safe
 * 250-350 word French description via Haiku 4.5, runs the L1 validator,
 * and upserts the result into `provider_descriptions_draft`.
 *
 * Pipeline v1 layers:
 *   L1 (here)   : algorithmic validator — 9-dim rubric, PASS_THRESHOLD = 7.5
 *   L2 (later)  : Opus-as-judge — only for zone grise (this script flags them)
 *   L3 (later)  : GPT-5 skill cross-check — 5% sample + 100% flagged
 *
 * CLI:
 *   npx tsx scripts/generate-rge-descriptions.ts --dry-run --limit 5
 *   npx tsx scripts/generate-rge-descriptions.ts --limit 100
 *   npx tsx scripts/generate-rge-descriptions.ts --resume
 *   npx tsx scripts/generate-rge-descriptions.ts --batch-size 10 --concurrency 5
 *
 * Flags:
 *   --dry-run            build context + prompt, skip LLM call. No DB write.
 *   --resume             skip providers already in status 'judged_pass' | 'published'.
 *   --limit N            cap total providers processed (test / calibration).
 *   --batch-size N       page size for provider fetch (default 50).
 *   --concurrency N      parallel LLM calls per batch (default 5, Haiku RL: 2000 RPM).
 *   --retry-failed       also reprocess judged_fail rows (default: skip).
 *   --model ID           override model (default: claude-haiku-4-5-20251001).
 *   --verbose            log per-provider context + score.
 *
 * Env:
 *   ANTHROPIC_API_KEY    required (unless --dry-run).
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY  required.
 *
 * Cost estimate (50 332 providers, Haiku 4.5):
 *   input ~1200 tok × $1/MTok   = $0.0012/provider
 *   output ~450 tok × $5/MTok   = $0.00225/provider
 *   total ~$0.0035/provider     = ~$176 full batch (15% rescue → ~€180 total)
 */

import * as path from 'path'
import * as dotenv from 'dotenv'

dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import {
  PROMPT_VERSION,
  buildRgeDescriptionPrompt,
  type ProviderContext,
} from '@/lib/descriptions/prompts/rge-description-v1'
import { fetchProviderContextsBatch } from '@/lib/descriptions/retrieval'
import {
  RUBRIC_VERSION,
  validateDescription,
  type DescriptionScore,
} from '@/lib/descriptions/validator'

type DraftStatus =
  | 'pending'
  | 'generating'
  | 'judged_pass'
  | 'judged_fail'
  | 'published'
  | 'archived'

type CliArgs = {
  dryRun: boolean
  resume: boolean
  limit: number | null
  batchSize: number
  concurrency: number
  retryFailed: boolean
  model: string
  verbose: boolean
}

type RunStats = {
  total: number
  processed: number
  pass: number
  fail: number
  skipped: number
  errors: number
  tokensIn: number
  tokensOut: number
  costUsd: number
  startedAt: number
}

type GenerationResult = {
  providerId: string
  text: string
  tokensIn: number
  tokensOut: number
  costUsd: number
  model: string
}

const DEFAULT_MODEL = 'claude-haiku-4-5-20251001'
const MAX_TOKENS_OUTPUT = 800 // 350 words * ~1.6 tok/word + safety margin
const TEMPERATURE = 0.6
const API_TIMEOUT_MS = 45_000
const BASE_BACKOFF_MS = 1500
const MAX_RETRIES = 5

const HAIKU_PRICE_INPUT_PER_MTOK = 1.0
const HAIKU_PRICE_OUTPUT_PER_MTOK = 5.0

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {
    dryRun: false,
    resume: false,
    limit: null,
    batchSize: 50,
    concurrency: 5,
    retryFailed: false,
    model: DEFAULT_MODEL,
    verbose: false,
  }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    switch (a) {
      case '--dry-run':
        args.dryRun = true
        break
      case '--resume':
        args.resume = true
        break
      case '--retry-failed':
        args.retryFailed = true
        break
      case '--verbose':
        args.verbose = true
        break
      case '--limit':
        args.limit = Number(argv[++i])
        if (!Number.isFinite(args.limit) || args.limit! <= 0) {
          throw new Error('--limit requires a positive integer')
        }
        break
      case '--batch-size':
        args.batchSize = Number(argv[++i])
        if (!Number.isFinite(args.batchSize) || args.batchSize <= 0) {
          throw new Error('--batch-size requires a positive integer')
        }
        break
      case '--concurrency':
        args.concurrency = Number(argv[++i])
        if (!Number.isFinite(args.concurrency) || args.concurrency <= 0) {
          throw new Error('--concurrency requires a positive integer')
        }
        break
      case '--model':
        args.model = String(argv[++i])
        break
      default:
        throw new Error(`Unknown flag: ${a}`)
    }
  }
  return args
}

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

const now = (): string => new Date().toISOString()

function priceUsd(model: string, tokensIn: number, tokensOut: number): number {
  // Only Haiku 4.5 pricing baked in. For other models, extend this table.
  if (model.startsWith('claude-haiku-4-5')) {
    return (
      (tokensIn / 1_000_000) * HAIKU_PRICE_INPUT_PER_MTOK +
      (tokensOut / 1_000_000) * HAIKU_PRICE_OUTPUT_PER_MTOK
    )
  }
  // Sonnet 4.6 rescue fallback estimate: $3/$15
  if (model.startsWith('claude-sonnet-4-6')) {
    return (tokensIn / 1_000_000) * 3 + (tokensOut / 1_000_000) * 15
  }
  return 0
}

function isRetriable(status: number): boolean {
  return status === 429 || status === 500 || status === 502 || status === 503 || status === 504
}

async function callAnthropic(
  apiKey: string,
  model: string,
  prompt: string
): Promise<GenerationResult> {
  let attempt = 0
  let lastError: unknown = null
  while (attempt < MAX_RETRIES) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), API_TIMEOUT_MS)
    try {
      const resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model,
          max_tokens: MAX_TOKENS_OUTPUT,
          temperature: TEMPERATURE,
          messages: [{ role: 'user', content: prompt }],
        }),
        signal: controller.signal,
      })

      if (!resp.ok) {
        const body = await resp.text()
        if (isRetriable(resp.status) && attempt + 1 < MAX_RETRIES) {
          const backoff = BASE_BACKOFF_MS * Math.pow(2, attempt)
          logger.warn(
            `[descriptions] Anthropic ${resp.status}, retry in ${backoff}ms (attempt ${attempt + 1}/${MAX_RETRIES})`
          )
          await sleep(backoff)
          attempt++
          continue
        }
        throw new Error(`Anthropic API ${resp.status}: ${body.slice(0, 300)}`)
      }

      const data = (await resp.json()) as {
        content?: Array<{ text?: string }>
        usage?: { input_tokens?: number; output_tokens?: number }
      }
      const text = (data.content?.[0]?.text ?? '').trim()
      const tokensIn = data.usage?.input_tokens ?? 0
      const tokensOut = data.usage?.output_tokens ?? 0

      return {
        providerId: '',
        text,
        tokensIn,
        tokensOut,
        costUsd: priceUsd(model, tokensIn, tokensOut),
        model,
      }
    } catch (err) {
      lastError = err
      const msg = err instanceof Error ? err.message : String(err)
      if (attempt + 1 >= MAX_RETRIES) {
        throw new Error(`Anthropic call failed after ${MAX_RETRIES} attempts: ${msg}`)
      }
      const backoff = BASE_BACKOFF_MS * Math.pow(2, attempt)
      logger.warn(
        `[descriptions] fetch error, retry in ${backoff}ms (attempt ${attempt + 1}/${MAX_RETRIES}): ${msg}`
      )
      await sleep(backoff)
      attempt++
    } finally {
      clearTimeout(timer)
    }
  }
  throw lastError instanceof Error ? lastError : new Error('Unknown Anthropic failure')
}

async function fetchEligibleProviderIds(args: CliArgs): Promise<string[]> {
  const supabase = createAdminClient()
  const today = new Date().toISOString().slice(0, 10)

  // Paginate through eligible rows via id ASC keyset (avoids 1000-row PostgREST cap).
  const PAGE = 1000
  const out: string[] = []
  let cursor: string | null = null

  for (;;) {
    let q = supabase
      .from('providers')
      .select('id')
      .eq('is_active', true)
      .gt('rge_valid_until', today)
      .order('id', { ascending: true })
      .limit(PAGE)
    if (cursor !== null) q = q.gt('id', cursor)

    const { data, error } = await q
    if (error) {
      throw new Error(`fetchEligibleProviderIds: ${error.message}`)
    }
    const rows = data ?? []
    if (rows.length === 0) break
    for (const r of rows) out.push(r.id as string)
    cursor = rows[rows.length - 1].id as string
    if (args.limit !== null && out.length >= args.limit) {
      return out.slice(0, args.limit)
    }
    if (rows.length < PAGE) break
  }
  return out
}

async function fetchSkipSet(args: CliArgs): Promise<Set<string>> {
  const skip = new Set<string>()
  if (!args.resume) return skip
  const supabase = createAdminClient()
  const skipStatus: DraftStatus[] = args.retryFailed
    ? ['judged_pass', 'published']
    : ['judged_pass', 'published', 'judged_fail']

  // Paginate skip set (could be 50K rows).
  const PAGE = 1000
  let cursor: string | null = null
  for (;;) {
    let q = supabase
      .from('provider_descriptions_draft')
      .select('provider_id')
      .in('status', skipStatus)
      .order('provider_id', { ascending: true })
      .limit(PAGE)
    if (cursor !== null) q = q.gt('provider_id', cursor)
    const { data, error } = await q
    if (error) throw new Error(`fetchSkipSet: ${error.message}`)
    const rows = data ?? []
    if (rows.length === 0) break
    for (const r of rows) skip.add(r.provider_id as string)
    cursor = rows[rows.length - 1].provider_id as string
    if (rows.length < PAGE) break
  }
  return skip
}

async function markGenerating(providerIds: string[]): Promise<void> {
  if (providerIds.length === 0) return
  const supabase = createAdminClient()
  const rows = providerIds.map((id) => ({
    provider_id: id,
    status: 'generating' as DraftStatus,
    attempts: 0,
  }))
  const { error } = await supabase
    .from('provider_descriptions_draft')
    .upsert(rows, { onConflict: 'provider_id', ignoreDuplicates: false })
  if (error) {
    logger.warn('[descriptions] markGenerating failed', { error: error.message })
  }
}

async function upsertResult(params: {
  providerId: string
  text: string
  tokensIn: number
  tokensOut: number
  costUsd: number
  model: string
  score: DescriptionScore
}): Promise<void> {
  const supabase = createAdminClient()
  const { score } = params
  const wordCount = params.text.trim().length > 0 ? params.text.trim().split(/\s+/).length : 0

  // judge_score stored as NUMERIC(4,2). judge_breakdown as JSONB with the 9 dims.
  const breakdown = {
    dim1_originality: score.dim1_originality,
    dim2_variability: score.dim2_variability,
    dim3_density: score.dim3_density,
    dim4_eeat: score.dim4_eeat,
    dim5_ymyl: score.dim5_ymyl,
    dim6_seo: score.dim6_seo,
    dim7_readability: score.dim7_readability,
    dim8_intent: score.dim8_intent,
    dim9_qrg: score.dim9_qrg,
  }

  const status: DraftStatus = score.verdict === 'pass' ? 'judged_pass' : 'judged_fail'
  const rejectionReason =
    score.verdict === 'fail'
      ? score.flags
          .filter((f) => f.severity === 'block' || f.severity === 'warn')
          .map((f) => `${f.dimension}:${f.message}`)
          .join(' | ')
          .slice(0, 1000) || `overall=${score.overall} < 7.5`
      : null

  const hallucinationFlags = score.flags
    .filter((f) => f.severity === 'block')
    .map((f) => ({ dimension: f.dimension, message: f.message }))

  const { error } = await supabase.from('provider_descriptions_draft').upsert(
    {
      provider_id: params.providerId,
      draft_text: params.text,
      word_count: wordCount,
      prompt_version: PROMPT_VERSION,
      rubric_version: RUBRIC_VERSION,
      model_used: params.model,
      tokens_input: params.tokensIn,
      tokens_output: params.tokensOut,
      cost_estimate_usd: Number(params.costUsd.toFixed(6)),
      judge_score: score.overall,
      judge_breakdown: breakdown,
      judge_model: null, // L2 Opus judge runs in a separate pass.
      status,
      rejection_reason: rejectionReason,
      hallucination_flags: hallucinationFlags,
      // attempts is incremented by caller when regenerating; first run leaves 0.
      generated_at: now(),
      judged_at: now(),
    },
    { onConflict: 'provider_id', ignoreDuplicates: false }
  )

  if (error) {
    throw new Error(`upsertResult ${params.providerId}: ${error.message}`)
  }
}

async function processOne(
  apiKey: string | null,
  ctx: ProviderContext,
  providerId: string,
  args: CliArgs,
  stats: RunStats
): Promise<void> {
  const prompt = buildRgeDescriptionPrompt(ctx)

  if (args.dryRun) {
    if (args.verbose) {
      console.log(`\n--- DRY RUN ${providerId} / ${ctx.name} (${ctx.address_city}) ---`)
      console.log(
        `region=${ctx.address_region} · specialty=${ctx.specialty} · quals=${ctx.rge_qualifications.length} · cats=${ctx.ademe_categories.length}`
      )
      const ctxStart = prompt.indexOf('# Provider context')
      if (ctxStart >= 0) console.log(prompt.slice(ctxStart, ctxStart + 800))
    }
    stats.processed++
    return
  }

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY required (or use --dry-run)')
  }

  const gen = await callAnthropic(apiKey, args.model, prompt)
  if (!gen.text) {
    throw new Error('Empty response from Anthropic')
  }
  const score = validateDescription(gen.text, ctx)

  await upsertResult({
    providerId,
    text: gen.text,
    tokensIn: gen.tokensIn,
    tokensOut: gen.tokensOut,
    costUsd: gen.costUsd,
    model: gen.model,
    score,
  })

  stats.processed++
  stats.tokensIn += gen.tokensIn
  stats.tokensOut += gen.tokensOut
  stats.costUsd += gen.costUsd
  if (score.verdict === 'pass') stats.pass++
  else stats.fail++

  if (args.verbose) {
    console.log(
      `[${stats.processed}/${stats.total}] ${score.verdict.toUpperCase()} ${score.overall.toFixed(1)} ${providerId} ${ctx.name}`
    )
  }
}

async function runConcurrent<T>(
  items: T[],
  concurrency: number,
  task: (item: T) => Promise<void>
): Promise<void> {
  const queue = [...items]
  const workers: Promise<void>[] = []
  for (let i = 0; i < Math.min(concurrency, queue.length); i++) {
    workers.push(
      (async () => {
        while (queue.length > 0) {
          const next = queue.shift()
          if (next === undefined) return
          await task(next)
        }
      })()
    )
  }
  await Promise.all(workers)
}

function printStats(stats: RunStats, label: string): void {
  const elapsed = (Date.now() - stats.startedAt) / 1000
  const rps = elapsed > 0 ? stats.processed / elapsed : 0
  console.log(
    `\n[${label}] processed=${stats.processed}/${stats.total} pass=${stats.pass} fail=${stats.fail} skipped=${stats.skipped} errors=${stats.errors}`
  )
  console.log(
    `[${label}] tokens_in=${stats.tokensIn} tokens_out=${stats.tokensOut} cost=$${stats.costUsd.toFixed(4)} elapsed=${elapsed.toFixed(1)}s rps=${rps.toFixed(2)}`
  )
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2))
  console.log(`[descriptions] config`, {
    dryRun: args.dryRun,
    resume: args.resume,
    limit: args.limit,
    batchSize: args.batchSize,
    concurrency: args.concurrency,
    model: args.model,
  })

  const apiKey = process.env.ANTHROPIC_API_KEY ?? null
  if (!args.dryRun && !apiKey) {
    console.error('ERROR: ANTHROPIC_API_KEY is required (set in .env.local) or use --dry-run')
    process.exit(1)
  }

  console.log(`[descriptions] fetching eligible providers...`)
  const allIds = await fetchEligibleProviderIds(args)
  console.log(`[descriptions] eligible=${allIds.length}`)

  const skip = await fetchSkipSet(args)
  if (skip.size > 0) console.log(`[descriptions] skipping ${skip.size} already processed`)

  const targetIds = allIds.filter((id) => !skip.has(id))
  console.log(`[descriptions] queue=${targetIds.length}`)

  const stats: RunStats = {
    total: targetIds.length,
    processed: 0,
    pass: 0,
    fail: 0,
    skipped: skip.size,
    errors: 0,
    tokensIn: 0,
    tokensOut: 0,
    costUsd: 0,
    startedAt: Date.now(),
  }

  // Batch loop: fetch ProviderContext by batch, then generate concurrently.
  for (let offset = 0; offset < targetIds.length; offset += args.batchSize) {
    const slice = targetIds.slice(offset, offset + args.batchSize)
    const contextMap = await fetchProviderContextsBatch(slice)

    if (!args.dryRun) {
      await markGenerating(slice.filter((id) => contextMap.has(id)))
    }

    const units = slice
      .map((id) => ({ id, ctx: contextMap.get(id) }))
      .filter((u): u is { id: string; ctx: ProviderContext } => Boolean(u.ctx))

    await runConcurrent(units, args.concurrency, async (u) => {
      try {
        await processOne(apiKey, u.ctx, u.id, args, stats)
      } catch (err) {
        stats.errors++
        const msg = err instanceof Error ? err.message : String(err)
        logger.error(`[descriptions] provider ${u.id} failed`, err as Error, { msg })
      }
    })

    if (offset % (args.batchSize * 5) === 0 && offset > 0) {
      printStats(stats, 'progress')
    }
  }

  printStats(stats, 'final')

  if (args.dryRun) {
    console.log(`\n[descriptions] DRY RUN complete. No DB writes.`)
  } else {
    console.log(
      `\n[descriptions] Batch complete. Publish pipeline: use scripts/publish-descriptions.ts (pending).`
    )
  }
}

main().catch((err) => {
  console.error('[descriptions] fatal:', err)
  process.exit(1)
})
