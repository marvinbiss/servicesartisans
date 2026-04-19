/**
 * One-shot IndexNow bootstrap for RGE-only URLs.
 *
 * Post-migration (noindex RGE-only + migration 457 RPC fix) the provider
 * sitemap shards expose ~50 347 indexable artisan pages. This script fetches
 * every shard via /api/sitemap-providers?id=N, extracts all <loc> URLs, and
 * submits them to IndexNow (Bing, Yandex, and other participating engines)
 * to short-circuit the default 7-14 day re-crawl window.
 *
 * Idempotent by design:
 *   - IndexNow accepts repeated submissions; already-indexed URLs are no-ops.
 *   - Using the sitemap as source of truth guarantees parity with what
 *     Googlebot sees — we never push a URL that Google wouldn't discover.
 *
 * Prerequisites:
 *   - INDEXNOW_API_KEY in .env.local (same secret as production)
 *   - Deploy containing the RPC fix must be live (expect ~16-17k URLs per
 *     shard, not ~998 — that's the regression signature).
 *
 * Usage:
 *   npx tsx scripts/indexnow-bootstrap-rge.ts [--dry-run]
 *
 *   --dry-run prints the URL count per shard without submitting.
 */
import * as path from 'path'
import * as dotenv from 'dotenv'
dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

const SITE_URL = 'https://servicesartisans.fr'
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/IndexNow'
const INDEXNOW_BATCH_SIZE = 10_000
const MAX_SHARDS = 20 // safety cap, after fix we expect ~3

const DRY_RUN = process.argv.includes('--dry-run')

async function fetchSitemapShard(shardId: number): Promise<string[] | null> {
  const url = `${SITE_URL}/api/sitemap-providers?id=${shardId}&bust=${Date.now()}`
  const res = await fetch(url, {
    headers: { 'User-Agent': 'indexnow-bootstrap-rge/1.0' },
  })
  if (!res.ok) return null
  const xml = await res.text()
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
  return urls.length > 0 ? urls : null
}

type BatchResult = { batch: number; status: number; ok: boolean; submitted: number }

async function submitBatch(key: string, urls: string[], batchIndex: number): Promise<BatchResult> {
  const res = await fetch(INDEXNOW_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: new URL(SITE_URL).hostname,
      key,
      keyLocation: `${SITE_URL}/${key}.txt`,
      urlList: urls,
    }),
  })
  const ok = res.ok || res.status === 202
  return { batch: batchIndex, status: res.status, ok, submitted: ok ? urls.length : 0 }
}

async function main() {
  console.log('=== IndexNow bootstrap RGE ===')
  console.log(`Mode: ${DRY_RUN ? 'DRY-RUN (no submit)' : 'LIVE SUBMIT'}`)
  console.log(`Site: ${SITE_URL}`)
  console.log('')

  const key = process.env.INDEXNOW_API_KEY
  if (!key && !DRY_RUN) {
    console.error('ERROR: INDEXNOW_API_KEY missing from .env.local')
    process.exit(1)
  }

  console.log('Phase 1 — fetching sitemap shards…')
  const allUrls: string[] = []
  for (let shard = 0; shard < MAX_SHARDS; shard++) {
    const urls = await fetchSitemapShard(shard)
    if (!urls) {
      console.log(`  shard ${shard}: empty → stop`)
      break
    }
    console.log(`  shard ${shard}: ${urls.length} URLs`)
    allUrls.push(...urls)
  }

  const dedup = Array.from(new Set(allUrls))
  console.log(`\nTotal collected : ${allUrls.length}`)
  console.log(`After dedup     : ${dedup.length}`)

  if (dedup.length === 0) {
    console.error('\nERROR: no URLs found — check the sitemap deploy first.')
    process.exit(2)
  }

  // Sanity check: less than expected = probable max_rows regression
  if (dedup.length < 10_000) {
    console.warn(
      `\nWARNING: ${dedup.length} URLs collected. Expected ~50k after RGE-only migration.`
    )
    console.warn('Regression signature of db-max-rows=1000 vs 50000, or deploy stale.')
  }

  if (DRY_RUN) {
    console.log('\n[dry-run] no submission, exiting.')
    return
  }

  console.log(`\nPhase 2 — submitting in batches of ${INDEXNOW_BATCH_SIZE}…`)
  const t0 = Date.now()
  const results: BatchResult[] = []

  for (let i = 0; i < dedup.length; i += INDEXNOW_BATCH_SIZE) {
    const batch = dedup.slice(i, i + INDEXNOW_BATCH_SIZE)
    const batchIndex = Math.floor(i / INDEXNOW_BATCH_SIZE)
    const bt0 = Date.now()
    const r = await submitBatch(key!, batch, batchIndex)
    const elapsed = Date.now() - bt0
    console.log(
      `  batch ${r.batch} (${batch.length} URLs): HTTP ${r.status} ${r.ok ? 'OK' : 'FAIL'} in ${elapsed}ms`
    )
    results.push(r)
  }

  const totalSubmitted = results.reduce((sum, r) => sum + r.submitted, 0)
  const allOk = results.every((r) => r.ok)
  const totalSec = ((Date.now() - t0) / 1000).toFixed(1)

  console.log(`\n--- Result ---`)
  console.log(`  Submitted: ${totalSubmitted}/${dedup.length}`)
  console.log(`  Status   : ${allOk ? 'ALL OK' : 'PARTIAL'}`)
  console.log(`  Elapsed  : ${totalSec}s`)

  if (!allOk) process.exit(3)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
