/**
 * POST /api/v1/webhooks/subscribe
 *
 * RGE-OS pillar 8 — register a webhook URL + chosen events. Returns
 * the freshly minted `secret` (used for unsubscribe + test) and
 * `api_key` (used for list) ONCE; both are unrecoverable after the
 * response is closed (only sha256(api_key) is persisted; secret is
 * stored verbatim because we need it to sign every outbound delivery,
 * so subscribers should treat it as sensitive).
 *
 * Body : { url: string, email?: string, events: WebhookEvent[] }
 * Response 201 : { id, secret, api_key, events, created_at, _meta }
 *
 * Rate-limit : 30 req/min/IP, fail-open per
 * memory `servicesartisans-upstash-rate-limit-fix-2026-04-22`.
 */

import { NextRequest, NextResponse } from 'next/server'

import { logger } from '@/lib/logger'
import { captureError } from '@/lib/monitoring/sentry'
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  generateApiKey,
  generateSecret,
  hashApiKey,
  isValidEvent,
  validateEmail,
  validateWebhookUrl,
  type WebhookEvent,
} from '@/lib/webhooks'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const META_BASE = {
  api_version: 'v1' as const,
  license: 'CC-BY-4.0' as const,
  docs: '/docs/API-V1-WEBHOOKS.md',
  disclosure: 'See https://servicesartisans.fr/transparence-ia for AI agent details.',
}

const RESPONSE_HEADERS: Record<string, string> = {
  'Cache-Control': 'no-store',
  'X-License': 'CC-BY-4.0',
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const ip = getClientIp(req.headers)
    const rl = await checkRateLimit(`v1-webhooks-subscribe:${ip}`, {
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

    const urlCheck = validateWebhookUrl(body.url)
    if (!urlCheck.ok) {
      return NextResponse.json(
        {
          error: { code: 'invalid_params', message: urlCheck.reason, field: 'url' },
          _meta: META_BASE,
        },
        { status: 400, headers: RESPONSE_HEADERS }
      )
    }

    const emailCheck = validateEmail(body.email)
    if (!emailCheck.ok) {
      return NextResponse.json(
        {
          error: { code: 'invalid_params', message: emailCheck.reason, field: 'email' },
          _meta: META_BASE,
        },
        { status: 400, headers: RESPONSE_HEADERS }
      )
    }

    if (!Array.isArray(body.events) || body.events.length === 0) {
      return NextResponse.json(
        {
          error: {
            code: 'invalid_params',
            message: 'events must be a non-empty array of WebhookEvent strings',
            field: 'events',
          },
          _meta: META_BASE,
        },
        { status: 400, headers: RESPONSE_HEADERS }
      )
    }

    const events: WebhookEvent[] = []
    for (const raw of body.events) {
      if (typeof raw !== 'string' || !isValidEvent(raw)) {
        return NextResponse.json(
          {
            error: {
              code: 'invalid_params',
              message: `Unknown event: ${String(raw)}`,
              field: 'events',
            },
            _meta: META_BASE,
          },
          { status: 400, headers: RESPONSE_HEADERS }
        )
      }
      events.push(raw)
    }

    const secret = generateSecret()
    const apiKey = generateApiKey()
    const apiKeyHash = hashApiKey(apiKey)

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('rge_os_webhooks')
      .insert({
        url: urlCheck.value,
        secret,
        email: emailCheck.value || null,
        events,
        active: true,
        api_key_hash: apiKeyHash,
      })
      .select('id, events, created_at')
      .single()

    if (error || !data) {
      logger.error('v1/webhooks/subscribe: insert failed', error, { url: urlCheck.value })
      return NextResponse.json(
        {
          error: { code: 'internal_error', message: 'Failed to register webhook.' },
          _meta: META_BASE,
        },
        { status: 500, headers: RESPONSE_HEADERS }
      )
    }

    return NextResponse.json(
      {
        id: data.id,
        secret,
        api_key: apiKey,
        events: data.events,
        created_at: data.created_at,
        _meta: {
          ...META_BASE,
          notice:
            'Store `secret` and `api_key` securely — they are shown ONCE and cannot be recovered.',
        },
      },
      { status: 201, headers: RESPONSE_HEADERS }
    )
  } catch (err) {
    logger.error('v1/webhooks/subscribe: unexpected error', err)
    captureError(err, { tags: { route: 'api/v1/webhooks/subscribe' } })
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
      endpoint: '/api/v1/webhooks/subscribe',
      method: 'POST',
      body_schema: { url: 'string (https in prod)', email: 'string?', events: 'WebhookEvent[]' },
      response: '201 { id, secret, api_key, events, created_at }',
      rate_limit: '30 req/min/IP fail-open',
      docs: '/docs/API-V1-WEBHOOKS.md',
    },
    { headers: { 'Cache-Control': 'public, max-age=3600' } }
  )
}
