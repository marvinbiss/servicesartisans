/**
 * Cron : health-check Upstash Redis
 *
 * Pourquoi :
 *   L'incident 2026-04-22 (fail-close Upstash → 429 sur /api/devis + signin +
 *   62.1% échec exploration GSC) a duré ~24h avant d'être détecté visuellement.
 *   Ce cron ping Upstash régulièrement, rapporte la latence + état du circuit
 *   breaker rate-limiter, et escalade vers Sentry si Upstash est down/lent.
 *
 * Schedule : toutes les 5 minutes (voir vercel.json).
 * Sortie   : JSON { healthy, latencyMs, circuit } + 503 si unhealthy.
 */

import { NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { logger } from '@/lib/logger'
import { pingHeartbeat } from '@/lib/monitoring/heartbeat'
import { _getCircuitBreakerState } from '@/lib/rate-limiter'

export const dynamic = 'force-dynamic'

const REDIS_LATENCY_DEGRADED_MS = 500
const REDIS_LATENCY_UNHEALTHY_MS = 1800
const PING_TIMEOUT_MS = 2000

type CheckStatus = 'healthy' | 'degraded' | 'unhealthy'

export async function GET(request: Request) {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Serveur mal configuré' }, { status: 500 })
  }
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const redisUrl = process.env.UPSTASH_REDIS_REST_URL
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!redisUrl || !redisToken) {
    // Pas d'Upstash configuré → on ne peut rien vérifier, log info et exit OK.
    logger.info('[redis-health] Upstash not configured — skipping check')
    return NextResponse.json({ status: 'skipped', reason: 'not-configured' })
  }

  let status: CheckStatus = 'healthy'
  let latencyMs: number | null = null
  let errorMessage: string | null = null

  const start = Date.now()
  try {
    const res = await fetch(`${redisUrl}/ping`, {
      headers: { Authorization: `Bearer ${redisToken}` },
      signal: AbortSignal.timeout(PING_TIMEOUT_MS),
      cache: 'no-store',
    })
    latencyMs = Date.now() - start

    if (!res.ok) {
      status = 'unhealthy'
      errorMessage = `HTTP ${res.status}`
    } else if (latencyMs > REDIS_LATENCY_UNHEALTHY_MS) {
      status = 'unhealthy'
      errorMessage = `latency ${latencyMs}ms > ${REDIS_LATENCY_UNHEALTHY_MS}ms`
    } else if (latencyMs > REDIS_LATENCY_DEGRADED_MS) {
      status = 'degraded'
      errorMessage = `latency ${latencyMs}ms > ${REDIS_LATENCY_DEGRADED_MS}ms`
    }
  } catch (err) {
    latencyMs = Date.now() - start
    status = 'unhealthy'
    errorMessage = err instanceof Error ? err.message : String(err)
  }

  const circuit = _getCircuitBreakerState()

  // Escalation policy : unhealthy → Sentry error. Degraded → Sentry warning.
  // Circuit ouvert → toujours Sentry warning (signal que l'incident est actif).
  if (status === 'unhealthy') {
    logger.error('[redis-health] Upstash unhealthy', undefined, {
      latencyMs,
      errorMessage,
      circuit,
    })
    Sentry.captureMessage('Upstash Redis unhealthy', {
      level: 'error',
      tags: { integration: 'upstash', component: 'health-check' },
      extra: { latencyMs, errorMessage, circuit },
    })
  } else if (status === 'degraded' || circuit.openNow) {
    logger.warn('[redis-health] Upstash degraded or circuit open', {
      latencyMs,
      errorMessage,
      circuit,
    })
    Sentry.captureMessage('Upstash Redis degraded', {
      level: 'warning',
      tags: { integration: 'upstash', component: 'health-check' },
      extra: { latencyMs, errorMessage, circuit },
    })
  } else {
    logger.info('[redis-health] Upstash healthy', { latencyMs })
  }

  await pingHeartbeat('redis-health')

  return NextResponse.json(
    {
      status,
      latencyMs,
      errorMessage,
      circuit,
      timestamp: new Date().toISOString(),
    },
    { status: status === 'unhealthy' ? 503 : 200 }
  )
}
