/**
 * POST /api/v1/ask/stream — Server-Sent Events streaming UX.
 *
 * Streaming companion to /api/v1/ask (Ralph 19). Lets web clients
 * (React, Next.js apps, EventSource-capable browsers) display
 * incremental tokens during the 10-30s AnswerEngine latency budget,
 * instead of a 30s blocking wait.
 *
 * Flow :
 *   1. Rate-limit (20 req/min/IP fail-open). Tighter than /api/v1/ask
 *      (60 req/min) because each stream holds a Vercel connection slot
 *      for the full latency budget.
 *   2. JSON body parse + minimal shape check (query string required,
 *      ≤4000 chars). Full validation lives in /api/v1/ask/_validation.ts
 *      and the AnswerEngine itself re-validates classification via
 *      chooseModel — we keep this handler thin.
 *   3. ReadableStream wrapping the async generator orchestrator. The
 *      orchestrator emits SSE frames; we encode UTF-8 and enqueue.
 *      Client AbortSignal is plumbed through so the iterator can clean
 *      up if the browser disconnects.
 *
 * Headers :
 *   - Content-Type: text/event-stream; charset=utf-8 (mandatory for SSE)
 *   - Cache-Control: no-store (never cache streams)
 *   - Connection: keep-alive (informative — HTTP/2 ignores it)
 *   - X-Accel-Buffering: no (nginx/Vercel proxy passthrough — otherwise
 *     the proxy buffers and flushes all bytes at once, killing the UX)
 *   - X-License: CC-BY-4.0 (response data licence)
 *   - X-Disclosure: /transparence-ia (AI Act §50)
 *
 * Memory refs :
 *   - feedback_legal_data_quality (zero tolerance YMYL)
 *   - servicesartisans-upstash-rate-limit-fix-2026-04-22 (fail-open mandatory)
 */

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

import { logger } from '@/lib/logger'
import { captureError } from '@/lib/monitoring/sentry'
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter'

import { streamAnswer, type StreamInput } from './_stream-orchestrator'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_QUERY_LEN = 4000

// Garde d'enveloppe structurelle uniquement (« objet JSON »). Les messages
// d'erreur précis par champ (query, aidesContext, citedSources…) restent
// produits par `validateStreamBody` pour préserver le contrat de réponse.
const streamEnvelopeSchema = z.object({ query: z.unknown().optional() }).passthrough()

const META_BASE = {
  api_version: 'v1' as const,
  license: 'CC-BY-4.0' as const,
}

const SSE_HEADERS: Record<string, string> = {
  'Content-Type': 'text/event-stream; charset=utf-8',
  'Cache-Control': 'no-store',
  Connection: 'keep-alive',
  'X-Accel-Buffering': 'no',
  'X-License': 'CC-BY-4.0',
  'X-Disclosure': '/transparence-ia',
}

