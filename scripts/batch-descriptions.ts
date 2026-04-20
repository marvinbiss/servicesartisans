/**
 * RGE provider descriptions — Anthropic Message Batches runner.
 * -----------------------------------------------------------------------------
 * 50% discount vs live API, no rate-limit management, async processing.
 * Same prompt v1.0, same validator v1.1 as scripts/generate-rge-descriptions.ts.
 *
 * Lifecycle:
 *   submit  — query eligible queue, chunk into batches of 10 000, POST to
 *             /v1/messages/batches, persist batch_ids to .batches/index.json.
 *             Each provider_id becomes custom_id in the batch request, so
 *             there is no separate mapping table to maintain.
 *
 *   poll    — read pending batch_ids from index, GET status, when ended
 *             download the JSONL results, validate each description via
 *             scoreDescription(), upsert into provider_descriptions_draft.
 *
 *   list    — show status of every batch_id in the index.
 *
 *   regen   — resubmit currently judged_fail rows as a new batch (optional
 *             --model flag defaults to Sonnet 4.6 for quality rescue).
 *
 * CLI:
 *   npx tsx scripts/batch-descriptions.ts submit [--limit N] [--chunk 10000]
 *   npx tsx scripts/batch-descriptions.ts poll   [--once]
 *   npx tsx scripts/batch-descriptions.ts list
 *   npx tsx scripts/batch-descriptions.ts regen  [--model claude-sonnet-4-6]
 *
 * The API is GA. We use the standard endpoint and the published request/
 * response shape (custom_id + params: Messages params).
 *
 * Cost (Haiku 4.5 @ 50% batch discount, 1200 in / 450 out per provider):
 *   (1200 * 0.50 + 450 * 2.50) / 1_000_000 = $0.001725 per provider
 *   50 000 providers = ~$86
 */

import * as path from 'path'
import * as fs from 'fs'
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

type BatchEntry = {
  id: string
  model: string
  submitted_at: string
  request_count: number
  processing_status?: string
  ended_at?: string | null
  ingested_at?: string
  // Mode = 'fresh' for first-pass eligible queue, 'regen' for judged_fail rescue
  mode: 'fresh' | 'regen'
}

type BatchIndex = {
  batches: BatchEntry[]
}

const DEFAULT_MODEL = 'claude-haiku-4-5-20251001'
const REGEN_MODEL = 'claude-sonnet-4-5-20250929'
const MAX_TOKENS_OUTPUT = 800
const TEMPERATURE = 0.6
const MAX_REQUESTS_PER_BATCH = 10_000

const BATCHES_DIR = path.join(__dirname, '..', '.batches')
const INDEX_FILE = path.join(BATCHES_DIR, 'index.json')

// ---------------------------------------------------------------------------
// Helpers

const now = (): string => new Date().toISOString()

const loadIndex = (): BatchIndex => {
  if (!fs.existsSync(INDEX_FILE)) return { batches: [] }
  return JSON.parse(fs.readFileSync(INDEX_FILE, 'utf8')) as BatchIndex
}

const saveIndex = (idx: BatchIndex): void => {
  if (!fs.existsSync(BATCHES_DIR)) fs.mkdirSync(BATCHES_DIR, { recursive: true })
  fs.writeFileSync(INDEX_FILE, JSON.stringify(idx, null, 2))
}

const requireApiKey = (): string => {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) throw new Error('ANTHROPIC_API_KEY missing')
  return key
}

const costEstimate = (model: string, tokensIn: number, tokensOut: number): number => {
  // Batch API = 50% of live pricing
  if (model.startsWith('claude-haiku-4-5')) {
    return (tokensIn / 1_000_000) * 0.5 + (tokensOut / 1_000_000) * 2.5
  }
  if (model.startsWith('claude-sonnet-4-5') || model.startsWith('claude-sonnet-4-6')) {
    return (tokensIn / 1_000_000) * 1.5 + (tokensOut / 1_000_000) * 7.5
  }
  return 0
}

// ---------------------------------------------------------------------------
// Eligibility

async function fetchEligibleProviderIds(limit: number | null): Promise<string[]> {
  const supabase = createAdminClient()
  const today = new Date().toISOString().slice(0, 10)

  // Pull every eligible provider id, then exclude those already drafted.
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
    if (error) throw new Error(`fetchEligibleProviderIds: ${error.message}`)
    const rows = data ?? []
    if (rows.length === 0) break
    for (const r of rows) out.push(r.id as string)
    cursor = rows[rows.length - 1].id as string
    if (limit !== null && out.length >= limit) return out.slice(0, limit)
    if (rows.length < PAGE) break
  }
  return out
}

