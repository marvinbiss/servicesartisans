/**
 * Publish pipeline — RGE provider descriptions v1.
 * -----------------------------------------------------------------------------
 * Picks up rows in `provider_descriptions_draft` with status='judged_pass',
 * copies `draft_text` → `providers.description`, bumps `providers.updated_at`
 * and sets the draft row to status='published'. IndexNow is pinged for the
 * 2–3 public URLs affected by each provider.
 *
 * Writes are transactional per provider (two updates in a single admin call
 * flow — if the draft flip fails after the provider update, the row stays in
 * judged_pass and is retried on the next run; published_at is the source of
 * truth for "already live").
 *
 * CLI:
 *   npx tsx scripts/publish-descriptions.ts --dry-run --limit 10
 *   npx tsx scripts/publish-descriptions.ts --limit 100
 *   npx tsx scripts/publish-descriptions.ts --min-score 8.0
 *   npx tsx scripts/publish-descriptions.ts --no-indexnow
 */

import * as path from 'path'
import * as dotenv from 'dotenv'

dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import { buildProviderUrls, type ProviderSeoRefreshEvent } from '@/lib/seo/provider-seo-refresh'
// NOTE: indexnow.ts reads INDEXNOW_API_KEY at module load. Static imports are
// hoisted above dotenv.config, so we lazy-load it after env is populated.
type IndexNowModule = typeof import('@/lib/seo/indexnow')
let indexnowMod: IndexNowModule | null = null
const getIndexNow = async (): Promise<IndexNowModule> => {
  if (!indexnowMod) indexnowMod = await import('@/lib/seo/indexnow')
  return indexnowMod
}

type CliArgs = {
  dryRun: boolean
  limit: number | null
  minScore: number
  indexnow: boolean
  concurrency: number
}

type DraftRow = {
  provider_id: string
  draft_text: string
  judge_score: number | null
}

type ProviderRow = {
  id: string
  slug: string | null
  stable_id: string | null
  specialty: string | null
  address_city: string | null
}

type Stats = {
  picked: number
  published: number
  skipped: number
  errors: number
  indexnowOk: number
  indexnowFail: number
  startedAt: number
}

const PASS_THRESHOLD = 7.5

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {
    dryRun: false,
    limit: null,
    minScore: PASS_THRESHOLD,
    indexnow: true,
    concurrency: 3,
  }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    switch (a) {
      case '--dry-run':
        args.dryRun = true
        break
      case '--no-indexnow':
        args.indexnow = false
        break
      case '--limit':
        args.limit = Number(argv[++i])
        if (!Number.isFinite(args.limit) || args.limit! <= 0) {
          throw new Error('--limit requires a positive integer')
        }
        break
      case '--min-score':
        args.minScore = Number(argv[++i])
        if (!Number.isFinite(args.minScore)) {
          throw new Error('--min-score requires a number')
        }
        break
      case '--concurrency':
        args.concurrency = Number(argv[++i])
        if (!Number.isFinite(args.concurrency) || args.concurrency <= 0) {
          throw new Error('--concurrency requires a positive integer')
        }
        break
      default:
        throw new Error(`Unknown flag: ${a}`)
    }
  }
  return args
}

async function fetchReadyDrafts(args: CliArgs): Promise<DraftRow[]> {
  const supabase = createAdminClient()
  let q = supabase
    .from('provider_descriptions_draft')
    .select('provider_id, draft_text, judge_score')
    .eq('status', 'judged_pass')
    .gte('judge_score', args.minScore)
    .order('judged_at', { ascending: true })

  if (args.limit !== null) {
    q = q.limit(args.limit)
  } else {
    q = q.limit(5000)
  }
  const { data, error } = await q
  if (error) throw new Error(`fetchReadyDrafts: ${error.message}`)
  return (data ?? []).filter((r): r is DraftRow => !!r.draft_text)
}

async function fetchProviderIndexForUrls(ids: string[]): Promise<Map<string, ProviderRow>> {
  const map = new Map<string, ProviderRow>()
  if (ids.length === 0) return map
  const supabase = createAdminClient()
  const PAGE = 200
  for (let i = 0; i < ids.length; i += PAGE) {
    const slice = ids.slice(i, i + PAGE)
    const { data, error } = await supabase
      .from('providers')
      .select('id, slug, stable_id, specialty, address_city')
      .in('id', slice)
    if (error) throw new Error(`fetchProviderIndex (offset ${i}): ${error.message}`)
    for (const row of data ?? []) {
      map.set(row.id as string, row as ProviderRow)
    }
  }
  return map
}

