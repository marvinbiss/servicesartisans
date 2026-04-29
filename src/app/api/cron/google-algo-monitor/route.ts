import { NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { logger } from '@/lib/logger'
import { pingHeartbeat } from '@/lib/monitoring/heartbeat'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyCronSecret } from '@/lib/auth/verify-cron-secret'
import {
  collectVolatilitySnapshots,
  persistVolatilitySnapshots,
  makeSemrushFetcher,
} from '@/lib/seo/algo-monitor'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/**
 * Daily cron — Bouclier 1 plan v2.
 * Snapshote la volatilité SERP publique (Semrush Sensor FR).
 * Alerte Sentry si score >= 7 sur n'importe quelle source.
 *
 * Auth-then-monitor : verifyCronSecret AVANT withMonitor pour ne pas
 * polluer le compteur Sentry avec les requêtes non-authentifiées.
 */
export async function GET(request: Request) {
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
      const fetchers = [makeSemrushFetcher('fr')]
      const snapshots = await collectVolatilitySnapshots(fetchers)

      const supabase = createAdminClient()
      const persistResult = await persistVolatilitySnapshots(supabase, snapshots)
      if (!persistResult.ok) {
        logger.warn('[google-algo-monitor] persist failed (non-blocking)', {
          kind: 'algo_monitor_persist_error',
        })
      }

      for (const snap of snapshots) {
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
    },
    {
      schedule: { type: 'crontab', value: '30 6 * * *' },
    }
  )
}
