/**
 * POST /api/v1/ask/sessions
 *
 * Create an anonymous multi-turn AnswerEngine session (Ralph 34). Returns
 * `{session_id, public_key, expires_at, message_cap}` — the caller stores
 * `public_key` client-side (localStorage / cookie / CLI dotfile) and
 * presents it on every subsequent call to authenticate. No user account
 * is required.
 *
 * Rate-limit : 30 req/min/IP, fail-open per the upstash-rate-limit-fix
 * memory (a Redis glitch must NEVER take down session creation, downstream
 * Sentry alerts surface a sustained issue within 60s).
 *
 * Why a dedicated POST instead of inferring a session from a cookie :
 *   - Some consumers are CLI / bots, not browsers — they don't ship cookies.
 *   - Explicit session_id makes the lifecycle auditable (created/expired/
 *     deleted shows up in DB without parsing application logs).
 *   - We can revoke individual sessions cheaply (soft-delete) without
 *     invalidating cookies for an entire client population.
 *
 * Memory refs :
 *   - servicesartisans-upstash-rate-limit-fix-2026-04-22
 *   - feedback_legal_data_quality (anonymous, no PII capture beyond ip_first)
 */

import { NextResponse, type NextRequest } from 'next/server'

import { createAdminClient } from '@/lib/supabase/admin'
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter'
import {
  createSession,
  MAX_MESSAGES,
  type Session,
  type SessionStoreDeps,
} from '@/lib/ask-sessions'
import { logger } from '@/lib/logger'
import { captureError } from '@/lib/monitoring/sentry'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const META_BASE = {
  api_version: 'v1' as const,
  license: 'CC-BY-4.0' as const,
  docs: '/docs/API-V1-ASK-SESSIONS.md',
  disclosure: 'See https://servicesartisans.fr/transparence-ia for AI agent details.',
}

const RESPONSE_HEADERS: Record<string, string> = {
  'Cache-Control': 'no-store',
  'X-License': 'CC-BY-4.0',
  'X-Disclosure': '/transparence-ia',
}

function buildCreateDeps(): SessionStoreDeps {
  const supabase = createAdminClient()
  return {
    insertSession: async (opts) => {
      const { data, error } = await supabase
        .from('rge_os_ask_sessions')
        .insert({
          public_key: opts.public_key,
          ip_first: opts.ip,
          user_agent_first: opts.user_agent,
        })
        .select('id, public_key, created_at, last_activity_at, expires_at, message_count')
        .single()
      if (error) throw new Error(`insertSession: ${error.message}`)
      if (!data) throw new Error('insertSession: no row returned')
      return data as Session
    },
    // Unused by POST /sessions but required to satisfy the deps shape.
    findSession: async () => null,
    insertMessage: async () => ({ id: 0 }),
    listMessages: async () => [],
    softDelete: async () => {},
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const ip = getClientIp(req.headers)
    const rl = await checkRateLimit(`v1-ask-sessions-create:${ip}`, {
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

    const userAgent = req.headers.get('user-agent')?.slice(0, 500) ?? undefined
    const session = await createSession(buildCreateDeps(), { ip, userAgent })

    return NextResponse.json(
      {
        session_id: session.id,
        public_key: session.public_key,
        expires_at: session.expires_at,
        message_cap: MAX_MESSAGES,
        _meta: META_BASE,
      },
      { status: 201, headers: RESPONSE_HEADERS }
    )
  } catch (err) {
    logger.error('v1/ask/sessions: create error', err)
    captureError(err, { tags: { route: 'api/v1/ask/sessions' } })
    return NextResponse.json(
      {
        error: { code: 'internal_error', message: 'Internal server error.' },
        _meta: META_BASE,
      },
      { status: 500, headers: RESPONSE_HEADERS }
    )
  }
}

/**
 * GET /api/v1/ask/sessions — discovery endpoint. Lets ops probes and curious
 * devs introspect the endpoint without crafting a POST body.
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    {
      endpoint: '/api/v1/ask/sessions',
      method: 'POST',
      version: 'v1',
      description:
        'Create an anonymous multi-turn AnswerEngine session. POST with empty body to obtain {session_id, public_key, expires_at}.',
      rate_limit: '30 req/min/IP fail-open',
      ttl_days: 30,
      message_cap: MAX_MESSAGES,
      license: 'CC-BY-4.0',
      docs: '/docs/API-V1-ASK-SESSIONS.md',
    },
    {
      headers: {
        'Cache-Control': 'public, max-age=3600',
        'X-License': 'CC-BY-4.0',
        'X-Disclosure': '/transparence-ia',
      },
    }
  )
}