async function fetchSkipSet(
  statuses: DraftStatus[] = ['generating', 'judged_pass', 'judged_fail', 'published']
): Promise<Set<string>> {
  const supabase = createAdminClient()
  const skip = new Set<string>()
  const PAGE = 1000
  let cursor: string | null = null
  for (;;) {
    let q = supabase
      .from('provider_descriptions_draft')
      .select('provider_id')
      .in('status', statuses)
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

// ---------------------------------------------------------------------------
// Anthropic Batches API client

type BatchStatus = {
  id: string
  type: 'message_batch'
  processing_status: 'in_progress' | 'ended' | 'canceling'
  request_counts: {
    processing: number
    succeeded: number
    errored: number
    canceled: number
    expired: number
  }
  ended_at: string | null
  created_at: string
  expires_at: string
  results_url: string | null
}

async function submitBatch(
  apiKey: string,
  requests: Array<{
    custom_id: string
    params: {
      model: string
      max_tokens: number
      temperature: number
      messages: Array<{ role: 'user'; content: string }>
    }
  }>
): Promise<BatchStatus> {
  const body = JSON.stringify({ requests })
  const maxAttempts = 5
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const resp = await fetch('https://api.anthropic.com/v1/messages/batches', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body,
    })
    if (resp.ok) return (await resp.json()) as BatchStatus
    const text = await resp.text()
    const retriable =
      resp.status === 429 ||
      resp.status === 502 ||
      resp.status === 503 ||
      resp.status === 504 ||
      resp.status === 529
    if (!retriable || attempt === maxAttempts) {
      throw new Error(`submitBatch ${resp.status} (attempt ${attempt}): ${text.slice(0, 400)}`)
    }
    const backoff = Math.min(30_000, 2_000 * 2 ** (attempt - 1))
    console.log(
      `[batch submit] ${resp.status} transient, retry ${attempt}/${maxAttempts} in ${backoff}ms`
    )
    await new Promise((r) => setTimeout(r, backoff))
  }
  throw new Error('submitBatch: exhausted retries')
}

async function getBatch(apiKey: string, batchId: string): Promise<BatchStatus> {
  const resp = await fetch(`https://api.anthropic.com/v1/messages/batches/${batchId}`, {
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
  })
  if (!resp.ok) {
    const body = await resp.text()
    throw new Error(`getBatch ${resp.status}: ${body.slice(0, 300)}`)
  }
  return (await resp.json()) as BatchStatus
}

async function downloadResults(apiKey: string, resultsUrl: string): Promise<BatchResultLine[]> {
  const resp = await fetch(resultsUrl, {
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
  })
  if (!resp.ok) {
    const body = await resp.text()
    throw new Error(`downloadResults ${resp.status}: ${body.slice(0, 300)}`)
  }
  const text = await resp.text()
  return text
    .split('\n')
    .filter((l) => l.trim().length > 0)
    .map((l) => JSON.parse(l) as BatchResultLine)
}

type BatchResultLine = {
  custom_id: string
  result:
    | {
        type: 'succeeded'
        message: {
          content: Array<{ type: 'text'; text?: string }>
          usage: { input_tokens: number; output_tokens: number }
        }
      }
    | {
        type: 'errored' | 'canceled' | 'expired'
        error?: { type: string; message: string }
      }
}

// ---------------------------------------------------------------------------
// Submit command

async function buildBatchRequests(
  providerIds: string[],
  model: string
): Promise<
  Array<{
    custom_id: string
    params: {
      model: string
      max_tokens: number
      temperature: number
      messages: Array<{ role: 'user'; content: string }>
    }
  }>
> {
  const contexts = await fetchProviderContextsBatch(providerIds)
  const out: Array<{
    custom_id: string
    params: {
      model: string
      max_tokens: number
      temperature: number
      messages: Array<{ role: 'user'; content: string }>
    }
  }> = []
  for (const id of providerIds) {
    const ctx = contexts.get(id)
    if (!ctx) continue
    const prompt = buildRgeDescriptionPrompt(ctx)
    out.push({
      custom_id: id,
      params: {
        model,
        max_tokens: MAX_TOKENS_OUTPUT,
        temperature: TEMPERATURE,
        messages: [{ role: 'user', content: prompt }],
      },
    })
  }
  return out
}

async function markGenerating(providerIds: string[]): Promise<void> {
  if (providerIds.length === 0) return
  const supabase = createAdminClient()
  const rows = providerIds.map((id) => ({
    provider_id: id,
    status: 'generating' as DraftStatus,
    attempts: 0,
  }))
  const PAGE = 500
  for (let i = 0; i < rows.length; i += PAGE) {
    const slice = rows.slice(i, i + PAGE)
    const { error } = await supabase
      .from('provider_descriptions_draft')
      .upsert(slice, { onConflict: 'provider_id', ignoreDuplicates: false })
    if (error) logger.warn('[batch] markGenerating failed', { error: error.message })
  }
}

