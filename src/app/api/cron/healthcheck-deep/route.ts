/**
 * Cron : deep heartbeat des dépendances externes (Pipedrive, Resend, Sonergia, ADEME)
 *
 * Pourquoi : `/api/cron/healthcheck` (5min) couvre Supabase + Redis + Stripe-config.
 * Mais Pipedrive et Resend peuvent tomber côté tiers SANS qu'on s'en aperçoive
 * avant que le pipeline lead/email se casse silencieusement (DLQ retry 6h
 * absorbe les pannes courtes mais pas les longues). Ce cron ping `/api/health/deep`
 * toutes les 15min — fréquence plus basse car coût API tiers (~3-5s par run).
 *
 * Schedule : toutes les 15 minutes (voir vercel.json).
 * Sortie   : 200 si /api/health/deep répond OK, 503 sinon.
 *
 * Idempotent + Sentry monitor + heartbeat BetterStack optionnel
 * (var BETTERSTACK_HEARTBEAT_HEALTH_DEEP).
 */

import { NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { logger } from '@/lib/logger'
import { pingHeartbeat } from '@/lib/monitoring/heartbeat'
import { verifyCronSecret } from '@/lib/auth/verify-cron-secret'
import { withCronCheckIn } from '@/lib/monitoring/sentry-checkin'

export const dynamic = 'force-dynamic'

const HEALTH_CHECK_TIMEOUT_MS = 12_000

export const GET = withCronCheckIn('cron-healthcheck-deep', async (request: Request) => {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Serveur mal configuré' }, { status: 500 })
  }
  const authHeader = request.headers.get('authorization')
  if (!verifyCronSecret(authHeader)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://servicesartisans.fr'
  const url = `${baseUrl}/api/health/deep`
  const startedAt = Date.now()

  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(HEALTH_CHECK_TIMEOUT_MS),
      cache: 'no-store',
    })
    const latencyMs = Date.now() - startedAt
    const body = (await res.json().catch(() => ({}))) as Record<string, unknown>

    if (!res.ok) {
      logger.error('[cron healthcheck-deep] Deep health check failed', {
        status: res.status,
        latencyMs,
        body,
      })
      Sentry.captureMessage('Deep healthcheck failed', {
        level: 'error',
        tags: { cron: 'healthcheck-deep', http_status: String(res.status) },
        extra: { url, latencyMs, body },
      })
      return NextResponse.json(
        { healthy: false, status: res.status, latencyMs, body },
        { status: 503 }
      )
    }

    await pingHeartbeat('HEALTH_DEEP').catch(() => undefined)

    logger.info('[cron healthcheck-deep] OK', { latencyMs })
    return NextResponse.json({ healthy: true, latencyMs, body })
  } catch (err) {
    const latencyMs = Date.now() - startedAt
    const message = err instanceof Error ? err.message : String(err)
    logger.error('[cron healthcheck-deep] /api/health/deep unreachable', {
      error: message,
      latencyMs,
    })
    Sentry.captureException(err, {
      tags: { cron: 'healthcheck-deep' },
      extra: { url, latencyMs },
    })
    return NextResponse.json({ healthy: false, error: message, latencyMs }, { status: 503 })
  }
})
