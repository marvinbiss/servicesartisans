/**
 * POST /api/v1/webhooks/admin-emit
 *
 * Manual trigger for the Ralph 24+29 fan-out emitter. Closes the loop on
 * the v0.2 webhook pillar by letting an operator inject a real signed
 * event into every active subscriber's endpoint on demand.
 *
 * Why a separate endpoint vs reusing /api/v1/webhooks/test :
 *   - /test fires at ONE webhook with a static mock payload. /admin-emit
 *     fans out to the WHOLE flock with a caller-supplied payload, which
 *     is the shape the production cron emitters (ADEME / MPR / CEE /
 *     transparence-ia, Sprint 2) will use.
 *   - /test is integrator-facing (auth by hook secret). /admin-emit is
 *     operator-facing (auth by WEBHOOKS_ADMIN_API_KEY env, separate
 *     from CRON_SECRET so rotations stay independent).
 *
 * Body : { event: WebhookEvent, payload: Record<string, unknown> }
 * Auth : `Authorization: Bearer <WEBHOOKS_ADMIN_API_KEY>` (env required;
 *        if the env is missing all requests 401 — no bypass).
 * Rate limit : 30 req/min/IP, fail-open (rate-limit fail-open rule —
 *              memory `servicesartisans-upstash-rate-limit-fix-2026-04-22`).
 */

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

import { logger } from '@/lib/logger'
import { captureError } from '@/lib/monitoring/sentry'
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter'
import { createAdminClient } from '@/lib/supabase/admin'
import { deliverWebhook } from '@/lib/webhooks/delivery'
import { emitWebhookEvent, type EmitDeps, type SubscriberRow } from '@/lib/webhooks/emit'
import { isValidEvent, type WebhookEvent, type WebhookPayloadByEvent } from '@/lib/webhooks/events'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Garde d'enveloppe. Les codes d'erreur précis (invalid_event/invalid_payload)
// restent produits par les checks dédiés ci-dessous.
const adminEmitSchema = z
  .object({ event: z.unknown().optional(), payload: z.unknown().optional() })
  .passthrough()

const META_BASE = {
  api_version: 'v1' as const,
  license: 'CC-BY-4.0' as const,
  docs: '/docs/WEBHOOK-EMITTER.md',
}

const RESPONSE_HEADERS: Record<string, string> = {
  'Cache-Control': 'no-store',
  'X-License': 'CC-BY-4.0',
}

function authorize(req: NextRequest): boolean {
  const expected = process.env.WEBHOOKS_ADMIN_API_KEY ?? ''
  if (!expected) return false
  const auth = req.headers.get('authorization') ?? ''
  return auth === `Bearer ${expected}`
}

function buildSupabaseDeps(): EmitDeps {
  const supabase = createAdminClient()
  return {
    deliver: deliverWebhook,
    fetchSubscribers: async (evt): Promise<SubscriberRow[]> => {
      const { data, error } = await supabase
        .from('rge_os_webhooks')
        .select('id, url, secret, consecutive_failures, active, events')
        .eq('active', true)
        .contains('events', [evt])
      if (error) throw new Error(`fetchSubscribers: ${error.message}`)
      return (data ?? []).map((r) => ({
        id: r.id,
        url: r.url,
        secret: r.secret,
        consecutive_failures: r.consecutive_failures ?? 0,
      }))
    },
    recordDelivery: async (args) => {
      const { error } = await supabase.from('rge_os_webhook_deliveries').insert({
        webhook_id: args.webhook_id,
        event: args.event,
        payload: args.payload,
        attempt: args.attempt,
        status: args.status,
        response_body_excerpt: args.body_excerpt,
        duration_ms: args.duration_ms,
        error: args.error,
        next_retry_at: args.next_retry_at ? args.next_retry_at.toISOString() : null,
        final_status_at: args.final_status_at ? args.final_status_at.toISOString() : null,
      })
      if (error) {
        logger.warn('webhooks.emit.record_failed', {
          webhook_id: args.webhook_id,
          error: error.message,
        })
      }
    },
    updateHookBookkeeping: async (args) => {
      const { error } = await supabase
        .from('rge_os_webhooks')
        .update({
          last_delivery_at: args.last_delivery_at.toISOString(),
          last_delivery_status: args.last_delivery_status,
          consecutive_failures: args.consecutive_failures,
        })
        .eq('id', args.webhook_id)
      if (error) {
        logger.warn('webhooks.emit.bookkeeping_failed', {
          webhook_id: args.webhook_id,
          error: error.message,
        })
      }
    },
    disableHook: async (webhookId) => {
      const { error } = await supabase
        .from('rge_os_webhooks')
        .update({ active: false })
        .eq('id', webhookId)
      if (error) {
        logger.warn('webhooks.emit.disable_failed', { webhook_id: webhookId, error: error.message })
      }
    },
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    if (!authorize(req)) {
      return NextResponse.json(
        {
          error: { code: 'unauthorized', message: 'Admin API key required.' },
          _meta: META_BASE,
        },
        { status: 401, headers: RESPONSE_HEADERS }
      )
    }

    const ip = getClientIp(req.headers)
    const rl = await checkRateLimit(`v1-webhooks-admin-emit:${ip}`, {
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

    const parsed = adminEmitSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: { code: 'invalid_body', message: 'Body must be a JSON object' },
          _meta: META_BASE,
        },
        { status: 400, headers: RESPONSE_HEADERS }
      )
    }

    const body = parsed.data as { event?: unknown; payload?: unknown }

    if (typeof body.event !== 'string' || !isValidEvent(body.event)) {
      return NextResponse.json(
        {
          error: {
            code: 'invalid_event',
            message: 'event must be a known WebhookEvent',
            field: 'event',
          },
          _meta: META_BASE,
        },
        { status: 400, headers: RESPONSE_HEADERS }
      )
    }

    if (!body.payload || typeof body.payload !== 'object' || Array.isArray(body.payload)) {
      return NextResponse.json(
        {
          error: {
            code: 'invalid_payload',
            message: 'payload must be a JSON object',
            field: 'payload',
          },
          _meta: META_BASE,
        },
        { status: 400, headers: RESPONSE_HEADERS }
      )
    }

    const event = body.event as WebhookEvent
    // We accept any object shape here — strict WebhookPayloadByEvent typing
    // is enforced at the production cron emitter sites (Sprint 2). The admin
    // trigger is by design a debug tool where ops may want to send a
    // hand-crafted payload that doesn't fully satisfy the schema yet.
    const payload = body.payload as WebhookPayloadByEvent[WebhookEvent]

    const deps = buildSupabaseDeps()
    const summary = await emitWebhookEvent(event, payload, deps)

    return NextResponse.json(
      { ok: true, summary, _meta: META_BASE },
      { status: 200, headers: RESPONSE_HEADERS }
    )
  } catch (err) {
    logger.error('v1/webhooks/admin-emit: error', err)
    captureError(err, { tags: { route: 'api/v1/webhooks/admin-emit' } })
    return NextResponse.json(
      {
        error: { code: 'internal_error', message: 'Internal server error.' },
        _meta: META_BASE,
      },
      { status: 500, headers: RESPONSE_HEADERS }
    )
  }
}
