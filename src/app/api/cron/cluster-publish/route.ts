/**
 * Cron : cluster-publish
 * ----------------------------------------------------------------------------
 * Schedule recommandé : `0 8 * * *` (1×/jour 08h UTC, fenêtre publication).
 * Cap dur 100/jour pour éviter spike GSC. publishReadyBatch :
 *   - SELECT WHERE noindex=true AND critic_passed_at IS NOT NULL
 *   - UPDATE published_at + noindex=false
 *   - Validation shape content_jsonb (publisher.ts)
 *
 * Pas de LLM call ici (pure DB), pas besoin de registry boot.
 *
 * Auth : Bearer CRON_SECRET.
 */

import { NextResponse } from 'next/server'

import { verifyCronSecret } from '@/lib/auth/verify-cron-secret'
import { logger } from '@/lib/logger'
import { withCronCheckIn } from '@/lib/monitoring/sentry-checkin'
import { publishReadyBatch } from '@/lib/clusters'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 180

const DAILY_CAP = 100

export const GET = withCronCheckIn('cron-cluster-publish', async (request: Request) => {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Serveur mal configuré' }, { status: 500 })
  }
  if (!verifyCronSecret(request.headers.get('authorization'))) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const results = await publishReadyBatch(DAILY_CAP)
  const published = results.filter((r) => r.kind === 'published').length
  const rejected = results.filter((r) => r.kind === 'rejected').length

  if (rejected > 0) {
    const reasons = results
      .filter((r): r is typeof r & { kind: 'rejected'; reason: string } => r.kind === 'rejected')
      .map((r) => ({ slug: r.slug, reason: r.reason }))
      .slice(0, 10)
    logger.warn('cron.cluster-publish.partial_rejects', {
      published,
      rejected,
      sampleReasons: reasons,
    })
  }

  logger.info('cron.cluster-publish.batch_done', { published, rejected, dailyCap: DAILY_CAP })
  return NextResponse.json({ ok: true, published, rejected, dailyCap: DAILY_CAP })
})
