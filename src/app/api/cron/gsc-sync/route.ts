import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { verifyCronSecret } from '@/lib/auth/verify-cron-secret'
import { withCronCheckIn } from '@/lib/monitoring/sentry-checkin'

export const maxDuration = 60

/**
 * Cron job: GSC Daily Metrics Sync
 *
 * Triggers the GSC sync pipeline to pull Search Console data
 * and upsert into gsc_daily_metrics table.
 *
 * Security: requires Bearer CRON_SECRET in Authorization header.
 * Schedule: daily at 07:00 UTC (after GSC data refresh).
 */
export const GET = withCronCheckIn('cron-gsc-sync', async (request: Request) => {
  // ── Auth ───────────────────────────────────────────────────────────────
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Serveur mal configuré' }, { status: 500 })
  }
  const authHeader = request.headers.get('authorization')
  if (!verifyCronSecret(authHeader)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  // ── Check GSC credentials ─────────────────────────────────────────────
  const hasCredentials = !!(
    process.env.GSC_CREDENTIALS ||
    process.env.GOOGLE_SERVICE_ACCOUNT_KEY ||
    (process.env.GSC_SERVICE_ACCOUNT_EMAIL && process.env.GSC_PRIVATE_KEY)
  )

  if (!hasCredentials) {
    logger.warn('GSC sync cron: No GSC credentials configured. Skipping.', {
      action: 'gsc-sync-skip',
    })
    return NextResponse.json({
      skipped: true,
      reason:
        'GSC credentials not configured. Set GSC_CREDENTIALS, GOOGLE_SERVICE_ACCOUNT_KEY, or GSC_SERVICE_ACCOUNT_EMAIL + GSC_PRIVATE_KEY.',
      timestamp: new Date().toISOString(),
    })
  }

  try {
    // Dynamic import to avoid loading googleapis at module level
    const { runGSCSync } = await import('@/lib/seo/gsc-sync')

    logger.warn('GSC sync cron: starting sync', { action: 'gsc-sync-start' })

    const result = await runGSCSync()

    logger.warn('GSC sync cron: completed', {
      action: 'gsc-sync-complete',
      totalRows: String(result.totalRows),
      upsertedRows: String(result.upsertedRows),
      errors: String(result.errors),
      durationMs: String(result.durationMs),
    })

    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    logger.error('GSC sync cron: fatal error', err, {
      action: 'gsc-sync-error',
    })

    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
})
