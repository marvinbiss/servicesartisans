/**
 * Cron: Pipedrive sync retry
 *
 * Replays any devis_requests that failed their initial Pipedrive sync.
 * Scope: leads created in the last 7 days, not yet synced, < 5 attempts.
 * Runs daily — see vercel.json.
 */

import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { createAdminClient } from '@/lib/supabase/admin'
import { isPipedriveConfigured, syncDevisRequestToPipedrive } from '@/lib/integrations/pipedrive'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const MAX_ATTEMPTS = 5
const LOOKBACK_DAYS = 7
const BATCH_SIZE = 50

export async function GET(request: Request) {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 })
  }
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!isPipedriveConfigured()) {
    return NextResponse.json({ skipped: true, reason: 'Pipedrive not configured' })
  }

  const supabase = createAdminClient()
  const lookback = new Date(Date.now() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000).toISOString()

  const { data: pending, error } = await supabase
    .from('devis_requests')
    .select('id')
    .is('pipedrive_synced_at', null)
    .lt('pipedrive_sync_attempts', MAX_ATTEMPTS)
    .gte('created_at', lookback)
    .order('created_at', { ascending: true })
    .limit(BATCH_SIZE)

  if (error) {
    logger.error('pipedrive-retry: query failed', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const ids = pending?.map((r) => r.id) ?? []
  let synced = 0
  let failed = 0

  // Sequential to respect Pipedrive rate limits and keep logs readable
  for (const id of ids) {
    try {
      await syncDevisRequestToPipedrive(id)
      synced++
    } catch (err) {
      failed++
      logger.error('pipedrive-retry: sync failed', { id, err })
    }
  }

  logger.info('pipedrive-retry: done', { total: ids.length, synced, failed })
  return NextResponse.json({ total: ids.length, synced, failed })
}
