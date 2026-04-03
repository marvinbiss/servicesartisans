/**
 * GSC Daily Metrics Sync Script (Standalone CLI)
 *
 * Connects to Google Search Console API using a service account,
 * pulls the last 90 days of data (page x query x date dimensions),
 * and upserts into the gsc_daily_metrics Supabase table.
 *
 * NOTE: The core sync logic is also available in src/lib/seo/gsc-sync.ts
 * for use by the Vercel cron route. This standalone version is self-contained
 * for CLI usage (no Next.js path aliases).
 *
 * Usage:
 *   npx tsx scripts/gsc-sync.ts
 *
 * Environment variables:
 *   GSC_SERVICE_ACCOUNT_EMAIL — Service account email
 *   GSC_PRIVATE_KEY — Service account private key (PEM, with \n escaped)
 *   GSC_SITE_URL — GSC property (e.g., 'sc-domain:servicesartisans.fr' or 'https://servicesartisans.fr/')
 *   GSC_CREDENTIALS — Alternative: full JSON credentials (overrides EMAIL+KEY)
 *   GOOGLE_SERVICE_ACCOUNT_KEY — Alternative fallback for credentials JSON
 *   NEXT_PUBLIC_SUPABASE_URL — Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY — Supabase service role key
 */

import { google, type searchconsole_v1 } from 'googleapis'
import { createClient } from '@supabase/supabase-js'

// ── Config ──────────────────────────────────────────────────────────────────

const DAYS_TO_SYNC = 90
/** GSC API limit: max 25000 rows per request */
const GSC_ROW_LIMIT = 25000
/** Supabase upsert batch size */
const UPSERT_BATCH_SIZE = 1000

// ── Types ───────────────────────────────────────────────────────────────────

interface GscRow {
  page_path: string
  query: string
  date: string
  clicks: number
  impressions: number
  ctr: number
  position: number
}

interface SyncResult {
  totalRows: number
  upsertedRows: number
  errors: number
  durationMs: number
  dateRange: { start: string; end: string }
}

// ── GSC Client ──────────────────────────────────────────────────────────────

function createGSCClient(): searchconsole_v1.Searchconsole {
  // Method 1: Full JSON credentials
  const rawCredentials = process.env.GSC_CREDENTIALS || process.env.GOOGLE_SERVICE_ACCOUNT_KEY
  if (rawCredentials) {
    const credentials = JSON.parse(rawCredentials)
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
    })
    return google.searchconsole({ version: 'v1', auth })
  }

  // Method 2: Individual env vars
  const email = process.env.GSC_SERVICE_ACCOUNT_EMAIL
  const privateKey = process.env.GSC_PRIVATE_KEY?.replace(/\\n/g, '\n')

  if (!email || !privateKey) {
    throw new Error(
      'GSC credentials missing. Set GSC_CREDENTIALS (JSON) or GSC_SERVICE_ACCOUNT_EMAIL + GSC_PRIVATE_KEY'
    )
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: email,
      private_key: privateKey,
    },
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  })

  return google.searchconsole({ version: 'v1', auth })
}

function getSiteUrl(): string {
  const siteUrl = process.env.GSC_SITE_URL
  if (siteUrl) return siteUrl

  // Fallback: derive from NEXT_PUBLIC_SITE_URL
  const publicUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://servicesartisans.fr'
  return publicUrl.replace(/\/+$/, '') + '/'
}

// ── Supabase Client ─────────────────────────────────────────────────────────

function createSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('Supabase env vars missing: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

// ── Date helpers ────────────────────────────────────────────────────────────

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0]
}

function getDateRange(days: number): { startDate: string; endDate: string } {
  const end = new Date()
  // GSC data has ~3 day lag
  end.setDate(end.getDate() - 3)
  const start = new Date(end)
  start.setDate(start.getDate() - days)

  return {
    startDate: formatDate(start),
    endDate: formatDate(end),
  }
}

// ── Fetch GSC data ──────────────────────────────────────────────────────────

async function fetchGSCData(
  client: searchconsole_v1.Searchconsole,
  siteUrl: string,
  startDate: string,
  endDate: string,
  startRow: number = 0
): Promise<GscRow[]> {
  const response = await client.searchanalytics.query({
    siteUrl,
    requestBody: {
      startDate,
      endDate,
      dimensions: ['page', 'query', 'date'],
      rowLimit: GSC_ROW_LIMIT,
      startRow,
      // Type 'web' only — pas de discover/googleNews
      type: 'web',
    },
  })

  const rows = response.data.rows || []

  return rows.map((row) => {
    const [page, query, date] = row.keys || []
    // Extract path from full URL
    let pagePath: string
    try {
      pagePath = new URL(page).pathname
    } catch {
      pagePath = page
    }

    return {
      page_path: pagePath,
      query: query || '',
      date: date || '',
      clicks: row.clicks || 0,
      impressions: row.impressions || 0,
      ctr: Math.round((row.ctr || 0) * 10000) / 10000, // 4 decimal places
      position: Math.round((row.position || 0) * 100) / 100, // 2 decimal places
    }
  })
}

