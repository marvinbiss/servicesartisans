import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { processBatch, reconcileOrphanedMessages } from '@/lib/prospection/message-queue'
import { logger } from '@/lib/logger'
import { verifyCronSecret } from '@/lib/auth/verify-cron-secret'
import { withCronCheckIn } from '@/lib/monitoring/sentry-checkin'

export const dynamic = 'force-dynamic'

// SLA-99.9 : cap dur sur le nombre de campagnes traitées par run + wall-clock
// guard 50s + lease anti-double-run.
const MAX_CAMPAIGNS_PER_RUN = 100
const MAX_RUNTIME_MS = 50_000
const LEASE_NAME = 'cron_prospection_process'
const LEASE_TTL_SECONDS = 15 * 60

/**
 * Cron Job: Process prospection campaign batches
 * Runs every 2 minutes via Vercel Cron
 * Picks up active campaigns and sends the next batch of queued messages
 */
export const GET = withCronCheckIn('cron-prospection-process', async (request: Request) => {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (!verifyCronSecret(authHeader)) {
    logger.warn('[Cron] Unauthorized access to prospection-process')
    return NextResponse.json(
      { success: false, error: { message: 'Non autorisé' } },
      { status: 401 }
    )
  }

  const supabase = createAdminClient()
  const startedAt = Date.now()

  // SLA-99.9 : lease avec abort 5s.
  const leaseController = new AbortController()
  const leaseTimer = setTimeout(() => leaseController.abort(), 5_000)
  let acquired: boolean | null = null
  let leaseErr: { message: string } | null = null
  try {
    const leaseResult = await supabase
      .rpc('acquire_cron_lease', {
        p_name: LEASE_NAME,
        p_ttl_seconds: LEASE_TTL_SECONDS,
      })
      .abortSignal(leaseController.signal)
    acquired = leaseResult.data as boolean | null
    leaseErr = leaseResult.error
  } catch (err) {
    leaseErr = { message: err instanceof Error ? err.message : String(err) }
  } finally {
    clearTimeout(leaseTimer)
  }

  if (leaseErr) {
    logger.error('[Cron] prospection-process lease error', { error: leaseErr.message })
    return NextResponse.json({ success: false, error: { message: 'lease_error' } }, { status: 500 })
  }
  if (acquired !== true) {
    logger.info('[Cron] prospection-process skipped (lease already held)')
    return NextResponse.json({ success: true, skipped: true, reason: 'already_running' })
  }

  try {
    // 1. Reconcile orphaned messages (stuck in 'sending' for > 10 min)
    const reconciled = await reconcileOrphanedMessages(supabase)

    // 2. Find active campaigns (status = 'sending')
    const { data: campaigns, error } = await supabase
      .from('prospection_campaigns')
      .select('id, name, batch_size')
      .eq('status', 'sending')
      .limit(MAX_CAMPAIGNS_PER_RUN)

    if (error) {
      logger.error('[Cron] Error fetching active campaigns', error)
      return NextResponse.json(
        { success: false, error: { message: 'Erreur base de données' } },
        { status: 500 }
      )
    }

    if (!campaigns || campaigns.length === 0) {
      return NextResponse.json({
        success: true,
        data: { campaigns_processed: 0, reconciled },
      })
    }

    // 3. Process one batch per active campaign
    const results = []
    for (const campaign of campaigns) {
      // SLA-99.9 : wall-clock guard (1 batch = N envois externes).
      if (Date.now() - startedAt > MAX_RUNTIME_MS) break
      try {
        const batchResult = await processBatch(campaign.id, campaign.batch_size || 100)
        results.push({ campaign_id: campaign.id, name: campaign.name, ...batchResult })
      } catch (err) {
        logger.error(`[Cron] Error processing campaign ${campaign.id}`, err as Error)
        results.push({ campaign_id: campaign.id, name: campaign.name, error: 'processing_failed' })
      }
    }

    return NextResponse.json({
      success: true,
      data: { campaigns_processed: results.length, reconciled, results },
    })
  } catch (error) {
    logger.error('[Cron] prospection-process error', error as Error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur interne' } },
      { status: 500 }
    )
  } finally {
    // SLA-99.9 : release best-effort.
    try {
      await supabase.rpc('release_cron_lease', { p_name: LEASE_NAME })
    } catch {
      // swallowed : TTL acts as safety net
    }
  }
})
