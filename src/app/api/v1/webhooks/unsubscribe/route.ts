/**
 * DELETE /api/v1/webhooks/unsubscribe
 *
 * RGE-OS pillar 8 — unsubscribe a webhook by id + secret. The secret
 * acts as the authentication credential (only the subscriber knows it,
 * and we stored it at registration). We `timingSafeEqual`-compare the
 * provided secret with the stored value to avoid leaking which secrets
 * are close to the real one via response time.
 *
 * Body : { id: string, secret: string }
 * Response 200 : { id, active: false } | 403 invalid_secret | 404 not_found
 *
 * Soft delete (`active = false`) preserves the delivery history for
 * audit and lets us re-enable on the integrator's request without
 * losing context.
 */

import crypto from 'node:crypto'

import { NextRequest, NextResponse } from 'next/server'

import { logger } from '@/lib/logger'
import { captureError } from '@/lib/monitoring/sentry'
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter'
import { createAdminClient } from '@/lib/supabase/admin'

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

function isUuid(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s)
}

function timingSafeStringEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  try {
    return crypto.timingSafeEqual(Buffer.from(a, 'utf8'), Buffer.from(b, 'utf8'))
  } catch {
    return false
  }
}

export async function DELETE(req: NextRequest): Promise<NextResponse> {
  try {
    const ip = getClientIp(req.headers)
    const rl = await checkRateLimit(`v1-webhooks-unsubscribe:${ip}`, {
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

    let raw: unknown
    try {
      raw = await req.json()
    } catch {
      return NextResponse.json(
        {
          error: { code: 'invalid_body', message: 'Body must be valid JSON' },
          _meta: META_BASE,
        },
        { status: 400, headers: RESPONSE_HEADERS }
      )
    }

    if (raw === null || typeof raw !== 'object') {
      return NextResponse.json(
        {
          error: { code: 'invalid_body', message: 'Body must be a JSON object' },
          _meta: META_BASE,
        },
        { status: 400, headers: RESPONSE_HEADERS }
      )
    }

    const body = raw as Record<string, unknown>
    const id = typeof body.id === 'string' ? body.id : ''
    const secret = typeof body.secret === 'string' ? body.secret : ''

    if (!id || !secret) {
      return NextResponse.json(
        {
          error: { code: 'invalid_params', message: 'id and secret are required' },
          _meta: META_BASE,
        },
        { status: 400, headers: RESPONSE_HEADERS }
      )
    }

    if (!isUuid(id)) {
      return NextResponse.json(
        {
          error: { code: 'invalid_params', message: 'id must be a uuid', field: 'id' },
          _meta: META_BASE,
        },
        { status: 400, headers: RESPONSE_HEADERS }
      )
    }

    const supabase = createAdminClient()
    const { data: row, error: fetchError } = await supabase
      .from('rge_os_webhooks')
      .select('id, secret, active')
      .eq('id', id)
      .maybeSingle()

    if (fetchError) {
      logger.error('v1/webhooks/unsubscribe: fetch failed', fetchError, { id })
      return NextResponse.json(
        {
          error: { code: 'internal_error', message: 'Failed to lookup webhook.' },
          _meta: META_BASE,
        },
        { status: 500, headers: RESPONSE_HEADERS }
      )
    }

    if (!row) {
      return NextResponse.json(
        { error: { code: 'not_found', message: 'Webhook not found.' }, _meta: META_BASE },
        { status: 404, headers: RESPONSE_HEADERS }
      )
    }

    if (!timingSafeStringEqual(row.secret, secret)) {
      return NextResponse.json(
        { error: { code: 'invalid_secret', message: 'Secret does not match.' }, _meta: META_BASE },
        { status: 403, headers: RESPONSE_HEADERS }
      )
    }

    const { error: updateError } = await supabase
      .from('rge_os_webhooks')
      .update({ active: false })
      .eq('id', id)

    if (updateError) {
      logger.error('v1/webhooks/unsubscribe: update failed', updateError, { id })
      return NextResponse.json(
        {
          error: { code: 'internal_error', message: 'Failed to unsubscribe webhook.' },
          _meta: META_BASE,
        },
        { status: 500, headers: RESPONSE_HEADERS }
      )
    }

    return NextResponse.json(
      { id, active: false, _meta: META_BASE },
      { status: 200, headers: RESPONSE_HEADERS }
    )
  } catch (err) {
    logger.error('v1/webhooks/unsubscribe: unexpected error', err)
    captureError(err, { tags: { route: 'api/v1/webhooks/unsubscribe' } })
    return NextResponse.json(
      {
        error: { code: 'internal_error', message: 'Internal server error.' },
        _meta: META_BASE,
      },
      { status: 500, headers: RESPONSE_HEADERS }
    )
  }
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    {
      endpoint: '/api/v1/webhooks/unsubscribe',
      method: 'DELETE',
      body_schema: { id: 'uuid', secret: 'string' },
      response: '200 { id, active:false } | 403 invalid_secret | 404 not_found',
      docs: '/docs/API-V1-WEBHOOKS.md',
    },
    { headers: { 'Cache-Control': 'public, max-age=3600' } }
  )
}
