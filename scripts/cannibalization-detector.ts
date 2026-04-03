/**
 * SEO Cannibalization Detector
 *
 * Queries gsc_daily_metrics for queries that rank on 2+ distinct pages.
 * For each such query, checks if both pages have fluctuating positions
 * (a sign of keyword cannibalization).
 *
 * Inserts detected pairs into seo_cannibalization_pairs table.
 * Outputs a structured report.
 *
 * Usage:
 *   npx tsx scripts/cannibalization-detector.ts
 *
 * Environment variables:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// ── Config ──────────────────────────────────────────────────────────────────

/** Minimum impressions for a query to be considered */
const MIN_IMPRESSIONS = 20
/** Minimum position variance to flag as fluctuating */
const MIN_POSITION_VARIANCE = 2.0
/** Analysis period in days */
const ANALYSIS_DAYS = 28

// ── Types ───────────────────────────────────────────────────────────────────

interface QueryPageMetrics {
  page_path: string
  query: string
  dates: string[]
  positions: number[]
  totalImpressions: number
  totalClicks: number
  avgPosition: number
  positionVariance: number
}

interface CannibalizationPair {
  query: string
  page_a: string
  page_b: string
  avg_position_a: number
  avg_position_b: number
  total_impressions: number
  status: 'detected'
}

interface DetectionResult {
  totalQueries: number
  multiPageQueries: number
  cannibalizationPairs: number
  inserted: number
  errors: number
  durationMs: number
  topPairs: CannibalizationPair[]
}

// ── Supabase Client ─────────────────────────────────────────────────────────

function createSupabaseAdmin(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('Supabase env vars missing')
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

// ── Analysis functions ──────────────────────────────────────────────────────

function calculateVariance(values: number[]): number {
  if (values.length < 2) return 0
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const squaredDiffs = values.map((v) => (v - mean) ** 2)
  return squaredDiffs.reduce((a, b) => a + b, 0) / values.length
}

/**
 * Fetch all GSC metrics for the analysis period, grouped by query+page.
 */
async function fetchQueryPageData(
  supabase: SupabaseClient
): Promise<Map<string, QueryPageMetrics[]>> {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - ANALYSIS_DAYS)
  const cutoff = cutoffDate.toISOString().split('T')[0]

  // Map: query -> list of page metrics
  const queryMap = new Map<string, Map<string, { dates: string[]; positions: number[]; impressions: number; clicks: number }>>()

  let offset = 0
  const batchSize = 10000

  while (true) {
    const { data, error } = await supabase
      .from('gsc_daily_metrics')
      .select('page_path, query, date, position, impressions, clicks')
      .gte('date', cutoff)
      .gt('impressions', 0)
      .range(offset, offset + batchSize - 1)

    if (error) {
      console.error('Error fetching GSC data:', error.message)
      break
    }

    if (!data || data.length === 0) break

    for (const row of data) {
      if (!queryMap.has(row.query)) {
        queryMap.set(row.query, new Map())
      }
      const pageMap = queryMap.get(row.query)!

      if (!pageMap.has(row.page_path)) {
        pageMap.set(row.page_path, { dates: [], positions: [], impressions: 0, clicks: 0 })
      }
      const entry = pageMap.get(row.page_path)!
      entry.dates.push(row.date)
      entry.positions.push(Number(row.position))
      entry.impressions += row.impressions || 0
      entry.clicks += row.clicks || 0
    }

    if (data.length < batchSize) break
    offset += batchSize
  }

  // Convert to final structure, filtering queries with 2+ pages
  const result = new Map<string, QueryPageMetrics[]>()

  for (const [query, pageMap] of queryMap) {
    if (pageMap.size < 2) continue

    // Filter: at least MIN_IMPRESSIONS total for the query across all pages
    let totalQueryImpressions = 0
    for (const entry of pageMap.values()) {
      totalQueryImpressions += entry.impressions
    }
    if (totalQueryImpressions < MIN_IMPRESSIONS) continue

    const pages: QueryPageMetrics[] = []
    for (const [pagePath, entry] of pageMap) {
      const avgPos = entry.positions.reduce((a, b) => a + b, 0) / entry.positions.length
      pages.push({
        page_path: pagePath,
        query,
        dates: entry.dates,
        positions: entry.positions,
        totalImpressions: entry.impressions,
        totalClicks: entry.clicks,
        avgPosition: Math.round(avgPos * 100) / 100,
        positionVariance: calculateVariance(entry.positions),
      })
    }

    result.set(query, pages)
  }

  return result
}

/**
 * Detect cannibalization: both pages must have high position variance
 * (indicating Google is alternating between them).
 */
