/**
 * POST /api/v1/webhooks/test
 *
 * RGE-OS pillar 8 — fire a mock event payload at the subscriber's URL
 * so they can validate their endpoint logic (signature verify, JSON
 * parse, schema check) before waiting for a real production event.
 *
 * Body : { id: string, secret: string, event: WebhookEvent }
 * Response 200 : { delivered: bool, status: number|null, duration_ms, error? }
 *
 * Side effects :
 *   - Inserts a row in `rge_os_webhook_deliveries` regardless of success
 *     so the integrator can correlate via /api/v1/webhooks/list later.
 *   - Updates `last_delivery_*` columns on the hook row.
 *
 * Note : even hooks with `active = false` accept tests — this lets a
 * subscriber re-validate after fixing their endpoint without first
 * re-enabling. Production event broadcasts (v0.2 cron emitters) MUST
 * filter on `active = true`.
 */

import crypto from 'node:crypto'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { logger } from '@/lib/logger'
import { captureError } from '@/lib/monitoring/sentry'
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter'
import { createAdminClient } from '@/lib/supabase/admin'
import { deliverWebhook, isValidEvent, mockPayloadFor, type WebhookEvent } from '@/lib/webhooks'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Garde d'enveloppe. Les contrôles précis (id uuid, secret présent, event
// connu, comparaison timing-safe) restent inchangés ci-dessous.
const webhookTestSchema = z
  .object({
    id: z.unknown().optional(),
    secret: z.unknown().optional(),
    event: z.unknown().optional(),
  })
  .passthrough()

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

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const ip = getClientIp(req.headers)
    const rl = await checkRateLimit(`v1-webhooks-test:${ip}`, {
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

    const parsed = webhookTestSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: { code: 'invalid_body', message: 'Body must be a JSON object' },
          _meta: META_BASE,
        },
        { status: 400, headers: RESPONSE_HEADERS }
      )
    }

    const body = parsed.data as Record<string, unknown>
    const id = typeof body.id === 'string' ? body.id : ''
    const secret = typeof body.secret === 'string' ? body.secret : ''
    const event = typeof body.event === 'string' ? body.event : ''

    if (!id || !secret || !event) {
      return NextResponse.json(
        {
          error: { code: 'invalid_params', message: 'id, secret, event are required' },
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

    if (!isValidEvent(event)) {
      return NextResponse.json(
        {
          error: { code: 'invalid_params', message: `Unknown event: ${event}`, field: 'event' },
          _meta: META_BASE,
        },
        { status: 400, headers: RESPONSE_HEADERS }
      )
    }

    const supabase = createAdminClient()
    const { data: row, error: fetchError } = await supabase
      .from('rge_os_webhooks')
      .select('id, url, secret')
      .eq('id', id)
      .maybeSingle()

    if (fetchError) {
      logger.error('v1/webhooks/test: fetch failed', fetchError, { id })
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

    const typedEvent = event as WebhookEvent
    const payload = mockPayloadFor(typedEvent)
    const result = await deliverWebhook(row.url, row.secret, typedEvent, payload)

    // Append delivery log + update hook bookkeeping. We don't fail the
    // request if these writes fail — the integrator already got their
    // signal via the response body. We log loudly so ops sees the drift.
    const deliveryInsert = await supabase.from('rge_os_webhook_deliveries').insert({
      webhook_id: id,
      event: typedEvent,
      payload: payload as Record<string, unknown>,
      attempt: 1,
      status: result.status,
      response_body_excerpt: result.body_excerpt,
      duration_ms: result.duration_ms,
      error: result.error,
    })
    if (deliveryInsert.error) {
      logger.warn('v1/webhooks/test: delivery log insert failed', {
        id,
        err: deliveryInsert.error.message,
      })
    }

    const isOk = typeof result.status === 'number' && result.status >= 200 && result.status < 300
    const updateRes = await supabase
      .from('rge_os_webhooks')
      .update({
        last_delivery_at: new Date().toISOString(),
        last_delivery_status: result.status,
        consecutive_failures: isOk ? 0 : undefined,
      })
      .eq('id', id)
    if (updateRes.error) {
      logger.warn('v1/webhooks/test: hook bookkeeping update failed', {
        id,
        err: updateRes.error.message,
      })
    }

    return NextResponse.json(
      {
        delivered: isOk,
        status: result.status,
        duration_ms: result.duration_ms,
        error: result.error,
        _meta: META_BASE,
      },
      { status: 200, headers: RESPONSE_HEADERS }
    )
  } catch (err) {
    logger.error('v1/webhooks/test: unexpected error', err)
    captureError(err, { tags: { route: 'api/v1/webhooks/test' } })
    return NextResponse.json(
      {
        error: { code: 'internal_error', message: 'Internal server error.' },
        _meta: META_BASE,
      },
      { status: 500, headers: RESPONSE_HEADERS }
    )
  }
}
