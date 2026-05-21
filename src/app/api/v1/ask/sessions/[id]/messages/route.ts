/**
 * POST /api/v1/ask/sessions/:id/messages
 *
 * Send a new user message inside an existing session (Ralph 34). Workflow :
 *   1. Rate-limit 30 req/min/IP fail-open.
 *   2. Body validation (query non-empty <4000 chars, public_key required).
 *   3. Authenticate session via timing-safe public_key compare.
 *   4. Invoke `answer()` (Ralph 13) with the user query + any optional
 *      `aidesContext` (ground-truth injection for YMYL).
 *   5. On success → `appendTurn` persists user + assistant messages.
 *      On `answer()` failure → return mapped HTTP status without writing
 *      anything (we don't pollute the history with failed turns).
 *
 * Observability : the session id is reused as `traceId` for answer(), so
 * a Sentry / log dig on a session can recover the full provider/model/
 * latency/cost chain across turns.
 *
 * History feed-back : Ralph 34 v0.1 does NOT yet pull prior messages into
 * the LLM context window. The persistence layer is in place but feeding
 * history into `answer({ history })` is gated on a summarization pass
 * (planned v0.2) to keep prompt costs bounded at long conversation lengths.
 *
 * Memory refs :
 *   - servicesartisans-upstash-rate-limit-fix-2026-04-22
 *   - feedback_legal_data_quality (YMYL ground-truth + Critic still apply
 *     inside answer(); session persistence does NOT bypass them)
 */

import { NextResponse, type NextRequest } from 'next/server'

import { answer, type AnswerResult, type Citation } from '@/lib/answer-engine'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter'
import {
  appendTurn,
  authenticateSession,
  type AssistantTurn,
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

const MAX_QUERY_LEN = 4000

function buildStoreDeps(): SessionStoreDeps {
  const supabase = createAdminClient()
  return {
    insertSession: async () => {
      throw new Error('insertSession unsupported on /sessions/[id]/messages')
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
      if (!data || data.deleted_at) return null
      return {
        id: data.id,
        public_key: data.public_key,
        created_at: data.created_at,
        last_activity_at: data.last_activity_at,
        expires_at: data.expires_at,
        message_count: data.message_count,
      } as Session
    },
    insertMessage: async (args) => {
      const { data, error } = await supabase
        .from('rge_os_ask_messages')
        .insert({
          session_id: args.session_id,
          role: args.role,
          content: args.content,
          classification: args.classification ?? null,
          citations: args.citations ?? null,
          trace: args.trace ?? null,
        })
        .select('id')
        .single()
      if (error) throw new Error(`insertMessage: ${error.message}`)
      if (!data) throw new Error('insertMessage: no row returned')
      return { id: data.id as number }
    },
    listMessages: async () => [],
    softDelete: async () => {},
  }
}

type AnswerOk = Extract<AnswerResult, { ok: true }>

function buildAssistantTurn(result: AnswerOk): AssistantTurn {
  const citations: Array<{ url: string; title: string; retrievedAt?: string }> = (
    result.citations as ReadonlyArray<Citation>
  ).map((c) => ({ url: c.url, title: c.title, retrievedAt: c.retrievedAt }))
  return {
    content: result.content,
    classification: result.trace?.classification ?? null,
    citations,
    trace: result.trace as unknown as Record<string, unknown>,
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const ip = getClientIp(req.headers)
    const rl = await checkRateLimit(`v1-ask-sessions-msg:${ip}`, {
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

    let raw: { query?: unknown; public_key?: unknown; aidesContext?: unknown } = {}
    try {
      raw = (await req.json()) as typeof raw
    } catch {
      return NextResponse.json(
        {
          error: { code: 'invalid_body', message: 'Body must be valid JSON.' },
          _meta: META_BASE,
        },
        { status: 400, headers: RESPONSE_HEADERS }
      )
    }

    const query = typeof raw.query === 'string' ? raw.query : ''
    const publicKey = typeof raw.public_key === 'string' ? raw.public_key : ''
    if (!query.trim()) {
      return NextResponse.json(
        {
          error: { code: 'invalid_query', message: 'query required (non-empty string).' },
          _meta: META_BASE,
        },
        { status: 400, headers: RESPONSE_HEADERS }
      )
    }
    if (query.length > MAX_QUERY_LEN) {
      return NextResponse.json(
        {
          error: { code: 'invalid_query', message: `query max ${MAX_QUERY_LEN} chars.` },
          _meta: META_BASE,
        },
        { status: 400, headers: RESPONSE_HEADERS }
      )
    }
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

    const aidesContext =
      raw.aidesContext && typeof raw.aidesContext === 'object' && !Array.isArray(raw.aidesContext)
        ? (raw.aidesContext as Parameters<typeof answer>[0]['aidesContext'])
        : undefined

    const result = await answer({ query, aidesContext, traceId: auth.session.id })

    if (!result.ok) {
      const status =
        result.reason === 'rate_limit'
          ? 429
          : result.reason === 'llm_unavailable' || result.reason === 'timeout'
            ? 503
            : 422
      return NextResponse.json({ result, _meta: META_BASE }, { status, headers: RESPONSE_HEADERS })
    }

    try {
      await appendTurn(deps, auth.session, query, buildAssistantTurn(result))
    } catch (err) {
      // Persistence failure must NOT mask the answer the user already
      // earned — we log and return the answer anyway. The next call will
      // hit a possibly inconsistent message_count but `answer()` is the
      // contract here, not the history.
      logger.warn('v1/ask/sessions/messages: appendTurn failed (response still returned)', {
        sessionId: auth.session.id,
        error: err instanceof Error ? err.message : String(err),
      })
    }

    return NextResponse.json(
      {
        result,
        session: {
          id: auth.session.id,
          // Optimistic count : the trigger has bumped it +2 by now (user + assistant),
          // but we don't re-fetch to keep latency tight.
          message_count: auth.session.message_count + 2,
          expires_at: auth.session.expires_at,
        },
        _meta: META_BASE,
      },
      { status: 200, headers: RESPONSE_HEADERS }
    )
  } catch (err) {
    logger.error('v1/ask/sessions/[id]/messages: error', err)
    captureError(err, { tags: { route: 'api/v1/ask/sessions/[id]/messages', critical: 'true' } })
    return NextResponse.json(
      {
        error: { code: 'internal_error', message: 'Internal server error.' },
        _meta: META_BASE,
      },
      { status: 500, headers: RESPONSE_HEADERS }
    )
  }
}
