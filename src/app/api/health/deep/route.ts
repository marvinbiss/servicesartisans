/**
 * Deep health check — vérifie l'état des dépendances externes critiques
 * (Pipedrive, Resend, Sonergia) en plus du `/api/health` standard.
 *
 * Pourquoi : le `/api/health` (cron 5min) couvre Supabase + Redis + Stripe-config.
 * Mais Pipedrive et Resend peuvent tomber côté tiers SANS qu'on s'en aperçoive
 * avant que le pipeline lead se casse silencieusement (Pipedrive DLQ retry 6h
 * absorbe les pannes courtes mais pas les longues, Resend continue à dépiler
 * mais aucun email n'arrive). Ce deep-check permet d'alerter Sentry plus tôt.
 *
 * Coût : ~3-5s par run vs 500ms pour `/api/health`. À ne pas pinger toutes
 * les 5min (quota API tiers). Cron dédié `/api/cron/healthcheck-deep` toutes
 * les 15min (vercel.json).
 *
 * Sortie : 200 si tous healthy ou degraded, 503 si tous unhealthy.
 * Cache-Control: no-store (toujours frais).
 */

import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { captureError } from '@/lib/monitoring/sentry'
import { verifyCronSecret } from '@/lib/auth/verify-cron-secret'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

type Status = 'healthy' | 'degraded' | 'unhealthy' | 'not_configured'
type Check = { status: Status; latency?: number; error?: string }

// Per-dep timeout (3s). En cumul + parallel : ~3s wall-clock max.
const DEP_TIMEOUT_MS = 3_000

async function checkPipedrive(): Promise<Check> {
  const token = process.env.PIPEDRIVE_API_TOKEN
  if (!token) return { status: 'not_configured' }

  const start = Date.now()
  try {
    const res = await fetch('https://api.pipedrive.com/v1/users/me', {
      signal: AbortSignal.timeout(DEP_TIMEOUT_MS),
      cache: 'no-store',
      headers: { 'x-api-token': token },
    })
    const latency = Date.now() - start
    if (!res.ok) {
      return { status: 'unhealthy', latency, error: `HTTP ${res.status}` }
    }
    return { status: latency > 1500 ? 'degraded' : 'healthy', latency }
  } catch (err) {
    return {
      status: 'unhealthy',
      latency: Date.now() - start,
      error: err instanceof Error ? err.message : String(err),
    }
  }
}

async function checkResend(): Promise<Check> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return { status: 'not_configured' }

  const start = Date.now()
  try {
    const res = await fetch('https://api.resend.com/domains', {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(DEP_TIMEOUT_MS),
      cache: 'no-store',
    })
    const latency = Date.now() - start
    if (!res.ok) {
      return { status: 'unhealthy', latency, error: `HTTP ${res.status}` }
    }
    return { status: latency > 1500 ? 'degraded' : 'healthy', latency }
  } catch (err) {
    return {
      status: 'unhealthy',
      latency: Date.now() - start,
      error: err instanceof Error ? err.message : String(err),
    }
  }
}

async function checkSonergia(): Promise<Check> {
  // Sonergia (mandataire CEE) — endpoint santé public.
  const start = Date.now()
  try {
    const res = await fetch('https://www.sonergia.fr/robots.txt', {
      signal: AbortSignal.timeout(DEP_TIMEOUT_MS),
      cache: 'no-store',
    })
    const latency = Date.now() - start
    if (!res.ok) {
      return { status: 'unhealthy', latency, error: `HTTP ${res.status}` }
    }
    return { status: latency > 2000 ? 'degraded' : 'healthy', latency }
  } catch (err) {
    return {
      status: 'unhealthy',
      latency: Date.now() - start,
      error: err instanceof Error ? err.message : String(err),
    }
  }
}

async function checkAdemeRge(): Promise<Check> {
  // ADEME annuaire-entreprises RGE — source officielle data RGE.
  const start = Date.now()
  try {
    const res = await fetch(
      'https://data.ademe.fr/api/records/1.0/search/?dataset=liste-des-entreprises-rge-2&rows=1',
      { signal: AbortSignal.timeout(DEP_TIMEOUT_MS), cache: 'no-store' }
    )
    const latency = Date.now() - start
    if (!res.ok) {
      return { status: 'unhealthy', latency, error: `HTTP ${res.status}` }
    }
    return { status: latency > 2000 ? 'degraded' : 'healthy', latency }
  } catch (err) {
    return {
      status: 'unhealthy',
      latency: Date.now() - start,
      error: err instanceof Error ? err.message : String(err),
    }
  }
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (!verifyCronSecret(authHeader)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const startTime = Date.now()

  // Parallel — wall-clock = max(per-dep timeout) ≈ 3s.
  const [pipedrive, resend, sonergia, ademe] = await Promise.all([
    checkPipedrive(),
    checkResend(),
    checkSonergia(),
    checkAdemeRge(),
  ])

  const checks: Record<string, Check> = { pipedrive, resend, sonergia, ademe_rge: ademe }

  const monitored = Object.values(checks).filter((c) => c.status !== 'not_configured')
  const allUnhealthy = monitored.length > 0 && monitored.every((c) => c.status === 'unhealthy')
  const anyUnhealthy = monitored.some((c) => c.status === 'unhealthy')
  const anyDegraded = monitored.some((c) => c.status === 'degraded')

  let overallStatus: Status = 'healthy'
  if (allUnhealthy) overallStatus = 'unhealthy'
  else if (anyUnhealthy || anyDegraded) overallStatus = 'degraded'

  const totalLatency = Date.now() - startTime

  if (overallStatus === 'unhealthy') {
    logger.error('Deep health check unhealthy', undefined, { checks, totalLatency })
    captureError(new Error('Deep health check unhealthy'), {
      tags: { component: 'health-deep', critical: 'true' },
      extras: { checks, totalLatency },
    })
  } else if (overallStatus === 'degraded') {
    logger.warn('Deep health check degraded', { checks, totalLatency })
  }

  return NextResponse.json(
    {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      latency: totalLatency,
      checks,
    },
    {
      status: overallStatus === 'unhealthy' ? 503 : 200,
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    }
  )
}
