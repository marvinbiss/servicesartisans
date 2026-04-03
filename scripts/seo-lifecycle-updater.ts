/**
 * SEO Page Lifecycle Updater
 *
 * Reads googlebot_logs and gsc_daily_metrics to build the full lifecycle
 * of each page: first_crawled → first_indexed → first_click,
 * plus rolling 7-day averages.
 *
 * Upserts results into seo_page_lifecycle table.
 *
 * Usage:
 *   npx tsx scripts/seo-lifecycle-updater.ts
 *
 * Environment variables:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// ── Config ──────────────────────────────────────────────────────────────────

const UPSERT_BATCH_SIZE = 500

// ── Types ───────────────────────────────────────────────────────────────────

interface LifecycleRow {
  page_path: string
  first_crawled_at: string | null
  first_indexed_at: string | null
  first_click_at: string | null
  avg_position_7d: number | null
  impressions_7d: number
  clicks_7d: number
  crawl_frequency_7d: number
  updated_at: string
}

interface UpdateResult {
  totalPages: number
  upserted: number
  errors: number
  durationMs: number
}

// ── Supabase Client ─────────────────────────────────────────────────────────

function createSupabaseAdmin(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('Supabase env vars missing: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

// ── Data fetching ───────────────────────────────────────────────────────────

/**
 * Get first crawled date per page from googlebot_logs.
 */
async function getFirstCrawledDates(
  supabase: SupabaseClient
): Promise<Map<string, string>> {
  const results = new Map<string, string>()

  // Fetch all distinct URLs with their min created_at
  // We paginate to avoid hitting limits
  let offset = 0
  const batchSize = 5000

  while (true) {
    const { data, error } = await supabase
      .from('googlebot_logs')
      .select('url, created_at')
      .order('created_at', { ascending: true })
      .range(offset, offset + batchSize - 1)

    if (error) {
      console.error('Error fetching googlebot_logs:', error.message)
      break
    }

    if (!data || data.length === 0) break

    for (const row of data) {
      // Extract path from URL
      let path: string
      try {
        path = new URL(row.url).pathname
      } catch {
        path = row.url
      }

      // Keep the earliest date
      if (!results.has(path) || row.created_at < results.get(path)!) {
        results.set(path, row.created_at)
      }
    }

    if (data.length < batchSize) break
    offset += batchSize
  }

  console.log(`  Found first_crawled_at for ${results.size} pages`)
  return results
}

/**
 * Get first impression date (proxy for first_indexed_at) per page from gsc_daily_metrics.
 */
async function getFirstIndexedDates(
  supabase: SupabaseClient
): Promise<Map<string, string>> {
  const results = new Map<string, string>()

  let offset = 0
  const batchSize = 5000

  while (true) {
    const { data, error } = await supabase
      .from('gsc_daily_metrics')
      .select('page_path, date')
      .gt('impressions', 0)
      .order('date', { ascending: true })
      .range(offset, offset + batchSize - 1)

    if (error) {
      console.error('Error fetching gsc_daily_metrics for first_indexed:', error.message)
      break
    }

    if (!data || data.length === 0) break

    for (const row of data) {
      if (!results.has(row.page_path) || row.date < results.get(row.page_path)!) {
        results.set(row.page_path, row.date)
      }
    }

    if (data.length < batchSize) break
    offset += batchSize
  }

  console.log(`  Found first_indexed_at for ${results.size} pages`)
  return results
}

/**
 * Get first click date per page from gsc_daily_metrics.
 */
async function getFirstClickDates(
  supabase: SupabaseClient
): Promise<Map<string, string>> {
  const results = new Map<string, string>()

  let offset = 0
  const batchSize = 5000

  while (true) {
    const { data, error } = await supabase
      .from('gsc_daily_metrics')
      .select('page_path, date')
      .gt('clicks', 0)
      .order('date', { ascending: true })
      .range(offset, offset + batchSize - 1)

    if (error) {
      console.error('Error fetching gsc_daily_metrics for first_click:', error.message)
      break
    }

    if (!data || data.length === 0) break

    for (const row of data) {
      if (!results.has(row.page_path) || row.date < results.get(row.page_path)!) {
        results.set(row.page_path, row.date)
      }
    }

    if (data.length < batchSize) break
    offset += batchSize
  }

  console.log(`  Found first_click_at for ${results.size} pages`)
  return results
}

/**
 * Get 7-day rolling averages for position, impressions, clicks from gsc_daily_metrics.
 */