type SubmitArgs = {
  limit: number | null
  chunk: number
  model: string
  mode: 'fresh' | 'regen'
}

async function cmdSubmit(args: SubmitArgs): Promise<void> {
  const apiKey = requireApiKey()
  const idx = loadIndex()

  console.log(`[batch submit] mode=${args.mode} model=${args.model} chunk=${args.chunk}`)

  let queue: string[]
  if (args.mode === 'regen') {
    queue = await fetchFailedProviderIds()
    console.log(`[batch submit] regen queue=${queue.length}`)
  } else {
    const allIds = await fetchEligibleProviderIds(args.limit)
    const skip = await fetchSkipSet()
    queue = allIds.filter((id) => !skip.has(id))
    console.log(`[batch submit] eligible=${allIds.length} skip=${skip.size} queue=${queue.length}`)
  }
  if (args.limit !== null) queue = queue.slice(0, args.limit)
  if (queue.length === 0) {
    console.log('[batch submit] nothing to submit')
    return
  }

  for (let offset = 0; offset < queue.length; offset += args.chunk) {
    const slice = queue.slice(offset, offset + args.chunk)
    console.log(`[batch submit] building requests for ${slice.length} providers...`)
    const requests = await buildBatchRequests(slice, args.model)
    if (requests.length === 0) {
      console.log(`[batch submit] chunk ${offset} yielded 0 requests (contexts all null), skipping`)
      continue
    }

    console.log(`[batch submit] submitting ${requests.length} requests...`)
    const batch = await submitBatch(apiKey, requests)
    console.log(`[batch submit] batch_id=${batch.id} status=${batch.processing_status}`)

    await markGenerating(requests.map((r) => r.custom_id))

    idx.batches.push({
      id: batch.id,
      model: args.model,
      submitted_at: now(),
      request_count: requests.length,
      processing_status: batch.processing_status,
      ended_at: batch.ended_at,
      mode: args.mode,
    })
    saveIndex(idx)
  }

  console.log(`[batch submit] done. ${idx.batches.length} total batches in index.`)
}

// ---------------------------------------------------------------------------
// Poll + ingest command

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
      judge_model: null,
      status,
      rejection_reason: rejectionReason,
      hallucination_flags: hallucinationFlags,
      generated_at: now(),
      judged_at: now(),
    },
    { onConflict: 'provider_id', ignoreDuplicates: false }
  )
  if (error) throw new Error(`upsertResult ${params.providerId}: ${error.message}`)
}

async function ingestResults(
  apiKey: string,
  batch: BatchEntry,
  statusDoc: BatchStatus
): Promise<{
  pass: number
  fail: number
  errored: number
  tokensIn: number
  tokensOut: number
  costUsd: number
}> {
  if (!statusDoc.results_url) throw new Error(`batch ${batch.id}: no results_url`)
  const lines = await downloadResults(apiKey, statusDoc.results_url)
  console.log(`[batch poll]   ${batch.id}: downloaded ${lines.length} result lines`)

  const providerIds = lines.map((l) => l.custom_id)
  const contexts = await fetchProviderContextsBatch(providerIds)

  let pass = 0
  let fail = 0
  let errored = 0
  let tokensIn = 0
  let tokensOut = 0
  let costUsd = 0

  for (const line of lines) {
    if (line.result.type !== 'succeeded') {
      errored++
      logger.warn('[batch poll] request errored', {
        provider_id: line.custom_id,
        error: line.result.type === 'errored' ? line.result.error?.message : line.result.type,
      })
      continue
    }
    const ctx = contexts.get(line.custom_id)
    if (!ctx) {
      errored++
      continue
    }
    const text = line.result.message.content.find((c) => c.type === 'text')?.text?.trim() ?? ''
    if (!text) {
      errored++
      continue
    }
    const inTok = line.result.message.usage.input_tokens
    const outTok = line.result.message.usage.output_tokens
    const cost = costEstimate(batch.model, inTok, outTok)

    const score = validateDescription(text, ctx)
    await upsertResult({
      providerId: line.custom_id,
      text,
      tokensIn: inTok,
      tokensOut: outTok,
      costUsd: cost,
      model: batch.model,
      score,
    })

    tokensIn += inTok
    tokensOut += outTok
    costUsd += cost
    if (score.verdict === 'pass') pass++
    else fail++
  }

  return { pass, fail, errored, tokensIn, tokensOut, costUsd }
}

