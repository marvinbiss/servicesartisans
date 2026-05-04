import { NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { logger } from '@/lib/logger'
import { verifyCronSecret } from '@/lib/auth/verify-cron-secret'
import { exportRgeDataset } from '../../../../../scripts/cron/export-rge-dataset'
import { withCronCheckIn } from '@/lib/monitoring/sentry-checkin'

/**
 * Sprint 0.4 — Cron mensuel : export du dataset RGE (CSV + NDJSON + Parquet).
 *
 * Schedule prévu : `0 4 1 * *` (1er du mois, 04:00 UTC). À déclarer dans
 * vercel.json APRÈS validation Sprint 0.1 (template /rge/[s]/[v]).
 *
 * Auth : Authorization: Bearer $CRON_SECRET (timing-safe).
 *
 * Kill switch : env `RGE_DATASET_EXPORT_ENABLED=true` requis pour exécuter.
 * Tant que cette variable n'est pas posée en prod, on retourne 503 — évite
 * tout déclenchement accidentel via curl/scan tant que Sprint 0.1 n'a pas
 * validé la cascade SEO côté template RGE.
 *
 * Runtime budget : ~30-60 s pour 50K providers, payload ~30-60 MB CSV.
 * Vercel Pro / serverless function : 5 min de plafond — large.
 */

export const maxDuration = 300
export const dynamic = 'force-dynamic'

export const GET = withCronCheckIn('cron-export-rge-dataset', async (request: Request) => {
  return await Sentry.withMonitor(
    'cron-export-rge-dataset',
    async () => {
      if (!process.env.CRON_SECRET) {
        logger.error('[cron-export-rge-dataset] CRON_SECRET missing')
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
      }

      const authHeader = request.headers.get('authorization')
      if (!verifyCronSecret(authHeader)) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
      }

      if (process.env.RGE_DATASET_EXPORT_ENABLED !== 'true') {
        return NextResponse.json(
          {
            error: 'feature_disabled',
            message:
              'RGE dataset export désactivé. Activer via env RGE_DATASET_EXPORT_ENABLED=true après validation Sprint 0.1.',
          },
          { status: 503 }
        )
      }

      const yearmonth = new Date().toISOString().slice(0, 7)
      const started = Date.now()

      try {
        const result = await exportRgeDataset({ yearmonth })
        const duration = Date.now() - started

        logger.info('[cron-export-rge-dataset] export terminé', {
          yearmonth: result.yearmonth,
          count: result.count,
          files: result.files.length,
          warnings: result.warnings.length,
          duration_ms: duration,
        })

        return NextResponse.json({
          ok: result.ok,
          yearmonth: result.yearmonth,
          count: result.count,
          files: result.files,
          warnings: result.warnings,
          duration_ms: duration,
        })
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        logger.error('[cron-export-rge-dataset] failed', { error: msg })
        return NextResponse.json(
          { error: 'export_rge_dataset_failed', message: msg },
          { status: 500 }
        )
      }
    },
    {
      schedule: { type: 'crontab', value: '0 4 1 * *' },
    }
  )
})
