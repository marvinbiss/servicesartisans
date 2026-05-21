/**
 * POST/GET /api/v1/kg/sparql — Pillar 1 RGE-OS SPARQL endpoint.
 *
 * Hand-rolled SPARQL 1.1 subset (parser + virtual triples store + serializer
 * dans `_query-builder.ts`, `_triples-store.ts`, `_serializer.ts`). Voir
 * `docs/API-V1-SPARQL.md` pour la doc d'usage et la roadmap v0.2.
 *
 * Rate-limit 30 req/min/IP fail-open (cf. memory upstash-rate-limit-fix-2026-
 * 04-22 : tout endpoint user-facing critique en fail-open).
 *
 * Protocole : SPARQL Protocol 1.1 (W3C) :
 *   - GET  ?query=...                     (form-encoded ou raw)
 *   - POST application/sparql-query       (raw body = SPARQL string)
 *   - POST application/x-www-form-urlencoded (champ `query`)
 *   - POST application/json               (champ `query` JSON)
 *
 * License : CC-BY 4.0. CORS ouvert (lecture seule).
 */

import { NextRequest, NextResponse } from 'next/server'

import { checkRateLimit, getClientIp } from '@/lib/rate-limiter'
import { logger } from '@/lib/logger'
import { captureError } from '@/lib/monitoring/sentry'

import { parseSparql, PARSER_LIMITS } from './_query-builder'
import { matchPatterns } from './_triples-store'
import { serializeSelectResults, serializeAskResult, type SerializationFormat } from './_serializer'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const RESPONSE_HEADERS_BASE: Record<string, string> = {
  'X-License': 'CC-BY-4.0',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Accept',
}

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, { status: 204, headers: RESPONSE_HEADERS_BASE })
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const sp = req.nextUrl.searchParams
  return handleSparql(req, sp.get('query'), sp.get('format'))
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  let query: string | null = null
  let format: string | null = req.nextUrl.searchParams.get('format')
  const contentType = req.headers.get('content-type') ?? ''

  if (contentType.includes('application/sparql-query')) {
    query = await req.text()
  } else if (contentType.includes('application/x-www-form-urlencoded')) {
    const body = await req.text()
    const params = new URLSearchParams(body)
    query = params.get('query')
    format = params.get('format') ?? format
  } else {
    let raw: string
    try {
      raw = await req.text()
    } catch {
      return errorResponse(400, 'invalid_body', 'Could not read request body')
    }
    if (raw.length === 0) {
      return errorResponse(400, 'missing_query', 'Body is empty')
    }
    try {
      const body = JSON.parse(raw) as { query?: unknown; format?: unknown }
      query = typeof body.query === 'string' ? body.query : null
      if (typeof body.format === 'string') format = body.format
    } catch {
      return errorResponse(
        400,
        'invalid_body',
        'Body must be valid JSON or use application/sparql-query'
      )
    }
  }

  return handleSparql(req, query, format)
}

async function handleSparql(
  req: NextRequest,
  query: string | null,
  formatRaw: string | null
): Promise<NextResponse> {
  try {
    const ip = getClientIp(req.headers)
    const rl = await checkRateLimit(`v1-kg-sparql:${ip}`, {
      window: 60_000,
      max: 30,
      failOpen: true,
    })
    if (!rl.allowed) {
      return errorResponse(429, 'rate_limit', 'Rate limit 30 req/min/IP exceeded')
    }
    if (!query) {
      return errorResponse(400, 'missing_query', 'query parameter is required')
    }
    if (query.length > PARSER_LIMITS.MAX_QUERY_LEN) {
      return errorResponse(
        400,
        'query_too_long',
        `query exceeds ${PARSER_LIMITS.MAX_QUERY_LEN} chars`
      )
    }

    const format = pickFormat(formatRaw, req.headers.get('accept'))

    const parsed = parseSparql(query)
    if (!parsed.ok) {
      return errorResponse(400, 'parse_error', `SPARQL parse error: ${parsed.error}`)
    }

    if (parsed.query.form === 'ASK') {
      const match = await matchPatterns(parsed.query.patterns, 1, 0)
      const answer = match.bindings.length > 0
      const ser = serializeAskResult(answer, format)
      return new NextResponse(ser.body, {
        status: 200,
        headers: {
          ...RESPONSE_HEADERS_BASE,
          'Content-Type': ser.contentType,
          'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
        },
      })
    }

    const limit = Math.min(parsed.query.limit ?? 100, PARSER_LIMITS.MAX_LIMIT)
    const offset = Math.min(parsed.query.offset ?? 0, PARSER_LIMITS.MAX_OFFSET)
    const match = await matchPatterns(parsed.query.patterns, limit, offset)
    const ser = serializeSelectResults(match.bindings, parsed.query.projection, format)

    return new NextResponse(ser.body, {
      status: 200,
      headers: {
        ...RESPONSE_HEADERS_BASE,
        'Content-Type': ser.contentType,
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600',
      },
    })
  } catch (err) {
    logger.error('v1/kg/sparql: unexpected error', err)
    captureError(err, { tags: { route: 'api/v1/kg/sparql' } })
    return errorResponse(500, 'internal_error', 'Internal server error')
  }
}

function pickFormat(formatRaw: string | null, accept: string | null): SerializationFormat {
  if (formatRaw === 'csv' || formatRaw === 'tsv' || formatRaw === 'xml' || formatRaw === 'json') {
    return formatRaw
  }
  if (accept) {
    if (accept.includes('text/csv')) return 'csv'
    if (accept.includes('text/tab-separated-values')) return 'tsv'
    if (accept.includes('application/sparql-results+xml') || accept.includes('application/xml')) {
      return 'xml'
    }
  }
  return 'json'
}

function errorResponse(status: number, code: string, message: string): NextResponse {
  return NextResponse.json(
    {
      error: { code, message },
      _meta: { api_version: 'v1', license: 'CC-BY-4.0' },
    },
    {
      status,
      headers: { ...RESPONSE_HEADERS_BASE, 'Content-Type': 'application/json' },
    }
  )
}
