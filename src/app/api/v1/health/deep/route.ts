/**
 * GET /api/v1/health/deep — Public deep health endpoint
 *
 * Pings Supabase + Upstash + checks LLM provider env vars. Returns
 * per-dep latency_ms + overall status. HTTP 200 on ok/degraded so that
 * monitoring tools that flag non-2xx only fire on hard failures (any
 * critical dep failing). HTTP 503 on fail.
 *
 * Rate-limit : 30 req/min/IP, fail-open (Redis outage must not block
 * external monitors hammering this endpoint). See memory
 * `servicesartisans-upstash-rate-limit-fix-2026-04-22`.
 *
 * Distinct from `/api/cron/healthcheck-deep` (admin-only).
 */

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter'
import { logger } from '@/lib/logger'
import { captureError } from '@/lib/monitoring/sentry'
import { checkSupabase, checkUpstash, checkLlmKeysPresent, aggregateStatus } from '../_checks'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const UPSTASH_PING_TIMEOUT_MS = 3000

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const ip = getClientIp(req.headers)
    const rl = await checkRateLimit(`v1-health-deep:${ip}`, {
      window: 60_000,
      max: 30,
      failOpen: true,
    })
    if (!rl.allowed) {
      return NextResponse.json(
        { status: 'rate_limit', message: 'Limite 30 req/min/IP atteinte.' },
        { status: 429 }
      )
    }

    const supabasePing = async (): Promise<{ ok: boolean; error?: string }> => {
      try {
        const supabase = createAdminClient()
        const { error } = await supabase
          .from('providers')
          .select('id', { count: 'exact', head: true })
          .limit(1)
        if (error) return { ok: false, error: error.message }
        return { ok: true }
      } catch (err) {
        return { ok: false, error: err instanceof Error ? err.message : String(err) }
      }
    }

    const upstashPing = async (): Promise<{ ok: boolean; error?: string }> => {
      const url = process.env.UPSTASH_REDIS_REST_URL
      const token = process.env.UPSTASH_REDIS_REST_TOKEN
      if (!url || !token) return { ok: false, error: 'env_missing' }
      try {
        const response = await fetch(`${url}/ping`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
          signal: AbortSignal.timeout(UPSTASH_PING_TIMEOUT_MS),
        })
        if (!response.ok) return { ok: false, error: `http_${response.status}` }
        return { ok: true }
      } catch (err) {
        return { ok: false, error: err instanceof Error ? err.message : String(err) }
      }
    }

    const checks = [
      await checkSupabase({ supabasePing }),
      await checkUpstash({ upstashPing }),
      checkLlmKeysPresent({}),
    ]
    const overall = aggregateStatus(checks)
    const httpStatus = overall === 'fail' ? 503 : 200

    return NextResponse.json(
      {
        status: overall,
        checks,
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
      {
        status: httpStatus,
        headers: {
          'Cache-Control': 'no-store',
          'X-License': 'CC-BY-4.0',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  } catch (err) {
    logger.error('v1/health/deep: error', err)
    captureError(err, { tags: { route: 'api/v1/health/deep' } })
    return NextResponse.json({ status: 'fail', message: 'Internal error.' }, { status: 500 })
  }
}
