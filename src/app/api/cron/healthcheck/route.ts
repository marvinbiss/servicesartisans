/**
 * Cron : heartbeat global du site
 *
 * Pourquoi :
 *   L'incident GSC 2026-04-26 (company-identity throw runtime → 64% des pages
 *   en 500 pendant ~13h) n'a été détecté qu'à l'œil. Aucun heartbeat externe
 *   ne pingait `/api/health`, donc Sentry et Vercel ne signalaient rien tant
 *   que personne ne regardait les logs.
 *
 *   Ce cron appelle /api/health toutes les 5 min. Si le check fail (timeout,
 *   503, ou erreur applicative globale), il escalade vers Sentry et,
 *   optionnellement, ping un heartbeat BetterStack (var BETTERSTACK_HEARTBEAT_HEALTH).
 *
 * Schedule : toutes les 5 minutes (voir vercel.json).
 * Sortie   : 200 si /api/health répond OK, 503 sinon.
 */

import { NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { logger } from '@/lib/logger'
import { pingHeartbeat } from '@/lib/monitoring/heartbeat'
import { verifyCronSecret } from '@/lib/auth/verify-cron-secret'

export const dynamic = 'force-dynamic'

const HEALTH_CHECK_TIMEOUT_MS = 8000

export async function GET(request: Request) {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Serveur mal configuré' }, { status: 500 })
  }
  const authHeader = request.headers.get('authorization')
  if (!verifyCronSecret(authHeader)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://servicesartisans.fr'
  const url = `${baseUrl}/api/health`
  const startedAt = Date.now()

  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(HEALTH_CHECK_TIMEOUT_MS),
      cache: 'no-store',
    })
    const latencyMs = Date.now() - startedAt
    const body = (await res.json().catch(() => ({}))) as Record<string, unknown>

    if (!res.ok) {
      logger.error('[cron healthcheck] Health check failed', {
        status: res.status,
        latencyMs,
        body,
      })
      Sentry.captureMessage('Healthcheck failed', {
        level: 'error',
        tags: { cron: 'healthcheck', http_status: String(res.status) },
        extra: { url, latencyMs, body },
      })
      return NextResponse.json(
        { healthy: false, status: res.status, latencyMs, body },
        {
          status: 503,
        }
      )
    }

    await pingHeartbeat('HEALTH').catch(() => undefined)

    logger.info('[cron healthcheck] OK', { latencyMs })
    return NextResponse.json({ healthy: true, latencyMs, body })
  } catch (err) {
    const latencyMs = Date.now() - startedAt
    const message = err instanceof Error ? err.message : String(err)
    logger.error('[cron healthcheck] /api/health unreachable', {
      error: message,
      latencyMs,
    })
    Sentry.captureException(err, {
      tags: { cron: 'healthcheck' },
      extra: { url, latencyMs },
    })
    return NextResponse.json({ healthy: false, error: message, latencyMs }, { status: 503 })
  }
}