async function get7DayMetrics(
  supabase: SupabaseClient
): Promise<Map<string, { avg_position: number; impressions: number; clicks: number }>> {
  const results = new Map<string, { avg_position: number; impressions: number; clicks: number }>()

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const cutoff = sevenDaysAgo.toISOString().split('T')[0]

  let offset = 0
  const batchSize = 10000

  while (true) {
    const { data, error } = await supabase
      .from('gsc_daily_metrics')
      .select('page_path, position, impressions, clicks')
      .gte('date', cutoff)
      .range(offset, offset + batchSize - 1)

    if (error) {
      console.error('Error fetching 7d metrics:', error.message)
      break
    }

    if (!data || data.length === 0) break

    for (const row of data) {
      const existing = results.get(row.page_path)
      if (existing) {
        // Weighted average by impressions for position
        const totalImp = existing.impressions + (row.impressions || 0)
        if (totalImp > 0) {
          existing.avg_position =
            (existing.avg_position * existing.impressions + (row.position || 0) * (row.impressions || 0)) /
            totalImp
        }
        existing.impressions += row.impressions || 0
        existing.clicks += row.clicks || 0
      } else {
        results.set(row.page_path, {
          avg_position: row.position || 0,
          impressions: row.impressions || 0,
          clicks: row.clicks || 0,
        })
      }
    }

    if (data.length < batchSize) break
    offset += batchSize
  }

  console.log(`  Computed 7d metrics for ${results.size} pages`)
  return results
}

/**
 * Get crawl frequency (number of crawls in last 7 days) per page from googlebot_logs.
 */
async function getCrawlFrequency7d(
  supabase: SupabaseClient
): Promise<Map<string, number>> {
  const results = new Map<string, number>()

  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString()

  let offset = 0
  const batchSize = 10000

  while (true) {
    const { data, error } = await supabase
      .from('googlebot_logs')
      .select('url')
      .gte('created_at', sevenDaysAgo)
      .range(offset, offset + batchSize - 1)

    if (error) {
      console.error('Error fetching crawl frequency:', error.message)
      break
    }

    if (!data || data.length === 0) break

    for (const row of data) {
      let path: string
      try {
        path = new URL(row.url).pathname
      } catch {
        path = row.url
      }
      results.set(path, (results.get(path) || 0) + 1)
    }

    if (data.length < batchSize) break
    offset += batchSize
  }

  console.log(`  Computed crawl_frequency_7d for ${results.size} pages`)
  return results
}

// ── Main function ───────────────────────────────────────────────────────────

export async function runLifecycleUpdate(): Promise<UpdateResult> {
  const startTime = Date.now()
  console.log('=== SEO Page Lifecycle Updater ===')

  const supabase = createSupabaseAdmin()

  // Fetch all data sources in parallel
  console.log('Fetching data sources...')
  const [firstCrawled, firstIndexed, firstClicked, metrics7d, crawlFreq] = await Promise.all([
    getFirstCrawledDates(supabase),
    getFirstIndexedDates(supabase),
    getFirstClickDates(supabase),
    get7DayMetrics(supabase),
    getCrawlFrequency7d(supabase),
  ])

  // Collect all unique page paths
  const allPages = new Set<string>()
  for (const path of firstCrawled.keys()) allPages.add(path)
  for (const path of firstIndexed.keys()) allPages.add(path)
  for (const path of firstClicked.keys()) allPages.add(path)
  for (const path of metrics7d.keys()) allPages.add(path)
  for (const path of crawlFreq.keys()) allPages.add(path)

  console.log(`\nTotal unique pages: ${allPages.size}`)

  // Build lifecycle rows
  const now = new Date().toISOString()
  const rows: LifecycleRow[] = []

  for (const pagePath of allPages) {
    const m7d = metrics7d.get(pagePath)

    rows.push({
      page_path: pagePath,
      first_crawled_at: firstCrawled.get(pagePath) || null,
      first_indexed_at: firstIndexed.get(pagePath) || null,
      first_click_at: firstClicked.get(pagePath) || null,
      avg_position_7d: m7d ? Math.round(m7d.avg_position * 100) / 100 : null,
      impressions_7d: m7d?.impressions || 0,
      clicks_7d: m7d?.clicks || 0,
      crawl_frequency_7d: crawlFreq.get(pagePath) || 0,
      updated_at: now,
    })
  }

  // Upsert in batches
  console.log('Upserting to seo_page_lifecycle...')
  let upserted = 0
  let errors = 0

  for (let i = 0; i < rows.length; i += UPSERT_BATCH_SIZE) {
    const batch = rows.slice(i, i + UPSERT_BATCH_SIZE)

    const { error } = await supabase
      .from('seo_page_lifecycle')
      .upsert(batch, {
        onConflict: 'page_path',
        ignoreDuplicates: false,
      })

    if (error) {
      console.error(`Upsert error at batch ${Math.floor(i / UPSERT_BATCH_SIZE)}:`, error.message)
      errors += batch.length
    } else {
      upserted += batch.length
    }
  }

  const durationMs = Date.now() - startTime
  console.log(`\nLifecycle update complete in ${(durationMs / 1000).toFixed(1)}s`)
  console.log(`  Pages processed: ${rows.length}`)
  console.log(`  Upserted: ${upserted}`)
  console.log(`  Errors: ${errors}`)

  return {
    totalPages: rows.length,
    upserted,
    errors,
    durationMs,
  }
}

// ── CLI execution ───────────────────────────────────────────────────────────

if (require.main === module) {
  try {
    require('dotenv').config({ path: '.env.local' })
  } catch {
    // dotenv not available
  }

  runLifecycleUpdate()
    .then((result) => {
      console.log('\nResult:', JSON.stringify(result, null, 2))
      process.exit(result.errors > 0 ? 1 : 0)
    })
    .catch((err) => {
      console.error('Fatal error:', err)
      process.exit(1)
    })
}
