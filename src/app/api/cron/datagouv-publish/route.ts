import { NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { logger } from '@/lib/logger'
import { verifyCronSecret } from '@/lib/auth/verify-cron-secret'
import { getDataGouvConfig } from '@/lib/integrations/datagouv'
import { publishRgeDataset } from '@/lib/integrations/datagouv-rge-manifest'
import { withCronCheckIn } from '@/lib/monitoring/sentry-checkin'

/**
 * Cron mensuel — publie/synchronise le dataset RGE sur data.gouv.fr.
 *
 * Dernière brique du Pilier #1 "data-authority" : décroche le backlink
 * dofollow depuis data.gouv.fr (DR 92) vers servicesartisans.fr (DR 0.6).
 *
 * Schedule prévu : `0 5 1 * *` (1er du mois, 05:00 UTC = 1 h APRÈS
 * `export-rge-dataset` à 04:00, le temps que `rge-latest.*` soit régénéré).
 * NON déclaré dans vercel.json tant que les gates ci-dessous ne sont pas
 * posés — même convention que `export-rge-dataset`.
 *
 * DOUBLE GATE (publier = action sortante irréversible sur plateforme publique) :
 *   1. `DATAGOUV_PUBLISH_ENABLED=true`  → sinon 503 (kill-switch explicite)
 *   2. `DATAGOUV_API_KEY` présent       → sinon 200 {skipped} (no-op safe)
 * Tant que Marvin ne pose PAS ces deux variables en prod, ce cron ne publie
 * STRICTEMENT RIEN. Pré-requis amont : SAS validée sur data.gouv.fr (KBIS).
 *
 * Cron trivial (action unique, ~3 appels API, pas de boucle) : auth + checkin
 * + try/catch suffisent, pas de lease/cap/wallclock (cf. CLAUDE.md).
 */

export const maxDuration = 60
export const dynamic = 'force-dynamic'

export const GET = withCronCheckIn('cron-datagouv-publish', async (request: Request) => {
  return await Sentry.withMonitor(
    'cron-datagouv-publish',
    async () => {
      if (!process.env.CRON_SECRET) {
        logger.error('[cron-datagouv-publish] CRON_SECRET missing')
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
      }

      if (!verifyCronSecret(request.headers.get('authorization'))) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
      }

      // Gate 1 — kill-switch explicite. Empêche tout déclenchement accidentel
      // (curl/scan) tant que la publication n'est pas volontairement activée.
      if (process.env.DATAGOUV_PUBLISH_ENABLED !== 'true') {
        return NextResponse.json(
          {
            error: 'feature_disabled',
            message:
              'Publication data.gouv.fr désactivée. Activer via DATAGOUV_PUBLISH_ENABLED=true ' +
              'APRÈS validation de la SAS sur data.gouv.fr + DATAGOUV_API_KEY posé.',
          },
          { status: 503 }
        )
      }

      // Gate 2 — no-op safe si la clé API est absente (mauvaise config plutôt
      // qu'échec bruyant : on skip proprement sans throw).
      const cfg = getDataGouvConfig()
      if (!cfg) {
        logger.warn('[cron-datagouv-publish] DATAGOUV_API_KEY absent — skip')
        return NextResponse.json({ skipped: true, reason: 'datagouv_config_absent' })
      }

      const started = Date.now()
      try {
        const result = await publishRgeDataset(cfg)
        const duration = Date.now() - started

        logger.info('[cron-datagouv-publish] dataset publié/synchronisé', {
          datasetId: result.datasetId,
          page: result.page,
          resources: result.resources.length,
          duration_ms: duration,
        })

        return NextResponse.json({
          ok: true,
          datasetId: result.datasetId,
          page: result.page,
          resources: result.resources.map((r) => r.url),
          duration_ms: duration,
        })
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        logger.error('[cron-datagouv-publish] failed', { error: msg })
        return NextResponse.json(
          { error: 'datagouv_publish_failed', message: msg },
          { status: 500 }
        )
      }
    },
    {
      schedule: { type: 'crontab', value: '0 5 1 * *' },
    }
  )
})
