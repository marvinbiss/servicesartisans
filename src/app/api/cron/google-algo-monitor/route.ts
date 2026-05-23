import { NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { logger } from '@/lib/logger'
import { pingHeartbeat } from '@/lib/monitoring/heartbeat'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyCronSecret } from '@/lib/auth/verify-cron-secret'
import { withCronCheckIn } from '@/lib/monitoring/sentry-checkin'
import {
  collectVolatilitySnapshots,
  persistVolatilitySnapshots,
  makeSemrushFetcher,
} from '@/lib/seo/algo-monitor'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// SLA-99.9 : wall-clock guard 50s + cap dur sur les snapshots traités par run
// + lease anti-double-run.
const MAX_RUNTIME_MS = 50_000
const MAX_SNAPSHOTS_PER_RUN = 100
const LEASE_NAME = 'cron_google_algo_monitor'
const LEASE_TTL_SECONDS = 15 * 60

/**
 * Daily cron — Bouclier 1 plan v2.
 * Snapshote la volatilité SERP publique (Semrush Sensor FR).
 * Alerte Sentry si score >= 7 sur n'importe quelle source.
 *
 * Auth-then-monitor : verifyCronSecret AVANT withMonitor pour ne pas
 * polluer le compteur Sentry avec les requêtes non-authentifiées.
 */
export const GET = withCronCheckIn('cron-google-algo-monitor', async (request: Request) => {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Serveur mal configuré' }, { status: 500 })
  }
  const authHeader = request.headers.get('authorization')
  if (!verifyCronSecret(authHeader)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  return await Sentry.withMonitor(
    'cron-google-algo-monitor',
    async () => {
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
        logger.error('[google-algo-monitor] lease error', undefined, {
          lease: LEASE_NAME,
          error: leaseErr.message,
        })
        return NextResponse.json({ error: 'lease_error' }, { status: 500 })
      }
      if (acquired !== true) {
        logger.info('[google-algo-monitor] skipped (lease already held)', { lease: LEASE_NAME })
        return NextResponse.json({ ok: true, skipped: true, reason: 'already_running' })
      }

      try {
        const fetchers = [makeSemrushFetcher('fr')]
        const snapshots = (await collectVolatilitySnapshots(fetchers)).slice(
          0,
          MAX_SNAPSHOTS_PER_RUN
        )

        const persistResult = await persistVolatilitySnapshots(supabase, snapshots)
        if (!persistResult.ok) {
          logger.warn('[google-algo-monitor] persist failed (non-blocking)', {
            kind: 'algo_monitor_persist_error',
          })
        }

        for (const snap of snapshots) {
          // SLA-99.9 : wall-clock guard.
          if (Date.now() - startedAt > MAX_RUNTIME_MS) break
          const logBody = {
            kind: 'algo_volatility_snapshot',
            source: snap.source,
            country: snap.country,
            score: snap.score,
            severity: snap.severity,
          }
          if (snap.severity === 'critical') {
            logger.error(
              `[google-algo-monitor] CRITICAL ${snap.source}/${snap.country} score=${snap.score}`,
              undefined,
              logBody
            )
            Sentry.captureMessage(
              `Algo volatility critical on ${snap.source}/${snap.country}: ${snap.score}/10`,
              { level: 'error', extra: logBody }
            )
          } else if (snap.severity === 'warn') {
            logger.warn(
              `[google-algo-monitor] WARN ${snap.source}/${snap.country} score=${snap.score}`,
              logBody
            )
          } else {
            logger.info(
              `[google-algo-monitor] calm ${snap.source}/${snap.country} score=${snap.score}`,
              logBody
            )
          }
        }

        await pingHeartbeat('google-algo-monitor')
        return NextResponse.json({
          ok: true,
          upserted: persistResult.upserted,
          snapshots: snapshots.map((s) => ({
            source: s.source,
            country: s.country,
            score: s.score,
            severity: s.severity,
          })),
          timestamp: new Date().toISOString(),
        })
      } finally {
        // SLA-99.9 : release best-effort.
        try {
          await supabase.rpc('release_cron_lease', { p_name: LEASE_NAME })
        } catch {
          // swallowed : TTL acts as safety net
        }
      }
    },
    {
      schedule: { type: 'crontab', value: '30 6 * * *' },
    }
  )
})
