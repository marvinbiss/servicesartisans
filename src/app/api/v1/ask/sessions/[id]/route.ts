/**
 * GET    /api/v1/ask/sessions/:id?public_key=...   → list messages
 * DELETE /api/v1/ask/sessions/:id  body: {public_key} → soft-delete session
 *
 * Both require the caller to present the `public_key` returned by POST
 * /api/v1/ask/sessions. Comparison is timing-safe (see store.ts).
 *
 * Ralph 34 design notes :
 *   - GET caps the message page at 100. A future v0.2 can add a
 *     `?before=<ts>&limit=` paginator if a session ever exceeds the cap.
 *   - DELETE is soft. The row stays in DB with `deleted_at` set, both to
 *     keep `ON DELETE CASCADE` from the messages table cheap (no extra
 *     deletes) and to give ops a 24h window to restore an accidental
 *     wipe. A purge cron is out of scope for this iteration.
 *   - 404 vs 410 : 404 if session_id doesn't exist OR soft-deleted; 410
 *     if expired. The distinction matters for client UX — a 410 means
 *     "start a fresh session", a 404 means "this id is wrong".
 *
 * Memory refs :
 *   - servicesartisans-upstash-rate-limit-fix-2026-04-22 (fail-open)
 *   - feedback_legal_data_quality (no PII surfaced beyond what the
 *     caller already sent in earlier turns)
 */

import { NextResponse, type NextRequest } from 'next/server'

import { createAdminClient } from '@/lib/supabase/admin'
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter'
import {
  authenticateSession,
  DEFAULT_HISTORY_LIMIT,
  type Message,
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
}

const RESPONSE_HEADERS: Record<string, string> = {
  'Cache-Control': 'no-store',
  'X-License': 'CC-BY-4.0',
  'X-Disclosure': '/transparence-ia',
}

function buildStoreDeps(): SessionStoreDeps {
  const supabase = createAdminClient()
  return {
    insertSession: async () => {
      throw new Error('insertSession unsupported on /sessions/[id] route')
    },
    findSession: async (id) => {
      const { data, error } = await supabase
        .from('rge_os_ask_sessions')
        .select(
          'id, public_key, created_at, last_activity_at, expires_at, message_count, deleted_at'
        )
        .eq('id', id)
        .maybeSingle()
      if (error) throw new Error(`findSession: ${error.message}`)
      if (!data) return null
      if (data.deleted_at) return null
      return {
        id: data.id,
        public_key: data.public_key,
        created_at: data.created_at,
        last_activity_at: data.last_activity_at,
        expires_at: data.expires_at,
        message_count: data.message_count,
      } as Session
    },
    insertMessage: async () => ({ id: 0 }),
    listMessages: async (session_id, limit) => {
      const { data, error } = await supabase
        .from('rge_os_ask_messages')
        .select('id, role, content, classification, citations, trace, created_at')
        .eq('session_id', session_id)
        .order('created_at', { ascending: true })
        .limit(limit ?? DEFAULT_HISTORY_LIMIT)
      if (error) throw new Error(`listMessages: ${error.message}`)
      return (data ?? []) as Message[]
    },
    softDelete: async (session_id) => {
      const { error } = await supabase
        .from('rge_os_ask_sessions')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', session_id)
      if (error) throw new Error(`softDelete: ${error.message}`)
    },
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const ip = getClientIp(req.headers)
    const rl = await checkRateLimit(`v1-ask-sessions-get:${ip}`, {
      window: 60_000,
      max: 60,
      failOpen: true,
    })
    if (!rl.allowed) {
      return NextResponse.json(
        {
          error: { code: 'rate_limit', message: 'Limite 60 req/min/IP atteinte.' },
          _meta: META_BASE,
        },
        { status: 429, headers: RESPONSE_HEADERS }
      )
    }

    const publicKey = req.nextUrl.searchParams.get('public_key') ?? ''
    if (!publicKey) {
      return NextResponse.json(
        {
          error: { code: 'missing_public_key', message: 'public_key query param required.' },
          _meta: META_BASE,
        },
        { status: 400, headers: RESPONSE_HEADERS }
      )
    }

    const deps = buildStoreDeps()
    const auth = await authenticateSession(deps, params.id, publicKey)
    if (!auth.ok) {
      return NextResponse.json(
        { error: { code: auth.reason, message: auth.reason }, _meta: META_BASE },
        { status: auth.status, headers: RESPONSE_HEADERS }
      )
    }

    const messages = await deps.listMessages(params.id, DEFAULT_HISTORY_LIMIT)
    return NextResponse.json(
      {
        session: {
          id: auth.session.id,
          message_count: auth.session.message_count,
          expires_at: auth.session.expires_at,
          last_activity_at: auth.session.last_activity_at,
        },
        messages,
        _meta: META_BASE,
      },
      { status: 200, headers: RESPONSE_HEADERS }
    )
  } catch (err) {
    logger.error('v1/ask/sessions/[id]: GET error', err)
    captureError(err, { tags: { route: 'api/v1/ask/sessions/[id]' } })
    return NextResponse.json(
      {
        error: { code: 'internal_error', message: 'Internal server error.' },
        _meta: META_BASE,
      },
      { status: 500, headers: RESPONSE_HEADERS }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const ip = getClientIp(req.headers)
    const rl = await checkRateLimit(`v1-ask-sessions-del:${ip}`, {
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

    let body: { public_key?: unknown } = {}
    try {
      body = (await req.json()) as { public_key?: unknown }
    } catch {
      return NextResponse.json(
        {
          error: { code: 'invalid_body', message: 'Body must be valid JSON.' },
          _meta: META_BASE,
        },
        { status: 400, headers: RESPONSE_HEADERS }
      )
    }
    const publicKey = typeof body.public_key === 'string' ? body.public_key : ''
    if (!publicKey) {
      return NextResponse.json(
        {
          error: { code: 'missing_public_key', message: 'public_key required in body.' },
          _meta: META_BASE,
        },
        { status: 400, headers: RESPONSE_HEADERS }
      )
    }

    const deps = buildStoreDeps()
    const auth = await authenticateSession(deps, params.id, publicKey)
    if (!auth.ok) {
      return NextResponse.json(
        { error: { code: auth.reason, message: auth.reason }, _meta: META_BASE },
        { status: auth.status, headers: RESPONSE_HEADERS }
      )
    }

    await deps.softDelete(params.id)
    return NextResponse.json(
      { ok: true, deleted_at: new Date().toISOString(), _meta: META_BASE },
      { status: 200, headers: RESPONSE_HEADERS }
    )
  } catch (err) {
    logger.error('v1/ask/sessions/[id]: DELETE error', err)
    captureError(err, { tags: { route: 'api/v1/ask/sessions/[id]' } })
    return NextResponse.json(
      {
        error: { code: 'internal_error', message: 'Internal server error.' },
        _meta: META_BASE,
      },
      { status: 500, headers: RESPONSE_HEADERS }
    )
  }
}
