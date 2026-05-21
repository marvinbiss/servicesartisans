/**
 * GET /api/v1/webhooks/list
 *
 * RGE-OS pillar 8 — list webhooks owned by the integrator. Auth via
 * `Authorization: Bearer <api_key>` — we sha256 the presented key and
 * look up the matching `api_key_hash` so the plaintext key never has
 * to be persisted server-side.
 *
 * Response 200 : { webhooks: Array<{id, url, email, events, active, ...}> }
 *
 * IMPORTANT : we NEVER return the `secret` column. If the subscriber
 * lost their secret they must re-subscribe (the API key is intentionally
 * separated from the per-hook secret so an integrator can rotate one
 * without forcing all hooks to re-register).
 */

import { NextRequest, NextResponse } from 'next/server'

import { logger } from '@/lib/logger'
import { captureError } from '@/lib/monitoring/sentry'
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter'
import { createAdminClient } from '@/lib/supabase/admin'
import { hashApiKey } from '@/lib/webhooks'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const META_BASE = {
  api_version: 'v1' as const,
  license: 'CC-BY-4.0' as const,
  docs: '/docs/API-V1-WEBHOOKS.md',
}

const RESPONSE_HEADERS: Record<string, string> = {
  'Cache-Control': 'no-store',
  'X-License': 'CC-BY-4.0',
}

function extractBearer(authHeader: string | null): string | null {
  if (!authHeader) return null
  const m = /^Bearer\s+(.+)$/i.exec(authHeader.trim())
  if (!m) return null
  const key = m[1].trim()
  if (key.length < 16 || key.length > 200) return null
  return key
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const ip = getClientIp(req.headers)
    const rl = await checkRateLimit(`v1-webhooks-list:${ip}`, {
      window: 60_000,
      max: 30,
      failOpen: true,
    })
    if (!rl.allowed) {
      return NextResponse.json(
        {
          error: { code: 'rate_limit', message: 'Limite 30 req/min/IP atteinte.' },
          _meta: META_BASE,
        },
        { status: 429, headers: RESPONSE_HEADERS }
      )
    }

    const apiKey = extractBearer(req.headers.get('authorization'))
    if (!apiKey) {
      return NextResponse.json(
        {
          error: {
            code: 'unauthorized',
            message: 'Missing or malformed Authorization: Bearer <api_key>',
          },
          _meta: META_BASE,
        },
        { status: 401, headers: RESPONSE_HEADERS }
      )
    }

    const apiKeyHash = hashApiKey(apiKey)
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('rge_os_webhooks')
      .select(
        'id, url, email, events, active, created_at, updated_at, last_delivery_at, last_delivery_status, consecutive_failures'
      )
      .eq('api_key_hash', apiKeyHash)
      .order('created_at', { ascending: false })

    if (error) {
      logger.error('v1/webhooks/list: select failed', error)
      return NextResponse.json(
        {
          error: { code: 'internal_error', message: 'Failed to list webhooks.' },
          _meta: META_BASE,
        },
        { status: 500, headers: RESPONSE_HEADERS }
      )
    }

    // Empty result is legitimate (unknown api_key OR no hooks yet) — we
    // intentionally return 200 + empty array instead of 401 so we don't
    // leak whether an api_key is valid via a different status code.
    return NextResponse.json(
      { webhooks: data ?? [], count: data?.length ?? 0, _meta: META_BASE },
      { status: 200, headers: RESPONSE_HEADERS }
    )
  } catch (err) {
    logger.error('v1/webhooks/list: unexpected error', err)
    captureError(err, { tags: { route: 'api/v1/webhooks/list' } })
    return NextResponse.json(
      {
        error: { code: 'internal_error', message: 'Internal server error.' },
        _meta: META_BASE,
      },
      { status: 500, headers: RESPONSE_HEADERS }
    )
  }
}
