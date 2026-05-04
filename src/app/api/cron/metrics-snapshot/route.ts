import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyCronSecret } from '@/lib/auth/verify-cron-secret'
import { withCronCheckIn } from '@/lib/monitoring/sentry-checkin'

export const maxDuration = 60

/**
 * Cron job: Daily metrics snapshot.
 *
 * Upsert un cliché quotidien (devis, providers, claims, reviews, invitations +
 * rollup GSC 7 derniers jours) dans metrics_snapshots. Base immuable pour
 * les décisions CEO S2-S4 : funnel fix, supply-side, content, backlinks.
 *
 * Security: requires Bearer CRON_SECRET in Authorization header.
 * Schedule: daily at 08:00 UTC (après gsc-sync à 07:00 UTC, pour capter le
 * rollup GSC du jour avant de snapshotter).
 */
export const GET = withCronCheckIn('cron-metrics-snapshot', async (request: Request) => {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Serveur mal configuré' }, { status: 500 })
  }
  const authHeader = request.headers.get('authorization')
  if (!verifyCronSecret(authHeader)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const startedAt = Date.now()

  try {
    const supabase = createAdminClient()

    const { data, error } = await supabase.rpc('snapshot_metrics_daily')

    if (error) {
      logger.error('metrics-snapshot cron: RPC failed', error)
      return NextResponse.json(
        { ok: false, error: error.message, durationMs: Date.now() - startedAt },
        { status: 500 }
      )
    }

    logger.warn('metrics-snapshot cron: ok', {
      action: 'metrics-snapshot',
      captured_at: String(data?.captured_at ?? ''),
      devis_requests_7d: String(data?.devis_requests_7d ?? ''),
      providers_claimed: String(data?.providers_claimed ?? ''),
      reviews_7d: String(data?.reviews_7d ?? ''),
      clicks_7d: String(data?.clicks_7d ?? 'null'),
      durationMs: String(Date.now() - startedAt),
    })

    return NextResponse.json({
      ok: true,
      snapshot: data,
      durationMs: Date.now() - startedAt,
    })
  } catch (err) {
    logger.error('metrics-snapshot cron: unhandled error', err)
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : 'unknown',
        durationMs: Date.now() - startedAt,
      },
      { status: 500 }
    )
  }
})