async function publishOne(
  draft: DraftRow,
  provider: ProviderRow | undefined,
  args: CliArgs,
  stats: Stats,
  collectUrl: (u: string) => void
): Promise<void> {
  const supabase = createAdminClient()

  if (args.dryRun) {
    stats.published++
    return
  }

  const { error: providerErr } = await supabase
    .from('providers')
    .update({
      description: draft.draft_text,
      updated_at: new Date().toISOString(),
    })
    .eq('id', draft.provider_id)

  if (providerErr) {
    stats.errors++
    throw new Error(`providers.update ${draft.provider_id}: ${providerErr.message}`)
  }

  const { error: draftErr } = await supabase
    .from('provider_descriptions_draft')
    .update({
      status: 'published',
      published_at: new Date().toISOString(),
    })
    .eq('provider_id', draft.provider_id)
    .eq('status', 'judged_pass') // don't clobber a concurrent regeneration

  if (draftErr) {
    // Provider was already updated; draft flip will be retried next run.
    logger.warn('[publish-descriptions] draft flip failed, will retry', {
      providerId: draft.provider_id,
      error: draftErr.message,
    })
    stats.errors++
    return
  }

  stats.published++

  if (args.indexnow && provider) {
    const event: ProviderSeoRefreshEvent = {
      reason: 'provider_activated',
      provider_id: draft.provider_id,
      specialty: provider.specialty,
      city: provider.address_city,
      slug: provider.slug,
      stable_id: provider.stable_id,
    }
    for (const u of buildProviderUrls(event)) collectUrl(u)
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
          try {
            await task(next)
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err)
            logger.error('[publish-descriptions] task failed', err as Error, { msg })
          }
        }
      })()
    )
  }
  await Promise.all(workers)
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2))
  console.log(`[publish-descriptions] config`, args)

  const drafts = await fetchReadyDrafts(args)
  console.log(`[publish-descriptions] ready drafts=${drafts.length}`)
  if (drafts.length === 0) return

  const providerIndex = args.indexnow
    ? await fetchProviderIndexForUrls(drafts.map((d) => d.provider_id))
    : new Map<string, ProviderRow>()

  const stats: Stats = {
    picked: drafts.length,
    published: 0,
    skipped: 0,
    errors: 0,
    indexnowOk: 0,
    indexnowFail: 0,
    startedAt: Date.now(),
  }

  // Collect all affected URLs and submit them in a single IndexNow call
  // (one big batch of up to 10 000 URLs, vs 60+ parallel small calls which
  // get rate-limited per-IP by the IndexNow endpoint).
  const indexnowUrls = new Set<string>()
  const collectUrl = (u: string): void => {
    indexnowUrls.add(u)
  }

  await runConcurrent(drafts, args.concurrency, async (draft) => {
    await publishOne(draft, providerIndex.get(draft.provider_id), args, stats, collectUrl)
  })

  if (args.indexnow && !args.dryRun && indexnowUrls.size > 0) {
    const urlList = Array.from(indexnowUrls)
    const { submitToIndexNow } = await getIndexNow()
    const res = await submitToIndexNow(urlList)
    if (res.success) {
      stats.indexnowOk = res.submitted
    } else {
      stats.indexnowFail = urlList.length
      logger.warn('[publish-descriptions] batched IndexNow push failed', {
        urls_count: urlList.length,
        error: res.error,
      })
    }
  }

  const elapsed = (Date.now() - stats.startedAt) / 1000
  console.log(
    `[publish-descriptions] done picked=${stats.picked} published=${stats.published} errors=${stats.errors} indexnow_ok=${stats.indexnowOk} indexnow_fail=${stats.indexnowFail} elapsed=${elapsed.toFixed(1)}s`
  )

  if (args.dryRun) {
    console.log('[publish-descriptions] DRY RUN — no writes performed.')
  }
}

main().catch((err) => {
  console.error('[publish-descriptions] fatal:', err)
  process.exit(1)
})