const JSON_ERROR_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
  'X-License': 'CC-BY-4.0',
  'X-Disclosure': '/transparence-ia',
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    {
      endpoint: '/api/v1/ask/stream',
      method: 'POST',
      version: 'v1',
      response_format: 'text/event-stream',
      description:
        'Streaming AnswerEngine endpoint. POST {query, aidesContext?, citedSources?} and consume an SSE stream of `start`, `groundtruth`, `chunk`, `critic`, `done`, `error` events.',
      rate_limit: '20 req/min/IP fail-open',
      license: 'CC-BY-4.0',
      docs: 'https://servicesartisans.fr/developpeurs',
      disclosure: 'https://servicesartisans.fr/transparence-ia',
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

export async function POST(req: NextRequest): Promise<Response> {
  try {
    const ip = getClientIp(req.headers)
    const rl = await checkRateLimit(`v1-ask-stream:${ip}`, {
      window: 60_000,
      max: 20,
      failOpen: true,
    })
    if (!rl.allowed) {
      return new Response(
        JSON.stringify({
          error: { code: 'rate_limit', message: 'Limite 20 req/min/IP atteinte.' },
          _meta: META_BASE,
        }),
        { status: 429, headers: JSON_ERROR_HEADERS }
      )
    }

    let raw: unknown
    try {
      raw = await req.json()
    } catch {
      return new Response(
        JSON.stringify({
          error: { code: 'invalid_body', message: 'Body must be valid JSON' },
          _meta: META_BASE,
        }),
        { status: 400, headers: JSON_ERROR_HEADERS }
      )
    }

    const envelope = streamEnvelopeSchema.safeParse(raw)
    if (!envelope.success) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'invalid_params',
            message: envelope.error.issues[0]?.message ?? 'invalid body',
          },
          _meta: META_BASE,
        }),
        { status: 400, headers: JSON_ERROR_HEADERS }
      )
    }

    const validation = validateStreamBody(raw)
    if (!validation.ok) {
      return new Response(
        JSON.stringify({
          error: { code: 'invalid_params', message: validation.message },
          _meta: META_BASE,
        }),
        { status: 400, headers: JSON_ERROR_HEADERS }
      )
    }

    const input = validation.value
    const controller = new AbortController()
    // Propagate client disconnect → orchestrator abort. `req.signal` is
    // the AbortSignal exposed by the underlying fetch Request.
    if (req.signal) {
      if (req.signal.aborted) {
        controller.abort()
      } else {
        req.signal.addEventListener('abort', () => controller.abort(), { once: true })
      }
    }

    const stream = new ReadableStream<Uint8Array>({
      async start(streamController) {
        const encoder = new TextEncoder()
        try {
          for await (const frame of streamAnswer(input, controller.signal)) {
            streamController.enqueue(encoder.encode(frame))
          }
        } catch (err) {
          logger.error('v1/ask/stream: orchestrator error', err)
          captureError(err, { tags: { route: 'api/v1/ask/stream' } })
          try {
            streamController.enqueue(
              encoder.encode(
                `event: error\ndata: ${JSON.stringify({
                  code: 'orchestrator_error',
                  message: 'Internal',
                  retryable: false,
                })}\n\n`
              )
            )
          } catch {
            // controller may already be closed — ignore.
          }
        } finally {
          try {
            streamController.close()
          } catch {
            // already closed
          }
        }
      },
      cancel() {
        controller.abort()
      },
    })

    return new Response(stream, { status: 200, headers: SSE_HEADERS })
  } catch (err) {
    logger.error('v1/ask/stream: unexpected error', err)
    captureError(err, { tags: { route: 'api/v1/ask/stream', critical: 'true' } })
    return new Response(
      JSON.stringify({
        error: { code: 'internal_error', message: 'Internal server error.' },
        _meta: META_BASE,
      }),
      { status: 500, headers: JSON_ERROR_HEADERS }
    )
  }
}

type StreamBodyValidation = { ok: true; value: StreamInput } | { ok: false; message: string }

function validateStreamBody(raw: unknown): StreamBodyValidation {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { ok: false, message: 'expected JSON object' }
  }
  const body = raw as Record<string, unknown>
  const query = body.query
  if (typeof query !== 'string' || query.trim().length === 0) {
    return { ok: false, message: 'query: required non-empty string' }
  }
  if (query.length > MAX_QUERY_LEN) {
    return { ok: false, message: `query: max ${MAX_QUERY_LEN} chars` }
  }
  const input: StreamInput = { query }
  if (typeof body.traceId === 'string') input.traceId = body.traceId
  if (typeof body.agentName === 'string') input.agentName = body.agentName
  if (typeof body.classification === 'string') {
    input.classification = body.classification as StreamInput['classification']
  }
  if (body.aidesContext !== undefined) {
    if (typeof body.aidesContext !== 'object' || body.aidesContext === null) {
      return { ok: false, message: 'aidesContext: expected object' }
    }
    input.aidesContext = body.aidesContext as StreamInput['aidesContext']
  }
  if (body.citedSources !== undefined) {
    if (!Array.isArray(body.citedSources)) {
      return { ok: false, message: 'citedSources: expected array' }
    }
    input.citedSources = body.citedSources as StreamInput['citedSources']
  }
  return { ok: true, value: input }
}