async function fetchAllGSCData(
  client: searchconsole_v1.Searchconsole,
  siteUrl: string,
  startDate: string,
  endDate: string
): Promise<GscRow[]> {
  const allRows: GscRow[] = []
  let startRow = 0

  // Paginate through all results
  while (true) {
    console.log(`  Fetching rows ${startRow}–${startRow + GSC_ROW_LIMIT}...`)
    const batch = await fetchGSCData(client, siteUrl, startDate, endDate, startRow)
    allRows.push(...batch)

    if (batch.length < GSC_ROW_LIMIT) {
      break // No more pages
    }
    startRow += GSC_ROW_LIMIT

    // Safety limit: 500K rows max
    if (startRow > 500000) {
      console.warn('Safety limit reached (500K rows). Stopping pagination.')
      break
    }
  }

  return allRows
}

// ── Upsert to Supabase ─────────────────────────────────────────────────────

async function upsertRows(
  supabase: ReturnType<typeof createSupabaseAdmin>,
  rows: GscRow[]
): Promise<{ upserted: number; errors: number }> {
  let upserted = 0
  let errors = 0

  // Process in batches
  for (let i = 0; i < rows.length; i += UPSERT_BATCH_SIZE) {
    const batch = rows.slice(i, i + UPSERT_BATCH_SIZE)

    const { error } = await supabase
      .from('gsc_daily_metrics')
      .upsert(batch, {
        onConflict: 'page_path,query,date',
        ignoreDuplicates: false,
      })

    if (error) {
      console.error(`Upsert error at batch ${i / UPSERT_BATCH_SIZE}:`, error.message)
      errors += batch.length
    } else {
      upserted += batch.length
    }

    // Progress log every 10 batches
    if ((i / UPSERT_BATCH_SIZE) % 10 === 0 && i > 0) {
      console.log(`  Upserted ${upserted}/${rows.length} rows...`)
    }
  }

  return { upserted, errors }
}

// ── Main sync function (exported for use by cron route) ─────────────────────

export async function runGSCSync(): Promise<SyncResult> {
  const startTime = Date.now()

  console.log('=== GSC Daily Metrics Sync ===')
  console.log(`Syncing last ${DAYS_TO_SYNC} days of data...`)

  // 1. Create clients
  const gscClient = createGSCClient()
  const supabase = createSupabaseAdmin()
  const siteUrl = getSiteUrl()

  console.log(`Site URL: ${siteUrl}`)

  // 2. Determine date range
  const { startDate, endDate } = getDateRange(DAYS_TO_SYNC)
  console.log(`Date range: ${startDate} → ${endDate}`)

  // 3. Fetch all GSC data
  console.log('Fetching GSC data...')
  const rows = await fetchAllGSCData(gscClient, siteUrl, startDate, endDate)
  console.log(`Fetched ${rows.length} rows from GSC`)

  if (rows.length === 0) {
    console.log('No data to sync.')
    return {
      totalRows: 0,
      upsertedRows: 0,
      errors: 0,
      durationMs: Date.now() - startTime,
      dateRange: { start: startDate, end: endDate },
    }
  }

  // 4. Upsert to Supabase
  console.log('Upserting to gsc_daily_metrics...')
  const { upserted, errors } = await upsertRows(supabase, rows)

  const durationMs = Date.now() - startTime
  console.log(`\nSync complete in ${(durationMs / 1000).toFixed(1)}s`)
  console.log(`  Total rows: ${rows.length}`)
  console.log(`  Upserted: ${upserted}`)
  console.log(`  Errors: ${errors}`)

  return {
    totalRows: rows.length,
    upsertedRows: upserted,
    errors,
    durationMs,
    dateRange: { start: startDate, end: endDate },
  }
}

// ── CLI execution ───────────────────────────────────────────────────────────

if (require.main === module) {
  // Load .env for local execution
  try {
    require('dotenv').config({ path: '.env.local' })
  } catch {
    // dotenv not available — env vars must be set externally
  }

  runGSCSync()
    .then((result) => {
      console.log('\nResult:', JSON.stringify(result, null, 2))
      process.exit(result.errors > 0 ? 1 : 0)
    })
    .catch((err) => {
      console.error('Fatal error:', err)
      process.exit(1)
    })
}
