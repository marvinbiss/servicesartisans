/**
 * POST /api/v1/ask
 *
 * Public AnswerEngine endpoint. Closes the SA AI system loop by exposing
 * the orchestrator (Ralph 13) over HTTP for journalists, devs, third-party
 * integrators, and our own front-end.
 *
 * Flow:
 *   1. Rate-limit (60 req/min/IP, fail-open per memory upstash-rate-limit-fix).
 *   2. Body parse + structural validation (`_validation.ts`).
 *   3. Lazy LLM registry boot (`_registry-boot.ts`). 503 on missing env keys.
 *   4. Dispatch to `@/lib/answer-engine.answer()`, which internally:
 *      - routes the query through chooseModel (Ralph 4)
 *      - injects deterministic ground-truth on YMYL (Ralph 12/14 calculators)
 *      - calls the LLM provider live (Ralph 10)
 *      - on YMYL, runs Critic Opus 4.7 second-pass (Ralph 8)
 *   5. Map structured `AnswerResult` to HTTP status:
 *      200 = ok | 422 = critic_block | 429 = rate_limit | 503 = unavailable.
 *
 * Response envelope always carries `_meta.api_version`, `_meta.license`
 * (CC-BY-4.0 on the response data), and a `_meta.disclosure` pointer to
 * `/transparence-ia` per AI Act §50 transparency obligations. Headers
 * mirror `X-License` and `X-Disclosure` for clients that only inspect
 * headers (RSS readers, link previewers).
 *
 * Memory refs :
 *   - feedback_legal_data_quality (zero tolerance YMYL)
 *   - servicesartisans-upstash-rate-limit-fix-2026-04-22 (fail-open mandatory)
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { answer, type AnswerRequest } from '@/lib/answer-engine'
import { logger } from '@/lib/logger'
import { captureError } from '@/lib/monitoring/sentry'
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter'

import { ensureRegistryBooted } from './_registry-boot'
import { validateAskRequest } from './_validation'

// Garde d'enveloppe (forme structurelle). La validation fine des enums
// (classification, geste, menageCategorie…) reste dans `validateAskRequest`,
// volontairement zéro-dépendance pour rester sur le hot path le plus léger.
const askEnvelopeSchema = z.object({ query: z.string().trim().min(1).max(4000) }).passthrough()

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const META_BASE = {
  api_version: 'v1' as const,
  license: 'CC-BY-4.0' as const,
  docs: 'https://servicesartisans.fr/developpeurs',
  disclosure: 'See https://servicesartisans.fr/transparence-ia for AI agent details.',
}

const RESPONSE_HEADERS: Record<string, string> = {
  'Cache-Control': 'no-store',
  'X-License': 'CC-BY-4.0',
  'X-Disclosure': '/transparence-ia',
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const ip = getClientIp(req.headers)
    const rl = await checkRateLimit(`v1-ask:${ip}`, {
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

    const envelope = askEnvelopeSchema.safeParse(raw)
    if (!envelope.success) {
      return NextResponse.json(
        {
          error: {
            code: 'invalid_params',
            message: 'Query parameters validation failed',
            errors: envelope.error.issues.map((i) => ({
              field: i.path.join('.') || '_body',
              message: i.message,
            })),
          },
          _meta: META_BASE,
        },
        { status: 400, headers: RESPONSE_HEADERS }
      )
    }

    const validation = validateAskRequest(raw)
    if (!validation.ok) {
      return NextResponse.json(
        {
          error: {
            code: 'invalid_params',
            message: 'Query parameters validation failed',
            errors: validation.errors,
          },
          _meta: META_BASE,
        },
        { status: 400, headers: RESPONSE_HEADERS }
      )
    }

    const boot = ensureRegistryBooted()
    if (!boot.ok) {
      logger.error('v1/ask: registry boot failed', { reason: boot.error })
      return NextResponse.json(
        {
          error: {
            code: 'service_unavailable',
            message: 'AI service not configured. Contact ops.',
          },
          _meta: META_BASE,
        },
        { status: 503, headers: RESPONSE_HEADERS }
      )
    }

    const result = await answer(validation.value as AnswerRequest)

    const status = result.ok
      ? 200
      : result.reason === 'rate_limit'
        ? 429
        : result.reason === 'llm_unavailable' || result.reason === 'timeout'
          ? 503
          : 422

    return NextResponse.json({ result, _meta: META_BASE }, { status, headers: RESPONSE_HEADERS })
  } catch (err) {
    logger.error('v1/ask: unexpected error', err)
    captureError(err, { tags: { route: 'api/v1/ask', critical: 'true' } })
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
 * GET /api/v1/ask — discovery endpoint.
 * Returns endpoint metadata so monitoring probes / curious devs can
 * introspect without crafting a POST body.
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    {
      endpoint: '/api/v1/ask',
      method: 'POST',
      version: 'v1',
      description:
        'Public AnswerEngine endpoint. POST {query, aidesContext?, citedSources?} to get a structured answer with citations + trace + (on YMYL) Critic verdict.',
      rate_limit: '60 req/min/IP fail-open',
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
