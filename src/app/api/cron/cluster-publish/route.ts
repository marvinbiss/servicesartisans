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
import { createAdminClient } from '@/lib/supabase/admin'
import { withCronCheckIn } from '@/lib/monitoring/sentry-checkin'
import { publishReadyBatch } from '@/lib/clusters'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 180

const DAILY_CAP = 100

// SLA-99.9 : cap dur par run (alias explicite de DAILY_CAP) + wall-clock guard
// (maxDuration 180 → marge 10s) + lease anti-double-run.
const MAX_PUBLISH_PER_RUN = DAILY_CAP
const MAX_RUNTIME_MS = 170_000
const LEASE_NAME = 'cron_cluster_publish'
const LEASE_TTL_SECONDS = 15 * 60

export const GET = withCronCheckIn('cron-cluster-publish', async (request: Request) => {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Serveur mal configuré' }, { status: 500 })
  }
  if (!verifyCronSecret(request.headers.get('authorization'))) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const admin = createAdminClient()
  const startedAt = Date.now()

  // SLA-99.9 : lease avec abort 5s.
  const leaseController = new AbortController()
  const leaseTimer = setTimeout(() => leaseController.abort(), 5_000)
  let acquired: boolean | null = null
  let leaseErr: { message: string } | null = null
  try {
    const leaseResult = await admin
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
    logger.error('cron.cluster-publish.lease_error', { lease: LEASE_NAME, error: leaseErr.message })
    return NextResponse.json({ error: 'lease_error' }, { status: 500 })
  }
  if (acquired !== true) {
    logger.info('cron.cluster-publish.skipped', { lease: LEASE_NAME })
    return NextResponse.json({ ok: true, skipped: true, reason: 'already_running' })
  }

  try {
    const results = await publishReadyBatch(MAX_PUBLISH_PER_RUN)
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

    const durationMs = Date.now() - startedAt
    if (durationMs > MAX_RUNTIME_MS) {
      logger.warn('cron.cluster-publish.over_wallclock_budget', { durationMs })
    }

    logger.info('cron.cluster-publish.batch_done', {
      published,
      rejected,
      dailyCap: MAX_PUBLISH_PER_RUN,
      durationMs,
    })
    return NextResponse.json({ ok: true, published, rejected, dailyCap: MAX_PUBLISH_PER_RUN })
  } finally {
    // SLA-99.9 : release best-effort.
    try {
      await admin.rpc('release_cron_lease', { p_name: LEASE_NAME })
    } catch {
      // swallowed : TTL acts as safety net
    }
  }
})