async function cmdPoll(once: boolean): Promise<void> {
  const apiKey = requireApiKey()
  for (;;) {
    const idx = loadIndex()
    const pending = idx.batches.filter((b) => !b.ingested_at)
    if (pending.length === 0) {
      console.log('[batch poll] no pending batches, done.')
      return
    }

    console.log(`[batch poll] ${pending.length} pending batches`)
    let anyEnded = false

    for (const b of pending) {
      try {
        const statusDoc = await getBatch(apiKey, b.id)
        b.processing_status = statusDoc.processing_status
        b.ended_at = statusDoc.ended_at

        console.log(
          `  ${b.id} [${statusDoc.processing_status}] processing=${statusDoc.request_counts.processing} done=${statusDoc.request_counts.succeeded} errored=${statusDoc.request_counts.errored}`
        )

        if (statusDoc.processing_status === 'ended' && statusDoc.results_url) {
          console.log(`[batch poll] ingesting ${b.id}...`)
          const result = await ingestResults(apiKey, b, statusDoc)
          console.log(
            `[batch poll] ${b.id} ingested: pass=${result.pass} fail=${result.fail} errored=${result.errored} cost=$${result.costUsd.toFixed(4)}`
          )
          b.ingested_at = now()
          anyEnded = true
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        logger.error(`[batch poll] ${b.id} failed`, err as Error, { msg })
      }
    }

    saveIndex(idx)

    if (once) return
    if (!anyEnded) {
      console.log('[batch poll] none ended, sleeping 60s...')
      await new Promise((r) => setTimeout(r, 60_000))
    }
  }
}

// ---------------------------------------------------------------------------
// List command

async function cmdList(): Promise<void> {
  const apiKey = requireApiKey()
  const idx = loadIndex()
  if (idx.batches.length === 0) {
    console.log('[batch list] empty index')
    return
  }
  console.log(`[batch list] ${idx.batches.length} batches:`)
  for (const b of idx.batches) {
    let live = b.processing_status ?? '?'
    let counts = ''
    if (!b.ingested_at) {
      try {
        const s = await getBatch(apiKey, b.id)
        live = s.processing_status
        counts = ` processing=${s.request_counts.processing} done=${s.request_counts.succeeded} err=${s.request_counts.errored}`
      } catch {
        // ignore
      }
    }
    const state = b.ingested_at ? 'INGESTED' : live.toUpperCase()
    console.log(
      `  ${b.id} [${state}] mode=${b.mode} model=${b.model} requests=${b.request_count} submitted=${b.submitted_at}${counts}`
    )
  }
}

// ---------------------------------------------------------------------------
// CLI

function parseFlags(argv: string[]): {
  limit: number | null
  chunk: number
  model?: string
  once: boolean
} {
  const out: { limit: number | null; chunk: number; model?: string; once: boolean } = {
    limit: null,
    chunk: MAX_REQUESTS_PER_BATCH,
    once: false,
  }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    switch (a) {
      case '--limit':
        out.limit = Number(argv[++i])
        if (!Number.isFinite(out.limit) || out.limit! <= 0) {
          throw new Error('--limit requires a positive integer')
        }
        break
      case '--chunk':
        out.chunk = Number(argv[++i])
        if (!Number.isFinite(out.chunk) || out.chunk <= 0 || out.chunk > MAX_REQUESTS_PER_BATCH) {
          throw new Error(`--chunk must be 1..${MAX_REQUESTS_PER_BATCH}`)
        }
        break
      case '--model':
        out.model = String(argv[++i])
        break
      case '--once':
        out.once = true
        break
      default:
        throw new Error(`Unknown flag: ${a}`)
    }
  }
  return out
}

async function main(): Promise<void> {
  const [, , cmd, ...rest] = process.argv
  if (!cmd) {
    console.error('Usage: batch-descriptions.ts <submit|poll|list|regen> [flags]')
    process.exit(1)
  }
  const flags = parseFlags(rest)

  switch (cmd) {
    case 'submit':
      await cmdSubmit({
        limit: flags.limit,
        chunk: flags.chunk,
        model: flags.model ?? DEFAULT_MODEL,
        mode: 'fresh',
      })
      break
    case 'regen':
      await cmdSubmit({
        limit: flags.limit,
        chunk: flags.chunk,
        model: flags.model ?? REGEN_MODEL,
        mode: 'regen',
      })
      break
    case 'poll':
      await cmdPoll(flags.once)
      break
    case 'list':
      await cmdList()
      break
    default:
      console.error(`Unknown command: ${cmd}`)
      process.exit(1)
  }
}

main().catch((err) => {
  console.error('[batch-descriptions] fatal:', err)
  process.exit(1)
})