function detectCannibalization(
  queryPageData: Map<string, QueryPageMetrics[]>
): CannibalizationPair[] {
  const pairs: CannibalizationPair[] = []

  for (const [query, pages] of queryPageData) {
    // Sort by impressions descending
    const sorted = [...pages].sort((a, b) => b.totalImpressions - a.totalImpressions)

    // Check all pairs (top 5 pages max per query to avoid combinatorial explosion)
    const topPages = sorted.slice(0, 5)

    for (let i = 0; i < topPages.length; i++) {
      for (let j = i + 1; j < topPages.length; j++) {
        const pageA = topPages[i]
        const pageB = topPages[j]

        // Both pages must have meaningful data
        if (pageA.positions.length < 3 || pageB.positions.length < 3) continue

        // At least one page must have fluctuating positions
        const bothFluctuating =
          pageA.positionVariance >= MIN_POSITION_VARIANCE &&
          pageB.positionVariance >= MIN_POSITION_VARIANCE

        // Or positions are very close (within 5 positions of each other)
        const positionsClose = Math.abs(pageA.avgPosition - pageB.avgPosition) < 5

        if (bothFluctuating || (positionsClose && (pageA.positionVariance >= MIN_POSITION_VARIANCE || pageB.positionVariance >= MIN_POSITION_VARIANCE))) {
          // Normalize order: page_a is always alphabetically first
          const [pA, pB] = [pageA.page_path, pageB.page_path].sort()
          const posA = pA === pageA.page_path ? pageA.avgPosition : pageB.avgPosition
          const posB = pB === pageB.page_path ? pageB.avgPosition : pageA.avgPosition

          pairs.push({
            query,
            page_a: pA,
            page_b: pB,
            avg_position_a: posA,
            avg_position_b: posB,
            total_impressions: pageA.totalImpressions + pageB.totalImpressions,
            status: 'detected',
          })
        }
      }
    }
  }

  // Sort by total impressions (highest impact first)
  pairs.sort((a, b) => b.total_impressions - a.total_impressions)

  return pairs
}

// ── Main function ───────────────────────────────────────────────────────────

export async function runCannibalizationDetection(): Promise<DetectionResult> {
  const startTime = Date.now()
  console.log('=== SEO Cannibalization Detector ===')
  console.log(`Analysis period: last ${ANALYSIS_DAYS} days`)
  console.log(`Min impressions: ${MIN_IMPRESSIONS}`)
  console.log(`Min position variance: ${MIN_POSITION_VARIANCE}`)

  const supabase = createSupabaseAdmin()

  // 1. Fetch and group data
  console.log('\nFetching GSC data...')
  const queryPageData = await fetchQueryPageData(supabase)
  console.log(`Found ${queryPageData.size} queries appearing on 2+ pages`)

  // 2. Detect cannibalization
  console.log('Detecting cannibalization pairs...')
  const pairs = detectCannibalization(queryPageData)
  console.log(`Detected ${pairs.length} cannibalization pairs`)

  if (pairs.length === 0) {
    return {
      totalQueries: 0,
      multiPageQueries: queryPageData.size,
      cannibalizationPairs: 0,
      inserted: 0,
      errors: 0,
      durationMs: Date.now() - startTime,
      topPairs: [],
    }
  }

  // 3. Upsert pairs to database
  console.log('Upserting to seo_cannibalization_pairs...')
  let inserted = 0
  let errors = 0

  const batchSize = 200
  for (let i = 0; i < pairs.length; i += batchSize) {
    const batch = pairs.slice(i, i + batchSize)

    const { error } = await supabase
      .from('seo_cannibalization_pairs')
      .upsert(batch, {
        onConflict: 'query,page_a,page_b',
        ignoreDuplicates: false,
      })

    if (error) {
      console.error(`Upsert error at batch ${Math.floor(i / batchSize)}:`, error.message)
      errors += batch.length
    } else {
      inserted += batch.length
    }
  }

  // 4. Print report
  const topPairs = pairs.slice(0, 20)
  console.log('\n=== Top 20 Cannibalization Pairs ===')
  console.log('─'.repeat(120))
  console.log(
    'Query'.padEnd(40) +
    'Page A'.padEnd(30) +
    'Page B'.padEnd(30) +
    'Pos A'.padEnd(8) +
    'Pos B'.padEnd(8) +
    'Imp'
  )
  console.log('─'.repeat(120))

  for (const pair of topPairs) {
    console.log(
      pair.query.substring(0, 38).padEnd(40) +
      pair.page_a.substring(0, 28).padEnd(30) +
      pair.page_b.substring(0, 28).padEnd(30) +
      String(pair.avg_position_a).padEnd(8) +
      String(pair.avg_position_b).padEnd(8) +
      String(pair.total_impressions)
    )
  }

  const durationMs = Date.now() - startTime
  console.log(`\nDetection complete in ${(durationMs / 1000).toFixed(1)}s`)
  console.log(`  Multi-page queries: ${queryPageData.size}`)
  console.log(`  Cannibalization pairs: ${pairs.length}`)
  console.log(`  Inserted: ${inserted}`)
  console.log(`  Errors: ${errors}`)

  return {
    totalQueries: queryPageData.size,
    multiPageQueries: queryPageData.size,
    cannibalizationPairs: pairs.length,
    inserted,
    errors,
    durationMs,
    topPairs,
  }
}

// ── CLI execution ───────────────────────────────────────────────────────────

if (require.main === module) {
  try {
    require('dotenv').config({ path: '.env.local' })
  } catch {
    // dotenv not available
  }

  runCannibalizationDetection()
    .then((result) => {
      console.log('\nResult:', JSON.stringify(result, null, 2))
      process.exit(result.errors > 0 ? 1 : 0)
    })
    .catch((err) => {
      console.error('Fatal error:', err)
      process.exit(1)
    })
}
