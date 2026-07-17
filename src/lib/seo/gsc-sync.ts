/**
 * GSC Daily Metrics Sync — Core Logic
 *
 * Shared between the standalone script (scripts/gsc-sync.ts) and the
 * Vercel cron route (src/app/api/cron/gsc-sync/route.ts).
 *
 * Connects to Google Search Console API, pulls page x query x date data,
 * and upserts into gsc_daily_metrics.
 */

import { google, type searchconsole_v1 } from 'googleapis'
import { SITE_URL } from '@/lib/seo/config'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'

// ── Config ──────────────────────────────────────────────────────────────────

const DAYS_TO_SYNC = 90
const GSC_ROW_LIMIT = 25000
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

export interface SyncResult {
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
  const publicUrl = SITE_URL
  return publicUrl.replace(/\/+$/, '') + '/'
}

// ── Date helpers ────────────────────────────────────────────────────────────

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0]
}

function getDateRange(days: number): { startDate: string; endDate: string } {
  const end = new Date()
  end.setDate(end.getDate() - 3) // GSC data has ~3 day lag
  const start = new Date(end)
  start.setDate(start.getDate() - days)
  return { startDate: formatDate(start), endDate: formatDate(end) }
}

// ── Fetch GSC data ──────────────────────────────────────────────────────────

async function fetchGSCPage(
  client: searchconsole_v1.Searchconsole,
  siteUrl: string,
  startDate: string,
  endDate: string,
  startRow: number
): Promise<GscRow[]> {
  const response = await client.searchanalytics.query({
    siteUrl,
    requestBody: {
      startDate,
      endDate,
      dimensions: ['page', 'query', 'date'],
      rowLimit: GSC_ROW_LIMIT,
      startRow,
      type: 'web',
    },
  })

  return (response.data.rows || []).map((row) => {
    const [page, query, date] = row.keys || []
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
      ctr: Math.round((row.ctr || 0) * 10000) / 10000,
      position: Math.round((row.position || 0) * 100) / 100,
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

  while (true) {
    logger.warn(`GSC sync: fetching rows ${startRow}-${startRow + GSC_ROW_LIMIT}`, {
      action: 'gsc-sync-fetch',
    })
    const batch = await fetchGSCPage(client, siteUrl, startDate, endDate, startRow)
    allRows.push(...batch)

    if (batch.length < GSC_ROW_LIMIT) break
    startRow += GSC_ROW_LIMIT

    // Safety limit: 250K rows = 10 requêtes max ≈ 25-30s (Vercel maxDuration=60s)
    if (startRow > 250000) {
      logger.warn('GSC sync: safety limit reached (250K rows)', { action: 'gsc-sync-limit' })
      break
    }
  }

  return allRows
}

// ── Main sync function ──────────────────────────────────────────────────────

export async function runGSCSync(): Promise<SyncResult> {
  const startTime = Date.now()

  const gscClient = createGSCClient()
  const supabase = createAdminClient()
  const siteUrl = getSiteUrl()
  const { startDate, endDate } = getDateRange(DAYS_TO_SYNC)

  logger.warn(`GSC sync: fetching ${DAYS_TO_SYNC} days of data for ${siteUrl}`, {
    action: 'gsc-sync-start',
  })

  // Fetch all data
  const rows = await fetchAllGSCData(gscClient, siteUrl, startDate, endDate)

  if (rows.length === 0) {
    return {
      totalRows: 0,
      upsertedRows: 0,
      errors: 0,
      durationMs: Date.now() - startTime,
      dateRange: { start: startDate, end: endDate },
    }
  }

  // Upsert in batches
  let upserted = 0
  let errors = 0

  for (let i = 0; i < rows.length; i += UPSERT_BATCH_SIZE) {
    const batch = rows.slice(i, i + UPSERT_BATCH_SIZE)

    const { error } = await supabase.from('gsc_daily_metrics').upsert(batch, {
      onConflict: 'page_path,query,date',
      ignoreDuplicates: false,
    })

    if (error) {
      logger.error(`GSC sync: upsert error at batch ${Math.floor(i / UPSERT_BATCH_SIZE)}`, error, {
        action: 'gsc-sync-upsert-error',
      })
      errors += batch.length
    } else {
      upserted += batch.length
    }
  }

  return {
    totalRows: rows.length,
    upsertedRows: upserted,
    errors,
    durationMs: Date.now() - startTime,
    dateRange: { start: startDate, end: endDate },
  }
}
